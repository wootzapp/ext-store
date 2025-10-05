
/**
 * API Configuration for Wootz AI Extension
 * 
 * This module provides configuration constants and utilities for API requests,
 * content processing, and rate limiting. It works alongside the dynamic
 * configuration system in storageUtils.js.
 */

// ==========================================
// LEGACY CONFIGURATION (Deprecated)
// ==========================================
// Note: This legacy config is kept for backward compatibility
// The new dynamic configuration system is in storageUtils.js

const LEGACY_API_CONFIG = {
    gemini: {
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
      apiKey: '', // Empty - now managed by storageUtils
      model: 'models/gemini-2.5-flash',
      maxTokens: 32000,
      temperature: 0.7,
      timeout: 120000,
    },
    defaultProvider: 'gemini',
  };
  
  // ==========================================
  // CONTENT PROCESSING CONFIGURATION
  // ==========================================
  
  /**
   * Configuration for content processing and extraction
   */
  export const CONTENT_CONFIG = {
    // Maximum text length for processing
    maxTextLength: 20000,
    
    // Method for truncating long content
    truncateMethod: 'smart', // 'smart' | 'simple' | 'sentence'
    
    // Include URL in processing context
    includeUrl: true,
    
    // Include page title in processing context
    includeTitle: true,
    
    // Minimum content length to process
    minContentLength: 100,
    
    // Maximum words per processing batch
    maxWordsPerBatch: 4500,
  };
  
  // ==========================================
  // RATE LIMITING CONFIGURATION
  // ==========================================
  
  /**
   * Rate limiting configuration for API requests
   */
  export const RATE_LIMIT_CONFIG = {
    // Maximum requests per minute (per provider)
    maxRequestsPerMinute: 60,
    
    // Maximum requests per hour (per provider)
    maxRequestsPerHour: 1000,
    
    // Maximum requests per day (per provider)
    maxRequestsPerDay: 10000,
    
    // Timeout between retries (milliseconds)
    retryDelay: 1000,
    
    // Maximum number of retries
    maxRetries: 3,
  };
  
  // ==========================================
  // PROMPT TEMPLATES
  // ==========================================
  
  /**
   * Standard prompt templates for different AI tasks
   */
  export const PROMPT_TEMPLATES = {
    // Summary generation
    summary: 'Please provide a concise summary of the following web page content:',
    
    // Content analysis
    analysis: 'Please analyze the following web page content and provide key insights:',
    
    // Key points extraction
    extract: 'Please extract the main points from the following content:',
    
    // FAQ generation
    faq: 'Generate frequently asked questions based on the following content:',
    
    // Fact checking
    factCheck: 'Please fact-check the following content and provide verification:',
    
    // Research assistance
    research: 'Conduct comprehensive research on the following topic:',
  };
  
  // ==========================================
  // REQUEST CONFIGURATION
  // ==========================================
  
  /**
   * Default configuration for API requests
   */
  export const REQUEST_CONFIG = {
    // Default timeout for all requests (milliseconds)
    defaultTimeout: 120000, // 2 minutes
    
    // Quick timeout for simple requests (milliseconds)
    quickTimeout: 30000, // 30 seconds
    
    // Extended timeout for complex operations (milliseconds)
    extendedTimeout: 300000, // 5 minutes
    
    // Default headers for all requests
    defaultHeaders: {
      'Content-Type': 'application/json',
      'User-Agent': 'WebSummary-Extension/1.0',
    },
    
    // Response size limits
    maxResponseSize: 1048576, // 1MB
  };
  
  // ==========================================
  // LEGACY FUNCTIONS (Deprecated)
  // ==========================================
  // These functions are kept for backward compatibility
  // New code should use the dynamic configuration system
  
  /**
   * @deprecated Use StorageUtils.getCurrentConfig() instead
   * Gets the current provider configuration
   */
  export function getCurrentProviderConfig() {
    console.warn('⚠️ getCurrentProviderConfig is deprecated. Use StorageUtils.getCurrentConfig() instead.');
    const provider = LEGACY_API_CONFIG.defaultProvider;
    return LEGACY_API_CONFIG[provider];
  }
  
  /**
   * @deprecated Use StorageUtils.isSetupCompleted() instead
   * Validates if an API key is configured
   */
  export function validateApiKey(provider = null) {
    console.warn('⚠️ validateApiKey is deprecated. Use StorageUtils.isSetupCompleted() instead.');
    const config = provider ? LEGACY_API_CONFIG[provider] : getCurrentProviderConfig();
    return config && config.apiKey && config.apiKey.trim() !== '';
  }
  
  /**
   * @deprecated Use provider-specific headers in aiService.js instead
   * Gets API headers for requests
   */
  export function getApiHeaders(provider = null) {
    console.warn('⚠️ getApiHeaders is deprecated. Use provider-specific headers in aiService.js instead.');
    return REQUEST_CONFIG.defaultHeaders;
  }
  
  // ==========================================
  // UTILITY FUNCTIONS
  // ==========================================
  
  /**
   * Gets the appropriate timeout based on operation type
   * @param {string} operationType - Type of operation: 'quick' | 'default' | 'extended'
   * @returns {number} Timeout in milliseconds
   */
  export function getTimeoutForOperation(operationType = 'default') {
    switch (operationType) {
      case 'quick':
        return REQUEST_CONFIG.quickTimeout;
      case 'extended':
        return REQUEST_CONFIG.extendedTimeout;
      case 'default':
      default:
        return REQUEST_CONFIG.defaultTimeout;
    }
  }
  
  /**
   * Gets the appropriate prompt template
   * @param {string} taskType - Type of AI task
   * @returns {string} Prompt template
   */
  export function getPromptTemplate(taskType) {
    return PROMPT_TEMPLATES[taskType] || PROMPT_TEMPLATES.summary;
  }
  
  /**
   * Checks if content length is within processing limits
   * @param {string} content - Content to check
   * @returns {boolean} Whether content is within limits
   */
  export function isContentWithinLimits(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }
    
    return (
      content.length >= CONTENT_CONFIG.minContentLength &&
      content.length <= CONTENT_CONFIG.maxTextLength
    );
  }
  
  /**
   * Truncates content based on configuration
   * @param {string} content - Content to truncate
   * @param {number} maxLength - Maximum length (optional)
   * @returns {string} Truncated content
   */
  export function truncateContent(content, maxLength = CONTENT_CONFIG.maxTextLength) {
    if (!content || content.length <= maxLength) {
      return content;
    }
    
    switch (CONTENT_CONFIG.truncateMethod) {
      case 'smart':
        // Try to truncate at last complete sentence
        const smartTruncated = content.substring(0, maxLength);
        const lastSentence = smartTruncated.lastIndexOf('.');
        return lastSentence > maxLength * 0.8 
          ? smartTruncated.substring(0, lastSentence + 1)
          : smartTruncated + '...';
          
      case 'sentence':
        // Truncate at last complete sentence
        const sentences = content.split('.');
        let result = '';
        for (const sentence of sentences) {
          if ((result + sentence + '.').length > maxLength) {
            break;
          }
          result += sentence + '.';
        }
        return result || content.substring(0, maxLength) + '...';
        
      case 'simple':
      default:
        return content.substring(0, maxLength) + '...';
    }
  }
  
  // ==========================================
  // EXPORTS
  // ==========================================
  
  // Legacy export for backward compatibility
  export const API_CONFIG = LEGACY_API_CONFIG;
  
  // Default export (legacy)
  export default {
    ...LEGACY_API_CONFIG,
    content: CONTENT_CONFIG,
    rateLimit: RATE_LIMIT_CONFIG,
    prompts: PROMPT_TEMPLATES,
    request: REQUEST_CONFIG,
  }; 