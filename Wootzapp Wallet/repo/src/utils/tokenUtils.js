import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

const ETHERSCAN_API_KEY = 'ZHENS3QBBTS1HRHP6E4W827ZHHS7HAV72E';

// Multiple free RPC endpoints for each network
const RPC_ENDPOINTS = {
  'mainnet-beta': [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana'
  ],
  'devnet': [
    'https://api.devnet.solana.com'
  ],
  'testnet': [
    'https://api.testnet.solana.com'
  ]
};

export const fetchAllSolanaAssets = async (address) => {
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
          confirmTransactionInitialTimeout: 60000
        });

        // Get SOL balance
        const balance = await connection.getBalance(pubKey);
        assets.solBalance[network] = balance / 1e9;

        // Get token accounts
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          pubKey,
          { programId: TOKEN_PROGRAM_ID }
        );

        const tokens = tokenAccounts.value
          .map(account => {
            const info = account.account.data.parsed.info;
            return {
              mint: info.mint,
              amount: info.tokenAmount.uiAmount,
              decimals: info.tokenAmount.decimals,
              network,
              address: account.pubkey.toString()
            };
          })
          .filter(token => token.amount > 0);

        assets.tokens.push(...tokens);

      } catch (err) {
        console.error(`Error fetching data for ${network}:`, err);
        assets.solBalance[network] = 0;
      }
    }

    return assets;

  } catch (error) {
    console.error('Error fetching Solana assets:', error);
    throw error;
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
    const response = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
    );

    const data = await response.json();
    let balance = 0;

    if (data.status === '1' && data.message === 'OK') {
      balance = Number(data.result) / 1e18;
    } else {
      console.error('Etherscan API error:', data.message);
    }

    return balance;
  } catch (error) {
    console.error('Error fetching ETH balance:', error);
    return 0;
  }
};