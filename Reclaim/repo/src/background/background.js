// Import polyfills
import '../utils/polyfills';

// Import necessary utilities and libraries
import { fetchProviderData, updateSessionStatus, submitProofOnCallback } from '../utils/fetch-calls';
import { RECLAIM_SESSION_STATUS, MESSAGE_ACTIONS, MESSAGE_SOURCES } from '../utils/constants';
import { generateProof } from '../utils/proof-generator/proof-generator';
import { formatProof } from '../utils/proof-generator/proof-formatter';
import { createClaimObject } from '../utils/claim-creator';
import { loggerService, LOG_TYPES } from '../utils/logger';
import { SessionTimerManager } from '../utils/session-timer';
import { debugLogger, DebugLogType } from '../utils/logger';

import * as messageRouter from './messageRouter';
import * as sessionManager from './sessionManager';
import * as tabManager from './tabManager';
import * as proofQueue from './proofQueue';
import * as cookieUtils from './cookieUtils';

// Context object to hold shared state and dependencies
const ctx = {
    // State
    activeTabId: null,
    providerData: null,
    parameters: null,
    httpProviderId: null,
    appId: null, // This appId will be set by sessionManager based on templateData.applicationId for session tracking
    sessionId: null,
    callbackUrl: null,
    originalTabId: null,
    managedTabs: new Set(),
    generatedProofs: new Map(),
    filteredRequests: new Map(),
    proofGenerationQueue: [],
    isProcessingQueue: false,
    firstRequestReceived: false,
    initPopupMessage: new Map(),
    providerDataMessage: new Map(),
    // Timer
    sessionTimerManager: new SessionTimerManager(),
    // Constants and dependencies
    fetchProviderData,
    updateSessionStatus,
    submitProofOnCallback,
    RECLAIM_SESSION_STATUS,
    MESSAGE_ACTIONS,
    MESSAGE_SOURCES,
    generateProof,
    formatProof,
    createClaimObject,
    loggerService,
    LOG_TYPES,
    debugLogger,
    DebugLogType,
    // Methods to be set below
    processFilteredRequest: null,
    failSession: null,
    submitProofs: null,
    stopNetworkDataSync: null,
    // App ID and App Secret to context from hardcoded values
    envAppId: "0x7c74e6112781b2c5B80443fAfcf2Ea0b4c17EE16",     // This is the APP_ID for API calls
    appSecret: "0x31ee6280a945a1a5790042513941235b419e769e7c677ced8a107d82765a33b4" // This is the APP_SECRET for API calls - replace with actual value
};

// Bind sessionManager methods to context
ctx.failSession = (...args) => sessionManager.failSession(ctx, ...args);
ctx.submitProofs = (...args) => sessionManager.submitProofs(ctx, ...args);
ctx.stopNetworkDataSync = stopNetworkDataSync;

