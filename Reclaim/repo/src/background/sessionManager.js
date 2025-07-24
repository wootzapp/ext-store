// Session management for background script
// Handles session start, fail, submit, and timer logic

import { registerRequestInterceptors, unregisterRequestInterceptors } from './webRequestInterceptor';

export async function startVerification(ctx, templateData) {    
    try {
        // Clear all the member variables before a new session
        ctx.providerData = null;
        ctx.parameters = null;
        ctx.httpProviderId = null;
        ctx.appId = null; // This appId will be set by sessionManager based on templateData.applicationId for session tracking
        ctx.sessionId = null;
        ctx.callbackUrl = null;
        ctx.generatedProofs = new Map();
        ctx.filteredRequests = new Map();
        ctx.initPopupMessage = new Map(); // Messages for content script initialization
        ctx.providerDataMessage = new Map(); // Messages for content script provider data

        // Reset timers and timer state variables
        ctx.sessionTimerManager.clearAllTimers();
        ctx.firstRequestReceived = false;

        // Populate context with initial data from the templateData
        ctx.sessionId = templateData.sessionId;
        ctx.appId = templateData.applicationId; // This is the AppId specific to the session/proof request
        ctx.httpProviderId = templateData.providerId; 
        ctx.callbackUrl = templateData.callbackUrl;
        if (templateData.parameters) {
            ctx.parameters = templateData.parameters;
        }

        ctx.loggerService.log({
            message: `SessionManager: Starting verification session for App ID: ${ctx.appId} (session), Provider ID: ${ctx.httpProviderId}`,
            type: ctx.LOG_TYPES.BACKGROUND,
            sessionId: ctx.sessionId,
            providerId: ctx.httpProviderId,
            appId: ctx.appId
        });

        // ⭐ CRITICAL MODIFICATION: Use ctx.envAppId (from .env) for authentication to Reclaim API ⭐
        // ctx.envAppId is the application ID loaded from your .env file
        // ctx.appSecret is the application secret loaded from your .env file
        if (!ctx.envAppId || !ctx.appSecret) {
            throw new Error('Application ID or Secret is missing from environment variables for provider data fetch.');
        }

        const providerData = await ctx.fetchProviderData(
            ctx.httpProviderId,
            ctx.sessionId,
            ctx.envAppId,  // ⭐ Pass ctx.envAppId (from .env) for API authentication ⭐
            ctx.appSecret  // ⭐ Pass ctx.appSecret (from .env) for API authentication ⭐
        );
        ctx.providerData = providerData;

        // Register network request interceptors (CSP-safe) instead of page script injection
        registerRequestInterceptors(ctx);

        // ⭐ ENHANCED: Use provider-specific login URL if provided, otherwise fall back to provider data ⭐
        const loginUrl = templateData.providerLoginUrl || providerData?.loginUrl;
        if (!loginUrl) {
            throw new Error('Provider login URL not found for session initialization.');
        }

        // Create the initial provider login tab
        const tab = await new Promise((resolve, reject) => {
            chrome.tabs.create({ url: loginUrl, active: true }, (newTab) => {
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(newTab);
                }
            });
        });

        if (tab && tab.id) {
            ctx.activeTabId = tab.id;
            ctx.managedTabs.add(tab.id);

            ctx.loggerService.log({
                message: `SessionManager: New provider tab created (ID: ${tab.id}) for login URL: ${loginUrl}`,
                type: ctx.LOG_TYPES.BACKGROUND,
                sessionId: ctx.sessionId,
                providerId: ctx.httpProviderId,
                appId: ctx.appId
            });

            const popupMessage = {
                action: ctx.MESSAGE_ACTIONS.SHOW_PROVIDER_VERIFICATION_POPUP,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                data: {
                    providerName: templateData.providerName || ctx.providerData?.name || 'Default Provider',
                    description: ctx.providerData?.description || 'Default Description',
                    dataRequired: ctx.providerData?.verificationConfig?.dataRequired || 'Default Data',
                    sessionId: ctx.sessionId
                }
            };
            const providerDataMessage = {
                action: ctx.MESSAGE_ACTIONS.PROVIDER_DATA_READY,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                data: {
                    providerData: ctx.providerData,
                    parameters: ctx.parameters,
                    sessionId: ctx.sessionId,
                    callbackUrl: ctx.callbackUrl,
                    httpProviderId: ctx.httpProviderId,
                    appId: ctx.appId
                }
            };

            ctx.initPopupMessage.set(tab.id, { message: popupMessage });
            ctx.providerDataMessage.set(tab.id, { message: providerDataMessage });

            await ctx.updateSessionStatus(ctx.sessionId, ctx.RECLAIM_SESSION_STATUS.USER_STARTED_VERIFICATION, ctx.httpProviderId, ctx.appId)
                .catch(error => {
                    ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[SESSION_MANAGER] Error updating session status after tab creation:', error);
                });
        } else {
            throw new Error("SessionManager: New tab could not be created or has no ID.");
        }

        return {
            success: true,
            message: 'Session initialized and provider login tab opening.'
        };
    } catch (error) {
        ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[SESSION_MANAGER] Error in startVerification:', error);
        ctx.failSession(`SessionManager failed: ${error.message}`);
        throw error;
    }
}

