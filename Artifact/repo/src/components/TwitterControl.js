/* global chrome */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';

const TwitterControl = () => {
  const navigate = useNavigate();
  const [isScrapingEnabled, setIsScrapingEnabled] = useState(false);
  const [isFollowingEnabled, setIsFollowingEnabled] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState({
    hasScrapedProfile: false,
    hasScrapedLikes: false,
    hasScrapedFollowing: false
  });
  const [profileData, setProfileData] = useState(null);
  const [isMainScrapingEnabled, setIsMainScrapingEnabled] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isBackgroundTweetScrapingEnabled, setIsBackgroundTweetScrapingEnabled] = useState(false);

  useEffect(() => {
    // Get initial states
    chrome.storage.local.get([
      'isMainScrapingEnabled',
      'isScrapingEnabled', 
      'isBackgroundTweetScrapingEnabled',
      'hasScrapedProfile', 
      'hasScrapedLikes', 
      'hasScrapedFollowing',
      'profileData',
      'isFollowingEnabled'
    ], (result) => {
      console.log('📊 Loading initial states:', result);
      setIsMainScrapingEnabled(result.isMainScrapingEnabled ?? false);
      setIsScrapingEnabled(result.isScrapingEnabled ?? false);
      setIsBackgroundTweetScrapingEnabled(result.isBackgroundTweetScrapingEnabled ?? false);
      setIsFollowingEnabled(result.isFollowingEnabled ?? false);
      
      setScrapingStatus({
        hasScrapedProfile: result.hasScrapedProfile || false,
        hasScrapedLikes: result.hasScrapedLikes || false,
        hasScrapedFollowing: result.hasScrapedFollowing || false
      });
      setProfileData(result.profileData || null);
    });

    // Listen for scraping status updates
    const handleStorageChange = (changes) => {
      console.log('💾 Storage changes detected:', changes);
      
      if (changes.isMainScrapingEnabled) {
        setIsMainScrapingEnabled(changes.isMainScrapingEnabled.newValue);
      }
      if (changes.isScrapingEnabled) {
        setIsScrapingEnabled(changes.isScrapingEnabled.newValue);
      }
      if (changes.isBackgroundTweetScrapingEnabled) {
        setIsBackgroundTweetScrapingEnabled(changes.isBackgroundTweetScrapingEnabled.newValue);
      }
      if (changes.isFollowingEnabled) {
        setIsFollowingEnabled(changes.isFollowingEnabled.newValue);
      }
      if (changes.hasScrapedProfile || changes.hasScrapedLikes || changes.hasScrapedFollowing) {
        setScrapingStatus(prev => ({
          hasScrapedProfile: changes.hasScrapedProfile?.newValue ?? prev.hasScrapedProfile,
          hasScrapedLikes: changes.hasScrapedLikes?.newValue ?? prev.hasScrapedLikes,
          hasScrapedFollowing: changes.hasScrapedFollowing?.newValue ?? prev.hasScrapedFollowing
        }));
      }
      if (changes.profileData) {
        setProfileData(changes.profileData.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const toggleScraping = () => {
    const newState = !isScrapingEnabled;
    console.log('🔄 Toggling scraping to:', newState);
    
    if (newState) {
      setScrapingStatus(prev => ({
        ...prev,
        hasScrapedProfile: false,
        hasScrapedLikes: false
      }));
    }
    
    chrome.storage.local.set({ 
      isScrapingEnabled: newState,
      ...(newState ? {
        hasScrapedProfile: false,
        hasScrapedLikes: false
      } : {})
    }, () => {
      chrome.runtime.sendMessage({
        type: 'TOGGLE_SCRAPING',
        enabled: newState
      });
    });
  };

  const toggleFollowing = () => {
    const newState = !isFollowingEnabled;
    setIsFollowingEnabled(newState);
    
    if (newState) {
      // Get initial username from storage instead of relying on profileData
      chrome.storage.local.get(['initialUsername'], (result) => {
        if (result.initialUsername) {
          console.log('🔄 Requesting following scrape for:', result.initialUsername);
          chrome.runtime.sendMessage({
            type: 'START_FOLLOWING_SCRAPE',
            username: result.initialUsername,
            enabled: newState
          });
        } else {
          console.error('No username found for following scrape');
          setIsFollowingEnabled(false);
        }
      });
    }

    // Save the following state
    chrome.storage.local.set({ 
      isFollowingEnabled: newState
    });
  };

  const toggleBackgroundTweetScraping = () => {
    const newState = !isBackgroundTweetScrapingEnabled;
    console.log('🔄 Toggling background tweet scraping to:', newState);
    
    if (newState) {
      chrome.runtime.sendMessage({
        type: 'TOGGLE_BACKGROUND_TWEET_SCRAPING',
        username: profileData?.username,
        enabled: newState
      });
    } else {
      chrome.runtime.sendMessage({
        type: 'STOP_BACKGROUND_TWEET_SCRAPING'
      });
    }
    
    setIsBackgroundTweetScrapingEnabled(newState);
    chrome.storage.local.set({ 
      isBackgroundTweetScrapingEnabled: newState
    });
  };

  const handlePermissionResponse = (accepted) => {
    setShowPermissionDialog(false);
    
    if (accepted) {
      chrome.storage.local.set({ 
        isMainScrapingEnabled: true
      });
      setIsMainScrapingEnabled(true);
    } else {
      // When denying or turning off main scraping, disable all toggles
      chrome.storage.local.set({ 
        isMainScrapingEnabled: false,
        isScrapingEnabled: false,
        isBackgroundTweetScrapingEnabled: false,
        isFollowingEnabled: false
      });
      setIsMainScrapingEnabled(false);
      setIsScrapingEnabled(false);
      setIsBackgroundTweetScrapingEnabled(false);
      setIsFollowingEnabled(false);

      chrome.runtime.sendMessage({
        type: 'STOP_ALL_SCRAPING'
      });
    }
  };

  const toggleMainScraping = () => {
    if (!isMainScrapingEnabled) {
        setShowPermissionDialog(true);
    } else {
        // When turning off main scraping, disable all other toggles first
        chrome.storage.local.set({ 
            isMainScrapingEnabled: false,
            isScrapingEnabled: false,
            isBackgroundTweetScrapingEnabled: false,
            isFollowingEnabled: false
        }, () => {
            // Stop all active scraping processes
            chrome.runtime.sendMessage({
                type: 'STOP_ALL_SCRAPING'
            });
            
            // Update local state
            setIsMainScrapingEnabled(false);
            setIsScrapingEnabled(false);
            setIsBackgroundTweetScrapingEnabled(false);
            setIsFollowingEnabled(false);
        });
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-4">
      {/* Header */}
      <header className="flex items-center mb-6 justify-between py-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/relicdao/dashboard')}
            className="text-2xl mr-4"
          >
            <IoArrowBack />
          </button>
          <span className="text-xl font-bold">Twitter Controls</span>
        </div>
      </header>

      <div className="space-y-6">
        {/* Main Toggle Section */}
        <div className="bg-[#101727] rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1 mr-4">
              <h3 className="font-bold text-lg mb-1">Twitter Scraping</h3>
              <p className="text-sm text-gray-400">Enable or disable all Twitter data collection</p>
            </div>
            <button
              onClick={toggleMainScraping}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                isMainScrapingEnabled ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                isMainScrapingEnabled ? 'translate-x-8' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Scraping Controls */}
        <div className="bg-[#101727] rounded-lg p-4">
          <h3 className="font-bold text-lg mb-4">Data Collection Controls</h3>
          
          {/* Profile & Likes Toggle */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Profile & Likes Data</p>
                <p className="text-sm text-gray-400">Collect basic profile info and liked posts</p>
              </div>
              <button
                onClick={toggleScraping}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                  isScrapingEnabled ? 'bg-[#00bcd4]' : 'bg-gray-600'
                } ${!isMainScrapingEnabled ? 'opacity-50' : ''}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isScrapingEnabled ? 'translate-x-[1.75rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Tweet Scraping Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Tweet Collection</p>
                <p className="text-sm text-gray-400">Collect tweets in the background</p>
              </div>
              <button
                onClick={toggleBackgroundTweetScraping}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                  isBackgroundTweetScrapingEnabled ? 'bg-[#03a9f4]' : 'bg-gray-600'
                } ${!isMainScrapingEnabled ? 'opacity-50' : ''}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isBackgroundTweetScrapingEnabled ? 'translate-x-8' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Following Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Following Data</p>
                <p className="text-sm text-gray-400">Collect following list information</p>
              </div>
              <button
                onClick={toggleFollowing}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                  isFollowingEnabled ? 'bg-[#00bcd4]' : 'bg-gray-600'
                } ${!isMainScrapingEnabled ? 'opacity-50' : ''}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                  isFollowingEnabled ? 'translate-x-[1.75rem]' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-[#101727] rounded-lg p-4">
          <h3 className="font-bold text-lg mb-4">Collection Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#1a2235] transition-colors">
              <div>
                <span className="text-white">Profile Data</span>
                <p className="text-sm text-gray-400">Basic user information</p>
              </div>
              <span className="text-2xl">
                {scrapingStatus.hasScrapedProfile ? '✅' : '⏳'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#1a2235] transition-colors">
              <div>
                <span className="text-white">Likes Data</span>
                <p className="text-sm text-gray-400">User's liked posts</p>
              </div>
              <span className="text-2xl">
                {scrapingStatus.hasScrapedLikes ? '✅' : '⏳'}
              </span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg hover:bg-[#1a2235] transition-colors">
              <div>
                <span className="text-white">Following Data</span>
                <p className="text-sm text-gray-400">User's following list</p>
              </div>
              <span className="text-2xl">
                {scrapingStatus.hasScrapedFollowing ? '✅' : '⏳'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-6">
          <button 
            onClick={() => navigate('/scraped-data')}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-all duration-300"
          >
            View Collected Data
          </button>
          <button 
            onClick={() => navigate('/relicdao/dashboard')}
            className="flex-1 bg-[#272a2f] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#323538] transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Permission Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#101727] rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-6">
              <img 
                src="/icons/icon128.png"
                alt="Camp Logo"
                className="w-10 h-10 mr-4"
              />
              <h3 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 text-transparent bg-clip-text">
                Permission Required
              </h3>
            </div>
            
            <p className="text-white mb-6">
              WootzApp is requesting permission to access Twitter with Camp Network. 
              This will allow the application to scrape profile data, likes, and following information.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handlePermissionResponse(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                Deny
              </button>
              <button
                onClick={() => handlePermissionResponse(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
              >
                Allow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TwitterControl; 
