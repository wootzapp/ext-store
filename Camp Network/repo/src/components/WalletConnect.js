import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const WalletConnect = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showWalletPopup, setShowWalletPopup] = useState(false);

  useEffect(() => {
    // Check if already connected
    const checkWalletConnection = async () => {
      // First check if there was an explicit disconnect
      const wasDisconnected = !localStorage.getItem('walletConnected');

      if (wasDisconnected) {
        return;
      }

      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            // Only set connected if we actually have an account
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            if (chainId) {
              localStorage.setItem('walletConnected', 'true');
              localStorage.setItem('walletAddress', accounts[0]);
              navigate('/dashboard');
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
          // Clear any stale connection data
          localStorage.removeItem('walletConnected');
          localStorage.removeItem('walletAddress');
        }
      }
    };

    checkWalletConnection();
  }, [navigate]);

  const connectWallet = async (walletType) => {
    setShowWalletPopup(false);
    setIsLoading(true);

    try {
      let provider = window.ethereum;

      // Handle different wallet types
      if (walletType === 'wootzapp' && window.wootzapp) {
        provider = window.wootzapp;
      }

      if (!provider) {
        throw new Error(`Please install ${walletType === 'WootzApp'} wallet!`);
      }

      const accounts = await provider.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', accounts[0]);

        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert(error.message || 'Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add wallet selection popup JSX
  const WalletPopup = () => (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 shadow-2xl w-[280px] mx-auto border border-red-50">
        <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
          Select Wallet
        </h3>
        <div className="space-y-3">
          <button
            onClick={() => connectWallet('wootzapp')}
            className="w-full py-3 px-4 bg-white text-gray-800 rounded-lg hover:bg-red-50 transition-all duration-300 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-red-100"
          >
            <img
              src="/icons/wootzapp.png"
              alt="WootzApp"
              className="w-6 h-6"
            />
            <span className="font-medium">Wootzapp Wallet</span>
          </button>
          <button
            onClick={() => setShowWalletPopup(false)}
            className="w-full py-2 text-gray-600 hover:bg-red-50 rounded-lg transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Update return JSX
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

          <p className="text-sm text-gray-600 mb-6 text-center">
            Connect your wallet to get started
          </p>

          <button
            onClick={() => setShowWalletPopup(true)}
            disabled={isLoading}
            className="w-full bg-[#ff8c42] text-white py-3 rounded-lg font-medium text-base hover:bg-[#ff7c32] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>

      {/* Wallet Selection Popup */}
      {showWalletPopup && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-5 shadow-2xl w-[280px] mx-auto border border-red-50">
            <h3 className="text-lg font-bold mb-4 text-center text-gray-800">
              Select Wallet
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => connectWallet('wootzapp')}
                className="w-full py-3 px-4 bg-white text-gray-800 rounded-lg hover:bg-red-50 transition-all duration-300 flex items-center justify-center space-x-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 border border-red-100"
              >
                <img
                  src="/icons/wootzapp.png"
                  alt="WootzApp"
                  className="w-6 h-6"
                />
                <span className="font-medium">Wootzapp Wallet</span>
              </button>
              <button
                onClick={() => setShowWalletPopup(false)}
                className="w-full py-2 text-gray-600 hover:bg-red-50 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Dialog */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-5 shadow-2xl w-[280px] mx-auto border border-red-50">
            <h3 className="text-lg font-bold mb-3 text-center text-gray-800">
              Connecting...
            </h3>
            <div className="text-center text-sm text-gray-600">
              Please wait while we're connecting with wallet...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;