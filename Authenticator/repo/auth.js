console.log('Auth page loaded');

const authFrame = document.getElementById('authFrame');
const statusDiv = document.getElementById('status');
const fallbackDiv = document.getElementById('fallback');
const openDirectLink = document.getElementById('openDirect');
const customLoginForm = document.getElementById('customLoginForm');
const iframeContainer = document.getElementById('iframeContainer');
const loginForm = document.getElementById('loginForm');
const togglePassword = document.getElementById('togglePassword');
const fallbackLink = document.getElementById('fallbackLink');

const OKTA_URL = 'https://trial-7599136.okta.com/home/trial-7599136_testapp_1/0oasskc7oca3vLm1W697/alnsskld6bWGGNwua697';

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
  showCustomLoginForm();
  setupEventListeners();
});

function setupEventListeners() {
  // Handle custom login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleCustomLogin);
  }
  
  // Handle password toggle
  if (togglePassword) {
    togglePassword.addEventListener('click', function() {
      const passwordInput = document.getElementById('password');
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      
      // Update icon
      togglePassword.innerHTML = isPassword ? 
        '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
        '<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
    });
  }
  
  // Handle fallback link
  if (fallbackLink) {
    fallbackLink.addEventListener('click', function(e) {
      e.preventDefault();
      showIframeLogin();
    });
  }
  
  // Handle direct link fallback
  if (openDirectLink) {
    openDirectLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Opening Okta URL directly');
      window.open(OKTA_URL, '_blank');
    });
  }
}

function updateStatus(message, type = 'loading') {
  const statusDiv = document.getElementById('status');
  
  // Remove existing status classes
  statusDiv.className = '';
  
  // Set appropriate styling and content based on type
  let icon = '';
  let className = 'status-loading';
  
  if (type === 'success') {
    className = 'status-success';
    icon = '✅ ';
  } else if (type === 'error') {
    className = 'status-error';
    icon = '❌ ';
  } else if (type === 'loading') {
    className = 'status-loading';
    icon = '<span class="loading-spinner"></span>';
  } else if (type === 'info') {
    className = 'status-loading';
    icon = 'ℹ️ ';
  }
  
  statusDiv.className = className;
  statusDiv.innerHTML = icon + message;
  
  console.log('Auth Status:', message);
  
  // Also send to popup
  chrome.runtime.sendMessage({
    action: 'authProgress',
    message: message
  });
}

function showCustomLoginForm() {
  console.log('Showing custom login form');
  updateStatus('Ready to authenticate', 'info');
  
  if (customLoginForm) {
    customLoginForm.style.display = 'block';
  }
  if (iframeContainer) {
    iframeContainer.style.display = 'none';
  }
}

function showIframeLogin() {
  console.log('Switching to iframe login');
  updateStatus('Loading Okta authentication page...', 'loading');
  
  if (customLoginForm) {
    customLoginForm.style.display = 'none';
  }
  if (iframeContainer) {
    iframeContainer.style.display = 'block';
  }
  
  // Load Okta URL in iframe
  console.log('Loading Okta URL:', OKTA_URL);
  authFrame.src = OKTA_URL;
  
  // Set up iframe event listeners
  setupIframeListeners();
}

function showError(message) {
  const errorDiv = document.querySelector('.error-message') || createErrorDiv();
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  // Hide after 5 seconds
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);
}

function showSuccess(message) {
  const successDiv = document.querySelector('.success-message') || createSuccessDiv();
  successDiv.textContent = message;
  successDiv.style.display = 'block';
}

function createErrorDiv() {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  const loginForm = document.querySelector('.login-form');
  loginForm.insertBefore(errorDiv, loginForm.firstChild);
  return errorDiv;
}

function createSuccessDiv() {
  const successDiv = document.createElement('div');
  successDiv.className = 'success-message';
  const loginForm = document.querySelector('.login-form');
  loginForm.insertBefore(successDiv, loginForm.firstChild);
  return successDiv;
}

function setButtonLoading(loading) {
  const button = document.getElementById('loginButton');
  const buttonText = button.querySelector('.button-text');
  const buttonLoader = button.querySelector('.button-loader');
  
  if (loading) {
    button.disabled = true;
    buttonText.style.opacity = '0';
    buttonLoader.style.display = 'flex';
  } else {
    button.disabled = false;
    buttonText.style.opacity = '1';
    buttonLoader.style.display = 'none';
  }
}

async function handleCustomLogin(e) {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  
  if (!username || !password) {
    showError('Please enter both username and password');
    return;
  }
  
  setButtonLoading(true);
  updateStatus('Authenticating...', 'loading');
  
  try {
    // Since we can't directly authenticate with Okta from a browser extension
    // due to CORS and security restrictions, we'll simulate the process
    // and then fall back to the iframe method
    
    console.log('Attempting custom authentication...');
    
    // Simulate authentication delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, we'll show a message and then redirect to iframe
    updateStatus('Custom authentication not available, redirecting to secure login...', 'loading');
    
    setTimeout(() => {
      showIframeLogin();
    }, 1500);
    
  } catch (error) {
    console.error('Authentication error:', error);
    showError('Authentication failed. Please try again.');
    updateStatus('Authentication failed', 'error');
  } finally {
    setButtonLoading(false);
  }
}

