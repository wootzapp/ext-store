// Import polyfills
import '../polyfills';

import { MESSAGE_ACTIONS, MESSAGE_SOURCES } from '../constants/index';
import { wootzZKProofGenerator } from '../wootz-zk-generator';
import { debugLogger, DebugLogType } from '../logger';

// Main function to generate proof using Wootz API
export const generateProof = async (claimData, pageData = null) => {
  console.log('🚀 [PROOF-GENERATOR-DETAILED] generateProof called:', {
    hasClaimData: !!claimData,
    claimDataKeys: claimData ? Object.keys(claimData) : [],
    hasPageData: !!pageData,
    pageDataKeys: pageData ? Object.keys(pageData) : [],
    timestamp: new Date().toISOString()
  });

  try {
    debugLogger.info(DebugLogType.PROOF, '[PROOF-GENERATOR] Starting ZK proof generation with Wootz API:', claimData);
    
    if(!claimData) {
      console.error('❌ [PROOF-GENERATOR-DETAILED] No claim data provided');
      throw new Error('No claim data provided for proof generation');
    }

    // Extract callback URL from claim data or use default
    const callbackUrl = claimData.callbackUrl || 
                       claimData.providerData?.callbackUrl || 
                       'https://api.reclaimprotocol.org/api/proofs/submit'; // Default callback

    console.log('🔗 [PROOF-GENERATOR-DETAILED] Callback URL determined:', {
      callbackUrl: callbackUrl,
      fromClaimData: !!claimData.callbackUrl,
      fromProviderData: !!claimData.providerData?.callbackUrl,
      isDefault: !claimData.callbackUrl && !claimData.providerData?.callbackUrl
    });

    debugLogger.info(DebugLogType.PROOF, '[PROOF-GENERATOR] Using callback URL:', callbackUrl);

    // Extract page data
    const pageUrl = pageData?.url || null;
    const pageContent = pageData?.content || null;

    console.log('📄 [PROOF-GENERATOR-DETAILED] Page data extracted:', {
      hasPageUrl: !!pageUrl,
      pageUrl: pageUrl,
      hasPageContent: !!pageContent,
      pageContentLength: pageContent ? pageContent.length : 0,
      pageContentPreview: pageContent ? pageContent.substring(0, 200) + '...' : 'N/A'
    });

    debugLogger.info(DebugLogType.PROOF, '[PROOF-GENERATOR] Page data:', {
      hasPageUrl: !!pageUrl,
      hasPageContent: !!pageContent,
      pageContentLength: pageContent ? pageContent.length : 0
    });

    // Generate ZK proof using Wootz API
    console.log('🔧 [PROOF-GENERATOR-DETAILED] Calling wootzZKProofGenerator.generateZKProof...');
    const result = await wootzZKProofGenerator.generateZKProof(claimData, callbackUrl, pageUrl, pageContent);

    console.log('📊 [PROOF-GENERATOR-DETAILED] ZK proof generation result:', {
      success: result.success,
      hasProof: !!result.proof,
      hasCallbackResponse: !!result.callbackResponse,
      proofSize: result.proof ? JSON.stringify(result.proof).length : 0,
      callbackResponseKeys: result.callbackResponse ? Object.keys(result.callbackResponse) : [],
      timestamp: new Date().toISOString()
    });

    debugLogger.info(DebugLogType.PROOF, '[PROOF-GENERATOR] ZK proof generation successful', {
      success: result.success,
      proofSize: result.proof ? JSON.stringify(result.proof).length : 0,
      callbackResponse: result.callbackResponse
    });

    console.log('✅ [PROOF-GENERATOR-DETAILED] Returning success result');
    return {
      success: true,
      proof: result.proof,
      callbackResponse: result.callbackResponse,
      message: 'ZK proof generated and sent successfully using Wootz API'
    };

  } catch (error) { 
    console.error('💥 [PROOF-GENERATOR-DETAILED] Error in ZK proof generation process:', {
      error: error,
      errorMessage: error.message,
      errorStack: error.stack,
      errorType: typeof error,
      timestamp: new Date().toISOString()
    });

    debugLogger.error(DebugLogType.PROOF, '[PROOF-GENERATOR] Error in ZK proof generation process:', error);
    
    console.log('❌ [PROOF-GENERATOR-DETAILED] Returning error result');
    return {
      success: false,
      error: error.message || 'Unknown error in ZK proof generation process'
    };
  }
};