/* global chrome */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuIcon, X, Settings, LogOut, User, Power } from 'lucide-react';
import TwitterControl from './Twitter/TwitterControl';

const styles = {
  container: {
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: '100vh',
    width: '100%',
    position: 'relative',
    overflow: 'hidden'
  },
  appBar: {
    height: '64px',
    width: '100%',
    background: '#000055FF',
    backdropFilter: 'blur(10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    boxSizing: 'border-box',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 100,
    boxShadow: '0 4px 12px rgba(255, 122, 0, 0.2)'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    color: '#FF7A00',
    borderRadius: '8px',
    '&:hover': {
      background: 'rgba(255, 122, 0, 0.1)'
    }
  },
  profileSection: {
    position: 'relative'
  },
  profileButton: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    padding: '8px',
    border: '2px solid #FF7A00',
    cursor: 'pointer',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    background: 'rgba(255, 122, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FF7A00',
    '&:hover': {
      boxShadow: '0 0 0 2px rgba(255, 122, 0, 0.3)',
      background: 'rgba(255, 122, 0, 0.2)'
    }
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 10px)',
    right: 0,
    background: '#000055FF',
    borderRadius: '8px',
    width: '150px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    opacity: 0,
    visibility: 'hidden',
    transform: 'translateY(-10px)',
    transition: 'all 0.3s ease',
    border: '1px solid #9C6300A2'
  },
  dropdownMenuVisible: {
    opacity: 1,
    visibility: 'visible',
    transform: 'translateY(0)'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    gap: '12px',
    '&:hover': {
      background: 'rgba(255, 122, 0, 0.1)'
    }
  },
  dropdownIcon: {
    color: '#FF7A00',
    width: '20px',
    height: '20px'
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.1)',
    margin: '4px 0'
  },
  menuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
    zIndex: 150
  },
  menuOverlayVisible: {
    opacity: 1,
    visibility: 'visible'
  },
  sideMenu: {
    position: 'fixed',
    top: 0,
    left: '-75%',
    width: '75%',
    height: '100%',
    background: '#0000559A',
    backdropFilter: 'blur(10px)',
    transition: 'transform 0.3s ease',
    zIndex: 200,
    padding: '80px 20px 20px',
    boxSizing: 'border-box'
  },
  sideMenuOpen: {
    transform: 'translateX(100%)'
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    color: '#FF7A00',
    borderRadius: '8px',
    '&:hover': {
      background: 'rgba(255, 122, 0, 0.1)'
    }
  },
  content: {
    paddingTop: '64px',
    height: 'calc(100vh - 64px)',
    position: 'relative'
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    color: '#FF7A00',
    borderRadius: '8px',
    marginRight: '12px',
    '&:hover': {
      background: 'rgba(255, 122, 0, 0.1)'
    }
  },
  toggleButtonActive: {
    color: '#4CAF50',
    '&:hover': {
      background: 'rgba(76, 175, 80, 0.1)'
    }
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  }
};

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [scrapingStatus, setScrapingStatus] = useState({
    hasScrapedProfile: false,
    hasScrapedLikes: false,
    hasScrapedFollowing: false,
    hasScrapedReplies: false,
    isProfileScraping: false,
    isLikedTweetsScraping: false,
  });
  
  // Get all scraping states from TwitterControl
  const {
    isFollowingEnabled,
    setIsFollowingEnabled,
    isProfileScrapingEnabled,
    setIsProfileScrapingEnabled,
    isLikedTweetsScrapingEnabled,
    setIsLikedTweetsScrapingEnabled,
    isBackgroundTweetScrapingEnabled,
    setIsBackgroundTweetScrapingEnabled,
    isRepliesScraping,
    setIsRepliesScraping,
    isMainScrapingEnabled,
    setIsMainScrapingEnabled
  } = TwitterControl.useScrapingStates();

  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize all scraping states
    TwitterControl.initializeScrapingStates({
      setIsMainScrapingEnabled,
      setIsBackgroundTweetScrapingEnabled,
      setIsFollowingEnabled,
      setIsRepliesScraping,
      setIsProfileScrapingEnabled,
      setIsLikedTweetsScrapingEnabled
    });

    // Load profile data
    chrome.storage.local.get(['profileData'], (result) => {
      if (result.profileData) {
        setProfileData(result.profileData);
      }
    });

    // Setup storage and message listeners
    const removeStorageListener = TwitterControl.setupStorageListeners({
      setIsMainScrapingEnabled,
      setIsBackgroundTweetScrapingEnabled,
      setIsFollowingEnabled,
      setIsRepliesScraping,
      setIsProfileScrapingEnabled,
      setIsLikedTweetsScrapingEnabled
    });

    const removeMessageListener = TwitterControl.setupMessageListeners({
      setIsBackgroundTweetScrapingEnabled
    });

    // Cleanup listeners on unmount
    return () => {
      removeStorageListener();
      removeMessageListener();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    chrome.storage.local.remove(['userAuth', 'authToken', 'userId', 'userEmail'], () => {
      navigate('/SignIn');
    });
  };

  const handleSettings = () => {
    console.log('Navigate to settings');
  };

  const toggleScraping = async () => {
    const newState = !isMainScrapingEnabled;
    console.log('🔄 Toggling main scraping to:', newState);
    
    try {
      if (!chrome?.storage?.local) {
        console.error('❌ Chrome storage API not available');
        return;
      }

      if (newState) {
        // First, enable main scraping and wait for it to complete
        await new Promise((resolve) => {
          chrome.storage.local.set({ isMainScrapingEnabled: true }, resolve);
        });
        setIsMainScrapingEnabled(true);
        console.log('✅ Main scraping enabled');

        // Get username before proceeding
        const storage = await new Promise((resolve) => {
          chrome.storage.local.get(['initialUsername'], resolve);
        });

        if (!storage.initialUsername) {
          console.log('⚠️ No username found, opening Twitter for auth...');
          chrome.tabs.create({ url: "https://x.com", active: false });
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between each
          TwitterControl.toggleProfileScraping(
            isProfileScrapingEnabled,
            setIsProfileScrapingEnabled,
            setScrapingStatus
          );
          // return;
        }

        console.log('👤 Starting scraping for:', storage.initialUsername);

        // Enable all scraping features in sequence
        const scrapingSequence = [
          {
            name: 'Liked Tweets',
            action: async () => {
              await TwitterControl.toggleLikedTweetsScraping(
                isLikedTweetsScrapingEnabled,
                setIsLikedTweetsScrapingEnabled,
                setScrapingStatus
              );
              await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay between each
            }
          },
          {
            name: 'Following',
            action: async () => {
              await TwitterControl.toggleFollowing(
                isFollowingEnabled,
                setIsFollowingEnabled
              );
              await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay between each
            }
          },
          {
            name: 'Replies',
            action: async () => {
              await TwitterControl.handleRepliesScraping(
                isRepliesScraping,
                setIsRepliesScraping
              );
              await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay between each
            }
          },
          {
            name: 'Background Tweets',
            action: async () => {
              await TwitterControl.toggleBackgroundTweetScraping(
                isBackgroundTweetScrapingEnabled,
                setIsBackgroundTweetScrapingEnabled,
                profileData
              );
              await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay between each
            }
          }
        ];

        // Execute scraping sequence with delays
        for (const scraper of scrapingSequence) {
          console.log(`🔄 Starting ${scraper.name} scraping...`);
          await scraper.action();
          await new Promise(resolve => setTimeout(resolve, 5000)); // 5s delay between each
        }

        console.log('✅ All scraping features enabled');

      } else {
        // Disable all scraping at once
        console.log('🛑 Stopping all scraping...');
        
        // Send stop message first
        chrome.runtime.sendMessage({ type: 'STOP_ALL_SCRAPING' });
        
        // Reset all states atomically
        const newStates = {
          isMainScrapingEnabled: false,
          isBackgroundTweetScrapingEnabled: false,
          isFollowingEnabled: false,
          isRepliesScrapingEnabled: false,
          isProfileScrapingEnabled: false,
          isLikedTweetsScrapingEnabled: false,
          hasScrapedProfile: false,
          hasScrapedLikes: false,
          hasScrapedFollowing: false,
          hasScrapedReplies: false,
        };

        // Update chrome storage
        await new Promise((resolve) => {
          chrome.storage.local.set(newStates, resolve);
        });

        // Update React states
        setIsMainScrapingEnabled(false);
        setIsBackgroundTweetScrapingEnabled(false);
        setIsFollowingEnabled(false);
        setIsRepliesScraping(false);
        setIsProfileScrapingEnabled(false);
        setIsLikedTweetsScrapingEnabled(false);

        // Update scraping status
        setScrapingStatus({
          hasScrapedProfile: false,
          hasScrapedLikes: false,
          hasScrapedFollowing: false,
          hasScrapedReplies: false,
          isProfileScraping: false,
          isLikedTweetsScraping: false,
        });

        console.log('✅ All scraping features disabled');
      }
    } catch (error) {
      console.error('❌ Error in toggleScraping:', error);
      
      // Reset all states on error
      setIsMainScrapingEnabled(false);
      setIsBackgroundTweetScrapingEnabled(false);
      setIsFollowingEnabled(false);
      setIsRepliesScraping(false);
      setIsProfileScrapingEnabled(false);
      setIsLikedTweetsScrapingEnabled(false);
      
      chrome.storage.local.set({
        isMainScrapingEnabled: false,
        isBackgroundTweetScrapingEnabled: false,
        isFollowingEnabled: false,
        isRepliesScrapingEnabled: false,
        isProfileScrapingEnabled: false,
        isLikedTweetsScrapingEnabled: false,
      });
    }
  };

  return (
    <div style={styles.container}>
      {/* App Bar */}
      <div style={styles.appBar}>
        <button 
          style={styles.menuButton}
          onClick={toggleMenu}
        >
          <MenuIcon size={24} strokeWidth={2} />
        </button>

        {/* Right Section with Toggle and Profile */}
        <div style={styles.rightSection}>
          <button
            style={{
              ...styles.toggleButton,
              ...(isMainScrapingEnabled && styles.toggleButtonActive)
            }}
            onClick={toggleScraping}
            title={isMainScrapingEnabled ? 'Disable Scraping' : 'Enable Scraping'}
          >
            <Power size={24} strokeWidth={2} />
          </button>

          {/* Profile Section */}
          <div style={styles.profileSection} ref={profileRef}>
            <button 
              style={styles.profileButton}
              onClick={toggleProfileMenu}
            >
              <User size={20} strokeWidth={2} />
            </button>

            {/* Profile Dropdown Menu */}
            <div 
              style={{
                ...styles.dropdownMenu,
                ...(isProfileMenuOpen && styles.dropdownMenuVisible)
              }}
            >
              <div 
                style={styles.dropdownItem}
                onClick={handleSettings}
              >
                <Settings style={styles.dropdownIcon} size={20} />
                Settings
              </div>
              <div style={styles.dropdownDivider} />
              <div 
                style={styles.dropdownItem}
                onClick={handleLogout}
              >
                <LogOut style={styles.dropdownIcon} size={20} />
                Logout
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Overlay */}
      <div 
        style={{
          ...styles.menuOverlay,
          ...(isMenuOpen && styles.menuOverlayVisible)
        }}
        onClick={toggleMenu}
      />

      {/* Side Menu */}
      <div 
        style={{
          ...styles.sideMenu,
          ...(isMenuOpen && styles.sideMenuOpen)
        }}
      >
        <button 
          style={styles.closeButton}
          onClick={toggleMenu}
        >
          <X size={24} strokeWidth={2} />
        </button>
        {/* Menu content will go here */}
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Dashboard content will go here */}
      </div>
    </div>
  );
};

export default Dashboard; 