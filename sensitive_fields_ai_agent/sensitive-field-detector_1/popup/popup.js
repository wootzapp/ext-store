// Popup JavaScript - Settings and UI management
// Handles user interactions, settings management, and API testing

class PopupManager {
  constructor() {
    // Default settings - API key is embedded in background script
    this.settings = {
      enableAI: true,
      enablePatterns: true,
      aiConfidenceThreshold: 0.7,
      enableVisualIndicators: false
    };
    
    this.elements = {};
    this.isApiKeyVisible = false;
    
    this.initialize();
  }

  async initialize() {
    console.log('🎛️ Popup initializing...');
    
    // Get DOM elements
    this.cacheElements();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Load current settings
    await this.loadSettings();
    
    // Update UI
    this.updateUI();
    
    // Load statistics
    await this.loadStatistics();
    
    console.log('✅ Popup ready');
  }

  cacheElements() {
    this.elements = {
      // Status elements
      statusIndicator: document.getElementById('statusIndicator'),
      statusText: document.getElementById('statusText'),
      
      // API status elements
      apiStatusIndicator: document.getElementById('apiStatusIndicator'),
      apiStatusText: document.getElementById('apiStatusText'),
      
      // Form elements
      enableAI: document.getElementById('enableAI'),
      enablePatterns: document.getElementById('enablePatterns'),
      confidenceThreshold: document.getElementById('confidenceThreshold'),
      confidenceValue: document.getElementById('confidenceValue'),
      enableVisualIndicators: document.getElementById('enableVisualIndicators'),
      
      // Action buttons
      saveSettings: document.getElementById('saveSettings'),
      testDetection: document.getElementById('testDetection'),
      clearCache: document.getElementById('clearCache'),
      
      // Statistics
      totalRequests: document.getElementById('totalRequests'),
      successRate: document.getElementById('successRate'),
      avgResponseTime: document.getElementById('avgResponseTime'),
      cacheHits: document.getElementById('cacheHits'),
      
      // UI elements
      toast: document.getElementById('toast'),
      loadingOverlay: document.getElementById('loadingOverlay'),
      
      // Links
      helpLink: document.getElementById('helpLink'),
      reportIssue: document.getElementById('reportIssue')
    };
  }

