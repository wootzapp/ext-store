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
    // CERTIFICATE DETECTION FUNCTIONALITY (mTLS)
    // ======================

    // Listen for the custom event dispatched by the website for certificate
    window.addEventListener('okta-integrator-cert', (event) => {
      console.log('[mTLS Cert] okta-integrator-cert event detected');
      
      // Extract the certificate from the event detail
      let certificateData = event.detail?.certificate;
      
      if (certificateData) {
        console.log('[mTLS Cert] Certificate data received');
        console.log('[mTLS Cert] Certificate type:', typeof certificateData);
        
        // Extract the certificate string from object if needed
        let certificateString;
        if (typeof certificateData === 'string') {
          certificateString = certificateData;
          console.log('[mTLS Cert] Certificate is already a string');
        } else if (typeof certificateData === 'object' && certificateData.certificatePem) {
          certificateString = certificateData.certificatePem;
          console.log('[mTLS Cert] Extracted certificatePem from object');
        } else if (typeof certificateData === 'object' && certificateData.certificate) {
          certificateString = certificateData.certificate;
          console.log('[mTLS Cert] Extracted certificate property from object');
        } else {
          console.error('[mTLS Cert] Unable to extract certificate string from:', certificateData);
          return;
        }
        
        // Log certificate preview
        if (certificateString && typeof certificateString === 'string') {
          console.log('[mTLS Cert] Certificate preview:', certificateString.substring(0, 50) + '...');
          
          try {
            // Send the certificate string to the background script
            chrome.runtime.sendMessage({
              action: 'processCertificate',
              certificate: certificateString,
              source: 'contentScriptCertEvent',
              timestamp: Date.now()
            }, (response) => {
              if (chrome.runtime.lastError) {
                console.error('[mTLS Cert] Error sending message:', chrome.runtime.lastError);
              } else {
                console.log('[mTLS Cert] Background script response:', response);
              }
            });
          } catch (error) {
            console.error('[mTLS Cert] Exception while sending message:', error);
          }
        } else {
          console.error('[mTLS Cert] Certificate string is invalid:', certificateString);
        }
      } else {
        console.warn('[mTLS Cert] Certificate not found in event detail');
      }
    }, true); // Use capture phase to ensure we catch the event early

    console.log('[mTLS Cert] Event listener registered for okta-integrator-cert');

    // ======================
    // SAML FUNCTIONALITY (STREAMLINED - POSTMESSAGE)
    // ======================

    // Listen for messages from the SAML receiver page
    window.addEventListener('message', function (event) {
      console.log("🔥 CONTENT SCRIPT: Received postMessage:", event);

      if (event.data && event.data.type === 'SAML_RESPONSE_FROM_RECEIVER') {
        console.log("🔥 CONTENT SCRIPT: Processing SAML response from receiver page");
        console.log("🔥 CONTENT SCRIPT: SAML data length:", event.data.xmlResponse?.length);

        // Send the SAML response to background script
        chrome.runtime.sendMessage({
          action: "processSamlResponse",
          xmlResponse: event.data.xmlResponse,
          source: "contentScriptFromReceiver",
          timestamp: event.data.timestamp
        },

          function (result) {
            if (chrome.runtime.lastError) {
              console.error("🔥 CONTENT SCRIPT ERROR: Failed to send SAML response to background:", chrome.runtime.lastError);

              // Store error result and navigate
              chrome.storage.local.set({
                tempAuthResult: {
                  success: false,
                  timestamp: Date.now(),
                  error: chrome.runtime.lastError.message
                }
              }, function () {
                console.log("🔥 CONTENT SCRIPT: Stored temp error result, navigating...");
                window.location.href = chrome.runtime.getURL("auth-success.html");
              });
            } else {
              console.log("🔥 CONTENT SCRIPT SUCCESS: SAML response sent to background!");
              console.log("🔥 CONTENT SCRIPT SUCCESS: Background response:", result);

              // Always navigate to success page, background handles the actual SAML processing
              // The success/failure will be determined by the background script's processing
              chrome.storage.local.set({
                tempAuthResult: {
                  success: true, // Default to true, background will update if there's an error
                  timestamp: Date.now(),
                  error: null
                }
              }, function () {
                console.log("🔥 CONTENT SCRIPT: Stored temp auth result, navigating to auth-success.html...");
                window.location.href = chrome.runtime.getURL("auth-success.html");
              });
            }
          });
      }
    });

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

    // Monitor for DOM changes (content analysis only)
    console.log("🔍 MUTATION OBSERVER: Setting up DOM change monitoring for content analysis...");
    const observer = new MutationObserver(function (mutations) {
      console.log("🔍 MUTATION OBSERVER: DOM changes detected, mutations count:", mutations.length);
      // Only used for content analysis triggers, SAML detection removed
    });

    console.log("🔍 MUTATION OBSERVER: Starting observation of document.body...");

    // Ensure document.body exists before observing
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      console.log("🔍 MUTATION OBSERVER: Observer is now active");
    } else {
      console.log("🔍 MUTATION OBSERVER: document.body not ready, waiting...");
      // Wait for body to be available
      const bodyCheckInterval = setInterval(() => {
        if (document.body) {
          clearInterval(bodyCheckInterval);
          observer.observe(document.body, { childList: true, subtree: true });
          console.log("🔍 MUTATION OBSERVER: Observer is now active (delayed)");
        }
      }, 100);
    }

    // Listen for navigation events (for SPAs)
    window.addEventListener("popstate", handleNavigation);

    // Check for URL changes periodically (for SPAs)
    setInterval(handleNavigation, 2000);
  }

  console.log("Content Script: Setup complete");
})();
