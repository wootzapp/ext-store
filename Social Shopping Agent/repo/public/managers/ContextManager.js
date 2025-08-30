/* global chrome */

export class ContextManager {
    constructor() {
      this.activeTabId = null;
    }
  
    async waitForReady(tabId, timeout = 10000) {
      return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkReady = () => {
          if (Date.now() - startTime > timeout) {
            resolve({ id: tabId, status: 'timeout' });
            return;
          }
          
          chrome.tabs.get(tabId, (tab) => {
            if (chrome.runtime.lastError || !tab) {
              setTimeout(checkReady, 500);
            } else if (tab.status === 'complete') {
              resolve(tab);
            } else {
              setTimeout(checkReady, 500);
            }
          });
        };
        
        checkReady();
      });
    }
  
    async getCurrentActiveTab() {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return tabs[0];
      } catch (error) {
        return null;
      }
    }
  }