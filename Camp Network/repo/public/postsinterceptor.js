// Create a new file: public/repliesinterceptor.js
(function() {
    console.log('🎯 Replies Interceptor script injected');
    
    let xhrRequestComplete = false;
    
    // Initialize requestData in window scope
    window.repliesRequestData = {
        headers: null,
        url: null,
        params: null
    };

    // Function to send data to content script
    function sendToContentScript(data, type = 'REPLIES_REQUEST_DATA') {
        console.log(`📤 Sending replies ${type} to content script:`, data);
        window.dispatchEvent(new CustomEvent('repliesRequestDataCaptured', {
            detail: {
                type: type,
                data: data
            }
        }));
    }

    // Helper function to identify relevant URLs
    function isRelevantUrl(url) {
        return url && (
            url.includes('UserTweets') || 
            url.includes('with_replies')
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

        xhr.open = function() {
            const method = arguments[0];
            const url = arguments[1];
            currentUrl = url;
            
            if (isRelevantUrl(url)) {
                console.log('🎯 XHR Captured Replies URL:', url);
                window.repliesRequestData.url = url;
                window.repliesRequestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (isRelevantUrl(currentUrl)) {
                allHeaders[header] = value;
                window.repliesRequestData.headers = allHeaders;
                console.log('🏷️ Setting replies header:', header, value);
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (isRelevantUrl(currentUrl)) {
                xhrRequestComplete = true;
                try {
                    const responseData = JSON.parse(xhr.responseText);
                    console.log('✅ XHR request complete, sending final replies data');
                    sendToContentScript({
                        ...window.repliesRequestData,
                        responseData
                    }, 'REPLIES_XHR_COMPLETE');
                } catch (error) {
                    console.error('Error parsing response:', error);
                    sendToContentScript(window.repliesRequestData, 'REPLIES_XHR_COMPLETE');
                }
            }
        });

        xhr.send = function(body) {
            if (isRelevantUrl(currentUrl)) {
                try {
                    window.repliesRequestData.body = body;
                    console.log('📦 Sending Replies XHR with data:', window.repliesRequestData);
                } catch (e) {
                    console.error('Error with replies request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    console.log('✅ Replies interceptor ready - waiting for requests');
})();