// Keep service worker active
/*global chrome*/
import { sendProfileVisit, sendTweetVisit, sendBatchEvents, sendCreateTweet } from "./api.js";

const PING_INTERVAL = 6000;
const TWEET_SCRAPE_IDENTIFIER = "?q=wootzapp-tweets";
const FOLLOWING_SCRAPE_IDENTIFIER = "?q=wootzapp-following";
const LIKED_TWEETS_SCRAPE_IDENTIFIER = "?q=wootzapp-liked-tweets";
const POSTS_SCRAPE_IDENTIFIER = "?q=wootzapp-replies";
const PROFILE_VISIT_IDENTIFIER = "?q=wootzapp-profile-visit";
const MAX_TWEETS_PER_TAB = 150;

console.log(
  "⚙️ Background service worker starting with ping interval:",
  PING_INTERVAL
);

// Create alarm for keeping alive
chrome.alarms.create("keepAlive", { periodInMinutes: 0.1 });
console.log("⏰ Created keepAlive alarm");

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepAlive") {
    console.log("🟢 Service Worker Active:", new Date().toISOString());
  }
});

// Handle messages from content script
console.log("📡 Setting up message listeners...");
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Add immediate response to keep connection alive
  const keepConnectionAlive = true;

  if (message.type === "SCRAPED_DATA" && message.data.type === "LIKED_TWEETS") {
    console.log("📥 Received liked tweets data");
    handleLikedTweetsData(message.data.content, message.data.metadata).catch(
      (error) => console.error("Error handling liked tweets:", error)
    );
    return true;
  }

  if (message.type === "SCRAPED_DATA" && message.data.type === "PROFILE") {
    console.log("📥 Received profile data");
    handleProfileData(message.data.content).catch((error) =>
      console.error("Error handling profile data:", error)
    );
    return true;
  }

  if (message.type === "SCRAPED_DATA" && message.data.type === "LIKES_COUNT") {
    console.log("📥 Received likes count data");
    handleLikesCountData(message.data.content).catch((error) =>
      console.error("Error handling likes count:", error)
    );
    return true;
  }

  // if (message.type === 'SCRAPED_DATA') {
  //   console.log('📥 Received SCRAPED_DATA from tab:', sender.tab?.id);

  //   // Send immediate response
  //   sendResponse({ status: 'processing' });
  //   return keepConnectionAlive;
  // }

  console.log(
    "📨 Received message:",
    message.type,
    "from tab:",
    sender.tab?.id
  );

  if (message.type === "INITIAL_AUTH_USERNAME") {
    console.log("🔑 Received initial auth username:", message.data.username);

    // Store the username
    chrome.storage.local.set(
      {
        initialUsername: message.data.username,
        hasInitialAuth: true,
      },
      () => {
        console.log("✅ Stored initial username:", message.data.username);
      }
    );
  } else if (message.type === "SCRAPED_DATA") {
    console.log("🔍 Processing scraped data...");
    handleScrapedData(message.data);
    sendResponse({ status: "received" });
  } else if (message.type === "CLOSE_TAB") {
    console.log("🔒 Closing tab:", sender.tab?.id);
    chrome.tabs.remove(sender.tab.id);
  } else if (message.type === "GET_PROFILE_DATA") {
    chrome.storage.local.get(["profileData"], (result) => {
      sendResponse({ profileData: result.profileData });
    });
    return true;
  } else if (message.type === "TOGGLE_SCRAPING") {
    handleScrapingToggle(message.enabled, sender.tab?.id);
  } else if (message.type === "FOLLOWING_USERS_UPDATED") {
    console.log("👥 Following users update received:", message.data);

    // Store in chrome.storage.local, replacing existing data
    chrome.storage.local.set(
      {
        followingUsers: message.data,
        hasScrapedFollowing: true, // Set this after successful scrape
      },
      () => {
        console.log("💾 Following users stored:", message.data.length);

        // Broadcast to UI
        chrome.runtime.sendMessage(
          {
            type: "FOLLOWING_USERS_UPDATED",
            data: message.data,
          },
          () => {
            console.log("📢 Following users broadcast sent");
          }
        );
      }
    );
    handleFollowingUsersData(message.data).catch((error) =>
      console.error("Error handling following users:", error)
    );
    return true;
  } else if (message.type === "START_FOLLOWING_SCRAPE") {
    handleFollowingScape(message.username);
  } else if (message.type === "TWITTER_AUTH_STATUS") {
    console.log("🔐 Received Twitter auth status:", message.data);

    // Store auth status
    chrome.storage.local.set(
      {
        isTwitterAuthenticated: message.data.isAuthenticated,
      },
      () => {
        // Broadcast to UI
        chrome.runtime.sendMessage({
          type: "TWITTER_AUTH_UPDATED",
          data: message.data,
        });
      }
    );
  } else if (message.type === "TOGGLE_BACKGROUND_TWEET_SCRAPING") {
    console.log("🔄 Background tweet scraping toggle:", message.enabled);
    handleBackgroundTweetScraping(message.username);
  } else if (message.type === "STOP_ALL_SCRAPING") {
    console.log("🛑 Stopping all scraping processes");
    
    // Clear any pending timeout
    chrome.storage.local.get(['backgroundScrapeTimeoutId'], (result) => {
      if (result.backgroundScrapeTimeoutId) {
        clearTimeout(result.backgroundScrapeTimeoutId);
        chrome.storage.local.remove('backgroundScrapeTimeoutId');
      }
    });

    // Notify all tabs to stop background scraping
    chrome.tabs.query({ url: '*://*.x.com/*' }, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          type: 'STOP_BACKGROUND_SCRAPING'
        });
      });
    });
    
    // Reset all scraping states
    chrome.storage.local.set({
      isScrapingEnabled: false,
      isTweetScrapingEnabled: false,
      isBackgroundTweetScrapingEnabled: false,
      isFollowingEnabled: false,
      isRepliesScrapingEnabled: false,
      currentRepliesUsername: null,
      repliesRequestCount: 0
    });

    // Clear any pending liked tweets timeout
    chrome.storage.local.get(['likedTweetsScrapingTimeoutId'], (result) => {
      if (result.likedTweetsScrapingTimeoutId) {
        clearTimeout(result.likedTweetsScrapingTimeoutId);
        chrome.storage.local.remove('likedTweetsScrapingTimeoutId');
      }
    });
  } else if (message.type === "SCHEDULE_NEXT_SCRAPING") {
    console.log("📅 Scheduling next scraping session...");

    // First close the current tab
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id);
    }

    // Store the timeout ID so we can cancel it if needed
    const timeoutId = setTimeout(() => {
      console.log("⏰ Starting next scraping session");
      handleBackgroundTweetScraping(message.data.username);
    }, 30000);

    // Store the timeout ID
    chrome.storage.local.set({ backgroundScrapeTimeoutId: timeoutId });
  } else if (message.type === "SCHEDULE_NEXT_LIKED_TWEETS_SCRAPING") {
    console.log("📅 Scheduling next liked tweets scraping session...");

    // First close the current tab
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id);
    }

    // Schedule next session after 30 seconds
    const timeoutId = setTimeout(() => {
      console.log("⏰ Starting next liked tweets scraping session");
      handleLikedTweetsScraping(message.data.username);
    }, 30000);

    // Store the timeout ID
    chrome.storage.local.set({ likedTweetsScrapingTimeoutId: timeoutId });
  } else if (message.type === "START_LIKED_TWEETS_SCRAPING") {
    console.log("📣 Received START_LIKED_TWEETS_SCRAPING:", message.data);
    handleLikedTweetsScraping(message.data.username).catch((error) =>
      console.error("Error handling liked tweets scraping:", error)
    );
    return true;
  } else if (message.type === "LIKED_TWEETS_DIAGNOSTIC") {
    console.log("📊 Liked Tweets Diagnostic:", {
      tabId: sender.tab?.id,
      ...message.data,
      selectorResults: message.data.selectorResults,
    });
  } else if (message.type === "WALLET_CONNECTED") {
    console.log("💳 Wallet connected:", message.data);
    chrome.storage.local.set(
      {
        walletAddress: message.data.address,
        walletConnected: true,
      },
      () => {
        console.log("✅ Wallet address stored:", message.data.address);
      }
    );
  } else if (message.type === "WALLET_DISCONNECTED") {
    console.log("💳 Wallet disconnected");
    chrome.storage.local.set(
      {
        walletAddress: null,
        walletConnected: false,
      },
      () => {
        console.log("✅ Wallet address cleared");
      }
    );
  } else if (message.type === "TOGGLE_REPLIES_SCRAPING") {
    console.log("🔄 Toggling replies scraping:", message.enabled);
    if (message.enabled) {
      handleRepliesScraping(message.username);
    } else {
      chrome.storage.local.set({ 
        isRepliesScrapingEnabled: false,
        currentRepliesUsername: null,
        repliesRequestCount: 0
      });
    }
  }
  else if (message.type === 'SCRAPED_DATA' && message.data.type === 'REPLIES') {
    console.log('📥 Received replies data');
    handleRepliesData(message.data.content).catch(error => 
      console.error('Error handling replies data:', error)
    );
  } else if (message.type === 'SEND_PROFILE_VISIT') {
    console.log('📤 Processing profile visit:', message.data);
    
    // Double check it's not the user's own profile
    if (message.data.visitedHandle === message.data.userHandle) {
        console.log('🚫 Skipping API call - detected own profile visit');
        return true;
    }

    chrome.storage.local.get(['walletAddress', 'initialUsername'], async (result) => {
        // Triple check against all known username variations
        if (message.data.visitedHandle === result.initialUsername || 
            message.data.visitedHandle === message.data.userHandle) {
            console.log('🚫 Skipping API call - detected own profile visit (secondary check)');
            return;
        }

        if (result.walletAddress && result.walletAddress !== 'pending') {
            try {
                await sendProfileVisit(
                    result.walletAddress,
                    message.data.userHandle,
                    message.data.visitedHandle
                );
                console.log('✅ Profile visit sent to API successfully:', {
                    visitor: message.data.userHandle,
                    visited: message.data.visitedHandle
                });
            } catch (error) {
                console.error('❌ Error sending profile visit to API:', error);
            }
        } else {
            console.log('⏳ Skipping API call - no valid wallet address');
        }
    });
    return true;
  }
  return true;
});