// Add processFilteredRequest to context (moved from class)
ctx.processFilteredRequest = async function (request, criteria, sessionId, loginUrl) {
    try {
        if (!ctx.firstRequestReceived) {
            ctx.firstRequestReceived = true;
            ctx.sessionTimerManager.startSessionTimer();
        }

        ctx.loggerService.log({
            message: `Received filtered request ${request.url} from content script for request hash: ${criteria.requestHash}`,
            type: ctx.LOG_TYPES.BACKGROUND,
            sessionId: ctx.sessionId || 'unknown',
            providerId: ctx.httpProviderId || 'unknown',
            appId: ctx.appId || 'unknown'
        });

        // ⭐ CRITICAL: Send captured network data to offscreen for Reclaim SDK ⭐
        // This ensures the Reclaim SDK has access to the network data it needs
        // ⭐ ENHANCED: Filter out requests without response bodies to prevent SDK timeout ⭐
        const allFilteredRequests = Array.from(ctx.filteredRequests.values());
        const requestsWithResponse = allFilteredRequests.filter(request =>
            request.responseText && request.responseText.length > 0
        );

        const networkData = {
            filteredRequests: requestsWithResponse,
            providerData: ctx.providerData,
            sessionId: ctx.sessionId
        };

        // Send network data to offscreen for Reclaim SDK
        chrome.runtime.sendMessage({
            action: ctx.MESSAGE_ACTIONS.NETWORK_DATA_FOR_RECLAIM,
            source: ctx.MESSAGE_SOURCES.BACKGROUND,
            target: ctx.MESSAGE_SOURCES.OFFSCREEN,
            data: networkData
        }).catch(err => {
            // Silent fail - offscreen may not be ready yet
        });

        // ⭐ ENHANCED: Start Reclaim SDK flow if we have pending config and network data ⭐
        if (ctx.pendingReclaimConfig && networkData.filteredRequests.length > 0) {

            // ⭐ ENHANCED: Send popup message to show verification UI ⭐
            try {
                chrome.tabs.sendMessage(ctx.activeTabId, {
                    action: ctx.MESSAGE_ACTIONS.SHOW_PROVIDER_VERIFICATION_POPUP,
                    source: ctx.MESSAGE_SOURCES.BACKGROUND,
                    target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                    data: {
                        providerName: ctx.providerData?.name || 'GitHub',
                        description: 'Please complete the verification process on this page',
                        dataRequired: 'Username and profile data',
                        sessionId: ctx.sessionId
                    }
                }).catch(err => {
                    // Silent fail - content script may not be ready
                });
            } catch (error) {
                // Silent fail - error sending popup message
            }

            // ⭐ ENHANCED: Retry mechanism for offscreen communication ⭐
            let retryCount = 0;
            const maxRetries = 3;
            let offscreenResponse = null;

            while (retryCount < maxRetries) {
                try {

                    offscreenResponse = await new Promise((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            reject(new Error('Offscreen communication timeout'));
                        }, 5000); // 5 second timeout

                        chrome.runtime.sendMessage({
                            action: ctx.MESSAGE_ACTIONS.GENERATE_PROOF,
                            source: ctx.MESSAGE_SOURCES.BACKGROUND,
                            target: ctx.MESSAGE_SOURCES.OFFSCREEN,
                            data: {
                                reclaimProofRequestConfig: ctx.pendingReclaimConfig
                            }
                        }, (response) => {
                            clearTimeout(timeout);
                            if (chrome.runtime.lastError) {
                                reject(new Error('Offscreen communication error: ' + chrome.runtime.lastError.message));
                            } else {
                                resolve(response);
                            }
                        });
                    });

                    break; // Success, exit retry loop

                } catch (error) {
                    retryCount++;

                    if (retryCount >= maxRetries) {
                        // Don't throw - let the process continue with network data
                    } else {
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }
            }

            if (offscreenResponse) {
            } else {
            }

            // Clear pending config since we've used it
            ctx.pendingReclaimConfig = null;
            ctx.pendingSessionId = null;
            ctx.pendingProviderId = null;
            ctx.pendingApplicationId = null;

        } 
    }catch (error) {
    }

    try {
        const cookies = await cookieUtils.getCookiesForUrl(request.url, ctx.debugLogger, ctx.DebugLogType);
        if (cookies) {
            request.cookieStr = cookies;
        }

        chrome.tabs.sendMessage(ctx.activeTabId, {
            action: ctx.MESSAGE_ACTIONS.CLAIM_CREATION_REQUESTED,
            source: ctx.MESSAGE_SOURCES.BACKGROUND,
            target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
            data: { requestHash: criteria.requestHash }
        });

        let claimData = null;
        try {
            claimData = await ctx.createClaimObject(request, ctx.providerData, sessionId, loginUrl, ctx.callbackUrl);
        } catch (error) {
            debugLogger.error(DebugLogType.BACKGROUND, 'Error creating claim object:', error);
            chrome.tabs.sendMessage(ctx.activeTabId, {
                action: ctx.MESSAGE_ACTIONS.CLAIM_CREATION_FAILED,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                data: { requestHash: criteria.requestHash }
            });
            ctx.failSession("Claim creation failed: " + error.message, criteria.requestHash);
            return { success: false, error: error.message };
        }

        if (claimData) {
            chrome.runtime.sendMessage({
                action: ctx.MESSAGE_ACTIONS.NETWORK_DATA_FOR_RECLAIM,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.OFFSCREEN,
                data: {
                    filteredRequests: [],
                    providerData: ctx.providerData,
                    sessionId: ctx.sessionId,
                    claimData: claimData
                }
            }).catch(err => {
                // Silent fail - offscreen may not be ready
            });

            chrome.tabs.sendMessage(ctx.activeTabId, {
                action: ctx.MESSAGE_ACTIONS.CLAIM_CREATION_SUCCESS,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                data: { requestHash: criteria.requestHash }
            });
            ctx.loggerService.log({
                message: `Claim Object creation successful for request hash: ${criteria.requestHash}`,
                type: ctx.LOG_TYPES.BACKGROUND,
                sessionId: ctx.sessionId || 'unknown',
                providerId: ctx.httpProviderId || 'unknown',
                appId: ctx.appId || 'unknown'
            });
        } else {
            ctx.loggerService.log({
                message: `Claim Object creation failed for request hash: ${criteria.requestHash}`,
                type: ctx.LOG_TYPES.BACKGROUND,
                sessionId: ctx.sessionId || 'unknown',
                providerId: ctx.httpProviderId || 'unknown',
                appId: ctx.appId || 'unknown'
            });
            ctx.failSession("Claim creation failed: No claim data returned", criteria.requestHash);
            return { success: false, error: 'No claim data returned' };
        }

        // ⭐ NEW: Use Wootz API for ZK proof generation instead of Reclaim SDK ⭐
        try {
            // Get page data from content script first
            const pageData = await this.getPageDataFromContentScript(ctx.activeTabId);

            const proofResult = await generateProof(claimData, pageData);

            if (proofResult.success) {
                chrome.tabs.sendMessage(ctx.activeTabId, {
                    action: ctx.MESSAGE_ACTIONS.PROOF_GENERATION_SUCCESS,
                    source: ctx.MESSAGE_SOURCES.BACKGROUND,
                    target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                    data: {
                        requestHash: criteria.requestHash,
                        proof: proofResult.proof,
                        callbackResponse: proofResult.callbackResponse
                    }
                });

                setTimeout(() => {
                    chrome.tabs.sendMessage(ctx.activeTabId, {
                        action: ctx.MESSAGE_ACTIONS.PROOF_SUBMITTED,
                        source: ctx.MESSAGE_SOURCES.BACKGROUND,
                        target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                        data: {
                            requestHash: criteria.requestHash,
                            proof: proofResult.proof,
                            callbackResponse: proofResult.callbackResponse
                        }
                    });
                }, 1000); // Small delay to show the progression

                return { success: true, message: "ZK proof generated and sent successfully" };
            } else {
                chrome.tabs.sendMessage(ctx.activeTabId, {
                    action: ctx.MESSAGE_ACTIONS.PROOF_GENERATION_FAILED,
                    source: ctx.MESSAGE_SOURCES.BACKGROUND,
                    target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                    data: {
                        requestHash: criteria.requestHash,
                        error: proofResult.error
                    }
                });

                return { success: false, error: proofResult.error };
            }
        } catch (error) {
            debugLogger.error(DebugLogType.BACKGROUND, 'Error in ZK proof generation:', error);

            chrome.tabs.sendMessage(ctx.activeTabId, {
                action: ctx.MESSAGE_ACTIONS.PROOF_GENERATION_FAILED,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                data: {
                    requestHash: criteria.requestHash,
                    error: error.message
                }
            });

            return { success: false, error: error.message };
        }
    } catch (error) {
        debugLogger.error(DebugLogType.BACKGROUND, 'Error processing filtered request:', error);
        ctx.failSession("Error processing request: " + error.message, criteria.requestHash);
        return { success: false, error: error.message };
    }
};

