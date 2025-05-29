// Keep service worker active
/*global chrome*/
import {
  sendProfileVisit,
  sendBatchEvents,
  sendCreateTweet,
  sendReplyTweet,
  sendUnfollowProfile,
  sendUnlikeTweet,
  sendDeleteTweet,
  sendRetweet,
  sendRemoveRetweet,
} from "./api.js";

const PING_INTERVAL = 6000;
const TWEET_SCRAPE_IDENTIFIER = "?q=wootzapp-tweets";
const FOLLOWING_SCRAPE_IDENTIFIER = "?q=wootzapp-following";
const LIKED_TWEETS_SCRAPE_IDENTIFIER = "?q=wootzapp-liked-tweets";
const REPLIES_SCRAPE_IDENTIFIER = "?q=wootzapp-replies";
const PROFILE_SCRAPE_IDENTIFIER = "?q=wootzapp-profile";

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
    console.log("📥 Received liked tweets data:", {
      count: message.data.content.length,
      tabId: sender.tab?.id
  });
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

  if (message.type === "SCRAPED_DATA" && message.data.type === "REPLIES") {
    console.log("📥 Received replies data"); // This should appear in your logs
    handleRepliesData(message.data.content)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Important!
  }

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
    chrome.storage.local.get(["backgroundScrapeTimeoutId"], (result) => {
      if (result.backgroundScrapeTimeoutId) {
        clearTimeout(result.backgroundScrapeTimeoutId);
        chrome.storage.local.remove("backgroundScrapeTimeoutId");
      }
    });

    // Notify all tabs to stop background scraping
    chrome.tabs.query({ url: "*://*.x.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
          type: "STOP_BACKGROUND_SCRAPING",
        });
      });
    });

    // Reset all scraping states
    chrome.storage.local.set({
      isProfileScrapingEnabled: false,
      isTweetScrapingEnabled: false,
      isBackgroundTweetScrapingEnabled: false,
      isFollowingEnabled: false,
      isRepliesScrapingEnabled: false,
      currentRepliesUsername: null,
      repliesRequestCount: 0,
    });

    // Clear any pending liked tweets timeout
    chrome.storage.local.get(["likedTweetsScrapingTimeoutId"], (result) => {
      if (result.likedTweetsScrapingTimeoutId) {
        clearTimeout(result.likedTweetsScrapingTimeoutId);
        chrome.storage.local.remove("likedTweetsScrapingTimeoutId");
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
    console.log("🔄 Toggling Posts and Replies scraping:", message.enabled);
    handleRepliesScraping(message.username);
  } else if (message.type === "SEND_PROFILE_VISIT") {
    console.log("📤 Processing profile visit:", message.data);

    // Double check it's not the user's own profile
    if (message.data.visitedHandle === message.data.userHandle) {
      console.log("🚫 Skipping API call - detected own profile visit");
      return true;
    }

    chrome.storage.local.get(
      ["walletAddress", "initialUsername"],
      async (result) => {
        // Triple check against all known username variations
        if (
          message.data.visitedHandle === result.initialUsername ||
          message.data.visitedHandle === message.data.userHandle
        ) {
          console.log(
            "🚫 Skipping API call - detected own profile visit (secondary check)"
          );
          return;
        }

        if (result.walletAddress && result.walletAddress !== "pending") {
          try {
            await sendProfileVisit(
              result.walletAddress,
              message.data.userHandle,
              message.data.visitedHandle
            );
            console.log("✅ Profile visit sent to API successfully:", {
              visitor: message.data.userHandle,
              visited: message.data.visitedHandle,
            });
          } catch (error) {
            console.error("❌ Error sending profile visit to API:", error);
          }
        } else {
          console.log("⏳ Skipping API call - no valid wallet address");
        }
      }
    );
    return true;
  } else if (message.type === "TOGGLE_PROFILE_SCRAPING") {
    handleProfileScraping(message.enabled);
  } else if (message.type === "START_LIKED_TWEETS_SCRAPING") {
      chrome.storage.local.get(["initialUsername"], (result) => {
        if (result.initialUsername) {
        console.log("📣 Received Liked Tweets Scraping for username:", result.initialUsername);
        handleLikedTweetsScraping(result.initialUsername).catch((error) =>
          console.error("❌ Error handling liked tweets scraping:", error)
        );
      }
      else{
        console.log("❌ No initial username found for Liked Tweetts Scrapping.");
      }
    });
  } else if (message.type === "SEND_UNFOLLOW_EVENT") {
    console.log("📤 Processing unfollow event:", message.data);
    const { walletAddress, userHandle, unfollowedHandle } = message.data;
    
    sendUnfollowProfile(walletAddress, userHandle, unfollowedHandle)
      .catch(error => console.error("❌ Error sending unfollow event:", error));
  } else if (message.type === "SEND_UNLIKE_TWEET_EVENT") {
    console.log("📤 Processing unlike tweet event:", message.data);
    const { walletAddress, userHandle, tweetId } = message.data;
    
    sendUnlikeTweet(walletAddress, userHandle, tweetId)
      .catch(error => console.error("❌ Error sending unlike tweet event:", error));
  } else if (message.type === "SEND_DELETE_TWEET_EVENT") {
    console.log("📤 Processing delete tweet event:", message.data);
    const { walletAddress, userHandle, tweetId } = message.data;
    
    sendDeleteTweet(walletAddress, userHandle, tweetId)
      .catch(error => console.error("❌ Error sending delete tweet event:", error));
  } else if (message.type === "SEND_REMOVE_RETWEET_EVENT") {
    console.log("📤 Processing remove retweet event:", message.data);
    
    // Get wallet address and user handle from storage
    chrome.storage.local.get(["walletAddress", "initialUsername"], (result) => {
      const { walletAddress, initialUsername } = result;
      const { tweetId } = message.data;
      
      if (walletAddress && initialUsername) {
        sendRemoveRetweet(walletAddress, initialUsername, tweetId)
          .catch(error => console.error("❌ Error sending remove retweet event:", error));
      } else {
        console.error("❌ Missing wallet address or username for remove retweet event");
      }
    });
  }
  sendResponse({status: 'received'}); // Default for other messages
  return true;
});


