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

// Function to inject the network interceptor
const injectNetworkInterceptor = function () {
  if (interceptorInjected) return;

  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor/network-interceptor.bundle.js');
    script.type = 'text/javascript';
    script.async = false;
    script.defer = false;

    let injected = false;
    const injectNow = () => {
      if (injected) return;

      if (document.documentElement) {
        document.documentElement.insertBefore(script, document.documentElement.firstChild);
        injected = true;
        interceptorInjected = true;
      } else if (document.head) {
        document.head.insertBefore(script, document.head.firstChild);
        injected = true;
        interceptorInjected = true;
      } else if (document) {
        document.appendChild(script);
        injected = true;
        interceptorInjected = true;
      }
    };

    injectNow();

    if (!injected) {
      const observer = new MutationObserver(() => {
        if (!injected && (document.documentElement || document.head)) {
          injectNow();
          if (injected) {
            observer.disconnect();
          }
        }
      });

      observer.observe(document, { childList: true, subtree: true });
    }

    return script;
  } catch (e) {
    return null;
  }
};

// Function to inject dynamic injection scripts
const injectDynamicInjectionScript = function () {
  if (injectionScriptInjected) return;

  try {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('interceptor/injection-scripts.bundle.js');
    script.type = 'text/javascript';
    script.async = false;
    script.defer = false;

    let injected = false;
    const injectNow = () => {
      if (injected) return;

      if (document.documentElement) {
        document.documentElement.insertBefore(script, document.documentElement.firstChild);
        injected = true;
        injectionScriptInjected = true;
      } else if (document.head) {
        document.head.insertBefore(script, document.head.firstChild);
        injected = true;
        injectionScriptInjected = true;
      } else if (document) {
        document.appendChild(script);
        injected = true;
        injectionScriptInjected = true;
      }
    };

    injectNow();

    if (!injected) {
      const observer = new MutationObserver(() => {
        if (!injected && (document.documentElement || document.head)) {
          injectNow();
          if (injected) {
            observer.disconnect();
          }
        }
      });

      observer.observe(document, { childList: true, subtree: true });
    }

    return script;
  } catch (e) {
    return null;
  }
};

// On load, immediately check if this tab should be initialized
(async function () {
  try {
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.CONTENT_SCRIPT_LOADED,
      source: MESSAGE_SOURCES.CONTENT_SCRIPT,
      target: MESSAGE_SOURCES.BACKGROUND,
      data: { url: window.location.href }
    });

    if (shouldInitialize) {
      injectNetworkInterceptor();
      injectDynamicInjectionScript();
      
      const reclaimContentScript = new ReclaimContentScript();
      reclaimContentScript.init();
    }
  } catch (error) {
    // Silent error handling
  }
})();

// Main content script class
class ReclaimContentScript {
  constructor() {
    this.providerData = null;
    this.interceptedRequests = new Map();
    this.interceptedResponses = new Map();
    this.linkedRequestResponses = new Map();
    this.filteredRequests = [];
    this.extractedPageData = null;
    this.verificationPopup = null;
    this.isNetworkFiltering = false;
    this.providerId = null;
  }

