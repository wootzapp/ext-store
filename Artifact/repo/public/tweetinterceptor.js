(function() {
    console.log('🎯 Timeline Interceptor script injected');
    
    let xhrRequestComplete = false;
    
    // Initialize requestData in window scope
    window.timelineRequestData = {
        headers: null,
        url: null,
        params: null
    };

    // Function to send data to content script
    function sendToContentScript(data, type = 'TIMELINE_REQUEST_DATA') {
        console.log(`📤 Sending timeline ${type} to content script:`, data);
        window.dispatchEvent(new CustomEvent('timelinerequestdataCaptured', {
            detail: {
                type: type,
                data: data
            }
        }));
    }

    // Capture XHR requests
    const originalXHR = window.XMLHttpRequest;
    console.log('📌 Original Timeline XMLHttpRequest:', !!originalXHR);
    
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
            
            // Look for HomeTimeline or UserTweets endpoints
            if (url && (url.includes('HomeTimeline'))) {
                console.log('🎯 XHR Captured Timeline URL:', url);
                window.timelineRequestData.url = url;
                window.timelineRequestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (currentUrl && (currentUrl.includes('HomeTimeline'))) {
                allHeaders[header] = value;
                window.timelineRequestData.headers = allHeaders;
                console.log('🏷️ Setting timeline header:', header, value);
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (currentUrl && (currentUrl.includes('HomeTimeline'))) {
                xhrRequestComplete = true;
                console.log('✅ Timeline XHR request complete, sending final data');
                sendToContentScript(window.timelineRequestData, 'TWEET_XHR_COMPLETE');
            }
        });

        xhr.send = function(body) {
            if (currentUrl && (currentUrl.includes('HomeTimeline'))) {
                try {
                    window.timelineRequestData.body = body;
                    console.log('📦 Sending Timeline XHR with data:', window.timelineRequestData);
                } catch (e) {
                    console.error('Error with timeline request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    console.log('✅ Timeline interceptor ready - waiting for first XHR');
})();