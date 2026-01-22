(function() {
    console.log('🎯 Unlike Tweet Interceptor script injected');
    
    let xhrRequestComplete = false;
    
    // Initialize requestData in window scope
    window.unlikeTweetRequestData = {
        headers: null,
        url: null,
        params: null,
        tweetId: null
    };

    // Function to send data to content script
    function sendToContentScript(data, type = 'UNLIKE_TWEET_REQUEST_DATA') {
        console.log(`📤 Sending ${type} to content script:`, data);
        window.dispatchEvent(new CustomEvent('unlikeTweetRequestDataCaptured', {
            detail: {
                type: type,
                data: data
            }
        }));
    }

    // Helper function to identify unlike tweet requests
    function isUnlikeTweetRequest(url) {
        return url && (
            url.includes('UnfavoriteTweet') ||
            url.includes('unfavorite') ||
            url.includes('unlike')
        );
    }

    // Capture XHR requests
    const originalXHR = window.XMLHttpRequest;
    console.log('📌 Original XMLHttpRequest:', !!originalXHR);
    
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const originalOpen = xhr.open;
        const originalSetRequestHeader = xhr.setRequestHeader;
        const originalSend = xhr.send;
        let currentUrl = '';
        let allHeaders = {};
        let requestBody = null;

        xhr.open = function() {
            const method = arguments[0];
            const url = arguments[1];
            currentUrl = url;
            
            if (isUnlikeTweetRequest(url)) {
                console.log('🎯 XHR Captured Unlike Tweet URL:', url);
                window.unlikeTweetRequestData.url = url;
                window.unlikeTweetRequestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (isUnlikeTweetRequest(currentUrl)) {
                allHeaders[header] = value;
                window.unlikeTweetRequestData.headers = allHeaders;
                console.log('🏷️ Setting unlike tweet header:', header, value);
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.send = function(body) {
            if (isUnlikeTweetRequest(currentUrl)) {
                try {
                    requestBody = body;
                    if (body) {
                        const parsedBody = JSON.parse(body);
                        window.unlikeTweetRequestData.tweetId = parsedBody.variables?.tweet_id;
                    }
                    window.unlikeTweetRequestData.body = body;
                    console.log('📦 Sending Unlike Tweet XHR with data:', window.unlikeTweetRequestData);
                } catch (e) {
                    console.error('Error parsing request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (isUnlikeTweetRequest(currentUrl)) {
                xhrRequestComplete = true;
                try {
                    const responseData = JSON.parse(xhr.responseText);
                    console.log('✅ Unlike Tweet XHR request complete, sending final data');
                    
                    sendToContentScript({
                        ...window.unlikeTweetRequestData,
                        responseData,
                        timestamp: new Date().toISOString()
                    }, 'UNLIKE_TWEET_XHR_COMPLETE');
                } catch (error) {
                    console.error('Error parsing response:', error);
                    sendToContentScript(window.unlikeTweetRequestData, 'UNLIKE_TWEET_XHR_COMPLETE');
                }
            }
        });

        return xhr;
    };

    // Add fetch interceptor as well for completeness
    const originalFetch = window.fetch;
    window.fetch = async function(input, init) {
        const url = typeof input === 'string' ? input : input.url;
        
        if (isUnlikeTweetRequest(url)) {
            console.log('🎯 Fetch Captured Unlike Tweet URL:', url);
            
            try {
                const headers = init?.headers || {};
                const body = init?.body;
                let tweetId = null;

                if (body) {
                    try {
                        const parsedBody = JSON.parse(body);
                        tweetId = parsedBody.variables?.tweet_id;
                    } catch (e) {
                        console.error('Error parsing fetch body:', e);
                    }
                }

                const requestData = {
                    url,
                    method: init?.method || 'GET',
                    headers,
                    body,
                    tweetId,
                    timestamp: new Date().toISOString()
                };

                sendToContentScript(requestData, 'UNLIKE_TWEET_FETCH_COMPLETE');
            } catch (error) {
                console.error('Error in fetch interceptor:', error);
            }
        }

        return originalFetch.apply(this, arguments);
    };

    console.log('✅ Unlike Tweet interceptor ready - waiting for requests');
})(); 