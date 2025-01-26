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

        const handleDisconnect = () => {
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
            navigate('/');
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

    // Function to format wallet address
    const formatAddress = (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const handleDisconnect = async () => {
        // Clear local storage
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        
        // Clear state
        setWalletAddress('');
        
        // If using MetaMask, you can't force disconnect but you can clear the dApp state
        if (window.ethereum) {
            try {
                // Clear any existing connections
                await window.ethereum.request({
                    method: "wallet_requestPermissions",
                    params: [{ eth_accounts: {} }]
                });
            } catch (error) {
                console.log("Error resetting wallet connection:", error);
            }
        }
        
        // Force navigation to home
        navigate('/', { replace: true });
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center justify-center w-full max-w-sm">
                <img
                    src="/icons/icon128.png"
                    alt="Camp Logo"
                    className="w-16 h-16 mb-8"
                />

                <h1 className="text-2xl font-bold mb-3 text-center">
                    Welcome to Camp-Network
                </h1>

                {/* Wallet Info Card */}
                <div className="w-full bg-gray-50 rounded-lg p-4 mb-2 border border-gray-200">
                    <div className="text-center">
                        <p className="text-gray-600 text-sm mb-1">Connected Wallet</p>
                        <p className="font-mono font-medium text-black">{formatAddress(walletAddress)}</p>
                    </div>
                </div>

                <div className="w-full space-y-4 mt-4">
                    <button
                        onClick={twitterStatus === 'login' ? handleTwitterAuth : () => navigate('/twitter-control')}
                        className={`w-full max-w-xs mx-auto ${
                            twitterStatus === 'ready' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'
                        } text-white py-3 rounded-full font-medium text-base transition-colors duration-200 block`}
                    >
                        {twitterStatus === 'login' ? 'Connect Twitter Account' : 'Scrape Twitter Control'}
                    </button>

                    <button
                        onClick={() => navigate('/scraped-data')}
                        className="w-full max-w-xs mx-auto bg-blue-500 text-white py-3 rounded-full font-medium text-base hover:bg-blue-600 transition-colors duration-200 block"
                    >
                        View Scraped Data
                    </button>

                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        className="w-full max-w-xs mx-auto bg-black text-white py-3 rounded-full font-medium text-base hover:bg-gray-800 transition-colors duration-200 block"
                    >
                        Disconnect Wallet
                    </button>
                </div>
            </div>

            {/* Add Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Confirm Disconnect</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to disconnect your wallet?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmDialog(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleDisconnect();
                                    setShowConfirmDialog(false);
                                }}
                                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
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