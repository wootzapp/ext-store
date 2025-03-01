import { Connection, PublicKey } from '@solana/web3.js';
import { providers } from 'ethers';

const SOLANA_ENDPOINTS = {
  'devnet': 'https://api.devnet.solana.com',
  'testnet': 'https://api.testnet.solana.com'
};

const ETH_ENDPOINTS = {
  'mainnet': 'https://eth-mainnet.public.blastapi.io',
  'sepolia': 'https://eth-sepolia.public.blastapi.io',
};

export const fetchAssets = async (accounts, onAssetFound) => {
  const fetchSolanaBalance = async (account, network, endpoint) => {
    try {
      const connection = new Connection(endpoint);
      const balance = await connection.getBalance(new PublicKey(account.address));
      if (balance > 0) {
        const asset = {
          address: account.address,
          name: account.name,
          network,
          balance: balance / 1e9,
          symbol: 'SOL',
          coin: account.coin
        };
        onAssetFound(asset);
      }
    } catch (err) {
      console.warn(`Error fetching Solana balance for ${network}:`, err);
    }
  };

  const fetchEthBalance = async (account, network, endpoint) => {
    try {
      const provider = new providers.JsonRpcProvider(endpoint);
      const balance = await provider.getBalance(account.address);
      const formattedBalance = balance.div(1e15).toNumber() / 1000;
      if (formattedBalance > 0) {
        const asset = {
          address: account.address,
          name: account.name,
          network,
          balance: formattedBalance,
          symbol: 'ETH',
          coin: account.coin
        };
        onAssetFound(asset);
      }
    } catch (err) {
      console.warn(`Error fetching ETH balance for ${network}:`, err);
    }
  };

  // Process each account and network sequentially
  for (const account of accounts) {
    if (account.coin === 501) {
      for (const [network, endpoint] of Object.entries(SOLANA_ENDPOINTS)) {
        await fetchSolanaBalance(account, network, endpoint);
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } else if (account.coin === 60) {
      for (const [network, endpoint] of Object.entries(ETH_ENDPOINTS)) {
        await fetchEthBalance(account, network, endpoint);
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
}; 