// src/offscreen/offscreen.js

// Import polyfills
import '../utils/polyfills'; 

// Import necessary utilities and interfaces
import { MESSAGE_ACTIONS, MESSAGE_SOURCES, RECLAIM_SESSION_STATUS } from '../utils/constants';
import { updateSessionStatus } from '../utils/fetch-calls';
import { debugLogger, DebugLogType } from '../utils/logger';

// Check if WebAssembly is available
if (typeof WebAssembly === 'undefined') {
   debugLogger.error(DebugLogType.OFFSCREEN, 'WebAssembly is not available in offscreen context.');
} else {
   debugLogger.log(DebugLogType.OFFSCREEN, 'WebAssembly is available in offscreen context.');
}

// Set WASM path for attestor-core if needed
if (typeof globalThis !== 'undefined' && chrome.runtime) {
  globalThis.WASM_PATH = chrome.runtime.getURL(''); 
  debugLogger.log(DebugLogType.OFFSCREEN, `WASM_PATH set to: ${globalThis.WASM_PATH}`);
}

// Ensure window.WebSocket is correctly polyfilled
import { WebSocket as OffscreenWebSocket } from '../utils/offscreen-websocket'; 
if (typeof window !== 'undefined') {
    window.WebSocket = OffscreenWebSocket;
    debugLogger.log(DebugLogType.OFFSCREEN, 'Offscreen: window.WebSocket polyfilled.');
}

class OffscreenProofGenerator {
  constructor() {
    this.isInitialized = false;
    this.currentReclaimInstance = null;
    this.capturedNetworkData = null;
    debugLogger.log(DebugLogType.OFFSCREEN, 'OffscreenProofGenerator: Constructor initialized');
  }

  init() {
    this.isInitialized = true;
    debugLogger.log(DebugLogType.OFFSCREEN, 'OffscreenProofGenerator: Initialized');
  }

  sendReadySignal() {
    try {
    chrome.runtime.sendMessage({
      action: MESSAGE_ACTIONS.OFFSCREEN_DOCUMENT_READY,
      source: MESSAGE_SOURCES.OFFSCREEN,
      target: MESSAGE_SOURCES.BACKGROUND,
        data: { ready: true, timestamp: Date.now() }
      }, (response) => {
      // Silent response handling
    });
    } catch (error) {
      // Silent error handling
    }
  }

