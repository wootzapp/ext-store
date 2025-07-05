const webContentsId = 27;
let countryCode = '';

// Function to destroy background WebContents
function destroyBackgroundWebContents() {
  chrome.wootz.destroyBackgroundWebContents(webContentsId, (result) => {
    if (result.success) {
      console.log('Background WebContents destroyed');
    }
  });
}

// Function to handle auth check result
function handleAuthCheck() {
  setTimeout(() => {
    chrome.tabs.sendMessage(webContentsId, {type: 'GET_CURRENT_URL'}, function(response) {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError);
        return;
      }
      
      if (response) {
        handleAuthenticationResult(response.url);
      }
    });
  }, 20000);
}

// Function to handle authentication result based on URL
function handleAuthenticationResult(url) {
  const expectedUrlPattern = `https://m.popmart.com/${countryCode.toLowerCase()}`;
  const isAuthenticated = url && url.startsWith(expectedUrlPattern);
  
  if (isAuthenticated) {
    console.log('Authentication successful');
    chrome.runtime.sendMessage({
      type: 'AUTH_SUCCESS',
      url: url
    });
  } else {
    console.log('Authentication failed');
    handleFailedAuthentication();
  }
}

// Function to handle failed authentication
function handleFailedAuthentication() {
  const loginUrl = `https://popmart.com/${countryCode.toLowerCase()}/user/login`;
  
  chrome.tabs.create({
    url: loginUrl,
    active: true
  }, (tab) => {
    chrome.runtime.sendMessage({
      type: 'AUTH_FAILED',
      loginUrl: loginUrl
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔵 Background: Received message:', message.type);
  
  switch (message.type) {
    case 'COUNTRY_CHANGED':
      countryCode = message.country?.code || 'US';
      console.log('🔵 Background: Country changed to:', countryCode);
      break;
      
    case 'CHECK_AUTH':
      const authUrl = `https://popmart.com/${countryCode.toLowerCase()}/user/login`;
      console.log('🔵 Background: Creating auth WebContents for:', authUrl);
      
      chrome.wootz.createBackgroundWebContents(webContentsId, authUrl, (result) => {
        if (result.success) {
          console.log('🔵 Background: Auth WebContents created successfully');
          handleAuthCheck();
        } else {
          console.log('🔵 Background: Failed to create auth WebContents');
        }
      });
      break;
      
    case 'SEARCH_LABUBU':
      const searchQuery = message.query;
      const formattedQuery = searchQuery.replace(/\s+/g, '-');
      const searchUrl = `https://popmart.com/us/search/${formattedQuery}`;
      
      console.log('🔵 Background: Starting search for:', searchQuery);
      console.log('🔵 Background: Search URL:', searchUrl);
      
      chrome.wootz.createBackgroundWebContents(webContentsId, searchUrl, (result) => {
        if (result.success) {
          console.log('🔵 Background: Search WebContents created successfully');
          // Send message to content script to extract search results
          setTimeout(() => {
            console.log('🔵 Background: Sending EXTRACT_SEARCH_RESULTS to content script');
            chrome.tabs.sendMessage(webContentsId, {
              type: 'EXTRACT_SEARCH_RESULTS',
              searchQuery: searchQuery
            }, function(response) {
              if (chrome.runtime.lastError) {
                console.error('🔵 Background: Error extracting search results:', chrome.runtime.lastError);
                sendResponse({ success: false, error: 'Failed to extract results' });
                return;
              }
              
              console.log('🔵 Background: Received search results:', response);
              if (response && response.success) {
                sendResponse({
                  success: true,
                  results: response.results,
                  searchQuery: searchQuery
                });
              } else {
                sendResponse({
                  success: false,
                  error: response?.error || 'No results found'
                });
              }
            });
          }, 3000); // Wait for page to load
        } else {
          console.log('🔵 Background: Failed to create search WebContents');
          sendResponse({ success: false, error: 'Failed to create search WebContents' });
        }
      });
      return true; // Keep message channel open for async response
      
    case 'RETRY_AUTH':
      console.log('🔵 Background: Retrying authentication');
      destroyBackgroundWebContents();
      setTimeout(() => {
        const authUrl = `https://popmart.com/${countryCode.toLowerCase()}/user/login`;
        chrome.wootz.createBackgroundWebContents(webContentsId, authUrl, (result) => {
          if (result.success) {
            console.log('🔵 Background: New background WebContents created for retry');
            handleAuthCheck();
          }
        });
      }, 2000);
      break;
      
    case 'DESTROY_WEB_CONTENTS':
      console.log('🔵 Background: Destroying WebContents');
      destroyBackgroundWebContents();
      sendResponse({status: 'destroying'});
      break;
  }
});
