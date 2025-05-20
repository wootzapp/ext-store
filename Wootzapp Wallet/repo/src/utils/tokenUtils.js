import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const ETHERSCAN_API_KEY = '';

// Multiple free RPC endpoints for each network
const RPC_ENDPOINTS = {
  'mainnet-beta': [
    'https://solana-rpc.publicnode.com/',
    'https://rpc.ankr.com/solana'
  ],
  'devnet': [
    'https://api.devnet.solana.com'
  ],
  'testnet': [
    'https://api.testnet.solana.com'
  ]
};

const ETHEREUM_RPC_ENDPOINTS = {
  'mainnet': 'https://ethereum-rpc.publicnode.com',
  'sepolia': 'https://api-sepolia.etherscan.io',
};

const ECLIPSE_RPC_ENDPOINT = 'https://mainnetbeta-rpc.eclipse.xyz';

export const fetchAllSolanaAssets = async (address) => {
  console.log("fetchAllSolanaAssets", address);
  try {
    const pubKey = new PublicKey(address);
    const assets = {
      solBalance: {},
      tokens: [],
      nfts: []
    };

    for (const [network, endpoints] of Object.entries(RPC_ENDPOINTS)) {
      try {
        const connection = new Connection(endpoints[0], {
          commitment: 'confirmed',
          confirmTransactionInitialTimeout: 60000,
          fetch: (url, options) => {
            return fetch(url, {
              ...options,
              headers: {
                'Content-Type': 'application/json',
              },
            });
          },
        });

        // Get SOL balance with retry
        let retries = 3;
        let balance = 0;
        while (retries > 0) {
          try {
            balance = await connection.getBalance(pubKey);
            break;
          } catch (err) {
            retries--;
            if (retries === 0) throw err;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        assets.solBalance[network] = balance / 1e9;
        
        // No token fetching here - tokens will be handled by Blinks.js
      } catch (err) {
        console.error(`Error fetching data for ${network}:`, err);
        assets.solBalance[network] = 0;
      }
    }
    console.log("assets", assets);
    return assets;

  } catch (error) {
    console.error('Error fetching Solana assets:', error);
    return {
      solBalance: {
        'mainnet-beta': 0,
        'devnet': 0,
        'testnet': 0
      },
      tokens: [],
      nfts: []
    };
  }
};

// export const fetchSolanaBalance = async (address) => {
//   try {
//     const response = await fetch('https://api.devnet.solana.com', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         jsonrpc: '2.0',
//         id: 1,
//         method: 'getBalance',
//         params: [
//           address,
//           { commitment: 'confirmed' }
//         ]
//       })
//     });

//     const data = await response.json();
//     const balance = data.result?.value / 1e9 || 0;

//     return balance;
//   } catch (error) {
//     console.error('Error fetching Solana balance:', error);
//     return 0;
//   }
// };

export const fetchSepoliaEthereumBalance = async (address) => {
  try {
    const balances = {};

    // Add delay between requests to avoid rate limiting
    const fetchWithDelay = async (network, endpoint) => {
      try {
        if (network === 'mainnet') {
          // Use JSON-RPC for mainnet with publicnode
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_getBalance',
              params: [address, 'latest']
            })
          });

          if (!response.ok) {
            console.error(`HTTP error for ${network}:`, response.status);
            return 0;
          }

          const data = await response.json();
          console.log(`Balance response for ${network}:`, data);

          if (data.result) {
            // Convert hex result to decimal and divide by 1e18
            const balance = parseInt(data.result, 16) / 1e18;
            console.log(`Calculated balance for ${network}:`, balance);
            return isNaN(balance) ? 0 : balance;
          } else {
            console.error(`RPC API error for ${network}:`, data.error || 'Unknown error');
            return 0;
          }
        } else {
          // Use Etherscan API for sepolia
          const response = await fetch(
            `${endpoint}/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`,
            {
              headers: {
                'Accept': 'application/json',
              },
            }
          );

          if (!response.ok) {
            console.error(`HTTP error for ${network}:`, response.status);
            return 0;
          }

          const data = await response.json();
          console.log(`Balance response for ${network}:`, data);

          if (data.status === '1' && data.message === 'OK') {
            // Ensure we're converting the result to a number and dividing by 1e18
            const balance = Number(data.result) / 1e18;
            console.log(`Calculated balance for ${network}:`, balance);
            return isNaN(balance) ? 0 : balance;
          } else {
            console.error(`Etherscan API error for ${network}:`, data.message);
            return 0;
          }
        }
      } catch (error) {
        console.error(`Error fetching ETH balance for ${network}:`, error);
        return 0;
      }
    };

    // Fetch balances sequentially with delay
    for (const [network, endpoint] of Object.entries(ETHEREUM_RPC_ENDPOINTS)) {
      balances[network] = await fetchWithDelay(network, endpoint);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('Final balances:', balances);
    return balances;
  } catch (error) {
    console.error('Error fetching ETH balances:', error);
    return { sepolia: 0, mainnet: 0 };
  }
};

export const fetchEclipseBalance = async (address) => {
  try {
    console.log('Fetching Eclipse balance for address:', address);

    // Eclipse uses JSON-RPC format
    const requestBody = {
      jsonrpc: "2.0",
      id: 1,
      method: "getBalance",
      params: [address]  // Use the hardcoded address in an array
    };

    const response = await fetch(ECLIPSE_RPC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.error('HTTP error for Eclipse:', response.status);
      return 0;
    }

    const data = await response.json();
    console.log('Balance response for Eclipse:', data);

    // Check if we have a proper result
    if (data.result && data.result.value !== undefined) {
      const rawBalance = data.result.value;

      // Convert the result from lamports (like SOL) to a human-readable format
      const balance = Number(rawBalance) / 1e9;
      console.log('Calculated balance for Eclipse:', balance);
      return isNaN(balance) ? 0 : balance;
    } else {
      console.error('Eclipse API error or unexpected response format:', data.error || data);
      return 0;
    }
  } catch (error) {
    console.error('Error fetching Eclipse balance:', error);
    return 0;
  }
};