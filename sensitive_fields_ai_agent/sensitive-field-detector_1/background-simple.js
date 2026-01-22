// Enhanced Background Script with AI Integration
console.log('🔧 Background script starting...');
console.log('🆔 Extension ID:', chrome.runtime.id);

// Embedded AI configuration - Updated to latest Gemini API endpoint
const GEMINI_API_KEY = 'AIzaSyCoNFODrVovsQEFa4nseHbv0d56eMqhtDU';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

// Track processed elements to avoid duplicates
const processedElements = new Set();

// Initialize extension state on startup
chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Extension startup detected');
  initializeExtensionState();
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('🎯 Extension installed');
  initializeExtensionState();
});

function initializeExtensionState() {
  // Ensure default state exists
  chrome.storage.sync.get(['extensionEnabled'], (result) => {
    if (result.extensionEnabled === undefined) {
      console.log('🔧 No existing state found, setting default to enabled');
      chrome.storage.sync.set({ extensionEnabled: true }, () => {
        console.log('✅ Default state set to enabled');
      });
    } else {
      console.log('✅ Existing state found:', result.extensionEnabled);
    }
  });
}

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message);
  console.log('👤 Message sender:', sender);
  
  if (message.action === 'getState') {
    console.log('🔍 Processing getState request...');
    chrome.storage.sync.get(['extensionEnabled'], (result) => {
      const enabled = result.extensionEnabled !== undefined ? result.extensionEnabled : true;
      console.log('📤 Sending state response:', { enabled });
      sendResponse({ enabled });
    });
    return true; // Keep message channel open
  }
  
  if (message.action === 'setState') {
    console.log('🔧 Processing setState request, enabled:', message.enabled);
    chrome.storage.sync.set({ extensionEnabled: message.enabled }, () => {
      if (chrome.runtime.lastError) {
        console.error('❌ Error saving state:', chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        console.log('✅ Extension state saved:', message.enabled);
        sendResponse({ success: true });
      }
    });
    return true;
  }
  
  if (message.action === 'analyzeElements') {
    handleAIAnalysis(message.elements, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'analyzeDOMStructure') {
    handleDOMAnalysis(message, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'analyzeViewportDOM') {
    handleViewportDOMAnalysis(message, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'analyzeBatchDOM') {
    handleBatchDOMAnalysis(message, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'analyzeCompleteDOM') {
    handleCompleteDOMAnalysis(message, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.action === 'testAPIKey') {
    testGeminiAPI(sendResponse);
    return true;
  }
  
  if (message.action === 'analyzeCompletePageContent') {
    console.log('🤖 Complete page content analysis requested');
    handleCompletePageAnalysis(message.data, sendResponse);
    return true;
  }
  
  if (message.action === 'analyzeRawDOM') {
    console.log('🔍 Processing analyzeRawDOM request...');
    analyzeRawDOMWithGemini(message.rawDOM, message.pageInfo)
      .then(result => {
        console.log('✅ Raw DOM analysis completed, sending response');
        
        // Extract selectors from AI response and send to browser for masking
        if (result.success && result.sensitiveFields && result.sensitiveFields.length > 0) {
          const selectors = result.sensitiveFields.map(field => field.selector);
          console.log('🎯 Extracted selectors for masking:', selectors);
          console.log('📊 Summary: Extracted', selectors.length, 'selectors from', result.sensitiveFields.length, 'AI-detected sensitive fields');
          
          // Send selectors directly to browser using the maskSensitiveElements API
          try {
            console.log('🔍 Debugging tab ID - message.sender:', message.sender);
            console.log('🔍 Debugging tab ID - sender:', sender);
            
            // Get the tab ID from the sender or use the active tab
            const tabId = message.sender?.tab?.id || sender?.tab?.id;
            console.log('🔍 Extracted tab ID:', tabId);
            
            if (!tabId) {
              console.warn('⚠️ No tab ID available, trying to get active tab...');
              // Get the active tab as fallback
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                console.log('🔍 Found tabs:', tabs);
                if (tabs && tabs[0]) {
                  console.log('✅ Using active tab ID:', tabs[0].id);
                  executeMaskingScript(tabs[0].id, selectors, 'legacy-detection');
                } else {
                  console.error('❌ Could not find active tab for masking');
                }
              });
            } else {
              console.log('✅ Using sender tab ID:', tabId);
              executeMaskingScript(tabId, selectors, 'legacy-detection');
            }
          } catch (error) {
            console.warn('⚠️ Error executing masking script:', error);
          }
        } else {
          console.log('ℹ️ No sensitive fields detected, no masking required');
        }
        
        sendResponse(result);
      })
      .catch(error => {
        console.error('❌ Raw DOM analysis failed:', error);
        sendResponse({
          success: false,
          error: error.message,
          sensitiveFields: []
        });
      });
    return true; // Keep message channel open
  }
});

async function handleCompletePageAnalysis(analysisPayload, sendResponse) {
  const analysisStartTime = Date.now();
  console.log('🤖 Starting complete page content analysis for sensitive information detection');
  
  try {
    const { pageInfo, completeDOM, detectedElements } = analysisPayload;
    
    console.log('📊 Analysis payload:', {
      url: pageInfo.url,
      domElements: completeDOM.length,
      preDetectedElements: detectedElements.length
    });
    
    // Create comprehensive prompt for Gemini
    const analysisPrompt = createCompletePageAnalysisPrompt(pageInfo, completeDOM, detectedElements);
    
    console.log('🔤 Sending analysis prompt to Gemini (length:', analysisPrompt.length, 'chars)');
    
    // Send to Gemini for analysis
    const geminiResponse = await callGeminiAPI(analysisPrompt);
    
    if (geminiResponse && geminiResponse.success) {
      console.log('✅ Gemini analysis completed successfully');
      
      // Parse Gemini response for detected sensitive elements
      const aiDetectedElements = parseGeminiSensitiveContentResponse(geminiResponse.data, completeDOM);
      
      console.log(`🧠 AI detected ${aiDetectedElements.length} additional sensitive elements`, {
        analysisTime: Date.now() - analysisStartTime + 'ms'
      });
      
      sendResponse({
        success: true,
        detectedElements: aiDetectedElements,
        newDetections: aiDetectedElements.length,
        enhancedClassifications: detectedElements.length,
        analysisTime: Date.now() - analysisStartTime
      });
      
    } else {
      console.warn('⚠️ Gemini analysis failed');
      sendResponse({
        success: false,
        error: 'Gemini analysis failed',
        detectedElements: []
      });
    }
    
  } catch (error) {
    console.error('❌ Error in complete page analysis:', error);
    sendResponse({
      success: false,
      error: error.message,
      detectedElements: []
    });
  }
}

function createCompletePageAnalysisPrompt(pageInfo, domElements, detectedElements) {
  const prompt = `
SENSITIVE INFORMATION DETECTION AND CLASSIFICATION

PAGE CONTEXT:
- URL: ${pageInfo.url}
- Title: ${pageInfo.title}
- Analysis Type: Complete page visible text content classification

TASK: Analyze the complete page DOM and classify ALL visible text content that contains sensitive information.

DETECTION CATEGORIES:
1. PERSONAL_INFO: email addresses, phone numbers, names, addresses
2. FINANCIAL: credit card numbers, account numbers, routing numbers, monetary amounts
3. IDENTIFICATION: SSN, tax IDs, passport numbers, license numbers
4. TECHNICAL: IP addresses, API keys, tokens, credentials
5. HEALTHCARE: patient IDs, medical record numbers, insurance numbers
6. BUSINESS: employee IDs, internal codes, proprietary information

PRE-DETECTED ELEMENTS (already found by pattern matching):
${detectedElements.map(el => `- ${el.tagName}: "${el.textContent.substring(0, 100)}" [${el.sensitiveType}]`).join('\n')}

COMPLETE DOM ELEMENTS TO ANALYZE:
${domElements.slice(0, 50).map(el => `
Element: ${el.tagName}${el.id ? '#' + el.id : ''}${el.className ? '.' + el.className.split(' ')[0] : ''}
Text: "${el.textContent}"
Selector: ${el.selector}
`).join('\n')}

INSTRUCTIONS:
1. Examine ALL visible text content in the DOM elements
2. Identify ANY sensitive information not already detected
3. Classify each finding with confidence level (0.0-1.0)
4. Provide CSS selector for precise element identification
5. Explain reasoning for each classification

RESPONSE FORMAT (JSON only):
{
  "detectedElements": [
    {
      "selector": "css-selector-here",
      "type": "email|phone|credit-card|ssn|ip-address|etc",
      "category": "PERSONAL_INFO|FINANCIAL|IDENTIFICATION|TECHNICAL|HEALTHCARE|BUSINESS",
      "confidence": 0.95,
      "reasoning": "Brief explanation of why this is sensitive",
      "sensitivity": "high|medium|low",
      "textContent": "relevant portion of text content",
      "detectedValue": "the actual sensitive value found"
    }
  ]
}

Focus on finding sensitive information displayed as text content (not input fields). Look for account details, personal information, financial data, etc. that users might see on banking sites, profile pages, or account dashboards.
`;

  return prompt;
}

function parseGeminiSensitiveContentResponse(responseData, domElements) {
  try {
    console.log('🔍 Parsing Gemini response for sensitive content detections');
    
    // Extract JSON from Gemini response
    let jsonContent = responseData;
    if (typeof responseData === 'string') {
      const jsonMatch = responseData.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = JSON.parse(jsonMatch[0]);
      } else {
        console.warn('⚠️ No JSON found in Gemini response');
        return [];
      }
    }
    
    const detectedElements = jsonContent.detectedElements || [];
    console.log(`🧠 Parsed ${detectedElements.length} AI-detected sensitive elements`);
    
    // Validate and enhance each detection
    const validDetections = detectedElements.filter(element => {
      return element.selector && 
             element.type && 
             element.category && 
             element.confidence && 
             element.confidence >= 0.6; // Minimum confidence threshold
    }).map(element => ({
      ...element,
      aiModelUsed: 'gemini-1.5-flash',
      detectionMethod: 'ai-complete-page-analysis',
      timestamp: new Date().toISOString()
    }));
    
    console.log(`✅ ${validDetections.length} valid AI detections ready for processing`);
    return validDetections;
    
  } catch (error) {
    console.error('❌ Error parsing Gemini response:', error);
    return [];
  }
}

async function handleAIAnalysis(elements, sendResponse) {
  try {
    console.log('🤖 AI Analysis requested for', elements.length, 'elements');
    
    // Filter out already processed elements
    const newElements = elements.filter(element => {
      const elementKey = generateElementHash(element);
      if (processedElements.has(elementKey)) {
        return false;
      }
      processedElements.add(elementKey);
      return true;
    });
    
    if (newElements.length === 0) {
      console.log('⏭️ No new elements to analyze');
      sendResponse({ success: true, results: [], newElementsCount: 0 });
      return;
    }
    
    console.log('🎯 Analyzing', newElements.length, 'new elements');
    
    // Prepare minimal data for AI
    const elementsForAI = newElements.map(element => ({
      type: element.type,
      name: element.name || '',
      id: element.id || '',
      placeholder: element.placeholder || '',
      autocomplete: element.autocomplete || '',
      className: element.className || ''
    }));
    
    const aiResults = await callGeminiAPI(elementsForAI);
    
    sendResponse({ 
      success: true, 
      results: aiResults,
      newElementsCount: newElements.length,
      totalProcessed: processedElements.size
    });
    
  } catch (error) {
    console.error('❌ AI Analysis failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleViewportDOMAnalysis(message, sendResponse) {
  try {
    const startTime = Date.now();
    console.log('👁️ Viewport DOM Analysis requested');
    console.log('📐 Viewport:', `${message.viewport.width}x${message.viewport.height} at (${message.viewport.scrollX}, ${message.viewport.scrollY})`);
    console.log('📄 Visible DOM size:', Math.round(message.visibleDOM.length / 1024), 'KB');
    
    // Create viewport hash for caching
    const viewportHash = generateViewportHash(message.viewport, message.visibleDOM);
    
    if (processedElements.has(viewportHash)) {
      console.log('⏭️ Similar viewport already analyzed, skipping');
      sendResponse({ success: true, results: [], processingTime: 0, cached: true });
      return;
    }
    
    // Mark this viewport as processed
    processedElements.add(viewportHash);
    
    const aiResults = await callGeminiForViewport(message);
    const processingTime = Date.now() - startTime;
    
    sendResponse({ 
      success: true, 
      results: aiResults,
      processingTime: processingTime,
      viewportSize: `${message.viewport.width}x${message.viewport.height}`,
      domSize: message.visibleDOM.length,
      scrollPosition: `${message.viewport.scrollX}, ${message.viewport.scrollY}`
    });
    
  } catch (error) {
    console.error('❌ Viewport DOM Analysis failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function callGeminiForViewport(message) {
  const prompt = createViewportAnalysisPrompt(message);
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.1,
      topK: 1,
      topP: 0.8,
      maxOutputTokens: 2048,
    },
    safetySettings: [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        threshold: "BLOCK_NONE"
      },
      {
        category: "HARM_CATEGORY_DANGEROUS_CONTENT",
        threshold: "BLOCK_NONE"
      }
    ]
  };
  
  console.log('🚀 Sending viewport DOM to Gemini AI for classification...');
  
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Gemini API Error:', response.status, errorText);
      
      // Try alternative API endpoint if main fails
      if (response.status === 404) {
        console.log('🔄 Trying alternative Gemini endpoint...');
        return await callGeminiAlternativeEndpoint(requestBody, 'viewport');
      }
      
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ Gemini AI viewport classification complete');
    
    return parseViewportAnalysisResponse(data);
    
  } catch (error) {
    console.error('❌ AI Classification failed:', error);
    
    // Fallback to pattern-based classification
    console.log('🔄 Falling back to enhanced pattern-based classification...');
    return performFallbackPatternClassification(message.visibleDOM);
  }
}

function createViewportAnalysisPrompt(message) {
  return `You are an expert in web security and sensitive data classification. Analyze this visible webpage section and identify ALL form fields that could collect SENSITIVE user data.

CONTEXT:
- URL: ${message.pageURL}
- Page Title: ${message.pageTitle}
- Viewport: ${message.viewport.width}x${message.viewport.height}

VISIBLE DOM CONTENT:
${message.visibleDOM}

CLASSIFICATION TASK: 
Identify form fields (input, textarea, select) that could contain sensitive data:

🔴 HIGH SENSITIVITY (Critical Security Risk):
- Passwords, PINs, security codes, OTP/2FA tokens
- Credit card numbers, CVV codes, expiration dates
- Social Security Numbers, Tax IDs, passport numbers, license numbers
- Bank account numbers, routing numbers, IBAN
- Biometric data, security questions/answers

🟡 MEDIUM SENSITIVITY (Personal Data):
- Email addresses, usernames, login IDs
- Full names, first name, last name
- Phone numbers, mobile numbers
- Home addresses, postal codes, ZIP codes
- Date of birth, age

🟢 LOW SENSITIVITY (General Information):
- Company names, job titles
- Preferences, settings, non-personal choices
- Public information, general comments

ANALYSIS CRITERIA:
1. Examine field attributes: name, id, placeholder, type, autocomplete
2. Look at surrounding labels and context
3. Consider form purpose and page type
4. Check for password/security patterns
5. Identify financial/payment fields
6. Detect personal identification fields

RESPONSE FORMAT - Valid JSON Array Only:
[
  {
    "selector": "unique CSS selector (id, name, or position-based)",
    "type": "input type (password, email, text, tel, etc.)",
    "sensitivity": "high|medium|low",
    "category": "password|financial|personal|contact|security|identification",
    "reason": "specific reason why this field is sensitive",
    "confidence": "0.95 for obvious fields, 0.8 for contextual, 0.6 for uncertain",
    "fieldName": "name attribute value",
    "fieldId": "id attribute value",
    "placeholder": "placeholder text",
    "context": "surrounding label or form context"
  }
]

If no sensitive fields found: []

IMPORTANT: Only classify fields that actually exist in the DOM and truly handle sensitive data. Be specific with selectors.`;
}

function parseViewportAnalysisResponse(aiData) {
  try {
    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🔍 Viewport Analysis Response:', responseText.substring(0, 300) + '...');
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️ Could not parse viewport analysis response as JSON');
      return [];
    }
    
    const sensitiveFields = JSON.parse(jsonMatch[0]);
    console.log('🎯 AI identified', sensitiveFields.length, 'sensitive fields in viewport');
    
    // Validate and process results
    return sensitiveFields.filter(field => {
      return field.selector && field.type && field.category && field.reason;
    }).map(field => ({
      ...field,
      confidence: field.sensitivity === 'high' ? 0.9 : field.sensitivity === 'medium' ? 0.7 : 0.5,
      detectionMethod: 'AI-Viewport-Analysis'
    }));
    
  } catch (error) {
    console.error('❌ Failed to parse viewport analysis response:', error);
    return [];
  }
}

