// Main content script - Hybrid sensitive field detection
// Combines pattern-based detection with AI classification

console.log('🔍 Content script loading...', window.location.href);
console.log('🔍 IMMEDIATE CONTENT SCRIPT TEST - IF YOU SEE THIS, CONTENT SCRIPTS ARE WORKING!');

class SensitiveFieldDetector {
  constructor() {
    console.log('🏗️ SensitiveFieldDetector constructor called');
    this.processedElements = new WeakSet();
    this.detectionQueue = [];
    this.isProcessing = false;
    this.currentDomain = window.location.hostname;
    this.detectionRules = null;
    this.observers = [];
    
    this.settings = {
      aiConfidenceThreshold: 0.7,
      patternConfidenceThreshold: 0.9,
      maxQueueSize: 20,
      batchProcessDelay: 2000,
      enableAI: true,
      enablePatterns: true
    };
    
    console.log('⚙️ Initial settings:', this.settings);

    this.initialize();
  }

  async initialize() {
    console.log('🚀 Initializing SensitiveFieldDetector...');
    try {
      // Wait for all utility scripts to load
      console.log('⏳ Waiting for dependencies...');
      await this.waitForDependencies();
      console.log('✅ Dependencies loaded');
      
      // Load user settings
      console.log('⚙️ Loading settings...');
      await this.loadSettings();
      console.log('✅ Settings loaded:', this.settings);
      
      // Initialize detection rules
      console.log('📋 Initializing detection rules...');
      this.initializeDetectionRules();
      console.log('✅ Detection rules initialized');
      
      // Start detection process
      console.log('🔍 Starting detection process...');
      this.startDetection();
      console.log('✅ Detection process started');
      
      console.log('🔐 Sensitive Field Detector fully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize detector:', error);
    }
  }

