console.log("Background script starting...");

// ======================
// SENSITIVE TEXT REDACTION IMPORTS AND CONFIGURATION
// ======================

// Import XRegExp and pattern files for text redaction
try {
  importScripts(
    'public/libs/xregexp.js',
    'public/ptr/apipatterns.js',
    'public/ptr/piiPatterns.js',
    'public/ptr/fiPatterns.js',
    'public/ptr/cryptoPatterns.js',
    'public/ptr/medPatterns.js',
    'public/ptr/networkPatterns.js'
  );
  console.log("✅ Successfully imported pattern files for text redaction");
} catch (error) {
  console.error("❌ Failed to import pattern files:", error);
}

// Combine all patterns for text redaction
const allRedactionPatterns = {};
try {
  if (typeof apiPatterns !== 'undefined') {
    allRedactionPatterns.api = apiPatterns;
  }
  if (typeof personalIdentificationPatterns !== 'undefined') {
    allRedactionPatterns.pii = personalIdentificationPatterns;
  }
  if (typeof fiPatterns !== 'undefined') {
    allRedactionPatterns.financial = fiPatterns;
  }
  if (typeof cryptoPatterns !== 'undefined') {
    allRedactionPatterns.crypto = cryptoPatterns;
  }
  if (typeof medPatterns !== 'undefined') {
    allRedactionPatterns.medical = medPatterns;
  }
  if (typeof networkPatterns !== 'undefined') {
    allRedactionPatterns.network = networkPatterns;
  }
  console.log("✅ Combined patterns for categories:", Object.keys(allRedactionPatterns));
} catch (error) {
  console.error("❌ Error combining patterns:", error);
}

// Default enabled categories for text redaction
const defaultRedactionCategories = {
  api: true,
  pii: true,
  financial: true,
  crypto: true,
  medical: false, // Disabled by default for performance
  network: false  // Disabled by default for performance
};

// Text redaction configuration
const REDACTION_CONFIG = {
  REDACTION_CHAR: "*",
  MIN_REVEAL_LENGTH: 2,
  MAX_REVEAL_LENGTH: 4,
  EMAIL_REDACTION_FORMAT: "prefix***@domain.com" // Special format for emails
};

// ======================
// SENSITIVE TEXT REDACTION FUNCTIONS
// ======================

// Initialize redaction settings on install
function initializeRedactionSettings() {
  chrome.storage.sync.set({
    enabledRedactionCategories: defaultRedactionCategories,
    redactionEnabled: true
  });
}

// Get enabled redaction categories from storage
function getEnabledRedactionCategories(callback) {
  chrome.storage.sync.get(['enabledRedactionCategories'], (result) => {
    callback(result.enabledRedactionCategories || defaultRedactionCategories);
  });
}

// Smart redaction function that preserves some context
function smartRedact(text, evidence, type) {
  const len = evidence.length;

  // Special handling for different data types
  switch (type.toLowerCase()) {
    case 'email address':
      return redactEmail(evidence);

    case 'phone number':
      return redactPhoneNumber(evidence);

    case 'credit card':
    case 'visa card number':
    case 'mastercard number':
    case 'american express (amex) number':
    case 'discover card number':
    case 'jcb card number':
    case 'diners club card number':
    case 'unionpay card number':
    case 'maestro card number':
      return redactCreditCard(evidence);

    case 'social security number (ssn)':
      return redactSSN(evidence);

    // API Keys and Tokens
    case 'openai user api key':
    case 'google api key':
    case 'github personal access token (classic)':
    case 'github personal access token (fine-grained)':
    case 'github oauth 2.0 access token':
    case 'github user-to-server access token':
    case 'github server-to-server access token':
    case 'github refresh token':
    case 'aws access id key':
    case 'aws secret key':
    case 'stripe api key':
    case 'slack api token':
    case 'discord bot token':
    case 'telegram bot token':
      return redactAPIKey(evidence);

    // Cryptocurrency
    case 'bitcoin (btc)':
    case 'ethereum (eth)':
    case 'cardano (ada)':
    case 'xrp (ripple)':
    case 'solana (sol)':
    case 'dogecoin (doge)':
    case 'litecoin (ltc)':
      return redactCryptoAddress(evidence);

    // Private Keys and Secrets
    case 'bitcoin private key (wif)':
    case 'ethereum private key':
    case 'ripple secret key':
    case 'solana private key':
    case 'stellar secret key':
      return redactPrivateKey(evidence);

    default:
      // For unrecognized types, apply generic redaction
      return redactGeneric(evidence);
  }
}

