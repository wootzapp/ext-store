/* global chrome */

class BrowserTwitterService {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  async initialize(config) {
    console.log('BrowserTwitterService: Initializing with tab automation');
    return { success: true, message: 'Twitter service initialized with tab automation method' };
  }

  async postTweet(content, credentials) {
    try {
      console.log('BrowserTwitterService: Attempting to post tweet:', content);
      
      if (!this.isExtension) {
        console.log('Twitter posting only available in extension mode');
        return { 
          success: false, 
          error: 'Twitter posting requires Chrome extension environment',
          posted: false
        };
      }

      // Try tab automation first (primary method)
      console.log('BrowserTwitterService: Using tab automation method...');
      const tabResult = await this.postViaTabAutomation(content);
      console.log('BrowserTwitterService: Tab automation result:', tabResult);
      
      if (tabResult.success) {
        return tabResult;
      }

      // Fallback to content script automation
      console.log('BrowserTwitterService: Tab automation failed, trying content script fallback...');
      return await this.postViaContentScript(content, credentials);
      
    } catch (error) {
      console.error('BrowserTwitterService: Error posting tweet:', error);
      return { 
        success: false, 
        error: error.message,
        posted: false
      };
    }
  }

  // Post tweet via tab automation (primary method)
  async postViaTabAutomation(content) {
    console.log('BrowserTwitterService: Using tab automation method');
    
    return new Promise((resolve) => {
      if (!this.isExtension) {
        resolve({
          success: false,
          error: 'Tab automation requires extension environment',
          posted: false
        });
        return;
      }

      // Send message to background script to handle tab automation
      chrome.runtime.sendMessage({
        action: 'POST_TWEET_VIA_TAB',
        content: content
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('BrowserTwitterService: Background message error:', chrome.runtime.lastError);
          resolve({ 
            success: false, 
            error: chrome.runtime.lastError.message,
            posted: false 
          });
        } else {
          console.log('BrowserTwitterService: Background response:', response);
          resolve(response || { 
            success: false, 
            error: 'No response from background script',
            posted: false 
          });
        }
      });
    });
  }

  // Content script fallback method
  async postViaContentScript(content, credentials) {
    console.log('BrowserTwitterService: Using content script fallback');
    
    return new Promise((resolve) => {
      if (!this.isExtension) {
        resolve({
          success: false,
          error: 'Content script method requires extension environment',
          posted: false
        });
        return;
      }

      // Check for Twitter tabs
      chrome.tabs.query({url: ["https://twitter.com/*", "https://x.com/*"]}, (tabs) => {
        if (tabs.length > 0) {
          // Try to use existing Twitter tab
          chrome.tabs.sendMessage(tabs[0].id, {
            action: 'postTweet',
            content: content
          }, (response) => {
            if (chrome.runtime.lastError) {
              console.log('Content script not responding');
              resolve({
                success: false,
                error: 'Content script not available',
                posted: false
              });
            } else {
              resolve(response || { 
                success: false, 
                error: 'No response from content script',
                posted: false
              });
            }
          });
        } else {
          // No Twitter tabs
          resolve({
            success: false,
            error: 'No Twitter tabs open',
            posted: false
          });
        }
      });
    });
  }

  async checkLogin() {
    // Basic login check - can be expanded if needed
    return { loggedIn: false, message: 'Login check not implemented for tab automation method' };
  }
}

export default BrowserTwitterService;