const webContentsId = 27;
let countryCode = 'US'; // Set default country code to US
let authValidationInterval = null; // For periodic auth validation

// Function to save authentication state to storage
function saveAuthState(isAuthenticated, userProfile = null) {
  chrome.storage.local.set({
    isAuthenticated: isAuthenticated,
    userProfile: userProfile,
    lastAuthCheck: Date.now()
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('🔵 Background: Error saving auth state:', chrome.runtime.lastError);
    } else {
      console.log('🔵 Background: Auth state saved to storage:', { isAuthenticated, userProfile });
    }
  });
}

// Function to get authentication state from storage
function getAuthState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['isAuthenticated', 'userProfile', 'lastAuthCheck'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('🔵 Background: Error getting auth state:', chrome.runtime.lastError);
        resolve({});
      } else {
        console.log('🔵 Background: Retrieved auth state from storage:', result);
        resolve(result);
      }
    });
  });
}

// Function to clear authentication state from storage
function clearAuthState() {
  chrome.storage.local.remove(['isAuthenticated', 'userProfile', 'lastAuthCheck'], () => {
    if (chrome.runtime.lastError) {
      console.error('🔵 Background: Error clearing auth state:', chrome.runtime.lastError);
    } else {
      console.log('🔵 Background: Auth state cleared from storage');
    }
  });
}

// Function to start periodic auth validation
function startPeriodicAuthValidation() {
  // Clear any existing interval
  if (authValidationInterval) {
    clearInterval(authValidationInterval);
  }
  
  // Check auth every hour (3600000 ms)
  authValidationInterval = setInterval(async () => {
    console.log('🔵 Background: Running periodic auth validation...');
    const storedState = await getAuthState();
    
    if (storedState.isAuthenticated) {
      // Perform a quick auth check to validate the stored state
      const authUrl = `https://m.popmart.com/${countryCode.toLowerCase()}/account`;
      try {
        chrome.wootz.createBackgroundWebContents(webContentsId, authUrl, (result) => {
          if (result.success) {
            // Quick check - just verify we can access the account page
            setTimeout(() => {
              chrome.tabs.sendMessage(webContentsId, {type: 'GET_CURRENT_URL'}, function(response) {
                if (chrome.runtime.lastError || !response) {
                  console.log('🔵 Background: Periodic auth validation failed - clearing stored state');
                  clearAuthState();
                  stopPeriodicAuthValidation();
                } else {
                  const expectedUrlPattern = `https://m.popmart.com/${countryCode.toLowerCase()}/account`;
                  const urlMatches = response.url && response.url.toLowerCase().startsWith(expectedUrlPattern);
                  
                  if (!urlMatches) {
                    console.log('🔵 Background: Periodic auth validation failed - URL mismatch');
                    clearAuthState();
                    stopPeriodicAuthValidation();
                  } else {
                    console.log('🔵 Background: Periodic auth validation successful');
                    // Update the last auth check timestamp
                    saveAuthState(true, storedState.userProfile);
                  }
                }
                // Clean up the WebContents
                destroyBackgroundWebContents();
              });
            }, 5000);
          } else {
            console.log('🔵 Background: Periodic auth validation failed - could not create WebContents');
            clearAuthState();
            stopPeriodicAuthValidation();
          }
        });
      } catch (error) {
        console.error('🔵 Background: Error during periodic auth validation:', error);
        clearAuthState();
        stopPeriodicAuthValidation();
      }
    } else {
      // No stored auth state, stop validation
      console.log('🔵 Background: No stored auth state, stopping periodic validation');
      stopPeriodicAuthValidation();
    }
  }, 3600000); // 1 hour
  
  console.log('🔵 Background: Started periodic auth validation (every hour)');
}

