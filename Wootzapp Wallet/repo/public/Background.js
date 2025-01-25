/* global chrome */
console.log('Background script loaded');

let pendingSignRequest = null;

chrome.runtime.onInstalled.addListener(() => {
  console.log('Wootz Wallet extension installed');
  console.log('Extension ID:', chrome.runtime.id);
});

chrome.wootz.onSignMessageRequested.addListener((request) => {
  console.log('Sign message request received in background:', request);
  pendingSignRequest = request;
  chrome.runtime.sendMessage({ type: 'signMessageRequest', data: request });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received in background:', message);
  if (message.type === 'getSignRequest') {
    if (pendingSignRequest) {
      sendResponse({ type: 'signMessageRequest', data: pendingSignRequest });
    } else {
      sendResponse({ type: 'noRequest' });
    }
  } else if (message.type === 'signMessage') {
    chrome.wootz.signMessage(message.requestId, message.approved, message.signature, (result) => {
      console.log('Sign message result:', result);
      pendingSignRequest = null;  // Clear the pending request
      sendResponse(result);
    });
    return true; // Indicates that the response is sent asynchronously
  }
});