// Set up session timer callbacks
ctx.sessionTimerManager.setCallbacks(ctx.failSession);
ctx.sessionTimerManager.setTimerDuration(120000); // 2 minutes to allow time for user interaction

// ⭐ NEW: Helper function to get page data from content script ⭐
ctx.getPageDataFromContentScript = async function (tabId) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Timeout getting page data from content script'));
        }, 10000); // 10 second timeout

        chrome.tabs.sendMessage(tabId, {
            action: MESSAGE_ACTIONS.GET_PAGE_DATA,
            source: MESSAGE_SOURCES.BACKGROUND,
            target: MESSAGE_SOURCES.CONTENT_SCRIPT
        }, (response) => {
            clearTimeout(timeout);

            if (chrome.runtime.lastError) {
                console.error('❌ [BACKGROUND-DETAILED] Chrome runtime error:', {
                    error: chrome.runtime.lastError,
                    errorMessage: chrome.runtime.lastError.message,
                    timestamp: new Date().toISOString()
                });
                console.warn('Could not get page data from content script:', chrome.runtime.lastError.message);
                // Fallback to empty data
                const fallbackData = {
                    url: 'unknown',
                    content: ''
                };
                resolve(fallbackData);
                return;
            }

            if (response && response.success) {
                const pageData = {
                    url: response.url,
                    content: response.content
                };

                resolve(pageData);
            } else {
                console.error('❌ [BACKGROUND-DETAILED] Content script returned error:', {
                    hasResponse: !!response,
                    success: response?.success,
                    error: response?.error,
                    timestamp: new Date().toISOString()
                });
                console.warn('Content script returned no page data');

                const fallbackData = {
                    url: 'unknown',
                    content: ''
                };
                resolve(fallbackData);
            }
        });
    });
};

