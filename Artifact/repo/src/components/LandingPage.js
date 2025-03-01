/* global chrome */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../images/artifact.png';

const LandingPage = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = React.useState(false);

  React.useEffect(() => {
    const handleAutoRedirect = async () => {
      setIsRedirecting(true);
      
      try {
        // Get token from storage
        const storage = await chrome.storage.local.get(['authToken', 'refreshToken']);
        const token = storage.authToken || localStorage.getItem('authToken');
        const refreshToken = storage.refreshToken || localStorage.getItem('refreshToken');

        if (token) {
          // Sync tokens between localStorage and chrome storage
          localStorage.setItem('authToken', token);
          localStorage.setItem('refreshToken', refreshToken);

          // Update chrome storage
          await chrome.storage.local.set({
            refreshToken: refreshToken,
            authToken: token,
            isLoggedIn: true
          });

          // Send refresh token to background script
          chrome.runtime.sendMessage({ 
            type: 'REFRESH_TOKEN_UPDATE',
            refreshToken: refreshToken
          });

          // Set authentication state using the passed handler
          const saveSuccess = await onLoginSuccess(token);
          
          if (!saveSuccess) {
            throw new Error('Failed to save authentication state');
          }
        }

        // Check if current tab is chrome new tab
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const isNewTab = activeTab?.url === 'chrome-native://newtab/';

        // If we're on a new tab page, close it and open a new one
        if (isNewTab) {
          await chrome.tabs.remove(activeTab.id);
          await chrome.tabs.create({ url: 'chrome-native://newtab/' });
        }

        navigate('/relicdao/dashboard', { replace: true });
      } catch (error) {
        console.error('Error handling authentication/redirect:', error);
        // Still navigate even if there's an error
        setTimeout(() => {
          navigate('/relicdao/dashboard');
        }, 1500);
      }
    };

    handleAutoRedirect();
  }, [navigate, onLoginSuccess]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#191d21] p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        <img src={logo} alt="Artifact logo" className="mx-auto h-10 sm:h-12 mb-6 sm:mb-8" />
        
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Signup Successful!</h2>
          <p className="text-gray-400">Welcome to RelicDAO. You're all set to start earning rewards!</p>
        </div>

        {isRedirecting && (
          <div className="mt-4 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-purple-500 border-r-transparent align-[-0.125em]" />
            <p className="mt-2 text-gray-400">Redirecting to Dashboard...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
