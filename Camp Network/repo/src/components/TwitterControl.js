/* global chrome */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
      setShowPermissionDialog(true);
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
    if (newState) {
      // Get initial username from storage instead of relying on profileData
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
    // Save the replies scraping state
    chrome.storage.local.set({
      isRepliesScrapingEnabled: newState,
    });
    setIsRepliesScraping(newState);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4"
      style={{
        backgroundImage: `url('/wood.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
            Twitter Scraping Control
          </h1>

          {/* Status Card */}
          <div className="w-full bg-red-50 rounded-lg p-2 mb-3 border border-red-100 shadow-sm">
            <div className="text-center text-sm">
              <p className="flex justify-between items-center mb-1">
                <span>Profile Data:</span>
                <span>
                  {scrapingStatus.hasScrapedProfile ? (
                    "✅"
                  ) : isProfileScrapingEnabled ? (
                    <LoadingSpinner />
                  ) : (
                    "❌"
                  )}
                </span>
              </p>
              <p className="flex justify-between items-center mb-1">
                <span>Liked Tweets Data:</span>
                <span>
                  {scrapingStatus.isLikedTweetsScraping ? (
                    "✅"
                  ) : isLikedTweetsScrapingEnabled ? (
                    <LoadingSpinner />
                  ) : (
                    "❌"
                  )}
                </span>
              </p>
              <p className="flex justify-between items-center mb-1">
                <span>Following Data:</span>
                <span>
                  {scrapingStatus.hasScrapedFollowing ? (
                    "✅"
                  ) : isFollowingEnabled ? (
                    <LoadingSpinner />
                  ) : (
                    "❌"
                  )}
                </span>
              </p>
              <p className="flex justify-between items-center">
                <span>Posts and Replies Data:</span>
                <span>
                  {scrapingStatus.hasScrapedReplies ? (
                    "✅"
                  ) : isRepliesScraping ? (
                    <LoadingSpinner />
                  ) : (
                    "❌"
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Toggles Section */}
          <div className="flex flex-col items-center space-y-2 mb-4 w-full">
            {/* Main Scraping Toggle */}
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-sm font-medium text-gray-700">
                Scrap Twitter
              </span>
              <button
                onClick={toggleMainScraping}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#ff8c42] focus:ring-offset-2 ${
                  isMainScrapingEnabled ? "bg-[#ff8c42]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isMainScrapingEnabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Profile & Likes Toggle */}
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-sm font-medium text-gray-700">
                Profile Scraping
              </span>
              <button
                onClick={toggleProfileScraping}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00E8E4FF] focus:ring-offset-2 ${
                  isProfileScrapingEnabled ? "bg-[#00E8E4FF]" : "bg-gray-200"
                } ${
                  !isMainScrapingEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isProfileScrapingEnabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between w-full px-2">
              <span className="text-sm font-medium text-gray-700">
                Liked Tweets Scraping
              </span>
              <button
                onClick={toggleLikedTweetsScraping}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00B5B5FF] focus:ring-offset-2 ${
                  isLikedTweetsScrapingEnabled
                    ? "bg-[#00B5B5FF]"
                    : "bg-gray-200"
                } ${
                  !isMainScrapingEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isLikedTweetsScrapingEnabled
                      ? "translate-x-8"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Background Tweet Toggle */}
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-sm font-medium text-gray-700">
                Tweet Scraping
              </span>
              <button
                onClick={toggleBackgroundTweetScraping}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00B5B5FF] focus:ring-offset-2 ${
                  isBackgroundTweetScrapingEnabled
                    ? "bg-[#00B5B5FF]"
                    : "bg-gray-200"
                } ${
                  !isMainScrapingEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isBackgroundTweetScrapingEnabled
                      ? "translate-x-8"
                      : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Following Toggle */}
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-sm font-medium text-gray-700">
                Following Scraping
              </span>
              <button
                onClick={toggleFollowing}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00B59AFF] focus:ring-offset-2 ${
                  isFollowingEnabled ? "bg-[#00B59AFF]" : "bg-gray-200"
                } ${
                  !isMainScrapingEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isFollowingEnabled ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Posts and Replies Toggle */}
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-sm font-medium text-gray-700">
                Posts and Replies Scraping
              </span>
              <button
                onClick={handleRepliesScraping}
                disabled={!isMainScrapingEnabled}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#00A6B5FF] focus:ring-offset-2 ${
                  isRepliesScraping ? "bg-[#00A6B5FF]" : "bg-gray-200"
                } ${
                  !isMainScrapingEnabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-300 ease-in-out ${
                    isRepliesScraping ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex space-x-2 w-full">
            <button
              onClick={() => navigate("/scraped-data")}
              className="w-1/2 bg-[#3AADA8] text-white py-3 rounded-lg font-medium text-base hover:bg-[#2A9D98] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              View Data
            </button>

            <button
              onClick={() => navigate("/")}
              className="w-1/2 bg-[#DC3545] text-white py-3 rounded-lg font-medium text-base hover:bg-[#C82333] transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Back
            </button>
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