function generateViewportHash(viewport, visibleDOM) {
  // Create hash based on viewport position and visible content
  const position = `${Math.round(viewport.scrollX / 200)}_${Math.round(viewport.scrollY / 200)}`;
  const contentSample = visibleDOM.replace(/\s+/g, '').substring(0, 500);
  return btoa(`${position}_${contentSample}`).slice(0, 20);
}

async function handleBatchDOMAnalysis(message, sendResponse) {
  try {
    const startTime = Date.now();
    console.log('📦 Batch DOM Analysis requested');
    console.log('📄 Total DOM size:', Math.round(message.fullDOM.length / 1024), 'KB');
    
    // Check if DOM is too large and needs batching
    const maxBatchSize = 40000; // 40KB per batch
    const domBatches = [];
    
    if (message.fullDOM.length > maxBatchSize) {
      console.log('🔄 DOM too large, splitting into batches...');
      domBatches.push(...splitDOMIntoBatches(message.fullDOM, maxBatchSize));
    } else {
      domBatches.push(message.fullDOM);
    }
    
    console.log('📦 Processing', domBatches.length, 'DOM batches');
    
    // Process all batches in parallel for speed
    const batchPromises = domBatches.map((batch, index) => 
      processDOMBatch(batch, index + 1, message)
    );
    
    const batchResults = await Promise.all(batchPromises);
    
    // Combine results from all batches
    const allSensitiveFields = [];
    batchResults.forEach(result => {
      if (result && result.length > 0) {
        allSensitiveFields.push(...result);
      }
    });
    
    // Remove duplicates based on selector
    const uniqueFields = removeDuplicateFields(allSensitiveFields);
    
    const processingTime = Date.now() - startTime;
    
    console.log('✅ Batch analysis complete:', {
      totalBatches: domBatches.length,
      totalSensitiveFields: uniqueFields.length,
      processingTime: processingTime + 'ms'
    });
    
    sendResponse({ 
      success: true, 
      results: uniqueFields,
      processingTime: processingTime,
      batchCount: domBatches.length,
      domSize: message.fullDOM.length,
      method: 'batch-analysis'
    });
    
  } catch (error) {
    console.error('❌ Batch DOM Analysis failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

function splitDOMIntoBatches(fullDOM, maxSize) {
  const batches = [];
  
  // Try to split at logical boundaries (forms, sections)
  const logicalSplits = [
    /<\/form>/gi,
    /<\/section>/gi,
    /<\/div[^>]*class[^>]*form[^>]*>/gi,
    /<\/fieldset>/gi
  ];
  
  let remainingDOM = fullDOM;
  
  while (remainingDOM.length > maxSize) {
    let splitPoint = maxSize;
    
    // Try to find a logical split point before maxSize
    for (const splitRegex of logicalSplits) {
      const matches = [...remainingDOM.substring(0, maxSize).matchAll(splitRegex)];
      if (matches.length > 0) {
        const lastMatch = matches[matches.length - 1];
        splitPoint = lastMatch.index + lastMatch[0].length;
        break;
      }
    }
    
    // Extract batch
    const batch = remainingDOM.substring(0, splitPoint);
    batches.push(batch);
    
    // Remove processed content
    remainingDOM = remainingDOM.substring(splitPoint);
  }
  
  // Add remaining content
  if (remainingDOM.length > 0) {
    batches.push(remainingDOM);
  }
  
  console.log('📦 Split DOM into', batches.length, 'batches:', 
    batches.map(batch => Math.round(batch.length / 1024) + 'KB'));
  
  return batches;
}

async function processDOMBatch(domBatch, batchNumber, originalMessage) {
  try {
    console.log(`📦 Processing batch ${batchNumber}...`);
    
    const prompt = createBatchAnalysisPrompt({
      ...originalMessage,
      domBatch: domBatch,
      batchNumber: batchNumber
    });
    
    const requestBody = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`Batch ${batchNumber} API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`✅ Batch ${batchNumber} analysis complete`);
    
    return parseBatchAnalysisResponse(data, batchNumber);
    
  } catch (error) {
    console.error(`❌ Batch ${batchNumber} processing failed:`, error);
    return [];
  }
}

function createBatchAnalysisPrompt(message) {
  return `You are an AI expert in web security and sensitive data classification. Analyze this DOM batch and classify ALL form fields for sensitivity level.

PAGE CONTEXT:
- URL: ${message.pageURL}
- Page Title: ${message.pageTitle}
- Batch: ${message.batchNumber} (Complete analysis required)

DOM BATCH CONTENT:
${message.domBatch}

AI CLASSIFICATION TASK:
Analyze ALL form fields (input, textarea, select) and classify each by sensitivity:

🔴 HIGH SENSITIVITY - Immediate Security Risk:
- Passwords, passphrases, PINs, security codes
- 2FA tokens, OTP codes, authentication codes
- Credit card numbers, debit card numbers
- CVV/CVC codes, card expiration dates
- Social Security Numbers (SSN), Tax IDs
- Bank account numbers, routing numbers, IBAN
- Government ID numbers, passport numbers
- Security questions and answers

🟡 MEDIUM SENSITIVITY - Personal Identifiable Information:
- Email addresses, usernames, login IDs
- Full names, first names, last names
- Phone numbers, mobile numbers, fax numbers
- Home addresses, work addresses
- Postal codes, ZIP codes, area codes
- Date of birth, age, birth year

🟢 LOW SENSITIVITY - General Personal Data:
- Company names, organization names
- Job titles, professional information
- General preferences, settings
- Non-personal contact information

ADVANCED AI ANALYSIS:
1. Parse field attributes: name, id, class, placeholder, type, autocomplete
2. Analyze surrounding context: labels, headings, form structure
3. Understand page purpose: login, registration, payment, profile
4. Detect patterns: password confirmation, card number formatting
5. Identify field relationships: grouped personal info, payment flows
6. Consider regulatory compliance: GDPR, PCI-DSS, CCPA relevance

RESPONSE: Valid JSON Array Only:
[
  {
    "selector": "precise CSS selector (prefer #id or [name='value'])",
    "type": "exact input type",
    "sensitivity": "high|medium|low",
    "category": "password|financial|personal|contact|security|identification|authentication",
    "reason": "detailed AI analysis reasoning",
    "confidence": "AI confidence score 0.1-1.0",
    "fieldName": "name attribute",
    "fieldId": "id attribute",
    "aiAnalysis": "detailed field purpose analysis",
    "dataType": "what type of sensitive data this field collects",
    "riskLevel": "security risk assessment"
  }
]

Return [] if no sensitive fields in this batch.

Focus on ACCURACY and COMPREHENSIVE CLASSIFICATION. Every sensitive field must be identified.`;
}

function parseBatchAnalysisResponse(aiData, batchNumber) {
  try {
    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log(`🔍 Batch ${batchNumber} Response:`, responseText.substring(0, 200) + '...');
    
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn(`⚠️ Could not parse batch ${batchNumber} response as JSON`);
      return [];
    }
    
    const sensitiveFields = JSON.parse(jsonMatch[0]);
    console.log(`🎯 Batch ${batchNumber} found`, sensitiveFields.length, 'sensitive fields');
    
    return sensitiveFields.filter(field => {
      return field.selector && field.type && field.category && field.reason;
    }).map(field => ({
      ...field,
      confidence: field.sensitivity === 'high' ? 0.9 : field.sensitivity === 'medium' ? 0.7 : 0.5,
      detectionMethod: 'AI-Batch-Analysis',
      batchNumber: batchNumber
    }));
    
  } catch (error) {
    console.error(`❌ Failed to parse batch ${batchNumber} response:`, error);
    return [];
  }
}

function removeDuplicateFields(allFields) {
  const uniqueFields = [];
  const seenSelectors = new Set();
  
  allFields.forEach(field => {
    // Use selector as unique identifier
    const uniqueKey = field.selector.toLowerCase();
    
    if (!seenSelectors.has(uniqueKey)) {
      seenSelectors.add(uniqueKey);
      uniqueFields.push(field);
    } else {
      // If duplicate, keep the one with higher confidence
      const existingIndex = uniqueFields.findIndex(f => 
        f.selector.toLowerCase() === uniqueKey);
      
      if (existingIndex >= 0 && field.confidence > uniqueFields[existingIndex].confidence) {
        uniqueFields[existingIndex] = field;
      }
    }
  });
  
  console.log('🔄 Removed', allFields.length - uniqueFields.length, 'duplicate fields');
  return uniqueFields;
}

async function handleCompleteDOMAnalysis(message, sendResponse) {
  try {
    const startTime = Date.now();
    console.log('🌍 Complete DOM Analysis requested');
    console.log('📄 Complete DOM size:', Math.round(message.completeDOM.length / 1024), 'KB');
    console.log('🏷️ Page type:', message.pageType);
    
    // Analyze complete DOM with Gemini
    const analysis = await analyzeCompleteDOMWithGemini(
      message.completeDOM, 
      message.pageType
    );
    
    if (analysis && analysis.sensitiveFields) {
      const processingTime = Date.now() - startTime;
      console.log('✅ Complete DOM analysis completed in', processingTime, 'ms');
      console.log('🎯 Found', analysis.sensitiveFields.length, 'sensitive fields');
      
      sendResponse({
        success: true,
        sensitiveFields: analysis.sensitiveFields,
        processingTime: processingTime,
        pageType: message.pageType
      });
    } else {
      console.log('⚠️ No sensitive fields found in complete DOM');
      sendResponse({
        success: true,
        sensitiveFields: [],
        processingTime: Date.now() - startTime,
        pageType: message.pageType
      });
    }
  } catch (error) {
    console.error('❌ Complete DOM analysis failed:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

async function handleDOMAnalysis(message, sendResponse) {
  try {
    const startTime = Date.now();
    console.log('🌐 DOM Analysis requested for:', message.pageTitle);
    console.log('📄 DOM size:', Math.round(message.domHTML.length / 1024), 'KB');
    console.log('🔍 Form elements to analyze:', message.formElements.length);
    
    // Check if we've already analyzed a similar DOM structure
    const domHash = generateDOMHash(message.domHTML, message.pageURL);
    
    if (processedElements.has(domHash)) {
      console.log('⏭️ Similar DOM already analyzed, skipping');
      sendResponse({ success: true, results: [], processingTime: 0, cached: true });
      return;
    }
    
    // Mark this DOM as processed
    processedElements.add(domHash);
    
    const aiResults = await callGeminiForDOM(message);
    const processingTime = Date.now() - startTime;
    
    sendResponse({ 
      success: true, 
      results: aiResults,
      processingTime: processingTime,
      domSize: message.domHTML.length,
      formElementsCount: message.formElements.length
    });
    
  } catch (error) {
    console.error('❌ DOM Analysis failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function callGeminiForDOM(message) {
  const prompt = createDOMAnalysisPrompt(message);
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  console.log('🚀 Sending DOM to Gemini API...');
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Gemini DOM analysis response received');
  
  return parseDOMAnalysisResponse(data, message.formElements);
}

function createDOMAnalysisPrompt(message) {
  return `Analyze this complete web page DOM and identify ALL SENSITIVE form fields that could contain personal, financial, or security data.

PAGE CONTEXT:
- URL: ${message.pageURL}
- Title: ${message.pageTitle}
- Form Elements Found: ${message.formElements.length}

COMPLETE DOM STRUCTURE:
${message.domHTML}

SENSITIVE FIELD TYPES TO DETECT:
- Passwords, PINs, security codes, OTP fields
- Email addresses, usernames, login IDs
- Credit card numbers, CVV, expiry dates
- Social security numbers, tax IDs, government IDs
- Phone numbers, addresses, postal codes
- Bank account numbers, routing numbers
- Personal names (first, last, full name)
- Birthdates, ages
- Any authentication or security-related fields
- Financial account information
- Personal identification numbers

INSTRUCTIONS:
1. Read the complete DOM structure and understand the page context
2. Identify form fields (input, textarea, select elements) that are likely to contain sensitive data
3. Look for contextual clues like:
   - Field labels and surrounding text
   - CSS class names and IDs
   - Placeholder text
   - Autocomplete attributes
   - Field positioning and grouping
   - Form purpose and page context

RESPONSE FORMAT:
Respond with ONLY a JSON array containing objects for each sensitive field found:
[
  {
    "selector": "CSS selector to uniquely identify the field",
    "type": "field type (password, email, text, etc.)",
    "sensitivity": "high|medium|low",
    "category": "password|username|financial|personal|contact|security",
    "reason": "Brief explanation why this field is sensitive",
    "name": "field name attribute if available",
    "id": "field id attribute if available"
  }
]

If no sensitive fields are found, respond with: []

Example response:
[
  {
    "selector": "#password",
    "type": "password",
    "sensitivity": "high",
    "category": "password",
    "reason": "Password input field for authentication",
    "name": "password",
    "id": "password"
  },
  {
    "selector": "input[name='email']",
    "type": "email",
    "sensitivity": "medium",
    "category": "contact",
    "reason": "Email address for user identification",
    "name": "email",
    "id": ""
  }
]`;
}

function parseDOMAnalysisResponse(aiData, formElements) {
  try {
    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🔍 DOM Analysis Response:', responseText.substring(0, 500) + '...');
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('⚠️ Could not parse DOM analysis response as JSON');
      return [];
    }
    
    const sensitiveFields = JSON.parse(jsonMatch[0]);
    console.log('🎯 AI identified', sensitiveFields.length, 'sensitive fields in DOM');
    
    // Validate and process results
    return sensitiveFields.filter(field => {
      return field.selector && field.type && field.category && field.reason;
    }).map(field => ({
      ...field,
      confidence: field.sensitivity === 'high' ? 0.9 : field.sensitivity === 'medium' ? 0.7 : 0.5,
      detectionMethod: 'AI-DOM-Analysis'
    }));
    
  } catch (error) {
    console.error('❌ Failed to parse DOM analysis response:', error);
    return [];
  }
}

function generateDOMHash(domHTML, pageURL) {
  // Create a hash based on DOM structure and URL to avoid re-analyzing similar pages
  const domStructure = domHTML.replace(/\s+/g, '').substring(0, 1000); // Simplified structure
  const urlBase = pageURL.split('?')[0]; // Remove query parameters
  return btoa(`${urlBase}_${domStructure}`).slice(0, 20);
}

async function callGeminiAPI(elements) {
  const prompt = createSensitiveFieldPrompt(elements);
  
  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  console.log('🚀 Sending request to Gemini API...');
  
  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ Gemini API response received');
  
  return parseAIResponse(data, elements);
}

function createSensitiveFieldPrompt(elements) {
  const elementsText = elements.map((element, index) => 
    `${index + 1}. Type: ${element.type}, Name: "${element.name}", ID: "${element.id}", Placeholder: "${element.placeholder}", Autocomplete: "${element.autocomplete}"`
  ).join('\n');
  
  return `Analyze these form fields and identify which ones are SENSITIVE (contain personal, financial, or security data):

${elementsText}

SENSITIVE field types include:
- Passwords, PINs, security codes
- Email addresses, usernames
- Credit card numbers, CVV, expiry dates
- Social security numbers, tax IDs
- Phone numbers, addresses
- Bank account numbers
- Personal names, birthdates
- Any field with security/authentication purpose

Respond with ONLY a JSON array of numbers (1-based indices) for SENSITIVE fields.
Example: [1, 3, 5] means fields 1, 3, and 5 are sensitive.
If no fields are sensitive, respond with: []`;
}

function parseAIResponse(aiData, elements) {
  try {
    const responseText = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('🔍 AI Response:', responseText);
    
    // Extract JSON array from response
    const jsonMatch = responseText.match(/\[([\d,\s]*)\]/);
    if (!jsonMatch) {
      console.warn('⚠️ Could not parse AI response as JSON array');
      return [];
    }
    
    const sensitiveIndices = JSON.parse(jsonMatch[0]);
    console.log('🎯 AI identified sensitive fields at indices:', sensitiveIndices);
    
    // Convert indices to results with element info
    return sensitiveIndices.map(index => ({
      index: index,
      element: elements[index - 1], // Convert to 0-based
      confidence: 0.9, // High confidence from AI
      reason: 'AI-detected sensitive field'
    })).filter(result => result.element); // Filter out invalid indices
    
  } catch (error) {
    console.error('❌ Failed to parse AI response:', error);
    return [];
  }
}

async function analyzeCompleteDOMWithGemini(completeDOM, pageType) {
  console.log('🤖 Analyzing complete DOM with Gemini...');
  
  const prompt = `
You are an expert web security analyst specializing in sensitive field detection. Analyze the complete DOM structure below and identify ALL sensitive input fields that could contain personal, financial, or confidential information.

Page Type: ${pageType}
DOM Structure:
${completeDOM}

IMPORTANT INSTRUCTIONS:
1. Look for ALL input fields, textareas, select elements, and any interactive elements
2. Consider the context: labels, placeholders, names, IDs, surrounding text
3. Identify fields that could contain: passwords, emails, phone numbers, SSN, credit card info, addresses, names, dates of birth, security codes, PINs, account numbers, etc.
4. Pay special attention to dynamically generated fields and fields without obvious names
5. Consider hidden or initially invisible fields that may become visible later
6. For banking/financial sites, be extra thorough with transaction and authentication fields

Respond with a JSON array of objects, each containing:
{
  "selector": "CSS selector to uniquely identify the element",
  "type": "password|email|phone|ssn|credit_card|address|name|date_of_birth|security_code|pin|account_number|other",
  "confidence": 0.0-1.0,
  "reasoning": "why this field is considered sensitive",
  "context": "surrounding labels/text that helped identify it"
}

Return ONLY the JSON array, no other text.`;

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  try {
    console.log('📤 Sending complete DOM to Gemini API...');
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      console.log('⚠️ Primary endpoint failed, trying alternative...');
      return await callGeminiAlternativeEndpoint(requestBody, 'CompleteDOM');
    }

    const data = await response.json();
    console.log('📥 Gemini complete DOM response received');

    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const responseText = data.candidates[0].content.parts[0].text;
      console.log('🔍 Gemini complete DOM analysis:', responseText.substring(0, 500));
      
      try {
        const cleanedResponse = responseText.replace(/```json|```/g, '').trim();
        const sensitiveFields = JSON.parse(cleanedResponse);
        
        if (Array.isArray(sensitiveFields)) {
          console.log('✅ Successfully parsed', sensitiveFields.length, 'sensitive fields from complete DOM');
          return { sensitiveFields };
        } else {
          console.log('⚠️ Response not an array:', sensitiveFields);
          return { sensitiveFields: [] };
        }
      } catch (parseError) {
        console.error('❌ Failed to parse complete DOM response:', parseError);
        console.log('📝 Raw response:', responseText);
        return { sensitiveFields: [] };
      }
    } else {
      console.log('⚠️ No content in complete DOM response');
      return { sensitiveFields: [] };
    }
  } catch (error) {
    console.error('❌ Complete DOM analysis failed:', error);
    return { sensitiveFields: [] };
  }
}

async function testGeminiAPI(sendResponse) {
  try {
    console.log('🧪 Testing Gemini API connection...');
    
    const testPrompt = 'Respond with just the word "CONNECTED" if you can read this message.';
    const requestBody = {
      contents: [{
        parts: [{
          text: testPrompt
        }]
      }]
    };
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (response.ok) {
      console.log('✅ API test successful');
      sendResponse({ success: true, valid: true });
    } else {
      console.error('❌ API test failed:', response.status);
      sendResponse({ success: true, valid: false });
    }
  } catch (error) {
    console.error('❌ API test error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

function generateElementHash(element) {
  // Create unique hash for element to avoid duplicates
  return `${element.type}_${element.name}_${element.id}_${element.placeholder}`.toLowerCase();
}

async function callGeminiAlternativeEndpoint(requestBody, analysisType) {
  const alternativeEndpoints = [
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  ];
  
  for (const endpoint of alternativeEndpoints) {
    try {
      console.log('🔄 Trying alternative endpoint:', endpoint);
      
      const response = await fetch(`${endpoint}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Alternative endpoint successful');
        
        if (analysisType === 'viewport') {
          return parseViewportAnalysisResponse(data);
        } else if (analysisType === 'batch') {
          return parseBatchAnalysisResponse(data, 1);
        }
      }
    } catch (error) {
      console.warn('⚠️ Alternative endpoint failed:', endpoint, error.message);
    }
  }
  
  throw new Error('All Gemini endpoints failed');
}

function performFallbackPatternClassification(domContent) {
  console.log('🎯 Performing enhanced pattern-based classification...');
  
  const sensitiveFields = [];
  
  // Create a temporary DOM element to parse the content
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = domContent;
  
  const formFields = tempDiv.querySelectorAll('input, textarea, select');
  
  formFields.forEach((field, index) => {
    const classification = classifyFieldByPattern(field);
    
    if (classification.isSensitive) {
      sensitiveFields.push({
        selector: generateFieldSelector(field),
        type: field.type || 'text',
        sensitivity: classification.sensitivity,
        category: classification.category,
        reason: classification.reason,
        fieldName: field.name || '',
        fieldId: field.id || '',
        placeholder: field.placeholder || '',
        context: getFieldContext(field),
        confidence: classification.confidence,
        detectionMethod: 'Enhanced-Pattern-Based'
      });
    }
  });
  
  console.log('✅ Pattern classification found', sensitiveFields.length, 'sensitive fields');
  return sensitiveFields;
}

function classifyFieldByPattern(field) {
  const fieldText = [
    field.type || '',
    field.name || '',
    field.id || '',
    field.placeholder || '',
    field.className || '',
    field.autocomplete || '',
    getFieldLabel(field)
  ].join(' ').toLowerCase();
  
  // High sensitivity patterns
  const highSensitivityPatterns = {
    password: /password|passwd|pwd|pass|secret|pin|code|otp|2fa|mfa|auth/i,
    financial: /card|credit|debit|cvv|cvc|ccv|expir|expire|bank|account|routing|iban|sort/i,
    ssn: /ssn|social.?security|tax.?id|ein|national.?id|gov.?id/i,
    security: /security|answer|question|challenge|verify|confirm/i
  };
  
  // Medium sensitivity patterns
  const mediumSensitivityPatterns = {
    personal: /name|first|last|full.?name|surname|given/i,
    contact: /email|mail|phone|mobile|tel|address|street|city|zip|postal|country/i,
    identification: /username|user.?id|login|signin|account.?id|member.?id/i,
    birth: /birth|age|dob|date.?of.?birth|born/i
  };
  
  // Check high sensitivity
  for (const [category, pattern] of Object.entries(highSensitivityPatterns)) {
    if (pattern.test(fieldText) || field.type === 'password') {
      return {
        isSensitive: true,
        sensitivity: 'high',
        category: category,
        reason: `High sensitivity ${category} field detected`,
        confidence: 0.9
      };
    }
  }
  
  // Check medium sensitivity
  for (const [category, pattern] of Object.entries(mediumSensitivityPatterns)) {
    if (pattern.test(fieldText)) {
      return {
        isSensitive: true,
        sensitivity: 'medium',
        category: category,
        reason: `Medium sensitivity ${category} field detected`,
        confidence: 0.8
      };
    }
  }
  
  // Special email type check
  if (field.type === 'email') {
    return {
      isSensitive: true,
      sensitivity: 'medium',
      category: 'contact',
      reason: 'Email input field detected',
      confidence: 0.95
    };
  }
  
  return { isSensitive: false };
}

function generateFieldSelector(field) {
  if (field.id) {
    return `#${field.id}`;
  }
  if (field.name) {
    return `input[name="${field.name}"]`;
  }
  if (field.type && field.type !== 'text') {
    return `input[type="${field.type}"]`;
  }
  return `input:nth-of-type(${Array.from(field.parentNode.querySelectorAll('input')).indexOf(field) + 1})`;
}

function getFieldLabel(field) {
  // Look for associated label
  if (field.labels && field.labels.length > 0) {
    return field.labels[0].textContent || '';
  }
  
  // Look for nearby label
  const label = field.parentNode.querySelector('label');
  if (label) {
    return label.textContent || '';
  }
  
  // Look for previous text content
  const prevElement = field.previousElementSibling;
  if (prevElement && prevElement.textContent) {
    return prevElement.textContent.trim();
  }
  
  return '';
}

// NEW: Enhanced function for raw DOM analysis - Pattern Detection FIRST, then AI
async function analyzeRawDOMWithGemini(rawDOM, pageInfo = {}) {
  console.log('🔍 NEW: Starting enhanced DOM analysis (Pattern FIRST, then AI)...');
  console.log('📄 Raw DOM size:', Math.round(rawDOM.length / 1024), 'KB');
  console.log('🌐 Page info:', pageInfo);
  
  const startTime = Date.now();
  
  // STEP 1: Pattern Detection FIRST (Full DOM)
  console.log('🎯 STEP 1: Running pattern detection on FULL DOM...');
  const patternFields = performFallbackPatternDetection(rawDOM, pageInfo);
  console.log(`✅ Pattern detection found ${patternFields.length} sensitive fields`);
  
  // STEP 1.5: Send pattern detection results IMMEDIATELY to browser
  console.log('📤 STEP 1.5: Sending pattern detection results immediately to browser...');
  const patternSelectors = patternFields.map(field => field.selector);
  console.log(`📊 Sending ${patternSelectors.length} pattern-detected selectors to browser...`);
  
  // Get tab ID for sending to browser
  const tabId = await getTabIdFromPageInfo(pageInfo);
  if (tabId) {
    executeMaskingScript(tabId, patternSelectors, 'pattern-detection');
  } else {
    console.warn('⚠️ Could not determine tab ID for pattern detection results');
  }
  
  // STEP 2: AI Detection SECOND (Viewport data only to reduce load)
  console.log('🧠 STEP 2: Running AI detection on viewport data...');
  let aiFields = [];
  
  try {
    // Extract viewport data for AI analysis (reduce load)
    const viewportData = extractViewportData(rawDOM, pageInfo);
    console.log('📐 Viewport data size:', Math.round(viewportData.length / 1024), 'KB');
    
    aiFields = await performAIAnalysis(viewportData, pageInfo);
    console.log(`✅ AI detection found ${aiFields.length} additional sensitive fields`);
    
  } catch (error) {
    console.error('❌ AI detection failed:', error);
    console.log('⚠️ Continuing with pattern detection results only');
  }
  
  // STEP 3: Compare and send only NEW AI-detected fields
  console.log('🔄 STEP 3: Comparing pattern and AI results...');
  const newAIFields = findNewAIDetectedFields(patternFields, aiFields);
  
  if (newAIFields.length > 0) {
    console.log(`📤 STEP 3.5: Sending ${newAIFields.length} NEW AI-detected fields to browser...`);
    const newAISelectors = newAIFields.map(field => field.selector);
    
    if (tabId) {
      executeMaskingScript(tabId, newAISelectors, 'ai-detection');
    } else {
      console.warn('⚠️ Could not determine tab ID for AI detection results');
    }
  } else {
    console.log('✅ No new AI-detected fields found - all fields already covered by pattern detection');
  }
  
  // STEP 4: Combine all results for logging
  console.log('📊 STEP 4: Combining all results for logging...');
  const combinedFields = [...patternFields, ...newAIFields];
  
  const totalTime = Date.now() - startTime;
  console.log('✅ Enhanced DOM analysis completed in:', totalTime, 'ms');
  console.log('🎯 Total detected sensitive fields:', combinedFields.length);
  console.log(`📊 Breakdown: ${patternFields.length} pattern + ${newAIFields.length} new AI = ${combinedFields.length} total`);
  
  // Log detailed results with breakdown info
  const logInfo = {
    ...pageInfo,
    patternFields: patternFields.length,
    aiFields: newAIFields.length,
    totalAIFields: aiFields.length
  };
  logSensitiveFieldResults(combinedFields, logInfo);
  
  return {
    success: true,
    sensitiveFields: combinedFields,
    processingTime: totalTime,
    patternFields: patternFields.length,
    aiFields: newAIFields.length,
    totalAIFields: aiFields.length,
    domSize: rawDOM.length,
    pageInfo: pageInfo,
    attempts: 1
  };
}

function createRawDOMAnalysisPrompt(rawDOM, pageInfo) {
  const url = pageInfo.url || 'Unknown URL';
  const title = pageInfo.title || 'Unknown Page';
  const pageType = pageInfo.pageType || 'Unknown';
  const domState = pageInfo.domState || {};
  
  return `
You are an expert web security analyst specializing in sensitive field detection. Analyze the complete DOM structure below and identify ALL sensitive input fields that could contain personal, financial, or confidential information.

PAGE INFORMATION:
- URL: ${url}
- Title: ${title}
- Page Type: ${pageType}
- DOM State: ${JSON.stringify(domState)}

COMPLETE DOM STRUCTURE (INCLUDING SHADOW DOM AND DYNAMIC CONTENT):
${rawDOM}

DETECTION INSTRUCTIONS:
1. Search for ALL input elements: <input>, <textarea>, <select>, <datalist>
2. Look for any elements that could contain sensitive data
3. Consider context clues: labels, placeholders, names, IDs, surrounding text
4. Pay attention to hidden fields, dynamically generated fields
5. Check for custom elements or shadow DOM content (look for <!-- SHADOW DOM CONTENT --> sections)
6. Look for any text content that might contain sensitive information
7. Check for dynamically loaded content (look for <!-- DYNAMIC CONTENT --> sections)
8. Examine form-like elements (look for <!-- FORM-LIKE ELEMENTS --> sections)
9. **CRITICAL**: Look for sensitive text content in regular HTML elements like <span>, <p>, <div> with:
   - Elements with class="sensitive-text" and data-type attributes
   - Elements containing email addresses, phone numbers, credit cards, SSNs, etc.
   - Text content that displays sensitive information (not just form fields)
   - Elements with data-type="email", data-type="phone", data-type="ssn", etc.

SPECIFIC PATTERNS TO LOOK FOR:
- Input fields with type="password", type="email", type="text", type="tel", type="number", type="date"
- Fields with names like: password, email, username, login, auth, secret, key, token, phone, mobile, birth, date, address, country, city, zip, postal, ssn, social, credit, card, account, bank, routing, iban, cvv, cvc, pin, otp, 2fa, mfa
- Fields with IDs like: password, email, username, login, auth, secret, key, token, phone, mobile, birth, date, address, country, city, zip, postal, ssn, social, credit, card, account, bank, routing, iban, cvv, cvc, pin, otp, 2fa, mfa
- Fields with placeholders containing: password, email, username, login, auth, phone, mobile, birth, date, address, country, city, zip, postal, ssn, social, credit, card, account, bank, routing, iban, cvv, cvc, pin, otp, 2fa, mfa
- Hidden fields with sensitive names: csrf_token, auth_token, session_id, failedScript, script_error
- Form elements within login, signin, auth, register, profile, settings, account forms
- Contenteditable elements that might contain sensitive data
- Custom input elements with role="textbox", role="combobox", role="listbox"
- Elements with data-testid, data-cy, aria-label attributes that might be sensitive
- **TEXT CONTENT PATTERNS**:
  - Elements with class="sensitive-text" and data-type attributes
  - <span> elements with data-type="email", data-type="phone", data-type="ssn", etc.
  - Text content containing email patterns: user@domain.com
  - Text content containing phone patterns: (555) 123-4567, +1-555-123-4567
  - Text content containing credit card patterns: 4111-1111-1111-1111
  - Text content containing SSN patterns: 123-45-6789
  - Text content containing account numbers, routing numbers, IBAN
  - Text content containing API keys, tokens, session IDs

MODERN WEB APP PATTERNS:
- Look for React/Vue/Angular component patterns
- Check for shadow DOM content (marked with <!-- SHADOW DOM CONTENT -->)
- Examine dynamically loaded content (marked with <!-- DYNAMIC CONTENT -->)
- Look for form-like elements (marked with <!-- FORM-LIKE ELEMENTS -->)
- Check for custom web components and encapsulated content
- Look for elements with modern framework attributes

SENSITIVE DATA TYPES TO DETECT:
- Authentication: passwords, usernames, PINs, security codes, tokens, OTP, 2FA, MFA
- Personal Info: names, emails, phone numbers, addresses, dates of birth, birth dates, ages
- Financial: credit card numbers, CVV, bank accounts, routing numbers, IBAN, account numbers
- Government: SSN, driver's license, passport numbers, tax IDs, national IDs, government IDs
- Medical: health information, insurance numbers, medical records, health data
- Business: company secrets, proprietary information, internal IDs, employee data
- Location: countries, cities, states, zip codes, postal codes, addresses, coordinates
- Contact: phone numbers, mobile numbers, email addresses, contact information

RESPONSE FORMAT:
Return a JSON array of objects, each containing:
{
  "selector": "CSS selector to uniquely identify the element",
  "type": "password|email|phone|ssn|credit_card|address|name|date_of_birth|security_code|pin|account_number|medical|business|token|location|contact|other",
  "confidence": 0.0-1.0,
  "reasoning": "detailed explanation of why this field is sensitive",
  "context": "surrounding labels, text, or context that helped identify it",
  "risk_level": "high|medium|low",
  "recommendation": "suggested security measure for this field",
  "isTextContent": "true if this is display-only text content (not a form field)",
  "textContent": "the actual sensitive text content if this is a text element"
}

IMPORTANT: 
- Return ONLY the JSON array, no other text or formatting
- Be thorough and detect ALL potential sensitive fields AND text content
- Even if a field seems obvious (like a password field), include it
- Look for both visible and hidden sensitive fields
- **CRITICAL**: Look for sensitive text content in regular HTML elements (not just form fields)
- Look for elements with class="sensitive-text" and data-type attributes
- Look for text content containing email addresses, phone numbers, credit cards, SSNs, etc.
- Consider the page context (login pages, profile pages, settings pages, etc.)
- Pay special attention to shadow DOM and dynamic content sections
- Modern web apps often hide sensitive fields in complex structures
- Look for fields that might be loaded dynamically or in shadow DOM
- **TEXT CONTENT IS JUST AS SENSITIVE AS FORM FIELDS** - detect both!`;
}

function parseGeminiRawDOMResponse(data) {
  console.log('🔍 Parsing Gemini raw DOM response...');
  
  try {
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.log('⚠️ No content in Gemini response');
      return [];
    }
    
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('📝 Raw response preview:', responseText.substring(0, 300) + '...');
    
    // Clean the response text
    let cleanedResponse = responseText
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim();
    
    // Try to extract JSON if it's wrapped in other text
    const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    console.log('🧹 Cleaned response preview:', cleanedResponse.substring(0, 300) + '...');
    
    // Parse the JSON
    const sensitiveFields = JSON.parse(cleanedResponse);
    
    if (!Array.isArray(sensitiveFields)) {
      console.log('⚠️ Response is not an array:', typeof sensitiveFields);
      return [];
    }
    
    // Validate each field
    const validFields = sensitiveFields.filter(field => {
      return field && 
             typeof field === 'object' && 
             field.selector && 
             field.type && 
             typeof field.confidence === 'number';
    });
    
    console.log('✅ Successfully parsed', validFields.length, 'valid sensitive fields');
    
    // NEW: Fallback pattern detection if AI returns no results
    if (validFields.length === 0) {
      console.log('⚠️ AI returned no fields, checking if this is a false negative...');
      // This will be handled by the fallback mechanism in the main function
    }
    
    return validFields;
    
  } catch (error) {
    console.error('❌ Error parsing Gemini response:', error);
    return [];
  }
}

