/* global chrome */

export class ActionRegistry {
  constructor(browserContext) {
    this.browserContext = browserContext;
    this.actions = new Map();
    this.initializeActions();
  }

  initializeActions() {
    // Navigation Action
    this.actions.set('navigate', {
      description: 'Navigate to a specific URL',
      schema: {
        url: 'string - The complete URL to navigate to',
        intent: 'string - Description of why navigating to this URL'
      },
      handler: async (input) => {
        try {
          const url = this.validateAndFixUrl(input.url);
          if (!url) {
            throw new Error('Invalid or missing URL');
          }
          
          console.log(`🌐 Universal Navigation: ${url}`);
          
          const currentTab = await this.browserContext.getCurrentActiveTab();
          if (currentTab) {
            try {
              await chrome.tabs.remove(currentTab.id);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
              console.log('Could not close current tab:', e);
            }
          }
          
          const newTab = await chrome.tabs.create({ url: url, active: true });
          this.browserContext.activeTabId = newTab.id;
          await this.browserContext.waitForReady(newTab.id);
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          return {
            success: true,
            extractedContent: `Successfully navigated to ${url}`,
            includeInMemory: true,
            navigationCompleted: true
          };
          
        } catch (error) {
          console.error('Navigation error:', error);
          return {
            success: false,
            error: error.message,
            extractedContent: `Navigation failed: ${error.message}`,
            includeInMemory: true
          };
        }
      }
    });

    // Click Action - Universal
    this.actions.set('click', {
      description: 'Click on any interactive element on the page',
      schema: {
        index: 'number - The element index from the page state',
        selector: 'string - CSS selector (from page state only)',
        intent: 'string - Description of what you are clicking and why'
      },
      handler: async (input) => {
        try {
          console.log(`🖱️ Universal Click: ${input.intent || 'Click action'}`);
          
          return new Promise((resolve) => {
            const actionParams = {};
            
            if (input.index !== undefined) {
              actionParams.index = input.index;
              console.log(`🎯 Using element index: ${input.index}`);
            } else if (input.selector) {
              actionParams.selector = input.selector;
              console.log(`🎯 Using selector: ${input.selector}`);
            } else {
              resolve({
                success: false,
                error: 'No index or selector provided',
                extractedContent: 'Click failed: No target specified',
                includeInMemory: true
              });
              return;
            }

            chrome.wootz.performAction('click', actionParams, (result) => {
              resolve({
                success: result.success,
                extractedContent: result.success ?
                  `Successfully clicked: ${input.intent}` :
                  `Click failed: ${result.error}`,
                includeInMemory: true,
                error: result.error
              });
            });
          });
        } catch (error) {
          console.error('Click action error:', error);
          return {
            success: false,
            error: error.message,
            extractedContent: `Click failed: ${error.message}`,
            includeInMemory: true
          };
        }
      }
    });

    // Type Action - Universal
    this.actions.set('type', {
      description: 'Type text into any input field, textarea, or contenteditable element',
      schema: {
        index: 'number - The element index from the page state',
        selector: 'string - CSS selector (from page state only)',
        text: 'string - The text to type into the element',
        intent: 'string - Description of what you are typing and why'
      },
      handler: async (input) => {
        try {
          console.log(`⌨️ Universal Type: "${input.text}" - ${input.intent}`);
          return new Promise((resolve) => {
            const actionParams = { text: input.text };
            if (input.index !== undefined) {
              actionParams.index = input.index;
            } else if (input.selector) {
              actionParams.selector = input.selector;
            } else {
              resolve({
                success: false,
                error: 'No index or selector provided for text input',
                extractedContent: `Type failed: No target specified for "${input.text}"`,
                includeInMemory: true
              });
              return;
            }
            chrome.wootz.performAction('fill', actionParams, (result) => {
              resolve({
                success: result.success,
                extractedContent: result.success ?
                  `Successfully typed: "${input.text}"` :
                  `Type failed: ${result.error}`,
                includeInMemory: true,
                error: result.error
              });
            });
          });
        } catch (error) {
          console.error('Type action error:', error);
          return {
            success: false,
            error: error.message,
            extractedContent: `Type failed: ${error.message}`,
            includeInMemory: true
          };
        }
      }
    });

    // Scroll Action - Universal
    this.actions.set('scroll', {
      description: 'Scroll the page in any direction',
      schema: {
        direction: 'string - Direction to scroll (up, down, left, right)',
        amount: 'number - Amount to scroll in pixels (optional, default: 300)',
        intent: 'string - Description of why you are scrolling'
      },
      handler: async (input) => {
        try {
          const amount = String(input.amount || 300);
          const direction = input.direction || 'down';
          
          console.log(`📜 Universal Scroll: ${direction} by ${amount}px - ${input.intent}`);
          
          return new Promise((resolve) => {
            chrome.wootz.performAction('scroll', {
              direction: direction,
              amount: amount
            }, (result) => {
              resolve({
                success: result.success,
                extractedContent: result.success ? 
                  `Scrolled ${direction} by ${amount}px` : 
                  `Scroll failed: ${result.error}`,
                includeInMemory: true,
                error: result.error
              });
            });
          });
        } catch (error) {
          console.error('Scroll action error:', error);
          return {
            success: false,
            error: error.message,
            extractedContent: `Scroll failed: ${error.message}`,
            includeInMemory: true
          };
        }
      }
    });

    // Wait Action - Universal
    this.actions.set('wait', {
      description: 'Wait for a specified amount of time',
      schema: {
        duration: 'number - Time to wait in milliseconds (default: 2000)',
        intent: 'string - Reason for waiting'
      },
      handler: async (input) => {
        const duration = input.duration || 2000;
        console.log(`⏳ Universal Wait: ${duration}ms - ${input.intent}`);
        await new Promise(resolve => setTimeout(resolve, duration));
        return {
          success: true,
          extractedContent: `Waited ${duration}ms`,
          includeInMemory: true
        };
      }
    });

    // Complete Action - Universal
    this.actions.set('complete', {
      description: 'Mark the task as completed with a summary',
      schema: {
        success: 'boolean - Whether the task was successful',
        summary: 'string - Summary of what was accomplished',
        details: 'string - Additional details about the completion'
      },
      handler: async (input) => {
        console.log(`✅ Task Complete: ${input.summary}`);
        return {
          success: input.success !== false,
          extractedContent: input.summary || 'Task completed',
          isDone: true,
          includeInMemory: true,
          completionDetails: input.details
        };
      }
    });

    // Find and Click by heuristics (text/purpose/category) with smart shopping logic
    // this.actions.set('find_click', {
    //   description: 'Find an interactive element by text/purpose/category and click it - enhanced for shopping/social sites',
    //   schema: {
    //     text: 'string - Substring to match in textContent/text (case-insensitive)',
    //     purpose: 'string - Optional purpose to prefer (e.g., submit, add-to-cart, product-link)',
    //     category: 'string - Optional category to prefer (action, form, navigation)',
    //     intent: 'string - Why clicking this target',
    //     context: 'string - Shopping context like "carbonara ingredients" or "electronics under $50"'
    //   },
    //   handler: async (input) => {
    //     const score = (el) => {
    //       if (!el?.isVisible || !el?.isInteractive) return -1;
    //       let s = 0;
    //       const txt = (el.text || el.textContent || '').toLowerCase();
    //       const ariaLabel = (el.attributes?.['aria-label'] || '').toLowerCase();
    //       const className = (el.attributes?.class || '').toLowerCase();
    //       const id = (el.attributes?.id || '').toLowerCase();
          
    //       // Enhanced text matching
    //       if (input.text) {
    //         const searchText = String(input.text).toLowerCase();
    //         if (txt.includes(searchText)) s += 15; // Higher score for exact text match
    //         if (ariaLabel.includes(searchText)) s += 12;
    //         if (className.includes(searchText.replace(/\s+/g, '-'))) s += 8; // CSS class format
    //         if (id.includes(searchText.replace(/\s+/g, '-'))) s += 10; // ID format
            
    //         // Partial word matching for better flexibility
    //         const searchWords = searchText.split(' ');
    //         const matchingWords = searchWords.filter(word => 
    //           txt.includes(word) || ariaLabel.includes(word)
    //         );
    //         if (matchingWords.length > 0) {
    //           s += (matchingWords.length / searchWords.length) * 8;
    //         }
    //       }
          
    //       // Purpose and category matching with higher weights
    //       if (input.purpose && (el.purpose || '').toLowerCase() === String(input.purpose).toLowerCase()) s += 8;
    //       if (input.category && (el.category || '').toLowerCase() === String(input.category).toLowerCase()) s += 6;
          
    //       // Element type preferences for actions
    //       if (el.tagName === 'BUTTON') s += 3;
    //       if (el.tagName === 'A' && el.attributes?.href) s += 2;
    //       if (el.tagName === 'INPUT' && el.attributes?.type === 'submit') s += 4;
          
    //       // Size bonus (larger elements are often more important)
    //       const area = (el.bounds?.width || 0) * (el.bounds?.height || 0);
    //       s += Math.min(3, Math.log10(1 + area/1000));
          
    //       return s;
    //     };
    //     return new Promise((resolve) => {
    //       chrome.wootz.getPageState({ debugMode: false, includeHidden: true }, (res) => {
    //         if (!res?.success) {
    //           resolve({ success: false, error: 'getPageState failed', includeInMemory: true });
    //           return;
    //         }
    //         const els = (res.pageState?.elements || []).map((el, i) => ({ index: el.index ?? i, selector: el.selector, textContent: el.textContent, text: el.text, isVisible: el.isVisible !== false, isInteractive: el.isInteractive !== false, purpose: el.purpose, category: el.category, bounds: el.bounds }));
    //         const candidates = els.map(el => ({ el, s: score(el) })).filter(x => x.s >= 0).sort((a,b) => b.s-a.s);
    //         const best = candidates[0]?.el;
    //         if (!best) {
    //           resolve({ success: false, error: 'No matching element found', includeInMemory: true });
    //           return;
    //         }
    //         const params = best.selector ? { selector: best.selector } : { index: best.index };
    //         chrome.wootz.performAction('click', params, (r) => {
    //           resolve({ success: r.success, extractedContent: r.success ? `Clicked by find_click: ${input.intent || input.text || ''}` : `find_click failed: ${r.error}`, includeInMemory: true, error: r.error });
    //         });
    //       });
    //     });
    //   }
    // });

    // Find and Type (match input by placeholder/name/aria-label)
    // this.actions.set('find_type', {
    //   description: 'Find an input/textarea by placeholder/name/label and type text',
    //   schema: {
    //     query: 'string - Placeholder/name/label text to match',
    //     text: 'string - Text to type',
    //     intent: 'string - Why typing into this field'
    //   },
    //   handler: async (input) => {
    //     const q = String(input.query || '').toLowerCase();
    //     const score = (el) => {
    //       if (!el?.isVisible || !el?.isInteractive) return -1;
    //       const tag = (el.tagName || '').toLowerCase();
    //       if (!(tag === 'input' || tag === 'textarea')) return -1;
    //       let s = 1;
    //       const attrs = el.attributes || {};
    //       const hay = [el.text || '', el.textContent || '', attrs.placeholder || '', attrs.name || '', attrs['aria-label'] || ''].join(' ').toLowerCase();
    //       if (q && hay.includes(q)) s += 5;
    //       if ((attrs.type || '').toLowerCase() === 'search') s += 1;
    //       return s;
    //     };
    //     return new Promise((resolve) => {
    //       chrome.wootz.getPageState({ debugMode: false, includeHidden: true }, (res) => {
    //         if (!res?.success) { resolve({ success:false, error:'getPageState failed', includeInMemory:true }); return; }
    //         const els = (res.pageState?.elements || []).map((el, i) => ({ ...el, index: el.index ?? i }));
    //         const candidates = els.map(el => ({ el, s: score(el) })).filter(x => x.s >= 0).sort((a,b)=>b.s-a.s);
    //         const best = candidates[0]?.el;
    //         if (!best) { resolve({ success:false, error:'No matching input found', includeInMemory:true }); return; }
    //         const params = best.selector ? { selector: best.selector, text: input.text } : { index: best.index, text: input.text };
    //         chrome.wootz.performAction('fill', params, (r) => {
    //           resolve({ success: r.success, extractedContent: r.success ? `Typed by find_type: ${input.intent || input.text || ''}` : `find_type failed: ${r.error}`, includeInMemory: true, error: r.error });
    //         });
    //       });
    //     });
    //   }
    // });

    // Go back in history (tab back) via minimal content-script bridge
    this.actions.set('go_back', {
      description: 'Navigate back in browser history',
      schema: { intent: 'string - Why navigating back' },
      handler: async (_input) => {
        try {
          const tab = await this.browserContext.getCurrentActiveTab();
          if (!tab?.id) return { success:false, error:'No active tab', includeInMemory:true };
          const res = await new Promise((resolve) => {
            chrome.tabs.sendMessage(tab.id, { type: '__agent_history_back' }, (resp) => resolve(resp));
          });
          if (res?.ok) {
            await this.browserContext.waitForReady(tab.id);
            return { success:true, extractedContent:'Went back one step', includeInMemory:true };
          }
          return { success:false, error: res?.error || 'history back failed', includeInMemory:true };
        } catch (e) {
          return { success:false, error: e.message, extractedContent:`Back failed: ${e.message}`, includeInMemory:true };
        }
      }
    });

    // Wait until text appears (basic condition wait)
    // this.actions.set('wait_for_text', {
    //   description: 'Wait until an element containing specific text appears (timeout ms)',
    //   schema: { text: 'string - Substring to wait for', timeout: 'number - milliseconds (default 4000)' },
    //   handler: async (input) => {
    //     const text = String(input.text || '').toLowerCase();
    //     const timeout = Number(input.timeout || 4000);
    //     const start = Date.now();
    //     while (Date.now() - start < timeout) {
    //       const state = await new Promise(resolve => chrome.wootz.getPageState({ debugMode:false, includeHidden:true }, resolve));
    //       const els = (state?.pageState?.elements || []);
    //       if (els.some(e => ((e.text || e.textContent || '').toLowerCase().includes(text)) && e.isVisible)) {
    //         return { success: true, extractedContent:`wait_for_text found: ${input.text}`, includeInMemory:true };
    //       }
    //       await new Promise(r => setTimeout(r, 300));
    //     }
    //     return { success:false, error:'Timeout waiting for text', includeInMemory:true };
    //   }
    // });
  }

  async executeAction(actionName, input) {
    const action = this.actions.get(actionName);
    if (!action) {
      throw new Error(`Unknown action: ${actionName}`);
    }

    try {
      return await action.handler(input);
    } catch (error) {
      return {
        success: false,
        error: error.message,
        extractedContent: `Action ${actionName} failed: ${error.message}`,
        includeInMemory: true
      };
    }
  }

  // Provide a readonly map of available actions for other agents
  getAvailableActions() {
    const out = {};
    this.actions.forEach((val, key) => {
      out[key] = { description: val.description, schema: val.schema };
    });
    return out;
  }

  validateAndFixUrl(url) {
    if (!url || typeof url !== 'string') {
      console.error('Invalid URL provided:', url);
      return null;
    }
    
    url = url.trim().replace(/['"]/g, '');
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url);
        return url;
      } catch (e) {
        console.error('Invalid URL format:', url);
        return null;
      }
    }
    
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    try {
      new URL(url);
      return url;
    } catch (e) {
      console.error('Could not create valid URL:', url);
      return null;
    }
  }
}