import { logUrl } from '../lib/api';

console.log('🚀 Content script loaded on:', window.location.href);

let isScrapingEnabled = false;
let lastScrapedTweetId = null;
const scrapedTweetIds = new Set();
let capturedRequestData = null;
let isScrapingStarted = false;
const TWEET_SCRAPE_IDENTIFIER = '?q=wootzapp-tweets';
const FOLLOWING_SCRAPE_IDENTIFIER = '?q=wootzapp-following';

// Add these variables at the top level
let tweetObserver = null;
let scrollListener = null;

// Add at the top of content.js
let twitterTabId = null;

// Add a flag to track if background scraping is being stopped
let isStoppingBackgroundScrape = false;



// Add new function to check Twitter auth status
async function checkTwitterAuth() {
  console.log('🔍 Checking Twitter auth status...');

  
  try {
    // First check if we're on Twitter
    if (!window.location.href.includes('x.com')) {
      console.log('Not on Twitter, skipping auth check');
      return false;
    }

    // Check for ct0 cookie directly from document.cookies
    const cookies = document.cookie;
    const hasCt0 = cookies.includes('ct0=');
    
    // Check if this is first-time authentication
    chrome.storage.local.get(['hasInitialAuth'], async (result) => {
      if (hasCt0 && !result.hasInitialAuth) {
        console.log('🎉 First-time Twitter authentication detected!');
        
        // Set the flag to prevent future initial auth handling
        chrome.storage.local.set({ hasInitialAuth: true }, async () => {
          console.log('✅ Initial auth flag set');
          
          // Wait for navigation element and extract username
          const communitiesLink = await waitForElement('nav[aria-label="Primary"] a[href*="/communities"]');
          if (communitiesLink) {
            const communitiesHref = communitiesLink.getAttribute('href');
            const username = communitiesHref.split('/')[1];
            
            // Send username to background script
            chrome.runtime.sendMessage({
              type: 'INITIAL_AUTH_USERNAME',
              data: { username }
            });
            
            console.log('📤 Sent initial username to background:', username);
          }
        });
      }
    });

    // Send regular auth status to background script
    chrome.runtime.sendMessage({
      type: 'TWITTER_AUTH_STATUS',
      data: { 
        isAuthenticated: hasCt0,
        url: window.location.href
      }
    });

    return hasCt0;
  } catch (error) {
    console.error('❌ Error checking Twitter auth:', error);
    return false;
  }
}

// Add a new function to check if this is a profile scraping tab
function isProfileScrapingTab() {
  return !window.location.href.includes(TWEET_SCRAPE_IDENTIFIER) && 
         !window.location.href.includes(FOLLOWING_SCRAPE_IDENTIFIER);
}

