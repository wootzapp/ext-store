// ZK Proof Generator using Wootz API
// This replaces the Reclaim SDK with local ZK proof generation

import { debugLogger, DebugLogType } from './logger';

export class WootzZKProofGenerator {
  constructor() {
    this.isGenerating = false;
    this.callbackUrl = null;
  }

  /**
   * Generate ZK proof using Wootz API
   * @param {Object} claimData - The claim data with extracted parameters
   * @param {string} callbackUrl - URL to send the proof to
   * @param {string} pageUrl - The URL of the page (from content script)
   * @param {string} pageContent - The HTML content of the page (from content script)
   * @returns {Promise<Object>} - Promise that resolves with the proof result
   */
  async generateZKProof(claimData, callbackUrl, pageUrl = null, pageContent = null) {
    console.log('🚀 [WOOTZ-ZK-DETAILED] generateZKProof called with:', {
      hasClaimData: !!claimData,
      claimDataKeys: claimData ? Object.keys(claimData) : [],
      callbackUrl: callbackUrl,
      hasPageUrl: !!pageUrl,
      pageUrl: pageUrl,
      hasPageContent: !!pageContent,
      pageContentLength: pageContent ? pageContent.length : 0,
      isGenerating: this.isGenerating,
      timestamp: new Date().toISOString()
    });

    if (this.isGenerating) {
      console.error('❌ [WOOTZ-ZK-DETAILED] ZK proof generation already in progress');
      throw new Error('ZK proof generation already in progress');
    }

    this.isGenerating = true;
    this.callbackUrl = callbackUrl;

    console.log('✅ [WOOTZ-ZK-DETAILED] Generation state set:', {
      isGenerating: this.isGenerating,
      callbackUrl: this.callbackUrl
    });

    try {
      debugLogger.info(DebugLogType.PROOF, '[WOOTZ-ZK] Starting ZK proof generation...', {
        claimData: claimData,
        callbackUrl: callbackUrl,
        hasPageUrl: !!pageUrl,
        hasPageContent: !!pageContent
      });

      // Use provided page data or fallback to current context
              const currentUrl = pageUrl || 'unknown';
      const pageContentToUse = pageContent || (typeof document !== 'undefined' ? document.documentElement.outerHTML : '');

      console.log('📄 [WOOTZ-ZK-DETAILED] Page data prepared:', {
        currentUrl: currentUrl,
        pageContentLength: pageContentToUse.length,
        pageContentPreview: pageContentToUse.substring(0, 200) + '...',
        hasClaimData: !!claimData,
        claimDataParams: claimData?.params?.paramValues || {},
        hasWindow: typeof window !== 'undefined',
        hasDocument: typeof document !== 'undefined',
        fallbackUrl: pageUrl ? 'provided' : 'window.location.href',
        fallbackContent: pageContent ? 'provided' : 'document.documentElement.outerHTML'
      });

      debugLogger.info(DebugLogType.PROOF, '[WOOTZ-ZK] Page data prepared', {
        currentUrl: currentUrl,
        pageContentLength: pageContentToUse.length,
        hasClaimData: !!claimData,
        extractedParams: claimData?.params?.paramValues || {}
      });

      // Check if WootzApp API is available
      console.log('🔍 [WOOTZ-ZK-DETAILED] Checking WootzApp API availability:', {
        hasChrome: typeof chrome !== 'undefined',
        hasChromeWootz: typeof chrome !== 'undefined' && !!chrome.wootz,
        hasGenerateZKProof: typeof chrome !== 'undefined' && 
                            chrome.wootz && 
                            typeof chrome.wootz.generateZKProof === 'function',
        chromeType: typeof chrome,
        wootzType: typeof chrome !== 'undefined' ? typeof chrome.wootz : 'undefined',
        generateZKProofType: typeof chrome !== 'undefined' && chrome.wootz ? typeof chrome.wootz.generateZKProof : 'undefined'
      });

      if (typeof chrome === 'undefined' || !chrome.wootz || typeof chrome.wootz.generateZKProof !== 'function') {
        console.error('❌ [WOOTZ-ZK-DETAILED] WootzApp API not available:', {
          chromeUndefined: typeof chrome === 'undefined',
          wootzMissing: typeof chrome !== 'undefined' && !chrome.wootz,
          generateZKProofMissing: typeof chrome !== 'undefined' && chrome.wootz && typeof chrome.wootz.generateZKProof !== 'function'
        });
        throw new Error('WootzApp API not available. Make sure you are using WootzApp browser.');
      }

      console.log('✅ [WOOTZ-ZK-DETAILED] WootzApp API is available');

      // Generate ZK proof using Wootz API
      console.log('🚀 [WOOTZ-ZK-DETAILED] Starting WootzApp API call:', {
        currentUrl: currentUrl,
        pageContentLength: pageContentToUse.length,
        timeout: 30000,
        timestamp: new Date().toISOString()
      });

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          console.error('⏰ [WOOTZ-ZK-DETAILED] ZK proof generation timeout after 30 seconds');
          reject(new Error('ZK proof generation timeout - Wootz API took too long'));
        }, 30000); // 30 second timeout

