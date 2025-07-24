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
    // ⭐ ADDED: App ID and App Secret to context from hardcoded values ⭐
    envAppId: "0x7c74e6112781b2c5B80443fAfcf2Ea0b4c17EE16",     // This is the APP_ID for API calls
    appSecret: "0x31ee6280a945a1a5790042513941235b419e769e7c677ced8a107d82765a33b4" // This is the APP_SECRET for API calls - replace with actual value
};
console.log("Background script is definitely loading and running!");
console.log("Background: APP_ID loaded:", ctx.envAppId ? 'Yes (Value present)' : 'No (Value missing)');
console.log("Background: APP_SECRET loaded:", ctx.appSecret ? 'Yes (Value present)' : 'No (Value missing)');

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

        console.log('🔍 Background: Filtering requests for Reclaim SDK:');
        console.log(`  Total filtered requests: ${allFilteredRequests.length}`);
        console.log(`  Requests with response body: ${requestsWithResponse.length}`);

        const networkData = {
            filteredRequests: requestsWithResponse,
            providerData: ctx.providerData,
            sessionId: ctx.sessionId
        };

        // ⭐ DEBUG: Log network data being sent to offscreen ⭐
        console.log('📡 Background: Sending network data to offscreen:', {
            filteredRequestsCount: networkData.filteredRequests.length,
            providerDataAvailable: !!networkData.providerData,
            sessionId: networkData.sessionId
        });

        if (networkData.filteredRequests.length > 0) {
            console.log('🔍 Background: Filtered requests being sent:');
            networkData.filteredRequests.forEach((request, index) => {
                console.log(`  ${index + 1}. ${request.method} ${request.url} - hasResponse: ${!!request.responseText}, responseLength: ${request.responseText?.length || 0}`);
            });
        }

        // Send network data to offscreen for Reclaim SDK
        chrome.runtime.sendMessage({
            action: ctx.MESSAGE_ACTIONS.NETWORK_DATA_FOR_RECLAIM,
            source: ctx.MESSAGE_SOURCES.BACKGROUND,
            target: ctx.MESSAGE_SOURCES.OFFSCREEN,
            data: networkData
        }).catch(err => {
            console.warn('Background: Could not send network data to offscreen (offscreen may not be ready):', err);
        });

        // ⭐ ENHANCED: Start Reclaim SDK flow if we have pending config and network data ⭐
        if (ctx.pendingReclaimConfig && networkData.filteredRequests.length > 0) {
            console.log('🚀 Background: Network data captured - enhancing Reclaim SDK flow with captured data...');

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
                    console.warn('Background: Could not send popup message to content script:', err);
                });
            } catch (error) {
                console.warn('Background: Error sending popup message:', error);
            }

            // ⭐ ENHANCED: Retry mechanism for offscreen communication ⭐
            let retryCount = 0;
            const maxRetries = 3;
            let offscreenResponse = null;

            while (retryCount < maxRetries) {
                try {
                    console.log(`🔄 Background: Attempting offscreen communication (attempt ${retryCount + 1}/${maxRetries})...`);

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

                    console.log('✅ Background: Offscreen communication successful:', offscreenResponse);
                    break; // Success, exit retry loop

                } catch (error) {
                    retryCount++;
                    console.warn(`⚠️ Background: Offscreen communication attempt ${retryCount} failed:`, error);

                    if (retryCount >= maxRetries) {
                        console.error('❌ Background: All offscreen communication attempts failed');
                        // Don't throw - let the process continue with network data
                    } else {
                        // Wait before retry
                        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
                    }
                }
            }

            if (offscreenResponse) {
                console.log('✅ Background: Reclaim SDK flow started successfully');
            } else {
                console.log('⚠️ Background: Reclaim SDK flow not started - continuing with ZK proof generation');
            }

            // Clear pending config since we've used it
            ctx.pendingReclaimConfig = null;
            ctx.pendingSessionId = null;
            ctx.pendingProviderId = null;
            ctx.pendingApplicationId = null;

        } 
    }catch (error) {
        console.error('❌ Background: Failed to start Reclaim SDK flow:', error);
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

        // ⭐ ENHANCED: Debug claim creation process ⭐
        console.log('🔍 Background: Starting claim creation process...');
        console.log('📋 Background: Request data:', {
            url: request.url,
            method: request.method,
            hasBody: !!request.body,
            hasResponse: !!request.responseText,
            responseLength: request.responseText ? request.responseText.length : 0
        });
        console.log('📋 Background: Provider data:', {
            name: ctx.providerData?.name,
            hasResponseMatches: !!ctx.providerData?.responseMatches,
            responseMatchesCount: ctx.providerData?.responseMatches?.length || 0,
            hasResponseRedactions: !!ctx.providerData?.responseRedactions,
            responseRedactionsCount: ctx.providerData?.responseRedactions?.length || 0
        });

        let claimData = null;
        try {
            console.log('🚀 Background: Calling createClaimObject...');
            claimData = await ctx.createClaimObject(request, ctx.providerData, sessionId, loginUrl, ctx.callbackUrl);
            console.log('✅ Background: Claim creation completed:', {
                hasClaimData: !!claimData,
                claimType: typeof claimData
            });
        } catch (error) {
            console.error('❌ Background: Error creating claim object:', error);
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
            console.log('🎉 Background: Claim creation successful!');
            console.log('📊 Background: Claim data:', {
                hasParams: !!claimData.params,
                hasSecretParams: !!claimData.secretParams,
                paramValuesCount: claimData.params?.paramValues ? Object.keys(claimData.params.paramValues).length : 0,
                secretParamValuesCount: claimData.secretParams?.paramValues ? Object.keys(claimData.secretParams.paramValues).length : 0
            });

            // ⭐ NEW: Send claim data to offscreen script ⭐
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
                console.warn('Background: Could not send claim data to offscreen:', err);
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
            console.log('❌ Background: Claim creation failed - no claim data returned');
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
            console.log('🚀 Background: Starting ZK proof generation with Wootz API...');
            console.log('📋 Background: Claim data for ZK proof:', {
                hasClaimData: !!claimData,
                claimDataKeys: claimData ? Object.keys(claimData) : [],
                providerName: claimData?.providerData?.name,
                extractedParams: claimData?.params?.paramValues || {},
                timestamp: new Date().toISOString()
            });

            // Get page data from content script first
            console.log('📄 Background: Getting page data from content script...');
            const pageData = await this.getPageDataFromContentScript(ctx.activeTabId);

            console.log('✅ Background: Page data received:', {
                hasPageData: !!pageData,
                pageUrl: pageData?.url,
                pageContentLength: pageData?.content ? pageData.content.length : 0,
                pageContentPreview: pageData?.content ? pageData.content.substring(0, 200) + '...' : 'N/A'
            });

            // Import the proof generator
            console.log('📦 Background: Importing proof generator...');
            const { generateProof } = await import('../utils/proof-generator/proof-generator.js');

            // Generate ZK proof with page data
            console.log('🔧 Background: Calling generateProof with data:', {
                hasClaimData: !!claimData,
                hasPageData: !!pageData,
                timestamp: new Date().toISOString()
            });

            const proofResult = await generateProof(claimData, pageData);

            console.log('📊 Background: Proof result received:', {
                success: proofResult.success,
                hasProof: !!proofResult.proof,
                hasError: !!proofResult.error,
                error: proofResult.error,
                message: proofResult.message,
                timestamp: new Date().toISOString()
            });

            if (proofResult.success) {
                console.log('✅ Background: ZK proof generation successful!');
                console.log('📊 Background: Proof details:', {
                    proofSize: proofResult.proof ? JSON.stringify(proofResult.proof).length : 0,
                    hasCallbackResponse: !!proofResult.callbackResponse,
                    callbackResponseKeys: proofResult.callbackResponse ? Object.keys(proofResult.callbackResponse) : [],
                    message: proofResult.message,
                    proofKeys: proofResult.proof ? Object.keys(proofResult.proof) : []
                });

                // Send success message to content script
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

                // Send proof submitted message to show final success state
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
                console.error('❌ Background: ZK proof generation failed:', {
                    error: proofResult.error,
                    errorType: typeof proofResult.error,
                    hasMessage: !!proofResult.message,
                    message: proofResult.message,
                    timestamp: new Date().toISOString()
                });

                // Send failure message to content script
                console.log('📤 Background: Sending failure message to content script...');
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
            console.error('❌ Background: Error in ZK proof generation:', {
                error: error,
                errorMessage: error.message,
                errorStack: error.stack,
                errorType: typeof error,
                timestamp: new Date().toISOString()
            });

            // Send failure message to content script
            console.log('📤 Background: Sending error message to content script...');
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
    console.log('📄 [BACKGROUND-DETAILED] getPageDataFromContentScript called:', {
        tabId: tabId,
        hasChrome: typeof chrome !== 'undefined',
        hasTabs: typeof chrome !== 'undefined' && !!chrome.tabs,
        hasSendMessage: typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.sendMessage === 'function',
        timestamp: new Date().toISOString()
    });

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            console.error('⏰ [BACKGROUND-DETAILED] Timeout getting page data from content script after 10 seconds');
            reject(new Error('Timeout getting page data from content script'));
        }, 10000); // 10 second timeout

        console.log('📤 [BACKGROUND-DETAILED] Sending GET_PAGE_DATA message to content script...');
        chrome.tabs.sendMessage(tabId, {
            action: MESSAGE_ACTIONS.GET_PAGE_DATA,
            source: MESSAGE_SOURCES.BACKGROUND,
            target: MESSAGE_SOURCES.CONTENT_SCRIPT
        }, (response) => {
            clearTimeout(timeout);

            console.log('📥 [BACKGROUND-DETAILED] Response received from content script:', {
                hasResponse: !!response,
                responseType: typeof response,
                responseKeys: response ? Object.keys(response) : [],
                success: response?.success,
                hasUrl: !!response?.url,
                hasContent: !!response?.content,
                contentLength: response?.content ? response.content.length : 0,
                error: response?.error,
                timestamp: new Date().toISOString()
            });

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
                console.log('🔄 [BACKGROUND-DETAILED] Using fallback data:', fallbackData);
                resolve(fallbackData);
                return;
            }

            if (response && response.success) {
                const pageData = {
                    url: response.url,
                    content: response.content
                };

                console.log('✅ [BACKGROUND-DETAILED] Successfully resolved page data:', {
                    url: pageData.url,
                    contentLength: pageData.content.length,
                    timestamp: new Date().toISOString()
                });

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
                console.log('🔄 [BACKGROUND-DETAILED] Using fallback data due to error:', fallbackData);
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

// ⭐ ENHANCED: Debug background script initialization ⭐
console.log('🚀 Background: Script initialized and ready to receive messages');
console.log('📡 Background: Message listener registered');
console.log('🔄 Background: Network data sync started');

// Register message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // ⭐ ENHANCED: Debug all incoming messages ⭐
    console.log('📡 Background: Received message:', {
        action: message.action,
        source: message.source,
        target: message.target,
        hasData: !!message.data,
        dataKeys: message.data ? Object.keys(message.data) : [],
        senderTabId: sender.tab?.id
    });

    // This is the main entry point for all messages received by the background script.
    // It delegates handling to the messageRouter.
    messageRouter.handleMessage(ctx, message, sender, sendResponse);
    return true; // Required for async response in Chrome Extensions
});

// Listen for tab removals to clean up managedTabs and reset session
chrome.tabs.onRemoved.addListener((tabId) => {
    console.log('🗑️ [BACKGROUND-CLEANUP] Tab removed:', {
        tabId: tabId,
        isManagedTab: ctx.managedTabs.has(tabId),
        isActiveTab: ctx.activeTabId === tabId,
        timestamp: new Date().toISOString()
    });

    if (ctx.managedTabs.has(tabId)) {
        ctx.managedTabs.delete(tabId);
        console.log('✅ [BACKGROUND-CLEANUP] Removed from managed tabs');
    }

    // If the active tab was closed, reset the session
    if (ctx.activeTabId === tabId) {
        console.log('🔄 [BACKGROUND-CLEANUP] Active tab closed - resetting session state');
        resetSessionState();
    }
});

// Listen for tab updates to detect navigation away from provider pages
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (ctx.managedTabs.has(tabId) && changeInfo.status === 'complete') {
        console.log('🔄 [BACKGROUND-CLEANUP] Managed tab updated:', {
            tabId: tabId,
            url: tab.url,
            isActiveTab: ctx.activeTabId === tabId,
            timestamp: new Date().toISOString()
        });

        // If user navigated away from provider domain, consider session ended
        if (ctx.providerData && ctx.providerData.loginUrl) {
            const providerDomain = new URL(ctx.providerData.loginUrl).hostname;
            const currentDomain = tab.url ? new URL(tab.url).hostname : '';

            if (currentDomain && !currentDomain.includes(providerDomain)) {
                console.log('🚪 [BACKGROUND-CLEANUP] User navigated away from provider domain - resetting session');
                resetSessionState();
            }
        }
    }
});

// Function to reset session state
function resetSessionState() {
    console.log('🔄 [BACKGROUND-CLEANUP] Resetting session state...');

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

    console.log('✅ [BACKGROUND-CLEANUP] Session state reset completed');
}