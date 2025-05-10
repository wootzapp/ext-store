(function() {
    console.log('🔄 Remove Retweet Interceptor script injected');
    
    let xhrRequestComplete = false;
    
    // Initialize requestData in window scope
    window.removeRetweetRequestData = {
        headers: null,
        url: null,
        params: null,
        tweetId: null
    };

    // Function to send data to content script
    function sendToContentScript(data, type = 'REMOVE_RETWEET_REQUEST_DATA') {
        console.log(`📤 Sending ${type} to content script:`, data);
        window.dispatchEvent(new CustomEvent('removeRetweetRequestDataCaptured', {
            detail: {
                type: type,
                data: data
            }
        }));
    }

    // Helper function to identify remove retweet requests
    function isRemoveRetweetRequest(url) {
        return url && (
            url.includes('DeleteRetweet') ||
            url.includes('unretweet')
        );
    }

    // Extract tweet ID from request body
    function extractTweetId(body) {
        try {
            if (typeof body === 'string') {
                const parsedBody = JSON.parse(body);
                return parsedBody.variables?.source_tweet_id;
            }
            return body?.variables?.source_tweet_id;
        } catch (error) {
            console.error('Error extracting tweet ID:', error);
            return null;
        }
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

        xhr.open = function() {
            const method = arguments[0];
            const url = arguments[1];
            currentUrl = url;
            
            if (isRemoveRetweetRequest(url)) {
                console.log('🎯 XHR Captured Remove Retweet URL:', url);
                window.removeRetweetRequestData.url = url;
                window.removeRetweetRequestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (isRemoveRetweetRequest(currentUrl)) {
                allHeaders[header] = value;
                window.removeRetweetRequestData.headers = allHeaders;
                console.log('🏷️ Setting remove retweet header:', header);
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (isRemoveRetweetRequest(currentUrl)) {
                xhrRequestComplete = true;
                try {
                    const responseData = JSON.parse(xhr.responseText);
                    console.log('✅ Remove Retweet XHR complete, response:', responseData);
                    
                    // Extract relevant data from the response
                    const sourceTweet = responseData.data?.unretweet?.source_tweet_results?.result;
                    const processedResponse = sourceTweet ? {
                        tweetId: sourceTweet.rest_id,
                        text: sourceTweet.legacy?.full_text,
                        timestamp: new Date().toISOString()
                    } : null;

                    sendToContentScript({
                        ...window.removeRetweetRequestData,
                        responseData: processedResponse,
                        status: xhr.status,
                        statusText: xhr.statusText
                    }, 'REMOVE_RETWEET_COMPLETE');
                } catch (error) {
                    console.error('Error parsing remove retweet response:', error);
                    sendToContentScript(window.removeRetweetRequestData, 'REMOVE_RETWEET_ERROR');
                }
            }
        });

        xhr.addEventListener('error', function() {
            if (isRemoveRetweetRequest(currentUrl)) {
                console.error('Remove Retweet XHR failed:', xhr.status, xhr.statusText);
                sendToContentScript({
                    ...window.removeRetweetRequestData,
                    error: 'XHR request failed',
                    status: xhr.status,
                    statusText: xhr.statusText
                }, 'REMOVE_RETWEET_ERROR');
            }
        });

        xhr.send = function(body) {
            if (isRemoveRetweetRequest(currentUrl)) {
                try {
                    const tweetId = extractTweetId(body);
                    window.removeRetweetRequestData.body = body;
                    window.removeRetweetRequestData.tweetId = tweetId;
                    
                    console.log('📦 Sending Remove Retweet XHR:', {
                        tweetId,
                        requestData: window.removeRetweetRequestData
                    });
                } catch (e) {
                    console.error('Error with remove retweet request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    // Add fetch interceptor as well for completeness
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        const [url, config] = args;
        
        // Check if this is a remove retweet request
        if (url.includes('/api/graphql/') && config?.body?.includes('UnretweetMutation')) {
            try {
                // Get the response
                const response = await originalFetch.apply(this, args);
                const responseClone = response.clone();
                const data = await responseClone.json();

                // Extract tweet ID from the response
                const tweetId = data?.data?.unretweet?.tweet_results?.result?.rest_id;
                
                if (tweetId) {
                    // Dispatch custom event with tweet data
                    window.dispatchEvent(new CustomEvent('removeRetweetEvent', {
                        detail: {
                            tweetId: tweetId
                        }
                    }));
                }
                
                return response;
            } catch (error) {
                console.error('Error in remove retweet interceptor:', error);
                return originalFetch.apply(this, args);
            }
        }
        
        return originalFetch.apply(this, args);
    };

    console.log('✅ Remove Retweet interceptor ready - waiting for requests');
})(); 