// Handle scraping toggle
async function handleScrapingToggle(enabled, tabId) {
  console.log("🔄 Handling scraping toggle:", enabled);

  if (!enabled) {
    chrome.storage.local.set({ 
      isScrapingEnabled: false,
      isProfileVisitScrapingEnabled: false  // Disable profile visit scraping
    });
    return;
  }

  try {
    console.log("🔄 Starting profile, likes, and visit scraping...");
    
    // Get username before proceeding
    const storage = await chrome.storage.local.get(['initialUsername']);
    if (!storage.initialUsername) {
      console.error('❌ No username found for scraping');
      return;
    }

    // Enable profile visit scraping
    chrome.storage.local.set({
      isScrapingEnabled: true,
      isProfileVisitScrapingEnabled: true,  // Enable profile visit scraping
      hasScrapedProfile: false,
      hasScrapedLikes: false
    });

    // Create a new tab for initial profile and likes scraping
    const initialTab = await chrome.tabs.create({
      url: `https://x.com/${storage.initialUsername}${PROFILE_VISIT_IDENTIFIER}`,
      active: false,
    });

    // Set up profile visit monitoring on all Twitter tabs
    const twitterTabs = await chrome.tabs.query({ url: ["*://*.x.com/*", "*://*.twitter.com/*"] });
    for (const tab of twitterTabs) {
      if (tab.id !== initialTab.id) {  // Don't send to the initial tab
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXECUTE_PROFILE_VISIT_SCRAPING'
        }).catch(error => {
          console.log('Tab might not be ready yet:', error);
        });
      }
    }

  } catch (error) {
    console.error("❌ Error in scraping toggle:", error);
    chrome.storage.local.set({ 
      isScrapingEnabled: false,
      isProfileVisitScrapingEnabled: false
    });
  }
}

