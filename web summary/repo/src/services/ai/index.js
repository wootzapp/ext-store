/**
 * AI Service for Web Summary Extension
 * 
 * This service handles all AI-related operations including:
 * - Multiple AI provider support (Gemini, OpenAI, Anthropic)
 * - Dynamic configuration management
 * - Research, analysis, and fact-checking
 * - Response parsing and error handling
 */

import { API_CONFIG, getCurrentProviderConfig, CONTENT_CONFIG } from '@/config';
import StorageUtils, { SUPPORTED_MODELS } from '@/storage';

// ==========================================
// CONSTANTS AND CONFIGURATION
// ==========================================

const DEFAULT_TIMEOUTS = {
  quick: 30000,      // 30 seconds
  standard: 120000,  // 2 minutes
  extended: 300000   // 5 minutes
};

const API_ENDPOINTS = {
  gemini: {
    generateContent: (baseUrl, model) => `${baseUrl}/${model}:generateContent`
  },
  openai: {
    chatCompletions: (baseUrl) => `${baseUrl}/chat/completions`,
    models: (baseUrl) => `${baseUrl}/models`
  },
  anthropic: {
    messages: (baseUrl) => `${baseUrl}/messages`
  }
};

// ==========================================
// MAIN AI SERVICE CLASS
// ==========================================

class AIService {
  // ========================================
  // CONSTRUCTOR AND INITIALIZATION
  // ========================================

  constructor() {
    this.config = getCurrentProviderConfig();
    this.provider = API_CONFIG.defaultProvider;
    this.isInitialized = false;
    this.userConfig = null;
    this.requestHistory = [];
  }

  /**
   * Updates the AI service configuration with user's selected model and API key
   * @param {Object} userConfig - User configuration object
   * @returns {Object} Success/error result
   */
  async updateConfiguration(userConfig) {
    try {
      console.log('🤖 AIService: Updating configuration with:', userConfig.modelId);
      
      this.userConfig = userConfig;
      this.provider = userConfig.modelId;
      this.config = userConfig.config;
      this.isInitialized = true;
      
      console.log('🤖 AIService: Configuration updated successfully');
      return { success: true };
    } catch (error) {
      console.error('🤖 AIService: Error updating configuration:', error);
      this.isInitialized = false;
      return { success: false, error: error.message };
    }
  }

