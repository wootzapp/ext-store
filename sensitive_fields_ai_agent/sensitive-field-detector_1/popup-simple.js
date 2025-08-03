// Simple Popup Script
console.log('🎛️ Popup script loading...');
console.log('🆔 Extension ID:', chrome.runtime.id);
console.log('🌐 Chrome runtime available:', !!chrome.runtime);

let isEnabled = false;
let isToggling = false; // Prevent multiple rapid clicks

// DOM elements
let toggleSwitch, statusDiv;

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM loaded, getting elements...');
  toggleSwitch = document.getElementById('toggleSwitch');
  statusDiv = document.getElementById('status');
  
  console.log('🎯 Elements found:', {
    toggleSwitch: !!toggleSwitch,
    statusDiv: !!statusDiv
  });
  
  if (toggleSwitch && statusDiv) {
    init();
  } else {
    console.error('❌ Could not find required DOM elements');
  }
});

async function init() {
  console.log('🔧 Initializing popup...');
  
  // Get current state
  try {
    console.log('📤 Sending getState message to background...');
    
    // Check if chrome.runtime is available
    if (!chrome.runtime) {
      console.error('❌ chrome.runtime not available');
      return;
    }
    
    const response = await new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'getState' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        console.log('📥 Raw response received:', response);
        resolve(response);
      });
    });
    
    console.log('📥 Processed response:', response);
    
    if (response && typeof response.enabled !== 'undefined') {
      isEnabled = response.enabled;
      console.log('✅ State retrieved successfully:', isEnabled);
    } else {
      console.warn('⚠️ Invalid response, defaulting to false');
      isEnabled = false;
    }
    
    updateUI();
    console.log('🎯 Current state set to:', isEnabled);
  } catch (error) {
    console.error('❌ Error getting state:', error);
    isEnabled = false;
    updateUI();
  }
  
  // Add event listeners
  console.log('🔗 Adding event listeners to toggle switch...');
  
  // Single click listener with proper event handling
  toggleSwitch.addEventListener('click', (event) => {
    console.log('🖱️ Toggle switch clicked');
    event.preventDefault();
    event.stopPropagation();
    toggleExtension();
  }, { once: false });
  
  console.log('✅ Popup ready, isEnabled:', isEnabled);
}

async function toggleExtension() {
  if (isToggling) {
    console.log('⏸️ Already toggling, ignoring click');
    return;
  }
  
  isToggling = true;
  console.log('🔄 Toggle clicked! Current state:', isEnabled);
  console.log('🎯 Toggle switch element:', toggleSwitch);
  
  const newState = !isEnabled;
  console.log('🔄 New state will be:', newState);
  
  try {
    console.log('📤 Sending setState message to background...');
    
    const response = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, 5000);
      
      chrome.runtime.sendMessage({ 
        action: 'setState', 
        enabled: newState 
      }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          console.error('❌ Chrome runtime error:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }
        console.log('📥 setState response received:', response);
        resolve(response);
      });
    });
    
    if (response && response.success) {
      isEnabled = newState;
      updateUI();
      console.log('✅ Extension toggled successfully to:', isEnabled);
    } else {
      console.error('❌ setState failed, response:', response);
      updateUI(); // Keep current state
    }
  } catch (error) {
    console.error('❌ Error toggling extension:', error);
    updateUI(); // Keep current state
  } finally {
    isToggling = false;
  }
}

function updateUI() {
  console.log('🎨 Updating UI, isEnabled:', isEnabled);
  console.log('🎯 Elements check:', {
    toggleSwitch: !!toggleSwitch,
    statusDiv: !!statusDiv
  });
  
  if (!toggleSwitch || !statusDiv) {
    console.error('❌ Required elements not found for UI update');
    return;
  }
  
  if (isEnabled) {
    console.log('✅ Setting UI to ENABLED state...');
    toggleSwitch.classList.add('active');
    statusDiv.className = 'status enabled';
    statusDiv.textContent = 'Extension Enabled - Monitoring DOM';
    console.log('✅ UI updated to ENABLED state');
    console.log('🔍 Toggle classes:', toggleSwitch.className);
    console.log('🔍 Status classes:', statusDiv.className);
  } else {
    console.log('❌ Setting UI to DISABLED state...');
    toggleSwitch.classList.remove('active');
    statusDiv.className = 'status disabled';
    statusDiv.textContent = 'Extension Disabled';
    console.log('❌ UI updated to DISABLED state');
    console.log('🔍 Toggle classes:', toggleSwitch.className);
    console.log('🔍 Status classes:', statusDiv.className);
  }
}

console.log('🎯 Popup script ready');
