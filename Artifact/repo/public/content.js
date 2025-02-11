/*global chrome*/
console.log('🌟 Content script loaded on:', window.location.href);

// Function to inject the interceptor script
function injectInterceptor() {
    try {
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL('tokeninterceptor.js');
        
        script.onload = () => {
            console.log('✅ Interceptor script loaded successfully');
            script.remove();
        };
        
        script.onerror = (error) => {
            console.error('❌ Failed to load interceptor script:', error);
        };
        
        (document.head || document.documentElement).appendChild(script);
    } catch (error) {
        console.error('❌ Error injecting interceptor:', error);
    }
}

// Function to save auth data
async function saveAuthData(tokenData) {
    return new Promise((resolve, reject) => {
        const storageData = {
            authToken: tokenData.idToken,
            refreshToken: tokenData.refreshToken,
            timestamp: Date.now()
        };

        console.log('Interceptor data', {storageData});

        try {
            localStorage.setItem('authToken', storageData.authToken);
            localStorage.setItem('refreshToken', storageData.refreshToken);
            chrome.storage.local.set({
                authToken: storageData.authToken,
                refreshToken: storageData.refreshToken,
                isLoggedIn: true
            });



            
            console.log('✅ Auth data saved successfully');
            resolve();

        } catch (error) {
            console.error('❌ Error saving auth data:', error);
            reject(error);
        }

    });
}

// Function to navigate to extension dashboard
function navigateToExtensionDashboard() {
    const extensionId = chrome.runtime.id;
    console.log('🚀 Redirecting to landing page');
    window.location.href = `chrome-extension://${extensionId}/index.html#/relicdao/dashboard`;
}

// Listen for auth tokens from the interceptor
document.addEventListener('firebaseAuthTokens', async function(event) {
    const tokenData = event.detail;
    console.log('📨 Received auth tokens');
    
    try {
        await saveAuthData(tokenData);
        
        // Send message to the React app
        window.postMessage({
            type: 'AUTH_TOKENS_READY',
            walletToken: tokenData.idToken
        }, '*');
        

        await chrome.storage.local.set({
            refreshToken: tokenData.refreshToken,
            authToken: tokenData.idToken,
            isLoggedIn: true
          });

          // Send refresh token to background script
          chrome.runtime.sendMessage({ 
            type: 'REFRESH_TOKEN_UPDATE',
            refreshToken: tokenData.refreshToken
          });

        // Navigate to dashboard using extension URL
        navigateToExtensionDashboard();
    } catch (error) {
        console.error('❌ Error handling auth data:', error);
    }
});

// Inject the interceptor if we're on Relic DAO
if (window.location.href.includes('join.relicdao.com')) {
    console.log('🔍 On Relic DAO website, injecting interceptor');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectInterceptor);
    } else {
        injectInterceptor();
    }
}
