/* global chrome */
class BrowserStorage {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async get(key) {
    try {
      return new Promise((resolve, reject) => {
        this.storage.get(key, (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result[key]);
          }
        });
      });
    } catch (error) {
      console.error('Error getting from storage:', error);
      throw error;
    }
  }

  async set(key, value) {
    try {
      return new Promise((resolve, reject) => {
        const data = { [key]: value };
        this.storage.set(data, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error setting to storage:', error);
      throw error;
    }
  }

  async remove(key) {
    try {
      return new Promise((resolve, reject) => {
        this.storage.remove(key, () => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  async clear() {
    try {
      return new Promise((resolve, reject) => {
        this.storage.clear(() => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
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

export default new BrowserStorage();