export class NavigatorAgent {
  constructor(llmService, memoryManager, actionRegistry) {
    this.llmService = llmService;
    this.memoryManager = memoryManager;
    this.actionRegistry = actionRegistry;
  }

  async navigate(plan, currentState) {
    const context = this.memoryManager.compressForPrompt(2000);
    
    // Enhanced context analysis for navigation
    const recentActions = this.formatRecentActions(context.recentMessages);
    const actionHistory = this.analyzeActionHistory(context, currentState);
    const sequenceGuidance = this.getSequenceGuidance(context.recentMessages);
    
    const failedActionsNav = context.recentMessages
    .filter(msg => msg.content?.includes('failed') || msg.content?.includes('error'))
    .map(msg => `${msg.action}: ${msg.content}`)
    .join('\n');
    
    console.log('[NavigatorAgent] plan:', plan, 
                'currentState:', currentState, 
                'context:', context, 
                'recentActions:', recentActions, 
                'actionHistory:', actionHistory, 
                'sequenceGuidance:', sequenceGuidance,
                'failedActionsNav:', failedActionsNav);
    
    const navigatorPrompt = `## ENHANCED NAVIGATION CONTEXT: ${context.currentStep}-${context.proceduralSummaries.length}

Execute planned action using mobile elements with enhanced context awareness and task progress tracking.

# **KNOWLEDGE CUTOFF & RESPONSE REQUIREMENTS**
* **Knowledge Cutoff**: July 2025 - You have current data and knowledge up to July 2025
* **REAL-TIME DATA**: You have access to real-time information from the internet and current page state using the url from the currentContext.
* **CRITICAL**: ALWAYS provide COMPLETE responses - NEVER slice, trim, or truncate any section
* **IMPORTANT**: Do not stop until all blocks are output. DO NOT OMIT ANY SECTION.
* **DELIMITER REQUIREMENT**: Always output all required JSON delimiter blocks exactly as specified

# **TASK CONTEXT & PROGRESS**
Current Step: ${context.currentStep}/25
Task Components Completed: ${context.taskState?.completedComponents?.length || 0}
Task History: ${context.taskHistory?.map(h => h.component).join(' → ') || 'Starting navigation'}

# **PLAN TO EXECUTE**
Strategy: ${plan.strategy}
Action: ${plan.next_action}

# **ENHANCED CURRENT STATE**
URL: ${currentState.pageInfo?.url}
Page Title: ${currentState.pageInfo?.title || 'unknown'}
Platform: ${currentState.pageInfo?.platform || 'unknown'}
Page Type: ${currentState.pageContext?.pageType || 'unknown'}
Elements: ${currentState.interactiveElements?.length || 0}

# **TOP ELEMENTS (Current Page Only, 50 elements)**
${this.formatElementsForNavigation(currentState.interactiveElements?.slice(0, 50) || [])}

# **VISUAL CONTEXT (Screenshot Analysis)**
📸 A screenshot of the current page with highlighted interactive elements has been captured and is available as visual context. The screenshot shows:
- The current page layout and design
- Highlighted interactive elements (buttons, links, inputs, etc.) with their indexes
- Visual positioning and styling of elements
- Current page state and any visible content
- Element boundaries and clickable areas
- Form fields, search boxes, and action buttons
- Navigation elements and interactive components

Use this visual context along with the element data to select the most appropriate action and target elements based on their visual appearance and positioning.

# **SEQUENCE GUIDANCE**
${sequenceGuidance}

# **ACTION HISTORY ANALYSIS**
${actionHistory}

# **RECENT ACTIONS**
${recentActions}

# **FAILURE AVOIDANCE**
- Do NOT repeat actions/intents that failed in the last 3 steps.
- After navigation or click, always check for new page state and replan if new elements appear.
${failedActionsNav ? `# **RECENT FAILURES**\n${failedActionsNav}` : ''}

# **AVAILABLE ACTIONS**
navigate(url), click(index|selector), type(index|selector,text), scroll(direction,amount), wait(duration), go_back()

# **OUTPUT FORMAT - MUST BE COMPLETE**
**CRITICAL**: Return COMPLETE JSON response - NO TRUNCATION OR TRIMMING ALLOWED

{
  "thinking": "Brief analysis",
  "action": {
    "name": "action_name",
    "parameters": {
      "index": 5,
      "intent": "What this accomplishes"
    }
  }
}

**RULES**: Prefer exact index/selector when known:
- go_back takes no required parameters
Skip index/selector for navigate/wait/scroll.
**ENSURE ALL FIELDS ARE POPULATED - NO INCOMPLETE RESPONSES ALLOWED**`;

    try {
      const response = await this.llmService.call([
        { role: 'user', content: navigatorPrompt }
      ], { maxTokens: 2000 }, 'navigator');
      
      console.log('[NavigatorAgent] LLM response:', response);
      
      let navResult;
      try {
        navResult = JSON.parse(this.cleanJSONResponse(response));
        
        // Validate required fields
        if (!navResult.thinking) {
          throw new Error('Missing required field: thinking');
        }
        if (!navResult.action || !navResult.action.name) {
          throw new Error('Missing required field: action.name');
        }
        
      } catch (parseError) {
        console.error('NavigatorAgent JSON parsing error:', parseError.message);
        console.error('Raw response that failed to parse:', response);
        
        // Enhanced error with more context
        let errorMessage;
        if (parseError.message.includes('Unexpected end of JSON input')) {
          errorMessage = `NavigatorAgent response parsing failed: The AI response was incomplete or cut off. This often happens with complex navigation tasks. Try simplifying your request. Original error: ${parseError.message}`;
        } else if (parseError.message.includes('Unexpected token')) {
          errorMessage = `NavigatorAgent response parsing failed: The AI response contained invalid formatting. This may be due to model overload. Try again with a simpler request. Original error: ${parseError.message}`;
        } else if (parseError.message.includes('Missing required field')) {
          errorMessage = `NavigatorAgent response validation failed: ${parseError.message}. The AI response was incomplete. Try again or break down your task into smaller steps.`;
        } else {
          errorMessage = `NavigatorAgent response parsing failed: Unable to process AI response due to formatting issues. Original error: ${parseError.message}. Raw response length: ${response?.length || 0} characters.`;
        }
        
        // Throw the enhanced error which will be caught by the outer catch and trigger fallback
        throw new Error(errorMessage);
      }
      
      // Validate the action with context awareness
      if (navResult.action && navResult.action.name) {
        const availableActions = this.actionRegistry.getAvailableActions();
        if (!availableActions[navResult.action.name]) {
          console.warn(`⚠️ Unknown action: ${navResult.action.name}`);
          return this.getFallbackNavigation(plan, currentState, context);
        }
        
        // Enhanced validation with selector fallback
        const validation = this.validateActionWithContext(navResult.action, currentState, context);
        if (!validation.isValid) {
          console.warn(`⚠️ Invalid action: ${validation.reason}`);
          return this.getFallbackNavigation(plan, currentState, context);
        }
      }
      
      return navResult;
    } catch (error) {
      console.error('Navigator failed:', error);
      return this.getFallbackNavigation(plan, currentState, context);
    }
  }

  // New method to format recent actions for navigation context
  formatRecentActions(recentMessages) {
    if (!recentMessages || recentMessages.length === 0) {
      return 'No recent actions taken';
    }
    
    return recentMessages.map((msg, index) => {
      const stepInfo = msg.step ? `Step ${msg.step}` : `Recent ${index + 1}`;
      const roleInfo = msg.role || 'unknown';
      const actionInfo = msg.action || 'action';
      const contentInfo = (msg.content || '').substring(0, 120);
      const timestamp = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'unknown time';
      return `${stepInfo} (${roleInfo} at ${timestamp}): ${actionInfo} - ${contentInfo}`;
    }).join('\n');
  }

  // New method to analyze action history patterns
  analyzeActionHistory(context, currentState) {
    const analysis = [];
    const recentMessages = context.recentMessages || [];
    
    if (recentMessages.length === 0) {
      return 'No action history available';
    }
    
    // Detect repeated failures
    const failedActions = recentMessages.filter(msg => 
      msg.content?.includes('failed') || msg.content?.includes('error')
    );
    if (failedActions.length > 0) {
      analysis.push(`⚠️ ${failedActions.length} recent failures detected - avoid repeating same approach`);
    }
    
    // Detect successful patterns
    const successfulActions = recentMessages.filter(msg => 
      msg.content?.includes('success') || msg.content?.includes('completed')
    );
    if (successfulActions.length > 0) {
      analysis.push(`✅ ${successfulActions.length} successful actions - build on this progress`);
    }
    
    // Detect if we're in a sequence
    const lastAction = recentMessages[recentMessages.length - 1];
    if (lastAction) {
      if (lastAction.content?.includes('typed') || lastAction.content?.includes('input')) {
        analysis.push('📝 SEQUENCE: Just completed text input - next action should be submit/search');
      } else if (lastAction.content?.includes('click') && lastAction.content?.includes('search')) {
        analysis.push('🔍 SEQUENCE: Just clicked search - next action should be finding results');
      } else if (lastAction.content?.includes('navigate')) {
        analysis.push('🌐 SEQUENCE: Just navigated - page may still be loading');
      }
    }
    
    // Check current page state
    const domain = this.extractDomain(currentState.pageInfo?.url);
    const elementsCount = currentState.interactiveElements?.length || 0;
    analysis.push(`📊 Current page: ${domain} with ${elementsCount} interactive elements`);
    
    return analysis.join('\n') || 'No specific patterns detected in action history';
  }

  // New method to provide sequence-specific guidance
  getSequenceGuidance(recentMessages) {
    if (!recentMessages || recentMessages.length === 0) {
      return 'Starting fresh - analyze page and choose appropriate first action';
    }
    
    const lastAction = recentMessages[recentMessages.length - 1];
    if (!lastAction) {
      return 'No clear last action - proceed with current plan';
    }
    
    const actionContent = (lastAction.content || '').toLowerCase();
    
    if (actionContent.includes('type') || actionContent.includes('input') || actionContent.includes('fill')) {
      return `🎯 NEXT: After typing, you must click submit/search/enter button
      - Look for buttons with text like "Search", "Submit", "Go", "Enter"
      - Check for search icons or magnifying glass buttons
      - Don't type again - the input should already be filled`;
    }
    
