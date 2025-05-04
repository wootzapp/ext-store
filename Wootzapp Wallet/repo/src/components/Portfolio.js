/* global chrome */
import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSignature, FaTimes, FaEthereum, FaWallet, FaBolt, FaUserCircle, FaCompass } from 'react-icons/fa';
import { FaPlus, FaPaperPlane, FaExchangeAlt, FaEllipsisH } from 'react-icons/fa';
import btcIcon from '../assets/btc.svg'
import solIcon from '../assets/sol.svg'

const Portfolio = ({ setIsLocked }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [error, setError] = useState(null);
  const [signRequest, setSignRequest] = useState(null);
  const [transactionRequest, setTransactionRequest] = useState(null);
  const [solanaTransactionRequest, setSolanaTransactionRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('Setting up Portfolio listeners');

    const handleBackgroundMessage = (message) => {
      console.log('🎯 Portfolio received message:', message);
      
      if (message.type === 'signMessageRequest') {
        console.log('Sign message request received:', message.data);
        setSignRequest(message.data);
      } 
      else if (message.type === 'solanaSignTransactionRequest') {
        console.log('🌟 Solana transaction request received in Portfolio:', message.data);
        if (message.data && message.data.id) {
          setSolanaTransactionRequest(message.data);
        } else {
          console.error('Invalid Solana transaction data:', message.data);
        }
      }
      else if (message.type === 'newTransactionRequest') {
        console.log('New transaction request received:', message.data);
        setTransactionRequest(message.data);
      }
      else if (message.type === 'transactionStatusChanged') {
        console.log('Transaction status changed:', message.data);
        if (message.data.status === 'signed' || message.data.status === 'failed') {
          setTransactionRequest(null);
          if (message.data.status === 'failed') {
            setError(`Transaction failed: ${message.data.error || 'Unknown error'}`);
          }
        }
      }
    };

    // Add message listener
    chrome.runtime.onMessage.addListener(handleBackgroundMessage);

    // Check for pending requests
    chrome.runtime.sendMessage({ type: 'getSignRequest' }, (response) => {
      if (response && response.type === 'signMessageRequest') {
        console.log('Pending sign request found:', response.data);
        setSignRequest(response.data);
      }
    });

    chrome.runtime.sendMessage({ type: 'getPendingTransaction' }, (response) => {
      if (response && response.type === 'newTransactionRequest') {
        console.log('Pending transaction request found:', response.data);
        setTransactionRequest(response.data);
      }
    });

    // Check for pending Solana transactions on mount
    console.log('Checking for pending Solana transactions...');
    chrome.runtime.sendMessage({ type: 'getPendingSolanaTransaction' }, (response) => {
      console.log('Pending Solana transaction response:', response);
      if (response && response.type === 'solanaSignTransactionRequest' && response.data) {
        console.log('Found pending Solana transaction:', response.data);
        setSolanaTransactionRequest(response.data);
      }
    });

    // Fetch accounts
    chrome.wootzapp.getAllAccounts((result) => {
      if (result.success) {
        console.log('Accounts fetched:', result.accounts);
        setAccounts(result.accounts);
      } else {
        console.error('Failed to fetch accounts:', result.error);
        setError(result.error || "Failed to fetch accounts");
      }
    });

    // Cleanup
    return () => {
      console.log('Cleaning up Portfolio listeners');
      chrome.runtime.onMessage.removeListener(handleBackgroundMessage);
    };
  }, []);

  const handleLockWallet = () => {
    console.log('Locking wallet...');
    try {
      const result = chrome.wootzapp.lockWallet();
      if (result.success) {
        console.log('Wallet locked successfully');
        setIsLocked(true);
        navigate('/unlock');
      } else {
        console.error('Failed to lock wallet');
        setError('Failed to lock wallet');
      }
    } catch (error) {
      console.error('Error locking wallet:', error);
      setError('Failed to lock wallet: ' + error.message);
    }
  };

  const handleSignMessage = (approved) => {
    if (signRequest) {
      setIsLoading(true);
      console.log(`Signing message (Approved: ${approved}, Request ID: ${signRequest.id})...`);
      chrome.runtime.sendMessage({
        type: 'signMessage',
        requestId: signRequest.id,
        approved: approved,
        signature: null
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          setError('Failed to sign message: ' + chrome.runtime.lastError.message);
        } else if (response && response.success) {
          console.log('Message signed successfully');
        } else {
          console.error('Failed to sign message:', response ? response.error : 'Unknown error');
          setError('Failed to sign message: ' + (response ? response.error : 'Unknown error'));
        }
        // Always clear the sign request, regardless of the outcome
        setSignRequest(null);
      });
    } else {
      console.error('No sign request available');
    }
  };

  const handleSignTransaction = (approved) => {
    if (!transactionRequest) {
      console.error('No transaction request available');
      return;
    }

    setIsLoading(true);
    console.log(`Signing transaction (Approved: ${approved}, TxMetaId: ${transactionRequest.txMetaId})...`);

    chrome.runtime.sendMessage({
      type: 'signTransaction',
      txMetaId: transactionRequest.txMetaId,
      chainId: transactionRequest.chainId,
      coinType: transactionRequest.coinType,
      approved: approved
    }, (response) => {
      setIsLoading(false);
      
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        setError('Failed to sign transaction: ' + chrome.runtime.lastError.message);
      } else if (response && response.hash) {
        console.log('Transaction signed successfully:', response.hash);
      } else {
        console.error('Failed to sign transaction:', response ? response.error : 'Unknown error');
        setError('Failed to sign transaction: ' + (response ? response.error : 'Unknown error'));
      }
    });
  };

  const handleSignSolanaTransaction = (approved) => {
    if (!solanaTransactionRequest) {
      console.error('No Solana transaction request available');
      return;
    }

    setIsLoading(true);
    console.log(`Signing Solana transaction (Approved: ${approved}, Request ID: ${solanaTransactionRequest.id})...`);

    chrome.runtime.sendMessage({
      type: 'signSolanaTransaction',
      requestId: solanaTransactionRequest.id,
      approved: approved
    }, (response) => {
      setIsLoading(false);
      
      if (chrome.runtime.lastError) {
        console.error('Chrome runtime error:', chrome.runtime.lastError);
        setError('Failed to sign transaction: ' + chrome.runtime.lastError.message);
      } else if (response && response.success) {
        console.log('Solana transaction signed successfully');
        setSolanaTransactionRequest(null);
      } else {
        console.error('Failed to sign Solana transaction:', response ? response.error : 'Unknown error');
        setError('Failed to sign transaction: ' + (response ? response.error : 'Unknown error'));
      }
    });
  };

  const getCoinIcon = (coinType) => {
    switch (coinType) {
      case 60: return <FaEthereum className="text-[#627EEA] h-6 w-6" />;
      case 1: return <img src={btcIcon} alt="Bitcoin" className="h-6 w-6" />;
      case 501: return <img src={solIcon} alt="Solana" className="h-6 w-6" />;
      default: return <span className="text-gray-400">?</span>;
    }
  };

  // Add debug logging for render
  console.log('Current Solana transaction request:', solanaTransactionRequest);

  if (isLoading) {
    return <Loading />;
  }

  if (signRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 rounded-3xl">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sign <span className="bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">Message</span>
              </h2>
              <h3 className="text-xl font-semibold text-gray-900 mt-1">Request</h3>
            </div>
            <p className="text-gray-600">Your signature is being requested</p>
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">From: 
                <span className="text-gray-600 ml-2">{signRequest.origin}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-700 font-medium">Address:</p>
              <p className="text-gray-600 break-all text-sm">{signRequest.address}</p>
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => handleSignMessage(false)}
                className="flex-1 px-6 py-3 border-0 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#FF3B30] to-[#FF4B4B] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B30] flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <FaTimes className="mr-2" /> Reject
              </button>
              <button
                onClick={() => handleSignMessage(true)}
                className="flex-1 px-6 py-3 border-0 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#34C759] to-[#32D74B] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32D74B] flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <FaSignature className="mr-2" /> Sign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (transactionRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sign <span className="bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">Transaction</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">From:</p>
                <p className="text-gray-600 break-all text-sm">{transactionRequest.from}</p>
              </div>
              

              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Transaction ID:</p>
                <p className="text-gray-600 break-all text-sm">{transactionRequest.txMetaId}</p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => handleSignTransaction(false)}
                className="flex-1 px-6 py-3 border-0 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#FF3B30] to-[#FF4B4B] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B30] flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <FaTimes className="mr-2" /> Reject
              </button>
              <button
                onClick={() => handleSignTransaction(true)}
                className="flex-1 px-6 py-3 border-0 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#34C759] to-[#32D74B] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32D74B] flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <FaSignature className="mr-2" /> Sign
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (solanaTransactionRequest) {
    console.log('Rendering Solana transaction UI:', solanaTransactionRequest);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Sign <span className="bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">Solana Transaction</span>
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Address:</p>
                <p className="text-gray-600 break-all text-sm">
                  {`${solanaTransactionRequest.address.slice(0, 6)}...${solanaTransactionRequest.address.slice(-4)}`}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Origin:</p>
                <p className="text-gray-600 break-all text-sm">
                  {solanaTransactionRequest.origin}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Chain ID:</p>
                <p className="text-gray-600 text-sm">
                  {solanaTransactionRequest.chainId}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-700 font-medium">Request ID:</p>
                <p className="text-gray-600 text-sm">
                  {solanaTransactionRequest.id}
                </p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                onClick={() => handleSignSolanaTransaction(false)}
                className="flex-1 px-6 py-3 border-0 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#FF3B30] to-[#FF4B4B] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF3B30] flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <FaTimes className="mr-2" /> Reject
              </button>
              <button
                onClick={() => handleSignSolanaTransaction(true)}
                className="flex-1 px-6 py-3 border-0 text-sm font-medium rounded-xl text-white bg-gradient-to-r from-[#34C759] to-[#32D74B] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#32D74B] flex items-center justify-center shadow-lg transition-all duration-200"
              >
                <FaSignature className="mr-2" /> Sign
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-500 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // return (
  //   <div className="min-h-screen bg-white text-gray-800 p-6 flex flex-col">
  //     <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">
  //       Portfolio
  //     </h1>
  //     {error && (
  //       <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
  //         Error: {error}
  //       </div>
  //     )}

  //     {/* <div className="flex-grow mb-20">
  //       <h3 className="text-xl font-semibold mb-4 text-gray-800">Accounts</h3>
  //       {accounts
  //         .map((account, index) => (
  //           <div key={index} className="bg-white rounded-lg p-4 mb-4 shadow-lg border border-gray-200">
  //             <div className="flex justify-between items-center mb-2">
  //               <h2 className="font-semibold text-lg truncate pr-2 text-gray-800" title={account.name}>
  //                 {account.name}
  //               </h2>
  //             </div>
  //             <div className="flex items-center justify-between">
  //               <div className="flex items-center text-sm text-gray-600">
  //                 <span className="mr-2">
  //                   {`${account.address.slice(0, 6)}...${account.address.slice(-4)}`}
  //                 </span>
  //                 <button
  //                   className="text-blue-500 hover:text-blue-600 transition-colors"
  //                   onClick={() => {
  //                     navigator.clipboard.writeText(account.address);
  //                     console.log('Address copied:', account.address);
  //                   }}
  //                   title="Copy address"
  //                 >
  //                   <FaCopy />
  //                 </button>
  //               </div>
  //               <div className="text-lg font-semibold">
  //                 {getCoinIcon(account.coin)}
  //               </div>
  //             </div>
  //           </div>
  //         ))}
  //     </div> */}

  //     {/* Balance Display */}
  //     <div className="mb-8">
  //       <h2 className="text-4xl font-bold mb-2">$0.00</h2>
  //       <div className="flex items-center space-x-2">
  //         <span className="text-green-500 text-sm">+$0.00</span>
  //         <span className="bg-green-500/20 text-green-500 text-xs px-2 py-1 rounded">+0%</span>
  //       </div>
  //     </div>

  //     <div className="grid grid-cols-4 gap-4 mb-8">
  //       {[
  //         { icon: <FaPlus />, label: 'Buy', path: '/buy', color: 'bg-[#4A3B89]' },
  //         { icon: <FaPaperPlane />, label: 'Send', path: '/', color: 'bg-[#4A3B89]' },
  //         { icon: <FaExchangeAlt />, label: 'Swap', path: '/', color: 'bg-[#4A3B89]' },
  //         { icon: <FaEllipsisH />, label: 'More', path: '/', color: 'bg-[#4A3B89]' },
  //       ].map((item, index) => (
  //         <Link
  //           key={index}
  //           to={item.path}
  //           className="flex flex-col items-center"
  //         >
  //           <div className={`${item.color} p-4 rounded-full mb-2`}>
  //             {item.icon}
  //           </div>
  //           <span className="text-xs">{item.label}</span>
  //         </Link>
  //       ))}
  //     </div>

  //     {/* Uncomment and update if you want to include the lock wallet button
  //     <div className="mt-auto">
  //       <button
  //         onClick={handleLockWallet}
  //         className="w-full bg-[#FF8C00] hover:bg-[#FFA500] text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center mb-4 transition-colors shadow-md"
  //       >
  //         <FaLock className="mr-2" /> Lock Wallet
  //       </button>
  //     </div>
  //     */}
  //     <div className="mt-auto">
  //       <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
  //         <div className="flex justify-between max-w-sm mx-auto">
  //           {[
  //             { icon: <FaWallet size={16} />, label: 'Portfolio', path: '/portfolio' },
  //             { icon: <FaBolt size={16} />, label: 'Activity', path: '/activity' },
  //             { icon: <FaUserCircle size={16} />, label: 'Accounts', path: '/accounts' },
  //             { icon: <FaCompass size={16} />, label: 'Explore', path: '/explore' },
  //           ].map((item, index) => (
  //             <Link
  //               key={index}
  //               to={item.path}
  //               className={`flex flex-col items-center px-2 ${
  //                 location.pathname === item.path 
  //                   ? 'text-[#FF8C00]' 
  //                   : 'text-gray-400 hover:text-gray-600'
  //               }`}
  //             >
  //               {item.icon}
  //               <span className="text-[10px] mt-0.5">{item.label}</span>
  //             </Link>
  //           ))}
  //         </div>
  //       </nav>
  //     </div>
  //   </div>
  // );
};

export default Portfolio;