// Handle scraped data
function handleScrapedData(data) {
  console.log('📊 Processing data type:', data.type);
  
  if (data.type === 'REPLIES') {
    console.log('💬 Processing replies data:', data.content.length);
    handleRepliesData(data.content).catch(error => 
      console.error('Error handling replies data:', error)
    );
    return;
  }

  if (data.type === "TWEETS") {
    // Check if tweet scraping is still enabled before processing
    chrome.storage.local.get(
      [
        "isBackgroundTweetScrapingEnabled",
        "tweets",
        "initialUsername",
        "walletAddress",
      ],
      async (result) => {
        if (!result.isBackgroundTweetScrapingEnabled) {
          console.log("🛑 Tweet scraping disabled, skipping data processing");
          return;
        }

        const existingTweets = result.tweets || [];
        console.log(
          "📊 Processing new tweets. Existing count:",
          existingTweets.length
        );

        // Filter out duplicates
        const newTweets = data.content.filter(
          (newTweet) =>
            !existingTweets.some((existing) => existing.id === newTweet.id)
        );

        console.log("📝 New unique tweets:", newTweets.length);

        // Get wallet address from chrome.storage.local
        const walletAddress = result.walletAddress;
        const userHandle = result.initialUsername;

        console.log("🔐 Current wallet state:", {
          walletAddress,
          userHandle,
          hasWallet: !!walletAddress,
          isWalletPending: walletAddress === "pending",
        });

        // Send tweet visits to API if we have both wallet and user handle
        if (userHandle && newTweets.length > 0) {
          console.log("🌐 Preparing tweet visits:", {
            userHandle,
            tweetCount: newTweets.length,
            hasWallet: !!walletAddress,
            walletAddress,
          });

          // Only proceed with API calls if we have a valid wallet address
          if (walletAddress && walletAddress !== "pending") {
            const tweetEvents = newTweets.map((tweet) => ({
              walletAddress,
              userHandle,
              event: {
                name: "VISIT_TWEET",
                id: tweet.id,
              },
            }));

            try {
              // Send batch of tweet visits
              const results = await sendBatchEvents(tweetEvents);
              console.log("✅ API calls completed for tweets:", {
                total: results.length,
                successful: results.filter((r) => r.status === "fulfilled")
                  .length,
              });
            } catch (error) {
              console.error("❌ Error sending tweet visits to API:", error);
            }
          } else {
            console.log(
              "⏳ Skipping API calls - waiting for valid wallet address"
            );
          }
        } else {
          console.log("⚠️ Skipping API calls - missing required data:", {
            hasHandle: !!userHandle,
            newTweets: newTweets.length,
          });
        }

        // Update tweets storage
        const updatedTweets = [...existingTweets, ...newTweets]
          .sort(
            (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
          )
          .slice(0, MAX_TWEETS_PER_TAB);

        // Store updated tweets
        chrome.storage.local.set({ tweets: updatedTweets }, () => {
          console.log("💾 Total tweets stored:", updatedTweets.length);

          // Broadcast update
          chrome.runtime.sendMessage({
            type: "TWEETS_UPDATED",
            data: updatedTweets,
          });
        });
      }
    );
    return;
  }

  if (data.type === "PROFILE") {
    const profileData = data.content;
    chrome.storage.local.get(
      ["likesCount", "walletAddress", "userHandle", "initialUsername"],
      async (result) => {
        console.log("📊 Processing profile data:", {
          username: profileData.username,
          hasWallet: !!result.walletAddress,
          hasHandle: !!result.userHandle,
        });

        const mergedData = {
          ...profileData,
          likes: result.likesCount?.likes || undefined,
        };

        // Use initialUsername as fallback for userHandle
        const effectiveUserHandle = result.userHandle || result.initialUsername;

        // Send profile visit to API if we have the user handle and valid wallet
        if (
          effectiveUserHandle &&
          result.walletAddress &&
          result.walletAddress !== "pending"
        ) {
          console.log("🌐 Sending profile visit to API:", {
            visitor: effectiveUserHandle,
            visited: profileData.username,
          });

          try {
            await sendProfileVisit(
              result.walletAddress,
              effectiveUserHandle,
              profileData.username
            );
            console.log("✅ Profile visit sent to API successfully");
          } catch (error) {
            console.error("❌ Error sending profile visit to API:", error);
          }
        } else {
          console.log(
            "⏳ Skipping profile API call - missing wallet or handle"
          );
        }

        chrome.storage.local.set(
          {
            profileData: mergedData,
            hasScrapedProfile: true,
          },
          () => {
            console.log("💾 Profile data stored:", mergedData);

            chrome.runtime.sendMessage(
              {
                type: "PROFILE_DATA_UPDATED",
                data: mergedData,
              },
              () => {
                console.log("📢 Profile data broadcast sent");
              }
            );
          }
        );
      }
    );
  } else if (data.type === "LIKES_COUNT") {
    console.log("❤️ Processing likes count:", data.content);
    const likesData = data.content;

    chrome.storage.local.get(["profileData"], (result) => {
      const mergedProfileData = {
        ...result.profileData,
        likes: likesData.likes,
      };

      chrome.storage.local.set(
        {
          likesCount: likesData,
          profileData: mergedProfileData,
          hasScrapedLikes: true,
        },
        () => {
          console.log("💾 Likes count stored:", likesData);
          console.log("💾 Updated profile data:", mergedProfileData);

          chrome.runtime.sendMessage({
            type: "PROFILE_DATA_UPDATED",
            data: mergedProfileData,
          });

          chrome.runtime.sendMessage(
            {
              type: "LIKES_COUNT_UPDATED",
              data: likesData,
            },
            () => {
              console.log("📢 Data broadcasts sent");
            }
          );
        }
      );
    });
  } else if (data.type === "LIKED_TWEETS") {
    chrome.storage.local.get(["likedTweets"], (result) => {
      const existingTweets = result.likedTweets || [];
      const newTweets = data.content.filter(
        (newTweet) =>
          !existingTweets.some((existing) => existing.id === newTweet.id)
      );

      const updatedTweets = [...existingTweets, ...newTweets];

      chrome.storage.local.set(
        {
          likedTweets: updatedTweets,
        },
        () => {
          console.log("💾 Liked tweets stored:", {
            new: newTweets.length,
            total: updatedTweets.length,
          });

          chrome.runtime.sendMessage({
            type: "LIKED_TWEETS_UPDATED",
            data: updatedTweets,
          });
        }
      );
    });
  }
}

// Keep alive interval backup
setInterval(() => {
  console.log("⏰ Service Worker Interval:", new Date().toISOString());
}, PING_INTERVAL);

// Initialize extension - no auto-opening of x.com
chrome.runtime.onInstalled.addListener(() => {
  console.log("🎉 Extension installed");
  chrome.storage.local.set({
    isScrapingEnabled: false,
    hasScrapedProfile: false,
    hasScrapedLikes: false,
    hasScrapedFollowing: false,
    hasScrapedReplies: false,
    hasInitialAuth: false,
    initialUsername: null,
    tweets: [],
    profileData: null,
    likesCount: null,
    userReplies: []
  });
});

console.log("🚀 Background Service Worker Initialized");

// Add this new function to handle following scraping
async function handleFollowingScape(username) {
  console.log("🔄 Starting following scrape process for:", username);

  try {
    // Clear existing following data before starting new scrape
    await chrome.storage.local.set({
      followingUsers: [],
      hasScrapedFollowing: false,
    });
    console.log("🧹 Cleared existing following data");

    // Use the following-specific identifier
    const scrapeUrl = `https://x.com/${username}${FOLLOWING_SCRAPE_IDENTIFIER}`;

    // Create a new tab with the following URL
    const tab = await chrome.tabs.create({
      url: scrapeUrl,
      active: false,
    });

    console.log("📄 Created new tab for following scrape:", tab.id);

    // Wait for page load then execute scraping
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);

        // Give extra time for the page to fully load
        setTimeout(() => {
          console.log(
            "🔄 Sending execute following scrape message to tab:",
            tab.id
          );
          chrome.tabs.sendMessage(tab.id, {
            type: "EXECUTE_FOLLOWING_SCRAPE",
            username: username,
          });
        }, 3000);
      }
    });
  } catch (error) {
    console.error("Error in following scrape process:", error);
    chrome.storage.local.set({
      isFollowingScrapeMode: false,
      hasScrapedFollowing: false,
    });
  }
}

