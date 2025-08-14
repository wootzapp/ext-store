// Sensitive Field Detection Patterns
// Comprehensive patterns for client-side detection

console.log('🔧 patterns.js loading...', window.location.href);

window.SENSITIVE_PATTERNS = {
  // Input type-based detection
  INPUT_TYPES: {
    email: { sensitivity: 0.95, type: 'email' },
    password: { sensitivity: 0.99, type: 'password' },
    tel: { sensitivity: 0.90, type: 'phone' },
    url: { sensitivity: 0.70, type: 'url' },
    search: { sensitivity: 0.30, type: 'search' }
  },

  // Name/ID attribute patterns
  NAME_PATTERNS: {
    // Email patterns
    email: /^(email|e[-_]?mail|user[-_]?name|login[-_]?id|account[-_]?name)$/i,
    emailConfirm: /^(confirm[-_]?email|email[-_]?confirm|verify[-_]?email)$/i,
    
    // Password patterns  
    password: /^(password|passwd|pwd|pass|pin|secret|auth[-_]?code)$/i,
    passwordConfirm: /^(confirm[-_]?password|password[-_]?confirm|verify[-_]?password|repeat[-_]?password)$/i,
    
    // Phone patterns
    phone: /^(phone|tel|mobile|cell|contact[-_]?number|phone[-_]?number)$/i,
    
    // Address patterns
    address: /^(address|street|addr|location|residence)$/i,
    city: /^(city|town|municipality)$/i,
    state: /^(state|province|region)$/i,
    zip: /^(zip|postal[-_]?code|post[-_]?code)$/i,
    country: /^(country|nation)$/i,
    
    // Personal info patterns
    firstName: /^(first[-_]?name|given[-_]?name|fname)$/i,
    lastName: /^(last[-_]?name|family[-_]?name|surname|lname)$/i,
    fullName: /^(full[-_]?name|name|display[-_]?name)$/i,
    dateOfBirth: /^(dob|date[-_]?of[-_]?birth|birth[-_]?date|birthday)$/i,
    
    // Financial patterns
    creditCard: /^(cc|credit[-_]?card|card[-_]?number|payment[-_]?method)$/i,
    cvv: /^(cvv|cvc|security[-_]?code|card[-_]?code)$/i,
    bankAccount: /^(account[-_]?number|bank[-_]?account|routing[-_]?number)$/i,
    
    // Government ID patterns
    ssn: /^(ssn|social[-_]?security|tax[-_]?id|national[-_]?id)$/i,
    license: /^(license|dl|driver[-_]?license|id[-_]?number)$/i,
    passport: /^(passport|passport[-_]?number)$/i
  },

  // Placeholder text patterns
  PLACEHOLDER_PATTERNS: {
    email: /enter.*(email|e[-\s]mail)|email.*address|your.*email/i,
    password: /enter.*(password|pwd)|your.*password|create.*password/i,
    phone: /enter.*(phone|number)|phone.*number|your.*phone/i,
    address: /enter.*(address|street)|your.*address|home.*address/i,
    name: /enter.*(name|full.*name)|your.*name|first.*name|last.*name/i,
    creditCard: /card.*number|enter.*card|credit.*card/i,
    ssn: /social.*security|enter.*ssn|your.*ssn/i
  },

  // Label text patterns
  LABEL_PATTERNS: {
    email: /^(email|e[-\s]mail|email\s+address|login|username)$/i,
    password: /^(password|pwd|pass|secret|passcode)$/i,
    phone: /^(phone|telephone|mobile|cell|contact)$/i,
    address: /^(address|street|location|residence)$/i,
    name: /^(name|full\s+name|first\s+name|last\s+name)$/i,
    dateOfBirth: /^(date\s+of\s+birth|dob|birthday|birth\s+date)$/i,
    creditCard: /^(credit\s+card|card\s+number|payment\s+method)$/i,
    ssn: /^(social\s+security|ssn|tax\s+id|national\s+id)$/i
  },

  // Content patterns for regex matching
  CONTENT_PATTERNS: {
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[\+]?[(]?[\d\s\-\(\)\.]{10,}$/,
    creditCard: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,
    ssn: /^\d{3}[-\s]?\d{2}[-\s]?\d{4}$/,
    zipCode: /^\d{5}(-\d{4})?$/,
    dateOfBirth: /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/
  },

  // Autocomplete attribute values
  AUTOCOMPLETE_PATTERNS: {
    'email': { sensitivity: 0.95, type: 'email' },
    'username': { sensitivity: 0.85, type: 'username' },
    'current-password': { sensitivity: 0.99, type: 'password' },
    'new-password': { sensitivity: 0.99, type: 'password' },
    'tel': { sensitivity: 0.90, type: 'phone' },
    'tel-national': { sensitivity: 0.90, type: 'phone' },
    'street-address': { sensitivity: 0.85, type: 'address' },
    'address-line1': { sensitivity: 0.85, type: 'address' },
    'address-line2': { sensitivity: 0.75, type: 'address' },
    'postal-code': { sensitivity: 0.80, type: 'zipcode' },
    'country': { sensitivity: 0.70, type: 'country' },
    'given-name': { sensitivity: 0.85, type: 'firstName' },
    'family-name': { sensitivity: 0.85, type: 'lastName' },
    'name': { sensitivity: 0.85, type: 'fullName' },
    'cc-number': { sensitivity: 0.95, type: 'creditCard' },
    'cc-csc': { sensitivity: 0.95, type: 'cvv' },
    'cc-exp': { sensitivity: 0.90, type: 'cardExpiry' },
    'bday': { sensitivity: 0.85, type: 'dateOfBirth' }
  },

  // Visual cues and indicators
  VISUAL_INDICATORS: {
    passwordToggle: ['password-toggle', 'show-password', 'eye-icon'],
    requiredField: ['required', 'mandatory', 'asterisk'],
    securityIcon: ['lock', 'shield', 'secure', 'key'],
    emailIcon: ['email', 'envelope', 'mail']
  },

  // Context keywords that suggest sensitivity
  CONTEXT_KEYWORDS: {
    high: ['personal', 'private', 'confidential', 'sensitive', 'secure'],
    medium: ['account', 'profile', 'contact', 'billing', 'payment'],
    low: ['preferences', 'settings', 'options', 'display']
  }
};