// Modify scrapeLikesCount function
async function scrapeLikesCount() {
  if (!isScrapingEnabled || !isProfileScrapingTab()) return;

  chrome.storage.local.get(['hasScrapedLikes'], async (result) => {
    if (result.hasScrapedLikes) {
      console.log('✅ Likes already scraped');
      return;
    }

    try {
      // Add retry logic for likes scraping
      let attempts = 0;
      const maxAttempts = 5;
      const retryDelay = 1000;
      let likesCount;

      while (attempts < maxAttempts) {
        const likesElement = document.querySelector('[data-testid="TopNavBar"] h2[role="heading"] + div');
        likesCount = likesElement?.innerText?.trim().split(' ')[0];

        if (likesCount) {
          break;
        }

        attempts++;
        if (attempts < maxAttempts) {
          console.log(`Likes element not found, retrying in 1s... (Attempt ${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }

      if (!likesCount) {
        throw new Error('Could not find likes count after all attempts');
      }

      console.log('❤️ Found likes count:', likesCount);

      // Send likes data
      chrome.runtime.sendMessage({
        type: 'SCRAPED_DATA',
        data: {
          type: 'LIKES_COUNT',
          content: { likes: likesCount }
        }
      }, () => {
        console.log('✅ Likes count sent:', likesCount);
        chrome.storage.local.set({
          hasScrapedLikes: true,
        }, () => {
          console.log('🔒 Likes scraping complete, closing tab');
          chrome.runtime.sendMessage({type: 'CLOSE_TAB'});
        });
      });

    } catch (error) {
      console.error('❌ Error scraping likes count:', error);
      // Don't close the tab on error, let it retry on next navigation
    }
  });
}

// Initial check with immediate action if needed
chrome.storage.local.get([
  'isScrapingEnabled',
  'isTweetScrapingEnabled',
  'hasScrapedProfile',
  'hasScrapedLikes'
], (result) => {
  console.log('📊 Initial state check:', {
    url: window.location.href,
    isProfileTab: isProfileScrapingTab(),
    enabled: result.isScrapingEnabled,
    profile: result.hasScrapedProfile,
    likes: result.hasScrapedLikes
  });

  isScrapingEnabled = result.isScrapingEnabled || false;

  // Only start profile/likes scraping on non-tweet-scraping tabs
  if (isScrapingEnabled && isProfileScrapingTab() && 
      (!result.hasScrapedProfile || !result.hasScrapedLikes)) {
    console.log('🔄 Starting profile/likes scraping');
    setTimeout(() => {
      getCommunitiesInfo();
    }, 2000);
  }

  // Only start tweet scraping on tweet-specific tabs
  if (result.isTweetScrapingEnabled && 
      window.location.href.includes(TWEET_SCRAPE_IDENTIFIER)) {
    initTweetScraping();
  }
});

// Message listener for scraping toggle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Content script received message:', message);

  if (message.type === 'CHECK_TWITTER_AUTH') {
    checkTwitterAuth();
  }
  
  console.log('📨 Received message:', message);

  if (message.type === 'TOGGLE_SCRAPING') {
    isScrapingEnabled = message.enabled;
    console.log('🔄 Scraping toggled:', isScrapingEnabled);

    if (isScrapingEnabled) {
      chrome.storage.local.get(['hasScrapedProfile', 'hasScrapedLikes'], (result) => {
        if (!result.hasScrapedProfile || !result.hasScrapedLikes) {
          console.log('🔄 Starting scraping after toggle');
          getCommunitiesInfo();
        }
      });
    }
  }

  if (message.type === 'START_FOLLOWING_SCRAPE') {
    console.log('🔄 Received following scrape request');
    clickFollowingButton()
      .then(results => {
        console.log('✅ Following scraping complete:', results?.length || 0, 'accounts found');
      })
      .catch(error => {
        console.error('❌ Following scraping failed:', error);
      });
  }

  if (message.type === 'EXECUTE_FOLLOWING_SCRAPE') {
    console.log('📥 Received execute following scrape message');
    clickFollowingButton()
      .then(() => {
        console.log('✅ Following scrape execution complete');
      })
      .catch(error => {
        console.error('❌ Error executing following scrape:', error);
      });
  }

  if (message.type === 'TOGGLE_TWEET_SCRAPING') {
    if (message.enabled) {
      console.log('🔄 Enabling tweet scraping');
      initTweetScraping();
    } else {
      console.log('🔄 Disabling tweet scraping');
      stopTweetScraping();
    }
  }

  if (message.type === 'CLICK_HOME_BUTTON') {
    console.log('🏠 Finding and clicking home button...');
    setTimeout(() => {
      const homeButton = document.querySelector('a[href="/home"]');
      if (homeButton) {
        console.log('✅ Found home button, clicking...');
        homeButton.click();
      } else {
        console.log('❌ Home button not found');
      }
    }, 2000);
  }

  if (message.type === 'INJECT_TWEET_INTERCEPTOR') {
    console.log('💉 Injecting tweet interceptor...');
    
    // Inject the interceptor script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('tweetinterceptor.js');
    script.onload = () => {
      console.log('✅ Tweet interceptor loaded');
      script.remove();
      
      // After injection, click the home button
      console.log('🏠 Finding and clicking home button...');
      setTimeout(() => {
        const homeButton = document.querySelector('a[href="/home"]');
        if (homeButton) {
          console.log('✅ Found home button, clicking...');
          homeButton.click();
        } else {
          console.log('❌ Home button not found');
        }
      }, 2000);
    };
    (document.head || document.documentElement).appendChild(script);
  }

  if (message.type === 'EXECUTE_TWEET_SCRAPING') {
    console.log('🔄 Executing tweet scraping');
    ClickHomeButton()
      .catch(error => {
        console.error('❌ Tweet scraping failed:', error);
        chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
      });
  }

  if (message.type === 'STOP_BACKGROUND_SCRAPING') {
    console.log('🛑 Received stop background scraping signal');
    isStoppingBackgroundScrape = true;
    // If we're in the 30-second wait period, close the tab immediately
    if (requestCount >= MAX_REQUESTS_PER_TAB) {
      chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    }
    // Otherwise, let the current batch of requests complete
  }

  return true;
});

async function getCommunitiesInfo() {
  console.log('🔍 Starting communities check on:', window.location.href);

  // Check if this is the initial auth flow
  const result = await new Promise(resolve => {
    chrome.storage.local.get(['hasInitialAuth', 'isScrapingEnabled'], resolve);
  });

  if (!result.isScrapingEnabled || !result.hasInitialAuth) {
    console.log('🚫 Scraping disabled or initial auth in progress, stopping communities check');
    return;
  }

  try {
    // Check if already on profile page
    const currentUrl = window.location.href;
    if (currentUrl.includes('x.com/') && !currentUrl.includes('/communities')) {
      const username = currentUrl.split('x.com/')[1]?.split('/')[0];
      if (username && username !== 'home' && username !== 'i') {
        console.log('✅ Already on profile page:', username);
        await scrapeProfileData();
        return;
      }
    }

    console.log('⏳ Waiting for navigation element...');
    const communitiesLink = document.querySelector('nav[aria-label="Primary"] a[href*="/communities"]');

    if (communitiesLink) {
      const communitiesHref = communitiesLink.getAttribute('href');
      const username = communitiesHref.split('/')[1];
      console.log('✅ Found username:', username);
      window.location.href = `https://x.com/${username}`;
    } else {
      console.log('❌ No communities link found');
    }
  } catch (error) {
    console.error('❌ Error in communities check:', error);
  }
}


// Function to scrape profile data
async function scrapeProfileData() {
  if (!isScrapingEnabled) return;
  
  chrome.storage.local.get(['hasScrapedProfile'], async (result) => {
    if (result.hasScrapedProfile) {
      console.log('✅ Profile already scraped');
      const username = window.location.pathname.split('/')[1];
      if (!window.location.href.includes('/likes')) {
        window.location.href = `https://x.com/${username}/likes`;  // Only navigate if not already on likes page
      }
      return;
    }

    // 2 conditions 

    console.log('🔍 Starting profile data scraping...');

    // Add retry logic
    let attempts = 0;
    const maxAttempts = 5;
    const retryDelay = 1000; // 1 second

    while (attempts < maxAttempts) {
      try {
        const schemaElement = document.querySelector('script[type="application/ld+json"]');
        if (!schemaElement) {
          attempts++;
          if (attempts < maxAttempts) {
            console.log(`Schema not found, retrying in 1s... (Attempt ${attempts}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }
          throw new Error('Profile schema not found after all attempts');
        }

        const schemaData = JSON.parse(schemaElement.textContent);
        console.log('📊 Found profile schema:', schemaData);
      
        // Extract data from schema
        const profileData = {
          userhandle: schemaData.mainEntity.givenName || 'N/A',
          username: window.location.pathname.split('/')[1],
          followers: schemaData.mainEntity.interactionStatistic?.find(
            stat => stat.interactionType === "https://schema.org/FollowAction"
          )?.userInteractionCount || '0',
          following: schemaData.mainEntity.interactionStatistic?.find(
            stat => stat.interactionType === "https://schema.org/SubscribeAction"
          )?.userInteractionCount || '0',
          posts: schemaData.mainEntity.interactionStatistic?.find(
            stat => stat.interactionType === "https://schema.org/WriteAction"
          )?.userInteractionCount || '0',
          joinedDate: new Date(schemaData.dateCreated).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'N/A',
          timestamp: new Date().toISOString(),
          profileImageUrl: schemaData.mainEntity?.image?.contentUrl || null,
        };
      
        console.log('📊 Full profile data:', profileData);

      // Send profile data and proceed to likes page using username
      chrome.runtime.sendMessage({
        type: 'SCRAPED_DATA',
        data: {
          type: 'PROFILE',
          content: profileData
        }
      }, () => {
        console.log('✅ Profile data sent, proceeding to likes page...');
        chrome.storage.local.set({ hasScrapedProfile: true }, () => {
          window.location.href = `https://x.com/${profileData.username}/likes`;
        });
      });

        break; // Exit loop if successful
      } catch (error) {
        console.error(`❌ Error scraping profile (Attempt ${attempts + 1}/${maxAttempts}):`, error);
        if (attempts >= maxAttempts - 1) throw error;
        attempts++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  });
}

// Helper function to get current profile data
function getCurrentProfileData() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profileData'], (result) => {
      console.log('Current stored profile data:', result.profileData);
      resolve(result.profileData);
    });
  });
}