// Add new function to handle background tweet scraping
async function handleBackgroundTweetScraping(username) {
  console.log("🔄 Starting background tweet scraping process for:", username);

  try {
    await chrome.storage.local.set({ isBackgroundTweetScrapingEnabled: true });

    // Use the tweet-specific identifier
    const tab = await chrome.tabs.create({
      url: `https://x.com/${username}${TWEET_SCRAPE_IDENTIFIER}`,
      active: false,
    });

    // Wait for page load and send message to content script
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);

        // Send message to content script to start tweet scraping
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, {
            type: "EXECUTE_TWEET_SCRAPING",
          });
        }, 3000);
      }
    });
  } catch (error) {
    console.error("Error in background tweet scraping:", error);
    chrome.storage.local.set({ isBackgroundTweetScrapingEnabled: false });
  }
}

// Add function to handle liked tweets scraping
async function handleLikedTweetsScraping(username) {
  console.log("🔄 Starting liked tweets scraping process for:", username);

  try {
    // Set initial state
    await chrome.storage.local.set({
      // isLikedTweetScrapingEnabled: true,
      likedTweetsRequestCount: 0,
      currentLikedTweetsUsername: username,
    });

    console.log("📄 Creating new tab for liked tweets scraping...");
    const scrapeUrl = `https://x.com/${username}${LIKED_TWEETS_SCRAPE_IDENTIFIER}`;
    console.log("🔗 Using URL:", scrapeUrl);

    // Create the tab
    const tab = await chrome.tabs.create({
      url: scrapeUrl,
      active: false,
    });

    console.log("✅ Created tab:", tab.id);

    // Store tab ID
    await chrome.storage.local.set({ likedTweetsScrapeTabId: tab.id });

    // No need to send additional message - content script will auto-start
    console.log("⏳ Waiting for content script to handle scraping...");
  } catch (error) {
    console.error("❌ Error in liked tweets scraping:", error);
    await chrome.storage.local.set({
      isLikedTweetScrapingEnabled: false,
      likedTweetsRequestCount: 0,
      currentLikedTweetsUsername: null,
      likedTweetsScrapeTabId: null,
    });
  }
}

