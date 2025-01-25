// Keep service worker active
const PING_INTERVAL = 6000;
const TWEET_SCRAPE_IDENTIFIER = '?q=wootzapp-tweets';
const FOLLOWING_SCRAPE_IDENTIFIER = '?q=wootzapp-following';
const LIKED_TWEETS_SCRAPE_IDENTIFIER = '?q=wootzapp-liked-tweets';
const MAX_TWEETS_PER_TAB = 150;

console.log('⚙️ Background service worker starting with ping interval:', PING_INTERVAL);

// Create alarm for keeping alive
chrome.alarms.create('keepAlive', { periodInMinutes: 0.1 });
console.log('⏰ Created keepAlive alarm');

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('🟢 Service Worker Active:', new Date().toISOString());
  }
});

// Handle messages from content script
console.log('📡 Setting up message listeners...');
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Add immediate response to keep connection alive
  const keepConnectionAlive = true;

  if (message.type === 'SCRAPED_DATA' && message.data.type === 'LIKED_TWEETS') {
    console.log('📥 Received liked tweets data');
    handleLikedTweetsData(message.data.content, message.data.metadata)
        .catch(error => console.error('Error handling liked tweets:', error));
    return true;
}

  if (message.type === 'SCRAPED_DATA' && message.data.type === 'PROFILE') {
    console.log('📥 Received profile data');
    handleProfileData(message.data.content)
        .catch(error => console.error('Error handling profile data:', error));
    return true;
  }

  if (message.type === 'SCRAPED_DATA' && message.data.type === 'LIKES_COUNT') {
    console.log('📥 Received likes count data');
    handleLikesCountData(message.data.content)
        .catch(error => console.error('Error handling likes count:', error));
    return true;
  }

  // if (message.type === 'SCRAPED_DATA') {
  //   console.log('📥 Received SCRAPED_DATA from tab:', sender.tab?.id);
    
  //   // Send immediate response
  //   sendResponse({ status: 'processing' });
  //   return keepConnectionAlive;
  // }
  
  console.log('📨 Received message:', message.type, 'from tab:', sender.tab?.id);
  
  if (message.type === 'INITIAL_AUTH_USERNAME') {
    console.log('🔑 Received initial auth username:', message.data.username);
    
    // Store the username
    chrome.storage.local.set({ 
      initialUsername: message.data.username,
      hasInitialAuth: true 
    }, () => {
      console.log('✅ Stored initial username:', message.data.username);
    });
  } else if (message.type === 'CLOSE_TAB') {
    console.log('🔒 Closing tab:', sender.tab?.id);
    chrome.tabs.remove(sender.tab.id);
  } else if (message.type === 'GET_PROFILE_DATA') {
    chrome.storage.local.get(['profileData'], (result) => {
      sendResponse({ profileData: result.profileData });
    });
    return true;
  } else if (message.type === 'TOGGLE_SCRAPING') {
    handleScrapingToggle(message.enabled, sender.tab?.id);
  } else if (message.type === 'FOLLOWING_USERS_UPDATED') {
    console.log('👥 Following users update received:', message.data);
    
    // Store in chrome.storage.local, replacing existing data
    chrome.storage.local.set({ 
      followingUsers: message.data,
      hasScrapedFollowing: true  // Set this after successful scrape
    }, () => {
      console.log('💾 Following users stored:', message.data.length);
      
      // Broadcast to UI
      chrome.runtime.sendMessage({
        type: 'FOLLOWING_USERS_UPDATED',
        data: message.data
      }, () => {
        console.log('📢 Following users broadcast sent');
      });
    });
  } else if (message.type === 'START_FOLLOWING_SCRAPE') {
    handleFollowingScrape(message.username);
  } else if (message.type === 'TWITTER_AUTH_STATUS') {
    console.log('🔐 Received Twitter auth status:', message.data);
    
    // Store auth status
    chrome.storage.local.set({ 
      isTwitterAuthenticated: message.data.isAuthenticated 
    }, () => {
      // Broadcast to UI
      chrome.runtime.sendMessage({
        type: 'TWITTER_AUTH_UPDATED',
        data: message.data
      });
    });
  } else if (message.type === 'TOGGLE_BACKGROUND_TWEET_SCRAPING') {
    console.log('🔄 Background tweet scraping toggle:', message.enabled);
    handleBackgroundTweetScraping(message.username);
  } else if (message.type === 'STOP_ALL_SCRAPING') {
    console.log('🛑 Stopping all scraping processes');
    
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
      isFollowingEnabled: false
    });

    // Clear any pending liked tweets timeout
    chrome.storage.local.get(['likedTweetsScrapingTimeoutId'], (result) => {
      if (result.likedTweetsScrapingTimeoutId) {
        clearTimeout(result.likedTweetsScrapingTimeoutId);
        chrome.storage.local.remove('likedTweetsScrapingTimeoutId');
      }
    });
  } else if (message.type === 'SCHEDULE_NEXT_SCRAPING') {
    console.log('📅 Scheduling next scraping session...');
    
    // First close the current tab
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id);
    }
    
    // Store the timeout ID so we can cancel it if needed
    const timeoutId = setTimeout(() => {
      console.log('⏰ Starting next scraping session');
      handleBackgroundTweetScraping(message.data.username);
    }, 30000);

    // Store the timeout ID
    chrome.storage.local.set({ backgroundScrapeTimeoutId: timeoutId });
  } else if (message.type === 'SCHEDULE_NEXT_LIKED_TWEETS_SCRAPING') {
    console.log('📅 Scheduling next liked tweets scraping session...');
    
    // First close the current tab
    if (sender.tab?.id) {
      chrome.tabs.remove(sender.tab.id);
    }
    
    // Schedule next session after 30 seconds
    const timeoutId = setTimeout(() => {
      console.log('⏰ Starting next liked tweets scraping session');
      handleLikedTweetsScraping(message.data.username);
    }, 30000);

    // Store the timeout ID
    chrome.storage.local.set({ likedTweetsScrapingTimeoutId: timeoutId });
  } else if (message.type === 'START_LIKED_TWEETS_SCRAPING') {
    console.log('📣 Received START_LIKED_TWEETS_SCRAPING:', message.data);
    handleLikedTweetsScraping(message.data.username)
      .catch(error => console.error('Error handling liked tweets scraping:', error));
    return true;
  } else if (message.type === 'LIKED_TWEETS_DIAGNOSTIC') {
    console.log('📊 Liked Tweets Diagnostic:', {
      tabId: sender.tab?.id,
      ...message.data,
      selectorResults: message.data.selectorResults
    });
  }
  
  return true;
});

