(function () {
  "use strict";

  console.log("Content Script: Loaded on", window.location.href);

  // Configuration
  const CONFIG = {
    ANALYSIS_DELAY: 3000, // Wait 3 seconds after page load for dynamic content
    AI_WEBSITES: [
      'chatgpt.com',
      'openai.com',
      'gemini.google.com',
      'bard.google.com',
      'claude.ai',
      'anthropic.com',
      'perplexity.ai',
      'poe.com',
      'deepseek.com',
      'you.com',
      'character.ai',
      'replika.ai',
      'jasper.ai',
      'copy.ai',
      'writesonic.com',
      'chat.mistral.ai',
      'huggingface.co'
    ]
  };

  /**
   * Check if current website is an AI website
   */
  function isAIWebsite() {
    const currentHostname = window.location.hostname.toLowerCase();

    const isAI = CONFIG.AI_WEBSITES.some(aiDomain => {
      return currentHostname === aiDomain ||
        currentHostname.endsWith('.' + aiDomain) ||
        currentHostname.includes(aiDomain);
    });

    console.log(`🌐 Domain check: ${currentHostname} - AI Website: ${isAI ? '✅ YES' : '❌ NO'}`);
    return isAI;
  }

  // Track analysis state
  let analysisPerformed = false;
  let currentUrl = window.location.href;

  // Check if we're in an extension context
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
    console.log("Running in extension context");

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
    // REAL-TIME INPUT REDACTION (NEW)
    // ======================

    /**
     * Apply real-time pattern-based redaction to input fields
     */
    function attachInputRedaction(element) {
      if (element.dataset.redactionAttached) return;
      element.dataset.redactionAttached = 'true';

      console.log("🔒 Attached redaction to:", element.tagName, element.id || element.className);

      let isRedacting = false;
      let lastValue = '';

      element.addEventListener('input', function (e) {
        if (isRedacting) return;

        const currentValue = e.target.value;
        const cursorPosition = e.target.selectionStart;

        console.log("⌨️ Input event detected:", {
          length: currentValue.length,
          elementType: e.target.tagName
        });

        // Send to background for redaction
        chrome.runtime.sendMessage({
          type: "REDACT_TEXT",
          text: currentValue
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Redaction request failed:", chrome.runtime.lastError);
            return;
          }

          if (response && response.success && response.hasRedactions) {
            isRedacting = true;

            // Apply redacted text
            e.target.value = response.redactedText;

            // Restore cursor position
            const newCursorPos = Math.min(cursorPosition, response.redactedText.length);
            e.target.setSelectionRange(newCursorPos, newCursorPos);

            console.log("✅ Applied redaction:", {
              detections: response.detections.length,
              types: response.detections.map(d => d.type)
            });

            lastValue = response.redactedText;

            // Reset flag after a tick
            setTimeout(() => {
              isRedacting = false;
            }, 10);
          }
        });
      });

      // Also handle paste events
      element.addEventListener('paste', function (e) {
        setTimeout(() => {
          const event = new Event('input', { bubbles: true });
          e.target.dispatchEvent(event);
        }, 10);
      });
    }

    /**
     * Apply real-time pattern-based redaction to contentEditable elements (ChatGPT, Claude)
     */
    function attachContentEditableRedaction(element) {
      if (element.dataset.redactionAttached) return;
      element.dataset.redactionAttached = 'true';

      console.log("🔒 Attached contentEditable redaction to:", element.tagName, element.id || element.className);

      let isRedacting = false;

      // Monitor input event on contentEditable
      element.addEventListener('input', function (e) {
        if (isRedacting) return;

        const currentText = element.innerText || element.textContent;

        console.log("⌨️ ContentEditable input detected:", {
          length: currentText.length,
          elementType: 'CONTENTEDITABLE'
        });

        // Send to background for redaction
        chrome.runtime.sendMessage({
          type: "REDACT_TEXT",
          text: currentText
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("❌ Redaction request failed:", chrome.runtime.lastError);
            return;
          }

          if (response && response.success && response.hasRedactions) {
            isRedacting = true;

            // Save current selection
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            const cursorOffset = range ? range.startOffset : 0;

            // Apply redacted text
            element.innerText = response.redactedText;

            // Try to restore cursor position
            try {
              const textNode = element.firstChild;
              if (textNode && textNode.nodeType === 3) { // Text node
                const newRange = document.createRange();
                const newOffset = Math.min(cursorOffset, response.redactedText.length);
                newRange.setStart(textNode, newOffset);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
              }
            } catch (err) {
              console.warn("Could not restore cursor position:", err);
            }

            console.log("✅ Applied contentEditable redaction:", {
              detections: response.detections.length,
              types: response.detections.map(d => d.type)
            });

            // Reset flag after a tick
            setTimeout(() => {
              isRedacting = false;
            }, 10);
          }
        });
      });

      // Also handle paste events
      element.addEventListener('paste', function (e) {
        setTimeout(() => {
          const event = new Event('input', { bubbles: true });
          e.target.dispatchEvent(event);
        }, 10);
      });
    }

    /**
     * Find and attach redaction to all input fields
     */
    function initializeInputRedaction() {
      console.log("🔧 Initializing real-time input redaction...");

      // Target textareas (ChatGPT, Claude, etc.)
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        attachInputRedaction(textarea);
      });

      // Target input fields
      const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input:not([type])');
      inputs.forEach(input => {
        attachInputRedaction(input);
      });

      // Target contentEditable elements (ChatGPT uses these!)
      const editableDivs = document.querySelectorAll('[contenteditable="true"]');
      editableDivs.forEach(div => {
        attachContentEditableRedaction(div);
      });

      console.log(`✅ Attached redaction to ${textareas.length} textareas, ${inputs.length} inputs, and ${editableDivs.length} contentEditable divs`);
    }

    /**
     * Monitor for dynamically added input fields
     */
    function monitorDynamicInputs() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              if (node.tagName === 'TEXTAREA' || node.tagName === 'INPUT') {
                attachInputRedaction(node);
              }
              // Check for contentEditable
              if (node.getAttribute && node.getAttribute('contenteditable') === 'true') {
                attachContentEditableRedaction(node);
              }
              // Check children
              const textareas = node.querySelectorAll?.('textarea');
              const inputs = node.querySelectorAll?.('input[type="text"], input[type="email"], input[type="tel"], input:not([type])');
              const editableDivs = node.querySelectorAll?.('[contenteditable="true"]');

              textareas?.forEach(textarea => attachInputRedaction(textarea));
              inputs?.forEach(input => attachInputRedaction(input));
              editableDivs?.forEach(div => attachContentEditableRedaction(div));
            }
          });
        });
      });

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        console.log("👁️ Monitoring for dynamic input fields and contentEditable elements...");
      }
    }

    // ======================
    // SEND BUTTON INTERCEPTION FOR AI WEBSITES
    // ======================

    const AI_SEND_BUTTON_SELECTORS = {
      'chatgpt.com': [
        'button[data-testid="send-button"]',
        'button[data-testid="fruitjuice-send-button"]',
        '[data-testid="send-button"]'
      ],
      'openai.com': [
        'button[data-testid="send-button"]',
        '[data-testid="send-button"]'
      ],
      'claude.ai': [
        'button[aria-label*="Send"]',
        'button[data-testid="send-button"]'
      ],
      'gemini.google.com': [
        'button[aria-label*="Send"]',
        'button.send-button'
      ],
      'perplexity.ai': [
        'button[aria-label*="Submit"]'
      ],
      'poe.com': [
        'button[class*="ChatMessageSendButton"]'
      ]
    };

    /**
     * Get send button selectors for current AI website
     */
    function getSendButtonSelectors() {
      const hostname = window.location.hostname.toLowerCase();

      for (const [domain, selectors] of Object.entries(AI_SEND_BUTTON_SELECTORS)) {
        if (hostname.includes(domain)) {
          return selectors;
        }
      }

      return null;
    }

    /**
     * Find input element (textarea or contentEditable) on page
     */
    function findInputElement() {
      // Try contentEditable first (ChatGPT uses this)
      const contentEditableInputs = document.querySelectorAll('[contenteditable="true"]');
      for (const el of contentEditableInputs) {
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length > 0) {
          console.log("📝 Found contentEditable with text:", text.substring(0, 50));
          return { element: el, type: 'contenteditable' };
        }
      }

      // Try textarea
      const textareas = document.querySelectorAll('textarea');
      for (const el of textareas) {
        const text = (el.value || '').trim();
        if (text.length > 0) {
          console.log("📝 Found textarea with text:", text.substring(0, 50));
          return { element: el, type: 'textarea' };
        }
      }

      // Try text inputs
      const inputs = document.querySelectorAll('input[type="text"]');
      for (const el of inputs) {
        const text = (el.value || '').trim();
        if (text.length > 0) {
          console.log("📝 Found input with text:", text.substring(0, 50));
          return { element: el, type: 'input' };
        }
      }

      return null;
    }

    /**
     * Intercept send button clicks and apply masking before sending
     */
    function setupSendButtonInterception() {
      const selectors = getSendButtonSelectors();
      if (!selectors) {
        console.log("⏭️ No send button selectors for this AI website");
        return;
      }

      console.log("🎯 Setting up send button interception for:", window.location.hostname);
      console.log("🎯 Using selectors:", selectors);

      let interceptedButtons = 0;

      selectors.forEach(selector => {
        const buttons = document.querySelectorAll(selector);
        buttons.forEach(button => {
          if (button.dataset.intercepted) return;

          button.dataset.intercepted = 'true';
          interceptedButtons++;

          console.log("🔗 Intercepting send button:", selector);

          // Capture the original click handler
          button.addEventListener('click', async function interceptClickHandler(e) {
            // Skip if this is our programmatic click (bypass flag)
            if (button.dataset.bypassInterception === 'true') {
              console.log("� Bypassing interception (programmatic click)");
              button.dataset.bypassInterception = '';
              return; // Allow the click to proceed
            }

            console.log("�🚨 ===== SEND BUTTON CLICKED =====");

            // Prevent immediate send
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();

            // Find input with text
            const inputData = findInputElement();
            if (!inputData) {
              console.log("⚠️ No input element found with text");
              // Allow original send if no input found
              button.dataset.bypassInterception = 'true';
              button.click();
              return;
            }

            const { element, type } = inputData;
            const originalText = type === 'contenteditable'
              ? (element.innerText || element.textContent || '')
              : element.value;

            console.log("📤 Original text to analyze:", originalText);

            // Send to background for analysis and masking
            chrome.runtime.sendMessage({
              type: "REDACT_TEXT",
              text: originalText
            }, (response) => {
              console.log("📥 Redaction response:", response);

              if (chrome.runtime.lastError) {
                console.error("❌ Analysis failed:", chrome.runtime.lastError);
                // Allow original send on error
                button.dataset.bypassInterception = 'true';
                button.click();
                return;
              }

              if (response && response.success) {
                if (response.hasRedactions) {
                  console.log("🚨 SENSITIVE DATA DETECTED!");
                  console.log("🚨 Detections:", response.detections);
                  console.log("🚨 Original:", originalText);
                  console.log("🚨 Redacted:", response.redactedText);

                  // Replace text in input with masked version
                  if (type === 'contenteditable') {
                    element.innerText = response.redactedText;
                  } else {
                    element.value = response.redactedText;
                  }

                  // Trigger input event to update UI
                  const inputEvent = new Event('input', { bubbles: true });
                  element.dispatchEvent(inputEvent);

                  console.log("✅ Text replaced with masked version");
                } else {
                  console.log("✅ No sensitive data detected");
                }

                // Now allow the original send to proceed
                setTimeout(() => {
                  console.log("🚀 Triggering original send action...");
                  button.dataset.bypassInterception = 'true';
                  button.click();
                }, 100);
              } else {
                console.log("⚠️ Analysis response invalid, allowing send");
                button.dataset.bypassInterception = 'true';
                button.click();
              }
            });
          }, { capture: true }); // Use capture phase to intercept early
        });
      });

      if (interceptedButtons > 0) {
        console.log(`✅ Intercepted ${interceptedButtons} send buttons`);
      } else {
        console.log("⚠️ No send buttons found yet (will monitor for dynamic buttons)");
      }
    }

    /**
     * Monitor for dynamically added send buttons
     */
    function monitorSendButtons() {
      const selectors = getSendButtonSelectors();
      if (!selectors) return;

      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              selectors.forEach(selector => {
                try {
                  // Check if node itself matches
                  if (node.matches && node.matches(selector) && !node.dataset.intercepted) {
                    console.log("🆕 New send button detected:", selector);
                    setupSendButtonInterception();
                  }

                  // Check children
                  const buttons = node.querySelectorAll?.(selector);
                  if (buttons && buttons.length > 0) {
                    console.log(`🆕 Found ${buttons.length} new send buttons in added node`);
                    setupSendButtonInterception();
                  }
                } catch (err) {
                  // Selector might not be valid for this node
                }
              });
            }
          });
        });
      });

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        console.log("👁️ Monitoring for dynamic send buttons...");
      }
    }    // ======================
    // INITIALIZATION
    // ======================

    // Initialize content analysis - auto-trigger once per page
    console.log("🔧 Initializing content analysis...");

    // Check if this is an AI website for pattern-based redaction
    const enablePatternRedaction = isAIWebsite();

    if (enablePatternRedaction) {
      console.log("🤖 AI Website detected - Pattern-based redaction ENABLED");
    } else {
      console.log("🌐 Regular website - Pattern-based redaction DISABLED");
    }

    // Initialize real-time input redaction ONLY on AI websites
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        console.log("📄 DOM loaded, starting analysis...");
        performAnalysis();

        // Initialize input redaction ONLY on AI websites
        if (enablePatternRedaction) {
          setTimeout(() => {
            initializeInputRedaction();
            monitorDynamicInputs();

            // Setup send button interception
            setupSendButtonInterception();
            monitorSendButtons();
          }, 1000);
        } else {
          console.log("⏭️ Skipping input redaction (not an AI website)");
        }
      });
    } else {
      console.log("📄 DOM already loaded, starting analysis...");
      performAnalysis();

      // Initialize input redaction ONLY on AI websites
      if (enablePatternRedaction) {
        setTimeout(() => {
          initializeInputRedaction();
          monitorDynamicInputs();

          // Setup send button interception
          setupSendButtonInterception();
          monitorSendButtons();
        }, 1000);
      } else {
        console.log("⏭️ Skipping input redaction (not an AI website)");
      }
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