// Add to background.js

// Handle liked tweets data separately from normal tweets
async function handleLikedTweetsData(tweets, metadata) {
  if (!tweets || !Array.isArray(tweets)) {
    console.error("❌ Invalid liked tweets data received:", tweets);
    return;
  }
  try {
    console.log("🔄 Processing liked tweets batch:", {
      count: tweets.length,
      metadata,
    });

    // Get wallet address and user handle
    const storage = await chrome.storage.local.get([
      "walletAddress",
      "initialUsername",
      "likedTweets",
      "sentLikedTweets",
    ]);
    const walletAddress = storage.walletAddress;
    const userHandle = storage.initialUsername;
    const existingTweets = storage.likedTweets || [];
    const sentLikedTweets = storage.sentLikedTweets || new Set();

    if (!walletAddress || !userHandle) {
      console.log("⏳ Skipping API calls - missing wallet or handle:", {
        hasWallet: !!walletAddress,
        hasHandle: !!userHandle,
      });
      return;
    }

    // Track which tweets have been sent to API
    const sentTweetsSet = new Set(sentLikedTweets);

    // Find tweets that haven't been sent to API yet
    const unsentTweets = tweets.filter((tweet) => !sentTweetsSet.has(tweet.id));

    console.log("📊 Liked tweets batch stats:", {
      existing: existingTweets.length,
      incoming: tweets.length,
      unsent: unsentTweets.length,
    });

    if (unsentTweets.length > 0) {
      // Prepare batch of like events
      const likeEvents = unsentTweets.map((tweet) => ({
        walletAddress,
        userHandle,
        event: {
          name: "LIKE_TWEET",
          id: tweet.id,
        },
      }));

      try {
        // Send batch of like events
        const results = await sendBatchEvents(likeEvents);
        console.log("✅ API calls completed for liked tweets:", {
          total: results.length,
          successful: results.filter((r) => r.status === "fulfilled").length,
        });

        // Update sent tweets tracking
        const newSentTweets = new Set([
          ...sentTweetsSet,
          ...unsentTweets.map((t) => t.id),
        ]);
        await chrome.storage.local.set({
          sentLikedTweets: Array.from(newSentTweets),
        });
      } catch (error) {
        console.error("❌ Error sending liked tweets to API:", error);
      }

      // Update storage with all tweets
      const updatedTweets = [...existingTweets];
      for (const tweet of tweets) {
        if (!existingTweets.some((existing) => existing.id === tweet.id)) {
          updatedTweets.push(tweet);
        }
      }

      // Sort and limit
      const finalTweets = updatedTweets
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, MAX_TWEETS_PER_TAB);

      // Update storage
      await chrome.storage.local.set({
        likedTweets: finalTweets,
        lastLikedTweetsUpdate: new Date().toISOString(),
      });

      // Broadcast update
      chrome.runtime.sendMessage({
        type: "LIKED_TWEETS_UPDATED",
        data: finalTweets,
      });
    } else {
      console.log("ℹ️ No new liked tweets to send to API");
    }
  } catch (error) {
    console.error("❌ Error processing liked tweets:", error);
    throw error;
  }
}