// Helper function to extract viewport data from full DOM
function extractViewportData(rawDOM, pageInfo) {
  console.log('📐 Extracting viewport data for AI analysis...');
  
  try {
    // Extract visible content (reduce load for AI)
    const viewportPatterns = [
      // Look for main content areas
      /<main[^>]*>([\s\S]*?)<\/main>/gi,
      /<div[^>]*class[^>]*container[^>]*>([\s\S]*?)<\/div>/gi,
      /<div[^>]*class[^>]*content[^>]*>([\s\S]*?)<\/div>/gi,
      // Look for form sections
      /<form[^>]*>([\s\S]*?)<\/form>/gi,
      // Look for sensitive text content sections
      /<div[^>]*class[^>]*sensitive-text-content[^>]*>([\s\S]*?)<\/div>/gi,
      // Look for test sections
      /<div[^>]*class[^>]*test-section[^>]*>([\s\S]*?)<\/div>/gi
    ];
    
    let viewportContent = '';
    let sectionsFound = 0;
    
    viewportPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(rawDOM)) !== null) {
        viewportContent += match[1] + '\n';
        sectionsFound++;
      }
    });
    
    // If no specific sections found, take first 50KB of content
    if (sectionsFound === 0) {
      console.log('⚠️ No specific sections found, using first 50KB of content');
      viewportContent = rawDOM.substring(0, 50000);
    }
    
    console.log(`📐 Extracted ${sectionsFound} sections, viewport size: ${Math.round(viewportContent.length / 1024)}KB`);
    return viewportContent;
    
  } catch (error) {
    console.error('❌ Error extracting viewport data:', error);
    // Fallback to first 30KB
    return rawDOM.substring(0, 30000);
  }
}