  async waitForDependencies() {
    console.log('⏳ Checking dependencies...');
    const dependencies = [
      'SENSITIVE_PATTERNS',
      'FIELD_DICTIONARIES', 
      'cacheManager',
      'privacyManager',
      'performanceManager'
    ];

    for (const dep of dependencies) {
      console.log(`🔍 Checking dependency: ${dep}`);
      let attempts = 0;
      while (!window[dep] && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      if (!window[dep]) {
        console.warn(`⚠️ Dependency ${dep} not loaded after 5 seconds, using fallback`);
      } else {
        console.log(`✅ Dependency ${dep} loaded successfully`);
      }
    }
    console.log('🎯 Dependency check complete');
  }

  async loadSettings() {
    try {
      const stored = await chrome.storage.sync.get('detectorSettings');
      if (stored.detectorSettings) {
        this.settings = { ...this.settings, ...stored.detectorSettings };
      }
    } catch (error) {
      console.warn('Failed to load settings, using defaults');
    }
  }

  initializeDetectionRules() {
    this.detectionRules = {
      patterns: window.SENSITIVE_PATTERNS || {},
      dictionaries: window.FIELD_DICTIONARIES || {},
      regional: window.REGIONAL_PATTERNS || {}
    };
  }

  startDetection() {
    console.log('🔍 Starting detection...');
    // Initial scan
    console.log('📊 Performing initial scan...');
    this.performInitialScan();
    
    // Set up dynamic detection
    console.log('🔄 Setting up dynamic detection...');
    this.setupDynamicDetection();
    
    // Start batch processing
    console.log('⚡ Starting batch processing...');
    this.startBatchProcessing();
    console.log('✅ Detection started successfully');
  }

  performInitialScan() {
    console.log('🔎 Starting initial scan of page elements...');
    window.performanceManager?.requestIdleExecution(() => {
      console.log('⏰ Idle execution started - collecting elements...');
      const elements = this.collectElements();
      console.log(`📋 Found ${elements.length} elements to process:`, elements);
      this.processElementsHybrid(elements);
    });
  }

  collectElements() {
    console.log('🧭 Collecting form elements...');
    const selectors = [
      'input[type="email"]',
      'input[type="password"]', 
      'input[type="tel"]',
      'input[type="text"]',
      'input[type="search"]',
      'input[type="url"]',
      'input:not([type])',
      'textarea',
      'select',
      'div[contenteditable="true"]',
      'span[contenteditable="true"]',
      '*[role="textbox"]',
      '*[aria-label*="email" i]',
      '*[aria-label*="password" i]',
      '*[aria-label*="phone" i]'
    ];

    console.log('🎯 Using selectors:', selectors);

    const elements = window.performanceManager?.efficientQuerySelector 
      ? window.performanceManager.efficientQuerySelector(selectors, 1000)
      : document.querySelectorAll(selectors.join(', '));

    console.log(`📊 Raw query found ${elements.length} elements`);
    const elementsArray = Array.from(elements);
    console.log('🔍 Element types found:', elementsArray.map(el => `${el.tagName}[type=${el.type || 'none'}]`));
    
    return elementsArray;
  }

  async processElementsHybrid(elements) {
    console.log(`🔄 Processing ${elements.length} elements with hybrid detection...`);
    if (!elements.length) {
      console.log('❌ No elements to process');
      return;
    }

    const startTime = performance.now();
    const results = {
      highConfidence: [],
      mediumConfidence: [],
      lowConfidence: []
    };

    console.log('⚡ Starting element processing loop...');
    // Process each element
    for (const element of elements) {
      if (this.processedElements.has(element)) {
        console.log('⏭️ Element already processed, skipping');
        continue;
      }
      
      console.log('🔍 Processing element:', element);
      const metadata = this.extractElementMetadata(element);
      console.log('📋 Element metadata:', metadata);
      
      const cached = await window.cacheManager?.get(metadata, this.currentDomain);
      
      if (cached) {
        console.log('💾 Found cached result:', cached);
        this.handleDetectionResult(element, cached, 'cache');
        window.performanceManager?.incrementMetric('cacheHits');
        continue;
      }

      window.performanceManager?.incrementMetric('cacheMisses');
      
      // Pattern-based detection
      const patternResult = this.detectWithPatterns(metadata);
      
      if (patternResult.confidence >= this.settings.patternConfidenceThreshold) {
        // High confidence pattern match
        results.highConfidence.push({ element, metadata, result: patternResult });
        this.handleDetectionResult(element, patternResult, 'pattern');
        
        // Cache the result
        await window.cacheManager?.set(metadata, patternResult, this.currentDomain, 'domain');
      } else if (patternResult.confidence >= this.settings.aiConfidenceThreshold) {
        // Medium confidence - cache locally but don't send to AI immediately
        results.mediumConfidence.push({ element, metadata, result: patternResult });
        this.handleDetectionResult(element, patternResult, 'pattern');
        
        await window.cacheManager?.set(metadata, patternResult, this.currentDomain, 'session');
      } else if (this.settings.enableAI) {
        // Low confidence - queue for AI analysis
        results.lowConfidence.push({ element, metadata, result: patternResult });
        this.queueForAI(element, metadata);
      }
      
      this.processedElements.add(element);
    }

    // Log results
    this.logDetectionResults(results);
    
    window.performanceManager?.recordMetric('hybridProcessingTime', performance.now() - startTime);
  }

  extractElementMetadata(element) {
    const metadata = {
      tag: element.tagName?.toLowerCase() || '',
      type: element.type || '',
      name: element.name || '',
      id: element.id || '',
      placeholder: element.placeholder || '',
      ariaLabel: element.getAttribute('aria-label') || '',
      autocomplete: element.autocomplete || '',
      required: element.required || false,
      maxLength: element.maxLength || null,
      minLength: element.minLength || null,
      pattern: element.pattern || '',
      className: element.className || '',
      labelText: this.getLabelText(element),
      formContext: this.getFormContext(element),
      positionInfo: this.getPositionInfo(element)
    };

    return metadata;
  }

  getLabelText(element) {
    // Try multiple methods to find associated label
    let labelText = '';
    
    // Method 1: for attribute
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) labelText = label.textContent?.trim() || '';
    }
    
    // Method 2: parent label
    if (!labelText) {
      const parentLabel = element.closest('label');
      if (parentLabel) labelText = parentLabel.textContent?.trim() || '';
    }
    
    // Method 3: previous sibling
    if (!labelText) {
      let sibling = element.previousElementSibling;
      while (sibling && !labelText) {
        if (sibling.tagName === 'LABEL' || sibling.textContent?.trim()) {
          labelText = sibling.textContent?.trim() || '';
          break;
        }
        sibling = sibling.previousElementSibling;
      }
    }
    
