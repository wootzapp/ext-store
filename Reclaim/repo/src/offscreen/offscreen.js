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
      console.log('Offscreen: Sent OFFSCREEN_DOCUMENT_READY signal. Background response:', response);
    });
    } catch (error) {
      console.error('Offscreen: Error sending ready signal:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    const { action, source, target, data } = message;

    console.log('🔧 OFFScreen: Processing message:', { 
      action, 
      source, 
      target,
      hasData: !!data,
      dataKeys: data ? Object.keys(data) : [],
      timestamp: new Date().toISOString()
    });

    // Handle ping from background script
    if (action === MESSAGE_ACTIONS.PING_OFFSCREEN && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      console.log('🏓 OFFScreen: Received ping from background script');
      sendResponse({ success: true, message: 'Offscreen document is ready', timestamp: new Date().toISOString() });
      return true;
    }

    // Handle network data from background script
    if (action === MESSAGE_ACTIONS.NETWORK_DATA_FOR_RECLAIM && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      console.log('📡 OFFScreen: Received network data from background script');
      console.log('📊 OFFScreen: Network data details:', {
        hasFilteredRequests: !!data.filteredRequests,
        filteredRequestsCount: data.filteredRequests?.length || 0,
        hasProviderData: !!data.providerData,
        hasSessionId: !!data.sessionId,
        sessionId: data.sessionId,
        timestamp: new Date().toISOString()
      });
      
      // Log each filtered request
      if (data.filteredRequests && data.filteredRequests.length > 0) {
        console.log('📋 OFFScreen: Filtered requests details:');
        data.filteredRequests.forEach((request, index) => {
          console.log(`  Request ${index + 1}:`, {
            url: request.url,
            method: request.method,
            hasResponseText: !!request.responseText,
            responseLength: request.responseText?.length || 0,
            timestamp: request.timestamp
          });
        });
      }
      
      // Store the network data for the Reclaim SDK to access
      this.capturedNetworkData = {
        filteredRequests: data.filteredRequests || [],
        providerData: data.providerData,
        sessionId: data.sessionId
      };
      
      console.log('💾 OFFScreen: Network data stored successfully:', {
        storedRequestsCount: this.capturedNetworkData.filteredRequests.length,
        hasProviderData: !!this.capturedNetworkData.providerData,
        storedSessionId: this.capturedNetworkData.sessionId
      });
      
      // Store claim data if available
      if (data.claimData) {
        console.log('✅ OFFScreen: Received claim data with extracted parameters:', {
          hasClaimData: !!data.claimData,
          claimDataKeys: Object.keys(data.claimData),
          paramValues: data.claimData.params?.paramValues || {},
          hasProviderData: !!data.claimData.providerData,
          callbackUrl: data.claimData.callbackUrl
        });
        this.capturedClaimData = data.claimData;
      }
      
      sendResponse({ success: true, message: 'Network data received and stored' });
      return true;
    }

    if (action === MESSAGE_ACTIONS.GENERATE_PROOF && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      try {
        console.log('🔍 OFFScreen: Starting proof generation process...');
        console.log('📋 OFFScreen: Received GENERATE_PROOF data:', {
          hasReclaimConfig: !!data.reclaimProofRequestConfig,
          configLength: data.reclaimProofRequestConfig?.length || 0,
          hasClaimData: !!data.claimData,
          claimDataKeys: data.claimData ? Object.keys(data.claimData) : [],
          otherDataKeys: Object.keys(data).filter(key => !['reclaimProofRequestConfig', 'claimData'].includes(key))
        });
        
        const { reclaimProofRequestConfig, claimData: passedClaimData, ...otherData } = data;
        
        // Store claim data if passed from background
        if (passedClaimData) {
            console.log('✅ OFFScreen: Received claim data with extracted parameters:', {
              hasClaimData: !!passedClaimData,
              claimDataKeys: Object.keys(passedClaimData),
              paramValues: passedClaimData.params?.paramValues || {},
              hasProviderData: !!passedClaimData.providerData,
              callbackUrl: passedClaimData.callbackUrl
            });
            this.capturedClaimData = passedClaimData;
        }
        
        // Handle config-based initialization
        if (!reclaimProofRequestConfig) {
          console.log('⚠️ OFFScreen: No config provided in GENERATE_PROOF call');
          
          if (this.currentReclaimInstance) {
            console.log('✅ OFFScreen: Reclaim instance already exists, continuing with existing session');
            sendResponse({ success: true, message: 'Reclaim session already running' });
            return true;
          } else {
            throw new Error('reclaimProofRequestConfig is undefined or null and no existing Reclaim instance found');
          }
        }
        
        if (typeof reclaimProofRequestConfig !== 'string') {
          throw new Error(`reclaimProofRequestConfig is not a string, got: ${typeof reclaimProofRequestConfig}`);
        }
        
        console.log('📋 OFFScreen: Config validation passed:', {
          configLength: reclaimProofRequestConfig.length,
          configPreview: reclaimProofRequestConfig.substring(0, 200) + '...',
          configType: typeof reclaimProofRequestConfig,
          isEmpty: reclaimProofRequestConfig.length === 0
        });
        
        // Check if we already have a session running
        if (this.currentReclaimInstance) {
          console.log('⚠️ OFFScreen: Reclaim instance already exists, but continuing with new config');
          // Don't skip - continue with the new config to restart the flow
        }
        
        // REAL RECLAIM SDK INTEGRATION
        try {
            console.log('🔄 OFFScreen: Loading real Reclaim SDK...');
            console.log('📋 OFFScreen: Note: Reclaim SDK is used for session management and user verification flow only');
            console.log('📋 OFFScreen: ZK proof generation will be handled by WootzApp API directly');
            
            // Parse the config to get session information
            let sessionIdForLogging = 'unknown';
            try {
                const configParsed = JSON.parse(reclaimProofRequestConfig);
                sessionIdForLogging = configParsed.sessionId || 'unknown';
                console.log('📋 OFFScreen: Parsed config successfully:', {
                  sessionId: sessionIdForLogging,
                  configKeys: Object.keys(configParsed),
                  hasSessionId: !!configParsed.sessionId
                });
            } catch (e) { 
                console.warn('⚠️ OFFScreen: Could not parse config JSON:', {
                  error: e.message,
                  configPreview: reclaimProofRequestConfig.substring(0, 100) + '...'
                });
            }
            
            console.log('🔄 OFFScreen: Creating real ReclaimProofRequest from config...');
            
            // Import Reclaim SDK
            let ReclaimProofRequest;
            try {
                console.log('📦 OFFScreen: Importing Reclaim SDK module...');
                const sdkModule = await import('@reclaimprotocol/js-sdk');
                ReclaimProofRequest = sdkModule.ReclaimProofRequest;
                
                if (!ReclaimProofRequest) {
                    throw new Error('ReclaimProofRequest not found in SDK module');
                }
                
                console.log('✅ OFFScreen: Reclaim SDK imported successfully:', {
                  hasReclaimProofRequest: !!ReclaimProofRequest,
                  sdkModuleKeys: Object.keys(sdkModule)
                });
            } catch (importError) {
                console.error('❌ OFFScreen: Failed to import Reclaim SDK:', {
                  error: importError.message,
                  errorStack: importError.stack,
                  errorType: typeof importError
                });
                throw new Error(`Failed to import Reclaim SDK: ${importError.message}`);
            }
            
            // Create ReclaimProofRequest instance
            let reclaimProofRequest;
            try {
                console.log('🔧 OFFScreen: Creating ReclaimProofRequest from JSON string...');
                reclaimProofRequest = await ReclaimProofRequest.fromJsonString(reclaimProofRequestConfig);
                
                if (!reclaimProofRequest) {
                    throw new Error('ReclaimProofRequest.fromJsonString returned null or undefined');
                }
                
            this.currentReclaimInstance = reclaimProofRequest; // Store reference for network data access
                console.log('✅ OFFScreen: Successfully created real ReclaimProofRequest from config:', {
                  hasInstance: !!reclaimProofRequest,
                  instanceType: typeof reclaimProofRequest,
                  hasTriggerReclaimFlow: typeof reclaimProofRequest.triggerReclaimFlow === 'function',
                  hasStartSession: typeof reclaimProofRequest.startSession === 'function'
                });
            } catch (initError) {
                console.error('❌ OFFScreen: Failed to create ReclaimProofRequest:', {
                  error: initError.message,
                  errorStack: initError.stack,
                  errorType: typeof initError,
                  configLength: reclaimProofRequestConfig.length
                });
                throw new Error(`Failed to create ReclaimProofRequest: ${initError.message}`);
            }
            
            // Step 2: Trigger the verification flow using the real SDK
            console.log('🔄 OFFScreen: Triggering Reclaim flow with triggerReclaimFlow()...');
            try {
            await reclaimProofRequest.triggerReclaimFlow();
            console.log('✅ OFFScreen: Successfully triggered Reclaim flow');
            } catch (triggerError) {
                console.error('❌ OFFScreen: Failed to trigger Reclaim flow:', {
                  error: triggerError.message,
                  errorStack: triggerError.stack,
                  errorType: typeof triggerError
                });
                throw new Error(`Failed to trigger Reclaim flow: ${triggerError.message}`);
            }
            
            // Step 3: Start the session with real callbacks
            console.log('🔄 OFFScreen: Starting session with startSession()...');
            console.log('📋 OFFScreen: Session started - waiting for user to complete verification on provider website...');
            console.log('📋 OFFScreen: User should: 1) Log in to provider account, 2) Navigate to dashboard, 3) Complete verification');
            
            try {
            await reclaimProofRequest.startSession({
                onSuccess: async (proofs) => {
                    console.log('🎉 OFFScreen: REAL Reclaim verification SUCCESSFUL!');
                        console.log('📊 OFFScreen: Reclaim SDK proof details:', {
                          proofsCount: proofs.length,
                          proofsType: typeof proofs,
                          isArray: Array.isArray(proofs),
                          firstProofKeys: proofs.length > 0 ? Object.keys(proofs[0]) : []
                        });
                    console.log('📋 OFFScreen: Real proofs data:', JSON.stringify(proofs, null, 2));
                    
                        // ⭐ MODIFIED: Skip Reclaim SDK proofs and use WootzApp API directly ⭐
                        console.log('🔄 OFFScreen: Skipping Reclaim SDK proofs - using WootzApp API directly...');
                        
                        try {
                            // Import WootzApp ZK generator
                            console.log('📦 OFFScreen: Importing WootzApp ZK generator...');
                            const { WootzZKProofGenerator } = await import('../utils/wootz-zk-generator');
                            const wootzGenerator = new WootzZKProofGenerator();
                            
                            console.log('✅ OFFScreen: WootzApp ZK generator imported successfully:', {
                              hasGenerator: !!wootzGenerator,
                              generatorType: typeof wootzGenerator,
                              hasGenerateZKProof: typeof wootzGenerator.generateZKProof === 'function'
                            });
                            
                            // Use captured network data to generate ZK proofs directly with WootzApp API
                            console.log('🚀 OFFScreen: Generating ZK proofs directly with WootzApp API...');
                            
                            const wootzProofs = [];
                            
                            // Get the captured network data
                            console.log('📊 OFFScreen: Checking captured network data:', {
                              hasCapturedNetworkData: !!this.capturedNetworkData,
                              hasFilteredRequests: !!this.capturedNetworkData?.filteredRequests,
                              filteredRequestsCount: this.capturedNetworkData?.filteredRequests?.length || 0,
                              hasProviderData: !!this.capturedNetworkData?.providerData,
                              sessionId: this.capturedNetworkData?.sessionId
                            });
                            
                            if (this.capturedNetworkData && this.capturedNetworkData.filteredRequests.length > 0) {
                                console.log('📊 OFFScreen: Using captured network data for ZK proof generation');
                                
                                for (const request of this.capturedNetworkData.filteredRequests) {
                                    console.log('🔄 OFFScreen: Processing request for ZK proof:', {
                                      url: request.url,
                                      method: request.method,
                                      hasResponseText: !!request.responseText,
                                      responseLength: request.responseText?.length || 0,
                                      timestamp: request.timestamp
                                    });
                                    
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
                                    
                                    console.log('📋 OFFScreen: Created claim data for ZK proof:', {
                                      hasClaimData: !!claimData,
                                      claimDataKeys: Object.keys(claimData),
                                      paramValues: claimData.params?.paramValues || {},
                                      hasProviderData: !!claimData.providerData,
                                      callbackUrl: claimData.callbackUrl
                                    });
                                    
                                    // Generate ZK proof using WootzApp API directly
                                    console.log('🔧 OFFScreen: Calling WootzApp API for ZK proof generation...');
                                    try {
                                        const wootzProof = await wootzGenerator.generateZKProof(
                                            claimData, 
                                            claimData.callbackUrl,
                                            request.url,
                                            request.responseText
                                        );
                                        
                                        console.log('📊 OFFScreen: WootzApp API response:', {
                                          success: wootzProof.success,
                                          hasProof: !!wootzProof.proof,
                                          hasError: !!wootzProof.error,
                                          error: wootzProof.error,
                                          message: wootzProof.message
                                        });
                                        
                                        if (wootzProof.success) {
                                            wootzProofs.push(wootzProof.proof);
                                            console.log('✅ OFFScreen: WootzApp ZK proof generated successfully for:', request.url);
                                        } else {
                                            console.error('❌ OFFScreen: WootzApp ZK proof generation failed for:', {
                                              url: request.url,
                                              error: wootzProof.error,
                                              message: wootzProof.message
                                            });
                                        }
                                    } catch (wootzCallError) {
                                        console.error('❌ OFFScreen: Error calling WootzApp API:', {
                                          url: request.url,
                                          error: wootzCallError.message,
                                          errorStack: wootzCallError.stack,
                                          errorType: typeof wootzCallError
                                        });
                                    }
                                }
                            } else {
                                console.log('⚠️ OFFScreen: No captured network data available, using fallback approach');
                                
                                // Fallback: Create a basic claim data from Reclaim proofs
                                for (const proof of proofs) {
                                    console.log('🔄 OFFScreen: Creating fallback ZK proof for:', {
                                      identifier: proof.identifier,
                                      proofKeys: Object.keys(proof),
                                      hasClaimData: !!proof.claimData
                                    });
                                    
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
                                    
                                    console.log('📋 OFFScreen: Fallback claim data created:', {
                                      hasClaimData: !!claimData,
                                      claimDataKeys: Object.keys(claimData),
                                      paramValues: claimData.params?.paramValues || {}
                                    });
                                    
                                    // Generate ZK proof using WootzApp API
                                    try {
                                        const wootzProof = await wootzGenerator.generateZKProof(
                                            claimData, 
                                            claimData.callbackUrl,
                                            'https://github.com/settings/profile', // Fallback URL
                                            '<html><body>Fallback content</body></html>' // Fallback content
                                        );
                                        
                                        console.log('📊 OFFScreen: Fallback WootzApp API response:', {
                                          success: wootzProof.success,
                                          hasProof: !!wootzProof.proof,
                                          hasError: !!wootzProof.error,
                                          error: wootzProof.error
                                        });
                                        
                                        if (wootzProof.success) {
                                            wootzProofs.push(wootzProof.proof);
                                            console.log('✅ OFFScreen: Fallback WootzApp ZK proof generated for:', proof.identifier);
                                        } else {
                                            console.error('❌ OFFScreen: Fallback WootzApp ZK proof generation failed for:', {
                                              identifier: proof.identifier,
                                              error: wootzProof.error
                                            });
                                        }
                                    } catch (fallbackError) {
                                        console.error('❌ OFFScreen: Error in fallback WootzApp API call:', {
                                          identifier: proof.identifier,
                                          error: fallbackError.message,
                                          errorStack: fallbackError.stack
                                        });
                                    }
                                }
                            }
                            
                            console.log('🎉 OFFScreen: WootzApp API ZK proof generation completed!');
                            console.log('📊 OFFScreen: Final results:', {
                              totalZKProofs: wootzProofs.length,
                              hasProofs: wootzProofs.length > 0,
                              firstProofKeys: wootzProofs.length > 0 ? Object.keys(wootzProofs[0]) : []
                            });
                            
                            try {
                                await updateSessionStatus(sessionIdForLogging, RECLAIM_SESSION_STATUS.PROOF_GENERATION_SUCCESS);
                                console.log('✅ OFFScreen: Session status updated to PROOF_GENERATION_SUCCESS');
                            } catch (statusError) {
                                console.error("❌ OFFScreen: Error updating session status on success:", {
                                  error: statusError.message,
                                  errorStack: statusError.stack
                                });
                            }
                            
                            // Send WootzApp proofs to background script
                            console.log('📤 OFFScreen: Sending WootzApp proofs to background script...');
                            const responseData = { 
                                success: true, 
                                proofs: wootzProofs, 
                                originalProofs: proofs,
                                source: 'wootzapp_api_direct'
                            };
                            
                            console.log('📋 OFFScreen: Response data being sent:', {
                              success: responseData.success,
                              proofsCount: responseData.proofs.length,
                              hasOriginalProofs: !!responseData.originalProofs,
                              source: responseData.source
                            });
                            
                            chrome.runtime.sendMessage({
                                action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                                source: MESSAGE_SOURCES.OFFSCREEN,
                                target: MESSAGE_SOURCES.BACKGROUND,
                                data: responseData
                            }).then(response => {
                                console.log('✅ OFFScreen: Sent WootzApp success response to background:', {
                                  hasResponse: !!response,
                                  responseKeys: response ? Object.keys(response) : []
                                });
                            }).catch(err => {
                                console.error('❌ OFFScreen: Error sending success to background:', {
                                  error: err.message,
                                  errorStack: err.stack,
                                  errorType: typeof err
                                });
                            });
                            
                        } catch (wootzError) {
                            console.error('❌ OFFScreen: Failed to generate ZK proofs with WootzApp API:', {
                              error: wootzError.message,
                              errorStack: wootzError.stack,
                              errorType: typeof wootzError
                            });
                            
                            // Fallback to original Reclaim proofs if WootzApp fails
                            console.log('🔄 OFFScreen: Falling back to original Reclaim proofs...');
                            
                            try {
                                await updateSessionStatus(sessionIdForLogging, RECLAIM_SESSION_STATUS.PROOF_GENERATION_SUCCESS);
                                console.log('✅ OFFScreen: Session status updated to PROOF_GENERATION_SUCCESS (fallback)');
                            } catch (statusError) {
                                console.error("❌ OFFScreen: Error updating session status on success:", {
                                  error: statusError.message,
                                  errorStack: statusError.stack
                                });
                            }
                            
                            const fallbackResponseData = { 
                                success: true, 
                                proofs: proofs,
                                source: 'reclaim_sdk_fallback'
                            };
                            
                            console.log('📋 OFFScreen: Fallback response data being sent:', {
                              success: fallbackResponseData.success,
                              proofsCount: fallbackResponseData.proofs.length,
                              source: fallbackResponseData.source
                            });
                    
                    chrome.runtime.sendMessage({
                        action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                        source: MESSAGE_SOURCES.OFFSCREEN,
                        target: MESSAGE_SOURCES.BACKGROUND,
                                data: fallbackResponseData
                            }).then(response => {
                                console.log('✅ OFFScreen: Sent fallback Reclaim success response to background:', {
                                  hasResponse: !!response,
                                  responseKeys: response ? Object.keys(response) : []
                                });
                            }).catch(err => {
                                console.error('❌ OFFScreen: Error sending fallback success to background:', {
                                  error: err.message,
                                  errorStack: err.stack,
                                  errorType: typeof err
                                });
                            });
                        }
                },
                onError: async (error) => {
                        console.error('❌ OFFScreen: REAL Reclaim verification FAILED:', {
                          error: error.message || 'Unknown error',
                          errorStack: error.stack,
                          errorType: typeof error,
                          errorKeys: error ? Object.keys(error) : [],
                          timestamp: new Date().toISOString()
                        });
                    console.error('❌ OFFScreen: Error details:', error.message || 'Unknown error');
                    console.error('❌ OFFScreen: Error stack:', error.stack);
                    
                        // Check if this is a timeout error and provide better guidance
                    if (error.message && error.message.includes('timeout')) {
                        console.log('⚠️ OFFScreen: Timeout detected - this usually means:');
                        console.log('   1. User needs to log in to the provider website');
                        console.log('   2. User needs to navigate to their profile/dashboard');
                        console.log('   3. Network requests need to be captured by chrome.webRequest');
                        console.log('   4. The Reclaim SDK needs access to the captured data');
                        
                        // Send a more specific error message to help debugging
                            const timeoutResponseData = { 
                                success: false, 
                                error: `Reclaim SDK timeout: ${error.message}. User may need to complete login and navigation on provider website.`,
                                isTimeout: true,
                                source: 'reclaim_sdk_timeout'
                            };
                            
                            console.log('📋 OFFScreen: Timeout response data being sent:', {
                              success: timeoutResponseData.success,
                              error: timeoutResponseData.error,
                              isTimeout: timeoutResponseData.isTimeout,
                              source: timeoutResponseData.source
                            });
                            
                            chrome.runtime.sendMessage({
                                action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                                source: MESSAGE_SOURCES.OFFSCREEN,
                                target: MESSAGE_SOURCES.BACKGROUND,
                                data: timeoutResponseData
                            }).then(response => {
                                console.log('✅ OFFScreen: Sent timeout error response to background:', {
                                  hasResponse: !!response,
                                  responseKeys: response ? Object.keys(response) : []
                                });
                            }).catch(err => {
                                console.error('❌ OFFScreen: Error sending timeout error to background:', {
                                  error: err.message,
                                  errorStack: err.stack,
                                  errorType: typeof err
                                });
                            });
                        } else {
                            try {
                                await updateSessionStatus(sessionIdForLogging, RECLAIM_SESSION_STATUS.PROOF_GENERATION_FAILED);
                                console.log('✅ OFFScreen: Session status updated to PROOF_GENERATION_FAILED');
                            } catch (statusError) {
                                console.error("❌ OFFScreen: Error updating session status on error:", {
                                  error: statusError.message,
                                  errorStack: statusError.stack
                                });
                            }
                            
                            const errorResponseData = { 
                                success: false, 
                                error: error.message || 'Unknown Reclaim SDK error',
                                source: 'reclaim_sdk_error'
                            };
                            
                            console.log('📋 OFFScreen: Error response data being sent:', {
                              success: errorResponseData.success,
                              error: errorResponseData.error,
                              source: errorResponseData.source
                            });
                        
                        chrome.runtime.sendMessage({
                            action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
                            source: MESSAGE_SOURCES.OFFSCREEN,
                            target: MESSAGE_SOURCES.BACKGROUND,
                                data: errorResponseData
                            }).then(response => {
                                console.log('✅ OFFScreen: Sent error response to background:', {
                                  hasResponse: !!response,
                                  responseKeys: response ? Object.keys(response) : []
                                });
                            }).catch(err => {
                                console.error('❌ OFFScreen: Error sending error to background:', {
                                  error: err.message,
                                  errorStack: err.stack,
                                  errorType: typeof err
                                });
                            });
                    }
                }
            });
            
            console.log('✅ OFFScreen: Real Reclaim SDK flow initialized successfully');
            } catch (sessionError) {
                console.error('❌ OFFScreen: Failed to start session:', sessionError);
                throw new Error(`Failed to start session: ${sessionError.message}`);
            }
            
        } catch (importError) {
            console.error('❌ OFFScreen: Failed to use real Reclaim SDK:', importError);
            throw new Error(`Failed to use real Reclaim SDK: ${importError.message}`);
        }

        sendResponse({ success: true, message: 'Real Reclaim flow initiated in offscreen. Waiting for user interaction...' });

      } catch (error) {
        console.error('Offscreen: Error in GENERATE_PROOF action:', error);
        chrome.runtime.sendMessage({
          action: MESSAGE_ACTIONS.GENERATED_PROOF_RESPONSE,
          source: MESSAGE_SOURCES.OFFSCREEN,
          target: MESSAGE_SOURCES.BACKGROUND,
          data: { success: false, error: error.message || 'Unknown error during offscreen proof generation' }
        }).catch(err => console.error('Offscreen: Error sending error to background:', err));
        sendResponse({ success: false, error: 'Failed to initiate Reclaim flow in offscreen: ' + error.message });
      }
    }

    // Handle other message types if needed
    if (action === MESSAGE_ACTIONS.NETWORK_DATA && source === MESSAGE_SOURCES.BACKGROUND && target === MESSAGE_SOURCES.OFFSCREEN) {
      try {
        console.log('📡 OFFScreen: Received network data from background');
        console.log('📊 OFFScreen: Network data:', data);
        
        // Store network data if needed for future use
        this.capturedNetworkData = data;
        
        sendResponse({ success: true, message: 'Network data received and stored' });
        return true;
      } catch (error) {
        console.error('Offscreen: Error processing network data:', error);
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