// Function to stop periodic auth validation
function stopPeriodicAuthValidation() {
  if (authValidationInterval) {
    clearInterval(authValidationInterval);
    authValidationInterval = null;
    console.log('🔵 Background: Stopped periodic auth validation');
  }
}

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
  console.log('🔵 Background: Starting auth check, will check URL in 10 seconds...');
  setTimeout(() => {
    console.log('🔵 Background: Checking URL after 10 seconds...');
    chrome.tabs.sendMessage(webContentsId, {type: 'GET_CURRENT_URL'}, function(response) {
      if (chrome.runtime.lastError) {
        console.error('🔵 Background: Error sending message:', chrome.runtime.lastError);
        // If we can't get the URL, assume authentication failed
        handleFailedAuthentication();
        return;
      }
      
      if (response) {
        console.log('🔵 Background: Received URL response:', response);
        checkUrlAndLoginStatus(response.url);
      } else {
        console.log('🔵 Background: No response received, assuming authentication failed');
        handleFailedAuthentication();
      }
    });
  }, 20000);
}

// Function to check URL and login status with retry logic
function checkUrlAndLoginStatus(url) {
  console.log('🔵 Background: Checking authentication for URL:', url);
  
  // Check if URL matches m.popmart.com/us (case insensitive)
  const expectedUrlPattern = `https://m.popmart.com/${countryCode.toLowerCase()}/account`;
  const urlMatches = url && url.toLowerCase().startsWith(expectedUrlPattern);
  
  console.log('🔵 Background: URL matches expected pattern:', urlMatches);

  const isAuthenticated = urlMatches;
  
  if (isAuthenticated) {
    console.log('🔵 Background: Authentication successful - URL matches expected pattern');
    // Extract user profile and save auth state
    chrome.tabs.sendMessage(webContentsId, {type: 'USER_PROFILE'}, function(response) {
      const userProfile = response && response.success ? response.profile : null;
      saveAuthState(true, userProfile);
      // Start periodic validation when user is authenticated
      startPeriodicAuthValidation();
      chrome.runtime.sendMessage({
        type: 'AUTH_SUCCESS',
        url: url,
        userProfile: userProfile
      });
    });
  } else {
    console.log('🔵 Background: Authentication failed - URL does not match expected pattern');
    handleFailedAuthentication();
  }
}

// Function to handle failed authentication
function handleFailedAuthentication() {
  console.log('🔵 Background: Authentication failed - sending AUTH_FAILED message');
  clearAuthState();
  stopPeriodicAuthValidation();
  chrome.runtime.sendMessage({
    type: 'AUTH_FAILED'
  });
}

// Function to handle WebContents creation failure
function handleWebContentsCreationFailed(error) {
  console.log('🔵 Background: WebContents creation failed:', error);
  chrome.runtime.sendMessage({
    type: 'WEB_CONTENTS_FAILED',
    error: error
  });
}

// Function to open login tab
function openLoginTab() {
  const loginUrl = `https://m.popmart.com/${countryCode.toLowerCase()}/user/login`;
  console.log('🔵 Background: Opening login tab with URL:', loginUrl);
  
  chrome.tabs.create({
    url: loginUrl,
    active: true
  });
}

// Function to check if stored auth state is still valid (not older than 24 hours)
function isStoredAuthValid(lastAuthCheck) {
  if (!lastAuthCheck) return false;
  const twentyFourHours = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  return (Date.now() - lastAuthCheck) < twentyFourHours;
}

// Initialize periodic auth validation on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('🔵 Background: Extension started, checking for stored auth state...');
  getAuthState().then((storedState) => {
    if (storedState.isAuthenticated && isStoredAuthValid(storedState.lastAuthCheck)) {
      console.log('🔵 Background: Valid stored auth state found, starting periodic validation');
      startPeriodicAuthValidation();
    } else {
      console.log('🔵 Background: No valid stored auth state found on startup');
    }
  });
});