  /**
   * Initializes the service with saved user configuration from storage
   * @returns {Object} Success/error result
   */
  async initializeFromStorage() {
    try {
      const savedConfig = await StorageUtils.getCurrentConfig();
      if (savedConfig) {
        await this.updateConfiguration(savedConfig);
        return { success: true };
      } else {
        console.log('🤖 AIService: No saved configuration found');
        return { success: false, error: 'No saved configuration' };
      }
    } catch (error) {
      console.error('🤖 AIService: Error initializing from storage:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Checks if the service is properly configured
   * @returns {boolean} Configuration status
   */
  isConfigured() {
    return this.isInitialized && this.userConfig && this.config && this.config.apiKey;
  }

  /**
   * Validates if API key is properly configured
   * @returns {boolean} Validation result
   */
  validateApiKey() {
    if (!this.isConfigured()) {
      return false;
    }
    return this.config && this.config.apiKey && this.config.apiKey.trim() !== '';
  }

  /**
   * Ensures the service is initialized before operations
   * @throws {Error} If initialization fails
   */
  async ensureInitialized() {
    if (!this.isConfigured()) {
      console.log('🤖 AIService: Not configured, attempting to initialize from storage...');
      const initResult = await this.initializeFromStorage();
      if (!initResult.success) {
        throw new Error('AI service not configured. Please set up your API key and model selection.');
      }
    }
    
    if (!this.validateApiKey()) {
      throw new Error('AI service not configured. Please set up your API key and model selection.');
    }
  }

  // ========================================
  // PUBLIC API METHODS
  // ========================================

  /**
   * Generates a chat response for user messages
   * @param {string} userMessage - User's message
   * @returns {Object} Response object with success status and reply
   */
  async generateChatResponse(userMessage) {
    try {
      await this.ensureInitialized();

      const prompt = this._buildChatPrompt(userMessage);
      
      const response = await this._makeApiCall(prompt, 'chat');
      return this._createSuccessResponse({ reply: response });
    } catch (error) {
      console.error('🤖 AIService: Error generating chat response:', error);
      
      // Return a more informative error response
      if (error.message.includes('not configured')) {
        return this._createErrorResponse('AI service not configured. Please set up your API key and model selection.');
      }
      
      return this._createErrorResponse('Sorry, I encountered an error processing your message. Please try again.');
    }
  }

  /**
   * Performs comprehensive research on a given topic
   * @param {string} topic - Research topic
   * @param {string} researchDepth - Depth level: 'quick', 'comprehensive', 'expert'
   * @param {AbortController} abortController - Optional abort controller
   * @returns {Object} Research results with sources and analysis
   */
  async performResearch(topic, researchDepth = 'comprehensive', abortController = null) {
    console.log('🔬 AIService: Starting research for topic:', topic, 'with depth:', researchDepth);
    
    await this.ensureInitialized();

    const researchPrompt = this._buildResearchPrompt(topic, researchDepth);
    
    try {
      const response = await this._makeResearchApiCall(researchPrompt, abortController);
      const parsed = this._parseResearchResponse(response);
      
      console.log('🔬 AIService: Research completed successfully');
      return this._createSuccessResponse(parsed);
    } catch (error) {
      console.error('🔬 AIService: Error performing research:', error);
      
      if (error.name === 'AbortError') {
        return this._createErrorResponse('Research was cancelled', 'Research was stopped by the user');
      }
      
      return this._createErrorResponse('Failed to complete research', error.message);
    }
  }

  /**
   * Generates page analysis with summary and FAQs
   * @param {string} url - URL to analyze
   * @returns {Object} Analysis results with summary and FAQs
   */
  async generatePageAnalysis(url) {
    await this.ensureInitialized();

    const prompt = this._buildPageAnalysisPrompt(url);
    
    try {
      const response = await this._makeApiCall(prompt, 'page_analysis');
      const parsed = this._parsePageAnalysisResponse(response);
      return this._createSuccessResponse({
        summary: parsed.summary,
        faqs: parsed.faqs
      });
    } catch (error) {
      console.error('🤖 AIService: Error generating page analysis:', error);
      return this._createErrorResponse(error.message);
    }
  }

  /**
   * Generates fact check analysis for a given URL
   * @param {string} url - URL to fact-check
   * @returns {Object} Fact check results with credibility assessment
   */
  async generateFactCheck(url) {
    console.log('🤖 AIService: Starting fact check for URL:', url);
    
    await this.ensureInitialized();

    // Validate URL for fact checking
    if (this._isInvalidFactCheckUrl(url)) {
      console.log('🤖 AIService: Invalid URL for fact checking');
      return this._createSuccessResponse({
        overallAssessment: 'This URL cannot be fact-checked as it is a browser internal page or local resource. Please navigate to a news article or webpage with factual content.',
        credibilityScore: null,
        verifiedClaims: [],
        disputedClaims: [],
        falseClaims: [],
        sources: [],
        recommendations: 'Navigate to a news article, blog post, or informational webpage to perform fact-checking analysis.'
      });
    }

    try {
      const response = await this._makeFactCheckApiCall(url);
      const parsed = this._parseFactCheckResponse(response);
      
      console.log('🤖 AIService: Fact check completed successfully');
      return this._createSuccessResponse(parsed);
    } catch (error) {
      console.error('🤖 AIService: Error generating fact check:', error);
      return this._createErrorResponse(error.message);
    }
  }

  // ========================================
  // LEGACY METHODS (For Backward Compatibility)
  // ========================================

  /**
   * @deprecated Use generatePageAnalysis instead
   * Generates both summary and FAQs in one call
   */
  async generateSummaryAndFAQs(textContent, url = '', title = '') {
    if (!this.validateApiKey()) {
      throw new Error('AI service not configured. Please set up your API key and model selection.');
    }

    const prompt = this.buildCombinedPrompt(textContent, url, title);
    
    try {
      const response = await this.makeApiCall(prompt, 'combined');
      const parsed = this.parseCombinedResponse(response);
      return {
        success: true,
        summary: parsed.summary,
        faqs: parsed.faqs,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating summary and FAQs:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Process only the first 6000 tokens in a single batch
  async processSingleBatch(textContent, url = '', title = '') {
    if (!this.validateApiKey()) {
      throw new Error('AI service not configured. Please set up your API key and model selection.');
    }

    // Limit content to first 6000 tokens (roughly 4500 words)
    const words = textContent.split(/\s+/);
    let limitedContent = '';
    let currentTokenCount = 0;
    const maxTokens = 6000;

    for (const word of words) {
      // Rough estimate: 1 word ≈ 1.3 tokens
      const estimatedTokens = Math.ceil(word.length / 4) + 1;
      
      if (currentTokenCount + estimatedTokens > maxTokens) {
        break;
      }
      
      limitedContent += (limitedContent ? ' ' : '') + word;
      currentTokenCount += estimatedTokens;
    }

    console.log(`Processing single batch of ${currentTokenCount} tokens (${limitedContent.length} characters)`);

    try {
      const result = await this.generateSummaryAndFAQs(limitedContent, url, title);
      
      if (result.success) {
        return {
          success: true,
          summary: result.summary,
          faqs: result.faqs,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: result.error,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error('Error processing single batch:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ========================================
  // PRIVATE HELPER METHODS
  // ========================================

  /**
   * Creates a standardized success response
   * @param {Object} data - Response data
   * @returns {Object} Formatted success response
   */
  _createSuccessResponse(data = {}) {
    return {
      success: true,
      ...data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Creates a standardized error response
   * @param {string} message - Error message
   * @param {string} details - Error details (optional)
   * @returns {Object} Formatted error response
   */
  _createErrorResponse(message, details = null) {
    return {
      success: false,
      error: true,
      message,
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Checks if URL is invalid for fact checking
   * @param {string} url - URL to validate
   * @returns {boolean} True if invalid
   */
  _isInvalidFactCheckUrl(url) {
    if (!url) return true;
    
    const invalidPatterns = [
      'chrome://',
      'chrome-extension://',
      'about:',
      'localhost',
      'file://',
      '127.0.0.1'
    ];
    
    return invalidPatterns.some(pattern => url.includes(pattern));
  }

  // ========================================
  // PROMPT GENERATION - CORE OPERATIONS
  // ========================================

  /**
   * Builds prompt for chat responses
   * @private
   * @param {string} userMessage - User's message
   * @returns {string} Formatted chat prompt
   */
  _buildChatPrompt(userMessage) {
    // Check if this is a page-specific question (contains URL context)
    const isPageQuestion = userMessage.includes('Based on the webpage at') || userMessage.includes('Question:');
    
    if (isPageQuestion) {
      // For page-specific questions, use a more focused prompt
      return `You are a helpful AI assistant specialized in analyzing web content and answering questions about webpages.

${userMessage}

Instructions:
- Provide a clear, accurate answer based on the webpage content mentioned
- If the webpage content doesn't contain enough information to answer the question, explain what additional information would be needed
- Keep your response helpful and concise (2-3 paragraphs maximum)
- Use a professional but friendly tone
- If you cannot access the actual webpage content, provide general guidance about the topic

Please provide a comprehensive answer to the user's question.`;
    } else {
      // For general chat, use the standard prompt
      return `You are a helpful AI assistant. Please respond to the following user message in a helpful, informative, and conversational manner.

User Message: ${userMessage}

Instructions:
- Provide accurate and helpful information
- Keep responses concise but comprehensive
- Use a friendly and conversational tone
- If you're not sure about something, say so
- Be helpful for any type of question or request

Please provide a natural, helpful response to the user's message.`;
    }
  }

  /**
   * Builds comprehensive research prompt
   * @private
   * @param {string} topic - Research topic
   * @param {string} researchDepth - Depth level
   * @returns {string} Formatted research prompt
   */
  _buildResearchPrompt(topic, researchDepth = 'comprehensive') {
    const depthConfig = this._getResearchDepthConfig(researchDepth);
    
    return `RESEARCH TASK: Comprehensive research on "${topic}"

INSTRUCTIONS:
- Research depth: ${researchDepth} (${depthConfig.description})
- Maximum sources: ${depthConfig.maxSources}
- Focus on credible, recent sources (last 5 years preferred)
- Include diverse perspectives and empirical evidence
- Ensure proper JSON formatting with no syntax errors

RESPOND WITH VALID JSON ONLY (no markdown, no extra text):

{
  "research_summary": {
    "topic": "${topic}",
    "overview": "2-3 sentence comprehensive overview",
    "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
    "research_quality": "high|medium|limited"
  },
  "academic_sources": [
    {
      "title": "Academic paper title",
      "authors": ["Author Name"],
      "publication": "Journal/Conference Name",
      "year": 2023,
      "doi_or_url": "DOI or URL",
      "relevance_score": 9,
      "key_contribution": "Main contribution summary",
      "methodology": "Research method used"
    }
  ],
  "credible_articles": [
    {
      "title": "Article title",
      "source": "Publication name",
      "author": "Author name",
      "publication_date": "2023-01-15",
      "url": "https://example.com",
      "credibility_rating": "high|medium|moderate",
      "summary": "Brief article summary under 200 chars",
      "relevant_quotes": ["Key quote 1", "Key quote 2"]
    }
  ],
  "statistical_data": [
    {
      "statistic": "Statistical measure",
      "value": "Numerical value with units",
      "source": "Data source",
      "year": 2023,
      "context": "Context explanation"
    }
  ],
  "expert_opinions": [
    {
      "expert_name": "Expert Name",
      "credentials": "Professional credentials",
      "opinion_summary": "Summary of expert opinion",
      "source": "Source of opinion",
      "stance": "supportive|critical|neutral|mixed"
    }
  ],
  "trending_discussions": [
    {
      "platform": "Platform name",
      "discussion_topic": "Discussion topic",
      "engagement_level": "high|medium|low",
      "key_points": ["Point 1", "Point 2"],
      "sentiment": "positive|negative|neutral|mixed"
    }
  ],
  "research_gaps": ["Gap 1", "Gap 2"],
  "related_topics": ["Topic 1", "Topic 2"],
  "confidence_score": 85
}

CRITICAL: 
- Include ${Math.min(5, depthConfig.maxSources)} academic sources minimum
- Include ${Math.min(5, depthConfig.maxSources)} credible articles minimum  
- Ensure all JSON strings are properly escaped
- No trailing commas in arrays or objects
- All property names must be in double quotes
- Response must be valid, parseable JSON`;
  }

  /**
   * Builds fact-checking analysis prompt
   * @private
   * @param {string} url - URL to fact-check
   * @returns {string} Formatted fact-check prompt
   */
  _buildFactCheckPrompt(url) {
    return `You are a fact-checking expert. Analyze the webpage at this URL: ${url}

Please perform a comprehensive fact-check analysis and provide your analysis in this EXACT JSON format:

{
  "overall_assessment": "Your comprehensive credibility assessment here",
  "credibility_score": 85,
  "verified_claims": [
    {
      "statement": "Specific factual claim that is verified",
      "status": "Verified",
      "evidence": "Supporting evidence for this claim",
      "source": "Source URL or reference"
    }
  ],
  "disputed_claims": [
    {
      "statement": "Specific claim that is disputed",
      "status": "Disputed", 
      "evidence": "Reason why this claim is questionable",
      "source": "Source URL or reference"
    }
  ],
  "false_claims": [
    {
      "statement": "Specific false claim",
      "status": "False",
      "evidence": "Evidence contradicting this claim", 
      "source": "Source URL or reference"
    }
  ],
  "sources_used": [
    {
      "url": "https://example.com/source1",
      "title": "Source Title",
      "reliability": "High/Medium/Low reliability assessment"
    }
  ],
  "recommendations": "Your recommendations for readers"
}

Important: 
- Respond with ONLY the JSON object, no additional text
- Base your assessment on factual evidence and knowledge
- Include specific claims you can verify or dispute`;
  }

  /**
   * Builds page analysis prompt for summary and FAQ generation
   * @private
   * @param {string} url - URL to analyze
   * @returns {string} Formatted page analysis prompt
   */
  _buildPageAnalysisPrompt(url) {
    return `{
  "task": "web_page_faq_analysis",
  "description": "Analyze a web page and generate the 5 most relevant frequently asked questions based on the content",
  "input": {
    "url": "${url}",
    "analysis_focus": [
      "main_content",
      "key_topics",
      "common_user_concerns",
      "product_or_service_details",
      "process_explanations"
    ]
  },
  "instructions": {
    "step_1": "Fetch and analyze the web page content from the provided URL",
    "step_2": "Identify the primary purpose and topic of the webpage",
    "step_3": "Extract key information points that users would commonly ask about",
    "step_4": "Consider typical user pain points and information gaps",
    "step_5": "Generate 5 FAQs that address the most important aspects",
    "step_6": "Create a concise 50-word summary of the page"
  },
  "output_format": {
    "summary": "string - EXACTLY 50 words or less describing the main purpose and content of the webpage",
    "generated_faqs": [
      {
        "id": 1,
        "question": "string - clear, specific question users would ask",
        "answer": "string - comprehensive answer based on webpage content"
      }
    ]
  }
}

IMPORTANT: Please respond with ONLY a JSON object containing the summary and faqs in this exact format:

{
  "summary": "Your 50-word summary here",
  "faqs": [
    {
      "question": "First question?",
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Second question?", 
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Third question?",
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Fourth question?",
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Fifth question?",
      "answer": "Detailed answer based on webpage content"
    }
  ]
}

Do not include any text before or after the JSON response.`;
  }

  // ========================================
  // PROMPT GENERATION - LEGACY OPERATIONS
  // ========================================

  /**
   * Builds prompt for generic web search responses
   * @private
   * @deprecated Use more specific prompt builders
   */
  _buildSummaryPrompt(textContent, url = '', title = '') {
    const promptData = {
      task: "web_search_response",
      instructions: "Provide a helpful and informative response to the user's question or request",
      context: {
        url: url || null,
        title: title || null,
        content: textContent.substring(0, API_CONFIG.content.maxTextLength)
      },
      output_format: {
        type: "text",
        structure: "natural_response"
      }
    };
    
    return `You are a helpful AI assistant. Please respond to the following user message in a helpful, informative, and conversational manner.

User Message: ${textContent.substring(0, API_CONFIG.content.maxTextLength)}

Instructions:
- Provide accurate and helpful information
- Keep responses concise but comprehensive
- Use a friendly and conversational tone
- If you're not sure about something, say so
- Be helpful for any type of question or request

Please provide a natural, helpful response to the user's message.`;
  }

  /**
   * Builds prompt for chat responses
   * @private
   */
  _buildChatPrompt(userMessage) {
    return `You are a helpful AI assistant. Please respond to the following user message in a helpful, informative, and conversational manner.

User Message: ${userMessage}

Instructions:
- Provide accurate and helpful information
- Keep responses concise but comprehensive
- Use a friendly and conversational tone
- If you're not sure about something, say so
- Be helpful for any type of question or request

Please provide a natural, helpful response to the user's message.`;
  }

  // Build prompt for FAQ generation
  buildFAQPrompt(textContent, url = '', title = '') {
    const promptData = {
      task: "generate_faqs",
      instructions: "Generate exactly 5 frequently asked questions with answers",
      context: {
        url: url || null,
        title: title || null,
        content: textContent.substring(0, API_CONFIG.content.maxTextLength)
      },
      output_format: {
        type: "structured",
        structure: "Q&A pairs",
        count: 5
      }
    };
    
    return `Please analyze the following content and generate FAQs.

Content Information:
${url ? `URL: ${url}\n` : ''}${title ? `Title: ${title}\n` : ''}
Content: ${textContent.substring(0, API_CONFIG.content.maxTextLength)}

Task: ${promptData.instructions}

Please format your response exactly as follows:

Q1: [Question]
A1: [Answer]

Q2: [Question]
A2: [Answer]

Q3: [Question]
A3: [Answer]

Q4: [Question]
A4: [Answer]

Q5: [Question]
A5: [Answer]`;
  }

  // Build combined prompt for both summary and FAQs
  buildCombinedPrompt(textContent, url = '', title = '') {
    const promptData = {
      task: "summarize_and_generate_faqs",
      instructions: "Provide both a summary and 5 FAQs",
      context: {
        url: url || null,
        title: title || null,
        content: textContent.substring(0, API_CONFIG.content.maxTextLength)
      },
      output_format: {
        type: "structured",
        sections: ["summary", "faqs"],
        faq_count: 5
      }
    };
    
    return `Please analyze the following content and provide both a summary and FAQs.

Content Information:
${url ? `URL: ${url}\n` : ''}${title ? `Title: ${title}\n` : ''}
Content: ${textContent.substring(0, API_CONFIG.content.maxTextLength)}

Task: ${promptData.instructions}

Please format your response exactly as follows:

SUMMARY:
[Provide a concise summary in 2-3 paragraphs]

FAQS:
Q1: [Question]
A1: [Answer]

Q2: [Question]
A2: [Answer]

Q3: [Question]
A3: [Answer]

Q4: [Question]
A4: [Answer]

Q5: [Question]
A5: [Answer]`;
  }

  // ========================================
  // API COMMUNICATION - CORE METHODS
  // ========================================

  /**
   * Makes API call using configured provider
   * @private
   * @param {string} prompt - Prompt to send
   * @param {string} type - Operation type
   * @param {number} timeout - Custom timeout (optional)
   * @returns {string} API response
   */
  async _makeApiCall(prompt, type, timeout = null) {
    const config = this.config;
    const timeoutMs = timeout || config.timeout || DEFAULT_TIMEOUTS.standard;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response;
      
      switch (this.provider) {
        case 'gemini':
          response = await this._callGeminiAPI(prompt, config, controller.signal, type);
          break;
        case 'openai':
          response = await this._callOpenAIAPI(prompt, config, controller.signal, type);
          break;
        case 'anthropic':
          response = await this._callAnthropicAPI(prompt, config, controller.signal, type);
          break;
        default:
          throw new Error(`Unsupported provider: ${this.provider}`);
      }
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${Math.round(timeoutMs/1000)} seconds`);
      }
      
      throw error;
    }
  }

  /**
   * Makes research API call with specialized handling
   * @private
   * @param {string} prompt - Research prompt
   * @param {AbortController} abortController - Abort controller
   * @returns {string} API response
   */
  async _makeResearchApiCall(prompt, abortController = null) {
    console.log('🔬 AIService: Making research API call...');

    try {
      // For research, we want to ensure JSON output when using Gemini
      if (this.provider === 'gemini') {
        return await this._makeGeminiResearchCall(prompt, abortController);
      } else {
        // For other providers, use the generic call with extended timeout
        const result = await this._makeApiCall(prompt, 'research', DEFAULT_TIMEOUTS.extended);
        console.log('🔬 AIService: Response text length:', result.length);
        return result;
      }
    } catch (error) {
      console.error('🔬 AIService: Research API call failed:', error);
      throw error;
    }
  }

  /**
   * Makes fact check API call with specialized prompt
   * @private
   * @param {string} url - URL to fact-check
   * @returns {string} API response
   */
  async _makeFactCheckApiCall(url) {
    try {
      const prompt = this._buildFactCheckPrompt(url);
      const result = await this._makeApiCall(prompt, 'fact_check');
      return result;
    } catch (error) {
      console.error('🤖 AIService: Fact check API call failed:', error);
      throw error;
    }
  }

  // ========================================
  // API COMMUNICATION - PROVIDER SPECIFIC
  // ========================================

  /**
   * Google Gemini API call - Standard requests
   * @private
   * @param {string} prompt - Prompt to send
   * @param {Object} config - API configuration
   * @param {AbortSignal} signal - Abort signal
   * @param {string} type - Request type
   * @returns {string} API response
   */
  async _callGeminiAPI(prompt, config, signal, type = 'standard') {
    const response = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: config.temperature
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  /**
   * OpenAI API call - Standard requests
   * @private
   * @param {string} prompt - Prompt to send
   * @param {Object} config - API configuration  
   * @param {AbortSignal} signal - Abort signal
   * @param {string} type - Request type
   * @returns {string} API response
   */
  async _callOpenAIAPI(prompt, config, signal, type = 'standard') {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      signal: signal,
      body: JSON.stringify({
        model: config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Anthropic Claude API call - Standard requests
   * @private
   * @param {string} prompt - Prompt to send
   * @param {Object} config - API configuration
   * @param {AbortSignal} signal - Abort signal
   * @param {string} type - Request type
   * @returns {string} API response
   */
  async _callAnthropicAPI(prompt, config, signal, type = 'standard') {
    const response = await fetch(`${config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      signal: signal,
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * Specialized Gemini research call with JSON response mode
   * @private
   * @param {string} prompt - Research prompt
   * @param {AbortController} abortController - Abort controller
   * @returns {string} API response
   */
  async _makeGeminiResearchCall(prompt, abortController = null) {
    const config = this.config;
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUTS.extended); 

    try {
      const requestBody = {
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3, 
          topP: 0.9,
          topK: 40,
          maxOutputTokens: config.maxTokens, 
          responseMimeType: "application/json",
          candidateCount: 1,
          stopSequences: []
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      };

      const response = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔬 AIService: Research API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔬 AIService: Received API response, candidates:', data.candidates?.length);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('🔬 AIService: Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }

      const result = data.candidates[0].content.parts[0].text;
      console.log('🔬 AIService: Response text length:', result.length);
      
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('🔬 AIService: Research request timeout after 5 minutes');
        throw new Error(`Request timeout after 5 minutes - Research requires more time`);
      }
      
      throw error;
    }
  }

  // ========================================
  // LEGACY API METHODS (For Backward Compatibility)
  // ========================================

  /**
   * @deprecated Use _makeFactCheckApiCall instead
   * Makes fact check API call using configured provider
   */
  async makeFactCheckApiCall(url) {
    try {
      const prompt = `You are a fact-checking expert. Analyze the webpage at this URL: ${url}

Please perform a comprehensive fact-check analysis and provide your analysis in this EXACT JSON format:

{
  "overall_assessment": "Your comprehensive credibility assessment here",
  "credibility_score": 85,
  "verified_claims": [
    {
      "statement": "Specific factual claim that is verified",
      "status": "Verified",
      "evidence": "Supporting evidence for this claim",
      "source": "Source URL or reference"
    }
  ],
  "disputed_claims": [
    {
      "statement": "Specific claim that is disputed",
      "status": "Disputed", 
      "evidence": "Reason why this claim is questionable",
      "source": "Source URL or reference"
    }
  ],
  "false_claims": [
    {
      "statement": "Specific false claim",
      "status": "False",
      "evidence": "Evidence contradicting this claim", 
      "source": "Source URL or reference"
    }
  ],
  "sources_used": [
    {
      "url": "https://example.com/source1",
      "title": "Source Title",
      "reliability": "High/Medium/Low reliability assessment"
    }
  ],
  "recommendations": "Your recommendations for readers"
}

Important: 
- Respond with ONLY the JSON object, no additional text
- Base your assessment on factual evidence and knowledge
- Include specific claims you can verify or dispute`;

      // Use the generic makeApiCall method
      const result = await this._makeApiCall(prompt, 'fact_check');
      return result;
      
    } catch (error) {
      console.error('🤖 AI Service: Fact check API call failed:', error);
      throw error;
    }
  }

  // ========================================
  // RESPONSE PARSING - CORE METHODS
  // ========================================

  /**
   * Parses research response into structured format
   * @private
   * @param {string} responseText - Raw API response
   * @returns {Object} Parsed research data
   */
  _parseResearchResponse(responseText) {
    console.log('🔬 AIService: Starting to parse research response, length:', responseText.length);
    
    try {
      let cleanedResponse = responseText.trim();
      
      // Remove markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON boundaries with proper brace counting
      const jsonStart = cleanedResponse.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON object found in response');
      }
      
      let braceCount = 0;
      let jsonEnd = -1;
      let inString = false;
      let escapeNext = false;
      
      for (let i = jsonStart; i < cleanedResponse.length; i++) {
        const char = cleanedResponse[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\' && inString) {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
      }
      
      // Handle incomplete JSON
      if (jsonEnd === -1) {
        const openBraces = (cleanedResponse.match(/{/g) || []).length;
        const closeBraces = (cleanedResponse.match(/}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          console.log('🔬 AIService: Attempting to fix incomplete JSON by adding', missingBraces, 'closing braces');
          cleanedResponse = cleanedResponse + '}'.repeat(missingBraces);
          jsonEnd = cleanedResponse.length - 1;
        } else {
          throw new Error('Could not find complete JSON object');
        }
      }
      
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      
      // Clean up common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') 
        .replace(/\n/g, ' ') 
        .replace(/\r/g, ' ') 
        .replace(/\t/g, ' ') 
        .replace(/  +/g, ' ') 
        .replace(/,(\s*[}\]])/g, '$1') 
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'); 
      
      console.log('🔬 AIService: Cleaned JSON length:', cleanedResponse.length);
      
      const parsedData = JSON.parse(cleanedResponse);
      console.log('🔬 AIService: Successfully parsed JSON data');
      
      const processedResponse = this._processResearchResponse(parsedData);
      
      return processedResponse;
      
    } catch (error) {
      console.error('🔬 AIService: Error parsing research JSON response:', error);
      console.log('🔬 AIService: Raw response length:', responseText.length);
      console.log('🔬 AIService: Raw response preview:', responseText.substring(0, 500) + '...');
      
      const partialData = this._extractPartialResearchData(responseText);
      
      if (partialData.hasData) {
        console.log('🔬 AIService: Using partial data extraction');
        return partialData;
      }
      
      console.log('🔬 AIService: Using fallback data structure');
      return this._createResearchFallback(responseText);
    }
  }

  /**
   * Parses page analysis response 
   * @private
   * @param {string} responseText - Raw API response
   * @returns {Object} Parsed page analysis data
   */
  _parsePageAnalysisResponse(responseText) {
    try {
      // Clean the response text to extract JSON
      let cleanedResponse = responseText.trim();
      
      // Remove any markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON object boundaries
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      // Parse the JSON response
      const parsedData = JSON.parse(cleanedResponse);
      
      // Validate and structure the result
      const result = {
        summary: parsedData.summary || 'Page analysis completed. The content has been processed.',
        faqs: Array.isArray(parsedData.faqs) ? parsedData.faqs.map(faq => ({
          question: faq.question || 'What is this about?',
          answer: faq.answer || 'This relates to the analyzed webpage content.'
        })) : []
      };
      
      // Ensure exactly 5 FAQs
      return this._normalizePageAnalysisFAQs(result);
      
    } catch (error) {
      console.error('🤖 AIService: Error parsing page analysis JSON response:', error);
      console.log('Raw response:', responseText);
      
      // Fallback parsing
      return this._createPageAnalysisFallback();
    }
  }

  /**
   * Parses fact check response
   * @private
   * @param {string} responseText - Raw API response
   * @returns {Object} Parsed fact check data
   */
  _parseFactCheckResponse(responseText) {
    try {
      // Clean the response text to extract JSON
      let cleanedResponse = this._cleanJSONResponse(responseText);
      
      // Parse the JSON response
      const parsedData = JSON.parse(cleanedResponse);
      
      // Structure the result for the UI
      return {
        overallAssessment: parsedData.overall_assessment || 'Fact check completed.',
        credibilityScore: parsedData.credibility_score || null,
        verifiedClaims: Array.isArray(parsedData.verified_claims) ? parsedData.verified_claims : [],
        disputedClaims: Array.isArray(parsedData.disputed_claims) ? parsedData.disputed_claims : [],
        falseClaims: Array.isArray(parsedData.false_claims) ? parsedData.false_claims : [],
        sources: Array.isArray(parsedData.sources_used) ? parsedData.sources_used : [],
        recommendations: parsedData.recommendations || 'Please verify information from multiple sources.',
        rawResponse: responseText
      };
      
    } catch (error) {
      console.error('🤖 AIService: Error parsing JSON fact check response:', error);
      
      // Try improved fallback parsing
      return this._extractFactCheckFallback(responseText);
    }
  }

  // ========================================
  // RESPONSE PARSING - LEGACY METHODS
  // ========================================

  /**
   * @deprecated Use _parsePageAnalysisResponse for FAQ parsing
   * Parses FAQ response into structured format
   */
  _parseFAQResponse(response) {
    const faqs = [];
    const lines = response.split('\n');
    let currentQ = '';
    let currentA = '';

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Q') && trimmedLine.includes(':')) {
        if (currentQ && currentA) {
          faqs.push({ question: currentQ, answer: currentA });
        }
        currentQ = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim();
        currentA = '';
      } else if (trimmedLine.startsWith('A') && trimmedLine.includes(':')) {
        currentA = trimmedLine.substring(trimmedLine.indexOf(':') + 1).trim();
      } else if (currentA && trimmedLine) {
        currentA += ' ' + trimmedLine;
      }
    }

    // Add the last FAQ
    if (currentQ && currentA) {
      faqs.push({ question: currentQ, answer: currentA });
    }

    return faqs.slice(0, 5); // Ensure only 5 FAQs
  }

  // Parse combined response (summary + FAQs)
  parseCombinedResponse(response) {
    const parts = response.split('FAQS:');
    if (parts.length !== 2) {
      throw new Error('Invalid response format');
    }

    const summary = parts[0].replace('SUMMARY:', '').trim();
    const faqText = parts[1].trim();
    const faqs = this.parseFAQResponse(faqText);

    return { summary, faqs };
  }

  // Get current provider info
  getProviderInfo() {
    return {
      provider: 'gemini',
      model: this.config.model,
      hasApiKey: this.validateApiKey()
    };
  }

  // Change provider (only Gemini supported)
  setProvider(provider) {
    if (provider === 'gemini') {
      this.provider = 'gemini';
      this.config = API_CONFIG.gemini;
      return true;
    }
    return false;
  }

  // Get prompt data as JSON for debugging or external use
  getPromptData(task, textContent, url = '', title = '') {
    const baseData = {
      task: task,
      context: {
        url: url || null,
        title: title || null,
        content_length: textContent.length,
        content_preview: textContent.substring(0, 200) + '...'
      },
      provider: this.provider,
      model: this.config.model,
      timestamp: new Date().toISOString()
    };

    switch (task) {
      case 'summary':
        return {
          ...baseData,
          instructions: "Provide a clear, concise summary in 2-3 paragraphs",
          output_format: {
            type: "text",
            structure: "paragraphs"
          }
        };
      
      case 'faq':
        return {
          ...baseData,
          instructions: "Generate exactly 5 frequently asked questions with answers",
          output_format: {
            type: "structured",
            structure: "Q&A pairs",
            count: 5
          }
        };
      
      case 'combined':
        return {
          ...baseData,
          instructions: "Provide both a summary and 5 FAQs",
          output_format: {
            type: "structured",
            sections: ["summary", "faqs"],
            faq_count: 5
          }
        };
      
      default:
        return baseData;
    }
  }

  /**
   * Gets research depth configuration
   * @private
   * @param {string} depth - Research depth level
   * @returns {Object} Depth configuration
   */
  _getResearchDepthConfig(depth) {
    const configs = {
      'quick': {
        maxSources: 5,
        description: 'Quick overview with essential sources'
      },
      'comprehensive': {
        maxSources: 10,
        description: 'Balanced research with good source variety'
      },
      'expert': {
        maxSources: 15,
        description: 'Expert-level research with specialized sources'
      }
    };
    return configs[depth] || configs['comprehensive'];
  }

  // ========================================
  // RESPONSE PARSING - UTILITY HELPERS
  // ========================================

  /**
   * Cleans JSON response text by removing markdown and extracting valid JSON
   * @private
   * @param {string} responseText - Raw response text
   * @returns {string} Cleaned JSON string
   */
  _cleanJSONResponse(responseText) {
    let cleanedResponse = responseText.trim();
    
    // Remove any markdown code blocks if present
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Find JSON object boundaries more carefully
    const jsonStart = cleanedResponse.indexOf('{');
    if (jsonStart === -1) {
      throw new Error('No JSON object found in response');
    }
    
    // Find the matching closing brace by counting braces
    let braceCount = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < cleanedResponse.length; i++) {
      if (cleanedResponse[i] === '{') {
        braceCount++;
      } else if (cleanedResponse[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i;
          break;
        }
      }
    }
    
    if (jsonEnd === -1) {
      // Try to find a reasonable stopping point
      jsonEnd = cleanedResponse.lastIndexOf('}');
      if (jsonEnd === -1) {
        throw new Error('No complete JSON object found');
      }
    }
    
    cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
    
    // Try to fix common JSON issues
    cleanedResponse = cleanedResponse
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
      .replace(/\\"/g, '"') // Fix escaped quotes
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\r/g, ' ') // Replace carriage returns
      .replace(/\t/g, ' ') // Replace tabs
      .replace(/  +/g, ' ') // Replace multiple spaces with single space
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    return cleanedResponse;
  }

  /**
   * Normalizes page analysis FAQs to ensure exactly 5 items
   * @private
   * @param {Object} result - Page analysis result
   * @returns {Object} Normalized result with exactly 5 FAQs
   */
  _normalizePageAnalysisFAQs(result) {
    // Ensure we have exactly 5 FAQs
    if (result.faqs.length < 5) {
      const defaultFaqs = [
        { question: "What is this page about?", answer: "This page contains content that has been analyzed by AI." },
        { question: "What are the main topics covered?", answer: "The page covers various topics as analyzed from the webpage content." },
        { question: "Who is the target audience?", answer: "The content appears to be designed for users interested in the page's subject matter." },
        { question: "What can I learn from this page?", answer: "This page provides information relevant to its main topic and purpose." },
        { question: "How reliable is this information?", answer: "The information comes from the analyzed webpage content." }
      ];
      
      // Fill missing FAQs with defaults
      while (result.faqs.length < 5) {
        const defaultIndex = result.faqs.length;
        if (defaultIndex < defaultFaqs.length) {
          result.faqs.push(defaultFaqs[defaultIndex]);
        } else {
          result.faqs.push({
            question: `Additional question ${defaultIndex + 1}?`,
            answer: "This relates to the content analyzed from the webpage."
          });
        }
      }
    } else if (result.faqs.length > 5) {
      // Limit to exactly 5 FAQs
      result.faqs = result.faqs.slice(0, 5);
    }
    
    return result;
  }

  /**
   * Creates a fallback page analysis result
   * @private
   * @returns {Object} Fallback page analysis data
   */
  _createPageAnalysisFallback() {
    return {
      summary: 'Page analysis completed. The content has been processed.',
      faqs: [
        { question: "What is this page about?", answer: "This page contains content that has been analyzed by AI." },
        { question: "What are the main topics covered?", answer: "The page covers various topics as analyzed from the webpage content." },
        { question: "Who is the target audience?", answer: "The content appears to be designed for users interested in the page's subject matter." },
        { question: "What can I learn from this page?", answer: "This page provides information relevant to its main topic and purpose." },
        { question: "How reliable is this information?", answer: "The information comes from the analyzed webpage content." }
      ]
    };
  }

  /**
   * Extracts fact check data using fallback parsing
   * @private
   * @param {string} responseText - Raw response text
   * @returns {Object} Extracted fact check data
   */
  _extractFactCheckFallback(responseText) {
    try {
      // Extract credibility score if mentioned
      const credibilityMatch = responseText.match(/['""]credibility_score['""]:\s*(\d+)/i);
      const credibilityScore = credibilityMatch ? parseInt(credibilityMatch[1]) : null;
      
      // Extract overall assessment
      const assessmentMatch = responseText.match(/['""]overall_assessment['""]:\s*['""]([^'"]*)['"]/i);
      const overallAssessment = assessmentMatch ? assessmentMatch[1] : 'Fact check completed. The response contains detailed analysis.';
      
      return {
        rawResponse: responseText,
        overallAssessment: overallAssessment,
        credibilityScore: credibilityScore,
        verifiedClaims: [],
        disputedClaims: [],
        falseClaims: [],
        sources: [],
        recommendations: 'Please review the full response below for complete details.'
      };
      
    } catch (fallbackError) {
      console.error('🤖 AIService: Fallback parsing also failed:', fallbackError);
      
      // Final fallback: return raw response
      return {
        rawResponse: responseText,
        overallAssessment: 'Fact check completed. Please review the detailed analysis below.',
        credibilityScore: null,
        verifiedClaims: [],
        disputedClaims: [],
        falseClaims: [],
        sources: [],
        recommendations: 'Please verify information from multiple sources.'
      };
    }
  }

  /**
   * Processes research response with metadata
   * @private
   * @param {Object} rawResponse - Raw parsed research data
   * @returns {Object} Processed research response
   */
  _processResearchResponse(rawResponse) {
    const processedResponse = {
      ...rawResponse,
      metadata: {
        generated_at: new Date().toISOString(),
        total_sources: (rawResponse.academic_sources?.length || 0) + (rawResponse.credible_articles?.length || 0),
        quality_indicators: {
          has_peer_reviewed: rawResponse.academic_sources?.some(source => source.doi_or_url?.includes('doi')) || false,
          source_diversity: this._calculateSourceDiversity(rawResponse),
          average_recency: this._calculateAverageRecency(rawResponse)
        }
      }
    };

    if (processedResponse.academic_sources) {
      processedResponse.academic_sources.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    }

    return processedResponse;
  }

  /**
   * Extracts partial research data from malformed responses
   * @private
   * @param {string} responseText - Raw response text
   * @returns {Object} Partial research data
   */
  _extractPartialResearchData(responseText) {
    const result = {
      research_summary: {
        topic: 'Research Topic',
        overview: 'Partial data extracted from response.',
        key_findings: [],
        research_quality: 'limited'
      },
      academic_sources: [],
      credible_articles: [],
      statistical_data: [],
      expert_opinions: [],
      trending_discussions: [],
      research_gaps: [],
      related_topics: [],
      confidence_score: 40,
      hasData: false
    };

    try {
      const summaryMatch = responseText.match(/"research_summary":\s*{[^}]*"topic":\s*"([^"]*)"[^}]*"overview":\s*"([^"]*)"[^}]*}/);
      if (summaryMatch) {
        result.research_summary.topic = summaryMatch[1];
        result.research_summary.overview = summaryMatch[2];
        result.hasData = true;
      }

      const confidenceMatch = responseText.match(/"confidence_score":\s*(\d+)/);
      if (confidenceMatch) {
        result.confidence_score = parseInt(confidenceMatch[1]);
        result.hasData = true;
      }

      return result;
      
    } catch (error) {
      console.error('🔬 AIService: Error in partial data extraction:', error);
      return { hasData: false };
    }
  }

  /**
   * Creates a research fallback response
   * @private
   * @param {string} responseText - Raw response text
   * @returns {Object} Fallback research data
   */
  _createResearchFallback(responseText) {
    return {
      research_summary: {
        topic: 'Research Topic',
        overview: 'Research analysis completed. The response was too large or malformed, but processing succeeded.',
        key_findings: ['Large response processed', 'Data extraction attempted', 'Partial results may be available'],
        research_quality: 'limited'
      },
      academic_sources: [],
      credible_articles: [],
      statistical_data: [],
      expert_opinions: [],
      trending_discussions: [],
      research_gaps: [],
      related_topics: [],
      confidence_score: 30,
      rawResponse: responseText,
      error: 'JSON parsing failed, using fallback structure'
    };
  }

  /**
   * Calculates source diversity score
   * @private
   * @param {Object} response - Research response
   * @returns {number} Diversity score
   */
  _calculateSourceDiversity(response) {
    const sourceTypes = new Set();
    if (response.academic_sources?.length) sourceTypes.add('academic');
    if (response.credible_articles?.length) sourceTypes.add('articles');
    if (response.statistical_data?.length) sourceTypes.add('data');
    if (response.expert_opinions?.length) sourceTypes.add('expert');
    return sourceTypes.size;
  }

  /**
   * Calculates average recency of sources
   * @private
   * @param {Object} response - Research response
   * @returns {number|null} Average years since publication
   */
  _calculateAverageRecency(response) {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    response.academic_sources?.forEach(source => {
      if (source.year) years.push(source.year);
    });
    
    if (years.length === 0) return null;
    
    const avgYear = years.reduce((sum, year) => sum + year, 0) / years.length;
    return Math.round(currentYear - avgYear);
  }

  // ========================================
  // EXISTING METHODS (TO BE REFACTORED)
  // ========================================

  // Build prompt for page analysis
  buildPageAnalysisPrompt(url) {
    return `{
  "task": "web_page_faq_analysis",
  "description": "Analyze a web page and generate the 5 most relevant frequently asked questions based on the content",
  "input": {
    "url": "${url}",
    "analysis_focus": [
      "main_content",
      "key_topics",
      "common_user_concerns",
      "product_or_service_details",
      "process_explanations"
    ]
  },
  "instructions": {
    "step_1": "Fetch and analyze the web page content from the provided URL",
    "step_2": "Identify the primary purpose and topic of the webpage",
    "step_3": "Extract key information points that users would commonly ask about",
    "step_4": "Consider typical user pain points and information gaps",
    "step_5": "Generate 5 FAQs that address the most important aspects",
    "step_6": "Create a concise 50-word summary of the page"
  },
  "output_format": {
    "summary": "string - EXACTLY 50 words or less describing the main purpose and content of the webpage",
    "webpage_analysis": {
      "url": "${url}",
      "title": "string",
      "main_topic": "string",
      "key_themes": ["array", "of", "themes"],
      "content_type": "string (e.g., product page, blog post, service description)"
    },
    "generated_faqs": [
      {
        "id": 1,
        "question": "string - clear, specific question users would ask",
        "answer": "string - comprehensive answer based on webpage content",
        "relevance_score": "number (1-10)",
        "source_section": "string - which part of webpage this addresses"
      },
      {
        "id": 2,
        "question": "string",
        "answer": "string",
        "relevance_score": "number (1-10)",
        "source_section": "string"
      },
      {
        "id": 3,
        "question": "string",
        "answer": "string",
        "relevance_score": "number (1-10)",
        "source_section": "string"
      },
      {
        "id": 4,
        "question": "string",
        "answer": "string",
        "relevance_score": "number (1-10)",
        "source_section": "string"
      },
      {
        "id": 5,
        "question": "string",
        "answer": "string",
        "relevance_score": "number (1-10)",
        "source_section": "string"
      }
    ]
  },
  "quality_criteria": {
    "summary_requirements": [
      "Exactly 50 words or less",
      "Captures main purpose and key content",
      "Clear and concise"
    ],
    "questions_should_be": [
      "Naturally worded as real users would ask",
      "Specific to the webpage content",
      "Cover different aspects of the topic",
      "Address common user concerns or confusion",
      "Ranked by importance and relevance"
    ],
    "answers_should_be": [
      "Based directly on webpage content",
      "Clear and comprehensive",
      "Actionable when applicable",
      "Free of assumptions not supported by the content"
    ]
  },
  "constraints": {
    "max_faqs": 5,
    "summary_length": "Maximum 50 words",
    "answer_length": "50-200 words per answer",
    "focus_on_content": "Only use information present on the webpage",
    "avoid_speculation": "Do not infer information not explicitly stated"
  }
}

IMPORTANT: Please respond with ONLY a JSON object containing the summary and faqs in this exact format:

{
  "summary": "Your 50-word summary here",
  "faqs": [
    {
      "question": "First question?",
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Second question?", 
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Third question?",
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Fourth question?",
      "answer": "Detailed answer based on webpage content"
    },
    {
      "question": "Fifth question?",
      "answer": "Detailed answer based on webpage content"
    }
  ]
}

Do not include any text before or after the JSON response.`;
  }

  // Parse page analysis response
  parsePageAnalysisResponse(responseText) {
    try {
      // Clean the response text to extract JSON
      let cleanedResponse = responseText.trim();
      
      // Remove any markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON object boundaries
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }
      
      // Parse the JSON response
      const parsedData = JSON.parse(cleanedResponse);
      
      // Validate the structure
      const result = {
        summary: parsedData.summary || 'Page analysis completed. The content has been processed.',
        faqs: Array.isArray(parsedData.faqs) ? parsedData.faqs.map(faq => ({
          question: faq.question || 'What is this about?',
          answer: faq.answer || 'This relates to the analyzed webpage content.'
        })) : []
      };
      
      // Ensure we have exactly 5 FAQs
      if (result.faqs.length < 5) {
        const defaultFaqs = [
          { question: "What is this page about?", answer: "This page contains content that has been analyzed by AI." },
          { question: "What are the main topics covered?", answer: "The page covers various topics as analyzed from the webpage content." },
          { question: "Who is the target audience?", answer: "The content appears to be designed for users interested in the page's subject matter." },
          { question: "What can I learn from this page?", answer: "This page provides information relevant to its main topic and purpose." },
          { question: "How reliable is this information?", answer: "The information comes from the analyzed webpage content." }
        ];
        
        // Fill missing FAQs with defaults
        while (result.faqs.length < 5) {
          const defaultIndex = result.faqs.length;
          if (defaultIndex < defaultFaqs.length) {
            result.faqs.push(defaultFaqs[defaultIndex]);
          } else {
            result.faqs.push({
              question: `Additional question ${defaultIndex + 1}?`,
              answer: "This relates to the content analyzed from the webpage."
            });
          }
        }
      } else if (result.faqs.length > 5) {
        // Limit to exactly 5 FAQs
        result.faqs = result.faqs.slice(0, 5);
      }
      
      return result;
      
    } catch (error) {
      console.error('Error parsing page analysis JSON response:', error);
      console.log('Raw response:', responseText);
      
      // Fallback parsing
      return {
        summary: 'Page analysis completed. The content has been processed.',
        faqs: [
          { question: "What is this page about?", answer: "This page contains content that has been analyzed by AI." },
          { question: "What are the main topics covered?", answer: "The page covers various topics as analyzed from the webpage content." },
          { question: "Who is the target audience?", answer: "The content appears to be designed for users interested in the page's subject matter." },
          { question: "What can I learn from this page?", answer: "This page provides information relevant to its main topic and purpose." },
          { question: "How reliable is this information?", answer: "The information comes from the analyzed webpage content." }
        ]
      };
    }
  }

  // Parse fact check response
  parseFactCheckResponse(responseText) {
    try {
      // Clean the response text to extract JSON
      let cleanedResponse = responseText.trim();
      
      // Remove any markdown code blocks if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Find JSON object boundaries more carefully
      const jsonStart = cleanedResponse.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON object found in response');
      }
      
      // Find the matching closing brace by counting braces
      let braceCount = 0;
      let jsonEnd = -1;
      for (let i = jsonStart; i < cleanedResponse.length; i++) {
        if (cleanedResponse[i] === '{') {
          braceCount++;
        } else if (cleanedResponse[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            jsonEnd = i;
            break;
          }
        }
      }
      
      if (jsonEnd === -1) {
        // Try to find a reasonable stopping point
        jsonEnd = cleanedResponse.lastIndexOf('}');
        if (jsonEnd === -1) {
          throw new Error('No complete JSON object found');
        }
      }
      
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      
      // Try to fix common JSON issues
      cleanedResponse = cleanedResponse
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
        .replace(/\\"/g, '"') // Fix escaped quotes
        .replace(/\n/g, ' ') // Replace newlines with spaces
        .replace(/\r/g, ' ') // Replace carriage returns
        .replace(/\t/g, ' ') // Replace tabs
        .replace(/  +/g, ' ') // Replace multiple spaces with single space
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      // Parse the JSON response
      const parsedData = JSON.parse(cleanedResponse);
      
      // Structure the result for the UI
      const result = {
        overallAssessment: parsedData.overall_assessment || 'Fact check completed.',
        credibilityScore: parsedData.credibility_score || null,
        verifiedClaims: Array.isArray(parsedData.verified_claims) ? parsedData.verified_claims : [],
        disputedClaims: Array.isArray(parsedData.disputed_claims) ? parsedData.disputed_claims : [],
        falseClaims: Array.isArray(parsedData.false_claims) ? parsedData.false_claims : [],
        sources: Array.isArray(parsedData.sources_used) ? parsedData.sources_used : [],
        recommendations: parsedData.recommendations || 'Please verify information from multiple sources.',
        rawResponse: responseText // Keep raw response as fallback
      };

      return result;
      
    } catch (error) {
      console.error('🤖 AI Service: Error parsing JSON fact check response:', error);
      
      // Improved fallback: try to extract useful information even if JSON is malformed
      try {
        // Extract credibility score if mentioned
        const credibilityMatch = responseText.match(/['""]credibility_score['""]:\s*(\d+)/i);
        const credibilityScore = credibilityMatch ? parseInt(credibilityMatch[1]) : null;
        
        // Extract overall assessment
        const assessmentMatch = responseText.match(/['""]overall_assessment['""]:\s*['""]([^'"]*)['"]/i);
        const overallAssessment = assessmentMatch ? assessmentMatch[1] : 'Fact check completed. The response contains detailed analysis.';
        
        // Extract verified claims
        const verifiedClaimsSection = responseText.match(/['""]verified_claims['""]:\s*\[(.*?)\]/s);
        let verifiedClaims = [];
        if (verifiedClaimsSection) {
          try {
            const claimsText = verifiedClaimsSection[1];
            // Simple extraction of statements
            const statements = claimsText.match(/['""]statement['""]:\s*['""]([^'"]*)['"]/g);
            if (statements) {
              verifiedClaims = statements.map(statement => {
                const match = statement.match(/['""]statement['""]:\s*['""]([^'"]*)['"]/);
                return {
                  statement: match ? match[1] : 'Verified claim found',
                  status: 'Verified',
                  evidence: 'Evidence available in full response',
                  source: 'Source details in full response'
                };
              });
            }
          } catch (e) {
            // Could not extract verified claims
          }
        }
        
        return {
          rawResponse: responseText,
          overallAssessment: overallAssessment,
          credibilityScore: credibilityScore,
          verifiedClaims: verifiedClaims,
          disputedClaims: [],
          falseClaims: [],
          sources: [],
          recommendations: 'Please review the full response below for complete details.'
        };
        
      } catch (fallbackError) {
        console.error('🤖 AI Service: Fallback parsing also failed:', fallbackError);
        
        // Final fallback: return raw response
        return {
          rawResponse: responseText,
          overallAssessment: 'Fact check completed. Please review the detailed analysis below.',
          credibilityScore: null,
          verifiedClaims: [],
          disputedClaims: [],
          falseClaims: [],
          sources: [],
          recommendations: 'Please verify information from multiple sources.'
        };
      }
    }
  }

  // Helper method to extract claim status
  extractClaimStatus(claim) {
    const lowerClaim = claim.toLowerCase();
    if (lowerClaim.includes('verified') || lowerClaim.includes('confirmed') || lowerClaim.includes('accurate')) {
      return 'Verified';
    } else if (lowerClaim.includes('false') || lowerClaim.includes('incorrect') || lowerClaim.includes('debunked')) {
      return 'False';
    } else if (lowerClaim.includes('disputed') || lowerClaim.includes('questionable') || lowerClaim.includes('unclear')) {
      return 'Disputed';
    }
    return 'Under Review';
  }

  // Helper method to extract evidence from claim text
  extractEvidence(claim) {
    // Look for evidence indicators
    const evidencePattern = /(?:evidence|source|according to|study shows|research indicates)[:\s]*([^.!?]*[.!?])/i;
    const match = claim.match(evidencePattern);
    return match ? match[1].trim() : '';
  }

  // Helper method to extract URL title from surrounding text
  extractUrlTitle(text, url) {
    const urlIndex = text.indexOf(url);
    if (urlIndex === -1) return '';
    
    // Look for title before the URL (within 100 characters)
    const beforeUrl = text.substring(Math.max(0, urlIndex - 100), urlIndex);
    const titleMatch = beforeUrl.match(/([^\\n]{10,50})\\s*$/);
    
    return titleMatch ? titleMatch[1].trim() : '';
  }

  // Export prompt data as JSON string
  exportPromptData(task, textContent, url = '', title = '') {
    const promptData = this.getPromptData(task, textContent, url, title);
    return JSON.stringify(promptData, null, 2);
  }

  buildResearchPrompt(topic, researchDepth = 'comprehensive') {
    const depthConfig = this.getResearchDepthConfig(researchDepth);
    
    const prompt = `RESEARCH TASK: Comprehensive research on "${topic}"

INSTRUCTIONS:
- Research depth: ${researchDepth} (${depthConfig.description})
- Maximum sources: ${depthConfig.maxSources}
- Focus on credible, recent sources (last 5 years preferred)
- Include diverse perspectives and empirical evidence
- Ensure proper JSON formatting with no syntax errors

RESPOND WITH VALID JSON ONLY (no markdown, no extra text):

{
  "research_summary": {
    "topic": "${topic}",
    "overview": "2-3 sentence comprehensive overview",
    "key_findings": ["Finding 1", "Finding 2", "Finding 3"],
    "research_quality": "high|medium|limited"
  },
  "academic_sources": [
    {
      "title": "Academic paper title",
      "authors": ["Author Name"],
      "publication": "Journal/Conference Name",
      "year": 2023,
      "doi_or_url": "DOI or URL",
      "relevance_score": 9,
      "key_contribution": "Main contribution summary",
      "methodology": "Research method used"
    }
  ],
  "credible_articles": [
    {
      "title": "Article title",
      "source": "Publication name",
      "author": "Author name",
      "publication_date": "2023-01-15",
      "url": "https://example.com",
      "credibility_rating": "high|medium|moderate",
      "summary": "Brief article summary under 200 chars",
      "relevant_quotes": ["Key quote 1", "Key quote 2"]
    }
  ],
  "statistical_data": [
    {
      "statistic": "Statistical measure",
      "value": "Numerical value with units",
      "source": "Data source",
      "year": 2023,
      "context": "Context explanation"
    }
  ],
  "expert_opinions": [
    {
      "expert_name": "Expert Name",
      "credentials": "Professional credentials",
      "opinion_summary": "Summary of expert opinion",
      "source": "Source of opinion",
      "stance": "supportive|critical|neutral|mixed"
    }
  ],
  "trending_discussions": [
    {
      "platform": "Platform name",
      "discussion_topic": "Discussion topic",
      "engagement_level": "high|medium|low",
      "key_points": ["Point 1", "Point 2"],
      "sentiment": "positive|negative|neutral|mixed"
    }
  ],
  "research_gaps": ["Gap 1", "Gap 2"],
  "related_topics": ["Topic 1", "Topic 2"],
  "confidence_score": 85
}

CRITICAL: 
- Include ${Math.min(5, depthConfig.maxSources)} academic sources minimum
- Include ${Math.min(5, depthConfig.maxSources)} credible articles minimum  
- Ensure all JSON strings are properly escaped
- No trailing commas in arrays or objects
- All property names must be in double quotes
- Response must be valid, parseable JSON`;

    return prompt;
  }

  async makeResearchApiCall(prompt, abortController = null) {
    console.log('🔬 AI Service: Making research API call...');

    try {
      // For research, we want to ensure JSON output when using Gemini
      if (this.provider === 'gemini') {
        return await this.makeGeminiResearchCall(prompt, abortController);
      } else {
        // For other providers, use the generic call
        const result = await this.makeApiCall(prompt, 'research');
        console.log('🔬 AI Service: Response text length:', result.length);
        return result;
      }
    } catch (error) {
      console.error('🔬 AI Service: Research API call failed:', error);
      throw error;
    }
  }

  // Specialized Gemini research call with JSON response mode
  async makeGeminiResearchCall(prompt, abortController = null) {
    const config = this.config;
    const controller = abortController || new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); 

    try {
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3, 
          topP: 0.9,
          topK: 40,
          maxOutputTokens: config.maxTokens, 
          responseMimeType: "application/json",
          candidateCount: 1,
          stopSequences: []
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH", 
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_ONLY_HIGH"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_ONLY_HIGH"
          }
        ]
      };

      const response = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔬 AI Service: Research API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('🔬 AI Service: Received API response, candidates:', data.candidates?.length);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('🔬 AI Service: Invalid API response structure:', data);
        throw new Error('Invalid API response structure');
      }

      const result = data.candidates[0].content.parts[0].text;
      console.log('🔬 AI Service: Response text length:', result.length);
      
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('🔬 AI Service: Research request timeout after 120 seconds');
        throw new Error(`Request timeout after 120 seconds - Research requires more time`);
      }
      
      throw error;
    }
  }

  parseResearchResponse(responseText) {
    console.log('🔬 AI Service: Starting to parse research response, length:', responseText.length);
    
    try {
      let cleanedResponse = responseText.trim();
      
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      const jsonStart = cleanedResponse.indexOf('{');
      if (jsonStart === -1) {
        throw new Error('No JSON object found in response');
      }
      
      let braceCount = 0;
      let jsonEnd = -1;
      let inString = false;
      let escapeNext = false;
      
      for (let i = jsonStart; i < cleanedResponse.length; i++) {
        const char = cleanedResponse[i];
        
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        
        if (char === '\\' && inString) {
          escapeNext = true;
          continue;
        }
        
        if (char === '"' && !escapeNext) {
          inString = !inString;
          continue;
        }
        
        if (!inString) {
          if (char === '{') {
            braceCount++;
          } else if (char === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
      }
      
      if (jsonEnd === -1) {
        const openBraces = (cleanedResponse.match(/{/g) || []).length;
        const closeBraces = (cleanedResponse.match(/}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          console.log('🔬 AI Service: Attempting to fix incomplete JSON by adding', missingBraces, 'closing braces');
          cleanedResponse = cleanedResponse + '}'.repeat(missingBraces);
          jsonEnd = cleanedResponse.length - 1;
        } else {
          throw new Error('Could not find complete JSON object');
        }
      }
      
      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      
      cleanedResponse = cleanedResponse
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') 
        .replace(/\n/g, ' ') 
        .replace(/\r/g, ' ') 
        .replace(/\t/g, ' ') 
        .replace(/  +/g, ' ') 
        .replace(/,(\s*[}\]])/g, '$1') 
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":'); 
      
      console.log('🔬 AI Service: Cleaned JSON length:', cleanedResponse.length);
      
      const parsedData = JSON.parse(cleanedResponse);
      console.log('🔬 AI Service: Successfully parsed JSON data');
      
      const processedResponse = this.processResearchResponse(parsedData);
      
      return processedResponse;
      
    } catch (error) {
      console.error('🔬 AI Service: Error parsing research JSON response:', error);
      console.log('🔬 AI Service: Raw response length:', responseText.length);
      console.log('🔬 AI Service: Raw response preview:', responseText.substring(0, 500) + '...');
      
      const partialData = this.extractPartialResearchData(responseText);
      
      if (partialData.hasData) {
        console.log('🔬 AI Service: Using partial data extraction');
        return partialData;
      }
      
      console.log('🔬 AI Service: Using fallback data structure');
      return {
        research_summary: {
          topic: 'Research Topic',
          overview: 'Research analysis completed. The response was too large or malformed, but processing succeeded.',
          key_findings: ['Large response processed', 'Data extraction attempted', 'Partial results may be available'],
          research_quality: 'limited'
        },
        academic_sources: [],
        credible_articles: [],
        statistical_data: [],
        expert_opinions: [],
        trending_discussions: [],
        research_gaps: [],
        related_topics: [],
        confidence_score: 30,
        rawResponse: responseText,
        error: 'JSON parsing failed, using fallback structure'
      };
    }
  }

  extractPartialResearchData(responseText) {
    const result = {
      research_summary: {
        topic: 'Research Topic',
        overview: 'Partial data extracted from response.',
        key_findings: [],
        research_quality: 'limited'
      },
      academic_sources: [],
      credible_articles: [],
      statistical_data: [],
      expert_opinions: [],
      trending_discussions: [],
      research_gaps: [],
      related_topics: [],
      confidence_score: 40,
      hasData: false
    };

    try {
      const summaryMatch = responseText.match(/"research_summary":\s*{[^}]*"topic":\s*"([^"]*)"[^}]*"overview":\s*"([^"]*)"[^}]*}/);
      if (summaryMatch) {
        result.research_summary.topic = summaryMatch[1];
        result.research_summary.overview = summaryMatch[2];
        result.hasData = true;
      }

      const academicMatch = responseText.match(/"academic_sources":\s*\[(.*?)\]/s);
      if (academicMatch) {
        const sourceMatches = academicMatch[1].match(/"title":\s*"([^"]*)"[^}]*"authors":\s*\[([^\]]*)\][^}]*"publication":\s*"([^"]*)"[^}]*"year":\s*(\d+)/g);
        if (sourceMatches) {
          sourceMatches.slice(0, 5).forEach(match => {
            const titleMatch = match.match(/"title":\s*"([^"]*)"/);
            const publicationMatch = match.match(/"publication":\s*"([^"]*)"/);
            const yearMatch = match.match(/"year":\s*(\d+)/);
            
            if (titleMatch && publicationMatch) {
              result.academic_sources.push({
                title: titleMatch[1],
                authors: ['Author extracted'],
                publication: publicationMatch[1],
                year: yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear(),
                relevance_score: 7,
                key_contribution: 'Data extracted from partial response',
                methodology: 'Extracted from response'
              });
              result.hasData = true;
            }
          });
        }
      }

      const articlesMatch = responseText.match(/"credible_articles":\s*\[(.*?)\]/s);
      if (articlesMatch) {
        const articleMatches = articlesMatch[1].match(/"title":\s*"([^"]*)"[^}]*"source":\s*"([^"]*)"[^}]*"author":\s*"([^"]*)"/g);
        if (articleMatches) {
          articleMatches.slice(0, 5).forEach(match => {
            const titleMatch = match.match(/"title":\s*"([^"]*)"/);
            const sourceMatch = match.match(/"source":\s*"([^"]*)"/);
            const authorMatch = match.match(/"author":\s*"([^"]*)"/);
            
            if (titleMatch && sourceMatch) {
              result.credible_articles.push({
                title: titleMatch[1],
                source: sourceMatch[1],
                author: authorMatch ? authorMatch[1] : 'Author extracted',
                publication_date: 'Recently published',
                credibility_rating: 'medium',
                summary: 'Article extracted from partial response data.',
                relevant_quotes: []
              });
              result.hasData = true;
            }
          });
        }
      }

      const confidenceMatch = responseText.match(/"confidence_score":\s*(\d+)/);
      if (confidenceMatch) {
        result.confidence_score = parseInt(confidenceMatch[1]);
        result.hasData = true;
      }

      return result;
      
    } catch (error) {
      console.error('🔬 AI Service: Error in partial data extraction:', error);
      return { hasData: false };
    }
  }

  processResearchResponse(rawResponse) {
    const processedResponse = {
      ...rawResponse,
      metadata: {
        generated_at: new Date().toISOString(),
        total_sources: (rawResponse.academic_sources?.length || 0) + (rawResponse.credible_articles?.length || 0),
        quality_indicators: {
          has_peer_reviewed: rawResponse.academic_sources?.some(source => source.doi_or_url?.includes('doi')) || false,
          source_diversity: this.calculateSourceDiversity(rawResponse),
          average_recency: this.calculateAverageRecency(rawResponse)
        }
      }
    };

    if (processedResponse.academic_sources) {
      processedResponse.academic_sources.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
    }

    return processedResponse;
  }

  calculateSourceDiversity(response) {
    const sourceTypes = new Set();
    if (response.academic_sources?.length) sourceTypes.add('academic');
    if (response.credible_articles?.length) sourceTypes.add('articles');
    if (response.statistical_data?.length) sourceTypes.add('data');
    if (response.expert_opinions?.length) sourceTypes.add('expert');
    return sourceTypes.size;
  }

  calculateAverageRecency(response) {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    response.academic_sources?.forEach(source => {
      if (source.year) years.push(source.year);
    });
    
    if (years.length === 0) return null;
    
    const avgYear = years.reduce((sum, year) => sum + year, 0) / years.length;
    return Math.round(currentYear - avgYear);
  }

  getResearchDepthConfig(depth) {
    const configs = {
      'quick': {
        maxSources: 5,
        description: 'Quick overview with essential sources'
      },
      'comprehensive': {
        maxSources: 10,
        description: 'Balanced research with good source variety'
      },
      'expert': {
        maxSources: 15,
        description: 'Expert-level research with specialized sources'
      }
    };
    return configs[depth] || configs['comprehensive'];
  }
}
            
const aiService = new AIService();

export default aiService;
export { AIService };