// Handle scraping toggle
async function handleScrapingToggle(enabled, tabId) {
  console.log('🔄 Handling scraping toggle:', enabled);

  if (!enabled) {
    chrome.storage.local.set({ isScrapingEnabled: false });
    return;
  }

  try {
    console.log('🔄 Starting profile and likes scraping...');
    await chrome.tabs.create({
      url: 'https://x.com',
      active: false
    });

    chrome.storage.local.set({ 
      isScrapingEnabled: true,
      hasScrapedProfile: false,
      hasScrapedLikes: false
    });
  } catch (error) {
    console.error('❌ Error in scraping toggle:', error);
  }
}

// Handle scraped data
function handleScrapedData(data) {
  console.log('📊 Processing data type:', data.type);
  
  if (data.type === 'TWEETS') {
    // Check if tweet scraping is still enabled before processing
    chrome.storage.local.get(['isBackgroundTweetScrapingEnabled', 'tweets'], (result) => {
      if (!result.isBackgroundTweetScrapingEnabled) {
        console.log('🛑 Tweet scraping disabled, skipping data processing');
        return;
      }

      const existingTweets = result.tweets || [];
      console.log('📊 Existing tweets:', existingTweets.length);

      // Filter out duplicates
      const newTweets = data.content.filter(newTweet => 
        !existingTweets.some(existing => existing.id === newTweet.id)
      );
      
      console.log('📝 New unique tweets:', newTweets.length);
      
      // Combine, sort and limit tweets
      const updatedTweets = [...existingTweets, ...newTweets]
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
        .slice(0, MAX_TWEETS);
      
      // Store updated tweets
      chrome.storage.local.set({ tweets: updatedTweets }, () => {
        console.log('💾 Total tweets stored:', updatedTweets.length);
        
        // Broadcast update
        chrome.runtime.sendMessage({
          type: 'TWEETS_UPDATED',
          data: updatedTweets
        });
      });
    });
    return;
  }

  if (data.type === 'PROFILE') {
    const profileData = data.content;
    chrome.storage.local.get(['likesCount'], (result) => {
      const mergedData = {
        ...profileData,
        likes: result.likesCount?.likes || undefined
      };
      
      chrome.storage.local.set({ 
        profileData: mergedData,
        hasScrapedProfile: true 
      }, () => {
        console.log('💾 Profile data stored:', mergedData);
        
        chrome.runtime.sendMessage({
          type: 'PROFILE_DATA_UPDATED',
          data: mergedData
        }, () => {
          console.log('📢 Profile data broadcast sent');
        });
      });
    });
  } else if (data.type === 'LIKES_COUNT') {
    console.log('❤️ Processing likes count:', data.content);
    const likesData = data.content;
    
    chrome.storage.local.get(['profileData'], (result) => {
      const mergedProfileData = {
        ...result.profileData,
        likes: likesData.likes
      };
      
      chrome.storage.local.set({ 
        likesCount: likesData,
        profileData: mergedProfileData,
        hasScrapedLikes: true 
      }, () => {
        console.log('💾 Likes count stored:', likesData);
        console.log('💾 Updated profile data:', mergedProfileData);
        
        chrome.runtime.sendMessage({
          type: 'PROFILE_DATA_UPDATED',
          data: mergedProfileData
        });
        
        chrome.runtime.sendMessage({
          type: 'LIKES_COUNT_UPDATED',
          data: likesData
        }, () => {
          console.log('📢 Data broadcasts sent');
        });
      });
    });
  } else if (data.type === 'LIKED_TWEETS') {
    chrome.storage.local.get(['likedTweets'], (result) => {
      const existingTweets = result.likedTweets || [];
      const newTweets = data.content.filter(newTweet => 
        !existingTweets.some(existing => existing.id === newTweet.id)
      );
      
      const updatedTweets = [...existingTweets, ...newTweets];
      
      chrome.storage.local.set({ 
        likedTweets: updatedTweets 
      }, () => {
        console.log('💾 Liked tweets stored:', {
          new: newTweets.length,
          total: updatedTweets.length
        });
        
        chrome.runtime.sendMessage({
          type: 'LIKED_TWEETS_UPDATED',
          data: updatedTweets
        });
      });
    });
  }
}