// Helper function to perform AI analysis on viewport data
async function performAIAnalysis(viewportData, pageInfo) {
  console.log('🧠 Performing AI analysis on viewport data...');
  
  const maxRetries = 2; // Reduced retries for viewport analysis
  const baseDelay = 500; // Shorter delay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 AI Attempt ${attempt}/${maxRetries}...`);
      
      // Create focused prompt for viewport analysis
      const prompt = createViewportAnalysisPrompt(viewportData, pageInfo);
      
      // Prepare request body for Gemini API
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 20,
          topP: 0.9,
          maxOutputTokens: 4096, // Reduced for viewport analysis
        }
      };
      
      console.log('📤 Sending viewport data to Gemini API...');
      
      // Make API call to Gemini with shorter timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Gemini API error (attempt ${attempt}):`, response.status, response.statusText);
        
        // Check if this is a retryable error
        const isRetryable = response.status === 429 || response.status === 500 || response.status === 502 || response.status === 503 || response.status === 504;
        
        if (isRetryable && attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`⏳ Retryable error detected. Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new Error(`Gemini API failed: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('📥 Gemini viewport response received');
      
      // Parse and validate the response
      const aiFields = parseGeminiRawDOMResponse(data);
      console.log(`✅ AI analysis found ${aiFields.length} sensitive fields`);
      
      return aiFields;
      
    } catch (error) {
      console.error(`❌ AI analysis failed (attempt ${attempt}):`, error);
      
      // Check if this is a retryable error
      const isRetryable = error.name === 'AbortError' || 
                         error.message.includes('503') || 
                         error.message.includes('429') || 
                         error.message.includes('500') || 
                         error.message.includes('502') || 
                         error.message.includes('504') ||
                         error.message.includes('network') ||
                         error.message.includes('fetch');
      
      if (isRetryable && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Retryable error detected. Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // If we've exhausted all retries, return empty array
      console.log('🔄 All AI retries exhausted, returning empty results');
      return [];
    }
  }
}

