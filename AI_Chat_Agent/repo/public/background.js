/* global chrome */

console.log('AI Universal Agent Background Script Loading...');

// Enhanced Memory Manager
class ProceduralMemoryManager {
  constructor() {
    this.messages = [];
    this.proceduralSummaries = [];
    this.maxMessages = 10;
    this.maxSummaries = 3;
    this.stepCounter = 0;
  }

  addMessage(message) {
    const safeMessage = {
      ...message,
      content: this.ensureString(message.content),
      timestamp: Date.now(),
      step: this.stepCounter++
    };

    this.messages.push(safeMessage);

    if (this.messages.length > this.maxMessages) {
      this.createProceduralSummary();
      this.messages = this.messages.slice(-6);
    }
  }

  ensureString(content) {
    if (typeof content === 'string') return content;
    if (content === null || content === undefined) return '';
    if (typeof content === 'object') return JSON.stringify(content);
    return String(content);
  }

  createProceduralSummary() {
    const recentMessages = this.messages.slice(-5);
    const summary = {
      steps: `${Math.max(0, this.stepCounter - 5)}-${this.stepCounter}`,
      actions: recentMessages.map(m => m.action || 'action').join(' → '),
      findings: recentMessages.map(m => this.ensureString(m.content)).join(' '),
      timestamp: Date.now()
    };
    
    this.proceduralSummaries.push(summary);
    if (this.proceduralSummaries.length > this.maxSummaries) {
      this.proceduralSummaries.shift();
    }
  }

  getContext() {
    return {
      recentMessages: this.messages.slice(-5).map(m => ({
        ...m,
        content: this.ensureString(m.content)
      })),
      proceduralSummaries: this.proceduralSummaries,
      currentStep: this.stepCounter
    };
  }

  clear() {
    this.messages = [];
    this.proceduralSummaries = [];
    this.stepCounter = 0;
  }
}

// Background Task Manager
class BackgroundTaskManager {
  constructor() {
    this.runningTasks = new Map();
    this.taskResults = new Map();
    this.maxConcurrentTasks = 2;
    console.log('✅ BackgroundTaskManager initialized');
  }

  async startTask(taskId, taskData, executor, connectionManager) {
    console.log(`🚀 BackgroundTaskManager starting: ${taskId}`);
    
    this.runningTasks.set(taskId, {
      id: taskId,
      data: taskData,
      status: 'running',
      startTime: Date.now(),
      messages: [],
      executor: executor
    });

    setTimeout(() => {
      this.executeTaskIndependently(taskId, taskData, executor, connectionManager);
    }, 100);
  }

  async executeTaskIndependently(taskId, taskData, executor, connectionManager) {
    try {
      console.log(`⚙️ BackgroundTaskManager executing independently: ${taskId}`);
      
      const backgroundConnectionManager = {
        broadcast: (message) => {
          const task = this.runningTasks.get(taskId);
          if (task) {
            task.messages.push({
              ...message,
              timestamp: Date.now()
            });
            
            if (message.type === 'task_complete' || message.type === 'task_error') {
              task.status = message.type === 'task_complete' ? 'completed' : 'error';
              task.result = message.result || message;
              task.endTime = Date.now();
              
              this.taskResults.set(taskId, task);
              this.runningTasks.delete(taskId);
              
              // Clear execution state from storage when task completes
              chrome.storage.local.set({
                isExecuting: false,
                activeTaskId: null,
                taskStartTime: null,
                sessionId: null // Add this line
              });
              
              console.log(`✅ BackgroundTaskManager completed: ${taskId}`);
            }
            
            if (connectionManager) {
              connectionManager.broadcast(message);
            }
          }
        }
      };

      // Pass the initial plan if available
      await executor.execute(taskData.task, backgroundConnectionManager, taskData.initialPlan);

    } catch (error) {
      console.error(`❌ BackgroundTaskManager error: ${taskId}`, error);
      
      // Clear execution state from storage on error
      chrome.storage.local.set({
        isExecuting: false,
        activeTaskId: null,
        taskStartTime: null,
        sessionId: null // Add this line
      });
      
      const task = this.runningTasks.get(taskId);
      if (task) {
        task.status = 'error';
        task.error = error.message;
        task.endTime = Date.now();
        
        this.taskResults.set(taskId, task);
        this.runningTasks.delete(taskId);
      }
    }
  }

  getTaskStatus(taskId) {
    return this.runningTasks.get(taskId) || this.taskResults.get(taskId) || null;
  }

  getRecentMessages(taskId, limit = 20) {
    const task = this.getTaskStatus(taskId);
    return task?.messages?.slice(-limit) || [];
  }

  getAllRunningTasks() {
    return Array.from(this.runningTasks.values());
  }

  getAllCompletedTasks() {
    return Array.from(this.taskResults.values());
  }

  cancelTask(taskId) {
    const task = this.runningTasks.get(taskId);
    if (task && task.executor) {
      console.log(`🛑 BackgroundTaskManager cancelling: ${taskId}`);
      task.executor.cancel();
      task.status = 'cancelled';
      task.endTime = Date.now();
      
      this.taskResults.set(taskId, task);
      this.runningTasks.delete(taskId);
      return true;
    }
    return false;
  }
}