// Redact email addresses (show prefix and domain)
function redactEmail(email) {
  const emailParts = email.split('@');
  if (emailParts.length === 2) {
    const prefix = emailParts[0];
    const domain = emailParts[1];

    const visiblePrefix = prefix.length > 3 ? prefix.substring(0, 2) : prefix.substring(0, 1);
    const prefixRedacted = visiblePrefix + REDACTION_CONFIG.REDACTION_CHAR.repeat(Math.max(1, prefix.length - visiblePrefix.length));

    return `${prefixRedacted}@${domain}`;
  }
  return redactGeneric(email);
}

// Redact phone numbers (show area code)
function redactPhoneNumber(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length >= 10) {
    const areaCode = cleanPhone.substring(0, 3);
    const redactedDigits = areaCode + REDACTION_CONFIG.REDACTION_CHAR.repeat(cleanPhone.length - 3);

    // Replace each digit in the original string with corresponding redacted digit
    let redactedPhone = phone;
    let digitIndex = 0;

    for (let i = 0; i < phone.length; i++) {
      if (/\d/.test(phone[i])) {
        redactedPhone = redactedPhone.substring(0, i) + redactedDigits[digitIndex] + redactedPhone.substring(i + 1);
        digitIndex++;
      }
    }

    return redactedPhone;
  }
  return redactGeneric(phone);
}

// Redact credit card numbers (show last 4 digits)
function redactCreditCard(cardNumber) {
  const cleanCard = cardNumber.replace(/\D/g, '');
  if (cleanCard.length >= 12) {
    const last4 = cleanCard.slice(-4);
    const redactedDigits = REDACTION_CONFIG.REDACTION_CHAR.repeat(cleanCard.length - 4) + last4;

    // Replace each digit in the original string with corresponding redacted digit
    let redactedCard = cardNumber;
    let digitIndex = 0;

    for (let i = 0; i < cardNumber.length; i++) {
      if (/\d/.test(cardNumber[i])) {
        redactedCard = redactedCard.substring(0, i) + redactedDigits[digitIndex] + redactedCard.substring(i + 1);
        digitIndex++;
      }
    }

    return redactedCard;
  }
  return redactGeneric(cardNumber);
}

// Redact SSN (show last 4 digits)
function redactSSN(ssn) {
  const cleanSSN = ssn.replace(/\D/g, '');
  if (cleanSSN.length === 9) {
    const last4 = cleanSSN.slice(-4);
    const redactedDigits = REDACTION_CONFIG.REDACTION_CHAR.repeat(5) + last4;

    // Replace each digit in the original string with corresponding redacted digit
    let redactedSSN = ssn;
    let digitIndex = 0;

    for (let i = 0; i < ssn.length; i++) {
      if (/\d/.test(ssn[i])) {
        redactedSSN = redactedSSN.substring(0, i) + redactedDigits[digitIndex] + redactedSSN.substring(i + 1);
        digitIndex++;
      }
    }

    return redactedSSN;
  }
  return redactGeneric(ssn);
}

// Generic redaction (show first 2-4 characters)
function redactGeneric(text) {
  const len = text.length;
  if (len <= 4) {
    return REDACTION_CONFIG.REDACTION_CHAR.repeat(len);
  }

  const revealLength = Math.min(REDACTION_CONFIG.MAX_REVEAL_LENGTH, Math.max(REDACTION_CONFIG.MIN_REVEAL_LENGTH, Math.floor(len * 0.2)));
  const visible = text.substring(0, revealLength);
  const redacted = REDACTION_CONFIG.REDACTION_CHAR.repeat(len - revealLength);

  return visible + redacted;
}

