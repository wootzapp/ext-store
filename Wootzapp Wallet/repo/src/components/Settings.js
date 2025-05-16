/* global chrome */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

const Settings = () => {
  const [toggleEnabled, setToggleEnabled] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '' });

  useEffect(() => {
    // Check the current blinks state
    chrome.wootz.setBlinksEnabled(false, (result) => {
      if (result && typeof result.enabled !== 'undefined') {
        setToggleEnabled(result.enabled);
      }
    });

    chrome.storage.local.get('blinksEnabled', (result) => {
      if (result.blinksEnabled !== undefined) {
        setToggleEnabled(result.blinksEnabled);
      }
    });
  }, []);

  // Toggle handler
  const handleToggle = () => {
    const newState = !toggleEnabled;
    setToggleEnabled(newState);
    
    // Update the blinks state in the extension
    chrome.wootz.setBlinksEnabled(newState, (result) => {
      console.log(`Blinks ${newState ? 'enabled' : 'disabled'}:`, result);
    });
    
    // Save this preference to local storage
    chrome.storage.local.set({ 'blinksEnabled': newState });
    
    // Show notification when toggle state changes
    setNotification({
      show: true,
      message: `Solana Blinks on X are now ${newState ? 'enabled' : 'disabled'}. Refresh the page to apply changes.`
    });
    
    // Auto-hide notification after 10 seconds
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 10000);
  };

  // Close notification handler
  const closeNotification = () => {
    setNotification({ show: false, message: '' });
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 p-6 flex flex-col">
      <div className="flex items-center mb-6">
        <Link to="/accounts" className="text-[#FF8C00] hover:text-[#FF3B30] mr-4">
          <FaArrowLeft size={20} />
        </Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-transparent bg-clip-text">
          Settings
        </h1>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
        <h2 className="font-semibold text-lg mb-4">Features</h2>
        
        <div className="px-4 py-3 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Allow Solana Blinks on X</span>
            <button 
              onClick={handleToggle}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                toggleEnabled ? 'bg-[#FF3B30]' : 'bg-gray-300'
              }`}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  toggleEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} 
              />
            </button>
          </div>

        </div>
      </div>
      
      {/* Toast Notification */}
      {notification.show && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#FF3B30] to-[#FF8C00] text-white px-6 py-3 rounded-lg shadow-lg flex items-center justify-between w-[90vw] animate-fade-in">
          <span>{notification.message}</span>
          <button 
            onClick={closeNotification}
            className="ml-4 text-white hover:text-gray-200 focus:outline-none"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default Settings;