export async function failSession(ctx, errorMessage, requestHash) {
    try {
        ctx.loggerService.log({
            message: `SessionManager: Session failed - ${errorMessage}`,
            type: ctx.LOG_TYPES.BACKGROUND,
            sessionId: ctx.sessionId,
            providerId: ctx.httpProviderId,
            appId: ctx.appId
        });

        // ⭐ CRITICAL: Stop network data sync when session fails ⭐
        if (ctx.stopNetworkDataSync) {
            ctx.stopNetworkDataSync();
        }

        // Clear session timer
        ctx.sessionTimerManager.clearAllTimers();
        unregisterRequestInterceptors(ctx);

        if (ctx.sessionId) {
            try {
                await ctx.updateSessionStatus(ctx.sessionId, ctx.RECLAIM_SESSION_STATUS.PROOF_GENERATION_FAILED, ctx.httpProviderId, ctx.appId);
            } catch (error) {
                ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error updating session status to failed:', error);
            }
        }

        if (ctx.activeTabId) {
            chrome.tabs.sendMessage(ctx.activeTabId, {
                action: ctx.MESSAGE_ACTIONS.PROOF_GENERATION_FAILED,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                data: { requestHash: requestHash, error: errorMessage }
            }).catch(err => {
                ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error notifying content script of session failure:', err);
            });
        }
        // Also notify popup as it's the primary UI
        chrome.runtime.sendMessage({
            action: ctx.MESSAGE_ACTIONS.VERIFICATION_ERROR,
            source: ctx.MESSAGE_SOURCES.BACKGROUND,
            target: ctx.MESSAGE_SOURCES.POPUP,
            data: { error: errorMessage }
        }).catch(err => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error notifying popup of session failure:', err));


        ctx.proofGenerationQueue = [];
        ctx.isProcessingQueue = false;
    } catch (error) {
        ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error in failSession:', error);
    }
}

export async function submitProofs(ctx) {
    try {
        ctx.sessionTimerManager.clearAllTimers();

        if (ctx.generatedProofs.size === 0) {
            ctx.debugLogger.warn(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] submitProofs: No proofs generated.');
            await ctx.updateSessionStatus(ctx.sessionId, ctx.RECLAIM_SESSION_STATUS.PROOF_SUBMISSION_FAILED, ctx.httpProviderId, ctx.appId);
            throw new Error("No proofs to submit.");
        }
        
        if (ctx.providerData && ctx.generatedProofs.size !== ctx.providerData.requestData.length) {
            ctx.debugLogger.warn(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] submitProofs: Mismatch in expected vs generated proofs. Submitting anyway.');
        }

        const formattedProofs = [];
        if (ctx.providerData && ctx.providerData.requestData) {
            for (const requestData of ctx.providerData.requestData) {
                if (ctx.generatedProofs.has(requestData.requestHash)) {
                    const proof = ctx.generatedProofs.get(requestData.requestHash);
                    const formattedProof = ctx.formatProof(proof, requestData);
                    formattedProofs.push(formattedProof);
                } else {
                    ctx.debugLogger.warn(ctx.DebugLogType.BACKGROUND, `[BACKGROUND] Proof for ${requestData.requestHash} missing.`);
                }
            }
        } else {
            ctx.generatedProofs.forEach(proof => {
                formattedProofs.push(proof); 
                ctx.debugLogger.warn(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Submitting raw proof without specific requestData for formatting.');
            });
        }

        if (formattedProofs.length === 0) {
            ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] submitProofs: No formatted proofs to submit after filtering.');
            await ctx.updateSessionStatus(ctx.sessionId, ctx.RECLAIM_SESSION_STATUS.PROOF_SUBMISSION_FAILED, ctx.httpProviderId, ctx.appId);
            throw new Error("No proofs to submit.");
        }


        ctx.loggerService.log({
            message: `Background: Attempting to submit ${formattedProofs.length} proofs to callback URL.`,
            type: ctx.LOG_TYPES.BACKGROUND,
            sessionId: ctx.sessionId,
            providerId: ctx.httpProviderId,
            appId: ctx.appId
        });
        
        try {
            await ctx.submitProofOnCallback(formattedProofs, ctx.callbackUrl, ctx.sessionId, ctx.httpProviderId, ctx.appId);
            await ctx.updateSessionStatus(ctx.sessionId, ctx.RECLAIM_SESSION_STATUS.PROOF_SUBMITTED, ctx.httpProviderId, ctx.appId);
        } catch (error) {
            chrome.tabs.sendMessage(ctx.activeTabId, {
                action: ctx.MESSAGE_ACTIONS.PROOF_SUBMISSION_FAILED,
                source: ctx.MESSAGE_SOURCES.BACKGROUND,
                target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                data: { error: error.message }
            }).catch(err => ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error notifying content script of proof submission failure:', err));
            ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error submitting proof to callback:', error);
            await ctx.updateSessionStatus(ctx.sessionId, ctx.RECLAIM_SESSION_STATUS.PROOF_SUBMISSION_FAILED, ctx.httpProviderId, ctx.appId);
            throw error;
        }

        if (ctx.activeTabId) {
            try {
                await chrome.tabs.sendMessage(ctx.activeTabId, {
                    action: ctx.MESSAGE_ACTIONS.PROOF_SUBMITTED,
                    source: ctx.MESSAGE_SOURCES.BACKGROUND,
                    target: ctx.MESSAGE_SOURCES.CONTENT_SCRIPT,
                    data: { formattedProofs }
                });
            } catch (error) {
                ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error notifying content script after successful proof submission:', error);
            }
        }

        if (ctx.originalTabId) {
            try {
                setTimeout(async () => {
                    await chrome.tabs.update(ctx.originalTabId, { active: true });
                    if (ctx.activeTabId && ctx.activeTabId !== ctx.originalTabId) {
                        await chrome.tabs.remove(ctx.activeTabId);
                        ctx.activeTabId = null;
                    }
                    ctx.originalTabId = null;
                }, 3000);
            } catch (error) {
                ctx.debugLogger.error(ctx.DebugLogType.BACKGROUND, '[BACKGROUND] Error navigating back or closing tab:', error);
            }
        }
       
        return { success: true, message: "Proofs submitted successfully." };

    } finally {
        // Always remove listeners when submitProofs completes
        unregisterRequestInterceptors(ctx);
       
        // ⭐ CRITICAL: Always stop network data sync when submitProofs completes ⭐
        if (ctx.stopNetworkDataSync) {
            ctx.stopNetworkDataSync();
        }
    }
}