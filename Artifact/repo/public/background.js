
// Add these variables at the top level
let storedAuthToken = null;
let storedSecretKey = null;
let storedIsLoggedIn = false;

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

    // Process queue if all conditions are met
    if (storedAuthToken && storedIsLoggedIn && storedSecretKey) {
      console.log('🔑 All auth conditions met, processing queue');
      processUrlQueue();
    } else {
      console.log('⏳ Waiting for all auth conditions');
    }
  }
});

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
    const response = await fetch('https://be-udp-stg-0-aocnhs7n5a-uc.a.run.app/v1/encrypt', {
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
          'https://api-staging-0.gotartifact.com/v2/logs/url',
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

// Initialize stored values on startup
chrome.storage.local.get(['authToken', 'secretKey', 'isLoggedIn'], (result) => {
  storedAuthToken = result.authToken || null;
  storedSecretKey = result.secretKey || null;
  storedIsLoggedIn = result.isLoggedIn || false;
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