// Helper function to create viewport analysis prompt
function createViewportAnalysisPrompt(viewportData, pageInfo) {
  const url = pageInfo.url || 'Unknown URL';
  const title = pageInfo.title || 'Unknown Page';
  
  return `
You are an expert web security analyst. Analyze this viewport content and identify ALL sensitive fields and text content that could contain personal, financial, or confidential information.

PAGE CONTEXT:
- URL: ${url}
- Title: ${title}
- Analysis Type: Viewport content analysis (reduced scope for performance)

VIEWPORT CONTENT:
${viewportData}

DETECTION INSTRUCTIONS:
1. Look for ALL form fields: <input>, <textarea>, <select>
2. Look for sensitive text content in regular HTML elements
3. Focus on elements with class="sensitive-text" and data-type attributes
4. Look for text content containing email addresses, phone numbers, credit cards, SSNs, etc.
5. Consider context clues: labels, placeholders, names, IDs, surrounding text

SPECIFIC PATTERNS TO LOOK FOR:
- Form fields with sensitive names/IDs
- Elements with class="sensitive-text" and data-type attributes
- Text content containing email patterns: user@domain.com
- Text content containing phone patterns: (555) 123-4567
- Text content containing credit card patterns: 4111-1111-1111-1111
- Text content containing SSN patterns: 123-45-6789

RESPONSE FORMAT:
Return a JSON array of objects, each containing:
{
  "selector": "CSS selector to uniquely identify the element",
  "type": "password|email|phone|ssn|credit_card|address|name|date_of_birth|security_code|pin|account_number|other",
  "confidence": 0.0-1.0,
  "reasoning": "explanation of why this field is sensitive",
  "context": "surrounding context",
  "risk_level": "high|medium|low",
  "recommendation": "suggested security measure",
  "isTextContent": "true if this is display-only text content"
}

IMPORTANT: 
- Return ONLY the JSON array, no other text
- Be thorough but focused on viewport content
- Look for both form fields AND text content
- Focus on high-confidence detections only`;
}