  init() {
    this.setupMessageListener();
    this.setupWindowMessageListener();
    this.checkIfOnCorrectPage();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true;
    });
  }

  handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case MESSAGE_ACTIONS.SHOW_PROVIDER_VERIFICATION_POPUP:
        this.showProviderVerificationPopup(message.data);
        break;

      case MESSAGE_ACTIONS.PROVIDER_DATA_READY:
        this.providerData = message.data;
        this.startNetworkFiltering();
        break;

      case MESSAGE_ACTIONS.GET_PAGE_DATA:
        this.handleGetPageData(sendResponse);
        break;

      case MESSAGE_ACTIONS.PROOF_GENERATION_SUCCESS:
        this.handleProofGenerationSuccess(message.data);
        break;

      case MESSAGE_ACTIONS.PROOF_GENERATION_FAILED:
        this.handleProofGenerationFailed(message.data);
        break;

      case MESSAGE_ACTIONS.PROOF_SUBMITTED:
        this.handleProofSubmitted(message.data);
        break;

      case MESSAGE_ACTIONS.SESSION_FAILED:
        this.handleSessionFailed(message.data);
        break;

      case MESSAGE_ACTIONS.SESSION_COMPLETE:
        this.handleSessionComplete(message.data);
        break;

      default:
        break;
    }
  }

  handleGetPageData(sendResponse) {
    try {
      const pageData = this.extractPageData();
      sendResponse({
        success: true,
        url: window.location.href,
        content: document.documentElement.outerHTML,
        extractedData: pageData
      });
    } catch (error) {
      sendResponse({
        success: false,
        error: error.message,
        url: window.location.href,
        content: ''
      });
    }
  }

  setupWindowMessageListener() {
    window.addEventListener('message', (event) => {
      this.handleWindowMessage(event);
    });
  }

  handleWindowMessage(event) {
    if (event.source !== window) return;

    switch (event.data.action) {
      case 'RECLAIM_INTERCEPTED_REQUEST':
        this.storeInterceptedRequest(event.data.request);
        break;

      case 'RECLAIM_INTERCEPTED_RESPONSE':
        this.storeInterceptedResponse(event.data.response);
        break;

      case 'RECLAIM_GET_PROVIDER_ID':
        this.handleGetProviderId(event);
        break;

      default:
        break;
    }
  }

  storeInterceptedRequest(requestData) {
    try {
      const url = requestData.url;
      if (!this.interceptedRequests.has(url)) {
        this.interceptedRequests.set(url, []);
      }
      this.interceptedRequests.get(url).push(requestData);
    } catch (error) {
      // Silent error handling
    }
  }

  storeInterceptedResponse(responseData) {
    try {
      const url = responseData.url;
      if (!this.interceptedResponses.has(url)) {
        this.interceptedResponses.set(url, []);
      }
      this.interceptedResponses.get(url).push(responseData);
      this.linkRequestAndResponse(url, responseData);
    } catch (error) {
      // Silent error handling
    }
  }

  linkRequestAndResponse(url, responseData) {
    try {
      const requests = this.interceptedRequests.get(url) || [];
      const matchingRequest = requests.find(req => 
        req.method === responseData.method && 
        Math.abs(req.timestamp - responseData.timestamp) < 5000
      );

      if (matchingRequest) {
        this.linkedRequestResponses.set(url, {
          request: matchingRequest,
          response: responseData
        });
      }
    } catch (error) {
      // Silent error handling
    }
  }

  cleanupInterceptedData() {
    this.interceptedRequests.clear();
    this.interceptedResponses.clear();
    this.linkedRequestResponses.clear();
    this.filteredRequests = [];
  }

  startNetworkFiltering() {
    if (this.isNetworkFiltering) return;
    this.isNetworkFiltering = true;
    this.autoExtractAndVerify();
  }

  checkIfOnCorrectPage() {
    try {
      const currentUrl = window.location.href;
      const providerDomains = {
        github: ['github.com'],
        linkedin: ['linkedin.com'],
        instagram: ['instagram.com'],
        twitter: ['twitter.com', 'x.com'],
        gmail: ['gmail.com', 'mail.google.com']
      };

      let matchedProvider = null;
      for (const [provider, domains] of Object.entries(providerDomains)) {
        if (domains.some(domain => currentUrl.includes(domain))) {
          matchedProvider = provider;
          break;
        }
      }

      if (matchedProvider) {
        shouldInitialize = true;
        this.providerId = matchedProvider;
        this.setProviderIdInLocalStorage(matchedProvider);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  autoExtractAndVerify() {
    try {
      this.extractPageData();
      setTimeout(() => {
        this.filterInterceptedRequests();
      }, 2000);
    } catch (error) {
      // Silent error handling
    }
  }

  extractPageData() {
    try {
      const pageData = {};
      const extractionConfig = this.createComprehensiveExtractionConfig();

      for (const [key, patterns] of Object.entries(extractionConfig)) {
        for (const pattern of patterns) {
          try {
            let value = null;
            if (pattern.type === 'regex' && pattern.regex) {
              const match = document.documentElement.outerHTML.match(new RegExp(pattern.regex, 'i'));
              if (match && match[1]) {
                value = match[1].trim();
              }
            } else if (pattern.type === 'xpath' && pattern.xPath) {
              const result = document.evaluate(pattern.xPath, document, null, XPathResult.STRING_TYPE, null);
              if (result.stringValue) {
                value = result.stringValue.trim();
              }
            }

            if (value) {
              pageData[key] = value;
              break;
            }
          } catch (error) {
            // Silent error handling
          }
        }
      }

      this.extractedPageData = pageData;
      return pageData;
    } catch (error) {
      return {};
    }
  }

  createComprehensiveExtractionConfig() {
    const baseConfig = {
      username: [
        { regex: '"octolytics-actor-login":"([^"]+)"', type: 'regex' },
        { xPath: '//meta[@name="octolytics-actor-login"]/@content', type: 'xpath' },
        { regex: 'data-username="([^"]+)"', type: 'regex' },
        { regex: 'GitHub - ([^\\s]+)', type: 'regex' }
      ],
      profile: [
        { regex: '"user":"([^"]+)"', type: 'regex' },
        { xPath: '//h1[@class="text-heading-xlarge"]/text()', type: 'xpath' }
      ]
    };

    return baseConfig;
  }

  filterInterceptedRequests() {
    try {
      if (!this.providerData || !this.providerData.requestData) return;

      const allRequests = Array.from(this.linkedRequestResponses.values());
      this.filteredRequests = [];

      for (const requestData of this.providerData.requestData) {
        const matchingRequests = allRequests.filter(req => {
          return filterRequest(req.request, requestData);
        });

        if (matchingRequests.length > 0) {
          this.filteredRequests.push(...matchingRequests);
        }
      }

      if (this.filteredRequests.length > 0) {
        this.sendFilteredRequestToBackground(
          this.filteredRequests[0].request,
          this.providerData.requestData[0],
          this.providerData.loginUrl
        );
      }
    } catch (error) {
      // Silent error handling
    }
  }

  sendFilteredRequestToBackground(formattedRequest, matchingCriteria, loginUrl) {
    try {
      chrome.runtime.sendMessage({
        action: MESSAGE_ACTIONS.FILTERED_REQUEST_READY,
        source: MESSAGE_SOURCES.CONTENT_SCRIPT,
        target: MESSAGE_SOURCES.BACKGROUND,
        data: {
          request: formattedRequest,
          criteria: matchingCriteria,
          loginUrl: loginUrl,
          pageData: this.extractedPageData
        }
      });
    } catch (error) {
      // Silent error handling
    }
  }

  setProviderIdInLocalStorage(providerId) {
    try {
      localStorage.setItem('reclaimProviderId', providerId);
    } catch (error) {
      // Silent error handling
    }
  }

  showProviderVerificationPopup(data) {
    try {
      if (this.verificationPopup) {
        this.verificationPopup.remove();
      }

      this.verificationPopup = createProviderVerificationPopup(data);
      document.body.appendChild(this.verificationPopup);
    } catch (error) {
      // Silent error handling
    }
  }

  handleProofGenerationSuccess(data) {
    try {
      if (this.verificationPopup) {
        this.verificationPopup.completeLoading(data.proofData);
      }
    } catch (error) {
      // Silent error handling
    }
  }

  handleProofGenerationFailed(data) {
    try {
      if (this.verificationPopup) {
        this.verificationPopup.showError(data.error || 'Proof generation failed');
      }
    } catch (error) {
      // Silent error handling
    }
  }

  handleProofSubmitted(data) {
    try {
      if (this.verificationPopup) {
        this.verificationPopup.showSuccess(data.message || 'Proof submitted successfully');
      }
    } catch (error) {
      // Silent error handling
    }
  }

  handleSessionFailed(data) {
    try {
      if (this.verificationPopup) {
        this.verificationPopup.showError(data.error || 'Session failed');
      }
    } catch (error) {
      // Silent error handling
    }
  }

  handleSessionComplete(data) {
    try {
      if (this.verificationPopup) {
        this.verificationPopup.showSuccess(data.message || 'Session completed');
      }
    } catch (error) {
      // Silent error handling
    }
  }

  stopNetworkFiltering() {
    this.isNetworkFiltering = false;
  }
}

// Cleanup function
function cleanupContentScript() {
  try {
    if (window.reclaimContentScript) {
      window.reclaimContentScript.stopNetworkFiltering();
    }

    const popup = document.getElementById('reclaim-verification-popup');
    if (popup) {
      popup.remove();
    }

    const debugPanel = document.getElementById('reclaim-debug-panel');
    if (debugPanel) {
      debugPanel.remove();
    }
  } catch (error) {
    // Silent error handling
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupContentScript);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    cleanupContentScript();
  }
});