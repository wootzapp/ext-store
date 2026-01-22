// Background service worker - Handles AI communication and extension management
// Manages Gemini API integration, settings, and cross-tab communication

class BackgroundService {
  constructor() {
    this.aiRequestQueue = [];
    this.isProcessingAI = false;
    this.settings = {
      geminiApiKey: 'AIzaSyCoNFODrVovsQEFa4nseHbv0d56eMqhtDU', // Embedded API key
      enableAI: true,
      aiModel: 'gemini-1.5-pro-latest',
      batchSize: 10,
      requestDelay: 1000,
      maxRetries: 3
    };
    
    this.statistics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      totalResponseTime: 0
    };

    this.initialize();
  }

  async initialize() {
    console.log('🚀 Background service starting...');
    
    // Load settings
    await this.loadSettings();
    
    // Set up message listeners
    this.setupMessageHandlers();
    
    // Initialize extension state
    this.initializeExtensionState();
    
    console.log('✅ Background service ready');
  }

  async loadSettings() {
    try {
      // Settings loaded from sync storage
      const stored = await chrome.storage.sync.get('extensionSettings');
      if (stored.extensionSettings) {
        this.settings = { ...this.settings, ...stored.extensionSettings };
      }
      
      // No need to load API key from storage - using embedded key
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set({ extensionSettings: this.settings });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Handle extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstallation(details);
    });

    // Handle browser startup
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Try programmatic injection as fallback
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url && !tab.url.startsWith('chrome://')) {
        console.log('🔧 Trying programmatic injection for tab:', tab.url);
        this.injectContentScript(tabId);
      }
    });
  }

  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: () => {
          console.log('💉 PROGRAMMATICALLY INJECTED SCRIPT WORKING!');
          console.log('💉 Page URL:', window.location.href);
          
          // Add visual indicator
          const div = document.createElement('div');
          div.style.cssText = 'position:fixed;top:50px;left:0;width:100%;background:blue;color:white;padding:10px;z-index:99999;text-align:center;';
          div.textContent = '💉 PROGRAMMATIC INJECTION WORKING!';
          document.documentElement.appendChild(div);
          
          setTimeout(() => {
            div.remove();
          }, 3000);
        }
      });
      console.log('✅ Programmatic injection successful for tab:', tabId);
    } catch (error) {
      console.log('❌ Programmatic injection failed:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    console.log('📨 Background received message:', message.action, 'from tab:', sender?.tab?.id);
    try {
      switch (message.action) {
        case 'analyzeWithAI':
          console.log('🤖 Processing AI analysis request with data:', message.data);
          const result = await this.analyzeWithAI(message.data);
          console.log('✅ AI analysis complete:', result);
          sendResponse({ success: true, result });
          break;

        case 'updateSettings':
          console.log('⚙️ Updating settings:', message.settings);
          await this.updateSettings(message.settings);
          sendResponse({ success: true });
          break;

        case 'getSettings':
          console.log('📋 Sending settings:', this.settings);
          sendResponse({ success: true, settings: this.settings });
          break;

        case 'getStatistics':
          const stats = this.getStatistics();
          console.log('📊 Sending statistics:', stats);
          sendResponse({ success: true, statistics: stats });
          break;

        case 'clearCache':
          console.log('🧹 Clearing cache...');
          await this.clearCache();
          sendResponse({ success: true });
          break;

        case 'testAPIKey':
          console.log('🔑 Testing API key...');
          const isValid = await this.testAPIKey(message.apiKey);
          console.log('🔑 API key test result:', isValid);
          sendResponse({ success: true, valid: isValid });
          break;

        default:
          console.warn('❓ Unknown action:', message.action);
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('❌ Message handling error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async analyzeWithAI(batchData) {
    if (!this.settings.enableAI || !this.settings.geminiApiKey) {
      throw new Error('AI analysis disabled or API key not configured');
    }

    const startTime = performance.now();
    
    try {
      // Build prompt for Gemini
      const prompt = this.buildGeminiPrompt(batchData);
      
      // Check rate limiting
      await this.enforceRateLimit();
      
      // Make API request
      const response = await this.callGeminiAPI(prompt);
      
      // Parse and validate response
      const result = this.parseGeminiResponse(response);
      
      // Update statistics
      this.updateStatistics(true, performance.now() - startTime);
      
      return result;
    } catch (error) {
      this.updateStatistics(false, performance.now() - startTime);
      throw error;
    }
  }

  buildGeminiPrompt(batchData) {
    const prompt = `You are an expert in identifying sensitive form fields for privacy and security purposes.

TASK: Analyze the following anonymized form field metadata and identify which fields are likely to contain sensitive personal information.

SENSITIVE FIELD TYPES:
- Email addresses
- Passwords and authentication codes
- Phone numbers
- Physical addresses
- Names (first, last, full)
- Dates of birth
- Credit card information
- Social security numbers
- Government ID numbers
- Financial account information
- Medical information
- Any other personally identifiable information (PII)

INSTRUCTIONS:
1. Analyze each field's metadata including tag, type, patterns, and context
2. Consider the overall form structure and purpose
3. Return ONLY a JSON object with the following structure:

{
  "sensitiveIndexes": [0, 2, 5],
  "fieldTypes": ["email", "password", "phone"],
  "confidence": 0.85,
  "reasoning": "Brief explanation of detection logic"
}

Where:
- sensitiveIndexes: Array of indexes (0-based) of sensitive fields
- fieldTypes: Array of field types corresponding to each sensitive index
- confidence: Overall confidence score (0.0 to 1.0)
- reasoning: Brief explanation of why these fields were classified as sensitive

METADATA TO ANALYZE:
${JSON.stringify(batchData, null, 2)}

Remember: Only identify fields that are clearly sensitive. When in doubt, err on the side of caution.

RESPONSE (JSON only):`;

    return prompt;
  }

  async enforceRateLimit() {
    // Simple rate limiting - wait between requests
    if (this.lastRequestTime) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.settings.requestDelay) {
        await new Promise(resolve => 
          setTimeout(resolve, this.settings.requestDelay - timeSinceLastRequest)
        );
      }
    }
    this.lastRequestTime = Date.now();
  }

  async callGeminiAPI(prompt) {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${this.settings.aiModel}:generateContent?key=${this.settings.geminiApiKey}`;
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent results
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE"
        }
      ]
    };

    let lastError;
    
    for (let attempt = 1; attempt <= this.settings.maxRetries; attempt++) {
      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const responseData = await response.json();
        
        if (!responseData.candidates || !responseData.candidates[0]) {
          throw new Error('Invalid API response structure');
        }

        return responseData;
      } catch (error) {
        lastError = error;
        console.warn(`API attempt ${attempt} failed:`, error.message);
        
        if (attempt < this.settings.maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    throw lastError;
  }

  parseGeminiResponse(response) {
    try {
      const text = response.candidates[0]?.content?.parts[0]?.text;
      if (!text) {
        throw new Error('No response text from API');
      }

      // Extract JSON from response (Gemini sometimes adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const result = JSON.parse(jsonMatch[0]);
      
      // Validate response structure
      if (!Array.isArray(result.sensitiveIndexes)) {
        throw new Error('Invalid response: sensitiveIndexes must be an array');
      }
      
      if (!Array.isArray(result.fieldTypes)) {
        throw new Error('Invalid response: fieldTypes must be an array');
      }
      
      if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 1) {
        throw new Error('Invalid response: confidence must be a number between 0 and 1');
      }

      // Ensure arrays are the same length
      if (result.sensitiveIndexes.length !== result.fieldTypes.length) {
        throw new Error('Invalid response: sensitiveIndexes and fieldTypes must have the same length');
      }

      return result;
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', response);
      
      // Return safe fallback
      return {
        sensitiveIndexes: [],
        fieldTypes: [],
        confidence: 0,
        reasoning: 'Failed to parse AI response'
      };
    }
  }

  updateStatistics(success, responseTime) {
    this.statistics.totalRequests++;
    
    if (success) {
      this.statistics.successfulRequests++;
    } else {
      this.statistics.failedRequests++;
    }
    
    this.statistics.totalResponseTime += responseTime;
    this.statistics.averageResponseTime = this.statistics.totalResponseTime / this.statistics.totalRequests;
  }

  async updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    
    // Notify all tabs about settings change
    this.broadcastToTabs({ action: 'settingsUpdated', settings: this.settings });
  }

  async testAPIKey(apiKey = null) {
    const keyToTest = apiKey || this.settings.geminiApiKey;
    if (!keyToTest) return false;
    
    try {
      const testUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${keyToTest}`;
      
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Test connection - respond with "API_CONNECTION_SUCCESS"' }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100
          }
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Gemini API connection successful');
        console.log('📡 Response:', data.candidates?.[0]?.content?.parts?.[0]?.text);
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ API connection failed:', response.status, response.statusText, errorText);
        return false;
      }
    } catch (error) {
      console.error('API key test failed:', error);
      return false;
    }
  }

  async clearCache() {
    try {
      await chrome.storage.local.clear();
      this.broadcastToTabs({ action: 'cacheCleared' });
    } catch (error) {
      console.error('Failed to clear cache:', error);
      throw error;
    }
  }

  async broadcastToTabs(message) {
    try {
      const tabs = await chrome.tabs.query({});
      for (const tab of tabs) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Ignore errors for tabs that don't have content script
        });
      }
    } catch (error) {
      console.error('Failed to broadcast message:', error);
    }
  }

  getStatistics() {
    return {
      ...this.statistics,
      successRate: this.statistics.totalRequests > 0 
        ? this.statistics.successfulRequests / this.statistics.totalRequests 
        : 0,
      uptime: Date.now() - (this.startTime || Date.now())
    };
  }

  initializeExtensionState() {
    this.startTime = Date.now();
    
    // Set extension badge
    this.updateBadge();
    
    // Set up periodic cleanup
    setInterval(() => this.performMaintenance(), 60 * 60 * 1000); // Every hour
  }

  updateBadge() {
    if (this.settings.enableAI && this.settings.geminiApiKey) {
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' });
    } else {
      chrome.action.setBadgeText({ text: 'OFF' });
      chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
    }
  }

  async performMaintenance() {
    try {
      // Clean up old cache entries
      const storage = await chrome.storage.local.get();
      const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const keysToRemove = [];
      for (const [key, value] of Object.entries(storage)) {
        if (value.timestamp && value.timestamp < cutoffTime) {
          keysToRemove.push(key);
        }
      }
      
      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log(`Cleaned up ${keysToRemove.length} expired cache entries`);
      }
      
      // Update badge
      this.updateBadge();
      
    } catch (error) {
      console.error('Maintenance failed:', error);
    }
  }

  handleInstallation(details) {
    console.log('Extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
      // First time installation
      chrome.tabs.create({ 
        url: chrome.runtime.getURL('popup/popup.html#welcome') 
      });
    } else if (details.reason === 'update') {
      // Extension updated
      console.log('Extension updated to version:', chrome.runtime.getManifest().version);
    }
  }

  handleStartup() {
    console.log('Browser started, reinitializing extension');
    this.updateBadge();
  }
}

// Initialize background service
const backgroundService = new BackgroundService();
