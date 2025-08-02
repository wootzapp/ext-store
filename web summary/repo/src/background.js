
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
      
      chrome.storage.local.remove(['currentPage', 'aiResults', 'aiError', 'aiProcessingStatus'], () => {
        console.log('All storage cleared due to URL change');
      });
      
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
      console.log('Text Content cleaned:', message.data.cleanTextContent);
      console.log('Text Content cleaned length:', message.data.cleanTextContent.length);
      const domArray = message.data.cleanTextContent.split(' ');
      console.log('DOM Array length:', domArray.length);
      console.log('DOM Array:', domArray);
      console.log('=== END DOM ===');
      
      const currentPageData = {
        currentPage: {
          url: message.data.url,
          title: message.data.title,
          cleanTextContent: message.data.cleanTextContent,
          timestamp: message.data.timestamp
        }
      };
      
      chrome.storage.local.set(currentPageData, () => {
        console.log('Current page data stored:', currentPageData);
      });
      
      console.log('DOM captured and stored. Waiting for user to trigger AI processing.');
      
      sendResponse({
        type: 'domCaptureAcknowledged',
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'processWithAI':
      console.log('User requested AI processing');
      
      chrome.storage.local.get(['currentPage'], (result) => {
        if (result.currentPage && result.currentPage.cleanTextContent) {
          console.log('Starting AI processing for stored page data');
          processWithAI(result.currentPage);
          sendResponse({
            type: 'aiProcessingStarted',
            timestamp: new Date().toISOString()
          });
        } else {
          console.log('No page data available for AI processing');
          sendResponse({
            type: 'aiProcessingError',
            error: 'No page data available. Please refresh the page and try again.',
            timestamp: new Date().toISOString()
          });
        }
      });
      break;
      
    case 'chatMessage':
      console.log('User sent chat message:', message.message);
      handleChatMessage(message.message, sendResponse);
      break;
      
    default:
      console.log('Unknown message type:', message.type);
      break;
  }
  
  return true; 
});

function setupTabListeners() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.active) {
      console.log('Tab loading started:', tab.url);
      clearStorageForNewPage();
    } else if (changeInfo.status === 'complete' && tab.active) {
      console.log('Active tab updated:', tab.url);
      askContentForCurrentUrl(tabId);
    }
  });
  
  chrome.tabs.onActivated.addListener((activeInfo) => {
    console.log('Active tab changed to:', activeInfo.tabId);
    clearStorageForNewPage();
    askContentForCurrentUrl(activeInfo.tabId);
  });
}

function clearStorageForNewPage() {
  chrome.storage.local.remove(['currentPage', 'aiResults', 'aiError', 'aiProcessingStatus'], () => {
    console.log('Storage cleared for new page navigation');
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

import aiService from './utils/aiService.js';

async function handleChatMessage(message, sendResponse) {
  try {
    console.log('Processing chat message:', message);
    
    if (!aiService.validateApiKey()) {
      console.log('No API key configured for chat');
      sendResponse({
        success: false,
        reply: 'Sorry, AI chat is not configured. Please add your API key in the configuration.',
        timestamp: new Date().toISOString()
      });
      return;
    }
    
    const result = await aiService.generateChatResponse(message);
    
    if (result.success) {
      sendResponse({
        success: true,
        reply: result.reply,
        timestamp: new Date().toISOString()
      });
    } else {
      sendResponse({
        success: false,
        reply: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error handling chat message:', error);
    sendResponse({
      success: false,
      reply: 'Sorry, I encountered an error. Please try again.',
      timestamp: new Date().toISOString()
    });
  }
}

async function processWithAI(domData) {
  try {
    console.log('Starting AI processing for:', domData.url);
    
    if (!aiService.validateApiKey()) {
      console.log('No API key configured, skipping AI processing');

      const noApiKeyData = {
        aiResults: {
          url: domData.url,
          title: domData.title,
          summary: 'AI processing skipped - No API key configured',
          faqs: [],
          timestamp: new Date().toISOString(),
          provider: 'none',
          error: 'No API key configured'
        }
      };
      
      chrome.storage.local.set(noApiKeyData, () => {
        console.log('No API key data stored:', noApiKeyData);
      });
      
      return;
    }
    
    const initialStatus = {
      aiProcessingStatus: {
        url: domData.url,
        status: 'processing',
        timestamp: new Date().toISOString()
      }
    };
    
    chrome.storage.local.set(initialStatus, () => {
      console.log('Processing status stored:', initialStatus);
    });
    
    const result = await aiService.processSingleBatch(
      domData.cleanTextContent,
      domData.url,
      domData.title
    );
    
    if (result.success) {
      console.log('AI processing successful');
      
      const aiResults = {
        aiResults: {
          url: domData.url,
          title: domData.title,
          summary: result.summary,
          faqs: result.faqs,
          timestamp: result.timestamp,
          provider: aiService.getProviderInfo().provider
        }
      };
      
      chrome.storage.local.set(aiResults, () => {
        console.log('AI results stored in local storage:', aiResults);
        
        const completionStatus = {
          aiProcessingStatus: {
            url: domData.url,
            status: 'complete',
            progress: 100,
            timestamp: new Date().toISOString()
          }
        };
        
        chrome.storage.local.set(completionStatus, () => {
          console.log('Processing completion status stored');
        });
        
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs.length > 0) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'aiProcessingComplete',
              data: aiResults.aiResults
            }).catch(err => {
              console.log('Could not notify content script:', err);
            });
          }
        });
      });
      
    } else {
      console.error('AI processing failed:', result.error);
      
      const errorData = {
        aiError: {
          url: domData.url,
          error: result.error,
          timestamp: new Date().toISOString()
        }
      };
      
      chrome.storage.local.set(errorData, () => {
        console.log('AI error stored in local storage:', errorData);
      });
    }
    
  } catch (error) {
    console.error('Error in AI processing:', error);
        
    const errorData = {
      aiError: {
        url: domData.url,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    };
    
    chrome.storage.local.set(errorData, () => {
      console.log('AI error stored in local storage:', errorData);
    });
  }
}