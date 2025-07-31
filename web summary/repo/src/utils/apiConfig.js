
const API_CONFIG = {
  // Google Gemini Configuration
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: 'AIzaSyBm9WJOUi5juWaCiT07aeXI4V9uvdKuIwQ',
    model: 'models/gemini-1.5-flash',
    maxTokens: 6000,
    temperature: 0.7,
    timeout: 30000, 
  },

  defaultProvider: 'gemini',

  rateLimit: {
    maxRequestsPerMinute: 60,
    maxRequestsPerHour: 1000,
  },

  content: {
    maxTextLength: 20000, 
    truncateMethod: 'smart', 
    includeUrl: true, 
    includeTitle: true, 
  },

  // Prompt templates
  prompts: {
    summary: 'Please provide a concise summary of the following web page content:',
    analysis: 'Please analyze the following web page content and provide key insights:',
    extract: 'Please extract the main points from the following content:',
  }
};

// Helper function to get current provider config
function getCurrentProviderConfig() {
  const provider = API_CONFIG.defaultProvider;
  return API_CONFIG[provider];
}

// Helper function to validate API key
function validateApiKey(provider = null) {
  const config = provider ? API_CONFIG[provider] : getCurrentProviderConfig();
  return config && config.apiKey && config.apiKey.trim() !== '';
}

// Helper function to get API headers
function getApiHeaders(provider = null) {
  const config = provider ? API_CONFIG[provider] : getCurrentProviderConfig();
  
  // Only Gemini is supported
  return {
    'Content-Type': 'application/json',
  };
}

// Export configuration and helper functions
export {
  API_CONFIG,
  getCurrentProviderConfig,
  validateApiKey,
  getApiHeaders,
};

export default API_CONFIG; 