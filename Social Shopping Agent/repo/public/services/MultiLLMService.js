/* global chrome */

const API_BASE_URL = 'https://nextjs-app-410940835135.us-central1.run.app/api';

export class MultiLLMService {
    constructor(config = {}) {
      this.config = config;
      console.log('🤖 Universal LLM Service initialized with provider:', this.config.aiProvider || 'anthropic');
    }

    // Helper function to get cached user data with fallback to API
    async getCachedUserData() {
      // Get cached user data instead of making API call
      const cachedUserData = await new Promise((resolve) => {
        chrome.storage.local.get(['userAuth', 'authData'], (result) => {
          // Prefer userAuth (from ProfilePage) as it contains both user and organizations
          if (result.userAuth && result.userAuth.user && result.userAuth.organizations) {
            resolve(result.userAuth);
          } else if (result.authData && result.authData.user) {
            // If only authData is available, we need to fetch organizations
            resolve(result.authData);
          } else {
            resolve(null);
          }
        });
      });

      // If no cached user data found at all, throw error (don't make API call)
      if (!cachedUserData || !cachedUserData.user) {
        throw new Error('Cached user data not found. Please refresh your session.');
      }

      // Check if we have complete cached data (user + organizations)
      let organizations = cachedUserData.organizations;
      if (!organizations) {
        console.log('⚠️ Organizations not cached, making API call to /user/...');
        const userResponse = await fetch(`${API_BASE_URL}/user/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to get user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        organizations = userData.organizations || [];
        
        // Cache the complete data for future use to prevent future API calls
        await new Promise((resolve) => {
          chrome.storage.local.set({
            userAuth: {
              user: cachedUserData.user,
              organizations: organizations
            }
          }, resolve);
        });
        console.log('✅ Cached complete user data for future requests');
      } else {
        console.log('✅ Using cached user data (no API call needed)');
      }

      return {
        user: cachedUserData.user,
        organizations: organizations
      };
    }

    // Capture screenshot using Wootz API
    async captureScreenshot() {
      try {
        console.log('📸 Capturing screenshot using chrome.wootz.captureScreenshot()...');
        
        // // First highlight elements with debug mode
        // console.log('🔍 Highlighting elements with debug mode...');
        // await new Promise((resolve) => {
        //   chrome.wootz.getPageState({
        //     debugMode: true,
        //     includeHidden: true
        //   }, (result) => {
        //     if (result.success) {
        //       console.log('✅ Elements highlighted successfully');
        //     } else {
        //       console.log('⚠️ Element highlighting failed:', result.error);
        //     }
        //     resolve();
        //   });
        // });
        
        // // Wait a moment for highlighting to complete
        // await new Promise(resolve => setTimeout(resolve, 500));
        
        // Capture screenshot using the API: chrome.wootz.captureScreenshot()
        const screenshotResult = await chrome.wootz.captureScreenshot();
        
        if (screenshotResult && screenshotResult.success && screenshotResult.dataUrl) {
          console.log(`✅ Screenshot captured: ~${Math.round(screenshotResult.dataUrl.length * 0.75 / 1024)}KB`);
          console.log('🔍 Screenshot dataUrl:', screenshotResult.dataUrl);
          return screenshotResult.dataUrl;
        } else {
          console.log('❌ Screenshot capture failed:', screenshotResult?.error || 'No dataUrl returned');
          return null;
        }
      } catch (error) {
        console.error('❌ Screenshot capture error:', error);
        return null;
      }
    }
  
    getModelName(provider, agentType = 'planner') {
      const configuredModel = agentType === 'navigator' ? this.config.navigatorModel : 
                             agentType === 'planner' ? this.config.plannerModel :
                             agentType === 'validator' ? this.config.validatorModel : null;
  
      if (configuredModel && this.isModelValidForProvider(configuredModel, provider)) {
        return configuredModel;
      }
  
      const defaultModels = {
        'anthropic': {
          'navigator': 'claude-3-5-sonnet-20241022',
          'planner': 'claude-3-5-sonnet-20241022',
          'validator': 'claude-3-haiku-20240307'
        },
        'openai': {
          'navigator': 'gpt-4o',
          'planner': 'gpt-4o',
          'validator': 'gpt-4o-mini'
        },
        'gemini': {
          'navigator': 'gemini-2.5-flash',
          'planner': 'gemini-2.5-flash',
          'validator': 'gemini-2.5-flash'
        },
        'geminiGenerate': {
          'navigator': 'gemini-2.5-flash',
          'planner': 'gemini-2.5-flash',
          'validator': 'gemini-2.5-flash',
          'chat': 'gemini-2.5-flash'
        }
      };
      
      return defaultModels[provider]?.[agentType] || defaultModels[provider]?.['navigator'] || 'gemini-1.5-pro';
    }
  
    isModelValidForProvider(model, provider) {
      const modelProviderMap = {
        'claude-3-7-sonnet-20250219': 'anthropic',
        'claude-3-5-sonnet-20241022': 'anthropic',
        'claude-3-5-haiku-20241022': 'anthropic',
        'claude-3-sonnet-20240229': 'anthropic', 
        'claude-3-haiku-20240307': 'anthropic',
        'claude-3-opus-20240229': 'anthropic',
        'o1-preview': 'openai',
        'o1-mini': 'openai',
        'gpt-4o': 'openai',
        'gpt-4o-mini': 'openai',
        'gpt-4-turbo': 'openai',
        'gpt-4': 'openai',
        'gpt-3.5-turbo': 'openai',
        'gemini-2.5-flash': 'gemini',
        'gemini-2.5-pro': 'gemini',
        'gemini-2.0-flash': 'gemini',
        'gemini-1.5-pro': 'gemini',
        'gemini-1.5-flash': 'gemini'
      };
      
      // For llmGenerate provider, all models are valid
      if (provider === 'llmGenerate' || provider === 'geminiGenerate') {
        return true;
      }
      
      return modelProviderMap[model] === provider;
    }
  
    async call(messages, options = {}, agentType = 'planner') {
      return await this.callForAgent(messages, options, agentType);
    }
  
    async callForAgent(messages, options = {}, agentType = 'navigator') {
      const provider = await this.determineProvider(false);
      const modelName = this.getModelName(provider, agentType);
      
      console.log(`🎯 DEBUG: Agent Provider=${provider}, AgentType=${agentType}, ModelName=${modelName}`);
      
      const hasApiKey = this.checkApiKey(provider);
      if (!hasApiKey) {
        throw new Error(`${provider} API key not configured. Please add your API key in settings.`);
      }
      
      try {
        // Always capture screenshot for agent calls
        const screenshot = await this.captureScreenshot();
        console.log('📩📫 Messages', messages);
        return await this.callProvider(provider, messages, { ...options, model: modelName, screenshot });
      } catch (error) {
        console.error(`❌ ${provider} failed:`, error);
        throw error;
      }
    }
  
    async determineProvider(forChat = false) {
      // Check if user prefers personal API
      const userPreference = await this.getUserAPIPreference();
      
      // If user prefers personal API, check for personal API keys
      if (userPreference) {
        const activeProvider = this.config.aiProvider || 'gemini';
        
        // Check if the active provider has a valid API key
        switch (activeProvider) {
          case 'anthropic':
            if (this.config.anthropicApiKey) {
              return 'anthropic';
            }
            break;
          case 'openai':
            if (this.config.openaiApiKey) {
              return 'openai';
            }
            break;
          case 'gemini':
            if (this.config.geminiApiKey) {
              return 'gemini';
            }
            break;
          default:
            console.log('No valid personal API key found, falling back to DeepHUD API');
        }
        
        // If no valid personal API key found, fall back to DeepHUD API
        console.warn('Personal API preferred but no valid API key found, falling back to DeepHUD API');
      }
      
      // Use DeepHUD API (when toggle is OFF or no personal API keys)
      return 'llmGenerate';
    }
  
    checkApiKey(provider) {
      switch (provider) {
        case 'anthropic':
          return !!this.config.anthropicApiKey;
        case 'openai':
          return !!this.config.openaiApiKey;
        case 'gemini':
          return !!this.config.geminiApiKey;
        case 'llmGenerate':
          return true; // Always valid for llmGenerate
        case 'geminiGenerate':
          return true; // Legacy support 
        default:
          return false;
      }
    }
  
    async callProvider(provider, messages, options) {
      switch (provider) {
        case 'anthropic':
          return await this.callAnthropic(messages, options);
        case 'openai':
          return await this.callOpenAI(messages, options);
        case 'gemini':
          return await this.callGemini(messages, options);
        case 'llmGenerate':
            return await this.callLlmGenerate(messages, options);
        case 'geminiGenerate':
            return await this.callLlmGenerate(messages, options); // Map legacy to new
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    }
  
    async callAnthropic(messages, options = {}) {
      if (!this.config.anthropicApiKey) {
        throw new Error('Anthropic API key not configured');
      }
  
      const model = options.model || 'claude-3-5-sonnet-20241022';
      console.log(`🔥 Calling Anthropic with model: ${model}`);
  
      // Prepare messages with screenshot if available
      let processedMessages = [...messages];
      
      if (options.screenshot) {
        // For Anthropic, add screenshot as a separate message with image content
        const screenshotMessage = {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: options.screenshot.split(',')[1] // Remove data URL prefix
              }
            },
            {
              type: 'text',
              text: 'This is a screenshot of the current web page with highlighted interactive elements. Use this visual context along with the text prompt to provide accurate responses.'
            }
          ]
        };
        
        // Insert screenshot message before the last user message
        const lastUserIndex = processedMessages.findLastIndex(msg => msg.role === 'user');
        if (lastUserIndex !== -1) {
          processedMessages.splice(lastUserIndex, 0, screenshotMessage);
        } else {
          processedMessages.unshift(screenshotMessage);
        }
      }
  
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.config.anthropicApiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: model,
          max_tokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.4,
          messages: processedMessages
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      return data.content[0].text;
    }
  
    async callOpenAI(messages, options = {}) {
      if (!this.config.openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }
  
      const model = options.model || 'gpt-4o';
      console.log(`🔥 Calling OpenAI with model: ${model}`);
  
      // Prepare messages with screenshot if available
      let processedMessages = [...messages];
      
      if (options.screenshot) {
        // For OpenAI, add screenshot as a separate message with image content
        const screenshotMessage = {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: options.screenshot
              }
            },
            {
              type: 'text',
              text: 'This is a screenshot of the current web page with highlighted interactive elements. Use this visual context along with the text prompt to provide accurate responses.'
            }
          ]
        };
        
        // Insert screenshot message before the last user message
        const lastUserIndex = processedMessages.findLastIndex(msg => msg.role === 'user');
        if (lastUserIndex !== -1) {
          processedMessages.splice(lastUserIndex, 0, screenshotMessage);
        } else {
          processedMessages.unshift(screenshotMessage);
        }
      }
  
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: processedMessages,
          max_tokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.4
        })
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
    }
  
    async callGemini(messages, options = {}) {
      if (!this.config.geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }
  
      const model = options.model || 'gemini-1.5-pro';
      console.log(`🔥 Calling Gemini with model: ${model}`);
  
      // Prepare messages with screenshot if available
      let processedMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));
      
      if (options.screenshot) {
        // For Gemini, add screenshot as inline_data in the first user message
        if (processedMessages.length > 0 && processedMessages[0].role === 'user') {
          const base64Data = options.screenshot.split(',')[1]; // Remove data URL prefix
          processedMessages[0].parts.unshift({
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data
            }
          });
        } else {
          // Create a new user message with screenshot
          const base64Data = options.screenshot.split(',')[1];
          processedMessages.unshift({
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data
                }
              },
              {
                text: 'This is a screenshot of the current web page with highlighted interactive elements. Use this visual context along with the text prompt to provide accurate responses.'
              }
            ]
          });
        }
      }
  
      const requestBody = {
        contents: processedMessages,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 4000,
          temperature: options.temperature || 0.4
        }
      };
  
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.geminiApiKey}`, 
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        }
      );
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
  
      const data = await response.json();
      console.log('🔍 Raw Gemini response:', JSON.stringify(data, null, 2));
      
      // Handle empty or incomplete responses
      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Empty response from Gemini API');
      }
  