    return labelText;
  }

  getFormContext(element) {
    const form = element.closest('form');
    if (!form) return null;
    
    return {
      elementCount: form.elements?.length || 0,
      method: form.method || '',
      action: form.action || '',
      id: form.id || '',
      className: form.className || ''
    };
  }

  getPositionInfo(element) {
    try {
      const rect = element.getBoundingClientRect();
      return {
        visible: rect.width > 0 && rect.height > 0,
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    } catch (error) {
      return { visible: false };
    }
  }

  detectWithPatterns(metadata) {
    let confidence = 0;
    let fieldType = 'unknown';
    let detectionMethods = [];
    const reasons = [];

    // Input type-based detection (highest priority)
    if (metadata.type && this.detectionRules.patterns.INPUT_TYPES?.[metadata.type]) {
      const typeInfo = this.detectionRules.patterns.INPUT_TYPES[metadata.type];
      confidence = Math.max(confidence, typeInfo.sensitivity);
      fieldType = typeInfo.type;
      detectionMethods.push('input_type');
      reasons.push(`Input type: ${metadata.type}`);
    }

    // Autocomplete attribute detection
    if (metadata.autocomplete && this.detectionRules.patterns.AUTOCOMPLETE_PATTERNS?.[metadata.autocomplete]) {
      const autoInfo = this.detectionRules.patterns.AUTOCOMPLETE_PATTERNS[metadata.autocomplete];
      confidence = Math.max(confidence, autoInfo.sensitivity);
      fieldType = autoInfo.type;
      detectionMethods.push('autocomplete');
      reasons.push(`Autocomplete: ${metadata.autocomplete}`);
    }

    // Name/ID pattern matching
    const namePatterns = this.detectionRules.patterns.NAME_PATTERNS || {};
    for (const [pattern, regex] of Object.entries(namePatterns)) {
      if (this.testAttribute(metadata, 'name', regex) || this.testAttribute(metadata, 'id', regex)) {
        confidence = Math.max(confidence, 0.85);
        fieldType = pattern;
        detectionMethods.push('name_pattern');
        reasons.push(`Name/ID pattern: ${pattern}`);
        break;
      }
    }

    // Placeholder pattern matching
    const placeholderPatterns = this.detectionRules.patterns.PLACEHOLDER_PATTERNS || {};
    for (const [pattern, regex] of Object.entries(placeholderPatterns)) {
      if (this.testAttribute(metadata, 'placeholder', regex)) {
        confidence = Math.max(confidence, 0.80);
        fieldType = pattern;
        detectionMethods.push('placeholder_pattern');
        reasons.push(`Placeholder pattern: ${pattern}`);
        break;
      }
    }

    // Label pattern matching
    const labelPatterns = this.detectionRules.patterns.LABEL_PATTERNS || {};
    for (const [pattern, regex] of Object.entries(labelPatterns)) {
      if (this.testAttribute(metadata, 'labelText', regex) || this.testAttribute(metadata, 'ariaLabel', regex)) {
        confidence = Math.max(confidence, 0.75);
        fieldType = pattern;
        detectionMethods.push('label_pattern');
        reasons.push(`Label pattern: ${pattern}`);
        break;
      }
    }

    // Context-based scoring
    const contextScore = this.calculateContextScore(metadata);
    confidence = Math.min(confidence + contextScore, 1.0);

    // Multi-language support
    const languageScore = this.checkMultiLanguagePatterns(metadata);
    confidence = Math.min(confidence + languageScore, 1.0);

    return {
      confidence,
      fieldType,
      detectionMethods,
      reasons,
      timestamp: Date.now()
    };
  }

  testAttribute(metadata, attribute, regex) {
    const value = metadata[attribute];
    return value && regex.test(value);
  }

  calculateContextScore(metadata) {
    let score = 0;
    const context = [metadata.className, metadata.labelText, metadata.placeholder].join(' ').toLowerCase();
    
    const contextKeywords = this.detectionRules.patterns.CONTEXT_KEYWORDS || {};
    
    if (contextKeywords.high?.some(keyword => context.includes(keyword))) {
      score += 0.15;
    }
    if (contextKeywords.medium?.some(keyword => context.includes(keyword))) {
      score += 0.10;
    }
    
    return score;
  }

  checkMultiLanguagePatterns(metadata) {
    let score = 0;
    const dictionaries = this.detectionRules.dictionaries;
    
    for (const [lang, patterns] of Object.entries(dictionaries)) {
      for (const [fieldType, keywords] of Object.entries(patterns)) {
        const testText = [metadata.labelText, metadata.placeholder, metadata.name].join(' ').toLowerCase();
        
        if (keywords.some(keyword => testText.includes(keyword.toLowerCase()))) {
          score += 0.10;
          break;
        }
      }
    }
    
    return Math.min(score, 0.20); // Cap at 0.20
  }

  queueForAI(element, metadata) {
    if (!this.settings.enableAI) return;
    
    this.detectionQueue.push({ element, metadata, timestamp: Date.now() });
    
    // Limit queue size
    if (this.detectionQueue.length > this.settings.maxQueueSize) {
      this.detectionQueue.shift(); // Remove oldest
    }
  }

  startBatchProcessing() {
    setInterval(() => {
      if (this.detectionQueue.length > 0 && !this.isProcessing) {
        this.processBatchAI();
      }
    }, this.settings.batchProcessDelay);
  }

  async processBatchAI() {
    if (this.isProcessing || !this.settings.enableAI) return;
    
    this.isProcessing = true;
    const batch = this.detectionQueue.splice(0, Math.min(10, this.detectionQueue.length));
    
    try {
      const anonymizedBatch = window.privacyManager?.createSafeBatch(
        batch.map(item => item.metadata)
      );
      
      if (!anonymizedBatch) {
        console.warn('Privacy manager not available, skipping AI analysis');
        return;
      }
      
      // Check for cached AI responses
      const promptKey = this.generateBatchPromptKey(anonymizedBatch);
      const cachedResponse = window.cacheManager?.getCachedAIResponse(promptKey);
      
      if (cachedResponse) {
        this.handleAIResponse(batch, cachedResponse);
        window.performanceManager?.incrementMetric('cacheHits');
        return;
      }
      
      // Send to background script for AI analysis
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeWithAI',
        data: anonymizedBatch
      });
      
      if (response?.success) {
        // Cache the AI response
        await window.cacheManager?.cacheAIResponse(promptKey, response.result);
        this.handleAIResponse(batch, response.result);
        window.performanceManager?.incrementMetric('aiRequests');
      }
      
    } catch (error) {
      console.error('AI batch processing failed:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  generateBatchPromptKey(anonymizedBatch) {
    const essentialData = anonymizedBatch.elements.map(el => ({
      tag: el.tag,
      type: el.type,
      patterns: el.patterns
    }));
    
    return JSON.stringify(essentialData);
  }

  handleAIResponse(batch, aiResult) {
    if (!aiResult || !Array.isArray(aiResult.sensitiveIndexes)) return;
    
    aiResult.sensitiveIndexes.forEach(index => {
      if (batch[index]) {
        const { element, metadata } = batch[index];
        const result = {
          confidence: aiResult.confidence || 0.85,
          fieldType: aiResult.fieldTypes?.[index] || 'sensitive',
          detectionMethods: ['ai'],
          reasons: ['AI classification'],
          timestamp: Date.now()
        };
        
        this.handleDetectionResult(element, result, 'ai');
        
        // Cache AI results at global level
        window.cacheManager?.set(metadata, result, this.currentDomain, 'global');
      }
    });
  }

  handleDetectionResult(element, result, source) {
    // Create unique identifier for element
    const elementId = this.generateElementId(element);
    
    // Prepare result for logging and browser integration
    const detectionResult = {
      elementId,
      element: {
        tag: element.tagName?.toLowerCase(),
        type: element.type,
        name: element.name,
        id: element.id
      },
      sensitivity: {
        score: result.confidence,
        type: result.fieldType,
        methods: result.detectionMethods,
        reasons: result.reasons
      },
      source,
      timestamp: result.timestamp,
      domain: this.currentDomain
    };

    // Log to console
    this.logSensitiveField(detectionResult);
    
    // Send to browser's masking system (future integration)
    this.sendToBrowserAPI(detectionResult);
    
    // Add visual indicator for testing (optional)
    if (this.settings.enableVisualIndicators) {
      this.addVisualIndicator(element, result);
    }
  }

  generateElementId(element) {
    // Create a unique identifier for the element
    const parts = [
      element.tagName?.toLowerCase() || '',
      element.type || '',
      element.name || '',
      element.id || '',
      element.className || ''
    ].filter(Boolean);
    
    return window.performanceManager?.generateTaskId() || 
           Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  logSensitiveField(result) {
    console.group(`🔐 Sensitive Field Detected (${result.source})`);
    console.log('Element:', result.element);
    console.log('Sensitivity:', result.sensitivity);
    console.log('Confidence:', `${Math.round(result.sensitivity.score * 100)}%`);
    console.log('Detection Methods:', result.sensitivity.methods);
    console.log('Reasons:', result.sensitivity.reasons);
    console.groupEnd();
  }

  logDetectionResults(results) {
    const total = results.highConfidence.length + results.mediumConfidence.length + results.lowConfidence.length;
    
    if (total === 0) return;
    
    console.group(`🔍 Detection Summary - ${total} sensitive fields found`);
    console.log(`High Confidence (Pattern): ${results.highConfidence.length}`);
    console.log(`Medium Confidence (Pattern): ${results.mediumConfidence.length}`);
    console.log(`Queued for AI Analysis: ${results.lowConfidence.length}`);
    
    // Create table for detailed view
    const tableData = [
      ...results.highConfidence.map(item => ({
        Element: `${item.element.tagName}[${item.element.type || 'text'}]`,
        Name: item.element.name || item.element.id || '(none)',
        Type: item.result.fieldType,
        Confidence: `${Math.round(item.result.confidence * 100)}%`,
        Method: item.result.detectionMethods.join(', ')
      })),
      ...results.mediumConfidence.map(item => ({
        Element: `${item.element.tagName}[${item.element.type || 'text'}]`,
        Name: item.element.name || item.element.id || '(none)',
        Type: item.result.fieldType,
        Confidence: `${Math.round(item.result.confidence * 100)}%`,
        Method: item.result.detectionMethods.join(', ')
      }))
    ];
    
    if (tableData.length > 0) {
      console.table(tableData);
    }
    
    console.groupEnd();
  }

  sendToBrowserAPI(result) {
    // Future integration with custom Chromium browser
    // For now, store in a global array that the browser can access
    if (!window.detectedSensitiveFields) {
      window.detectedSensitiveFields = [];
    }
    
    window.detectedSensitiveFields.push(result);
    
    // Dispatch custom event for browser integration
    window.dispatchEvent(new CustomEvent('sensitiveFieldDetected', {
      detail: result
    }));
  }

  addVisualIndicator(element, result) {
    // Optional visual indicator for testing
    try {
      element.style.outline = `2px solid ${this.getConfidenceColor(result.confidence)}`;
      element.title = `Sensitive Field (${Math.round(result.confidence * 100)}% confidence)`;
    } catch (error) {
      // Ignore styling errors
    }
  }

  getConfidenceColor(confidence) {
    if (confidence >= 0.9) return '#ff4444'; // High confidence - red
    if (confidence >= 0.7) return '#ffaa00'; // Medium confidence - orange  
    return '#ffdd00'; // Low confidence - yellow
  }

  setupDynamicDetection() {
    // Mutation Observer for dynamic content
    const { observer } = window.performanceManager?.createOptimizedObserver(
      (mutations) => this.handleDynamicChanges(mutations)
    ) || { observer: null };
    
    if (observer) {
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      this.observers.push(observer);
    }
    
    // Scroll detection for lazy-loaded content
    window.performanceManager?.throttle('scroll-detection', () => {
      const newElements = this.collectElements().filter(el => !this.processedElements.has(el));
      if (newElements.length > 0) {
        this.processElementsHybrid(newElements);
      }
    }, 3000);
    
    window.addEventListener('scroll', () => {
      window.performanceManager?.throttle('scroll-detection', () => {
        const newElements = this.collectElements().filter(el => !this.processedElements.has(el));
        if (newElements.length > 0) {
          this.processElementsHybrid(newElements);
        }
      }, 3000);
    });
  }

  handleDynamicChanges(mutations) {
    const newElements = [];
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          // Check if the node itself is a form element
          if (this.isFormElement(node)) {
            newElements.push(node);
          }
          
          // Check for form elements within the node
          const formElements = node.querySelectorAll?.('input, textarea, select, [contenteditable="true"]');
          if (formElements) {
            newElements.push(...Array.from(formElements));
          }
        }
      });
    });
    
    if (newElements.length > 0) {
      window.performanceManager?.debounce('dynamic-processing', () => {
        this.processElementsHybrid(newElements);
      }, 500);
    }
  }

  isFormElement(element) {
    const formTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    return formTags.includes(element.tagName) || 
           element.contentEditable === 'true' ||
           element.getAttribute('role') === 'textbox';
  }

  // Cleanup method
  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.detectionQueue = [];
    this.processedElements = new WeakSet();
  }
}

// Initialize detector when DOM is ready
console.log('🌟 Content script: DOM ready check...', document.readyState);
if (document.readyState === 'loading') {
  console.log('📅 DOM still loading, adding DOMContentLoaded listener...');
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🎉 DOMContentLoaded fired, creating detector...');
    window.sensitiveFieldDetector = new SensitiveFieldDetector();
  });
} else {
  console.log('✅ DOM already ready, creating detector immediately...');
  window.sensitiveFieldDetector = new SensitiveFieldDetector();
}

// Handle browser extension lifecycle
window.addEventListener('beforeunload', () => {
  if (window.sensitiveFieldDetector) {
    window.sensitiveFieldDetector.destroy();
  }
});
