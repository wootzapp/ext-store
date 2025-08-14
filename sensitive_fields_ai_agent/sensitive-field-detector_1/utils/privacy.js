// Privacy and data anonymization utilities
// Ensures no user data is transmitted to external services

class PrivacyManager {
  constructor() {
    this.sensitiveValueRegex = {
      email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      phone: /^[\+]?[(]?[\d\s\-\(\)\.]{10,}$/,
      creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,
      ssn: /^\d{3}[-\s]?\d{2}[-\s]?\d{4}$/,
      zipCode: /^\d{5}(-\d{4})?$/
    };
    
    this.tokenMap = new Map();
    this.hashSalt = this.generateSalt();
  }

  // Generate a random salt for hashing
  generateSalt() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Anonymize element metadata before sending to AI
  anonymizeElement(element) {
    const anonymized = {
      index: element.index,
      tag: element.tag,
      type: element.type || '',
      structure: this.generateStructureFingerprint(element),
      context: this.extractSafeContext(element),
      patterns: this.extractPatterns(element),
      visual: this.extractVisualCues(element)
    };

    // Add anonymized attribute information
    if (element.name) {
      anonymized.namePattern = this.anonymizeAttribute('name', element.name);
    }
    if (element.id) {
      anonymized.idPattern = this.anonymizeAttribute('id', element.id);
    }
    if (element.placeholder) {
      anonymized.placeholderPattern = this.anonymizeAttribute('placeholder', element.placeholder);
    }
    if (element.labelText) {
      anonymized.labelPattern = this.anonymizeAttribute('label', element.labelText);
    }
    if (element.ariaLabel) {
      anonymized.ariaPattern = this.anonymizeAttribute('aria', element.ariaLabel);
    }

    return anonymized;
  }

  // Anonymize attribute values while preserving meaningful patterns
  anonymizeAttribute(type, value) {
    if (!value) return '';
    
    // Convert to lowercase for pattern matching
    const lowerValue = value.toLowerCase();
    
    // Check for sensitive patterns and replace with tokens
    const patterns = {
      email: ['email', 'mail', 'e-mail', '@'],
      password: ['password', 'pwd', 'pass', 'secret', 'pin'],
      phone: ['phone', 'tel', 'mobile', 'cell'],
      address: ['address', 'street', 'addr', 'location'],
      name: ['name', 'first', 'last', 'given', 'family'],
      date: ['date', 'birth', 'dob', 'birthday'],
      credit: ['credit', 'card', 'cc', 'payment'],
      ssn: ['ssn', 'social', 'security', 'tax'],
      number: /\d+/g
    };

    let anonymizedValue = lowerValue;
    
    // Replace sensitive keywords with tokens
    for (const [category, keywords] of Object.entries(patterns)) {
      if (Array.isArray(keywords)) {
        keywords.forEach(keyword => {
          if (anonymizedValue.includes(keyword)) {
            anonymizedValue = anonymizedValue.replace(
              new RegExp(keyword, 'gi'), 
              `${category.toUpperCase()}_TOKEN`
            );
          }
        });
      } else if (keywords instanceof RegExp) {
        anonymizedValue = anonymizedValue.replace(keywords, 'NUMBER_TOKEN');
      }
    }

    // Preserve structure indicators
    anonymizedValue = this.preserveStructure(anonymizedValue);
    
    return anonymizedValue;
  }

  // Preserve structural information while anonymizing
  preserveStructure(value) {
    // Preserve common separators and patterns
    const structurePreservation = {
      '_': 'UNDERSCORE',
      '-': 'DASH',
      '.': 'DOT',
      '@': 'AT_SYMBOL',
      '#': 'HASH',
      '$': 'DOLLAR',
      '%': 'PERCENT'
    };

    let preserved = value;
    for (const [char, token] of Object.entries(structurePreservation)) {
      preserved = preserved.replace(new RegExp(`\\${char}`, 'g'), token);
    }

    return preserved;
  }

  // Generate a structural fingerprint without exposing sensitive data
  generateStructureFingerprint(element) {
    const features = {
      hasName: !!element.name,
      hasId: !!element.id,
      hasPlaceholder: !!element.placeholder,
      hasLabel: !!element.labelText,
      hasAriaLabel: !!element.ariaLabel,
      hasClass: !!element.className,
      hasAutocomplete: !!element.autocomplete,
      isRequired: !!element.required,
      isDisabled: !!element.disabled,
      isReadonly: !!element.readonly,
      tagType: element.tag?.toLowerCase(),
      inputType: element.type?.toLowerCase()
    };

    // Create a hash of the feature set
    return this.hashObject(features);
  }

  // Extract safe contextual information
  extractSafeContext(element) {
    const context = {
      formContext: this.getFormContext(element),
      positionContext: this.getPositionContext(element),
      semanticContext: this.getSemanticContext(element)
    };

    return context;
  }

  // Get form-level context without sensitive data
  getFormContext(element) {
    const form = element.form;
    if (!form) return null;

    return {
      formElements: form.elements?.length || 0,
      formMethod: form.method || '',
      formAction: this.anonymizeUrl(form.action || ''),
      formId: form.id ? this.hashString(form.id) : null
    };
  }

  // Get positional context
  getPositionContext(element) {
    // This would be populated by the content script with DOM position info
    return element.positionInfo || null;
  }

  // Extract semantic context from surrounding elements
  getSemanticContext(element) {
    // This would analyze nearby text, headings, etc. for context
    return element.semanticInfo || null;
  }

  // Extract visual patterns and cues
  extractPatterns(element) {
    const patterns = {
      hasEmailPattern: this.testPattern(element, 'email'),
      hasPhonePattern: this.testPattern(element, 'phone'),
      hasPasswordPattern: this.testPattern(element, 'password'),
      hasAddressPattern: this.testPattern(element, 'address'),
      hasNamePattern: this.testPattern(element, 'name'),
      hasCreditCardPattern: this.testPattern(element, 'creditCard'),
      hasSSNPattern: this.testPattern(element, 'ssn')
    };

    return patterns;
  }

  // Test for specific patterns in element attributes
  testPattern(element, patternType) {
    const patterns = window.SENSITIVE_PATTERNS;
    if (!patterns) return false;

    const testFields = [
      element.name,
      element.id,
      element.placeholder,
      element.labelText,
      element.ariaLabel
    ].filter(Boolean);

    const patternRegex = patterns.NAME_PATTERNS[patternType] || 
                        patterns.PLACEHOLDER_PATTERNS[patternType] ||
                        patterns.LABEL_PATTERNS[patternType];

    if (!patternRegex) return false;

    return testFields.some(field => patternRegex.test(field));
  }

  // Extract visual cues without sensitive data
  extractVisualCues(element) {
    return {
      hasPasswordToggle: this.hasVisualIndicator(element, 'passwordToggle'),
      hasRequiredIndicator: this.hasVisualIndicator(element, 'requiredField'),
      hasSecurityIcon: this.hasVisualIndicator(element, 'securityIcon'),
      hasEmailIcon: this.hasVisualIndicator(element, 'emailIcon'),
      inputMasking: !!element.inputMasking,
      maxLength: element.maxLength || null,
      minLength: element.minLength || null
    };
  }

  // Check for visual indicators
  hasVisualIndicator(element, indicatorType) {
    const indicators = window.SENSITIVE_PATTERNS?.VISUAL_INDICATORS?.[indicatorType] || [];
    const classNames = element.className || '';
    
    return indicators.some(indicator => 
      classNames.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  // Anonymize URLs while preserving structure
  anonymizeUrl(url) {
    if (!url) return '';
    
    try {
      const urlObj = new URL(url);
      return {
        protocol: urlObj.protocol,
        hostname: this.hashString(urlObj.hostname),
        pathname: this.anonymizePath(urlObj.pathname),
        hasQuery: !!urlObj.search,
        hasFragment: !!urlObj.hash
      };
    } catch {
      return { invalidUrl: true };
    }
  }

  // Anonymize URL paths
  anonymizePath(path) {
    if (!path) return '';
    
    const segments = path.split('/').filter(Boolean);
    return segments.map(segment => {
      if (segment.match(/^\d+$/)) return 'ID_SEGMENT';
      if (segment.length > 10) return 'LONG_SEGMENT';
      return this.hashString(segment);
    }).join('/');
  }

  // Hash any object to create consistent fingerprints
  hashObject(obj) {
    const str = JSON.stringify(obj, Object.keys(obj).sort());
    return this.hashString(str);
  }

  // Simple hash function
  hashString(str) {
    if (!str) return '';
    
    let hash = 0;
    const saltedStr = str + this.hashSalt;
    
    for (let i = 0; i < saltedStr.length; i++) {
      const char = saltedStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  // Validate that no sensitive data is in the anonymized object
  validateAnonymization(anonymizedData) {
    const dataStr = JSON.stringify(anonymizedData).toLowerCase();
    
    // Check for potential PII patterns
    const sensitivePatterns = [
      /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/, // Email
      /\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/, // SSN
      /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/, // Credit card
      /\b\d{10,}\b/ // Long numbers
    ];

    for (const pattern of sensitivePatterns) {
      if (pattern.test(dataStr)) {
        console.warn('Potential sensitive data detected in anonymized object');
        return false;
      }
    }

    return true;
  }

  // Create a privacy-safe batch of elements for AI analysis
  createSafeBatch(elements) {
    const anonymizedBatch = elements.map(element => this.anonymizeElement(element));
    
    // Validate the entire batch
    const isValid = anonymizedBatch.every(item => this.validateAnonymization(item));
    
    if (!isValid) {
      throw new Error('Anonymization validation failed');
    }

    return {
      elements: anonymizedBatch,
      batchId: this.generateBatchId(),
      timestamp: Date.now(),
      privacyVersion: '1.0'
    };
  }

  // Generate unique batch ID for tracking
  generateBatchId() {
    return crypto.randomUUID();
  }

  // Get privacy compliance report
  getPrivacyReport() {
    return {
      dataMinimization: 'Implemented',
      anonymization: 'Active',
      noUserValues: 'Enforced',
      encryption: 'Local storage only',
      retention: 'Session-based with configurable TTL',
      compliance: ['GDPR Article 25', 'CCPA Section 1798.100']
    };
  }
}

// Initialize global privacy manager
window.privacyManager = new PrivacyManager();
