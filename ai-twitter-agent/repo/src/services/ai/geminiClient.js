/* global chrome */
class BrowserGeminiClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.isExtension = typeof chrome !== 'undefined' && 
                      chrome.runtime && 
                      chrome.runtime.id;
  }

  async generateTweet(topic, options = {}) {
    console.log('BrowserGeminiClient.generateTweet called');
    console.log('Environment check - isExtension:', this.isExtension);
    
    if (this.isExtension) {
      console.log('Using background script for Gemini API call');
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'GEMINI_GENERATE',
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

  async improveTweet(originalTweet) {
    if (this.isExtension) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'GEMINI_IMPROVE',
          apiKey: this.apiKey,
          originalTweet: originalTweet
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve(response.tweet);
          } else {
            reject(new Error(response?.error || 'Unknown error from background script'));
          }
        });
      });
    } else {
      throw new Error('Tweet improvement not supported in web app mode due to CORS. Please use as Chrome extension for full functionality.');
    }
  }

  async generateMultipleTweets(topic, count = 3) {
    if (this.isExtension) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          action: 'GEMINI_MULTIPLE',
          apiKey: this.apiKey,
          topic: topic,
          count: count
        }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (response && response.success) {
            resolve(response.tweets);
          } else {
            reject(new Error(response?.error || 'Unknown error from background script'));
          }
        });
      });
    } else {
      throw new Error('Multiple tweet generation not supported in web app mode due to CORS. Please use as Chrome extension for full functionality.');
    }
  }
}

export default BrowserGeminiClient; 