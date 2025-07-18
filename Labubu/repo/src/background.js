const webContentsId = 27; // For auth operations
const searchWebContentsId = 29; // For search operations
const productWebContentsId = 30; // For product details
const cartWebContentsId = 31; // For cart operations
const retryWebContentsId = 28; // For retry operations (keep existing)
let countryCode = 'US';
let authValidationInterval = null;
let retryIntervals = new Map(); // Store retry intervals for each product
let retryQueue = []; // Queue of products waiting to be retried
let isRetryInProgress = false; // Flag to prevent multiple retries at once 
let backgroundCheckInterval = null;
let backgroundCheckQueue = []; // Products to check in background

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


function clearAuthState() {
  chrome.storage.local.remove(['isAuthenticated', 'userProfile', 'lastAuthCheck'], () => {
    if (chrome.runtime.lastError) {
      console.error('🔵 Background: Error clearing auth state:', chrome.runtime.lastError);
    } else {
      console.log('🔵 Background: Auth state cleared from storage');
    }
  });
}

function startPeriodicAuthValidation() {
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
                    saveAuthState(true, storedState.userProfile);
                  }
                }
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
      console.log('🔵 Background: No stored auth state, stopping periodic validation');
      stopPeriodicAuthValidation();
    }
  }, 600000); // 10 minute
  
  console.log('🔵 Background: Started periodic auth validation (every hour)');
}

function stopPeriodicAuthValidation() {
  if (authValidationInterval) {
    clearInterval(authValidationInterval);
    authValidationInterval = null;
    console.log('🔵 Background: Stopped periodic auth validation');
  }
}

function destroyBackgroundWebContents() {
  chrome.wootz.destroyBackgroundWebContents(webContentsId, (result) => {
    if (result.success) {
      console.log('Background WebContents destroyed');
    }
  });
}

function handleAuthCheck() {
  console.log('🔵 Background: Starting auth check, will check URL in 10 seconds...');
  setTimeout(() => {
    console.log('🔵 Background: Checking URL after 10 seconds...');
    
    // Add retry logic with exponential backoff for auth check
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptAuthCheck = () => {
      setTimeout(() => {
        console.log('🔵 Background: Attempting to get current URL (attempt ' + (retryCount + 1) + ')');
        
        // First check if content script is ready
        chrome.tabs.sendMessage(webContentsId, {type: 'PING'}, function(pingResponse) {
          if (chrome.runtime.lastError) {
            console.log('🔵 Background: Content script not ready yet, retrying...');
            retryCount++;
            if (retryCount < maxRetries) {
              attemptAuthCheck();
            } else {
              console.error('🔵 Background: Content script never became ready');
              handleFailedAuthentication();
              destroyBackgroundWebContents();
            }
            return;
          }
          
          // Content script is ready, proceed with URL check
    chrome.tabs.sendMessage(webContentsId, {type: 'GET_CURRENT_URL'}, function(response) {
      if (chrome.runtime.lastError) {
        console.error('🔵 Background: Error sending message:', chrome.runtime.lastError);
        handleFailedAuthentication();
              destroyBackgroundWebContents();
        return;
      }
      
      if (response) {
        console.log('🔵 Background: Received URL response:', response);
        checkUrlAndLoginStatus(response.url);
      } else {
        console.log('🔵 Background: No response received, assuming authentication failed');
        handleFailedAuthentication();
              destroyBackgroundWebContents();
      }
    });
        });
      }, 2000 + (retryCount * 1000)); // Exponential backoff: 2s, 3s, 4s
    };
    
    attemptAuthCheck();
  }, 20000);
}