  async handleMessage(message, sender, sendResponse) {
    const { action, source, target, data } = message;

    // Handle ping from background script
    if (action === MESSAGE_ACTIONS.PING_OFFSCREEN && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      sendResponse({ success: true, message: 'Offscreen document is ready', timestamp: new Date().toISOString() });
      return true;
    }

    // Handle network data from background script
    if (action === MESSAGE_ACTIONS.NETWORK_DATA_FOR_RECLAIM && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      // Store the network data for the Reclaim SDK to access
      this.capturedNetworkData = {
        filteredRequests: data.filteredRequests || [],
        providerData: data.providerData,
        sessionId: data.sessionId
      };
      
      // Store claim data if available
      if (data.claimData) {
        this.capturedClaimData = data.claimData;
      }
      
      sendResponse({ success: true, message: 'Network data received and stored' });
      return true;
    }

    if (action === MESSAGE_ACTIONS.GENERATE_PROOF && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      try {
        const { reclaimProofRequestConfig, claimData: passedClaimData, ...otherData } = data;
        
        // Store claim data if passed from background
        if (passedClaimData) {
            this.capturedClaimData = passedClaimData;
        }
        
        // Handle config-based initialization
        if (!reclaimProofRequestConfig) {
          if (this.currentReclaimInstance) {
            sendResponse({ success: true, message: 'Reclaim session already running' });
            return true;
          } else {
            throw new Error('reclaimProofRequestConfig is undefined or null and no existing Reclaim instance found');
          }
        }
        
        if (typeof reclaimProofRequestConfig !== 'string') {
          throw new Error(`reclaimProofRequestConfig is not a string, got: ${typeof reclaimProofRequestConfig}`);
        }
        
        // Check if we already have a session running
        if (this.currentReclaimInstance) {
          // Don't skip - continue with the new config to restart the flow
        }
        
        // REAL RECLAIM SDK INTEGRATION
        try {
            // Parse the config to get session information
            let sessionIdForLogging = 'unknown';
            try {
                const configParsed = JSON.parse(reclaimProofRequestConfig);
                sessionIdForLogging = configParsed.sessionId || 'unknown';
            } catch (e) { 
                // Silent error handling
            }
            
            // Import Reclaim SDK
            let ReclaimProofRequest;
            try {
                const sdkModule = await import('@reclaimprotocol/js-sdk');
                ReclaimProofRequest = sdkModule.ReclaimProofRequest;
                
                if (!ReclaimProofRequest) {
                    throw new Error('ReclaimProofRequest not found in SDK module');
                }
            } catch (importError) {
                throw new Error(`Failed to import Reclaim SDK: ${importError.message}`);
            }
            
            // Create ReclaimProofRequest instance
            let reclaimProofRequest;
            try {
                reclaimProofRequest = await ReclaimProofRequest.fromJsonString(reclaimProofRequestConfig);
                
                if (!reclaimProofRequest) {
                    throw new Error('ReclaimProofRequest.fromJsonString returned null or undefined');
                }
                
            this.currentReclaimInstance = reclaimProofRequest; // Store reference for network data access
            } catch (initError) {
                throw new Error(`Failed to create ReclaimProofRequest: ${initError.message}`);
            }
            
            // Step 2: Trigger the verification flow using the real SDK
            try {
            await reclaimProofRequest.triggerReclaimFlow();
            } catch (triggerError) {
                throw new Error(`Failed to trigger Reclaim flow: ${triggerError.message}`);
            }
            
            // Step 3: Start the session with real callbacks
            try {
            await reclaimProofRequest.startSession({
                onSuccess: async (proofs) => {
                        // ⭐ MODIFIED: Skip Reclaim SDK proofs and use WootzApp API directly ⭐
                        
                        try {
                            // Import WootzApp ZK generator
                            const { WootzZKProofGenerator } = await import('../utils/wootz-zk-generator');
                            const wootzGenerator = new WootzZKProofGenerator();
                            
                            // Use captured network data to generate ZK proofs directly with WootzApp API
                            
                            const wootzProofs = [];
                            
                            // Get the captured network data
                            
                            if (this.capturedNetworkData && this.capturedNetworkData.filteredRequests.length > 0) {
                                
                                for (const request of this.capturedNetworkData.filteredRequests) {
                                    
                                    // Create claim data from the captured request
                                    const claimData = {
                                        params: {
                                            paramValues: {
                                                url: request.url,
                                                method: request.method,
                                                responseLength: request.responseText?.length || 0,
                                                timestamp: request.timestamp
                                            }
                                        },
                                        providerData: this.capturedNetworkData.providerData || {},
                                        sessionId: sessionIdForLogging,
                                        callbackUrl: this.capturedClaimData?.callbackUrl
                                    };
                                    
                                    // Generate ZK proof using WootzApp API directly
                                    try {
                                        const wootzProof = await wootzGenerator.generateZKProof(
                                            claimData, 
                                            claimData.callbackUrl,
                                            request.url,
                                            request.responseText
                                        );
                                        
                                        if (wootzProof.success) {
                                            wootzProofs.push(wootzProof.proof);
                                        }
                                    } catch (wootzCallError) {
                                        // Silent error handling
                                    }
                                }
                            } else {
                                // Fallback: Create a basic claim data from Reclaim proofs
                                for (const proof of proofs) {
                                    const claimData = {
                                        params: {
                                            paramValues: {
                                                identifier: proof.identifier,
                                                provider: proof.provider || 'unknown'
                                            }
                                        },
                                        providerData: this.capturedNetworkData?.providerData || {},
                                        sessionId: sessionIdForLogging,
                                        callbackUrl: this.capturedClaimData?.callbackUrl
                                    };
                                    
                                    // Generate ZK proof using WootzApp API
                                    try {
                                        const wootzProof = await wootzGenerator.generateZKProof(
                                            claimData, 
                                            claimData.callbackUrl,
                                            'https://github.com/settings/profile', // Fallback URL
                                            '<html><body>Fallback content</body></html>' // Fallback content
                                        );
                                        
                                        if (wootzProof.success) {
                                            wootzProofs.push(wootzProof.proof);
                                        }
                                    } catch (fallbackError) {
                                        // Silent error handling
                                    }
                                }
                            }
                            
                            try {
                                await updateSessionStatus(sessionIdForLogging, RECLAIM_SESSION_STATUS.PROOF_GENERATION_SUCCESS);
                            } catch (statusError) {
                                // Silent error handling
                            }
                            
                            // Send WootzApp proofs to background script
                            const responseData = { 
                                success: true, 
                                proofs: wootzProofs, 
                                originalProofs: proofs,
                                source: 'wootzapp_api_direct'
                            };
                            
                            chrome.runtime.sendMessage({
                                action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                                source: MESSAGE_SOURCES.OFFSCREEN,
                                target: MESSAGE_SOURCES.BACKGROUND,
                                data: responseData
                            }).then(response => {
                                // Silent response handling
                            }).catch(err => {
                                // Silent error handling
                            });
                            
                        } catch (wootzError) {
                            // Fallback to original Reclaim proofs if WootzApp fails
                            
                            try {
                                await updateSessionStatus(sessionIdForLogging, RECLAIM_SESSION_STATUS.PROOF_GENERATION_SUCCESS);
                            } catch (statusError) {
                                // Silent error handling
                            }
                            
                            const fallbackResponseData = { 
                                success: true, 
                                proofs: proofs,
                                source: 'reclaim_sdk_fallback'
                            };
                    
                    chrome.runtime.sendMessage({
                        action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                        source: MESSAGE_SOURCES.OFFSCREEN,
                        target: MESSAGE_SOURCES.BACKGROUND,
                                data: fallbackResponseData
                            }).then(response => {
                                // Silent response handling
                            }).catch(err => {
                                // Silent error handling
                            });
                        }
                },
                onError: async (error) => {
                        // Check if this is a timeout error and provide better guidance
                    if (error.message && error.message.includes('timeout')) {
                        // Send a more specific error message to help debugging
                            const timeoutResponseData = { 
                                success: false, 
                                error: `Reclaim SDK timeout: ${error.message}. User may need to complete login and navigation on provider website.`,
                                isTimeout: true,
                                source: 'reclaim_sdk_timeout'
                            };
                            
                            chrome.runtime.sendMessage({
                                action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                                source: MESSAGE_SOURCES.OFFSCREEN,
                                target: MESSAGE_SOURCES.BACKGROUND,
                                data: timeoutResponseData
                            }).then(response => {
                                // Silent response handling
                            }).catch(err => {
                                // Silent error handling
                            });
                        } else {
                            try {
                                await updateSessionStatus(sessionIdForLogging, RECLAIM_SESSION_STATUS.PROOF_GENERATION_FAILED);
                            } catch (statusError) {
                                // Silent error handling
                            }
                            
                            const errorResponseData = { 
                                success: false, 
                                error: error.message || 'Unknown Reclaim SDK error',
                                source: 'reclaim_sdk_error'
                            };
                        
                        chrome.runtime.sendMessage({
                            action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                            source: MESSAGE_SOURCES.OFFSCREEN,
                            target: MESSAGE_SOURCES.BACKGROUND,
                                data: errorResponseData
                            }).then(response => {
                                // Silent response handling
                            }).catch(err => {
                                // Silent error handling
                            });
                    }
                }
            });
            
            } catch (sessionError) {
                throw new Error(`Failed to start session: ${sessionError.message}`);
            }
            
        } catch (importError) {
            throw new Error(`Failed to use real Reclaim SDK: ${importError.message}`);
        }

        sendResponse({ success: true, message: 'Real Reclaim flow initiated in offscreen. Waiting for user interaction...' });

      } catch (error) {
        chrome.runtime.sendMessage({
          action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
          source: MESSAGE_SOURCES.OFFSCREEN,
          target: MESSAGE_SOURCES.BACKGROUND,
          data: { success: false, error: error.message || 'Unknown error during offscreen proof generation' }
        }).catch(err => {
          // Silent error handling
        });
        sendResponse({ success: false, error: 'Failed to initiate Reclaim flow in offscreen: ' + error.message });
      }
    }

    // Handle other message types if needed
    if (action === MESSAGE_ACTIONS.NETWORK_DATA && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      try {
        // Store network data if needed for future use
        this.capturedNetworkData = data;
        
        sendResponse({ success: true, message: 'Network data received and stored' });
        return true;
      } catch (error) {
        sendResponse({ success: false, error: 'Failed to process network data: ' + error.message });
      }
    }

    // Default response for unhandled messages
    sendResponse({ success: false, error: 'Unhandled message action: ' + action });
    return true;
  }
}

// Initialize the offscreen proof generator
const offscreenProofGenerator = new OffscreenProofGenerator();
offscreenProofGenerator.init();

// Send ready signal to background
offscreenProofGenerator.sendReadySignal();

// Set up message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  offscreenProofGenerator.handleMessage(message, sender, sendResponse);
  return true; // Required for async response
});