      const candidate = data.candidates[0];
      
      // Handle MAX_TOKENS case
      if (candidate.finishReason === 'MAX_TOKENS') {
        throw new Error('Response exceeded maximum token limit. Try breaking down the task into smaller steps.');
      }
  
      // Handle empty content
      if (!candidate.content || !candidate.content.parts || !candidate.content.parts[0]) {
        throw new Error('Incomplete response from Gemini API - missing content parts');
      }
  
      // Handle missing text
      if (!candidate.content.parts[0].text) {
        throw new Error('Incomplete response from Gemini API - missing text content');
      }
  
      return candidate.content.parts[0].text;
    }
  
    async callLlmGenerate(messages, options = {}) {
      try {
        console.log('🤖 Calling DeepHUD LLM API...');
        
        // Get cached user data with fallback to API if needed
        const { user, organizations } = await this.getCachedUserData();
        
        if (organizations.length === 0) {
          throw new Error('No organizations found. Please create an organization first.');
        }

        // Use the user's selected organization or the first active one
        const activeOrg = organizations.find(org => org.id === user?.selectedOrganizationId) || 
                         organizations.find(org => org.isActive) || 
                         organizations[0];

        // Get the last user message as prompt
        const lastUserMessage = messages.findLast(msg => msg.role === 'user');
        if (!lastUserMessage) {
          throw new Error('No user message found in messages array');
        }

        // Prepare request body for direct response mode (no clientId for streaming)
        const requestBody = {
          prompt: lastUserMessage.content,
          orgId: activeOrg.id
        };

        // Add screenshot if provided in options
        if (options.screenshot) {
          // Convert data URL to base64 if needed
          let imageData = options.screenshot;
          if (imageData.startsWith('data:image/')) {
            imageData = imageData.split(',')[1]; // Remove data URL prefix
          }
          
          requestBody.imageData = imageData;
          requestBody.imageMimeType = 'image/jpeg'; // Default to JPEG
        }

        // Start AI chat session in direct response mode (no clientId)
        const chatResponse = await fetch(`${API_BASE_URL}/streamMobile/startChat/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(requestBody)
        });

        if (!chatResponse.ok) {
          const errorText = await chatResponse.text();
          throw new Error(`Failed to start chat: ${chatResponse.status} - ${errorText}`);
        }

        const chatData = await chatResponse.json();
        
        // Return the direct response (not streaming)
        if (chatData.success && chatData.response) {
          return chatData.response;
        } else {
          throw new Error('No response received from AI service');
        }
        
      } catch (error) {
        console.error('❌ DeepHUD LLM API error:', error);
        throw error;
      }
    }

    async getAuthData() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['authData'], (result) => {
          resolve(result.authData || null);
        });
      });
    }

    async saveAuthData(authData) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ authData }, () => {
          resolve();
        });
      });
    }

    async getUserAPIPreference() {
      return new Promise((resolve) => {
        chrome.storage.local.get(['userPreferPersonalAPI'], (result) => {
          resolve(result.userPreferPersonalAPI || false);
        });
      });
    }
  }