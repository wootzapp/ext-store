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

// Function to create and update timer overlay
function createTimerOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'extension-timer-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85);
        color: white;
        padding: 20px 30px;
        border-radius: 12px;
        z-index: 999999;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(5px);
        min-width: 200px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        flex-direction: column;
        gap: 10px;
        animation: fadeIn 0.3s ease-out;
    `;

    // Create a container for the message
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 5px;
    `;

    // Add loading animation
    const loadingBar = document.createElement('div');
    loadingBar.style.cssText = `
        width: 100%;
        height: 4px;
        background: rgba(59, 130, 246, 0.2);
        border-radius: 2px;
        overflow: hidden;
        margin-top: 5px;
    `;

    const loadingProgress = document.createElement('div');
    loadingProgress.style.cssText = `
        width: 100%;
        height: 100%;
        background: #3b82f6;
        border-radius: 2px;
        transition: transform 1s linear;
        transform-origin: left;
    `;
    loadingBar.appendChild(loadingProgress);

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    overlay.appendChild(messageContainer);
    overlay.appendChild(loadingBar);
    document.body.appendChild(overlay);

    return {
        overlay,
        messageContainer,
        loadingProgress
    };
}

function updateTimer(secondsLeft, elements) {
    const { messageContainer, loadingProgress } = elements;
    messageContainer.textContent = 'Completing signup';
    
    // Update loading bar progress - Fixed to start from left
    const progressPercentage = ((18 - secondsLeft) / 18);
    loadingProgress.style.transform = `scaleX(${progressPercentage})`;
}

// Update the event listener for auth tokens
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

        // Create and start timer overlay
        const timerElements = createTimerOverlay();
        let secondsLeft = 18;
        
        const timerInterval = setInterval(() => {
            secondsLeft--;
            updateTimer(secondsLeft, timerElements);
            
            if (secondsLeft <= 0) {
                clearInterval(timerInterval);
                timerElements.overlay.remove();
                navigateToExtensionDashboard();
            }
        }, 1000);

        console.log('⏳ Waiting 18 seconds before redirecting...');
        setTimeout(() => {
            clearInterval(timerInterval);
            timerElements.overlay.remove();
            navigateToExtensionDashboard();
        }, 18000);
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
