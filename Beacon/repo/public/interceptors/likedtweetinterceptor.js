(function() {
    console.log('🎯 Timeline & Likes Interceptor script injected');
    
    let xhrRequestComplete = false;
    
    // Initialize requestData in window scope with support for both timeline and likes
    window.timelineRequestData = {
        headers: null,
        url: null,
        params: null
    };

    window.likedTweetsRequestData = {
        headers: null,
        url: null,
        params: null
    };

    // Function to send data to content script
    function sendToContentScript(data, type = 'TIMELINE_REQUEST_DATA') {
        console.log(`📤 Sending ${type} to content script:`, data);
        window.dispatchEvent(new CustomEvent('timelinerequestdataCaptured', {
            detail: {
                type: type,
                data: data
            }
        }));
    }

    function sendLikedTweetsToContentScript(data, type = 'LIKED_TWEETS_REQUEST_DATA') {
        console.log(`📤 Sending liked tweets ${type} to content script:`, data);
        window.dispatchEvent(new CustomEvent('likedTweetsRequestDataCaptured', {
            detail: {
                type: type,
                data: data
            }
        }));
    }

    // Helper function to identify relevant URLs
    function isRelevantUrl(url) {
        return url && (
            url.includes('HomeTimeline') || 
            url.includes('/Likes') || 
            url.includes('/likes') ||
            url.includes('getLikes') ||
            url.includes('Favorites')
        );
    }

    // Helper function to determine request type
    function getRequestType(url) {
        if (url.includes('HomeTimeline')) return 'TWEET_XHR_COMPLETE';
        if (url.includes('/Likes') || url.includes('/likes') || 
            url.includes('getLikes') || url.includes('Favorites')) {
            return 'LIKES_XHR_COMPLETE';
        }
        return 'TIMELINE_REQUEST_DATA';
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
            
            if (isRelevantUrl(url)) {
                console.log('🎯 XHR Captured URL:', url);
                window.timelineRequestData.url = url;
                window.timelineRequestData.method = method;
            }

            if (url && url.includes('/Likes')) {
                console.log('🎯 XHR Captured Likes URL:', url);
                window.likedTweetsRequestData.url = url;
                window.likedTweetsRequestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (isRelevantUrl(currentUrl)) {
                allHeaders[header] = value;
                window.timelineRequestData.headers = allHeaders;
                console.log('🏷️ Setting header:', header, value);
            }

            if (currentUrl && currentUrl.includes('/Likes')) {
                allHeaders[header] = value;
                window.likedTweetsRequestData.headers = allHeaders;
                console.log('🏷️ Setting liked tweets header:', header, value);
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (isRelevantUrl(currentUrl)) {
                xhrRequestComplete = true;
                try {
                    const responseData = JSON.parse(xhr.responseText);
                    console.log('✅ XHR request complete, sending final data');
                    
                    const requestType = getRequestType(currentUrl);
                    sendToContentScript({
                        ...window.timelineRequestData,
                        responseData
                    }, requestType);
                } catch (error) {
                    console.error('Error parsing response:', error);
                    sendToContentScript(window.timelineRequestData, getRequestType(currentUrl));
                }
            }

            if (currentUrl && currentUrl.includes('/Likes')) {
                xhrRequestComplete = true;
                console.log('✅ Liked tweets XHR request complete, sending final data');
                sendLikedTweetsToContentScript(window.likedTweetsRequestData, 'LIKED_TWEETS_XHR_COMPLETE');
            }
        });

        xhr.send = function(body) {
            if (isRelevantUrl(currentUrl)) {
                try {
                    window.timelineRequestData.body = body;
                    console.log('📦 Sending XHR with data:', window.timelineRequestData);
                } catch (e) {
                    console.error('Error with request body:', e);
                }
            }

            if (currentUrl && currentUrl.includes('/Likes')) {
                try {
                    window.likedTweetsRequestData.body = body;
                    console.log('📦 Sending Liked Tweets XHR with data:', window.likedTweetsRequestData);
                } catch (e) {
                    console.error('Error with liked tweets request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    console.log('✅ Timeline & Likes interceptor ready - waiting for requests');
})();