// Initialize when extension is installed or updated
chrome.runtime.onInstalled.addListener((details) => {
  console.log('🔵 Background: Extension installed/updated:', details.reason);
  if (details.reason === 'install') {
    console.log('🔵 Background: First time installation');
    // Clear any existing auth state on fresh install
    clearAuthState();
  } else if (details.reason === 'update') {
    console.log('🔵 Background: Extension updated, checking stored auth state...');
    getAuthState().then((storedState) => {
      if (storedState.isAuthenticated && isStoredAuthValid(storedState.lastAuthCheck)) {
        console.log('🔵 Background: Valid stored auth state found after update, starting periodic validation');
        startPeriodicAuthValidation();
      } else {
        console.log('🔵 Background: No valid stored auth state found after update');
      }
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔵 Background: Received message:', message.type);
  
  switch (message.type) {
    case 'CHECK_AUTH':
      // First check if we have a valid stored auth state
      getAuthState().then((storedState) => {
        if (storedState.isAuthenticated && isStoredAuthValid(storedState.lastAuthCheck)) {
          console.log('🔵 Background: Using stored auth state');
          // Start periodic validation if not already running
          startPeriodicAuthValidation();
          chrome.runtime.sendMessage({
            type: 'AUTH_SUCCESS',
            url: `https://m.popmart.com/${countryCode.toLowerCase()}/account`,
            userProfile: storedState.userProfile
          });
        } else {
          // No valid stored state, perform fresh auth check
          console.log('🔵 Background: No valid stored auth state, performing fresh check');
          const authUrl = `https://m.popmart.com/${countryCode.toLowerCase()}/account`;
          console.log('🔵 Background: Creating auth WebContents for:', authUrl);
          try{
            chrome.wootz.createBackgroundWebContents(webContentsId, authUrl, (result) => {
              if (result.success) {
                console.log('🔵 Background: Auth WebContents created successfully');
                handleAuthCheck();
              } else {
                console.log('🔵 Background: Failed to create auth WebContents');
                handleWebContentsCreationFailed('Failed to create WebContents');
              }
            });
          } catch (error) {
            console.error('🔵 Background: Error creating auth WebContents:', error);
            handleWebContentsCreationFailed('Failed to create WebContents');
          }
        }
      });
      break;
      
    case 'SEARCH_LABUBU':
      const searchQuery = message.query;
      const formattedQuery = searchQuery.replace(/\s+/g, '-');
      const searchUrl = `https://m.popmart.com/${countryCode.toLowerCase()}/search/${formattedQuery}`;
      
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
          }, 3000);
        } else {
          console.log('🔵 Background: Failed to create search WebContents');
          sendResponse({ success: false, error: 'Failed to create search WebContents' });
        }
      });
      return true;
      
    case 'DESTROY_WEB_CONTENTS':
      console.log('🔵 Background: Destroying WebContents');
      destroyBackgroundWebContents();
      sendResponse({status: 'destroying'});
      break;
      
    case 'OPEN_LOGIN_TAB':
      console.log('🔵 Background: Opening login tab');
      openLoginTab();
      break;
      
    case 'USER_PROFILE':
      console.log('🔵 Background: Extracting user profile');
      // Send message to content script to extract user profile
      chrome.tabs.sendMessage(webContentsId, {
        type: 'USER_PROFILE'
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('🔵 Background: Error extracting user profile:', chrome.runtime.lastError);
          sendResponse({ success: false, error: 'Failed to extract user profile' });
          return;
        }
        
        console.log('🔵 Background: Received user profile:', response);
        if (response && response.success) {
          sendResponse({
            success: true,
            profile: response.profile
          });
        } else {
          sendResponse({
            success: false,
            error: response?.error || 'Failed to extract user profile'
          });
        }
      });
      return true;
      
    case 'LOGOUT':
      console.log('🔵 Background: User logged out');
      clearAuthState();
      stopPeriodicAuthValidation();
      destroyBackgroundWebContents();
      sendResponse({success: true});
      break;
  }
});
