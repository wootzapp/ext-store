(function() {
  console.log('SAML Content Script: Loaded on', window.location.href);
  
  // Check if we're in an extension context
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
    console.log('Running in extension context');
    
    // Function to send SAML response
    function sendSamlResponse(response) {
      console.log('SAML response found, processing...');
      console.log('Response length:', response.length);
      
      // Store the SAML response
      chrome.storage.local.set({
        'pendingSamlResponse': response
      }, function() {
        console.log('SAML response stored, navigating to success page');
        
        // Navigate to success page
        window.location.href = chrome.runtime.getURL('auth-success.html');
      });
    }
    
    // Monitor for SAML responses in form submissions
    document.addEventListener('submit', function(event) {
      console.log('Form submission detected');
      
      const form = event.target;
      const samlInput = form.querySelector('input[name="SAMLResponse"]');
      
      if (samlInput && samlInput.value) {
        console.log('SAML: Found SAMLResponse in form submission');
        
        try {
          const decodedSaml = atob(samlInput.value);
          console.log('SAML: Successfully decoded base64 response');
          sendSamlResponse(decodedSaml);
        } catch (error) {
          console.log('SAML: Could not decode base64, sending raw response');
          sendSamlResponse(samlInput.value);
        }
        
        // Prevent form submission to avoid navigation
        event.preventDefault();
        return false;
      }
    });
    
    // Check for existing SAML responses on page load
    function checkForExistingSamlResponses() {
      const existingSamlInputs = document.querySelectorAll('input[name="SAMLResponse"]');
      existingSamlInputs.forEach(function(input) {
        if (input.value) {
          console.log('SAML: Found existing SAMLResponse input');
          try {
            const decodedSaml = atob(input.value);
            sendSamlResponse(decodedSaml);
          } catch (error) {
            sendSamlResponse(input.value);
          }
        }
      });
    }
    
    // Check immediately and after a delay
    checkForExistingSamlResponses();
    setTimeout(checkForExistingSamlResponses, 1000);
    
    // Monitor for DOM changes
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            const samlInputs = node.querySelectorAll ? node.querySelectorAll('input[name="SAMLResponse"]') : [];
            samlInputs.forEach(function(input) {
              if (input.value) {
                console.log('SAML: Found SAMLResponse in dynamically added content');
                try {
                  const decodedSaml = atob(input.value);
                  sendSamlResponse(decodedSaml);
                } catch (error) {
                  sendSamlResponse(input.value);
                }
              }
            });
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  console.log('SAML Content Script: Setup complete');
})();