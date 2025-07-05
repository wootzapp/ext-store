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
            isLoggedIn: this.isLoggedIn
          });
          break;
          
        case 'CHECK_LOGIN_STATUS':
          console.log('🟢 Content: Checking login status');
          this.checkLoginStatus().then(() => {
            sendResponse({
              isLoggedIn: this.isLoggedIn,
              url: window.location.href
            });
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
          
        default:
          console.log('🟢 Content: Unknown message type:', message.type);
          sendResponse({error: 'Unknown message type'});
      }
      
      return true;
    });
  }

  async extractSearchResults(searchQuery) {
    try {
      console.log('🟢 Content: Starting search result extraction');
      
      // Wait for search results to load using the actual Popmart selectors
      console.log('🟢 Content: Waiting for product elements to load...');
      await this.waitForElement('.index_productItemContainer__rDwtr, .product-item, .search-result, [data-testid="product-card"]', 10000);
      console.log('🟢 Content: Product elements found');
      
      // Look for product cards/items with actual Popmart selectors first
      const productSelectors = [
        '.index_productItemContainer__rDwtr', // Actual Popmart selector
        '.product-item',
        '.search-result',
        '[data-testid="product-card"]',
        '.product-card',
        '.item-card'
      ];
      
      let products = [];
      
      for (const selector of productSelectors) {
        const elements = document.querySelectorAll(selector);
        console.log('🟢 Content: Found', elements.length, 'elements with selector:', selector);
        if (elements.length > 0) {
          products = Array.from(elements).slice(0, 5); // Get top 5 results
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
        // Extract product information using actual Popmart selectors
        const nameElement = product.querySelector('.index_itemTitle__WaT6_, .index_itemSubTitle__mX6v_, .product-name, .item-name, h3, h4, .title');
        const priceElement = product.querySelector('.index_itemPrice__AQoMy, .price, .product-price, .item-price');
        const imageElement = product.querySelector('img');
        const linkElement = product.querySelector('a');
        
        // Enhanced availability detection
        const tagElement = product.querySelector('.index_tag__E64FE, .tag, .status, .availability');
        let availability = '';
        
        // Check for availability in multiple ways
        if (tagElement) {
          availability = tagElement.textContent.trim();
        } else {
          // Fallback: search for stock-related text in the entire product div
          const productText = product.textContent.toLowerCase();
          if (productText.includes('out of stock') || productText.includes('sold out')) {
            availability = 'OUT OF STOCK';
          } else if (productText.includes('in stock') || productText.includes('available')) {
            availability = 'IN STOCK';
          } else if (productText.includes('pre-order') || productText.includes('preorder')) {
            availability = 'PRE-ORDER';
          }
        }
        
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
          url: linkElement?.href || window.location.href,
          availability: availability,
          relevance: index + 1 // Top result has highest relevance
        };
        
        console.log('🟢 Content: Extracted product', index + 1, ':', result.name);
        console.log('🟢 Content: Product details:', {
          price: result.price,
          availability: result.availability,
          url: result.url
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