// Function to wait for element
function waitForElement(selector, timeout = 10000) {
  return new Promise((resolve) => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(() => {
          if (document.querySelector(selector)) {
              observer.disconnect();
              resolve(document.querySelector(selector));
          }
      });

      observer.observe(document.body, {
          childList: true,
          subtree: true
      });

      setTimeout(() => {
          observer.disconnect();
          resolve(null);
      }, timeout);
  });
}

async function clickFollowingButton() {
  // First check if following is already scraped
  const result = await chrome.storage.local.get(['hasScrapedFollowing']);
  if (result.hasScrapedFollowing) {
    console.log('🚫 Following already scraped, aborting');
    return null;
  }

  // Check if this is a following scrape URL
  if (!window.location.href.includes(FOLLOWING_SCRAPE_IDENTIFIER)) {
    console.log('🚫 Not a following scrape URL, aborting');
    return null;
  }

  console.log('🔍 Starting following scrape on designated URL');
  try {
    setupRequestCapture();
    console.log('✅ Request capture setup complete');

    // Wait for setup to complete
    // await new Promise(resolve => setTimeout(resolve, 2000));

    // Find following button
    const followingButton = await waitForElement('[data-testid="primaryColumn"] a[href$="/following"]');
    if (!followingButton) {
      throw new Error('Following button not found');
    }

    console.log('✅ Found following button, starting scrape process...');

    // Start scraping process before clicking
    scrapeTwitterUsers().then(results => {
      console.log('Scraping process initiated');
    });

    // Wait a moment for scraping setup
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('currentr url', window.location.href);
    // Click the button
    console.log('👆 Clicking following button...');
    followingButton.click();
    console.log('currentr url', window.location.href);
  } catch (error) {
    console.error('Error in following button process:', error);
    return null;
  }
}
// Function to capture network requests
function setupRequestCapture() {
  return new Promise((resolve) => {
    console.log('🚀 Starting request capture setup...');

    // Listen for captured request data
    window.addEventListener('requestDataCaptured', async function(event) {
      const { type, data } = event.detail;
      console.log(`📡 Received ${type}:`, data);

      if (type === 'XHR_COMPLETE' && data.url && data.headers) {
        capturedRequestData = data;
        console.log('✅ Got complete XHR data:', capturedRequestData);

        // Start scraping only after XHR is complete
        if (!isScrapingStarted) {
          isScrapingStarted = true;
          await scrapeTwitterUsers();
        }
      }
    });

    // Inject the interceptor script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor.js');
    script.onload = () => {
      console.log('✅ Interceptor script loaded');
      script.remove();
      resolve();
    };
    (document.head || document.documentElement).appendChild(script);
  });
}

