/* global chrome */
class BrowserClaudeClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isExtension = typeof chrome !== 'undefined' && 
                      chrome.runtime && 
                      chrome.runtime.id;
  }

  async generateTweet(topic, options = {}) {
    console.log('BrowserClaudeClient.generateTweet called');
    console.log('Environment check - isExtension:', this.isExtension);
    
    if (this.isExtension) {
      console.log('Using background script for API call');
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'CLAUDE_GENERATE',
          apiKey: this.apiKey,
          topic: topic,
          options: options
        }, (response) => {
          console.log('Background script response:', response);
          
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve(response.tweet);
          } else {
            reject(new Error(response?.error || 'Unknown error from background script'));
          }
        });
      });
    } else {
      throw new Error('Direct API calls not supported in web app mode due to CORS. Please use as Chrome extension for full functionality.');
    }
  }
}

export default BrowserClaudeClient;