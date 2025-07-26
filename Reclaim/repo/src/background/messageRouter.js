// Message router for background script
// Handles chrome.runtime.onMessage and routes actions to modules

import { MESSAGE_ACTIONS, MESSAGE_SOURCES } from '../utils/constants';
import { ensureOffscreenDocument } from '../utils/offscreen-manager';

// Ensure offscreen document exists
const ensureOffscreenDocumentExists = async () => {
  try {
    const exists = await ensureOffscreenDocument();
    if (!exists) {
      // Silent handling
    }
  } catch (error) {
    // Silent error handling
  }
};

// Main message handler
export const handleMessage = async (message, sender, sendResponse, ctx) => {
  try {
    const { action, source, target, data } = message;

    // Ensure offscreen document is ready
    await ensureOffscreenDocumentExists();

    switch (action) {
      case MESSAGE_ACTIONS.START_VERIFICATION:
        await handleStartVerification(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.PROOF_GENERATION_SUCCESS:
        await handleProofGenerationSuccess(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.PROOF_GENERATION_FAILED:
        await handleProofGenerationFailed(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.PROOF_SUBMITTED:
        await handleProofSubmitted(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.PROXY_RECLAIM_API_CALL:
        await handleProxyReclaimApiCall(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.OFFSCREEN_DOCUMENT_READY:
        await handleOffscreenDocumentReady(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.FILTERED_REQUEST_FOUND:
        await handleFilteredRequestFound(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.RESET_SESSION:
        await handleResetSession(message, sender, sendResponse, ctx);
        break;

      case MESSAGE_ACTIONS.CLOSE_CURRENT_TAB:
        await handleCloseCurrentTab(message, sender, sendResponse, ctx);
        break;

      default:
        // Send response for unhandled messages
        sendResponse({ success: false, error: 'Unknown action' });
        break;
    }
  } catch (error) {
    // Ensure error response is sent
    sendResponse({ success: false, error: error.message });
  }
};

// Handle start verification
const handleStartVerification = async (message, sender, sendResponse, ctx) => {
  try {
    const { reclaimProofRequestConfig, sessionId, providerName, providerLoginUrl } = message.data;

                    if (!reclaimProofRequestConfig) {
      sendResponse({ success: false, error: 'Missing reclaimProofRequestConfig' });
                        return;
                    }

    // Check if session is already in progress
    if (ctx.sessionId && ctx.sessionId !== sessionId) {
      // Clean up stale session
      ctx.resetSessionState();
    }

    // Store session data
    ctx.sessionId = sessionId;
    ctx.callbackUrl = `${ctx.BASE_URL}/receive-proofs`;
    ctx.providerData = { name: providerName, loginUrl: providerLoginUrl };

    // Store config for later use
    ctx.pendingReclaimConfig = reclaimProofRequestConfig;

    // Start network data sync
    ctx.startNetworkDataSync();

    // Create new tab for verification
    const tab = await chrome.tabs.create({
      url: providerLoginUrl,
      active: true
    });

    ctx.activeTabId = tab.id;
    ctx.managedTabs.add(tab.id);

    // Send success response
    sendResponse({ success: true, tabId: tab.id });

    // Notify popup of session start
    try {
                        chrome.runtime.sendMessage({
                            action: MESSAGE_ACTIONS.VERIFICATION_STATUS,
                            source: MESSAGE_SOURCES.BACKGROUND,
                            target: MESSAGE_SOURCES.POPUP,
        data: { message: `Verification started for ${providerName}` }
      });
    } catch (err) {
      // Silent error handling
    }

                    } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle proof generation success
const handleProofGenerationSuccess = async (message, sender, sendResponse, ctx) => {
  try {
    const { proofs, callbackResponse } = message.data;

    // Store generated proofs
    if (proofs && Array.isArray(proofs)) {
      proofs.forEach(proof => {
        ctx.generatedProofs.set(proof.identifier, proof);
      });
    }

    // Send success response
    sendResponse({ success: true, proofs: proofs });

    // Notify content script
    if (ctx.activeTabId) {
      try {
        chrome.tabs.sendMessage(ctx.activeTabId, {
          action: MESSAGE_ACTIONS.PROOF_GENERATION_SUCCESS,
          source: MESSAGE_SOURCES.BACKGROUND,
          target: MESSAGE_SOURCES.CONTENT_SCRIPT,
          data: { proofs: proofs, callbackResponse: callbackResponse }
        });
      } catch (err) {
        // Silent error handling
      }
    }

    // Notify popup
    try {
                                chrome.runtime.sendMessage({
                                    action: MESSAGE_ACTIONS.VERIFICATION_COMPLETE,
                                    source: MESSAGE_SOURCES.BACKGROUND,
                                    target: MESSAGE_SOURCES.POPUP,
        data: { proofs: proofs, callbackResponse: callbackResponse }
      });
    } catch (err) {
      // Silent error handling
    }

  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle proof generation failed
const handleProofGenerationFailed = async (message, sender, sendResponse, ctx) => {
  try {
    const { error } = message.data;

    // Send error response
    sendResponse({ success: false, error: error });

    // Notify content script
    if (ctx.activeTabId) {
      try {
        chrome.tabs.sendMessage(ctx.activeTabId, {
          action: MESSAGE_ACTIONS.PROOF_GENERATION_FAILED,
          source: MESSAGE_SOURCES.BACKGROUND,
          target: MESSAGE_SOURCES.CONTENT_SCRIPT,
          data: { error: error }
        });
      } catch (err) {
        // Silent error handling
      }
    }

    // Notify popup
    try {
                        chrome.runtime.sendMessage({
                            action: MESSAGE_ACTIONS.VERIFICATION_ERROR,
                            source: MESSAGE_SOURCES.BACKGROUND,
                            target: MESSAGE_SOURCES.POPUP,
        data: { error: error }
      });
    } catch (err) {
      // Silent error handling
    }

  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle proof submitted
const handleProofSubmitted = async (message, sender, sendResponse, ctx) => {
  try {
    const { success, error } = message.data;

    // Send response
    sendResponse({ success: success, error: error });

    // Notify content script
    if (ctx.activeTabId) {
      try {
        chrome.tabs.sendMessage(ctx.activeTabId, {
          action: MESSAGE_ACTIONS.PROOF_SUBMITTED,
                        source: MESSAGE_SOURCES.BACKGROUND,
          target: MESSAGE_SOURCES.CONTENT_SCRIPT,
          data: { success: success, error: error }
        });
      } catch (err) {
        // Silent error handling
      }
    }

  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle proxy reclaim API call
const handleProxyReclaimApiCall = async (message, sender, sendResponse, ctx) => {
  try {
    const { method, originalUrl, headers, body, messageId } = message.data;

    const targetUrl = originalUrl.replace('/reclaim-proxy/api', 'https://api.reclaimprotocol.org/api');

                        const fetchOptions = {
                            method: method,
                            headers: {
        'Accept': 'application/json',
        'Content-Type': headers['content-type'] || 'application/json',
        'User-Agent': 'Reclaim-Extension-Proxy/1.0'
      }
    };

    if (headers['authorization']) {
      fetchOptions.headers['Authorization'] = headers['authorization'];
    }

    if (body && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = body;
    }

    const response = await fetch(targetUrl, fetchOptions);
    const responseText = await response.text();

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      responseData = responseText;
                        }

                        sendResponse({
      success: response.ok,
      status: response.status,
      data: responseData,
      messageId: messageId
    });

                    } catch (error) {
                        sendResponse({ 
                            success: false, 
      error: error.message,
      messageId: message.data?.messageId
    });
  }
};

// Handle offscreen document ready
const handleOffscreenDocumentReady = async (message, sender, sendResponse, ctx) => {
  try {
    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle filtered request found
const handleFilteredRequestFound = async (message, sender, sendResponse, ctx) => {
  try {
    const { request, criteria, loginUrl } = message.data;

    if (sender.tab && sender.tab.id === ctx.activeTabId) {
      const requestKey = `${request.url}_${Date.now()}`;

      if (ctx.filteredRequests.has(requestKey)) {
        sendResponse({ success: true, cached: true });
        return;
      }

      ctx.filteredRequests.set(requestKey, { request, criteria, loginUrl });

      const result = await ctx.processFilteredRequest(request, criteria, ctx.sessionId, loginUrl);

      sendResponse({ success: true, result: result });
    } else {
      sendResponse({ success: false, error: 'Invalid source/target combination' });
    }

  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle reset session
const handleResetSession = async (message, sender, sendResponse, ctx) => {
  try {
    ctx.resetSessionState();
    sendResponse({ success: true });
                    } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
};

// Handle close current tab
const handleCloseCurrentTab = async (message, sender, sendResponse, ctx) => {
  try {
    const tabId = sender.tab?.id;
    if (tabId) {
      await chrome.tabs.remove(tabId);
      sendResponse({ success: true });
                } else {
      sendResponse({ success: false, error: 'No tab ID provided' });
        }
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
};