// Keep alive interval backup
setInterval(() => {
  console.log('⏰ Service Worker Interval:', new Date().toISOString());
}, PING_INTERVAL);

// Initialize extension - no auto-opening of x.com
chrome.runtime.onInstalled.addListener(() => {
  console.log('🎉 Extension installed');
  chrome.storage.local.set({ 
    isScrapingEnabled: false,
    hasScrapedProfile: false,
    hasScrapedLikes: false,
    hasScrapedFollowing: false,
    hasInitialAuth: false,
    initialUsername: null,
    tweets: [],
    profileData: null,
    likesCount: null
  });
});

console.log('🚀 Background Service Worker Initialized');

// Add this new function to handle following scraping
async function handleFollowingScrape(username) {
  console.log('🔄 Starting following scrape process for:', username);

  try {
    // Clear existing following data before starting new scrape
    await chrome.storage.local.set({ 
      followingUsers: [],
      hasScrapedFollowing: false 
    });
    console.log('🧹 Cleared existing following data');

    // Use the following-specific identifier
    const scrapeUrl = `https://x.com/${username}${FOLLOWING_SCRAPE_IDENTIFIER}`;
    
    // Create a new tab with the following URL
    const tab = await chrome.tabs.create({ 
      url: scrapeUrl,
      active: false
    });

    console.log('📄 Created new tab for following scrape:', tab.id);

    // Wait for page load then execute scraping
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Give extra time for the page to fully load
        setTimeout(() => {
          console.log('🔄 Sending execute following scrape message to tab:', tab.id);
          chrome.tabs.sendMessage(tab.id, {
            type: 'EXECUTE_FOLLOWING_SCRAPE',
            username: username
          });
        }, 3000);
      }
    });

  } catch (error) {
    console.error('Error in following scrape process:', error);
    chrome.storage.local.set({ 
      isFollowingScrapeMode: false,
      hasScrapedFollowing: false
    });
  }
}