// Redact API Keys (show prefix, hide most of the key)
function redactAPIKey(apiKey) {
  const len = apiKey.length;

  // For very short keys, redact completely
  if (len <= 6) {
    return REDACTION_CONFIG.REDACTION_CHAR.repeat(len);
  }

  // For keys with common prefixes (sk-, ghp_, AKIA, etc.), show prefix + few chars
  const prefixes = ['sk-', 'ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_', 'AKIA', 'AIza', 'ya29.', 'xoxb-', 'xoxa-', 'xoxp-', 'xoxr-', 'xoxs-'];

  for (const prefix of prefixes) {
    if (apiKey.startsWith(prefix)) {
      const visibleLength = Math.min(prefix.length + 2, len - 6); // Show prefix + 2 chars, but leave at least 6 chars to redact
      const visible = apiKey.substring(0, visibleLength);
      const redacted = REDACTION_CONFIG.REDACTION_CHAR.repeat(len - visibleLength);
      return visible + redacted;
    }
  }

  // For keys without recognizable prefixes, show first 3-4 characters
  const revealLength = Math.min(4, Math.max(2, Math.floor(len * 0.15)));
  const visible = apiKey.substring(0, revealLength);
  const redacted = REDACTION_CONFIG.REDACTION_CHAR.repeat(len - revealLength);

  return visible + redacted;
}

// Redact cryptocurrency addresses (show first few and last few chars)
function redactCryptoAddress(address) {
  const len = address.length;

  if (len <= 8) {
    return REDACTION_CONFIG.REDACTION_CHAR.repeat(len);
  }

  // Show first 4 and last 4 characters for addresses
  const firstPart = address.substring(0, 4);
  const lastPart = address.substring(len - 4);
  const redacted = REDACTION_CONFIG.REDACTION_CHAR.repeat(len - 8);

  return firstPart + redacted + lastPart;
}

// Redact private keys and secrets (almost complete redaction)
function redactPrivateKey(privateKey) {
  const len = privateKey.length;

  if (len <= 4) {
    return REDACTION_CONFIG.REDACTION_CHAR.repeat(len);
  }

  // For private keys, show only first 2 characters for identification
  const visible = privateKey.substring(0, 2);
  const redacted = REDACTION_CONFIG.REDACTION_CHAR.repeat(len - 2);

  return visible + redacted;
}

// Main function to identify and redact sensitive data
function identifyAndRedactSensitiveData(text, callback) {
  console.log("🔍 Starting text analysis for redaction...");

  getEnabledRedactionCategories((enabledCategories) => {
    let sensitiveDataFound = [];
    let redactedText = text;

    // Iterate through each enabled category
    Object.keys(allRedactionPatterns).forEach(categoryKey => {
      if (enabledCategories[categoryKey] === true) {
        const categoryPatterns = allRedactionPatterns[categoryKey];

        // Iterate through patterns in the category
        Object.keys(categoryPatterns).forEach(patternKey => {
          const patternObj = categoryPatterns[patternKey];
          const regex = patternObj.pattern;

          let match;
          // Reset regex lastIndex for global patterns
          regex.lastIndex = 0;

          while ((match = regex.exec(text)) !== null) {
            const evidence = match[0];

            // Skip if this evidence has already been processed
            if (sensitiveDataFound.some(item => item.evidence === evidence && item.startIndex === match.index)) {
              if (!regex.global) break;
              continue;
            }

            const redactedEvidence = smartRedact(text, evidence, patternObj.type);

            sensitiveDataFound.push({
              category: categoryKey,
              type: patternObj.type,
              pattern: regex.toString(),
              evidence: evidence,
              redactedEvidence: redactedEvidence,
              startIndex: match.index,
              endIndex: match.index + evidence.length,
              tags: patternObj.tags || []
            });

            // Replace the original text with redacted version
            redactedText = redactedText.replace(evidence, redactedEvidence);

            console.log(`🎭 Found and redacted ${patternObj.type}: ${evidence} -> ${redactedEvidence}`);

            // Prevent infinite loop for non-global regexes
            if (!regex.global) break;
          }
        });
      }
    });

    console.log(`🔍 Analysis complete. Found ${sensitiveDataFound.length} sensitive items.`);

    callback({
      originalText: text,
      redactedText: redactedText,
      sensitiveItems: sensitiveDataFound,
      hasSensitiveData: sensitiveDataFound.length > 0
    });
  });
}

