// Ensure the service worker is active
console.log('Service Worker Starting...', new Date().toISOString());
console.log('Runtime ID:', chrome.runtime.id);

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "createTab") {
        try {
            chrome.tabs.create({
                url: request.url,
                active: true
            }, (tab) => {
                console.log('Created new tab:', {
                    url: request.url,
                    tabId: tab.id
                });
                sendResponse({ success: true, tabId: tab.id });
            });
        } catch (error) {
            console.error('Error creating tab:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    // Required for async response
    return true;
});
