// Provider Verification Popup Component
export function createProviderVerificationPopup(data) {
    const popup = document.createElement('div');
  popup.id = 'reclaim-verification-popup';
    popup.className = 'reclaim-popup';
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 400px;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 20px;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  header.innerHTML = `
    <span>🔐 Provider Verification</span>
    <button id="close-popup" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    padding: 20px;
    max-height: 400px;
    overflow-y: auto;
  `;

  const statusDiv = document.createElement('div');
  statusDiv.id = 'status-message';
  statusDiv.style.cssText = `
    margin-bottom: 16px;
    padding: 12px;
    border-radius: 6px;
    background: #f8f9fa;
    border-left: 4px solid #007bff;
    font-size: 14px;
    line-height: 1.4;
  `;
  statusDiv.textContent = 'Initializing verification process...';

  const progressDiv = document.createElement('div');
  progressDiv.id = 'progress-container';
  progressDiv.style.cssText = `
    margin-bottom: 16px;
    display: none;
  `;

  const progressBar = document.createElement('div');
  progressBar.id = 'progress-bar';
  progressBar.style.cssText = `
    width: 100%;
    height: 4px;
    background: #e9ecef;
    border-radius: 2px;
    overflow: hidden;
  `;

  const progressFill = document.createElement('div');
  progressFill.id = 'progress-fill';
  progressFill.style.cssText = `
    height: 100%;
    background: linear-gradient(90deg, #667eea, #764ba2);
    width: 0%;
    transition: width 0.3s ease;
  `;

  progressBar.appendChild(progressFill);
  progressDiv.appendChild(progressBar);

  const proofContainer = document.createElement('div');
  proofContainer.id = 'proof-container';
  proofContainer.style.cssText = `
    display: none;
    margin-top: 16px;
  `;

  const proofTitle = document.createElement('h4');
  proofTitle.style.cssText = `
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
    color: #333;
  `;
  proofTitle.textContent = 'Generated ZK Proof:';

  const proofContent = document.createElement('div');
  proofContent.id = 'proof-content';
  proofContent.style.cssText = `
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 12px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 11px;
    line-height: 1.4;
    max-height: 200px;
    overflow-y: auto;
    word-break: break-all;
    position: relative;
  `;

  const copyButton = document.createElement('button');
  copyButton.id = 'copy-proof';
  copyButton.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 10px;
    cursor: pointer;
    opacity: 0.8;
  `;
  copyButton.textContent = 'Copy';

  copyButton.addEventListener('click', () => {
    const text = proofContent.textContent;
    navigator.clipboard.writeText(text).then(() => {
      copyButton.textContent = 'Copied!';
      setTimeout(() => {
        copyButton.textContent = 'Copy';
      }, 2000);
    }).catch(() => {
      copyButton.textContent = 'Failed';
                setTimeout(() => {
        copyButton.textContent = 'Copy';
                }, 2000);
    });
  });

  proofContent.appendChild(copyButton);
  proofContainer.appendChild(proofTitle);
  proofContainer.appendChild(proofContent);

  content.appendChild(statusDiv);
  content.appendChild(progressDiv);
  content.appendChild(proofContainer);
  popup.appendChild(header);
  popup.appendChild(content);

  // Close button functionality
  const closeBtn = popup.querySelector('#close-popup');
  closeBtn.addEventListener('click', () => {
    popup.remove();
  });

  // Popup methods
  popup.updateStatus = (message, type = 'info') => {
    const statusDiv = popup.querySelector('#status-message');
    if (statusDiv) {
      statusDiv.textContent = message;
      
      const colors = {
        info: '#007bff',
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107'
      };
      
      statusDiv.style.borderLeftColor = colors[type] || colors.info;
    }
  };

  popup.startLoading = () => {
    const progressDiv = popup.querySelector('#progress-container');
    const progressFill = popup.querySelector('#progress-fill');
    
    if (progressDiv && progressFill) {
      progressDiv.style.display = 'block';
      
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        progressFill.style.width = `${Math.min(progress, 100)}%`;
        
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 80);
    }
  };

  popup.completeLoading = (proofData) => {
    const progressDiv = popup.querySelector('#progress-container');
    const progressFill = popup.querySelector('#progress-fill');
    const proofContainer = popup.querySelector('#proof-container');
    const proofContent = popup.querySelector('#proof-content');
    
    if (progressFill) {
      progressFill.style.width = '100%';
    }
    
    if (proofData && proofContainer && proofContent) {
      setTimeout(() => {
        proofContainer.style.display = 'block';
        proofContent.textContent = JSON.stringify(proofData, null, 2);
      }, 500);
    }
  };

  popup.showError = (error) => {
    popup.updateStatus(`Error: ${error}`, 'error');
  };

  popup.showSuccess = (message) => {
    popup.updateStatus(message, 'success');
  };

  // Initialize with data
  if (data && data.providerName) {
    popup.updateStatus(`Starting verification for ${data.providerName}...`);
  }

  return popup;
}