/* global chrome, buildDomTree */

// Enhanced Android-Optimized Content Script
class AndroidContentScript {
  constructor() {
    this.setupMessageHandlers();
    this.isInitialized = false;
    this.pageState = null;
    this.lastDomUpdate = 0;
    this.domCache = null;
    this.debugMode = false;
    this.elementIndex = 0;
    console.log('Enhanced Android content script initialized');
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'GET_ENHANCED_PAGE_STATE':
          const enhancedState = await this.getEnhancedPageState(request.options || {});
          sendResponse({ success: true, pageState: enhancedState });
          break;
          
        case 'GET_PAGE_STATE':
          const pageState = await this.getFullPageState();
          sendResponse({ success: true, pageState: pageState });
          break;

        case 'CLICK_ELEMENT':
          const clickResult = await this.clickElement(request.selector || request.index);
          sendResponse(clickResult);
          break;

        case 'FILL_ELEMENT':
          const fillResult = await this.fillElement(request.selector || request.index, request.text);
          sendResponse(fillResult);
          break;

        case 'SCROLL_DOWN':
          const scrollResult = await this.scrollDown();
          sendResponse(scrollResult);
          break;

        case 'POST_TWEET':
          const tweetResult = await this.postTweet(request.content);
          sendResponse(tweetResult);
          break;

        case 'ENABLE_DEBUG_MODE':
          this.debugMode = true;
          this.highlightInteractiveElements();
          sendResponse({ success: true, message: 'Debug mode enabled' });
          break;

        case 'DISABLE_DEBUG_MODE':
          this.debugMode = false;
          this.removeHighlights();
          sendResponse({ success: true, message: 'Debug mode disabled' });
          break;

        case 'PING':
          sendResponse({ success: true, status: 'ready' });
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Content script error:', error);
      sendResponse({ success: false, error: error.message });
    }
  }

  async getEnhancedPageState(options = {}) {
    try {
      // Reset element index for each scan
      this.elementIndex = 0;
      
      const domState = await this.buildEnhancedDomTree(options);
      
      return {
        url: window.location.href,
        title: document.title,
        platform: this.detectPlatform(window.location.href),
        pageType: this.determinePageType(window.location.href),
        
        interactiveElements: domState.rankedElements || [],
        
        loginStatus: {
          isLoggedIn: this.checkLoginStatus(),
          hasLoginForm: this.hasLoginElements(),
          hasSignupPrompts: this.hasSignupElements()
        },
        
        contentContext: {
          hasComposeForm: this.hasComposeElements(),
          hasPostForm: this.hasPostElements(),
          canPost: this.canUserPost(),
          composerState: this.getComposerState()
        },
        
        domStats: {
          totalElements: domState.totalElements || 0,
          interactiveElements: domState.rankedElements?.length || 0,
          visibleElements: domState.visibleElements || 0,
          loginElements: domState.loginElements || 0,
          postElements: domState.postElements || 0
        },

        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Enhanced page state extraction failed:', error);
      return this.getFullPageState();
    }
  }

  async buildEnhancedDomTree(options = {}) {
    const defaultOptions = {
      showHighlightElements: false,
      debugMode: this.debugMode,
      viewportExpansion: 200,
      maxElements: 50,
      ...options
    };

    // 🔧 CRITICAL FIX: Reset element index for each DOM build
    this.elementIndex = 0;

    // Try buildDomTree first, fallback to enhanced extraction
    if (typeof buildDomTree === 'function') {
    try {
        // 🔧 CRITICAL FIX: Force fresh build by clearing any global state
        console.log('🔄 Building fresh DOM tree with reset state');
        
      const result = buildDomTree(defaultOptions);
      this.domCache = result;
      this.lastDomUpdate = Date.now();
        
        // Process and enhance the result
        const enhancedResult = this.enhanceInteractiveElements(result);
        
        // 🔧 CRITICAL FIX: Validate and log element indexing
        if (defaultOptions.debugMode) {
          const elementCounts = this.validateElementIndexing(enhancedResult);
          console.log('🔍 Element validation:', elementCounts);
        }
        
        return enhancedResult;
    } catch (error) {
        console.warn('buildDomTree failed, using enhanced fallback:', error);
      }
    }

    // Enhanced fallback DOM extraction
    return this.createEnhancedDomTree(defaultOptions);
  }

  createEnhancedDomTree(options = {}) {
    const elements = [];
    const platform = this.detectPlatform(window.location.href);
    
    // 🔧 CRITICAL FIX: Reset element index counter
    this.elementIndex = 0;
    
    // Platform-specific element discovery
    const selectors = this.getPlatformSelectors(platform);
    
    // Scan all selectors and score elements
    selectors.forEach(selectorGroup => {
      document.querySelectorAll(selectorGroup.selector).forEach(el => {
        if (this.isElementUsable(el) && !this.isElementAlreadyIndexed(el, elements)) {
          const elementData = this.analyzeElement(el, selectorGroup);
          if (elementData.relevanceScore > 0) {
            // 🔧 CRITICAL FIX: Assign unique index
            elementData.index = this.elementIndex++;
            elements.push(elementData);
          }
        }
      });
    });

    // Sort by relevance score (highest first)
    const rankedElements = elements
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, options.maxElements || 50)
      .map((el, displayIndex) => ({ 
        ...el, 
        displayIndex, // For UI display
        originalIndex: el.index // Keep original unique index
      }));

    // 🔧 CRITICAL FIX: Validate no duplicate indexes
    const indexes = rankedElements.map(el => el.index);
    const uniqueIndexes = new Set(indexes);
    if (indexes.length !== uniqueIndexes.size) {
      console.error('🚨 DUPLICATE INDEXES in createEnhancedDomTree:', indexes);
      // Fix duplicates by reassigning
      rankedElements.forEach((el, i) => {
        el.index = i;
      });
    }

    // Apply debug highlighting if enabled
    if (options.debugMode) {
      this.highlightElements(rankedElements);
    }

    return {
      rootId: 'enhanced-root',
      rankedElements,
      totalElements: document.querySelectorAll('*').length,
      visibleElements: elements.length,
      loginElements: elements.filter(el => el.isLoginElement).length,
      postElements: elements.filter(el => el.isPostElement).length,
      map: {}
    };
  }

  // 🔧 NEW METHOD: Validate element indexing
  validateElementIndexing(domResult) {
    const elements = domResult.rankedElements || [];
    const indexes = elements.map(el => el.index);
    const uniqueIndexes = new Set(indexes);
    
    const counts = {
      totalElements: elements.length,
      uniqueIndexes: uniqueIndexes.size,
      hasDuplicates: indexes.length !== uniqueIndexes.size,
      duplicates: []
    };

    if (counts.hasDuplicates) {
      const indexCounts = {};
      indexes.forEach(index => {
        indexCounts[index] = (indexCounts[index] || 0) + 1;
      });
      
      counts.duplicates = Object.entries(indexCounts)
        .filter(([index, count]) => count > 1)
        .map(([index, count]) => ({ index: parseInt(index), count }));
        
      console.error('🚨 DUPLICATE ELEMENT INDEXES FOUND:', counts.duplicates);
    }

    return counts;
  }

  getPlatformSelectors(platform) {
    const baseSelectors = [
      // High priority interactive elements
      { selector: 'button:not([disabled])', priority: 8, type: 'button' },
      { selector: '[role="button"]:not([aria-disabled="true"])', priority: 8, type: 'button' },
      { selector: 'input[type="text"], input[type="email"], input[type="password"]', priority: 9, type: 'input' },
      { selector: 'textarea', priority: 9, type: 'textarea' },
      { selector: '[contenteditable="true"]', priority: 9, type: 'contenteditable' },
      { selector: 'a[href]:not([href="#"])', priority: 6, type: 'link' },
      { selector: '[role="textbox"]', priority: 9, type: 'textbox' },
      
      // Form elements
      { selector: 'select', priority: 7, type: 'select' },
      { selector: 'input[type="checkbox"], input[type="radio"]', priority: 6, type: 'checkbox' },
      
      // Interactive media
      { selector: 'video, audio', priority: 5, type: 'media' },
      { selector: '[draggable="true"]', priority: 4, type: 'draggable' }
    ];

    switch (platform) {
      case 'twitter':
        return [
          // Twitter-specific high priority elements
          { selector: '[data-testid="tweetTextarea_0"]', priority: 10, type: 'tweet-compose' },
          { selector: '[data-testid="tweetButton"], [data-testid="tweetButtonInline"]', priority: 10, type: 'tweet-submit' },
          { selector: '[data-testid="loginButton"]', priority: 10, type: 'login' },
          { selector: '[data-testid="signupButton"]', priority: 9, type: 'signup' },
          { selector: '[data-testid="like"], [data-testid="retweet"], [data-testid="reply"]', priority: 8, type: 'engagement' },
          { selector: '[data-testid="SideNav_NewTweet_Button"]', priority: 9, type: 'compose-trigger' },
          { selector: 'input[name="text"], input[name="email"], input[name="password"]', priority: 9, type: 'auth-input' },
          ...baseSelectors
        ];
      
      case 'linkedin':
        return [
          { selector: '.share-box__trigger, [data-control-name="share_toggle"]', priority: 10, type: 'post-compose' },
          { selector: '[data-control-name="share.submit"]', priority: 10, type: 'post-submit' },
          { selector: 'input[name="session_key"], input[name="session_password"]', priority: 10, type: 'login-input' },
          ...baseSelectors
        ];
      
      default:
        return baseSelectors;
    }
  }

  analyzeElement(element, selectorGroup) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    // Base scoring
    let relevanceScore = selectorGroup.priority || 5;
    
    // Visibility scoring
    if (!this.isElementVisible(element)) {
      relevanceScore = 0; // Skip hidden elements
    }
    
    // Position scoring (elements in viewport get bonus)
    if (this.isInViewport(element)) {
      relevanceScore += 2;
    }
    
    // Size scoring (reasonable sized elements get bonus)
    if (rect.width >= 20 && rect.height >= 20 && rect.width <= 500 && rect.height <= 200) {
      relevanceScore += 1;
    }
    
    // Text content scoring
    const text = this.getElementText(element);
    if (text.length > 0 && text.length < 200) {
      relevanceScore += 1;
    }
    
    // Platform-specific scoring
    relevanceScore += this.getPlatformSpecificScore(element, text);
    
    // Element analysis
    const analysis = this.getElementAnalysis(element, text);
    
    return {
      element,
      tagName: element.tagName.toLowerCase(),
      text: text.substring(0, 100),
      ariaLabel: element.getAttribute('aria-label') || '',
      dataTestId: element.getAttribute('data-testid') || '',
      xpath: this.getXPath(element),
      selector: this.generateSelector(element),
      relevanceScore,
      type: selectorGroup.type,
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      isVisible: true,
      isInViewport: this.isInViewport(element),
      ...analysis
    };
  }

  getPlatformSpecificScore(element, text) {
    const platform = this.detectPlatform(window.location.href);
    const lowerText = text.toLowerCase();
    const dataTestId = element.getAttribute('data-testid') || '';
    const ariaLabel = (element.getAttribute('aria-label') || '').toLowerCase();
    
    let score = 0;
    
    switch (platform) {
      case 'twitter':
        // High value Twitter actions
        if (dataTestId.includes('tweet') || dataTestId.includes('post')) score += 3;
        if (dataTestId.includes('login') || dataTestId.includes('signup')) score += 3;
        if (lowerText.includes('tweet') || lowerText.includes('post')) score += 2;
        if (lowerText.includes('sign in') || lowerText.includes('log in')) score += 2;
        if (dataTestId.includes('like') || dataTestId.includes('retweet')) score += 1;
        break;
    }
    
    // Universal scoring
    if (lowerText.includes('submit') || lowerText.includes('send')) score += 1;
    if (lowerText.includes('login') || lowerText.includes('sign')) score += 1;
    if (element.getAttribute('type') === 'submit') score += 2;
    
    return score;
  }

  getElementAnalysis(element, text) {
    return {
      isLoginElement: this.isLoginElement(element, text),
      isPostElement: this.isPostElement(element, text),
      isEngagementElement: this.isEngagementElement(element, text),
      isNavigationElement: this.isNavigationElement(element, text),
      isFormElement: this.isFormElement(element),
      isInteractive: this.isInteractiveElement(element),
      hasClickHandler: this.hasClickHandler(element)
    };
  }

  isLoginElement(element, text) {
    const lowerText = text.toLowerCase();
    const dataTestId = element.getAttribute('data-testid') || '';
    const type = element.getAttribute('type') || '';
    const name = element.getAttribute('name') || '';
    
    return (
      dataTestId.includes('login') ||
      dataTestId.includes('signin') ||
      lowerText.includes('log in') ||
      lowerText.includes('sign in') ||
      type === 'password' ||
      name.includes('password') ||
      name.includes('email') ||
      name.includes('username')
    );
  }

  isPostElement(element, text) {
    const lowerText = text.toLowerCase();
    const dataTestId = element.getAttribute('data-testid') || '';
    
    return (
      dataTestId.includes('tweet') ||
      dataTestId.includes('post') ||
      dataTestId.includes('share') ||
      lowerText.includes('tweet') ||
      lowerText.includes('post') ||
      lowerText.includes('share') ||
      element.getAttribute('role') === 'textbox'
    );
  }

  isEngagementElement(element, text) {
    const dataTestId = element.getAttribute('data-testid') || '';
    const lowerText = text.toLowerCase();
    
    return (
      dataTestId.includes('like') ||
      dataTestId.includes('retweet') ||
      dataTestId.includes('reply') ||
      dataTestId.includes('follow') ||
      lowerText.includes('like') ||
      lowerText.includes('retweet') ||
      lowerText.includes('follow')
    );
  }

  isNavigationElement(element, text) {
    return (
      element.tagName === 'A' ||
      element.getAttribute('role') === 'link' ||
      text.toLowerCase().includes('home') ||
      text.toLowerCase().includes('profile') ||
      text.toLowerCase().includes('settings')
    );
  }

  isFormElement(element) {
    const formTags = ['input', 'textarea', 'select', 'button'];
    return formTags.includes(element.tagName.toLowerCase()) ||
           element.getAttribute('contenteditable') === 'true' ||
           element.getAttribute('role') === 'textbox';
  }

  isInteractiveElement(element) {
    const interactiveTags = ['button', 'a', 'input', 'textarea', 'select'];
    return interactiveTags.includes(element.tagName.toLowerCase()) ||
           element.getAttribute('role') === 'button' ||
           element.getAttribute('onclick') ||
           element.getAttribute('contenteditable') === 'true';
  }

  hasClickHandler(element) {
    return !!(
      element.onclick ||
      element.getAttribute('onclick') ||
      element.getAttribute('role') === 'button' ||
      element.tagName === 'BUTTON' ||
      element.tagName === 'A'
    );
  }

  generateSelector(element) {
    // Try data-testid first (most reliable for Twitter)
    const dataTestId = element.getAttribute('data-testid');
    if (dataTestId) {
      return `[data-testid="${dataTestId}"]`;
    }
    
    // Try ID
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Try class-based selector
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.split(' ').filter(c => c.length > 0);
      if (classes.length > 0) {
        return `.${classes[0]}`;
      }
    }
    
    // Fallback to tag + index
    const siblings = Array.from(element.parentNode?.children || [])
      .filter(el => el.tagName === element.tagName);
    const index = siblings.indexOf(element);
    
    return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
  }

  highlightElements(elements) {
    if (!this.debugMode) return;
    
    elements.forEach((elementData, index) => {
      if (index >= 10) return; // Only highlight top 10
      
      const overlay = document.createElement('div');
      overlay.className = 'ai-agent-highlight';
      overlay.style.cssText = `
        position: absolute;
        border: 2px solid #ff6b35;
        background: rgba(255, 107, 53, 0.1);
        z-index: 10000;
        pointer-events: none;
        border-radius: 4px;
        font-size: 12px;
        color: #ff6b35;
        font-weight: bold;
      `;
      
      const rect = elementData.rect;
      overlay.style.left = rect.x + 'px';
      overlay.style.top = rect.y + 'px';
      overlay.style.width = rect.width + 'px';
      overlay.style.height = rect.height + 'px';
      
      // Add index label
      const label = document.createElement('span');
      label.textContent = index.toString();
      label.style.cssText = `
        position: absolute;
        top: -2px;
        left: -2px;
        background: #ff6b35;
        color: white;
        padding: 2px 6px;
        border-radius: 3px;
        font-size: 10px;
      `;
      overlay.appendChild(label);
      
      document.body.appendChild(overlay);
    });
  }

  removeHighlights() {
    document.querySelectorAll('.ai-agent-highlight').forEach(el => el.remove());
  }

  isElementUsable(element) {
    return this.isElementVisible(element) && 
           !element.disabled && 
           element.offsetParent !== null;
  }

  isElementAlreadyIndexed(element, list) {
    return list.some(item => item.element === element);
  }

  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  async getFullPageState() {
    // Fallback to enhanced state if available
    return this.getEnhancedPageState();
  }

  enhanceInteractiveElements(domResult) {
    // Process buildDomTree result and enhance it
    const elements = [];
    
    if (domResult && domResult.map) {
      const processNode = (nodeId) => {
        const node = domResult.map[nodeId];
        if (!node) return;

        if (node.isInteractive && typeof node.highlightIndex === 'number') {
          const text = this.extractElementText(node);
          const ariaLabel = node.attributes?.['aria-label'] || '';
          
          // Find the actual DOM element
          const element = this.findElementByNode(node);
          if (element && this.isElementUsable(element)) {
            const analysis = this.getElementAnalysis(element, text);
            
            elements.push({
              index: node.highlightIndex, // Use the unique highlightIndex from buildDomTree
              element,
              tagName: node.tagName,
              attributes: node.attributes || {},
              xpath: node.xpath,
              text: text.substring(0, 100),
              ariaLabel: ariaLabel,
              role: node.attributes?.role,
              type: node.attributes?.type,
              isVisible: node.isVisible,
              isInViewport: this.isInViewport(element),
              relevanceScore: this.calculateRelevanceScore(node, element, text),
              ...analysis
            });
          }
        }

        if (node.children && Array.isArray(node.children)) {
          node.children.forEach(processNode);
        }
      };

      if (domResult.rootId) {
        processNode(domResult.rootId);
      }
    }

    // 🔧 CRITICAL FIX: Validate and fix any duplicate indexes
    const indexes = elements.map(el => el.index);
    const uniqueIndexes = new Set(indexes);
    
    if (indexes.length !== uniqueIndexes.size) {
      console.error('🚨 DUPLICATE INDEXES in enhanceInteractiveElements, fixing...');
      elements.forEach((el, i) => {
        el.index = i; // Reassign sequential indexes
      });
    }
      
    return {
      ...domResult,
      rankedElements: elements.sort((a, b) => b.relevanceScore - a.relevanceScore),
      totalElements: elements.length,
      visibleElements: elements.filter(el => el.isVisible).length
    };
  }

  findElementByNode(node) {
    // Try to find element by xpath first
    if (node.xpath) {
      const element = this.getElementByXPath(node.xpath);
      if (element) return element;
    }
    
    // Try by attributes
    if (node.attributes) {
      if (node.attributes['data-testid']) {
        return document.querySelector(`[data-testid="${node.attributes['data-testid']}"]`);
      }
      if (node.attributes.id) {
        return document.getElementById(node.attributes.id);
      }
    }
    
    return null;
  }

  calculateRelevanceScore(node, element, text) {
    let score = 5; // Base score
    
    // Platform-specific scoring
    score += this.getPlatformSpecificScore(element, text);
    
    // Visibility and position
    if (node.isVisible) score += 2;
    if (node.isInViewport) score += 2;
    if (node.isTopElement) score += 1;
    
    return score;
  }

  extractElementText(node) {
    let text = '';
    
    if (node.children && Array.isArray(node.children)) {
      for (const childId of node.children) {
        const child = this.domCache?.map[childId];
        if (child) {
          if (child.type === 'TEXT_NODE' && child.text) {
            text += child.text + ' ';
          } else {
            text += this.extractElementText(child) + ' ';
          }
        }
      }
    }
    
    return text.trim();
  }

  getElementText(element) {
    return (element.textContent || element.value || element.placeholder || '').trim();
  }

  isMobileView() {
    return window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent);
  }

  detectPlatform(url = window.location.href) {
    if (url.includes('x.com') || url.includes('twitter.com')) return 'twitter';
    if (url.includes('linkedin.com')) return 'linkedin';
    if (url.includes('facebook.com')) return 'facebook';
    if (url.includes('instagram.com')) return 'instagram';
    return 'unknown';
  }

  determinePageType(url = window.location.href) {
    if (url.includes('/compose') || url.includes('/intent/tweet')) return 'compose';
    if (url.includes('/home') || url.includes('/timeline')) return 'home';
    if (url.includes('/login') || url.includes('/signin')) return 'login';
    if (url.includes('/profile') || url.includes('/user/')) return 'profile';
    return 'general';
  }

  checkLoginStatus() {
    const platform = this.detectPlatform();
    
    switch (platform) {
      case 'twitter':
        return !!(
          document.querySelector('[data-testid="AppTabBar_Profile_Link"]') ||
          document.querySelector('[aria-label*="Account menu"]') ||
          document.querySelector('[data-testid="SideNav_AccountSwitcher_Button"]')
        );
      default:
        return !window.location.href.includes('/login') && 
               !window.location.href.includes('/signin');
    }
  }

  hasComposeElements() {
    return !!(
      document.querySelector('[data-testid="tweetTextarea_0"]') ||
      document.querySelector('[data-testid="SideNav_NewTweet_Button"]') ||
      document.querySelector('[role="textbox"][contenteditable="true"]')
    );
  }

  hasLoginElements() {
    return !!(
      document.querySelector('input[type="password"]') ||
      document.querySelector('[data-testid="loginButton"]') ||
      document.querySelector('input[name="password"]')
    );
  }

  hasSignupElements() {
    return !!(
      document.querySelector('[data-testid="signupButton"]') ||
      document.querySelector('a[href*="signup"]') ||
      document.querySelector('button[data-testid="signupButton"]')
    );
  }

  hasPostElements() {
    return !!(
      document.querySelector('[data-testid="tweetButton"]') ||
      document.querySelector('[data-testid="tweetButtonInline"]')
    );
  }

  canUserPost() {
    const postButton = document.querySelector('[data-testid="tweetButtonInline"]') ||
                      document.querySelector('[data-testid="tweetButton"]');
    return postButton && !postButton.disabled;
  }

  getComposerState() {
    const textarea = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                    document.querySelector('[role="textbox"][contenteditable="true"]');
    const postButton = document.querySelector('[data-testid="tweetButtonInline"]') ||
                      document.querySelector('[data-testid="tweetButton"]');
        
        return {
      isOpen: !!textarea,
          hasContent: textarea?.textContent?.trim().length > 0,
          canPost: postButton && !postButton.disabled,
          characterCount: textarea?.textContent?.length || 0,
          maxCharacters: 280
        };
  }

  analyzePageContext() {
    const url = window.location.href;
    const platform = this.detectPlatform(url);
    const context = {
      platform,
      pageType: this.determinePageType(url),
      capabilities: [],
      isMobile: this.isMobileView()
    };

    switch (platform) {
      case 'twitter':
        context.capabilities = ['post', 'like', 'retweet', 'follow'];
        break;
      case 'linkedin':
        context.capabilities = ['post', 'like', 'comment', 'connect'];
        break;
      default:
        context.capabilities = ['browse'];
    }

    return context;
  }

  async clickElement(selector) {
    try {
      let element = await this.findElementBySelector(selector);
      
      if (!element) {
        return { success: false, error: 'Element not found', message: `Could not locate element: ${selector}` };
      }
      
      if (!this.isElementVisible(element)) {
        return { success: false, error: 'Element not visible', message: 'Element exists but not visible' };
      }
      
      // Enhanced click with better scroll and wait
      await this.scrollElementIntoView(element);
      await this.delay(300);
      
      // Multiple click strategies for Android compatibility
      const clickResult = await this.performClick(element);
      
      return { 
        success: true, 
        message: `Clicked element: ${element.tagName}`,
        elementInfo: {
          tagName: element.tagName,
          text: element.textContent?.substring(0, 50),
          selector: selector
        }
      };
      
    } catch (error) {
      console.error('Click element error:', error);
      return { success: false, error: error.message, message: 'Click failed' };
    }
  }

  async findElementBySelector(selector) {
    // If selector is a number, find by index from enhanced state
      if (typeof selector === 'number') {
      console.log(`🔍 Finding element by index: ${selector}`);
      
      const enhancedState = await this.getEnhancedPageState();
      const targetElement = enhancedState.interactiveElements?.find(el => el.index === selector);
          
          if (targetElement) {
        console.log(`✅ Found element at index ${selector}:`, {
          tagName: targetElement.tagName,
          text: targetElement.text?.substring(0, 30),
          type: targetElement.type,
          isLoginElement: targetElement.isLoginElement,
          isPostElement: targetElement.isPostElement
        });
        return targetElement.element;
      } else {
        console.error(`❌ No element found at index ${selector}. Available indexes:`, 
          enhancedState.interactiveElements?.map(el => el.index) || []);
        return null;
      }
    }
    
    // If selector is string, try direct query
    if (typeof selector === 'string') {
      return document.querySelector(selector);
    }
    
    return null;
  }

  async scrollElementIntoView(element) {
    element.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    });
    
    // Wait for scroll to complete
    await this.delay(500);
  }

  async performClick(element) {
    // Try multiple click methods for maximum compatibility
    try {
      element.click();
    } catch (e) {
      // Fallback 1: MouseEvent
      try {
        element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
          view: window
        }));
      } catch (e2) {
        // Fallback 2: Touch events for mobile
        element.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
        element.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
      }
    }
    
    await this.delay(200);
    return true;
  }

  async fillElement(selector, text) {
    try {
      let element = await this.findElementBySelector(selector);
      
      // Enhanced element finding for text inputs
      if (!element) {
        const textSelectors = [
          '[data-testid="tweetTextarea_0"]',
          '[role="textbox"][contenteditable="true"]',
          'textarea:not([disabled])',
          '[contenteditable="true"]',
          'input[type="text"]:not([disabled])',
          'input[type="email"]:not([disabled])',
          'input[type="password"]:not([disabled])'
        ];
        
        for (const sel of textSelectors) {
          element = document.querySelector(sel);
          if (element && this.isElementVisible(element)) {
            console.log(`Found text element with selector: ${sel}`);
            break;
          }
          }
        }
        
        if (!element) {
        return { success: false, error: 'Text input element not found' };
      }
      
      if (!this.isElementVisible(element)) {
        return { success: false, error: 'Text input element not visible' };
      }
      
      // Enhanced text filling
      await this.scrollElementIntoView(element);
      element.focus();
      await this.delay(200);
      
      // Clear and fill with multiple strategies
      await this.clearAndFillElement(element, text);
      
      return { 
        success: true, 
        message: `Filled text: "${text.substring(0, 50)}..."`,
        elementInfo: {
          tagName: element.tagName,
          type: element.type || 'contenteditable',
          selector: selector
        }
      };
      
    } catch (error) {
      console.error('Fill element error:', error);
      return { success: false, error: error.message };
    }
  }

  async clearAndFillElement(element, text) {
    if (element.contentEditable === 'true') {
      // For contenteditable elements
      element.innerHTML = '';
      element.textContent = text;
      
      // Trigger events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus at end
      const range = document.createRange();
      range.selectNodeContents(element);
      range.collapse(false);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // For regular inputs
        element.value = '';
        element.value = text;
      
      // Trigger events
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      element.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    }
      
    await this.delay(100);
  }

  async scrollDown() {
    try {
      const scrollAmount = window.innerHeight * 0.8;
      window.scrollBy({
        top: scrollAmount,
        behavior: 'smooth'
      });
      
      await this.delay(1500);
      
      return { 
        success: true, 
        message: `Scrolled down by ${scrollAmount}px`,
        scrollY: window.scrollY
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async postTweet(content) {
    try {
      if (!content) {
        content = "🤖 Enhanced AI agent with improved DOM detection testing on WootzApp! #WootzApp #AI #ChromiumBrowser";
      }

      // Find and fill textarea
      const fillResult = await this.fillElement('[data-testid="tweetTextarea_0"]', content);
      if (!fillResult.success) {
        return fillResult;
      }
      
      await this.delay(1000);
      
      // Find and click post button
      const clickResult = await this.clickElement('[data-testid="tweetButtonInline"]');
      if (!clickResult.success) {
        // Try alternative post button
        return await this.clickElement('[data-testid="tweetButton"]');
      }
      
      return { success: true, message: 'Tweet posted successfully' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Utility methods
  getElementByXPath(xpath) {
    try {
      const result = document.evaluate(
        xpath,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      );
      return result.singleNodeValue;
    } catch (error) {
      console.error('XPath evaluation failed:', error);
      return null;
    }
  }

  getXPath(element) {
    try {
      if (element.id !== '') {
        return 'id("' + element.id + '")';
      }
      if (element === document.body) {
        return element.tagName;
      }
      
      let ix = 0;
      const siblings = element.parentNode.childNodes;
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling === element) {
          return this.getXPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
        }
        if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
          ix++;
        }
      }
    } catch (error) {
      return '//*[@id="unknown"]';
    }
  }

  isElementVisible(element) {
    try {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);
      
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        style.opacity !== '0' &&
        element.offsetParent !== null
      );
    } catch (error) {
      return false;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Add this method to handle restricted page detection
  async highlightInteractiveElements() {
    if (window.location.href.includes('chrome-native://') || 
        window.location.href.includes('chrome://') ||
        window.location.href.includes('about:')) {
      console.log('⚠️ Cannot highlight elements on restricted page');
      return;
    }
    
    try {
      const enhancedState = await this.getEnhancedPageState({ debugMode: true });
      this.highlightElements(enhancedState.interactiveElements || []);
    } catch (error) {
      console.error('Failed to highlight elements:', error);
    }
  }
}

// Initialize the enhanced Android content script
const androidContentScript = new AndroidContentScript();
console.log('Enhanced Android-optimized content script loaded');