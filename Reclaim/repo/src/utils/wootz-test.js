// Test file for Wootz API integration
// This helps verify that the Wootz API is working correctly

import { wootzZKProofGenerator } from './wootz-zk-generator';
import { debugLogger, DebugLogType } from './logger';

/**
 * Test Wootz API integration
 * @param {string} testUrl - URL to test with
 * @param {string} testCallbackUrl - Callback URL for testing
 * @returns {Promise<Object>} - Test result
 */
export async function testWootzAPI(testUrl = 'https://github.com/settings/profile', testCallbackUrl = 'https://httpbin.org/post') {
  try {
    debugLogger.info(DebugLogType.PROOF, '[WOOTZ-TEST] Starting Wootz API test...', {
      testUrl: testUrl,
      testCallbackUrl: testCallbackUrl
    });

    // Create test claim data
    const testClaimData = {
      params: {
        paramValues: {
          username: 'test-user',
          url: testUrl
        }
      },
      providerData: {
        name: 'Test Provider',
        callbackUrl: testCallbackUrl
      },
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    };

    // Test ZK proof generation
    const result = await wootzZKProofGenerator.generateZKProof(testClaimData, testCallbackUrl);

    debugLogger.info(DebugLogType.PROOF, '[WOOTZ-TEST] Wootz API test completed', {
      success: result.success,
      hasProof: !!result.proof,
      hasCallbackResponse: !!result.callbackResponse
    });

    return {
      success: true,
      result: result,
      message: 'Wootz API test completed successfully'
    };

  } catch (error) {
    debugLogger.error(DebugLogType.PROOF, '[WOOTZ-TEST] Wootz API test failed:', error);
    
    return {
      success: false,
      error: error.message,
      message: 'Wootz API test failed'
    };
  }
}

/**
 * Check if Wootz API is available
 * @returns {boolean} - True if Wootz API is available
 */
export function isWootzAPIAvailable() {
  return typeof chrome !== 'undefined' && 
         chrome.wootz && 
         typeof chrome.wootz.generateZKProof === 'function';
}

/**
 * Get Wootz API status
 * @returns {Object} - Status information
 */
export function getWootzAPIStatus() {
  const isAvailable = isWootzAPIAvailable();
  
  return {
    isAvailable: isAvailable,
    chrome: typeof chrome !== 'undefined',
    chromeWootz: typeof chrome !== 'undefined' && !!chrome.wootz,
    generateZKProof: typeof chrome !== 'undefined' && 
                     chrome.wootz && 
                     typeof chrome.wootz.generateZKProof === 'function',
    generatorStatus: wootzZKProofGenerator.getStatus()
  };
}

// Export test functions for global access
if (typeof window !== 'undefined') {
  window.testWootzAPI = testWootzAPI;
  window.isWootzAPIAvailable = isWootzAPIAvailable;
  window.getWootzAPIStatus = getWootzAPIStatus;
} 