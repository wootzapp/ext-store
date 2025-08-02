
const API_CONFIG = {
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: 'AIzaSyCoNFODrVovsQEFa4nseHbv0d56eMqhtDU',
    model: 'models/gemini-2.5-flash',
    maxTokens: 32000,
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

  prompts: {
    summary: 'Please provide a concise summary of the following web page content:',
    analysis: 'Please analyze the following web page content and provide key insights:',
    extract: 'Please extract the main points from the following content:',
  }
};

function getCurrentProviderConfig() {
  const provider = API_CONFIG.defaultProvider;
  return API_CONFIG[provider];
}

function validateApiKey(provider = null) {
  const config = provider ? API_CONFIG[provider] : getCurrentProviderConfig();
  return config && config.apiKey && config.apiKey.trim() !== '';
}

function getApiHeaders(provider = null) {
  const config = provider ? API_CONFIG[provider] : getCurrentProviderConfig();
  
  return {
    'Content-Type': 'application/json',
  };
}

export {
  API_CONFIG,
  getCurrentProviderConfig,
  validateApiKey,
  getApiHeaders,
};
  
export default API_CONFIG; 