function checkUrlAndLoginStatus(url) {
  console.log('🔵 Background: Checking authentication for URL:', url);
  const expectedUrlPattern = `https://m.popmart.com/${countryCode.toLowerCase()}/account`;
  const urlMatches = url && url.toLowerCase().startsWith(expectedUrlPattern);
  
  console.log('🔵 Background: URL matches expected pattern:', urlMatches);

  const isAuthenticated = urlMatches;
  
  if (isAuthenticated) {
    console.log('🔵 Background: Authentication successful - URL matches expected pattern');
    
    // Add retry logic with exponential backoff for user profile extraction
    let retryCount = 0;
    const maxRetries = 3;
    
    const attemptProfileExtraction = () => {
      setTimeout(() => {
        console.log('🔵 Background: Attempting to extract user profile (attempt ' + (retryCount + 1) + ')');
        
        // First check if content script is ready
        chrome.tabs.sendMessage(webContentsId, {type: 'PING'}, function(pingResponse) {
          if (chrome.runtime.lastError) {
            console.log('🔵 Background: Content script not ready yet, retrying...');
            retryCount++;
            if (retryCount < maxRetries) {
              attemptProfileExtraction();
            } else {
              console.error('🔵 Background: Content script never became ready');
              handleFailedAuthentication();
              destroyBackgroundWebContents();
            }
            return;
          }
          
          // Content script is ready, proceed with profile extraction
    chrome.tabs.sendMessage(webContentsId, {type: 'USER_PROFILE'}, function(response) {
      const userProfile = response && response.success ? response.profile : null;
      saveAuthState(true, userProfile);
      startPeriodicAuthValidation();
            startBackgroundPeriodicCheck();
      chrome.runtime.sendMessage({
        type: 'AUTH_SUCCESS',
        url: url,
        userProfile: userProfile
      });
            destroyBackgroundWebContents();
    });
        });
      }, 2000 + (retryCount * 1000)); // Exponential backoff: 2s, 3s, 4s
    };
    
    attemptProfileExtraction();
  } else {
    console.log('🔵 Background: Authentication failed - URL does not match expected pattern');
    handleFailedAuthentication();
    destroyBackgroundWebContents();
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
function isStoredAuthValid(lastAuthCheck) {
  if (!lastAuthCheck) return false;
  const twentyFourHours = 10 * 60 * 1000; // 10 minutes in milliseconds
  return (Date.now() - lastAuthCheck) < twentyFourHours;
}

function startBackgroundPeriodicCheck() {
  if (backgroundCheckInterval) {
    clearInterval(backgroundCheckInterval);
  }
  
  // Check every 2 minutes (120000 ms)
  backgroundCheckInterval = setInterval(() => {
    console.log('🔵 Background: Running background periodic check...');
    checkWaitlistProductsInBackground();
  }, 120000); // 2 minutes
  
  console.log('🔵 Background: Started background periodic check (every 2 minutes)');
}

function stopBackgroundPeriodicCheck() {
  if (backgroundCheckInterval) {
    clearInterval(backgroundCheckInterval);
    backgroundCheckInterval = null;
    console.log('🔵 Background: Stopped background periodic check');
  }
}

function checkWaitlistProductsInBackground() {
  chrome.storage.local.get(['waitlistProducts'], (result) => {
    const waitlistProducts = result.waitlistProducts || [];
    
    if (waitlistProducts.length === 0) {
      console.log('🔵 Background: No waitlist products to check');
      return;
    }
    
    console.log('🔵 Background: Checking', waitlistProducts.length, 'waitlist products in background');
    
    // Add all waitlist products to background check queue
    waitlistProducts.forEach(product => {
      addToBackgroundCheckQueue(product);
    });
    
    // Process the queue
    processBackgroundCheckQueue();
  });
}

function addToBackgroundCheckQueue(product) {
  const existingIndex = backgroundCheckQueue.findIndex(item => item.url === product.url);
  if (existingIndex !== -1) {
    console.log('🔵 Background: Product already in background check queue:', product.name);
    return;
  }
  
  backgroundCheckQueue.push({
    productDetails: {
      name: product.name,
      image: product.image,
      url: product.url
    },
    productPrice: product.price
  });
  
  console.log('🔵 Background: Added to background check queue:', product.name);
}

function processBackgroundCheckQueue() {
  if (backgroundCheckQueue.length === 0) {
    console.log('🔵 Background: Background check queue empty');
    return;
  }
  
  const nextProduct = backgroundCheckQueue.shift();
  console.log('🔵 Background: Processing background check for:', nextProduct.productDetails.name);
  
  checkProductAvailabilityInBackground(nextProduct.productDetails, nextProduct.productPrice);
}

function checkProductAvailabilityInBackground(productDetails, productPrice) {
  console.log('🔵 Background: Checking product availability in background:', productDetails.name);
  
  try {
    chrome.wootz.createBackgroundWebContents(retryWebContentsId, productDetails.url, (result) => {
      if (result.success) {
        console.log('🔵 Background: Background check WebContents created successfully');
        
        // Add retry logic with exponential backoff for background check
        let retryCount = 0;
        const maxRetries = 3;
        
        const attemptBackgroundClick = () => {
          setTimeout(() => {
            console.log('🔵 Background: Attempting to click add to cart in background check (attempt ' + (retryCount + 1) + ')');
            
            // First check if content script is ready
            chrome.tabs.sendMessage(retryWebContentsId, {type: 'PING'}, function(pingResponse) {
              if (chrome.runtime.lastError) {
                console.log('🔵 Background: Content script not ready for background check, retrying...');
                retryCount++;
                if (retryCount < maxRetries) {
                  attemptBackgroundClick();
                } else {
                  console.error('🔵 Background: Content script never became ready for background check');
                  destroyRetryWebContents();
                  processNextBackgroundCheck();
                }
                return;
              }
              
              // Content script is ready, proceed with click
              chrome.tabs.sendMessage(retryWebContentsId, {
                type: 'CLICK_ADD_TO_CART'
              }, function(clickResponse) {
                if (chrome.runtime.lastError) {
                  console.error('🔵 Background: Error in background check:', chrome.runtime.lastError);
                  destroyRetryWebContents();
                  processNextBackgroundCheck();
                  return;
                }
                
                console.log('🔵 Background: Background check click response:', clickResponse);
                if (clickResponse && clickResponse.success) {
                  console.log('🔵 Background: Product available in background check!');
                  
                  setTimeout(() => {
                    let cartRetryCount = 0;
                    const maxCartRetries = 3;
                    
                    const attemptBackgroundCartCheck = () => {
                      chrome.wootz.createBackgroundWebContents(cartWebContentsId, `https://m.popmart.com/${countryCode.toLowerCase()}/largeShoppingCart`, (cartResult) => {
                        if (cartResult.success) {
                          console.log('🔵 Background: Background check cart WebContents created successfully');
                          
                          setTimeout(() => {
                            console.log('🔵 Background: Attempting to check cart in background (attempt ' + (cartRetryCount + 1) + ')');
                            
                            // First check if cart content script is ready
                            chrome.tabs.sendMessage(cartWebContentsId, {type: 'PING'}, function(pingResponse) {
                              if (chrome.runtime.lastError) {
                                console.log('🔵 Background: Cart content script not ready for background check, retrying...');
                                cartRetryCount++;
                                if (cartRetryCount < maxCartRetries) {
                                  attemptBackgroundCartCheck();
                                } else {
                                  console.error('🔵 Background: Cart content script never became ready for background check');
                                  destroyCartWebContents();
                                  destroyRetryWebContents();
                                  processNextBackgroundCheck();
                                }
                                return;
                              }
                              
                              // Cart content script is ready, proceed with check
                              chrome.tabs.sendMessage(cartWebContentsId, {
                                type: 'CHECK_PRODUCT_IN_CART',
                                productName: productDetails.name
                              }, function(cartResponse) {
                                if (chrome.runtime.lastError) {
                                  console.error('🔵 Background: Error checking cart in background:', chrome.runtime.lastError);
                                  destroyCartWebContents();
                                  destroyRetryWebContents();
                                  processNextBackgroundCheck();
                                  return;
                                }
                                
                                if (cartResponse && cartResponse.inCart) {
                                  console.log('🔵 Background: Product successfully added to cart in background check!');
                                  
                                  // Move from waitlist to cart
                                  moveFromWaitlistToCart(productDetails, productPrice);
                                  
                                  // Send notification to user
                                  chrome.runtime.sendMessage({
                                    type: 'BACKGROUND_ADDED_TO_CART',
                                    productName: productDetails.name
                                  });
                                  
                                  // Show notification
                                  chrome.notifications.create({
                                    type: 'basic',
                                    iconUrl: 'src/assets/icon.png',
                                    title: 'Labubu Available! 🎉',
                                    message: `${productDetails.name} has been added to your cart!`
                                  });
                                }
                                
                                destroyCartWebContents();
                                destroyRetryWebContents();
                                processNextBackgroundCheck();
                              });
                            });
                          }, 3000);
                        } else {
                          console.log('🔵 Background: Failed to create cart WebContents in background check');
                          destroyRetryWebContents();
                          processNextBackgroundCheck();
                        }
                      });
                    };
                    
                    attemptBackgroundCartCheck();
                  }, 2000);
                } else {
                  console.log('🔵 Background: Product still not available in background check');
                  destroyRetryWebContents();
                  processNextBackgroundCheck();
                }
              });
            });
          }, 5000 + (retryCount * 1000)); // Exponential backoff: 5s, 6s, 7s
        };
        
        attemptBackgroundClick();
      } else {
        console.log('🔵 Background: Failed to create background check WebContents');
        processNextBackgroundCheck();
      }
    });
  } catch (error) {
    console.error('🔵 Background: Error in background check:', error);
    processNextBackgroundCheck();
  }
}

function processNextBackgroundCheck() {
  console.log('🔵 Background: Current background check completed, processing next');
  
  setTimeout(() => {
    processBackgroundCheckQueue();
  }, 5000); // Wait 5 seconds between checks
}

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
  
  // Start background periodic check regardless of auth state
  startBackgroundPeriodicCheck();
});