  setupEventListeners() {
    // Confidence threshold slider
    this.elements.confidenceThreshold.addEventListener('input', (e) => {
      this.elements.confidenceValue.textContent = `${e.target.value}%`;
      this.settings.aiConfidenceThreshold = parseInt(e.target.value) / 100;
    });

    // Save settings button
    this.elements.saveSettings.addEventListener('click', () => {
      this.saveSettings();
    });

    // Test detection button
    this.elements.testDetection.addEventListener('click', () => {
      this.testDetection();
    });

    // Clear cache button
    this.elements.clearCache.addEventListener('click', () => {
      this.clearCache();
    });

    // Checkbox listeners
    this.elements.enableAI.addEventListener('change', (e) => {
      this.settings.enableAI = e.target.checked;
      this.updateAISection();
    });

    this.elements.enablePatterns.addEventListener('change', (e) => {
      this.settings.enablePatterns = e.target.checked;
    });

    this.elements.enableVisualIndicators.addEventListener('change', (e) => {
      this.settings.enableVisualIndicators = e.target.checked;
    });

    // Help and support links
    this.elements.helpLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.openHelp();
    });

    this.elements.reportIssue.addEventListener('click', (e) => {
      e.preventDefault();
      this.reportIssue();
    });

    // Real-time form validation - no longer needed with embedded API key
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
      
      if (response?.success) {
        this.settings = { ...this.settings, ...response.settings };
        this.populateForm();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showToast('Failed to load settings', 'error');
    }
  }

  populateForm() {
    this.elements.enableAI.checked = this.settings.enableAI;
    this.elements.enablePatterns.checked = this.settings.enablePatterns;
    this.elements.confidenceThreshold.value = Math.round(this.settings.aiConfidenceThreshold * 100);
    this.elements.confidenceValue.textContent = `${Math.round(this.settings.aiConfidenceThreshold * 100)}%`;
    this.elements.enableVisualIndicators.checked = this.settings.enableVisualIndicators;
    
    // Test the embedded API key
    this.testEmbeddedApiKey();
  }

  updateUI() {
    this.updateStatus();
    this.updateAISection();
  }

  updateStatus() {
    const hasApiKey = Boolean(this.settings.geminiApiKey);
    const isEnabled = this.settings.enableAI && hasApiKey;
    
    if (isEnabled) {
      this.elements.statusIndicator.classList.add('active');
      this.elements.statusText.textContent = 'Active';
    } else {
      this.elements.statusIndicator.classList.remove('active');
      this.elements.statusText.textContent = 'Inactive';
    }
  }

  async testEmbeddedApiKey() {
    this.updateApiKeyStatus('Testing...', 'testing');
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'testAPIKey'
      });
      
      if (response?.success) {
        if (response.valid) {
          this.updateApiKeyStatus('Connected', 'success');
        } else {
          this.updateApiKeyStatus('Failed', 'error');
        }
      } else {
        this.updateApiKeyStatus('Error', 'error');
      }
    } catch (error) {
      console.error('API key test failed:', error);
      this.updateApiKeyStatus('Error', 'error');
    }
  }

  updateApiKeyStatus(text, status) {
    this.elements.apiStatusText.textContent = text;
    const statusDot = this.elements.apiStatusIndicator.querySelector('.status-dot');
    
    statusDot.className = 'status-dot';
    if (status === 'success') {
      statusDot.classList.add('success');
    } else if (status === 'error') {
      statusDot.classList.add('error');
    }
    // 'testing' uses default yellow with pulse animation
  }

  updateAISection() {
    const aiElements = document.querySelectorAll('[data-ai-dependent]');
    const isEnabled = this.settings.enableAI;
    
    aiElements.forEach(element => {
      element.style.opacity = isEnabled ? '1' : '0.5';
      element.style.pointerEvents = isEnabled ? 'auto' : 'none';
    });
  }

  isFormValid() {
    // Basic validation - API key is embedded, so always valid
    return true;
  }

  async saveSettings() {
    try {
      // Collect current form values (no API key needed since it's embedded)
      const formSettings = {
        enableAI: this.elements.enableAI.checked,
        enablePatterns: this.elements.enablePatterns.checked,
        aiConfidenceThreshold: parseInt(this.elements.confidenceThreshold.value) / 100,
        enableVisualIndicators: this.elements.enableVisualIndicators.checked
      };

      const response = await chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: formSettings
      });

      if (response?.success) {
        this.settings = { ...this.settings, ...formSettings };
        this.updateUI();
        this.showToast('Settings saved successfully', 'success');
      } else {
        this.showToast('Failed to save settings', 'error');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showToast('Failed to save settings', 'error');
    }
  }

  async testDetection() {
    try {
      this.showToast('Opening test page...', 'info');
      
      // Create a test page with various form fields
      const testPageUrl = chrome.runtime.getURL('test/test-page.html');
      await chrome.tabs.create({ url: testPageUrl });
      
      // Close popup after opening test page
      window.close();
    } catch (error) {
      console.error('Failed to open test page:', error);
      this.showToast('Failed to open test page', 'error');
    }
  }

  async clearCache() {
    if (!confirm('Are you sure you want to clear all cached data? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await chrome.runtime.sendMessage({ action: 'clearCache' });
      
      if (response?.success) {
        this.showToast('Cache cleared successfully', 'success');
        await this.loadStatistics(); // Refresh stats
      } else {
        this.showToast('Failed to clear cache', 'error');
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
      this.showToast('Failed to clear cache', 'error');
    }
  }

  async loadStatistics() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatistics' });
      
      if (response?.success) {
        this.updateStatistics(response.statistics);
      }
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }

  updateStatistics(stats) {
    this.elements.totalRequests.textContent = stats.totalRequests || 0;
    this.elements.successRate.textContent = `${Math.round((stats.successRate || 0) * 100)}%`;
    this.elements.avgResponseTime.textContent = `${Math.round(stats.averageResponseTime || 0)}ms`;
    
    // Calculate cache efficiency (this would come from content script)
    const cacheEfficiency = stats.cacheHits ? 
      Math.round((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100) : 0;
    this.elements.cacheHits.textContent = `${cacheEfficiency}%`;
  }

  showToast(message, type = 'info') {
    this.elements.toast.textContent = message;
    this.elements.toast.className = `toast ${type}`;
    this.elements.toast.classList.add('show');
    
    setTimeout(() => {
      this.elements.toast.classList.remove('show');
    }, 3000);
  }

  showLoading(message = 'Loading...') {
    this.elements.loadingOverlay.querySelector('.loading-text').textContent = message;
    this.elements.loadingOverlay.classList.add('show');
  }

  hideLoading() {
    this.elements.loadingOverlay.classList.remove('show');
  }

  openHelp() {
    const helpUrl = 'https://github.com/your-repo/sensitive-field-detector/wiki';
    chrome.tabs.create({ url: helpUrl });
  }

  reportIssue() {
    const issueUrl = 'https://github.com/your-repo/sensitive-field-detector/issues/new';
    chrome.tabs.create({ url: issueUrl });
  }
}

// Utility functions
function formatUptime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});

// Handle keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + S to save settings
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    document.getElementById('saveSettings')?.click();
  }
  
  // Escape to close
  if (e.key === 'Escape') {
    window.close();
  }
});

// Auto-save on form changes (debounced)
let autoSaveTimeout;
document.addEventListener('input', () => {
  clearTimeout(autoSaveTimeout);
  autoSaveTimeout = setTimeout(() => {
    // Auto-save logic could go here
    // For now, just validate the form
    document.querySelector('.popup-manager')?.validateForm();
  }, 1000);
});

// Handle extension messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'settingsUpdated') {
    // Reload settings when updated from another source
    window.location.reload();
  }
});
