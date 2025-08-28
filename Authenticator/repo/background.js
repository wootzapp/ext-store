console.log("Background script starting...");

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

// ======================
// CERTIFICATE-BASED AUTHENTICATION
// ======================

// Certificate authentication configuration
const CERT_CONFIG = {
  samlBridgeUrl: 'https://test.aashish.icu',
  sessionCheckInterval: 30000, // 30 seconds
  sessionTimeout: 3600000, // 1 hour
};

// Session management
let certificateSession = null;
let sessionCheckTimer = null;
let isAuthenticated = false;

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
            `🎭 Masked ${response.masked || 0} elements out of ${
              cssSelectors.length
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

// Initialize certificate authentication on startup
console.log('🔐 Certificate authentication system initialized');

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Background received message:", message);

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

    // Extract certificate from SAML response
    console.log("Background: Extracting certificate from SAML response...");
    extractCertificateFromSAML(message.xmlResponse).then((certificate) => {
      if (certificate) {
        console.log("Background: Certificate extracted successfully");
        
            // Store certificate to SAML bridge and get internal domains
    storeCertificateToBridge(certificate, 'browser-user').then((result) => {
      if (result && result.success) {
        console.log("Background: Certificate stored to SAML bridge");
        
        // Store internal domains from SAML bridge response
        if (result.internal_domains && result.internal_domains.length > 0) {
          chrome.storage.local.set({ 
            internalDomains: result.internal_domains,
            domainsUpdatedAt: result.domains_updated_at || Date.now()
          });
          console.log("🌐 Internal domains updated from SAML bridge:", result.internal_domains);
        }
      } else {
        console.error("Background: Failed to store certificate");
      }
    });
      } else {
        console.error("Background: Failed to extract certificate from SAML");
      }
    });

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

  // Handle internal domain check (for content script)
  if (message.action === "checkInternalDomain") {
    isInternalDomain(message.url).then(isInternal => {
      sendResponse({ isInternal });
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
  if (message.action === "samlCaptured") {
    console.log("🔄 SAML captured, extracting certificate...");
    
    // Use async IIFE to handle async operations
    (async () => {
      try {
        // Step 1: Extract certificate from SAML response
        const certificate = await extractCertificateFromSAML(message.xmlResponse);
        
        if (certificate) {
          console.log("✅ Certificate extracted from SAML response");
          
          // Step 2: Store certificate via SAML bridge service
          const stored = await storeCertificateToBridge(certificate, message.userId || 'unknown');
          
          if (stored) {
            console.log("✅ Certificate stored successfully");
            
            // Step 3: Submit SAML to browser (existing functionality)
            if (typeof chrome.wootz !== "undefined" && typeof chrome.wootz.submitSamlResponse !== "undefined") {
              chrome.wootz.submitSamlResponse(message.xmlResponse, async function (result) {
                console.log("SAML submitted to browser, result:", result);
                
                if (result && result.success) {
                  // Notify success
                  chrome.runtime.sendMessage({
                    action: "certificateAuthenticationSuccess",
                    message: "Certificate stored and SAML processed successfully"
                  });
                } else {
                  console.error("❌ SAML submission failed");
                  chrome.runtime.sendMessage({
                    action: "samlSubmissionFailed",
                    error: result ? result.error : "Unknown error"
                  });
                }
              });
            } else {
              throw new Error("Wootz API not available");
            }
          } else {
            console.error("❌ Failed to store certificate");
            chrome.runtime.sendMessage({
              action: "certificateStorageFailed",
              error: "Failed to store certificate"
            });
          }
        } else {
          console.error("❌ Failed to extract certificate from SAML");
          chrome.runtime.sendMessage({
            action: "certificateExtractionFailed",
            error: "No certificate found in SAML response"
          });
        }
      } catch (error) {
        console.error("❌ SAML processing error:", error);
        chrome.runtime.sendMessage({
          action: "samlProcessingError",
          error: error.message
        });
      }
    })();
    
    return true;
  }

  // Handle certificate authentication status check
  if (message.action === "checkCertificateAuth") {
    (async () => {
      try {
        const response = await fetch(`${CERT_CONFIG.samlBridgeUrl}/check-certificate`);
        const data = await response.json();
        
        sendResponse({
          success: true,
          hasCertificate: data.has_certificate,
          isAuthenticated: data.is_authenticated,
          sessionInfo: data.session_info
        });
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message
        });
      }
    })();
    return true;
  }

  // Handle certificate authentication logout
  if (message.action === "logoutCertificateAuth") {
    (async () => {
      try {
        const response = await fetch(`${CERT_CONFIG.samlBridgeUrl}/sign-out`);
        if (response.ok) {
          sendResponse({ success: true });
        } else {
          sendResponse({
            success: false,
            error: "Failed to sign out"
          });
        }
      } catch (error) {
        sendResponse({
          success: false,
          error: error.message
        });
      }
    })();
    return true;
  }

  // Handle header injection status
  if (message.action === "getHeaderInjectionStatus") {
    sendResponse({
      success: true,
      headersEnabled: true,
      headers: {
        'X-WootzApp-Client': 'true',
        'X-Request-Source': 'wootzapp-browser'
      }
    });
    return true;
  }
});

// Certificate extraction and storage functions
async function extractCertificateFromSAML(samlXml) {
  try {
    console.log("🔍 Extracting certificate and domains from SAML response...");
    
    // Extract certificate
    const certRegex = /<ds:X509Certificate[^>]*>([^<]+)<\/ds:X509Certificate>/;
    const match = samlXml.match(certRegex);
    
    let certificate = null;
    if (match && match[1]) {
      const certData = match[1].trim();
      if (certData) {
        certificate = convertBase64ToPEM(certData);
        console.log("✅ Certificate extracted successfully");
      }
    }
    
    // Try alternative regex for X509Certificate without namespace
    if (!certificate) {
      const altCertRegex = /<X509Certificate[^>]*>([^<]+)<\/X509Certificate>/;
      const altMatch = samlXml.match(altCertRegex);
      
      if (altMatch && altMatch[1]) {
        const certData = altMatch[1].trim();
        if (certData) {
          certificate = convertBase64ToPEM(certData);
          console.log("✅ Certificate extracted successfully (alternative method)");
        }
      }
    }
    
    // Extract internal domains from SAML attributes
    const domains = extractInternalDomainsFromSAML(samlXml);
    console.log("🌐 Internal domains extracted:", domains);
    
    // Store domains in extension storage for dynamic access
    if (domains.length > 0) {
      await chrome.storage.local.set({ 
        internalDomains: domains,
        domainsUpdatedAt: Date.now()
      });
      console.log("💾 Internal domains stored in extension storage");
    }
    
    return certificate;
    
  } catch (error) {
    console.error("❌ Error extracting certificate:", error);
    return null;
  }
}

function extractInternalDomainsFromSAML(samlXml) {
  try {
    const domains = [];
    
    // Look for internal domains in SAML attributes
    // Common patterns for internal domains in SAML
    const domainPatterns = [
      /<saml:Attribute[^>]*Name="internal_domains"[^>]*>([\s\S]*?)<\/saml:Attribute>/i,
      /<saml:Attribute[^>]*Name="allowed_domains"[^>]*>([\s\S]*?)<\/saml:Attribute>/i,
      /<saml:Attribute[^>]*Name="access_domains"[^>]*>([\s\S]*?)<\/saml:Attribute>/i,
      /<saml:Attribute[^>]*Name="internal_access"[^>]*>([\s\S]*?)<\/saml:Attribute>/i
    ];
    
    for (const pattern of domainPatterns) {
      const match = samlXml.match(pattern);
      if (match && match[1]) {
        // Extract domain values from the attribute
        const domainRegex = /<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/g;
        let domainMatch;
        while ((domainMatch = domainRegex.exec(match[1])) !== null) {
          const domain = domainMatch[1].trim();
          if (domain && !domains.includes(domain)) {
            domains.push(domain);
          }
        }
      }
    }
    
    // If no domains found in SAML attributes, use default domains
    // This ensures backward compatibility
    if (domains.length === 0) {
      console.log("⚠️ No internal domains found in SAML, using defaults");
      domains.push(
        'internal.aashish.icu',
        'app.internal.aashish.icu',
        'admin.internal.aashish.icu',
        'api.internal.aashish.icu',
        'dashboard.internal.aashish.icu'
      );
    }
    
    return domains;
    
  } catch (error) {
    console.error("❌ Error extracting internal domains:", error);
    // Return default domains as fallback
    return [
      'internal.aashish.icu',
      'app.internal.aashish.icu',
      'admin.internal.aashish.icu',
      'api.internal.aashish.icu',
      'dashboard.internal.aashish.icu'
    ];
  }
}

function convertBase64ToPEM(base64Data) {
  try {
    // Remove any whitespace
    const cleanData = base64Data.replace(/\s+/g, '');
    
    // Create PEM format
    let pemCert = "-----BEGIN CERTIFICATE-----\n";
    
    // Insert newlines every 64 characters
    for (let i = 0; i < cleanData.length; i += 64) {
      pemCert += cleanData.substr(i, 64) + "\n";
    }
    
    pemCert += "-----END CERTIFICATE-----\n";
    
    return pemCert;
    
  } catch (error) {
    console.error("❌ Error converting base64 to PEM:", error);
    return null;
  }
}

async function storeCertificateToBridge(certificate, userId) {
  try {
    console.log("📝 Storing certificate to SAML bridge service...");
    
    // Use external URL for SAML bridge service
    const response = await fetch('https://test.aashish.icu/store-certificate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        certificate: certificate,
        user_id: userId
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log("✅ Certificate stored successfully:", result);
      return result; // Return the full response including internal_domains
    } else {
      console.error("❌ Failed to store certificate:", response.status, response.statusText);
      return false;
    }
    
  } catch (error) {
    console.error("❌ Error storing certificate:", error);
    return false;
  }
}

// Session validation functions
function startSessionValidation() {
  if (sessionCheckTimer) {
    clearInterval(sessionCheckTimer);
  }
  
  sessionCheckTimer = setInterval(async () => {
    try {
      const response = await fetch(`${CERT_CONFIG.samlBridgeUrl}/check-certificate`);
      const data = await response.json();
      
      if (!data.is_authenticated) {
        console.log('❌ Certificate authentication failed, stopping timer');
        stopSessionValidation();
        
        // Notify about session expiry
        chrome.runtime.sendMessage({
          action: "certificateSessionExpired"
        });
      }
    } catch (error) {
      console.log('❌ Certificate validation error, stopping timer');
      stopSessionValidation();
    }
  }, CERT_CONFIG.sessionCheckInterval);
  
  console.log('✅ Certificate validation timer started');
}

function stopSessionValidation() {
  if (sessionCheckTimer) {
    clearInterval(sessionCheckTimer);
    sessionCheckTimer = null;
    console.log('⏹️ Session validation timer stopped');
  }
}

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
// WEB REQUEST HEADER INJECTION
// ======================

// Check if URL is an internal domain (dynamic from SAML)
async function isInternalDomain(url) {
  try {
    const urlObj = new URL(url);
    
    // Get domains from storage (set by SAML response)
    const storage = await chrome.storage.local.get(['internalDomains']);
    const internalDomains = storage.internalDomains || [
      // Fallback domains if none stored yet
      'internal.aashish.icu',
      'app.internal.aashish.icu',
      'admin.internal.aashish.icu',
      'api.internal.aashish.icu',
      'dashboard.internal.aashish.icu'
    ];
    
    return internalDomains.some(domain => 
      urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain)
    );
  } catch (e) {
    console.error("Error checking internal domain:", e);
    return false;
  }
}

// Get current internal domains (for debugging)
async function getInternalDomains() {
  try {
    const storage = await chrome.storage.local.get(['internalDomains', 'domainsUpdatedAt']);
    return {
      domains: storage.internalDomains || [],
      updatedAt: storage.domainsUpdatedAt || null
    };
  } catch (e) {
    console.error("Error getting internal domains:", e);
    return { domains: [], updatedAt: null };
  }
}