    if (actionContent.includes('click') && actionContent.includes('search')) {
      return `🎯 NEXT: After clicking search, wait for results
      - Look for new content that appeared
      - Find relevant search results to click
      - Check for loading indicators that finished`;
    }
    
    if (actionContent.includes('navigate') || actionContent.includes('url')) {
      return `🎯 NEXT: After navigation, page is loading
      - Wait for page to fully load
      - Look for main interactive elements on new page
      - Find elements relevant to the user's task`;
    }
    
    if (actionContent.includes('scroll')) {
      return `🎯 NEXT: After scrolling, new content may be visible
      - Look for new elements that appeared
      - Check if target content is now visible
      - Consider if more scrolling is needed`;
    }
    
    if (actionContent.includes('failed') || actionContent.includes('error')) {
      return `🎯 NEXT: Previous action failed - try different approach
      - Choose a different element or method
      - Look for alternative paths to accomplish the goal
      - Don't repeat the exact same action that just failed`;
    }
    
    return 'Continue with planned sequence based on current progress';
  }

  // New method to validate actions against context
  validateActionWithContext(action, currentState, context) {
    const recentMessages = context.recentMessages || [];
    
    // Check for immediate repetition of failed actions
    const lastAction = recentMessages[recentMessages.length - 1];
    if (lastAction && lastAction.content?.includes('failed')) {
      const lastActionType = this.extractActionType(lastAction.content);
      if (lastActionType === action.name) {
        return {
          isValid: false,
          reason: `Trying to repeat ${action.name} action that just failed`
        };
      }
    }

    // Navigation actions only need URL
    if (action.name === 'navigate') {
      if (!action.parameters?.url) {
        return {
          isValid: false,
          reason: 'Navigation action requires a URL parameter'
        };
      }
      return { isValid: true };
    }

    // Wait actions only need duration
    if (action.name === 'wait') {
      if (!action.parameters?.duration && !action.parameters?.milliseconds) {
        return {
          isValid: false,
          reason: 'Wait action requires duration or milliseconds parameter'
        };
      }
      return { isValid: true };
    }

    // FIXED: Scroll actions only need direction/amount (not index/selector)
    if (action.name === 'scroll') {
      if (!action.parameters?.direction && !action.parameters?.amount) {
        return {
          isValid: false,
          reason: 'Scroll action requires direction or amount parameter'
        };
      }
      return { isValid: true };
    }
    
    if (action.parameters?.index === undefined && !action.parameters?.selector) {
      return {
        isValid: false,
        reason: 'No index or selector provided'
      };
    }

    // Validate element index exists (if provided)
    if (action.parameters?.index !== undefined) {
      const availableIndexes = (currentState.interactiveElements || []).map(el => el.index);
      if (!availableIndexes.includes(action.parameters.index)) {
        console.warn(`⚠️ Element index ${action.parameters.index} not found. Available: ${availableIndexes.slice(0, 20).join(', ')}`);
        
        if (action.parameters?.selector) {
          console.log(`🔄 Falling back to selector: ${action.parameters.selector}`);
          return { isValid: true };
        }
        
        return {
          isValid: false,
          reason: `Element index ${action.parameters.index} not found. Available: ${availableIndexes.slice(0, 20).join(', ')}`
        };
      }
    }

    // Check for repeated typing when should click submit
    if (lastAction && action.name === 'type') {
      const lastActionName = lastAction.action || '';
      const lastContent = lastAction.content || '';
      if (lastActionName === 'type' && lastContent.includes('Successfully typed')) {
        return {
          isValid: false,
          reason: 'Just typed text - should click submit/search instead of typing again'
        };
      }
    }

    return { isValid: true };
  }

  // Helper method to extract action type from content
  extractActionType(content) {
    if (!content) return 'unknown';
    const lower = content.toLowerCase();
    if (lower.includes('click')) return 'click';
    if (lower.includes('type') || lower.includes('input')) return 'type';
    if (lower.includes('scroll')) return 'scroll';
    if (lower.includes('navigate')) return 'navigate';
    if (lower.includes('wait')) return 'wait';
    return 'unknown';
  }

  extractDomain(url) {
    if (!url || typeof url !== 'string') return 'unknown';
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  formatElementsWithDetails(elements) {
    if (!elements || elements.length === 0) return "No interactive elements found.";
    
    // Filter to only show the most relevant elements for better accuracy
    const relevantElements = elements.filter(el => 
      el.isVisible && el.isInteractive && 
      (el.category === 'action' || el.category === 'form' || el.category === 'navigation' ||
       (el.text && el.text.trim().length > 0))
    );
    
    return relevantElements.slice(0, 50).map(el => {
      let description = `[${el.index}] ${el.tagName?.toLowerCase() || 'element'}`;
      
      // Add category and purpose info
      if (el.category) description += ` (${el.category})`;
      if (el.purpose && el.purpose !== 'general') description += ` [${el.purpose}]`;
      
      // Add text content
      const text = (el.text || '').trim();
      if (text) {
        description += `: "${text.substring(0, 80)}"${text.length > 80 ? '...' : ''}`;
      }
      
      // Add important attributes
      const attrs = [];
      if (el.attributes?.id) attrs.push(`id="${el.attributes.id}"`);
      if (el.attributes?.['data-testid']) attrs.push(`data-testid="${el.attributes['data-testid']}"`);
      if (el.attributes?.name) attrs.push(`name="${el.attributes.name}"`);
      if (attrs.length > 0) description += ` {${attrs.join(', ')}}`;
      
      return description;
    }).join('\n');
  }

  // NEW: Optimized element formatting for navigation with reduced token usage
  formatElementsForNavigation(elements) {
    if (!elements || elements.length === 0) return "No interactive elements found on this page.";
    
    return elements.map(el => {
      // Limit text content to prevent token explosion
      const textContent = (el.textContent || '').trim();
      const limitedTextContent = textContent.length > 80 ? textContent.substring(0, 80) + '...' : textContent;

      // Limit selector length
      const selector = (el.selector || 'none').trim();
      const limitedSelector = selector.length > 100 ? selector.substring(0, 100) + '...' : selector;

      // Limit XPath length
      const xpath = (el.xpath || 'none').trim();
      const limitedXPath = xpath.length > 100 ? xpath.substring(0, 100) + '...' : xpath;

      // Process bounds to ensure they're concise
      const bounds = el.bounds || {};
      const simplifiedBounds = {
        x: Math.round(bounds.x || 0),
        y: Math.round(bounds.y || 0),
        width: Math.round(bounds.width || 0),
        height: Math.round(bounds.height || 0)
      };
      
      return `[Index: ${el.index}] TagName: ${el.tagName || 'UNKNOWN'} {
  Category: ${el.category || 'unknown'}
  Purpose: ${el.purpose || 'general'}
  Selector: ${limitedSelector}
  XPath: ${limitedXPath} 
  TextContent: "${limitedTextContent}" 
  Bounds: ${JSON.stringify(simplifiedBounds)}
}`;
    }).join('\n\n');
  }

  formatAvailableActions() {
    const actions = this.actionRegistry.getAvailableActions();
    return Object.entries(actions).map(([name, info]) => {
      return `${name}: ${info.description}\n  Parameters: ${Object.entries(info.schema).map(([param, desc]) => `${param} - ${desc}`).join(', ')}`;
    }).join('\n\n');
  }

  cleanJSONResponse(response) {
    let cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').replace(/`/g, '');
    
    // Fix: Clean control characters from JSON strings
    cleaned = cleaned.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  }

  // Enhanced fallback navigation with context
  getFallbackNavigation(plan, currentState, context) {
    const domain = this.extractDomain(currentState.pageInfo?.url);
    const lastAction = context?.recentMessages?.[context.recentMessages.length - 1];
    
    let fallbackAction = {
      name: 'wait',
      parameters: {
        duration: 2000,
        intent: 'Wait to allow page to load and observe current state'
      }
    };
    
    // Context-aware fallback logic
    if (lastAction) {
      const actionContent = (lastAction.content || '').toLowerCase();
      
      if (actionContent.includes('type') || actionContent.includes('input')) {
        // Look for a search button to click
        const searchButtons = (currentState.interactiveElements || []).filter(el => {
          const text = (el.text || '').toLowerCase();
          const purpose = (el.purpose || '').toLowerCase();
          const category = (el.category || '').toLowerCase();
          
          return (text.includes('search') || text.includes('submit') || text.includes('go') || 
                  purpose.includes('submit') || category === 'action') &&
                 el.isVisible && el.isInteractive;
        });
        
        if (searchButtons.length > 0) {
          fallbackAction = {
            name: 'click',
            parameters: {
              index: searchButtons[0].index,
              intent: 'Click search/submit button after typing text input'
            }
          };
        }
      } else if (actionContent.includes('failed') || actionContent.includes('invalid')) {
        const availableElements = (currentState.interactiveElements || []).filter(el => 
          el.isVisible && el.isInteractive && (
            (el.text || '').toLowerCase().includes('price') ||
            (el.text || '').toLowerCase().includes('sort') ||
            (el.text || '').toLowerCase().includes('filter') ||
            el.category === 'action'
          )
        );
        
        if (availableElements.length > 0) {
          fallbackAction = {
            name: 'click',
            parameters: {
              index: availableElements[0].index,
              intent: `Try clicking ${availableElements[0].text || 'available element'} after previous action failed`
            }
          };
        }
      }
    }
    
    // If exact click/type failed, try alternative approach
    if (lastAction && lastAction.content?.includes('failed')) {
      if (lastAction.action === 'click') {
        // Try scrolling to find new elements
        return {
          thinking: 'Previous click failed, trying scroll to find new elements',
          action: {
            name: 'scroll',
            parameters: {
              direction: 'down',
              amount: 300,
              intent: 'Scroll down to find new interactive elements after click failure'
            }
          }
        };
      }
      if (lastAction.action === 'type') {
        // Try waiting for page to load
        return {
          thinking: 'Previous type failed, trying wait for page to load',
          action: {
            name: 'wait',
            parameters: {
              duration: 3000,
              intent: 'Wait for page to load after type failure'
            }
          }
        };
      }
    }
    
    return {
      thinking: `Context-aware fallback for ${domain}. Step ${context?.currentStep || 0}. ${lastAction ? `Last action: ${lastAction.action}` : 'No previous actions'}. Using enhanced context to determine best fallback approach.`,
      action: fallbackAction
    };
  }
}