// Helper function to get tab ID from page info
function getTabIdFromPageInfo(pageInfo) {
  // Try to get tab ID from various sources
  if (pageInfo.tabId) {
    return pageInfo.tabId;
  }
  
  // If not available, try to get active tab
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        resolve(tabs[0].id);
      } else {
        resolve(null);
      }
    });
  });
}

// Helper function to find NEW AI-detected fields (not already detected by pattern)
function findNewAIDetectedFields(patternFields, aiFields) {
  console.log('🔍 Finding NEW AI-detected fields...');
  
  // Create a set of pattern-detected selectors for fast lookup
  const patternSelectors = new Set();
  patternFields.forEach(field => {
    patternSelectors.add(field.selector.toLowerCase());
  });
  
  // Find AI fields that are NOT in pattern fields
  const newAIFields = aiFields.filter(aiField => {
    const aiSelector = aiField.selector.toLowerCase();
    const isNew = !patternSelectors.has(aiSelector);
    
    if (isNew) {
      console.log(`🆕 NEW AI field found: ${aiField.selector} (${aiField.type})`);
    }
    
    return isNew;
  });
  
  console.log(`🔍 AI Analysis: ${aiFields.length} total AI fields, ${newAIFields.length} are NEW`);
  
  return newAIFields;
}

// Helper function to combine and deduplicate fields (kept for compatibility)
function combineAndDeduplicateFields(patternFields, aiFields) {
  console.log('🔄 Combining and deduplicating fields...');
  
  const allFields = [...patternFields, ...aiFields];
  const uniqueFields = [];
  const seenSelectors = new Set();
  
  allFields.forEach(field => {
    // Use selector as unique identifier
    const uniqueKey = field.selector.toLowerCase();
    
    if (!seenSelectors.has(uniqueKey)) {
      seenSelectors.add(uniqueKey);
      uniqueFields.push(field);
    } else {
      // If duplicate, keep the one with higher confidence
      const existingIndex = uniqueFields.findIndex(f => 
        f.selector.toLowerCase() === uniqueKey);
      
      if (existingIndex >= 0 && field.confidence > uniqueFields[existingIndex].confidence) {
        uniqueFields[existingIndex] = field;
      }
    }
  });
  
  console.log(`🔄 Deduplication: ${allFields.length} total → ${uniqueFields.length} unique`);
  return uniqueFields;
}

// NEW: Fallback pattern detection for obvious sensitive fields
function performFallbackPatternDetection(rawDOM, pageInfo) {
  console.log('🔄 Performing fallback pattern detection...');
  
  const fallbackFields = [];
  
  try {
    // Use regex-based parsing instead of DOMParser for background script compatibility
    const sensitiveFields = parseSensitiveFieldsFromHTML(rawDOM);
    
    console.log('🔄 Fallback detection found', sensitiveFields.length, 'sensitive fields');
    
    return sensitiveFields;
    
  } catch (error) {
    console.error('❌ Error in fallback pattern detection:', error);
    return [];
  }
}

