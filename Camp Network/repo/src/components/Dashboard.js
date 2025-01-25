/* global chrome */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';



const Dashboard = () => {
    const navigate = useNavigate();
    const [walletAddress, setWalletAddress] = useState('');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [twitterStatus, setTwitterStatus] = useState('login'); // 'login' or 'ready'

    useEffect(() => {
        // Listen for Twitter auth updates
        const authListener = (message) => {
            if (message.type === 'TWITTER_AUTH_UPDATED') {
                console.log('🔐 Twitter auth status updated:', message.data);
                setTwitterStatus(message.data.isAuthenticated ? 'ready' : 'login');
            }
        };

        chrome.runtime.onMessage.addListener(authListener);
        
        // Check initial status
        chrome.storage.local.get(['isTwitterAuthenticated'], (result) => {
            setTwitterStatus(result.isTwitterAuthenticated ? 'ready' : 'login');
        });

        return () => chrome.runtime.onMessage.removeListener(authListener);
    }, []);

    const handleTwitterAuth = async () => {
        console.log('🔄 Starting Twitter auth process...');
        
        // Open Twitter in new tab
        chrome.tabs.create({ url: 'https://x.com' }, (tab) => {
            console.log('📱 Opened Twitter tab:', tab.id);
        });
    };

    useEffect(() => {
        // Check wallet connection on mount
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts.length > 0) {
                        setWalletAddress(accounts[0]);
                    } else {
                        navigate('/');
                    }
                } catch (error) {
                    console.error('Error checking wallet:', error);
                    navigate('/');
                }
            }
        };

        const handleAccountsChanged = (accounts) => {
            if (accounts.length > 0) {
                setWalletAddress(accounts[0]);
                localStorage.setItem('walletConnected', 'true');
                localStorage.setItem('walletAddress', accounts[0]);
            } else {
                handleDisconnect();
            }
        };

        // const handleDisconnect = () => {
        //     localStorage.removeItem('walletConnected');
        //     localStorage.removeItem('walletAddress');
           
        //     navigate('/');
        // };

        const handleDisconnect = async () => {
            console.log('🔄 Starting wallet disconnect and Twitter shutdown process...');
            
            // Clear local storage for wallet
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
            
            // Clear wallet state
            setWalletAddress('');
            
            // Disable all Twitter scraping functionalities
            chrome.storage.local.set({ 
                isMainScrapingEnabled: false,
                isScrapingEnabled: false,
                isBackgroundTweetScrapingEnabled: false,
                isFollowingEnabled: false
            }, () => {
                console.log('✅ Successfully disabled all Twitter scraping toggles');
                
                // Send message to stop all active scraping processes
                chrome.runtime.sendMessage({
                    type: 'STOP_ALL_SCRAPING'
                }, () => {
                    console.log('✅ Sent stop signal to all active scraping processes');
                });
            });
            
            // If using MetaMask, handle wallet disconnection
            if (window.ethereum) {
                try {
                    // Clear any existing connections
                    await window.ethereum.request({
                        method: "wallet_requestPermissions",
                        params: [{ eth_accounts: {} }]
                    });
                    console.log('✅ Successfully reset wallet permissions');
                } catch (error) {
                    console.log("❌ Error resetting wallet connection:", error);
                }
            }
            
            // Force navigation to home
            navigate('/', { replace: true });
            console.log('✅ Navigation to home complete');
        };

        
        checkWalletConnection();

        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            window.ethereum.on('disconnect', handleDisconnect);

            return () => {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
                window.ethereum.removeListener('disconnect', handleDisconnect);
            };
        }
    }, [navigate]);

    const handleDisconnect = async () => {
        console.log('🔄 Starting wallet disconnect and Twitter shutdown process...');
        
        // Clear local storage for wallet
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        
        // Clear wallet state
        setWalletAddress('');
        
        // Disable all Twitter scraping functionalities
        chrome.storage.local.set({ 
            isMainScrapingEnabled: false,
            isScrapingEnabled: false,
            isBackgroundTweetScrapingEnabled: false,
            isFollowingEnabled: false
        }, () => {
            console.log('✅ Successfully disabled all Twitter scraping toggles');
            
            // Send message to stop all active scraping processes
            chrome.runtime.sendMessage({
                type: 'STOP_ALL_SCRAPING'
            }, () => {
                console.log('✅ Sent stop signal to all active scraping processes');
            });
        });
        
        // If using MetaMask, handle wallet disconnection
        if (window.ethereum) {
            try {
                // Clear any existing connections
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }]
                });
                console.log('✅ Successfully reset wallet permissions');
            } catch (error) {
                console.log("❌ Error resetting wallet connection:", error);
            }
        }
        
        // Force navigation to home
        navigate('/', { replace: true });
        console.log('✅ Navigation to home complete');
    };
    // Function to format wallet address
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    

    return (
        <div 
            className="min-h-screen w-full flex flex-col items-center justify-center p-4"
            style={{
                backgroundImage: `url('/wood.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}
        >
            <div className="bg-white rounded-2xl shadow-lg p-5 max-w-xs w-full border border-red-50">
                <div className="flex flex-col items-center justify-center w-full">
                    <img 
                        src="/icons/icon128.png"
                        alt="Camp Logo"
                        className="w-12 h-12 mb-4 drop-shadow-lg"
                    />
                    
                    <h1 className="text-2xl font-bold mb-3 text-center text-gray-800">
                        Welcome to Camp-Network
                    </h1>

                    {/* Wallet Info Card */}
                    <div className="w-full bg-red-50 rounded-lg p-2 mb-3 border border-red-100 shadow-sm">
                        <div className="text-center">
                            <p className="text-gray-600 text-xs mb-1">Connected Wallet</p>
                            <p className="font-mono font-medium text-gray-800 text-sm">{formatAddress(walletAddress)}</p>
                        </div>
                    </div>

                    <div className="w-full space-y-2 mb-4">
                        <button
                            onClick={twitterStatus === 'login' ? handleTwitterAuth : () => navigate('/twitter-control')}
                            className={`w-full py-3 rounded-lg font-medium text-base transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                                twitterStatus === 'ready' 
                                    ? 'bg-[#ffaa72] hover:bg-[#ff9b5a] text-white' 
                                    : 'bg-[#ff8c42] hover:bg-[#ff7c32] text-white'
                            }`}
                        >
                            {twitterStatus === 'login' ? 'Connect Twitter Account' : 'Scrape Twitter Control'}
                        </button>

                        <button
                            onClick={() => navigate('/scraped-data')}
                            className="w-full bg-[#3AADA8] text-white py-3 rounded-lg font-medium text-base hover:bg-[#2A9D98] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            View Scraped Data
                        </button>

                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            className="w-full bg-[#DC3545] text-white py-3 rounded-lg font-medium text-base hover:bg-[#C82333] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                        >
                            Disconnect Wallet
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all border border-red-50">
                        <div className="flex items-center mb-6">
                            <img 
                                src="/icons/icon128.png"
                                alt="Camp Logo"
                                className="w-10 h-10 mr-4"
                            />
                            <h3 className="text-xl font-bold bg-gradient-to-r from-[#ff4b2b] to-[#ff8c42] text-transparent bg-clip-text">
                                Confirm Disconnect
                            </h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to disconnect your wallet?
                        </p>
                        
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-red-50 rounded-lg transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDisconnect();
                                    setShowConfirmDialog(false);
                                }}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard; 