// Function to wait for request data
async function waitForRequestData(maxAttempts = 20) {
  console.log('Waiting for request data...');
  
  for (let i = 0; i < maxAttempts; i++) {
      console.log(`Attempt ${i + 1}/${maxAttempts}`);
      
      // Trigger scroll to generate requests
      // window.scrollTo(0, document.body.scrollHeight);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (requestData.url && requestData.headers) {
          console.log('Request data captured successfully!');
          return true;
      }
  }
  
  return false;
}

// Main scraping function
async function scrapeTwitterUsers() {
  if (!capturedRequestData) {
    console.error('❌ No request data captured yet');
    return;
  }

  console.log('🚀 Starting Twitter scraper with:', capturedRequestData);

  const results = [];
  let hasNextPage = true;
  let cursor = null;
  let batchNumber = 1;

  try {
    while (hasNextPage && batchNumber <= 5) {
      console.log(`\n📑 Processing batch #${batchNumber}...`);

      // Prepare request URL with cursor
      let currentUrl = capturedRequestData.url;
      if (cursor) {
        const urlObj = new URL(currentUrl);
        const params = new URLSearchParams(urlObj.search);
        const variables = JSON.parse(params.get('variables'));
        variables.cursor = cursor;
        params.set('variables', JSON.stringify(variables));
        currentUrl = `${urlObj.origin}${urlObj.pathname}?${params.toString()}`;
      }

      console.log('🔄 Fetching:', currentUrl);
      const response = await fetch(currentUrl, {
        method: capturedRequestData.method || 'GET',
        headers: capturedRequestData.headers,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📦 Received data batch:', batchNumber);

      // Process the response data
      if (data.data?.user?.result?.timeline?.timeline?.instructions) {
        data.data.user.result.timeline.timeline.instructions
          .filter(instruction => instruction.type === "TimelineAddEntries")
          .forEach(instruction => {
            instruction.entries.forEach(entry => {
              if (entry.entryId.startsWith("user-")) {
                const user = entry.content.itemContent.user_results.result;
                if (user && user.legacy) {
                  results.push({
                    profileImageUrl: user.legacy.profile_image_url_https,
                    username: user.legacy.screen_name,
                    name: user.legacy.name,
                    bio: user.legacy.description,
                    followersCount: user.legacy.followers_count,
                    followingCount: user.legacy.friends_count,
                    verified: user.is_blue_verified,
                    location: user.location
                  });
                }
              } else if (entry.entryId.startsWith("cursor-bottom-")) {
                cursor = entry.content.value;
                hasNextPage = cursor && cursor.split("|")[0] !== "0";
              }
            });
          });
      }

      console.log(`✅ Batch #${batchNumber} complete. Users found: ${results.length}`);
      
      // Send batch results
      chrome.runtime.sendMessage({
        type: 'FOLLOWING_USERS_UPDATED',
        data: results
      });

      batchNumber++;
      // await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log('Scraping complete!');
    console.table(results);

    // After all results are collected, set hasScrapedFollowing to true
    chrome.storage.local.set({ hasScrapedFollowing: true }, () => {
      console.log('✅ Following scraping marked as complete');
      // Close the tab after marking as complete
      chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
    });

    return results;

  } catch (error) {
    console.error('❌ Error during scraping:', error);
    return results;
  }
}


// Add this function after your existing functions
function processTweet(tweet) {
  if (!isScrapingEnabled) return;

  const tweetId = tweet.getAttribute('data-tweet-id') ||
    tweet.querySelector('a[href*="/status/"]')?.href.split('/status/')[1];

  if (!tweetId || scrapedTweetIds.has(tweetId) || tweet.hasAttribute('data-scraped')) {
    return;
  }

  try {
    const tweetTextElement = tweet.querySelector('[data-testid="tweetText"]');
    let tweetText = '';
    let tweetTextWithEmojis = [];

    if (tweetTextElement) {
      // Process all child elements to preserve structure
      const processNode = (node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          tweetTextWithEmojis.push({
            type: 'text',
            content: node.textContent
          });
        } else if (node.nodeName === 'IMG') {
          tweetTextWithEmojis.push({
            type: 'emoji',
            content: node.src || '',
            alt: node.alt || ''
          });
        } else if (node.childNodes && node.childNodes.length > 0) {
          // Handle spans and other elements that might contain text/emojis
          node.childNodes.forEach(childNode => processNode(childNode));
        }
      };

      // Process all nodes recursively
      tweetTextElement.childNodes.forEach(node => processNode(node));

      // Create plain text version
      tweetText = tweetTextWithEmojis
        .map(item => item.type === 'text' ? item.content : item.alt)
        .join('');
    }

    const tweetContent = {
      id: tweetId,
      text: tweetText,
      user: {
        handle: tweet.querySelector('[data-testid="User-Name"] a:first-of-type')?.getAttribute('href')?.split('/')[1] || '',
        name: tweet.querySelector('[data-testid="User-Name"]')?.innerText?.split('\n')[0]?.trim() || '',
        avatar: tweet.querySelector('[data-testid="Tweet-User-Avatar"] img:first-of-type')?.src || ''
      },
      engagement: {
        replies: tweet.querySelector('[data-testid="reply"]')?.innerText || '0',
        retweets: tweet.querySelector('[data-testid="retweet"]')?.innerText || '0',
        likes: tweet.querySelector('[data-testid="like"]')?.innerText || '0'
      },
      timestamp: tweet.querySelector('time')?.getAttribute('datetime') || '',
      timeText: tweet.querySelector('time')?.innerText || ''
    };

    // Store in Map instead of just marking as scraped
    tweetStorage.set(tweetId, tweetContent);
    tweet.setAttribute('data-scraped', 'true');
    scrapedTweetIds.add(tweetId);

    // Only send updates in batches
    if (tweetStorage.size >= 100 || document.hidden) {
      const tweetsArray = Array.from(tweetStorage.values());
      chrome.runtime.sendMessage({
        type: 'SCRAPED_DATA',
        data: {
          type: 'TWEETS',
          content: tweetsArray
        }
      });

      // Store in chrome.storage.local
      chrome.storage.local.get(['tweets'], (result) => {
        const existingTweets = result.tweets || [];
        const existingIds = new Set(existingTweets.map(t => t.id));
        const newTweets = tweetsArray.filter(t => !existingIds.has(t.id));
        const combinedTweets = [...existingTweets, ...newTweets]
          .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
          .slice(0, MAX_TWEETS);

        chrome.storage.local.set({ tweets: combinedTweets }, () => {
          console.log(`✅ Stored ${combinedTweets.length} tweets`);
        });
      });

      // Clear the temporary storage
      tweetStorage.clear();
    }
  } catch (error) {
    console.error('Error processing tweet:', error);
  }
}

// Add new function to stop tweet scraping
function stopTweetScraping() {
  console.log('🛑 Stopping tweet scraping...');
  
  // Remove scroll event listener
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener);
    scrollListener = null;
    console.log('✅ Scroll listener removed');
  }

  // Disconnect observer
  if (tweetObserver) {
    tweetObserver.disconnect();
    tweetObserver = null;
    console.log('✅ Tweet observer disconnected');
  }

  // Clear any existing tweet IDs
  scrapedTweetIds.clear();
}