// NEW: Regex-based sensitive field parsing
function parseSensitiveFieldsFromHTML(html) {
  const fields = [];
  
  // Pattern to match input elements
  const inputPattern = /<input[^>]*>/gi;
  const textareaPattern = /<textarea[^>]*>/gi;
  const selectPattern = /<select[^>]*>/gi;
  
  // Pattern to match text content elements (for sensitive text detection)
  const textContentPattern = /<[^>]*class[^>]*sensitive-text[^>]*>([^<]*)<\/[^>]*>/gi;
  const spanPattern = /<span[^>]*data-type[^>]*>([^<]*)<\/span>/gi;
  const pPattern = /<p[^>]*>([^<]*<[^>]*sensitive-text[^>]*>[^<]*<\/[^>]*>[^<]*)<\/p>/gi;
  
  // Combine all patterns
  const allPatterns = [
    { pattern: inputPattern, tag: 'input' },
    { pattern: textareaPattern, tag: 'textarea' },
    { pattern: selectPattern, tag: 'select' }
  ];
  
  allPatterns.forEach(({ pattern, tag }) => {
    let match;
    let index = 0;
    
    while ((match = pattern.exec(html)) !== null) {
      index++;
      const elementHTML = match[0];
      
      // Extract attributes using regex
      const type = extractAttribute(elementHTML, 'type') || 'text';
      const name = extractAttribute(elementHTML, 'name') || '';
      const id = extractAttribute(elementHTML, 'id') || '';
      const placeholder = extractAttribute(elementHTML, 'placeholder') || '';
      const className = extractAttribute(elementHTML, 'class') || '';
      const dataTestId = extractAttribute(elementHTML, 'data-testid') || '';
      const ariaLabel = extractAttribute(elementHTML, 'aria-label') || '';
      const role = extractAttribute(elementHTML, 'role') || '';
      
      let detectedType = null;
      let confidence = 0.0;
      let reasoning = '';
      
      // Enhanced detection patterns for modern web apps
      const allAttributes = `${name} ${id} ${placeholder} ${className} ${dataTestId} ${ariaLabel} ${role}`.toLowerCase();
      
      // Password detection
      if (type === 'password' || 
          allAttributes.includes('password') ||
          allAttributes.includes('passwd') ||
          allAttributes.includes('pwd')) {
        detectedType = 'password';
        confidence = 0.95;
        reasoning = 'Password field detected by type, name, id, placeholder, or other attributes';
      }
      // Email detection
      else if (type === 'email' || 
               allAttributes.includes('email') ||
               allAttributes.includes('mail') ||
               allAttributes.includes('e-mail')) {
        detectedType = 'email';
        confidence = 0.95;
        reasoning = 'Email field detected by type, name, id, placeholder, or other attributes';
      }
      // Phone detection
      else if (type === 'tel' || 
               allAttributes.includes('phone') ||
               allAttributes.includes('mobile') ||
               allAttributes.includes('cell') ||
               allAttributes.includes('telephone')) {
        detectedType = 'phone';
        confidence = 0.90;
        reasoning = 'Phone field detected by type, name, id, placeholder, or other attributes';
      }
      // Token detection
      else if (allAttributes.includes('token') ||
               allAttributes.includes('csrf') ||
               allAttributes.includes('auth') ||
               allAttributes.includes('session') ||
               allAttributes.includes('script')) {
        detectedType = 'token';
        confidence = 0.90;
        reasoning = 'Security token field detected by name, id, or other attributes';
      }
      // Username detection
      else if (allAttributes.includes('username') ||
               allAttributes.includes('user') ||
               allAttributes.includes('login') ||
               allAttributes.includes('account')) {
        detectedType = 'name';
        confidence = 0.85;
        reasoning = 'Username field detected by name, id, or other attributes';
      }
      // Name detection
      else if (allAttributes.includes('name') ||
               allAttributes.includes('first') ||
               allAttributes.includes('last') ||
               allAttributes.includes('full')) {
        detectedType = 'name';
        confidence = 0.80;
        reasoning = 'Name field detected by name, id, or other attributes';
      }
      // Address detection
      else if (allAttributes.includes('address') ||
               allAttributes.includes('street') ||
               allAttributes.includes('city') ||
               allAttributes.includes('state') ||
               allAttributes.includes('zip') ||
               allAttributes.includes('postal')) {
        detectedType = 'address';
        confidence = 0.85;
        reasoning = 'Address field detected by name, id, or other attributes';
      }
      // Date of birth detection
      else if (type === 'date' ||
               allAttributes.includes('birth') ||
               allAttributes.includes('dob') ||
               allAttributes.includes('age') ||
               allAttributes.includes('date')) {
        detectedType = 'date_of_birth';
        confidence = 0.85;
        reasoning = 'Date of birth field detected by type, name, id, or other attributes';
      }
      // SSN detection
      else if (allAttributes.includes('ssn') ||
               allAttributes.includes('social') ||
               allAttributes.includes('security')) {
        detectedType = 'ssn';
        confidence = 0.90;
        reasoning = 'SSN field detected by name, id, or other attributes';
      }
      // Credit card detection
      else if (allAttributes.includes('credit') ||
               allAttributes.includes('card') ||
               allAttributes.includes('cc') ||
               allAttributes.includes('cvv') ||
               allAttributes.includes('cvc')) {
        detectedType = 'credit_card';
        confidence = 0.90;
        reasoning = 'Credit card field detected by name, id, or other attributes';
      }
      // Account number detection
      else if (allAttributes.includes('account') ||
               allAttributes.includes('bank') ||
               allAttributes.includes('routing') ||
               allAttributes.includes('iban')) {
        detectedType = 'account_number';
        confidence = 0.85;
        reasoning = 'Account number field detected by name, id, or other attributes';
      }
      // Country detection
      else if (allAttributes.includes('country') ||
               allAttributes.includes('nation')) {
        detectedType = 'location';
        confidence = 0.80;
        reasoning = 'Country field detected by name, id, or other attributes';
      }
      
      if (detectedType) {
        // Generate a selector
        let selector = '';
        if (id) {
          selector = `#${id}`;
        } else if (name) {
          selector = `${tag}[name="${name}"]`;
        } else if (dataTestId) {
          selector = `[data-testid="${dataTestId}"]`;
        } else {
          selector = `${tag}[type="${type}"]:nth-of-type(${index})`;
        }
        
        fields.push({
          selector: selector,
          type: detectedType,
          confidence: confidence,
          reasoning: reasoning,
          context: `type="${type}" name="${name}" id="${id}" placeholder="${placeholder}" class="${className}" data-testid="${dataTestId}" aria-label="${ariaLabel}" role="${role}"`,
          risk_level: 'high',
          recommendation: 'Ensure proper encryption and secure transmission'
        });
      }
    }
  });
  
  // NEW: Detect sensitive text content in regular HTML elements
  console.log('🔍 Scanning for sensitive text content...');
  
  // Pattern 1: Look for elements with class="sensitive-text"
  let textContentMatch;
  let textContentIndex = 0;
  
  while ((textContentMatch = textContentPattern.exec(html)) !== null) {
    textContentIndex++;
    const fullMatch = textContentMatch[0];
    const textContent = textContentMatch[1] || '';
    
    // Extract data-type attribute
    const dataTypeMatch = fullMatch.match(/data-type="([^"]*)"/i);
    const dataType = dataTypeMatch ? dataTypeMatch[1] : '';
    
    // Extract id attribute
    const idMatch = fullMatch.match(/id="([^"]*)"/i);
    const id = idMatch ? idMatch[1] : '';
    
    // Extract class attribute
    const classMatch = fullMatch.match(/class="([^"]*)"/i);
    const className = classMatch ? classMatch[1] : '';
    
    if (textContent.trim() && dataType) {
      let detectedType = dataType;
      let confidence = 0.85;
      let reasoning = `Sensitive text content detected with data-type="${dataType}"`;
      
      // Enhance confidence based on content patterns
      if (textContent.includes('@') && textContent.includes('.')) {
        detectedType = 'email';
        confidence = 0.95;
        reasoning = 'Email address detected in text content';
      } else if (textContent.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/)) {
        detectedType = 'phone';
        confidence = 0.90;
        reasoning = 'Phone number pattern detected in text content';
      } else if (textContent.match(/\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}/)) {
        detectedType = 'credit-card';
        confidence = 0.95;
        reasoning = 'Credit card number pattern detected in text content';
      } else if (textContent.match(/\d{3}-\d{2}-\d{4}/)) {
        detectedType = 'ssn';
        confidence = 0.95;
        reasoning = 'SSN pattern detected in text content';
      }
      
      // Generate more specific selector
      let selector = '';
      if (id) {
        selector = `#${id}`;
      } else if (dataType) {
        selector = `.sensitive-text[data-type="${dataType}"]:nth-of-type(${textContentIndex})`;
      } else {
        selector = `.sensitive-text:nth-of-type(${textContentIndex})`;
      }
      
      fields.push({
        selector: selector,
        type: detectedType,
        confidence: confidence,
        reasoning: reasoning,
        context: `data-type="${dataType}" class="${className}" text="${textContent.substring(0, 50)}"`,
        risk_level: 'high',
        recommendation: 'Mask sensitive text content to prevent exposure',
        textContent: textContent,
        isTextContent: true
      });
      
      console.log(`🎯 Detected sensitive text: ${detectedType} - ${textContent.substring(0, 30)}... (selector: ${selector})`);
    }
  }
  
  // Pattern 2: Look for span elements with data-type attribute
  let spanMatch;
  let spanIndex = 0;
  
  while ((spanMatch = spanPattern.exec(html)) !== null) {
    spanIndex++;
    const fullMatch = spanMatch[0];
    const textContent = spanMatch[1] || '';
    
    // Extract data-type attribute
    const dataTypeMatch = fullMatch.match(/data-type="([^"]*)"/i);
    const dataType = dataTypeMatch ? dataTypeMatch[1] : '';
    
    // Extract id attribute
    const idMatch = fullMatch.match(/id="([^"]*)"/i);
    const id = idMatch ? idMatch[1] : '';
    
    if (textContent.trim() && dataType) {
      // Generate more specific selector for span elements
      let selector = '';
      if (id) {
        selector = `#${id}`;
      } else if (dataType) {
        selector = `span[data-type="${dataType}"]:nth-of-type(${spanIndex})`;
      } else {
        selector = `span:nth-of-type(${spanIndex})`;
      }
      
      fields.push({
        selector: selector,
        type: dataType,
        confidence: 0.90,
        reasoning: `Sensitive text content detected in span with data-type="${dataType}"`,
        context: `data-type="${dataType}" text="${textContent.substring(0, 50)}"`,
        risk_level: 'high',
        recommendation: 'Mask sensitive text content to prevent exposure',
        textContent: textContent,
        isTextContent: true
      });
      
      console.log(`🎯 Detected sensitive span text: ${dataType} - ${textContent.substring(0, 30)}... (selector: ${selector})`);
    }
  }
  
  // Also check for contenteditable elements
  const contentEditablePattern = /<[^>]*contenteditable="true"[^>]*>/gi;
  let contentEditableMatch;
  let contentEditableIndex = 0;
  
  while ((contentEditableMatch = contentEditablePattern.exec(html)) !== null) {
    contentEditableIndex++;
    const elementHTML = contentEditableMatch[0];
    
    const className = extractAttribute(elementHTML, 'class') || '';
    const id = extractAttribute(elementHTML, 'id') || '';
    const ariaLabel = extractAttribute(elementHTML, 'aria-label') || '';
    
    const allAttributes = `${className} ${id} ${ariaLabel}`.toLowerCase();
    
    if (allAttributes.includes('email') || allAttributes.includes('phone') || 
        allAttributes.includes('address') || allAttributes.includes('name')) {
      
      let detectedType = 'other';
      if (allAttributes.includes('email')) detectedType = 'email';
      else if (allAttributes.includes('phone')) detectedType = 'phone';
      else if (allAttributes.includes('address')) detectedType = 'address';
      else if (allAttributes.includes('name')) detectedType = 'name';
      
      fields.push({
        selector: `[contenteditable="true"]:nth-of-type(${contentEditableIndex})`,
        type: detectedType,
        confidence: 0.75,
        reasoning: 'Contenteditable field detected as potentially sensitive',
        context: `class="${className}" id="${id}" aria-label="${ariaLabel}"`,
        risk_level: 'medium',
        recommendation: 'Review contenteditable elements for sensitive data'
      });
    }
  }
  
  console.log(`📊 Total sensitive fields detected: ${fields.length} (including ${fields.filter(f => f.isTextContent).length} text content elements)`);
  
  return fields;
}

