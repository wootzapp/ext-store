// Add these variables at the top level
let storedAuthToken = null;
let storedSecretKey = null;
let storedIsLoggedIn = false;
let storedRefreshToken = null;
let refreshTokenTimer = null;

// Update storage change listener to store values in variables
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    console.log('🔄 Storage changes detected:', changes);
    
    if (changes.authToken) {
      storedAuthToken = changes.authToken.newValue;
    }
    if (changes.secretKey) {
      storedSecretKey = changes.secretKey.newValue;
    }
    if (changes.isLoggedIn) {
      storedIsLoggedIn = changes.isLoggedIn.newValue;
    }
    if (changes.refreshToken) {
      storedRefreshToken = changes.refreshToken.newValue;
    }
   
    // Process queue if all conditions are met
    if (storedAuthToken && storedIsLoggedIn && storedSecretKey) {
      console.log('🔑 All auth conditions met, processing queue');
      processUrlQueue();
    } else {
      console.log('⏳ Waiting for all auth conditions');
    }
  }
});

async function fetchAndStoreEasyListSelectors() {
  const url = "https://easylist.to/easylist/easylist.txt";
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch EasyList");
    const text = await response.text();
    const lines = text.split('\n');
    const selectors = [];
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('!')) continue;
      if (line.startsWith('##') || line.startsWith('###')) {
        let selector = line.replace(/^##+/, '').trim();
        if (selector.startsWith('#')) selector = selector.slice(1).trim();
        if (selector.includes('href')) continue;
        if (/".*?"/.test(selector)) continue;
        selectors.push(selector);
      }
    }
    await chrome.storage.local.set({ easylistSelectors: selectors });
    console.log('✅ EasyList selectors stored:', selectors.length);
  } catch (e) {
    console.error('❌ EasyList fetch/parse failed:', e);
  }
}

fetchAndStoreEasyListSelectors();

// Create a queue to store URLs that need to be logged
let urlQueue = [];

// Update encryption function with detailed debugging
async function encryptUrl(data, token, secretKey) {
  console.log('🔐 Encrypting URL with:', {
    data,
    token,
    secretKey
  });
  try {
    const response = await fetch('https://be-udp-prd-0-aocnhs7n5a-uc.a.run.app//v1/encrypt', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Cache-Control':'no-cache',
        'Pragma':'no-cache',  // Add explicit Accept header
      },
      body: JSON.stringify({
        rawData: data,
        secretKey: secretKey
      })
    });

    if(!response.ok){
      console.error('❌ Request failed with status',
      response.status, response.statusText);
      return null;
    }
    console.log('🔐 Encryption response:', response);
    const data1 = await response.json();
    console.log('🔐 Encryption data:', data1);
    // if (!data.base64EncryptedEncodedData) {
    //   throw new Error('No encrypted data received from server');
    // }

    return data1.base64EncryptedEncodedData;
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

// Add debug logging to handleUrlLogging
async function handleUrlLogging(url) {
  console.log('🚀 Starting URL logging process:', {
    url,
    hasAuthToken: !!storedAuthToken,
    hasSecretKey: !!storedSecretKey,
    queueLength: urlQueue.length
  });

  if (!url) {
    console.log('⚠️ Empty URL provided, skipping');
    return;
  }

  try {
    if (!storedAuthToken || !storedSecretKey) {
      console.log('⏳ Missing credentials, queueing URL for later');
      urlQueue.push({
        url: url,
        timestamp: new Date().toISOString(),
        encrypted: false
      });

      await chrome.storage.local.set({ pendingUrls: urlQueue });
      return;
    }

    // console.log('🔐 Attempting encryption...');
    // const encryptedUrl = await encryptUrl(url, storedAuthToken, storedSecretKey);
    // console.log('🔐 Encrypted URL:', encryptedUrl);
    // if (!encryptedUrl) {
    //   throw new Error('Encryption returned empty result');
    // }

    console.log('🔐 URL encrypted successfully');

    urlQueue.push({
      url: url,
      timestamp: new Date().toISOString(),
      encrypted: true
    });

    await chrome.storage.local.set({ pendingUrls: urlQueue });
    console.log('📝 Encrypted URL added to queue');

    await processUrlQueue();
  } catch (error) {
    console.error('❌ URL logging error:', {
      message: error.message,
      url: url,
      queueLength: urlQueue.length
    });
    // Queue the original URL for retry
    urlQueue.push({
      url: url,
      timestamp: new Date().toISOString(),
      encrypted: false,
      retryCount: 0
    });
    await chrome.storage.local.set({ pendingUrls: urlQueue });
  }
}