// Configuration for content analysis
const CONFIG = {
  GEMINI_API_BASE: "https://generativelanguage.googleapis.com/v1beta/models/",
  // Updated to use the stable Gemini Flash model (user request)
  // Refer to Google AI docs for current available model IDs (e.g., gemini-1.5-flash, gemini-1.5-flash-latest)
  // Updated per user request to Gemini 2.5 Flash (ensure this model ID is supported in your API quota)
  GEMINI_MODEL: "gemini-2.5-flash",
  HARDCODED_API_KEY: "", // Hardcoded API key
  MAX_RETRY_ATTEMPTS: 1,
  RATE_LIMIT_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MAX_PROMPT_LENGTH: 100000,
};

// In-memory cache and tracking
const analysisCache = new Map();
const rateLimiter = new Map();
const analyzedUrls = new Map(); // Track analyzed URLs per tab
let latestAnalysis = null;

// Prompt Generator for Gemini API
class PromptGenerator {
  static generateSensitiveContentPrompt(domData) {
    const { pageInfo, completeHTML, metaInfo } = domData;

    let prompt = this.buildBasePrompt();
    prompt += this.buildPageContext(pageInfo, metaInfo);
    prompt += this.buildDOMSection(completeHTML);

    return prompt;
  }

  static buildBasePrompt() {
    return `You are an AI embedded in a browser extension that scans a webpage DOM to detect and mask sensitive information.

You will be given the full DOM of a webpage. Your task is to identify and return only the CSS selectors of elements that likely contain sensitive or private user data.

🔍 DEFINITION OF SENSITIVE FIELDS
Sensitive fields include (but are not limited to):

Financial: Card numbers, CVV, account balance, bank info, UPI ID, IBAN, transaction amount

Identity/PII: Name, phone, email, address, Aadhar, PAN, SSN, Passport number

Authentication: Passwords, PINs, security questions, OTPs

Other sensitive tokens visible in the DOM

🧠 INSTRUCTIONS
Analyze the DOM and locate elements that likely contain sensitive data based on:

id, class, name, placeholder, aria-label, value, textContent, surrounding labels

Common patterns: ****, 16-digit numbers, ₹/$ signs near labels like balance, total, amount, etc.

Infer sensitive fields even if the actual data is masked or partially hidden (e.g., ****1234, ₹****).

Ignore UI controls, buttons, or decorative content unless they directly display sensitive info.

✅ RESPONSE FORMAT
Return a JSON array of CSS selectors in this EXACT format. Use proper CSS selector syntax with escaped quotes:

[
  "[data-account-number=\\"true\\"]",
  "[data-balance=\\"true\\"]",
  "[data-cc-number=\\"true\\"]",
  "[autocomplete=\\"name\\"]",
  "[autocomplete=\\"email\\"]",
  "[autocomplete=\\"tel\\"]",
  "[autocomplete=\\"street-address\\"]",
  "[autocomplete=\\"cc-number\\"]",
  "[autocomplete=\\"cc-name\\"]",
  "[autocomplete=\\"cc-exp\\"]",
  "[autocomplete=\\"cc-csc\\"]",
  "[data-routing-number=\\"true\\"]",
  "[autocomplete=\\"ssn\\"]",
  ".account-number",
  ".balance",
  "#live-balance",
  ".alert"
]

IMPORTANT SELECTOR FORMAT RULES:
- Use attribute selectors: [data-account-number="true"] NOT .account-number[data-account-number="true"]
- Use autocomplete selectors: [autocomplete="email"] NOT input[autocomplete="email"]  
- Use class selectors: .balance NOT div.balance
- Use ID selectors: #live-balance NOT span#live-balance
- Keep selectors minimal and clean
- Escape quotes properly with backslashes in JSON
- No duplicate selectors

🚫 DO NOT
Do not return content, values, or tag descriptions.

Do not include complex nested selectors unless necessary.

Do not include non-sensitive form fields like "search", "newsletter signup", etc.

Return ONLY the JSON array, no other text or explanation.

`;
  }

  static buildPageContext(pageInfo, metaInfo) {
    return `
PAGE CONTEXT:
- URL: ${pageInfo.url}
- Domain: ${pageInfo.domain}
- Title: ${pageInfo.title}
- Secure Connection: ${metaInfo.hasSSL ? "Yes (HTTPS)" : "No (HTTP)"}
- Has Cookies: ${metaInfo.hasCookies ? "Yes" : "No"}
- Has Local Storage: ${metaInfo.hasLocalStorage ? "Yes" : "No"}

`;
  }

