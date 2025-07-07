console.log('Content script loaded');
console.log('Current page URL:', window.location.href);
console.log('Document ready state:', document.readyState);

class ContentScript {
  constructor() {
    this.isLoggedIn = false;
    this.setupMessageListener();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.checkLoginStatusAndNotify(), 2000);
      });
    } else {
      setTimeout(() => this.checkLoginStatusAndNotify(), 2000);
    }
  }

  async checkLoginStatusAndNotify() {
    await this.checkLoginStatus();
    this.notifyReady();
  }

  async checkLoginStatus() {
    try {
      const loginIndicators = [
        '.user-profile',
        '.account-menu',
        '.logout-button',
        '[data-testid="user-menu"]',
        '.user-avatar'
      ];
      
      const isLoggedIn = loginIndicators.some(selector => 
        document.querySelector(selector) !== null
      );
      
      this.isLoggedIn = isLoggedIn;
      console.log('Login status checked:', this.isLoggedIn);
      
      return this.isLoggedIn;
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  }

  notifyReady() {
    chrome.runtime.sendMessage({
      action: 'CONTENT_SCRIPT_READY',
      isLoggedIn: this.isLoggedIn,
      url: window.location.href
    });
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('🟢 Content: Received message:', message.type);
      
      switch (message.type) {
        case 'GET_CURRENT_URL':
          const currentUrl = window.location.href;
          console.log('🟢 Content: Returning current URL:', currentUrl);
          sendResponse({
            url: currentUrl,
          });
          break;
          
        case 'EXTRACT_SEARCH_RESULTS':
          console.log('🟢 Content: Extracting search results for:', message.searchQuery);
          this.extractSearchResults(message.searchQuery).then((results) => {
            console.log('🟢 Content: Successfully extracted', results.length, 'results');
            sendResponse({
              success: true,
              results: results
            });
          }).catch((error) => {
            console.error('🟢 Content: Error extracting results:', error.message);
            sendResponse({
              success: false,
              error: error.message
            });
          });
          break;
        case 'USER_PROFILE':
          console.log('🟢 Content: Extracting user profile');
          this.extractUserProfile().then((profile) => {
            console.log('🟢 Content: Successfully extracted user profile:', profile);
            sendResponse({
              success: true,
              profile: profile,
            });
          }).catch((error) => {
            sendResponse({
              success: false,
              error: error.message,
            });
          });
          return true;
        default:
          console.log('🟢 Content: Unknown message type:', message.type);
          sendResponse({error: 'Unknown message type'});
      }
      
      return true;
    });
  }

  async extractUserProfile() {
    try {
      console.log('🟢 Content: Extracting user profile');
      console.log('🟢 Content: Current URL:', window.location.href);
      console.log('🟢 Content: Page title:', document.title);
      
      // Log all elements with class names containing 'user', 'profile', 'avatar', 'name'
      const allElements = document.querySelectorAll('*');
      const relevantElements = Array.from(allElements).filter(el => {
        const className = (el.className || '').toString();
        const id = (el.id || '').toString();
        return (className.includes('user') || className.includes('profile') || 
                className.includes('avatar') || className.includes('name') ||
                id.includes('user') || id.includes('profile') || 
                id.includes('avatar') || id.includes('name'));
      });
      
      console.log('🟢 Content: Found relevant elements:', relevantElements.map(el => ({
        tagName: el.tagName,
        className: (el.className || '').toString(),
        id: (el.id || '').toString(),
        textContent: (el.textContent || '').substring(0, 50)
      })));
      
      // Try multiple selectors for user profile elements
      const userProfileSelectors = [
        '.index_userTop__MEym8',
        '.user-profile',
        '.account-menu',
        '.user-menu',
        '[data-testid="user-menu"]',
        '.user-info',
        '.profile-section'
      ];
    
    let userProfile = null;
    for (const selector of userProfileSelectors) {
      userProfile = document.querySelector(selector);
      if (userProfile) {
        console.log('🟢 Content: Found user profile with selector:', selector);
        break;
      }
    }
    
    if (!userProfile) {
      // If no specific profile element found, try to find avatar and username separately
      console.log('🟢 Content: No specific user profile element found, searching for individual elements');
      return this.extractUserProfileFromIndividualElements();
    }
    
    console.log('🟢 Content: User profile element found:', userProfile);
    
    // Extract avatar image src
    const avatarSelectors = [
      '.index_avatar__k4xgD',
      '.user-avatar',
      '.avatar',
      'img[alt*="avatar"]',
      'img[alt*="user"]',
      '.profile-image'
    ];
    
    let avatarUrl = '';
    for (const selector of avatarSelectors) {
      const avatarElement = userProfile.querySelector(selector);
      if (avatarElement) {
        const img = avatarElement.querySelector('img') || avatarElement;
        if (img && img.src) {
          avatarUrl = img.src;
          console.log('🟢 Content: Found avatar with selector:', selector);
          break;
        } else if (avatarElement.style.backgroundImage && avatarElement.style.backgroundImage.startsWith('url(')) {
          avatarUrl = avatarElement.style.backgroundImage.slice(5, -2);
          console.log('🟢 Content: Found avatar background with selector:', selector);
          break;
        }
      }
    }
    
    // Extract username - try both selectors
    const usernameSelectors = [
      '.index_name__2CdgQ',
      '.index_nickname__pnxE6'
    ];
    
    let username = '';
    for (const selector of usernameSelectors) {
      const usernameElement = userProfile.querySelector(selector);
      console.log('🟢 Content: Trying username selector:', selector, 'Found:', !!usernameElement);
              if (usernameElement) {
          let rawText = usernameElement.textContent || '';
          console.log('🟢 Content: Username element text:', rawText);
                      let cleaned = rawText.trim();
            if (cleaned) {
              // Split by &nbsp; and take first element, then remove "Sign Out" if present
              username = cleaned.replace(/sign out/gi, '').trim();
              console.log('🟢 Content: Found username with selector:', selector, 'Value:', username);
              break;
          }
        }
    }
    
    if (!username) {
      console.log('🟢 Content: Username not found in profile element, trying individual search');
      const individualResult = await this.extractUserProfileFromIndividualElements();
      return {
        avatar: avatarUrl || individualResult.avatar,
        username: individualResult.username
      };
    }
    
    const profile = {
      avatar: avatarUrl,
      username: username,
    };
    console.log('🟢 Content: Extracted user profile:', profile);
    return profile;
    } catch (error) {
      console.error('🟢 Content: Error extracting user profile:', error);
      // Return a fallback profile
      return {
        avatar: '',
        username: 'User'
      };
    }
  }

  async extractUserProfileFromIndividualElements() {
    console.log('🟢 Content: Extracting user profile from individual elements');
    
    // Search for avatar anywhere on the page
    const avatarSelectors = [
      'img[alt*="avatar"]',
      'img[alt*="user"]',
      '.avatar img',
      '.user-avatar img',
      '.profile-image img',
      'img[src*="avatar"]',
      'img[src*="user"]'
    ];
    
    let avatarUrl = '';
    for (const selector of avatarSelectors) {
      const avatarImg = document.querySelector(selector);
      if (avatarImg && avatarImg.src) {
        avatarUrl = avatarImg.src;
        console.log('🟢 Content: Found avatar with selector:', selector);
        break;
      }
    }
    
    // Search for username anywhere on the page
    const usernameSelectors = [
      '.index_name__2CdgQ',
      '.index_nickname__pnxE6',
      '.username',
      '.user-name',
      '.profile-name',
      '.account-name',
      '[data-testid="username"]',
      '.user-info .name',
      '.profile .name'
    ];
    
    let username = '';
    for (const selector of usernameSelectors) {
      const usernameElement = document.querySelector(selector);
      console.log('🟢 Content: Trying individual username selector:', selector, 'Found:', !!usernameElement);
              if (usernameElement) {
          console.log('🟢 Content: Individual username element text:', usernameElement.textContent);
        }
        if (usernameElement && usernameElement.textContent.trim()) {
          let rawText = usernameElement.textContent.trim();
          // Split by &nbsp; and take first element, then remove "Sign Out" if present
          username = rawText.split('&nbsp;')[0].replace(/sign out/gi, '').trim();
          console.log('🟢 Content: Found individual username with selector:', selector, 'Value:', username);
          break;
        }
    }
    
    // If still no username, try to extract from page title or other common elements
    if (!username) {
      const pageTitle = document.title || '';
      if (pageTitle && (pageTitle.includes('Account') || pageTitle.includes('Profile'))) {
        // Try to extract username from page title or other elements
        const possibleUsernameElements = document.querySelectorAll('h1, h2, h3, .title, .heading');
        for (const element of possibleUsernameElements) {
          const text = element.textContent?.trim() || '';
          if (text && text.length > 0 && text.length < 50 && !text.includes('Account') && !text.includes('Profile')) {
            username = text;
            console.log('🟢 Content: Found username from general element:', text);
            break;
          }
        }
      }
    }
    
    // Fallback username if nothing found
    if (!username) {
      username = 'User';
      console.log('🟢 Content: Using fallback username');
    }
    
    const profile = {
      avatar: avatarUrl,
      username: username,
    };
    console.log('🟢 Content: Extracted user profile from individual elements:', profile);
    return profile;
  }

  async extractSearchResults(searchQuery) {
    try {
      console.log('🟢 Content: Starting search result extraction');
      
      
      // Wait for search results to load using the actual Popmart selectors
      console.log('🟢 Content: Waiting for product elements to load...');
      await this.waitForElement('.index_productItemContainer__rDwtr, .product-item, .search-result, [data-testid="product-card"]', 10000);
      console.log('🟢 Content: Product elements found');
      await this.waitForElement('.ant-tag','.index_tag__E64FE', 10000);
      
      // Look for product cards/items with actual Popmart selectors first
      const productSelectors = [
        '[data-pm-exposure-tracker-action="PopMartGlobalWebCommodityCardShow"]',
        // '.index_productItemContainer__rDwtr', 
        // '.product-item',
        // '.search-result',
        // '[data-testid="product-card"]',
        // '.product-card',
        // '.item-card'
      ];
      
      let products = [];
      
      for (const selector of productSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log('🟢 Content: Found', elements.length, 'elements with selector:', selector);
        if (elements.length > 0) {
          products = Array.from(elements).slice(0, 5); 
          console.log('🟢 Content: Using selector:', selector);
          break;
        }
      }
      
      if (products.length === 0) {
        console.log('🟢 Content: No products found with any selector');
        throw new Error('No search results found');
      }
      
      console.log('🟢 Content: Processing', products.length, 'products');
      
      const results = products.map((product, index) => {
        console.log('🟢 Content: Processing product', index + 1);
        console.log('🟢 Content: Product element:', product);
        
        // Extract product information using actual Popmart selectors
        const nameElement = product.querySelector('.index_itemTitle__WaT6_, .index_itemSubTitle__mX6v_, .product-name, .item-name, h3, h4, .title');
        const priceElement = product.querySelector('.index_itemPrice__AQoMy, .price, .product-price, .item-price');
        const imageElement = product.querySelector('img');
        
        // Check stock status using the tag container
        
        const stockTagContainer = product.querySelector('.index_tag__E64FE');
        console.log('🟢 Content: Stock tag container:', stockTagContainer);
        let stockStatus = 'Available';
        if (stockTagContainer) {
          const stockTag = stockTagContainer.querySelector('.ant-tag');
          if (stockTag && stockTag.textContent.trim() === 'OUT OF STOCK') {
            stockStatus = 'Out of Stock';
          }
        }
        else {
          stockStatus = 'balle balle';
        }
        
        // Find the link - it's the parent <a> tag that wraps the entire product card
        const linkElement = product.closest('a') || product.querySelector('a');
        const link = linkElement?.href || window.location.href;
        
        console.log('🟢 Content: Link element found:', linkElement);
        console.log('🟢 Content: Link URL:', link);
        
        // Get the full product name (subtitle + title)
        const subTitleElement = product.querySelector('.index_itemSubTitle__mX6v_');
        const titleElement = product.querySelector('.index_itemTitle__WaT6_');
        let fullName = '';
        
        if (subTitleElement && titleElement) {
          fullName = `${subTitleElement.textContent.trim()} - ${titleElement.textContent.trim()}`;
        } else if (nameElement) {
          fullName = nameElement.textContent.trim();
        } else {
          fullName = `Labubu Product ${index + 1}`;
        }
        
        const result = {
          id: index,
          name: fullName,
          price: priceElement?.textContent?.trim() || 'Price not available',
          image: imageElement?.src || imageElement?.getAttribute('data-src') || '',
          url: link,
          relevance: index + 1,
          stockStatus: stockStatus,
        };
        
        // Add detailed logging for debugging
        console.log('🟢 Content: Final extracted product', index + 1, ':', {
          name: result.name,
          price: result.price,
          url: result.url,
          stockStatus: result.stockStatus,
          hasLink: !!linkElement,
          linkElement: linkElement,
          rawHtml: result.rawHtml
        });
        
        return result;
      });
      
      console.log('🟢 Content: Successfully extracted', results.length, 'search results');
      return results;
      
    } catch (error) {
      console.error('🟢 Content: Error extracting search results:', error);
      throw error;
    }
  }

  async waitForElement(selector, timeout = 5000) {
    console.log('🟢 Content: Waiting for element:', selector);
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        console.log('🟢 Content: Element found immediately:', selector);
        resolve(element);
        return;
      }
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          console.log('🟢 Content: Element found via observer:', selector);
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      setTimeout(() => {
        observer.disconnect();
        console.log('🟢 Content: Element not found within timeout:', selector);
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }
}

const contentScript = new ContentScript();

// Add a very visible log to confirm content script is running
console.log('🔵 LABUBU CONTENT SCRIPT INITIALIZED 🔵');
console.log('🔵 If you see this, content script is working! 🔵');
