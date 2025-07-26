// Offscreen document for Reclaim SDK
import '../utils/polyfills'; 

// Check WebAssembly support
if (typeof WebAssembly === 'undefined') {
  // WebAssembly not available
}

// Set WASM path
globalThis.WASM_PATH = chrome.runtime.getURL('wasm/');

// WebSocket polyfill
if (typeof WebSocket === 'undefined') {
  // WebSocket polyfill
}

// Offscreen proof generator class
class OffscreenProofGenerator {
  constructor() {
    this.currentReclaimInstance = null;
    this.networkData = null;
    this.isGenerating = false;
  }

  init() {
    // Initialize offscreen document
  }

  // Handle messages from background script
  handleMessage(message, sender, sendResponse) {
    const { action, data } = message;

    switch (action) {
      case 'PING_OFFSCREEN':
        sendResponse({ success: true, message: 'pong' });
        break;

      case 'NETWORK_DATA_FOR_RECLAIM':
        this.handleNetworkData(data);
        sendResponse({ success: true });
        break;

      case 'GENERATE_PROOF':
        this.handleGenerateProof(data, sendResponse);
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action' });
        break;
    }
  }

  // Handle network data from background
  handleNetworkData(data) {
    this.networkData = data;
  }

  // Handle proof generation
  async handleGenerateProof(data, sendResponse) {
    try {
      const { claimData, config } = data;

      if (!config) {
        sendResponse({ success: false, error: 'No config provided' });
        return;
      }

      // Import WootzApp ZK generator
      const { wootzZKProofGenerator } = await import('../utils/wootz-zk-generator.js');
      const generator = new wootzZKProofGenerator();

      // Generate ZK proof with WootzApp API
      const result = await generator.generateZKProof(
        claimData,
        data.callbackUrl || 'https://example.com/callback',
        data.pageUrl,
        data.pageContent
      );

      // Send success response
      sendResponse({
        success: true,
        proofs: [result],
        callbackResponse: result
      });

    } catch (error) {
      // Ensure error response is sent
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }
}

// Initialize offscreen document
const offscreenGenerator = new OffscreenProofGenerator();
offscreenGenerator.init();

// Send ready signal to background
chrome.runtime.sendMessage({
  action: 'OFFSCREEN_DOCUMENT_READY',
  source: 'offscreen',
  target: 'background'
});

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle the message and ensure response is sent
  offscreenGenerator.handleMessage(message, sender, sendResponse).catch(error => {
    // Ensure error response is sent if the async operation fails
    sendResponse({ success: false, error: error.message });
  });
  return true;
});