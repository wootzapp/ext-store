(function() {
    console.log('🎯 Interceptor script injected');
    
    let xhrRequestComplete = false;
    
    // Initialize requestData in window scope
    window.requestData = {
        headers: null,
        url: null,
        params: null
    };

    // Function to send data to content script
    function sendToContentScript(data, type = 'REQUEST_DATA') {
        console.log(`📤 Sending ${type} to content script:`, data);
        window.dispatchEvent(new CustomEvent('requestDataCaptured', {
            detail: {
                type: type,
                data: data
            }
        }));
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
            
            if (url && url.includes('/Following')) {
                console.log('🎯 XHR Captured Following URL:', url);
                window.requestData.url = url;
                window.requestData.method = method;
            }
            return originalOpen.apply(this, arguments);
        };

        xhr.setRequestHeader = function(header, value) {
            if (currentUrl && currentUrl.includes('/Following')) {
                allHeaders[header] = value;
                window.requestData.headers = allHeaders;
                console.log('🏷️ Setting header:', header, value);
            }
            return originalSetRequestHeader.apply(this, arguments);
        };

        xhr.addEventListener('load', function() {
            if (currentUrl && currentUrl.includes('/Following')) {
                xhrRequestComplete = true;
                console.log('✅ XHR request complete, sending final data');
                sendToContentScript(window.requestData, 'XHR_COMPLETE');
            }
        });

        xhr.send = function(body) {
            if (currentUrl && currentUrl.includes('/Following')) {
                try {
                    window.requestData.body = body;
                    console.log('📦 Sending XHR with data:', window.requestData);
                } catch (e) {
                    console.error('Error with request body:', e);
                }
            }
            return originalSend.apply(this, arguments);
        };

        return xhr;
    };

    // Also capture fetch requests
    const originalFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        if (url && url.toString().includes('/Following')) {
            if (!xhrRequestComplete) {
                console.log('⏳ Waiting for XHR request to complete...');
                await new Promise(resolve => {
                    const checkXHR = setInterval(() => {
                        if (xhrRequestComplete) {
                            clearInterval(checkXHR);
                            resolve();
                        }
                    }, 100);
                });
            }
            
            console.log('🎯 Fetch request starting with captured data:', window.requestData);
            options.headers = window.requestData.headers;
        }
        return originalFetch.apply(this, arguments);
    };

    console.log('✅ Request interceptors setup complete');
})(); 