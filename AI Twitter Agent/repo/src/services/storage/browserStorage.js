/* global chrome */
class BrowserStorage {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage;
  }

  async get(key) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.get([key], (result) => {
          resolve(result[key] || null);
        });
      });
    } else {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    }
  }

  async set(key, value) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.set({ [key]: value }, resolve);
      });
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  async remove(key) {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.remove([key], resolve);
      });
    } else {
      localStorage.removeItem(key);
    }
  }

  async clear() {
    if (this.isExtension) {
      return new Promise((resolve) => {
        chrome.storage.sync.clear(resolve);
      });
    } else {
      localStorage.clear();
    }
  }

  // Config-specific methods
  async getConfig() {
    return await this.get('agentConfig') || {
      // Backward compatibility: keep anthropicApiKey for existing users
      anthropicApiKey: '',
      // New AI configuration structure
      ai: {
        model: 'claude', // Default to claude for backward compatibility
        apiKeys: {
          claude: '',
          openai: '',
          gemini: ''
        }
      },
      twitter: {
        username: '',
        password: '',
        email: ''
      },
      topics: [
        'Artificial Intelligence trends',
        'Machine Learning innovations',
      ],
      settings: {
        interval: 240, // minutes
        style: 'professional but engaging',
        enabled: false
      }
    };
  }

  async setConfig(config) {
    await this.set('agentConfig', config);
  }

  async getTweetHistory() {
    return await this.get('tweetHistory') || [];
  }

  async addTweetToHistory(tweet) {
    const history = await this.getTweetHistory();
    history.unshift({
      id: Date.now(),
      content: tweet,
      timestamp: new Date().toISOString(),
      posted: false
    });
    
    // Keep only last 100 tweets
    if (history.length > 100) {
      history.splice(100);
    }
    
    await this.set('tweetHistory', history);
  }

  async markTweetAsPosted(tweetId) {
    const history = await this.getTweetHistory();
    const tweet = history.find(t => t.id === tweetId);
    if (tweet) {
      tweet.posted = true;
      tweet.postedAt = new Date().toISOString();
      await this.set('tweetHistory', history);
    }
  }
}

export default BrowserStorage;