// Universal Action Registry - Platform Agnostic
class UniversalActionRegistry {
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
        selector: 'string - CSS selector (alternative to index)',
        intent: 'string - Description of what you are clicking and why'
      },
      handler: async (input) => {
        try {
          console.log(`🖱️ Universal Click: ${input.intent || 'Click action'}`);
          
          return new Promise((resolve) => {
            const actionParams = {};
            
            if (input.index !== undefined) {
              actionParams.index = input.index;
            } else if (input.selector) {
              actionParams.selector = input.selector;
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
        selector: 'string - CSS selector (alternative to index)',
        text: 'string - The text to type into the element',
        intent: 'string - Description of what you are typing and why'
      },
      handler: async (input) => {
        try {
          console.log(`⌨️ Universal Type: "${input.text}" - ${input.intent}`);
          
          return new Promise((resolve) => {
            const actionParams = {
              text: input.text
            };
            
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

  getAvailableActions() {
    const actionsInfo = {};
    this.actions.forEach((action, name) => {
      actionsInfo[name] = {
        description: action.description,
        schema: action.schema
      };
    });
    return actionsInfo;
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

// Universal Planner Agent - Platform Agnostic
class UniversalPlannerAgent {
  constructor(llmService, memoryManager) {
    this.llmService = llmService;
    this.memoryManager = memoryManager;
  }

  async plan(userTask, currentState, executionHistory) {
    const context = this.memoryManager.getContext();
    
    // Enhanced context analysis
    const recentActions = this.formatRecentActions(context.recentMessages);
    const proceduralHistory = this.formatProceduralSummaries(context.proceduralSummaries);
    const progressAnalysis = this.analyzeProgress(context, executionHistory);
    
    const plannerPrompt = `You are an intelligent MOBILE web automation planner. Analyze the current mobile page state and create a strategic plan to accomplish the user's task.

# USER TASK
"${userTask}"

# CURRENT MOBILE PAGE STATE
- URL: ${currentState.pageInfo?.url || 'unknown'}
- Title: ${currentState.pageInfo?.title || 'unknown'}  
- Domain: ${this.extractDomain(currentState.pageInfo?.url)}
- Interactive Elements: ${currentState.interactiveElements?.length || 0} available
- Platform: MOBILE BROWSER (touch interface, responsive design)

# AVAILABLE MOBILE ELEMENTS (All available)
${this.formatElements(currentState.interactiveElements || [])}

# EXECUTION PROGRESS
- Current Step: ${context.currentStep}
- Steps Completed: ${executionHistory.length}
${progressAnalysis}

# RECENT ACTIONS TAKEN
${recentActions}

# PROCEDURAL HISTORY
${proceduralHistory}

# EXECUTION HISTORY (Recent 5 steps)
${executionHistory.slice(-5).map((h, i) => `Step ${h.step}: ${h.success ? '✅' : '❌'} ${h.navigation || 'Unknown action'}`).join('\n') || 'No previous steps'}

# RESPONSE FORMAT (NO BACKTICKS OR MARKDOWN)
{
  "observation": "Current situation analysis including what has been accomplished",
  "done": false,
  "strategy": "High-level approach based on current progress and remaining tasks",
  "next_action": "Specific next action considering what was just completed",
  "reasoning": "Why this approach will work given the current context",
  "completion_criteria": "How to know when task is complete"
}

# CRITICAL RULES
- Set "done": true ONLY when the task is completely finished
- Consider what actions have already been taken (avoid repeating successful actions)
- Build on previous progress instead of starting over
- If the last action was typing text, next action should be clicking submit/search button
- If the last action was clicking search, next action should be waiting then finding results
- Use context to avoid getting stuck in loops
- Be specific about what action to take next based on current page state
- NEVER mark done until the final objective is achieved
- Learn from failed actions in execution history
- Progress logically through multi-step sequences`;

    try {
      const response = await this.llmService.call([
        { role: 'user', content: plannerPrompt }
      ], { maxTokens: 800 }, 'planner');
      
      const plan = JSON.parse(this.cleanJSONResponse(response));
      
      // Enhanced memory logging with context awareness
      this.memoryManager.addMessage({
        role: 'planner',
        action: 'plan',
        content: `Step ${context.currentStep}: ${plan.next_action || 'Plan created'}`
      });
      
      return plan;
    } catch (error) {
      console.error('Planner failed:', error);
      return this.getFallbackPlan(userTask, currentState, context);
    }
  }

  // New method to format recent actions for better context
  formatRecentActions(recentMessages) {
    if (!recentMessages || recentMessages.length === 0) {
      return 'No recent actions available';
    }
    
    return recentMessages.map(msg => {
      const stepInfo = msg.step ? `Step ${msg.step}` : 'Recent';
      const roleInfo = msg.role || 'unknown';
      const actionInfo = msg.action || 'action';
      const contentInfo = (msg.content || '').substring(0, 100);
      return `${stepInfo} (${roleInfo}): ${actionInfo} - ${contentInfo}`;
    }).join('\n');
  }

  // New method to format procedural summaries
  formatProceduralSummaries(proceduralSummaries) {
    if (!proceduralSummaries || proceduralSummaries.length === 0) {
      return 'No procedural history available';
    }
    
    return proceduralSummaries.map(summary => {
      const stepRange = summary.steps || 'Unknown steps';
      const actionChain = summary.actions || 'No actions';
      const findings = (summary.findings || '').substring(0, 150);
      return `Steps ${stepRange}: ${actionChain}\nFindings: ${findings}`;
    }).join('\n\n');
  }

  // New method to analyze progress and detect patterns
  analyzeProgress(context, executionHistory) {
    const analysis = [];
    
    // Detect if we're stuck in a loop
    const recentActions = executionHistory.slice(-5).map(h => h.navigation);
    const uniqueActions = new Set(recentActions);
    if (recentActions.length >= 3 && uniqueActions.size === 1) {
      analysis.push('⚠️ LOOP DETECTED: Same action repeated multiple times');
    }
    
    // Detect sequential patterns
    const lastAction = context.recentMessages[context.recentMessages.length - 1];
    if (lastAction) {
      if (lastAction.action === 'navigate' && lastAction.content?.includes('type')) {
        analysis.push('📝 SEQUENCE: Just typed text - should click submit/search next');
      } else if (lastAction.action === 'navigate' && lastAction.content?.includes('click')) {
        analysis.push('🖱️ SEQUENCE: Just clicked - should wait for page changes or find results');
      }
    }
    
    // Progress tracking
    const totalActions = context.currentStep;
    if (totalActions > 10) {
      analysis.push(`⏱️ PROGRESS: ${totalActions} actions taken - task may be complex`);
    }
    
    return analysis.join('\n') || 'No specific patterns detected';
  }

  // Enhanced fallback plan that uses context
  getFallbackPlan(userTask, currentState, context) {
    const domain = this.extractDomain(currentState.pageInfo?.url);
    const lastAction = context?.recentMessages?.[context.recentMessages.length - 1];
    
    let nextAction = "Examine available interactive elements and take appropriate action";
    let reasoning = "Need to understand the current page before proceeding";
    
    // Context-aware fallback logic
    if (lastAction) {
      if (lastAction.content?.includes('type') || lastAction.content?.includes('input')) {
        nextAction = "Look for and click submit or search button to proceed with the typed input";
        reasoning = "Previous action was typing text, so logical next step is to submit it";
      } else if (lastAction.content?.includes('click') && lastAction.content?.includes('search')) {
        nextAction = "Wait for search results to load, then look for relevant content to click";
        reasoning = "Previous action was clicking search, so next step is finding results";
      }
    }
    
    return {
      observation: `Currently on ${domain}. Step ${context?.currentStep || 0}. ${lastAction ? `Last action: ${lastAction.action}` : 'No previous actions'}. Need to continue task: ${userTask}`,
      done: false,
      strategy: "Build on previous progress and continue with logical next steps",
      next_action: nextAction,
      reasoning: reasoning,
      completion_criteria: "Task objectives met based on user requirements"
    };
  }

  extractDomain(url) {
    if (!url || typeof url !== 'string') return 'unknown';
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  formatElements(elements) {
    if (!elements || elements.length === 0) return "No interactive elements found.";
    
    return elements.map(el => {
      const text = (el.text || el.ariaLabel || '').substring(0, 50);
      const type = el.tagName?.toLowerCase() || 'element';
      return `[${el.index}] ${type}: "${text}"${text.length > 50 ? '...' : ''}`;
    }).join('\n');
  }

  cleanJSONResponse(response) {
    let cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').replace(/`/g, '');
    
    // Fix: Clean control characters from JSON strings
    cleaned = cleaned.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  }
}

// Enhanced UniversalNavigatorAgent that properly uses context
class UniversalNavigatorAgent {
  constructor(llmService, memoryManager, actionRegistry) {
    this.llmService = llmService;
    this.memoryManager = memoryManager;
    this.actionRegistry = actionRegistry;
  }

  async navigate(plan, currentState) {
    const context = this.memoryManager.getContext();
    
    // Enhanced context analysis for navigation
    const recentActions = this.formatRecentActions(context.recentMessages);
    const actionHistory = this.analyzeActionHistory(context, currentState);
    const sequenceGuidance = this.getSequenceGuidance(context.recentMessages);
    
    const navigatorPrompt = `You are a MOBILE web navigation specialist. Execute the planned action using available mobile page elements and actions.

# PLAN TO EXECUTE
Strategy: ${plan.strategy}
Next Action: ${plan.next_action}
Reasoning: ${plan.reasoning}

# CURRENT MOBILE PAGE STATE
URL: ${currentState.pageInfo?.url}
Title: ${currentState.pageInfo?.title}
Domain: ${this.extractDomain(currentState.pageInfo?.url)}
Platform: MOBILE BROWSER (touch interface, responsive design)

# EXECUTION CONTEXT
- Current Step: ${context.currentStep}
- Total Actions Taken: ${context.recentMessages.length}

# RECENT ACTIONS ANALYSIS
${recentActions}

# ACTION HISTORY ANALYSIS
${actionHistory}

# SEQUENCE GUIDANCE
${sequenceGuidance}

# AVAILABLE MOBILE ELEMENTS (All Interactive)
${this.formatElementsWithDetails(currentState.interactiveElements || [])}

# AVAILABLE ACTIONS
${this.formatAvailableActions()}

# RESPONSE FORMAT - JSON ONLY (NO BACKTICKS OR MARKDOWN)
{
  "thinking": "Analysis of current situation, recent actions, and planned next step",
  "action": {
    "name": "action_name",
    "parameters": {
      "index": 5,
      "text": "example text",
      "intent": "Clear description of what this action accomplishes and how it builds on previous actions"
    }
  }
}

# CRITICAL CONTEXT-AWARE RULES
- NEVER repeat the exact same action that just failed
- If you just typed text, you MUST click a submit/search button next (don't type again)
- If you just clicked search, look for results to appear before taking next action
- If you see an element was already clicked/used, choose a different approach
- Learn from failed attempts in recent actions
- Build on successful previous steps
- Use element indices that actually exist in the current page
- Always include descriptive "intent" explaining what the action accomplishes
- PERSIST through multi-step processes - don't give up early
- Consider what the last action accomplished when choosing the next action

# SEQUENTIAL LOGIC BASED ON RECENT ACTIONS
- After TYPING: Look for and click submit/search/enter buttons
- After CLICKING SEARCH: Wait briefly, then look for search results
- After NAVIGATION: Wait for page to load, then find relevant elements
- After FAILED ACTION: Try alternative approach or different element
- After SUCCESSFUL CLICK: Proceed to next logical step in the sequence

Only use elements that are actually present in the current page state above!`;

    try {
      const response = await this.llmService.call([
        { role: 'user', content: navigatorPrompt }
      ], { maxTokens: 800 }, 'navigator');
      
      const navResult = JSON.parse(this.cleanJSONResponse(response));
      
      // Validate the action with context awareness
      if (navResult.action && navResult.action.name) {
        const availableActions = this.actionRegistry.getAvailableActions();
        if (!availableActions[navResult.action.name]) {
          console.warn(`⚠️ Unknown action: ${navResult.action.name}`);
          return this.getFallbackNavigation(plan, currentState, context);
        }
        
        // Enhanced validation with context
        const validationResult = this.validateActionWithContext(navResult.action, currentState, context);
        if (!validationResult.isValid) {
          console.warn(`⚠️ Context validation failed: ${validationResult.reason}`);
          return this.getFallbackNavigation(plan, currentState, context);
        }
      }
      
      // Enhanced memory logging with context awareness
      this.memoryManager.addMessage({
        role: 'navigator',
        action: 'navigate',
        content: `Step ${context.currentStep}: ${navResult.action?.parameters?.intent || 'Navigation executed'}`
      });
      
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
    
    // Validate element index exists
    if (action.parameters?.index !== undefined) {
      const availableIndexes = (currentState.interactiveElements || []).map(el => el.index);
      if (!availableIndexes.includes(action.parameters.index)) {
        return {
          isValid: false,
          reason: `Element index ${action.parameters.index} not found. Available: ${availableIndexes.slice(0, 20).join(', ')}`
        };
      }
    }
    
    // Check for logical sequence violations
    if (lastAction && action.name === 'type') {
      if (lastAction.content?.includes('typed') || lastAction.content?.includes('input')) {
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
    
    return elements.slice(0, 30).map(el => {
      let description = `[${el.index}] ${el.tagName?.toLowerCase() || 'element'}`;
      
      if (el.elementType) description += ` (${el.elementType})`;
      
      const text = el.text || el.ariaLabel || '';
      if (text) description += `: "${text.substring(0, 60)}"${text.length > 60 ? '...' : ''}`;
      
      const attributes = [];
      if (el.isLoginElement) attributes.push('LOGIN');
      if (el.isPostElement) attributes.push('POST');
      if (attributes.length > 0) description += ` [${attributes.join(',')}]`;
      
      return description;
    }).join('\n');
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
          return text.includes('search') || text.includes('submit') || text.includes('go');
        });
        
        if (searchButtons.length > 0) {
          fallbackAction = {
            name: 'click',
            parameters: {
              index: searchButtons[0].index,
              intent: 'Click search button after typing text input'
            }
          };
        }
      } else if (actionContent.includes('failed')) {
        // Try a different approach if last action failed
        const availableElements = currentState.interactiveElements || [];
        if (availableElements.length > 0) {
          fallbackAction = {
            name: 'click',
            parameters: {
              index: availableElements[0].index,
              intent: 'Try different element after previous action failed'
            }
          };
        }
      }
    }
    
    return {
      thinking: `Context-aware fallback for ${domain}. Step ${context?.currentStep || 0}. ${lastAction ? `Last action: ${lastAction.action}` : 'No previous actions'}. Using context to determine best fallback approach.`,
      action: fallbackAction
    };
  }
}

// Universal Validator Agent
class UniversalValidatorAgent {
  constructor(llmService, memoryManager) {
    this.llmService = llmService;
    this.memoryManager = memoryManager;
  }

  async validate(originalTask, executionHistory, finalState) {
    const validatorPrompt = `You are a task completion validator. Determine if the original task has been successfully completed.

# ORIGINAL TASK
"${originalTask}"

# EXECUTION HISTORY
${executionHistory.map((h, i) => `Step ${i + 1}: ${h.navigation || 'action'} - ${h.success ? 'SUCCESS' : 'FAILED'}`).join('\n')}

# FINAL PAGE STATE
- URL: ${finalState.pageInfo?.url}
- Title: ${finalState.pageInfo?.title}
- Domain: ${this.extractDomain(finalState.pageInfo?.url)}
- Available Elements: ${finalState.interactiveElements?.length || 0}

# VISIBLE PAGE ELEMENTS (for context)
${this.formatElements(finalState.interactiveElements?.slice(0, 20) || [])}

# RESPONSE FORMAT (JSON only)
{
  "is_valid": true,
  "confidence": 0.8,
  "reason": "Detailed explanation of completion status",
  "evidence": "Specific evidence from page state or execution history",
  "recommendation": "Next steps if task incomplete, or confirmation if complete"
}

# EVALUATION CRITERIA
- Task completion should be based on objective evidence
- Consider both successful actions and current page state
- High confidence (0.8+) only for clear success indicators
- Medium confidence (0.5-0.7) for partial completion
- Low confidence (0.3-0.4) for unclear results`;

    try {
      const response = await this.llmService.call([
        { role: 'user', content: validatorPrompt }
      ], { maxTokens: 600 }, 'validator');
      
      const validation = JSON.parse(this.cleanJSONResponse(response));
      
      this.memoryManager.addMessage({
        role: 'validator',
        action: 'validate',
        content: validation.reason || 'Validation completed'
      });
      
      return validation;
    } catch (error) {
      console.error('Validator failed:', error);
      return {
        is_valid: executionHistory.some(h => h.success),
        confidence: 0.5,
        reason: "Validation failed, partial success based on execution history",
        evidence: "Validation service unavailable",
        recommendation: "Manual verification recommended"
      };
    }
  }

  extractDomain(url) {
    if (!url) return 'unknown';
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  formatElements(elements) {
    if (!elements || elements.length === 0) return "No elements found.";
    
    return elements.map(el => {
      const text = (el.text || el.ariaLabel || '').substring(0, 40);
      return `[${el.index}] ${el.tagName}: "${text}"`;
    }).join('\n');
  }

  cleanJSONResponse(response) {
    let cleaned = response.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').replace(/`/g, '');
    
    // Fix: Clean control characters from JSON strings
    cleaned = cleaned.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  }
}

// Browser Context Manager (keeping existing functionality)
class BrowserContextManager {
  constructor() {
    this.activeTabId = null;
  }

  async ensureTab(url) {
    try {
      const currentTab = await this.getCurrentActiveTab();
      
      if (!currentTab || this.isRestrictedPage(currentTab.url)) {
        console.log('Creating new tab for restricted page');
        const newTab = await chrome.tabs.create({ url: url, active: true });
        this.activeTabId = newTab.id;
        await this.waitForReady(newTab.id);
        return {
          success: true,
          extractedContent: `Navigated to ${url}`,
          includeInMemory: true
        };
      }

      console.log('Working with current tab:', currentTab.url);
      this.activeTabId = currentTab.id;
      
      return {
        success: true,
        extractedContent: `Working with current page: ${currentTab.url}`,
        includeInMemory: true
      };
      
    } catch (error) {
      console.error('Tab management error:', error);
      return {
        success: false,
        error: error.message,
        extractedContent: `Navigation error: ${error.message}`,
        includeInMemory: true
      };
    }
  }

  async waitForReady(tabId, timeout = 10000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkReady = () => {
        if (Date.now() - startTime > timeout) {
          resolve({ id: tabId, status: 'timeout' });
          return;
        }
        
        chrome.tabs.get(tabId, (tab) => {
          if (chrome.runtime.lastError || !tab) {
            setTimeout(checkReady, 500);
          } else if (tab.status === 'complete') {
            resolve(tab);
          } else {
            setTimeout(checkReady, 500);
          }
        });
      };
      
      checkReady();
    });
  }

  async getCurrentActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      return tabs[0];
    } catch (error) {
      return null;
    }
  }

  isRestrictedPage(url) {
    if (!url) return true;
    
    const restrictedPages = [
      'chrome-native://',
      'chrome-extension://',
      'chrome://',
      'about:',
      'moz-extension://'
    ];
    
    return restrictedPages.some(prefix => url.startsWith(prefix));
  }

  async closeExcessTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      if (tabs.length > 5) {
        for (let i = 5; i < tabs.length; i++) {
          try {
            await chrome.tabs.remove(tabs[i].id);
          } catch (e) {
            // Ignore errors
          }
        }
      }
    } catch (error) {
      console.log('Could not close excess tabs:', error);
    }
  }
}

// Fix for the URL validation issues
function fixUrlValidation() {
  // Add null checks to prevent the TypeError
  const originalMethods = {
    checkBasicLoginStatus: function(url) {
      if (!url || typeof url !== 'string') return false;
      return !url.includes('/login') && !url.includes('/signin');
    },
    
    determinePageType: function(url) {
      if (!url || typeof url !== 'string') return 'general';
      if (url.includes('/compose') || url.includes('/intent/tweet')) return 'compose';
      if (url.includes('/home') || url.includes('/timeline')) return 'home';
      if (url.includes('/login') || url.includes('/signin')) return 'login';
      if (url.includes('/profile') || url.includes('/user/')) return 'profile';
      return 'general';
    },
    
    detectPlatform: function(url) {
      if (!url || typeof url !== 'string') return 'unknown';
      const lowerUrl = url.toLowerCase();
      
      if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'twitter';
      if (lowerUrl.includes('linkedin.com')) return 'linkedin';
      if (lowerUrl.includes('facebook.com')) return 'facebook';
      if (lowerUrl.includes('instagram.com')) return 'instagram';
      if (lowerUrl.includes('youtube.com')) return 'youtube';
      if (lowerUrl.includes('tiktok.com')) return 'tiktok';
      
      return 'unknown';
    }
  };
  
  return originalMethods;
}

// Universal Multi-Agent Executor - Using Wootz APIs
class UniversalMultiAgentExecutor {
  constructor(llmService) {
    this.llmService = llmService;
    this.memoryManager = new ProceduralMemoryManager();
    this.browserContext = new BrowserContextManager();
    this.actionRegistry = new UniversalActionRegistry(this.browserContext);
    
    this.planner = new UniversalPlannerAgent(this.llmService, this.memoryManager);
    this.navigator = new UniversalNavigatorAgent(this.llmService, this.memoryManager, this.actionRegistry);
    this.validator = new UniversalValidatorAgent(this.llmService, this.memoryManager);
    
    // Fixed helper methods
    const helpers = fixUrlValidation();
    this.checkBasicLoginStatus = helpers.checkBasicLoginStatus;
    this.determinePageType = helpers.determinePageType;
    this.detectPlatform = helpers.detectPlatform;
    
    this.maxSteps = 15;
    this.executionHistory = [];
    this.currentStep = 0;
    this.cancelled = false;
  }

  async execute(userTask, connectionManager, initialPlan = null) {
    this.currentStep = 0;
    this.executionHistory = [];
    this.cancelled = false;
    
    try {
      let taskCompleted = false;
      let finalResult = null;

      console.log(`🚀 Universal Multi-agent execution: ${userTask}`);
      connectionManager.broadcast({
        type: 'task_start',
        message: `🚀 Starting universal task: ${userTask}`
      });

      while (!taskCompleted && this.currentStep < this.maxSteps && !this.cancelled) {
        this.currentStep++;
        
        console.log(`🔄 Step ${this.currentStep}/${this.maxSteps}`);
        connectionManager.broadcast({
          type: 'status_update',
          message: `🔄 Step ${this.currentStep}/${this.maxSteps}: Analyzing page...`
        });

        if (this.cancelled) {
          finalResult = {
            success: false,
            response: '🛑 Task cancelled by user',
            message: 'Task cancelled',
            steps: this.currentStep
          };
          break;
        }

        // 1. Get current state using Wootz API
        const currentState = await this.getCurrentState();
        
        // 2. Planner Agent - use initial plan if provided and it's the first step
        let plan;
        if (initialPlan && this.currentStep === 1) {
          console.log('🎯 Using intelligent initial plan from single API call');
          plan = initialPlan;
        } else {
          connectionManager.broadcast({
            type: 'status_update',
            message: `🧠 Planning: Analyzing ${currentState.pageInfo?.domain || 'page'}...`
          });

          plan = await this.planner.plan(userTask, currentState, this.executionHistory);
        }
        
        console.log(`Step ${this.currentStep} Plan:`, plan);

        if (plan.done) {
          taskCompleted = true;
          finalResult = {
            success: true,
            response: plan.observation,
            message: 'Task completed during planning',
            steps: this.currentStep
          };
          break;
        }

        // 3. Navigator Agent
        connectionManager.broadcast({
          type: 'status_update',
          message: `🧭 Executing: ${plan.next_action}...`
        });

        const navigation = await this.navigator.navigate(plan, currentState);
        console.log(`Step ${this.currentStep} Navigation:`, navigation);

        // 4. Action Execution
        if (navigation.action) {
          connectionManager.broadcast({
            type: 'status_update',
            message: `⚡ ${navigation.action.parameters?.intent || 'Performing action'}...`
          });

          const actionResult = await this.executeAction(navigation.action, connectionManager);
          
          this.executionHistory.push({
            step: this.currentStep,
            plan: plan.next_action,
            navigation: navigation.action.parameters?.intent,
            results: [actionResult],
            success: actionResult.success
          });

          // Check if done
          if (actionResult.result?.isDone) {
            taskCompleted = true;
            
            connectionManager.broadcast({
              type: 'status_update',
              message: `✅ Validating completion...`
            });

            const finalState = await this.getCurrentState();
            const validation = await this.validator.validate(userTask, this.executionHistory, finalState);

            finalResult = {
              success: validation.is_valid,
              response: validation.reason,
              message: validation.reason,
              steps: this.currentStep,
              confidence: validation.confidence
            };
            break;
          }
        }

        await this.delay(2000);
      }

      if (this.cancelled) {
        connectionManager.broadcast({
          type: 'task_cancelled',
          result: finalResult
        });
      } else if (!taskCompleted) {
        finalResult = {
          success: false,
          response: `❌ Task not completed within ${this.maxSteps} steps.`,
          message: 'Task execution timeout',
          steps: this.currentStep
        };
        
        connectionManager.broadcast({
          type: 'task_complete',
          result: finalResult
        });
      } else {
        connectionManager.broadcast({
          type: 'task_complete',
          result: finalResult
        });
      }

      return finalResult;

    } catch (error) {
      console.error('❌ Universal multi-agent execution error:', error);
      const errorResult = {
        success: false,
        response: `❌ Execution error: ${error.message}`,
        message: error.message,
        steps: this.currentStep
      };

      connectionManager.broadcast({
        type: 'task_error',
        result: errorResult
      });

      return errorResult;
    }
  }

  async getCurrentState() {
    try {
      console.log('📊 Getting page state via Wootz API');

      const config = await chrome.storage.sync.get('agentConfig');
      const debugMode = config?.agentConfig?.debugMode || false;
      console.log('🔍 Debug mode:', debugMode);
      
      return new Promise((resolve) => {
        chrome.wootz.getPageState({
          debugMode: debugMode,
          includeHidden: true
        }, (result) => {
          if (result.success && result.pageState) {
            const pageState = result.pageState;
            
            // Add debugging to see the actual structure
            console.log('🔍 Raw Wootz pageState:', pageState);
            console.log('🔍 Raw elements array:', pageState.elements);
            
            // Fix: Parse the nested JSON structure correctly
            let elements = [];
            let parsedPageData = null;
            
            try {
              // The actual data is in pageState.state.page_data as a JSON string
              if (pageState.state && pageState.state.page_data) {
                console.log('🔍 Raw page_data:', pageState.state.page_data);
                parsedPageData = JSON.parse(pageState.state.page_data);
                elements = parsedPageData.elements || [];
                console.log('🔍 Parsed elements array:', elements);
              } else {
                console.log('📊 No page_data found in state');
                elements = pageState.elements || [];
              }
            } catch (parseError) {
              console.error('🔍 Failed to parse page_data JSON:', parseError);
              elements = pageState.elements || [];
            }
            
            console.log(`🔍 Found ${elements.length} raw elements from Wootz`);
            
            // Extract URL and title from parsed data or fallback to pageState
            const url = parsedPageData?.url || pageState.url || 'unknown';
            const title = parsedPageData?.title || pageState.title || 'Unknown Page';
            
            const processedState = {
              pageInfo: {
                url: url,
                title: title,
                domain: this.extractDomain(url)
              },
              pageContext: { 
                platform: this.detectPlatform(url),
                pageType: this.determinePageType(url)
              },
              loginStatus: { 
                isLoggedIn: this.checkBasicLoginStatus(url)
              },
              interactiveElements: this.processElementsFromWootz(elements),
              viewportInfo: {},
              extractedContent: `Wootz page state: ${elements.length} elements`
            };
            
            console.log(`📊 Wootz State: Found ${processedState.interactiveElements.length} interactive elements`);
            resolve(processedState);
          } else {
            console.log('📊 Wootz State: Failed, using fallback');
            console.log('🔍 Failed result:', result);
            resolve(this.getDefaultState());
          }
        });
      });
      
    } catch (error) {
      console.log('Could not get Wootz page state:', error);
      return this.getDefaultState();
    }
  }

  extractDomain(url) {
    if (!url || typeof url !== 'string') return 'unknown';
    try {
      return new URL(url).hostname;
    } catch {
      return 'unknown';
    }
  }

  // Fixed element processing for Wootz API
  processElementsFromWootz(elements) {
    if (!elements || !Array.isArray(elements)) {
      console.log('🔍 Elements not array or null:', elements);
      return [];
    }
    
    console.log(`🔍 Processing ${elements.length} raw elements from Wootz`);
    
    // Process ALL elements - no filtering since Wootz API already sends only interactive elements
    const processed = elements.map((el, arrayIndex) => {
      return {
        index: el.index !== undefined ? el.index : arrayIndex,
        arrayIndex: arrayIndex,
        tagName: el.tagName || 'UNKNOWN',
        text: el.textContent || el.text || el.innerText || '',
        ariaLabel: el.ariaLabel || el.label || '',
        elementType: this.categorizeElementType(el),
        isLoginElement: this.isLoginRelatedElement(el),
        isPostElement: this.isPostRelatedElement(el),
        isVisible: el.isVisible !== false,
        bounds: el.bounds || el.rect || {},
        selector: el.selector || this.generateSimpleSelector(el),
        originalElement: el
      };
    });
    
    console.log(`📊 Processed ${processed.length} elements successfully`);
    return processed;
  }

  categorizeElementType(element) {
    const tagName = (element.tagName || '').toLowerCase();
    const type = (element.type || '').toLowerCase();
    
    if (tagName === 'button') return 'button';
    if (tagName === 'input') return type || 'input';
    if (tagName === 'textarea') return 'textarea';
    if (tagName === 'a') return 'link';
    if (element.contentEditable === 'true') return 'contenteditable';
    return 'other';
  }

  isLoginRelatedElement(element) {
    const text = ((element.textContent || element.text || '') + ' ' + (element.ariaLabel || '')).toLowerCase();
    const loginKeywords = ['login', 'sign in', 'email', 'password', 'username'];
    return loginKeywords.some(keyword => text.includes(keyword));
  }

  isPostRelatedElement(element) {
    const text = ((element.textContent || element.text || '') + ' ' + (element.ariaLabel || '')).toLowerCase();
    const postKeywords = ['tweet', 'post', 'share', 'publish', 'compose'];
    return postKeywords.some(keyword => text.includes(keyword));
  }

  generateSimpleSelector(element) {
    if (element.attributes) {
      if (element.attributes.id) return `#${element.attributes.id}`;
      if (element.attributes['data-testid']) return `[data-testid="${element.attributes['data-testid']}"]`;
    }
    return (element.tagName || 'div').toLowerCase();
  }

  getDefaultState() {
    return {
      pageInfo: { 
        url: 'unknown', 
        title: 'Unknown Page',
        domain: 'unknown'
      },
      pageContext: { 
        platform: 'unknown', 
        pageType: 'unknown' 
      },
      loginStatus: { 
        isLoggedIn: false 
      },
      interactiveElements: [],
      viewportInfo: {},
      extractedContent: 'No content available'
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeAction(action, connectionManager) {
    try {
      connectionManager.broadcast({
        type: 'status_update',
        message: `🎯 ${action.parameters?.intent || `Executing ${action.name}`}...`
      });
      
      if (this.cancelled) {
        console.log('🛑 Action cancelled');
        return { success: false, error: 'Action cancelled' };
      }
      
      const result = await this.actionRegistry.executeAction(action.name, action.parameters);
      
      console.log(`${result.success ? '✅' : '❌'} ${action.name}: ${result.extractedContent?.substring(0, 50)}...`);
      
      if (action.name === 'navigate' && result.success) {
        await this.delay(4000); // Wait for page load
      } else {
        await this.delay(1000); // Standard delay between actions
      }
      
      return {
        action: action.name,
        input: action.parameters,
        result: result,
        success: result.success !== false
      };
      
    } catch (error) {
      console.error(`❌ Action error: ${action.name}`, error);
      return {
        action: action.name,
        input: action.parameters,
        result: { success: false, error: error.message },
        success: false
      };
    }
  }

  cancel() {
    console.log('🛑 Cancelling universal multi-agent execution');
    this.cancelled = true;
  }
}

// Enhanced LLM Service (keeping existing implementation)
class RobustMultiLLM {
  constructor(config = {}) {
    this.config = config;
    console.log('🤖 Universal LLM Service initialized with provider:', this.config.aiProvider || 'anthropic');
  }

  getModelName(provider, agentType = 'navigator') {
    const configuredModel = agentType === 'navigator' ? this.config.navigatorModel : 
                           agentType === 'planner' ? this.config.plannerModel :
                           agentType === 'validator' ? this.config.validatorModel : null;

    if (configuredModel && this.isModelValidForProvider(configuredModel, provider)) {
      return configuredModel;
    }

    const defaultModels = {
      'anthropic': {
        'navigator': 'claude-3-5-sonnet-20241022',
        'planner': 'claude-3-5-sonnet-20241022',
        'validator': 'claude-3-haiku-20240307'
      },
      'openai': {
        'navigator': 'gpt-4o',
        'planner': 'gpt-4o',
        'validator': 'gpt-4o-mini'
      },
      'gemini': {
        'navigator': 'gemini-1.5-pro',
        'planner': 'gemini-1.5-pro',
        'validator': 'gemini-1.5-flash'
      }
    };
    
    return defaultModels[provider]?.[agentType] || defaultModels[provider]?.['navigator'] || 'gemini-1.5-pro';
  }

  isModelValidForProvider(model, provider) {
    const modelProviderMap = {
      'claude-3-5-sonnet-20241022': 'anthropic',
      'claude-3-sonnet-20240229': 'anthropic', 
      'claude-3-haiku-20240307': 'anthropic',
      'claude-3-opus-20240229': 'anthropic',
      'gpt-4o': 'openai',
      'gpt-4o-mini': 'openai',
      'gpt-4-turbo': 'openai',
      'gpt-4': 'openai',
      'gpt-3.5-turbo': 'openai',
      'gemini-1.5-pro': 'gemini',
      'gemini-1.5-flash': 'gemini',
      'gemini-pro': 'gemini'
    };
    
    return modelProviderMap[model] === provider;
  }

  async call(messages, options = {}, agentType = 'navigator') {
    const provider = this.config.aiProvider || 'anthropic';
    const modelName = this.getModelName(provider, agentType);
    
    console.log(`🎯 DEBUG: Provider=${provider}, AgentType=${agentType}, ModelName=${modelName}`);
    
    console.log(`🤖 ${agentType} using ${provider} model: ${modelName}`);
    
    const hasApiKey = this.checkApiKey(provider);
    if (!hasApiKey) {
      throw new Error(`${provider} API key not configured. Please add your API key in settings.`);
    }
    
    try {
      return await this.callProvider(provider, messages, { ...options, model: modelName });
    } catch (error) {
      console.error(`❌ ${provider} failed:`, error);
      throw error;
    }
  }

  checkApiKey(provider) {
    switch (provider) {
      case 'anthropic':
        return !!this.config.anthropicApiKey;
      case 'openai':
        return !!this.config.openaiApiKey;
      case 'gemini':
        return !!this.config.geminiApiKey;
      default:
        return false;
    }
  }

  async callProvider(provider, messages, options) {
    switch (provider) {
      case 'anthropic':
        return await this.callAnthropic(messages, options);
      case 'openai':
        return await this.callOpenAI(messages, options);
      case 'gemini':
        return await this.callGemini(messages, options);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async callAnthropic(messages, options = {}) {
    if (!this.config.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const model = options.model || 'claude-3-5-sonnet-20241022';
    console.log(`🔥 Calling Anthropic with model: ${model}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.3,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callOpenAI(messages, options = {}) {
    if (!this.config.openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const model = options.model || 'gpt-4o';
    console.log(`🔥 Calling OpenAI with model: ${model}`);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.openaiApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callGemini(messages, options = {}) {
    if (!this.config.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const model = options.model || 'gemini-1.5-pro';
    console.log(`🔥 Calling Gemini with model: ${model}`);

    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const requestBody = {
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.3
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.geminiApiKey}`, 
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  }
}

// Persistent Connection Manager (keeping existing)
class PersistentConnectionManager {
  constructor(backgroundTaskManager) {
    this.connections = new Map();
    this.messageQueue = [];
    this.backgroundTaskManager = backgroundTaskManager;
    this.activeTask = null;
    this.lastSentMessageId = new Map();
    this.currentSessionId = null; // Track current session
  }

  addConnection(connectionId, port) {
    console.log(`🔗 Adding connection: ${connectionId}`);
    
    // Ensure we have a current session
    if (!this.currentSessionId) {
      this.currentSessionId = Date.now().toString();
      console.log(`🆕 Auto-created new session: ${this.currentSessionId}`);
    }
    
    this.connections.set(connectionId, {
      port: port,
      connected: true,
      lastActivity: Date.now(),
      sessionId: this.currentSessionId
    });

    // ONLY send messages from current session that haven't been sent to this specific connection
    const lastSentId = this.lastSentMessageId.get(connectionId) || 0;
    const newMessages = this.messageQueue.filter(msg => 
      msg.id > lastSentId && 
      msg.sessionId === this.currentSessionId && // Only current session messages
      (msg.type === 'status_update' || 
       msg.type === 'task_start' || 
       msg.type === 'task_complete' || 
       msg.type === 'task_error' ||
       msg.type === 'task_cancelled')
    );

    // IMPORTANT: Only send messages if there's an active task in this session
    const executionState = chrome.storage.local.get(['isExecuting', 'activeTaskId', 'sessionId']);
    executionState.then(state => {
      if (state.isExecuting && state.sessionId === this.currentSessionId && newMessages.length > 0) {
        console.log(`📤 Sending ${newMessages.length} active session messages to ${connectionId}`);
        newMessages.forEach(message => {
          this.safePortMessage(port, message);
        });
        
        const latestMessageId = Math.max(...newMessages.map(msg => msg.id));
        this.lastSentMessageId.set(connectionId, latestMessageId);
      } else {
        console.log(`📝 No active task or messages for connection ${connectionId}`);
      }

      // Send current execution state from storage
      if (state.isExecuting && state.sessionId === this.currentSessionId) {
        this.safePortMessage(port, {
          type: 'execution_state',
          isExecuting: true,
          activeTaskId: state.activeTaskId,
          sessionId: this.currentSessionId
        });
      }
    });
  }

  removeConnection(connectionId) {
    console.log(`🔌 Removing connection: ${connectionId}`);
    this.connections.delete(connectionId);
    // Keep the lastSentMessageId for potential reconnection within same session
  }

  broadcast(message) {
    // Add unique ID and session ID to message
    message.id = Date.now() + Math.random();
    message.sessionId = this.currentSessionId;
    
    let messageSent = false;
    
    this.connections.forEach((connection, connectionId) => {
      if (connection.connected && this.safePortMessage(connection.port, message)) {
        messageSent = true;
        this.lastSentMessageId.set(connectionId, message.id);
      }
    });

    // Add to queue for future connections (only current session)
    this.messageQueue.push(message);
    
    // Keep only last 20 messages to prevent memory issues
    if (this.messageQueue.length > 20) {
      this.messageQueue = this.messageQueue.slice(-20);
    }

    if (!messageSent) {
      console.log('📦 Queued for background persistence:', message.type);
    }
  }

  // Start new session (called when new chat is created)
  startNewSession() {
    this.currentSessionId = Date.now().toString();
    console.log(`🆕 Starting new session: ${this.currentSessionId}`);
    
    // Clear old messages from different sessions
    this.messageQueue = this.messageQueue.filter(msg => 
      msg.sessionId === this.currentSessionId
    );
    
    // Clear last sent message tracking for new session
    this.lastSentMessageId.clear();
    
    return this.currentSessionId;
  }

  // Get current session ID
  getCurrentSession() {
    if (!this.currentSessionId) {
      this.currentSessionId = Date.now().toString();
    }
    return this.currentSessionId;
  }

  // Clear all messages (for new chat)
  clearMessages() {
    console.log('🧹 Clearing all messages for new chat');
    this.messageQueue = []; // Clear ALL messages
    this.lastSentMessageId.clear(); // Clear all tracking
    this.startNewSession();
  }

  safePortMessage(port, message) {
    try {
      if (port && typeof port.postMessage === 'function') {
        port.postMessage(message);
        return true;
      }
    } catch (error) {
      console.error('Port message failed:', error);
      return false;
    }
    return false;
  }

  setActiveTask(taskId) {
    this.activeTask = taskId;
  }

  getActiveTask() {
    return this.activeTask;
  }
}

// Main Background Script Agent (keeping most existing functionality)
class BackgroundScriptAgent {
  constructor() {
    this.backgroundTaskManager = new BackgroundTaskManager();
    this.connectionManager = new PersistentConnectionManager(this.backgroundTaskManager);
    this.activeTasks = new Map();
    this.llmService = null;
    this.multiAgentExecutor = null;
    this.taskRouter = null;
    this.currentConfig = null; // Track current config
    
    this.setupMessageHandlers();
    this.setupConfigWatcher(); // Add config watcher
    console.log('✅ Universal BackgroundScriptAgent initialized with Wootz API integration');
  }

  // Add config watcher to detect changes
  setupConfigWatcher() {
    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.agentConfig) {
        console.log('🔄 Config changed, reinitializing services...');
        const newConfig = changes.agentConfig.newValue;
        this.reinitializeServices(newConfig);
      }
    });
  }

  // Reinitialize services when config changes
  async reinitializeServices(newConfig = null) {
    try {
      if (!newConfig) {
        newConfig = await this.getConfig();
      }
      
      // Only reinitialize if config actually changed
      if (JSON.stringify(this.currentConfig) !== JSON.stringify(newConfig)) {
        console.log('🔄 Reinitializing LLM services with new config');
        console.log('📝 New provider:', newConfig.aiProvider);
        
        this.currentConfig = newConfig;
        this.llmService = new RobustMultiLLM(newConfig);
        this.multiAgentExecutor = new UniversalMultiAgentExecutor(this.llmService);
        this.taskRouter = new AITaskRouter(this.llmService);
        
        // Broadcast config update to all connected clients
        this.connectionManager.broadcast({
          type: 'config_updated',
          provider: newConfig.aiProvider,
          hasValidKey: this.hasValidApiKey(newConfig)
        });
        
        console.log('✅ Services reinitialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to reinitialize services:', error);
    }
  }

  // Check if current provider has valid API key
  hasValidApiKey(config) {
    switch (config.aiProvider) {
      case 'anthropic':
        return !!config.anthropicApiKey;
      case 'openai':
        return !!config.openaiApiKey;
      case 'gemini':
        return !!config.geminiApiKey;
      default:
        return false;
    }
  }

  setupMessageHandlers() {
    chrome.runtime.onConnect.addListener((port) => {
      if (port.name === 'popup-connection') {
        const connectionId = Date.now().toString();
        console.log('Background script connected:', connectionId);
        
        this.connectionManager.addConnection(connectionId, port);
        
        port.onMessage.addListener(async (message) => {
          try {
            await this.handlePortMessage(message, port, connectionId);
          } catch (error) {
            console.error('Message handling error:', error);
            this.connectionManager.safePortMessage(port, {
              type: 'error',
              error: error.message
            });
          }
        });

        port.onDisconnect.addListener(() => {
          console.log('Background script disconnected:', connectionId);
          this.connectionManager.removeConnection(connectionId);
        });

        setTimeout(() => {
          this.connectionManager.safePortMessage(port, {
            type: 'connected',
            connectionId: connectionId,
            activeTask: this.connectionManager.getActiveTask()
          });
        }, 100);
      }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
  }

  async handlePortMessage(message, port, connectionId) {
    const { type } = message;
    console.log('Handling:', type, 'from:', connectionId);

    switch (type) {
      case 'new_task':
        const taskId = Date.now().toString();
        this.activeTasks.set(taskId, { 
          task: message.task, 
          connectionId: connectionId,
          startTime: Date.now(),
          sessionId: this.connectionManager.getCurrentSession()
        });
        
        this.connectionManager.setActiveTask(taskId);
        
        // Store execution state in chrome.storage.local
        await chrome.storage.local.set({
          isExecuting: true,
          activeTaskId: taskId,
          taskStartTime: Date.now(),
          sessionId: this.connectionManager.getCurrentSession()
        });
        
        await this.executeTaskWithBackgroundManager(message.task, taskId);
        break;

      case 'cancel_task':
        console.log('🛑 Received cancel_task request');
        const activeTaskId = this.connectionManager.getActiveTask();
        if (activeTaskId) {
          const cancelled = this.backgroundTaskManager.cancelTask(activeTaskId);
          this.activeTasks.delete(activeTaskId);
          this.connectionManager.setActiveTask(null);
          
          // Clear execution state from storage
          await chrome.storage.local.set({
            isExecuting: false,
            activeTaskId: null,
            taskStartTime: null,
            sessionId: null
          });
          
          this.connectionManager.broadcast({
            type: 'task_cancelled',
            message: 'Task cancelled by user',
            cancelled: cancelled
          });
          
          console.log(`✅ Task ${activeTaskId} cancelled: ${cancelled}`);
        } else {
          console.log('⚠️ No active task to cancel');
        }
        break;

      case 'new_chat':
        console.log('🆕 Received new_chat request');
        
        // Cancel any running tasks
        const currentActiveTask = this.connectionManager.getActiveTask();
        if (currentActiveTask) {
          this.backgroundTaskManager.cancelTask(currentActiveTask);
          this.activeTasks.delete(currentActiveTask);
        }
        
        // Clear execution state completely (but preserve config)
        await chrome.storage.local.clear(); // Only clear local storage
        // DON'T clear sync storage as it contains user config
        
        // Clear messages and start new session
        this.connectionManager.clearMessages();
        
        // Reset connection manager state
        this.connectionManager.setActiveTask(null);
        
        // Notify frontend that chat has been cleared
        this.connectionManager.safePortMessage(port, {
          type: 'chat_cleared',
          sessionId: this.connectionManager.getCurrentSession()
        });
        
        console.log(`✅ New chat started with session: ${this.connectionManager.getCurrentSession()}`);
        break;

      case 'get_status':
        const status = await this.getAgentStatus();
        
        // Also send execution state from storage
        const executionState = await chrome.storage.local.get(['isExecuting', 'activeTaskId', 'sessionId']);
        
        this.connectionManager.safePortMessage(port, {
          type: 'status_response',
          status: status,
          isExecuting: executionState.isExecuting || false,
          activeTaskId: executionState.activeTaskId || null,
          sessionId: executionState.sessionId || this.connectionManager.getCurrentSession()
        });
        break;

      default:
        this.connectionManager.safePortMessage(port, {
          type: 'error',
          error: `Unknown message type: ${type}`
        });
    }
  }

  async executeTaskWithBackgroundManager(task, taskId) {
    try {
      console.log('🚀 Executing universal task with single AI call:', task, 'ID:', taskId);
      
      // Always get fresh config and reinitialize if needed
      const config = await this.getConfig();
      await this.reinitializeServices(config);
      
      // Ensure services are initialized
      if (!this.llmService) {
        throw new Error('LLM service not properly initialized. Please check your API key configuration.');
      }

      const currentContext = await this.getCurrentPageContext();
      
      console.log('🧠 Making single intelligent routing call...');
      const intelligentResult = await this.taskRouter.analyzeAndRoute(task, currentContext);
      
      console.log('🎯 Intelligent result:', intelligentResult);

      if (intelligentResult.intent === 'CHAT') {
        const result = {
          success: true,
          response: intelligentResult.response.message,
          message: intelligentResult.response.message,
          confidence: intelligentResult.confidence,
          isMarkdown: intelligentResult.response.isMarkdown || true
        };
        
        this.connectionManager.broadcast({
          type: 'task_complete',
          result: result,
          taskId: taskId
        });
        
        this.activeTasks.delete(taskId);
        this.connectionManager.setActiveTask(null);
        
        // Clear execution state from storage
        await chrome.storage.local.set({
          isExecuting: false,
          activeTaskId: null,
          taskStartTime: null
        });
        
        return;
      }
      
      if (intelligentResult.intent === 'WEB_AUTOMATION') {
        console.log('🤖 Starting web automation with intelligent plan...');
        
        const initialPlan = {
          observation: intelligentResult.response.observation,
          done: intelligentResult.response.done || false,
          strategy: intelligentResult.response.strategy,
          next_action: intelligentResult.response.next_action,
          reasoning: intelligentResult.response.reasoning,
          completion_criteria: intelligentResult.response.completion_criteria
        };

        await this.backgroundTaskManager.startTask(
          taskId, 
          { task, initialPlan },
          this.multiAgentExecutor, 
          this.connectionManager
        );
        return;
      }

      throw new Error(`Unknown intent: ${intelligentResult.intent}`);
      
    } catch (error) {
      console.error('Intelligent task execution error:', error);
      
      // Clear execution state from storage on error
      await chrome.storage.local.set({
        isExecuting: false,
        activeTaskId: null,
        taskStartTime: null,
        sessionId: null
      });
      
      // Show the ACTUAL error to the user, not a generic message
      let userFriendlyError = this.formatErrorForUser(error);
      
      this.connectionManager.broadcast({
        type: 'task_error',
        error: userFriendlyError,
        taskId: taskId,
        originalError: error.message
      });
      
      this.activeTasks.delete(taskId);
      this.connectionManager.setActiveTask(null);
    }
  }

  // Add better error formatting
  formatErrorForUser(error) {
    const errorMessage = error.message || 'Unknown error';
    
    // Handle API-specific errors with more detail
    if (errorMessage.includes('429')) {
      return `⚠️ Rate limit exceeded. Please wait a moment and try again.\nDetails: ${errorMessage}`;
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
      return `🚫 AI service temporarily unavailable. Please try again in a few minutes.\nDetails: ${errorMessage}`;
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('authentication') || errorMessage.includes('API key')) {
      return `🔑 Authentication failed. Please check your API key in settings.\nDetails: ${errorMessage}`;
    }
    
    if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      return `🚫 Access denied. Please check your API key permissions.\nDetails: ${errorMessage}`;
    }
    
    if (errorMessage.includes('400') || errorMessage.includes('invalid')) {
      return `❌ Invalid request. Please try rephrasing your task.\nDetails: ${errorMessage}`;
    }
    
    // For any other error, show the actual error message
    return `❌ Error: ${errorMessage}`;
  }

  async handleSimpleChat(task) {
    try {
      const response = await this.llmService.call([
        { 
          role: 'user', 
          content: `You are a helpful AI assistant specializing in universal web automation. Respond to: "${task}"` 
        }
      ], { maxTokens: 300 });

      return {
        success: true,
        response: response,
        message: response
      };
    } catch (error) {
      return {
        success: true,
        response: `I understand you said: "${task}"\n\nI'm your universal AI web automation assistant! I can help with any website - YouTube, social media, shopping, research, and more. What would you like me to help you with?`,
        message: 'Fallback chat response'
      };
    }
  }

  async getConfig() {
    const result = await chrome.storage.sync.get(['agentConfig']);
    return result.agentConfig || {};
  }

  async handleMessage(request, sender, sendResponse) {
    try {
      switch (request.action) {
        case 'AGENT_STATUS':
          const status = await this.getAgentStatus();
          sendResponse(status);
          break;

        case 'UPDATE_CONFIG':
          const configResult = await this.updateConfig(request.config);
          sendResponse(configResult);
          break;

        default:
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      sendResponse({ success: false, error: error.message });
    }
  }

  async getAgentStatus() {
    const config = await this.getConfig();
    return {
      isRunning: true,
      hasAgent: true,
      activeTasks: this.activeTasks.size,
      backgroundTasks: this.backgroundTaskManager.getAllRunningTasks().length,
      completedTasks: this.backgroundTaskManager.getAllCompletedTasks().length,
      activeTask: this.connectionManager.getActiveTask(),
      connections: this.connectionManager.connections.size,
      backgroundPersistence: true,
      multiAgentSystem: true,
      universalAutomation: true,
      wootzApiIntegration: true,
      supportedSites: 'Universal - any website',
      config: {
        hasAnthropicKey: !!config.anthropicApiKey,
        hasOpenAIKey: !!config.openaiApiKey,
        hasGeminiKey: !!config.geminiApiKey,
        aiProvider: config.aiProvider || 'anthropic'
      }
    };
  }

  async updateConfig(config) {
    try {
      // Save to sync storage
      await chrome.storage.sync.set({ agentConfig: config });
      
      // Immediately reinitialize services
      await this.reinitializeServices(config);
      
      return { success: true, message: 'Configuration updated and applied' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Add helper method to get current page context
  async getCurrentPageContext() {
    try {
      // Get basic page info for context
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const currentTab = tabs[0];

      return {
        url: currentTab?.url || 'unknown',
        title: currentTab?.title || 'Unknown Page',
        elementsCount: 0 // Will be populated by actual page state later
      };
    } catch (error) {
      return {
        url: 'unknown',
        title: 'Unknown Page', 
        elementsCount: 0
      };
    }
  }
}

// Optimized AI Task Router - Single API Call for Classification + Response
class AITaskRouter {
  constructor(llmService) {
    this.llmService = llmService;
  }

  async analyzeAndRoute(userMessage, currentContext = {}) {
    // Store userMessage for use in fallback methods.
    this.userMessage = userMessage;
    
    try {
      const intelligentPrompt = `You are an intelligent AI assistant that specializes in mobile web automation and conversation.

# USER MESSAGE
"${userMessage}"

# CURRENT CONTEXT
- Current URL: ${currentContext.url || 'unknown'}
- Page Elements: ${currentContext.elementsCount || 0} interactive elements available
- Platform: MOBILE BROWSER (mobile-optimized interfaces)

# RESPONSE FORMAT
Use this EXACT format with special delimiters to avoid JSON parsing issues:

===CLASSIFICATION_START===
INTENT: CHAT|WEB_AUTOMATION
CONFIDENCE: 0.0-1.0
REASONING: Brief explanation of classification
===CLASSIFICATION_END===

===RESPONSE_START===
For CHAT intent - provide markdown formatted response:
Your helpful response here with **bold**, *italic*, \`code\`, etc.

For WEB_AUTOMATION intent - provide JSON:
{
  "observation": "Current situation analysis",
  "done": false,
  "strategy": "High-level mobile-optimized approach",
  "next_action": "Specific next action for mobile interface",
  "reasoning": "Why this mobile approach will work",
  "completion_criteria": "How to know when complete"
}
===RESPONSE_END===

# CLASSIFICATION RULES
- **CHAT**: General questions, greetings, explanations, help requests, coding questions
  - Examples: "hello", "what is X?", "give me code for Y", "explain Z"
  - Response: Provide helpful response in **markdown format** with proper code blocks

- **WEB_AUTOMATION**: Specific action requests to perform tasks on websites  
  - Examples: "open YouTube", "post this tweet", "search for X and click"
  - Response: Provide JSON automation plan

# MARKDOWN FORMATTING FOR CHAT
- Use \`\`\`language for code blocks
- Use **bold** for emphasis
- Use *italic* for secondary emphasis  
- Use \`inline code\` for short code snippets
- Use proper headings with # ## ###
- Use bullet points with - or *

Always provide complete, well-formatted responses!`;

      const response = await this.llmService.call([
        { role: 'user', content: intelligentPrompt }
      ], { maxTokens: 1200 });

      const result = this.parseDelimitedResponse(response);
      
      console.log('🎯 Intelligent classification result:', {
        intent: result.intent,
        confidence: result.confidence,
        reasoning: result.reasoning
      });

      return result;

    } catch (error) {
      console.error('Intelligent routing failed:', error);
      throw error;
    }
  }

  // New parsing method using delimiters
  parseDelimitedResponse(response) {
    try {
      // Extract classification section
      const classificationMatch = response.match(/===CLASSIFICATION_START===([\s\S]*?)===CLASSIFICATION_END===/);
      const responseMatch = response.match(/===RESPONSE_START===([\s\S]*?)===RESPONSE_END===/);
      
      if (!classificationMatch || !responseMatch) {
        console.warn('Could not find delimited sections, using fallback parsing');
        return this.parseJSONResponse(response); // Fallback to old method
      }
      
      const classificationText = classificationMatch[1].trim();
      let responseText = responseMatch[1].trim();
      
      // Parse classification
      const intentMatch = classificationText.match(/INTENT:\s*([^\n]+)/);
      const confidenceMatch = classificationText.match(/CONFIDENCE:\s*([0-9.]+)/);
      const reasoningMatch = classificationText.match(/REASONING:\s*([^\n]+)/);
      
      const intent = intentMatch ? intentMatch[1].trim() : 'CHAT';
      const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.8;
      const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'Classified using delimiter parsing';
      
      // Parse response based on intent
      let parsedResponse;
      if (intent === 'CHAT') {
        parsedResponse = {
          message: responseText, // Keep as markdown text
          isMarkdown: true // Flag to indicate markdown formatting
        };
      } else {
        // Clean the response text for JSON parsing - REMOVE ALL BACKTICKS
        responseText = responseText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').replace(/`/g, '');
        
        // Fix: Clean control characters from JSON strings
        responseText = responseText.replace(/[\n\r\t]/g, ' ').replace(/\s+/g, ' ');
        
        // Try to parse as JSON for web automation
        try {
          parsedResponse = JSON.parse(responseText);
        } catch (jsonError) {
          console.error('Failed to parse web automation JSON:', jsonError);
          console.error('Problematic text:', responseText);
          
          // Fallback for web automation
          parsedResponse = {
            observation: "Failed to parse automation plan",
            done: false,
            strategy: "Analyze current page and determine actions",
            next_action: "Get current page state",
            reasoning: "Parsing error occurred",
            completion_criteria: "Complete user request"
          };
        }
      }
      
      return {
        intent: intent,
        confidence: confidence,
        reasoning: reasoning,
        response: parsedResponse
      };
      
    } catch (error) {
      console.error('Delimiter parsing failed:', error);
      return this.fallbackIntelligentResponse();
    }
  }

  // Keep the old JSON parsing as fallback
  parseJSONResponse(response) {
    try {
      let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch (error) {
      console.error('JSON parsing failed:', error);
      return this.fallbackIntelligentResponse();
    }
  }

  fallbackIntelligentResponse() {
    // Use stored userMessage
    const userMessage = this.userMessage || 'Unknown message';
    const lowerMessage = userMessage.toLowerCase();
    
    // Action indicators for web automation
    const actionWords = ['open', 'go', 'navigate', 'search', 'click', 'type', 'post', 'buy', 'find', 'visit', 'play', 'watch', 'scroll', 'fill'];
    const hasActionWords = actionWords.some(word => lowerMessage.includes(word));
    
    // Conversational indicators
    const chatWords = ['hello', 'hi', 'what', 'how', 'why', 'explain', 'tell me', 'can you', 'help'];
    const hasChatWords = chatWords.some(word => lowerMessage.includes(word));
    
    if (hasActionWords && !hasChatWords) {
      return {
        intent: 'WEB_AUTOMATION',
        confidence: 0.7,
        reasoning: 'Detected action words indicating web automation request',
        response: {
          observation: `User wants to: ${userMessage}`,
          done: false,
          strategy: 'Analyze current page and execute the requested web automation task',
          next_action: 'Get current page state and determine appropriate actions',
          reasoning: 'Detected automation request from user message',
          completion_criteria: 'Task will be complete when user request is fulfilled'
        }
      };
    } else {
      return {
        intent: 'CHAT',
        confidence: 0.8,
        reasoning: 'Appears to be a conversational request or question',
        response: {
          message: `I understand you said: "${userMessage}"\n\nI'm your universal AI web automation assistant! I can help you with any website - YouTube, social media, shopping, research, and more.\n\nJust tell me what you want to do, like:\n• "Open YouTube and search for tutorials"\n• "Navigate to Amazon and find products"\n• "Post on social media"\n• "Fill out forms automatically"\n\nWhat would you like me to help you with?`,
          isMarkdown: true
        }
      };
    }
  }
}

// Initialize
const backgroundScriptAgent = new BackgroundScriptAgent();
console.log('🚀 Universal AI Web Agent Background Script Initialized with Wootz APIs');

// Chrome Alarms for Android background persistence
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keep-alive') {
    console.log("🟢 Background Service Worker Active:", new Date().toISOString());
    if (backgroundScriptAgent?.backgroundTaskManager) {
      const runningTasks = backgroundScriptAgent.backgroundTaskManager.getAllRunningTasks();
      console.log(`📊 Background status: ${runningTasks.length} tasks running`);
    }
  }
});

chrome.alarms.create('keep-alive', { 
  periodInMinutes: 0.1 
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Universal extension startup');
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('⚡ Universal extension installed/updated');
});