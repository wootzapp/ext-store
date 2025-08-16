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

  // Track pending API calls and send button blocking
  let pendingAPICallsCount = 0;
  const blockedSendButtons = new Set();

  // Add bypass flag to prevent infinite loops in send button interception
  let bypassSendInterception = false;  // AI Website Send Button Configurations
  const AI_WEBSITES = {
    'chatgpt.com': {
      selectors: [
        'button[data-testid="send-button"]',
        'button[aria-label="Send message"]',
        '[data-testid="send-button"]',
        'button.composer-submit-btn',
        'button[type="submit"]'
      ]
    },
    'openai.com': {
      selectors: [
        'button[data-testid="send-button"]',
        'button[aria-label="Send message"]',
        '[data-testid="send-button"]',
        'button.composer-submit-btn'
      ]
    },
    'gemini.google.com': {
      selectors: [
        'button[aria-label="Send message"]',
        'button[data-testid="send-button"]',
        'button[jsname="M2UYVd"]',
        'button.send-button',
        'mat-icon[fonticon="send"]',
        'button[mat-ripple]'
      ]
    },
    'bard.google.com': {
      selectors: [
        'button[aria-label="Send message"]',
        'button[data-testid="send-button"]',
        'button.send-button'
      ]
    },
    'perplexity.ai': {
      selectors: [
        'button[data-testid="submit-button"]',
        'button[aria-label="Submit"]',
        'button.bg-super',
        'button[type="submit"]'
      ]
    },
    'claude.ai': {
      selectors: [
        'button[aria-label="Send Message"]',
        'button[data-testid="send-button"]',
        'button.send-button'
      ]
    },
    'poe.com': {
      selectors: [
        'button[class*="ChatMessageSendButton"]',
        'button[aria-label="Send"]'
      ]
    }
  };

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
    // INPUT MONITORING & MASKING FUNCTIONALITY (NEW)
    // ======================

    // Configuration for input monitoring
    const INPUT_CONFIG = {
      ANALYSIS_DELAY: 2000, // Wait 2 seconds after user stops typing (increased to reduce API calls)
      MIN_TEXT_LENGTH: 5, // Minimum text length to analyze (increased to reduce noise)
      MASK_CHAR: "*"
      // Removed SENSITIVE_PATTERNS - now using Gemini for all analysis
    };

    // Track input elements and their timers
    const inputTracker = new Map();
    const analysisTimers = new Map();

    // Function to check if text should be analyzed (simplified - let Gemini decide)
    function shouldAnalyzeText(text) {
      console.log("🔍 Preparing text for Gemini analysis:", text.substring(0, 30) + "...");
      return true; // Always analyze with Gemini, no pre-filtering
    }

    // Helper function to add event listeners to a single element
    function addEventListenersToElement(element) {
      try {
        // Skip if already has listeners
        if (element._hasInputMonitoring) {
          return;
        }

        console.log("🎯 Element prepared for monitoring:", element.tagName, element.id || 'no-id');

        // Keep other events for compatibility (but disable timer-based analysis)
        const events = ['input', 'textInput', 'keyup', 'change'];
        events.forEach(eventType => {
          element.addEventListener(eventType, handleInputEvent, { passive: true });
        });
        element.addEventListener('paste', handlePasteEvent, { passive: true });

        // Mobile touch events
        element.addEventListener('touchend', () => {
          setTimeout(() => handleInputEvent({ target: element }), 100);
        }, { passive: true });

        // Mark element as having listeners
        element._hasInputMonitoring = true;

        console.log("🎯 Added listeners to element:", element.tagName, element.type || 'text');
      } catch (error) {
        console.error("Error adding listeners to element:", error);
      }
    }

    // Function to analyze text using local pattern matching via background script
    // Updated to use the new redaction functionality in background.js
    async function analyzeTextWithGemini(text, element) {
      console.log("📤 ===== ANALYZING WITH BACKGROUND REDACTION SERVICE =====");
      console.log("📤 Text to analyze:", text.substring(0, 100) + (text.length > 100 ? '...' : ''));
      console.log("📤 Using background script redaction instead of API");

      try {
        const analysisData = {
          text: text,
          elementType: element.tagName.toLowerCase(),
          elementName: element.name || '',
          elementId: element.id || '',
          elementClass: element.className || '',
          placeholder: element.placeholder || '',
          context: element.form ? 'form' : 'standalone'
        };

        console.log("📤 Analysis data:", analysisData);

        return new Promise((resolve) => {
          // Send text to background script for redaction analysis
          const messageData = {
            type: "ANALYZE_AI_TEXT",
            textData: text,
            website: window.location.hostname,
            inputType: analysisData.elementType
          };

          console.log("📤 Message being sent to background:", messageData);

          chrome.runtime.sendMessage(messageData, (response) => {
            console.log("📥 ===== RESPONSE FROM BACKGROUND =====");
            console.log("📥 Chrome.runtime.lastError:", chrome.runtime.lastError);
            console.log("📥 Response received:", response);

            if (chrome.runtime.lastError) {
              console.error("❌ Chrome runtime error:", chrome.runtime.lastError);
              resolve({ isSensitive: false, maskedText: text, error: chrome.runtime.lastError.message });
            } else if (response && response.success) {
              console.log("✅ Redaction analysis completed successfully");
              resolve({
                isSensitive: response.hasSensitiveData,
                maskedText: response.redactedText,
                originalText: response.originalText,
                sensitiveItems: response.sensitiveItems || [],
                redactionApplied: response.hasSensitiveData,
                detectedTypes: response.sensitiveItems.map(item => item.type) || []
              });
            } else {
              console.log("⚠️ Background script returned unsuccessful response");
              resolve({ isSensitive: false, maskedText: text, error: response?.error || 'Unknown error' });
            }
          });
        });
      } catch (error) {
        console.error("❌ Error in text analysis:", error);
        console.error("❌ Error stack:", error.stack);
        return { isSensitive: false, maskedText: text, error: error.message };
      }
    }

    // Function to handle input events
    function handleInputEvent(event) {
      const element = event.target;
      const text = element.value || element.textContent || element.innerText || '';

      console.log(`🔍 Input event detected:`, {
        text: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
        length: text.length,
        element: element.tagName,
        type: element.type || 'none',
        id: element.id || 'no-id'
      });

      // Skip if text is too short or element is not relevant
      if (!text || text.length < INPUT_CONFIG.MIN_TEXT_LENGTH) {
        console.log("⏩ Skipping - text too short or empty");
        return;
      }

      // Skip if this is a password field (already handled by browser)
      if (element.type === 'password') {
        console.log("⏩ Skipping - password field");
        return;
      }

      // Clear existing timer for this element
      const elementId = element.id || element.tagName + '_' + Math.random().toString(36).substr(2, 9);
      if (analysisTimers.has(elementId)) {
        clearTimeout(analysisTimers.get(elementId));
        console.log("⏱️ Cleared existing timer for element");
      }

      // Set new timer for delayed analysis
      // Analysis now happens on input events or send button click
      console.log("💡 Analysis will trigger on input events or when send button is clicked");
    }

    // Function to handle paste events
    function handlePasteEvent(event) {
      const element = event.target;

      // Skip password fields
      if (element.type === 'password') {
        return;
      }

      setTimeout(async () => {
        const text = element.value;

        if (text && text.length >= INPUT_CONFIG.MIN_TEXT_LENGTH) {
          console.log("📋 Analyzing pasted content with Gemini...");

          // Send directly to Gemini for analysis (no pre-filtering)
          try {
            const analysis = await analyzeTextWithGemini(text, element);
            console.log("🔍 Gemini paste analysis result:", analysis);

            if (analysis.isSensitive && analysis.maskedText && analysis.maskedText !== text) {
              element.value = analysis.maskedText;
              console.log("🎭 Applied Gemini-powered masking to pasted content");
              element.dispatchEvent(new Event('input', { bubbles: true }));
            } else {
              console.log("✅ Gemini: No sensitive data detected in paste");
            }
          } catch (error) {
            console.error("❌ Error in paste analysis:", error);
          }
        }
      }, 50); // Small delay to ensure paste content is available
    }

    // Function to add event listeners to input elements
    function addInputMonitoring() {
      // Ensure document is available
      if (!document || !document.body) {
        console.log("⏳ Document not ready, skipping input monitoring");
        return;
      }

      // Enhanced selectors for mobile compatibility
      const inputSelectors = [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="tel"]',
        'input[type="number"]',
        'input[type="search"]',
        'input:not([type])', // Default inputs
        'textarea',
        '[contenteditable="true"]',
        '[contenteditable=""]', // Empty contenteditable
        'div[role="textbox"]', // ARIA textboxes
        '[data-testid*="input"]', // Common test IDs
        '[data-cy*="input"]',
        '.input', // Common class names
        '.textbox',
        '.text-input'
      ];

      const inputElements = document.querySelectorAll(inputSelectors.join(', '));

      console.log(`🔍 Found ${inputElements.length} input elements to monitor`);

      inputElements.forEach((element, index) => {
        try {
          // Use the helper function to add listeners
          addEventListenersToElement(element);

          console.log(`🎯 Processed element ${index + 1}:`, {
            tag: element.tagName,
            type: element.type || 'text',
            id: element.id || 'no-id',
            className: element.className || 'no-class',
            placeholder: element.placeholder || 'no-placeholder'
          });
        } catch (error) {
          console.error(`Error processing element ${index}:`, error);
        }
      });      // Also monitor the specific ChatGPT input if we're on ChatGPT
      if (window.location.hostname.includes('chatgpt') || window.location.hostname.includes('openai')) {
        console.log("🤖 ChatGPT detected, adding specific monitoring...");

        // Try to find ChatGPT's input element with various selectors
        const chatGptSelectors = [
          '#prompt-textarea',
          '[data-id="root"]',
          'textarea[placeholder*="Message"]',
          'div[contenteditable="true"]',
          '[role="textbox"]'
        ];

        chatGptSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            console.log(`🎯 Adding ChatGPT-specific monitoring to:`, selector);
            const events = ['input', 'textInput', 'keyup', 'change', 'paste'];
            events.forEach(eventType => {
              element.addEventListener(eventType, handleInputEvent, { passive: true });
            });
            element.addEventListener('paste', handlePasteEvent, { passive: true });
          });
        });
      }
    }

    // Function to monitor for new input elements (for dynamic content)
    function setupInputObserver() {
      const observer = new MutationObserver((mutations) => {
        let newElementsFound = false;

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
              // Enhanced selectors for new elements
              const inputSelectors = [
                'input[type="text"]', 'input[type="email"]', 'input[type="tel"]', 'input[type="number"]',
                'input[type="search"]', 'input:not([type])', 'textarea', '[contenteditable="true"]',
                '[contenteditable=""]', 'div[role="textbox"]', '[data-testid*="input"]'
              ];

              // Check if the added node itself is an input element
              const isInputElement = inputSelectors.some(selector => {
                try {
                  return node.matches && node.matches(selector);
                } catch (e) {
                  return false;
                }
              });

              if (isInputElement) {
                console.log("🎯 Found new input element:", node.tagName, node.type || 'unknown');
                addEventListenersToElement(node);
                newElementsFound = true;
              }

              // Check for input elements within the added node
              if (node.querySelectorAll) {
                const newInputs = node.querySelectorAll(inputSelectors.join(', '));
                if (newInputs.length > 0) {
                  console.log(`🎯 Found ${newInputs.length} nested input elements`);
                  newInputs.forEach(input => {
                    addEventListenersToElement(input);
                  });
                  newElementsFound = true;
                }
              }
            }
          });
        });

        if (newElementsFound) {
          console.log("✅ Added monitoring to new dynamic elements");
        }
      });

      // Ensure document.body exists before observing
      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
      } else {
        // Wait for document.body to be available
        document.addEventListener('DOMContentLoaded', () => {
          if (document.body) {
            observer.observe(document.body, {
              childList: true,
              subtree: true
            });
          }
        });
      }

      return observer;
    }    // ======================
    // CONTENT ANALYSIS FUNCTIONALITY (EXISTING)
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

    // Initialize input monitoring with multiple attempts for mobile compatibility
    console.log("🔧 Initializing input monitoring...");

    // Add this new function to intercept send button clicks
    function interceptSendButtonClick() {
      const websiteConfig = getCurrentWebsiteConfig();
      if (!websiteConfig) {
        return;
      }

      console.log("🔗 Setting up send button click interception...");

      websiteConfig.selectors.forEach(selector => {
        try {
          const buttons = document.querySelectorAll(selector);
          buttons.forEach(button => {
            if (!button._hasClickInterceptor) {
              // Store original click handler if any
              const originalOnClick = button.onclick;

              // Add click event listener with capture to intercept before other handlers
              button.addEventListener('click', async function (event) {
                // Check bypass flag to prevent infinite loops
                if (bypassSendInterception) {
                  console.log("🔄 Bypassing send button interception");
                  return; // Allow the click to proceed normally
                }

                console.log("🚫 ===== SEND BUTTON INTERCEPTED =====");

                // Prevent the original click from executing
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                console.log("🔍 Analyzing all input fields before sending...");

                // Find all input fields that might contain text
                const inputSelectors = [
                  'input[type="text"]', 'input[type="email"]', 'input[type="tel"]',
                  'input[type="number"]', 'input[type="search"]', 'input:not([type])',
                  'textarea', '[contenteditable="true"]', '[contenteditable=""]',
                  'div[role="textbox"]', '[data-testid*="input"]'
                ];

                const inputElements = document.querySelectorAll(inputSelectors.join(', '));
                const analysisPromises = [];

                // Analyze each input field that has text
                inputElements.forEach(element => {
                  const text = element.value || element.textContent || element.innerText || '';

                  if (text && text.length >= INPUT_CONFIG.MIN_TEXT_LENGTH && element.type !== 'password') {
                    console.log("📝 Found text in element:", element.tagName, text.substring(0, 30));

                    // Increment pending API calls
                    incrementPendingAPICalls();

                    const analysisPromise = analyzeTextWithGemini(text, element)
                      .then(analysis => {
                        console.log("✅ Pre-send analysis complete for element");

                        if (analysis.isSensitive && analysis.maskedText && analysis.maskedText !== text) {
                          console.log("🎭 Applying redaction before send");
                          console.log("🎭 Original text:", text.substring(0, 50) + "...");
                          console.log("🎭 Masked text:", analysis.maskedText.substring(0, 50) + "...");

                          if (element.value !== undefined) {
                            element.value = analysis.maskedText;
                          } else if (element.textContent !== undefined) {
                            element.textContent = analysis.maskedText;
                          } else if (element.innerText !== undefined) {
                            element.innerText = analysis.maskedText;
                          }

                          // Trigger input event to notify the application of the change
                          element.dispatchEvent(new Event('input', { bubbles: true }));
                          element.dispatchEvent(new Event('change', { bubbles: true }));
                          console.log("✅ Redaction applied before send");
                        } else {
                          console.log("ℹ️ No redaction needed for this element");
                        }

                        return analysis;
                      })
                      .finally(() => {
                        // Always decrement when done
                        decrementPendingAPICalls();
                      });

                    analysisPromises.push(analysisPromise);
                  }
                });

                if (analysisPromises.length === 0) {
                  console.log("📝 No text found to analyze, proceeding with send");
                  // If no analysis needed, trigger the original click with bypass
                  setTimeout(() => {
                    console.log("🚀 Triggering send with bypass flag");
                    bypassSendInterception = true;

                    if (originalOnClick) {
                      originalOnClick.call(button, event);
                    } else {
                      // Create and dispatch a new click event
                      const newEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                      });
                      button.dispatchEvent(newEvent);
                    }

                    // Reset bypass flag after a short delay
                    setTimeout(() => {
                      bypassSendInterception = false;
                      console.log("🔄 Reset bypass flag");
                    }, 100);
                  }, 100);
                  return;
                }

                console.log(`⏳ Waiting for ${analysisPromises.length} analysis operations to complete...`);

                try {
                  // Wait for all analyses to complete
                  await Promise.all(analysisPromises);

                  console.log("✅ All pre-send analyses complete, proceeding with send");

                  // Small delay to ensure UI updates
                  setTimeout(() => {
                    console.log("🚀 Triggering original send action with bypass");
                    bypassSendInterception = true;

                    if (originalOnClick) {
                      originalOnClick.call(button, event);
                    } else {
                      // Create and dispatch a new click event
                      const newEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                      });
                      button.dispatchEvent(newEvent);
                    }

                    // Reset bypass flag after a short delay
                    setTimeout(() => {
                      bypassSendInterception = false;
                      console.log("🔄 Reset bypass flag after successful send");
                    }, 100);
                  }, 500); // 500ms delay to ensure all updates are complete

                } catch (error) {
                  console.error("❌ Error during pre-send analysis:", error);

                  // Still allow sending even if analysis fails
                  setTimeout(() => {
                    console.log("🚀 Triggering send despite analysis error");
                    bypassSendInterception = true;

                    if (originalOnClick) {
                      originalOnClick.call(button, event);
                    } else {
                      const newEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                      });
                      button.dispatchEvent(newEvent);
                    }

                    // Reset bypass flag after a short delay
                    setTimeout(() => {
                      bypassSendInterception = false;
                      console.log("🔄 Reset bypass flag after error recovery");
                    }, 100);
                  }, 100);
                }

              }, true); // Use capture phase

              button._hasClickInterceptor = true;
              console.log("✅ Added click interceptor to send button");
            }
          });
        } catch (error) {
          console.log("❌ Error setting up send button interceptor:", error);
        }
      });
    }

    // Function to monitor for new send buttons (for dynamic content)
    function setupSendButtonObserver() {
      const websiteConfig = getCurrentWebsiteConfig();
      if (!websiteConfig) {
        return;
      }

      // Set up initial interceptors
      interceptSendButtonClick();

      const observer = new MutationObserver((mutations) => {
        let newButtonsFound = false;

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node itself is a send button
              websiteConfig.selectors.forEach(selector => {
                try {
                  if (node.matches && node.matches(selector)) {
                    console.log("🔍 New send button detected:", selector);
                    newButtonsFound = true;
                  }

                  // Check if the added node contains send buttons
                  const buttons = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                  if (buttons.length > 0) {
                    console.log("🔍 New send buttons found in added content:", selector);
                    newButtonsFound = true;
                  }
                } catch (error) {
                  // Ignore selector errors
                }
              });
            }
          });
        });

        if (newButtonsFound) {
          // Set up interceptors for new buttons
          setTimeout(() => {
            interceptSendButtonClick();
          }, 100);
        }

        // Only block if we have pending API calls
        if (pendingAPICallsCount > 0) {
          blockSendButtons();
        }
      });

      if (document.body) {
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        console.log("👀 Send button observer started with click interception");
      }

      return observer;
    }

    // Function to initialize all monitoring
    function initializeMonitoring() {
      // Initial setup
      addInputMonitoring();

      // Setup mutation observer for dynamic content (only if document.body exists)
      if (document.body) {
        setupInputObserver();

        // Setup send button observer for AI websites
        setupSendButtonObserver();
      }
    }

    // Initialize monitoring when document is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeMonitoring);
    } else {
      initializeMonitoring();
    }

    // Re-run input monitoring after delays to catch late-loading elements
    setTimeout(() => {
      console.log("🔧 Re-running input monitoring after 2s...");
      addInputMonitoring();
    }, 2000);

    setTimeout(() => {
      console.log("🔧 Re-running input monitoring after 5s...");
      addInputMonitoring();
    }, 5000);

    // Test function to verify input monitoring is working
    function testInputMonitoring() {
      try {
        console.log("🧪 Testing input monitoring...");

        if (!document) {
          console.log("🧪 Document not available");
          return;
        }

        const allInputs = document.querySelectorAll('input, textarea, [contenteditable]');
        console.log(`🧪 Found ${allInputs.length} total input-like elements on page`);

        allInputs.forEach((input, index) => {
          console.log(`🧪 Input ${index + 1}:`, {
            tag: input.tagName,
            type: input.type || 'none',
            id: input.id || 'no-id',
            className: input.className || 'no-class',
            placeholder: input.placeholder || 'no-placeholder',
            hasEventListeners: input._hasInputMonitoring || false
          });
        });
      } catch (error) {
        console.error("🧪 Test function error:", error);
      }
    }

    // Run test after page loads
    setTimeout(testInputMonitoring, 3000);

    // ======================
    // SEND BUTTON BLOCKING FUNCTIONALITY
    // ======================

    // Function to get current website configuration
    function getCurrentWebsiteConfig() {
      const hostname = window.location.hostname.toLowerCase();

      for (const [domain, config] of Object.entries(AI_WEBSITES)) {
        if (hostname.includes(domain)) {
          console.log("🌐 Detected AI website:", domain);
          return config;
        }
      }

      return null;
    }

    // Function to find and block send buttons
    function blockSendButtons() {
      const websiteConfig = getCurrentWebsiteConfig();
      if (!websiteConfig) {
        console.log("🌐 Not on a configured AI website, skipping send button blocking");
        return;
      }

      console.log("🚫 ===== BLOCKING SEND BUTTONS =====");

      let buttonsFound = 0;
      websiteConfig.selectors.forEach(selector => {
        try {
          const buttons = document.querySelectorAll(selector);
          buttons.forEach(button => {
            if (!blockedSendButtons.has(button)) {
              // Store original state
              const originalDisabled = button.disabled;
              const originalStyle = button.style.cssText;
              const originalTitle = button.title;

              // Disable the button
              button.disabled = true;
              button.style.opacity = '0.5';
              button.style.cursor = 'not-allowed';
              button.title = 'Waiting for text redaction to complete...';

              // Store button reference and original state
              blockedSendButtons.add(button);
              button._originalState = {
                disabled: originalDisabled,
                style: originalStyle,
                title: originalTitle
              };

              buttonsFound++;
              console.log("🚫 Blocked send button:", selector);
            }
          });
        } catch (error) {
          console.log("🌐 Selector not found:", selector);
        }
      });

      if (buttonsFound > 0) {
        console.log(`🚫 Successfully blocked ${buttonsFound} send buttons`);
      } else {
        console.log("⚠️ No send buttons found to block");
      }
    }

    // Function to unblock send buttons
    function unblockSendButtons() {
      console.log("✅ ===== UNBLOCKING SEND BUTTONS =====");

      let buttonsUnblocked = 0;
      blockedSendButtons.forEach(button => {
        try {
          if (button._originalState) {
            // Restore original state
            button.disabled = button._originalState.disabled;
            button.style.cssText = button._originalState.style;
            button.title = button._originalState.title;

            delete button._originalState;
            buttonsUnblocked++;
          }
        } catch (error) {
          console.log("🌐 Error unblocking button:", error);
        }
      });

      // Clear the blocked buttons set
      blockedSendButtons.clear();

      if (buttonsUnblocked > 0) {
        console.log(`✅ Successfully unblocked ${buttonsUnblocked} send buttons`);
      }
    }

    // Function to increment pending API calls and block buttons
    function incrementPendingAPICalls() {
      pendingAPICallsCount++;
      console.log("📈 Pending API calls:", pendingAPICallsCount);

      if (pendingAPICallsCount === 1) {
        // First API call - block send buttons
        blockSendButtons();
      }
    }

    // Function to decrement pending API calls and unblock when done
    function decrementPendingAPICalls() {
      pendingAPICallsCount = Math.max(0, pendingAPICallsCount - 1);
      console.log("📉 Pending API calls:", pendingAPICallsCount);

      if (pendingAPICallsCount === 0) {
        // All API calls complete - unblock send buttons
        console.log("🎉 All API calls complete - unblocking send buttons");
        unblockSendButtons();
      }
    }

    // Add test functions for send button blocking
    window.testSendButtonBlocking = function () {
      console.log("🧪 ===== TESTING SEND BUTTON BLOCKING =====");
      console.log("🧪 Current website:", window.location.hostname);
      console.log("🧪 Pending API calls:", pendingAPICallsCount);

      // Simulate API call
      incrementPendingAPICalls();

      setTimeout(() => {
        console.log("🧪 Simulating API completion...");
        decrementPendingAPICalls();
      }, 3000);
    };

    window.testMultipleAPICalls = function () {
      console.log("🧪 ===== TESTING MULTIPLE API CALLS =====");

      // Simulate 3 API calls
      incrementPendingAPICalls();
      incrementPendingAPICalls();
      incrementPendingAPICalls();

      console.log("🧪 Started 3 API calls, will complete them one by one...");

      setTimeout(() => {
        console.log("🧪 Completing API call 1/3");
        decrementPendingAPICalls();
      }, 2000);

      setTimeout(() => {
        console.log("🧪 Completing API call 2/3");
        decrementPendingAPICalls();
      }, 4000);

      setTimeout(() => {
        console.log("🧪 Completing API call 3/3");
        decrementPendingAPICalls();
      }, 6000);
    };

    window.getSendButtonStatus = function () {
      console.log("📊 ===== SEND BUTTON STATUS =====");
      console.log("📊 Pending API calls:", pendingAPICallsCount);
      console.log("📊 Blocked buttons count:", blockedSendButtons.size);
      console.log("📊 Current website config:", getCurrentWebsiteConfig());

      const websiteConfig = getCurrentWebsiteConfig();
      if (websiteConfig) {
        websiteConfig.selectors.forEach(selector => {
          const buttons = document.querySelectorAll(selector);
          console.log(`📊 Found ${buttons.length} buttons for selector: ${selector}`);
          buttons.forEach((button, index) => {
            console.log(`📊   Button ${index + 1}: disabled=${button.disabled}, hasInterceptor=${!!button._hasClickInterceptor}`);
          });
        });
      }
    };

    // Add test function for the new send button interception functionality
    window.testSendButtonInterception = function () {
      console.log("🧪 ===== TESTING SEND BUTTON INTERCEPTION =====");

      // Add some test text to an input field
      const testInput = document.querySelector('textarea') || document.querySelector('input[type="text"]') || document.querySelector('[contenteditable="true"]');
      if (testInput) {
        const testText = "My email is john.doe@example.com and my phone is 555-123-4567";
        if (testInput.value !== undefined) {
          testInput.value = testText;
        } else {
          testInput.textContent = testText;
        }
        testInput.dispatchEvent(new Event('input', { bubbles: true }));
        console.log("🧪 Added test sensitive data to input field");

        // Try to find and click send button
        const websiteConfig = getCurrentWebsiteConfig();
        if (websiteConfig) {
          websiteConfig.selectors.forEach(selector => {
            const button = document.querySelector(selector);
            if (button) {
              console.log("🧪 Found send button, testing click interception...");
              console.log("🧪 Button has interceptor:", !!button._hasClickInterceptor);
              button.click();
              return;
            }
          });
          console.log("🧪 No send button found for current website");
        } else {
          console.log("🧪 Current website not configured for send button interception");
        }
      } else {
        console.log("🧪 No input field found for testing");
      }
    };

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

    // Ensure document.body exists before observing
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      // Wait for document.body to be available
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