function initTweetScraping() {
  chrome.storage.local.get(['hasScrapedProfile', 'isTweetScrapingEnabled'], (result) => {
    if (result.hasScrapedProfile && result.isTweetScrapingEnabled) {
      console.log('✅ Profile scraped and tweet scraping enabled, initializing tweet scraping');
      
      // Create new observer if needed
      if (!tweetObserver) {
        tweetObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
                chrome.storage.local.get(['isTweetScrapingEnabled'], (result) => {
                  if (result.isTweetScrapingEnabled) {
                    processTweet(entry.target);
                  }
                });
              }
            });
          },
          {
            threshold: 0.5,
            rootMargin: '0px'
          }
        );
      }

      // Set up scroll listener
      if (!scrollListener) {
        scrollListener = debounce(() => {
          chrome.storage.local.get(['isTweetScrapingEnabled'], (result) => {
            if (result.isTweetScrapingEnabled) {
              console.log('📜 Scroll detected, checking for new tweets...');
              observeNewTweets();
            }
          });
        }, 500);
        window.addEventListener('scroll', scrollListener);
      }

      observeNewTweets();
    } else {
      console.log('⏳ Profile not scraped or tweet scraping disabled');
      stopTweetScraping();
    }
  });
}

// Add debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Update observeNewTweets function
function observeNewTweets() {
  chrome.storage.local.get(['isTweetScrapingEnabled'], (result) => {
    if (!result.isTweetScrapingEnabled) {
      console.log('🛑 Tweet scraping disabled, skipping observation');
      return;
    }

    const tweets = document.querySelectorAll('article[data-testid="tweet"]:not([data-scraped])');
    console.log(`🔍 Found ${tweets.length} new tweets to observe`);

    tweets.forEach(tweet => {
      if (!tweet.hasAttribute('data-scraped') && tweetObserver) {
        tweetObserver.observe(tweet);
      }
    });
  });
}