// Update processUrlQueue to use stored variables
async function processUrlQueue() {
  try {
    console.log('🔍 Processing queue with:', {
      hasAuthToken: !!storedAuthToken,
      isLoggedIn: storedIsLoggedIn,
      hasSecretKey: !!storedSecretKey,
      queueLength: urlQueue.length
    });

    if (!storedAuthToken || !storedIsLoggedIn || !storedSecretKey) {
      console.log('⚠️ Cannot process queue:', {
        reason: !storedAuthToken ? 'No auth token' : !storedSecretKey ? 'No secret key' : 'User not logged in'
      });
      return;
    }

    console.log('🔄 Processing URL queue:', urlQueue.length, 'items');

    // Process each URL in the queue
    for (let i = urlQueue.length - 1; i >= 0; i--) {
      const item = urlQueue[i];
      
      try {
        // Ensure we have a URL to encrypt
        if (!item.url) {
          console.error('Missing URL in queue item:', item);
          urlQueue.splice(i, 1);
          continue;
        }

        // Encrypt the URL
        const encryptedUrl = await encryptUrl(item.url, storedAuthToken, storedSecretKey);
        
        const response = await fetch(
          'https://api-prd-0.gotartifact.com//v2/logs/url',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${storedAuthToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encrypted_url: encryptedUrl }),
          }
        );

        if (response.ok) {
          urlQueue.splice(i, 1);
          console.log('✅ Successfully logged encrypted URL');
        } else {
          console.error('❌ Failed to log encrypted URL:', await response.text());
        }
      } catch (error) {
        console.error('❌ Error processing URL:', error);
      }
    }

    // Update stored queue
    await chrome.storage.local.set({ pendingUrls: urlQueue });
    console.log('💾 Updated stored queue, remaining items:', urlQueue.length);

  } catch (error) {
    console.error('❌ Error processing URL queue:', error);
  }
}

// Update initialization to remove token refresh setup
chrome.storage.local.get(['authToken', 'secretKey', 'isLoggedIn', 'refreshToken'], (result) => {
  storedAuthToken = result.authToken || null;
  storedSecretKey = result.secretKey || null;
  storedIsLoggedIn = result.isLoggedIn || false;
  storedRefreshToken = result.refreshToken || null;
  console.log('🔄 Initialized stored values');
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
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-native://') && 
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
      const newTabs = tabs.slice(previousTabCount);
      newTabs.forEach(tab => {
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-native://') && 
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
        if (tab.url && !tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-native://') && 
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
    if (activeTab?.url && 
        !activeTab.url.startsWith('chrome://') && 
        !activeTab.url.startsWith('chrome-native://') && 
        activeTab.url !== currentActiveTabUrl) {
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

// Add message listener for refresh token updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'REFRESH_TOKEN_UPDATE') {
    storedRefreshToken = message.refreshToken;
    console.log('🔑 Refresh token updated:', storedRefreshToken);
    
    // Store refresh token in local storage
    chrome.storage.local.set({ refreshToken: storedRefreshToken });
    
    // Setup refresh token timer
    setupRefreshTokenTimer();
  }
});

// Function to refresh authentication token
async function refreshAuthToken() {
  console.log('🔄 Attempting to refresh auth token');
  try {
    const response = await fetch('https://api-prd-0.gotartifact.com//v2/users/authentication/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refresh_token: storedRefreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.status}`);
    }

    const { data } = await response.json();
    // Update stored auth token with new value from the correct path
    console.log('🔑 Refresh token response:', data);
    
    // Update both local storage and memory variables
    storedAuthToken = data.id_token;
    storedRefreshToken = data.refresh_token;
    
    await chrome.storage.local.set({ 
      authToken: data.id_token,
      refreshToken: data.refresh_token 
    });

    console.log('✅ Auth token refreshed successfully:', {
      newAuthToken: storedAuthToken,
      newRefreshToken: storedRefreshToken
    });

    const authtoken= await chrome.storage.local.get(['authToken']);
    const refreshtoken= await chrome.storage.local.get(['refreshToken']);
    console.log('🔑 Refreshed data',{authtoken,refreshtoken});


  } catch (error) {
    console.error('❌ Failed to refresh auth token:', error);
  }
}

// Function to setup refresh token timer
function setupRefreshTokenTimer() {
  // Clear existing timer if any
  if (refreshTokenTimer) {
    clearInterval(refreshTokenTimer);
  }

  // Only set up timer if we have a refresh token
  if (storedRefreshToken) {
    console.log('⏰ Setting up refresh token timer');
    // Run every 55 minutes (3300000 milliseconds)
    refreshTokenTimer = setInterval(refreshAuthToken, 3300000);
    
    // Trigger initial refresh
    refreshAuthToken();
  } else {
    console.log('⚠️ No refresh token available, timer not set');
  }
}

// Cache for storing fetched scripts
const scriptCache = new Map();

// Function to fetch and cache scripts
async function fetchScript(url) {
  try {
    // Check cache first
    if (scriptCache.has(url)) {
      console.log('🎯 Returning cached script for:', url);
      return { content: scriptCache.get(url) };
    }

    console.log('📥 Fetching script from:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const content = await response.text();
    
    // Cache the script
    scriptCache.set(url, content);
    
    return { content };
  } catch (error) {
    console.error('❌ Error fetching script:', error);
    return { error: error.message };
  }
}

// Listen for script fetch requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'FETCH_SCRIPT') {
    console.log('🔄 Received script fetch request for:', message.url);
    
    // Handle the fetch request
    fetchScript(message.url)
      .then(response => {
        console.log('✅ Script fetch completed:', message.url);
        sendResponse(response);
      })
      .catch(error => {
        console.error('❌ Script fetch failed:', error);
        sendResponse({ error: error.message });
      });
    
    // Return true to indicate we will send a response asynchronously
    return true;
  }
});

// Function to inject script into a tab
async function injectScriptIntoTab(tabId, scriptUrl) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: 'MAIN', // This ensures the script runs in the main world context
      func: (url) => {
        const script = document.createElement('script');
        script.src = url;
        (document.head || document.documentElement).appendChild(script);
        return new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      },
      args: [scriptUrl]
    });
    return { success: true };
  } catch (error) {
    console.error('Script injection failed:', error);
    return { error: error.message };
  }
}

