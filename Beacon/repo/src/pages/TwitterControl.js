/* global chrome */
import React, { useState, useEffect } from 'react';
import { Twitter, Calendar } from 'lucide-react';
import BeaconLogo from '../assets/logo.png';

const styles = {
  pageContainer: {
    padding: '24px',
    color: '#FFEBC8FF',
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: 'calc(100vh - 64px)',
    width: '100%',
    boxSizing: 'border-box',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    background: '#141C2F',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
  },
  pageTitle: {
    fontSize: '24px',
    color: '#FF7A00',
    margin: 0,
  },
  pageIcon: {
    color: '#FF7A00',
  },
  contentCard: {
    background: '#141C2F',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    padding: '24px',
    marginTop: '24px',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid rgba(255, 122, 0, 0.2)',
    width: '100%',
  },
  toggleLabel: {
    color: '#FFEBC8FF',
    fontSize: '16px',
    textAlign: 'left',
    flex: 1,
    paddingRight: '16px',
  },
  toggleButton: {
    width: '48px',
    height: '24px',
    background: '#141C2F',
    border: '1px solid #FF7A00',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.3s',
    flexShrink: 0,
  },
  toggleCircle: {
    width: '20px',
    height: '20px',
    background: '#FFEBC8FF',
    borderRadius: '50%',
    position: 'absolute',
    top: '1px',
    left: '1px',
    transition: 'left 0.3s',
  },
  profileSection: {
    background: '#141C2F',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    padding: '24px',
    marginTop: '24px',
  },
  profileInfo: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  profileImageContainer: {
    width: '64px',
    flexShrink: 0,
  },
  profileImage: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  profileName: {
    fontSize: '20px',
    color: '#FF7A00',
    margin: 0,
    lineHeight: '24px',
  },
  profileUsername: {
    fontSize: '14px',
    color: '#FFEBC8FF',
    margin: 0,
    fontWeight: '200',
    lineHeight: '16px',
  },
  joinDate: {
    fontSize: '14px',
    color: '#FFEBC8FF',
    margin: 0,
    lineHeight: '16px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  joinDateIcon: {
    width: '16px',
    height: '16px',
    color: '#FFEBC8FF',
  },
  noProfile: {
    background: '#141C2F',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    padding: '24px',
    marginTop: '24px',
    color: '#FFEBC8FF',
    textAlign: 'center',
  },
  dialogOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
    backdropFilter: 'blur(4px)',
  },
  dialogContent: {
    background: '#141C2F',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    border: '1px solid #FFC35BFF',
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '24px',
  },
  dialogLogo: {
    width: '40px',
    height: '40px',
    marginRight: '16px',
  },
  dialogTitle: {
    color: '#FF7A00',
    fontSize: '20px',
    margin: 0,
    background: 'linear-gradient(to right, #ff4b2b, #ff8c42)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  dialogText: {
    color: '#FFEBC8FF',
    marginBottom: '24px',
  },
  dialogButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  dialogButtonPrimary: {
    padding: '8px 16px',
    background: '#ff4b2b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    '&:hover': {
      background: '#ff3b1b',
    },
  },
  dialogButtonSecondary: {
    padding: '8px 16px',
    background: 'transparent',
    color: '#FFEBC8FF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    '&:hover': {
      background: 'rgba(255, 235, 200, 0.1)',
    },
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(4px)',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    marginTop: '24px',
  },
  statRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  statCard: {
    flex: 1,
    padding: '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(4px)',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  statLabel: {
    color: '#666',
    fontSize: '12px',
    marginBottom: '2px',
  },
  statValue: {
    color: '#000',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  loadingPlaceholder: {
    display: 'inline-block',
    width: '32px',
    height: '16px',
    background: '#eee',
    animation: 'pulse 1.5s infinite',
    borderRadius: '4px',
  },
};

const ToggleButton = ({ label, isActive, onToggle }) => {
  return (
    <div style={styles.toggleContainer}>
      <span style={styles.toggleLabel}>{label}</span>
      <button 
        style={{
          ...styles.toggleButton,
          background: isActive ? '#FF7A00' : '#141C2F'
        }}
        onClick={onToggle}
      >
        <div style={{
          ...styles.toggleCircle,
          left: isActive ? '26px' : '1px'
        }} />
      </button>
    </div>
  );
};

const TwitterControl = () => {
  const [isFollowingEnabled, setIsFollowingEnabled] = useState(false);
  const [isProfileScrapingEnabled, setIsProfileScrapingEnabled] = useState(false);
  const [isLikedTweetsScrapingEnabled, setIsLikedTweetsScrapingEnabled] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState({
    hasScrapedProfile: false,
    hasScrapedLikes: false,
    hasScrapedFollowing: false,
    hasScrapedReplies: false,
    isProfileScraping: false,
    isLikedTweetsScraping: false,
  });
  const [profileData, setProfileData] = useState(null);
  const [isMainScrapingEnabled, setIsMainScrapingEnabled] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [isBackgroundTweetScrapingEnabled, setIsBackgroundTweetScrapingEnabled] = useState(false);
  const [isRepliesScraping, setIsRepliesScraping] = useState(false);
  const [likedTweets, setLikedTweets] = useState([]);
  const [postedTweets, setPostedTweets] = useState([]);
  const [userReplies, setUserReplies] = useState([]);
  const [retweetedTweets, setRetweetedTweets] = useState([]);

  useEffect(() => {
    chrome.storage.local.get([
      "isMainScrapingEnabled",
      "isBackgroundTweetScrapingEnabled",
      "hasScrapedProfile",
      "hasScrapedLikes",
      "hasScrapedFollowing",
      "hasScrapedReplies",
      "profileData",
      "isFollowingEnabled",
      "isRepliesScrapingEnabled",
      "isProfileScrapingEnabled", 
      "isLikedTweetsScrapingEnabled",
      "likedTweets",
      "postedTweets",
      "userReplies",
      "retweetedTweets"
    ], (result) => {
      console.log("📊 Loading initial states:", result);
      setIsMainScrapingEnabled(result.isMainScrapingEnabled ?? false);
      setIsBackgroundTweetScrapingEnabled(result.isBackgroundTweetScrapingEnabled ?? false);
      setIsFollowingEnabled(result.isFollowingEnabled ?? false);
      setIsRepliesScraping(result.isRepliesScrapingEnabled || false);
      setIsProfileScrapingEnabled(result.isProfileScrapingEnabled ?? false);
      setIsLikedTweetsScrapingEnabled(result.isLikedTweetsScrapingEnabled ?? false);
      setLikedTweets(result.likedTweets || []);
      setPostedTweets(result.postedTweets || []);
      setUserReplies(result.userReplies || []);
      setRetweetedTweets(result.retweetedTweets || []);

      setScrapingStatus({
        hasScrapedProfile: result.hasScrapedProfile || false,
        hasScrapedLikes: result.hasScrapedLikes || false,
        hasScrapedFollowing: result.hasScrapedFollowing || false,
        hasScrapedReplies: result.hasScrapedReplies || false,
        isProfileScraping: result.isProfileScrapingEnabled || false,
        isLikedTweetsScraping: result.isLikedTweetsScrapingEnabled || false,
      });
      setProfileData(result.profileData || null);
    });

    const handleStorageChange = (changes) => {
      console.log("💾 Storage changes detected:", changes);

      if (changes.isMainScrapingEnabled) {
        setIsMainScrapingEnabled(changes.isMainScrapingEnabled.newValue);
      }
      if (changes.isBackgroundTweetScrapingEnabled) {
        setIsBackgroundTweetScrapingEnabled(
          changes.isBackgroundTweetScrapingEnabled.newValue
        );
      }
      if (changes.isFollowingEnabled) {
        setIsFollowingEnabled(changes.isFollowingEnabled.newValue);
      }
      if (changes.isProfileScrapingEnabled) {
        setIsProfileScrapingEnabled(changes.isProfileScrapingEnabled.newValue);
      }
      if (changes.isLikedTweetsScrapingEnabled) {
        setIsLikedTweetsScrapingEnabled(
          changes.isLikedTweetsScrapingEnabled.newValue
        );
      }
      if (changes.likedTweets) {
        setLikedTweets(changes.likedTweets.newValue || []);
      }
      if (changes.postedTweets) {
        setPostedTweets(changes.postedTweets.newValue || []);
      }
      if (changes.userReplies) {
        setUserReplies(changes.userReplies.newValue || []);
      }
      if (changes.retweetedTweets) {
        setRetweetedTweets(changes.retweetedTweets.newValue || []);
      }
      if (
        changes.hasScrapedProfile ||
        changes.hasScrapedLikes ||
        changes.hasScrapedFollowing ||
        changes.hasScrapedReplies
      ) {
        setScrapingStatus((prev) => ({
          ...prev,
          hasScrapedProfile:
            changes.hasScrapedProfile?.newValue ?? prev.hasScrapedProfile,
          hasScrapedLikes:
            changes.hasScrapedLikes?.newValue ?? prev.hasScrapedLikes,
          hasScrapedFollowing:
            changes.hasScrapedFollowing?.newValue ?? prev.hasScrapedFollowing,
          hasScrapedReplies:
            changes.hasScrapedReplies?.newValue ?? prev.hasScrapedReplies,
          isProfileScraping:
            changes.isProfileScrapingEnabled?.newValue ??
            prev.isProfileScraping,
          isLikedTweetsScraping:
            changes.isLikedTweetsScrapingEnabled?.newValue ??
            prev.isLikedTweetsScraping,
        }));
      }
      if (changes.profileData) {
        setProfileData(changes.profileData.newValue);
      }
    };

    const handleMessages = (message) => {
      if (message.type === "TWEET_LIMIT_REACHED") {
        console.log("📊 Tweet limit reached:", message.data);
        setIsBackgroundTweetScrapingEnabled(false);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.runtime.onMessage.addListener(handleMessages);
    
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleMessages);
    };
  }, []);

  const handlePermissionResponse = (allowed) => {
    setShowPermissionDialog(false);
    if (allowed) {
      chrome.storage.local.set({
        isMainScrapingEnabled: true,
      });
      setIsMainScrapingEnabled(true);
    }
  };

  const toggleMainScraping = () => {
    const newState = !isMainScrapingEnabled;
    
    if (newState) {
      setShowPermissionDialog(true);
      return;
    }
    
    setIsMainScrapingEnabled(newState);
    
    if (!newState) {
      chrome.storage.local.set(
        {
          isMainScrapingEnabled: false,
          isBackgroundTweetScrapingEnabled: false,
          isFollowingEnabled: false,
          isRepliesScrapingEnabled: false,
          isProfileScrapingEnabled: false,
          isLikedTweetsScrapingEnabled: false,
        },
        () => {
          chrome.runtime.sendMessage({
            type: "STOP_ALL_SCRAPING",
          });

          setIsMainScrapingEnabled(false);
          setIsBackgroundTweetScrapingEnabled(false);
          setIsFollowingEnabled(false);
          setIsRepliesScraping(false);
          setIsProfileScrapingEnabled(false);
          setIsLikedTweetsScrapingEnabled(false);

          setScrapingStatus((prev) => ({
            ...prev,
            hasScrapedProfile: false,
            hasScrapedLikes: false,
            hasScrapedFollowing: false,
            hasScrapedReplies: false,
            isProfileScraping: false,
            isLikedTweetsScraping: false,
          }));
        }
      );
    }
  };

  const toggleFollowing = () => {
    const newState = !isFollowingEnabled;
    setIsFollowingEnabled(newState);

    if (newState) {
      chrome.storage.local.get(["initialUsername"], (result) => {
        if (result.initialUsername) {
          console.log("🔄 Requesting following scrape for:", result.initialUsername);
          chrome.runtime.sendMessage({
            type: "START_FOLLOWING_SCRAPE",
            username: result.initialUsername,
            enabled: newState,
          });
        } else {
          console.error("No username found for following scrape");
          setIsFollowingEnabled(false);
        }
      });
    }

    chrome.storage.local.set({
      isFollowingEnabled: newState,
    });
  };

  const toggleBackgroundTweetScraping = () => {
    const newState = !isBackgroundTweetScrapingEnabled;
    console.log("🔄 Toggling background tweet scraping to:", newState);

    setIsBackgroundTweetScrapingEnabled(newState);
    chrome.storage.local.set({
      isBackgroundTweetScrapingEnabled: newState,
    });
    
    if (newState) {
      chrome.runtime.sendMessage({
        type: "TOGGLE_BACKGROUND_TWEET_SCRAPING",
        username: profileData?.username,
        enabled: newState,
      });
    }
  };

  const toggleProfileScraping = () => {
    const newState = !isProfileScrapingEnabled;
    console.log("🔄 Toggling profile scraping to:", newState);

    setIsProfileScrapingEnabled(newState);
    if(newState) {
      setScrapingStatus((prev) => ({
        ...prev,
        isProfileScraping: newState,
        hasScrapedProfile: false,
        hasScrapedLikes: false
      }));
      chrome.storage.local.set({
        isProfileScrapingEnabled: newState,
        isProfileVisitScrapingEnabled: newState,
        hasScrapedProfile: false,
        hasScrapedLikes: false
      });
      chrome.runtime.sendMessage({
        type: "TOGGLE_PROFILE_SCRAPING",
        enabled: newState,
      });
    } else {
      setScrapingStatus((prev) => ({
        ...prev,
        isProfileScraping: newState,
      }));
      chrome.storage.local.set({
        isProfileScrapingEnabled: newState,
        isProfileVisitScrapingEnabled: newState,
      });
      chrome.tabs.query({ url: "*://*.x.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs
            .sendMessage(tab.id, {
              type: "STOP_PROFILE_VISIT_SCRAPING",
            })
            .catch((error) => {
              console.log("Tab might not be ready:", error);
            });
        });
      });
    }
  };

  const toggleLikedTweetsScraping = () => {
    const newState = !isLikedTweetsScrapingEnabled;
    console.log("🔄 Toggling liked tweets scraping to:", newState);

    setIsLikedTweetsScrapingEnabled(newState);
    if(newState) {
      setScrapingStatus((prev) => ({
        ...prev,
        isLikedTweetsScraping: newState,
        hasScrapedLikes: false,
      }));

      chrome.storage.local.set({
        isLikedTweetsScrapingEnabled: newState,
        hasScrapedLikes: false,
      });
      chrome.runtime.sendMessage({
        type: "START_LIKED_TWEETS_SCRAPING",
        enabled: newState,
      });
    } else {
      setScrapingStatus((prev) => ({
        ...prev,
        isLikedTweetsScraping: newState,
      }));

      chrome.storage.local.set({
        isLikedTweetsScrapingEnabled: newState,
      });
    }
  };

  const handleRepliesScraping = () => {
    const newState = !isRepliesScraping;
    if (newState) {
      chrome.storage.local.get(["initialUsername"], (result) => {
        if (result.initialUsername) {
          console.log(
            "🔄 Requesting Posts and Replies scrape for:",
            result.initialUsername
          );
          chrome.runtime.sendMessage({
            type: "TOGGLE_REPLIES_SCRAPING",
            username: result.initialUsername,
            enabled: newState,
          });
        } else {
          console.error("No username found for Posts and Replies scrape");
          setIsRepliesScraping(false);
        }
      });
    }
    chrome.storage.local.set({
      isRepliesScrapingEnabled: newState,
    });
    setIsRepliesScraping(newState);
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <Twitter style={styles.pageIcon} size={24} />
        <h1 style={styles.pageTitle}>Twitter Control</h1>
      </div>

      {profileData ? (
        <div style={styles.profileSection}>
          <div style={styles.profileInfo}>
            <div style={styles.profileImageContainer}>
              <img 
                src={profileData.profileImageUrl} 
                alt="Profile"
                style={styles.profileImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/default-avatar.png";
                }}
              />
            </div>
            <div style={styles.profileText}>
              <h2 style={styles.profileName}>{profileData.userhandle}</h2>
              <p style={styles.profileUsername}>@{profileData.username}</p>
            </div>
          </div>
          <p style={styles.joinDate}>
            <Calendar style={styles.joinDateIcon} size={16} />
            <span>Joined {profileData.joinedDate}</span>
          </p>
        </div>
      ) : (
        <div style={styles.noProfile}>
          <p style={{ margin: 0 }}>No profile data collected yet!</p>
        </div>
      )}

      <div style={styles.contentCard}>
        <ToggleButton 
          label="Scrap Twitter"
          isActive={isMainScrapingEnabled}
          onToggle={toggleMainScraping}
        />
        <ToggleButton 
          label="Profile Scraping"
          isActive={isProfileScrapingEnabled}
          onToggle={toggleProfileScraping}
        />
        <ToggleButton 
          label="Likes Scraping"
          isActive={isLikedTweetsScrapingEnabled}
          onToggle={toggleLikedTweetsScraping}
        />
        <ToggleButton 
          label="Tweet Scraping"
          isActive={isBackgroundTweetScrapingEnabled}
          onToggle={toggleBackgroundTweetScraping}
        />
        <ToggleButton 
          label="Following Scraping"
          isActive={isFollowingEnabled}
          onToggle={toggleFollowing}
        />
        <ToggleButton 
          label="Posts Scraping"
          isActive={isRepliesScraping}
          onToggle={handleRepliesScraping}
        />
      </div>  

      <div style={styles.statsGrid}>
        <div style={styles.statRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Followers</p>
            <p style={styles.statValue}>
              {profileData?.followers !== undefined || isProfileScrapingEnabled ? (
                profileData?.followers
              ) : (
                <span style={styles.loadingPlaceholder}></span>
              )}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Following</p>
            <p style={styles.statValue}>
              {profileData?.following !== undefined || isProfileScrapingEnabled ? (
                profileData?.following
              ) : (
                <span style={styles.loadingPlaceholder}></span>
              )}
            </p>
          </div>
        </div>

        <div style={styles.statRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Likes</p>
            <p style={styles.statValue}>
              {likedTweets.length !== 0 || isLikedTweetsScrapingEnabled ? (
                likedTweets.length
              ) : (
                <span style={styles.loadingPlaceholder}></span>
              )}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Posts</p>
            <p style={styles.statValue}>
              {postedTweets.length !== 0 || isRepliesScraping ? (
                postedTweets.length
              ) : (
                <span style={styles.loadingPlaceholder}></span>
              )}
            </p>
          </div>
        </div>

        <div style={styles.statRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Replies</p>
            <p style={styles.statValue}>
              {userReplies.length !== 0 || isRepliesScraping ? (
                userReplies.length
              ) : (
                <span style={styles.loadingPlaceholder}></span>
              )}
            </p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Retweets</p>
            <p style={styles.statValue}>
              {retweetedTweets.length !== 0 || isRepliesScraping ? (
                retweetedTweets.length
              ) : (
                <span style={styles.loadingPlaceholder}></span>
              )}
            </p>
          </div>
        </div>
      </div>

      {showPermissionDialog && (
        <div style={styles.dialogOverlay}>
          <div style={styles.dialogContent}>
            <div style={styles.dialogHeader}>
              <img
                src="/logo.png"
                alt="Beacon Logo"
                style={styles.dialogLogo}
              />
              <h3 style={styles.dialogTitle}>Permission Required</h3>
            </div>

            <p style={styles.dialogText}>
              WootzApp is requesting permission to access Twitter with Beacon
              Network. This will allow the application to scrape profile data,
              likes, following, and posts and replies information.
            </p>

            <div style={styles.dialogButtons}>
              <button
                onClick={() => handlePermissionResponse(false)}
                style={styles.dialogButtonSecondary}
              >
                Deny
              </button>
              <button
                onClick={() => handlePermissionResponse(true)}
                style={styles.dialogButtonPrimary}
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