setTimeout(() => {
  chrome.storage.local.get([
    'hasScrapedProfile', 
    'hasScrapedLikes', 
    'hasScrapedFollowing',
    'isBackgroundTweetScrapingEnabled'
  ], (result) => {
    const currentUrl = window.location.href;
    console.log('Current state:', result, 'URL:', currentUrl);

    // Handle tweet scraping
    if (result.isBackgroundTweetScrapingEnabled && currentUrl.includes(TWEET_SCRAPE_IDENTIFIER)) {
      console.log('🔄 Background tweet scraping enabled, starting tweets scraping...');
      ClickHomeButton();
      return;
    }
    
    // Handle following scraping
    else if (currentUrl.includes(FOLLOWING_SCRAPE_IDENTIFIER)) {
      if (!result.hasScrapedFollowing) {
        console.log('👥 Starting following scraping...');
        clickFollowingButton();
      }
    } 
    // Handle normal scraping flow
    else {
      if (!result.hasScrapedProfile) {
        console.log('🔍 Starting profile scraping...');
        getCommunitiesInfo();
      } 
      else if (result.hasScrapedProfile && !result.hasScrapedLikes) {
        console.log('❤️ Starting likes scraping...');
        scrapeLikesCount();
      }
    }
  });
}, 1000);

// Start after page load
setTimeout(() => {
  console.log('🚀 Checking if we should start tweet scraping...');
  initTweetScraping();
}, 2000);

