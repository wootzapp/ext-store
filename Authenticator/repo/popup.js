document.addEventListener('DOMContentLoaded', function() {
  const authBtn = document.getElementById('authBtn');
  const statusDiv = document.getElementById('status');
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  
  const OKTA_URL = 'https://trial-7599136.okta.com/home/trial-7599136_testapp_1/0oasskc7oca3vLm1W697/alnsskld6bWGGNwua697';
  
  function updateStep(stepNumber, completed = false) {
    const step = document.getElementById(`step${stepNumber}`);
    if (step) {
      if (completed) {
        step.classList.add('completed');
      } else {
        step.classList.remove('completed');
      }
    }
  }
  
  function updateStatus(message, type = 'info', showProgress = false) {
    // Remove existing status classes
    statusDiv.className = '';
    
    // Set message with appropriate icon and styling
    let icon = '�';
    if (type === 'success') {
      statusDiv.className = 'success';
      icon = '✅';
    } else if (type === 'error') {
      statusDiv.className = 'error';
      icon = '❌';
    } else if (type === 'loading') {
      statusDiv.className = 'loading';
      icon = '⏳';
    }
    
    statusDiv.innerHTML = `
      <div class="status-content">
        <span class="status-icon">${icon}</span>
        <span>${message}</span>
      </div>
      <div class="progress-bar" id="progressBar" style="display: ${showProgress ? 'block' : 'none'};">
        <div class="progress-fill" id="progressFill"></div>
      </div>
    `;
    
    if (showProgress) {
      setTimeout(() => {
        const fill = document.getElementById('progressFill');
        if (fill) {
          fill.classList.add('animate');
        }
      }, 100);
    }
    
    console.log('Status:', message);
  }
  
  function setButtonState(state) {
    const buttonContent = authBtn.querySelector('.button-content');
    
    switch(state) {
      case 'loading':
        authBtn.disabled = true;
        authBtn.classList.add('button-loading');
        buttonContent.innerHTML = '<div class="loading-dots"><div></div><div></div><div></div></div>';
        break;
      case 'disabled':
        authBtn.disabled = true;
        buttonContent.innerHTML = '<span>Processing...</span>';
        break;
      case 'ready':
      default:
        authBtn.disabled = false;
        authBtn.classList.remove('button-loading');
        buttonContent.innerHTML = `
          <svg class="button-icon" viewBox="0 0 24 24">
            <path d="M13,3V9H21V3M13,21H21V11H13M3,21H11V15H3M3,13H11V3H3V13Z"/>
          </svg>
          <span>Begin Authentication</span>
        `;
        break;
    }
  }
  
  authBtn.addEventListener('click', function() {
    console.log('Auth button clicked - navigating to Okta');
    
    // Update UI to show progress
    setButtonState('loading');
    updateStep(2, true);
    updateStatus('Connecting to authentication server...', 'loading', true);
    
    // Store that we're starting authentication
    chrome.storage.local.set({
      'authInProgress': true,
      'extensionUrl': chrome.runtime.getURL('popup.html')
    });
    
    // Simulate connection delay for better UX
    setTimeout(() => {
      updateStatus('Redirecting to secure login portal...', 'loading', true);
      
      setTimeout(function() {
        window.location.href = OKTA_URL;
      }, 800);
    }, 1200);
  });
  
  // Check if we're returning from authentication
  chrome.storage.local.get(['authResult'], function(result) {
    if (result.authResult) {
      if (result.authResult.success) {
        updateStep(3, true);
        setButtonState('disabled');
        updateStatus('Authentication completed successfully! You are now signed in to your organization.', 'success');
        
        // Show a completion message after a delay
        setTimeout(() => {
          updateStatus('Welcome! Your secure session is now active. You can close this window.', 'success');
        }, 3000);
      } else {
        updateStep(2, false);
        updateStep(3, false);
        setButtonState('ready');
        updateStatus('Authentication failed. Please try again or contact your IT administrator if the problem persists.', 'error');
      }
      
      // Clear the result
      chrome.storage.local.remove(['authResult']);
    }
  });
  
  console.log('Popup script loaded');
});