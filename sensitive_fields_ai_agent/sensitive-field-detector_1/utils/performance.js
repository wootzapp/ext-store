// Performance optimization utilities
// Manages resource usage, debouncing, and efficient DOM operations

class PerformanceManager {
  constructor() {
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
    this.observerPool = new Map();
    this.workerPool = [];
    this.metrics = {
      domScans: 0,
      aiRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0
    };
    
    this.settings = {
      maxDomElements: 10000,
      debounceDelay: 300,
      throttleDelay: 1000,
      maxConcurrentAI: 3,
      maxWorkers: 2,
      idleTimeout: 5000
    };

    this.initializeWorkers();
  }

  // Initialize Web Workers for heavy computation
  initializeWorkers() {
    if (typeof Worker === 'undefined') return;
    
    try {
      for (let i = 0; i < this.settings.maxWorkers; i++) {
        const workerCode = this.generateWorkerCode();
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));
        
        worker.onmessage = (e) => this.handleWorkerMessage(e);
        worker.onerror = (e) => console.warn('Worker error:', e);
        
        this.workerPool.push({
          worker,
          busy: false,
          id: i
        });
      }
    } catch (error) {
      console.warn('Failed to initialize workers:', error);
    }
  }

  // Generate Web Worker code for DOM analysis
  generateWorkerCode() {
    return `
      self.onmessage = function(e) {
        const { type, data, id } = e.data;
        
        try {
          let result;
          
          switch (type) {
            case 'analyzePatterns':
              result = analyzeElementPatterns(data);
              break;
            case 'processElements':
              result = processElementBatch(data);
              break;
            default:
              result = { error: 'Unknown task type' };
          }
          
          self.postMessage({ id, result, success: true });
        } catch (error) {
          self.postMessage({ id, error: error.message, success: false });
        }
      };
      
      function analyzeElementPatterns(elements) {
        return elements.map(element => ({
          ...element,
          patternScore: calculatePatternScore(element),
          confidence: calculateConfidence(element)
        }));
      }
      
      function processElementBatch(elements) {
        return elements.filter(element => 
          element.confidence > 0.7 || element.patternScore > 0.5
        );
      }
      
      function calculatePatternScore(element) {
        let score = 0;
        const attributes = [element.name, element.id, element.placeholder].filter(Boolean);
        
        const patterns = {
          email: /email|mail/i,
          password: /password|pwd|pass/i,
          phone: /phone|tel|mobile/i,
          sensitive: /ssn|credit|card|secret/i
        };
        
        attributes.forEach(attr => {
          Object.values(patterns).forEach(pattern => {
            if (pattern.test(attr)) score += 0.2;
          });
        });
        
        return Math.min(score, 1);
      }
      
      function calculateConfidence(element) {
        let confidence = 0;
        
        if (element.type === 'email') confidence += 0.9;
        if (element.type === 'password') confidence += 0.95;
        if (element.type === 'tel') confidence += 0.8;
        
        return confidence;
      }
    `;
  }

  // Handle Web Worker responses
  handleWorkerMessage(e) {
    const { id, result, success, error } = e.data;
    
    if (success && this.workerCallbacks.has(id)) {
      const callback = this.workerCallbacks.get(id);
      callback(result);
      this.workerCallbacks.delete(id);
    } else if (error) {
      console.warn('Worker task failed:', error);
    }
    
    // Mark worker as available
    const worker = this.workerPool.find(w => w.id === id);
    if (worker) worker.busy = false;
  }

  // Execute task in Web Worker
  async executeInWorker(type, data) {
    const availableWorker = this.workerPool.find(w => !w.busy);
    
    if (!availableWorker) {
      // Fallback to main thread if no workers available
      return this.executeInMainThread(type, data);
    }
    
    return new Promise((resolve) => {
      const taskId = this.generateTaskId();
      availableWorker.busy = true;
      
      if (!this.workerCallbacks) {
        this.workerCallbacks = new Map();
      }
      
      this.workerCallbacks.set(taskId, resolve);
      
      availableWorker.worker.postMessage({
        type,
        data,
        id: taskId
      });
      
      // Timeout fallback
      setTimeout(() => {
        if (this.workerCallbacks.has(taskId)) {
          this.workerCallbacks.delete(taskId);
          availableWorker.busy = false;
          resolve(this.executeInMainThread(type, data));
        }
      }, 5000);
    });
  }

  // Fallback execution in main thread
  executeInMainThread(type, data) {
    // Simplified version of worker functions
    switch (type) {
      case 'analyzePatterns':
        return data.map(element => ({
          ...element,
          patternScore: this.calculatePatternScore(element),
          confidence: this.calculateConfidence(element)
        }));
      case 'processElements':
        return data.filter(element => 
          element.confidence > 0.7 || element.patternScore > 0.5
        );
      default:
        return data;
    }
  }

  // Debounced function execution
  debounce(key, func, delay = this.settings.debounceDelay) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }
    
    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);
    
    this.debounceTimers.set(key, timer);
  }

  // Throttled function execution
  throttle(key, func, delay = this.settings.throttleDelay) {
    if (this.throttleTimers.has(key)) {
      return false; // Function is throttled
    }
    
    const timer = setTimeout(() => {
      this.throttleTimers.delete(key);
    }, delay);
    
    this.throttleTimers.set(key, timer);
    func();
    return true;
  }

  // Efficient DOM querying with limits
  efficientQuerySelector(selectors, maxResults = 1000) {
    const startTime = performance.now();
    const results = [];
    
    try {
      // Use more specific selectors first
      const prioritizedSelectors = this.prioritizeSelectors(selectors);
      
      for (const selector of prioritizedSelectors) {
        if (results.length >= maxResults) break;
        
        const elements = document.querySelectorAll(selector);
        const remaining = maxResults - results.length;
        
        for (let i = 0; i < Math.min(elements.length, remaining); i++) {
          if (!results.includes(elements[i])) {
            results.push(elements[i]);
          }
        }
      }
      
      this.recordMetric('domScanTime', performance.now() - startTime);
      this.metrics.domScans++;
      
      return results;
    } catch (error) {
      console.warn('DOM query failed:', error);
      return [];
    }
  }

  // Prioritize selectors by specificity and performance
  prioritizeSelectors(selectors) {
    const selectorMap = new Map();
    
    selectors.forEach(selector => {
      let priority = 0;
      
      // Higher priority for more specific selectors
      if (selector.includes('#')) priority += 10; // ID selector
      if (selector.includes('[type=')) priority += 8; // Type attribute
      if (selector.includes('[name')) priority += 6; // Name attribute
      if (selector.includes('.')) priority += 4; // Class selector
      
      // Lower priority for broad selectors
      if (selector === 'div' || selector === 'span') priority -= 5;
      
      selectorMap.set(selector, priority);
    });
    
    return Array.from(selectorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
  }

  // Optimized mutation observer
  createOptimizedObserver(callback, options = {}) {
    const observerId = this.generateTaskId();
    
    const defaultOptions = {
      childList: true,
      subtree: true,
      attributes: false,
      attributeOldValue: false,
      characterData: false,
      characterDataOldValue: false
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    // Debounced callback to prevent excessive triggering
    const debouncedCallback = (mutations) => {
      this.debounce(`observer_${observerId}`, () => {
        // Filter mutations to only relevant changes
        const relevantMutations = mutations.filter(mutation => 
          this.isRelevantMutation(mutation)
        );
        
        if (relevantMutations.length > 0) {
          callback(relevantMutations);
        }
      }, 200);
    };
    
    const observer = new MutationObserver(debouncedCallback);
    this.observerPool.set(observerId, observer);
    
    return { observer, observerId };
  }

  // Check if mutation is relevant for sensitive field detection
  isRelevantMutation(mutation) {
    if (mutation.type !== 'childList') return false;
    
    const relevantTags = ['INPUT', 'TEXTAREA', 'SELECT', 'FORM'];
    
    // Check added nodes
    for (const node of mutation.addedNodes) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (relevantTags.includes(node.tagName)) return true;
        if (node.querySelector && node.querySelector('input, textarea, select')) return true;
      }
    }
    
    return false;
  }

  // Request idle callback with fallback
  requestIdleExecution(callback, timeout = this.settings.idleTimeout) {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(callback, { timeout });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(callback, 16); // ~60fps
    }
  }

  // Batch processing with size limits
  processBatch(items, processor, batchSize = 50) {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = processor(batch);
      results.push(...batchResults);
      
      // Yield control between batches
      if (i + batchSize < items.length) {
        return new Promise(resolve => {
          this.requestIdleExecution(() => {
            const remainingResults = this.processBatch(
              items.slice(i + batchSize), 
              processor, 
              batchSize
            );
            resolve([...results, ...remainingResults]);
          });
        });
      }
    }
    
    return results;
  }

  // Memory-efficient element processing
  processElementsEfficiently(elements) {
    const startTime = performance.now();
    
    // Pre-filter elements to reduce processing load
    const relevantElements = elements.filter(el => this.isRelevantElement(el));
    
    if (relevantElements.length > this.settings.maxDomElements) {
      console.warn(`Too many elements (${relevantElements.length}), limiting to ${this.settings.maxDomElements}`);
      relevantElements.splice(this.settings.maxDomElements);
    }
    
    // Process in batches using workers when possible
    const result = this.executeInWorker('processElements', relevantElements);
    
    this.recordMetric('processingTime', performance.now() - startTime);
    
    return result;
  }

  // Check if element is relevant for processing
  isRelevantElement(element) {
    const relevantTypes = ['input', 'textarea', 'select'];
    const relevantClasses = ['form-control', 'input', 'field'];
    
    // Tag-based relevance
    if (relevantTypes.includes(element.tagName?.toLowerCase())) {
      return true;
    }
    
    // Class-based relevance
    if (element.className && relevantClasses.some(cls => 
      element.className.toLowerCase().includes(cls)
    )) {
      return true;
    }
    
    // Content-based relevance for divs/spans
    if (['div', 'span'].includes(element.tagName?.toLowerCase())) {
      const text = element.textContent?.toLowerCase() || '';
      const sensitiveKeywords = ['email', 'password', 'phone', 'address'];
      return sensitiveKeywords.some(keyword => text.includes(keyword));
    }
    
    return false;
  }

  // Record performance metrics
  recordMetric(metric, value) {
    if (metric === 'processingTime') {
      this.metrics.totalProcessingTime += value;
      this.metrics.averageProcessingTime = 
        this.metrics.totalProcessingTime / (this.metrics.domScans + this.metrics.aiRequests);
    }
    
    this.metrics[metric] = value;
  }

  // Increment counter metrics
  incrementMetric(metric) {
    this.metrics[metric] = (this.metrics[metric] || 0) + 1;
  }

  // Get performance statistics
  getPerformanceStats() {
    return {
      ...this.metrics,
      activeDebounceTimers: this.debounceTimers.size,
      activeThrottleTimers: this.throttleTimers.size,
      activeObservers: this.observerPool.size,
      availableWorkers: this.workerPool.filter(w => !w.busy).length,
      memoryUsage: this.getMemoryUsage()
    };
  }

  // Estimate memory usage
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  // Clean up resources
  cleanup() {
    // Clear all timers
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.throttleTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
    this.throttleTimers.clear();
    
    // Disconnect observers
    this.observerPool.forEach(observer => observer.disconnect());
    this.observerPool.clear();
    
    // Terminate workers
    this.workerPool.forEach(({ worker }) => worker.terminate());
    this.workerPool.length = 0;
  }

  // Generate unique task ID
  generateTaskId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Pattern scoring functions
  calculatePatternScore(element) {
    let score = 0;
    const attributes = [element.name, element.id, element.placeholder].filter(Boolean);
    
    const patterns = {
      email: /email|mail/i,
      password: /password|pwd|pass/i,
      phone: /phone|tel|mobile/i,
      sensitive: /ssn|credit|card|secret/i
    };
    
    attributes.forEach(attr => {
      Object.values(patterns).forEach(pattern => {
        if (pattern.test(attr)) score += 0.2;
      });
    });
    
    return Math.min(score, 1);
  }

  calculateConfidence(element) {
    let confidence = 0;
    
    if (element.type === 'email') confidence += 0.9;
    if (element.type === 'password') confidence += 0.95;
    if (element.type === 'tel') confidence += 0.8;
    
    return confidence;
  }
}

// Initialize global performance manager
window.performanceManager = new PerformanceManager();
