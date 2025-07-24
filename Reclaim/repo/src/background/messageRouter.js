// Message router for background script
// Handles chrome.runtime.onMessage and routes actions to modules

import * as sessionManager from './sessionManager';
import { MESSAGE_ACTIONS, MESSAGE_SOURCES } from '../utils/constants';

// Helper function to create or get an offscreen document
async function createOffscreen() {
    if (await chrome.offscreen.hasDocument()) {
        console.log('Background: Offscreen document already exists.');
        return;
    }
    await chrome.offscreen.createDocument({
        url: 'offscreen/offscreen.html', // Path to your offscreen HTML
        reasons: ['BLOBS', 'CLIPBOARD'], // Required reasons for offscreen document to function as expected by Reclaim SDK
        justification: 'To run Reclaim SDK methods in a dedicated environment with browser APIs.',
    });
    console.log('Background: Offscreen document created.');
}

export async function handleMessage(ctx, message, sender, sendResponse) {
    // ⭐ ENHANCED: Debug message router entry ⭐
    console.log('🔧 [MESSAGE-ROUTER] Processing message:', {
        action: message.action,
        source: message.source,
        target: message.target,
        hasData: !!message.data
    });
    const { action, source, target, data } = message;
    
    // ⭐ ENHANCED: Debug all incoming messages ⭐
    console.log('📡 [MESSAGE-ROUTER] Received message:', {
        action,
        source,
        target,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        senderTabId: sender.tab?.id
    });
    
    try {
        switch (action) {
            case ctx.MESSAGE_ACTIONS.CONTENT_SCRIPT_LOADED:
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    const isManaged = sender.tab?.id && ctx.managedTabs.has(sender.tab.id);
                    chrome.tabs.sendMessage(sender.tab.id, {
                        action: ctx.MESSAGE_ACTIONS.SHOULD_INITIALIZE,
                        source: ctx.MESSAGE_SOURCES.BACKGROUND,
                        target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                        data: { shouldInitialize: isManaged }
                    }).catch(err => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, "[BACKGROUND] Error sending initialization status:", err));

                    if (isManaged && ctx.initPopupMessage && ctx.initPopupMessage.has(sender.tab.id)) {
                        const pendingMessage = ctx.initPopupMessage.get(sender.tab.id);
                        chrome.tabs.sendMessage(sender.tab.id, pendingMessage.message)
                            .then(() => {
                                if (chrome.runtime.lastError) {
                                    ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, `[BACKGROUND] Error sending (pending) SHOW_PROVIDER_VERIFICATION_POPUP to tab ${sender.tab.id}:`, chrome.runtime.lastError.message);
                                }
                            })
                            .catch(error => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, `[BACKGROUND] Error sending (pending) PROVIDER_DATA_READY to tab ${sender.tab.id} (promise catch):`, error));
                        ctx.providerDataMessage.delete(sender.tab.id);
                    }

                    sendResponse({ success: true });
                    break;
                }
                break;
            case ctx.MESSAGE_ACTIONS.REQUEST_PROVIDER_DATA:
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    ctx.loggerService.log({
                        message: 'Content script requested provider data',
                        type: ctx.LOG_TYPES.BACKGROUND,
                        sessionId: ctx.sessionId || 'unknown',
                        providerId: ctx.httpProviderId || 'unknown',
                        appId: ctx.appId || 'unknown'
                    });
                    if (sender.tab?.id && ctx.managedTabs.has(sender.tab.id) && ctx.providerData && ctx.parameters && ctx.sessionId && ctx.callbackUrl) {
                        ctx.loggerService.log({
                            message: 'Sending the following provider data to content script: ' + JSON.stringify(ctx.providerData),
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: ctx.httpProviderId || 'unknown',
                            appId: ctx.appId || 'unknown'
                        });
                        sendResponse({
                            success: true, data: {
                                providerData: ctx.providerData,
                                parameters: ctx.parameters,
                                sessionId: ctx.sessionId,
                                callbackUrl: ctx.callbackUrl,
                                httpProviderId: ctx.httpProviderId,
                                appId: ctx.appId
                            }
                        });
                    } else {
                        sendResponse({ success: false, error: 'Provider data not available or tab not managed' });
                    }
                }
                break;
            case ctx.MESSAGE_ACTIONS.CHECK_IF_MANAGED_TAB:
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    const isManaged = sender.tab?.id && ctx.managedTabs.has(sender.tab.id);
                    sendResponse({ success: true, isManaged });
                }
                break;

            case MESSAGE_ACTIONS.START_VERIFICATION:
                if ((source === MESSAGE_SOURCES.POPUP || source === MESSAGE_SOURCES.CONTENT_SCRIPT) && target === MESSAGE_SOURCES.BACKGROUND) {
                    const { reclaimProofRequestConfig, providerId, sessionId, applicationId, callbackUrl, parameters } = data;

                    if (!reclaimProofRequestConfig) {
                        ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] START_VERIFICATION: Missing reclaimProofRequestConfig.');
                        sendResponse({ success: false, error: 'Missing Reclaim configuration.' });
                        return;
                    }

                    // ⭐ ENHANCED: Check if session is already in progress with better logic ⭐
                    const hasActiveSession = ctx.sessionId || ctx.activeTabId || ctx.providerData;
                    const hasActiveTab = ctx.activeTabId && ctx.managedTabs.has(ctx.activeTabId);
                    
                    if (hasActiveSession && hasActiveTab) {
                        console.log('⚠️ [MESSAGE-ROUTER] Session already in progress - rejecting new verification request:', {
                            existingSessionId: ctx.sessionId,
                            existingActiveTabId: ctx.activeTabId,
                            hasProviderData: !!ctx.providerData,
                            hasActiveTab: hasActiveTab,
                            newSessionId: sessionId,
                            timestamp: new Date().toISOString()
                        });
                        
                        sendResponse({ 
                            success: false, 
                            error: 'Verification session already in progress. Please close the current session first.' 
                        });
                        return;
                    } else if (hasActiveSession && !hasActiveTab) {
                        // Session state exists but no active tab - clean up stale state
                        console.log('🧹 [MESSAGE-ROUTER] Cleaning up stale session state:', {
                            existingSessionId: ctx.sessionId,
                            existingActiveTabId: ctx.activeTabId,
                            hasProviderData: !!ctx.providerData,
                            hasActiveTab: hasActiveTab,
                            newSessionId: sessionId,
                            timestamp: new Date().toISOString()
                        });
                        
                        // Reset session state to allow new verification
                        ctx.activeTabId = null;
                        ctx.sessionId = null;
                        ctx.providerData = null;
                        ctx.parameters = null;
                        ctx.httpProviderId = null;
                        ctx.appId = null;
                        ctx.callbackUrl = null;
                        ctx.generatedProofs = new Map();
                        ctx.filteredRequests = new Map();
                        ctx.initPopupMessage = new Map();
                        ctx.providerDataMessage = new Map();
                        ctx.firstRequestReceived = false;
                        ctx.isProcessingQueue = false;
                        ctx.proofGenerationQueue = [];
                        
                        console.log('✅ [MESSAGE-ROUTER] Stale session state cleaned up - proceeding with new verification');
                    }

                    ctx.loggerService.log({
                        message: `🚀 BACKGROUND: Starting verification process from ${source}`,
                        type: ctx.LOG_TYPES.BACKGROUND,
                        sessionId: sessionId || 'unknown',
                        providerId: providerId || 'unknown',
                        appId: applicationId || 'unknown'
                    });

                    ctx.loggerService.log({
                        message: `📋 BACKGROUND: Verification data - SessionId: ${sessionId}, ProviderId: ${providerId}, AppId: ${applicationId}`,
                        type: ctx.LOG_TYPES.BACKGROUND,
                        sessionId: sessionId || 'unknown',
                        providerId: providerId || 'unknown',
                        appId: applicationId || 'unknown'
                    });

                    ctx.loggerService.startFlushInterval();

                    try {
                        ctx.loggerService.log({
                            message: `🔄 BACKGROUND: Calling sessionManager.startVerification...`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: sessionId || 'unknown',
                            providerId: providerId || 'unknown',
                            appId: applicationId || 'unknown'
                        });

                        // 1. Call sessionManager.startVerification to initialize session context and open the initial tab.
                        // The sessionManager.startVerification will now handle fetching providerData and opening the initial tab.
                        const sessionInitResult = await sessionManager.startVerification(ctx, {
                            // Pass all relevant data that sessionManager needs for its setup
                            providerId: providerId,
                            sessionId: sessionId,
                            applicationId: applicationId,
                            callbackUrl: callbackUrl,
                            parameters: parameters,
                            reclaimProofRequestConfig: reclaimProofRequestConfig, // Pass config here for sessionManager to store if needed
                            providerName: data.providerName, // Pass provider name for UI
                            providerLoginUrl: data.providerLoginUrl // Pass provider-specific login URL
                        });

                        ctx.loggerService.log({
                            message: `✅ BACKGROUND: SessionManager result - Success: ${sessionInitResult.success}, Message: ${sessionInitResult.message || 'N/A'}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: sessionId || 'unknown',
                            providerId: providerId || 'unknown',
                            appId: applicationId || 'unknown'
                        });

                        if (!sessionInitResult.success) {
                            throw new Error(sessionInitResult.message || 'Failed to initialize session context.');
                        }

                        // Session context (ctx.sessionId, ctx.appId, etc.) should now be set by sessionManager.startVerification.
                        // The initial provider tab should also be opened by sessionManager.

                        // 2. Send status update to popup after session context and initial tab creation
                        chrome.runtime.sendMessage({
                            action: MESSAGE_ACTIONS.VERIFICATION_STATUS,
                            source: MESSAGE_SOURCES.BACKGROUND,
                            target: MESSAGE_SOURCES.POPUP,
                            data: { message: 'Session initialized. Provider tab opened. Offscreen preparing...' }
                        }).catch(err => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, "Error sending session init status to popup", err));

                        ctx.loggerService.log({
                            message: `🔄 BACKGROUND: Creating offscreen document...`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: sessionId || 'unknown',
                            providerId: providerId || 'unknown',
                            appId: applicationId || 'unknown'
                        });

                        // 3. Create or ensure the offscreen document exists
                        await createOffscreen();

                        ctx.loggerService.log({
                            message: `✅ BACKGROUND: Offscreen document ready, sending GENERATE_PROOF message...`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: sessionId || 'unknown',
                            providerId: providerId || 'unknown',
                            appId: applicationId || 'unknown'
                        });

                        // 4. ⭐ MODIFIED: Wait for network data before starting Reclaim SDK flow ⭐
                        console.log('🔄 BACKGROUND: Waiting for network data before starting Reclaim SDK flow...');
                        
                        // Store the config for later use when network data is captured
                        ctx.pendingReclaimConfig = reclaimProofRequestConfig;
                        ctx.pendingSessionId = sessionId;
                        ctx.pendingProviderId = providerId;
                        ctx.pendingApplicationId = applicationId;
                        
                        console.log('📋 BACKGROUND: Config stored for later use - waiting for network data capture...');
                        
                        // Send immediate response to indicate we're waiting for network data
                        const waitingResponse = {
                            success: true,
                            message: 'Waiting for network data capture before starting Reclaim SDK flow',
                            status: 'waiting_for_network_data'
                        };

                        ctx.loggerService.log({
                            message: `✅ BACKGROUND: Waiting for network data - Status: ${waitingResponse.status}, Message: ${waitingResponse.message || 'N/A'}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: sessionId || 'unknown',
                            providerId: providerId || 'unknown',
                            appId: applicationId || 'unknown'
                        });

                        // 5. Relay waiting response back to original sender (popup/content script)
                        sendResponse(waitingResponse);

                    } catch (error) {
                        ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error in START_VERIFICATION process:', error);
                        sendResponse({ success: false, error: 'Failed to initiate Reclaim verification: ' + error.message });
                        ctx.failSession("Failed to initiate Reclaim verification: " + error.message);
                    }
                } else {
                    sendResponse({ success: false, error: 'Action not supported for this source/target.' });
                }
                break;

            // ⭐ CORRECTED CASE: Handle GENERATED_PROOF_RESPONSE from offscreen ⭐
            case MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE:
                if (source === MESSAGE_SOURCES.OFFSCREEN && target === MESSAGE_SOURCES.BACKGROUND) {
                    ctx.loggerService.log({
                        message: `📨 BACKGROUND: Received GENERATED_PROOF_RESPONSE from offscreen - Success: ${data.success}`,
                        type: ctx.LOG_TYPES.BACKGROUND,
                        sessionId: ctx.sessionId || 'unknown',
                        providerId: ctx.httpProviderId || 'unknown',
                        appId: ctx.appId || 'unknown'
                    });

                    // ⭐ CRITICAL: Only process if we have real proofs from Reclaim SDK ⭐
                    if (data.success && data.proofs && data.proofs.length > 0) {
                        // Store proofs in generatedProofs Map so submitProofs can pick them
                        data.proofs.forEach((proof, idx) => {
                            const key = proof.identifier || `proof_${idx}`;
                            if (!ctx.generatedProofs.has(key)) {
                                ctx.generatedProofs.set(key, proof);
                            }
                        });

                        ctx.loggerService.log({
                            message: `🎉 BACKGROUND: Proof generation SUCCESSFUL! Number of proofs: ${data.proofs.length}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: ctx.httpProviderId || 'unknown',
                            appId: ctx.appId || 'unknown'
                        });

                        // Attempt to extract sessionId, appId from the first proof's context if available
                        try {
                            const firstProof = data.proofs[0];
                            if (firstProof.claimData && typeof firstProof.claimData.context === 'string') {
                                const context = JSON.parse(firstProof.claimData.context);
                                // These are internal session IDs used by Reclaim, not necessarily what you sent in init.
                                // Use these for logging, but your primary ctx.sessionId should still be the one you sent initially.
                                // For consistency, let's update ctx.sessionId/appId from data if it's more definitive.
                                ctx.sessionId = context.sessionId || ctx.sessionId;
                                ctx.appId = context.appId || ctx.appId;
                                ctx.httpProviderId = context.providerHash || ctx.httpProviderId;
                            }
                        } catch (e) {
                            console.warn("Background: Could not parse proof context for session info:", e);
                        }

                        console.log('Background: Proof generation SUCCESS from offscreen:', data.proofs);
                        ctx.loggerService.log({
                            message: 'Background: Verification completed successfully via offscreen.',
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId,
                            appId: ctx.appId
                        });

                        try {
                            // Call submitProofs after successful proof generation
                            const submitResult = await ctx.submitProofs(ctx);
                            if (submitResult.success) {
                                chrome.runtime.sendMessage({
                                    action: MESSAGE_ACTIONS.VERIFICATION_COMPLETE,
                                    source: MESSAGE_SOURCES.BACKGROUND,
                                    target: MESSAGE_SOURCES.POPUP,
                                    data: { proofs: data.proofs, submissionMessage: submitResult.message }
                                }).catch(err => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, "Error relaying VERIFICATION_COMPLETE to popup", err));
                            } else {
                                // Submission failed even if generation succeeded
                                throw new Error(submitResult.message || "Proof submission failed after generation.");
                            }
                        } catch (submitError) {
                            console.error('Background: Error during proof submission after successful generation:', submitError);
                            chrome.runtime.sendMessage({
                                action: MESSAGE_ACTIONS.VERIFICATION_ERROR,
                                source: MESSAGE_SOURCES.BACKGROUND,
                                target: MESSAGE_SOURCES.POPUP,
                                data: { error: `Submission failed: ${submitError.message}` }
                            }).catch(err => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, "Error relaying submission error to popup", err));
                        }
                    } else if (data.success) {
                        // ⭐ NEW: Handle case where offscreen says success but no proofs yet ⭐
                        // This means the Reclaim SDK is waiting for user interaction
                        console.log('Background: Offscreen reports success but no proofs yet - waiting for user interaction...');
                        ctx.loggerService.log({
                            message: 'Background: Offscreen initialized successfully, waiting for user interaction to generate proofs.',
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: ctx.httpProviderId || 'unknown',
                            appId: ctx.appId || 'unknown'
                        });
                        
                        // Don't call submitProofs yet - wait for real proofs to arrive
                        // The session will continue until either:
                        // 1. Real proofs arrive via GENERATED_PROOF_RESPONSE
                        // 2. Session timer expires
                        // 3. User completes verification on provider website
                        
                    } else { // Proof generation failed in offscreen
                        console.error('❌ BACKGROUND: Proof generation FAILED from offscreen:', data.error);
                        ctx.loggerService.log({
                            message: `❌ BACKGROUND: Verification failed via offscreen: ${data.error}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: ctx.httpProviderId || 'unknown',
                            appId: ctx.appId || 'unknown'
                        });

                        chrome.runtime.sendMessage({
                            action: MESSAGE_ACTIONS.VERIFICATION_ERROR,
                            source: MESSAGE_SOURCES.BACKGROUND,
                            target: MESSAGE_SOURCES.POPUP,
                            data: { error: `Verification failed: ${data.error}` }
                        }).catch(err => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, "Error relaying verification error to popup", err));

                        ctx.failSession("Verification failed via offscreen: " + data.error);
                    }
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                return true; // For async response

            // ⭐ NEW: Send captured network data to offscreen for Reclaim SDK ⭐
            case MESSAGE_ACTIONS.SEND_NETWORK_DATA_TO_OFFSCREEN:
                if (source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
                    // Send captured network data to offscreen so Reclaim SDK can access it
                    chrome.runtime.sendMessage({
                        action: MESSAGE_ACTIONS.NETWORK_DATA_FOR_RECLAIM,
                        source: MESSAGE_SOURCES.BACKGROUND,
                        target: MESSAGE_SOURCES.OFFSCREEN,
                        data: {
                            filteredRequests: Array.from(ctx.filteredRequests.values()),
                            providerData: ctx.providerData,
                            sessionId: ctx.sessionId
                        }
                    }).catch(err => {
                        console.error('Background: Error sending network data to offscreen:', err);
                    });
                    
                    sendResponse({ success: true, message: 'Network data sent to offscreen' });
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                return true; // For async response

            case MESSAGE_ACTIONS.PROXY_RECLAIM_API_CALL:
                if ((source === MESSAGE_SOURCES.CONTENT_SCRIPT || source === MESSAGE_SOURCES.INTERCEPTOR_INJECTED) && target === MESSAGE_SOURCES.BACKGROUND) {
                    const { originalUrl, method, headers, body } = data;
                    console.log(`Background: Received PROXY_RECLAIM_API_CALL for ${method} ${originalUrl}. MessageId: ${messageId}`);
                    ctx.loggerService.log({
                        message: `Background: Proxying Reclaim API call ${method} ${originalUrl}`,
                        type: ctx.LOG_TYPES.BACKGROUND
                    });

                    try {
                        const isWsProxy = originalUrl.startsWith('wss://attestor.reclaimprotocol.org/ws');
                        // No need for targetBaseUrl here, as `fetch` takes the full `originalUrl`

                        const fetchOptions = {
                            method: method,
                            headers: {
                                ...headers, // Copy headers from client (interceptor)
                                'X-App-Id': ctx.envAppId, // Add your App ID for API calls
                                'X-App-Secret': ctx.appSecret // Add your App Secret for API calls
                            },
                            body: body, // Forward the body
                        };

                        // Clean up headers that might cause issues with upstream (e.g., host/origin headers from client)
                        delete fetchOptions.headers['host'];
                        delete fetchOptions.headers['origin'];
                        delete fetchOptions.headers['ngrok-skip-browser-warning'];
                        delete fetchOptions.headers['sec-fetch-dest'];
                        delete fetchOptions.headers['sec-fetch-mode'];
                        delete fetchOptions.headers['sec-fetch-site'];
                        delete fetchOptions.headers['x-forwarded-for'];
                        delete fetchOptions.headers['x-forwarded-host'];
                        delete fetchOptions.headers['x-forwarded-proto'];
                        delete fetchOptions.headers['accept-encoding']; // Important for proxying compressed data
                        delete fetchOptions.headers['connection']; // Important for HTTP/1.1 vs HTTP/2 handling
                        // For WebSocket, sec-websocket-key, sec-websocket-version, etc., are handled by createProxyMiddleware.

                        console.log(`Background: Final fetch options to upstream:`, JSON.stringify(fetchOptions, null, 2));

                        // For HTTP requests, use native fetch from background script
                        if (!isWsProxy) {
                            const response = await fetch(originalUrl, fetchOptions);

                            if (!response.ok) {
                                const errorText = await response.text();
                                console.error(`Background Proxy: Upstream error: HTTP ${response.status} - ${response.statusText}. Details: ${errorText}`);
                                sendResponse({ success: false, error: `Proxy failed: HTTP ${response.status} - ${response.statusText}. Details: ${errorText}` });
                                return;
                            }

                            const responseBody = await response.text(); // Read as text for flexible relaying
                            const responseHeaders = Object.fromEntries(response.headers.entries());

                            // Send back status, headers, and body for content.js to relay to interceptor
                            sendResponse({
                                success: true,
                                proxiedResponse: {
                                    status: response.status,
                                    statusText: response.statusText,
                                    headers: responseHeaders,
                                    body: responseBody
                                }
                            });
                        } else {
                            // For WebSockets, declarativeNetRequest should handle redirection to our backend's WS proxy.
                            // This branch should ideally NOT be hit for WebSockets if DNR is working for WS.
                            console.warn("Background: PROXY_RECLAIM_API_CALL received for WebSocket. This should ideally be handled by declarativeNetRequest directly. Reporting success for now.");
                            sendResponse({ success: true, proxiedResponse: { status: 200, statusText: "Handled by DNR", headers: {}, body: "" } });
                        }

                    } catch (error) {
                        console.error('Background: Error during PROXY_RECLAIM_API_CALL:', error);
                        ctx.loggerService.logError({
                            error: `Background Proxy failed for ${originalUrl}: ${error.message}`,
                            type: ctx.LOG_TYPES.ERROR
                        });
                        sendResponse({ success: false, error: error.message });
                    }
                } else {
                    sendResponse({ success: false, error: 'Action not supported for this source/target.' });
                }
                return true; // For async response


            case ctx.MESSAGE_ACTIONS.OFFSCREEN_DOCUMENT_READY:
                if (source === ctx.MESSAGE_SOURCES.OFFSCREEN && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    console.log('Background: Received OFFSCREEN_DOCUMENT_READY signal.');
                    sendResponse({ success: true, message: "Background is ready for offscreen messages." });
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                break;

            case ctx.MESSAGE_ACTIONS.CLOSE_CURRENT_TAB:
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    if (sender.tab && sender.tab.id) {
                        chrome.tabs.remove(sender.tab.id, () => {
                            if (chrome.runtime.lastError) {
                                ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error closing tab:', chrome.runtime.lastError.message);
                                sendResponse({ success: false, error: chrome.runtime.lastError.message });
                            } else {
                                if (ctx.managedTabs.has(sender.tab.id)) {
                                    ctx.managedTabs.delete(sender.tab.id);
                                }
                                sendResponse({ success: true });
                            }
                        });
                    } else {
                        ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] CLOSE_CURRENT_TAB: No tab ID provided by sender.');
                        sendResponse({ success: false, error: 'No tab ID found to close.' });
                    }
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                return true;
            case ctx.MESSAGE_ACTIONS.FILTERED_REQUEST_FOUND:
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    // ⭐ ENHANCED: Debug message routing ⭐
                    console.log('🔍 [MESSAGE-ROUTER] FILTERED_REQUEST_FOUND received:', {
                        source,
                        target,
                        requestUrl: data.request?.url,
                        requestMethod: data.request?.method,
                        hasResponse: !!data.request?.responseText,
                        responseLength: data.request?.responseText?.length || 0,
                        criteriaHash: data.criteria?.requestHash,
                        sessionId: data.sessionId
                    });
                    
                    if (ctx.filteredRequests.has(data.criteria.requestHash)) {
                        console.log('📋 [MESSAGE-ROUTER] Request already processed, returning cached result');
                        sendResponse({ success: true, result: ctx.filteredRequests.get(data.criteria.requestHash) });
                    } else {
                        console.log('🚀 [MESSAGE-ROUTER] Processing new filtered request...');
                        console.log('📋 [MESSAGE-ROUTER] Storing request in filteredRequests Map:', {
                            criteriaHash: data.criteria.requestHash,
                            requestUrl: data.request?.url,
                            hasResponse: !!data.request?.responseText,
                            responseLength: data.request?.responseText?.length || 0
                        });
                        ctx.filteredRequests.set(data.criteria.requestHash, data.request);
                        const result = await ctx.processFilteredRequest(data.request, data.criteria, data.sessionId, data.loginUrl);
                        console.log('✅ [MESSAGE-ROUTER] ProcessFilteredRequest completed:', result);
                        sendResponse({ success: true, result });
                    }
                } else {
                    console.log('❌ [MESSAGE-ROUTER] FILTERED_REQUEST_FOUND: Invalid source/target combination');
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                break;
            case ctx.MESSAGE_ACTIONS.GET_CURRENT_TAB_ID:
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    sendResponse({ success: true, tabId: sender.tab?.id });
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                break;
            case 'FETCH_INJECTION_SCRIPT':
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    try {
                        const { providerId } = data;
                        const url = `https://api.reclaimprotocol.org/api/providers/${providerId}/custom-injection`;
                        
                        ctx.loggerService.log({
                            message: `Fetching injection script for provider: ${providerId}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: providerId,
                            appId: ctx.appId || 'unknown'
                        });

                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                'ngrok-skip-browser-warning': 'true'
                            }
                        });

                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }

                        const scriptContent = await response.text();
                        
                        if (!scriptContent || scriptContent.trim() === '') {
                            sendResponse({ 
                                success: false, 
                                error: 'No injection script content found' 
                            });
                            return;
                        }

                        sendResponse({
                            success: true,
                            scriptContent: scriptContent,
                            providerName: 'Unknown Provider' // Could be enhanced to fetch provider details
                        });
                    } catch (error) {
                        ctx.loggerService.log({
                            message: `Failed to fetch injection script: ${error.message}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: data?.providerId || 'unknown',
                            appId: ctx.appId || 'unknown'
                        });
                        sendResponse({ 
                            success: false, 
                            error: error.message 
                        });
                    }
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                return true; // For async response
            case 'EXECUTE_INJECTION_SCRIPT':
                if (source === ctx.MESSAGE_SOURCES.CONTENT_SCRIPT && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    try {
                        const { scriptContent, providerData } = data;
                        
                        ctx.loggerService.log({
                            message: `Executing injection script for provider: ${providerData?.name || 'Unknown'}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: providerData?.httpProviderId || 'unknown',
                            appId: ctx.appId || 'unknown'
                        });

                        // Execute the script in the background context (no CSP restrictions)
                        // We'll use a controlled approach to execute the script
                        try {
                            // Create a function from the script content and execute it
                            const scriptFunction = new Function(scriptContent);
                            scriptFunction();
                            
                            ctx.loggerService.log({
                                message: `Injection script executed successfully for provider: ${providerData?.name || 'Unknown'}`,
                                type: ctx.LOG_TYPES.BACKGROUND,
                                sessionId: ctx.sessionId || 'unknown',
                                providerId: providerData?.httpProviderId || 'unknown',
                                appId: ctx.appId || 'unknown'
                            });
                        } catch (scriptError) {
                            ctx.loggerService.log({
                                message: `Script execution error for provider ${providerData?.name || 'Unknown'}: ${scriptError.message}`,
                                type: ctx.LOG_TYPES.BACKGROUND,
                                sessionId: ctx.sessionId || 'unknown',
                                providerId: providerData?.httpProviderId || 'unknown',
                                appId: ctx.appId || 'unknown'
                            });
                            // Don't fail the entire operation, just log the script error
                        }

                        sendResponse({
                            success: true,
                            message: 'Injection script processed successfully'
                        });
                    } catch (error) {
                        ctx.loggerService.log({
                            message: `Failed to execute injection script: ${error.message}`,
                            type: ctx.LOG_TYPES.BACKGROUND,
                            sessionId: ctx.sessionId || 'unknown',
                            providerId: data?.providerData?.httpProviderId || 'unknown',
                            appId: ctx.appId || 'unknown'
                        });
                        sendResponse({ 
                            success: false, 
                            error: error.message 
                        });
                    }
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                return true; // For async response
            case ctx.MESSAGE_ACTIONS.RESET_SESSION:
                if (source === ctx.MESSAGE_SOURCES.POPUP && target === ctx.MESSAGE_SOURCES.BACKGROUND) {
                    try {
                        console.log('🔄 [MESSAGE-ROUTER] Resetting session state from popup request...');
                        
                        // Stop network data sync
                        if (ctx.stopNetworkDataSync) {
                            ctx.stopNetworkDataSync();
                        }
                        
                        // Clear all timers
                        if (ctx.sessionTimerManager) {
                            ctx.sessionTimerManager.clearAllTimers();
                        }
                        
                        // Close managed tabs
                        for (const tabId of ctx.managedTabs) {
                            try {
                                chrome.tabs.remove(tabId);
                            } catch (error) {
                                console.log(`⚠️ [MESSAGE-ROUTER] Error closing tab ${tabId}:`, error);
                            }
                        }
                        ctx.managedTabs.clear();
                        
                        // Reset session variables
                        ctx.activeTabId = null;
                        ctx.sessionId = null;
                        ctx.providerData = null;
                        ctx.parameters = null;
                        ctx.httpProviderId = null;
                        ctx.appId = null;
                        ctx.callbackUrl = null;
                        ctx.generatedProofs = new Map();
                        ctx.filteredRequests = new Map();
                        ctx.initPopupMessage = new Map();
                        ctx.providerDataMessage = new Map();
                        ctx.firstRequestReceived = false;
                        ctx.isProcessingQueue = false;
                        ctx.proofGenerationQueue = [];
                        
                        // Unregister request interceptors
                        if (ctx.unregisterRequestInterceptors) {
                            ctx.unregisterRequestInterceptors();
                        }
                        
                        console.log('✅ [MESSAGE-ROUTER] Session state reset completed');
                        
                        sendResponse({ 
                            success: true, 
                            message: 'Session state reset successfully' 
                        });
                    } catch (error) {
                        console.error('❌ [MESSAGE-ROUTER] Error resetting session:', error);
                        sendResponse({ 
                            success: false, 
                            error: error.message 
                        });
                    }
                } else {
                    sendResponse({ success: false, error: 'Action not supported' });
                }
                return true; // For async response
            default:
                console.warn(`Background: Unhandled action: ${action} from source: ${source}, target: ${target}`);
                sendResponse({ success: false, error: `Unhandled action: ${action}` });
        }
    } catch (error) {
        ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, `[BACKGROUND] Unhandled error in handleMessage for action ${action}:`, error);
        sendResponse({ success: false, error: error.message });
    }
    return true; // Required for async response
}