// Add these new handler functions:

async function handleProfileData(profileData) {
  console.log("Processing profile data:", profileData.username);

  try {
    // Store in chrome.storage.local
    await chrome.storage.local.set({
      profileData: {
        ...profileData,
        lastUpdated: new Date().toISOString(),
      },
    });
    // Store merged data
    await chrome.storage.local.set({
      hasScrapedProfile: true, // Set this flag to indicate profile scraping is complete
    });

    console.log("✅ Profile data stored successfully");
  } catch (error) {
    console.error("Error storing profile data:", error);
    throw error;
  }
}

async function handleLikesCountData(likesData) {
  console.log("Processing likes count data:", likesData);

  try {
    // Get current profile data
    const storage = await chrome.storage.local.get(["profileData"]);
    const currentProfileData = storage.profileData || {};

    // Merge likes count with profile data
    const updatedProfileData = {
      ...currentProfileData,
      likes: likesData.likes, // Add likes count directly to profile data
      lastUpdated: new Date().toISOString(),
    };

    // Store both the separate likes count and updated profile data
    await chrome.storage.local.set({
      likesCountData: {
        ...likesData,
        lastUpdated: new Date().toISOString(),
      },
      profileData: updatedProfileData, // Store updated profile data
      hasScrapedLikes: true,
      // isLikedTweetScrapingEnabled: true
    });

    // Broadcast profile data update to UI
    chrome.runtime.sendMessage({
      type: "PROFILE_DATA_UPDATED",
      data: updatedProfileData,
    });

    console.log("✅ Likes count data stored and merged with profile:", {
      likes: likesData.likes,
      profileData: updatedProfileData,
    });
  } catch (error) {
    console.error("Error storing likes count data:", error);
    throw error;
  }
}