// Function to check if session is already in progress
function isSessionInProgress() {
    return !!(ctx.sessionId || ctx.activeTabId || ctx.providerData);
}

// ⭐ CRITICAL: Set up periodic network data sync to offscreen ⭐
// This ensures the Reclaim SDK always has access to the latest captured network data
let networkDataSyncInterval = null;

function startNetworkDataSync() {
    if (networkDataSyncInterval) {
        clearInterval(networkDataSyncInterval);
    }
    
    networkDataSyncInterval = setInterval(() => {
        // Only send if we have captured requests
        if (ctx.filteredRequests.size > 0) {
            // ⭐ ENHANCED: Filter out requests without response bodies ⭐
            const allFilteredRequests = Array.from(ctx.filteredRequests.values());
            const requestsWithResponse = allFilteredRequests.filter(request =>
                request.responseText && request.responseText.length > 0
            );

            if (requestsWithResponse.length > 0) {
            chrome.runtime.sendMessage({
                action: ctx.MESSAGE_ACTIONS.NETWORK_DATA_FOR_RECLAIM,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.OFFSCREEN,
                data: {
                        filteredRequests: requestsWithResponse,
                    providerData: ctx.providerData,
                    sessionId: ctx.sessionId
                }
            }).catch(err => {
                // Silent fail - offscreen may not be ready yet
            });
            }
        }
    }, 5000); // Send every 5 seconds
}

function stopNetworkDataSync() {
    if (networkDataSyncInterval) {
        clearInterval(networkDataSyncInterval);
        networkDataSyncInterval = null;
    }
}

// Start network data sync when session starts
startNetworkDataSync();

// Register message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // This is the main entry point for all messages received by the background script.
    // It delegates handling to the messageRouter.
    
    // Handle the message asynchronously
    messageRouter.handleMessage(message, sender, sendResponse, ctx).catch(error => {
        // Ensure error response is sent if the async operation fails
        sendResponse({ success: false, error: error.message });
    });
    
    return true; // Required for async response in Chrome Extensions
});

// Listen for tab removals to clean up managedTabs and reset session
chrome.tabs.onRemoved.addListener((tabId) => {

    if (ctx.managedTabs.has(tabId)) {
        ctx.managedTabs.delete(tabId);
    }

    // If the active tab was closed, reset the session
    if (ctx.activeTabId === tabId) {
        resetSessionState();
    }
});

// Listen for tab updates to detect navigation away from provider pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (ctx.managedTabs.has(tabId) && changeInfo.status === 'complete') {

        // If user navigated away from provider domain, consider session ended
        if (ctx.providerData && ctx.providerData.loginUrl) {
            const providerDomain = new URL(ctx.providerData.loginUrl).hostname;
            const currentDomain = tab.url ? new URL(tab.url).hostname : '';

            if (currentDomain && !currentDomain.includes(providerDomain)) {
                resetSessionState();
            }
        }
    }
});

// Function to reset session state
function resetSessionState() {

    // Stop network data sync
    stopNetworkDataSync();

    // Clear all timers
    if (ctx.sessionTimerManager) {
        ctx.sessionTimerManager.clearAllTimers();
    }

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
}