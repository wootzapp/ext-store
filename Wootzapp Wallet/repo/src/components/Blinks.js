/* global chrome */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUserCircle, FaBolt, FaCog, FaCoins, FaCopy } from 'react-icons/fa';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

const Blinks = () => {
  const location = useLocation();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTokenInfo = async (mintAddress) => {
    try {
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: mintAddress,
          method: 'getAsset',
          params: {
            id: mintAddress,
            options: {
              showFungible: true
            }
          }
        })
      });
      
      const data = await response.json();
      console.log("data", data);
      return data.result;
    } catch (error) {
      console.error(`Error fetching token info for ${mintAddress}:`, error);
      return null;
    }
  };

  const fetchTokensForAccount = async (address) => {
    try {
      const pubKey = new PublicKey(address);
      
      // Get token accounts using Helius RPC endpoint
      const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${process.env.REACT_APP_HELIUS_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '1',
          method: 'getTokenAccountsByOwner',
          params: [
            pubKey,
            {
              programId: TOKEN_PROGRAM_ID
            },
            {
              encoding: 'jsonParsed'
            }
          ]
        })
      });
      
      const tokenAccounts = await response.json();
      
      if (!tokenAccounts.result || !tokenAccounts.result.value) {
        console.warn(`No token accounts found for ${address}`);
        return [];
      }
      
      const tokensByMint = {};
      
      tokenAccounts.result.value.forEach(account => {
        const info = account.account.data.parsed.info;
        const mint = info.mint;
        const amount = info.tokenAmount.uiAmount || 0;
        const decimals = info.tokenAmount.decimals;
        const owner = info.owner;
        const address = account.pubkey.toString();
        
        if (!tokensByMint[mint]) {
          tokensByMint[mint] = {
            mint,
            amount: 0,
            decimals,
            owner,
            address,
          };
        }
        tokensByMint[mint].amount += amount;
      });
      
      // Convert to array and filter out zero balances
      const tokens = Object.values(tokensByMint).filter(token => token.amount > 0);
      return tokens;
    } catch (error) {
      console.error(`Error fetching tokens for ${address}:`, error);
      return [];
    }
  };

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        setLoading(true);
        
        // Get all accounts from chrome extension
        chrome.wootz.getAllAccounts(async (accountsResult) => {
          if (accountsResult.success && accountsResult.accounts.length > 0) {
            const solanaAccounts = accountsResult.accounts.filter(account => account.coin === 501);
            const processedTokens = [];
            
            // For each Solana account, fetch tokens
            for (const account of solanaAccounts) {
              try {
                const accountTokens = await fetchTokensForAccount(account.address);
                
                // For each token, fetch detailed info
                for (const token of accountTokens) {
                  try {
                    const tokenInfo = await fetchTokenInfo(token.mint);
                    console.log("tokenInfo", tokenInfo);
                    processedTokens.push({
                      ...token,
                      tokenInfo,
                      ownerAddress: account.address
                    });
                  } catch (tokenError) {
                    console.error(`Error fetching token info for ${token.mint}:`, tokenError);
                    processedTokens.push({
                      ...token,
                      tokenInfo: null,
                      ownerAddress: account.address
                    });
                  }
                }
              } catch (accountError) {
                console.error(`Error processing account ${account.address}:`, accountError);
              }
            }
            
            setTokens(processedTokens);
            // Store in Chrome storage for potential use elsewhere
            chrome.storage.local.set({ 'tokenData': processedTokens });
            setLoading(false);
          } else {
            setError("No accounts found. Please create an account first.");
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Error fetching token data:", err);
        setError("Failed to fetch token data");
        setLoading(false);
      }
    };

    fetchTokenData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">
          Blinks & Tokens
        </h1>
        <Link to="/settings" className="text-[#FF8C00] hover:text-[#FF3B30] transition-colors">
          <FaCog size={24} />
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-4">
          Error: {error}
        </div>
      )}

      <div className="flex-grow mb-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-t-[#FF8C00] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your tokens...</p>
          </div>
        ) : tokens.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {tokens.map((token, index) => {
              const tokenInfo = token.tokenInfo;
              const hasMetadata = tokenInfo && tokenInfo.content && tokenInfo.content.metadata;
              const tokenName = hasMetadata ? tokenInfo.content.metadata.name : token.mint.slice(0, 4) + '...' + token.mint.slice(-4);
              const tokenSymbol = hasMetadata ? tokenInfo.content.metadata.symbol : '';
              const tokenImage = tokenInfo && tokenInfo.content && tokenInfo.content.links ? tokenInfo.content.links.image : null;
              
              return (
                <div key={index} className="bg-gray-50 rounded-xl p-4 border border-[#FF8C00] shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {tokenImage ? (
                        <img src={tokenImage} alt={tokenName} className="h-10 w-10 mr-3 rounded-full" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-lg">
                          <FaCoins className="text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{tokenName}</h3>
                        {/* {tokenSymbol && <p className="text-sm text-gray-500">{tokenSymbol}</p>} */}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">{token.amount}</p>
                      <p className="text-xs text-gray-500">Tweets</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-gray-500">
                    <p>Address: {token.mint.slice(0, 8)}...{token.mint.slice(-8)}</p>
                  </div>
                  
                  {/* Tweet URL section */}
                  {tokenInfo && tokenInfo.content && tokenInfo.content.links && tokenInfo.content.links.external_url && (
                    <div className="mt-3 p-2 bg-gray-100 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700 mr-2">Tweet URL:</span>
                        <div className="text-xs text-gray-600 truncate flex-1">
                          {tokenInfo.content.links.external_url}
                        </div>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(tokenInfo.content.links.external_url);
                            alert("Tweet URL copied to clipboard!");
                          }}
                          className="text-[#FF8C00] hover:text-[#FF3B30] transition-colors ml-2"
                          title="Copy URL"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <FaBolt className="text-[#FF8C00] text-4xl mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Tokens Found</h3>
            <p className="text-gray-600">You don't have any tokens in your wallet yet.</p>
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex justify-around max-w-sm mx-auto">
          {[
            { icon: <FaUserCircle size={20} />, label: 'Accounts', path: '/accounts' },
            { icon: <FaBolt size={20} />, label: 'Blinks', path: '/blinks' },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`flex flex-col items-center px-6 py-1 ${
                location.pathname === item.path
                  ? 'text-[#FF8C00]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Blinks;