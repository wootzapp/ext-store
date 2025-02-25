(function() {
    console.log('🗑️ Delete Tweet Interceptor script injected');
    
    let xhrRequestComplete = false;
    
    // Initialize requestData in window scope
    window.deleteTweetRequestData = {
        headers: null,
        url: null,
        method: null,
        params: null,
        tweetId: null,
        responseData: null
    };

    // Enhanced logging function
    function enhancedLog(message, data = null) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] 🗑️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }

    // Function to send data to content script
    function sendToContentScript(data, type = 'DELETE_TWEET_DATA') {
        try {
            enhancedLog(`📤 Sending delete tweet ${type} to content script:`, data);
            window.dispatchEvent(new CustomEvent('deleteTweetDataCaptured', {
                detail: {
                    type: type,
                    data: data
                }
            }));
        } catch (error) {
            console.error('Error sending delete tweet data to content script:', error);
        }
    }

    // Helper function to identify delete tweet URLs
    function isDeleteTweetUrl(url) {
        return url && (
            url.includes('DeleteTweet')
        );
    }

    // Extract tweet ID from request body
    function extractTweetId(body) {
        try {
            if (typeof body === 'string') {
                const parsedBody = JSON.parse(body);
                return parsedBody.variables?.tweet_id;
            }
            return body?.variables?.tweet_id;
        } catch (error) {
            console.error('Error extracting tweet ID:', error);
            return null;
        }
    }

    // Capture XHR requests
    const originalXHR = window.XMLHttpRequest;
    enhancedLog('📌 Original XMLHttpRequest:', !!originalXHR);
    
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSetRequestHeader = xhr.setRequestHeader;
        const originalSend = xhr.send;
        let currentUrl = '';
        let allHeaders = {};

        xhr.open = function() {
            const method = arguments[0];
            const url = arguments[1];
            currentUrl = url;
            
            if (isDeleteTweetUrl(url)) {
                enhancedLog('🎯 XHR Captured Delete Tweet URL:', {url, method});
                window.deleteTweetRequestData.url = url;
                window.deleteTweetRequestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (isDeleteTweetUrl(currentUrl)) {
                allHeaders[header] = value;
                window.deleteTweetRequestData.headers = allHeaders;
                enhancedLog('🏷️ Setting delete tweet header:', {header, value});
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (isDeleteTweetUrl(currentUrl)) {
                xhrRequestComplete = true;
                try {
                    const responseData = JSON.parse(xhr.responseText);
                    window.deleteTweetRequestData.responseData = responseData;
                    
                    enhancedLog('✅ Delete Tweet XHR complete, response:', responseData);
                    sendToContentScript({
                        ...window.deleteTweetRequestData,
                        status: xhr.status,
                        statusText: xhr.statusText
                    }, 'DELETE_TWEET_COMPLETE');
                } catch (error) {
                    console.error('Error parsing delete tweet response:', error);
                    sendToContentScript(window.deleteTweetRequestData, 'DELETE_TWEET_ERROR');
                }
            }
        });

        xhr.addEventListener('error', function() {
            if (isDeleteTweetUrl(currentUrl)) {
                console.error('Delete Tweet XHR failed:', xhr.status, xhr.statusText);
                sendToContentScript({
                    ...window.deleteTweetRequestData,
                    error: 'XHR request failed',
                    status: xhr.status,
                    statusText: xhr.statusText
                }, 'DELETE_TWEET_ERROR');
            }
        });

        xhr.send = function(body) {
            if (isDeleteTweetUrl(currentUrl)) {
                try {
                    const tweetId = extractTweetId(body);
                    window.deleteTweetRequestData.body = body;
                    window.deleteTweetRequestData.tweetId = tweetId;
                    
                    enhancedLog('📦 Sending Delete Tweet XHR:', {
                        tweetId,
                        requestData: window.deleteTweetRequestData
                    });
                } catch (e) {
                    console.error('Error with delete tweet request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    enhancedLog('✅ Delete Tweet interceptor ready - waiting for requests');
})();