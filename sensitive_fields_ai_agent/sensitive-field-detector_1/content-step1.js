// STEP 1: Pre-Visibility Smart DOM Detection
console.log('🚀 STEP 1: Content script loaded EARLY!', {
  url: window.location.href,
  readyState: document.readyState,
  timestamp: new Date().toISOString()
});

// Global state
let isExtensionEnabled = false;
let detectedElements = new Map();
let lastScanHash = '';
let scanTimeout = null;
let userActivityTimeout = null;
let isUserActive = false;
let earlyDetectionComplete = false;
let pendingAIAnalysis = []; // Track pending AI operations
let isRawDOMAnalysisRunning = false; // NEW: Track raw DOM analysis state

// Browser API Integration
let preVisibilityFieldsList = []; // Pattern-based sensitive fields detected pre-visibility
let aiDetectedFieldsList = []; // AI-detected sensitive fields from Gemini analysis
let lastSentPreVisibilityHash = ''; // Track what was last sent for pre-visibility
let lastSentAIHash = ''; // Track what was last sent for AI detection

// Performance tracking
let performanceTimestamps = {
  scriptStart: Date.now(),
  extensionEnabled: null,
  preVisibilityStart: null,
  firstElementDetected: null,
  preVisibilityListSent: null,
  aiAnalysisStart: null,
  aiAnalysisComplete: null,
  aiListSent: null,
  rawDOMAnalysisStart: null // NEW: Track raw DOM analysis start time
};

// URL change detection for SPA navigation
let currentURL = window.location.href;

// Configuration
const CONFIG = {
  SCAN_DEBOUNCE_DELAY: 1000,    // Wait time before scanning
  USER_ACTIVITY_TIMEOUT: 5000,  // Consider user inactive after 5s
  MAX_SCAN_FREQUENCY: 5000,     // Maximum scan frequency
  SIGNIFICANT_CHANGE_THRESHOLD: 1, // Trigger AI analysis for any new sensitive elements
  EARLY_SCAN_INTERVAL: 100      // Check every 100ms during early loading
};

// Initialize URL change detection
setupURLChangeDetection();

// Start immediately - even before DOM is ready
initializeEarly();

async function initializeEarly() {
  console.log('⚡ Early initialization starting...');
  performanceTimestamps.initStart = Date.now();
  
  // Get extension state as early as possible
  try {
    const result = await chrome.storage.sync.get(['extensionEnabled']);
    isExtensionEnabled = result.extensionEnabled || false;
    performanceTimestamps.extensionEnabled = Date.now();
    
    console.log('✅ Extension enabled state loaded early:', isExtensionEnabled, {
      timeSinceStart: performanceTimestamps.extensionEnabled - performanceTimestamps.scriptStart + 'ms'
    });
    
    if (isExtensionEnabled) {
      startPreVisibilityDetection();
    }
  } catch (error) {
    console.log('⚠️ Early storage access failed, will retry on DOM ready');
  }
  
  // Set up storage listener
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.extensionEnabled) {
      isExtensionEnabled = changes.extensionEnabled.newValue;
      console.log('🔄 Extension state changed early:', isExtensionEnabled);
      
      if (isExtensionEnabled) {
        startPreVisibilityDetection();
      } else {
        stopDOMMonitoring();
      }
    }
  });
  
  performanceTimestamps.initComplete = Date.now();
  console.log('🎯 Early initialization complete', {
    totalInitTime: performanceTimestamps.initComplete - performanceTimestamps.scriptStart + 'ms'
  });
}

function startPreVisibilityDetection() {
  console.log('👁️ Starting PRE-VISIBILITY detection...');
  performanceTimestamps.preVisibilityStart = Date.now();
  
  console.log('⏱️ TIMESTAMP: Pre-visibility detection started', {
    timeSinceStart: performanceTimestamps.preVisibilityStart - performanceTimestamps.scriptStart + 'ms',
    timeSinceInit: performanceTimestamps.preVisibilityStart - performanceTimestamps.initComplete + 'ms'
  });
  
  // Immediate scan of whatever exists
  performEarlyScan('immediate').catch(error => {
    console.warn('⚠️ Early scan failed:', error);
  });
  
  // Keep scanning during page load
  const earlyDetectionInterval = setInterval(async () => {
    if (document.readyState === 'complete') {
      console.log('🏁 Page fully loaded, stopping early detection');
      clearInterval(earlyDetectionInterval);
      earlyDetectionComplete = true;
      
      performanceTimestamps.pageLoadComplete = Date.now();
      console.log('⏱️ TIMESTAMP: Page load complete', {
        totalLoadTime: performanceTimestamps.pageLoadComplete - performanceTimestamps.scriptStart + 'ms'
      });
      
      // WAIT for any pending AI analysis to complete before showing page
      await waitForPendingAIAnalysis();
      
      console.log('🔄 Early detection complete');
      return;
    }
    
    // Continue early scanning while page loads
    await performEarlyScan('pre-load');
  }, CONFIG.EARLY_SCAN_INTERVAL);
  
  // Backup: start normal monitoring on DOMContentLoaded
  document.addEventListener('DOMContentLoaded', () => {
    performanceTimestamps.domContentLoaded = Date.now();
    console.log('📄 DOMContentLoaded - ensuring monitoring is active', {
      timeSinceStart: performanceTimestamps.domContentLoaded - performanceTimestamps.scriptStart + 'ms'
    });
    
    if (!earlyDetectionComplete) {
      clearInterval(earlyDetectionInterval);
    }
    
    // Perform a final scan to catch any elements missed during early detection
    setTimeout(async () => {
      console.log('🔄 Final backup scan after DOMContentLoaded...');
      await performEarlyScan('dom-content-loaded');
    }, 500);
  });
  
  // Additional backup scan when window loads completely
  window.addEventListener('load', async () => {
    performanceTimestamps.windowLoaded = Date.now();
    console.log('🎯 Window fully loaded - performing final scan...', {
      timeSinceStart: performanceTimestamps.windowLoaded - performanceTimestamps.scriptStart + 'ms'
    });
    
    await performEarlyScan('window-loaded');
  });
}

async function performEarlyScan(phase) {
  if (!isExtensionEnabled) return;
  
  const scanStartTime = Date.now();
  console.log(`⏱️ TIMESTAMP: Early scan started (${phase})`, {
    timeSinceStart: scanStartTime - performanceTimestamps.scriptStart + 'ms'
  });
  
  // Try to scan even if document isn't ready
  try {
    // RAW DOM ANALYSIS TRIGGER - MOVED TO TOP FOR EARLIER EXECUTION
    // Trigger raw DOM analysis immediately at the start of each scan phase
    if (phase === 'immediate' || phase === 'pre-load') {
      console.log('🚀 ULTRA-EARLY: Triggering raw DOM analysis at scan start...', {
        phase: phase,
        timeSinceStart: Date.now() - performanceTimestamps.scriptStart + 'ms'
      });
      
      // Check if raw DOM analysis is already running
      if (isRawDOMAnalysisRunning) {
        console.log('⏸️ ULTRA-EARLY: Raw DOM analysis already running, skipping...');
      } else {
        // Set flag to prevent multiple simultaneous analyses
        isRawDOMAnalysisRunning = true;
        performanceTimestamps.rawDOMAnalysisStart = Date.now();
        
        // Trigger raw DOM analysis in background (don't await to avoid blocking)
        sendRawDOMToGemini()
          .then(result => {
            console.log('✅ ULTRA-EARLY: Raw DOM analysis completed successfully', {
              fieldsDetected: result.sensitiveFields?.length || 0,
              processingTime: result.processingTime,
              phase: phase,
              totalTime: Date.now() - performanceTimestamps.rawDOMAnalysisStart + 'ms'
            });
            isRawDOMAnalysisRunning = false; // Reset flag
          })
          .catch(error => {
            console.error('❌ ULTRA-EARLY: Raw DOM analysis failed:', error);
            isRawDOMAnalysisRunning = false; // Reset flag on error
          });
      }
    }
    
    // COMMENTED OUT: Phase 1: Scan for visible text content containing sensitive information
    // await scanVisibleTextContent(phase);
    
    // Phase 2: Scan for form input elements (PRE-VISIBILITY DETECTION - KEPT ACTIVE)
    const inputs = document.querySelectorAll('input, textarea, select');
    const allTextElements = document.querySelectorAll('*');
    
    if (inputs.length === 0 && allTextElements.length === 0) {
      // Log that we're waiting for elements to appear
      if (phase === 'immediate') {
        console.log('⏳ No elements found yet, will keep trying...');
      }
      return; // Nothing to scan yet
    }
    
    const elementsFoundTime = Date.now();
    console.log(`🔎 Early scan (${phase}): Found ${inputs.length} form elements and ${allTextElements.length} text elements`, {
      scanTime: elementsFoundTime - scanStartTime + 'ms'
    });
    
    // Process form elements (PRE-VISIBILITY DETECTION - KEPT ACTIVE)
    const currentHash = generateElementsHash(inputs);
    if (currentHash !== lastScanHash) {
      lastScanHash = currentHash;
      let newElementsCount = 0;
      
      inputs.forEach((element, index) => {
        const elementKey = generateElementKey(element);
        
        if (detectedElements.has(elementKey)) {
          return; // Already processed
        }
        
        newElementsCount++;
        const elementInfo = extractElementInfo(element, index + 1);
        
        console.log(`🎯 PRE-VISIBILITY Form Element ${index + 1}:`, elementInfo);
        
        // Store with early detection flag
        detectedElements.set(elementKey, {
          element: element,
          info: elementInfo,
          timestamp: Date.now(),
          detectedAt: phase,
          preVisibility: true,
          elementType: 'form-input'
        });
      });
      
      if (newElementsCount > 0) {
        const processingCompleteTime = Date.now();
        
        if (!performanceTimestamps.firstElementDetected) {
          performanceTimestamps.firstElementDetected = processingCompleteTime;
          console.log('⏱️ TIMESTAMP: First form elements detected', {
            timeToFirstElement: performanceTimestamps.firstElementDetected - performanceTimestamps.scriptStart + 'ms'
          });
        }
        
        console.log(`✅ Form elements scan complete. New: ${newElementsCount}, Total: ${detectedElements.size}`, {
          processingTime: processingCompleteTime - scanStartTime + 'ms'
        });
        
        // Process form elements for sensitive field detection (PRE-VISIBILITY - KEPT ACTIVE)
        const newElements = Array.from(detectedElements.values()).slice(-newElementsCount);
        logDetectedSensitiveFields(newElements);
      }
    }
    
    // COMMENTED OUT: Process text content for displayed sensitive information
    // await scanVisibleTextContent(phase);
    
    // COMMENTED OUT: Secondary raw DOM analysis trigger (now handled at the top)
    // RAW DOM ANALYSIS TRIGGER - KEPT ACTIVE
    // Trigger raw DOM analysis immediately after DOM elements are captured
    // if (inputs.length > 0 || allTextElements.length > 0) {
    //   console.log('🚀 AUTOMATIC: Triggering raw DOM analysis after DOM capture...', {
    //     phase: phase,
    //     formElements: inputs.length,
    //     textElements: allTextElements.length,
    //     timeSinceStart: Date.now() - performanceTimestamps.scriptStart + 'ms'
    //   });
    //   
    //   // Check if raw DOM analysis is already running
    //   if (isRawDOMAnalysisRunning) {
    //     console.log('⏸️ AUTOMATIC: Raw DOM analysis already running, skipping...');
    //     return;
    //   }
    //   
    //   // Set flag to prevent multiple simultaneous analyses
    //   isRawDOMAnalysisRunning = true;
    //   performanceTimestamps.rawDOMAnalysisStart = Date.now();
    //   
    //   // Trigger raw DOM analysis in background (don't await to avoid blocking)
    //   sendRawDOMToGemini()
    //     .then(result => {
    //       console.log('✅ AUTOMATIC: Raw DOM analysis completed successfully', {
    //         fieldsDetected: result.sensitiveFields?.length || 0,
    //         processingTime: result.processingTime,
    //         phase: phase,
    //         totalTime: Date.now() - performanceTimestamps.rawDOMAnalysisStart + 'ms'
    //       });
    //       isRawDOMAnalysisRunning = false; // Reset flag
    //     })
    //     .catch(error => {
    //       console.error('❌ AUTOMATIC: Raw DOM analysis failed:', error);
    //       isRawDOMAnalysisRunning = false; // Reset flag on error
    //     });
    // }
    
    // COMMENTED OUT: Trigger AI analysis for both form elements and text content
    // if (inputs.length > 0 || allTextElements.length > 0) {
    //   performanceTimestamps.aiAnalysisStart = Date.now();
    //   console.log('🤖 Triggering COMPREHENSIVE AI analysis for all page content', {
    //     timeSinceStart: performanceTimestamps.aiAnalysisStart - performanceTimestamps.scriptStart + 'ms'
    //   });
    //   
    //   await prepareForComprehensiveAIAnalysis();
    // }
    
  } catch (error) {
    // DOM might not be ready yet, that's okay
    console.log('⏳ DOM not ready for scanning yet...');
  }
}

function logDetectedSensitiveFields(elements) {
  console.log('� Logging detected sensitive fields:', elements.length, 'elements');
  
  // Pattern-based detection for immediate logging
  elements.forEach(item => {
    const element = item.element;
    const info = item.info;
    
    // Simple sensitive field detection
    const isSensitive = detectSensitiveField(info);
    
    if (isSensitive) {
      console.log('🔐 SENSITIVE FIELD DETECTED (pre-visibility):', {
        type: info.type,
        name: info.name,
        id: info.id,
        placeholder: info.placeholder,
        url: window.location.href,
        timestamp: new Date().toISOString()
      });
      
      // Mark for tracking (no visual changes)
      element.setAttribute('data-sensitive-field', 'true');
      element.setAttribute('data-detection-phase', 'pre-visibility');
      element.setAttribute('data-detection-method', 'pattern-based');
      
      // Add to PRE-VISIBILITY browser API list (separate from AI list)
      addToPreVisibilityFieldsList(element, info, {
        detectionMethod: 'pattern-based',
        phase: 'pre-visibility',
        confidence: 0.8, // Pattern-based confidence
        category: classifyFieldCategory(info),
        sensitivity: 'high'
      });
      
      // Just log, no visual masking
      logSensitiveFieldDetails(element, info);
    }
  });
  
  const processingCompleteTime = Date.now();
  console.log('⏱️ TIMESTAMP: Pattern-based detection complete', {
    processingTime: processingCompleteTime - logStartTime + 'ms',
    sensitiveFieldsFound: preVisibilityFieldsList.length
  });
  
  // Send PRE-VISIBILITY list to browser API immediately
  sendPreVisibilityFieldsToBrowser();
}

