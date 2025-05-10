/*global chrome*/
import React, { useState } from "react";

// State management hooks
export const useScrapingStates = () => {
  const [isFollowingEnabled, setIsFollowingEnabled] = useState(false);
  const [isProfileScrapingEnabled, setIsProfileScrapingEnabled] = useState(false);
  const [isLikedTweetsScrapingEnabled, setIsLikedTweetsScrapingEnabled] = useState(false);
  const [isBackgroundTweetScrapingEnabled, setIsBackgroundTweetScrapingEnabled] = useState(false);
  const [isRepliesScraping, setIsRepliesScraping] = useState(false);
  const [isMainScrapingEnabled, setIsMainScrapingEnabled] = useState(false);

  return {
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
  };
};

// Toggle Following Scraping
export const toggleFollowing = (isFollowingEnabled, setIsFollowingEnabled) => {
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

// Toggle Background Tweet Scraping
export const toggleBackgroundTweetScraping = (
  isBackgroundTweetScrapingEnabled,
  setIsBackgroundTweetScrapingEnabled,
  profileData
) => {
  const newState = !isBackgroundTweetScrapingEnabled;
  console.log("🔄 Toggling background tweet scraping to:", newState);

  if (newState) {
    chrome.storage.local.get(['tweets'], (result) => {
      const existingTweets = result.tweets || [];
      if (existingTweets.length > 0) {
        if (window.confirm("Re-enabling tweet scraping will clear existing tweets and start from 0. Continue?")) {
          chrome.runtime.sendMessage({
            type: "TOGGLE_BACKGROUND_TWEET_SCRAPING",
            username: profileData?.username,
            enabled: newState,
          });
          setIsBackgroundTweetScrapingEnabled(newState);
          chrome.storage.local.set({
            isBackgroundTweetScrapingEnabled: newState,
          });
        }
      } else {
        chrome.runtime.sendMessage({
          type: "TOGGLE_BACKGROUND_TWEET_SCRAPING",
          username: profileData?.username,
          enabled: newState,
        });
        setIsBackgroundTweetScrapingEnabled(newState);
        chrome.storage.local.set({
          isBackgroundTweetScrapingEnabled: newState,
        });
      }
    });
  } else {
    chrome.runtime.sendMessage({
      type: "STOP_BACKGROUND_TWEET_SCRAPING",
    });
    setIsBackgroundTweetScrapingEnabled(newState);
    chrome.storage.local.set({
      isBackgroundTweetScrapingEnabled: newState,
    });
  }
};

// Toggle Profile Scraping
export const toggleProfileScraping = (
  isProfileScrapingEnabled,
  setIsProfileScrapingEnabled,
  setScrapingStatus
) => {
  const newState = !isProfileScrapingEnabled;
  console.log("🔄 Toggling profile scraping to:", newState);

  setIsProfileScrapingEnabled(newState);
  if (newState) {
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

// Toggle Liked Tweets Scraping
export const toggleLikedTweetsScraping = (
  isLikedTweetsScrapingEnabled,
  setIsLikedTweetsScrapingEnabled,
  setScrapingStatus
) => {
  const newState = !isLikedTweetsScrapingEnabled;
  console.log("🔄 Toggling liked tweets scraping to:", newState);

  setIsLikedTweetsScrapingEnabled(newState);
  if (newState) {
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

// Toggle Main Scraping
export const toggleMainScraping = (
  isMainScrapingEnabled,
  setMainScrapingStates,
  setScrapingStatus
) => {
  if (!isMainScrapingEnabled) {
    chrome.storage.local.get(['hasInitialAuth', 'initialUsername'], (result) => {
      if (!result.hasInitialAuth || !result.initialUsername) {
        console.log("🔄 No initial auth found, opening Twitter...");
        chrome.tabs.create({ url: "https://x.com" }, (tab) => {
          console.log("📱 Opened Twitter tab for initial auth:", tab.id);
        });
        return;
      }
      // Set main scraping enabled
      chrome.storage.local.set({ isMainScrapingEnabled: true });
      setMainScrapingStates.setIsMainScrapingEnabled(true);
    });
  } else {
    // Disable all scraping
    const newState = {
      isMainScrapingEnabled: false,
      isBackgroundTweetScrapingEnabled: false,
      isFollowingEnabled: false,
      isRepliesScrapingEnabled: false,
      isProfileScrapingEnabled: false,
      isLikedTweetsScrapingEnabled: false,
    };

    chrome.storage.local.set(newState, () => {
      chrome.runtime.sendMessage({ type: "STOP_ALL_SCRAPING" });

      // Update all states
      Object.keys(setMainScrapingStates).forEach(key => {
        if (typeof setMainScrapingStates[key] === 'function') {
          setMainScrapingStates[key](false);
        }
      });

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
    });
  }
};

// Handle Replies Scraping
export const handleRepliesScraping = (
  isRepliesScraping,
  setIsRepliesScraping
) => {
  const newState = !isRepliesScraping;
  if (newState) {
    chrome.storage.local.get(["initialUsername"], (result) => {
      if (result.initialUsername) {
        console.log("🔄 Requesting Posts and Replies scrape for:", result.initialUsername);
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

// Initialize scraping states
export const initializeScrapingStates = (setStates) => {
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
  ], (result) => {
    console.log("📊 Loading initial states:", result);
    setStates.setIsMainScrapingEnabled(result.isMainScrapingEnabled ?? false);
    setStates.setIsBackgroundTweetScrapingEnabled(result.isBackgroundTweetScrapingEnabled ?? false);
    setStates.setIsFollowingEnabled(result.isFollowingEnabled ?? false);
    setStates.setIsRepliesScraping(result.isRepliesScrapingEnabled ?? false);
    setStates.setIsProfileScrapingEnabled(result.isProfileScrapingEnabled ?? false);
    setStates.setIsLikedTweetsScrapingEnabled(result.isLikedTweetsScrapingEnabled ?? false);
  });
};

// Setup storage change listeners
export const setupStorageListeners = (setStates) => {
  const handleStorageChange = (changes) => {
    console.log("💾 Storage changes detected:", changes);

    if (changes.isMainScrapingEnabled) {
      setStates.setIsMainScrapingEnabled(changes.isMainScrapingEnabled.newValue);
    }
    if (changes.isBackgroundTweetScrapingEnabled) {
      setStates.setIsBackgroundTweetScrapingEnabled(changes.isBackgroundTweetScrapingEnabled.newValue);
    }
    if (changes.isFollowingEnabled) {
      setStates.setIsFollowingEnabled(changes.isFollowingEnabled.newValue);
    }
    if (changes.isProfileScrapingEnabled) {
      setStates.setIsProfileScrapingEnabled(changes.isProfileScrapingEnabled.newValue);
    }
    if (changes.isLikedTweetsScrapingEnabled) {
      setStates.setIsLikedTweetsScrapingEnabled(changes.isLikedTweetsScrapingEnabled.newValue);
    }
  };

  chrome.storage.onChanged.addListener(handleStorageChange);
  return () => chrome.storage.onChanged.removeListener(handleStorageChange);
};

// Setup message listeners
export const setupMessageListeners = (setStates) => {
  const handleMessages = (message) => {
    if (message.type === "TWEET_LIMIT_REACHED") {
      console.log("📊 Tweet limit reached:", message.data);
      setStates.setIsBackgroundTweetScrapingEnabled(false);
    }
  };

  chrome.runtime.onMessage.addListener(handleMessages);
  return () => chrome.runtime.onMessage.removeListener(handleMessages);
};

export default {
  useScrapingStates,
  toggleFollowing,
  toggleBackgroundTweetScraping,
  toggleProfileScraping,
  toggleLikedTweetsScraping,
  toggleMainScraping,
  handleRepliesScraping,
  initializeScrapingStates,
  setupStorageListeners,
  setupMessageListeners
};
