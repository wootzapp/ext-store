/*global chrome*/
console.log('🌟 Background script loaded');

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('📩 Received message in background:', message);
    
    if (message.type === 'SET_AUTH_COOKIES' && message.data) {
        const { token, privyAccessToken, refreshToken } = message.data;
        
        // Set auth cookies with more permissive settings
        const cookiePromises = [
            // Set token cookie
            chrome.cookies.set({
                url: 'https://app.sapien.io',
                name: 'auth_token',
                value: token,
                secure: true,
                sameSite: 'lax',
                domain: '.sapien.io',
                path: '/'
            }),
            // Set Privy access token cookie
            chrome.cookies.set({
                url: 'https://app.sapien.io',
                name: 'privy_access_token',
                value: privyAccessToken,
                secure: true,
                sameSite: 'lax',
                domain: '.sapien.io',
                path: '/'
            }),
            // Set refresh token cookie
            chrome.cookies.set({
                url: 'https://app.sapien.io',
                name: 'refresh_token',
                value: refreshToken,
                secure: true,
                sameSite: 'lax',
                domain: '.sapien.io',
                path: '/'
            })
        ];
        
        Promise.all(cookiePromises)
            .then(() => {
                console.log('🍪 Auth cookies set successfully');
                // Verify cookies were set
                chrome.cookies.getAll({ domain: 'sapien.io' }, (cookies) => {
                    console.log('🔍 Verifying cookies:', cookies);
                });
                sendResponse({ success: true });
            })
            .catch(error => {
                console.error('Error setting cookies:', error);
                sendResponse({ success: false, error: error.message });
            });
            
        return true; // Keep the message channel open for async response
    }
});

// Listen for web requests to the auth endpoint
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.method === 'POST') {
            console.log('🔒 Intercepted auth request:', details);
        }
    },
    { urls: ['https://auth.privy.io/api/v1/passwordless/authenticate'] },
    ['requestBody']
);

// Add a listener for cookie changes
chrome.cookies.onChanged.addListener((changeInfo) => {
    console.log('🍪 Cookie changed:', changeInfo);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'FETCH_IMAGE') {
        fetch(request.url)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => sendResponse({ data: reader.result });
                reader.readAsDataURL(blob);
            })
            .catch(error => {
                console.error('Error fetching image:', error);
                sendResponse({ error: error.message });
            });
        return true; // Will respond asynchronously
    }
}); 