// Storage utilities for managing user preferences (API keys and model selection)

const STORAGE_KEYS = {
  // API Preferences
    USE_OWN_KEY: 'useOwnKey',
    USER_PREFERENCES: 'userPreferences',
    SELECTED_MODEL: 'selectedModel',
    API_KEYS: 'apiKeys',
    SETUP_COMPLETED: 'setupCompleted',
    SELECTED_SEARCH_ENGINE: 'selectedSearchEngine',

  // Auth
    AUTH_USER: 'user',
    AUTH_IS_AUTHENTICATED: 'isAuthenticated',
    AUTH_LAST_LOGIN: 'lastLogin',
  };
  
  // Search engine configurations
  export const SEARCH_ENGINES = [
    {
      id: 'google',
      name: 'Google',
      description: 'Most popular search engine worldwide',
      keyword: 'google.com'
    },
    {
      id: 'yahoo',
      name: 'Yahoo',
      description: 'Web search with news and email integration',
      keyword: 'yahoo.com'
    },
    {
      id: 'bing',
      name: 'Bing',
      description: 'Microsoft\'s search engine with AI integration',
      keyword: 'bing.com'
    },
    {
      id: 'yandex',
      name: 'Yandex',
      description: 'Russian search engine with advanced features',
      keyword: 'yandex.com'
    },
    {
      id: 'duckduckgo',
      name: 'DuckDuckGo',
      description: 'Privacy-focused search without tracking',
      keyword: 'duckduckgo.com'
    }
  ];
  
  // Default model configurations
  export const SUPPORTED_MODELS = {
    'gemini': {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Advanced language model by Google with excellent reasoning capabilities',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      model: 'models/gemini-2.5-flash',
      maxTokens: 32000,
      temperature: 0.7,
      timeout: 120000,
      keyPlaceholder: 'Enter your Google Gemini API key...',
      getApiUrl: 'https://aistudio.google.com/app/apikey',
      instructions: 'Get your free API key from Google AI Studio. Sign in with your Google account and generate a new API key.',
      baseUrlToSearch: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent'
    },
    'openai': {
      id: 'openai',
      name: 'OpenAI GPT',
      description: 'Powerful language models from OpenAI including GPT-4 and GPT-3.5',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 60000,
      keyPlaceholder: 'Enter your OpenAI API key (starts with sk-)...',
      getApiUrl: 'https://platform.openai.com/api-keys',
      instructions: 'Get your API key from OpenAI Platform. You\'ll need to add credit to your account to use the API.',
      baseUrlToSearch: 'https://api.openai.com/v1/chat/completions'
    },
    'anthropic': {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Claude by Anthropic - helpful, harmless, and honest AI assistant',
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-3-sonnet-20240229',
      maxTokens: 4000,
      temperature: 0.7,
      timeout: 60000,
      keyPlaceholder: 'Enter your Anthropic API key (starts with sk-ant-)...',
      getApiUrl: 'https://console.anthropic.com/account/keys',
      instructions: 'Get your API key from Anthropic Console. Sign up for an account and generate an API key.',
      baseUrlToSearch: 'https://api.anthropic.com/v1/messages'
    }
  };
  
  // Storage utilities class
  class StorageUtils {

    // Persist toggle: true = use direct API key; false = use backend
    static async setUseOwnKey(flag) {
      try {
        await chrome.storage.local.set({ [STORAGE_KEYS.USE_OWN_KEY]: !!flag });
        return { success: true };
      } catch (error) {
        console.error('❌ Error saving useOwnKey:', error);
        return { success: false, error: error.message };
      }
    }

    static async getUseOwnKey() {
      try {
        const out = await chrome.storage.local.get([STORAGE_KEYS.USE_OWN_KEY]);
        // return boolean if present, else null so callers can detect "unset"
        return (STORAGE_KEYS.USE_OWN_KEY in out) ? !!out[STORAGE_KEYS.USE_OWN_KEY] : null;
      } catch (error) {
        console.error('❌ Error getting useOwnKey:', error);
        return null;
      }
    }

    
    // Save user preferences (model selection and API keys)
    static async saveUserPreferences(preferences) {
      try {
        await chrome.storage.local.set({
          [STORAGE_KEYS.USER_PREFERENCES]: preferences,
          [STORAGE_KEYS.SETUP_COMPLETED]: true,
          [STORAGE_KEYS.USE_OWN_KEY]: !!preferences?.useOwnKey,  // <— mirror
        });
        console.log('✅ User preferences saved successfully');
        return { success: true };
      } catch (error) {
        console.error('❌ Error saving user preferences:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Get user preferences
    static async getUserPreferences() {
      try {
        const result = await chrome.storage.local.get([
          STORAGE_KEYS.USER_PREFERENCES,
          STORAGE_KEYS.SETUP_COMPLETED
        ]);
        
        return {
          preferences: result[STORAGE_KEYS.USER_PREFERENCES] || null,
          setupCompleted: result[STORAGE_KEYS.SETUP_COMPLETED] || false
        };
      } catch (error) {
        console.error('❌ Error getting user preferences:', error);
        return { preferences: null, setupCompleted: false };
      }
    }
  
    // Save API key for a specific model
    static async saveApiKey(modelId, apiKey) {
      try {
        const { apiKeys } = await chrome.storage.local.get([STORAGE_KEYS.API_KEYS]);
        const updatedKeys = { ...apiKeys, [modelId]: apiKey };
        
        await chrome.storage.local.set({
          [STORAGE_KEYS.API_KEYS]: updatedKeys
        });
        
        console.log(`✅ API key saved for model: ${modelId}`);
        return { success: true };
      } catch (error) {
        console.error(`❌ Error saving API key for ${modelId}:`, error);
        return { success: false, error: error.message };
      }
    }
  
    // Get API key for a specific model
    static async getApiKey(modelId) {
      try {
        const result = await chrome.storage.local.get([STORAGE_KEYS.API_KEYS]);
        const apiKeys = result[STORAGE_KEYS.API_KEYS] || {};
        return apiKeys[modelId] || null;
      } catch (error) {
        console.error(`❌ Error getting API key for ${modelId}:`, error);
        return null;
      }
    }
  
    // Save selected model
    static async saveSelectedModel(modelId) {
      try {
        await chrome.storage.local.set({
          [STORAGE_KEYS.SELECTED_MODEL]: modelId
        });
        console.log(`✅ Selected model saved: ${modelId}`);
        return { success: true };
      } catch (error) {
        console.error('❌ Error saving selected model:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Get selected model
    static async getSelectedModel() {
      try {
        const result = await chrome.storage.local.get([STORAGE_KEYS.SELECTED_MODEL]);
        return result[STORAGE_KEYS.SELECTED_MODEL] || null;
      } catch (error) {
        console.error('❌ Error getting selected model:', error);
        return null;
      }
    }
  
    // Check if setup is completed (has both model selection and API key)
    static async isSetupCompleted() {
      try {
        const { preferences, setupCompleted } = await this.getUserPreferences();
        
        if (!setupCompleted || !preferences) {
          return false;
        }
  
        // Verify that we have both model selection and API key
        const { selectedModel, apiKey } = preferences;
        if (!selectedModel || !apiKey) {
          return false;
        }
  
        // Verify the API key still exists in storage
        const storedApiKey = await this.getApiKey(selectedModel);
        if (!storedApiKey) {
          return false;
        }
  
        // Also check if search engine is configured
        const selectedSearchEngine = await this.getSelectedSearchEngine();
        if (!selectedSearchEngine) {
          return false;
        }
  
        return true;
        
      } catch (error) {
        console.error('❌ Error checking setup completion:', error);
        return false;
      }
    }
  
    // Get current configuration (model + API key)
    static async getCurrentConfig() {
      try {
        const { preferences } = await this.getUserPreferences();
        
        if (!preferences || !preferences.selectedModel) {
          return null;
        }
  
        const { selectedModel } = preferences;
        const apiKey = await this.getApiKey(selectedModel);
        
        if (!apiKey) {
          return null;
        }
  
        const modelConfig = SUPPORTED_MODELS[selectedModel];
        if (!modelConfig) {
          return null;
        }
  
        return {
          modelId: selectedModel,
          apiKey,
          config: {
            ...modelConfig,
            apiKey // Override with user's API key
          }
        };
      } catch (error) {
        console.error('❌ Error getting current config:', error);
        return null;
      }
    }
  
    // Clear all user data (useful for reset functionality)
    static async clearUserData() {
      try {
        await chrome.storage.local.remove([
          STORAGE_KEYS.USER_PREFERENCES,
          STORAGE_KEYS.SELECTED_MODEL,
          STORAGE_KEYS.API_KEYS,
          STORAGE_KEYS.SETUP_COMPLETED,
          STORAGE_KEYS.USE_OWN_KEY,     // <— NEW
        ]);
        console.log('✅ All user data cleared');
        return { success: true };
      } catch (error) {
        console.error('❌ Error clearing user data:', error);
        return { success: false, error: error.message };
      }
    }
  
    // Validate API key format for different providers
    static validateApiKey(modelId, apiKey) {
      if (!apiKey || typeof apiKey !== 'string') {
        return { valid: false, error: 'API key is required' };
      }
  
      const trimmedKey = apiKey.trim();
      
      switch (modelId) {
        case 'openai':
          if (!trimmedKey.startsWith('sk-')) {
            return { valid: false, error: 'OpenAI API keys should start with "sk-"' };
          }
          if (trimmedKey.length < 40) {
            return { valid: false, error: 'OpenAI API key appears to be too short' };
          }
          break;
          
        case 'anthropic':
          if (!trimmedKey.startsWith('sk-ant-')) {
            return { valid: false, error: 'Anthropic API keys should start with "sk-ant-"' };
          }
          if (trimmedKey.length < 40) {
            return { valid: false, error: 'Anthropic API key appears to be too short' };
          }
          break;
          
        case 'gemini':
          if (trimmedKey.length < 30) {
            return { valid: false, error: 'Gemini API key appears to be too short' };
          }
          // Gemini keys are typically alphanumeric
          if (!/^[A-Za-z0-9_-]+$/.test(trimmedKey)) {
            return { valid: false, error: 'Gemini API key contains invalid characters' };
          }
          break;
          
        default:
          if (trimmedKey.length < 10) {
            return { valid: false, error: 'API key appears to be too short' };
          }
      }
  
      return { valid: true };
    }
  
    // Test API key by making a simple request
    static async testApiKey(modelId, apiKey) {
      const modelConfig = SUPPORTED_MODELS[modelId];
      if (!modelConfig) {
        return { valid: false, error: 'Unsupported model' };
      }
  
      try {
        // Create a simple test request based on the model type
        let testResponse;
        
        switch (modelId) {
          case 'gemini':
            testResponse = await this.testGeminiKey(apiKey, modelConfig);
            break;
          case 'openai':
            testResponse = await this.testOpenAIKey(apiKey, modelConfig);
            break;
          case 'anthropic':
            testResponse = await this.testAnthropicKey(apiKey, modelConfig);
            break;
          default:
            return { valid: false, error: 'API testing not implemented for this model' };
        }
        
        return testResponse;
      } catch (error) {
        console.error(`❌ Error testing ${modelId} API key:`, error);
        return { valid: false, error: `Failed to validate API key: ${error.message}` };
      }
    }
  
    static async testGeminiKey(apiKey, config) {
      try {
        const response = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: 'Hello' }] }],
            generationConfig: { maxOutputTokens: 10 }
          })
        });
        
        if (response.ok) {
          return { valid: true };
        } else {
          let errorMessage = 'API key validation failed';
          try {
            const errorData = await response.json();
            if (errorData.error && errorData.error.message) {
              errorMessage = errorData.error.message;
            }
          } catch (parseError) {
            // If we can't parse the error response, use status-based message
            switch (response.status) {
              case 400:
                errorMessage = 'Invalid API key format or request. Please check your Gemini API key.';
                break;
              case 401:
                errorMessage = 'Unauthorized: Your Gemini API key is invalid or has been revoked.';
                break;
              case 403:
                errorMessage = 'Forbidden: Your Gemini API key does not have permission to access this service.';
                break;
              case 429:
                errorMessage = 'Rate limit exceeded. Please try again later.';
                break;
              case 500:
                errorMessage = 'Google servers are experiencing issues. Please try again later.';
                break;
              default:
                errorMessage = `API validation failed with status ${response.status}. Please check your API key.`;
            }
          }
          return { valid: false, error: errorMessage };
        }
      } catch (networkError) {
        return { valid: false, error: 'Network error: Unable to connect to Google servers. Please check your internet connection.' };
      }
    }
  
    static async testOpenAIKey(apiKey, config) {
      try {
        const response = await fetch(`${config.baseUrl}/models`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          return { valid: true };
        } else {
          let errorMessage = 'API key validation failed';
          try {
            const errorData = await response.json();
            if (errorData.error && errorData.error.message) {
              errorMessage = errorData.error.message;
            }
          } catch (parseError) {
            // If we can't parse the error response, use status-based message
            switch (response.status) {
              case 401:
                errorMessage = 'Unauthorized: Your OpenAI API key is invalid or has been revoked. Please check your key at platform.openai.com.';
                break;
              case 403:
                errorMessage = 'Forbidden: Your OpenAI API key does not have permission to access this service.';
                break;
              case 429:
                errorMessage = 'Rate limit exceeded. Please check your OpenAI usage limits and billing.';
                break;
              case 500:
                errorMessage = 'OpenAI servers are experiencing issues. Please try again later.';
                break;
              default:
                errorMessage = `API validation failed with status ${response.status}. Please verify your OpenAI API key.`;
            }
          }
          return { valid: false, error: errorMessage };
        }
      } catch (networkError) {
        return { valid: false, error: 'Network error: Unable to connect to OpenAI servers. Please check your internet connection.' };
      }
    }
  
    static async testAnthropicKey(apiKey, config) {
      try {
        const response = await fetch(`${config.baseUrl}/messages`, {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: config.model,
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hello' }]
          })
        });
        
        if (response.ok) {
          return { valid: true };
        } else {
          let errorMessage = 'API key validation failed';
          try {
            const errorData = await response.json();
            if (errorData.error && errorData.error.message) {
              errorMessage = errorData.error.message;
            }
          } catch (parseError) {
            // If we can't parse the error response, use status-based message
            switch (response.status) {
              case 401:
                errorMessage = 'Unauthorized: Your Anthropic API key is invalid or has been revoked. Please check your key at console.anthropic.com.';
                break;
              case 403:
                errorMessage = 'Forbidden: Your Anthropic API key does not have permission to access this service.';
                break;
              case 429:
                errorMessage = 'Rate limit exceeded. Please check your Anthropic usage limits and billing.';
                break;
              case 500:
                errorMessage = 'Anthropic servers are experiencing issues. Please try again later.';
                break;
              default:
                errorMessage = `API validation failed with status ${response.status}. Please verify your Anthropic API key.`;
            }
          }
          return { valid: false, error: errorMessage };
        }
      } catch (networkError) {
        return { valid: false, error: 'Network error: Unable to connect to Anthropic servers. Please check your internet connection.' };
      }
    }
  
    static async saveSelectedSearchEngine(searchEngineId) {
      try {
        await chrome.storage.local.set({
          [STORAGE_KEYS.SELECTED_SEARCH_ENGINE]: searchEngineId
        });
        return { success: true };
      } catch (error) {
        console.error('Error saving selected search engine:', error);
        return { success: false, error: error.message };
      }
    }
  
    static async getSelectedSearchEngine() {
      try {
        const result = await chrome.storage.local.get([STORAGE_KEYS.SELECTED_SEARCH_ENGINE]);
        return result[STORAGE_KEYS.SELECTED_SEARCH_ENGINE] || 'google'; 
      } catch (error) {
        console.error('Error getting selected search engine:', error);
        return 'google'; 
      }
    }
  
    static async clearSearchEngineData() {
      try {
        await chrome.storage.local.remove([STORAGE_KEYS.SELECTED_SEARCH_ENGINE]);
        return { success: true };
      } catch (error) {
        console.error('Error clearing search engine data:', error);
        return { success: false, error: error.message };
      }
    }

    // ======================
    // Auth/session storage
    // ======================

    static async saveAuthUser(user) {
      try {
        await chrome?.storage?.local?.set?.({
          [STORAGE_KEYS.AUTH_USER]: user,
          [STORAGE_KEYS.AUTH_IS_AUTHENTICATED]: true,
          [STORAGE_KEYS.AUTH_LAST_LOGIN]: Date.now(),
        });
        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message || String(e) };
      }
    }

    static async getAuthSession() {
      try {
        const out = await chrome?.storage?.local?.get?.([
          STORAGE_KEYS.AUTH_USER,
          STORAGE_KEYS.AUTH_IS_AUTHENTICATED,
          STORAGE_KEYS.AUTH_LAST_LOGIN,
        ]);
        return {
          user: out?.[STORAGE_KEYS.AUTH_USER] || null,
          isAuthenticated: !!out?.[STORAGE_KEYS.AUTH_IS_AUTHENTICATED],
          lastLogin: out?.[STORAGE_KEYS.AUTH_LAST_LOGIN] || null,
        };
      } catch (e) {
        return { user: null, isAuthenticated: false, lastLogin: null };
      }
    }

    static async clearAuthSession() {
      try {
        await chrome?.storage?.local?.remove?.([
          STORAGE_KEYS.AUTH_USER,
          STORAGE_KEYS.AUTH_IS_AUTHENTICATED,
          STORAGE_KEYS.AUTH_LAST_LOGIN,
        ]);
        return { success: true };
      } catch (e) {
        return { success: false, error: e?.message || String(e) };
      }
    }

    static async isUserAuthenticated() {
      const s = await this.getAuthSession();
      return !!s.isAuthenticated;
    }

  }
  
  export default StorageUtils;
  export { STORAGE_KEYS };