import BrowserClaudeClient from './claudeClient';
import BrowserOpenAIClient from './openaiClient';
import BrowserGeminiClient from './geminiClient';

class AIClientFactory {
  static createClient(model, apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }

    switch (model) {
      case 'claude':
        return new BrowserClaudeClient(apiKey);
      case 'openai':
        return new BrowserOpenAIClient(apiKey);
      case 'gemini':
        return new BrowserGeminiClient(apiKey);
      default:
        throw new Error(`Unsupported AI model: ${model}`);
    }
  }

  static getSupportedModels() {
    return [
      { value: 'claude', label: 'Anthropic Claude', description: 'Claude 3 Sonnet - Advanced reasoning and analysis' },
      { value: 'openai', label: 'OpenAI GPT', description: 'GPT-4 - Creative and versatile text generation' },
      { value: 'gemini', label: 'Google Gemini', description: 'Gemini 2.0 Flash - Fast and efficient AI model' }
    ];
  }

  static validateApiKey(model, apiKey) {
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
  }

  static getApiKeyPlaceholder(model) {
    switch (model) {
      case 'claude':
        return 'Enter your Anthropic API key (sk-ant-...)';
      case 'openai':
        return 'Enter your OpenAI API key (sk-...)';
      case 'gemini':
        return 'Enter your Google API key (AIza...)';
      default:
        return 'Enter your API key';
    }
  }

  static getApiKeyHelpUrl(model) {
    switch (model) {
      case 'claude':
        return 'https://console.anthropic.com/';
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'gemini':
        return 'https://makersuite.google.com/app/apikey';
      default:
        return '';
    }
  }
}

export default AIClientFactory; 