// Add new function to handle followed profiles
async function handleFollowingUsersData(followingUsers) {
  if (!followingUsers || !Array.isArray(followingUsers)) {
    console.error("❌ Invalid following users data received:", followingUsers);
    return;
  }
  try {
    // Get wallet address, user handle, and tracking data
    const storage = await chrome.storage.local.get([
      "walletAddress",
      "initialUsername",
      "followingUsers",
      "sentFollowingUsers",
    ]);
    const walletAddress = storage.walletAddress;
    const userHandle = storage.initialUsername;
    const existingFollowing = storage.followingUsers || [];
    const sentFollowingUsers = storage.sentFollowingUsers || new Set();

    if (!walletAddress || !userHandle) {
      console.log("⏳ Skipping API calls - missing wallet or handle:", {
        hasWallet: !!walletAddress,
        hasHandle: !!userHandle,
      });
      return;
    }

    // Track which profiles have been sent to API
    const sentProfilesSet = new Set(sentFollowingUsers);

    // Find profiles that haven't been sent to API yet
    const unsentProfiles = followingUsers.filter(
      (profile) => !sentProfilesSet.has(profile.username)
    );

    console.log("📊 Following profiles batch stats:", {
      existing: existingFollowing.length,
      incoming: followingUsers.length,
      unsent: unsentProfiles.length,
    });

    if (unsentProfiles.length > 0) {
      // Prepare batch of follow events
      const followEvents = unsentProfiles.map((profile) => ({
        walletAddress,
        userHandle,
        event: {
          name: "FOLLOW_PROFILE",
          handle: profile.username, // Twitter handle of the profile followed by the user
        },
      }));

      try {
        // Send batch of follow events
        const results = await sendBatchEvents(followEvents);
        console.log("✅ API calls completed for following profiles:", {
          total: results.length,
          successful: results.filter((r) => r.status === "fulfilled").length,
        });

        // Update sent profiles tracking
        const newSentProfiles = new Set([
          ...sentProfilesSet,
          ...unsentProfiles.map((p) => p.username),
        ]);
        await chrome.storage.local.set({
          sentFollowingUsers: Array.from(newSentProfiles),
        });
      } catch (error) {
        console.error("❌ Error sending following profiles to API:", error);
      }

      // Update storage with all following users
      const updatedFollowing = [...existingFollowing];
      for (const profile of followingUsers) {
        if (
          !existingFollowing.some(
            (existing) => existing.username === profile.username
          )
        ) {
          updatedFollowing.push(profile);
        }
      }

      // Update storage
      await chrome.storage.local.set({
        followingUsers: updatedFollowing,
        lastFollowingUpdate: new Date().toISOString(),
      });

      // Broadcast update
      chrome.runtime.sendMessage({
        type: "FOLLOWING_USERS_UPDATED",
        data: updatedFollowing,
      });
    } else {
      console.log("ℹ️ No new following profiles to send to API");
    }
  } catch (error) {
    console.error("❌ Error processing following profiles:", error);
    throw error;
  }
}

// Add new function to handle replies scraping
async function handleRepliesScraping(username) {
  if (!username) {
    console.error('❌ No username provided for replies scraping');
    chrome.storage.local.set({ isRepliesScrapingEnabled: false });
    return;
  }

  console.log('🔄 Starting replies scraping process for:', username);

  try {
    // Set initial state
    await chrome.storage.local.set({ 
      isRepliesScrapingEnabled: true,
      repliesRequestCount: 0,
      currentRepliesUsername: username,
      hasScrapedReplies: false
    });

    // Create new tab with properly constructed URL including the identifier
    const scrapeUrl = `https://x.com/${username}${POSTS_SCRAPE_IDENTIFIER}`;
    console.log('🔗 Creating new tab with URL:', scrapeUrl);

    const tab = await chrome.tabs.create({
      url: scrapeUrl,
      active: false
    });

    console.log('✅ Created replies scraping tab:', tab.id);

    // Store tab ID for reference
    await chrome.storage.local.set({ repliesScrapeTabId: tab.id });

    // Wait for page load then execute scraping
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);

        // Give extra time for the page to fully load
        setTimeout(() => {
          console.log('🔄 Sending execute replies scrape message to tab:', tab.id);
          chrome.tabs.sendMessage(tab.id, {
            type: 'EXECUTE_REPLIES_SCRAPING',
            username: username
          });
        }, 3000);
      }
    });

  } catch (error) {
    console.error('Error in replies scraping:', error);
    chrome.storage.local.set({ 
      isRepliesScrapingEnabled: false,
      repliesRequestCount: 0,
      currentRepliesUsername: null,
      repliesScrapeTabId: null
    });
  }
}