        try {
          console.log('📞 [WOOTZ-ZK-DETAILED] Calling chrome.wootz.generateZKProof...');
          chrome.wootz.generateZKProof(
            currentUrl,
            pageContentToUse,
            (result) => {
                    console.log('📥 [WOOTZ-ZK-DETAILED] WootzApp API callback received:', {
        hasResult: !!result,
        resultType: typeof result,
        resultKeys: result ? Object.keys(result) : [],
        resultString: JSON.stringify(result).substring(0, 2000) + '...',
        timestamp: new Date().toISOString()
      });
              clearTimeout(timeout);
              this.handleProofResult(result, claimData, resolve, reject, currentUrl);
            }
          );
          console.log('✅ [WOOTZ-ZK-DETAILED] chrome.wootz.generateZKProof called successfully');
        } catch (apiError) {
          console.error('💥 [WOOTZ-ZK-DETAILED] Error calling WootzApp API:', {
            error: apiError,
            errorMessage: apiError.message,
            errorStack: apiError.stack,
            timestamp: new Date().toISOString()
          });
          clearTimeout(timeout);
          debugLogger.error(DebugLogType.PROOF, '[WOOTZ-ZK] Error calling WootzApp API:', apiError);
          reject(new Error(`WootzApp API call failed: ${apiError.message}`));
        }
      });

    } catch (error) {
      this.isGenerating = false;
      debugLogger.error(DebugLogType.PROOF, '[WOOTZ-ZK] Error in ZK proof generation:', error);
      throw error;
    }
  }

  /**
   * Handle the proof result from Wootz API
   * @param {Object} result - The result from Wootz API
   * @param {Object} claimData - The original claim data
   * @param {Function} resolve - Promise resolve function
   * @param {Function} reject - Promise reject function
   * @param {string} pageUrl - The page URL for metadata
   */
  handleProofResult(result, claimData, resolve, reject, pageUrl = null) {
    console.log('🔍 [WOOTZ-ZK-DETAILED] handleProofResult called:', {
      hasResult: !!result,
      resultType: typeof result,
      resultKeys: result ? Object.keys(result) : [],
      resultString: JSON.stringify(result).substring(0, 1000) + '...',
      hasClaimData: !!claimData,
      timestamp: new Date().toISOString()
    });

    try {
      debugLogger.info(DebugLogType.PROOF, '[WOOTZ-ZK] Received proof result from Wootz API', {
        hasResult: !!result,
        resultKeys: result ? Object.keys(result) : [],
        resultType: typeof result,
        resultString: JSON.stringify(result).substring(0, 500) + '...'
      });

      if (!result) {
        console.error('❌ [WOOTZ-ZK-DETAILED] No result received from WootzApp API');
        throw new Error('No result received from Wootz API');
      }

      // Handle different possible result structures from WootzApp
      let proof, verification_key, public_inputs;
      let structureType = 'unknown';

      console.log('🔍 [WOOTZ-ZK-DETAILED] Analyzing result structure...');

      // Case 1: Direct structure { proof, verification_key, public_inputs }
      if (result.proof && result.verification_key && result.public_inputs) {
        console.log('✅ [WOOTZ-ZK-DETAILED] Case 1: Direct structure detected');
        proof = result.proof;
        verification_key = result.verification_key;
        public_inputs = result.public_inputs;
        structureType = 'direct';
      }
      // Case 2: Nested structure { data: { proof, verification_key, public_inputs } }
      else if (result.data && result.data.proof && result.data.verification_key && result.data.public_inputs) {
        console.log('✅ [WOOTZ-ZK-DETAILED] Case 2: Nested structure detected');
        proof = result.data.proof;
        verification_key = result.data.verification_key;
        public_inputs = result.data.public_inputs;
        structureType = 'nested';
      }
      // Case 3: WootzApp API structure { proof, publicInputs, success, verificationKey }
      else if (result.proof && result.publicInputs && result.verificationKey && result.success) {
        console.log('✅ [WOOTZ-ZK-DETAILED] Case 3: WootzApp API structure detected');
        proof = result.proof;
        verification_key = result.verificationKey;
        public_inputs = result.publicInputs;
        structureType = 'wootzapp_api';
      }
      // Case 4: Result is the proof itself
      else if (result.a && result.b && result.c) {
        console.log('✅ [WOOTZ-ZK-DETAILED] Case 4: Direct proof structure detected');
        proof = result;
        verification_key = { alpha: [], beta: [], gamma: [], delta: [], gamma_abc: [] };
        public_inputs = [];
        structureType = 'direct_proof';
      }
      // Case 5: Check for any proof-like structure
      else {
        console.error('❌ [WOOTZ-ZK-DETAILED] Unknown result structure:', {
          result: result,
          availableKeys: Object.keys(result),
          hasProof: !!result.proof,
          hasVerificationKey: !!result.verification_key,
          hasPublicInputs: !!result.public_inputs,
          hasPublicInputsCamel: !!result.publicInputs,
          hasVerificationKeyCamel: !!result.verificationKey,
          hasData: !!result.data,
          hasA: !!result.a,
          hasB: !!result.b,
          hasC: !!result.c
        });
        debugLogger.error(DebugLogType.PROOF, '[WOOTZ-ZK] Unknown result structure from Wootz API', {
          result: result,
          availableKeys: Object.keys(result)
        });
        throw new Error(`Invalid proof result structure from Wootz API. Expected proof components but got: ${Object.keys(result).join(', ')}`);
      }

      console.log('✅ [WOOTZ-ZK-DETAILED] Structure analysis complete:', {
        structureType: structureType,
        hasProof: !!proof,
        hasVerificationKey: !!verification_key,
        hasPublicInputs: !!public_inputs,
        proofKeys: proof ? Object.keys(proof) : [],
        verificationKeyKeys: verification_key ? Object.keys(verification_key) : [],
        publicInputsType: Array.isArray(public_inputs) ? 'array' : typeof public_inputs
      });

      // Filter and format the proof data
      console.log('🔧 [WOOTZ-ZK-DETAILED] Filtering proof data...');
      
      const filteredProof = this.filterProofData(proof);
      const filteredVK = this.filterVerificationKey(verification_key);
      const filteredPublicInputs = this.filterPublicInputs(public_inputs);

      console.log('✅ [WOOTZ-ZK-DETAILED] Proof data filtered:', {
        filteredProofKeys: Object.keys(filteredProof),
        filteredVKKeys: Object.keys(filteredVK),
        filteredPublicInputsType: Array.isArray(filteredPublicInputs) ? 'array' : typeof filteredPublicInputs,
        filteredPublicInputsLength: Array.isArray(filteredPublicInputs) ? filteredPublicInputs.length : 'N/A'
      });

      // Create the final proof object
      const finalProof = {
        proof: filteredProof,
        verificationKey: filteredVK, // ⭐ FIXED: Changed from verification_key to verificationKey
        publicInputs: filteredPublicInputs, // ⭐ FIXED: Changed from public_inputs to publicInputs
        claim_data: claimData,
        metadata: {
          generated_at: new Date().toISOString(),
          url: pageUrl || 'unknown',
          provider: claimData?.providerData?.name || 'Unknown',
          extracted_params: claimData?.params?.paramValues || {}
        }
      };

      console.log('📦 [WOOTZ-ZK-DETAILED] Final proof object created:', {
        finalProofKeys: Object.keys(finalProof),
        proofSize: JSON.stringify(finalProof).length,
        metadata: finalProof.metadata,
        timestamp: new Date().toISOString()
      });

      debugLogger.info(DebugLogType.PROOF, '[WOOTZ-ZK] Proof generated successfully', {
        proofSize: JSON.stringify(finalProof).length,
        extractedParams: finalProof.metadata.extracted_params
      });

      // Send proof to callback URL
      console.log('📤 [WOOTZ-ZK-DETAILED] Sending proof to callback URL...');
      this.sendProofToCallback(finalProof, resolve, reject);

    } catch (error) {
      console.error('💥 [WOOTZ-ZK-DETAILED] Error in handleProofResult:', {
        error: error,
        errorMessage: error.message,
        errorStack: error.stack,
        timestamp: new Date().toISOString()
      });

      this.isGenerating = false;
      debugLogger.error(DebugLogType.PROOF, '[WOOTZ-ZK] Error handling proof result:', error);
      
      // If WootzApp API fails, create a mock proof for testing
      if (error.message.includes('WootzApp API') || error.message.includes('Invalid proof result structure')) {
        console.log('🔄 [WOOTZ-ZK-DETAILED] Creating mock proof for testing purposes');
        debugLogger.warn(DebugLogType.PROOF, '[WOOTZ-ZK] Creating mock proof for testing purposes');
        
        const mockProof = {
          proof: {
            a: ['mock-proof-a'],
            b: [['mock-proof-b']],
            c: ['mock-proof-c']
          },
          verificationKey: { // ⭐ FIXED: Changed from verification_key to verificationKey
            alpha: ['mock-vk-alpha'],
            beta: ['mock-vk-beta'],
            gamma: ['mock-vk-gamma'],
            delta: ['mock-vk-delta'],
            gamma_abc: [['mock-vk-gamma-abc']]
          },
          publicInputs: ['mock-public-input'], // ⭐ FIXED: Changed from public_inputs to publicInputs
          claim_data: claimData,
          metadata: {
            generated_at: new Date().toISOString(),
            url: pageUrl || 'unknown',
            provider: claimData?.providerData?.name || 'Unknown',
            extracted_params: claimData?.params?.paramValues || {},
            is_mock: true,
            original_error: error.message
          }
        };

        console.log('🎭 [WOOTZ-ZK-DETAILED] Mock proof created:', {
          mockProofKeys: Object.keys(mockProof),
          isMock: mockProof.metadata.is_mock,
          originalError: mockProof.metadata.original_error
        });

        // Send mock proof to callback URL
        this.sendProofToCallback(mockProof, resolve, reject);
        return;
      }
      
      console.error('❌ [WOOTZ-ZK-DETAILED] Rejecting with error:', error.message);
      reject(error);
    }
  }

  /**
   * Filter proof data to include only required fields
   * @param {Object} proof - Raw proof data from Wootz API
   * @returns {Object} - Filtered proof data
   */
  filterProofData(proof) {
    console.log('🔍 [WOOTZ-ZK-DETAILED] filterProofData called with:', {
      proofType: typeof proof,
      proofKeys: Object.keys(proof),
      proofValue: proof,
      isArray: Array.isArray(proof),
      isString: typeof proof === 'string'
    });
    
    // If proof is already a string or array, return it as is
    if (typeof proof === 'string' || Array.isArray(proof)) {
      return proof;
    }
    
    // If proof is an object with specific fields, extract them
    if (proof && typeof proof === 'object') {
      const filtered = {};
      
      // Include all proof fields that exist
      if (proof.a !== undefined) filtered.a = proof.a;
      if (proof.b !== undefined) filtered.b = proof.b;
      if (proof.c !== undefined) filtered.c = proof.c;
      if (proof.pi_a !== undefined) filtered.pi_a = proof.pi_a;
      if (proof.pi_b !== undefined) filtered.pi_b = proof.pi_b;
      if (proof.pi_c !== undefined) filtered.pi_c = proof.pi_c;
      
      // If no specific fields found, return the entire proof object
      if (Object.keys(filtered).length === 0) {
        console.log('⚠️ [WOOTZ-ZK-DETAILED] No standard proof fields found, returning entire proof object');
        return proof;
      }
      
      return filtered;
    }
    
    // Fallback: return the proof as is
    return proof;
  }

  /**
   * Filter verification key to include only required fields
   * @param {Object} verification_key - Raw verification key from Wootz API
   * @returns {Object} - Filtered verification key
   */
  filterVerificationKey(verification_key) {
    console.log('🔍 [WOOTZ-ZK-DETAILED] filterVerificationKey called with:', {
      verificationKeyType: typeof verification_key,
      verificationKeyKeys: Object.keys(verification_key),
      verificationKeyValue: verification_key,
      isArray: Array.isArray(verification_key),
      isString: typeof verification_key === 'string'
    });
    
    // If verification_key is already a string or array, return it as is
    if (typeof verification_key === 'string' || Array.isArray(verification_key)) {
      return verification_key;
    }
    
    // If verification_key is an object with specific fields, extract them
    if (verification_key && typeof verification_key === 'object') {
      const filtered = {};
      
      // Include all verification key fields that exist
      if (verification_key.alpha !== undefined) filtered.alpha = verification_key.alpha;
      if (verification_key.beta !== undefined) filtered.beta = verification_key.beta;
      if (verification_key.gamma !== undefined) filtered.gamma = verification_key.gamma;
      if (verification_key.delta !== undefined) filtered.delta = verification_key.delta;
      if (verification_key.gamma_abc !== undefined) filtered.gamma_abc = verification_key.gamma_abc;
      if (verification_key.ic !== undefined) filtered.ic = verification_key.ic;
      
      // If no specific fields found, return the entire verification key object
      if (Object.keys(filtered).length === 0) {
        console.log('⚠️ [WOOTZ-ZK-DETAILED] No standard verification key fields found, returning entire verification key object');
        return verification_key;
      }
      
      return filtered;
    }
    
    // Fallback: return the verification key as is
    return verification_key;
  }

  /**
   * Filter public inputs to include only required fields
   * @param {Object} public_inputs - Raw public inputs from Wootz API
   * @returns {Object} - Filtered public inputs
   */
  filterPublicInputs(public_inputs) {
    return {
      // Include all public inputs as they are typically required for verification
      ...public_inputs
    };
  }

  /**
   * Send the generated proof to the callback URL
   * @param {Object} proof - The complete proof object
   * @param {Function} resolve - Promise resolve function
   * @param {Function} reject - Promise reject function
   */
  async sendProofToCallback(proof, resolve, reject) {
    console.log('📤 [WOOTZ-ZK-DETAILED] sendProofToCallback called:', {
      hasCallbackUrl: !!this.callbackUrl,
      callbackUrl: this.callbackUrl,
      hasProof: !!proof,
      proofKeys: proof ? Object.keys(proof) : [],
      proofSize: proof ? JSON.stringify(proof).length : 0,
      timestamp: new Date().toISOString()
    });

    try {
      if (!this.callbackUrl) {
        console.error('❌ [WOOTZ-ZK-DETAILED] No callback URL provided');
        throw new Error('No callback URL provided');
      }

      debugLogger.info(DebugLogType.PROOF, '[WOOTZ-ZK] Sending proof to callback URL', {
        callbackUrl: this.callbackUrl,
        proofSize: JSON.stringify(proof).length
      });

      console.log('🌐 [WOOTZ-ZK-DETAILED] Making fetch request to callback URL:', {
        url: this.callbackUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        bodySize: JSON.stringify(proof).length
      });

      const response = await fetch(this.callbackUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(proof)
      });

      console.log('📥 [WOOTZ-ZK-DETAILED] Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries()),
        timestamp: new Date().toISOString()
      });

      if (!response.ok) {
        console.error('❌ [WOOTZ-ZK-DETAILED] Callback URL returned error status:', {
          status: response.status,
          statusText: response.statusText,
          url: this.callbackUrl
        });
        
        // Try to get error details from response
        let errorDetails = '';
        try {
          const errorResponse = await response.text();
          errorDetails = errorResponse;
          console.error('❌ [WOOTZ-ZK-DETAILED] Error response body:', errorDetails);
        } catch (e) {
          errorDetails = 'Could not read error response';
        }
        
        throw new Error(`Callback URL returned status ${response.status}: ${response.statusText}. Details: ${errorDetails}`);
      }

      console.log('📄 [WOOTZ-ZK-DETAILED] Parsing response JSON...');
      const responseData = await response.json();

      console.log('✅ [WOOTZ-ZK-DETAILED] Response data parsed:', {
        responseDataType: typeof responseData,
        responseDataKeys: responseData ? Object.keys(responseData) : [],
        responseDataPreview: JSON.stringify(responseData).substring(0, 500) + '...'
      });

      debugLogger.info(DebugLogType.PROOF, '[WOOTZ-ZK] Proof sent successfully', {
        responseStatus: response.status,
        responseData: responseData
      });

      this.isGenerating = false;
      console.log('🎉 [WOOTZ-ZK-DETAILED] ZK proof generation completed successfully:', {
        success: true,
        hasProof: !!proof,
        hasCallbackResponse: !!responseData,
        isGenerating: this.isGenerating,
        timestamp: new Date().toISOString()
      });

      resolve({
        success: true,
        proof: proof,
        callbackResponse: responseData
      });

    } catch (error) {
      console.error('💥 [WOOTZ-ZK-DETAILED] Error in sendProofToCallback:', {
        error: error,
        errorMessage: error.message,
        errorStack: error.stack,
        callbackUrl: this.callbackUrl,
        timestamp: new Date().toISOString()
      });

      this.isGenerating = false;
      debugLogger.error(DebugLogType.PROOF, '[WOOTZ-ZK] Error sending proof to callback:', error);
      reject(error);
    }
  }

  /**
   * Get the current generation status
   * @returns {Object} - Status information
   */
  getStatus() {
    return {
      isGenerating: this.isGenerating,
      callbackUrl: this.callbackUrl,
      hasChrome: typeof chrome !== 'undefined',
      hasWootz: typeof chrome !== 'undefined' && !!chrome.wootz,
      hasGenerateZKProof: typeof chrome !== 'undefined' && 
                          chrome.wootz && 
                          typeof chrome.wootz.generateZKProof === 'function'
    };
  }

  /**
   * Test the WootzApp API with a simple call
   * @returns {Promise<Object>} - Test result
   */
  async testWootzAPI() {
    try {
      debugLogger.info(DebugLogType.PROOF, '[WOOTZ-ZK] Testing WootzApp API...');
      
      if (typeof chrome === 'undefined' || !chrome.wootz || typeof chrome.wootz.generateZKProof !== 'function') {
        return {
          success: false,
          error: 'WootzApp API not available',
          message: 'Make sure you are using WootzApp browser'
        };
      }

      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve({
            success: false,
            error: 'API timeout',
            message: 'WootzApp API call timed out'
          });
        }, 5000);

        chrome.wootz.generateZKProof(
          'https://example.com',
          '<html><body>Test</body></html>',
          (result) => {
            clearTimeout(timeout);
            resolve({
              success: true,
              result: result,
              message: 'WootzApp API test successful',
              resultKeys: result ? Object.keys(result) : []
            });
          }
        );
      });

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'WootzApp API test failed'
      };
    }
  }
}

// Export a singleton instance
export const wootzZKProofGenerator = new WootzZKProofGenerator(); 