function detectSensitiveField(elementInfo) {
  const sensitiveKeywords = [
    'password', 'passwd', 'pwd', 'pass',
    'ssn', 'social', 'security',
    'credit', 'card', 'cvv', 'cvc',
    'pin', 'code', 'otp',
    'account', 'routing', 'bank'
  ];
  
  const textToCheck = [
    elementInfo.type,
    elementInfo.name,
    elementInfo.id,
    elementInfo.placeholder
  ].join(' ').toLowerCase();
  
  return sensitiveKeywords.some(keyword => textToCheck.includes(keyword)) ||
         elementInfo.type === 'password';
}

function logSensitiveFieldDetails(element, info) {
  // Log sensitive field details for browser-level handling
  console.log('📊 SENSITIVE FIELD LOGGED:', {
    element: element,
    details: info,
    selector: generateSelector(element),
    context: getFieldContext(element),
    timestamp: new Date().toISOString()
  });
}

function generateSelector(element) {
  // Generate a unique CSS selector for the element
  if (element.id) {
    return `#${element.id}`;
  }
  
  if (element.name) {
    return `input[name="${element.name}"]`;
  }
  
  // Fallback to tag + index
  const siblings = Array.from(element.parentNode?.children || []).filter(el => el.tagName === element.tagName);
  const index = siblings.indexOf(element);
  return `${element.tagName.toLowerCase()}:nth-child(${index + 1})`;
}

function getFieldContext(element) {
  // Get surrounding context for the field
  const context = {
    form: element.closest('form')?.id || element.closest('form')?.className || 'no-form',
    label: element.labels?.[0]?.textContent?.trim() || 'no-label',
    placeholder: element.placeholder || 'no-placeholder',
    parentClass: element.parentNode?.className || 'no-parent-class'
  };
  
  return context;
}

// ====== TEXT CONTENT ANALYSIS FUNCTIONS ======

async function scanVisibleTextContent(phase) {
  const textScanStartTime = Date.now();
  console.log(`📝 Scanning visible text content for sensitive information (${phase})`);
  
  try {
    // Get all visible text elements
    const textElements = getVisibleTextElements();
    
    if (textElements.length === 0) {
      console.log('📝 No visible text elements found');
      return;
    }
    
    console.log(`📝 Found ${textElements.length} visible text elements to analyze`);
    
    // Pattern-based detection for immediate identification
    const detectedTextInfo = [];
    
    textElements.forEach((elementData, index) => {
      const sensitiveInfo = detectSensitiveTextContent(elementData.text, elementData.element);
      
      if (sensitiveInfo.length > 0) {
        console.log(`📋 SENSITIVE TEXT CONTENT DETECTED:`, {
          element: elementData.element.tagName,
          selector: generateSelector(elementData.element),
          detectedInfo: sensitiveInfo,
          text: elementData.text.substring(0, 100) + (elementData.text.length > 100 ? '...' : '')
        });
        
        detectedTextInfo.push({
          element: elementData.element,
          text: elementData.text,
          sensitiveInfo: sensitiveInfo,
          index: index,
          detectedAt: phase,
          elementType: 'text-content'
        });
      }
    });
    
    if (detectedTextInfo.length > 0) {
      console.log(`📋 Text content scan complete. Found ${detectedTextInfo.length} elements with sensitive information`);
      
      // Add to pre-visibility list for immediate browser notification
      logDetectedSensitiveTextContent(detectedTextInfo);
    }
    
    const textScanTime = Date.now() - textScanStartTime;
    console.log(`⏱️ TIMESTAMP: Text content scan complete`, {
      processingTime: textScanTime + 'ms',
      elementsScanned: textElements.length,
      sensitiveFound: detectedTextInfo.length
    });
    
  } catch (error) {
    console.error('❌ Error scanning text content:', error);
  }
}

function getVisibleTextElements() {
  const textElements = [];
  
  // Select elements that typically contain visible text
  const candidateSelectors = [
    'p', 'span', 'div', 'td', 'th', 'li', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    '.text', '.content', '.info', '.data', '.details', '.summary', '.description',
    '[class*="text"]', '[class*="content"]', '[class*="info"]', '[class*="data"]'
  ];
  
  candidateSelectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (isElementVisibleForText(element)) {
          const text = getElementTextContent(element);
          if (text && text.trim().length > 3) { // Only meaningful text
            textElements.push({
              element: element,
              text: text.trim(),
              selector: generateSelector(element)
            });
          }
        }
      });
    } catch (error) {
      // Skip invalid selectors
    }
  });
  
  return textElements;
}

function isElementVisibleForText(element) {
  try {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           !element.hidden &&
           // Exclude script/style content
           !['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName) &&
           // Must have actual text content
           element.textContent && element.textContent.trim().length > 0;
  } catch (e) {
    return false;
  }
}

function getElementTextContent(element) {
  // Get direct text content, excluding nested input fields
  let text = '';
  
  for (let node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE && 
               !['INPUT', 'TEXTAREA', 'SELECT', 'SCRIPT', 'STYLE'].includes(node.tagName)) {
      // Recursively get text from non-input elements
      text += ' ' + getElementTextContent(node);
    }
  }
  
  return text.replace(/\s+/g, ' ').trim();
}

function detectSensitiveTextContent(text, element) {
  const sensitiveMatches = [];
  
  // Phone number patterns
  const phonePatterns = [
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,                    // US phone numbers
    /\b\(\d{3}\)\s?\d{3}[-.]?\d{4}\b/g,                  // (123) 456-7890
    /\b\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}\b/g // International
  ];
  
  // Email patterns
  const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  
  // Credit card patterns (basic)
  const cardPatterns = [
    /\b4\d{3}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,      // Visa
    /\b5[1-5]\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, // MasterCard
    /\b3[47]\d{2}[-\s]?\d{6}[-\s]?\d{5}\b/g,             // Amex
    /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g        // Generic card format
  ];
  
  // SSN patterns
  const ssnPattern = /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g;
  
  // IP Address patterns
  const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
  
  // Check for phone numbers
  phonePatterns.forEach((pattern, index) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        sensitiveMatches.push({
          type: 'phone',
          value: match,
          category: 'personal-info',
          confidence: 0.85,
          pattern: `phone-${index + 1}`
        });
      });
    }
  });
  
  // Check for email addresses
  const emailMatches = text.match(emailPattern);
  if (emailMatches) {
    emailMatches.forEach(match => {
      sensitiveMatches.push({
        type: 'email',
        value: match,
        category: 'personal-info',
        confidence: 0.9,
        pattern: 'email'
      });
    });
  }
  
  // Check for credit cards
  cardPatterns.forEach((pattern, index) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Basic Luhn algorithm check for credit cards
        const cleaned = match.replace(/[-\s]/g, '');
        if (cleaned.length >= 13 && cleaned.length <= 19) {
          sensitiveMatches.push({
            type: 'credit-card',
            value: match,
            category: 'financial',
            confidence: 0.8,
            pattern: `card-${index + 1}`
          });
        }
      });
    }
  });
  
  // Check for SSN
  const ssnMatches = text.match(ssnPattern);
  if (ssnMatches) {
    ssnMatches.forEach(match => {
      sensitiveMatches.push({
        type: 'ssn',
        value: match,
        category: 'personal-id',
        confidence: 0.75,
        pattern: 'ssn'
      });
    });
  }
  
  // Check for IP addresses
  const ipMatches = text.match(ipPattern);
  if (ipMatches) {
    ipMatches.forEach(match => {
      sensitiveMatches.push({
        type: 'ip-address',
        value: match,
        category: 'technical-info',
        confidence: 0.7,
        pattern: 'ip'
      });
    });
  }
  
  return sensitiveMatches;
}

function logDetectedSensitiveTextContent(detectedTextInfo) {
  const logStartTime = Date.now();
  console.log('📋 Logging detected sensitive text content:', detectedTextInfo.length, 'elements');
  
  detectedTextInfo.forEach(item => {
    item.sensitiveInfo.forEach(info => {
      console.log('🔍 SENSITIVE TEXT CONTENT DETECTED:', {
        type: info.type,
        category: info.category,
        confidence: info.confidence,
        element: item.element.tagName,
        selector: generateSelector(item.element),
        maskedValue: maskSensitiveValue(info.value, info.type),
        timestamp: new Date().toISOString()
      });
      
      // Mark element for tracking
      item.element.setAttribute('data-sensitive-text', 'true');
      item.element.setAttribute('data-text-category', info.category);
      item.element.setAttribute('data-text-type', info.type);
      
      // Add to pre-visibility list for browser API
      addToPreVisibilityTextContentList(item.element, info, {
        detectionMethod: 'pattern-based-text',
        phase: 'pre-visibility',
        confidence: info.confidence,
        category: info.category,
        sensitivity: getSensitivityLevel(info.category),
        originalText: item.text,
        sensitiveValue: info.value
      });
    });
  });
  
  const processingCompleteTime = Date.now();
  console.log('⏱️ TIMESTAMP: Text content detection complete', {
    processingTime: processingCompleteTime - logStartTime + 'ms',
    totalSensitiveItems: detectedTextInfo.reduce((sum, item) => sum + item.sensitiveInfo.length, 0)
  });
  
  // Send text content to browser API
  sendPreVisibilityTextContentToBrowser();
}

function maskSensitiveValue(value, type) {
  switch (type) {
    case 'phone':
      return value.replace(/\d/g, '*').replace(/\*/g, (match, offset) => 
        offset < 3 ? value[offset] : '*');
    case 'email':
      const parts = value.split('@');
      return parts[0].substring(0, 2) + '***@' + parts[1];
    case 'credit-card':
      return '**** **** **** ' + value.slice(-4);
    case 'ssn':
      return '***-**-' + value.slice(-4);
    default:
      return '***';
  }
}

function getSensitivityLevel(category) {
  switch (category) {
    case 'financial':
    case 'personal-id':
      return 'high';
    case 'personal-info':
      return 'medium';
    default:
      return 'low';
  }
}

// ====== BROWSER API INTEGRATION FOR TEXT CONTENT ======

function addToPreVisibilityTextContentList(element, sensitiveInfo, metadata) {
  if (!window.preVisibilityTextContentList) {
    window.preVisibilityTextContentList = [];
  }
  
  const uniqueId = generateUniqueId(element);
  const selector = generateSelector(element);
  
  const textContentItem = {
    uniqueId: uniqueId,
    selector: selector,
    contentType: 'text-content',
    sensitiveType: sensitiveInfo.type,
    category: sensitiveInfo.category,
    confidence: sensitiveInfo.confidence,
    sensitivity: metadata.sensitivity,
    detectionMethod: metadata.detectionMethod,
    phase: metadata.phase,
    maskedValue: maskSensitiveValue(sensitiveInfo.value, sensitiveInfo.type),
    originalLength: sensitiveInfo.value.length,
    elementTag: element.tagName.toLowerCase(),
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      textLength: metadata.originalText ? metadata.originalText.length : 0,
      patternMatch: sensitiveInfo.pattern || 'unknown'
    }
  };
  
  window.preVisibilityTextContentList.push(textContentItem);
  
  console.log('📋 Added to pre-visibility text content list:', {
    uniqueId: uniqueId,
    type: sensitiveInfo.type,
    category: sensitiveInfo.category,
    listSize: window.preVisibilityTextContentList.length
  });
}

function addToAIDetectedTextContentList(element, aiAnalysis, metadata) {
  if (!window.aiDetectedTextContentList) {
    window.aiDetectedTextContentList = [];
  }
  
  const uniqueId = generateUniqueId(element);
  const selector = generateSelector(element);
  
  const aiTextContentItem = {
    uniqueId: uniqueId,
    selector: selector,
    contentType: 'text-content',
    sensitiveType: aiAnalysis.type || 'ai-detected',
    category: aiAnalysis.category || 'uncategorized',
    confidence: aiAnalysis.confidence || 0.7,
    sensitivity: metadata.sensitivity || 'medium',
    detectionMethod: 'ai-analysis',
    phase: 'ai-enhanced',
    aiReasoning: aiAnalysis.reasoning || '',
    elementTag: element.tagName.toLowerCase(),
    timestamp: new Date().toISOString(),
    metadata: {
      ...metadata,
      aiModelUsed: 'gemini-pro',
      analysisType: 'text-content-classification'
    }
  };
  
  window.aiDetectedTextContentList.push(aiTextContentItem);
  
  console.log('🤖 Added to AI-detected text content list:', {
    uniqueId: uniqueId,
    type: aiAnalysis.type,
    confidence: aiAnalysis.confidence,
    listSize: window.aiDetectedTextContentList.length
  });
}

function sendPreVisibilityTextContentToBrowser() {
  const sendStartTime = Date.now();
  
  if (!window.preVisibilityTextContentList || window.preVisibilityTextContentList.length === 0) {
    console.log('📤 No pre-visibility text content to send to browser');
    return;
  }
  
  console.log(`📤 Sending ${window.preVisibilityTextContentList.length} text content items to browser API`);
  
  try {
    if (typeof wootzSubmitSensitiveFields === 'function') {
      wootzSubmitSensitiveFields({
        type: 'text-content-detection',
        phase: 'pre-visibility',
        detectionMethod: 'pattern-based',
        textContentList: window.preVisibilityTextContentList,
        timestamp: new Date().toISOString(),
        summary: {
          totalItems: window.preVisibilityTextContentList.length,
          categories: [...new Set(window.preVisibilityTextContentList.map(item => item.category))],
          sensitivityLevels: [...new Set(window.preVisibilityTextContentList.map(item => item.sensitivity))],
          detectedTypes: [...new Set(window.preVisibilityTextContentList.map(item => item.sensitiveType))]
        }
      });
      
      console.log('✅ Text content successfully sent to browser API');
    } else {
      console.warn('⚠️ wootzSubmitSensitiveFields function not available');
    }
  } catch (error) {
    console.error('❌ Failed to send text content to browser API:', error);
  }
  
  const sendCompleteTime = Date.now();
  console.log('⏱️ TIMESTAMP: Text content browser API submission complete', {
    processingTime: sendCompleteTime - sendStartTime + 'ms',
    itemsSent: window.preVisibilityTextContentList.length
  });
}

