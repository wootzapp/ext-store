console.log('🎯 Interceptor script injected');

// Store the original fetch function
const originalFetch = window.fetch;

// Create an interceptor function
window.fetch = async function (url, options) {
    // Only intercept auth requests
    if (url.includes('auth.privy.io/api/v1/passwordless/authenticate')) {
        console.log('🔒 Intercepted auth API call:', {
            url,
            method: options?.method
        });

        try {
            // Call the original fetch function
            const response = await originalFetch(url, options);
            
            // Clone the response so we can read it without consuming it
            const clonedResponse = response.clone();
            
            try {
                const responseBody = await clonedResponse.json();
                console.log('📥 Auth response received:', {
                    status: response.status,
                    hasToken: !!responseBody.token,
                    hasPrivyToken: !!responseBody.privy_access_token,
                    hasRefreshToken: !!responseBody.refresh_token
                });

                // If we have auth tokens, send them to content script
                if (responseBody?.token || responseBody?.privy_access_token || responseBody?.refresh_token) {
                    console.log('🔑 Auth tokens found, sending to content script');
                    
                    window.postMessage({
                        type: 'AUTH_COMPLETE',
                        token: responseBody.token,
                        privyAccessToken: responseBody.privy_access_token,
                        refreshToken: responseBody.refresh_token,
                        user: responseBody.user
                    }, '*');

                    // Store in window for cookie check fallback
                    window.authData = {
                        token: responseBody.token,
                        privyAccessToken: responseBody.privy_access_token,
                        refreshToken: responseBody.refresh_token,
                        user: responseBody.user
                    };
                }
            } catch (error) {
                console.error('❌ Failed to parse auth response:', error);
            }

            return response;
        } catch (error) {
            console.error('❌ Auth request failed:', error);
            throw error;
        }
    }

    // For non-auth requests, just pass through
    return originalFetch(url, options);
};

// Initialize requestData in window scope
window.authData = {
    token: null,
    headers: null,
    cookies: null
};

// Function to send data to content script
function sendToContentScript(data, type = 'AUTH_DATA') {
    console.log(`📤 Sending ${type} to content script:`, {
        dataType: type,
        hasToken: !!data.token,
        hasPrivyAccessToken: !!data.privyAccessToken,
        hasRefreshToken: !!data.refreshToken,
        hasResponse: !!data.response,
        hasHeaders: !!data.headers
    });
    
    window.dispatchEvent(new CustomEvent('authDataCaptured', {
        detail: {
            type: type,
            data: data
        }
    }));
}

// Function to parse and validate auth response
function parseAuthResponse(responseText) {
    try {
        const responseData = JSON.parse(responseText);
        console.log('🔍 Parsing auth response:', {
            hasToken: !!responseData.token,
            hasPrivyAccessToken: !!responseData.privy_access_token,
            hasRefreshToken: !!responseData.refresh_token,
            hasUser: !!responseData.user
        });
        return responseData;
    } catch (e) {
        console.error('❌ Error parsing auth response:', e);
        console.log('📝 Raw response:', responseText);
        return null;
    }
}

// Listen for verification requests
window.addEventListener('message', (event) => {
    if (event.data?.type === 'CHECK_INTERCEPTOR') {
        console.log('✅ Interceptor verification requested');
        window.postMessage({ type: 'INTERCEPTOR_READY' }, '*');
    }
});

// Also capture XHR requests
const originalXHR = window.XMLHttpRequest;
window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    let requestUrl = '';

    xhr.open = function() {
        requestUrl = arguments[1];
        return originalOpen.apply(this, arguments);
    };

    xhr.addEventListener('load', function() {
        if (requestUrl.includes('auth.privy.io/api/v1/passwordless/authenticate')) {
            try {
                const responseData = JSON.parse(xhr.responseText);
                console.log('📥 Auth XHR response:', {
                    status: xhr.status,
                    hasToken: !!responseData.token,
                    hasPrivyToken: !!responseData.privy_access_token,
                    hasRefreshToken: !!responseData.refresh_token
                });

                if (responseData?.token || responseData?.privy_access_token || responseData?.refresh_token) {
                    console.log('🔑 Auth tokens found from XHR, sending to content script');
                    
                    window.postMessage({
                        type: 'AUTH_COMPLETE',
                        token: responseData.token,
                        privyAccessToken: responseData.privy_access_token,
                        refreshToken: responseData.refresh_token,
                        user: responseData.user
                    }, '*');

                    // Store in window for cookie check fallback
                    window.authData = {
                        token: responseData.token,
                        privyAccessToken: responseData.privy_access_token,
                        refreshToken: responseData.refresh_token,
                        user: responseData.user
                    };
                }
            } catch (error) {
                console.error('❌ Failed to parse XHR response:', error);
            }
        }
    });

    return xhr;
};

// Listen for cookie check requests
window.addEventListener('message', function(event) {
    if (event.source !== window) return;
    
    if (event.data?.type === 'CHECK_COOKIES') {
        console.log('🍪 Checking for stored auth data');
        
        // Check if we have stored auth data
        if (window.authData?.token || window.authData?.privyAccessToken) {
            console.log('✅ Found stored auth data, sending to content script');
            window.postMessage({
                type: 'AUTH_COMPLETE',
                ...window.authData
            }, '*');
        } else {
            console.log('⚠️ No stored auth data found');
        }
    }
});

console.log('✅ Auth interceptor setup complete');

// Notify that interceptor is ready
window.postMessage({ type: 'INTERCEPTOR_READY' }, '*');