// Add new function to handle background tweet scraping
async function handleBackgroundTweetScraping(username) {
  console.log('🔄 Starting background tweet scraping process for:', username);

  try {
    await chrome.storage.local.set({ isBackgroundTweetScrapingEnabled: true });

    // Use the tweet-specific identifier
    const tab = await chrome.tabs.create({
      url: `https://x.com/${username}${TWEET_SCRAPE_IDENTIFIER}`,
      active: false
    });

    // Wait for page load and send message to content script
    chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
      if (tabId === tab.id && info.status === 'complete') {
        chrome.tabs.onUpdated.removeListener(listener);
        
        // Send message to content script to start tweet scraping
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'EXECUTE_TWEET_SCRAPING'
          });
        }, 3000);
      }
    });
    
  } catch (error) {
    console.error('Error in background tweet scraping:', error);
    chrome.storage.local.set({ isBackgroundTweetScrapingEnabled: false });
  }
}

// Add function to handle liked tweets scraping
async function handleLikedTweetsScraping(username) {
  console.log('🔄 Starting liked tweets scraping process for:', username);

  try {
    // Set initial state
    await chrome.storage.local.set({ 
      // isLikedTweetScrapingEnabled: true,
      likedTweetsRequestCount: 0,
      currentLikedTweetsUsername: username
    });

    console.log('📄 Creating new tab for liked tweets scraping...');
    const scrapeUrl = `https://x.com/${username}${LIKED_TWEETS_SCRAPE_IDENTIFIER}`;
    console.log('🔗 Using URL:', scrapeUrl);

    // Create the tab
    const tab = await chrome.tabs.create({
      url: scrapeUrl,
      active: false
    });

    console.log('✅ Created tab:', tab.id);

    // Store tab ID
    await chrome.storage.local.set({ likedTweetsScrapeTabId: tab.id });

    // No need to send additional message - content script will auto-start
    console.log('⏳ Waiting for content script to handle scraping...');
    
  } catch (error) {
    console.error('❌ Error in liked tweets scraping:', error);
    await chrome.storage.local.set({ 
      isLikedTweetScrapingEnabled: false,
      likedTweetsRequestCount: 0,
      currentLikedTweetsUsername: null,
      likedTweetsScrapeTabId: null
    });
  }
}

// // Add this new function to handle liked tweets
// async function handleLikedTweetsData(tweets, metadata) {
//     if (!tweets || !Array.isArray(tweets)) {
//         console.error('❌ Invalid tweets data received:', { tweets, metadata });
//         return;
//     }

//     try {
//         console.log('🔄 Starting batch processing:', {
//             tweetsCount: tweets.length,
//             metadata
//         });

//         // Get existing liked tweets with error handling
//         const storage = await chrome.storage.local.get(['likedTweets', 'likesCount']);
//         const existingTweets = storage.likedTweets || [];
//         const totalLikedTweets = storage.likesCount?.likes || 0;

//         // Create Set for faster duplicate checking
//         const existingIds = new Set(existingTweets.map(t => t.id));
        
//         // Filter new tweets
//         const newTweets = tweets.filter(tweet => !existingIds.has(tweet.id));

//         console.log('📊 Batch stats:', {
//             existing: existingTweets.length,
//             incoming: tweets.length,
//             new: newTweets.length,
//             total: existingTweets.length + newTweets.length,
//             target: totalLikedTweets
//         });

//         if (newTweets.length > 0) {
//             // Update storage with new tweets
//             const updatedTweets = [...existingTweets, ...newTweets];
//             await chrome.storage.local.set({
//                 likedTweets: updatedTweets,
//                 lastUpdate: new Date().toISOString()
//             });

//             // Broadcast update
//             await chrome.runtime.sendMessage({
//                 type: 'LIKED_TWEETS_UPDATED',
//                 data: {
//                     tweets: updatedTweets,
//                     metadata: {
//                         newTweetsCount: newTweets.length,
//                         totalTweets: updatedTweets.length,
//                         batchMetadata: metadata,
//                         timestamp: new Date().toISOString()
//                     }
//                 }
//             }).catch(error => {
//                 console.log('Broadcast error (non-critical):', error);
//             });

//             // Check progress and schedule next batch if needed
//             if (updatedTweets.length < totalLikedTweets) {
//                 const progress = (updatedTweets.length / totalLikedTweets) * 100;
//                 console.log(`📈 Progress: ${progress.toFixed(1)}% (${updatedTweets.length}/${totalLikedTweets})`);
                
