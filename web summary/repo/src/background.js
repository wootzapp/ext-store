
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed/updated');
  setupAlarm();
  setupTabListeners();
});
  
function setupAlarm() {
  chrome.alarms.create('keepAlive', {
    delayInMinutes: 0.5,
    periodInMinutes: 0.5
    
  });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
      console.log('Background active:', new Date().toISOString());
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'urlChanged':
      console.log('URL changed to:', message.url);
      sendResponse({
        type: 'urlChangeAcknowledged',
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'pageLoaded':
      console.log('Page loaded:', message.url);
      sendResponse({
        type: 'pageLoadAcknowledged',
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'domCaptured':
      console.log('=== DOM CAPTURED ===');
      console.log('URL:', message.data.url);
      console.log('Title:', message.data.title);
      console.log('Timestamp:', message.data.timestamp);
      console.log('Text Content (first 1000 chars):', message.data.textContent);
      console.log('Full HTML Length:', message.data.html.length);
      console.log('Full HTML:', message.data.html);
      console.log('=== END DOM ===');
      
      sendResponse({
        type: 'domCaptureAcknowledged',
        timestamp: new Date().toISOString()
      });
      break;
      
    default:
      console.log('Unknown message type:', message.type);
      break;
  }
  
  return true; 
});

function setupTabListeners() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      console.log('Active tab updated:', tab.url);
      askContentForCurrentUrl(tabId);
    }
  });
  
  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Active tab changed to:', activeInfo.tabId);
    askContentForCurrentUrl(activeInfo.tabId);
  });
}

function askContentForCurrentUrl(tabId = null) {
  if (!tabId) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      
      if (tabs.length > 0) {
        requestUrlFromContent(tabs[0].id);
      }
    });
  } else {
    requestUrlFromContent(tabId);
  }
}

function requestUrlFromContent(tabId) {
  chrome.tabs.sendMessage(tabId, {
    type: 'ping'
  }).then(response => {
    if (response && response.type === 'pong') {
      console.log('Content script is initialized, requesting URL');
      chrome.tabs.sendMessage(tabId, {
        type: 'getCurrentUrl'
      }).then(urlResponse => {
        console.log('Current URL from content script:', urlResponse.url);
      }).catch(err => {
        console.log('Could not get URL from tab:', tabId, err);
      });
    }
  }).catch(err => {
    console.log('Content script not initialized on tab:', tabId);
    injectContentScript(tabId);
  });
}

function injectContentScript(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['content.js']
  }).then(() => {
    console.log('Content script injected into tab:', tabId);
    setTimeout(() => {
      requestUrlFromContent(tabId);
    }, 1000);
  }).catch(err => {
    console.log('Could not inject content script:', err);
  });
}