// Add handler for storing replies
async function handleRepliesData(posts) {
  if (!posts || !Array.isArray(posts)) {
    console.error('❌ Invalid posts data received:', posts);
    return;
  }

  try {
    console.log('🔄 Processing posts batch:', {
      count: posts.length
    });

    // Get existing posts and user data
    const storage = await chrome.storage.local.get([
      'userReplies',
      'walletAddress',
      'initialUsername',
      'sentPosts'
    ]);

    const existingPosts = storage.userReplies || [];
    const walletAddress = storage.walletAddress;
    const userHandle = storage.initialUsername;
    const sentPosts = storage.sentPosts || new Set();

    if (!walletAddress || !userHandle) {
      console.log('⏳ Skipping API calls - missing wallet or handle:', {
        hasWallet: !!walletAddress,
        hasHandle: !!userHandle
      });
      return;
    }

    // Track which posts have been sent to API
    const sentPostsSet = new Set(sentPosts);

    // Find posts that haven't been sent to API yet
    const unsentPosts = posts.filter(post => !sentPostsSet.has(post.id));

    console.log('📊 Posts batch stats:', {
      existing: existingPosts.length,
      incoming: posts.length,
      unsent: unsentPosts.length
    });

    if (unsentPosts.length > 0) {
      try {
        // Process and send each post
        const results = await Promise.all(
          unsentPosts.map(async post => {
            // Extract all necessary data from the post
            const tweetData = {
              id: post.id,
              text: post.text || post.full_text || post.legacy?.full_text,
              timestamp: post.timestamp || post.created_at || post.legacy?.created_at,
              metrics: {
                replies: post.metrics?.replies || post.legacy?.reply_count || 0,
                retweets: post.metrics?.retweets || post.legacy?.retweet_count || 0,
                likes: post.metrics?.likes || post.legacy?.favorite_count || 0
              },
              user: {
                name: post.user?.name || post.legacy?.user?.name,
                handle: post.user?.handle || post.legacy?.user?.screen_name,
                avatar: post.user?.avatar || post.legacy?.user?.profile_image_url_https
              }
            };

            console.log('📤 Sending post to API:', {
              id: tweetData.id,
              textLength: tweetData.text?.length
            });

            try {
              return await sendCreateTweet(
                walletAddress,
                userHandle,
                tweetData.text,
                tweetData.id
              );
            } catch (error) {
              console.error('❌ Error sending individual post:', {
                id: tweetData.id,
                error: error.message
              });
              return { success: false, error };
            }
          })
        );

        const successfulPosts = results.filter(r => r.success);
        console.log('✅ API calls completed for posts:', {
          total: results.length,
          successful: successfulPosts.length,
          failed: results.length - successfulPosts.length
        });

        // Update sent posts tracking only for successful posts
        const newSentPosts = new Set([
          ...sentPostsSet,
          ...unsentPosts
            .filter((_, index) => results[index].success)
            .map(p => p.id)
        ]);

        await chrome.storage.local.set({
          sentPosts: Array.from(newSentPosts)
        });
      } catch (error) {
        console.error('❌ Error in batch posts processing:', error);
      }

      // Update storage with all posts
      const updatedPosts = [...existingPosts];
      for (const post of posts) {
        if (!existingPosts.some(existing => existing.id === post.id)) {
          updatedPosts.push(post);
        }
      }

      // Sort by timestamp and update storage
      const finalPosts = updatedPosts
        .sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0));

      await chrome.storage.local.set({
        userReplies: finalPosts,
        lastPostsUpdate: new Date().toISOString(),
        hasScrapedReplies: true
      });

      console.log('💾 Total posts stored:', finalPosts.length);

      // Broadcast update
      chrome.runtime.sendMessage({
        type: 'REPLIES_UPDATED',
        data: finalPosts
      });
    } else {
      console.log('ℹ️ No new posts to send to API');
    }
  } catch (error) {
    console.error('❌ Error processing posts:', error);
    throw error;
  }
}
