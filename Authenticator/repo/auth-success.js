document.addEventListener('DOMContentLoaded', function() {
  const statusDiv = document.getElementById('status');
  const backBtn = document.getElementById('backBtn');
  
  function updateStatus(message, success = null) {
    const statusDiv = document.getElementById('status');
    const backBtn = document.getElementById('backBtn');
    const spinner = document.querySelector('.loading-spinner');
    const statusIndicator = document.querySelector('.status-indicator');
    const processingCard = document.querySelector('.processing-card');
    
    statusDiv.textContent = message;
    
    if (success === true) {
      processingCard.className = 'processing-card success';
      spinner.style.display = 'none';
      
      // Replace spinner with success icon
      statusIndicator.innerHTML = '<div class="status-icon">✅</div>';
      
      backBtn.style.display = 'block';
    } else if (success === false) {
      processingCard.className = 'processing-card error';
      spinner.style.display = 'none';
      
      // Replace spinner with error icon
      statusIndicator.innerHTML = '<div class="status-icon">❌</div>';
      
      backBtn.style.display = 'block';
    }
  }
  
  backBtn.addEventListener('click', function() {
    window.location.href = 'popup.html';
  });
  
  // Check for SAML response passed from background
  chrome.storage.local.get(['pendingSamlResponse'], function(result) {
    if (result.pendingSamlResponse) {
      console.log('Processing pending SAML response');
      
      // Send to browser
      chrome.runtime.sendMessage({
        action: 'processSamlResponse',
        xmlResponse: result.pendingSamlResponse
      });
      
      // Clear pending response
      chrome.storage.local.remove(['pendingSamlResponse']);
    } else {
      updateStatus('Authentication session not found. Please return to the authenticator and try again.', false);
    }
  });
  
  // Listen for processing result
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === 'authResult') {
      if (message.success) {
        updateStatus('Authentication completed successfully! Your secure session is now active.', true);
      } else {
        updateStatus('Authentication process encountered an error. Please try again or contact support.', false);
      }
    }
  });
});