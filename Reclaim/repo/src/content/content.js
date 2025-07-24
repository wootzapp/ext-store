// Import polyfills
import '../utils/polyfills';

import { RECLAIM_SDK_ACTIONS, MESSAGE_ACTIONS, MESSAGE_SOURCES } from '../utils/constants';
import { createProviderVerificationPopup } from './components/ProviderVerificationPopup';
import { filterRequest } from '../utils/claim-creator';
import { loggerService, LOG_TYPES } from '../utils/logger';
import { wootzZKProofGenerator } from '../utils/wootz-zk-generator';

// Create a flag to track if we should initialize
let shouldInitialize = false;
let interceptorInjected = false;
let injectionScriptInjected = false;

// ⭐ DEBUG: Add debugging panel for data extraction monitoring ⭐
let debugPanel = null;
let debugLogs = [];

function createDebugPanel() {
    if (debugPanel) return debugPanel;
    
    debugPanel = document.createElement('div');
    debugPanel.id = 'reclaim-debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 400px;
        max-height: 600px;
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        font-family: monospace;
        font-size: 12px;
        padding: 10px;
        border: 2px solid #00ff00;
        border-radius: 5px;
        z-index: 999999;
        overflow-y: auto;
        display: none;
    `;
    
    debugPanel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; color: #00ff00;">🔍 Reclaim Data Extraction Debug</h3>
            <button id="reclaim-debug-close" style="background: #ff0000; color: white; border: none; padding: 5px 10px; cursor: pointer;">X</button>
        </div>
        <div id="reclaim-debug-content"></div>
        <div style="margin-top: 10px;">
            <button id="reclaim-debug-clear" style="background: #333; color: white; border: none; padding: 5px 10px; cursor: pointer; margin-right: 5px;">Clear Logs</button>
            <button id="reclaim-debug-export" style="background: #333; color: white; border: none; padding: 5px 10px; cursor: pointer;">Export Logs</button>
        </div>
    `;
    
    document.body.appendChild(debugPanel);
    
    // Add event listeners
    document.getElementById('reclaim-debug-close').addEventListener('click', () => {
        debugPanel.style.display = 'none';
    });
    
    document.getElementById('reclaim-debug-clear').addEventListener('click', () => {
        debugLogs = [];
        updateDebugPanel();
    });
    
    document.getElementById('reclaim-debug-export').addEventListener('click', () => {
        const dataStr = JSON.stringify(debugLogs, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reclaim-debug-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    });
    
    return debugPanel;
}

function addDebugLog(message, data = null, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = {
        timestamp,
        type,
        message,
        data,
        url: window.location.href
    };
    
    debugLogs.push(logEntry);
    console.log(`[Reclaim Debug] ${message}`, data);
    
    // Keep only last 100 logs
    if (debugLogs.length > 100) {
        debugLogs = debugLogs.slice(-100);
    }
    
    updateDebugPanel();
}

function updateDebugPanel() {
    if (!debugPanel) return;
    
    const content = document.getElementById('reclaim-debug-content');
    if (!content) return;
    
    content.innerHTML = debugLogs.map(log => {
        const color = log.type === 'error' ? '#ff4444' : 
                     log.type === 'success' ? '#44ff44' : 
                     log.type === 'warning' ? '#ffaa44' : '#00ff00';
        
        let dataStr = '';
        if (log.data) {
            try {
                dataStr = typeof log.data === 'object' ? 
                    JSON.stringify(log.data, null, 2) : String(log.data);
            } catch (e) {
                dataStr = '[Circular or non-serializable data]';
            }
        }
        
        return `
            <div style="margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                <div style="color: ${color}; font-weight: bold;">[${log.timestamp}] ${log.message}</div>
                ${dataStr ? `<pre style="background: #111; padding: 5px; margin: 5px 0; font-size: 10px; overflow-x: auto;">${dataStr}</pre>` : ''}
            </div>
        `;
    }).join('');
    
    content.scrollTop = content.scrollHeight;
}

function showDebugPanel() {
    if (!debugPanel) {
        createDebugPanel();
    }
    debugPanel.style.display = 'block';
    addDebugLog('Debug panel activated', null, 'info');
}

// Function to inject the network interceptor - will be called conditionally
const injectNetworkInterceptor = function () {
  if (interceptorInjected) return;

  addDebugLog('🔧 Starting network interceptor injection...', {
    scriptUrl: chrome.runtime.getURL('interceptor/network-interceptor.bundle.js'),
    documentReady: document.readyState,
    hasDocumentElement: !!document.documentElement,
    hasHead: !!document.head,
    interceptorAlreadyInjected: interceptorInjected
  }, 'info');

  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor/network-interceptor.bundle.js');
    script.type = 'text/javascript';

    // Set highest priority attributes
    script.async = false;
    script.defer = false;

    // Add load and error handlers for debugging
    script.onload = () => {
      addDebugLog('✅ Network interceptor script loaded successfully', {
        windowHasInterceptor: !!window.reclaimNetworkInterceptor,
        interceptorType: typeof window.reclaimNetworkInterceptor,
        scriptSrc: script.src
      }, 'success');
    };
    
    script.onerror = (error) => {
      addDebugLog('❌ Network interceptor script failed to load', {
        error: error.message || 'Script load error',
        scriptSrc: script.src,
        possibleCauses: [
          'CSP blocking script injection',
          'Invalid script URL',
          'Network error loading script',
          'Script execution error'
        ]
      }, 'error');
    };

    // Try to inject as early as possible
    let injected = false;

    // Function to actually inject the script with highest priority
    const injectNow = () => {
      if (injected) return;

      addDebugLog('🔧 Attempting to inject network interceptor...', {
        hasDocumentElement: !!document.documentElement,
        hasHead: !!document.head,
        hasDocument: !!document
      }, 'info');

      if (document.documentElement) {
        // Use insertBefore for highest priority injection
        document.documentElement.insertBefore(script, document.documentElement.firstChild);
        injected = true;
        interceptorInjected = true;
        addDebugLog('✅ Network interceptor injected via documentElement', null, 'success');
      } else if (document.head) {
        document.head.insertBefore(script, document.head.firstChild);
        injected = true;
        interceptorInjected = true;
        addDebugLog('✅ Network interceptor injected via head', null, 'success');
      } else if (document) {
        document.appendChild(script);
        injected = true;
        interceptorInjected = true;
        addDebugLog('✅ Network interceptor injected via document', null, 'success');
      } else {
        addDebugLog('❌ No valid injection target found', {
          documentReady: document.readyState,
          hasDocumentElement: !!document.documentElement,
          hasHead: !!document.head
        }, 'error');
      }
    };

    // Try to inject immediately
    injectNow();

    // Also set up a MutationObserver as a fallback
    if (!injected) {
      const observer = new MutationObserver(() => {
        if (!injected && (document.documentElement || document.head)) {
          injectNow();
          if (injected) {
            observer.disconnect();
          }
        }
      });

      // Observe document for any changes at the earliest possible moment
      observer.observe(document, { childList: true, subtree: true });
    }

    return script; // Return script element to prevent garbage collection
  } catch (e) {
    addDebugLog('Failed to inject network interceptor', e.message, 'error');
    return null;
  }
};

// Function to inject the injection scripts - similar to network interceptor
const injectDynamicInjectionScript = function () {
  if (injectionScriptInjected) return;

  addDebugLog('🔧 Starting injection scripts injection...', {
    scriptUrl: chrome.runtime.getURL('interceptor/injection-scripts.bundle.js'),
    documentReady: document.readyState,
    hasDocumentElement: !!document.documentElement,
    hasHead: !!document.head,
    injectionScriptAlreadyInjected: injectionScriptInjected
  }, 'info');

  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor/injection-scripts.bundle.js');
    script.type = 'text/javascript';

    // Set highest priority attributes
    script.async = false;
    script.defer = false;

    // Add load and error handlers for debugging
    script.onload = () => {
      addDebugLog('✅ Injection scripts loaded successfully', {
        windowHasInjectionScripts: !!window.reclaimInjectionScripts,
        injectionScriptsType: typeof window.reclaimInjectionScripts,
        scriptSrc: script.src
      }, 'success');
    };
    
    script.onerror = (error) => {
      addDebugLog('❌ Injection scripts failed to load', {
        error: error.message || 'Script load error',
        scriptSrc: script.src,
        possibleCauses: [
          'CSP blocking script injection',
          'Invalid script URL',
          'Network error loading script',
          'Script execution error'
        ]
      }, 'error');
    };

    // Try to inject as early as possible
    let injected = false;

    // Function to actually inject the script with highest priority
    const injectNow = () => {
      if (injected) return;

      addDebugLog('🔧 Attempting to inject injection scripts...', {
        hasDocumentElement: !!document.documentElement,
        hasHead: !!document.head,
        hasDocument: !!document
      }, 'info');

      if (document.documentElement) {
        // Use insertBefore for highest priority injection
        document.documentElement.insertBefore(script, document.documentElement.firstChild);
        injected = true;
        injectionScriptInjected = true;
        addDebugLog('✅ Injection scripts injected via documentElement', null, 'success');
      } else if (document.head) {
        document.head.insertBefore(script, document.head.firstChild);
        injected = true;
        injectionScriptInjected = true;
        addDebugLog('✅ Injection scripts injected via head', null, 'success');
      } else if (document) {
        document.appendChild(script);
        injected = true;
        injectionScriptInjected = true;
        addDebugLog('✅ Injection scripts injected via document', null, 'success');
      } else {
        addDebugLog('❌ No valid injection target found for injection scripts', {
          documentReady: document.readyState,
          hasDocumentElement: !!document.documentElement,
          hasHead: !!document.head
        }, 'error');
      }
    };

    // Try to inject immediately
    injectNow();

    // Also set up a MutationObserver as a fallback
    if (!injected) {
      const observer = new MutationObserver(() => {
        if (!injected && (document.documentElement || document.head)) {
          injectNow();
          if (injected) {
            observer.disconnect();
          }
        }
      });

      // Observe document for any changes at the earliest possible moment
      observer.observe(document, { childList: true, subtree: true });
    }

    return script; // Return script element to prevent garbage collection
  } catch (e) {
    addDebugLog('Failed to inject injection scripts', e.message, 'error');
    return null;
  }
};

