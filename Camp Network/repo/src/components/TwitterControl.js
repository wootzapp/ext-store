/* global chrome */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SyncToggleButton from "../helper/syncButton";

const LoadingSpinner = () => (
  <div className="inline-block w-4 h-4 relative">
    <div
      className="w-full h-full rounded-full animate-spin"
      style={{
        border: "2px solid transparent",
        borderTopColor: "#ff8c42",
        borderLeftColor: "rgba(255, 140, 66, 0.6)", // 60% opacity
        borderBottomColor: "rgba(255, 140, 66, 0.3)", // 30% opacity
        borderRightColor: "transparent", // fully transparent
      }}
    ></div>
  </div>
);

const TwitterControl = () => {
  const navigate = useNavigate();
  const [isFollowingEnabled, setIsFollowingEnabled] = useState(false);
  const [isProfileScrapingEnabled, setIsProfileScrapingEnabled] =
    useState(false);
  const [isLikedTweetsScrapingEnabled, setIsLikedTweetsScrapingEnabled] =
    useState(false);
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
  const [
    isBackgroundTweetScrapingEnabled,
    setIsBackgroundTweetScrapingEnabled,
  ] = useState(false);
  const [isRepliesScraping, setIsRepliesScraping] = useState(false);
  const [likedTweets, setLikedTweets] = useState([]);
  const [postedTweets, setPostedTweets] = useState([]);
  const [userReplies, setUserReplies] = useState([]);
  const [retweetedTweets, setRetweetedTweets] = useState([]);

  useEffect(() => {
    // Get initial states
    chrome.storage.local.get(
      [
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
      ],
      (result) => {
        console.log("📊 Loading initial states:", result);
        setIsMainScrapingEnabled(result.isMainScrapingEnabled ?? false);
        setIsBackgroundTweetScrapingEnabled(
          result.isBackgroundTweetScrapingEnabled ?? false
        );
        setIsFollowingEnabled(result.isFollowingEnabled ?? false);
        setIsRepliesScraping(result.isRepliesScrapingEnabled || false);
        setIsProfileScrapingEnabled(result.isProfileScrapingEnabled ?? false);
        setIsLikedTweetsScrapingEnabled(
          result.isLikedTweetsScrapingEnabled ?? false
        );
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
      }
    );

    // Listen for scraping status updates
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

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const toggleFollowing = () => {
    const newState = !isFollowingEnabled;
    setIsFollowingEnabled(newState);

    if (newState) {
      // Get initial username from storage instead of relying on profileData
      chrome.storage.local.get(["initialUsername"], (result) => {
        if (result.initialUsername) {
          console.log(
            "🔄 Requesting following scrape for:",
            result.initialUsername
          );
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

    // Save the following state
    chrome.storage.local.set({
      isFollowingEnabled: newState,
    });
  };

  const toggleBackgroundTweetScraping = () => {
    const newState = !isBackgroundTweetScrapingEnabled;
    console.log("🔄 Toggling background tweet scraping to:", newState);

    if (newState) {
      chrome.runtime.sendMessage({
        type: "TOGGLE_BACKGROUND_TWEET_SCRAPING",
        username: profileData?.username,
        enabled: newState,
      });
    } else {
      chrome.runtime.sendMessage({
        type: "STOP_BACKGROUND_TWEET_SCRAPING",
      });
    }

    setIsBackgroundTweetScrapingEnabled(newState);
    chrome.storage.local.set({
      isBackgroundTweetScrapingEnabled: newState,
    });
  };

  const toggleProfileScraping = () => {
    const newState = !isProfileScrapingEnabled;
    console.log("🔄 Toggling profile scraping to:", newState);

    setIsProfileScrapingEnabled(newState);
    if(newState){
      setProfileData(null);
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
    } 
    else{
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
    if(newState){
      setLikedTweets([]);
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
    }
    else{
      setScrapingStatus((prev) => ({
        ...prev,
        isLikedTweetsScraping: newState,
      }));

      chrome.storage.local.set({
        isLikedTweetsScrapingEnabled: newState,
      });
    }
  };

  const handlePermissionResponse = (accepted) => {
    setShowPermissionDialog(false);

    if (accepted) {
      chrome.storage.local.set({
        isMainScrapingEnabled: true,
      });
      setIsMainScrapingEnabled(true);
    } else {
      // When denying or turning off main scraping, disable all toggles
      chrome.storage.local.set({
        isMainScrapingEnabled: false,
        isProfileScrapingEnabled: false,
        isBackgroundTweetScrapingEnabled: false,
        isFollowingEnabled: false,
        isRepliesScrapingEnabled: false,
        isLikedTweetsScrapingEnabled: false
      });
      setIsMainScrapingEnabled(false);
      setIsProfileScrapingEnabled(false);
      setIsBackgroundTweetScrapingEnabled(false);
      setIsFollowingEnabled(false);
      setIsRepliesScraping(false);
      setIsLikedTweetsScrapingEnabled(false);

      chrome.runtime.sendMessage({
        type: "STOP_ALL_SCRAPING",
      });
    }
  };

  const toggleMainScraping = () => {
    if (!isMainScrapingEnabled) {
      // Check for initial auth before showing permission dialog
      chrome.storage.local.get(['hasInitialAuth', 'initialUsername'], (result) => {
        if (!result.hasInitialAuth || !result.initialUsername) {
          console.log("🔄 No initial auth found, opening Twitter...");
          // Open Twitter in new tab for authentication
          chrome.tabs.create({ url: "https://x.com" }, (tab) => {
            console.log("📱 Opened Twitter tab for initial auth:", tab.id);
          });
          return;
        }
        // If we have initial auth, show permission dialog
        setShowPermissionDialog(true);
      });
    } else {
      // When turning off main scraping, disable all other toggles first
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
          // Stop all active scraping processes
          chrome.runtime.sendMessage({
            type: "STOP_ALL_SCRAPING",
          });

          // Update local state
          setIsMainScrapingEnabled(false);
          setIsBackgroundTweetScrapingEnabled(false);
          setIsFollowingEnabled(false);
          setIsRepliesScraping(false);
          setIsProfileScrapingEnabled(false);
          setIsLikedTweetsScrapingEnabled(false);

          // Update scraping status
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

  const handleRepliesScraping = () => {
    const newState = !isRepliesScraping;
    console.log("🔄 Toggling replies scraping:", newState);
    
    // First update local state
    setIsRepliesScraping(newState);
    
    // Then update storage and trigger scraping
    chrome.storage.local.set({
        isRepliesScrapingEnabled: newState,
        hasScrapedReplies: false // Reset the completion flag
    }, () => {
        if (newState) {
            setPostedTweets([]);
            setRetweetedTweets([]);
            setUserReplies([]);
            chrome.storage.local.get(["initialUsername"], (result) => {
                if (result.initialUsername) {
                    console.log("🔄 Starting Posts and Replies scrape for:", result.initialUsername);
                    chrome.runtime.sendMessage({
                        type: "TOGGLE_REPLIES_SCRAPING",
                        username: result.initialUsername,
                        enabled: newState,
                    });
                } else {
                    console.error("No username found for Posts and Replies scrape");
                    setIsRepliesScraping(false);
                    chrome.storage.local.set({ isRepliesScrapingEnabled: false });
                }
            });
        } else {
            // Stop scraping when disabled
            chrome.runtime.sendMessage({
                type: "STOP_REPLIES_SCRAPING"
            });
        }
    });
  };

  return (
    <div className="fixed inset-0 px-4 w-full" style={{ backgroundImage: `url('/wood.jpg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundAttachment: 'fixed' }}>
      <div className="max-w-3xl mb-4 mx-auto h-screen py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="bg-white/65 backdrop-blur-sm rounded-2xl shadow-lg px-5 pb-5 border border-black w-full mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between relative mb-2 mt-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center py-2 text-gray-700 hover:text-gray-900 transition-all duration-300 z-10"
            >
              <span className="text-2xl font-bold mr-1 text-orange-500" style={{ transform: 'rotate(-45deg)' }}>⇱</span>
            </button>
            <h2 className="absolute left-1/2 -translate-x-1/2 text-2xl font-bold text-gray-800 w-full text-center">
              Twitter Scraping
            </h2>
            <div className="w-8 z-10"></div> {/* Spacer div with z-index to ensure clickability */}
          </div>

          {/* Profile Data Section */}
          {profileData ? (
            <div className="mb-4 p-3 border border-black rounded-xl bg-white/25 backdrop-blur-sm shadow">
              <div className="flex items-center gap-4 mb-4">
                {/* Profile Picture */}
                <div className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                  {profileData.profileImageUrl ? (
                    <img
                      src={profileData.profileImageUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200">@</div>
                  )}
                </div>

                {/* Name and Username */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.userhandle}
                  </h1>
                  <p className="text-gray-600">@{profileData.username}</p>
                </div>
              </div>

              {/* Joined Date */}
              <div className="flex items-center justify-start text-gray-600 mb-1">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" />
                </svg>
                <span>Joined {profileData.joinedDate}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white/25 backdrop-blur-sm rounded-lg shadow border border-black mb-4">
              <p className="text-gray-500">
                No profile data collected yet!
              </p>
            </div>
          )}

          {/* Toggles Section */}
          <div className="bg-white/25 backdrop-blur-sm rounded-2xl shadow-lg px-1 pt-4 pb-1.5 border border-black w-full mb-4">
            <div className="flex flex-col items-center space-y-2 mb-4 w-full">
              {/* Main Scraping Toggle */}
              <SyncToggleButton
                isEnabled={isMainScrapingEnabled}
                onClick={toggleMainScraping}
                label="Scrap Twitter"
                status={isMainScrapingEnabled}
                customColors={{
                  toggle: 'bg-[#ff8c42]'
                }}
              />

              {/* Profile & Likes Toggle */}
              <SyncToggleButton
                isEnabled={isProfileScrapingEnabled}
                onClick={toggleProfileScraping}
                disabled={!isMainScrapingEnabled}
                label="Profile Scraping"
                status={scrapingStatus.hasScrapedProfile}
                customColors={{
                  toggle: 'bg-[#00B59AFF]'
                }}
              />

              {/* Liked Tweets Toggle */}
              <SyncToggleButton
                isEnabled={isLikedTweetsScrapingEnabled}
                onClick={toggleLikedTweetsScraping}
                disabled={!isMainScrapingEnabled}
                label="Likes Scraping"
                status={scrapingStatus.hasScrapedLikes}
                customColors={{
                  toggle: 'bg-[#00B59AFF]'
                }}
              />

              {/* Background Tweet Toggle */}
              <SyncToggleButton
                isEnabled={isBackgroundTweetScrapingEnabled}
                onClick={toggleBackgroundTweetScraping}
                disabled={!isMainScrapingEnabled}
                label="Tweet Scraping"
                status={isBackgroundTweetScrapingEnabled}
                customColors={{
                  toggle: 'bg-[#00B59AFF]'
                }}
              />

              {/* Following Toggle */}
              <SyncToggleButton
                isEnabled={isFollowingEnabled}
                onClick={toggleFollowing}
                disabled={!isMainScrapingEnabled}
                label="Following Scraping"
                status={scrapingStatus.hasScrapedFollowing}
                customColors={{
                  toggle: 'bg-[#00B59AFF]'
                }}
              />

              {/* Posts and Replies Toggle */}
              <SyncToggleButton
                isEnabled={isRepliesScraping}
                onClick={handleRepliesScraping}
                disabled={!isMainScrapingEnabled}
                label="Posts Scraping"
                status={scrapingStatus.hasScrapedReplies}
                customColors={{
                  toggle: 'bg-[#00B59AFF]'
                }}
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="px-3 pt-4 border border-black rounded-xl bg-white/25 backdrop-blur-sm shadow">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm mb-1">Followers</p>
                <p className="text-xl font-bold text-gray-900">
                  {profileData?.followers !== undefined || isProfileScrapingEnabled ? (
                    profileData?.followers
                  ) : (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  )}
                </p>
              </div>
              <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm mb-1">Following</p>
                <p className="text-xl font-bold text-gray-900">
                  {profileData?.following !== undefined || isProfileScrapingEnabled ? (
                    profileData?.following
                  ) : (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  )}
                </p>
              </div>
              <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm mb-1">Likes</p>
                <p className="text-xl font-bold text-gray-900">
                  {likedTweets.length !== 0 ? (
                    likedTweets.length
                  ) : (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  )}
                </p>
              </div>
              <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm mb-1">Posts</p>
                <p className="text-xl font-bold text-gray-900">
                  {scrapingStatus.hasScrapedReplies ? (
                    postedTweets.length
                  ) : (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  )}
                </p>
              </div>
              <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm mb-1">Replies</p>
                <p className="text-xl font-bold text-gray-900">
                  {scrapingStatus.hasScrapedReplies ? (
                    userReplies.length
                  ) : (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  )}
                </p>
              </div>
              <div className="px-4 py-2 bg-gray-50/90 backdrop-blur-sm rounded-lg border border-gray-300">
                <p className="text-gray-500 text-sm mb-1">Retweets</p>
                <p className="text-xl font-bold text-gray-900">
                  {scrapingStatus.hasScrapedReplies ? (
                    retweetedTweets.length
                  ) : (
                    <span className="inline-block w-8 h-4 bg-gray-200 animate-pulse rounded"></span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all">
            <div className="flex items-center mb-6">
              <img
                src="/icons/icon128.png"
                alt="Camp Logo"
                className="w-10 h-10 mr-4"
              />
              <h3 className="text-xl font-bold bg-gradient-to-r from-[#ff4b2b] to-[#ff8c42] text-transparent bg-clip-text">
                Permission Required
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              WootzApp is requesting permission to access Twitter with Camp
              Network. This will allow the application to scrape profile data,
              likes, following, and posts and replies information.
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
                className="px-4 py-2 bg-[#ff4b2b] text-white rounded-lg hover:bg-[#ff3b1b] transition-colors duration-200"
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