  static buildDOMSection(completeHTML) {
    return `
COMPLETE DOM STRUCTURE:
${completeHTML}

Please analyze the above DOM and return the JSON array of sensitive fields as specified.
`;
  }
}

// Gemini API Handler
class GeminiAPIHandler {
  static async makeAPIRequest(prompt, apiKey) {
    const url = `${CONFIG.GEMINI_API_BASE}${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 0.8,
        maxOutputTokens: 4096,
        stopSequences: [],
        responseMimeType: "text/plain",
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_ONLY_HIGH",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH",
        },
      ],
    };

    console.log("🚀 API Request URL:", url);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response Status:", response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `API request failed: ${response.status} - ${errorText}`
        );
      }

      const data = await response.json();
      console.log("🔍 API Response received");

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error(
          "No candidates in API response - content may have been filtered"
        );
      }

      const candidate = data.candidates[0];

      if (candidate.finishReason && candidate.finishReason !== "STOP") {
        if (candidate.finishReason === "SAFETY") {
          throw new Error("Content was filtered by safety mechanisms");
        }
        throw new Error(`Generation stopped: ${candidate.finishReason}`);
      }

      if (
        candidate.content &&
        candidate.content.parts &&
        candidate.content.parts[0]
      ) {
        const responseText = candidate.content.parts[0].text;
        console.log("✅ Successfully extracted response text");
        return responseText;
      } else {
        throw new Error("No valid content in API response");
      }
    } catch (error) {
      console.error("Gemini API request failed:", error);
      throw error;
    }
  }
}

// Content Analyzer
class ContentAnalyzer {
  static async analyzeContent(domData) {
    try {
      console.log("🔥 Starting content analysis...");

      // Generate dynamic prompt
      const prompt = PromptGenerator.generateSensitiveContentPrompt(domData);

      // Truncate prompt if too long
      const truncatedPrompt =
        prompt.length > CONFIG.MAX_PROMPT_LENGTH
          ? prompt.substring(0, CONFIG.MAX_PROMPT_LENGTH) +
          "\n\n[Content truncated for length]"
          : prompt;

      console.log("📤 Sending analysis request to Gemini...");

      // Make API request with hardcoded key
      const rawResponse = await GeminiAPIHandler.makeAPIRequest(
        truncatedPrompt,
        CONFIG.HARDCODED_API_KEY
      );

      // Parse response
      const analysis = this.parseResponse(rawResponse);

      // Log analysis
      this.logAnalysis(domData.pageInfo.url, analysis);

      // Apply masking if selectors were found
      if (analysis.cssSelectors && analysis.cssSelectors.length > 0) {
        await this.applySensitiveMasking(
          domData.pageInfo,
          analysis.cssSelectors
        );
      }

      return analysis;
    } catch (error) {
      console.error("❌ Content analysis failed:", error);
      return {
        riskLevel: "ERROR",
        overallAssessment: `Analysis failed: ${error.message}`,
        sensitiveFields: [],
        cssSelectors: [],
        recommendations: ["Check API configuration and try again"],
        dataTypes: [],
        securityConcerns: [`Analysis error: ${error.message}`],
        error: error.message,
      };
    }
  }

  static parseResponse(rawResponse) {
    try {
      console.log("🔍 Raw Gemini Response:", rawResponse);

      // Remove markdown code blocks if present
      let cleanResponse = rawResponse.trim();

      if (cleanResponse.includes("```json")) {
        const jsonMatch = cleanResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanResponse = jsonMatch[1].trim();
        }
      }

      if (cleanResponse.includes("```") && !cleanResponse.includes("```json")) {
        const codeMatch = cleanResponse.match(/```\s*([\s\S]*?)\s*```/);
        if (codeMatch) {
          cleanResponse = codeMatch[1].trim();
        }
      }

      try {
        const cssSelectors = JSON.parse(cleanResponse);
        console.log("✅ Parsed CSS Selectors Array:", cssSelectors);

        if (
          Array.isArray(cssSelectors) &&
          cssSelectors.every((item) => typeof item === "string")
        ) {
          const sensitiveFields = cssSelectors.map((selector, index) => {
            return {
              id: index + 1,
              selector: selector,
              type: this.inferTypeFromSelector(selector),
              element: `Element matching: ${selector}`,
              riskLevel: "MEDIUM",
              reason: "Detected via CSS selector pattern matching",
            };
          });

          return {
            riskLevel: this.calculateRiskLevel(cssSelectors.length),
            overallAssessment: `Found ${cssSelectors.length} sensitive CSS selector(s) on this page`,
            sensitiveFields: sensitiveFields,
            cssSelectors: cssSelectors,
            recommendations: this.generateRecommendations(cssSelectors),
            dataTypes: [...new Set(sensitiveFields.map((field) => field.type))],
            securityConcerns:
              cssSelectors.length > 0
                ? ["Sensitive elements detected via CSS selectors"]
                : [],
            rawResponse: rawResponse,
          };
        }
      } catch (parseError) {
        console.warn("⚠️ Failed to parse as JSON array");
      }

      return {
        riskLevel: "ERROR",
        overallAssessment: "No valid CSS selectors found in API response",
        sensitiveFields: [],
        cssSelectors: [],
        recommendations: ["Check if the page contains sensitive fields"],
        dataTypes: [],
        securityConcerns: ["No CSS selectors could be parsed from response"],
        rawResponse: rawResponse,
      };
    } catch (error) {
      console.error("❌ Error parsing API response:", error);
      return {
        riskLevel: "ERROR",
        overallAssessment: "Failed to parse API response",
        sensitiveFields: [],
        cssSelectors: [],
        recommendations: ["Check API response format"],
        dataTypes: [],
        securityConcerns: ["Response parsing error"],
        rawResponse: rawResponse,
        parseError: error.message,
      };
    }
  }

  static inferTypeFromSelector(selector) {
    const lowerSelector = selector.toLowerCase();

    if (lowerSelector.includes("password") || lowerSelector.includes("pin")) {
      return "Password/Authentication";
    } else if (
      lowerSelector.includes("email") ||
      lowerSelector.includes("mail")
    ) {
      return "Email Address";
    } else if (
      lowerSelector.includes("phone") ||
      lowerSelector.includes("mobile")
    ) {
      return "Phone Number";
    } else if (
      lowerSelector.includes("card") ||
      lowerSelector.includes("cvv") ||
      lowerSelector.includes("credit")
    ) {
      return "Payment Card";
    } else if (
      lowerSelector.includes("balance") ||
      lowerSelector.includes("amount") ||
      lowerSelector.includes("total")
    ) {
      return "Financial Amount";
    } else if (
      lowerSelector.includes("account") ||
      lowerSelector.includes("iban") ||
      lowerSelector.includes("upi")
    ) {
      return "Account Information";
    } else if (
      lowerSelector.includes("name") ||
      lowerSelector.includes("user")
    ) {
      return "Personal Name";
    } else if (
      lowerSelector.includes("address") ||
      lowerSelector.includes("location")
    ) {
      return "Address";
    } else if (
      lowerSelector.includes("ssn") ||
      lowerSelector.includes("aadhar") ||
      lowerSelector.includes("pan")
    ) {
      return "Government ID";
    } else {
      return "Sensitive Data";
    }
  }

  static calculateRiskLevel(selectorCount) {
    if (selectorCount === 0) return "LOW";
    if (selectorCount <= 2) return "MEDIUM";
    if (selectorCount <= 5) return "HIGH";
    return "CRITICAL";
  }

  static generateRecommendations(cssSelectors) {
    const recommendations = [
      "Review all detected sensitive elements",
      "Ensure proper data masking is implemented",
      "Verify HTTPS is used for sensitive data transmission",
    ];

    if (cssSelectors.some((sel) => sel.toLowerCase().includes("password"))) {
      recommendations.push(
        "Ensure password fields have proper autocomplete attributes"
      );
    }

    if (
      cssSelectors.some(
        (sel) =>
          sel.toLowerCase().includes("card") ||
          sel.toLowerCase().includes("cvv")
      )
    ) {
      recommendations.push("Implement PCI DSS compliant payment processing");
    }

    if (cssSelectors.length > 5) {
      recommendations.push(
        "Consider reducing the amount of sensitive data collected"
      );
    }

    return recommendations;
  }

  static async applySensitiveMasking(pageInfo, cssSelectors) {
    return new Promise((resolve) => {
      console.log("🎭 Applying masking to detected sensitive elements...");
      console.log("🎯 Selectors to mask:", cssSelectors);

      // Check if Wootz masking API is available
      if (
        typeof chrome.wootz === "undefined" ||
        typeof chrome.wootz.maskSensitiveElements === "undefined"
      ) {
        console.error("❌ chrome.wootz.maskSensitiveElements is not available");
        resolve({ success: false, error: "Wootz masking API not available" });
        return;
      }

      // Call Wootz masking API with the detected selectors
      chrome.wootz.maskSensitiveElements(cssSelectors, (response) => {
        if (chrome.runtime.lastError) {
          console.error("❌ Masking failed:", chrome.runtime.lastError.message);
          resolve({ success: false, error: chrome.runtime.lastError.message });
        } else {
          console.log("✅ Masking successful:", response);
          console.log(
            `🎭 Masked ${response.masked || 0} elements out of ${cssSelectors.length
            } selectors`
          );
          resolve({ success: true, response: response });
        }
      });
    });
  }

  static logAnalysis(url, analysis) {
    console.group(`🔍 Content Analysis for ${url}`);
    console.log("🚨 Risk Level:", analysis.riskLevel);
    console.log("📝 Assessment:", analysis.overallAssessment);
    console.log(
      "🔢 Sensitive Elements Count:",
      analysis.sensitiveFields?.length || 0
    );

    if (analysis.cssSelectors && analysis.cssSelectors.length > 0) {
      console.group("🎯 CSS SELECTORS FOR MASKING:");
      analysis.cssSelectors.forEach((selector, index) => {
        console.log(`${index + 1}. ${selector}`);
      });
      console.groupEnd();
    }

    console.groupEnd();
  }
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Background received message:", message);

  // ======================
  // AI WEBSITE TEXT REDACTION HANDLING (NEW)
  // ======================

  // Handle AI website send button interception and text analysis
  if (message.type === "ANALYZE_AI_TEXT") {
    console.log("🤖 Received AI text analysis request from tab:", sender.tab?.id);

    const { textData, website, inputType } = message;

    if (!textData || textData.trim().length === 0) {
      sendResponse({
        success: false,
        error: "No text provided for analysis"
      });
      return true;
    }

    console.log(`🔍 Analyzing text from ${website} (${inputType}):`, textData.substring(0, 100) + "...");

    identifyAndRedactSensitiveData(textData, (result) => {
      const response = {
        success: true,
        originalText: result.originalText,
        redactedText: result.redactedText,
        hasSensitiveData: result.hasSensitiveData,
        sensitiveItems: result.sensitiveItems,
        website: website,
        inputType: inputType,
        timestamp: Date.now()
      };

      console.log(`✅ Analysis complete for ${website}:`, {
        hasSensitiveData: response.hasSensitiveData,
        itemCount: response.sensitiveItems.length,
        categories: [...new Set(response.sensitiveItems.map(item => item.category))]
      });

      sendResponse(response);
    });

    return true; // Keep message channel open for async response
  }

  // Handle getting redaction settings
  if (message.type === "GET_REDACTION_SETTINGS") {
    chrome.storage.sync.get(['enabledRedactionCategories', 'redactionEnabled'], (result) => {
      sendResponse({
        success: true,
        enabledCategories: result.enabledRedactionCategories || defaultRedactionCategories,
        redactionEnabled: result.redactionEnabled !== false
      });
    });
    return true;
  }

  // Handle updating redaction settings
  if (message.type === "UPDATE_REDACTION_SETTINGS") {
    const { enabledCategories, redactionEnabled } = message;

    chrome.storage.sync.set({
      enabledRedactionCategories: enabledCategories,
      redactionEnabled: redactionEnabled
    }, () => {
      sendResponse({ success: true });
    });

    return true;
  }

  // Handle SAML response processing (existing functionality)
  if (message.action === "processSamlResponse") {
    console.log("Background: Processing SAML response");
    console.log(
      "Background: XML Response length:",
      message.xmlResponse ? message.xmlResponse.length : "undefined"
    );

    if (!message.xmlResponse) {
      console.error("Background: No XML response provided");
      chrome.runtime.sendMessage({
        action: "authResult",
        success: false,
        error: "No XML response provided",
      });
      return;
    }

    console.log("Background: Calling chrome.wootz.submitSamlResponse...");

    if (
      typeof chrome.wootz === "undefined" ||
      typeof chrome.wootz.submitSamlResponse === "undefined"
    ) {
      console.error(
        "Background: chrome.wootz.submitSamlResponse is not available"
      );
      chrome.runtime.sendMessage({
        action: "authResult",
        success: false,
        error: "Wootz API not available",
      });
      return;
    }

    chrome.wootz.submitSamlResponse(message.xmlResponse, function (result) {
      console.log("Background: submitSamlResponse callback received");
      console.log("Background: Result:", result);

      chrome.runtime.sendMessage({
        action: "authResult",
        success: result ? result.success : false,
        error: result ? result.error : "No result returned",
      });
    });

    return true;
  }

  // Handle content analysis (new functionality)
  if (message.type === "ANALYZE_CONTENT") {
    console.log(
      "🚀 Received content analysis request from tab:",
      sender.tab?.id
    );

    const tabId = sender.tab?.id;
    const url = message.data?.pageInfo?.url;

    // Check if this URL has already been analyzed for this tab
    const urlKey = `${tabId}_${url}`;
    if (analyzedUrls.has(urlKey)) {
      console.log("🔄 URL already analyzed for this tab, skipping...");
      sendResponse({
        success: true,
        analysis: {
          riskLevel: "CACHED",
          overallAssessment: "This page has already been analyzed",
          sensitiveFields: [],
          cssSelectors: [],
          recommendations: ["Page already analyzed"],
          dataTypes: [],
          securityConcerns: [],
        },
        sensitiveFields: [],
      });
      return true;
    }

    ContentAnalyzer.analyzeContent(message.data)
      .then((analysis) => {
        // Mark this URL as analyzed for this tab
        analyzedUrls.set(urlKey, {
          timestamp: Date.now(),
          analysis: analysis,
        });

        // Send response back to content script
        sendResponse({
          success: true,
          analysis: analysis,
          sensitiveFields: analysis.sensitiveFields || [],
        });

        // Store the latest analysis for popup to retrieve
        latestAnalysis = {
          tabId: sender.tab.id,
          analysis: analysis,
          timestamp: Date.now(),
        };

        console.log("✅ Analysis complete and results stored");
      })
      .catch((error) => {
        console.error("❌ Analysis error:", error);
        const errorResponse = {
          success: false,
          error: error.message,
        };

        sendResponse(errorResponse);

        // Store the error analysis for popup to retrieve
        latestAnalysis = {
          tabId: sender.tab.id,
          analysis: {
            riskLevel: "ERROR",
            overallAssessment: `Analysis failed: ${error.message}`,
            sensitiveFields: [],
            error: error.message,
          },
          timestamp: Date.now(),
        };
      });

    return true; // Keep message channel open for async response
  }

  // Handle getting latest analysis
  if (message.type === "GET_LATEST_ANALYSIS") {
    const tabId = message.tabId;
    if (latestAnalysis && latestAnalysis.tabId === tabId) {
      sendResponse({
        success: true,
        analysis: latestAnalysis.analysis,
        timestamp: latestAnalysis.timestamp,
      });
    } else {
      sendResponse({
        success: false,
        message: "No analysis available for this tab",
      });
    }
    return true;
  }

  // Handle clearing cache
  if (message.type === "CLEAR_CACHE") {
    analysisCache.clear();
    rateLimiter.clear();
    analyzedUrls.clear();
    sendResponse({ success: true });
    return true;
  }
});

// Clean up analyzed URLs when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  // Remove all entries for this tab
  for (const [key, value] of analyzedUrls.entries()) {
    if (key.startsWith(`${tabId}_`)) {
      analyzedUrls.delete(key);
    }
  }
});

// ======================
// REDACTION INITIALIZATION
// ======================

// Initialize redaction settings on extension install/startup
chrome.runtime.onInstalled.addListener(() => {
  console.log("🔧 Initializing redaction settings...");
  initializeRedactionSettings();
});

console.log("Background script loaded successfully");