// Listen for script injection requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'INJECT_SCRIPT') {
    console.log('🔄 Received script injection request for:', message.url);
    
    injectScriptIntoTab(message.tabId, message.url)
      .then(result => {
        console.log('✅ Script injection completed:', message.url);
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ Script injection failed:', error);
        sendResponse({ error: error.message });
      });
    
    return true; // Will respond asynchronously
  }
  // ... rest of existing message handlers ...
});

// Handle ad content fetching
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'FETCH_AD_CONTENT') {
    console.log('🔄 Background script received fetch request for:', request.url);
    
    // First check if this is a VAST URL
    if (request.url.includes('pubads.g.doubleclick.net/gampad/ads')) {
      fetch(request.url)
        .then(response => response.text())
        .then(vastXml => {
          console.log('📄 Received VAST XML response');
          // Parse the XML to get video URLs
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(vastXml, 'text/xml');
          
          // Find all MediaFile elements
          const mediaFiles = xmlDoc.getElementsByTagName('MediaFile');
          console.log('🎥 Found MediaFiles:', mediaFiles.length);

          if (mediaFiles.length > 0) {
            // Find the most suitable video
            let selectedMedia = null;
            let selectedBitrate = 0;

            for (let i = 0; i < mediaFiles.length; i++) {
              const mediaFile = mediaFiles[i];
              const type = mediaFile.getAttribute('type');
              const bitrate = parseInt(mediaFile.getAttribute('bitrate') || '0');
              
              // Prefer MP4 format with highest bitrate under 2000
              if (type === 'video/mp4' && bitrate > selectedBitrate && bitrate < 2000) {
                selectedMedia = mediaFile;
                selectedBitrate = bitrate;
              }
            }

            if (selectedMedia) {
              const videoUrl = selectedMedia.textContent.trim();
              console.log('✅ Selected video URL:', videoUrl);
              
              // Now fetch the actual video content
              fetch(videoUrl, {
                method: 'GET',
                headers: {
                  'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
                  'Range': 'bytes=0-'
                }
              })
              .then(response => {
                if (!response.ok) {
                  throw new Error(`Video fetch failed: ${response.status}`);
                }
                console.log('✅ Video response received:', {
                  status: response.status,
                  type: response.headers.get('content-type'),
                  url: response.url
                });
                sendResponse({
                  success: true,
                  data: {
                    type: 'video/mp4',
                    url: videoUrl
                  }
                });
              })
              .catch(error => {
                console.error('❌ Error fetching video:', error);
                sendResponse({
                  success: false,
                  error: error.message
                });
              });
            } else {
              sendResponse({
                success: false,
                error: 'No suitable video format found in VAST response'
              });
            }
          } else {
            sendResponse({
              success: false,
              error: 'No MediaFile elements found in VAST response'
            });
          }
        })
        .catch(error => {
          console.error('❌ Error processing VAST XML:', error);
          sendResponse({
            success: false,
            error: error.message
          });
        });
      
      return true;
    }
    
    // Handle direct video URLs
    fetch(request.url, {
      method: 'GET',
      headers: {
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        'Range': 'bytes=0-'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      console.log('✅ Direct video response received');
      sendResponse({
        success: true,
        data: {
          type: response.headers.get('content-type') || 'video/mp4',
          url: request.url
        }
      });
    })
    .catch(error => {
      console.error('❌ Error fetching video:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    });

    return true;
  }
});