// Add URL change monitoring
let lastUrl = window.location.href;
new MutationObserver(() => {
  if (window.location.href !== lastUrl) {
    lastUrl = window.location.href;
    console.log('📍 URL changed to:', lastUrl);
    
    if (lastUrl.includes('x.com/home')) {
      console.log('🏠 On Twitter home page, checking auth...');
      checkTwitterAuth();
    }
  }
}).observe(document, { subtree: true, childList: true });

// Initial check when script loads
if (window.location.href.includes('x.com')) {
  console.log('🔄 Initial Twitter page load, checking auth...');
  checkTwitterAuth();
}

// Add listener for background tweets
window.addEventListener('backgroundTweetsCaptured', (event) => {
    console.log('📦 Background tweets captured:', event.detail);
    chrome.runtime.sendMessage({
        type: 'SCRAPED_DATA',
        data: {
            type: 'TWEETS',
            content: event.detail.data
        }
    });
});

// Update the backgroundTweetsComplete event listener
window.addEventListener('backgroundTweetsComplete', () => {
    console.log('✅ Background tweet scraping complete');
    chrome.storage.local.get(['isBackgroundTweetScrapingEnabled'], (result) => {
        if (result.isBackgroundTweetScrapingEnabled && !isStoppingBackgroundScrape) {
            console.log('🔄 Scheduling next scraping session...');
            
            chrome.runtime.sendMessage({ 
                type: 'SCHEDULE_NEXT_SCRAPING',
                data: {
                    username: window.location.pathname.split('/')[1]
                }
            });
        } else {
            console.log('🛑 Background scraping stopped, not scheduling next session');
            isStoppingBackgroundScrape = false; // Reset the flag
            chrome.runtime.sendMessage({ type: 'CLOSE_TAB' });
        }
    });
});

function setupTweetRequestCapture() {
  return new Promise((resolve) => {
    console.log('🚀 Starting request capture setup...');

    // Listen for captured request data
    window.addEventListener('timelinerequestdataCaptured', async function(event) {
      const { type, data } = event.detail;
      console.log(`📡 Received ${type}:`, data);

      if (type === 'TWEET_XHR_COMPLETE' && data.url && data.headers) {
        capturedRequestData = data;
        console.log('✅ Got complete XHR data:', capturedRequestData);

        // Start scraping only after XHR is complete
        if (!isScrapingStarted) {
          isScrapingStarted = true;
          await makeTimelineRequest(data.url, data.headers);
        }
      }
    });

    // Inject the tweetinterceptor script
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('tweetinterceptor.js');
    script.onload = () => {
      console.log('✅ Interceptor script loaded');
      script.remove();
      resolve();
    };
    (document.head || document.documentElement).appendChild(script);
  });
}



async function ClickHomeButton() {
  // Check if this is a tweet scraping URL
  if (!window.location.href.includes(TWEET_SCRAPE_IDENTIFIER)) {
    console.log('🚫 Not a tweet scraping URL, aborting');
    return null;
  }

  console.log('🔍 Starting tweet scrape on designated URL');
  try {
    await setupTweetRequestCapture();
    console.log('✅ Tweet request capture setup complete');

    // Wait for setup to complete
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Find and click home button
    const homeButton = document.querySelector('a[href="/home"]');
    if (!homeButton) {
      throw new Error('Home button not found');
    }

    console.log('👆 Clicking home button...');
    homeButton.click();

  } catch (error) {
    console.error('Error in tweet scraping process:', error);
    return null;
  }
}

