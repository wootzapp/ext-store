// Debug script for WootzApp API testing
// Run this in the browser console to test the WootzApp API

import { wootzZKProofGenerator } from './wootz-zk-generator.js';

/**
 * Debug function to test WootzApp API
 */
export async function debugWootzAPI() {
  console.log('🔍 [WOOTZ-DEBUG] Starting WootzApp API debug...');
  
  // Check basic availability
  console.log('📋 [WOOTZ-DEBUG] Basic checks:');
  console.log('  - chrome available:', typeof chrome !== 'undefined');
  console.log('  - chrome.wootz available:', typeof chrome !== 'undefined' && !!chrome.wootz);
  console.log('  - generateZKProof available:', typeof chrome !== 'undefined' && 
              chrome.wootz && typeof chrome.wootz.generateZKProof === 'function');
  
  // Get generator status
  const status = wootzZKProofGenerator.getStatus();
  console.log('📊 [WOOTZ-DEBUG] Generator status:', status);
  
  // Test API call
  console.log('🧪 [WOOTZ-DEBUG] Testing API call...');
  try {
    const testResult = await wootzZKProofGenerator.testWootzAPI();
    console.log('✅ [WOOTZ-DEBUG] API test result:', testResult);
    
    if (testResult.success) {
      console.log('🎉 [WOOTZ-DEBUG] WootzApp API is working!');
      console.log('📋 [WOOTZ-DEBUG] Result structure:', testResult.resultKeys);
    } else {
      console.log('❌ [WOOTZ-DEBUG] WootzApp API test failed:', testResult.error);
    }
  } catch (error) {
    console.error('💥 [WOOTZ-DEBUG] API test error:', error);
  }
  
  return {
    status: status,
    testResult: testResult
  };
}

/**
 * Test with actual claim data
 */
export async function testWithClaimData() {
  console.log('🧪 [WOOTZ-DEBUG] Testing with claim data...');
  
  const testClaimData = {
    params: {
      paramValues: {
        username: 'test-user',
        url: 'https://github.com/settings/profile'
      }
    },
    providerData: {
      name: 'GitHub',
      callbackUrl: 'https://httpbin.org/post'
    }
  };
  
  try {
    const result = await wootzZKProofGenerator.generateZKProof(
      testClaimData, 
      'https://httpbin.org/post',
      'https://github.com/settings/profile',
      '<html><body>Test GitHub page</body></html>'
    );
    
    console.log('✅ [WOOTZ-DEBUG] Claim test result:', result);
    return result;
  } catch (error) {
    console.error('❌ [WOOTZ-DEBUG] Claim test error:', error);
    throw error;
  }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.debugWootzAPI = debugWootzAPI;
  window.testWithClaimData = testWithClaimData;
  window.wootzGenerator = wootzZKProofGenerator;
  
  console.log('🔧 [WOOTZ-DEBUG] Debug functions loaded!');
  console.log('  - debugWootzAPI() - Test basic API functionality');
  console.log('  - testWithClaimData() - Test with claim data');
  console.log('  - wootzGenerator - Access the generator instance');
} 