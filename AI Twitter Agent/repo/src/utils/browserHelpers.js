// Browser detection and utility functions
/* global chrome */
export const isExtension = () => {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
};

export const isWebApp = () => {
  return !isExtension();
};

// Environment detection
export const getEnvironment = () => {
  if (isExtension()) {
    return 'extension';
  }
  return 'webapp';
};

// Storage helpers
export const getStorageMethod = () => {
  if (isExtension()) {
    return 'chrome-storage';
  }
  return 'localStorage';
};

// API helpers
export const canPostToTwitter = () => {
  return isExtension();
};

// Message formatting
export const formatTweet = (content, maxLength = 280) => {
  if (content.length <= maxLength) {
    return content;
  }
  return content.substring(0, maxLength - 3) + '...';
};

// Time utilities
export const formatTimestamp = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

export const getTimeAgo = (timestamp) => {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now - time) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  } else {
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  }
};

// URL helpers
export const isTwitterUrl = (url) => {
  return url.includes('x.com') || url.includes('twitter.com');
};

// Validation helpers
export const validateApiKey = (apiKey, model = 'claude') => {
  if (!apiKey) return false;
  
  switch (model) {
    case 'claude':
      return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
    case 'openai':
      return apiKey.startsWith('sk-') && apiKey.length > 20;
    case 'gemini':
      return apiKey.startsWith('AIza') && apiKey.length > 20;
    default:
      return false;
  }
};

export const validateTwitterCredentials = (credentials) => {
  return credentials.username && credentials.password;
};

export const validateTopic = (topic) => {
  return topic && topic.trim().length > 0;
};

// Error handling
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  return {
    success: false,
    error: error.message || 'An unknown error occurred'
  };
};

// CORS helpers for API calls
export const makeAPIRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API request failed: ${error.message}`);
  }
};

// Local storage helpers for web app
export const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting localStorage item:', error);
  }
};

export const getLocalStorageItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting localStorage item:', error);
    return defaultValue;
  }
};

// Chrome extension helpers
export const sendMessageToBackground = (message) => {
  if (!isExtension()) {
    return Promise.reject(new Error('Not in extension environment'));
  }
  
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
};

export const sendMessageToTab = (tabId, message) => {
  if (!isExtension()) {
    return Promise.reject(new Error('Not in extension environment'));
  }
  
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
};

// Helper to get current AI model and API key from config
export const getCurrentAIConfig = (config) => {
  const model = config.ai?.model || 'claude';
  const apiKey = config.ai?.apiKeys?.[model] || config.anthropicApiKey || '';
  
  return {
    model,
    apiKey,
    isValid: validateApiKey(apiKey, model)
  };
};