console.log('API-Test content script loaded');

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PAGE_INFO') {
    // Return current page information if needed
    sendResponse({
      url: window.location.href,
      title: document.title
    });
  }
});