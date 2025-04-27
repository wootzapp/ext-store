// Background script for Wootz ZK Proof Generator
/*global chrome*/

console.log("Wootz ZK Proof Generator background script loaded");

// Only create alarms if the API is available
if (chrome.alarms) {
  // Create alarm for keeping alive
  chrome.alarms.create("keepAlive", { periodInMinutes: 0.1 });

  // Handle alarms
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "keepAlive") {
      console.log("Background Service Worker Active:", new Date().toISOString());
    }
  });
} else {
  console.log("Alarms API not available");
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Received message:", message.type, "from tab:", sender.tab?.id);
  
  if (message.type === "PAGE_CONTENT") {
    console.log("Processing page content from:", message.data.url);
    
    // Notify UI that proof generation has started
    chrome.runtime.sendMessage({
      type: "PROOF_GENERATION_STARTED",
      data: {
        url: message.data.url
      }
    });
    
    generateZKProof(message.data.url, message.data.content);
    
    // Respond to content script
    sendResponse({ status: "received" });
  }
  
  if (message.type === "TWITTER_AUTH_STATUS") {
    console.log("🔐 Received Twitter auth status:", message.data);

    // Store auth status
    chrome.storage.local.set(
      {
        isTwitterAuthenticated: message.data.isAuthenticated,
      },
      () => {
        // Broadcast to UI
        chrome.runtime.sendMessage({
          type: "TWITTER_AUTH_UPDATED",
          data: message.data,
        });
      }
    );
  }
  else if (message.type === "TWITTER_AUTH_DATA") {
    // Store auth data
    chrome.storage.local.set({
      twitterUsername: message.data.username,
      twitterUserId: message.data.userId,
      twitterToken: message.data.token,
      twitterAuthToken: message.data.authToken,
      isTwitterAuthenticated: true
    }, () => {
      // Notify UI
      chrome.runtime.sendMessage({
        type: "TWITTER_AUTH_UPDATED",
        data: {
          isAuthenticated: true,
          username: message.data.username
        }
      });
    });
  }
  else if (message.type === "INITIAL_AUTH_USERNAME") {
    console.log("📝 Received initial username:", message.data);
    
    // Store username
    chrome.storage.local.set({
      twitterUsername: message.data.username
    }, () => {
      console.log("✅ Stored Twitter username");
    });
  }
  
  return true; // Keep connection open for asynchronous response
});

// Generate ZK proof using the chrome.wootz API
function generateZKProof(currentUrl, pageContent) {
  console.log("Generating ZK proof for:", currentUrl);
  
  try {
    // Check if the wootz API is available
    if (!chrome.wootz) {
      throw new Error("Wootz API not available");
    }
    
    // Call the chrome.wootz API
    chrome.wootz.generateZKProof(currentUrl, pageContent, function(result) {
      if (result.success) {
        console.log("Proof generated successfully");
        
        // Note: API returns strings, not objects
        // Store the result in chrome storage
        chrome.storage.local.set({
          lastProof: {
            url: currentUrl,
            timestamp: new Date().toISOString(),
            proof: result.proof,          // This is a string
            verificationKey: result.verificationKey,  // This is a string
            publicInputs: result.publicInputs  // This is a string
          }
        }, () => {
          console.log("Proof data stored in chrome.storage.local");
          
          // Notify all tabs about the new proof
          chrome.runtime.sendMessage({
            type: "PROOF_GENERATED",
            data: {
              url: currentUrl,
              timestamp: new Date().toISOString(),
              proof: result.proof,
              verificationKey: result.verificationKey,
              publicInputs: result.publicInputs
            }
          });
        });
      } else {
        console.error("Error generating proof:", result.error);
        
        // Store the error in chrome storage
        chrome.storage.local.set({
          lastProofError: {
            url: currentUrl,
            timestamp: new Date().toISOString(),
            error: result.error
          }
        }, () => {
          // Notify all tabs about the error
          chrome.runtime.sendMessage({
            type: "PROOF_GENERATION_ERROR",
            data: {
              url: currentUrl,
              timestamp: new Date().toISOString(),
              error: result.error
            }
          });
        });
      }
    });
  } catch (error) {
    console.error("Exception while generating ZK proof:", error);
    
    // Notify about the error
    chrome.runtime.sendMessage({
      type: "PROOF_GENERATION_ERROR",
      data: {
        url: currentUrl,
        timestamp: new Date().toISOString(),
        error: error.message || "Unknown error"
      }
    });
  }
}

// Handle extension installation or update
chrome.runtime.onInstalled.addListener((details) => {
  console.log("Extension installed or updated:", details.reason);
});
