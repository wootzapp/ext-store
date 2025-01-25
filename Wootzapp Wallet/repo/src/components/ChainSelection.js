/* global chrome */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import wootzIcon from '../assets/wootz.png';
import TransitionScreen from './TransitionScreen';
import { FaEthereum } from 'react-icons/fa';
import solIcon from '../assets/sol.svg'

const ChainSelection = ({ setWalletCreated }) => {
  const [selectedChains, setSelectedChains] = useState(['ethereum', 'solana']);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const password = sessionStorage.getItem('tempPassword');
    if (!password) {
      navigate('/create');
    }
  }, [navigate]);

  const toggleChain = (chain) => {
    setSelectedChains(prev => {
      if (prev.includes(chain)) {
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== chain);
      }
      return [...prev, chain];
    });
  };

  const handleCreateWallet = async () => {
    const password = sessionStorage.getItem('tempPassword');
    if (!password) {
      navigate('/create');
      return;
    }

    try {
      // First set selected chains
      const chainResult = await new Promise((resolve, reject) => {
        chrome.wootz.setSelectedChains(selectedChains, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      if (!chainResult.success) {
        throw new Error("Failed to set selected chains");
      }

      // Then create wallet
      const createResult = await new Promise((resolve, reject) => {
        chrome.wootz.createWallet(password, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });

      if (!createResult.success) {
        throw new Error(createResult.error || "Failed to create wallet");
      }

      sessionStorage.removeItem('tempPassword');

      localStorage.setItem('walletCreated', 'true');
      window.dispatchEvent(new Event('storage'));
      setWalletCreated(true);

      setIsTransitioning(true);
      setTimeout(() => {
        navigate('/recovery-phrase', { 
          state: { recoveryPhrase: createResult.recoveryPhrase } 
        });
      }, 3000);

    } catch (error) {
      console.error("Error:", error);
      setError(error.message);
    }
  };

  if (isTransitioning) {
    return <TransitionScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-start bg-white px-4 sm:px-6 lg:px-8 pt-0">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <img src={wootzIcon} alt="Wootz Logo" className="mx-auto h-20 w-20" />
          <h2 className="mt-4 text-2xl font-extrabold text-gray-900">
            Select Your <span className="bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">Chains</span>
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Choose which blockchain networks you want to use
          </p>
        </div>
  
        <div className="grid grid-cols-3 gap-3">
          {[
            { 
              value: 'ethereum', 
              label: 'Ethereum',
              icon: <FaEthereum className="h-6 w-6 text-[#627EEA]" />
            },
            { 
              value: 'solana', 
              label: 'Solana',
              icon: <img src={solIcon} alt="Solana" className="h-6 w-6" />
            }
          ].map(chain => (
            <div 
              key={chain.value}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedChains.includes(chain.value) 
                  ? 'border-[#FF3B30] bg-orange-50' 
                  : 'border-gray-200 hover:border-[#FF3B30] hover:shadow-md'
              }`}
              onClick={() => toggleChain(chain.value)}
            >
              {/* Checkbox in top right corner */}
              <div className="absolute top-2 right-2">
                <input
                  type="checkbox"
                  checked={selectedChains.includes(chain.value)}
                  onChange={() => {}}
                  className="h-4 w-4 text-[#FF3B30] focus:ring-[#FF3B30] rounded"
                />
              </div>
  
              {/* Chain content */}
              <div className="flex flex-col items-center pt-2">
                <div className="p-2">
                  {chain.icon}
                </div>
                <label className="block text-sm font-medium text-gray-700">
                  {chain.label}
                </label>
              </div>
            </div>
          ))}
        </div>
  
        {error && <p className="text-red-500 text-sm">{error}</p>}
  
        <button
          onClick={handleCreateWallet}
          className="w-full flex justify-center py-2 px-4 border-0 text-sm font-medium rounded-md text-white bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] hover:from-[#FF5E3A] hover:to-[#FFA726] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF8C00] transition-all duration-200 shadow-md"
        >
          Create Wallet
        </button>
      </div>
    </div>
  );
};

export default ChainSelection;