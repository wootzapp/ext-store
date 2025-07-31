import { API_CONFIG, getCurrentProviderConfig, validateApiKey, getApiHeaders } from './apiConfig.js';

class AIService {
  constructor() {
    this.config = getCurrentProviderConfig();
    this.provider = API_CONFIG.defaultProvider;
  }

  // Validate API key before making requests
  validateApiKey() {
    return validateApiKey(this.provider);
  }

  async generateChatResponse(userMessage) {
    if (!this.validateApiKey()) {
      throw new Error('API key not configured. Please add your API key in apiConfig.js');
    }

    const prompt = this.buildChatPrompt(userMessage);
    
    try {
      const response = await this.makeApiCall(prompt, 'chat');
      return {
        success: true,
        reply: response,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating chat response:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generate page analysis with structured JSON response
  async generatePageAnalysis(url) {
    if (!this.validateApiKey()) {
      throw new Error('API key not configured. Please add your API key in apiConfig.js');
    }

    const prompt = this.buildPageAnalysisPrompt(url);
    
    try {
      const response = await this.makeApiCall(prompt, 'page_analysis');
      const parsed = this.parsePageAnalysisResponse(response);
      return {
        success: true,
        summary: parsed.summary,
        faqs: parsed.faqs,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating page analysis:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Generate summary from text content (kept for backward compatibility)

  // Generate both summary and FAQs in one call
  async generateSummaryAndFAQs(textContent, url = '', title = '') {
    if (!this.validateApiKey()) {
      throw new Error('API key not configured. Please add your API key in apiConfig.js');
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
      throw new Error('API key not configured. Please add your API key in apiConfig.js');
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

  // Build prompt for generic web search responses
  buildSummaryPrompt(textContent, url = '', title = '') {
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

  // Build prompt for chat responses
  buildChatPrompt(userMessage) {
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

  // Make API call using Gemini
  async makeApiCall(prompt, type) {
    const headers = getApiHeaders();
    const config = this.config;

    // Add timeout to the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

    try {
      const response = await this.callGemini(prompt, headers, config, controller.signal);
      
      clearTimeout(timeoutId);
      return response;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timeout after ${config.timeout || 30000}ms`);
      }
      
      throw error;
    }
  }

  // Google Gemini API call
  async callGemini(prompt, headers, config, signal) {
    const response = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${config.apiKey}`, {
      method: 'POST',
      headers: headers,
      signal: signal, // Pass the signal to the fetch API
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
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Parse FAQ response into structured format
  parseFAQResponse(response) {
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

  // Export prompt data as JSON string
  exportPromptData(task, textContent, url = '', title = '') {
    const promptData = this.getPromptData(task, textContent, url, title);
    return JSON.stringify(promptData, null, 2);
  }
}

// Create and export singleton instance
const aiService = new AIService();

export default aiService;
export { AIService };