// Handle scraped data
function handleScrapedData(data) {
  console.log("📊 Processing data type:", data.type);

  if (data.type === "REPLIES") {
    console.log("💬 Processing replies data:", data.content.length);
    handleRepliesData(data.content).catch((error) =>
      console.error("Error handling replies data:", error)
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
        "sentTweets", // Add this to track sent tweets
      ],
      async (result) => {
        if (!result.isBackgroundTweetScrapingEnabled) {
          console.log("🛑 Tweet scraping disabled, skipping data processing");
          return;
        }

        // FIRST: Save and merge tweets before any API calls
        const existingTweets = result.tweets || [];
        const sentTweets = new Set(result.sentTweets || []);

        // Create a map of existing tweets for faster lookup
        const tweetsMap = new Map();

        // First add existing tweets to the map
        existingTweets.forEach((tweet) => {
          tweetsMap.set(tweet.id, tweet);
        });

        // Then add new tweets, this ensures we keep the existing tweets if they exist
        data.content.forEach((tweet) => {
          if (!tweetsMap.has(tweet.id)) {
            tweetsMap.set(tweet.id, tweet);
          }
        });

        // Convert map back to array and sort
        const mergedTweets = Array.from(tweetsMap.values()).sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );

        console.log("📝 Merged tweets:", {
          total: mergedTweets.length,
          newlyAdded: data.content.length,
          existingBefore: existingTweets.length,
          uniqueTweets: tweetsMap.size,
        });

        // Update tweets storage FIRST
        await chrome.storage.local.set({
          tweets: mergedTweets,
          lastTweetsUpdate: new Date().toISOString(),
        });

        // Broadcast update immediately
        chrome.runtime.sendMessage({
          type: "TWEETS_UPDATED",
          data: mergedTweets,
        });

        console.log("💾 Total tweets stored:", mergedTweets.length);

        // SECOND: Handle API calls if we have wallet and handle
        const walletAddress = result.walletAddress;
        const userHandle = result.initialUsername;

        if (!walletAddress || !userHandle) {
          console.log("⏳ Skipping API calls - missing wallet or handle:", {
            hasWallet: !!walletAddress,
            hasHandle: !!userHandle,
          });
          return;
        }

        // Find unsent tweets from the new batch only
        const unsentTweets = data.content.filter(
          (tweet) => !sentTweets.has(tweet.id)
        );

        console.log("🔐 Current wallet state:", {
          walletAddress,
          userHandle,
          hasWallet: !!walletAddress,
          isWalletPending: walletAddress === "pending",
          unsentTweets: unsentTweets.length,
          totalTweets: mergedTweets.length,
        });

        // Send tweet visits to API if we have unsent tweets
        if (unsentTweets.length > 0) {
          console.log("🌐 Preparing tweet visits:", {
            userHandle,
            tweetCount: unsentTweets.length,
            hasWallet: !!walletAddress,
            walletAddress,
          });

          // Only proceed with API calls if we have a valid wallet address
          if (walletAddress && walletAddress !== "pending") {
            const tweetEvents = unsentTweets.map((tweet) => ({
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

              // Update sent tweets tracking
              const newSentTweets = new Set([
                ...Array.from(sentTweets),
                ...unsentTweets.map((t) => t.id),
              ]);
              await chrome.storage.local.set({
                sentTweets: Array.from(newSentTweets),
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
          console.log("⚠️ No new tweets to send to API");
        }
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
    isProfileScrapingEnabled: false,
    hasScrapedProfile: false,
    hasScrapedLikes: false,
    hasScrapedFollowing: false,
    hasScrapedReplies: false,
    hasInitialAuth: false,
    initialUsername: null,
    tweets: [],
    profileData: null,
    likesCount: null,
    userReplies: [],
    postedTweets: [],
    retweetedTweets: [],
    likedTweets: [],
    followingUsers: [],
    visitedProfiles: [],
    unfollowedUsers: [],
    unlikedTweets: [],
    deletedTweets: [],
    removedRetweets: [],
    sentPosts: [],
    sentReplies: [],
    sentRetweets: [],
    sentLikedTweets: [],
    lastPostsUpdate: null,
    lastLikedTweetsUpdate: null
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
      isLikedTweetsScrapingEnabled: false,
      likedTweetsRequestCount: 0,
      currentLikedTweetsUsername: null,
      likedTweetsScrapeTabId: null,
    });
  }
}

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
      "likedTweets", // Get existing liked tweets
      "sentLikedTweets",
    ]);
    const walletAddress = storage.walletAddress;
    const userHandle = storage.initialUsername;
    const existingTweets = storage.likedTweets || [];
    const sentLikedTweets = storage.sentLikedTweets || new Set();

    // FIRST: Save and merge tweets before any API calls
    // Create a map of existing tweets for faster lookup
    const existingTweetsMap = new Map(
      existingTweets.map((tweet) => [tweet.id, tweet])
    );

    // Add new tweets to the map (this automatically handles duplicates)
    tweets.forEach((tweet) => {
      existingTweetsMap.set(tweet.id, tweet);
    });

    // Convert map back to array and sort
    const mergedTweets = Array.from(existingTweetsMap.values()).sort(
      (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
    );

    console.log("💾 Saving merged liked tweets:", {
      total: mergedTweets.length,
      newlyAdded: tweets.length,
      existingBefore: existingTweets.length,
      mergedTweets: mergedTweets.length,
    });

    // Update storage with tweets FIRST
    await chrome.storage.local.set({
      likedTweets: tweets,
      lastLikedTweetsUpdate: new Date().toISOString(),
    });

    // Broadcast update immediately
    chrome.runtime.sendMessage({
      type: "LIKED_TWEETS_UPDATED",
      data: tweets,
    });

    // SECOND: Handle API calls if we have wallet and handle
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

    // Process API calls after storage is updated
    if (unsentTweets.length > 0) {
      const likeEvents = unsentTweets.map((tweet) => ({
        walletAddress,
        userHandle,
        event: {
          name: "LIKE_TWEET",
          id: tweet.id,
        },
      }));

      try {
        const results = await sendBatchEvents(likeEvents);
        console.log("✅ API calls completed for liked tweets:", {
          total: results.length,
          successful: results.filter((r) => r.status === "fulfilled").length,
        });

        // Update sent tweets tracking
        const newSentTweets = new Set([
          ...Array.from(sentTweetsSet),
          ...unsentTweets.map((t) => t.id),
        ]);
        await chrome.storage.local.set({
          sentLikedTweets: Array.from(newSentTweets),
        });
      } catch (error) {
        console.error("❌ Error sending liked tweets to API:", error);
      }
    }
  } catch (error) {
    console.error("❌ Error processing liked tweets:", error);
    throw error;
  }
}

// Add these new handler functions:

async function handleProfileData(profileData) {
  console.log("Processing profile data:", profileData);

  try {
    // Store in chrome.storage.local with timestamp
    const updatedProfileData = {
      ...profileData,
      lastUpdated: new Date().toISOString(),
    };

    // Store profile data and set flag atomically
    await chrome.storage.local.set({
      profileData: updatedProfileData,
      hasScrapedProfile: true,
    });

    // Broadcast update to UI
    chrome.runtime.sendMessage({
      type: "PROFILE_DATA_UPDATED",
      data: updatedProfileData,
    });

    console.log("✅ Profile data stored successfully:", updatedProfileData);
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

    // Parse likes count as integer
    const likesCount = parseInt(likesData.likes, 10);

    // Merge likes count with profile data
    const updatedProfileData = {
      ...currentProfileData,
      likes: likesCount,
      lastUpdated: new Date().toISOString(),
    };

    // Store everything atomically
    await chrome.storage.local.set({
      likesCount: {
        ...likesData,
        likes: likesCount,
        lastUpdated: new Date().toISOString(),
      },
      profileData: updatedProfileData,
      hasScrapedLikes: true,
    });

    // Broadcast updates
    chrome.runtime.sendMessage({
      type: "PROFILE_DATA_UPDATED",
      data: updatedProfileData,
    });

    chrome.runtime.sendMessage({
      type: "LIKES_COUNT_UPDATED",
      data: {
        ...likesData,
        likes: likesCount,
      },
    });

    console.log("✅ Likes count data stored and merged with profile:", {
      likes: likesCount,
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
  console.log("🔄 Starting Posts and Replies scraping process for:", username);

  try {
    // Set initial state
    await chrome.storage.local.set({
      repliesRequestCount: 0,
      currentRepliesUsername: username,
    });

    console.log("📄 Creating new tab for Posts and Replies scraping...");
    const scrapeUrl = `https://x.com/${username}${REPLIES_SCRAPE_IDENTIFIER}`;
    console.log("🔗 Using URL:", scrapeUrl);

    // Create the tab
    const tab = await chrome.tabs.create({
      url: scrapeUrl,
      active: false,
    });

    console.log("📄 Created new tab for Posts and Replies scrape:", tab.id);

    // Wait for page load then execute scraping
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === "complete") {
        chrome.tabs.onUpdated.removeListener(listener);

        // Give extra time for the page to fully load
        setTimeout(() => {
          console.log(
            "🔄 Sending execute Posts and Replies scrape message to tab:",
            tab.id
          );
          chrome.tabs.sendMessage(tab.id, {
            type: "EXECUTE_REPLIES_SCRAPING",
            username: username,
          });
        }, 3000);
      }
    });
  } catch (error) {
    console.error("❌ Error in Posts and Replies scraping:", error);
    await chrome.storage.local.set({
      isRepliesScrapingEnabled: false,
      repliesRequestCount: 0,
      currentRepliesUsername: null,
      repliesScrapeTabId: null,
    });
  }
}

// Add handler for storing replies
async function handleRepliesData(tweets) {
  if (!tweets || !Array.isArray(tweets)) {
    console.error("❌ Invalid tweets data received:", tweets);
    return;
  }

  try {
    console.log("🔄 Processing tweets batch:", {
      count: tweets.length,
    });

    // Get existing data and user info
    const storage = await chrome.storage.local.get([
      "userReplies",
      "postedTweets",
      "retweetedTweets",
      "walletAddress",
      "initialUsername",
      "sentPosts",
      "sentReplies",
      "sentRetweets",
    ]);

    const walletAddress = storage.walletAddress;
    const userHandle = storage.initialUsername;
    const sentPosts = new Set(storage.sentPosts || []);
    const sentReplies = new Set(storage.sentReplies || []);
    const sentRetweets = new Set(storage.sentRetweets || []);
    const existingPostedTweets = storage.postedTweets || [];
    const existingReplies = storage.userReplies || [];
    const existingRetweets = storage.retweetedTweets || [];

    if (!walletAddress || !userHandle) {
      console.log("⏳ Skipping API calls - missing wallet or handle:", {
        hasWallet: !!walletAddress,
        hasHandle: !!userHandle,
      });
      return;
    }

    console.log("🔍 Debug info:", {
      userHandle,
      sampleTweetUser: tweets[0]?.user
    });

    // Separate posts, retweets and replies
    const posts = [];
    const replies = [];
    const retweets = [];

    tweets.forEach((tweet) => {
      // Handle different data structures from content.js vs Twitter API
      const processedTweet = {
        id: tweet.rest_id || tweet.id,
        text: tweet.legacy?.full_text || tweet.legacy?.text || tweet.text,
        timestamp: tweet.legacy?.created_at || tweet.created_at,
        metrics: {
          replies: tweet.legacy?.reply_count || tweet.metrics?.reply_count || 0,
          retweets: tweet.legacy?.retweet_count || tweet.metrics?.retweet_count || 0,
          likes: tweet.legacy?.favorite_count || tweet.metrics?.favorite_count || 0,
        },
        user: {
          name: tweet.core?.user_results?.result?.legacy?.name || tweet.user?.name,
          handle: tweet.core?.user_results?.result?.legacy?.screen_name || tweet.user?.screen_name,
          avatar: tweet.core?.user_results?.result?.legacy?.profile_image_url_https || tweet.user?.profile_image_url,
        },
        in_reply_to_screen_name: tweet.legacy?.in_reply_to_screen_name || tweet.in_reply_to_screen_name,
        in_reply_to_status_id_str: tweet.legacy?.in_reply_to_status_id_str || tweet.in_reply_to_status_id,
      };

      console.log("🔍 Processing tweet:", {
        id: processedTweet.id,
        userHandle: processedTweet.user.handle,
        expectedHandle: userHandle,
        isReply: !!processedTweet.in_reply_to_screen_name,
        hasRetweetedStatus: !!(tweet.legacy?.retweeted_status_result)
      });

      // Check for retweet first by looking for retweeted_status_result
      if (tweet.legacy?.retweeted_status_result) {
        // This is a nested retweet structure
        const originalTweet = tweet.legacy.retweeted_status_result.result;
        processedTweet.original_tweet = {
          id: originalTweet.rest_id,
          text: originalTweet.legacy?.full_text || originalTweet.legacy?.text,
          user: {
            name: originalTweet.core?.user_results?.result?.legacy?.name,
            handle: originalTweet.core?.user_results?.result?.legacy?.screen_name,
            avatar: originalTweet.core?.user_results?.result?.legacy?.profile_image_url_https
          }
        };
        retweets.push(processedTweet);
        console.log("📄 Categorized as nested retweet:", processedTweet.id);
      } else if (tweet.text && tweet.text.startsWith('RT @')) {
        // This is a flattened retweet structure - text starts with "RT @"
        const rtMatch = tweet.text.match(/^RT @(\w+): (.+)$/);
        if (rtMatch) {
          const [, originalHandle, originalText] = rtMatch;
          processedTweet.original_tweet = {
            id: null, // Original tweet ID not available in this format
            text: originalText,
            user: {
              name: null, // Original user name not available
              handle: originalHandle,
              avatar: null // Original user avatar not available
            }
          };
          retweets.push(processedTweet);
          console.log("📄 Categorized as flattened retweet:", processedTweet.id);
        }
      } else if (processedTweet.in_reply_to_screen_name) {
        // This is a reply
        replies.push(processedTweet);
        console.log("💬 Categorized as reply:", processedTweet.id);
      } else {
        // This is a regular post - be more flexible with handle matching
        // Since the user data might be empty from content.js, assume it's the user's post
        // if it's not a reply or retweet and we're processing their timeline
        posts.push(processedTweet);
        console.log("📝 Categorized as post:", processedTweet.id);
      }
    });

    console.log("📊 Separated tweets:", {
      posts: posts.length,
      replies: replies.length,
      retweets: retweets.length
    });

    // Process posts
    if (posts.length > 0) {
      const unsentPosts = posts.filter((post) => !sentPosts.has(post.id));
      if (unsentPosts.length > 0) {
        try {
          const results = await Promise.all(
            unsentPosts.map((post) =>
              sendCreateTweet(walletAddress, userHandle, post.text, post.id)
            )
          );

          // Update sent posts tracking
          const newSentPosts = new Set([
            ...Array.from(sentPosts),
            ...unsentPosts.map((p) => p.id),
          ]);
          await chrome.storage.local.set({
            sentPosts: Array.from(newSentPosts),
          });

          console.log("✅ Processed posts:", {
            total: results.length,
            successful: results.filter((r) => r.success).length,
          });
        } catch (error) {
          console.error("❌ Error processing posts:", error);
        }
      }
    }

    // Process replies
    if (replies.length > 0) {
      const unsentReplies = replies.filter(
        (reply) => !sentReplies.has(reply.id)
      );
      if (unsentReplies.length > 0) {
        try {
          const results = await Promise.all(
            unsentReplies.map((reply) =>
              sendReplyTweet(
                walletAddress,
                userHandle,
                reply.id,
                reply.text,
                reply.in_reply_to_status_id_str,
                reply.in_reply_to_screen_name
              )
            )
          );

          // Update sent replies tracking
          const newSentReplies = new Set([
            ...Array.from(sentReplies),
            ...unsentReplies.map((r) => r.id),
          ]);
          await chrome.storage.local.set({
            sentReplies: Array.from(newSentReplies),
          });

          console.log("✅ Processed replies:", {
            total: results.length,
            successful: results.filter((r) => r.success).length,
          });
        } catch (error) {
          console.error("❌ Error processing replies:", error);
        }
      }
    }

    // Process retweets
    if (retweets.length > 0) {
      const unsentRetweets = retweets.filter((retweet) => !sentRetweets.has(retweet.id));
      if (unsentRetweets.length > 0) {
        try {
          const results = await Promise.all(
            unsentRetweets.map((retweet) =>
              sendRetweet(walletAddress, userHandle, retweet.id)
            )
          );

          // Update sent retweets tracking
          const newSentRetweets = new Set([
            ...Array.from(sentRetweets),
            ...unsentRetweets.map((r) => r.id),
          ]);
          await chrome.storage.local.set({
            sentRetweets: Array.from(newSentRetweets),
          });

          console.log("✅ Processed retweets:", {
            total: results.length,
            successful: results.filter((r) => r.success).length,
          });
        } catch (error) {
          console.error("❌ Error processing retweets:", error);
        }
      }
    }

    // Merge with existing data and remove duplicates
    const mergedPosts = [...existingPostedTweets];
    const mergedReplies = [...existingReplies];
    const mergedRetweets = [...existingRetweets];

    // Add new posts
    posts.forEach((post) => {
      if (!mergedPosts.some((existing) => existing.id === post.id)) {
        mergedPosts.push(post);
      }
    });

    // Add new replies
    replies.forEach((reply) => {
      if (!mergedReplies.some((existing) => existing.id === reply.id)) {
        mergedReplies.push(reply);
      }
    });

    // Add new retweets
    retweets.forEach((retweet) => {
      if (!mergedRetweets.some((existing) => existing.id === retweet.id)) {
        mergedRetweets.push(retweet);
      }
    });

    // Sort by timestamp
    const sortByTimestamp = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
    mergedPosts.sort(sortByTimestamp);
    mergedReplies.sort(sortByTimestamp);
    mergedRetweets.sort(sortByTimestamp);

    // Update storage with merged data
    await chrome.storage.local.set({
      postedTweets: mergedPosts,
      userReplies: mergedReplies,
      retweetedTweets: mergedRetweets,
      lastPostsUpdate: new Date().toISOString(),
      hasScrapedReplies: true,
    });

    console.log("💾 Updated storage with:", {
      postedTweets: mergedPosts.length,
      userReplies: mergedReplies.length,
      retweetedTweets: mergedRetweets.length
    });

    // Broadcast updates
    chrome.runtime.sendMessage({
      type: "POSTED_TWEETS_UPDATED",
      data: mergedPosts,
    });

    chrome.runtime.sendMessage({
      type: "REPLIES_UPDATED",
      data: mergedReplies,
    });

    chrome.runtime.sendMessage({
      type: "RETWEETS_UPDATED",
      data: mergedRetweets,
    });
  } catch (error) {
    console.error("❌ Error processing tweets:", error);
    throw error;
  }
}

// Add new handler functions
async function handleProfileScraping(enabled) {
    console.log("🔄 Handling profile and visit scraping:", enabled);
    if (!enabled) {
        chrome.storage.local.set({ 
            isProfileScrapingEnabled: false,
            isProfileVisitScrapingEnabled: false,
        });
        return;
    }

    try {
        console.log("🔄 Starting profile scraping...");
        
        // Get username before proceeding
        const storage = await chrome.storage.local.get(['initialUsername', 'hasInitialAuth', 'hasScrapedProfile']);
        
        // If profile is already scraped, don't scrape again
        if (storage.hasScrapedProfile) {
            console.log('✅ Profile already scraped, skipping...');
            return;
        }

        // If no username exists, open x.com in background
        if (!storage.initialUsername && !storage.hasInitialAuth) {
            console.log('⚠️ No username found, opening x.com for authentication...');
            await chrome.tabs.create({
                url: 'https://x.com',
                active: false
            });
            return; // Exit and wait for auth to complete
        }

        console.log('✅ Username found, proceeding with one-time scraping:', storage.initialUsername);
        
        chrome.storage.local.set({
            isProfileScrapingEnabled: true,
            isProfileVisitScrapingEnabled: true
        });

        // Create profile scraping tab for one-time scrape
        const initialTab = await chrome.tabs.create({
            url: `https://x.com/${storage.initialUsername}${PROFILE_SCRAPE_IDENTIFIER}`,
            active: false,
        });

        // Set up profile visit monitoring on all Twitter tabs
        const twitterTabs = await chrome.tabs.query({ url: ["*://*.x.com/*", "*://*.twitter.com/*"] });
        for (const tab of twitterTabs) {
            chrome.tabs.sendMessage(tab.id, {
                type: 'EXECUTE_PROFILE_VISIT_SCRAPING'
            }).catch(error => {
                console.log('Tab might not be ready yet:', error, tab.id);
            });
        }

        console.log("✅ Created profile scraping tab:", initialTab.id);
    } catch (error) {
        console.error("❌ Error in profile scraping:", error);
        chrome.storage.local.set({ 
            isProfileScrapingEnabled: false, 
            isProfileVisitScrapingEnabled: false
        });
    }
}