function sendAIDetectedTextContentToBrowser() {
  const sendStartTime = Date.now();
  
  if (!window.aiDetectedTextContentList || window.aiDetectedTextContentList.length === 0) {
    console.log('📤 No AI-detected text content to send to browser');
    return;
  }
  
  console.log(`📤 Sending ${window.aiDetectedTextContentList.length} AI-detected text content items to browser API`);
  
  try {
    if (typeof wootzSubmitSensitiveFields === 'function') {
      wootzSubmitSensitiveFields({
        type: 'text-content-detection',
        phase: 'ai-enhanced',
        detectionMethod: 'ai-analysis',
        textContentList: window.aiDetectedTextContentList,
        timestamp: new Date().toISOString(),
        summary: {
          totalItems: window.aiDetectedTextContentList.length,
          categories: [...new Set(window.aiDetectedTextContentList.map(item => item.category))],
          confidenceRange: {
            min: Math.min(...window.aiDetectedTextContentList.map(item => item.confidence)),
            max: Math.max(...window.aiDetectedTextContentList.map(item => item.confidence)),
            average: window.aiDetectedTextContentList.reduce((sum, item) => sum + item.confidence, 0) / window.aiDetectedTextContentList.length
          },
          detectedTypes: [...new Set(window.aiDetectedTextContentList.map(item => item.sensitiveType))]
        }
      });
      
      console.log('✅ AI-detected text content successfully sent to browser API');
    } else {
      console.warn('⚠️ wootzSubmitSensitiveFields function not available');
    }
  } catch (error) {
    console.error('❌ Failed to send AI-detected text content to browser API:', error);
  }
  
  const sendCompleteTime = Date.now();
  console.log('⏱️ TIMESTAMP: AI text content browser API submission complete', {
    processingTime: sendCompleteTime - sendStartTime + 'ms',
    itemsSent: window.aiDetectedTextContentList.length
  });
}

// ====== SEPARATE BROWSER API INTEGRATION FUNCTIONS ======

function addToPreVisibilityFieldsList(element, info, detectionData) {
  try {
    const fieldStartTime = Date.now();
    const fieldData = {
      // Element identification for masking
      selector: generateSelector(element),
      id: element.id || null,
      name: element.name || null,
      type: element.type || 'text',
      
      // Field characteristics for masking
      tag: element.tagName.toLowerCase(),
      placeholder: element.placeholder || null,
      autocomplete: element.autocomplete || null,
      
      // Position and visibility info for immediate masking
      boundingRect: element.getBoundingClientRect(),
      visible: isElementVisible(element),
      disabled: element.disabled,
      hidden: element.hidden,
      
      // Detection metadata
      detectionMethod: detectionData.detectionMethod,
      phase: detectionData.phase,
      confidence: detectionData.confidence,
      category: detectionData.category,
      sensitivity: detectionData.sensitivity,
      
      // Context for better masking
      context: getFieldContext(element),
      formContext: {
        formId: element.closest('form')?.id || null,
        formAction: element.closest('form')?.action || null,
        formMethod: element.closest('form')?.method || 'get'
      },
      
      // Page context
      url: window.location.href,
      pageTitle: document.title,
      detectedAt: fieldStartTime,
      
      // Unique identifier for list management
      uniqueId: generateUniqueFieldId(element, detectionData)
    };
    
    // Add to pre-visibility list (no duplicates check needed as it's early detection)
    preVisibilityFieldsList.push(fieldData);
    
    const processingTime = Date.now() - fieldStartTime;
    console.log('➕ Added pre-visibility sensitive field:', {
      selector: fieldData.selector,
      category: fieldData.category,
      total: preVisibilityFieldsList.length,
      processingTime: processingTime + 'ms'
    });
    
  } catch (error) {
    console.error('❌ Failed to add field to pre-visibility list:', error);
  }
}

