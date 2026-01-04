document.addEventListener('DOMContentLoaded', function () {
  const statusDiv = document.getElementById('status');
  const backBtn = document.getElementById('backBtn');

  // Check URL parameters for specific actions
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');

  // Handle mTLS restart requirement
  if (action === 'mtls-restart-required') {
    console.log('[mTLS Cert] Displaying restart required message');
    
    // Update the page to show restart message
    const headerTitle = document.querySelector('.header-title');
    const spinner = document.querySelector('.loading-spinner');
    const logo = document.querySelector('.brand-logo');
    const processingCard = document.querySelector('.processing-card');
    const footerText = document.querySelector('.footer-text');
    
    headerTitle.textContent = 'Security Features';
    statusDiv.innerHTML = '<strong style="font-size: 16px; color: #ff6b35; display: block; margin-bottom: 12px;">⚠️ RESTART REQUIRED</strong>' +
                          '<p style="margin-bottom: 8px;">Please restart the Wootz browser now to activate security features.</p>' +
                          '<p style="font-size: 13px; color: #666;">After restart, re-login in this extension to access security features.</p>';
    footerText.textContent = 'Close this tab after restarting the browser';
    
    // Hide spinner, show logo
    if (spinner) spinner.style.display = 'none';
    if (logo) logo.style.display = 'flex';
    
    // Style the card
    processingCard.style.borderLeft = '4px solid #ff6b35';
    
    // Never show the back button
    backBtn.style.display = 'none';
    
    return; // Exit early, don't process normal auth flow
  }

  function updateStatus(message, success = null) {
    const statusDiv = document.getElementById('status');
    const backBtn = document.getElementById('backBtn');
    const spinner = document.querySelector('.loading-spinner');
    const statusIndicator = document.querySelector('.status-indicator');
    const processingCard = document.querySelector('.processing-card');
    const logo = statusIndicator.querySelector('.brand-logo');

    statusDiv.textContent = message;

    if (success === true) {
      processingCard.className = 'processing-card success';
      spinner.style.display = 'none';
      
      // Show the logo and hide the status text
      logo.style.display = 'flex';
      statusDiv.style.display = 'none';

      // Never show the button
      backBtn.style.display = 'none';
    } else if (success === false) {
      processingCard.className = 'processing-card error';
      spinner.style.display = 'none';
      logo.style.display = 'none';
      statusDiv.style.display = 'block';

      // Never show the button
      backBtn.style.display = 'none';
    }
  }

  backBtn.addEventListener('click', function () {
    window.location.href = 'popup.html';
  });

  // Check for auth result from content script (new approach)
  chrome.storage.local.get(['tempAuthResult'], function (result) {
    if (result.tempAuthResult) {
      console.log('Processing temp auth result from content script:', result.tempAuthResult);

      if (result.tempAuthResult.success) {
        updateStatus('', true);
      } else {
        updateStatus(`Authentication failed: ${result.tempAuthResult.error || 'Please try again'}`, false);
      }

      // Clear the result after processing
      chrome.storage.local.remove(['tempAuthResult'], function () {
        console.log('Cleared tempAuthResult from storage');
      });
    } else {
      updateStatus('Authentication session not found. Please return and try again.', false);
    }
  });

  // Listen for processing result (keeping this for any runtime messages)
  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === 'authResult') {
      if (message.success) {
        updateStatus('', true);
      } else {
        updateStatus('Authentication failed. Please try again.', false);
      }
    }
  });
});