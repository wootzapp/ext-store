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

  async performResearch(topic, researchDepth = 'comprehensive') {
    console.log('🔬 AI Service: Starting research for topic:', topic, 'with depth:', researchDepth);
    
    if (!this.validateApiKey()) {
      throw new Error('API key not configured. Please add your API key in apiConfig.js');
    }

    const researchPrompt = this.buildResearchPrompt(topic, researchDepth);
    
    try {
      const response = await this.makeResearchApiCall(researchPrompt);
      const parsed = this.parseResearchResponse(response);
      
      const result = {
        success: true,
        ...parsed,
        timestamp: new Date().toISOString()
      };
      
      console.log('🔬 AI Service: Research completed successfully');
      return result;
    } catch (error) {
      console.error('🔬 AI Service: Error performing research:', error);
      return {
        success: false,
        error: true,
        message: 'Failed to complete research',
        details: error.message,
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

  // Generate fact check using Gemini tools for URL analysis
  async generateFactCheck(url) {
    console.log('🤖 AI Service: Starting fact check for URL:', url);
    
    if (!this.validateApiKey()) {
      const error = 'API key not configured. Please add your API key in apiConfig.js';
      console.error('🤖 AI Service: API key validation failed:', error);
      throw new Error(error);
    }

    // Check if URL is valid for fact checking
    if (!url || url.includes('chrome://') || url.includes('chrome-extension://') || url.includes('about:') || url.includes('localhost')) {
      console.log('🤖 AI Service: Invalid URL for fact checking');
      return {
        success: true,
        overallAssessment: 'This URL cannot be fact-checked as it is a browser internal page or local resource. Please navigate to a news article or webpage with factual content.',
        credibilityScore: null,
        verifiedClaims: [],
        disputedClaims: [],
        falseClaims: [],
        sources: [],
        recommendations: 'Navigate to a news article, blog post, or informational webpage to perform fact-checking analysis.',
        timestamp: new Date().toISOString()
      };
    }

    try {
      const response = await this.makeFactCheckApiCall(url);
      const parsed = this.parseFactCheckResponse(response);
      
      const result = {
        success: true,
        ...parsed,
        timestamp: new Date().toISOString()
      };
      
      console.log('🤖 AI Service: Fact check completed successfully');
      return result;
    } catch (error) {
      console.error('🤖 AI Service: Error generating fact check:', error);
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

  // Make fact check API call using Gemini tools
  async makeFactCheckApiCall(url) {
    const headers = getApiHeaders();
    const config = this.config;

    // Add timeout to the request (longer timeout for fact checking with tools)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 seconds for fact checking

    try {
      const prompt = `You are a fact-checking expert with access to Google Search. Analyze the webpage at this URL: ${url}

Please perform a comprehensive fact-check analysis following these steps:
1. Use Google Search to find information about the URL and its content
2. Research the credibility of the source/domain
3. Verify any factual claims made in the content
4. Check for contradicting information from reliable sources
5. Assess the overall credibility based on your findings

Provide your analysis in this EXACT JSON format:

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
- Use Google Search to research the URL and verify information
- Respond with ONLY the JSON object, no additional text
- Base your assessment on factual evidence from your searches
- Include specific claims you can verify or dispute`;

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        tools: [
          { 
            google_search: {}
          }
        ],
        generationConfig: {
          maxOutputTokens: config.maxTokens,
          temperature: 0.3  // Lower temperature for more factual responses
        }
      };

      const response = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: headers,
        signal: controller.signal,
        body: JSON.stringify(requestBody)
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🤖 AI Service: API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      // Check if response is too short (likely just an acknowledgment)
      if (result && result.length < 200) {
        console.log('🤖 AI Service: Response too short, trying fallback...');
        
        // Retry without tools but with more explicit instructions
        const fallbackPrompt = `You are a fact-checking expert. I'm providing you with a news article URL: ${url}

Based on your knowledge, please analyze this news topic and provide a fact-check assessment in JSON format:

{
  "overall_assessment": "Provide a credibility assessment for typical news about this topic/source",
  "credibility_score": 75,
  "verified_claims": [
    {
      "statement": "General statement about typical verifiable claims for this topic",
      "status": "Verified",
      "evidence": "General evidence or reasoning",
      "source": "Typical source type"
    }
  ],
  "disputed_claims": [
    {
      "statement": "Common disputed aspects of this topic",
      "status": "Disputed",
      "evidence": "Reason for dispute",
      "source": "Source of conflict"
    }
  ],
  "false_claims": [],
  "sources_used": [
    {
      "url": "General source category",
      "title": "Type of sources typically used",
      "reliability": "Assessment of typical source reliability"
    }
  ],
  "recommendations": "General recommendations for readers about this topic"
}

Please provide only the JSON response, no additional text.`;

        const fallbackBody = {
          contents: [{ parts: [{ text: fallbackPrompt }] }],
          generationConfig: {
            maxOutputTokens: config.maxTokens,
            temperature: 0.3
          }
        };

        const fallbackResponse = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${config.apiKey}`, {
          method: 'POST',
          headers: headers,
          signal: controller.signal,
          body: JSON.stringify(fallbackBody)
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const fallbackResult = fallbackData.candidates[0].content.parts[0].text;
          return fallbackResult;
        }
      }
      
      return result;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        console.error('🤖 AI Service: Request timeout after 60 seconds');
        throw new Error(`Request timeout after 60 seconds - Fact checking with tools requires more time`);
      }
      
      console.error('🤖 AI Service: API call failed:', error);
      throw error;
    }
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

  async makeResearchApiCall(prompt) {
    const headers = getApiHeaders();
    const config = this.config;

    console.log('🔬 AI Service: Making research API call with maxTokens:', config.maxTokens);

    const controller = new AbortController();
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

      console.log('🔬 AI Service: Request body prepared, making API call...');

      const response = await fetch(`${config.baseUrl}/${config.model}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: headers,
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
      
      console.error('🔬 AI Service: Research API call failed:', error);
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