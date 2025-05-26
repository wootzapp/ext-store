/* global chrome */
import React, { useState, useEffect } from 'react';
import { Twitter, Calendar } from 'lucide-react';
import BeaconLogo from '../assets/logo.png';

const getResponsiveStyles = (isMobile) => ({
  pageContainer: {
    padding: isMobile ? '16px' : '24px',
    color: '#FFEBC8FF',
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: 'calc(100vh - 64px)',
    width: '100%',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
    marginBottom: isMobile ? '16px' : '24px',
    background: '#141C2F',
    padding: isMobile ? '12px 16px' : '20px',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
  },
  pageTitle: {
    fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : '24px',
    color: '#FF7A00',
    margin: 0,
  },
  pageIcon: {
    color: '#FF7A00',
    minWidth: '24px',
  },
  contentCard: {
    background: '#141C2F',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    padding: isMobile ? '16px' : '24px',
    marginTop: isMobile ? '16px' : '24px',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? '12px 10px' : '16px',
    borderBottom: '1px solid rgba(255, 122, 0, 0.2)',
    width: '100%',
  },
  toggleLabel: {
    color: '#FFEBC8FF',
    fontSize: isMobile ? '14px' : '16px',
    textAlign: 'left',
    flex: 1,
    paddingRight: isMobile ? '8px' : '16px',
  },
  toggleButton: {
    width: isMobile ? '40px' : '48px',
    height: isMobile ? '20px' : '24px',
    background: '#141C2F',
    border: '1px solid #FF7A00',
    borderRadius: '12px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.3s',
    flexShrink: 0,
  },
  toggleCircle: {
    width: isMobile ? '16px' : '20px',
    height: isMobile ? '16px' : '20px',
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
    padding: isMobile ? '16px' : '24px',
    marginTop: isMobile ? '16px' : '24px',
  },
  profileInfo: {
    display: 'flex',
    gap: isMobile ? '8px' : '12px',
    marginBottom: isMobile ? '12px' : '16px',
  },
  profileImageContainer: {
    width: isMobile ? '48px' : '64px',
    flexShrink: 0,
  },
  profileImage: {
    width: isMobile ? '48px' : '64px',
    height: isMobile ? '48px' : '64px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  profileText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
  },
  profileName: {
    fontSize: isMobile ? '16px' : '20px',
    color: '#FF7A00',
    margin: 0,
    lineHeight: isMobile ? '20px' : '24px',
  },
  profileUsername: {
    fontSize: isMobile ? '12px' : '14px',
    color: '#FFEBC8FF',
    margin: 0,
    fontWeight: '200',
    lineHeight: isMobile ? '14px' : '16px',
  },
  joinDate: {
    fontSize: isMobile ? '12px' : '14px',
    color: '#FFEBC8FF',
    margin: 0,
    lineHeight: isMobile ? '14px' : '16px',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  joinDateIcon: {
    width: isMobile ? '14px' : '16px',
    height: isMobile ? '14px' : '16px',
    color: '#FFEBC8FF',
  },
  noProfile: {
    background: '#141C2F',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    padding: isMobile ? '16px' : '24px',
    marginTop: isMobile ? '16px' : '24px',
    color: '#FFEBC8FF',
    textAlign: 'center',
    fontSize: isMobile ? '14px' : '16px',
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
    padding: isMobile ? '16px' : '24px',
    maxWidth: isMobile ? '300px' : '400px',
    width: '90%',
    border: '1px solid #FFC35BFF',
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: isMobile ? '16px' : '24px',
  },
  dialogLogo: {
    width: isMobile ? '32px' : '40px',
    height: isMobile ? '32px' : '40px',
    marginRight: isMobile ? '12px' : '16px',
  },
  dialogTitle: {
    color: '#FF7A00',
    fontSize: isMobile ? '18px' : '20px',
    margin: 0,
    background: 'linear-gradient(to right, #ff4b2b, #ff8c42)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  dialogText: {
    color: '#FFEBC8FF',
    marginBottom: isMobile ? '16px' : '24px',
    fontSize: isMobile ? '14px' : '16px',
    lineHeight: '1.4',
  },
  dialogButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: isMobile ? '8px' : '12px',
  },
  dialogButtonPrimary: {
    padding: isMobile ? '6px 12px' : '8px 16px',
    background: '#ff4b2b',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontSize: isMobile ? '14px' : '16px',
    '&:hover': {
      background: '#ff3b1b',
    },
  },
  dialogButtonSecondary: {
    padding: isMobile ? '6px 12px' : '8px 16px',
    background: 'transparent',
    color: '#FFEBC8FF',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
    fontSize: isMobile ? '14px' : '16px',
    '&:hover': {
      background: 'rgba(255, 235, 200, 0.1)',
    },
  },
  statsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '8px' : '12px',
    padding: isMobile ? '12px' : '16px',
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(4px)',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    marginTop: isMobile ? '16px' : '24px',
  },
  statRow: {
    display: 'flex',
    gap: isMobile ? '8px' : '12px',
    width: '100%',
  },
  statCard: {
    flex: 1,
    padding: isMobile ? '8px' : '12px',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(4px)',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  statLabel: {
    color: '#666',
    fontSize: isMobile ? '10px' : '12px',
    marginBottom: '2px',
  },
  statValue: {
    color: '#000',
    fontSize: isMobile ? '14px' : '16px',
    fontWeight: 'bold',
  },
  loadingPlaceholder: {
    display: 'inline-block',
    width: isMobile ? '28px' : '32px',
    height: isMobile ? '14px' : '16px',
    background: '#eee',
    animation: 'pulse 1.5s infinite',
    borderRadius: '4px',
  },
});