function setupIframeListeners() {
  // Handle iframe load events
  authFrame.addEventListener('load', function() {
    console.log('Iframe loaded');
    
    try {
      const iframeUrl = authFrame.contentWindow.location.href;
      console.log('Iframe URL:', iframeUrl);
      updateStatus('Please enter your credentials to continue', 'info');
    } catch (error) {
      console.log('Cannot access iframe URL (cross-origin):', error.message);
      updateStatus('Please enter your credentials to continue', 'info');
    }
    
    // Monitor for SAML responses
    monitorForSamlResponse();
  });

  // Handle iframe errors
  authFrame.addEventListener('error', function(error) {
    console.error('Iframe error:', error);
    updateStatus('Error loading authentication page', 'error');
    fallbackDiv.style.display = 'block';
  });

  // Timeout fallback
  setTimeout(function() {
    if (authFrame.src === 'about:blank' || !authFrame.contentDocument) {
      console.log('Iframe failed to load, showing fallback');
      fallbackDiv.style.display = 'block';
    }
  }, 5000);
}

// Direct link fallback
openDirectLink.addEventListener('click', function(e) {
  e.preventDefault();
  console.log('Opening Okta URL directly');
  window.open(OKTA_URL, '_blank');
});

function monitorForSamlResponse() {
  console.log('Starting SAML monitoring');
  
  // Method 1: Monitor URL changes
  let lastUrl = '';
  const urlMonitor = setInterval(function() {
    try {
      const currentUrl = authFrame.contentWindow.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        console.log('URL changed:', currentUrl);
        
        if (currentUrl.includes('SAMLResponse')) {
          console.log('SAML response detected in URL');
          clearInterval(urlMonitor);
          extractSamlFromUrl(currentUrl);
        }
      }
    } catch (error) {
      // Expected cross-origin error
    }
  }, 1000);
  
  // Method 2: Listen for postMessage
  window.addEventListener('message', function(event) {
    console.log('Received message:', event.data);
    
    if (event.data && event.data.type === 'samlResponse') {
      console.log('SAML response received via postMessage');
      clearInterval(urlMonitor);
      processSamlResponse(event.data.response);
    }
  });
  
  // Method 3: Check for navigation to success page
  const navMonitor = setInterval(function() {
    try {
      const currentUrl = authFrame.contentWindow.location.href;
      if (currentUrl.includes('success') || currentUrl.includes('dashboard') || currentUrl.includes('app')) {
        console.log('Possible successful authentication detected');
        updateStatus('Authentication may have succeeded - verifying...', 'loading');
      }
    } catch (error) {
      // Expected cross-origin error
    }
  }, 2000);
}

function extractSamlFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const samlResponse = urlObj.searchParams.get('SAMLResponse');
    
    if (samlResponse) {
      console.log('SAML response found in URL parameters');
      processSamlResponse(samlResponse);
    } else {
      console.log('No SAML response in URL parameters');
      updateStatus('Authentication completed but no SAML response found', 'error');
    }
  } catch (error) {
    console.error('Error extracting SAML from URL:', error);
  }
}

function processSamlResponse(samlResponse) {
  console.log('Processing SAML response...');
  console.log('SAML Response length:', samlResponse.length);
  console.log('SAML Response preview:', samlResponse.substring(0, 100) + '...');
  
  updateStatus('SAML response captured, processing...', 'loading');
  
  try {
    // Try to decode base64 SAML response
    const decodedSaml = atob(samlResponse);
    console.log('Successfully decoded SAML response');
    console.log('Decoded length:', decodedSaml.length);
    console.log('Decoded preview:', decodedSaml.substring(0, 200) + '...');
    
    // Send to background script
    chrome.runtime.sendMessage({
      action: 'samlCaptured',
      xmlResponse: decodedSaml
    });
    
  } catch (error) {
    console.log('Could not decode as base64, sending raw response:', error);
    
    // Send raw response if decoding fails
    chrome.runtime.sendMessage({
      action: 'samlCaptured',
      xmlResponse: samlResponse
    });
  }
}

// Listen for auth result
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Auth page received message:', message);
  
  if (message.action === 'authResult') {
    if (message.success) {
      updateStatus('Authentication successful! Redirecting...', 'success');
      
      setTimeout(function() {
        window.close();
      }, 3000);
    } else {
      updateStatus('Authentication failed: ' + (message.error || 'Unknown error'), 'error');
    }
  }
});

console.log('Auth script setup complete');