async function makeTimelineRequest(originalUrl, headers, currentVariables = null) {
  // First check if scraping is still enabled
  const isEnabled = await isTweetScrapingEnabled();
  if (!isEnabled) {
    console.log('🛑 Tweet scraping disabled, stopping requests');
    window.dispatchEvent(new CustomEvent('backgroundTweetsComplete'));
    return;
  }

  // Check request limit
  if (requestCount >= MAX_REQUESTS_PER_TAB) {
    console.log(`🛑 Reached maximum requests (${MAX_REQUESTS_PER_TAB}) for this tab`);
    window.dispatchEvent(new CustomEvent('backgroundTweetsComplete'));
    return;
  }

  requestCount++;
  console.log(`📊 Making timeline request (${requestCount}/${MAX_REQUESTS_PER_TAB})`);
  
  const urlObj = new URL(originalUrl);
  const params = new URLSearchParams(urlObj.search);
  
  // Extract variables and features from original request
  let variables = currentVariables;
  if (!variables) {
    try {
      variables = JSON.parse(params.get('variables'));
      console.log('📦 Using variables from captured request:', variables);
    } catch (error) {
      console.error('❌ Error parsing variables from URL:', error);
      return;
    }
  }

  // Extract features from original request
  let features;
  try {
    features = JSON.parse(params.get('features'));
    console.log('🔧 Using features from captured request:', features);
  } catch (error) {
    console.error('❌ Error parsing features from URL:', error);
    return;
  }

  // Construct URL with captured variables and features
  const requestUrl = `${urlObj.origin}${urlObj.pathname}?variables=${encodeURIComponent(JSON.stringify(variables))}&features=${encodeURIComponent(JSON.stringify(features))}`;
  
  console.log('📡 Making request to:', requestUrl);

  try {
      const response = await fetch(requestUrl, {
          method: 'GET',
          headers: headers,
          credentials: 'include'
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
          console.error('Response errors:', data.errors);
          return;
      }

      let entries = [];
      const instructions = data.data?.home?.home_timeline_urt?.instructions || [];
      
      instructions.forEach(instruction => {
          if (instruction.type === "TimelineAddEntries") {
              entries = instruction.entries;
          }
      });

      const tweets = [];

      console.log('🔍 Processing entries:', entries.length);

      entries.forEach((entry, index) => {
          if (entry.content?.itemContent?.tweet_results?.result) {
              const tweet = entry.content.itemContent.tweet_results.result;
              const tweetData = {
                  id: tweet.rest_id,
                  text: tweet.legacy?.full_text || tweet.legacy?.text,
                  user: {
                      handle: tweet.core?.user_results?.result?.legacy?.screen_name,
                      name: tweet.core?.user_results?.result?.legacy?.name,
                      avatar: tweet.core?.user_results?.result?.legacy?.profile_image_url_https
                  },
                  metrics: {
                      replies: tweet.legacy?.reply_count,
                      retweets: tweet.legacy?.retweet_count,
                      likes: tweet.legacy?.favorite_count
                  },
                  timestamp: tweet.legacy?.created_at
              };
              tweets.push(tweetData);

              // Print detailed tweet information
              console.log(` Tweet ${index + 1}:`, {
                  id: tweetData.id,
                  author: `@${tweetData.user.handle} (${tweetData.user.name})`,
                  text: tweetData.text,
                  engagement: `💬 ${tweetData.metrics.replies} 🔄 ${tweetData.metrics.retweets} ❤️ ${tweetData.metrics.likes}`,
                  time: new Date(tweetData.timestamp).toLocaleString()
              });
          }
      });

      // Print batch summary
      console.log(`📊 Batch Summary:
        Total tweets: ${tweets.length}
        Time range: ${tweets[0]?.timestamp} to ${tweets[tweets.length - 1]?.timestamp}
        Users: ${new Set(tweets.map(t => t.user.handle)).size} unique authors
      `);

      // Send tweets to background
      if (tweets.length > 0) {
          console.log('📤 Sending batch to background script');
          chrome.runtime.sendMessage({
              type: 'SCRAPED_DATA',
              data: {
                  type: 'TWEETS',
                  content: tweets
              }
          });
      }

      // Update the cursor check to include request count
      const bottomEntry = entries.find(entry => entry.content?.cursorType === "Bottom");
      if (bottomEntry && requestCount < MAX_REQUESTS_PER_TAB) {
        const nextVariables = {
          ...variables,
          cursor: bottomEntry.content.value
        };
        
        console.log('⏭️ Next cursor found:', bottomEntry.content.value);
        // setTimeout(() => {
          makeTimelineRequest(originalUrl, headers, nextVariables);
        // }, 2000);
      } else {
        console.log('🏁 No more tweets to fetch or reached request limit');
        window.dispatchEvent(new CustomEvent('backgroundTweetsComplete'));
      }

  } catch (error) {
      console.error('❌ Error fetching timeline:', error);
      console.error('Error details:', {
          message: error.message,
          stack: error.stack
      });
      window.dispatchEvent(new CustomEvent('backgroundTweetsComplete'));
  }
}

// Add at the top of the file with other global variables
let requestCount = 0;
const MAX_REQUESTS_PER_TAB = 15;

// Add this near the top of the file
const MAX_TWEETS = 15000;
let tweetStorage = new Map(); // Use Map for better performance

// Add this function to check if tweet scraping is enabled
async function isTweetScrapingEnabled() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['isBackgroundTweetScrapingEnabled'], (result) => {
            resolve(result.isBackgroundTweetScrapingEnabled || false);
        });
    });
}