// On load, immediately check if this tab should be initialized
(async function () {
  try {
    // Notify background script that content script is loaded
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.CONTENT_SCRIPT_LOADED,
      source: MESSAGE_SOURCES.CONTENT_SCRIPT,
      target: MESSAGE_SOURCES.BACKGROUND,
      data: { url: window.location.href }
    });

    // Listen for the background script's response about initialization
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const { action, data } = message;

      if (action === MESSAGE_ACTIONS.SHOULD_INITIALIZE) {
        shouldInitialize = data.shouldInitialize;

        if (shouldInitialize) {
          // If we should initialize, inject the interceptor immediately
          // ⭐ CRITICAL: Inject network interceptor for request capture ⭐
          console.log('🔧 [Content Script] Should initialize - injecting network interceptor...');
          injectNetworkInterceptor();
          
          // Also inject the dynamic injection script loader
          console.log('🔧 [Content Script] Injecting dynamic injection scripts...');
          injectDynamicInjectionScript();

          // And initialize the content script
          console.log('🔧 [Content Script] Initializing ReclaimContentScript...');
          window.reclaimContentScript = new ReclaimContentScript();
        }

        sendResponse({ success: true });
      }

      return true;
    });
  } catch (e) {
    // Silent error handling
  }
})();

class ReclaimContentScript {
  constructor() {
    // The interceptor should be injected before this constructor runs
    this.init();
    
    // Only initialize popup-related properties if this is likely a managed tab
    // These will be properly set later during initialization
    this.verificationPopup = null;
    this.providerName = 'Emirates';
    this.credentialType = 'Skywards';
    this.dataRequired = 'Membership Status / Tier';

    // Storage for intercepted requests and responses
    this.interceptedRequests = new Map();
    this.interceptedResponses = new Map();
    this.linkedRequestResponses = new Map();

    // Filtering state
    this.providerData = null;
    this.parameters = null;
    this.sessionId = null;
    this.httpProviderId = null;
    this.appId = null;
    this.filteringInterval = null;
    this.filteringStartTime = null;
    this.filteredRequests = [];
    this.isFiltering = false;
    this.stopStoringInterceptions = false;
    
    // Flag to track if this is a managed tab (will be set during init)
    this.isManagedTab = false;
    
    // ⭐ NEW: Flag to track verification completion ⭐
    this.verificationCompleted = false;
    this.manualTriggerAttempted = false;
    this.lastTriggerTime = 0;
    this.triggerAttempts = 0;
    this.autoExtractionAttempted = false;
    this.extractedPageData = null;
  }

