/* global chrome */

console.log('AI Twitter Agent Background Script Loading...');

// Enhanced Memory Manager with proper content handling
class ProceduralMemoryManager {
  constructor() {
    this.messages = [];
    this.proceduralSummaries = [];
    this.maxMessages = 8;
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
      this.messages = this.messages.slice(-4);
    }
  }

  ensureString(content) {
    if (typeof content === 'string') return content;
    if (content === null || content === undefined) return '';
    if (typeof content === 'object') return JSON.stringify(content);
    return String(content);
  }

  createProceduralSummary() {
    const recentMessages = this.messages.slice(-4);
    const summary = {
      steps: `${Math.max(0, this.stepCounter - 4)}-${this.stepCounter}`,
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
      recentMessages: this.messages.slice(-2).map(m => ({
        ...m,
        content: this.ensureString(m.content)
      })),
      proceduralSummaries: this.proceduralSummaries.map(s => ({
        ...s,
        findings: this.ensureString(s.findings)
      })),
      currentStep: this.stepCounter
    };
  }

  clear() {
    this.messages = [];
    this.proceduralSummaries = [];
    this.stepCounter = 0;
  }
}

// 🔧 FIXED: Background Task Manager - Now Actually Used!
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
      executor: executor  // Store executor reference for cancellation
    });

    setTimeout(() => {
      this.executeTaskIndependently(taskId, taskData, executor, connectionManager);
    }, 100);
  }

  async executeTaskIndependently(taskId, taskData, executor, connectionManager) {
    try {
      console.log(`⚙️ BackgroundTaskManager executing independently: ${taskId}`);
      
      // Create background-specific connection manager that persists
      const backgroundConnectionManager = {
        broadcast: (message) => {
          const task = this.runningTasks.get(taskId);
          if (task) {
            task.messages.push({
              ...message,
              timestamp: Date.now()
            });
            
            // Update task status
            if (message.type === 'task_complete' || message.type === 'task_error') {
              task.status = message.type === 'task_complete' ? 'completed' : 'error';
              task.result = message.result || message;
              task.endTime = Date.now();
              
              this.taskResults.set(taskId, task);
              this.runningTasks.delete(taskId);
              
              console.log(`✅ BackgroundTaskManager completed: ${taskId}`);
            }
            
            // Forward to active connections if any
            if (connectionManager) {
              connectionManager.broadcast(message);
            }
          }
        }
      };

      // Execute the task (continues in background)
      await executor.execute(taskData.task, backgroundConnectionManager);

    } catch (error) {
      console.error(`❌ BackgroundTaskManager error: ${taskId}`, error);
      
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

  getRecentMessages(taskId, limit = 10) {
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

// Enhanced Action Registry with better URL validation
class ActionRegistry {
  constructor(browserContext) {
    this.browserContext = browserContext;
    this.actions = new Map();
    this.initializeActions();
  }

  initializeActions() {
    this.actions.set('go_to_url', {
      handler: async (input) => {
        try {
          const url = this.validateAndFixUrl(input.url);
          
          if (!url) {
            throw new Error('Invalid or missing URL');
          }
          
          console.log(`🌐 Android Navigation: Closing current tab and opening ${url}`);
          
          // Get current tab
          const currentTab = await this.browserContext.getCurrentActiveTab();
          
          // Close current tab for Android compatibility
          if (currentTab) {
            try {
              await chrome.tabs.remove(currentTab.id);
              await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (e) {
              console.log('Could not close current tab:', e);
            }
          }
          
          // Create new tab with validated URL
          const newTab = await chrome.tabs.create({ url: url, active: true });
          this.browserContext.activeTabId = newTab.id;
          
          // Wait for load
          await this.browserContext.waitForReady(newTab.id);
          
          return {
            success: true,
            extractedContent: `✅ Navigated to ${url}`,
            includeInMemory: true,
            navigationCompleted: true
          };
          
        } catch (error) {
          console.error('Navigation error:', error);
          return {
            success: false,
            error: error.message,
            extractedContent: `❌ Navigation failed: ${error.message}`,
            includeInMemory: true
          };
        }
      }
    });

    this.actions.set('click_element', {
      handler: async (input) => {
        try {
          // Ensure we have an active tab
          if (!this.browserContext.activeTabId) {
            const currentTab = await this.browserContext.getCurrentActiveTab();
            this.browserContext.activeTabId = currentTab?.id;
          }

          if (!this.browserContext.activeTabId) {
            throw new Error('No active tab available');
          }

          let result;
          
          // Try with index first
          if (input.index !== undefined) {
            result = await chrome.tabs.sendMessage(this.browserContext.activeTabId, {
              action: 'CLICK_ELEMENT',
              index: input.index
            });
          }
          
          // If that fails, try with selector
          if (!result || !result.success) {
            result = await chrome.tabs.sendMessage(this.browserContext.activeTabId, {
              action: 'CLICK_ELEMENT',
              selector: input.selector
            });
          }
          
          return {
            success: result?.success !== false,
            extractedContent: `Clicked element ${input.index || input.selector || 'target'}`,
            includeInMemory: true
          };
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

    this.actions.set('input_text', {
      handler: async (input) => {
        try {
          // Ensure we have an active tab
          if (!this.browserContext.activeTabId) {
            const currentTab = await this.browserContext.getCurrentActiveTab();
            this.browserContext.activeTabId = currentTab?.id;
          }

          if (!this.browserContext.activeTabId) {
            throw new Error('No active tab available');
          }

          // Try multiple approaches for text input
          let result;
          
          // First try with index
          if (input.index !== undefined) {
            result = await chrome.tabs.sendMessage(this.browserContext.activeTabId, {
              action: 'FILL_ELEMENT',
              index: input.index,
              text: input.text
            });
          }
          
          // If that fails, try with selector (for better compatibility)
          if (!result || !result.success) {
            result = await chrome.tabs.sendMessage(this.browserContext.activeTabId, {
              action: 'FILL_ELEMENT',
              selector: input.selector || `[data-testid="tweetTextarea_0"]`,
              text: input.text
            });
          }
          
          // If still failing, try generic text area selectors
          if (!result || !result.success) {
            const selectors = [
              '[role="textbox"][contenteditable="true"]',
              'textarea',
              '[contenteditable="true"]',
              'input[type="text"]'
            ];
            
            for (const selector of selectors) {
              try {
                result = await chrome.tabs.sendMessage(this.browserContext.activeTabId, {
                  action: 'FILL_ELEMENT',
                  selector: selector,
                  text: input.text
                });
                
                if (result && result.success) {
                  break;
                }
              } catch (e) {
                // Try next selector
              }
            }
          }
          
          return {
            success: result?.success !== false,
            extractedContent: `Input "${input.text}" into element ${input.index || 'auto-detected'}`,
            includeInMemory: true
          };
        } catch (error) {
          console.error('Input action error:', error);
          return {
            success: false,
            error: error.message,
            extractedContent: `Input failed: ${error.message}`,
            includeInMemory: true
          };
        }
      }
    });

    this.actions.set('scroll_down', {
      handler: async (input) => {
        try {
          // Ensure we have an active tab
          if (!this.browserContext.activeTabId) {
            const currentTab = await this.browserContext.getCurrentActiveTab();
            this.browserContext.activeTabId = currentTab?.id;
          }

          if (!this.browserContext.activeTabId) {
            throw new Error('No active tab available');
          }

          const result = await chrome.tabs.sendMessage(this.browserContext.activeTabId, {
            action: 'SCROLL_DOWN',
            amount: input.amount || 300
          });
          
          return {
            success: result?.success !== false,
            extractedContent: `Scrolled down by ${input.amount || 300}px`,
            includeInMemory: true
          };
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

    this.actions.set('wait', {
      handler: async (input) => {
        const duration = input.duration || 3000;
        await new Promise(resolve => setTimeout(resolve, duration));
        return {
          success: true,
          extractedContent: `Waited ${duration}ms`,
          includeInMemory: true
        };
      }
    });

    this.actions.set('cache_content', {
      handler: async (input) => {
        return {
          success: true,
          extractedContent: `Cached: ${input.content}`,
          includeInMemory: true,
          cached: true
        };
      }
    });

    this.actions.set('done', {
      handler: async (input) => {
        return {
          success: input.success !== false,
          extractedContent: input.text || 'Task completed',
          isDone: true,
          includeInMemory: true
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
    return Array.from(this.actions.keys());
  }

  validateAndFixUrl(url) {
    if (!url || typeof url !== 'string') {
      console.error('Invalid URL provided:', url);
      return null;
    }
    
    // Remove any extra quotes or whitespace
    url = url.trim().replace(/['"]/g, '');
    
    // If URL already has protocol, validate it
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        new URL(url);
        return url;
      } catch (e) {
        console.error('Invalid URL format:', url);
        return null;
      }
    }
    
    // Add https:// if missing
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }
    
    // Validate the final URL
    try {
      new URL(url);
      return url;
    } catch (e) {
      console.error('Could not create valid URL:', url);
      return null;
    }
  }
}

// Enhanced Planner Agent
class PlannerAgent {
  constructor(llmService, memoryManager) {
    this.llmService = llmService;
    this.memoryManager = memoryManager;
  }

  async plan(userTask, currentState, executionHistory) {
    const context = this.memoryManager.getContext();
    
    const plannerPrompt = `You are a strategic web automation planner. Your job is to analyze the current state and break down the user's task into logical steps.

# ANALYSIS
- Current URL: ${currentState.pageInfo?.url || 'unknown'}
- Platform: ${this.detectPlatform(currentState.pageInfo?.url)}
- Interactive Elements: ${currentState.interactiveElements?.length || 0}
- Login Status: ${currentState.loginStatus?.isLoggedIn ? 'Logged In' : 'Not Logged In'}

# TASK
"${userTask}"

# CURRENT STATE
${this.formatElements(currentState.interactiveElements?.slice(0, 8) || [])}

# EXECUTION HISTORY
${executionHistory.slice(-2).map(h => `Step ${h.step}: ${h.success ? '✅' : '❌'} ${Array.isArray(h.plan) ? h.plan.join(' ') : (h.plan?.substring(0, 50) || 'action')}...`).join('\n') || 'No previous steps'}

# RESPONSE FORMAT
Respond with JSON only:
{
  "observation": "Brief analysis of current situation",
  "done": false,
  "next_steps": "Specific actionable steps",
  "reasoning": "Why this approach",
  "web_task": true,
  "platform": "detected platform",
  "requires_navigation": false
}

# RULES
- Set "done": true only when task is completely finished
- For Android: prefer working with current page over navigation
- Break complex tasks into simple steps
- Focus on visible interactive elements`;

    try {
      const response = await this.llmService.call([
        { role: 'user', content: plannerPrompt }
      ], { maxTokens: 600 });
      
      const plan = JSON.parse(this.cleanJSONResponse(response));
      
      this.memoryManager.addMessage({
        role: 'planner',
        action: 'plan',
        content: plan.next_steps || 'Plan created'
      });
      
      return plan;
    } catch (error) {
      console.error('Planner failed:', error);
      return this.getFallbackPlan(userTask, currentState);
    }
  }

  ensureString(content) {
    if (typeof content === 'string') return content;
    if (content === null || content === undefined) return '';
    if (typeof content === 'object') return JSON.stringify(content);
    return String(content);
  }

  detectPlatform(url) {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'twitter';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('youtube.com')) return 'youtube';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    if (lowerUrl.includes('reddit.com')) return 'reddit';
    
    return 'unknown';
  }

  getPlatformCapabilities(platform) {
    const capabilities = {
      'twitter': 'Post tweets, like, retweet, follow, reply, search',
      'linkedin': 'Post updates, like, comment, connect, share',
      'facebook': 'Post status, like, comment, share, react',
      'instagram': 'Post photos, like, comment, follow, story',
      'youtube': 'Like videos, comment, subscribe, create playlists',
      'tiktok': 'Like videos, comment, follow, share',
      'reddit': 'Post, comment, upvote, downvote, join communities',
      'discord': 'Send messages, react, join servers',
      'unknown': 'General web interactions available'
    };
    
    return capabilities[platform] || capabilities['unknown'];
  }

  formatElements(elements) {
    if (!elements || elements.length === 0) return "No interactive elements found.";
    
    return elements.slice(0, 12).map(el => 
      `[${el.index}] ${el.tagName}: "${(el.text || el.ariaLabel || '').substring(0, 40)}"${el.text?.length > 40 ? '...' : ''}`
    ).join('\n');
  }

  cleanJSONResponse(response) {
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  }

  getFallbackPlan(userTask, currentState) {
    const lowerTask = userTask.toLowerCase();
    const platform = this.detectPlatform(currentState.pageInfo?.url);
    
    if (lowerTask.includes('post') || lowerTask.includes('tweet') || lowerTask.includes('share')) {
      const platformUrls = {
        'twitter': 'https://x.com/compose/post',
        'linkedin': 'https://www.linkedin.com',
        'facebook': 'https://www.facebook.com',
        'instagram': 'https://www.instagram.com',
        'youtube': 'https://www.youtube.com'
      };
      
      return {
        observation: `Need to post content on ${platform}`,
        done: false,
        next_steps: `Navigate to ${platform} posting interface and create content`,
        web_task: true,
        platform: platform,
        required_navigation: platformUrls[platform] || null,
        completion_criteria: "Content successfully posted"
      };
    }
    
    return {
      observation: "General social media automation task",
      done: false,
      next_steps: "Analyze page and execute appropriate social media actions",
      web_task: true,
      platform: platform,
      completion_criteria: "Task objectives achieved"
    };
  }

  getDefaultState() {
    return {
      pageInfo: { 
        url: 'unknown', 
        title: 'Unknown Page' 
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

  checkBasicLoginStatus(url) {
    return !url.includes('/login') && !url.includes('/signin');
  }

  determinePageType(url) {
    if (url.includes('/compose') || url.includes('/intent/tweet')) return 'compose';
    if (url.includes('/home') || url.includes('/timeline')) return 'home';
    if (url.includes('/login') || url.includes('/signin')) return 'login';
    if (url.includes('/profile') || url.includes('/user/')) return 'profile';
    return 'general';
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Enhanced Navigator Agent with better element understanding
class NavigatorAgent {
  constructor(llmService, memoryManager, actionRegistry) {
    this.llmService = llmService;
    this.memoryManager = memoryManager;
    this.actionRegistry = actionRegistry;
  }

  async navigate(plan, currentState) {
    const context = this.memoryManager.getContext();
    
    const navigatorPrompt = `You are a web navigator that executes specific actions. Your job is to take the next action to progress toward the goal.

# GOAL
${plan.next_steps}

# CURRENT PAGE STATE
URL: ${currentState.pageInfo?.url}
Platform: ${currentState.pageContext?.platform}
Login Status: ${currentState.loginStatus?.isLoggedIn ? 'LOGGED IN' : 'NOT LOGGED IN'}

# INTERACTIVE ELEMENTS (Each has a unique index)
${this.formatElementsWithDetails(currentState.interactiveElements || [])}

# AVAILABLE ACTIONS
- go_to_url: Navigate to URL (requires "url" field with full URL like "https://youtube.com")
- click_element: Click buttons, links (requires "index" - use EXACT index from list above)
- input_text: Fill text fields (requires "index" and "text") 
- scroll_down: Scroll page (optional "amount")
- wait: Wait for loading (optional "duration")
- done: Complete task (requires "text" summary)

# RESPONSE FORMAT - CRITICAL: Use EXACT element indexes
JSON only:
{
  "current_state": {
    "evaluation_previous_goal": "Success|Failed|Unknown",
    "memory": "What has been done",
    "next_goal": "Immediate objective"
  },
  "action": [
    {
      "click_element": {
        "intent": "Click login button",
        "index": 5
      }
    }
  ]
}

# CRITICAL RULES
- ALWAYS use EXACT index numbers from the element list above
- For login: Look for email/username inputs, password inputs, and login buttons
- For posting: Look for text areas and post/tweet buttons
- Use the credentials provided: username "mr_kartik_910", password "itskartike", email "kartikek.910@gmail.com"
- If you see login fields, fill them with the exact credentials provided
- Do NOT use placeholder text like "YOUR_USERNAME_HERE"

# ANDROID RULES
- Use only element indexes from the list above
- For navigation: MUST include complete URL with protocol
- Prefer single actions over sequences
- Use wait after navigation or major actions`;

    try {
      const response = await this.llmService.call([
        { role: 'user', content: navigatorPrompt }
      ], { maxTokens: 600 });
      
      const navResult = JSON.parse(this.cleanJSONResponse(response));
      
      // 🔧 CRITICAL FIX: Validate element indexes in actions
      if (navResult.action && Array.isArray(navResult.action)) {
        navResult.action = navResult.action.map(actionObj => {
          const actionName = Object.keys(actionObj)[0];
          const actionData = actionObj[actionName];
          
          // Validate element indexes
          if ((actionName === 'click_element' || actionName === 'input_text') && 
              typeof actionData.index === 'number') {
            const availableIndexes = (currentState.interactiveElements || []).map(el => el.index);
            if (!availableIndexes.includes(actionData.index)) {
              console.warn(`⚠️ Invalid element index ${actionData.index}. Available: ${availableIndexes.join(', ')}`);
              // Try to find a similar element
              if (actionName === 'input_text') {
                const textElements = currentState.interactiveElements?.filter(el => 
                  el.isLoginElement || el.elementType === 'input' || el.elementType === 'textarea'
                );
                if (textElements && textElements.length > 0) {
                  actionData.index = textElements[0].index;
                  console.log(`🔧 Fixed to use text element index: ${actionData.index}`);
                }
              }
            }
          }
          
          // Fix URL validation
          if (actionName === 'go_to_url' && actionData.url) {
            if (!actionData.url.startsWith('http')) {
              if (actionData.url.includes('youtube')) {
                actionData.url = 'https://www.youtube.com';
              } else if (actionData.url.includes('twitter') || actionData.url.includes('x.com')) {
                actionData.url = 'https://x.com';
              } else {
                actionData.url = 'https://' + actionData.url;
              }
            }
            console.log(`🔗 Fixed URL: ${actionData.url}`);
          }
          
          return { [actionName]: actionData };
        });
      }
      
      this.memoryManager.addMessage({
        role: 'navigator',
        action: 'navigate',
        content: navResult.current_state?.next_goal || 'Navigation planned'
      });
      
      return navResult;
    } catch (error) {
      console.error('Navigator failed:', error);
      return this.getFallbackNavigation(plan, currentState);
    }
  }

  formatElementsWithDetails(elements) {
    if (!elements || elements.length === 0) return "No interactive elements found.";
    
    return elements.slice(0, 15).map(el => {
      let description = `[${el.index}] ${el.tagName}`;
      
      // Add element type info
      if (el.elementType) description += ` (${el.elementType})`;
      if (el.type) description += ` type="${el.type}"`;
      
      // Add text content
      const text = el.text || el.ariaLabel || '';
      if (text) description += `: "${text.substring(0, 40)}"${text.length > 40 ? '...' : ''}`;
      
      // Add special flags
      const flags = [];
      if (el.isLoginElement) flags.push('LOGIN');
      if (el.isPostElement) flags.push('POST');
      if (el.isEngagementElement) flags.push('ENGAGE');
      if (flags.length > 0) description += ` [${flags.join(',')}]`;
      
      return description;
    }).join('\n');
  }

  cleanJSONResponse(response) {
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  }

  getFallbackNavigation(plan, currentState) {
    const userTask = plan.next_steps || '';
    const lowerTask = userTask.toLowerCase();
    
    // Determine target URL based on task
    let targetUrl = null;
    if (lowerTask.includes('youtube')) {
      targetUrl = 'https://www.youtube.com';
    } else if (lowerTask.includes('twitter') || lowerTask.includes('tweet')) {
      targetUrl = 'https://x.com';
    } else if (lowerTask.includes('linkedin')) {
      targetUrl = 'https://www.linkedin.com';
    } else if (lowerTask.includes('facebook')) {
      targetUrl = 'https://www.facebook.com';
    } else if (lowerTask.includes('instagram')) {
      targetUrl = 'https://www.instagram.com';
    } else if (lowerTask.includes('tiktok')) {
      targetUrl = 'https://www.tiktok.com';
    } else if (lowerTask.includes('reddit')) {
      targetUrl = 'https://www.reddit.com';
    }
    
    if (targetUrl) {
      return {
        current_state: {
          evaluation_previous_goal: "Navigation needed",
          memory: "Determined target platform from task",
          next_goal: `Navigate to ${targetUrl}`
        },
        action: [{
          "go_to_url": {
            "intent": `Navigate to target platform`,
            "url": targetUrl
          }
        }]
      };
    }
    
    return {
      current_state: {
        evaluation_previous_goal: "Unknown",
        memory: "Using fallback navigation approach",
        next_goal: "Wait and analyze page"
      },
      action: [{
        "wait": {
          "intent": "Wait for page analysis", 
          "duration": 3000
        }
      }]
    };
  }
}

// Validator Agent
class ValidatorAgent {
  constructor(llmService, memoryManager) {
    this.llmService = llmService;
    this.memoryManager = memoryManager;
  }

  async validate(originalTask, executionHistory, finalState) {
    const validatorPrompt = `You are a task completion validator.

Original Task: "${originalTask}"

Execution History:
${executionHistory.map((h, i) => `Step ${i + 1}: ${h.navigation || 'action'} - ${h.success ? 'SUCCESS' : 'FAILED'}`).join('\n')}

Final State:
- URL: ${finalState.pageInfo?.url}
- Platform: ${this.detectPlatform(finalState.pageInfo?.url)}
- Page Type: ${finalState.pageContext?.pageType || 'unknown'}
- Login Status: ${finalState.loginStatus?.isLoggedIn ? 'Logged In' : 'Not Logged In'}

RESPONSE FORMAT (JSON only):
{
  "is_valid": true,
  "reason": "detailed explanation of completion status",
  "answer": "comprehensive summary of what was accomplished",
  "success_confidence": 0.8,
  "completion_evidence": "specific evidence of task completion",
  "platform_specific_notes": "notes about platform-specific completion"
}`;

    try {
      const response = await this.llmService.call([
        { role: 'user', content: validatorPrompt }
      ], { maxTokens: 400 });
      
      const validation = JSON.parse(this.cleanJSONResponse(response));
      
      this.memoryManager.addMessage({
        role: 'validator',
        action: 'validate',
        content: validation.answer || 'Validation completed'
      });
      
      return validation;
    } catch (error) {
      console.error('Validator failed:', error);
      return {
        is_valid: executionHistory.some(h => h.success),
        reason: "Validation failed, assuming partial success based on execution history",
        answer: "Task execution completed with mixed results",
        success_confidence: 0.6,
        completion_evidence: "Validation service unavailable",
        platform_specific_notes: "Manual verification recommended"
      };
    }
  }

  detectPlatform(url) {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    
    const platforms = {
      'twitter': ['x.com', 'twitter.com'],
      'linkedin': ['linkedin.com'],
      'facebook': ['facebook.com'],
      'instagram': ['instagram.com'],
      'youtube': ['youtube.com'],
      'tiktok': ['tiktok.com']
    };
    
    for (const [platform, domains] of Object.entries(platforms)) {
      if (domains.some(domain => lowerUrl.includes(domain))) {
        return platform;
      }
    }
    
    return 'unknown';
  }

  cleanJSONResponse(response) {
    let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    return jsonMatch ? jsonMatch[0] : cleaned;
  }
}

// Browser Context Manager (same as before)
class BrowserContextManager {
  constructor() {
    this.activeTabId = null;
  }

  async ensureTab(url) {
    try {
      const currentTab = await this.getCurrentActiveTab();
      
      // For Android/WootzApp - chrome.tabs.update not supported
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

      // Android compatibility - work with current tab instead of updating
      console.log('Android mode: Working with current tab instead of navigating to:', url);
      this.activeTabId = currentTab.id;
      
      return {
        success: true,
        extractedContent: `Working with current page: ${currentTab.url}. For navigation to ${url}, please navigate manually.`,
        includeInMemory: true,
        androidMode: true
      };
      
    } catch (error) {
      console.error('Tab management error:', error);
      return {
        success: false,
        error: error.message,
        extractedContent: `Navigation not supported on this platform: ${error.message}. Please navigate manually to the desired page.`,
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

  async ensureContentScript(tabId) {
    try {
      // Test if content script is already injected
      await chrome.tabs.sendMessage(tabId, { action: 'PING' });
      console.log('Content script already available');
      return true;
    } catch (error) {
      // Content script not available, inject it
      try {
        console.log('Injecting content script');
        
        // First inject buildDomTree.js (dependency)
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['buildDomTree.js']
        });
        
        // Then inject content.js
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
        
        // Wait longer for Android initialization
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test if injection worked
        try {
          await chrome.tabs.sendMessage(tabId, { action: 'PING' });
          console.log('Content scripts injected and working');
          return true;
        } catch (testError) {
          console.error('Content script injection verification failed:', testError);
          return false;
        }
      } catch (injectError) {
        console.error('Failed to inject content script:', injectError);
        return false;
      }
    }
  }

  async closeExcessTabs() {
    try {
      const tabs = await chrome.tabs.query({});
      const twitterTabs = tabs.filter(tab => 
        tab.url.includes('twitter.com') || tab.url.includes('x.com')
      );
      
      // Keep only the active Twitter tab, close others
      if (twitterTabs.length > 1) {
        for (let i = 1; i < twitterTabs.length; i++) {
          try {
            await chrome.tabs.remove(twitterTabs[i].id);
            console.log(`Closed excess Twitter tab: ${twitterTabs[i].id}`);
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

// Multi-Agent Executor with BackgroundTaskManager Integration
class MultiAgentExecutor {
  constructor(llmService) {
    this.llmService = llmService;
    this.memoryManager = new ProceduralMemoryManager();
    this.browserContext = new BrowserContextManager();
    this.actionRegistry = new ActionRegistry(this.browserContext);
    
    this.planner = new PlannerAgent(this.llmService, this.memoryManager);
    this.navigator = new NavigatorAgent(this.llmService, this.memoryManager, this.actionRegistry);
    this.validator = new ValidatorAgent(this.llmService, this.memoryManager);
    
    this.maxSteps = 15;
    this.executionHistory = [];
    this.currentStep = 0;
    this.cancelled = false;
  }

  async execute(userTask, connectionManager) {
    // Reset step counter at start of each execution
    this.currentStep = 0;
    this.executionHistory = [];
    this.cancelled = false;
    
    try {
      let taskCompleted = false;
      let finalResult = null;

      console.log(`🚀 Multi-agent execution: ${userTask}`);
      connectionManager.broadcast({
        type: 'task_start',
        message: `🚀 Starting: ${userTask}`
      });

      while (!taskCompleted && this.currentStep < this.maxSteps && !this.cancelled) {
        this.currentStep++;
        
        console.log(`🔄 Step ${this.currentStep}/${this.maxSteps}`);
        connectionManager.broadcast({
          type: 'status_update',
          message: `🔄 Step ${this.currentStep}/${this.maxSteps}: Multi-agent processing...`
        });

        // Check for cancellation
        if (this.cancelled) {
          finalResult = {
            success: false,
            response: '🛑 Task cancelled by user',
            message: 'Task cancelled',
            steps: this.currentStep
          };
          break;
        }

        // 1. Get current state
        const currentState = await this.getCurrentState();
        
        // 2. Planner Agent
        connectionManager.broadcast({
          type: 'status_update',
          message: `🧠 Planner Agent: Analyzing ${currentState.pageContext?.platform || 'platform'}...`
        });

        const plan = await this.planner.plan(userTask, currentState, this.executionHistory);
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
          message: `🧭 Navigator Agent: Executing for ${plan.platform}...`
        });

        const navigation = await this.navigator.navigate(plan, currentState);
        console.log(`Step ${this.currentStep} Navigation:`, navigation);

        // 4. Action Execution
        connectionManager.broadcast({
          type: 'status_update',
          message: `⚡ Performing ${navigation.action?.length || 0} actions...`
        });

        const actionResults = await this.executeActionSequence(navigation.action || [], connectionManager);
        
        this.executionHistory.push({
          step: this.currentStep,
          plan: plan.next_steps,
          navigation: navigation.current_state?.next_goal,
          results: actionResults,
          success: actionResults.some(r => r.success)
        });

        // Check if done
        const doneAction = actionResults.find(a => a.result?.isDone);
        if (doneAction) {
          taskCompleted = true;
          
          connectionManager.broadcast({
            type: 'status_update',
            message: `✅ Validator Agent: Checking completion...`
          });

          const finalState = await this.getCurrentState();
          const validation = await this.validator.validate(userTask, this.executionHistory, finalState);

          finalResult = {
            success: validation.is_valid,
            response: validation.answer,
            message: validation.answer,
            steps: this.currentStep,
            confidence: validation.success_confidence,
            platform: plan.platform
          };
          break;
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
      }

      return finalResult;

    } catch (error) {
      console.error('❌ Multi-agent execution error:', error);
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
      const tab = await this.browserContext.getCurrentActiveTab();
      if (!tab) {
        return this.getDefaultState();
      }

      // Ensure content script is available
      await this.browserContext.ensureContentScript(tab.id);
      this.browserContext.activeTabId = tab.id;

      try {
        console.log('Getting enhanced page state from content script');
        
        // Use enhanced DOM service
        if (!this.domService) {
          this.domService = new EnhancedDOMService();
        }
        
        const pageState = await this.domService.getPageState(tab.id, {
          debugMode: false, // Set to true for debugging
          showHighlightElements: false,
          maxElements: 30
        });

        console.log(`📊 Enhanced DOM: Found ${pageState.interactiveElements.length} ranked elements`);
        console.log('🔍 Top elements:', pageState.interactiveElements.slice(0, 5).map(el => ({
          index: el.originalIndex,
          type: el.elementType,
          text: el.contextText?.substring(0, 30),
          relevance: el.relevanceScore,
          isLogin: el.isLoginElement
        })));

        return pageState;

      } catch (contentError) {
        console.log('Enhanced DOM failed, using fallback:', contentError);
        return this.getCurrentStateWithFallback();
      }
    } catch (error) {
      console.log('Could not get current state:', error);
      return this.getDefaultState();
    }
  }

  async getCurrentStateWithFallback() {
    try {
      const tab = await this.browserContext.getCurrentActiveTab();
      if (!tab) return this.getDefaultState();

      const pageState = await chrome.tabs.sendMessage(tab.id, {
        action: 'GET_PAGE_STATE'
      });

      if (pageState && pageState.success) {
        return {
          pageInfo: {
            url: tab.url,
            title: tab.title,
            status: tab.status
          },
          pageContext: {
            platform: this.detectPlatform(tab.url),
            pageType: this.determinePageType(tab.url)
          },
          loginStatus: {
            isLoggedIn: this.checkBasicLoginStatus(tab.url)
          },
          interactiveElements: pageState.pageState?.interactiveElements || [],
          viewportInfo: pageState.pageState?.pageInfo?.viewport || {},
          extractedContent: 'Fallback page state extraction'
        };
      }
    } catch (error) {
      console.log('Fallback state extraction failed:', error);
    }
    
    return this.getDefaultState();
  }

  getDefaultState() {
    return {
      pageInfo: { 
        url: 'unknown', 
        title: 'Unknown Page' 
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

  checkBasicLoginStatus(url) {
    return !url.includes('/login') && !url.includes('/signin');
  }

  determinePageType(url) {
    if (url.includes('/compose') || url.includes('/intent/tweet')) return 'compose';
    if (url.includes('/home') || url.includes('/timeline')) return 'home';
    if (url.includes('/login') || url.includes('/signin')) return 'login';
    if (url.includes('/profile') || url.includes('/user/')) return 'profile';
    return 'general';
  }

  // Add delay method if missing
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async executeActionSequence(actions, connectionManager) {
    const results = [];
    
    for (let i = 0; i < actions.length; i++) {
      const actionObj = actions[i];
      const actionName = Object.keys(actionObj)[0];
      const actionInput = actionObj[actionName];
      
      try {
        connectionManager.broadcast({
          type: 'status_update',
          message: `🎯 ${actionInput.intent || `Executing ${actionName}`}...`
        });
        
        if (this.cancelled) {
          console.log('🛑 Action sequence cancelled');
          break;
        }
        
        const result = await this.actionRegistry.executeAction(actionName, actionInput);
        
        results.push({
          action: actionName,
          input: actionInput,
          result: result,
          success: result.success !== false
        });
        
        console.log(`${result.success ? '✅' : '❌'} ${actionName}: ${result.extractedContent?.substring(0, 50)}...`);
        
        // Android: Handle navigation specially
        if (actionName === 'go_to_url' && result.success) {
          await this.delay(4000); // Wait for page load
          break; // Stop sequence after navigation
        }
        
        if (!result.success && actionName !== 'wait') {
          console.log(`⚠️ Action failed but continuing: ${actionName}`);
        }
        
        if (result.isDone) {
          console.log('✅ Task marked complete');
          break;
        }
        
        // Add delay between actions for Android stability
        await this.delay(1000);
        
      } catch (error) {
        console.error(`❌ Action error: ${actionName}`, error);
        results.push({
          action: actionName,
          input: actionInput,
          result: { success: false, error: error.message },
          success: false
        });
        
        // Continue with next action unless critical failure
        if (actionName === 'go_to_url') {
          break; // Stop on navigation failure
        }
      }
    }
    
    return results;
  }

  detectPlatform(url) {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'twitter';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('youtube.com')) return 'youtube';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    
    return 'unknown';
  }

  cancel() {
    console.log('🛑 Cancelling multi-agent execution');
    this.cancelled = true;
  }

  async ensureContentScriptInjected(tabId) {
    try {
      await chrome.tabs.sendMessage(tabId, { action: 'PING' });
    } catch (error) {
      console.log('Injecting content script into tab:', tabId);
      
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['buildDomTree.js']
        });
        
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          files: ['content.js']
        });
        
        await this.delay(1500);
      } catch (injectionError) {
        console.error('Content script injection failed:', injectionError);
        throw injectionError;
      }
    }
  }
}

// Enhanced LLM Service (same as before)
class RobustMultiLLM {
  constructor(config = {}) {
    this.config = config;
    this.providers = ['anthropic', 'openai', 'gemini'];
    this.currentProviderIndex = 0;
    console.log('🤖 LLM Service initialized with model:', this.getModelName(config.aiProvider || 'anthropic'));
  }

  getModelName(provider, agentType = 'navigator') {
    // Use agent-specific models from settings, fallback to general models, then defaults
    const modelMap = {
      'anthropic': 
        (agentType === 'navigator' ? this.config.navigatorModel : 
         agentType === 'planner' ? this.config.plannerModel :
         agentType === 'validator' ? this.config.validatorModel : null) ||
        this.config.anthropicModel || 'claude-3-sonnet-20240229',
      'openai': 
        (agentType === 'navigator' ? this.config.navigatorModel : 
         agentType === 'planner' ? this.config.plannerModel :
         agentType === 'validator' ? this.config.validatorModel : null) ||
        this.config.openaiModel || 'gpt-4o',
      'gemini': 
        (agentType === 'navigator' ? this.config.navigatorModel : 
         agentType === 'planner' ? this.config.plannerModel :
         agentType === 'validator' ? this.config.validatorModel : null) ||
        this.config.geminiModel || 'gemini-1.5-pro'
    };
    
    return modelMap[provider] || modelMap['anthropic'];
  }

  async call(messages, options = {}, agentType = 'navigator') {
    const provider = this.config.aiProvider || 'anthropic';
    const modelName = this.getModelName(provider, agentType);
    
    console.log(`🤖 ${agentType} using ${provider} model: ${modelName}`);
    
    let lastError = null;
    
    // Try primary provider first
    try {
      return await this.callProvider(provider, messages, options);
    } catch (error) {
      console.error(`❌ ${provider} failed:`, error);
      lastError = error;
    }
    
    // Try fallback providers
    for (const fallbackProvider of this.providers.filter(p => p !== provider)) {
      try {
        const fallbackModel = this.getModelName(fallbackProvider, agentType);
        console.log(`🔄 Trying fallback: ${fallbackProvider} with ${fallbackModel}`);
        return await this.callProvider(fallbackProvider, messages, options);
      } catch (error) {
        console.error(`❌ Fallback ${fallbackProvider} failed:`, error);
        lastError = error;
      }
    }
    
    throw lastError || new Error('All LLM providers failed');
  }

  async callAnthropic(messages, options = {}) {
    if (!this.config.anthropicApiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const model = options.model || this.getModelName('anthropic');
    console.log(`🔥 Calling Anthropic with model: ${model}`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.config.anthropicApiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true' // ✅ ADD THIS LINE
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

    const model = options.model || this.getModelName('openai');
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

  // Add missing callProvider method
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

  // Add missing Gemini support
  async callGemini(messages, options = {}) {
    if (!this.config.geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    const model = options.model || this.getModelName('gemini');
    console.log(`🔥 Calling Gemini with model: ${model}`);

    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          maxOutputTokens: options.maxTokens || 4096,
          temperature: options.temperature || 0.3
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }
}

// Persistent Connection Manager with BackgroundTaskManager Integration
class PersistentConnectionManager {
  constructor(backgroundTaskManager) {
    this.connections = new Map();
    this.messageQueue = [];
    this.backgroundTaskManager = backgroundTaskManager;
    this.activeTask = null;
  }

  addConnection(connectionId, port) {
    console.log(`🔗 Adding connection: ${connectionId}`);
    
    this.connections.set(connectionId, {
      port: port,
      connected: true,
      lastActivity: Date.now()
    });

    // Send queued messages
    if (this.messageQueue.length > 0) {
      console.log(`📤 Sending ${this.messageQueue.length} queued messages`);
      this.messageQueue.forEach(message => {
        this.safePortMessage(port, message);
      });
      this.messageQueue = [];
    }

    // Send recent messages from active background task
    if (this.activeTask) {
      const recentMessages = this.backgroundTaskManager.getRecentMessages(this.activeTask, 3);
      recentMessages.forEach(message => {
        this.safePortMessage(port, message);
      });
    }
  }

  removeConnection(connectionId) {
    console.log(`🔌 Removing connection: ${connectionId}`);
    this.connections.delete(connectionId);
  }

  broadcast(message) {
    let messageSent = false;
    
    this.connections.forEach((connection, connectionId) => {
      if (connection.connected && this.safePortMessage(connection.port, message)) {
        messageSent = true;
      }
    });

    // Queue for background persistence
    this.messageQueue.unshift(message);
    if (this.messageQueue.length > 20) {
      this.messageQueue.pop();
    }

    if (!messageSent) {
      console.log('📦 Queued for background persistence:', message.type);
    }
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

// 🔧 Main Background Script Agent with BackgroundTaskManager Integration
class BackgroundScriptAgent {
  constructor() {
    this.backgroundTaskManager = new BackgroundTaskManager();
    this.connectionManager = new PersistentConnectionManager(this.backgroundTaskManager);
    this.activeTasks = new Map();
    this.llmService = null;
    this.multiAgentExecutor = null;
    this.taskRouter = null;
    
    this.setupMessageHandlers();
    console.log('✅ BackgroundScriptAgent initialized with BackgroundTaskManager');
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
          startTime: Date.now()
        });
        
        this.connectionManager.setActiveTask(taskId);
        await this.executeTaskWithBackgroundManager(message.task, taskId);
        break;

      case 'cancel_task':
        console.log('🛑 Received cancel_task request');
        const activeTaskId = this.connectionManager.getActiveTask();
        if (activeTaskId) {
          const cancelled = this.backgroundTaskManager.cancelTask(activeTaskId);
          this.activeTasks.delete(activeTaskId);
          this.connectionManager.setActiveTask(null);
          
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

      case 'get_status':
        const status = await this.getAgentStatus();
        this.connectionManager.safePortMessage(port, {
          type: 'status_response',
          status: status
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
      console.log('🚀 Executing task with BackgroundTaskManager:', task, 'ID:', taskId);
      
      if (!this.llmService) {
        const config = await this.getConfig();
        this.llmService = new RobustMultiLLM(config);
        this.multiAgentExecutor = new MultiAgentExecutor(this.llmService);
        this.taskRouter = new AITaskRouter(this.llmService);
      }

      const classification = await this.taskRouter.analyzeAndRoute(task);
      
      if (classification.intent === 'CHAT') {
        const result = await this.handleSimpleChat(task);
        this.connectionManager.broadcast({
          type: 'task_complete',
          result: result,
          taskId: taskId
        });
        this.activeTasks.delete(taskId);
        return;
      }

      await this.backgroundTaskManager.startTask(
        taskId, 
        { task }, 
        this.multiAgentExecutor, 
        this.connectionManager
      );
      
    } catch (error) {
      console.error('Background task execution error:', error);
      
      this.connectionManager.broadcast({
        type: 'task_error',
        error: error.message,
        taskId: taskId
      });
      
      this.activeTasks.delete(taskId);
      this.connectionManager.setActiveTask(null);
    }
  }

  async handleSimpleChat(task) {
    try {
      const response = await this.llmService.call([
        { 
          role: 'user', 
          content: `You are a helpful AI assistant specializing in social media automation. Respond to: "${task}"` 
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
        response: `I understand you said: "${task}"\n\nI'm your AI social media automation assistant! I can help with posting on Twitter, LinkedIn, Facebook, Instagram, YouTube, TikTok, and more. What would you like me to help you with?`,
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
      universalPlatforms: ['twitter', 'linkedin', 'facebook', 'instagram', 'youtube', 'tiktok', 'reddit'],
      config: {
        hasAnthropicKey: !!config.anthropicApiKey,
        hasOpenAIKey: !!config.openaiApiKey,
        aiProvider: config.aiProvider || 'anthropic'
      }
    };
  }

  async updateConfig(config) {
    try {
      await chrome.storage.sync.set({ agentConfig: config });
      this.llmService = new RobustMultiLLM(config);
      this.multiAgentExecutor = new MultiAgentExecutor(this.llmService);
      return { success: true, message: 'Configuration updated' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Add this class before BackgroundScriptAgent

class AITaskRouter {
  constructor(llmService) {
    this.llmService = llmService;
  }

  async analyzeAndRoute(userMessage, currentContext = {}) {
    try {
      const classificationPrompt = `You are an intelligent intent classifier.

Analyze: "${userMessage}"

Respond with JSON only:
{
  "intent": "CHAT|SOCIAL_ACTION|AUTOMATION",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}

Rules:
- CHAT: Greetings, questions, explanations ("hello", "what is", "how are you")
- SOCIAL_ACTION: Social media tasks ("post", "tweet", "share", "like", "follow")
- AUTOMATION: Other browser tasks ("navigate", "click", "fill form")`;

      const response = await this.llmService.call([
        { role: 'user', content: classificationPrompt }
      ], { maxTokens: 150 });

      const classification = this.parseJSONResponse(response);
      return classification.intent ? classification : this.fallbackRouting(userMessage);

    } catch (error) {
      console.error('AI classification failed:', error);
      return this.fallbackRouting(userMessage);
    }
  }

  parseJSONResponse(response) {
    try {
      let cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      return JSON.parse(jsonMatch ? jsonMatch[0] : cleaned);
    } catch (error) {
      return {};
    }
  }

  fallbackRouting(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    const socialKeywords = ['post', 'tweet', 'share', 'like', 'follow', 'comment'];
    const chatKeywords = ['hello', 'hi', 'what', 'how', 'why', 'explain'];
    
    const hasSocialKeywords = socialKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasChatKeywords = chatKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasSocialKeywords) {
      return {
        intent: 'SOCIAL_ACTION',
        confidence: 0.7,
        reasoning: 'Contains social media keywords'
      };
    } else if (hasChatKeywords) {
      return {
        intent: 'CHAT',
        confidence: 0.8,
        reasoning: 'Contains conversational keywords'
      };
    }
    
    return {
      intent: 'CHAT',
      confidence: 0.5,
      reasoning: 'Default classification'
    };
  }
}

// Add this comprehensive DOM service class before other classes
class EnhancedDOMService {
  constructor() {
    this.debugMode = false;
    this.highlightElements = true;
  }

  async getPageState(tabId, options = {}) {
    try {
      const result = await chrome.tabs.sendMessage(tabId, {
        action: 'GET_ENHANCED_PAGE_STATE',
        options: {
          debugMode: options.debugMode || this.debugMode,
          showHighlightElements: options.showHighlightElements || this.highlightElements,
          viewportExpansion: options.viewportExpansion || 200,
          maxElements: options.maxElements || 50
        }
      });

      if (result && result.success) {
        return this.processPageState(result.pageState);
      } else {
        throw new Error('Failed to get page state from content script');
      }
    } catch (error) {
      console.error('Enhanced DOM service error:', error);
      throw error;
    }
  }

  processPageState(rawPageState) {
    const processedElements = this.filterAndRankElements(rawPageState.interactiveElements || []);
    
    return {
      pageInfo: {
        url: rawPageState.url,
        title: rawPageState.title,
        platform: this.detectPlatform(rawPageState.url),
        pageType: this.determinePageType(rawPageState.url),
        viewport: rawPageState.viewport || {}
      },
      pageContext: {
        platform: this.detectPlatform(rawPageState.url),
        pageType: this.determinePageType(rawPageState.url),
        hasLoginForm: this.hasLoginElements(processedElements),
        hasPostForm: this.hasPostElements(processedElements),
        canPost: this.canUserPost(processedElements)
      },
      loginStatus: {
        isLoggedIn: this.checkLoginStatus(rawPageState.url, processedElements),
        hasLoginForm: this.hasLoginElements(processedElements)
      },
      interactiveElements: processedElements,
      elementStats: {
        total: rawPageState.interactiveElements?.length || 0,
        filtered: processedElements.length,
        buttons: processedElements.filter(el => el.elementType === 'button').length,
        inputs: processedElements.filter(el => el.elementType === 'input').length,
        links: processedElements.filter(el => el.elementType === 'link').length
      },
      extractedContent: this.generateContentSummary(processedElements, rawPageState)
    };
  }

  filterAndRankElements(elements) {
    if (!elements || elements.length === 0) return [];

    // Filter out invalid elements
    const validElements = elements.filter(el => 
      el && 
      typeof el.index === 'number' && 
      el.isVisible !== false &&
      el.text !== undefined
    );

    // Rank elements by relevance
    const rankedElements = validElements.map(el => ({
      ...el,
      relevanceScore: this.calculateRelevanceScore(el),
      elementType: this.categorizeElement(el),
      contextText: this.extractContextText(el),
      isLoginElement: this.isLoginRelated(el),
      isPostElement: this.isPostRelated(el)
    }));

    // Sort by relevance and limit
    return rankedElements
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 30)
      .map((el, index) => ({
        ...el,
        displayIndex: index,
        originalIndex: el.index
      }));
  }

  calculateRelevanceScore(element) {
    let score = 0;
    const text = (element.text || '').toLowerCase();
    const ariaLabel = (element.ariaLabel || '').toLowerCase();
    const tagName = element.tagName?.toLowerCase() || '';

    // Base scores by element type
    if (tagName === 'button') score += 20;
    else if (tagName === 'input') score += 18;
    else if (tagName === 'textarea') score += 16;
    else if (element.role === 'button') score += 15;
    else if (element.role === 'textbox') score += 15;
    else if (tagName === 'a') score += 10;

    // Boost for login-related terms
    const loginKeywords = ['login', 'sign in', 'email', 'password', 'username', 'continue'];
    if (loginKeywords.some(keyword => text.includes(keyword) || ariaLabel.includes(keyword))) {
      score += 25;
    }

    // Boost for post-related elements
    const postKeywords = ['tweet', 'post', 'share', 'publish', 'compose'];
    if (postKeywords.some(keyword => text.includes(keyword) || ariaLabel.includes(keyword))) {
      score += 20;
    }

    // Boost for interactive elements
    if (element.isClickable) score += 10;
    if (element.isFocusable) score += 8;

    // Penalty for hidden or tiny elements
    if (element.isVisible === false) score -= 50;
    if (element.boundingRect && (element.boundingRect.width < 10 || element.boundingRect.height < 10)) {
      score -= 20;
    }

    // Boost for elements in viewport
    if (element.isInViewport) score += 15;

    // Boost for elements with clear text
    if (text.length > 3 && text.length < 50) score += 5;

    return Math.max(0, score);
  }

  categorizeElement(element) {
    const tagName = element.tagName?.toLowerCase() || '';
    const type = element.type?.toLowerCase() || '';
    const role = element.role?.toLowerCase() || '';

    if (tagName === 'button' || role === 'button') return 'button';
    if (tagName === 'input') {
      if (type === 'text' || type === 'email') return 'input';
      if (type === 'password') return 'password';
      if (type === 'submit') return 'submit';
      return 'input';
    }
    if (tagName === 'textarea' || role === 'textbox') return 'textarea';
    if (tagName === 'a') return 'link';
    if (element.contentEditable === 'true') return 'contenteditable';
    return 'other';
  }

  extractContextText(element) {
    const parts = [];
    
    if (element.text) parts.push(element.text.trim());
    if (element.ariaLabel && element.ariaLabel !== element.text) {
      parts.push(`[${element.ariaLabel.trim()}]`);
    }
    if (element.placeholder) parts.push(`(${element.placeholder.trim()})`);
    
    return parts.join(' ').substring(0, 100);
  }

  isLoginRelated(element) {
    const text = (element.text || '').toLowerCase();
    const ariaLabel = (element.ariaLabel || '').toLowerCase();
    const placeholder = (element.placeholder || '').toLowerCase();
    
    const loginKeywords = [
      'login', 'sign in', 'log in', 'sign-in', 'signin',
      'email', 'username', 'password', 'continue',
      'next', 'submit', 'enter'
    ];
    
    return loginKeywords.some(keyword => 
      text.includes(keyword) || 
      ariaLabel.includes(keyword) || 
      placeholder.includes(keyword)
    );
  }

  isPostRelated(element) {
    const text = (element.text || '').toLowerCase();
    const ariaLabel = (element.ariaLabel || '').toLowerCase();
    
    const postKeywords = [
      'tweet', 'post', 'share', 'publish', 'compose',
      'write', 'create', 'send', 'submit'
    ];
    
    return postKeywords.some(keyword => 
      text.includes(keyword) || 
      ariaLabel.includes(keyword)
    );
  }

  hasLoginElements(elements) {
    return elements.some(el => el.isLoginElement);
  }

  hasPostElements(elements) {
    return elements.some(el => el.isPostElement);
  }

  canUserPost(elements) {
    const hasTextArea = elements.some(el => 
      el.elementType === 'textarea' || 
      el.elementType === 'contenteditable'
    );
    const hasPostButton = elements.some(el => 
      el.elementType === 'button' && el.isPostElement
    );
    return hasTextArea && hasPostButton;
  }

  checkLoginStatus(url, elements) {
    // If URL contains login/signin, probably not logged in
    if (url && (url.includes('/login') || url.includes('/signin'))) {
      return false;
    }
    
    // If we have login elements, probably not logged in
    if (this.hasLoginElements(elements)) {
      return false;
    }
    
    // Look for logout or profile elements (signs of being logged in)
    const hasProfileElements = elements.some(el => {
      const text = (el.text || '').toLowerCase();
      const ariaLabel = (el.ariaLabel || '').toLowerCase();
      return text.includes('profile') || 
             text.includes('logout') || 
             text.includes('sign out') ||
             ariaLabel.includes('profile') ||
             ariaLabel.includes('account menu');
    });
    
    return hasProfileElements;
  }

  detectPlatform(url) {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'twitter';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('youtube.com')) return 'youtube';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    
    return 'unknown';
  }

  determinePageType(url) {
    if (!url) return 'unknown';
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('/login') || lowerUrl.includes('/signin')) return 'login';
    if (lowerUrl.includes('/compose') || lowerUrl.includes('/intent/tweet')) return 'compose';
    if (lowerUrl.includes('/home') || lowerUrl.includes('/timeline')) return 'home';
    if (lowerUrl.includes('/profile') || lowerUrl.includes('/user/')) return 'profile';
    return 'general';
  }

  generateContentSummary(elements, rawPageState) {
    const platform = this.detectPlatform(rawPageState.url);
    const elementCount = elements.length;
    const loginElements = elements.filter(el => el.isLoginElement).length;
    const postElements = elements.filter(el => el.isPostElement).length;
    
    let summary = `${platform} page with ${elementCount} interactive elements`;
    
    if (loginElements > 0) {
      summary += `, ${loginElements} login-related elements`;
    }
    if (postElements > 0) {
      summary += `, ${postElements} post-related elements`;
    }
    
    return summary;
  }

  enableDebugMode() {
    this.debugMode = true;
    this.highlightElements = true;
  }

  disableDebugMode() {
    this.debugMode = false;
    this.highlightElements = false;
  }
}

// Initialize
const backgroundScriptAgent = new BackgroundScriptAgent();
console.log('AI Web Agent Background Script Initialized 🚀');

// Chrome Alarms for Android background persistence
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keep-alive') {
    console.log('🔄 Android background keep-alive');
    if (backgroundScriptAgent?.backgroundTaskManager) {
      const runningTasks = backgroundScriptAgent.backgroundTaskManager.getAllRunningTasks();
      console.log(`📊 Background status: ${runningTasks.length} tasks running`);
    }
  }
});

// Set up keep-alive alarm for Android
chrome.alarms.create('keep-alive', { 
  delayInMinutes: 0.5, 
  periodInMinutes: 1 
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 Android extension startup');
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('⚡ Android extension installed/updated');
});