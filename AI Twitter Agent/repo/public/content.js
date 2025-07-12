/*global chrome*/

class TwitterContentScript {
  constructor() {
    this.isLoggedIn = false;
    this.setupMessageListener();
    
    // Wait for page to fully load before checking login
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.checkLoginStatusAndNotify(), 2000);
      });
    } else {
      setTimeout(() => this.checkLoginStatusAndNotify(), 2000);
    }
  }

  // NEW: Check login and notify background
  async checkLoginStatusAndNotify() {
    await this.checkLoginStatus();
    this.notifyReady();
  }

  // NEW: Notify background script that content script is loaded and ready
  notifyReady() {
    console.log('Content: Content script ready, notifying background');
    chrome.runtime.sendMessage({
      action: 'CONTENT_SCRIPT_READY'
    }, (response) => {
      console.log('Content: Background response to ready notification:', response);
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Content: Message received:', request.action);
      
      switch (request.action) {
        case 'CHECK_LOGIN':
          console.log('Content: Checking login status...');
          this.checkLoginStatus().then(sendResponse);
          return true;

        case 'LOGIN':
          console.log('Content: Login request received');
          this.performLogin(request.credentials).then(result => {
            console.log('Content: Login result:', result);
            // Send login result back to background
            chrome.runtime.sendMessage({
              action: 'LOGIN_RESULT',
              result: result
            });
          });
          return true;

        case 'POST_TWEET':
          console.log('Content: POST_TWEET action received');
          this.postTweet(request.content).then(sendResponse);
          return true;

        // case 'VERIFY_TWEET_POSTED':
        //   console.log('Content: VERIFY_TWEET action received');
        //   this.verifyTweetPosted(request.content).then(sendResponse);
        //   return true;

        default:
          console.log('Content: Unknown action:', request.action);
          sendResponse({ success: false, error: 'Unknown action' });
          return true;
      }
    });
  }

  // ENHANCED: Better login detection with multiple methods
  async checkLoginStatus() {
    try {
      console.log('Content: Checking login status...');
      console.log('Content: Current URL:', window.location.href);
      
      // Wait for page to load properly
      await this.waitForPageLoad();
      
      let isLoggedIn = false;
      
      // Check URL first - if we're on login flow, we're definitely not logged in
      const currentUrl = window.location.href.toLowerCase();
      if (currentUrl.includes('/i/flow/login') || currentUrl.includes('/login')) {
        console.log('Content: On login flow URL - not logged in');
        return { loggedIn: false };
      }
      
      // Method 1: Check for login-specific elements that indicate we're NOT logged in
      const loginPageIndicators = [
        'input[name="text"]', // Username field on login page
        'input[name="password"]', // Password field on login page
        '[data-testid="LoginForm_Login_Button"]', // Login button
        '.login-form', // Generic login form
        '[data-testid="ocfEnterTextTextInput"]', // Email verification field
        '[data-testid="confirmationSheetConfirm"]', // Login confirmation button
        '[data-testid="LoginForm"]' // Login form container
      ];
      
      const hasLoginElements = loginPageIndicators.some(selector => 
        document.querySelector(selector)
      );
      
      if (hasLoginElements) {
        console.log('Content: Found login page elements - not logged in');
        return { loggedIn: false };
      }
      
      // Method 2: Check for logged-in elements
      const loggedInIndicators = [
        '[data-testid="AppTabBar_Home_Link"]', // Home tab
        '[data-testid="AppTabBar_Profile_Link"]', // Profile tab
        '[data-testid="SideNav_AccountSwitcher_Button"]', // Account switcher
        '[data-testid="tweetTextarea_0"]', // Tweet compose box
        '[aria-label="Home timeline"]', // Home timeline
        '[data-testid="primaryColumn"]', // Main content column
        '[data-testid="SideNav_NewTweet_Button"]', // New tweet button
        '[data-testid="AppTabBar_Explore_Link"]', // Explore tab
        'nav[role="navigation"]' // Main navigation
      ];
      
      isLoggedIn = loggedInIndicators.some(selector => {
        const element = document.querySelector(selector);
        return element && this.isElementVisible(element);
      });
      
      // Method 3: Check URL patterns
      if (!isLoggedIn) {
        const loggedInUrls = [
          '/home',
          '/compose',
          '/notifications',
          '/messages',
          '/bookmarks',
          '/lists',
          '/profile'
        ];
        
        isLoggedIn = loggedInUrls.some(path => currentUrl.includes(path));
      }
      
      // Method 4: Check for user-specific content
      if (!isLoggedIn) {
        const userContent = document.querySelector('[data-testid="UserName"]') ||
                          document.querySelector('[data-testid="UserScreenName"]') ||
                          document.querySelector('[data-testid="user-avatar"]');
        
        if (userContent) {
          isLoggedIn = true;
        }
      }

      // Method 5: Final check - if we're on compose page and no login elements, assume logged in
      if (!isLoggedIn && window.location.href.includes('compose')) {
        const tweetBox = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                        document.querySelector('[role="textbox"]');
        if (tweetBox) {
          console.log('Content: Found tweet compose box - assuming logged in');
          isLoggedIn = true;
        }
      }

      this.isLoggedIn = isLoggedIn;
      console.log('Content: Final login status:', this.isLoggedIn);
      console.log('Content: URL:', window.location.href);
      
      return { loggedIn: this.isLoggedIn };
    } catch (error) {
      console.error('Content: Error checking login status:', error);
      // FALLBACK: If we can't determine, assume logged in for compose page
      if (window.location.href.includes('compose')) {
        console.log('Content: Error checking login, but on compose page - assuming logged in');
        this.isLoggedIn = true;
        return { loggedIn: true };
      }
      return { loggedIn: false, error: error.message };
    }
  }

  // NEW: Wait for page to load properly
  async waitForPageLoad() {
    if (document.readyState === 'complete') {
      return;
    }
    
    return new Promise((resolve) => {
      const checkLoad = () => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          setTimeout(checkLoad, 100);
        }
      };
      checkLoad();
    });
  }

  // MODIFIED: Skip login check for compose page
  async postTweet(content) {
    try {
      console.log('Content: Starting tweet posting process...');
      console.log('Content: Tweet content:', content);
      console.log('Content: Current URL:', window.location.href);

      // First check login status
      const loginStatus = await this.checkLoginStatus();
      console.log('Content: Login status check result:', loginStatus);

      if (!loginStatus.loggedIn) {
        console.log('Content: Not logged in, attempting to login...');
        // Get credentials from storage
        const config = await chrome.storage.sync.get(['agentConfig']);
        if (!config.agentConfig?.twitter?.username || !config.agentConfig?.twitter?.password) {
          const result = {
            success: false,
            error: 'Twitter credentials not configured',
            posted: false
          };
          this.sendTweetResult(result);
          return result;
        }

        // // Attempt login
        // const loginResult = await this.performLogin({
        //   username: config.agentConfig.twitter.username,
        //   password: config.agentConfig.twitter.password
        // });

        // if (!loginResult.success) {
        const result = {
          success: false,
          error: 'Failed to login to Twitter: ',
          posted: false
        };
        this.sendTweetResult(result);
        return result;
        // }

        // // Wait for login to complete and verify
        // await this.sleep(5000);
        // const verifyLogin = await this.checkLoginStatus();
        // if (!verifyLogin.loggedIn) {
        //   const result = {
        //     success: false,
        //     error: 'Login verification failed',
        //     posted: false
        //   };
        //   this.sendTweetResult(result);
        //   return result;
        // }
      }

      // Now that we're logged in, proceed with posting
      console.log('Content: Login verified, proceeding to compose page...');

      // Navigate to compose page if not already there
      if (!window.location.href.includes('compose')) {
        console.log('Content: Navigating to compose page...');
        window.location.href = 'https://x.com/compose/post';
        await this.sleep(5000); // Wait for navigation
      }

      // Wait for compose page to load
      console.log('Content: Waiting for compose page elements...');
      await this.waitForComposePage();

      // Find and focus tweet textarea
      const textArea = await this.findTweetTextarea();
      if (!textArea) {
        console.log('Content: Tweet textarea not found');
        const result = {
          success: false,
          error: 'Tweet textarea not found',
          posted: false
        };
        this.sendTweetResult(result);
        return result;
      }

      console.log('Content: Found tweet textarea, setting content...');
      
      // Clear existing content and set new content
      await this.setTweetContent(textArea, content);

      // Wait for content to be processed
      await this.sleep(1000);

      // Verify content was set
      const currentContent = this.getTweetContent(textArea);
      if (!currentContent || !currentContent.includes(content.substring(0, 20))) {
        console.warn('Content: Content not set properly, trying alternative method...');
        await this.setTweetContentAlternative(textArea, content);
        await this.sleep(1000);
      }
      console.log('Content: Assuming content is set properly');

      let postButton = null;
      for(let i = 0; i < 3; i++) {
        postButton = await this.findPostButton();
        if (!postButton) {
          console.log('Content: Post button not found');
          const result = {
            success: false,
            error: 'Post button not found',
            posted: false
          };
          this.sendTweetResult(result);
          return result;
        }
        await this.sleep(1000);
      }
      
      // Check if post button is enabled
      if (postButton.disabled || postButton.getAttribute('aria-disabled') === 'true') {
        console.log('Content: Post button is disabled');
        const result = {
          success: false,
          error: 'Post button is disabled - content may be invalid',
          posted: false
        };
        this.sendTweetResult(result);
        return result;
      }

      console.log('Content: Post button ready, proceeding to click...');
      postButton.click();

      await this.sleep(2000);

      const isOnHomePage = window.location.href.includes('/home');
      if (isOnHomePage) {
        console.log('Content: Successfully navigated to home page');
        const result = {
          success: true,
          message: 'Tweet posted successfully - redirected to home',
          posted: true,
          content: content,
          timestamp: Date.now(),
          verificationDetails: {
            navigationDetected: true,
            onHomePage: true
          }
        };
        console.log('Content: Sending successful result:', result);
        this.sendTweetResult(result);
        return result;
      }

      console.log('Content: Performing post-click verification...');
      const verificationResult = await this.verifyTweetPosted();
      console.log('Content: Verification result:', { verificationResult });

      const finalUrlCheck = window.location.href.includes('/home');

      const result = {
        success: verificationResult || finalUrlCheck,
        message: verificationResult ? 
          'Tweet posted successfully - content verified' : 
          finalUrlCheck ?
            'Tweet posted successfully - on home page' :
            'Tweet status uncertain',
        posted: verificationResult || finalUrlCheck,
        content: content,
        timestamp: Date.now(),
        verificationDetails: {
          contentCleared: verificationResult,
          onHomePage: finalUrlCheck
        }
      };

      console.log('Content: Sending final result:', result);
      this.sendTweetResult(result);
      return result;

    } catch (error) {
      console.error('Content: Error during tweet posting:', {
        error: error.message,
        stack: error.stack,
        phase: 'post-button-click',
        url: window.location.href
      });
      
      const result = {
        success: false,
        error: error.message,
        posted: false,
        errorDetails: {
          type: error.name,
          stack: error.stack,
          url: window.location.href
        }
      };
      
      this.sendTweetResult(result);
      return result;
    }
  }

  // NEW: Send tweet result back to background script
  sendTweetResult(result) {
    chrome.runtime.sendMessage({
      action: 'TWEET_RESULT',
      result: result
    });
  }

  // NEW: Wait for compose page to be ready
  async waitForComposePage() {
    const composePageElements = [
      '[data-testid="tweetTextarea_0"]',
      '[data-testid="tweetButton"]',
      '[role="textbox"][aria-label*="Tweet"]'
    ];

    for (let i = 0; i < 30; i++) { // Wait up to 30 seconds
      for (const selector of composePageElements) {
        if (document.querySelector(selector)) {
          console.log('Content: Compose page ready');
          return;
        }
      }
      await this.sleep(1000);
    }
    
    throw new Error('Compose page did not load within timeout');
  }

  // NEW: Find tweet textarea with multiple fallback selectors
  async findTweetTextarea() {
    const selectors = [
      '[data-testid="tweetTextarea_0"]',
      '[role="textbox"][aria-label*="Tweet"]',
      '[role="textbox"][aria-label*="What"]',
      'div[contenteditable="true"][data-text="What\'s happening?"]',
      'div[contenteditable="true"]'
    ];

    // for(let i = 0; i < 5; i++) {
    //   for (const selector of selectors) {
    //     const element = document.querySelector(selector);
    //     console.log('Content: Finding textarea with selector:', selector);
    //     if (element && this.isElementVisible(element)) {
    //       console.log('Content: Found textarea with selector:', selector);
    //       return element;
    //     }
    //   }
    //   await this.sleep(1000);
    // }

    // Wait and try again
    await this.sleep(1000);

    for(let i = 0; i < 5; i++) {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        console.log('Content: Finding textarea with selector:', selector);
        if (element) {
          console.log('Content: Found textarea on retry with selector:', selector);
          return element;
        }
      }
      await this.sleep(1000);
    }

    return null;
  }

  // NEW: Set tweet content with improved method
  async setTweetContent(textArea, content) {
    try {
      console.log('Content: Starting to set tweet content', {
        contentLength: content.length,
        textAreaExists: !!textArea,
        textAreaVisible: this.isElementVisible(textArea)
      });

      // Focus the textarea
      textArea.focus();
      textArea.click();
      console.log('Content: Textarea focused and clicked');
      
      // Clear existing content
      const initialContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
      console.log('Content: Initial content length:', initialContent.length);
      
      textArea.textContent = '';
      textArea.innerHTML = '';
      if (textArea.value !== undefined) {
        textArea.value = '';
      }
      console.log('Content: Cleared existing content');

      // Method 1: Direct assignment
      console.log('Content: Attempting direct content assignment...');
      textArea.textContent = content;
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
      
      await this.sleep(500);
      
      let currentContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
      console.log('Content: After direct assignment:', {
        success: currentContent === content,
        expectedLength: content.length,
        actualLength: currentContent.length
      });
      
      // Method 2: execCommand if available
      if (document.execCommand) {
        console.log('Content: Attempting execCommand method...');
        textArea.focus();
        document.execCommand('selectAll');
        document.execCommand('insertText', false, content);
        
        currentContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
        console.log('Content: After execCommand:', {
          success: currentContent === content,
          expectedLength: content.length,
          actualLength: currentContent.length
        });
      } else {
        console.log('Content: execCommand not available, skipping method 2');
      }
      
      // Method 3: Simulate typing for complex cases
      if (currentContent !== content) {
        console.log('Content: Previous methods incomplete, attempting typing simulation...');
        await this.simulateTyping(textArea, content);
        
        currentContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
        console.log('Content: After typing simulation:', {
          success: currentContent === content,
          expectedLength: content.length,
          actualLength: currentContent.length
        });
      }
      
      // Final verification and events
      console.log('Content: Dispatching final events...');
      textArea.dispatchEvent(new Event('input', { bubbles: true }));
      textArea.dispatchEvent(new Event('change', { bubbles: true }));
      textArea.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
      
      const finalContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
      console.log('Content: Final content verification:', {
        success: finalContent === content,
        expectedLength: content.length,
        actualLength: finalContent.length,
        matches: finalContent === content
      });
      
      if (finalContent !== content) {
        throw new Error('Failed to set content correctly after all methods');
      }
      
    } catch (error) {
      console.error('Content: Error setting tweet content:', {
        error: error.message,
        type: error.name,
        stack: error.stack,
        contentLength: content.length,
        textAreaState: {
          exists: !!textArea,
          visible: textArea ? this.isElementVisible(textArea) : false,
          currentContent: textArea ? (textArea.textContent || textArea.innerHTML || textArea.value || '').length : 0
        }
      });
      throw error;
    }
  }

  // NEW: Alternative content setting method
  async setTweetContentAlternative(textArea, content) {
    try {
      console.log('Content: Starting alternative content setting method', {
        contentLength: content.length,
        textAreaExists: !!textArea,
        textAreaVisible: this.isElementVisible(textArea)
      });

      textArea.focus();
      console.log('Content: Textarea focused');
      
      // Use InputEvent if supported
      if (typeof InputEvent !== 'undefined') {
        console.log('Content: Attempting InputEvent method...');
        textArea.dispatchEvent(new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: content,
          bubbles: true
        }));
        
        let currentContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
        console.log('Content: After InputEvent:', {
          success: currentContent === content,
          expectedLength: content.length,
          actualLength: currentContent.length
        });
      } else {
        console.log('Content: InputEvent not supported, skipping method');
      }
      
      // Set content directly
      console.log('Content: Attempting direct content setting...');
      textArea.textContent = content;
      textArea.innerHTML = content;
      
      let directContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
      console.log('Content: After direct setting:', {
        success: directContent === content,
        expectedLength: content.length,
        actualLength: directContent.length
      });
      
      // Use clipboard API as fallback
      if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log('Content: Attempting clipboard method...');
        try {
          await navigator.clipboard.writeText(content);
          textArea.focus();
          document.execCommand('paste');
          
          let clipboardContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
          console.log('Content: After clipboard paste:', {
            success: clipboardContent === content,
            expectedLength: content.length,
            actualLength: clipboardContent.length
          });
        } catch (clipboardError) {
          console.warn('Content: Clipboard operation failed:', {
            error: clipboardError.message,
            type: clipboardError.name
          });
        }
      } else {
        console.log('Content: Clipboard API not available, skipping method');
      }
      
      // Final verification
      const finalContent = textArea.textContent || textArea.innerHTML || textArea.value || '';
      console.log('Content: Alternative method final result:', {
        success: finalContent === content,
        expectedLength: content.length,
        actualLength: finalContent.length,
        matches: finalContent === content
      });
      
    } catch (error) {
      console.error('Content: Error in alternative content setting:', {
        error: error.message,
        type: error.name,
        stack: error.stack,
        contentLength: content.length,
        textAreaState: {
          exists: !!textArea,
          visible: textArea ? this.isElementVisible(textArea) : false,
          currentContent: textArea ? (textArea.textContent || textArea.innerHTML || textArea.value || '').length : 0
        }
      });
      // Don't throw since this is a fallback method
    }
  }

  // NEW: Simulate typing for better compatibility
  async simulateTyping(element, text) {
    element.focus();
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Dispatch keydown
      element.dispatchEvent(new KeyboardEvent('keydown', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true
      }));
      
      // Add character
      element.textContent += char;
      
      // Dispatch input
      element.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Dispatch keyup
      element.dispatchEvent(new KeyboardEvent('keyup', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true
      }));
      
      // Small delay between characters
      if (i % 10 === 0) await this.sleep(50);
    }
  }

  // NEW: Get current tweet content
  getTweetContent(textArea) {
    return textArea.textContent || textArea.innerHTML || textArea.value || '';
  }

  // NEW: Find post button with multiple selectors
  async findPostButton() {
    const selectors = [
      '[data-testid="tweetButton"]',
      '[data-testid="tweetButtonInline"]',
      '[role="button"][aria-label*="Post"]',
      '[role="button"][aria-label*="Tweet"]',
      'button:contains("Post")',
      'button:contains("Tweet")'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && this.isElementVisible(element)) {
        console.log('Content: Found post button with selector:', selector);
        return element;
      }
    }

    return null;
  }

  // NEW: Verify tweet was posted
  async verifyTweetPosted() {
    try {
      console.log('Content: Starting tweet verification...');
      
      // Method 1: Check if we're redirected away from compose
      const currentUrl = window.location.href;

      if(currentUrl.includes('/home')){
        console.log('Content: On home page - likely posted');
        return true;
      }

      const redirectedAway = !currentUrl.includes('compose');
      console.log('Content: URL verification:', {
        currentUrl,
        redirectedAway
      });

      if (redirectedAway) {
        console.log('Content: Redirected away from compose page - likely posted');
        return true;
      }

      // Method 2: Check if textarea is cleared
      const textArea = document.querySelector('[data-testid="tweetTextarea_0"]');
      if (textArea) {
        const content = this.getTweetContent(textArea);
        const isCleared = !content || content.trim() === '';
        console.log('Content: Textarea verification:', {
          hasTextArea: true,
          content: content ? content.substring(0, 20) + '...' : 'empty',
          isCleared
        });
        
        if (isCleared) {
          console.log('Content: Textarea cleared - likely posted');
          return true;
        }
      } else {
        console.log('Content: Textarea verification: textarea not found');
      }

      // Method 3: Look for success indicators
      const successIndicators = [
        '[data-testid="toast"]',
        '[role="alert"]',
        '.toast',
        '[aria-live="polite"]'
      ];

      for (const selector of successIndicators) {
        const element = document.querySelector(selector);
        if (element && element.textContent.toLowerCase().includes('tweet')) {
          console.log('Content: Found success indicator:', {
            selector,
            text: element.textContent
          });
          return true;
        }
      }

      console.log('Content: No success indicators found');
      return false;

    } catch (error) {
      console.error('Content: Error during tweet verification:', {
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }

  // NEW: Check if element is visible
  isElementVisible(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           element.offsetWidth > 0 && element.offsetHeight > 0;
  }

  // ENHANCED: Better element waiting with multiple selectors
  async waitForElement(selectors, timeout = 10000) {
    const selectorArray = Array.isArray(selectors) ? selectors : [selectors];
    
    return new Promise((resolve, reject) => {
      // Check if any element already exists
      for (const selector of selectorArray) {
        const element = document.querySelector(selector);
        if (element) {
          resolve(element);
          return;
        }
      }

      const observer = new MutationObserver(() => {
        for (const selector of selectorArray) {
          const element = document.querySelector(selector);
          if (element) {
            observer.disconnect();
            resolve(element);
            return;
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Elements ${selectorArray.join(', ')} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Enhanced performLogin method
  async performLogin(credentials) {
    try {
      console.log('Content: Starting login process...');
      
      if (!window.location.href.includes('login')) {
        console.log('Content: Navigating to login page...');
        window.location.href = 'https://x.com/i/flow/login';
        await this.sleep(3000); // Wait for navigation
      }

      // Wait for username field
      console.log('Content: Waiting for username field...');
      await this.waitForElement('input[name="text"]');
      
      const usernameField = document.querySelector('input[name="text"]');
      console.log('Content: Found username field, entering username...');
      usernameField.value = credentials.username;
      usernameField.dispatchEvent(new Event('input', { bubbles: true }));

      await this.sleep(1000);
      console.log('Content: Looking for next button after username...');
      // Click next after username
      await this.clickNextButton();
      await this.sleep(2000);

      // Check for email verification field
      console.log('Content: Checking for email verification...');
      let maxAttempts = 3; // Sometimes we need multiple attempts for email verification
      let attempt = 0;
      
      while (attempt < maxAttempts) {
        attempt++;
        console.log(`Content: Email verification check attempt ${attempt}/${maxAttempts}`);
        
        const emailField = document.querySelector('input[data-testid="ocfEnterTextTextInput"]');
        if (emailField) {
          if (!credentials.email) {
            throw new Error('Email verification required but no email provided in credentials');
          }
          
          console.log('Content: Found email verification field, entering email...');
          emailField.value = credentials.email;
          emailField.dispatchEvent(new Event('input', { bubbles: true }));
          await this.sleep(1000);
          
          // Click next after email - using robust button clicking
          console.log('Content: Looking for next button after email...');
          await this.clickNextButton();
          await this.sleep(2000);
          
          // Check if we still see the email field (might need another attempt)
          const emailFieldStillPresent = document.querySelector('input[data-testid="ocfEnterTextTextInput"]');
          if (!emailFieldStillPresent) {
            console.log('Content: Email verification step completed');
            break;
          }
          
          console.log('Content: Email field still present, might need another attempt');
          continue;
        } else {
          console.log('Content: No email verification field found, moving to password step');
          break;
        }
      }

      // Wait for password field
      console.log('Content: Waiting for password field...');
      await this.waitForElement('input[name="password"]');
      
      const passwordField = document.querySelector('input[name="password"]');
      console.log('Content: Found password field, entering password...');
      passwordField.value = credentials.password;
      passwordField.dispatchEvent(new Event('input', { bubbles: true }));

      await this.sleep(1000);
      console.log('Content: Looking for login button...');
      const loginButton = document.querySelector('[data-testid="LoginForm_Login_Button"]');
      if (loginButton) {
        console.log('Content: Clicking login button...');
        loginButton.focus();
        loginButton.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        loginButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        loginButton.click();
        loginButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        loginButton.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      } else {
        throw new Error('Login button not found');
      }

      // Wait for login to complete
      await this.sleep(5000);
      
      // Verify login success
      const loginStatus = await this.checkLoginStatus();
      console.log('Content: Login verification result:', loginStatus);

      return {
        success: loginStatus.loggedIn,
        message: loginStatus.loggedIn ? 'Login successful' : 'Login failed',
        error: loginStatus.error
      };

    } catch (error) {
      console.error('Content: Error during login:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper method for clicking next buttons
  async clickNextButton() {
    const findNextButton = () => {
      // First try data-testid
      const nextByTestId = document.querySelector('[data-testid="ocfEnterTextNextButton"]');
      if (nextByTestId) return nextByTestId;

      // Then try finding any button with "Next" text
      return Array.from(document.querySelectorAll('button')).find(btn => {
        const span = btn.querySelector('span');
        return span && span.textContent.trim().toLowerCase() === 'next';
      });
    };

    let nextButton = null;
    for (let i = 0; i < 20; i++) { // Try for up to 2 seconds
      nextButton = findNextButton();
      if (nextButton && !nextButton.disabled && nextButton.getAttribute('aria-disabled') !== 'true') break;
      await this.sleep(100);
    }

    if (!nextButton) {
      throw new Error('Next button not found or not enabled');
    }

    console.log('Content: Clicking next button...');
    nextButton.focus();
    nextButton.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
    nextButton.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    nextButton.click();
    nextButton.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    nextButton.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
  }
}

// Initialize content script
new TwitterContentScript();