function addToAIDetectedFieldsList(element, info, detectionData) {
  try {
    const fieldStartTime = Date.now();
    const fieldData = {
      // Element identification for masking
      selector: generateSelector(element),
      id: element.id || null,
      name: element.name || null,
      type: element.type || 'text',
      
      // Field characteristics for masking
      tag: element.tagName.toLowerCase(),
      placeholder: element.placeholder || null,
      autocomplete: element.autocomplete || null,
      
      // Position and visibility info
      boundingRect: element.getBoundingClientRect(),
      visible: isElementVisible(element),
      disabled: element.disabled,
      hidden: element.hidden,
      
      // AI Detection metadata
      detectionMethod: detectionData.detectionMethod,
      phase: detectionData.phase,
      confidence: detectionData.confidence,
      category: detectionData.category,
      sensitivity: detectionData.sensitivity,
      aiAnalysis: detectionData.aiAnalysis,
      aiReason: detectionData.aiReason,
      
      // Context for better masking
      context: getFieldContext(element),
      formContext: {
        formId: element.closest('form')?.id || null,
        formAction: element.closest('form')?.action || null,
        formMethod: element.closest('form')?.method || 'get'
      },
      
      // Page context
      url: window.location.href,
      pageTitle: document.title,
      detectedAt: fieldStartTime,
      
      // Unique identifier for list management
      uniqueId: generateUniqueFieldId(element, detectionData)
    };
    
    // Check if this field is already in AI list
    const existingIndex = aiDetectedFieldsList.findIndex(field => 
      field.uniqueId === fieldData.uniqueId
    );
    
    if (existingIndex === -1) {
      // Add new AI-detected field
      aiDetectedFieldsList.push(fieldData);
      console.log('🤖 Added AI-detected sensitive field:', {
        selector: fieldData.selector,
        category: fieldData.category,
        confidence: Math.round(fieldData.confidence * 100) + '%',
        total: aiDetectedFieldsList.length,
        processingTime: Date.now() - fieldStartTime + 'ms'
      });
    } else {
      // Update existing field with enhanced AI data
      aiDetectedFieldsList[existingIndex] = fieldData;
      console.log('🔄 Updated AI-detected sensitive field:', {
        selector: fieldData.selector,
        confidence: Math.round(fieldData.confidence * 100) + '%'
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to add field to AI detected list:', error);
  }
}

function sendPreVisibilityFieldsToBrowser() {
  try {
    const sendStartTime = Date.now();
    
    // Create hash of current pre-visibility list
    const currentListHash = btoa(JSON.stringify(preVisibilityFieldsList.map(f => f.uniqueId))).slice(0, 16);
    
    if (currentListHash === lastSentPreVisibilityHash) {
      console.log('⏭️ Skipping pre-visibility browser API call - no changes');
      return;
    }
    
    lastSentPreVisibilityHash = currentListHash;
    
    console.log('📤 Sending PRE-VISIBILITY fields list to browser API:', {
      fieldsCount: preVisibilityFieldsList.length,
      url: window.location.href,
      timeSinceStart: sendStartTime - performanceTimestamps.scriptStart + 'ms'
    });
    
    // Check if browser API is available
    if (typeof window.wootzSubmitSensitiveFields === 'function') {
      // Prepare data for browser API - PRE-VISIBILITY FIELDS
      const browserAPIData = {
        url: window.location.href,
        pageTitle: document.title,
        timestamp: sendStartTime,
        trigger: 'pre-visibility-detection',
        detectionType: 'pattern-based',
        fields: preVisibilityFieldsList.map(field => ({
          // Core identification for masking
          selector: field.selector,
          id: field.id,
          name: field.name,
          type: field.type,
          tag: field.tag,
          
          // Masking requirements
          boundingRect: field.boundingRect,
          visible: field.visible,
          disabled: field.disabled,
          
          // Security classification
          category: field.category,
          sensitivity: field.sensitivity,
          confidence: field.confidence,
          detectionMethod: field.detectionMethod,
          
          // Context for smart masking
          placeholder: field.placeholder,
          formContext: field.formContext,
          context: field.context,
          
          // Metadata
          detectedAt: field.detectedAt,
          uniqueId: field.uniqueId
        }))
      };
      
      // Call browser API
      window.wootzSubmitSensitiveFields(browserAPIData);
      
      performanceTimestamps.preVisibilityListSent = Date.now();
      console.log('✅ PRE-VISIBILITY fields sent to browser API:', {
        fieldsCount: preVisibilityFieldsList.length,
        sendTime: performanceTimestamps.preVisibilityListSent - sendStartTime + 'ms',
        totalTime: performanceTimestamps.preVisibilityListSent - performanceTimestamps.scriptStart + 'ms'
      });
      
      // Log summary for debugging
      logPreVisibilityBrowserAPISummary(browserAPIData);
      
    } else {
      console.warn('⚠️ Browser API wootzSubmitSensitiveFields not available, queuing pre-visibility data...');
      
      // Store for later when API becomes available
      window.queuedPreVisibilityFieldsData = {
        url: window.location.href,
        pageTitle: document.title,
        timestamp: sendStartTime,
        trigger: 'pre-visibility-detection',
        detectionType: 'pattern-based',
        fields: preVisibilityFieldsList
      };
    }
    
  } catch (error) {
    console.error('❌ Failed to send pre-visibility fields to browser API:', error);
  }
}

function sendAIDetectedFieldsToBrowser() {
  try {
    const sendStartTime = Date.now();
    
    // Create hash of current AI list
    const currentListHash = btoa(JSON.stringify(aiDetectedFieldsList.map(f => f.uniqueId))).slice(0, 16);
    
    if (currentListHash === lastSentAIHash) {
      console.log('⏭️ Skipping AI browser API call - no changes');
      return;
    }
    
    lastSentAIHash = currentListHash;
    
    console.log('📤 Sending AI-DETECTED fields list to browser API:', {
      fieldsCount: aiDetectedFieldsList.length,
      url: window.location.href,
      timeSinceStart: sendStartTime - performanceTimestamps.scriptStart + 'ms'
    });
    
    // Check if browser API is available
    if (typeof window.wootzSubmitSensitiveFields === 'function') {
      // Prepare data for browser API - AI-DETECTED FIELDS
      const browserAPIData = {
        url: window.location.href,
        pageTitle: document.title,
        timestamp: sendStartTime,
        trigger: 'ai-enhanced-detection',
        detectionType: 'AI-Complete-DOM',
        fields: aiDetectedFieldsList.map(field => ({
          // Core identification for masking
          selector: field.selector,
          id: field.id,
          name: field.name,
          type: field.type,
          tag: field.tag,
          
          // Masking requirements
          boundingRect: field.boundingRect,
          visible: field.visible,
          disabled: field.disabled,
          
          // AI Security classification
          category: field.category,
          sensitivity: field.sensitivity,
          confidence: field.confidence,
          detectionMethod: field.detectionMethod,
          aiAnalysis: field.aiAnalysis,
          aiReason: field.aiReason,
          
          // Context for smart masking
          placeholder: field.placeholder,
          formContext: field.formContext,
          context: field.context,
          
          // Metadata
          detectedAt: field.detectedAt,
          uniqueId: field.uniqueId
        }))
      };
      
      // Call browser API
      window.wootzSubmitSensitiveFields(browserAPIData);
      
      performanceTimestamps.aiListSent = Date.now();
      console.log('✅ AI-DETECTED fields sent to browser API:', {
        fieldsCount: aiDetectedFieldsList.length,
        sendTime: performanceTimestamps.aiListSent - sendStartTime + 'ms',
        totalTime: performanceTimestamps.aiListSent - performanceTimestamps.scriptStart + 'ms'
      });
      
      // Log summary for debugging
      logAIBrowserAPISummary(browserAPIData);
      
    } else {
      console.warn('⚠️ Browser API wootzSubmitSensitiveFields not available, queuing AI data...');
      
      // Store for later when API becomes available
      window.queuedAIFieldsData = {
        url: window.location.href,
        pageTitle: document.title,
        timestamp: sendStartTime,
        trigger: 'ai-enhanced-detection',
        detectionType: 'AI-Complete-DOM',
        fields: aiDetectedFieldsList
      };
    }
    
  } catch (error) {
    console.error('❌ Failed to send AI-detected fields to browser API:', error);
  }
}

function logPreVisibilityBrowserAPISummary(data) {
  console.log('📊 PRE-VISIBILITY Browser API Summary:', {
    totalFields: data.fields.length,
    detectionType: data.detectionType,
    categories: data.fields.reduce((acc, field) => {
      acc[field.category] = (acc[field.category] || 0) + 1;
      return acc;
    }, {}),
    averageConfidence: Math.round(data.fields.reduce((sum, field) => sum + field.confidence, 0) / data.fields.length * 100) + '%',
    timeFromStart: performanceTimestamps.preVisibilityListSent - performanceTimestamps.scriptStart + 'ms'
  });
}

function logAIBrowserAPISummary(data) {
  console.log('📊 AI-DETECTED Browser API Summary:', {
    totalFields: data.fields.length,
    detectionType: data.detectionType,
    categories: data.fields.reduce((acc, field) => {
      acc[field.category] = (acc[field.category] || 0) + 1;
      return acc;
    }, {}),
    averageConfidence: Math.round(data.fields.reduce((sum, field) => sum + field.confidence, 0) / data.fields.length * 100) + '%',
    aiAnalysisTime: performanceTimestamps.aiListSent - performanceTimestamps.aiAnalysisStart + 'ms',
    totalTime: performanceTimestamps.aiListSent - performanceTimestamps.scriptStart + 'ms'
  });
}

// ====== ORIGINAL BROWSER API INTEGRATION FUNCTIONS ======

function addToBrowserSensitiveFieldsList(element, info, detectionData) {
  try {
    const fieldData = {
      // Element identification
      selector: generateSelector(element),
      id: element.id || null,
      name: element.name || null,
      type: element.type || 'text',
      
      // Field characteristics for masking
      tag: element.tagName.toLowerCase(),
      placeholder: element.placeholder || null,
      autocomplete: element.autocomplete || null,
      
      // Position and visibility info
      boundingRect: element.getBoundingClientRect(),
      visible: isElementVisible(element),
      disabled: element.disabled,
      hidden: element.hidden,
      
      // Detection metadata
      detectionMethod: detectionData.detectionMethod,
      phase: detectionData.phase,
      confidence: detectionData.confidence,
      category: detectionData.category,
      sensitivity: detectionData.sensitivity,
      
      // Context for better masking
      context: getFieldContext(element),
      formContext: {
        formId: element.closest('form')?.id || null,
        formAction: element.closest('form')?.action || null,
        formMethod: element.closest('form')?.method || 'get'
      },
      
      // Page context
      url: window.location.href,
      pageTitle: document.title,
      timestamp: Date.now(),
      
      // Unique identifier for list management
      uniqueId: generateUniqueFieldId(element, detectionData)
    };
    
    // Check if this field is already in the list
    const existingIndex = sensitiveFieldsList.findIndex(field => 
      field.uniqueId === fieldData.uniqueId
    );
    
    if (existingIndex === -1) {
      // Add new field
      sensitiveFieldsList.push(fieldData);
      console.log('➕ Added new sensitive field to browser list:', {
        selector: fieldData.selector,
        method: fieldData.detectionMethod,
        category: fieldData.category,
        total: sensitiveFieldsList.length
      });
    } else {
      // Update existing field with enhanced data
      sensitiveFieldsList[existingIndex] = {
        ...sensitiveFieldsList[existingIndex],
        ...fieldData,
        // Keep track of detection methods
        detectionMethods: [
          ...(sensitiveFieldsList[existingIndex].detectionMethods || [fieldData.detectionMethod]),
          fieldData.detectionMethod
        ].filter((method, index, arr) => arr.indexOf(method) === index) // Remove duplicates
      };
      console.log('🔄 Updated existing sensitive field in browser list:', {
        selector: fieldData.selector,
        methods: sensitiveFieldsList[existingIndex].detectionMethods
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to add field to browser sensitive fields list:', error);
  }
}

function classifyFieldCategory(info) {
  const type = info.type?.toLowerCase() || '';
  const name = (info.name || '').toLowerCase();
  const id = (info.id || '').toLowerCase();
  const placeholder = (info.placeholder || '').toLowerCase();
  
  const allText = `${type} ${name} ${id} ${placeholder}`;
  
  // Classification logic
  if (type === 'password' || allText.includes('password') || allText.includes('passwd')) {
    return 'authentication';
  } else if (allText.includes('ssn') || allText.includes('social') || allText.includes('security')) {
    return 'personal-id';
  } else if (allText.includes('credit') || allText.includes('card') || allText.includes('cvv') || allText.includes('cvc')) {
    return 'financial';
  } else if (allText.includes('pin') || allText.includes('code') || allText.includes('otp')) {
    return 'authentication';
  } else if (allText.includes('account') || allText.includes('routing') || allText.includes('bank')) {
    return 'financial';
  } else if (allText.includes('email') || type === 'email') {
    return 'personal-info';
  } else if (allText.includes('phone') || type === 'tel') {
    return 'personal-info';
  } else {
    return 'sensitive-data';
  }
}

function generateUniqueFieldId(element, detectionData) {
  // Generate a unique ID that persists across page reloads for the same field
  const selector = generateSelector(element);
  const position = element.getBoundingClientRect();
  return btoa(`${window.location.pathname}_${selector}_${Math.round(position.top)}_${Math.round(position.left)}`);
}

function sendSensitiveFieldsToBrowser(trigger) {
  try {
    // Create hash of current list to avoid sending duplicates
    const currentListHash = btoa(JSON.stringify(sensitiveFieldsList.map(f => f.uniqueId))).slice(0, 16);
    
    if (currentListHash === lastSentListHash && trigger !== 'page-reload') {
      console.log('⏭️ Skipping browser API call - no changes in sensitive fields list');
      return;
    }
    
    lastSentListHash = currentListHash;
    
    console.log('📤 Sending sensitive fields list to browser API:', {
      trigger: trigger,
      fieldsCount: sensitiveFieldsList.length,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Check if browser API is available
    if (typeof window.wootzSubmitSensitiveFields === 'function') {
      // Prepare data for browser API
      const browserAPIData = {
        url: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now(),
        trigger: trigger,
        fields: sensitiveFieldsList.map(field => ({
          // Core identification for masking
          selector: field.selector,
          id: field.id,
          name: field.name,
          type: field.type,
          tag: field.tag,
          
          // Masking requirements
          boundingRect: field.boundingRect,
          visible: field.visible,
          disabled: field.disabled,
          
          // Security classification
          category: field.category,
          sensitivity: field.sensitivity,
          confidence: field.confidence,
          detectionMethod: field.detectionMethod,
          detectionMethods: field.detectionMethods || [field.detectionMethod],
          
          // Context for smart masking
          placeholder: field.placeholder,
          formContext: field.formContext,
          context: field.context,
          
          // Metadata
          timestamp: field.timestamp,
          uniqueId: field.uniqueId
        }))
      };
      
      // Call browser API
      window.wootzSubmitSensitiveFields(browserAPIData);
      
      console.log('✅ Successfully sent', sensitiveFieldsList.length, 'sensitive fields to browser API');
      
      // Log summary for debugging
      logBrowserAPISummary(browserAPIData);
      
    } else {
      console.warn('⚠️ Browser API wootzSubmitSensitiveFields not available, queuing data...');
      
      // Store for later when API becomes available
      window.queuedSensitiveFieldsData = {
        ...{
          url: window.location.href,
          pageTitle: document.title,
          timestamp: Date.now(),
          trigger: trigger
        },
        fields: sensitiveFieldsList
      };
    }
    
  } catch (error) {
    console.error('❌ Failed to send sensitive fields to browser API:', error);
  }
}

function logBrowserAPISummary(data) {
  console.log('📊 Browser API Summary:', {
    totalFields: data.fields.length,
    categories: data.fields.reduce((acc, field) => {
      acc[field.category] = (acc[field.category] || 0) + 1;
      return acc;
    }, {}),
    detectionMethods: data.fields.reduce((acc, field) => {
      (field.detectionMethods || [field.detectionMethod]).forEach(method => {
        acc[method] = (acc[method] || 0) + 1;
      });
      return acc;
    }, {}),
    confidenceLevels: data.fields.reduce((acc, field) => {
      const level = field.confidence >= 0.9 ? 'high' : field.confidence >= 0.7 ? 'medium' : 'low';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {})
  });
}

function clearSensitiveFieldsList() {
  console.log('🧹 Clearing sensitive fields lists for new page...');
  
  const preVisibilityCount = preVisibilityFieldsList.length;
  const aiDetectedCount = aiDetectedFieldsList.length;
  
  // Clear both lists
  preVisibilityFieldsList = [];
  aiDetectedFieldsList = [];
  lastSentPreVisibilityHash = '';
  lastSentAIHash = '';
  
  // Reset performance timestamps for new page
  performanceTimestamps = {
    scriptStart: Date.now(),
    extensionEnabled: null,
    preVisibilityStart: null,
    firstElementDetected: null,
    preVisibilityListSent: null,
    aiAnalysisStart: null,
    aiAnalysisComplete: null,
    aiListSent: null
  };
  
  // Send empty lists to browser to clear previous page data
  if (typeof window.wootzSubmitSensitiveFields === 'function') {
    // Clear pre-visibility fields
    window.wootzSubmitSensitiveFields({
      url: window.location.href,
      pageTitle: document.title,
      timestamp: Date.now(),
      trigger: 'page-reload',
      detectionType: 'pattern-based',
      fields: []
    });
    
    // Clear AI-detected fields
    window.wootzSubmitSensitiveFields({
      url: window.location.href,
      pageTitle: document.title,
      timestamp: Date.now(),
      trigger: 'page-reload',
      detectionType: 'AI-Complete-DOM',
      fields: []
    });
  }
  
  console.log('✅ Cleared sensitive fields lists:', {
    preVisibilityFields: preVisibilityCount,
    aiDetectedFields: aiDetectedCount,
    total: preVisibilityCount + aiDetectedCount
  });
}

// Page reload detection
window.addEventListener('beforeunload', () => {
  console.log('🔄 Page unloading - preparing for reload...');
  clearSensitiveFieldsList();
});

// Page load detection
window.addEventListener('load', () => {
  console.log('📄 Page fully loaded - ensuring clean state...');
  if (isExtensionEnabled) {
    // Ensure we have a fresh scan after page load
    setTimeout(() => {
      performEarlyScan('page-load-complete');
    }, 500);
  }
});

// Check for browser API availability periodically
function checkBrowserAPIAvailability() {
  if (typeof window.wootzSubmitSensitiveFields === 'function') {
    
    // Send queued pre-visibility data
    if (window.queuedPreVisibilityFieldsData) {
      console.log('🔗 Browser API now available, sending queued pre-visibility data...');
      window.wootzSubmitSensitiveFields(window.queuedPreVisibilityFieldsData);
      delete window.queuedPreVisibilityFieldsData;
      console.log('✅ Queued pre-visibility fields data sent to browser API');
    }
    
    // Send queued AI data
    if (window.queuedAIFieldsData) {
      console.log('🔗 Browser API now available, sending queued AI data...');
      window.wootzSubmitSensitiveFields(window.queuedAIFieldsData);
      delete window.queuedAIFieldsData;
      console.log('✅ Queued AI fields data sent to browser API');
    }
    
    // Legacy support for old queued data
    if (window.queuedSensitiveFieldsData) {
      console.log('🔗 Browser API now available, sending legacy queued data...');
      window.wootzSubmitSensitiveFields(window.queuedSensitiveFieldsData);
      delete window.queuedSensitiveFieldsData;
      console.log('✅ Legacy queued sensitive fields data sent to browser API');
    }
  }
}

// Check for API availability every 2 seconds for the first minute
let apiCheckInterval = setInterval(() => {
  checkBrowserAPIAvailability();
}, 2000);

// Stop checking after 1 minute
setTimeout(() => {
  clearInterval(apiCheckInterval);
  console.log('⏰ Stopped checking for browser API availability');
  
  // Log final performance summary
  logFinalPerformanceSummary();
}, 60000);

function logFinalPerformanceSummary() {
  console.log('📈 FINAL PERFORMANCE SUMMARY:', {
    totalExecutionTime: Date.now() - performanceTimestamps.scriptStart + 'ms',
    timings: {
      scriptStart: '0ms (baseline)',
      extensionEnabled: performanceTimestamps.extensionEnabled ? 
        (performanceTimestamps.extensionEnabled - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      preVisibilityStart: performanceTimestamps.preVisibilityStart ? 
        (performanceTimestamps.preVisibilityStart - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      firstElementDetected: performanceTimestamps.firstElementDetected ? 
        (performanceTimestamps.firstElementDetected - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      preVisibilityListSent: performanceTimestamps.preVisibilityListSent ? 
        (performanceTimestamps.preVisibilityListSent - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      rawDOMAnalysisStart: performanceTimestamps.rawDOMAnalysisStart ? 
        (performanceTimestamps.rawDOMAnalysisStart - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      aiAnalysisStart: performanceTimestamps.aiAnalysisStart ? 
        (performanceTimestamps.aiAnalysisStart - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      aiAnalysisComplete: performanceTimestamps.aiAnalysisComplete ? 
        (performanceTimestamps.aiAnalysisComplete - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      aiListSent: performanceTimestamps.aiListSent ? 
        (performanceTimestamps.aiListSent - performanceTimestamps.scriptStart) + 'ms' : 'N/A'
    },
    phases: {
      initialization: performanceTimestamps.extensionEnabled ? 
        (performanceTimestamps.extensionEnabled - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      preVisibilityDetection: performanceTimestamps.firstElementDetected && performanceTimestamps.preVisibilityStart ? 
        (performanceTimestamps.firstElementDetected - performanceTimestamps.preVisibilityStart) + 'ms' : 'N/A',
      preVisibilityProcessing: performanceTimestamps.preVisibilityListSent && performanceTimestamps.firstElementDetected ? 
        (performanceTimestamps.preVisibilityListSent - performanceTimestamps.firstElementDetected) + 'ms' : 'N/A',
      rawDOMAnalysis: performanceTimestamps.rawDOMAnalysisStart ? 
        'Triggered automatically after DOM capture' : 'N/A',
      aiAnalysis: performanceTimestamps.aiAnalysisComplete && performanceTimestamps.aiAnalysisStart ? 
        (performanceTimestamps.aiAnalysisComplete - performanceTimestamps.aiAnalysisStart) + 'ms' : 'N/A',
      aiProcessing: performanceTimestamps.aiListSent && performanceTimestamps.aiAnalysisComplete ? 
        (performanceTimestamps.aiListSent - performanceTimestamps.aiAnalysisComplete) + 'ms' : 'N/A'
    },
    results: {
      preVisibilityFields: preVisibilityFieldsList.length,
      aiDetectedFields: aiDetectedFieldsList.length,
      totalUniqueFields: preVisibilityFieldsList.length + aiDetectedFieldsList.length
    },
    criticalPath: {
      timeToFirstMasking: performanceTimestamps.preVisibilityListSent ? 
        (performanceTimestamps.preVisibilityListSent - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      timeToRawDOMAnalysis: performanceTimestamps.rawDOMAnalysisStart ? 
        (performanceTimestamps.rawDOMAnalysisStart - performanceTimestamps.scriptStart) + 'ms' : 'N/A',
      timeToEnhancedDetection: performanceTimestamps.aiListSent ? 
        (performanceTimestamps.aiListSent - performanceTimestamps.scriptStart) + 'ms' : 'N/A'
    }
  });
}

async function prepareForAIDetectionSync(newElements) {
  console.log('🎯 Preparing COMPLETE DOM for SYNCHRONOUS AI analysis...');
  
  // Instead of filtering elements, send complete DOM to AI
  console.log('📄 Sending COMPLETE DOM to AI for comprehensive field classification');
  
  // Create a promise for this AI analysis
  const analysisPromise = sendCompleteDOMToAI();
  pendingAIAnalysis.push(analysisPromise);
  
  // Wait for this analysis to complete
  await analysisPromise;
  
  // Remove from pending list
  const index = pendingAIAnalysis.indexOf(analysisPromise);
  if (index > -1) {
    pendingAIAnalysis.splice(index, 1);
  }
}

async function sendCompleteDOMToAI() {
  try {
    const aiStartTime = Date.now();
    console.log('🌐 Capturing COMPLETE DOM for comprehensive AI analysis...');
    console.log('⏱️ TIMESTAMP: AI analysis DOM capture started', {
      timeSinceStart: aiStartTime - performanceTimestamps.scriptStart + 'ms'
    });
    
    // Get the complete, clean DOM
    const completeDOM = createComprehensiveCleanDOM();
    
    const domPreparedTime = Date.now();
    console.log('📤 Sending COMPLETE DOM to AI for sensitive field detection...', {
      domSize: Math.round(completeDOM.length / 1024) + 'KB',
      domPrepTime: domPreparedTime - aiStartTime + 'ms'
    });
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzeCompleteDOM',
        completeDOM: completeDOM,
        pageURL: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now(),
        comprehensive: true
      }, (response) => {
        if (response?.success) {
          performanceTimestamps.aiAnalysisComplete = Date.now();
          console.log('✅ COMPLETE DOM Analysis complete:', {
            sensitiveFieldsFound: response.sensitiveFields?.length || 0,
            processingTime: response.processingTime,
            analysisType: 'comprehensive-dom',
            totalAITime: performanceTimestamps.aiAnalysisComplete - aiStartTime + 'ms',
            timeSinceStart: performanceTimestamps.aiAnalysisComplete - performanceTimestamps.scriptStart + 'ms'
          });
          
          if (response.sensitiveFields && response.sensitiveFields.length > 0) {
            handleCompleteDOMResults(response.sensitiveFields);
          }
          resolve(response);
        } else {
          console.error('❌ COMPLETE DOM Analysis failed:', response?.error);
          reject(new Error(response?.error || 'Complete DOM analysis failed'));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to send complete DOM to AI:', error);
    throw error;
  }
}

function createComprehensiveCleanDOM() {
  console.log('🧹 Creating comprehensive clean DOM for AI analysis...');
  
  // Clone the entire document
  const clonedDoc = document.cloneNode(true);
  const clonedHTML = clonedDoc.documentElement;
  
  // Remove script and style tags but keep structure
  const elementsToRemove = clonedHTML.querySelectorAll('script, style, noscript');
  elementsToRemove.forEach(el => el.remove());
  
  // Clean all elements but preserve form structure completely
  const allElements = clonedHTML.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove event handlers
    const attributes = Array.from(el.attributes || []);
    attributes.forEach(attr => {
      if (attr.name.startsWith('on') || attr.name.includes('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
    
    // For form elements, preserve ALL attributes but clear values
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)) {
      // Clear values but keep all other attributes for AI context
      if (el.type === 'password' || el.type === 'text' || el.type === 'email' || el.type === 'tel') {
        el.removeAttribute('value');
        if (el.value) el.value = '';
      }
    }
    
    // Preserve labels, placeholders, and surrounding context
    // Truncate only very large text blocks that aren't form-related
    if (['P', 'DIV', 'SPAN'].includes(el.tagName) && 
        !el.querySelector('input, textarea, select') && 
        !el.closest('label') && 
        el.textContent.length > 500) {
      el.textContent = el.textContent.substring(0, 250) + '... [TRUNCATED]';
    }
  });
  
  // Add comprehensive analysis context
  const analysisContext = clonedHTML.ownerDocument.createElement('div');
  analysisContext.setAttribute('data-ai-analysis-context', 'true');
  analysisContext.innerHTML = `
    <!-- COMPREHENSIVE DOM ANALYSIS CONTEXT -->
    <!-- URL: ${window.location.href} -->
    <!-- Title: ${document.title} -->
    <!-- Page Type: ${detectPageType()} -->
    <!-- Total Forms: ${document.querySelectorAll('form').length} -->
    <!-- Total Input Fields: ${document.querySelectorAll('input, textarea, select').length} -->
    <!-- Visible Fields: ${document.querySelectorAll('input, textarea, select').length} -->
    <!-- Hidden Fields: ${document.querySelectorAll('input[type="hidden"]').length} -->
    <!-- Analysis Request: Find ALL sensitive form fields in this complete DOM -->
    <!-- Include: passwords, personal info, financial data, authentication fields -->
    <!-- Context: Consider labels, placeholders, form structure, field relationships -->
  `;
  clonedHTML.insertBefore(analysisContext, clonedHTML.firstChild);
  
  const finalDOM = clonedHTML.outerHTML;
  console.log('✅ Comprehensive DOM prepared:', {
    originalSize: document.documentElement.outerHTML.length,
    cleanedSize: finalDOM.length,
    compressionRatio: Math.round((finalDOM.length / document.documentElement.outerHTML.length) * 100) + '%'
  });
  
  return finalDOM;
}

function detectPageType() {
  const url = window.location.href.toLowerCase();
  const title = document.title.toLowerCase();
  
  if (url.includes('login') || title.includes('login') || title.includes('sign in')) {
    return 'login-page';
  } else if (url.includes('register') || url.includes('signup') || title.includes('sign up') || title.includes('register')) {
    return 'registration-page';
  } else if (url.includes('checkout') || url.includes('payment') || title.includes('checkout') || title.includes('payment')) {
    return 'payment-page';
  } else if (url.includes('profile') || url.includes('account') || title.includes('profile') || title.includes('account')) {
    return 'profile-page';
  } else if (url.includes('bank') || title.includes('bank')) {
    return 'banking-page';
  } else {
    return 'general-page';
  }
}

function handleCompleteDOMResults(aiResults) {
  const processingStartTime = Date.now();
  console.log('🔒 Processing', aiResults.length, 'sensitive fields from COMPLETE DOM analysis...');
  console.log('⏱️ TIMESTAMP: AI results processing started', {
    timeSinceStart: processingStartTime - performanceTimestamps.scriptStart + 'ms',
    timeSinceAIStart: processingStartTime - performanceTimestamps.aiAnalysisStart + 'ms'
  });
  
  aiResults.forEach(result => {
    try {
      // Find element using the CSS selector provided by AI
      let element = null;
      
      // Try multiple selector strategies
      if (result.selector) {
        element = document.querySelector(result.selector);
      }
      
      // If not found by selector, try by ID
      if (!element && result.id) {
        element = document.getElementById(result.id);
      }
      
      // If not found by ID, try by name
      if (!element && result.name) {
        element = document.querySelector(`input[name="${result.name}"], textarea[name="${result.name}"], select[name="${result.name}"]`);
      }
      
      if (element) {
        console.log('🚨 AI DETECTED SENSITIVE FIELD (Complete DOM):', {
          selector: result.selector,
          type: result.type,
          category: result.category,
          sensitivity: result.sensitivity,
          reason: result.reason,
          confidence: result.confidence,
          aiAnalysis: result.aiAnalysis || 'N/A',
          fieldContext: result.context || 'N/A'
        });
        
        // Add AI-detected field to SEPARATE AI list (not merged with pre-visibility)
        const elementInfo = extractElementInfo(element, 0);
        addToAIDetectedFieldsList(element, elementInfo, {
          detectionMethod: 'AI-Complete-DOM',
          phase: 'ai-enhancement',
          confidence: result.confidence || 0.9,
          category: result.category || 'sensitive-data',
          sensitivity: result.sensitivity || 'high',
          aiAnalysis: result.aiAnalysis,
          aiReason: result.reason
        });
        
        // Enhanced logging for complete DOM detection
        logCompleteDOMSensitiveField(element, result);
      } else {
        console.warn('⚠️ AI detected sensitive field but element not found:', {
          selector: result.selector,
          id: result.id,
          name: result.name,
          type: result.type
        });
      }
    } catch (error) {
      console.error('❌ Error processing complete DOM result:', error);
    }
  });
  
  const processingCompleteTime = Date.now();
  console.log('⏱️ TIMESTAMP: AI results processing complete', {
    processingTime: processingCompleteTime - processingStartTime + 'ms',
    totalAIFieldsFound: aiDetectedFieldsList.length
  });
  
  // Send SEPARATE AI-detected list to browser API
  sendAIDetectedFieldsToBrowser();
}

function logCompleteDOMSensitiveField(element, result) {
  try {
    // Enhanced marking for complete DOM analysis
    element.setAttribute('data-sensitive-field', 'true');
    element.setAttribute('data-detection-method', 'AI-Complete-DOM');
    element.setAttribute('data-sensitivity-level', result.sensitivity);
    element.setAttribute('data-sensitivity-category', result.category);
    element.setAttribute('data-ai-confidence', result.confidence);
    element.setAttribute('data-ai-analysis', result.aiAnalysis || '');
    
    // Comprehensive logging
    console.log('🔍 COMPLETE DOM AI SENSITIVE FIELD:', {
      element: element,
      selector: generateSelector(element),
      aiClassification: {
        category: result.category,
        sensitivity: result.sensitivity,
        confidence: Math.round(result.confidence * 100) + '%',
        reason: result.reason,
        aiAnalysis: result.aiAnalysis,
        context: result.context
      },
      fieldDetails: {
        type: element.type,
        name: element.name,
        id: element.id,
        placeholder: element.placeholder,
        value: element.value ? '[REDACTED]' : '[EMPTY]',
        visible: isElementVisible(element),
        disabled: element.disabled,
        hidden: element.hidden
      },
      pageContext: {
        url: window.location.href,
        title: document.title,
        pageType: detectPageType()
      },
      timestamp: new Date().toISOString()
    });
    
    // Enhanced browser-level messaging
    window.postMessage({
      type: 'COMPLETE_DOM_SENSITIVE_FIELD_DETECTED',
      source: 'extension-complete-dom',
      data: {
        selector: generateSelector(element),
        aiClassification: result,
        fieldDetails: {
          type: element.type,
          name: element.name,
          id: element.id,
          placeholder: element.placeholder
        },
        detectionMethod: 'AI-Complete-DOM',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }, '*');
    
  } catch (error) {
    console.error('❌ Failed to log complete DOM sensitive field detection:', error);
  }
}
//   // Get page characteristics
//   const pageStats = analyzePageCharacteristics();
  
//   console.log('📊 Page Analysis (SYNC):', pageStats);
  
//   // Decision logic for choosing strategy
//   if (pageStats.shouldUseBatch) {
//     console.log('📦 Using SYNCHRONOUS BATCH DOM analysis strategy');
//     return await sendBatchDOMAnalysisSync(candidates, pageStats);
//   } else {
//     console.log('👁️ Using SYNCHRONOUS VIEWPORT analysis strategy'); 
//     return await sendVisibleViewportDOMSync(candidates);
//   }
// }

async function chooseAnalysisStrategySync(candidates) {
  // This function is now simplified since we're using complete DOM approach
  console.log('🎯 Using COMPLETE DOM analysis approach for all cases');
  return await sendCompleteDOMToAI();
}

async function sendBatchDOMAnalysisSync(candidates, pageStats) {
  try {
    console.log('📦 Capturing complete DOM for SYNCHRONOUS batch analysis...');
    
    const fullDOM = createCleanDOMForBatch();
    
    console.log('📤 Sending complete DOM SYNCHRONOUSLY to AI agent...');
    console.log('📄 Full DOM size:', Math.round(fullDOM.length / 1024), 'KB');
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzeBatchDOM',
        fullDOM: fullDOM,
        pageURL: window.location.href,
        pageTitle: document.title,
        pageStats: pageStats,
        timestamp: Date.now(),
        synchronous: true
      }, (response) => {
        if (response?.success) {
          console.log('✅ SYNCHRONOUS Batch DOM Analysis complete:', {
            sensitiveFieldsFound: response.results.length,
            batchesProcessed: response.batchCount,
            processingTime: response.processingTime
          });
          
          if (response.results.length > 0) {
            handleSensitiveFieldResults(response.results, candidates);
          }
          resolve(response);
        } else {
          console.error('❌ SYNCHRONOUS Batch DOM Analysis failed:', response?.error);
          reject(new Error(response?.error || 'Analysis failed'));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to send SYNCHRONOUS batch DOM to AI:', error);
    throw error;
  }
}

async function sendVisibleViewportDOMSync(candidates) {
  try {
    console.log('👁️ Capturing visible viewport DOM for SYNCHRONOUS AI analysis...');
    
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };
    
    const visibleDOM = captureVisibleDOM(viewport);
    
    console.log('📤 Sending visible viewport DOM SYNCHRONOUSLY to AI agent...');
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzeViewportDOM',
        visibleDOM: visibleDOM,
        viewport: viewport,
        pageURL: window.location.href,
        pageTitle: document.title,
        timestamp: Date.now(),
        synchronous: true
      }, (response) => {
        if (response?.success) {
          console.log('✅ SYNCHRONOUS Viewport DOM Analysis complete:', {
            sensitiveFieldsFound: response.results.length,
            processingTime: response.processingTime
          });
          
          if (response.results.length > 0) {
            handleSensitiveFieldResults(response.results, candidates);
          }
          resolve(response);
        } else {
          console.error('❌ SYNCHRONOUS Viewport DOM Analysis failed:', response?.error);
          reject(new Error(response?.error || 'Analysis failed'));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to send SYNCHRONOUS viewport DOM to AI:', error);
    throw error;
  }
}

async function waitForPendingAIAnalysis() {
  if (pendingAIAnalysis.length === 0) {
    console.log('✅ No pending AI analysis to wait for');
    return;
  }
  
  console.log('⏳ Waiting for', pendingAIAnalysis.length, 'pending AI analyses to complete...');
  
  try {
    await Promise.all(pendingAIAnalysis);
    console.log('✅ All AI analyses completed before page visibility');
  } catch (error) {
    console.error('❌ Some AI analyses failed:', error);
  } finally {
    pendingAIAnalysis = [];
  }
}

// Rest of the smart DOM monitoring functions...
function startSmartDOMMonitoring() {
  console.log('🧠 Starting SMART DOM monitoring (post early detection)...');
  
  // COMMENTED OUT: Set up user activity tracking
  // setupUserActivityTracking();
  
  // COMMENTED OUT: Set up smart DOM observer for dynamic changes
  // setupSmartDOMObserver();
  
  console.log('✅ Smart DOM monitoring started (DISABLED - only raw DOM analysis active)');
}

function setupUserActivityTracking() {
  const userEvents = ['click', 'keydown', 'input', 'focus', 'scroll', 'mousemove'];
  
  userEvents.forEach(event => {
    document.addEventListener(event, () => {
      isUserActive = true;
      
      // Reset user activity timeout
      clearTimeout(userActivityTimeout);
      userActivityTimeout = setTimeout(() => {
        isUserActive = false;
        console.log('😴 User inactive - reducing monitoring');
      }, CONFIG.USER_ACTIVITY_TIMEOUT);
    });
  });
}

function setupSmartDOMObserver() {
  if (window.domObserver) {
    window.domObserver.disconnect();
  }
  
  window.domObserver = new MutationObserver((mutations) => {
    // Filter mutations that might contain form elements
    const relevantMutations = mutations.filter(mutation => {
      if (mutation.type === 'childList') {
        return Array.from(mutation.addedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE && 
          (node.matches('input, textarea, select, form') || 
           node.querySelector('input, textarea, select'))
        );
      }
      
      if (mutation.type === 'attributes') {
        return mutation.target.matches('input, textarea, select') ||
               ['type', 'name', 'id', 'placeholder'].includes(mutation.attributeName);
      }
      
      return false;
    });
    
    if (relevantMutations.length > 0) {
      console.log('🔄 Relevant DOM changes detected:', relevantMutations.length, 'mutations');
      scheduleIntelligentScan('dom-change');
    }
  });
  
  window.domObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['type', 'name', 'id', 'placeholder', 'class', 'data-*']
  });
}

function scheduleIntelligentScan(trigger) {
  clearTimeout(scanTimeout);
  
  if (!isUserActive && trigger !== 'initial') {
    console.log('⏸️ Skipping scan - user inactive');
    return;
  }
  
  scanTimeout = setTimeout(() => {
    performScan(trigger);
  }, CONFIG.SCAN_DEBOUNCE_DELAY);
}

function performScan(trigger) {
  if (!isExtensionEnabled) return;
  
  console.log(`🔎 Performing intelligent scan (${trigger})...`);
  
  const inputs = document.querySelectorAll('input, textarea, select');
  const currentHash = generateElementsHash(inputs);
  
  if (currentHash === lastScanHash && trigger !== 'initial') {
    console.log('⏭️ Skipping scan - no changes detected');
    return;
  }
  
  lastScanHash = currentHash;
  console.log(`📊 Found ${inputs.length} input elements`);
  
  let newElementsCount = 0;
  
  inputs.forEach((element, index) => {
    const elementKey = generateElementKey(element);
    
    if (detectedElements.has(elementKey)) {
      return;
    }
    
    newElementsCount++;
    const elementInfo = extractElementInfo(element, index + 1);
    console.log(`📝 NEW Element ${index + 1}:`, elementInfo);
    
    detectedElements.set(elementKey, {
      element: element,
      info: elementInfo,
      timestamp: Date.now(),
      scannedAt: trigger
    });
  });
  
  if (newElementsCount > 0 || trigger === 'initial') {
    console.log(`✅ Scan complete. New elements: ${newElementsCount}, Total tracked: ${detectedElements.size}`);
    
    // COMMENTED OUT: AI analysis trigger
    // if (newElementsCount >= CONFIG.SIGNIFICANT_CHANGE_THRESHOLD) {
    //   console.log('🤖 Significant changes detected - ready for AI analysis');
    //   prepareForAIDetection(Array.from(detectedElements.values()).slice(-newElementsCount));
    // }
  }
}

function generateElementsHash(elements) {
  const summary = Array.from(elements).map(el => 
    `${el.tagName}_${el.type}_${el.name}_${el.id}`
  ).join('|');
  
  return btoa(summary).slice(0, 10);
}

function extractElementInfo(element, index) {
  return {
    index: index,
    tag: element.tagName.toLowerCase(),
    type: element.type || 'text',
    id: element.id || '(no id)',
    name: element.name || '(no name)',
    placeholder: element.placeholder || '(no placeholder)',
    className: element.className || '(no class)',
    visible: isElementVisible(element),
    value: element.value ? '[HAS_VALUE]' : '[EMPTY]',
    autocomplete: element.autocomplete || '(none)',
    required: element.required || false,
    disabled: element.disabled || false,
    hidden: element.hidden || false,
    ariaHidden: element.getAttribute('aria-hidden') || 'false'
  };
}

function generateElementKey(element) {
  try {
    const rect = element.getBoundingClientRect();
    
    return `${element.tagName}_${element.type || 'text'}_${element.id || ''}_${element.name || ''}_${Math.round(rect.top)}_${Math.round(rect.left)}`;
  } catch (error) {
    // Fallback for elements that might not have bounding rect
    return `${element.tagName}_${element.type || 'text'}_${element.id || ''}_${element.name || ''}_${Date.now()}`;
  }
}

function isElementVisible(element) {
  try {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  } catch (e) {
    return false;
  }
}

function prepareForAIDetection(newElements) {
  console.log('🎯 Preparing elements for AI detection:', newElements.length);
  
  const aiCandidates = newElements.filter(item => 
    item.info.visible && 
    (item.info.name !== '(no name)' || 
     item.info.id !== '(no id)' || 
     item.info.placeholder !== '(no placeholder)') &&
    item.info.type !== 'hidden' &&
    item.info.type !== 'submit'
  );
  
  if (aiCandidates.length > 0) {
    console.log('🤖 AI candidates ready:', aiCandidates.map(item => ({
      type: item.info.type,
      name: item.info.name,
      placeholder: item.info.placeholder
    })));
    
    // Choose analysis strategy based on page characteristics
    chooseAnalysisStrategy(aiCandidates);
  }
}

function chooseAnalysisStrategy(candidates) {
  // Get page characteristics
  const pageStats = analyzePageCharacteristics();
  
  console.log('📊 Page Analysis:', pageStats);
  
  // Decision logic for choosing strategy
  if (pageStats.shouldUseBatch) {
    console.log('📦 Using BATCH DOM analysis strategy');
    sendBatchDOMAnalysis(candidates, pageStats);
  } else {
    console.log('👁️ Using VIEWPORT analysis strategy'); 
    sendVisibleViewportDOM(candidates);
  }
}

function analyzePageCharacteristics() {
  const allInputs = document.querySelectorAll('input, textarea, select');
  const domSize = document.documentElement.outerHTML.length;
  const pageHeight = document.documentElement.scrollHeight;
  const viewportHeight = window.innerHeight;
  const formsCount = document.querySelectorAll('form').length;
  
  // Decision criteria
  const isSmallPage = domSize < 100000; // Less than 100KB
  const hasLimitedFields = allInputs.length < 30; // Less than 30 form fields
  const isShortPage = pageHeight < (viewportHeight * 3); // Less than 3 viewport heights
  const hasSimpleStructure = formsCount <= 2; // 2 or fewer forms
  
  const shouldUseBatch = isSmallPage && hasLimitedFields && isShortPage && hasSimpleStructure;
  
  return {
    domSize: Math.round(domSize / 1024), // KB
    totalFields: allInputs.length,
    pageHeight: pageHeight,
    viewportHeight: viewportHeight,
    scrollRatio: Math.round(pageHeight / viewportHeight * 10) / 10,
    formsCount: formsCount,
    shouldUseBatch: shouldUseBatch,
    strategy: shouldUseBatch ? 'batch' : 'viewport'
  };
}

async function sendBatchDOMAnalysis(candidates, pageStats) {
  try {
    console.log('📦 Capturing complete DOM for batch analysis...');
    
    // Get clean DOM for batch processing
    const fullDOM = createCleanDOMForBatch();
    
    console.log('📤 Sending complete DOM in batches to AI agent...');
    console.log('📄 Full DOM size:', Math.round(fullDOM.length / 1024), 'KB');
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeBatchDOM',
      fullDOM: fullDOM,
      pageURL: window.location.href,
      pageTitle: document.title,
      pageStats: pageStats,
      timestamp: Date.now()
    });
    
    if (response?.success) {
      console.log('✅ Batch DOM Analysis complete:', {
        sensitiveFieldsFound: response.results.length,
        batchesProcessed: response.batchCount,
        processingTime: response.processingTime,
        method: response.method
      });
      
      if (response.results.length > 0) {
        handleSensitiveFieldResults(response.results, candidates);
      }
    } else {
      console.error('❌ Batch DOM Analysis failed:', response?.error);
      // Fallback to viewport analysis
      console.log('🔄 Falling back to viewport analysis...');
      sendVisibleViewportDOM(candidates);
    }
    
  } catch (error) {
    console.error('❌ Failed to send batch DOM to AI:', error);
    // Fallback to viewport analysis
    sendVisibleViewportDOM(candidates);
  }
}

function createCleanDOMForBatch() {
  // Clone the document
  const clonedDoc = document.cloneNode(true);
  const clonedHTML = clonedDoc.documentElement;
  
  // Remove unnecessary elements
  const elementsToRemove = clonedHTML.querySelectorAll(
    'script, style, noscript, iframe, embed, object, video, audio, canvas'
  );
  elementsToRemove.forEach(el => el.remove());
  
  // Clean all elements
  const allElements = clonedHTML.querySelectorAll('*');
  allElements.forEach(el => {
    // Remove event handlers
    const attributes = Array.from(el.attributes || []);
    attributes.forEach(attr => {
      if (attr.name.startsWith('on') || attr.name.includes('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
    
    // Clear sensitive values but keep structure
    if (el.tagName === 'INPUT') {
      if (['password', 'text', 'email', 'tel'].includes(el.type)) {
        el.removeAttribute('value');
        if (el.value) el.value = '';
      }
    }
    
    // Remove large text content but keep structure
    if (['P', 'DIV', 'SPAN'].includes(el.tagName) && el.textContent.length > 200) {
      el.textContent = el.textContent.substring(0, 100) + '...';
    }
  });
  
  // Add batch processing markers
  const batchInfo = clonedHTML.ownerDocument.createElement('div');
  batchInfo.setAttribute('data-batch-info', 'true');
  batchInfo.innerHTML = `
    <!-- BATCH ANALYSIS CONTEXT -->
    <!-- URL: ${window.location.href} -->
    <!-- Title: ${document.title} -->
    <!-- DOM Size: ${Math.round(clonedHTML.outerHTML.length / 1024)}KB -->
    <!-- Total Forms: ${document.querySelectorAll('form').length} -->
    <!-- Total Fields: ${document.querySelectorAll('input, textarea, select').length} -->
  `;
  clonedHTML.insertBefore(batchInfo, clonedHTML.firstChild);
  
  return clonedHTML.outerHTML;
}

async function sendVisibleViewportDOM(candidates) {
  try {
    console.log('👁️ Capturing visible viewport DOM for AI analysis...');
    
    // Get viewport dimensions
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };
    
    // Get only the visible part of the DOM
    const visibleDOM = captureVisibleDOM(viewport);
    
    // Track viewport for scroll detection
    trackViewportChanges();
    
    console.log('📤 Sending visible viewport DOM to AI agent...');
    console.log('📐 Viewport:', `${viewport.width}x${viewport.height} at (${viewport.scrollX}, ${viewport.scrollY})`);
    console.log('� Visible DOM size:', Math.round(visibleDOM.length / 1024), 'KB');
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeViewportDOM',
      visibleDOM: visibleDOM,
      viewport: viewport,
      pageURL: window.location.href,
      pageTitle: document.title,
      timestamp: Date.now()
    });
    
    if (response?.success) {
      console.log('✅ Viewport DOM Analysis complete:', {
        sensitiveFieldsFound: response.results.length,
        processingTime: response.processingTime,
        viewportSize: `${viewport.width}x${viewport.height}`
      });
      
      if (response.results.length > 0) {
        handleSensitiveFieldResults(response.results, candidates);
      }
    } else {
      console.error('❌ Viewport DOM Analysis failed:', response?.error);
    }
    
  } catch (error) {
    console.error('❌ Failed to send viewport DOM to AI:', error);
  }
}

function captureVisibleDOM(viewport) {
  // Get all elements that are at least partially visible in the viewport
  const visibleElements = [];
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    if (isElementInViewport(element, viewport)) {
      visibleElements.push(element);
    }
  });
  
  console.log('👀 Found', visibleElements.length, 'elements in viewport');
  
  // Create a minimal DOM structure with only visible elements
  const visibleContainer = document.createElement('div');
  visibleContainer.setAttribute('data-viewport-analysis', 'true');
  
  // Add page context
  const contextInfo = document.createElement('div');
  contextInfo.innerHTML = `
    <!-- VIEWPORT CONTEXT -->
    <!-- URL: ${window.location.href} -->
    <!-- Title: ${document.title} -->
    <!-- Viewport: ${viewport.width}x${viewport.height} -->
    <!-- Scroll Position: ${viewport.scrollX}, ${viewport.scrollY} -->
    <!-- Visible Elements: ${visibleElements.length} -->
  `;
  visibleContainer.appendChild(contextInfo);
  
  // Group elements by their form containers
  const formGroups = new Map();
  
  visibleElements.forEach(element => {
    // Find the closest form or create a general group
    const form = element.closest('form') || document.body;
    const formId = form.id || form.className || 'general';
    
    if (!formGroups.has(formId)) {
      formGroups.set(formId, []);
    }
    
    // Clone element and clean it
    const clonedElement = element.cloneNode(true);
    cleanElementForAI(clonedElement);
    formGroups.get(formId).push(clonedElement);
  });
  
  // Add grouped elements to container
  formGroups.forEach((elements, formId) => {
    const formSection = document.createElement('div');
    formSection.setAttribute('data-form-group', formId);
    
    elements.forEach(element => {
      formSection.appendChild(element);
    });
    
    visibleContainer.appendChild(formSection);
  });
  
  // Limit size and return
  let domString = visibleContainer.outerHTML;
  if (domString.length > 30000) {
    console.log('⚠️ Visible DOM too large, truncating to 30KB');
    domString = domString.substring(0, 30000) + '... [VIEWPORT_TRUNCATED]';
  }
  
  return domString;
}

function isElementInViewport(element, viewport) {
  try {
    const rect = element.getBoundingClientRect();
    
    // Check if element is at least partially visible
    return (
      rect.bottom > 0 &&
      rect.right > 0 &&
      rect.top < viewport.height &&
      rect.left < viewport.width &&
      rect.width > 0 &&
      rect.height > 0
    );
  } catch (error) {
    return false;
  }
}

function cleanElementForAI(element) {
  // Remove scripts and event handlers
  if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
    element.remove();
    return;
  }
  
  // Remove event handler attributes
  const attributes = Array.from(element.attributes || []);
  attributes.forEach(attr => {
    if (attr.name.startsWith('on') || attr.name.includes('javascript:')) {
      element.removeAttribute(attr.name);
    }
  });
  
  // Clear sensitive values but keep structure
  if (element.tagName === 'INPUT') {
    if (element.type === 'password' || element.type === 'text' || element.type === 'email') {
      element.removeAttribute('value');
      if (element.value) element.value = '';
    }
  }
  
  // Recursively clean child elements
  Array.from(element.children || []).forEach(child => {
    cleanElementForAI(child);
  });
}

let scrollTimeout;
let lastViewportHash = '';

function trackViewportChanges() {
  // COMMENTED OUT: Viewport change tracking
  // const handleScroll = () => {
  //   if (isUserActive) {
  //     clearTimeout(viewportChangeTimeout);
  //     viewportChangeTimeout = setTimeout(() => {
  //       analyzeNewViewport();
  //     }, 500);
  //   }
  // };
  
  // COMMENTED OUT: Remove existing scroll listener
  // document.removeEventListener('scroll', handleScroll);
  
  // COMMENTED OUT: Add scroll listener
  // document.addEventListener('scroll', handleScroll, { passive: true });
  
  console.log('📜 Viewport change tracking DISABLED - only raw DOM analysis active');
}

function analyzeNewViewport() {
  try {
    const currentViewport = {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY
    };
    
    // Create viewport hash to detect significant changes
    const viewportHash = `${Math.round(currentViewport.scrollX / 100)}_${Math.round(currentViewport.scrollY / 100)}`;
    
    if (viewportHash === lastViewportHash) {
      console.log('👁️ Viewport change too small, skipping analysis');
      return;
    }
    
    lastViewportHash = viewportHash;
    
    console.log('🔄 New viewport detected, analyzing...', currentViewport);
    
    // Find new visible form elements
    const newVisibleElements = findNewVisibleElements(currentViewport);
    
    if (newVisibleElements.length > 0) {
      console.log('🆕 Found', newVisibleElements.length, 'new visible elements');
      
      // COMMENTED OUT: Send new viewport for analysis
      // sendNewViewportAnalysis(currentViewport, newVisibleElements);
    } else {
      console.log('👁️ No new form elements in viewport');
    }
    
  } catch (error) {
    console.error('❌ Error analyzing new viewport:', error);
  }
}

function findNewVisibleElements(viewport) {
  const currentlyVisible = document.querySelectorAll('input, textarea, select');
  const newElements = [];
  
  currentlyVisible.forEach(element => {
    const elementKey = generateElementKey(element);
    
    // Check if element is in viewport and not already detected
    if (isElementInViewport(element, viewport) && !detectedElements.has(elementKey)) {
      const elementInfo = extractElementInfo(element, newElements.length + 1);
      
      // Only include meaningful form elements
      if (elementInfo.type !== 'hidden' && elementInfo.type !== 'submit' &&
          (elementInfo.name !== '(no name)' || elementInfo.id !== '(no id)' || 
           elementInfo.placeholder !== '(no placeholder)')) {
        
        newElements.push({
          element: element,
          info: elementInfo,
          timestamp: Date.now(),
          scannedAt: 'viewport-scroll'
        });
        
        // Add to detected elements
        detectedElements.set(elementKey, {
          element: element,
          info: elementInfo,
          timestamp: Date.now(),
          scannedAt: 'viewport-scroll'
        });
      }
    }
  });
  
  return newElements;
}

async function sendNewViewportAnalysis(viewport, newElements) {
  try {
    // Get visible DOM for this viewport
    const visibleDOM = captureVisibleDOM(viewport);
    
    console.log('📤 Sending new viewport analysis...');
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeViewportDOM',
      visibleDOM: visibleDOM,
      viewport: viewport,
      pageURL: window.location.href,
      pageTitle: document.title,
      timestamp: Date.now(),
      triggerReason: 'scroll-change'
    });
    
    if (response?.success && response.results.length > 0) {
      console.log('✅ New viewport analysis complete:', response.results.length, 'sensitive fields found');
      handleSensitiveFieldResults(response.results, newElements);
    }
    
  } catch (error) {
    console.error('❌ Failed to analyze new viewport:', error);
  }
}

async function sendToAIAgent(candidates) {
  try {
    console.log('🚀 Sending', candidates.length, 'elements to AI agent...');
    
    // Prepare minimal element data for AI
    const elementsForAI = candidates.map(item => ({
      type: item.info.type,
      name: item.info.name,
      id: item.info.id,
      placeholder: item.info.placeholder,
      autocomplete: item.info.autocomplete,
      className: item.info.className,
      originalIndex: item.info.index
    }));
    
    const response = await chrome.runtime.sendMessage({
      action: 'analyzeElements',
      elements: elementsForAI
    });
    
    if (response?.success) {
      console.log('✅ AI Analysis complete:', {
        newElementsAnalyzed: response.newElementsCount,
        totalProcessed: response.totalProcessed,
        sensitiveFieldsFound: response.results.length
      });
      
      if (response.results.length > 0) {
        handleSensitiveFieldResults(response.results, candidates);
      }
    } else {
      console.error('❌ AI Analysis failed:', response?.error);
    }
    
  } catch (error) {
    console.error('❌ Failed to send elements to AI:', error);
  }
}

function handleSensitiveFieldResults(aiResults, candidates) {
  console.log('🔒 Processing', aiResults.length, 'sensitive field results from DOM analysis...');
  
  aiResults.forEach(result => {
    try {
      // Find element using the CSS selector provided by AI
      const element = document.querySelector(result.selector);
      
      if (element) {
        console.log('🚨 SENSITIVE FIELD DETECTED:', {
          selector: result.selector,
          type: result.type,
          category: result.category,
          sensitivity: result.sensitivity,
          reason: result.reason,
          confidence: result.confidence
        });
        
        // Log the sensitive field detection
        logAISensitiveFieldDetection(element, result);
      } else {
        console.warn('⚠️ Could not find element with selector:', result.selector);
      }
    } catch (error) {
      console.error('❌ Error processing sensitive field result:', error);
    }
  });
}

function logAISensitiveFieldDetection(element, result) {
  try {
    // Just mark with data attributes for tracking (no visual changes)
    element.setAttribute('data-sensitive-field', 'true');
    element.setAttribute('data-sensitivity-level', result.sensitivity);
    element.setAttribute('data-sensitivity-category', result.category);
    element.setAttribute('data-ai-confidence', result.confidence);
    element.setAttribute('data-detection-method', 'AI');
    
    // Log comprehensive details
    console.log('🔍 AI SENSITIVE FIELD DETECTED:', {
      element: element,
      selector: generateSelector(element),
      category: result.category,
      sensitivity: result.sensitivity,
      confidence: Math.round(result.confidence * 100) + '%',
      reason: result.reason,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      fieldDetails: {
        type: element.type,
        name: element.name,
        id: element.id,
        placeholder: element.placeholder,
        value: element.value ? '[REDACTED]' : '[EMPTY]'
      },
      context: getFieldContext(element)
    });
    
    // Structured logging for browser-level processing
    window.postMessage({
      type: 'SENSITIVE_FIELD_DETECTED',
      source: 'extension',
      data: {
        selector: generateSelector(element),
        category: result.category,
        sensitivity: result.sensitivity,
        confidence: result.confidence,
        method: 'AI',
        url: window.location.href,
        timestamp: new Date().toISOString()
      }
    }, '*');
    
  } catch (error) {
    console.error('❌ Failed to log AI sensitive field detection:', error);
  }
}

function stopDOMMonitoring() {
  console.log('⏹️ Stopping DOM monitoring...');
  
  clearTimeout(scanTimeout);
  clearTimeout(userActivityTimeout);
  
  // Stop observer
  if (window.domObserver) {
    window.domObserver.disconnect();
    window.domObserver = null;
  }
  
  // Clear all state
  detectedElements.clear();
  lastScanHash = '';
  isUserActive = false;
  
  console.log('✅ DOM monitoring stopped and state cleared');
}

// URL change detection for SPA navigation
// currentURL is declared at the top of the file

function setupURLChangeDetection() {
  // Detect URL changes in SPAs
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function() {
    originalPushState.apply(history, arguments);
    handleURLChange();
  };
  
  history.replaceState = function() {
    originalReplaceState.apply(history, arguments);
    handleURLChange();
  };
  
  window.addEventListener('popstate', handleURLChange);
  
  console.log('🌐 URL change detection enabled for SPAs');
}

function handleURLChange() {
  const newURL = window.location.href;
  
  if (newURL !== currentURL) {
    console.log('🌐 URL CHANGED:', currentURL, '->', newURL);
    currentURL = newURL;
    
    // Clear previous sensitive fields list for new page
    clearSensitiveFieldsList();
    
    // Trigger simple rescan for new page
    setTimeout(() => {
      if (isExtensionEnabled) {
        console.log('🔄 URL changed - restarting scan...');
        performEarlyScan('url-change');
      }
    }, 1000); // Wait for page to stabilize
  }
}

console.log('🎯 Pre-visibility content script setup complete');

function setupUserActivityTracking() {
  const userEvents = ['click', 'keydown', 'input', 'focus', 'scroll', 'mousemove'];
  
  userEvents.forEach(event => {
    document.addEventListener(event, () => {
      isUserActive = true;
      
      // Reset user activity timeout
      clearTimeout(userActivityTimeout);
      userActivityTimeout = setTimeout(() => {
        isUserActive = false;
        console.log('😴 User inactive - reducing monitoring');
      }, CONFIG.USER_ACTIVITY_TIMEOUT);
    });
  });
}

function setupSmartDOMObserver() {
  if (window.domObserver) {
    window.domObserver.disconnect();
  }
  
  window.domObserver = new MutationObserver((mutations) => {
    // Filter mutations that might contain form elements
    const relevantMutations = mutations.filter(mutation => {
      // Check if mutation affects form elements
      if (mutation.type === 'childList') {
        return Array.from(mutation.addedNodes).some(node => 
          node.nodeType === Node.ELEMENT_NODE && 
          (node.matches('input, textarea, select, form') || 
           node.querySelector('input, textarea, select'))
        );
      }
      
      // Check attribute changes on form elements
      if (mutation.type === 'attributes') {
        return mutation.target.matches('input, textarea, select') ||
               ['type', 'name', 'id', 'placeholder'].includes(mutation.attributeName);
      }
      
      return false;
    });
    
    if (relevantMutations.length > 0) {
      console.log('🔄 Relevant DOM changes detected:', relevantMutations.length, 'mutations');
      scheduleIntelligentScan('dom-change');
    }
  });
  
  window.domObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['type', 'name', 'id', 'placeholder', 'class', 'data-*']
  });
}

function scheduleIntelligentScan(trigger) {
  // Clear existing timeout
  clearTimeout(scanTimeout);
  
  // Only scan if user is active or it's initial scan
  if (!isUserActive && trigger !== 'initial') {
    console.log('⏸️ Skipping scan - user inactive');
    return;
  }
  
  // Debounce rapid DOM changes
  scanTimeout = setTimeout(() => {
    performScan(trigger);
  }, CONFIG.SCAN_DEBOUNCE_DELAY);
}

function performScan(trigger) {
  if (!isExtensionEnabled) return;
  
  console.log(`🔎 Performing intelligent scan (${trigger})...`);
  
  // Find all input elements
  const inputs = document.querySelectorAll('input, textarea, select');
  
  // Create hash of current elements to detect changes
  const currentHash = generateElementsHash(inputs);
  
  // Skip scan if nothing changed
  if (currentHash === lastScanHash && trigger !== 'initial') {
    console.log('⏭️ Skipping scan - no changes detected');
    return;
  }
  
  lastScanHash = currentHash;
  console.log(`📊 Found ${inputs.length} input elements`);
  
  // Process only new/changed elements
  let newElementsCount = 0;
  const previousSize = detectedElements.size;
  
  inputs.forEach((element, index) => {
    const elementKey = generateElementKey(element);
    
    // Skip if element already processed and hasn't changed
    if (detectedElements.has(elementKey)) {
      return;
    }
    
    newElementsCount++;
    
    const elementInfo = extractElementInfo(element, index + 1);
    console.log(`📝 NEW Element ${index + 1}:`, elementInfo);
    
    // Store element info with unique detection
    detectedElements.set(elementKey, {
      element: element,
      info: elementInfo,
      timestamp: Date.now(),
      scannedAt: trigger
    });
  });
  
  // Only log summary if significant changes
  if (newElementsCount > 0 || trigger === 'initial') {
    console.log(`✅ Scan complete. New elements: ${newElementsCount}, Total tracked: ${detectedElements.size}`);
    
    // COMMENTED OUT: AI analysis trigger
    // if (newElementsCount >= CONFIG.SIGNIFICANT_CHANGE_THRESHOLD) {
    //   console.log('🤖 Significant changes detected - ready for AI analysis');
    //   prepareForAIDetection(Array.from(detectedElements.values()).slice(-newElementsCount));
    // }
  }
}

function generateElementsHash(elements) {
  // Create simple hash of element count and types
  const summary = Array.from(elements).map(el => 
    `${el.tagName}_${el.type}_${el.name}_${el.id}`
  ).join('|');
  
  return btoa(summary).slice(0, 10); // Simple hash
}

function extractElementInfo(element, index) {
  return {
    index: index,
    tag: element.tagName.toLowerCase(),
    type: element.type || 'text',
    id: element.id || '(no id)',
    name: element.name || '(no name)',
    placeholder: element.placeholder || '(no placeholder)',
    className: element.className || '(no class)',
    visible: isElementVisible(element),
    value: element.value ? '[HAS_VALUE]' : '[EMPTY]', // Don't log actual values
    autocomplete: element.autocomplete || '(none)',
    required: element.required || false
  };
}

function generateElementKey(element) {
  // Create unique key for element including position
  const rect = element.getBoundingClientRect();
  return `${element.tagName}_${element.type}_${element.id}_${element.name}_${Math.round(rect.top)}_${Math.round(rect.left)}`;
}

function isElementVisible(element) {
  try {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0';
  } catch (e) {
    return false;
  }
}

function prepareForAIDetection(newElements) {
  // This will be used in Step 2 for AI detection
  console.log('🎯 Preparing elements for AI detection:', newElements.length);
  
  // Filter visible, named elements for AI analysis
  const aiCandidates = newElements.filter(item => 
    item.info.visible && 
    (item.info.name !== '(no name)' || 
     item.info.id !== '(no id)' || 
     item.info.placeholder !== '(no placeholder)')
  );
  
  if (aiCandidates.length > 0) {
    console.log('🤖 AI candidates ready:', aiCandidates.map(item => ({
      type: item.info.type,
      name: item.info.name,
      placeholder: item.info.placeholder
    })));
  }
}

function stopDOMMonitoring() {
  console.log('⏹️ Stopping DOM monitoring...');
  
  // Clear timeouts
  clearTimeout(scanTimeout);
  clearTimeout(userActivityTimeout);
  
  // Disconnect observer
  if (window.domObserver) {
    window.domObserver.disconnect();
    window.domObserver = null;
  }
  
  // Clear state
  detectedElements.clear();
  lastScanHash = '';
  isUserActive = false;
  
  console.log('✅ DOM monitoring stopped');
}

// Content script is fully loaded and monitoring is already started
console.log('🎯 Pre-visibility content script setup complete');

console.log('🎯 Smart content script setup complete');

function logEnhancedSensitiveFieldDetails(element, info, item) {
  // Enhanced logging for dynamic DOM detection
  console.log('📊 ENHANCED SENSITIVE FIELD LOGGED:', {
    element: element,
    details: info,
    selector: generateSelector(element),
    context: getFieldContext(element),
    dynamicInfo: {
      detectedAt: item.detectedAt,
      reanalysis: item.reanalysis || false,
      incremental: item.incremental || false,
      changes: item.changes || null,
      shadowDOM: info.shadowDOM,
      shadowHost: info.shadowHost,
      visibilityState: {
        visible: info.visible,
        hidden: info.hidden,
        disabled: info.disabled,
        ariaHidden: info.ariaHidden
      }
    },
    timestamp: new Date().toISOString(),
    url: window.location.href
  });
  
  // Post enhanced message for browser-level processing
  window.postMessage({
    type: 'ENHANCED_SENSITIVE_FIELD_DETECTED',
    source: 'extension-dynamic',
    data: {
      selector: generateSelector(element),
      fieldInfo: info,
      detectionContext: {
        phase: item.detectedAt,
        reanalysis: item.reanalysis || false,
        shadowDOM: info.shadowDOM,
        dynamicChange: true
      },
      timestamp: new Date().toISOString(),
      url: window.location.href
    }
  }, '*');
}

// NEW: Function to show retry status indicator
function showRetryStatus(message) {
  // Create or update status indicator
  let statusIndicator = document.getElementById('sensitive-field-detector-status');
  if (!statusIndicator) {
    statusIndicator = document.createElement('div');
    statusIndicator.id = 'sensitive-field-detector-status';
    statusIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #2196F3;
      color: white;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-family: Arial, sans-serif;
      z-index: 999999;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      max-width: 200px;
      word-wrap: break-word;
    `;
    document.body.appendChild(statusIndicator);
  }
  statusIndicator.textContent = message;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (statusIndicator && statusIndicator.parentNode) {
      statusIndicator.parentNode.removeChild(statusIndicator);
    }
  }, 5000);
}

// NEW: Function to send raw DOM to Gemini AI for analysis
async function sendRawDOMToGemini() {
  console.log('🔍 NEW: Capturing and sending raw DOM to Gemini AI...');
  
  try {
    // Show status indicator
    showRetryStatus('🔍 Analyzing page with AI...');
    
    // Capture the complete DOM with enhanced strategies for modern web apps
    let rawDOM;
    
    // Try to get the most complete DOM possible
    if (document.readyState === 'loading') {
      // If still loading, wait a bit for more content
      console.log('⏳ DOM still loading, waiting for more content...');
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // ENHANCED: Capture DOM with shadow DOM and dynamic content
    rawDOM = captureEnhancedDOM();
    
    // Debug: Check if we have form elements in the captured DOM
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawDOM;
    const formElementsInDOM = tempDiv.querySelectorAll('input, textarea, select');
    console.log('🔍 DEBUG: Form elements found in captured DOM:', formElementsInDOM.length);
    formElementsInDOM.forEach((el, i) => {
      console.log(`   ${i + 1}. ${el.tagName} type="${el.type}" name="${el.name}" id="${el.id}"`);
    });
    
    // ENHANCED: Also check for shadow DOM elements
    const shadowElements = findShadowDOMElements();
    console.log('🔍 DEBUG: Shadow DOM elements found:', shadowElements.length);
    shadowElements.forEach((el, i) => {
      console.log(`   Shadow ${i + 1}. ${el.tagName} type="${el.type}" name="${el.name}" id="${el.id}"`);
    });
    
    const pageInfo = {
      url: window.location.href,
      title: document.title,
      pageType: detectPageType(),
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      domState: {
        readyState: document.readyState,
        bodyChildren: document.body?.children?.length || 0,
        formElements: formElementsInDOM.length,
        shadowElements: shadowElements.length,
        totalElements: document.querySelectorAll('*').length
      }
    };
    
    console.log('📄 Captured raw DOM:', {
      size: Math.round(rawDOM.length / 1024) + 'KB',
      url: pageInfo.url,
      title: pageInfo.title,
      pageType: pageInfo.pageType,
      domState: pageInfo.domState
    });
    
    // Debug: Show a snippet of the DOM to verify content
    const domSnippet = rawDOM.substring(0, 1000);
    console.log('🔍 DEBUG: DOM snippet (first 1000 chars):', domSnippet);
    
    // Send to background script for AI analysis
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({
        action: 'analyzeRawDOM',
        rawDOM: rawDOM,
        pageInfo: pageInfo
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        resolve(response);
      });
    });
    
    if (response?.success) {
      console.log('✅ Raw DOM analysis completed successfully');
      console.log('🎯 Detected sensitive fields:', response.sensitiveFields.length);
      console.log('⏱️ Processing time:', response.processingTime + 'ms');
      
      if (response.fallbackUsed) {
        console.log('🔄 Fallback pattern detection was used');
        showRetryStatus('✅ Analysis complete (fallback mode)');
      } else if (response.attempts > 1) {
        console.log(`🔄 Completed after ${response.attempts} attempts`);
        showRetryStatus(`✅ Analysis complete (${response.attempts} attempts)`);
      } else {
        showRetryStatus('✅ Analysis complete');
      }
      
      // Process the detected fields
      await processRawDOMResults(response.sensitiveFields, pageInfo);
      
      return response;
    } else {
      console.error('❌ Raw DOM analysis failed:', response?.error);
      
      // Enhanced error reporting
      if (response?.attempts) {
        console.log(`🔄 Failed after ${response.attempts} attempts`);
        showRetryStatus(`❌ Failed after ${response.attempts} attempts`);
      }
      
      if (response?.fallbackUsed) {
        console.log('🔄 Fallback pattern detection was attempted');
        showRetryStatus('❌ Analysis failed (fallback used)');
      }
      
      throw new Error(response?.error || 'Unknown error');
    }
    
  } catch (error) {
    console.error('❌ Failed to send raw DOM to Gemini:', error);
    
    // Enhanced error context
    if (error.message.includes('503')) {
      console.log('💡 Tip: Gemini API is overloaded. The extension will retry automatically.');
    } else if (error.message.includes('429')) {
      console.log('💡 Tip: Rate limit exceeded. The extension will retry with backoff.');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Tip: Request timed out. The extension will retry automatically.');
    }
    
    throw error;
  }
}

// NEW: Enhanced DOM capture function for modern web apps
function captureEnhancedDOM() {
  console.log('🔍 ENHANCED: Capturing DOM with shadow DOM and dynamic content...');
  
  // Start with the main document
  let enhancedDOM = document.documentElement.outerHTML;
  
  // ENHANCED: Wait for dynamic content to load
  if (document.readyState !== 'complete') {
    console.log('⏳ Waiting for dynamic content to load...');
    // This will be handled by the async nature of the function
  }
  
  // ENHANCED: Capture shadow DOM content
  const shadowContent = captureShadowDOMContent();
  if (shadowContent) {
    enhancedDOM += '\n<!-- SHADOW DOM CONTENT -->\n' + shadowContent;
  }
  
  // ENHANCED: Capture dynamically loaded content
  const dynamicContent = captureDynamicContent();
  if (dynamicContent) {
    enhancedDOM += '\n<!-- DYNAMIC CONTENT -->\n' + dynamicContent;
  }
  
  // ENHANCED: Capture form-like elements that might be missed
  const formLikeElements = captureFormLikeElements();
  if (formLikeElements) {
    enhancedDOM += '\n<!-- FORM-LIKE ELEMENTS -->\n' + formLikeElements;
  }
  
  console.log('✅ Enhanced DOM capture completed');
  return enhancedDOM;
}

// NEW: Function to capture shadow DOM content
function captureShadowDOMContent() {
  console.log('🔍 ENHANCED: Searching for shadow DOM elements...');
  
  let shadowContent = '';
  const shadowElements = [];
  
  // Find all elements that might have shadow roots
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach((element, index) => {
    try {
      // Check if element has shadow root
      if (element.shadowRoot) {
        console.log(`🔍 Found shadow root in element: ${element.tagName} (${index})`);
        
        // Capture shadow DOM content
        const shadowHTML = element.shadowRoot.innerHTML;
        shadowContent += `\n<!-- SHADOW ROOT ${index} -->\n<div data-shadow-root="true">${shadowHTML}</div>`;
        
        // Find form elements in shadow DOM
        const shadowFormElements = element.shadowRoot.querySelectorAll('input, textarea, select');
        shadowFormElements.forEach((formEl, formIndex) => {
          shadowElements.push({
            element: formEl,
            parent: element.tagName,
            shadowIndex: index,
            formIndex: formIndex
          });
        });
      }
    } catch (error) {
      // Some shadow roots might not be accessible
      console.log(`⚠️ Could not access shadow root in element: ${element.tagName}`);
    }
  });
  
  console.log(`🔍 Found ${shadowElements.length} form elements in shadow DOM`);
  shadowElements.forEach((item, i) => {
    console.log(`   Shadow ${i + 1}. ${item.element.tagName} type="${item.element.type}" name="${item.element.name}" id="${item.element.id}" (in ${item.parent})`);
  });
  
  return shadowContent;
}

// NEW: Function to capture dynamically loaded content
function captureDynamicContent() {
  console.log('🔍 ENHANCED: Capturing dynamically loaded content...');
  
  let dynamicContent = '';
  
  // Look for common patterns in modern web apps
  const dynamicSelectors = [
    '[data-testid]', // React testing attributes
    '[data-cy]', // Cypress testing attributes
    '[role]', // ARIA roles
    '[aria-label]', // ARIA labels
    '.form-control', // Bootstrap forms
    '.input-group', // Bootstrap input groups
    '.field', // Generic field classes
    '.form-field', // Form field classes
    '[class*="form"]', // Any class containing "form"
    '[class*="input"]', // Any class containing "input"
    '[class*="field"]' // Any class containing "field"
  ];
  
  dynamicSelectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`🔍 Found ${elements.length} elements with selector: ${selector}`);
      elements.forEach((el, index) => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') {
          dynamicContent += `\n<!-- DYNAMIC ${selector} ${index} -->\n${el.outerHTML}`;
        }
      });
    }
  });
  
  return dynamicContent;
}

// NEW: Function to capture form-like elements
function captureFormLikeElements() {
  console.log('🔍 ENHANCED: Capturing form-like elements...');
  
  let formLikeContent = '';
  
  // Look for elements that might contain sensitive data but aren't traditional forms
  const sensitivePatterns = [
    // Common sensitive field patterns
    'input[type="text"]',
    'input[type="email"]',
    'input[type="tel"]',
    'input[type="password"]',
    'input[type="number"]',
    'input[type="date"]',
    'input[type="month"]',
    'input[type="week"]',
    'input[type="datetime-local"]',
    'textarea',
    'select',
    // Contenteditable elements
    '[contenteditable="true"]',
    // Custom input elements
    '[role="textbox"]',
    '[role="combobox"]',
    '[role="listbox"]',
    // Common sensitive field names
    'input[name*="email"]',
    'input[name*="phone"]',
    'input[name*="password"]',
    'input[name*="username"]',
    'input[name*="name"]',
    'input[name*="address"]',
    'input[name*="birth"]',
    'input[name*="ssn"]',
    'input[name*="credit"]',
    'input[name*="card"]',
    'input[name*="account"]',
    'input[id*="email"]',
    'input[id*="phone"]',
    'input[id*="password"]',
    'input[id*="username"]',
    'input[id*="name"]',
    'input[id*="address"]',
    'input[id*="birth"]',
    'input[id*="ssn"]',
    'input[id*="credit"]',
    'input[id*="card"]',
    'input[id*="account"]'
  ];
  
  sensitivePatterns.forEach(pattern => {
    try {
      const elements = document.querySelectorAll(pattern);
      if (elements.length > 0) {
        console.log(`🔍 Found ${elements.length} elements with pattern: ${pattern}`);
        elements.forEach((el, index) => {
          formLikeContent += `\n<!-- FORM-LIKE ${pattern} ${index} -->\n${el.outerHTML}`;
        });
      }
    } catch (error) {
      // Some selectors might be invalid
      console.log(`⚠️ Invalid selector: ${pattern}`);
    }
  });
  
  return formLikeContent;
}

// NEW: Function to find shadow DOM elements
function findShadowDOMElements() {
  const shadowElements = [];
  
  const allElements = document.querySelectorAll('*');
  
  allElements.forEach(element => {
    try {
      if (element.shadowRoot) {
        const formElements = element.shadowRoot.querySelectorAll('input, textarea, select');
        formElements.forEach(formEl => {
          shadowElements.push(formEl);
        });
      }
    } catch (error) {
      // Shadow root not accessible
    }
  });
  
  return shadowElements;
}

async function processRawDOMResults(sensitiveFields, pageInfo) {
  console.log('🔄 Processing raw DOM analysis results...');
  
  if (!sensitiveFields || sensitiveFields.length === 0) {
    console.log('✅ No sensitive fields detected in raw DOM analysis');
    return;
  }
  
  // Process each detected field
  sensitiveFields.forEach((field, index) => {
    console.log(`\n🔍 Processing field ${index + 1}:`);
    console.log(`   Type: ${field.type}`);
    console.log(`   Selector: ${field.selector}`);
    console.log(`   Confidence: ${Math.round(field.confidence * 100)}%`);
    console.log(`   Risk Level: ${field.risk_level}`);
    
    // Try to find the actual element in the DOM
    try {
      const element = document.querySelector(field.selector);
      if (element) {
        console.log(`   ✅ Element found in DOM`);
        
        // Mark the element for tracking
        element.setAttribute('data-sensitive-field', 'true');
        element.setAttribute('data-ai-detection', 'true');
        element.setAttribute('data-field-type', field.type);
        element.setAttribute('data-confidence', field.confidence);
        element.setAttribute('data-risk-level', field.risk_level);
        
        // Log detailed information
        logRawDOMFieldDetails(element, field, pageInfo);
        
        // Add to AI detected fields list
        addToAIDetectedFieldsList(element, {
          type: field.type,
          name: element.name || '',
          id: element.id || '',
          placeholder: element.placeholder || '',
          autocomplete: element.autocomplete || ''
        }, {
          detectionMethod: 'raw-dom-ai',
          confidence: field.confidence,
          category: field.type,
          sensitivity: field.risk_level,
          reasoning: field.reasoning,
          context: field.context,
          recommendation: field.recommendation
        });
        
      } else {
        console.log(`   ⚠️ Element not found in current DOM (may be dynamic)`);
      }
    } catch (error) {
      console.error(`   ❌ Error processing field:`, error);
    }
  });
  
  // Send AI detected fields to browser API
  sendAIDetectedFieldsToBrowser();
  
  console.log('✅ Raw DOM results processing completed');
}

function logRawDOMFieldDetails(element, field, pageInfo) {
  console.log('📊 RAW DOM FIELD DETAILS:');
  console.log('=' .repeat(50));
  console.log(`🌐 Page: ${pageInfo.url}`);
  console.log(`📄 Title: ${pageInfo.title}`);
  console.log(`🔍 Field Type: ${field.type.toUpperCase()}`);
  console.log(`🎯 Selector: ${field.selector}`);
  console.log(`📊 Confidence: ${Math.round(field.confidence * 100)}%`);
  console.log(`⚠️ Risk Level: ${field.risk_level.toUpperCase()}`);
  console.log('');
  console.log(`🔍 Element Details:`);
  console.log(`   Tag: ${element.tagName}`);
  console.log(`   Type: ${element.type || 'N/A'}`);
  console.log(`   Name: ${element.name || 'N/A'}`);
  console.log(`   ID: ${element.id || 'N/A'}`);
  console.log(`   Placeholder: ${element.placeholder || 'N/A'}`);
  console.log(`   Autocomplete: ${element.autocomplete || 'N/A'}`);
  console.log(`   Required: ${element.required || false}`);
  console.log(`   Disabled: ${element.disabled || false}`);
  console.log('');
  console.log(`🧠 AI Reasoning: ${field.reasoning}`);
  console.log(`📝 Context: ${field.context}`);
  console.log(`💡 Recommendation: ${field.recommendation}`);
  console.log('=' .repeat(50));
}

// Function to manually trigger raw DOM analysis (for testing)
function triggerRawDOMAnalysis() {
  console.log('🚀 Manually triggering raw DOM analysis...');
  sendRawDOMToGemini()
    .then(result => {
      console.log('✅ Manual raw DOM analysis completed:', result);
    })
    .catch(error => {
      console.error('❌ Manual raw DOM analysis failed:', error);
    });
}

// Make the function available globally for testing
window.triggerRawDOMAnalysis = triggerRawDOMAnalysis;