chrome.runtime.onInstalled.addListener((details) => {
  console.log('🔵 Background: Extension installed/updated:', details.reason);
  if (details.reason === 'install') {
    console.log('🔵 Background: First time installation');
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
  
  // Start background periodic check regardless of auth state
  startBackgroundPeriodicCheck();
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔵 Background: Received message:', message.type);
  
  switch (message.type) {
    case 'CHECK_AUTH':
      getAuthState().then((storedState) => {
        if (storedState.isAuthenticated && isStoredAuthValid(storedState.lastAuthCheck)) {
          console.log('🔵 Background: Using stored auth state');
          startPeriodicAuthValidation();
          chrome.runtime.sendMessage({
            type: 'AUTH_SUCCESS',
            url: `https://m.popmart.com/${countryCode.toLowerCase()}/account`,
            userProfile: storedState.userProfile
          });
        } else {
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
      
      chrome.wootz.createBackgroundWebContents(searchWebContentsId, searchUrl, (result) => {
        if (result.success) {
          console.log('🔵 Background: Search WebContents created successfully');
          
          // Add retry logic with exponential backoff
          let retryCount = 0;
          const maxRetries = 10;
          
          const attemptExtraction = () => {
          setTimeout(() => {
              console.log('🔵 Background: Attempting to extract search results (attempt ' + (retryCount + 1) + ')');
              
              // First check if content script is ready
              chrome.tabs.sendMessage(searchWebContentsId, {type: 'PING'}, function(pingResponse) {
                if (chrome.runtime.lastError) {
                  console.log('🔵 Background: Content script not ready yet, retrying...');
                  retryCount++;
                  if (retryCount < maxRetries) {
                    attemptExtraction();
                  } else {
                    console.error('🔵 Background: Content script never became ready');
                    sendResponse({ success: false, error: 'Content script not available' });
                    destroySearchWebContents();
                  }
                  return;
                }
                
                // Content script is ready, proceed with extraction
                chrome.tabs.sendMessage(searchWebContentsId, {
              type: 'EXTRACT_SEARCH_RESULTS',
              searchQuery: searchQuery
            }, function(response) {
              if (chrome.runtime.lastError) {
                console.error('🔵 Background: Error extracting search results:', chrome.runtime.lastError);
                sendResponse({ success: false, error: 'Failed to extract results' });
                    destroySearchWebContents();
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
                  destroySearchWebContents();
                });
              });
            }, 2000 + (retryCount * 1000)); // Exponential backoff: 2s, 3s, 4s
          };
          
          attemptExtraction();
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
      
      // Add retry logic with exponential backoff for user profile extraction
      let retryCount = 0;
      const maxRetries = 10;
      
      const attemptProfileExtraction = () => {
        setTimeout(() => {
          console.log('🔵 Background: Attempting to extract user profile (attempt ' + (retryCount + 1) + ')');
          
          // First check if content script is ready
          chrome.tabs.sendMessage(webContentsId, {type: 'PING'}, function(pingResponse) {
            if (chrome.runtime.lastError) {
              console.log('🔵 Background: Content script not ready yet, retrying...');
              retryCount++;
              if (retryCount < maxRetries) {
                attemptProfileExtraction();
              } else {
                console.error('🔵 Background: Content script never became ready');
                sendResponse({ success: false, error: 'Content script not available' });
                destroyBackgroundWebContents();
              }
              return;
            }
            
            // Content script is ready, proceed with extraction
      chrome.tabs.sendMessage(webContentsId, {
        type: 'USER_PROFILE'
      }, function(response) {
        if (chrome.runtime.lastError) {
          console.error('🔵 Background: Error extracting user profile:', chrome.runtime.lastError);
          sendResponse({ success: false, error: 'Failed to extract user profile' });
                destroyBackgroundWebContents();
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
              destroyBackgroundWebContents();
      });
          });
        }, 2000 + (retryCount * 1000)); // Exponential backoff: 2s, 3s, 4s
      };
      
      attemptProfileExtraction();
      return true;
      
    case 'OPEN_PRODUCT_DETAILS':
      const productUrl = message.url;
      const productPrice = message.price;
      console.log('🔵 Background: Opening product details for:', productUrl);
      
      chrome.wootz.createBackgroundWebContents(productWebContentsId, productUrl, (result) => {
        if (result.success) {
          console.log('🔵 Background: Product details WebContents created successfully');
          
          // Add retry logic with exponential backoff for product details extraction
          let retryCount = 0;
          const maxRetries = 10;
          
          const attemptProductExtraction = () => {
          setTimeout(() => {
              console.log('🔵 Background: Attempting to extract product details (attempt ' + (retryCount + 1) + ')');
              
              // First check if content script is ready
              chrome.tabs.sendMessage(productWebContentsId, {type: 'PING'}, function(pingResponse) {
                if (chrome.runtime.lastError) {
                  console.log('🔵 Background: Content script not ready yet, retrying...');
                  retryCount++;
                  if (retryCount < maxRetries) {
                    attemptProductExtraction();
                  } else {
                    console.error('🔵 Background: Content script never became ready');
                    sendResponse({ success: false, error: 'Content script not available' });
                    destroyProductWebContents();
                  }
                  return;
                }
                
                // Content script is ready, proceed with extraction
                chrome.tabs.sendMessage(productWebContentsId, {
              type: 'EXTRACT_PRODUCT_DETAILS',
              productPrice: productPrice
            }, function(response) {
              if (chrome.runtime.lastError) {
                console.error('🔵 Background: Error extracting product details:', chrome.runtime.lastError);
                sendResponse({ success: false, error: 'Failed to extract product details' });
                    destroyProductWebContents();
                return;
              }
              
              console.log('🔵 Background: Received product details:', response);
              if (response && response.success) {
                const productName = response.productDetails.name;
                
                    // Click add to cart button using content script with retry logic
                    let clickRetryCount = 0;
                    const maxClickRetries = 3;
                    
                    const attemptClickAddToCart = () => {
                setTimeout(() => {
                        console.log('🔵 Background: Attempting to click add to cart (attempt ' + (clickRetryCount + 1) + ')');
                        
                        chrome.tabs.sendMessage(productWebContentsId, {type: 'PING'}, function(pingResponse) {
                          if (chrome.runtime.lastError) {
                            console.log('🔵 Background: Content script not ready for click, retrying...');
                            clickRetryCount++;
                            if (clickRetryCount < maxClickRetries) {
                              attemptClickAddToCart();
                            } else {
                              console.error('🔵 Background: Content script never became ready for click');
                              sendResponse({
                                success: true,
                                productDetails: response.productDetails,
                                productPrice: productPrice,
                                addedToCart: false
                              });
                              destroyProductWebContents();
                            }
                            return;
                          }
                          
                          // Content script is ready, proceed with click
                          chrome.tabs.sendMessage(productWebContentsId, {
                    type: 'CLICK_ADD_TO_CART'
                  }, function(clickResponse) {
                    if (chrome.runtime.lastError) {
                      console.error('🔵 Background: Error clicking add to cart button:', chrome.runtime.lastError);
                      sendResponse({
                        success: true,
                        productDetails: response.productDetails,
                        productPrice: productPrice,
                        addedToCart: false
                      });
                              destroyProductWebContents();
                      return;
                    }
                    
                    console.log('🔵 Background: Click response:', clickResponse);
                    if (clickResponse && clickResponse.success) {
                      console.log('🔵 Background: Added to cart successfully');
                      
                      // Wait a bit for the cart to update, then open cart to check
                      setTimeout(() => {
                                // Open cart to check if product was added with retry logic
                                let cartRetryCount = 0;
                                const maxCartRetries = 3;
                                
                                const attemptCartCheck = () => {
                                  chrome.wootz.createBackgroundWebContents(cartWebContentsId, `https://m.popmart.com/${countryCode.toLowerCase()}/largeShoppingCart`, (cartResult) => {
                          if (cartResult.success) {
                            console.log('🔵 Background: Large shopping cart WebContents created successfully');
                                      
                            setTimeout(() => {
                                        console.log('🔵 Background: Attempting to check cart (attempt ' + (cartRetryCount + 1) + ')');
                                        
                                        chrome.tabs.sendMessage(cartWebContentsId, {type: 'PING'}, function(pingResponse) {
                                          if (chrome.runtime.lastError) {
                                            console.log('🔵 Background: Cart content script not ready, retrying...');
                                            cartRetryCount++;
                                            if (cartRetryCount < maxCartRetries) {
                                              attemptCartCheck();
                                            } else {
                                              console.error('🔵 Background: Cart content script never became ready');
                                              sendResponse({ 
                                                success: true, 
                                                productDetails: response.productDetails,
                                                productPrice: productPrice,
                                                addedToCart: false,
                                                cartCheck: false
                                              });
                                              destroyCartWebContents();
                                              destroyProductWebContents();
                                            }
                                            return;
                                          }
                                          
                                          // Cart content script is ready, proceed with check
                                          chrome.tabs.sendMessage(cartWebContentsId, {
                                type: 'CHECK_PRODUCT_IN_CART',
                                productName: productName
                              }, function(cartResponse) {
                                if (chrome.runtime.lastError) {
                                  console.error('🔵 Background: Error checking product in cart:', chrome.runtime.lastError);
                                  sendResponse({ 
                                    success: true, 
                                    productDetails: response.productDetails,
                                    productPrice: productPrice,
                                    addedToCart: false,
                                    cartCheck: false
                                  });
                                              destroyCartWebContents();
                                              destroyProductWebContents();
                                  return;
                                }
                                
                                console.log('🔵 Background: Received cart check response:', cartResponse);
                                const finalResponse = {
                                  success: true,
                                  productDetails: response.productDetails,
                                  productPrice: productPrice,
                                  addedToCart: cartResponse && cartResponse.inCart,
                                  cartCheck: cartResponse && cartResponse.success,
                                  inCart: cartResponse && cartResponse.inCart
                                };
                                
                                // Add to cart storage if successfully added
                                if (cartResponse && cartResponse.inCart) {
                                  addToCartStorage(response.productDetails, productPrice);
                                }
                                
                                sendResponse(finalResponse);
                                            destroyCartWebContents();
                                            destroyProductWebContents();
                                          });
                              });
                            }, 3000);
                          } else {
                            console.log('🔵 Background: Failed to create large shopping cart WebContents');
                            sendResponse({
                              success: true,
                              productDetails: response.productDetails,
                              productPrice: productPrice,
                              addedToCart: false,
                              cartCheck: false
                            });
                                      destroyProductWebContents();
                          }
                        });
                                };
                                
                                attemptCartCheck();
                      }, 2000);
                    } else {
                      console.log('🔵 Background: Failed to add to cart');
                      
                      // Add to waitlist if failed to add to cart
                      addToWaitlistStorage(response.productDetails, productPrice);
                      
                      // Start automatic retry process
                      startRetryProcess(response.productDetails, productPrice);
                      
                      sendResponse({
                        success: true,
                        productDetails: response.productDetails,
                        productPrice: productPrice,
                        addedToCart: false
                      });
                              destroyProductWebContents();
                    }
                          });
                  });
                }, 2000);
                    };
                    
                    attemptClickAddToCart();
              } else {
                sendResponse({
                  success: false,
                  error: response?.error || 'No product details found'
                });
                    destroyProductWebContents();
                  }
                });
              });
            }, 5000 + (retryCount * 1000)); // Exponential backoff: 5s, 6s, 7s
          };
          
          attemptProductExtraction();
        } else {
          console.log('🔵 Background: Failed to create product details WebContents');
          sendResponse({ success: false, error: 'Failed to create product details WebContents' });
        }
      });
      return true;
      
    case 'LOGOUT':
      console.log('🔵 Background: User logged out');
      clearAuthState();
      stopPeriodicAuthValidation();
      stopBackgroundPeriodicCheck();
      destroyBackgroundWebContents();
      sendResponse({success: true});
      break;
       
    case 'LOAD_CART_PRODUCTS':
      console.log('🔵 Background: Loading cart products');
      loadCartProductsWithWebContents(sendResponse);
      return true;
      
    case 'LOAD_WAITLIST_PRODUCTS':
      console.log('🔵 Background: Loading waitlist products');
      loadWaitlistProducts(sendResponse);
      return true;
      
    case 'REMOVE_FROM_CART':
      console.log('🔵 Background: Removing from cart:', message.productId);
      removeFromCart(message.productId, sendResponse);
      return true;
      
    case 'REMOVE_FROM_WAITLIST':
      console.log('🔵 Background: Removing from waitlist:', message.productId);
      removeFromWaitlist(message.productId, sendResponse);
      return true;
  }
});


function addToCartStorage(productDetails, price) {
  const product = {
    id: Date.now().toString(),
    name: productDetails.name,
    image: productDetails.image,
    price: price,
    url: productDetails.url,
    addedAt: new Date().toISOString()
  };
  
  chrome.storage.local.get(['cartProducts'], (result) => {
    const cartProducts = result.cartProducts || [];
    cartProducts.push(product);
    chrome.storage.local.set({ cartProducts }, () => {
      console.log('🔵 Background: Product added to cart storage:', product);
    });
  });
}

function addToWaitlistStorage(productDetails, price) {
  const product = {
    id: Date.now().toString(),
    name: productDetails.name,
    image: productDetails.image,
    price: price,
    url: productDetails.url,
    addedAt: new Date().toISOString()
  };
  
  chrome.storage.local.get(['waitlistProducts'], (result) => {
    const waitlistProducts = result.waitlistProducts || [];
    waitlistProducts.push(product);
    chrome.storage.local.set({ waitlistProducts }, () => {
      console.log('🔵 Background: Product added to waitlist storage:', product);
    });
  });
}

function loadCartProducts(sendResponse) {
  chrome.storage.local.get(['cartProducts'], (result) => {
    const cartProducts = result.cartProducts || [];
    console.log('🔵 Background: Loaded cart products:', cartProducts);
    sendResponse({
      success: true,
      products: cartProducts
    });
  });
}

function loadCartProductsWithWebContents(sendResponse) {
  console.log('🔵 Background: Loading cart products with WebContents');
  
  chrome.storage.local.get(['cartProducts'], (result) => {
    const storedCartProducts = result.cartProducts || [];
    console.log('🔵 Background: Stored cart products:', storedCartProducts);
    
    const cartUrl = `https://m.popmart.com/${countryCode.toLowerCase()}/largeShoppingCart`;
    
    chrome.wootz.createBackgroundWebContents(cartWebContentsId, cartUrl, (result) => {
      if (result.success) {
        console.log('🔵 Background: Cart WebContents created successfully');
        
        // Add retry logic with exponential backoff for cart extraction
        let retryCount = 0;
        const maxRetries = 10;
        
        const attemptCartExtraction = () => {
        setTimeout(() => {
            console.log('🔵 Background: Attempting to extract cart products (attempt ' + (retryCount + 1) + ')');
            
            // First check if content script is ready
            chrome.tabs.sendMessage(cartWebContentsId, {type: 'PING'}, function(pingResponse) {
              if (chrome.runtime.lastError) {
                console.log('🔵 Background: Content script not ready yet, retrying...');
                retryCount++;
                if (retryCount < maxRetries) {
                  attemptCartExtraction();
                } else {
                  console.error('🔵 Background: Content script never became ready');
                  // Fallback to stored products
                  sendResponse({
                    success: true,
                    products: storedCartProducts
                  });
                  destroyCartWebContents();
                }
                return;
              }
              
              // Content script is ready, proceed with extraction
              chrome.tabs.sendMessage(cartWebContentsId, {
            type: 'EXTRACT_CART_PRODUCTS'
          }, function(response) {
            if (chrome.runtime.lastError) {
              console.error('🔵 Background: Error extracting cart products:', chrome.runtime.lastError);
              // Fallback to stored products
              sendResponse({
                success: true,
                products: storedCartProducts
              });
                  destroyCartWebContents();
              return;
            }
            
            console.log('🔵 Background: Received cart products from WebContents:', response);
            if (response && response.success) {
              const freshProducts = response.products || [];
              const mergedProducts = mergeCartProducts(storedCartProducts, freshProducts);
              
              chrome.storage.local.set({ cartProducts: mergedProducts }, () => {
                console.log('🔵 Background: Updated cart storage with fresh data');
              });
              
              sendResponse({
                success: true,
                products: mergedProducts
              });
            } else {
              sendResponse({
                success: true,
                products: storedCartProducts
              });
            }
                destroyCartWebContents();
              });
            });
          }, 3000 + (retryCount * 1000)); // Exponential backoff: 3s, 4s, 5s
        };
        
        attemptCartExtraction();
      } else {
        console.log('🔵 Background: Failed to create cart WebContents, using stored data');
        sendResponse({
          success: true,
          products: storedCartProducts
        });
      }
    });
  });
}

function mergeCartProducts(storedProducts, freshProducts) {
  const storedMap = new Map();
  storedProducts.forEach(product => {
    storedMap.set(product.url, product);
  });
  
  const merged = freshProducts.map(freshProduct => {
    const storedProduct = storedMap.get(freshProduct.url);
    if (storedProduct) {
      return {
        ...storedProduct,
        name: freshProduct.name || storedProduct.name,
        price: freshProduct.price || storedProduct.price,
        image: freshProduct.image || storedProduct.image
      };
    }
    return freshProduct;
  });
  
  freshProducts.forEach(product => {
    storedMap.delete(product.url);
  });
  
  storedMap.forEach(product => {
    merged.push(product);
  });
  
  return merged;
}

function loadWaitlistProducts(sendResponse) {
  chrome.storage.local.get(['waitlistProducts'], (result) => {
    const waitlistProducts = result.waitlistProducts || [];
    console.log('🔵 Background: Loaded waitlist products:', waitlistProducts);
    sendResponse({
      success: true,
      products: waitlistProducts
    });
  });
}

function removeFromCart(productId, sendResponse) {
  chrome.storage.local.get(['cartProducts'], (result) => {
    const cartProducts = result.cartProducts || [];
    const updatedCart = cartProducts.filter(p => p.id !== productId);
    chrome.storage.local.set({ cartProducts: updatedCart }, () => {
      console.log('🔵 Background: Product removed from cart:', productId);
      sendResponse({ success: true });
    });
  });
}

function removeFromWaitlist(productId, sendResponse) {
  chrome.storage.local.get(['waitlistProducts'], (result) => {
    const waitlistProducts = result.waitlistProducts || [];
    const updatedWaitlist = waitlistProducts.filter(p => p.id !== productId);
    chrome.storage.local.set({ waitlistProducts: updatedWaitlist }, () => {
      console.log('🔵 Background: Product removed from waitlist:', productId);

      stopRetryProcess(productId);
      
      sendResponse({ success: true });
    });
  });
}

function startRetryProcess(productDetails, productPrice) {
  const productId = productDetails.url;
  
  stopRetryProcess(productId);
  
  console.log('🔵 Background: Starting retry process for product:', productDetails.name);
  
  const intervalId = setInterval(() => {
    addToRetryQueue(productDetails, productPrice, productId);
  }, 60000);
  
  retryIntervals.set(productId, intervalId);
  
  setTimeout(() => {
    addToRetryQueue(productDetails, productPrice, productId);
  }, 60000);
}

function addToRetryQueue(productDetails, productPrice, productId) {
  const existingIndex = retryQueue.findIndex(item => item.productId === productId);
  if (existingIndex !== -1) {
    console.log('🔵 Background: Product already in retry queue:', productDetails.name);
    return;
  }
  
  retryQueue.push({
    productDetails,
    productPrice,
    productId
  });
  
  console.log('🔵 Background: Added to retry queue:', productDetails.name, 'Queue length:', retryQueue.length);
  
  if (!isRetryInProgress) {
    processRetryQueue();
  }
}

function processRetryQueue() {
  if (retryQueue.length === 0) {
    isRetryInProgress = false;
    console.log('🔵 Background: Retry queue empty, stopping processing');
    return;
  }
  
  if (isRetryInProgress) {
    console.log('🔵 Background: Retry already in progress, skipping');
    return;
  }
  
  isRetryInProgress = true;
  const nextProduct = retryQueue.shift();
  
  console.log('🔵 Background: Processing retry for product:', nextProduct.productDetails.name);
  retryAddToCart(nextProduct.productDetails, nextProduct.productPrice, nextProduct.productId);
}

function stopRetryProcess(productId) {
  const intervalId = retryIntervals.get(productId);
  if (intervalId) {
    clearInterval(intervalId);
    retryIntervals.delete(productId);
    console.log('🔵 Background: Stopped retry process for product:', productId);
  }
  
  retryQueue = retryQueue.filter(item => item.productId !== productId);
}

async function retryAddToCart(productDetails, productPrice, productId) {
  console.log('🔵 Background: Retrying add to cart for product:', productDetails.name);
  
  try {
    chrome.wootz.createBackgroundWebContents(retryWebContentsId, productDetails.url, (result) => {
      if (result.success) {
        console.log('🔵 Background: Retry WebContents created successfully for product:', productDetails.name);
        
        // Add retry logic with exponential backoff for retry click
        let retryCount = 0;
        const maxRetries = 10;
        
        const attemptRetryClick = () => {
        setTimeout(() => {
            console.log('🔵 Background: Attempting to click add to cart in retry (attempt ' + (retryCount + 1) + ')');
            
            // First check if content script is ready
            chrome.tabs.sendMessage(retryWebContentsId, {type: 'PING'}, function(pingResponse) {
              if (chrome.runtime.lastError) {
                console.log('🔵 Background: Content script not ready for retry click, retrying...');
                retryCount++;
                if (retryCount < maxRetries) {
                  attemptRetryClick();
                } else {
                  console.error('🔵 Background: Content script never became ready for retry click');
                  destroyRetryWebContents();
                  processNextInQueue();
                }
                return;
              }
              
              // Content script is ready, proceed with click
          chrome.tabs.sendMessage(retryWebContentsId, {
            type: 'CLICK_ADD_TO_CART'
          }, function(clickResponse) {
            if (chrome.runtime.lastError) {
              console.error('🔵 Background: Error clicking add to cart in retry:', chrome.runtime.lastError);
              destroyRetryWebContents();
              processNextInQueue();
              return;
            }
            
            console.log('🔵 Background: Retry click response:', clickResponse);
            if (clickResponse && clickResponse.success) {
              console.log('🔵 Background: Retry click successful, checking cart...');
              
                  // Check cart with retry logic
              setTimeout(() => {
                    let cartRetryCount = 0;
                    const maxCartRetries = 3;
                    
                    const attemptCartCheck = () => {
                      chrome.wootz.createBackgroundWebContents(cartWebContentsId, `https://m.popmart.com/${countryCode.toLowerCase()}/largeShoppingCart`, (cartResult) => {
                  if (cartResult.success) {
                    console.log('🔵 Background: Retry cart WebContents created successfully');
                          
                    setTimeout(() => {
                            console.log('🔵 Background: Attempting to check cart in retry (attempt ' + (cartRetryCount + 1) + ')');
                            
                            // First check if cart content script is ready
                            chrome.tabs.sendMessage(cartWebContentsId, {type: 'PING'}, function(pingResponse) {
                              if (chrome.runtime.lastError) {
                                console.log('🔵 Background: Cart content script not ready for retry, retrying...');
                                cartRetryCount++;
                                if (cartRetryCount < maxCartRetries) {
                                  attemptCartCheck();
                                } else {
                                  console.error('🔵 Background: Cart content script never became ready for retry');
                                  destroyRetryWebContents();
                                  processNextInQueue();
                                }
                                return;
                              }
                              
                              // Cart content script is ready, proceed with check
                              chrome.tabs.sendMessage(cartWebContentsId, {
                        type: 'CHECK_PRODUCT_IN_CART',
                        productName: productDetails.name
                      }, function(cartResponse) {
                        if (chrome.runtime.lastError) {
                          console.error('🔵 Background: Error checking cart in retry:', chrome.runtime.lastError);
                          destroyRetryWebContents();
                          processNextInQueue();
                          return;
                        }
                        
                        console.log('🔵 Background: Retry cart check response:', cartResponse);
                        if (cartResponse && cartResponse.inCart) {
                          console.log('🔵 Background: Product successfully added to cart in retry!');
                          
                          moveFromWaitlistToCart(productDetails, productPrice);
                          
                          stopRetryProcess(productId);
                          
                          chrome.runtime.sendMessage({
                            type: 'RETRY_SUCCESS',
                            productName: productDetails.name
                          });
                        } else {
                          console.log('🔵 Background: Product still not in cart, will retry again');
                        }
                        
                        destroyRetryWebContents();
                        processNextInQueue();
                              });
                      });
                    }, 3000);
                  } else {
                    console.log('🔵 Background: Failed to create retry cart WebContents');
                    destroyRetryWebContents();
                    processNextInQueue();
                  }
                });
                    };
                    
                    attemptCartCheck();
              }, 2000);
            } else {
              console.log('🔵 Background: Retry click failed');
              destroyRetryWebContents();
              processNextInQueue();
            }
          });
            });
          }, 5000 + (retryCount * 1000)); // Exponential backoff: 5s, 6s, 7s
        };
        
        attemptRetryClick();
      } else {
        console.log('🔵 Background: Failed to create retry WebContents');
        processNextInQueue();
      }
    });
  } catch (error) {
    console.error('🔵 Background: Error in retry add to cart:', error);
    processNextInQueue();
  }
}

function processNextInQueue() {
  isRetryInProgress = false;
  console.log('🔵 Background: Current retry completed, processing next in queue');
  
  setTimeout(() => {
    processRetryQueue();
  }, 2000);
}

function moveFromWaitlistToCart(productDetails, productPrice) {
  chrome.storage.local.get(['waitlistProducts', 'cartProducts'], (result) => {
    const waitlistProducts = result.waitlistProducts || [];
    const cartProducts = result.cartProducts || [];
    
    const updatedWaitlist = waitlistProducts.filter(p => p.url !== productDetails.url);
    
    const cartProduct = {
      id: Date.now().toString(),
      name: productDetails.name,
      image: productDetails.image,
      price: productPrice,
      url: productDetails.url,
      addedAt: new Date().toISOString()
    };
    
    const updatedCart = [...cartProducts, cartProduct];
    
    chrome.storage.local.set({ 
      waitlistProducts: updatedWaitlist,
      cartProducts: updatedCart 
    }, () => {
      console.log('🔵 Background: Product moved from waitlist to cart:', productDetails.name);
    });
  });
}

function destroyRetryWebContents() {
  chrome.wootz.destroyBackgroundWebContents(retryWebContentsId, (result) => {
    if (result.success) {
      console.log('🔵 Background: Retry WebContents destroyed');
    }
  });
}

function destroySearchWebContents() {
  chrome.wootz.destroyBackgroundWebContents(searchWebContentsId, (result) => {
    if (result.success) {
      console.log('🔵 Background: Search WebContents destroyed');
    }
  });
}

function destroyProductWebContents() {
  chrome.wootz.destroyBackgroundWebContents(productWebContentsId, (result) => {
    if (result.success) {
      console.log('🔵 Background: Product WebContents destroyed');
    }
  });
}

function destroyCartWebContents() {
  chrome.wootz.destroyBackgroundWebContents(cartWebContentsId, (result) => {
    if (result.success) {
      console.log('🔵 Background: Cart WebContents destroyed');
    }
  });
}
