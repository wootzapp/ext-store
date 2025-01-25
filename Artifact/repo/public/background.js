// Keep service worker active
const PING_INTERVAL = 6000;
const TWEET_SCRAPE_IDENTIFIER = '?q=wootzapp-tweets';
const FOLLOWING_SCRAPE_IDENTIFIER = '?q=wootzapp-following';

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
  } else if (message.type === 'SCRAPED_DATA') {
    console.log('🔍 Processing scraped data...');
    handleScrapedData(message.data);
    sendResponse({ status: 'received' });
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
  } else if (message.type === 'URL_LOG_SUCCESS') {
    console.log('✅ URL successfully logged:', message.url);
  } else if (message.type === 'URL_LOG_ERROR') {
    console.error('❌ Error logging URL:', message.error);
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
    chrome.storage.local.get(['isBackgroundTweetScrapingEnabled'], (result) => {
      if (!result.isBackgroundTweetScrapingEnabled) {
        console.log('🛑 Tweet scraping disabled, skipping data processing');
        return;
      }
      console.log('🐦 Received tweets:', data.content.length);
      
      chrome.storage.local.get(['tweets'], (result) => {
        const existingTweets = result.tweets || [];
        console.log('📊 Existing tweets:', existingTweets.length);

        const newTweets = data.content.filter(newTweet => 
          !existingTweets.some(existing => existing.id === newTweet.id)
        );
        
        console.log('📝 New unique tweets:', newTweets.length);
        
        const updatedTweets = [...existingTweets, ...newTweets];
        
        chrome.storage.local.set({ tweets: updatedTweets }, () => {
          console.log('💾 Total tweets stored:', updatedTweets.length);
          
          chrome.runtime.sendMessage({
            type: 'TWEETS_UPDATED',
            data: updatedTweets
          }, () => {
            console.log('📢 Tweet update broadcast sent');
          });
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

// Create a queue to store URLs that need to be logged
let urlQueue = [];

// Update handleUrlLogging to use the queue
async function handleUrlLogging(url) {
  if (!url) return;

  // Add URL to queue with timestamp
  urlQueue.push({
    url: url,
    timestamp: new Date().toISOString()
  });

  // Store the updated queue in chrome.storage
  chrome.storage.local.set({ pendingUrls: urlQueue }, () => {
    console.log('📝 URL added to queue:', url);
  });

  // Try to process queue if we have auth token
  processUrlQueue();
}

// New function to process the URL queue
async function processUrlQueue() {
  try {
    // Get auth token
    const result = await chrome.storage.local.get(['authToken']);
    const authToken = result.authToken;

    if (!authToken) {
      console.log('⚠️ No auth token available, keeping URLs in queue');
      return;
    }

    console.log('🔄 Processing URL queue:', urlQueue.length, 'items');

    // Process each URL in the queue
    for (let i = urlQueue.length - 1; i >= 0; i--) {
      const { url } = urlQueue[i];
      
      try {
        const response = await fetch(
          'https://api-staging-0.gotartifact.com/v2/logs/url',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encrypted_url: url }),
          }
        );

        if (response.ok) {
          // Remove successfully processed URL from queue
          urlQueue.splice(i, 1);
          console.log('✅ Successfully logged URL:', url);
        } else {
          console.error('❌ Failed to log URL:', url);
        }
      } catch (error) {
        console.error('❌ Error processing URL:', url, error);
      }
    }

    // Update stored queue
    chrome.storage.local.set({ pendingUrls: urlQueue });

  } catch (error) {
    console.error('❌ Error processing URL queue:', error);
  }
}

// Add listener for auth token updates
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.authToken) {
    if (changes.authToken.newValue) {
      console.log('🔑 Auth token received, processing pending URLs');
      processUrlQueue();
    }
  }
});

// Load saved queue on startup
chrome.storage.local.get(['pendingUrls'], (result) => {
  if (result.pendingUrls) {
    urlQueue = result.pendingUrls;
    console.log('📋 Loaded pending URLs:', urlQueue.length);
    processUrlQueue();
  }
});

// Store the current tab count
let previousTabCount = 0;

// Add a flag to track if initial URLs have been queued
let initialUrlsQueued = false;

// Update monitorTabs function
async function monitorTabs() {
  try {
    const tabs = await chrome.tabs.query({});
    const currentTabCount = tabs.length;

    // Get auth status
    const { authToken } = await chrome.storage.local.get(['authToken']);

    // Handle initial URL queueing when extension first loads
    if (!initialUrlsQueued) {
      console.log('📋 Queueing initial URLs from all tabs');
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome-native://newtab') && 
            !urlQueue.some(item => item.url === tab.url)) {
          handleUrlLogging(tab.url);
        }
      });
      initialUrlsQueued = true;
      previousTabCount = currentTabCount;
      return;
    }

    // Log tab count changes
    if (currentTabCount !== previousTabCount) {
      console.log(`📊 Tab count increased: ${previousTabCount} -> ${currentTabCount}`);
    }

    // If authenticated, only monitor new tabs
    if (authToken && currentTabCount > previousTabCount) {
      console.log('🔑 Authenticated: Only checking new tabs');
      // Only get the most recently created tab
      const newTabs = tabs.slice(previousTabCount);
      newTabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome-native://newtab') && 
            !urlQueue.some(item => item.url === tab.url)) {
          console.log('🆕 New authenticated tab URL:', tab.url);
          handleUrlLogging(tab.url);
        }
      });
    }
    // If not authenticated, queue all URLs for later processing
    else if (!authToken && currentTabCount > previousTabCount) {
      console.log('🔒 Not authenticated: Queueing all URLs');
      tabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome-native://newtab') && 
            !urlQueue.some(item => item.url === tab.url)) {
          handleUrlLogging(tab.url);
        }
      });
    }

    previousTabCount = currentTabCount;
  } catch (error) {
    console.error('❌ Error monitoring tabs:', error);
  }
}

// Initialize previousTabCount when extension starts
chrome.tabs.query({}, (tabs) => {
  previousTabCount = tabs.length;
  console.log(`📊 Initial tab count: ${previousTabCount}`);
});

// Update the initialization listener
chrome.runtime.onInstalled.addListener(() => {
  console.log('🎉 URL Logger installed');
  initialUrlsQueued = false; // Reset the flag
  monitorTabs(); // Queue all initial URLs
});

// Store the current active tab URL
let currentActiveTabUrl = null;

// Function to check active tab URL
async function checkActiveTabUrl() {
  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (activeTab?.url && activeTab.url !== currentActiveTabUrl) {
      // URL has changed
      console.log('📍 URL changed:', activeTab.url);
      currentActiveTabUrl = activeTab.url;
      handleUrlLogging(activeTab.url);
    }
  } catch (error) {
    console.error('❌ Error checking active tab URL:', error);
  }
}

// Set up interval to check URL changes (every 1 second)
setInterval(checkActiveTabUrl, 1000);

// Also check when tabs are switched
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  console.log('🔄 Tab activated:', activeInfo.tabId);
  checkActiveTabUrl();
});