const ToggleButton = ({ label, isActive, onToggle, isMobile }) => {
  const styles = getResponsiveStyles(isMobile);
  
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
          left: isActive ? (isMobile ? '22px' : '26px') : '1px'
        }} />
      </button>
    </div>
  );
};

const TwitterControl = () => {
  const [isMobile, setIsMobile] = useState(false);
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

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
  
  const styles = getResponsiveStyles(isMobile);

  const handlePermissionResponse = async (allowed) => {
    if (!isMainScrapingEnabled) {
      // Check for initial auth before showing permission dialog
      chrome.storage.local.get(['hasInitialAuth', 'initialUsername'], (result) => {
        if (!result.hasInitialAuth || !result.initialUsername) {
          console.log("🔄 No initial auth found, opening Twitter...");
          // Open Twitter in new tab for authentication
          chrome.tabs.create({ url: "https://x.com/" }, (tab) => {
            console.log("📱 Opened Twitter tab for initial auth:", tab.id);
          });
          return;
        }
        // If we have initial auth, show permission dialog
        setShowPermissionDialog(true);
      });
    }
    
    // chrome.tabs.create({ url: "https://x.com/login" });
    setShowPermissionDialog(false);
    
    if (allowed) {
      try {
        // First, enable the scraping
        chrome.storage.local.set({
          isMainScrapingEnabled: true,
        });
        setIsMainScrapingEnabled(true);
        
        // Get the Twitter username from storage or profile data
        const username = profileData?.username || await getTwitterUsername();
        
        if (username) {
          console.log("📝 Creating organization and deployments for:", username);
          // Create organization for this Twitter user
          const orgName = `${username}_Data_Profile`;
          const orgResponse = await createOrganizationWithDeployments(username);
          console.log("📝 Organization created:", orgResponse);
        } else {
          console.error("❌ No Twitter username available to create organization");
        }
      } catch (error) {
        console.error("❌ Error creating organization and deployments:", error);
      }
    }
  };

  const toggleMainScraping = async () => {
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

  // Helper function to get Twitter username if not in profileData
  const getTwitterUsername = async () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(["initialUsername"], (result) => {
        resolve(result.initialUsername || null);
      });
    });
  };

  // Function to create organization and deployments
  const createOrganizationWithDeployments = async (username) => {
    try {
      console.log("🏗️ Starting organization and deployment creation for:", username);
      
      // Import APIs (assuming they are not already imported in this file)
      const { createOrganization, getOrganizations } = await import('../api/OrganizationAPI');
      const DeploymentsAPI = (await import('../api/DeploymentsAPI')).default;
      
      console.log("📚 Successfully imported API modules");
      
      // 1. Create the organization
      const orgName = `${username}_Data_Profile`;
      console.log("🔄 Creating organization with name:", orgName);
      const orgResponse = await createOrganization(orgName);
      const organizationId = orgResponse.data.id;
      console.log("✅ Organization created successfully:", organizationId);
      
      // 2. Create a single deployment with the requested structure
      const deploymentName = `${username}_TwitterData`;
      console.log(`🔄 Preparing deployment "${deploymentName}"...`);
      
      // Create dummy data structure
      const dummyData = {
        username: "Aaditesh2307",
        Profile: {
          Likes: 18,
          Following: 20,
          Followers: 20
        }
      };
      
      // Convert dummy data to fields format
      const fields = [
        { name: "username" },
        { name: "Profile_Likes" },
        { name: "Profile_Following" },
        { name: "Profile_Followers" }
      ];
      
      // Create sample private fields
      const privateFields = [
        { name: "twitter_user_id" },
        { name: "account_creation_date" }
      ];
      
      // Create deployment config
      const config = {
        user_field: "twitter_user_id", // First private field is user field
        fields: fields,
        private_fields: privateFields
      };
      
      console.log(`📝 Config for "${deploymentName}":`, {
        fields: fields.map(f => f.name),
        privateFields: privateFields.map(f => f.name),
        userField: config.user_field,
        dummyData: dummyData
      });
      
      console.log(`🚀 Initiating deployment creation for "${deploymentName}"...`);
      const deploymentResult = await DeploymentsAPI.createDeployment(organizationId, deploymentName, config);
      console.log(`✅ Deployment "${deploymentName}" created successfully:`, deploymentResult.data?.id || "No ID returned");
      
      console.log("🎉 Organization and deployment created successfully!");
      
      return {
        organization: orgResponse,
        deployment: deploymentResult
      };
    } catch (error) {
      console.error("❌ Error in createOrganizationWithDeployments:", error);
      console.error("📋 Error details:", error.message);
      console.error("🔍 Stack trace:", error.stack);
      throw error;
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <Twitter style={styles.pageIcon} size={isMobile ? 20 : 24} />
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
            <Calendar style={styles.joinDateIcon} size={isMobile ? 14 : 16} />
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
          isMobile={isMobile}
        />
        <ToggleButton 
          label="Profile Scraping"
          isActive={isProfileScrapingEnabled}
          onToggle={toggleProfileScraping}
          isMobile={isMobile}
        />
        <ToggleButton 
          label="Likes Scraping"
          isActive={isLikedTweetsScrapingEnabled}
          onToggle={toggleLikedTweetsScraping}
          isMobile={isMobile}
        />
        <ToggleButton 
          label="Tweet Scraping"
          isActive={isBackgroundTweetScrapingEnabled}
          onToggle={toggleBackgroundTweetScraping}
          isMobile={isMobile}
        />
        <ToggleButton 
          label="Following Scraping"
          isActive={isFollowingEnabled}
          onToggle={toggleFollowing}
          isMobile={isMobile}
        />
        <ToggleButton 
          label="Posts Scraping"
          isActive={isRepliesScraping}
          onToggle={handleRepliesScraping}
          isMobile={isMobile}
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
