// Storage utilities for managing user preferences (API keys and model selection)

const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  SELECTED_MODEL: 'selectedModel',
  API_KEYS: 'apiKeys',
  SETUP_COMPLETED: 'setupCompleted'
};

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
    instructions: 'Get your free API key from Google AI Studio. Sign in with your Google account and generate a new API key.'
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
    instructions: 'Get your API key from OpenAI Platform. You\'ll need to add credit to your account to use the API.'
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
    instructions: 'Get your API key from Anthropic Console. Sign up for an account and generate an API key.'
  }
};

// Storage utilities class
class StorageUtils {
  
  // Save user preferences (model selection and API keys)
  static async saveUserPreferences(preferences) {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.USER_PREFERENCES]: preferences,
        [STORAGE_KEYS.SETUP_COMPLETED]: true
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
      return !!storedApiKey;
      
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
        STORAGE_KEYS.SETUP_COMPLETED
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

  // Test Gemini API key
  static async testGeminiKey(apiKey, config) {
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
      const errorText = await response.text();
      return { valid: false, error: `API key validation failed: ${response.status}` };
    }
  }

  // Test OpenAI API key
  static async testOpenAIKey(apiKey, config) {
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
      return { valid: false, error: `API key validation failed: ${response.status}` };
    }
  }

  // Test Anthropic API key
  static async testAnthropicKey(apiKey, config) {
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
      return { valid: false, error: `API key validation failed: ${response.status}` };
    }
  }
}

export default StorageUtils;
export { STORAGE_KEYS };