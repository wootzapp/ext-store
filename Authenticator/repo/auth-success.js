document.addEventListener('DOMContentLoaded', function () {
  const statusDiv = document.getElementById('status');
  const backBtn = document.getElementById('backBtn');

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