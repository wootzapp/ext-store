import React, { useEffect, useState } from "react";
import LabubuSearch from "../components/LabubuSearch.jsx";

const Popup = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle');
  
  useEffect(() => {
    const handleMessage = (message) => {
      switch (message.type) {
        case 'AUTH_SUCCESS':
          setIsAuthenticated(true);
          setAuthStatus('success');
          break;
          
        case 'AUTH_FAILED':
          setAuthStatus('failed');
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleCheckAuth = () => {
    setAuthStatus('loading');
    
    chrome.runtime.sendMessage({
      type: 'CHECK_AUTH'
    });
  };

  const handleRetryAuth = () => {
    setAuthStatus('loading');
    
    chrome.runtime.sendMessage({
      type: 'RETRY_AUTH'
    });
  };

  const handleBackToLogin = () => {
    setIsAuthenticated(false);
    setAuthStatus('idle');
  };
  
  if (isAuthenticated) {
    return (
      <LabubuSearch 
        onBack={handleBackToLogin}
      />
    );
  }

  return (
    <div className="p-4 w-72">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Labubu Extension</h2>
      
      {authStatus === 'loading' && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p className="text-sm text-gray-600 mt-2">Checking authentication...</p>
        </div>
      )}
      
      {authStatus === 'failed' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700 mb-2">Authentication failed. Please try again.</p>
          <button
            onClick={handleRetryAuth}
            className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}
      
      <div className="mt-4">
        <button
          onClick={handleCheckAuth}
          disabled={authStatus === 'loading'}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {authStatus === 'loading' ? 'Checking...' : 'Check Authentication'}
        </button>
      </div>
    </div>
  );
};

export default Popup; 