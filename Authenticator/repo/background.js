console.log('Background script starting...');

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  console.log('Background received message:', message);
  
  if (message.action === 'processSamlResponse') {
    console.log('Background: Processing SAML response');
    console.log('Background: XML Response length:', message.xmlResponse ? message.xmlResponse.length : 'undefined');
    
    if (!message.xmlResponse) {
      console.error('Background: No XML response provided');
      chrome.runtime.sendMessage({
        action: 'authResult',
        success: false,
        error: 'No XML response provided'
      });
      return;
    }
    
    console.log('Background: Calling chrome.wootz.submitSamlResponse...');
    
    if (typeof chrome.wootz === 'undefined' || typeof chrome.wootz.submitSamlResponse === 'undefined') {
      console.error('Background: chrome.wootz.submitSamlResponse is not available');
      chrome.runtime.sendMessage({
        action: 'authResult',
        success: false,
        error: 'Wootz API not available'
      });
      return;
    }
    
    chrome.wootz.submitSamlResponse(message.xmlResponse, function(result) {
      console.log('Background: submitSamlResponse callback received');
      console.log('Background: Result:', result);
      
      chrome.runtime.sendMessage({
        action: 'authResult',
        success: result ? result.success : false,
        error: result ? result.error : 'No result returned'
      });
    });
  }
});

console.log('Background script loaded successfully');