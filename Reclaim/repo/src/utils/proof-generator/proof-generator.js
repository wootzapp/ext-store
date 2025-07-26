// Import polyfills
import '../polyfills';

import { wootzZKProofGenerator } from '../wootz-zk-generator';

export const generateProof = async (claimData, pageData = null) => {
  try {
    // Determine callback URL
    const callbackUrl = claimData.callbackUrl || 'https://example.com/callback';
    
    // Extract page data
    const pageUrl = pageData?.url || 'unknown';
    const pageContent = pageData?.content || '';

    // Generate ZK proof using WootzApp API
    const generator = new wootzZKProofGenerator();
    const result = await generator.generateZKProof(
      claimData,
      callbackUrl,
      pageUrl,
      pageContent
    );

    return {
      success: true,
      proof: result,
      callbackResponse: result
    };

  } catch (error) { 
    return {
      success: false,
      error: error.message
    };
  }
};