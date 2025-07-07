import React, { useEffect, useState } from "react";
import LabubuSearch from "../components/LabubuSearch.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { FaBolt, FaLock, FaGift } from 'react-icons/fa';

const LABUBU_EMOJI = "🦊";

const popupVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
  exit: { opacity: 0, y: -40, transition: { duration: 0.2 } }
};

const statusVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
};

const Popup = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStatus, setAuthStatus] = useState('idle');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  useEffect(() => {
    const handleMessage = (message) => {
      console.log('🟡 Popup: Received message:', message.type);
      
      switch (message.type) {
        case 'AUTH_SUCCESS':
          console.log('🟡 Popup: Authentication successful');
          setIsAuthenticated(true);
          setAuthStatus('success');
          setShowLoginPrompt(false);
          // Set user profile if provided
          if (message.userProfile) {
            setUserProfile(message.userProfile);
            console.log('🟡 Popup: User profile set:', message.userProfile);
          }
          break;
          
        case 'AUTH_FAILED':
          console.log('🟡 Popup: Authentication failed');
          setAuthStatus('failed');
          setShowLoginPrompt(true);
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    
    // Don't automatically check authentication on mount
    // User must click the button to start authentication
    console.log('🟡 Popup: Popup mounted, waiting for user to click authentication button');
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  const handleCheckAuth = () => {
    console.log('🟡 Popup: Checking authentication...');
    setAuthStatus('loading');
    setShowLoginPrompt(false);
    
    chrome.runtime.sendMessage({
      type: 'CHECK_AUTH'
    });
  };

  const handleRetryAuth = () => {
    console.log('🟡 Popup: Retrying authentication...');
    setAuthStatus('loading');
    setShowLoginPrompt(false);
    
    chrome.runtime.sendMessage({
      type: 'CHECK_AUTH'
    });
  };

  const handleBackToLogin = () => {
    setIsAuthenticated(false);
    setAuthStatus('idle');
    setShowLoginPrompt(false);
  };

  const handleOpenLoginTab = () => {
    setShowLoginPrompt(false);
    setAuthStatus('idle');
    
    chrome.runtime.sendMessage({
      type: 'OPEN_LOGIN_TAB'
    });
  };

  const handleLogout = () => {
    console.log('🟡 Popup: Logging out...');
    chrome.runtime.sendMessage({
      type: 'LOGOUT'
    }, (response) => {
      if (response && response.success) {
        setIsAuthenticated(false);
        setAuthStatus('idle');
        setShowLoginPrompt(false);
        setUserProfile(null);
        console.log('🟡 Popup: Logout successful');
      }
    });
  };

  if (isAuthenticated) {
    return (
      <LabubuSearch
        onBack={handleBackToLogin}
        userProfile={userProfile}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-screen h-screen bg-gradient-to-br from-[#1a144b] via-[#3a1c71] to-[#6e1e9c] relative overflow-hidden font-labubu"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={popupVariants}
    >
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-6 sm:p-10 flex flex-col items-center shadow-2xl border border-white/20">
        <div className="mb-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg mb-2 relative">
            <span className="absolute inset-0 rounded-full bg-pink-500/30 blur-2xl animate-pulse"></span>
            <span className="text-4xl text-white relative z-10">🎀</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-2 text-center">Labubu Extension</h1>
          <p className="text-base text-purple-200 mt-1 text-center">Your playful Popmart helper!</p>
        </div>
        <AnimatePresence mode="wait">
          {authStatus === 'loading' && (
            <motion.div
              key="loading"
              className="mt-4 text-center z-10"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={statusVariants}
            >
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400 border-t-2 border-yellow-400"></div>
              <p className="text-sm text-purple-200 mt-2 font-semibold">Checking authentication...</p>
            </motion.div>
          )}
          {showLoginPrompt && (
            <motion.div
              key="login-prompt"
              className="mt-4 p-4 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/40 rounded-xl z-10"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={statusVariants}
            >
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl">🔐</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Login Required</h3>
                <p className="text-sm text-purple-200 mb-4">Please login to Popmart to continue using the Labubu extension.</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleOpenLoginTab}
                    className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm rounded-lg shadow hover:from-pink-600 hover:to-purple-600 transition-all duration-200 font-semibold"
                  >
                    Login to Popmart
                  </button>
                  <button
                    onClick={handleRetryAuth}
                    className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg shadow hover:bg-gray-700 transition-all duration-200 font-semibold"
                  >
                    Retry Check
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="mt-8 z-10 relative w-full">
          <button
            onClick={handleCheckAuth}
            disabled={authStatus === 'loading'}
            className="w-full px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-lg rounded-2xl font-bold shadow-lg hover:from-pink-600 hover:to-purple-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200"
          >
            {authStatus === 'loading' ? 'Checking...' : 'Check Authentication'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Popup; 