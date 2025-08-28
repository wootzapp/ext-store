(function () {
  "use strict";

  console.log("Content Script: Loaded on", window.location.href);

  // Configuration
  const CONFIG = {
    ANALYSIS_DELAY: 3000, // Wait 3 seconds after page load for dynamic content
  };

  // Track analysis state
  let analysisPerformed = false;
  let currentUrl = window.location.href;

  // Check if we're in an extension context
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
    console.log("Running in extension context");

    // ======================
    // SAML FUNCTIONALITY (EXISTING)
    // ======================

    // Function to send SAML response
    function sendSamlResponse(response) {
      console.log("SAML response found, processing...");
      console.log("Response length:", response.length);

      // Store the SAML response
      chrome.storage.local.set(
        {
          pendingSamlResponse: response,
        },
        function () {
          console.log("SAML response stored, navigating to success page");

          // Navigate to success page
          window.location.href = chrome.runtime.getURL("auth-success.html");
        }
      );
    }

    // Monitor for SAML responses in form submissions
    document.addEventListener("submit", function (event) {
      console.log("Form submission detected");

      const form = event.target;
      const samlInput = form.querySelector('input[name="SAMLResponse"]');

      if (samlInput && samlInput.value) {
        console.log("SAML: Found SAMLResponse in form submission");

        try {
          const decodedSaml = atob(samlInput.value);
          console.log("SAML: Successfully decoded base64 response");
          sendSamlResponse(decodedSaml);
        } catch (error) {
          console.log("SAML: Could not decode base64, sending raw response");
          sendSamlResponse(samlInput.value);
        }

        // Prevent form submission to avoid navigation
        event.preventDefault();
        return false;
      }
    });

    // Check for existing SAML responses on page load
    function checkForExistingSamlResponses() {
      const existingSamlInputs = document.querySelectorAll(
        'input[name="SAMLResponse"]'
      );
      existingSamlInputs.forEach(function (input) {
        if (input.value) {
          console.log("SAML: Found existing SAMLResponse input");
          try {
            const decodedSaml = atob(input.value);
            sendSamlResponse(decodedSaml);
          } catch (error) {
            sendSamlResponse(input.value);
          }
        }
      });
    }

    // ======================
    // CERTIFICATE AUTHENTICATION INTEGRATION
    // ======================

    // Check if current page is a certificate-protected resource (dynamic from SAML)
    async function isCertificateProtectedPage() {
      const currentUrl = window.location.href;
      
      // Check against dynamic domains from SAML
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'checkInternalDomain',
          url: currentUrl
        });
        return response && response.isInternal;
      } catch (e) {
        // Fallback to hardcoded check if message fails
        return currentUrl.includes('internal.aashish.icu') || 
               currentUrl.includes('test.aashish.icu');
      }
    }

    // Monitor for certificate authentication
    function monitorCertificateAuth() {
      if (!isCertificateProtectedPage()) return;

      console.log('🔐 Monitoring for certificate authentication...');

      // Check for authentication status
      chrome.runtime.sendMessage({
        action: 'checkCertificateAuth'
      }, (response) => {
        if (response && response.success) {
          console.log('🔐 Certificate auth status:', response);
        }
      });
    }

    // Inject WootzApp headers for certificate-protected requests
    function injectCertificateHeaders() {
      if (!isCertificateProtectedPage()) return;

      console.log('🔧 Injecting WootzApp headers for certificate-protected page...');

      // Add headers to all fetch requests
      const originalFetch = window.fetch;
      window.fetch = function(url, options = {}) {
        if (typeof url === 'string' && url.includes('aashish.icu')) {
          options.headers = {
            ...options.headers,
            'X-WootzApp-Client': 'true',
            'X-Request-Source': 'wootzapp-browser'
          };
        }
        return originalFetch(url, options);
      };

      // Add headers to all XMLHttpRequest
      const originalXHROpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method, url, ...args) {
        if (typeof url === 'string' && url.includes('aashish.icu')) {
          this.addEventListener('readystatechange', function() {
            if (this.readyState === 1) { // OPENED
              this.setRequestHeader('X-WootzApp-Client', 'true');
              this.setRequestHeader('X-Request-Source', 'wootzapp-browser');
            }
          });
        }
        return originalXHROpen.call(this, method, url, ...args);
      };
    }

    // Initialize certificate authentication integration
    function initializeCertificateIntegration() {
      if (isCertificateProtectedPage()) {
        console.log('🔐 Initializing certificate authentication integration for protected page');
        monitorCertificateAuth();
        injectCertificateHeaders();
        
        // Check session status
        chrome.runtime.sendMessage({
          action: 'checkCertificateAuth'
        }, (response) => {
          if (response && response.success) {
            if (response.isAuthenticated) {
              console.log('✅ Valid certificate authentication found');
            } else {
              console.log('❌ No valid certificate authentication, may need authentication');
            }
          }
        });
      }
    }

    // Listen for certificate authentication messages
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'certificateSessionExpired') {
        console.log('❌ Certificate session expired, redirecting to login...');
        // Redirect to Okta login
        window.location.href = 'https://integrator-2373294.okta.com';
      }
      
      if (message.action === 'certificateAuthenticationSuccess') {
        console.log('✅ Certificate authentication established');
        // Optionally refresh the page or show success message
      }
    });

    // Initialize on page load
    initializeCertificateIntegration();

    // ======================
    // CONTENT ANALYSIS FUNCTIONALITY (NEW)
    // ======================

    // Function to extract entire DOM content
    function extractDOMContent() {
      try {
        // Get basic page info
        const pageInfo = {
          url: window.location.href,
          title: document.title,
          domain: window.location.hostname,
          timestamp: new Date().toISOString(),
        };

        // Extract complete DOM structure
        const completeHTML = document.documentElement.outerHTML;

        // Extract complete body text
        const bodyText = document.body ? document.body.innerText : "";

        // Extract meta information
        const metaInfo = extractMetaInfo();

        // Calculate content fingerprint
        const contentHash = generateContentHash(completeHTML);

        return {
          pageInfo,
          contentHash,
          completeHTML,
          bodyText,
          metaInfo,
          extractedAt: Date.now(),
        };
      } catch (error) {
        console.error("Error extracting DOM content:", error);
        return null;
      }
    }

    // Extract meta information
    function extractMetaInfo() {
      const metaElements = document.querySelectorAll("meta");
      const metaInfo = {};

      metaElements.forEach((meta) => {
        const name = meta.getAttribute("name") || meta.getAttribute("property");
        const content = meta.getAttribute("content");
        if (name && content) {
          metaInfo[name] = content;
        }
      });

      return {
        meta: metaInfo,
        hasSSL: window.location.protocol === "https:",
        hasCookies: document.cookie.length > 0,
        hasLocalStorage: !!window.localStorage,
        hasSessionStorage: !!window.sessionStorage,
      };
    }

    // Generate a simple hash for content comparison
    function generateContentHash(content) {
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return hash.toString();
    }

    // Send extracted data to background script for analysis
    function sendToBackground(data) {
      if (!data) return;

      try {
        chrome.runtime.sendMessage(
          {
            type: "ANALYZE_CONTENT",
            data: data,
          },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending message to background:",
                chrome.runtime.lastError
              );
            } else if (response && response.success) {
              console.log("✅ Content analysis request sent successfully");
            } else {
              console.log("⚠️ Content analysis response:", response);
            }
          }
        );
      } catch (error) {
        console.error("Error communicating with background script:", error);
      }
    }

    // Perform analysis with debouncing - runs once per URL
    function performAnalysis() {
      if (analysisPerformed && currentUrl === window.location.href) {
        console.log("🔄 Analysis already performed for this URL, skipping...");
        return;
      }

      console.log("🚀 Starting content analysis for:", window.location.href);
      analysisPerformed = true;
      currentUrl = window.location.href;

      setTimeout(() => {
        const domContent = extractDOMContent();
        if (domContent) {
          console.log("📤 Sending DOM content for analysis...");
          sendToBackground(domContent);
        }
      }, CONFIG.ANALYSIS_DELAY);
    }

    // Handle navigation events (for SPAs)
    function handleNavigation() {
      if (currentUrl !== window.location.href) {
        console.log("📄 Navigation detected, resetting analysis flag");
        analysisPerformed = false;
        currentUrl = window.location.href;
        // Auto-trigger analysis on navigation
        performAnalysis();
      }
    }

    // ======================
    // INITIALIZATION
    // ======================

    // Initialize SAML monitoring
    checkForExistingSamlResponses();
    setTimeout(checkForExistingSamlResponses, 1000);

    // Initialize content analysis - auto-trigger once per page
    console.log("🔧 Initializing content analysis...");

    // Trigger analysis automatically after page load
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        console.log("📄 DOM loaded, starting analysis...");
        performAnalysis();
      });
    } else {
      console.log("📄 DOM already loaded, starting analysis...");
      performAnalysis();
    }

    // Monitor for SAML responses and DOM changes
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            // Check for SAML inputs
            const samlInputs = node.querySelectorAll
              ? node.querySelectorAll('input[name="SAMLResponse"]')
              : [];
            samlInputs.forEach(function (input) {
              if (input.value) {
                console.log(
                  "SAML: Found SAMLResponse in dynamically added content"
                );
                try {
                  const decodedSaml = atob(input.value);
                  sendSamlResponse(decodedSaml);
                } catch (error) {
                  sendSamlResponse(input.value);
                }
              }
            });
          }
        });
      });
    });

    // Only observe if document.body exists
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      // Wait for body to be available
      document.addEventListener('DOMContentLoaded', () => {
        if (document.body) {
          observer.observe(document.body, { childList: true, subtree: true });
        }
      });
    }

    // Listen for navigation events (for SPAs)
    window.addEventListener("popstate", handleNavigation);

    // Check for URL changes periodically (for SPAs)
    setInterval(handleNavigation, 2000);
  }

  console.log("Content Script: Setup complete");
})();
