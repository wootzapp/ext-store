// Extension Testing Helper Script
// Run this in the browser console to help test extension functionality

const ExtensionTester = {
  // Test basic popup functionality
  testPopupLoading: function() {
    console.log("🧪 Testing popup loading...");
    
    // Check if extension elements are present
    const mainElements = [
      '.main-content',
      '.login-section', 
      '.automation-controls',
      '.points-display'
    ];
    
    let elementsFound = 0;
    mainElements.forEach(selector => {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`✅ Found element: ${selector}`);
        elementsFound++;
      } else {
        console.log(`❌ Missing element: ${selector}`);
      }
    });
    
    console.log(`📊 Elements found: ${elementsFound}/${mainElements.length}`);
    return elementsFound === mainElements.length;
  },

  // Test message passing to background
  testBackgroundConnection: function() {
    console.log("🧪 Testing background connection...");
    
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'test_connection'
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("❌ Background connection failed:", chrome.runtime.lastError);
          resolve(false);
        } else {
          console.log("✅ Background connection successful:", response);
          resolve(true);
        }
      });
    });
  },

  // Monitor console logs for debugging patterns
  monitorLogs: function(duration = 30000) {
    console.log(`🧪 Monitoring logs for ${duration/1000} seconds...`);
    
    const logPatterns = {
      contentSubmission: /📤.*content/i,
      claimProcess: /🎯.*claim/i,
      apiRecall: /🔄.*API/i,
      navigation: /🧭.*Navigating/i,
      success: /✅/,
      failure: /❌/,
      timeout: /⏰.*timeout/i
    };
    
    const originalLog = console.log;
    const originalError = console.error;
    const logCounts = {};
    
    // Initialize counters
    Object.keys(logPatterns).forEach(key => logCounts[key] = 0);
    
    // Override console methods to track patterns
    console.log = function(...args) {
      const message = args.join(' ');
      Object.keys(logPatterns).forEach(pattern => {
        if (logPatterns[pattern].test(message)) {
          logCounts[pattern]++;
        }
      });
      originalLog.apply(console, args);
    };
    
    console.error = function(...args) {
      const message = args.join(' ');
      Object.keys(logPatterns).forEach(pattern => {
        if (logPatterns[pattern].test(message)) {
          logCounts[pattern]++;
        }
      });
      originalError.apply(console, args);
    };
    
    // Restore original after duration
    setTimeout(() => {
      console.log = originalLog;
      console.error = originalError;
      
      console.log("📊 Log Pattern Analysis:");
      Object.keys(logCounts).forEach(pattern => {
        console.log(`  ${pattern}: ${logCounts[pattern]} occurrences`);
      });
    }, duration);
  },

  // Test claim functionality
  testClaimFunction: async function() {
    console.log("🧪 Testing claim functionality...");
    
    try {
      // Simulate clicking claim button
      const claimButton = document.querySelector('.claim-button, [onclick*="claim"], button:contains("Claim")');
      if (claimButton) {
        console.log("✅ Found claim button, simulating click...");
        claimButton.click();
        
        // Monitor for claim result
        setTimeout(() => {
          console.log("📊 Check console above for claim process logs");
        }, 2000);
        
        return true;
      } else {
        console.log("❌ Claim button not found");
        return false;
      }
    } catch (error) {
      console.log("❌ Error testing claim:", error);
      return false;
    }
  },

  // Test automation start
  testAutomationStart: async function() {
    console.log("🧪 Testing automation start...");
    
    try {
      const startButton = document.querySelector('.start-automation, [onclick*="start"], button:contains("Start")');
      if (startButton) {
        console.log("✅ Found start button, simulating click...");
        startButton.click();
        
        // Monitor for automation logs
        setTimeout(() => {
          console.log("📊 Check console above for automation start logs");
        }, 2000);
        
        return true;
      } else {
        console.log("❌ Start automation button not found");
        return false;
      }
    } catch (error) {
      console.log("❌ Error testing automation:", error);
      return false;
    }
  },

  // Run comprehensive test suite
  runFullTest: async function() {
    console.log("🧪 Starting comprehensive extension test...");
    console.log("=" .repeat(50));
    
    const results = {};
    
    // Test 1: Popup loading
    results.popupLoading = this.testPopupLoading();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 2: Background connection
    results.backgroundConnection = await this.testBackgroundConnection();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test 3: Start monitoring logs
    this.monitorLogs(60000); // Monitor for 1 minute
    
    // Test 4: Claim functionality (if available)
    results.claimTest = await this.testClaimFunction();
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 5: Automation start (if available)
    results.automationTest = await this.testAutomationStart();
    
    // Summary
    setTimeout(() => {
      console.log("=" .repeat(50));
      console.log("📊 Test Results Summary:");
      Object.keys(results).forEach(test => {
        const status = results[test] ? "✅ PASS" : "❌ FAIL";
        console.log(`  ${test}: ${status}`);
      });
      console.log("=" .repeat(50));
    }, 5000);
  }
};

// Auto-run basic tests if this script is loaded
console.log("🧪 Extension Testing Helper loaded");
console.log("💡 Run ExtensionTester.runFullTest() to start comprehensive testing");
console.log("💡 Run ExtensionTester.monitorLogs() to monitor debug logs");

// Expose globally for easy access
window.ExtensionTester = ExtensionTester;