// Helper function to extract attribute values from HTML
function extractAttribute(html, attributeName) {
  const pattern = new RegExp(`${attributeName}=["']([^"']*)["']`, 'i');
  const match = html.match(pattern);
  return match ? match[1] : '';
}

function logSensitiveFieldResults(sensitiveFields, pageInfo) {
  console.log('📊 SENSITIVE FIELD DETECTION RESULTS:');
  console.log('=' .repeat(60));
  console.log('🌐 Page:', pageInfo.url || 'Unknown');
  console.log('📄 Title:', pageInfo.title || 'Unknown');
  console.log('🎯 Total Fields Detected:', sensitiveFields.length);
  
  // Separate form fields from text content
  const formFields = sensitiveFields.filter(field => !field.isTextContent);
  const textContentFields = sensitiveFields.filter(field => field.isTextContent);
  
  console.log('📝 Form Fields:', formFields.length);
  console.log('📄 Text Content Fields:', textContentFields.length);
  
  // Show detection method breakdown if available
  if (pageInfo.patternFields !== undefined && pageInfo.aiFields !== undefined) {
    console.log('🔍 Detection Method Breakdown:');
    console.log(`  🎯 Pattern Detection: ${pageInfo.patternFields} fields`);
    console.log(`  🧠 AI Detection: ${pageInfo.totalAIFields || pageInfo.aiFields} total fields`);
    console.log(`  🆕 NEW AI Fields: ${pageInfo.aiFields} fields`);
    console.log(`  🔄 Combined: ${sensitiveFields.length} fields`);
  }
  
  console.log('');
  
  if (sensitiveFields.length === 0) {
    console.log('✅ No sensitive fields detected - page appears secure');
    return;
  }
  
  // Group by type
  const fieldsByType = {};
  const fieldsByRisk = { high: [], medium: [], low: [] };
  
  sensitiveFields.forEach(field => {
    // Group by type
    if (!fieldsByType[field.type]) {
      fieldsByType[field.type] = [];
    }
    fieldsByType[field.type].push(field);
    
    // Group by risk level
    fieldsByRisk[field.risk_level].push(field);
  });
  
  // Log summary by type
  console.log('📋 DETECTION SUMMARY BY TYPE:');
  Object.entries(fieldsByType).forEach(([type, fields]) => {
    console.log(`  ${type.toUpperCase()}: ${fields.length} fields`);
  });
  
  console.log('');
  console.log('⚠️ RISK LEVEL BREAKDOWN:');
  console.log(`  HIGH RISK: ${fieldsByRisk.high.length} fields`);
  console.log(`  MEDIUM RISK: ${fieldsByRisk.medium.length} fields`);
  console.log(`  LOW RISK: ${fieldsByRisk.low.length} fields`);
  
  console.log('');
  console.log('🔍 DETAILED FIELD ANALYSIS:');
  sensitiveFields.forEach((field, index) => {
    const fieldType = field.isTextContent ? 'TEXT CONTENT' : 'FORM FIELD';
    console.log(`\n${index + 1}. ${field.type.toUpperCase()} ${fieldType}:`);
    console.log(`   Selector: ${field.selector}`);
    console.log(`   Confidence: ${Math.round(field.confidence * 100)}%`);
    console.log(`   Risk Level: ${field.risk_level.toUpperCase()}`);
    console.log(`   Reasoning: ${field.reasoning}`);
    console.log(`   Context: ${field.context}`);
    if (field.textContent) {
      console.log(`   Text Content: "${field.textContent}"`);
    }
    console.log(`   Recommendation: ${field.recommendation}`);
  });
  
  console.log('');
  console.log('🛡️ SECURITY RECOMMENDATIONS:');
  if (fieldsByRisk.high.length > 0) {
    console.log('  ⚠️  HIGH RISK FIELDS DETECTED - Immediate attention required');
    fieldsByRisk.high.forEach(field => {
      console.log(`    - ${field.type}: ${field.recommendation}`);
    });
  }
  
  if (fieldsByRisk.medium.length > 0) {
    console.log('  🔶 MEDIUM RISK FIELDS - Review security measures');
  }
  
  console.log('=' .repeat(60));
}

// Helper function to call the masking API using Chrome extension API
function executeMaskingScript(tabId, selectors, detectionType = 'unknown') {
  console.log(`🎭 Calling masking API with selectors (${detectionType}):`, selectors);
  
  // Debug: Test a few selectors to see if they exist in the DOM
  if (selectors.length > 0) {
    console.log('🔍 Testing first few selectors for DOM existence...');
    const testSelectors = selectors.slice(0, 5);
    
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: (testSelectors) => {
        console.log('🔍 Testing selectors in page context:');
        testSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          console.log(`  ${selector}: ${elements.length} elements found`);
          if (elements.length > 0) {
            console.log(`    First element:`, elements[0]);
          }
        });
      },
      args: [testSelectors]
    }, (results) => {
      if (chrome.runtime.lastError) {
        console.warn('⚠️ Could not test selectors:', chrome.runtime.lastError);
      } else {
        console.log('✅ Selector testing completed');
      }
    });
  }
  
  // Try method 1: Direct Chrome API (if available)
  if (chrome.wootz && chrome.wootz.maskSensitiveElements) {
    console.log('✅ Using direct Chrome API: chrome.wootz.maskSensitiveElements');
    chrome.wootz.maskSensitiveElements(selectors, (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Direct API masking failed:', chrome.runtime.lastError.message);
        // Fallback to method 2
        tryMessagingAPI(selectors);
      } else {
        console.log('✅ Direct API masking successful:', response);
        
        // If no elements were masked, try to debug why
        if (response.masked === 0 && selectors.length > 0) {
          console.log('⚠️ No elements masked, checking if selectors exist in DOM...');
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            func: (selectors) => {
              console.log('🔍 Checking selector existence for masking...');
              let foundCount = 0;
              selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                  foundCount += elements.length;
                  console.log(`  ✅ ${selector}: ${elements.length} elements found`);
                } else {
                  console.log(`  ❌ ${selector}: No elements found`);
                }
              });
              console.log(`📊 Total elements found: ${foundCount} out of ${selectors.length} selectors`);
              return { foundCount, totalSelectors: selectors.length };
            },
            args: [selectors]
          }, (results) => {
            if (results && results[0]) {
              console.log('🔍 Selector existence check result:', results[0].result);
            }
          });
        }
      }
    });
  } else {
    console.log('⚠️ Direct Chrome API not available, trying messaging API');
    tryMessagingAPI(selectors);
  }
}

// Fallback function using messaging API
function tryMessagingAPI(selectors) {
  console.log('🔄 Trying messaging API for masking...');
  
  chrome.runtime.sendMessage({
    method: "wootz.maskSensitiveElements",
    args: [selectors]
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('❌ Messaging API masking failed:', chrome.runtime.lastError.message);
      // Fallback to method 3: Execute script in tab
      tryExecuteScriptAPI(selectors);
    } else {
      console.log('✅ Messaging API masking successful:', response);
    }
  });
}

// Final fallback: Execute script in tab
function tryExecuteScriptAPI(selectors) {
  console.log('🔄 Trying execute script API as final fallback...');
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (selectorsArray) => {
          console.log('🎭 Background script calling browser masking API with selectors:', selectorsArray);
          
          if (window.WootzMaskSensitiveElementsFunction) {
            window.WootzMaskSensitiveElementsFunction(selectorsArray, (result) => {
              console.log('✅ Browser masking API completed, result:', result);
              return result;
            });
          } else {
            console.warn('⚠️ WootzMaskSensitiveElementsFunction not available in browser');
            return { success: false, error: 'Browser masking API not available' };
          }
        },
        args: [selectors]
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.warn('⚠️ Could not execute masking script:', chrome.runtime.lastError);
        } else {
          console.log('✅ Execute script masking successful, results:', results);
        }
      });
    } else {
      console.error('❌ No active tab found for execute script fallback');
    }
  });
}

console.log('✅ Background script ready with enhanced AI classification');