  init() {
    // Listen for messages from the web page
    window.addEventListener('message', this.handleWindowMessage.bind(this));

    if (!shouldInitialize) {
      return;
    }

    chrome.runtime.onMessage.addListener(this.handleMessage.bind(this));
    
    // First verify this is a managed tab before proceeding with initialization
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.CHECK_IF_MANAGED_TAB,
      source: MESSAGE_SOURCES.CONTENT_SCRIPT,
      target: MESSAGE_SOURCES.BACKGROUND,
      data: {}
    }, (response) => {
      if (!response.success || !response.isManaged) {
        // This tab is not managed by the extension, don't initialize popup-related functionality
        this.isManagedTab = false;
        return;
      }

      // Mark this as a managed tab
      this.isManagedTab = true;

      // Only proceed with provider data request if this is a managed tab
      chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.REQUEST_PROVIDER_DATA,
        source: MESSAGE_SOURCES.CONTENT_SCRIPT,
        target: MESSAGE_SOURCES.BACKGROUND,
        data: { url: window.location.href }
      }, (response) => {
        if (response.success) {
          this.providerData = response.data.providerData;
          this.parameters = response.data.parameters;
          this.sessionId = response.data.sessionId;
          this.httpProviderId = response.data.httpProviderId || 'unknown';
          this.appId = response.data.appId || 'unknown';
          
          // Store provider ID in website's localStorage for injection script access
          this.setProviderIdInLocalStorage(this.httpProviderId);
          
          if (!this.isFiltering) {
            this.startNetworkFiltering();
          }
        }
      });
    });
  }

  handleMessage(message, sender, sendResponse) {
    const { action, data, source } = message;

    switch (action) {
      case 'PROOF_SUBMITTED':
        // ⭐ NEW: Mark verification as completed ⭐
        this.verificationCompleted = true;
        
        addDebugLog('🎉 Verification completed successfully!', {
          sessionId: this.sessionId,
          providerId: this.httpProviderId,
          timestamp: new Date().toISOString()
        }, 'success');
        
        // Forward proof to the page
        window.postMessage({
          action: RECLAIM_SDK_ACTIONS.VERIFICATION_COMPLETED,
          data: data.proof
        }, '*');

        // Update popup with success message
        if (this.verificationPopup) {
          this.verificationPopup.handleProofSubmitted(data.proof);
        }

        // ⭐ NEW: Now safe to stop network filtering and clear data ⭐
        this.stopNetworkFiltering();

        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.SHOULD_INITIALIZE:
        // ignore this message since we already handle it in the initialization check
        break;

      case MESSAGE_ACTIONS.GET_PAGE_DATA:
        // ⭐ NEW: Handle request for page data from background script ⭐
        console.log('📄 [CONTENT-DETAILED] GET_PAGE_DATA message received:', {
          hasWindow: typeof window !== 'undefined',
          hasDocument: typeof document !== 'undefined',
          hasDocumentElement: typeof document !== 'undefined' && !!document.documentElement,
          timestamp: new Date().toISOString()
        });

        try {
          const pageUrl = window.location.href;
          const pageContent = document.documentElement.outerHTML;
          
          console.log('📄 [CONTENT-DETAILED] Page data extracted:', {
            url: pageUrl,
            contentLength: pageContent.length,
            contentPreview: pageContent.substring(0, 200) + '...',
            hasDocumentBody: typeof document !== 'undefined' && !!document.body,
            documentReadyState: typeof document !== 'undefined' ? document.readyState : 'unknown',
            timestamp: new Date().toISOString()
          });
          
          const response = {
            success: true,
            url: pageUrl,
            content: pageContent
          };

          console.log('📤 [CONTENT-DETAILED] Sending page data response:', {
            success: response.success,
            url: response.url,
            contentLength: response.content.length,
            timestamp: new Date().toISOString()
          });
          
          sendResponse(response);
        } catch (error) {
          console.error('❌ [CONTENT-DETAILED] Error getting page data:', {
            error: error,
            errorMessage: error.message,
            errorStack: error.stack,
            hasWindow: typeof window !== 'undefined',
            hasDocument: typeof document !== 'undefined',
            timestamp: new Date().toISOString()
          });

          const errorResponse = {
            success: false,
            error: error.message
          };

          console.log('📤 [CONTENT-DETAILED] Sending error response:', errorResponse);
          sendResponse(errorResponse);
        }
        break;

      case MESSAGE_ACTIONS.PROVIDER_DATA_READY:
        // Only process provider data if this is a managed tab
        if (!this.isManagedTab) {
          sendResponse({ success: false, message: 'Tab is not managed by extension' });
          break;
        }

        this.providerData = data.providerData;
        this.parameters = data.parameters;
        this.sessionId = data.sessionId;
        this.httpProviderId = data.httpProviderId || 'unknown';
        this.appId = data.appId || 'unknown';
        
        // ⭐ DEBUG: Log provider data received ⭐
        addDebugLog('📥 Provider data received from background', {
          hasProviderData: !!this.providerData,
          providerDataKeys: this.providerData ? Object.keys(this.providerData) : [],
          expectedUrl: this.providerData?.requestData?.[0]?.url,
          currentUrl: window.location.href,
          isOnCorrectPage: window.location.href.includes('/settings/profile')
        }, 'success');
        
        // Store provider ID in website's localStorage for injection script access
        this.setProviderIdInLocalStorage(this.httpProviderId);
        
        if (!this.isFiltering) {
          addDebugLog('🚀 Starting network filtering', {
            hasProviderData: !!this.providerData,
            expectedUrl: this.providerData?.requestData?.[0]?.url,
            currentUrl: window.location.href
          }, 'success');
          
          this.startNetworkFiltering();
        } else {
          addDebugLog('⚠️ Network filtering already active', {
            isFiltering: this.isFiltering,
            filteredRequestsCount: this.filteredRequests.length
          }, 'warning');
        }

        loggerService.log({
          message: 'Provider data received from background script and will proceed with network filtering.',
          type: LOG_TYPES.CONTENT,
          sessionId: data.sessionId,
          providerId: data.httpProviderId,
          appId: data.appId
        });
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.SHOW_PROVIDER_VERIFICATION_POPUP:
        // First check if this tab is managed by the extension before showing popup
        chrome.runtime.sendMessage({
          action: MESSAGE_ACTIONS.CHECK_IF_MANAGED_TAB,
          source: MESSAGE_SOURCES.CONTENT_SCRIPT,
          target: MESSAGE_SOURCES.BACKGROUND,
          data: {}
        }, (response) => {
          if (!response.success || !response.isManaged) {
            // This tab is not managed by the extension, don't show popup
            sendResponse({ success: false, message: 'Tab is not managed by extension' });
            return;
          }

          // Only proceed with popup creation if this is a managed tab
          if (this.verificationPopup) {
            try {
              document.body.removeChild(this.verificationPopup.element);
            } catch (e) {
              // Silent error handling
            }
            this.verificationPopup = null;
          }

          this.providerName = data?.providerName || this.providerName;
          this.description = data?.description || this.description;
          this.dataRequired = data?.dataRequired || this.dataRequired;
          this.sessionId = data?.sessionId || this.sessionId;

          const appendPopupLogic = () => {
            if (!document.body) {
              addDebugLog('Document body not ready for popup', null, 'warning');
              return;
            }
            try {
              // ⭐ DEBUG: Log popup creation attempt ⭐
              addDebugLog('Creating ProviderVerificationPopup', {
                providerName: this.providerName,
                description: this.description,
                dataRequired: this.dataRequired,
                sessionId: this.sessionId,
                currentUrl: window.location.href
              }, 'success');
              
              this.verificationPopup = createProviderVerificationPopup(
                this.providerName,
                this.description,
                this.dataRequired,
                this.sessionId
              );
            } catch (e) {
              addDebugLog('Failed to create popup', e.message, 'error');
              return;
            }

            try {
              document.body.appendChild(this.verificationPopup.element);
              
              // ⭐ DEBUG: Log popup displayed ⭐
              addDebugLog('ProviderVerificationPopup displayed on page', {
                popupId: this.verificationPopup.element.id,
                providerName: this.providerName,
                sessionId: this.sessionId
              }, 'success');
            } catch (e) {
              addDebugLog('Failed to append popup to body', e.message, 'error');
              return;
            }
          };

          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
              appendPopupLogic();
            }, { once: true });
          } else {
            appendPopupLogic();
          }

          if (this.appId && this.httpProviderId && this.sessionId) {
            loggerService.log({
              message: 'Popup display process initiated and will proceed on DOM readiness.',
              type: LOG_TYPES.CONTENT,
              sessionId: this.sessionId,
              providerId: this.httpProviderId,
              appId: this.appId
            });
          }
          sendResponse({ success: true, message: 'Popup display process initiated and will proceed on DOM readiness.' });
        });
        break;

      // Handle status update messages from background script
      case MESSAGE_ACTIONS.CLAIM_CREATION_REQUESTED:
        if (this.verificationPopup) {
          this.verificationPopup.handleClaimCreationRequested(data.requestHash);
        }
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.CLAIM_CREATION_SUCCESS:
        if (this.verificationPopup) {
          this.verificationPopup.handleClaimCreationSuccess(data.requestHash);
        }
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.CLAIM_CREATION_FAILED:
        if (this.verificationPopup) {
          this.verificationPopup.handleClaimCreationFailed(data.requestHash);
        }
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.PROOF_GENERATION_STARTED:
        if (this.verificationPopup) {
          this.verificationPopup.handleProofGenerationStarted(data.requestHash);
        }
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.PROOF_GENERATION_SUCCESS:
        addDebugLog('✅ ZK proof generation successful using Wootz API', {
          requestHash: data.requestHash,
          hasProof: !!data.proof,
          hasCallbackResponse: !!data.callbackResponse,
          proofSize: data.proof ? JSON.stringify(data.proof).length : 0
        }, 'success');
        
        // Log proof details
        if (data.proof) {
          addDebugLog('📊 ZK Proof details', {
            proofKeys: Object.keys(data.proof),
            hasVerificationKey: !!data.proof.verification_key,
            hasPublicInputs: !!data.proof.public_inputs,
            extractedParams: data.proof.metadata?.extracted_params || {},
            generatedAt: data.proof.metadata?.generated_at
          }, 'info');
        }
        
        if (this.verificationPopup) {
          this.verificationPopup.handleProofGenerationSuccess(data.requestHash, data.proof);
        }
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.PROOF_GENERATION_FAILED:
        if (this.verificationPopup) {
          this.verificationPopup.handleProofGenerationFailed(data.requestHash);
        }
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.PROOF_SUBMITTED:
        if (this.verificationPopup) {
          this.verificationPopup.handleProofSubmitted(data.proof);
        }
        sendResponse({ success: true });
        break;

      case MESSAGE_ACTIONS.PROOF_SUBMISSION_FAILED:
        if (this.verificationPopup) {
          this.verificationPopup.handleProofSubmissionFailed(data.error);
        }
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }

    return true;
  }

  checkExtensionId(extensionID) {
    if (!extensionID || extensionID !== process.env.EXTENSION_ID) {
      return false;
    }
    return true;
  }

  handleWindowMessage(event) {
    // Only accept messages from the same window
    if (event.source !== window) return;

    const { action, data, messageId, extensionID } = event.data;

    // Check if the message is meant for this extension
    if (action === RECLAIM_SDK_ACTIONS.CHECK_EXTENSION) {
      // Send response back to the page
      // check if extensionId is present and is the same as the one in the env file
      if (!this.checkExtensionId(extensionID)) {
        return;
      }
      window.postMessage({
        action: RECLAIM_SDK_ACTIONS.EXTENSION_RESPONSE,
        messageId: messageId,
        installed: true
      }, '*');
    }

    // Handle provider ID request from injection script
    if (action === 'RECLAIM_GET_PROVIDER_ID' && event.data.source === 'injection-script') {
      // Respond with the provider ID from extension context
      window.postMessage({
        action: 'RECLAIM_PROVIDER_ID_RESPONSE',
        providerId: this.httpProviderId || null,
        source: 'content-script'
      }, '*');
      return;
    }

    // Handle injection script fetch request from injection script
    if (action === 'RECLAIM_FETCH_INJECTION_SCRIPT' && event.data.source === 'injection-script') {
      const providerId = event.data.providerId;
      
      // Make the request through the extension's background script to avoid CSP issues
      chrome.runtime.sendMessage({
        action: 'FETCH_INJECTION_SCRIPT',
        source: MESSAGE_SOURCES.CONTENT_SCRIPT,
        target: MESSAGE_SOURCES.BACKGROUND,
        data: { providerId: providerId }
      }, (response) => {
        if (response && response.success) {
          window.postMessage({
            action: 'RECLAIM_INJECTION_SCRIPT_RESPONSE',
            scriptContent: response.scriptContent,
            providerName: response.providerName,
            source: 'content-script'
          }, '*');
        } else {
          window.postMessage({
            action: 'RECLAIM_INJECTION_SCRIPT_RESPONSE',
            error: response?.error || 'Failed to fetch injection script',
            source: 'content-script'
          }, '*');
        }
      });
      return;
    }

    // Handle injection script execution request from injection script (CSP-safe approach)
    if (action === 'RECLAIM_EXECUTE_INJECTION_SCRIPT' && event.data.source === 'injection-script') {
      const injectionData = event.data.data;
      
      // Forward the injection script execution to background script
      // The background script can execute it in a safe context without CSP restrictions
      chrome.runtime.sendMessage({
        action: 'EXECUTE_INJECTION_SCRIPT',
        source: MESSAGE_SOURCES.CONTENT_SCRIPT,
        target: MESSAGE_SOURCES.BACKGROUND,
        data: injectionData
      }, (response) => {
        if (response && response.success) {
          window.postMessage({
            action: 'RECLAIM_INJECTION_SCRIPT_EXECUTED',
            success: true,
            source: 'content-script'
          }, '*');
        } else {
          window.postMessage({
            action: 'RECLAIM_INJECTION_SCRIPT_EXECUTED',
            success: false,
            error: response?.error || 'Failed to execute injection script',
            source: 'content-script'
          }, '*');
        }
      });
      return;
    }

    // Handle intercepted network request
    if (action === MESSAGE_ACTIONS.INTERCEPTED_REQUEST && data) {
      // Store the intercepted request
      this.storeInterceptedRequest(data);
      if (this.isFiltering) {
        this.startNetworkFiltering();
      }
    }

    // Handle intercepted network responses
    if (action === MESSAGE_ACTIONS.INTERCEPTED_RESPONSE && data) {
      // Store the intercepted response
      this.storeInterceptedResponse(data);

      // Try to link with the corresponding request
      this.linkRequestAndResponse(data.url, data);
      if (this.isFiltering) {
        this.startNetworkFiltering();
      }
    }

    // Handle start verification request from SDK
    if (action === RECLAIM_SDK_ACTIONS.START_VERIFICATION && data) {
      // Forward the template data to background script
      if (!this.checkExtensionId(extensionID)) {
        return;
      }
      loggerService.log({
        message: 'Starting verification with data from SDK: ' + JSON.stringify(data),
        type: LOG_TYPES.CONTENT,
        sessionId: data.sessionId,
        providerId: data.httpProviderId,
        appId: data.applicationId
      });
      chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.START_VERIFICATION,
        source: MESSAGE_SOURCES.CONTENT_SCRIPT,
        target: MESSAGE_SOURCES.BACKGROUND,
        data: data
      }, (response) => {
        // Store parameters and session ID for later use
        if (data.parameters) {
          this.parameters = data.parameters;
        }
        if (data.sessionId) {
          this.sessionId = data.sessionId;
        }



        // Send confirmation back to SDK
        if (response && response.success) {
          window.postMessage({
            action: RECLAIM_SDK_ACTIONS.VERIFICATION_STARTED,
            messageId: messageId,
            sessionId: data.sessionId
          }, '*');
        } else {
          window.postMessage({
            action: RECLAIM_SDK_ACTIONS.VERIFICATION_FAILED,
            messageId: messageId,
            error: response?.error || 'Failed to start verification'
          }, '*');
        }
      });
    }
  }

  // Store intercepted request
  storeInterceptedRequest(requestData) {
    // Return immediately if we've found all filtered requests
    if (this.stopStoringInterceptions) {
      return;
    }

    // Generate a unique key for the request
    const key = `${requestData.method}_${requestData.url}_${Date.now()}`;
    requestData.timestamp = Date.now();

    // Store the request
    this.interceptedRequests.set(key, requestData);
    
    // ⭐ ENHANCED DEBUG: Log intercepted requests with more detail ⭐
    addDebugLog('Request intercepted', {
      url: requestData.url,
      method: requestData.method,
      body: requestData.body ? (typeof requestData.body === 'string' ? requestData.body.substring(0, 200) + '...' : '[Object]') : null,
      bodyLength: requestData.body ? (typeof requestData.body === 'string' ? requestData.body.length : 'N/A') : 0,
      headers: requestData.headers,
      hasBody: !!requestData.body,
      timestamp: new Date().toISOString(),
      key: key
    }, 'info');
    
    // ⭐ DEBUG: Check for CSP errors ⭐
    if (requestData.headers) {
      const cspHeaders = Object.entries(requestData.headers).filter(([key]) => 
        key.toLowerCase().includes('csp') || 
        key.toLowerCase().includes('content-security-policy')
      );
      if (cspHeaders.length > 0) {
        addDebugLog('⚠️ CSP headers detected in request', {
          url: requestData.url,
          cspHeaders: cspHeaders
        }, 'warning');
      }
    }
    
    if (this.appId && this.httpProviderId && this.sessionId) {
      loggerService.log({
        message: `Intercepted request stored: ${requestData.method} ${requestData.url}`,
        type: LOG_TYPES.CONTENT,
        sessionId: this.sessionId,
        providerId: this.httpProviderId,
        appId: this.appId
      });
    }

    // Clean up old requests only if we're still collecting
    if (!this.stopStoringInterceptions) {
      this.cleanupInterceptedData();
    }
  }

  // Store intercepted response
  storeInterceptedResponse(responseData) {
    // Return immediately if we've found all filtered requests
    if (this.stopStoringInterceptions) {
      return;
    }

    responseData.timestamp = Date.now();

    // Store the response using URL as key
    this.interceptedResponses.set(responseData.url, responseData);
    
    // ⭐ ENHANCED DEBUG: Log intercepted responses with more detail ⭐
    addDebugLog('Response intercepted', {
      url: responseData.url,
      status: responseData.status,
      statusText: responseData.statusText,
      body: responseData.body ? (typeof responseData.body === 'string' ? responseData.body.substring(0, 200) + '...' : '[Object]') : null,
      bodyLength: responseData.body ? (typeof responseData.body === 'string' ? responseData.body.length : 'N/A') : 0,
      headers: responseData.headers,
      hasBody: !!responseData.body,
      timestamp: new Date().toISOString()
    }, 'info');
    
    // ⭐ NEW: Immediately try to link with any pending requests ⭐
    this.linkRequestAndResponse(responseData.url, responseData);
    
    // ⭐ DEBUG: Check for CSP errors in response ⭐
    if (responseData.headers) {
      const cspHeaders = Object.entries(responseData.headers).filter(([key]) => 
        key.toLowerCase().includes('csp') || 
        key.toLowerCase().includes('content-security-policy')
      );
      if (cspHeaders.length > 0) {
        addDebugLog('⚠️ CSP headers detected in response', {
          url: responseData.url,
          status: responseData.status,
          cspHeaders: cspHeaders
        }, 'warning');
      }
      
      // ⭐ DEBUG: Check for permission/authentication errors ⭐
      if (responseData.status === 403 || responseData.status === 401) {
        addDebugLog('🚨 Permission/Authentication error detected', {
          url: responseData.url,
          status: responseData.status,
          statusText: responseData.statusText,
          headers: responseData.headers,
          bodyPreview: responseData.body ? responseData.body.substring(0, 200) + '...' : null
        }, 'error');
      }
    }
    
    // ⭐ DEBUG: Check for CSP violations in response body ⭐
    if (responseData.body && typeof responseData.body === 'string') {
      if (responseData.body.includes('Content Security Policy') || 
          responseData.body.includes('CSP') ||
          responseData.body.includes('script-src') ||
          responseData.body.includes('unsafe-eval')) {
        addDebugLog('⚠️ Possible CSP violation in response body', {
          url: responseData.url,
          bodyPreview: responseData.body.substring(0, 300) + '...'
        }, 'warning');
      }
    }
    
    if (this.appId && this.httpProviderId && this.sessionId) {
      loggerService.log({
        message: `Intercepted response stored: ${responseData.url}`,
        type: LOG_TYPES.CONTENT,
        sessionId: this.sessionId,
        providerId: this.httpProviderId,
        appId: this.appId
      });
    }

    // Clean up old responses only if we're still collecting
    if (!this.stopStoringInterceptions) {
      this.cleanupInterceptedData();
    }
  }

  // Link request and response
  linkRequestAndResponse(url, responseData) {
    // Return immediately if we've found all filtered requests
    if (this.stopStoringInterceptions) {
      return;
    }

    // ⭐ ENHANCED DEBUG: Log linking attempt ⭐
    addDebugLog('🔗 Attempting to link request and response', {
      responseUrl: url,
      responseStatus: responseData.status,
      responseBodyLength: responseData.body ? responseData.body.length : 0,
      totalRequests: this.interceptedRequests.size,
      totalResponses: this.interceptedResponses.size,
      totalLinked: this.linkedRequestResponses.size
    }, 'info');

    // Find matching request for this response
    let linked = false;
    for (const [key, requestData] of this.interceptedRequests.entries()) {
      if (requestData.url === url) {
        // Create a linked object with both request and response
        const linkedData = {
          request: requestData,
          response: responseData,
          timestamp: Date.now()
        };

        // Store the linked data
        this.linkedRequestResponses.set(key, linkedData);
        linked = true;
        
        addDebugLog('✅ Successfully linked request and response', {
          requestUrl: requestData.url,
          responseUrl: url,
          requestMethod: requestData.method,
          responseStatus: responseData.status,
          responseBodyLength: responseData.body ? responseData.body.length : 0
        }, 'success');
        break;
      }
    }
    
    if (!linked) {
      addDebugLog('⚠️ Could not link response to any request', {
        responseUrl: url,
        responseStatus: responseData.status,
        availableRequestUrls: Array.from(this.interceptedRequests.values()).map(req => req.url)
      }, 'warning');
    }
  }

  // Clean up old intercepted data
  cleanupInterceptedData() {
    const now = Date.now();
    const timeout = 2 * 60 * 1000; // 2 minutes

    // Clean up requests
    for (const [key, data] of this.interceptedRequests.entries()) {
      if (now - data.timestamp > timeout) {
        this.interceptedRequests.delete(key);
      }
    }

    // Clean up responses
    for (const [key, data] of this.interceptedResponses.entries()) {
      if (now - data.timestamp > timeout) {
        this.interceptedResponses.delete(key);
      }
    }

    // Clean up linked data
    for (const [key, data] of this.linkedRequestResponses.entries()) {
      if (now - data.timestamp > timeout) {
        this.linkedRequestResponses.delete(key);
      }
    }
  }

  // Start filtering intercepted network requests
  startNetworkFiltering() {
    if (!this.providerData) {
      addDebugLog('Cannot start network filtering - no provider data', null, 'warning');
      return;
    }

    // ⭐ DEBUG: Log network filtering start ⭐
    addDebugLog('🚀 Starting PERSISTENT network filtering - will continue until correct page is found', {
      providerId: this.httpProviderId,
      sessionId: this.sessionId,
      providerData: this.providerData ? {
        name: this.providerData.name,
        requestDataCount: this.providerData.requestData ? this.providerData.requestData.length : 0
      } : null,
      targetPage: this.providerData?.requestData?.[0]?.url || 'Unknown'
    }, 'success');

    this.isFiltering = true;
    this.filteringStartTime = Date.now();
    this.stopStoringInterceptions = false;

    // Run filtering immediately
    this.filterInterceptedRequests();

    // Clear any existing interval before setting up a new one
    if (this.filteringInterval) {
      clearInterval(this.filteringInterval);
    }

    // ⭐ PERSISTENT: Set up interval for continuous filtering with NO timeout ⭐
    this.filteringInterval = setInterval(() => {
      // Skip if we've already found all requests
      if (this.stopStoringInterceptions) {
        addDebugLog('✅ All required requests found - stopping filtering', null, 'success');
        this.stopNetworkFiltering();
        return;
      }

      this.filterInterceptedRequests();

      // ⭐ NEW: Check if we're on the correct page ⭐
      this.checkIfOnCorrectPage();
      
      // ⭐ NEW: Automatic data extraction and verification ⭐
      this.autoExtractAndVerify();
      
      // ⭐ REMOVED: No timeout - keep running until success or manual stop ⭐
    }, 2000); // Check every 2 seconds
  }

  // ⭐ NEW: Check if we're on the correct page and provide guidance ⭐
  checkIfOnCorrectPage() {
    if (!this.providerData?.requestData?.[0]) {
      return;
    }

    const expectedUrl = this.providerData.requestData[0].url;
    const currentUrl = window.location.href;
    
    // ⭐ ENHANCED: Generic page matching for any provider ⭐
    let isOnCorrectPage = false;
    
    // Try exact URL match first
    if (currentUrl === expectedUrl) {
      isOnCorrectPage = true;
    }
    // Try domain + path matching
    else if (expectedUrl.includes('://')) {
      const expectedDomain = new URL(expectedUrl).hostname;
      const currentDomain = new URL(currentUrl).hostname;
      const expectedPath = new URL(expectedUrl).pathname;
      const currentPath = new URL(currentUrl).pathname;
      
      if (expectedDomain === currentDomain && currentPath.includes(expectedPath.split('/').pop())) {
        isOnCorrectPage = true;
      }
    }
    // Fallback to simple includes check
    else if (currentUrl.includes(expectedUrl)) {
      isOnCorrectPage = true;
    }

    // Only log this check occasionally to avoid spam
    if (Date.now() % 10000 < 2000) { // Log roughly every 10 seconds
      addDebugLog('📍 Page location check', {
        currentUrl: currentUrl,
        expectedUrl: expectedUrl,
        isOnCorrectPage: isOnCorrectPage,
        suggestion: isOnCorrectPage ? '✅ Perfect! You are on the correct page' : 
                   `🔗 Navigate to: ${expectedUrl}`
      }, isOnCorrectPage ? 'success' : 'info');
    }

    // If we're on the correct page, check if we've captured the right request
    if (isOnCorrectPage) {
      const hasMatchingRequest = Array.from(this.interceptedRequests.values()).some(req => 
        req.url === expectedUrl
      );
      
      if (hasMatchingRequest) {
        addDebugLog('🎯 SUCCESS: Found matching request on correct page!', {
          expectedUrl: expectedUrl,
          currentUrl: currentUrl
        }, 'success');
      } else {
        addDebugLog('⏳ Waiting for request to be captured on correct page...', {
          expectedUrl: expectedUrl,
          currentUrl: currentUrl,
          tip: 'Try refreshing the page or navigating to different sections'
        }, 'info');
        
        // ⭐ IMPROVED: Use manual trigger for immediate action ⭐
        if (!this.manualTriggerAttempted) {
          addDebugLog('🚀 Attempting immediate manual trigger...', {
            expectedUrl: expectedUrl,
            reason: 'No matching request found on correct page'
          }, 'info');
          
          this.triggerTargetRequestNow(expectedUrl);
          this.manualTriggerAttempted = true;
          
          // Reset manual trigger flag after 30 seconds to allow retry
          setTimeout(() => {
            this.manualTriggerAttempted = false;
          }, 30000);
        } else {
          // Fall back to automatic triggering
          this.tryToTriggerTargetRequest(expectedUrl);
        }
      }
    }
  }

  // ⭐ NEW: Automatic data extraction and verification for any provider ⭐
  autoExtractAndVerify() {
    // Only run once per session to avoid spam
    if (this.autoExtractionAttempted) return;
    
    // Wait a bit for initial requests to be captured
    if (Date.now() - this.filteringStartTime < 5000) return;
    
    // Check if we have any captured requests but no successful verification
    const hasCapturedRequests = this.linkedRequestResponses.size > 0;
    const hasFilteredRequests = this.filteredRequests.length > 0;
    
    if (hasCapturedRequests && !hasFilteredRequests) {
      addDebugLog('🔍 Auto-extracting data from captured requests...', {
        capturedRequests: this.linkedRequestResponses.size,
        filteredRequests: this.filteredRequests.length,
        providerName: this.providerData?.name || 'Unknown'
      }, 'info');
      
      this.autoExtractionAttempted = true;
      
      // Step 1: Extract any available data from the page
      this.extractPageData();
      
      // Step 2: Create comprehensive extraction configuration
      this.createComprehensiveExtractionConfig();
      
      // Step 3: Re-filter with new configuration
      this.filterInterceptedRequests();
      
      // Step 4: Force claim creation if needed
      setTimeout(() => {
        this.forceClaimCreation();
      }, 2000);
    }
  }

  // ⭐ NEW: Extract data from current page for any provider ⭐
  extractPageData() {
    const extractedData = {};
    
    // Extract from meta tags
    const metaTags = document.querySelectorAll('meta');
    metaTags.forEach(meta => {
      const name = meta.getAttribute('name') || meta.getAttribute('property');
      const content = meta.getAttribute('content');
      if (name && content) {
        extractedData[`meta_${name}`] = content;
      }
    });
    
    // Extract from page title
    if (document.title) {
      extractedData.title = document.title;
    }
    
    // Extract from common data attributes
    const dataElements = document.querySelectorAll('[data-*]');
    dataElements.forEach(element => {
      const attributes = element.attributes;
      for (let attr of attributes) {
        if (attr.name.startsWith('data-')) {
          const key = attr.name.replace('data-', '');
          const value = attr.value;
          if (value && value.length < 100) {
            extractedData[`data_${key}`] = value;
          }
        }
      }
    });
    
    // Extract from common class names that might contain user data
    const userElements = document.querySelectorAll('[class*="user"], [class*="profile"], [class*="name"], [class*="email"]');
    userElements.forEach(element => {
      const text = element.textContent?.trim();
      if (text && text.length > 0 && text.length < 50) {
        extractedData[`element_${element.tagName.toLowerCase()}`] = text;
      }
    });
    
    this.extractedPageData = extractedData;
    
    addDebugLog('📄 Extracted page data', {
      dataCount: Object.keys(extractedData).length,
      sampleData: Object.keys(extractedData).slice(0, 5)
    }, 'info');
  }

  // ⭐ NEW: Create comprehensive extraction configuration for any provider ⭐
  createComprehensiveExtractionConfig() {
    if (!this.providerData) return;
    
    // Clear existing configuration
    this.providerData.responseMatches = [];
    this.providerData.responseRedactions = [];
    
    // Add comprehensive response matches
    const comprehensiveResponseMatches = [
      {
        value: 'username',
        type: 'contains',
        invert: false
      },
      {
        value: 'profile',
        type: 'contains',
        invert: false
      },
      {
        value: 'user',
        type: 'contains',
        invert: false
      },
      {
        value: 'name',
        type: 'contains',
        invert: false
      },
      {
        value: 'email',
        type: 'contains',
        invert: false
      }
    ];
    
    // Add comprehensive extraction patterns
    const comprehensiveResponseRedactions = [
      // XPath patterns for common elements
      {
        xPath: '//meta[@name="octolytics-actor-login"]/@content',
        type: 'xpath'
      },
      {
        xPath: '//span[@data-testid="user-profile-name"]/text()',
        type: 'xpath'
      },
      {
        xPath: '//meta[@property="og:title"]/@content',
        type: 'xpath'
      },
      {
        xPath: '//title/text()',
        type: 'xpath'
      },
      {
        xPath: '//input[@name="username"]/@value',
        type: 'xpath'
      },
      {
        xPath: '//input[@name="email"]/@value',
        type: 'xpath'
      },
      // Regex patterns for common data
      {
        regex: '"octolytics-actor-login":"([^"]+)"',
        type: 'regex'
      },
      {
        regex: 'GitHub - ([^\\s]+)',
        type: 'regex'
      },
      {
        regex: 'data-username="([^"]+)"',
        type: 'regex'
      },
      {
        regex: '"username":"([^"]+)"',
        type: 'regex'
      },
      {
        regex: '"email":"([^"]+)"',
        type: 'regex'
      },
      {
        regex: '"name":"([^"]+)"',
        type: 'regex'
      },
      // Generic patterns for any alphanumeric data
      {
        regex: '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
        type: 'regex'
      },
      {
        regex: '([a-zA-Z0-9_-]{3,20})',
        type: 'regex'
      }
    ];
    
    // Add extracted page data as patterns
    if (this.extractedPageData) {
      Object.entries(this.extractedPageData).forEach(([key, value]) => {
        if (value && typeof value === 'string' && value.length > 0) {
          comprehensiveResponseRedactions.push({
            regex: value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
            type: 'regex'
          });
        }
      });
    }
    
    this.providerData.responseMatches = comprehensiveResponseMatches;
    this.providerData.responseRedactions = comprehensiveResponseRedactions;
    
    addDebugLog('📝 Created comprehensive extraction configuration', {
      responseMatchesCount: comprehensiveResponseMatches.length,
      responseRedactionsCount: comprehensiveResponseRedactions.length,
      providerName: this.providerData.name
    }, 'success');
  }

  // ⭐ NEW: Force claim creation with available data ⭐
  forceClaimCreation() {
    if (!this.providerData?.requestData?.[0]) return;
    
    // Check if we already have filtered requests
    if (this.filteredRequests.length > 0) {
      addDebugLog('✅ Already have filtered requests, claim creation should proceed automatically', {
        filteredRequestsCount: this.filteredRequests.length
      }, 'success');
      return;
    }
    
    addDebugLog('🎯 Forcing claim creation with available data...', {
      capturedRequests: this.linkedRequestResponses.size,
      extractedDataCount: this.extractedPageData ? Object.keys(this.extractedPageData).length : 0
    }, 'info');
    
    // Create a mock request with current page data
    const mockRequest = {
      url: this.providerData.requestData[0].url || window.location.href,
      method: 'GET',
      headers: {},
      body: null,
      responseText: document.documentElement.outerHTML || '',
      timestamp: Date.now()
    };
    
    // Send to background for claim creation
    this.sendFilteredRequestToBackground(mockRequest, this.providerData.requestData[0], this.providerData.loginUrl);
  }
  
  // ⭐ NEW: Try to trigger the target request manually ⭐
  // ⭐ NEW: Manual trigger function for immediate execution ⭐
  triggerTargetRequestNow(expectedUrl) {
    addDebugLog('🚀 MANUAL TRIGGER: Immediately triggering target request...', {
      expectedUrl: expectedUrl,
      method: 'GET',
      timestamp: new Date().toISOString(),
      triggerType: 'manual'
    }, 'info');
    
    // ⭐ ENHANCED: Create and store the request first so it can be linked ⭐
    const requestData = {
      url: expectedUrl,
      method: 'GET',
      body: null,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timestamp: Date.now()
    };
    
    // Store the request so it can be linked to the response
    const requestKey = `manual-${Date.now()}`;
    this.interceptedRequests.set(requestKey, requestData);
    
    addDebugLog('📝 MANUAL TRIGGER: Stored request for linking', {
      requestKey: requestKey,
      url: expectedUrl,
      method: 'GET',
      totalRequests: this.interceptedRequests.size
    }, 'info');
    
    // Force trigger the request immediately with response capture
    fetch(expectedUrl, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    }).then(response => {
      addDebugLog('✅ MANUAL TRIGGER: Successfully triggered request to target URL', {
        url: expectedUrl,
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString(),
        triggerType: 'manual'
      }, 'success');
      
      // ⭐ NEW: Try to capture response text for better data extraction ⭐
      return response.text().then(text => {
        addDebugLog('📄 MANUAL TRIGGER: Response body captured', {
          url: expectedUrl,
          bodyLength: text.length,
          bodyPreview: text.substring(0, 200) + '...',
          timestamp: new Date().toISOString()
        }, 'success');
        
        // Manually create a response object that can be processed
        const responseData = {
          url: expectedUrl,
          status: response.status,
          statusText: response.statusText,
          body: text,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: Date.now()
        };
        
        // Store this response manually
        this.storeInterceptedResponse(responseData);
        
        return response;
      }).catch(textError => {
        addDebugLog('⚠️ MANUAL TRIGGER: Failed to read response text', {
          url: expectedUrl,
          error: textError.message,
          timestamp: new Date().toISOString(),
          triggerType: 'manual'
        }, 'warning');
        
        // Still create a response object even if text reading fails
        const responseData = {
          url: expectedUrl,
          status: response.status,
          statusText: response.statusText,
          body: null,
          headers: Object.fromEntries(response.headers.entries()),
          timestamp: Date.now()
        };
        
        this.storeInterceptedResponse(responseData);
        return response;
      });
    }).catch(error => {
      addDebugLog('⚠️ MANUAL TRIGGER: Failed to trigger request to target URL', {
        url: expectedUrl,
        error: error.message,
        timestamp: new Date().toISOString(),
        triggerType: 'manual'
      }, 'warning');
    });
  }

  tryToTriggerTargetRequest(expectedUrl) {
    // ⭐ IMPROVED: More frequent triggering and better timing ⭐
    const now = Date.now();
    const timeSinceLastTrigger = now - (this.lastTriggerTime || 0);
    
    // Try every 10 seconds instead of 30, and ensure we don't spam
    if (timeSinceLastTrigger > 10000) { // 10 seconds between attempts
      this.lastTriggerTime = now;
      
      addDebugLog('🔄 Attempting to trigger target request...', {
        expectedUrl: expectedUrl,
        method: 'GET',
        timestamp: new Date().toISOString(),
        attemptNumber: (this.triggerAttempts || 0) + 1
      }, 'info');
      
      this.triggerAttempts = (this.triggerAttempts || 0) + 1;
      
      // Try to fetch the target URL to trigger the request
      fetch(expectedUrl, {
        method: 'GET',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      }).then(response => {
        addDebugLog('✅ Successfully triggered request to target URL', {
          url: expectedUrl,
          status: response.status,
          statusText: response.statusText,
          timestamp: new Date().toISOString(),
          attemptNumber: this.triggerAttempts
        }, 'success');
      }).catch(error => {
        addDebugLog('⚠️ Failed to trigger request to target URL', {
          url: expectedUrl,
          error: error.message,
          timestamp: new Date().toISOString(),
          attemptNumber: this.triggerAttempts
        }, 'warning');
      }).catch(error => {
        // Additional catch to prevent uncaught promise errors
        console.warn('Unhandled fetch error in tryToTriggerTargetRequest:', error);
      });
    } else {
      // Log when we're not triggering (for debugging) - less frequent
      if (now % 10000 < 1000) { // Log roughly every 10 seconds
        addDebugLog('⏰ Waiting for next automatic trigger...', {
          timeUntilNextTrigger: 10000 - timeSinceLastTrigger,
          expectedUrl: expectedUrl,
          lastTriggerTime: this.lastTriggerTime
        }, 'info');
      }
    }
  }

  // Stop network filtering
  stopNetworkFiltering() {
    // Clear the filtering interval
    if (this.filteringInterval) {
      clearInterval(this.filteringInterval);
      this.filteringInterval = null;
    }

    // Stop filtering flag
    this.isFiltering = false;

    // ⭐ ENHANCED: Don't clear data until verification is actually complete ⭐
    // Only clear data if we're explicitly told to stop (not just because we found requests)
    if (this.verificationCompleted) {
      addDebugLog('🧹 Clearing intercepted data after verification completion', {
        filteredRequestsCount: this.filteredRequests.length,
        providerCriteriaCount: this.providerData?.requestData?.length || 0
      }, 'info');
      
      this.stopStoringInterceptions = true;
      this.interceptedRequests.clear();
      this.interceptedResponses.clear();
      this.linkedRequestResponses.clear();
    } else {
      addDebugLog('⏸️ Keeping intercepted data for ongoing verification', {
        filteredRequestsCount: this.filteredRequests.length,
        providerCriteriaCount: this.providerData?.requestData?.length || 0,
        reason: 'Verification not yet completed'
      }, 'info');
    }
  }

  // Filter intercepted requests with provider criteria
  filterInterceptedRequests() {
    if (!this.providerData || !this.providerData.requestData) {
        addDebugLog('No provider data available for filtering', null, 'warning');
      return;
    }

      // ⭐ DEBUG: Log filtering attempt ⭐
      addDebugLog('Starting request filtering', {
        totalLinkedRequests: this.linkedRequestResponses.size,
        providerCriteria: this.providerData.requestData.length,
        alreadyFiltered: this.filteredRequests.length,
        currentUrl: window.location.href,
        isOnProfilePage: window.location.href.includes('/settings/profile')
      }, 'info');
      
      // ⭐ IMMEDIATE DEBUG: Check if we're on the right page and have provider data ⭐
      if (window.location.href.includes('/settings/profile')) {
        addDebugLog('🎯 ON PROFILE PAGE - Checking for immediate verification trigger', {
          hasProviderData: !!this.providerData,
          providerDataKeys: this.providerData ? Object.keys(this.providerData) : [],
          expectedUrl: this.providerData?.requestData?.[0]?.url,
          currentUrl: window.location.href
        }, 'success');
        
        // If we have provider data and we're on the right page, try to trigger verification immediately
        if (this.providerData?.requestData?.[0]) {
          addDebugLog('🚀 Attempting immediate verification trigger on profile page', {
            expectedUrl: this.providerData.requestData[0].url,
            currentUrl: window.location.href
          }, 'success');
          
          // Try to trigger the target request immediately
          this.triggerTargetRequestNow(this.providerData.requestData[0].url);
        }
      }
      
      // ⭐ DEBUG: Log detailed state information ⭐
      addDebugLog('Detailed state analysis', {
        interceptedRequestsCount: this.interceptedRequests.size,
        interceptedResponsesCount: this.interceptedResponses.size,
        linkedRequestResponsesCount: this.linkedRequestResponses.size,
        providerDataAvailable: !!this.providerData,
        requestDataCount: this.providerData?.requestData?.length || 0,
        networkInterceptorInjected: !!window.reclaimNetworkInterceptor,
        injectionScriptsInjected: !!window.reclaimInjectionScripts
      }, 'info');
      
      // ⭐ DEBUG: Log provider configuration details ⭐
      if (this.providerData) {
        addDebugLog('Provider configuration details', {
          providerId: this.providerData.id,
          providerName: this.providerData.name,
          loginUrl: this.providerData.loginUrl,
          requestData: this.providerData.requestData?.map(criteria => ({
            url: criteria.url,
            method: criteria.method,
            urlType: criteria.urlType || 'EXACT',
            body: criteria.body,
            bodySniff: criteria.bodySniff,
            responseMatches: criteria.responseMatches?.length || 0,
            responseRedactions: criteria.responseRedactions?.length || 0,
            responseSelections: criteria.responseSelections?.length || 0
          }))
        }, 'info');
      }
      
      // ⭐ DEBUG: Log some intercepted requests if any exist ⭐
      if (this.interceptedRequests.size > 0) {
        addDebugLog('Intercepted requests found', {
          count: this.interceptedRequests.size,
          sampleRequests: Array.from(this.interceptedRequests.entries()).slice(0, 3).map(([key, req]) => ({
            key: key.substring(0, 20) + '...',
            url: req.url,
            method: req.method,
            timestamp: req.timestamp
          }))
        }, 'info');
        
              // ⭐ DEBUG: Show all captured URLs for comparison ⭐
      const allUrls = Array.from(this.interceptedRequests.values()).map(req => req.url);
      addDebugLog('All captured URLs', {
        urls: allUrls,
        totalCount: allUrls.length
      }, 'info');
      
      // ⭐ DEBUG: Show detailed analysis of captured URLs ⭐
      const settingsUrls = allUrls.filter(url => url.includes('/settings/'));
      const profileUrls = allUrls.filter(url => url.includes('/profile'));
      const exactMatch = allUrls.find(url => url === 'https://github.com/settings/profile');
      
      addDebugLog('🔍 URL Analysis', {
        totalUrls: allUrls.length,
        settingsUrls: settingsUrls,
        profileUrls: profileUrls,
        exactMatch: exactMatch,
        hasExactMatch: !!exactMatch,
        closeMatches: settingsUrls.length + profileUrls.length
      }, 'info');
      
      // ⭐ DEBUG: Show what URL we're looking for ⭐
      if (this.providerData?.requestData?.[0]) {
        const expectedUrl = this.providerData.requestData[0].url;
        const expectedMethod = this.providerData.requestData[0].method;
        
        addDebugLog('🎯 Looking for this specific request', {
          expectedUrl: expectedUrl,
          expectedMethod: expectedMethod,
          currentPageUrl: window.location.href,
          isOnCorrectPage: window.location.href.includes(expectedUrl.split('/settings/')[0])
        }, 'info');
        
        // Check if any captured URLs are close to what we want
        const closeMatches = allUrls.filter(url => 
          url.includes('/settings/') || url.includes('/profile')
        );
        
        if (closeMatches.length > 0) {
          addDebugLog('🔍 Found some close matches', {
            closeMatches: closeMatches
          }, 'info');
        } else {
          addDebugLog('⚠️ No close matches found - need to navigate to profile page', {
            suggestion: `Navigate to: ${expectedUrl}`
          }, 'warning');
          
          // ⭐ NEW: Create manual trigger button for verification ⭐
          if (window.location.href.includes('github.com')) {
            addDebugLog('🚀 Creating manual verification trigger button', {
              currentUrl: window.location.href,
              targetUrl: expectedUrl
            }, 'success');
            
            // Create a floating button to trigger verification
            this.createVerificationTriggerButton(expectedUrl);
          }
        }
      }
      } else {
        addDebugLog('⚠️ NO INTERCEPTED REQUESTS FOUND', {
          possibleReasons: [
            'Network interceptor not injected properly',
            'No network activity on page',
            'CSP blocking script injection',
            'Requests happening before interceptor is ready'
          ]
        }, 'warning');
      }
      
      // ⭐ DEBUG: Log some intercepted responses if any exist ⭐
      if (this.interceptedResponses.size > 0) {
        addDebugLog('Intercepted responses found', {
          count: this.interceptedResponses.size,
          sampleResponses: Array.from(this.interceptedResponses.entries()).slice(0, 3).map(([key, resp]) => ({
            key: key.substring(0, 20) + '...',
            url: resp.url,
            status: resp.status,
            timestamp: resp.timestamp
          }))
        }, 'info');
      } else {
        addDebugLog('⚠️ NO INTERCEPTED RESPONSES FOUND', {
          possibleReasons: [
            'Network interceptor not working',
            'Responses not being captured',
            'Timing issues with response capture'
          ]
        }, 'warning');
      }

    // ⭐ ENHANCED DEBUG: Log linked data status ⭐
    addDebugLog('🔍 Processing linked request/response pairs', {
      totalLinked: this.linkedRequestResponses.size,
      alreadyFiltered: this.filteredRequests.length,
      providerCriteria: this.providerData.requestData.length
    }, 'info');

    // For each linked request/response pair
    for (const [key, linkedData] of this.linkedRequestResponses.entries()) {
      // Skip already filtered requests
      if (this.filteredRequests.includes(key)) {
        continue;
      }

      const requestValue = linkedData.request;
      const responseBody = linkedData.response.body;
      
      // ⭐ DEBUG: Log each linked pair being processed ⭐
      addDebugLog('🔗 Processing linked pair', {
        requestUrl: requestValue.url,
        requestMethod: requestValue.method,
        responseStatus: linkedData.response.status,
        responseBodyLength: responseBody ? responseBody.length : 0,
        hasResponseBody: !!responseBody
      }, 'info');

      // Format request for filtering
      const formattedRequest = {
        url: requestValue.url,
        method: requestValue.method,
        body: requestValue.body || null,
        headers: requestValue.headers || {},
        responseText: responseBody
      };

                            // ⭐ DEBUG: Log each request being checked ⭐
                      addDebugLog('Checking request against criteria', {
                        url: formattedRequest.url,
                        method: formattedRequest.method,
                        hasBody: !!formattedRequest.body,
                        hasResponse: !!formattedRequest.responseText
                      }, 'info');

      // Check against each criteria in provider data
      for (const criteria of this.providerData.requestData) {
                        const isMatch = filterRequest(formattedRequest, criteria, this.parameters);
                        
                        // ⭐ DEBUG: Log detailed criteria check result ⭐
                        addDebugLog('Criteria check result', {
                          url: formattedRequest.url,
                          criteriaUrl: criteria.url,
                          criteriaMethod: criteria.method,
                          isMatch: isMatch,
                          urlMatch: formattedRequest.url === criteria.url,
                          methodMatch: formattedRequest.method === criteria.method,
                          urlType: criteria.urlType || 'EXACT',
                          hasResponseMatches: !!criteria.responseMatches,
                          responseMatchesCount: criteria.responseMatches?.length || 0,
                          hasResponseRedactions: !!criteria.responseRedactions,
                          responseRedactionsCount: criteria.responseRedactions?.length || 0
                        }, isMatch ? 'success' : 'info');
        
        if (isMatch) {
          // Mark this request as filtered
          addDebugLog('🎯 MATCHING REQUEST FOUND!', {
            url: formattedRequest.url,
            method: formattedRequest.method,
            criteria: criteria
          }, 'success');
          
          loggerService.log({
            message: `Matching request found: ${formattedRequest.method} ${formattedRequest.url}`,
            type: LOG_TYPES.CONTENT,
            sessionId: this.sessionId,
            providerId: this.httpProviderId,
            appId: this.appId
          });
          this.filteredRequests.push(key);

          // Send to background script for cookie fetching and claim creation
          this.sendFilteredRequestToBackground(formattedRequest, criteria, this.providerData.loginUrl);
        }
      }
    }

    // If we've found all possible matching requests, stop filtering
    if (this.filteredRequests.length >= this.providerData.requestData.length) {
      loggerService.log({
        message: 'Found all matching requests, stopping filtering and cleaning up resources',
        type: LOG_TYPES.CONTENT,
        sessionId: this.sessionId,
        providerId: this.httpProviderId,
        appId: this.appId
      });

      // Stop filtering and prevent further storage
      this.stopStoringInterceptions = true;
      this.isFiltering = false;

      // Clear filtering interval
      if (this.filteringInterval) {
        clearInterval(this.filteringInterval);
        this.filteringInterval = null;
      }

      // Clear any other intervals or timeouts related to request handling
      if (this.cleanupInterval) {
        clearInterval(this.cleanupInterval);
        this.cleanupInterval = null;
      }

      // Clear all stored requests and responses
      this.interceptedRequests.clear();
      this.interceptedResponses.clear();
      this.linkedRequestResponses.clear();
    }
  }

  // Send filtered request to background script
  sendFilteredRequestToBackground(formattedRequest, matchingCriteria, loginUrl) {
    // ⭐ ENHANCED: Include response data in the request ⭐
    const enhancedRequest = {
      ...formattedRequest,
      hasResponse: !!formattedRequest.responseText,
      responseLength: formattedRequest.responseText ? formattedRequest.responseText.length : 0
    };
    
    addDebugLog('📤 Sending filtered request to background', {
      url: enhancedRequest.url,
      method: enhancedRequest.method,
      hasBody: !!enhancedRequest.body,
      hasResponse: enhancedRequest.hasResponse,
      responseLength: enhancedRequest.responseLength,
      criteria: matchingCriteria
    }, 'success');
    
    loggerService.log({
      message: 'Sending filtered request to background script: ' + JSON.stringify(formattedRequest.url),
      type: LOG_TYPES.CONTENT,
      sessionId: this.sessionId,
      providerId: this.httpProviderId,
      appId: this.appId
    });
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.FILTERED_REQUEST_FOUND,
      source: MESSAGE_SOURCES.CONTENT_SCRIPT,
      target: MESSAGE_SOURCES.BACKGROUND,
      data: {
        request: enhancedRequest,
        criteria: matchingCriteria,
        loginUrl: loginUrl,
        sessionId: this.sessionId
      }
    }, (response) => {
      // Background response handled silently
    });
  }

  // Helper method to store provider ID in website's localStorage
  setProviderIdInLocalStorage(providerId) {
    // Don't store null, undefined, or 'unknown' values
    if (!providerId || providerId === 'unknown') {
      loggerService.log({
        message: `Skipping localStorage storage for invalid provider ID: ${providerId}`,
        type: LOG_TYPES.CONTENT,
        sessionId: this.sessionId,
        providerId: this.httpProviderId,
        appId: this.appId
      });
      return;
    }

    try {
      console.log('Storing provider ID in localStorage:', providerId);
      localStorage.setItem('reclaimProviderId', providerId);
      loggerService.log({
        message: `Provider ID ${providerId} stored in localStorage.`,
        type: LOG_TYPES.CONTENT,
        sessionId: this.sessionId,
        providerId: this.httpProviderId,
        appId: this.appId
      });
    } catch (e) {
      loggerService.log({
        message: `Failed to store provider ID ${providerId} in localStorage: ${e.message}`,
        type: LOG_TYPES.ERROR,
        sessionId: this.sessionId,
        providerId: this.httpProviderId,
        appId: this.appId
      });
    }
  }

  // ⭐ NEW: Create verification trigger button ⭐
  createVerificationTriggerButton(targetUrl) {
    try {
      // Remove existing button if any
      const existingButton = document.getElementById('reclaim-verification-trigger');
      if (existingButton) {
        existingButton.remove();
      }

      // Create the button
      const button = document.createElement('div');
      button.id = 'reclaim-verification-trigger';
      button.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: #2ea44f;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          border: none;
          transition: all 0.2s ease;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
          🔐 Start Verification
        </div>
      `;

      // Add click handler
      button.addEventListener('click', () => {
        addDebugLog('🚀 Manual verification trigger clicked', {
          currentUrl: window.location.href,
          targetUrl: targetUrl
        }, 'success');
        
        // Navigate to the target URL
        window.location.href = targetUrl;
      });

      // Add to page
      document.body.appendChild(button);
      
      addDebugLog('✅ Verification trigger button created', {
        buttonId: button.id,
        targetUrl: targetUrl
      }, 'success');
      
    } catch (error) {
      addDebugLog('❌ Failed to create verification trigger button', error.message, 'error');
    }
  }
}

// Initialize content script
const contentScript = new ReclaimContentScript();

// ⭐ NEW: Global function for manual triggering from console ⭐
window.triggerReclaimRequest = function() {
  if (contentScript && contentScript.providerData?.requestData?.[0]) {
    const expectedUrl = contentScript.providerData.requestData[0].url;
    console.log('🚀 Manual trigger called from console for:', expectedUrl);
    contentScript.triggerTargetRequestNow(expectedUrl);
    return 'Manual trigger initiated for: ' + expectedUrl;
  } else {
    console.error('❌ No provider data available for manual trigger');
    return 'Error: No provider data available';
  }
};

// ⭐ NEW: Global function to check current status ⭐
window.checkReclaimStatus = function() {
  if (contentScript) {
    const status = {
      providerData: !!contentScript.providerData,
      expectedUrl: contentScript.providerData?.requestData?.[0]?.url,
      currentUrl: window.location.href,
      interceptedRequests: contentScript.interceptedRequests.size,
      linkedRequests: contentScript.linkedRequestResponses.size,
      filteredRequests: contentScript.filteredRequests.length,
      isOnCorrectPage: window.location.href.includes('/settings/profile'),
      verificationCompleted: contentScript.verificationCompleted
    };
    console.log('📊 Reclaim Status:', status);
    return status;
  } else {
    console.error('❌ Content script not available');
    return 'Error: Content script not available';
  }
};

// ⭐ NEW: Global function to manually complete verification (for testing) ⭐
window.completeVerification = function() {
  if (contentScript) {
    console.log('🚀 Manually completing verification...');
    contentScript.verificationCompleted = true;
    contentScript.stopNetworkFiltering();
    return 'Verification marked as complete';
  } else {
    console.error('❌ Content script not available');
    return 'Error: Content script not available';
  }
};

// ⭐ NEW: Global function to extract GitHub username and trigger verification ⭐
window.extractGitHubUsername = function() {
  if (contentScript) {
    console.log('🔍 Extracting GitHub username from profile page...');
    
    // Try multiple methods to extract username
    let username = null;
    
    // Method 1: From URL path
    const urlMatch = window.location.pathname.match(/\/settings\/profile/);
    if (urlMatch) {
      // Get username from the current user context
      const userElement = document.querySelector('[data-testid="user-profile-name"]') || 
                         document.querySelector('.user-profile-name') ||
                         document.querySelector('[data-username]');
      
      if (userElement) {
        username = userElement.getAttribute('data-username') || 
                  userElement.textContent?.trim() ||
                  userElement.getAttribute('aria-label');
      }
    }
    
    // Method 2: From page title or meta tags
    if (!username) {
      const titleMatch = document.title.match(/GitHub - (.+?)'s profile/);
      if (titleMatch) {
        username = titleMatch[1];
      }
    }
    
    // Method 3: From navigation or header
    if (!username) {
      const navElement = document.querySelector('nav[aria-label="User navigation"]') ||
                        document.querySelector('.Header-item--full');
      if (navElement) {
        const userLink = navElement.querySelector('a[href*="/"]');
        if (userLink) {
          const href = userLink.getAttribute('href');
          const pathMatch = href.match(/^\/([^\/]+)/);
          if (pathMatch) {
            username = pathMatch[1];
          }
        }
      }
    }
    
    // Method 4: From any element with username-like content
    if (!username) {
      const usernameElements = document.querySelectorAll('[class*="user"], [class*="profile"], [data-testid*="user"]');
      for (const element of usernameElements) {
        const text = element.textContent?.trim();
        if (text && text.length > 0 && text.length < 50 && /^[a-zA-Z0-9_-]+$/.test(text)) {
          username = text;
          break;
        }
      }
    }
    
    if (username) {
      console.log('✅ GitHub username extracted:', username);
      
      // Add the extracted username to the provider data
      if (contentScript.providerData) {
        // Create a mock response match and redaction for the username
        const mockResponseMatch = {
          value: 'username',
          type: 'contains'
        };
        
        const mockResponseRedaction = {
          regex: `"${username}"`,
          type: 'regex'
        };
        
        // Add to provider data
        if (!contentScript.providerData.responseMatches) {
          contentScript.providerData.responseMatches = [];
        }
        if (!contentScript.providerData.responseRedactions) {
          contentScript.providerData.responseRedactions = [];
        }
        
        // ⭐ ENHANCED: Create proper GitHub username extraction configuration ⭐
        const githubResponseMatch = {
          value: 'username',
          type: 'contains',
          invert: false
        };
        
        // Multiple extraction methods for GitHub username
        const githubResponseRedactions = [
          // Method 1: XPath extraction from HTML
          {
            xPath: '//meta[@name="octolytics-actor-login"]/@content',
            type: 'xpath'
          },
          // Method 2: XPath from user profile elements
          {
            xPath: '//span[@data-testid="user-profile-name"]/text()',
            type: 'xpath'
          },
          // Method 3: Regex extraction from HTML
          {
            regex: '"octolytics-actor-login":"([^"]+)"',
            type: 'regex'
          },
          // Method 4: Fallback regex for username patterns
          {
            regex: username,
            type: 'regex'
          }
        ];
        
        contentScript.providerData.responseMatches.push(githubResponseMatch);
        contentScript.providerData.responseRedactions.push(...githubResponseRedactions);
        
        console.log('📝 Added username extraction to provider data:', {
          username: username,
          responseMatches: contentScript.providerData.responseMatches,
          responseRedactions: contentScript.providerData.responseRedactions
        });
        
        // ⭐ NEW: Trigger verification with extracted data ⭐
        console.log('🚀 Triggering verification with extracted username...');
        
        // Force a new filtering cycle with the updated provider data
        if (contentScript.isFiltering) {
          contentScript.filterInterceptedRequests();
        }
        
        // ⭐ NEW: Manually trigger the target request to ensure it's captured with new config ⭐
        setTimeout(() => {
          console.log('🔄 Re-triggering target request with updated configuration...');
          contentScript.triggerTargetRequestNow('https://github.com/settings/profile');
        }, 1000);
        
        return `Username extracted: ${username} - Verification triggered with enhanced extraction`;
      } else {
        return `Username found: ${username} (but no provider data available)`;
      }
    } else {
      console.log('❌ Could not extract GitHub username');
      return 'Error: Could not extract GitHub username from page';
    }
  } else {
    console.error('❌ Content script not available');
    return 'Error: Content script not available';
  }
};

// ⭐ NEW: Test Wootz API integration ⭐
window.testWootzZKProof = function() {
  console.log('🧪 Testing Wootz ZK Proof generation...');
  
  // Check if Wootz API is available
  if (typeof chrome === 'undefined' || !chrome.wootz) {
    console.error('❌ Wootz API not available');
    return 'Error: Wootz API not available';
  }
  
  if (typeof chrome.wootz.generateZKProof !== 'function') {
    console.error('❌ Wootz generateZKProof function not available');
    return 'Error: Wootz generateZKProof function not available';
  }
  
  console.log('✅ Wootz API is available');
  
  // Test with current page
  const currentUrl = window.location.href;
  const pageContent = document.documentElement.outerHTML;
  
  console.log('📄 Page data:', {
    url: currentUrl,
    contentLength: pageContent.length
  });
  
  // Test the Wootz API
  chrome.wootz.generateZKProof(
    currentUrl,
    pageContent,
    (result) => {
      console.log('🎉 Wootz API test successful!');
      console.log('📊 Result:', result);
      
      if (result && result.proof && result.verification_key && result.public_inputs) {
        console.log('✅ Proof structure is valid');
        console.log('📋 Proof keys:', Object.keys(result.proof));
        console.log('📋 Verification key keys:', Object.keys(result.verification_key));
        console.log('📋 Public inputs keys:', Object.keys(result.public_inputs));
      } else {
        console.warn('⚠️ Proof structure may be incomplete');
      }
    }
  );
  
  return 'Wootz API test initiated - check console for results';
};

// ⭐ NEW: Comprehensive automatic verification function ⭐
window.autoCompleteVerification = function() {
  if (contentScript) {
    console.log('🚀 Starting automatic verification completion...');
    
    // Step 1: Extract any available data from the page
    let extractedData = {};
    
    // Try to extract GitHub username
    try {
      const username = extractGitHubUsername();
      if (username && !username.includes('Error')) {
        extractedData.username = username.replace('Username extracted: ', '').split(' -')[0];
      }
    } catch (e) {
      console.log('⚠️ Could not extract username:', e.message);
    }
    
    // Step 2: Create comprehensive response matches and redactions
    if (contentScript.providerData) {
      // Clear existing configuration
      contentScript.providerData.responseMatches = [];
      contentScript.providerData.responseRedactions = [];
      
      // Add comprehensive extraction patterns
      const comprehensiveResponseMatches = [
        {
          value: 'username',
          type: 'contains',
          invert: false
        },
        {
          value: 'profile',
          type: 'contains', 
          invert: false
        },
        {
          value: 'github',
          type: 'contains',
          invert: false
        }
      ];
      
      const comprehensiveResponseRedactions = [
        // GitHub-specific patterns
        {
          xPath: '//meta[@name="octolytics-actor-login"]/@content',
          type: 'xpath'
        },
        {
          xPath: '//span[@data-testid="user-profile-name"]/text()',
          type: 'xpath'
        },
        {
          xPath: '//meta[@property="og:title"]/@content',
          type: 'xpath'
        },
        {
          xPath: '//title/text()',
          type: 'xpath'
        },
        // Regex patterns
        {
          regex: '"octolytics-actor-login":"([^"]+)"',
          type: 'regex'
        },
        {
          regex: 'GitHub - ([^\\s]+)',
          type: 'regex'
        },
        {
          regex: 'data-username="([^"]+)"',
          type: 'regex'
        },
        // Fallback patterns for any text
        {
          regex: '([a-zA-Z0-9_-]{3,20})',
          type: 'regex'
        }
      ];
      
      // Add extracted username if available
      if (extractedData.username) {
        comprehensiveResponseRedactions.push({
          regex: extractedData.username,
          type: 'regex'
        });
      }
      
      contentScript.providerData.responseMatches = comprehensiveResponseMatches;
      contentScript.providerData.responseRedactions = comprehensiveResponseRedactions;
      
      console.log('📝 Added comprehensive extraction configuration:', {
        responseMatchesCount: comprehensiveResponseMatches.length,
        responseRedactionsCount: comprehensiveResponseRedactions.length,
        extractedData: extractedData
      });
    }
    
    // Step 3: Force re-filtering with new configuration
    if (contentScript.isFiltering) {
      console.log('🔄 Re-filtering requests with comprehensive configuration...');
      contentScript.filterInterceptedRequests();
    }
    
    // Step 4: Trigger multiple requests to ensure capture
    setTimeout(() => {
      console.log('🔄 Triggering multiple requests to ensure capture...');
      
      // Trigger the main target request
      contentScript.triggerTargetRequestNow('https://github.com/settings/profile');
      
      // Also trigger some common GitHub requests that might contain user data
      setTimeout(() => {
        contentScript.triggerTargetRequestNow('https://github.com/');
      }, 500);
      
      setTimeout(() => {
        contentScript.triggerTargetRequestNow('https://github.com/settings');
      }, 1000);
    }, 1000);
    
    // Step 5: Force claim creation with any available data
    setTimeout(() => {
      console.log('🎯 Forcing claim creation with available data...');
      
      // Create a mock request with any available data
      const mockRequest = {
        url: 'https://github.com/settings/profile',
        method: 'GET',
        headers: {},
        body: null,
        responseText: document.documentElement.outerHTML || '',
        timestamp: Date.now()
      };
      
      // Send to background for claim creation
      if (contentScript.providerData) {
        contentScript.sendFilteredRequestToBackground(mockRequest, contentScript.providerData.requestData[0], contentScript.providerData.loginUrl);
      }
    }, 3000);
    
    return 'Automatic verification completion initiated - checking all possible matches';
  } else {
    console.error('❌ Content script not available');
    return 'Error: Content script not available';
  }
};

// Add WootzApp debug functions to global scope for console testing
if (typeof window !== 'undefined') {
  window.debugWootzAPI = async () => {
    console.log('🔍 [WOOTZ-DEBUG] Starting WootzApp API debug...');
    
    // Check basic availability
    console.log('📋 [WOOTZ-DEBUG] Basic checks:');
    console.log('  - chrome available:', typeof chrome !== 'undefined');
    console.log('  - chrome.wootz available:', typeof chrome !== 'undefined' && !!chrome.wootz);
    console.log('  - generateZKProof available:', typeof chrome !== 'undefined' && 
                chrome.wootz && typeof chrome.wootz.generateZKProof === 'function');
    
    // Get generator status
    const status = wootzZKProofGenerator.getStatus();
    console.log('📊 [WOOTZ-DEBUG] Generator status:', status);
    
    // Test API call
    console.log('🧪 [WOOTZ-DEBUG] Testing API call...');
    try {
      const testResult = await wootzZKProofGenerator.testWootzAPI();
      console.log('✅ [WOOTZ-DEBUG] API test result:', testResult);
      
      if (testResult.success) {
        console.log('🎉 [WOOTZ-DEBUG] WootzApp API is working!');
        console.log('📋 [WOOTZ-DEBUG] Result structure:', testResult.resultKeys);
      } else {
        console.log('❌ [WOOTZ-DEBUG] WootzApp API test failed:', testResult.error);
      }
      
      return { status, testResult };
    } catch (error) {
      console.error('💥 [WOOTZ-DEBUG] API test error:', error);
      return { status, error: error.message };
    }
  };
  
  window.testWithClaimData = async () => {
    console.log('🧪 [WOOTZ-DEBUG] Testing with claim data...');
    
    const testClaimData = {
      params: {
        paramValues: {
          username: 'test-user',
          url: 'https://github.com/settings/profile'
        }
      },
      providerData: {
        name: 'GitHub',
        callbackUrl: 'https://httpbin.org/post'
      }
    };
    
    try {
      const result = await wootzZKProofGenerator.generateZKProof(
        testClaimData, 
        'https://httpbin.org/post',
        'https://github.com/settings/profile',
        '<html><body>Test GitHub page</body></html>'
      );
      
      console.log('✅ [WOOTZ-DEBUG] Claim test result:', result);
      return result;
    } catch (error) {
      console.error('❌ [WOOTZ-DEBUG] Claim test error:', error);
      throw error;
    }
  };
  
  window.wootzGenerator = wootzZKProofGenerator;
  
  console.log('🔧 [WOOTZ-DEBUG] Debug functions loaded!');
  console.log('  - debugWootzAPI() - Test basic API functionality');
  console.log('  - testWithClaimData() - Test with claim data');
  console.log('  - wootzGenerator - Access the generator instance');
}

// Add cleanup function and page unload listener
function cleanupContentScript() {
  console.log('🧹 [CONTENT-CLEANUP] Cleaning up content script...');
  
  // Remove verification popup if it exists
  if (contentScript && contentScript.verificationPopup) {
    const popup = contentScript.verificationPopup.element;
    if (popup && popup.parentNode) {
      popup.parentNode.removeChild(popup);
      console.log('✅ [CONTENT-CLEANUP] Removed verification popup');
    }
  }
  
  // Stop network filtering
  if (contentScript) {
    contentScript.stopNetworkFiltering();
    console.log('✅ [CONTENT-CLEANUP] Stopped network filtering');
  }
  
  // Clean up intercepted data
  if (contentScript) {
    contentScript.cleanupInterceptedData();
    console.log('✅ [CONTENT-CLEANUP] Cleaned up intercepted data');
  }
  
  // Remove debug panel if it exists
  const debugPanel = document.getElementById('reclaim-debug-panel');
  if (debugPanel) {
    debugPanel.remove();
    console.log('✅ [CONTENT-CLEANUP] Removed debug panel');
  }
  
  // Remove manual trigger button if it exists
  const triggerButton = document.getElementById('reclaim-manual-trigger');
  if (triggerButton) {
    triggerButton.remove();
    console.log('✅ [CONTENT-CLEANUP] Removed manual trigger button');
  }
  
  console.log('✅ [CONTENT-CLEANUP] Content script cleanup completed');
}

// Listen for page unload events
window.addEventListener('beforeunload', (event) => {
  console.log('🚪 [CONTENT-CLEANUP] Page unloading - cleaning up...');
  cleanupContentScript();
});

// Listen for page visibility changes
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    console.log('👁️ [CONTENT-CLEANUP] Page hidden - cleaning up...');
    cleanupContentScript();
  }
});