//                 if (metadata?.batchNumber >= MAX_TWEETS_PER_TAB) {
//                     console.log('🔄 Scheduling next batch...');
//                     const username = metadata?.url?.split('/')[3];
//                     if (username) {
//                         // Schedule with delay to avoid rate limiting
//                         setTimeout(() => {
//                             handleLikedTweetsScraping(username)
//                                 .catch(error => console.error('Next batch scheduling error:', error));
//                         }, 5000);
//                     }
//                 }
//             } else {
//                 console.log('✅ All liked tweets collected!');
//                 await chrome.runtime.sendMessage({
//                     type: 'LIKED_TWEETS_SCRAPING_COMPLETE'
//                 }).catch(() => {});
//             }
//         } else {
//             console.log('ℹ️ No new tweets in this batch');
//         }

//     } catch (error) {
//         console.error('❌ Error in handleLikedTweetsData:', {
//             error,
//             tweetsLength: tweets?.length,
//             metadata
//         });
//         throw error; // Rethrow to trigger error handling in caller
//     }
// }

// Add to background.js

// Handle liked tweets data separately from normal tweets
async function handleLikedTweetsData(tweets, metadata) {
    if (!tweets || !Array.isArray(tweets)) {
        console.error('❌ Invalid liked tweets data received:', tweets);
        return;
    }
    try {
        console.log('🔄 Processing liked tweets batch:', {
            count: tweets.length,
            metadata
        });
        
        // Get existing liked tweets
        const storage = await chrome.storage.local.get(['likedTweets']);
        const existingTweets = storage.likedTweets || [];

        // Create Set for faster duplicate checking
        const existingIds = new Set(existingTweets.map(t => t.id));
        
        // Filter new tweets
        const newTweets = tweets.filter(tweet => !existingIds.has(tweet.id));

        console.log('📊 Liked tweets batch stats:', {
            existing: existingTweets.length,
            new: newTweets.length,
            total: existingTweets.length + newTweets.length
        });

        if (newTweets.length > 0) {
            // Combine and sort tweets
            const updatedTweets = [...existingTweets, ...newTweets]
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .slice(0, MAX_TWEETS_PER_TAB); // Keep latest 15000 tweets

            // Update storage
            await chrome.storage.local.set({
                likedTweets: updatedTweets,
                lastLikedTweetsUpdate: new Date().toISOString()
            });

            // Broadcast update
            chrome.runtime.sendMessage({
                type: 'LIKED_TWEETS_UPDATED',
                data: updatedTweets
            });
        }

    } catch (error) {
        console.error('❌ Error processing liked tweets:', error);
        throw error;
    }
}

// Add these new handler functions:

async function handleProfileData(profileData) {
  console.log('Processing profile data:', profileData.username);
  
  try {
    // Store in chrome.storage.local
    await chrome.storage.local.set({
      profileData: {
        ...profileData,
        lastUpdated: new Date().toISOString()
      }
    });
     // Store merged data
     await chrome.storage.local.set({
     
      hasScrapedProfile: true  // Set this flag to indicate profile scraping is complete
    });
    
    console.log('✅ Profile data stored successfully');
  } catch (error) {
    console.error('Error storing profile data:', error);
    throw error;
  }
}

async function handleLikesCountData(likesData) {
  console.log('Processing likes count data:', likesData);
  
  try {
    // Get current profile data
    const storage = await chrome.storage.local.get(['profileData']);
    const currentProfileData = storage.profileData || {};

    // Merge likes count with profile data
    const updatedProfileData = {
      ...currentProfileData,
      likes: likesData.likes, // Add likes count directly to profile data
      lastUpdated: new Date().toISOString()
    };

    // Store both the separate likes count and updated profile data
    await chrome.storage.local.set({
      likesCountData: {
        ...likesData,
        lastUpdated: new Date().toISOString()
      },
      profileData: updatedProfileData, // Store updated profile data
      hasScrapedLikes: true
      // isLikedTweetScrapingEnabled: true
    });
    
    // Broadcast profile data update to UI
    chrome.runtime.sendMessage({
      type: 'PROFILE_DATA_UPDATED',
      data: updatedProfileData
    });
    
    console.log('✅ Likes count data stored and merged with profile:', {
      likes: likesData.likes,
      profileData: updatedProfileData
    });
  } catch (error) {
    console.error('Error storing likes count data:', error);
    throw error;
  }
}
// Add to the message listener in background.js



