/* global chrome */
import { PlannerAgent } from './agents/PlannerAgent.js';
import { NavigatorAgent } from './agents/NavigatorAgent.js';
import { ValidatorAgent } from './agents/ValidatorAgent.js';
import { AITaskRouter } from './agents/AITaskRouter.js';

console.log('AI Universal Agent Background Script Loading...');

class ProceduralMemoryManager {
  constructor() {
    this.messages = [];
    this.proceduralSummaries = [];
    this.maxMessages = 30;     
    this.maxSummaries = 5;      
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
      recentMessages: this.messages.slice(-10).map(m => ({
        ...m,
        content: this.ensureString(m.content)
      })),
      proceduralSummaries: this.proceduralSummaries.slice(-10),
      currentStep: this.stepCounter
    };
  }

  // lightweight context compressor
  compressForPrompt(maxTokens = 1200) {
    const ctx = this.getContext();
    const json = JSON.stringify(ctx);
    if (json.length > maxTokens * 4 && ctx.proceduralSummaries.length) {
      ctx.proceduralSummaries.shift();
    }
    while (JSON.stringify(ctx).length > maxTokens * 4 && ctx.recentMessages.length > 5) {
      ctx.recentMessages.shift();
    }
    return ctx;
  }

  clear() {
    this.messages = [];
    this.proceduralSummaries = [];
    this.stepCounter = 0;
  }
}

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
                sessionId: null
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
        sessionId: null
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

class BrowserContextManager {
  constructor() {
    this.activeTabId = null;
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
}

function urlValidator() {
  // Add null checks to prevent the TypeError
  const originalMethods = {
    checkBasicLoginStatus: function(url) {
      if (!url || typeof url !== 'string') return false;
      return !url.includes('/login') && !url.includes('/signin');
    },
    
    determinePageType: function(url) {
      if (!url || typeof url !== 'string') return 'general';
      
      // Chrome-native pages
      if (url.startsWith('chrome-native://') || url.startsWith('chrome://')) return 'chrome-native';
      
      // Social media page types
      if (url.includes('/compose') || url.includes('/intent/tweet')) return 'compose';
      if (url.includes('/home') || url.includes('/timeline')) return 'home';
      if (url.includes('/login') || url.includes('/signin')) return 'login';
      if (url.includes('/profile') || url.includes('/user/')) return 'profile';
      
      // E-commerce page types
      if (url.includes('/search') || url.includes('/s?')) return 'search';
      if (url.includes('/cart') || url.includes('/basket')) return 'cart';
      if (url.includes('/product/') || url.includes('/dp/')) return 'product';
      if (url.includes('/checkout')) return 'checkout';
      
      return 'general';
    },
    
    detectPlatform: function(url) {
      if (!url || typeof url !== 'string') return 'unknown';
      const lowerUrl = url.toLowerCase();
      
      // E-commerce platforms
      if (lowerUrl.includes('amazon.')) return 'amazon';
      if (lowerUrl.includes('ebay.')) return 'ebay';
      if (lowerUrl.includes('walmart.')) return 'walmart';
      if (lowerUrl.includes('target.')) return 'target';
      if (lowerUrl.includes('bestbuy.')) return 'bestbuy';
      if (lowerUrl.includes('flipkart.')) return 'flipkart';
      if (lowerUrl.includes('snapdeal.')) return 'snapdeal';
      if (lowerUrl.includes('shopclues.')) return 'shopclues';
      if (lowerUrl.includes('shopify.')) return 'shopify';
      if (lowerUrl.includes('bigbasket.')) return 'bigbasket';
      if (lowerUrl.includes('ajio.')) return 'ajio';
      if (lowerUrl.includes('myntra.')) return 'myntra';
      
      // Social media platforms
      if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'twitter';
      if (lowerUrl.includes('linkedin.com')) return 'linkedin';
      if (lowerUrl.includes('facebook.com')) return 'facebook';
      if (lowerUrl.includes('instagram.com')) return 'instagram';
      if (lowerUrl.includes('youtube.com')) return 'youtube';
      if (lowerUrl.includes('tiktok.com')) return 'tiktok';
      if (lowerUrl.includes('reddit.com')) return 'reddit';
      if (lowerUrl.includes('pinterest.com')) return 'pinterest';
      if (lowerUrl.includes('quora.com')) return 'quora';
      if (lowerUrl.includes('medium.com')) return 'medium';
      if (lowerUrl.includes('dev.to')) return 'devto';
      if (lowerUrl.includes('hashnode.com')) return 'hashnode';
      
      // Chrome-native pages
      if (lowerUrl.startsWith('chrome-native://') || lowerUrl.startsWith('chrome://')) return 'chrome-native';
      if (lowerUrl.startsWith('chrome-extension://')) return 'chrome-extension';
      
      return 'unknown';
    }
  };
  
  return originalMethods;
}

class MultiAgentExecutor {
  constructor(llmService) {
    this.llmService = llmService;
    this.memoryManager = new ProceduralMemoryManager();
    this.browserContext = new BrowserContextManager();
    this.actionRegistry = new UniversalActionRegistry(this.browserContext);
    
    this.planner = new PlannerAgent(this.llmService, this.memoryManager);
    this.navigator = new NavigatorAgent(this.llmService, this.memoryManager, this.actionRegistry);
    this.validator = new ValidatorAgent(this.llmService, this.memoryManager);
    
    // Fixed helper methods
    const helpers = urlValidator();
    this.checkBasicLoginStatus = helpers.checkBasicLoginStatus;
    this.determinePageType = helpers.determinePageType;
    this.detectPlatform = helpers.detectPlatform;
    
    this.maxSteps = 20;
    this.executionHistory = [];
    this.currentStep = 0;
    this.cancelled = false;
    
    this.actionQueue = [];
    this.currentBatchPlan = null;
    
    this.failedElements = new Set();
  }

  async execute(userTask, connectionManager, initialPlan = null) {
    this.currentStep = 0;
    this.executionHistory = [];
    this.cancelled = false;
    this.actionQueue = [];
    this.currentBatchPlan = null;
    this.failedElements = new Set();
    
    console.log(`🚀 Universal Multi-agent execution: ${userTask}`);
    console.log(`🧹 State cleaned - Starting fresh`);
    
    // Store current task for completion detection
    this.currentUserTask = userTask;
    
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
          message: `🔄 Step ${this.currentStep}/${this.maxSteps}: Analyzing page...`,
          isStatus: true
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

        if (initialPlan && initialPlan.direct_url && this.currentStep === 1) {
          console.log(`🎯 Using direct URL: ${initialPlan.direct_url}`);
          // Use direct_url for navigation as first step
          this.actionQueue = [{
            name: 'navigate',
            parameters: {
              url: initialPlan.direct_url,
              intent: 'Navigate directly to search results page'
            }
          }];
          this.currentBatchPlan = initialPlan;
          
          if (initialPlan && initialPlan.observation) {
            connectionManager.broadcast({
              type: 'status_update',
              message: `🧠 Observation: ${initialPlan.observation}\n📋 Strategy: ${initialPlan.strategy}`,
              details: initialPlan.reasoning || ''
            });
          }
          
          continue; // Execute this batch immediately
        }

        // 1. Execute batch actions if available
        if (this.actionQueue.length > 0) {
          console.log(`📋 Executing batch: ${this.actionQueue.length} actions`);
          
          const batchResults = await this.executeBatchSequentially(connectionManager);
          
          // Show completed batch as single step in UI
          connectionManager.broadcast({
            type: 'step_complete',
            step: this.currentStep,
            actions: batchResults.executedActions,
            message: `📋 Batch completed: ${batchResults.executedActions.length} actions executed`
          });
          
          // Call ValidatorAgent after each batch
          if (batchResults.anySuccess) {
            const currentState = await this.getCurrentState();
            // Call ValidatorAgent after each batch
            const validation = await this.validator.validate(userTask, this.executionHistory, currentState);

            if (validation.is_valid && validation.confidence >= 0.7 && validation.answer && validation.answer.trim() !== '' && !validation.answer.includes('incomplete')) {
              taskCompleted = true;
              finalResult = {
                success: true,
                response: `✅ ${validation.answer}`,
                reason: validation.reason,
                steps: this.currentStep,
                confidence: validation.confidence
              };
              
              // Broadcast task completion observation
              connectionManager.broadcast({
                type: 'status_update',
                message: `🎯 Task Completed: ${validation.answer}`,
                details: validation.reason || ''
              });
              break;
            } else if (validation.confidence < 0.5) {
              // If confidence is very low, continue with more actions
              console.log(`🔄 Validation confidence too low (${validation.confidence}), continuing task...`);
            }

            // If not complete, call PlannerAgent for next batch
            const plan = await this.planner.plan(userTask, currentState, this.executionHistory, 
              this.buildEnhancedContextWithHistory(), this.failedElements);
            
            // Broadcast planner's observation and strategy
            if (plan && plan.observation) {
              connectionManager.broadcast({
                type: 'status_update',
                message: `🧠 Observation: ${plan.observation}\n📋 Strategy: ${plan.strategy}`,
                details: plan.reasoning || ''
              });
            }
            
            if (plan.done) {
              taskCompleted = true;
              finalResult = {
                success: true,
                response: `✅ ${plan.completion_criteria || plan.reasoning}`,
                steps: this.currentStep
              };
              break;
            }
            this.actionQueue = this.validateAndPreprocessBatchActions(plan.batch_actions || []);
            this.currentBatchPlan = plan;
            continue;
          }

          // Call NavigatorAgent when batch fails
          if (batchResults.criticalFailure) {
            const currentState = await this.getCurrentState();
            // Use NavigatorAgent to try to recover
            const navResult = await this.navigator.navigate(this.currentBatchPlan, currentState);
            if (navResult && navResult.action) {
              this.actionQueue = [navResult.action];
              continue;
            }
            // If navigator can't recover, replan
            const plan = await this.planner.plan(userTask, currentState, this.executionHistory, 
            this.buildEnhancedContextWithHistory(), this.failedElements);
            this.actionQueue = this.validateAndPreprocessBatchActions(plan.batch_actions || []);
            this.currentBatchPlan = plan;
            continue;
          }
          
          continue;
        }

        // 2. Get page state only when planning
        const currentState = await this.getCurrentState();
        
        // 3. Enhanced context building
        const enhancedContext = this.buildEnhancedContextWithHistory();
        
        // 4. Generate new plan with full context
        let plan;
        if (initialPlan && this.currentStep === 1) {
          plan = initialPlan;
        } else {
          plan = await this.planner.plan(userTask, currentState, this.executionHistory, enhancedContext, this.failedElements);
        }

        if (plan && plan.observation) {
          connectionManager.broadcast({
            type: 'status_update',
            message: `🧠 Observation: ${plan.observation}\n📋 Strategy: ${plan.strategy}`,
            details: plan.reasoning || ''
          });
        }

        // 5. Check if AI says task is complete
        if (plan.isCompleted || plan.done) {
          taskCompleted = true;
          finalResult = {
            success: true,
            response: `✅ Task completed by AI: ${plan.completion_reason || plan.reasoning}`,
            steps: this.currentStep
          };
          break;
        }

        // 6. Queue batch actions
        if (plan.batch_actions && Array.isArray(plan.batch_actions)) {
          this.actionQueue = this.validateAndPreprocessBatchActions(plan.batch_actions);
          this.currentBatchPlan = plan;
          
          // Show plan to user as single step
          connectionManager.broadcast({
            type: 'plan_display',
            step: this.currentStep,
            strategy: plan.strategy,
            plannedActions: plan.batch_actions.map(a => ({
              type: a.action_type,
              intent: a.parameters?.intent || `${a.action_type} action`
            }))
          });
          
          continue;
        }

        await this.delay(1000);
      }

      // Final validation if max steps reached
      if (!taskCompleted && this.currentStep >= this.maxSteps) {
        console.log('🔍 Max steps reached - running AI validator');
        const finalState = await this.getCurrentState();
        const validation = await this.validator.validate(userTask, this.executionHistory, finalState);
        
        if (validation.is_valid && validation.confidence > 0.7 && validation.answer && validation.answer.trim() !== '') {
          finalResult = {
            success: true,
            response: `✅ ${validation.answer}`,
            reason: validation.reason,
            steps: this.currentStep,
            confidence: validation.confidence
          };
        } else {
          finalResult = {
            success: false,
            response: `⚠️ Task incomplete after ${this.currentStep} steps. ${validation.reason || 'Maximum steps reached'}`,
            reason: validation.reason || 'Task could not be completed within step limit',
            steps: this.currentStep,
            confidence: validation.confidence || 0.3
          };
        }
      }

      if (!finalResult) {
        finalResult = {
          success: false,
          response: `⚠️ Task incomplete after ${this.currentStep} steps. No final result was set.`,
          reason: 'Task execution completed without a definitive result',
          steps: this.currentStep,
          confidence: 0.2
        };
      }

      // Broadcast final result
      if (finalResult.success) {
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

  // Enhanced batch execution with immediate cancellation and robust null handling
  async executeBatchSequentially(connectionManager) {
    const results = {
      executedActions: [],
      anySuccess: false,
      criticalFailure: false
    };
    
    console.log(`🚀 Executing ${this.actionQueue.length} actions in batch`);
    
    for (let i = 0; i < this.actionQueue.length; i++) {
      // Immediate Cancellation During Batch Execution
      if (this.cancelled) {
        console.log('🛑 Task cancelled during batch execution');
        results.criticalFailure = true;
        break;
      }
      
      const action = this.actionQueue[i];
      
      console.log(`🎯 Executing action ${i + 1}/${this.actionQueue.length}: ${action.name}`);
      
      try {
        const actionResult = await this.executeAction(action, connectionManager);
        
        if (!actionResult) {
          results.executedActions.push({
            action: action.name,
            success: false,
            intent: action.parameters?.intent || action.name,
            error: 'Action was skipped or returned null'
          });
          continue;
        }
        
        results.executedActions.push({
          action: action.name,
          success: actionResult.success,
          intent: action.parameters?.intent || action.name,
          result: actionResult
        });
        
        if (actionResult.success) {
          results.anySuccess = true;
        }
        
        // Add to memory and history
        this.memoryManager.addMessage({
          role: 'step_executor',
          action: action.name,
          content: `Step ${this.currentStep}: Executed ${action.name} - ${actionResult.success ? 'SUCCESS' : 'FAILED'}`,
          step: this.currentStep,
          timestamp: new Date().toISOString()
        });
        
        this.executionHistory.push({
          step: this.currentStep,
          plan: `Batch action: ${action.name}`,
          navigation: action.parameters?.intent,
          results: [actionResult],
          success: actionResult.success,
          action: action.name
        });
        
        if (action.name === 'click' && action.parameters?.index !== undefined) {
          const elementIndex = action.parameters.index;
          
          // Mark element as failed if action failed
          if (!actionResult.success) {
            this.failedElements.add(elementIndex);
            console.log(`🚫 Marking element ${elementIndex} as failed due to click failure`);
          }
        }
        
        // Check for page state change after each action
        const currentState = await this.getCurrentState();
        const urlChanged = currentState.pageInfo?.url !== this.lastPageState?.pageInfo?.url;
        const elementCountChanged = Math.abs((currentState.interactiveElements?.length || 0) - 
                                           (this.lastPageState?.interactiveElements?.length || 0)) > 5;
        const titleChanged = currentState.pageInfo?.title !== this.lastPageState?.pageInfo?.title;
        
        const pageChanged = urlChanged || elementCountChanged || titleChanged;
        
        if (action.name === 'click' && action.parameters?.index !== undefined && 
            actionResult.success && !pageChanged) {
          const elementIndex = action.parameters.index;
          this.failedElements.add(elementIndex);
          console.log(`⚠️ Element ${elementIndex} clicked successfully but no significant page change - marking as potentially ineffective`);
        }
        
        if (pageChanged) {
          console.log('🔄 Page state changed - triggering replanning');
          this.actionQueue = [];
          break;
        }
        
        // If batch only contains navigation/wait, force replan after execution
        if (this.actionQueue.every(a => ['navigate', 'wait'].includes(a.name))) {
          console.log('🔄 Only navigation/wait actions in batch - forcing replan');
          this.actionQueue = [];
          break;
        }
        
        // Small delay between actions
        await this.delay(500);
        
      } catch (error) {
        console.error(`❌ Action execution error:`, error);
        
        if (action.name === 'click' && action.parameters?.index !== undefined) {
          this.failedElements.add(action.parameters.index);
          console.log(`🚫 Marking element ${action.parameters.index} as failed due to execution error`);
        }
        
        results.executedActions.push({
          action: action.name,
          success: false,
          intent: action.parameters?.intent || action.name,
          error: error.message
        });
        
        // If multiple actions fail, mark as critical failure
        const failedActions = results.executedActions.filter(a => !a.success).length;
        if (failedActions >= 2) {
          results.criticalFailure = true;
          console.log(`🚨 Critical failure detected: ${failedActions} actions failed in batch`);
          break;
        }
      }
    }
    
    return results;
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
          if (result.success) {
            console.log('🔍 Raw Wootz result:', result);
            
            let pageState = null;
            
            if (result.pageState && result.pageState.state && result.pageState.state.page_data) {
              try {
                console.log('🔍 Parsing nested page_data from result.pageState.state.page_data');
                pageState = JSON.parse(result.pageState.state.page_data);
                console.log('🔍 Successfully parsed pageState:', pageState);
              } catch (parseError) {
                console.error('🔍 Failed to parse page_data JSON:', parseError);
                console.error('🔍 Raw page_data:', result.pageState.state.page_data);
                const defaultState = this.getDefaultState();
                this.lastPageState = defaultState;
                resolve(defaultState);
                return;
              }
            } else if (result.pageState && result.pageState.url) {
              pageState = result.pageState;
              console.log('🔍 Using direct pageState format');
            } else {
              console.log('📊 No valid pageState format found in result');
              console.log('📊 Available keys in result:', Object.keys(result));
              if (result.pageState) {
                console.log('📊 Available keys in result.pageState:', Object.keys(result.pageState));
              }
              const defaultState = this.getDefaultState();
              this.lastPageState = defaultState;
              resolve(defaultState);
              return;
            }
            
            // Check if we're on a chrome-native page and early exit
            const isChromeNative = this.isChromeNativePage(pageState.url);
            if (isChromeNative) {
              console.log('⚠️ Chrome-native page detected - early exit to save API calls');
              const chromeState = {
                pageInfo: {
                  url: pageState.url || 'unknown',
                  title: 'Chrome Native Page',
                  domain: 'chrome'
                },
                pageContext: {
                  platform: 'chrome-native',
                  pageType: 'chrome-native',
                  hasLoginForm: false,
                  hasUserMenu: false,
                  isLoggedIn: false,
                  capabilities: {},
                  isChromeNative: true,
                  needsNavigation: true
                },
                interactiveElements: [],
                elementCategories: {},
                viewportInfo: {
                  width: pageState.viewport?.width || 0,
                  height: pageState.viewport?.height || 0,
                  isMobileWidth: pageState.viewport?.isMobileWidth || false,
                  isTabletWidth: pageState.viewport?.isTabletWidth || false,
                  isPortrait: pageState.viewport?.isPortrait || true,
                  deviceType: pageState.viewport?.deviceType || 'mobile',
                  aspectRatio: pageState.viewport?.aspectRatio || 0.75
                },
                loginStatus: { isLoggedIn: false },
                extractedContent: 'chrome-native page – navigation required'
              };
              this.lastPageState = chromeState;
              resolve(chromeState);
              return;
            }
            
            // Process elements and create enhanced state
            const processedElements = this.processElementsDirectly(pageState.elements || []);
            
            const processedState = {
              pageInfo: {
                url: pageState.url || 'unknown',
                title: pageState.title || 'unknown',
                domain: this.extractDomain(pageState.url),
                platform: this.detectPlatform(pageState.url)
              },
              pageContext: {
                platform: this.detectPlatform(pageState.url),
                pageType: this.determinePageType(pageState.url),
                hasLoginForm: pageState.pageContext?.hasLoginForm || false,
                hasUserMenu: pageState.pageContext?.hasUserMenu || false,
                isLoggedIn: pageState.pageContext?.isLoggedIn || false,
                capabilities: pageState.capabilities || {},
                isChromeNative: false
              },
              viewportInfo: {
                width: pageState.viewport?.width || 0,
                height: pageState.viewport?.height || 0,
                isMobileWidth: pageState.viewport?.isMobileWidth || false,
                isTabletWidth: pageState.viewport?.isTabletWidth || false,
                isPortrait: pageState.viewport?.isPortrait || true,
                deviceType: pageState.viewport?.deviceType || 'mobile',
                aspectRatio: pageState.viewport?.aspectRatio || 0.75
              },
              interactiveElements: processedElements,
              elementCategories: pageState.elementCategories || {},
              loginStatus: { isLoggedIn: pageState.pageContext?.isLoggedIn || false },
              extractedContent: pageState.extractedContent || '',
            };

            console.log(`📊 Enhanced Wootz State: Found ${processedState.interactiveElements.length} interactive elements`);
            console.log(`📱 Viewport: ${processedState.viewportInfo.deviceType} ${processedState.viewportInfo.width}x${processedState.viewportInfo.height}`);
            console.log(`🏷️ Categories:`, processedState.elementCategories);
            console.log(`⚡ Capabilities:`, processedState.pageContext.capabilities);
            
            // Store last page state for validation
            this.lastPageState = processedState;
            resolve(processedState);
          } else {
            console.log('📊 Wootz State: Failed, using fallback');
            console.log('🔍 Failed result:', result);
            const defaultState = this.getDefaultState();
            this.lastPageState = defaultState;
            resolve(defaultState);
          }
        });
      });
    } catch (error) {
      console.log('Could not get Wootz page state:', error);
      const defaultState = this.getDefaultState();
      this.lastPageState = defaultState;
      return defaultState;
    }
  }

  // Process elements directly without any filtering since API already sends filtered data
  processElementsDirectly(elements) {
    if (!elements || !Array.isArray(elements)) {
      console.log('🔍 Elements not array or null:', elements);
      console.log('🔍 Type of elements:', typeof elements);
      return [];
    }
    
    console.log(`🔍 Processing ${elements.length} elements directly from Wootz API`);
    
    // Process ALL elements directly - no filtering needed since API already sends the right format
    const processed = elements.map((el, arrayIndex) => {
      // console.log(`🔍 Processing element ${arrayIndex}:`, el);
      
      return {
        // Core identification (directly from API)
        index: el.index !== undefined ? el.index : arrayIndex,
        arrayIndex: arrayIndex,
        tagName: el.tagName || 'UNKNOWN',
        xpath: el.xpath || '',
        selector: el.selector || '',
        
        // Enhanced categorization (directly from API)
        category: el.category || 'unknown',
        purpose: el.purpose || 'general',
        
        // Content (directly from API)
        textContent: el.textContent || '',
        text: el.text || '', // Keep both for compatibility
        
        // Interaction properties (directly from API)
        isVisible: el.isVisible !== false,
        isInteractive: el.isInteractive !== false,
        
        // Enhanced attributes (directly from API)
        attributes: {
          id: el.attributes?.id || '',
          class: el.attributes?.class || '',
          type: el.attributes?.type || '',
          name: el.attributes?.name || '',
          'data-testid': el.attributes?.['data-testid'] || '',
          ...el.attributes // Include any other attributes
        },
        
        // Position and size (directly from API)
        bounds: {
          x: el.bounds?.x || 0,
          y: el.bounds?.y || 0,
          width: el.bounds?.width || 0,
          height: el.bounds?.height || 0
        },
        
        // Legacy compatibility fields for older code
        ariaLabel: el.attributes?.['aria-label'] || '',
        elementType: this.mapCategoryToElementType(el.category, el.tagName),
        isLoginElement: el.purpose === 'authentication' || el.category === 'form',
        isPostElement: el.purpose === 'post' || el.purpose === 'compose',
        
        // Store original for debugging
        originalElement: el
      };
    });
    
    console.log(`📊 Processed ${processed.length} elements successfully`);
    if (processed.length > 0) {
      console.log(`📊 Sample processed element:`, processed[0]);
    }
    return processed;
  }

  // Map API categories to legacy element types for compatibility
  mapCategoryToElementType(category, tagName) {
    const tag = (tagName || '').toLowerCase();
    
    switch (category) {
      case 'form':
        if (tag === 'input') return 'input';
        if (tag === 'textarea') return 'textarea';
        if (tag === 'select') return 'select';
        return 'form_element';
      case 'action':
        return 'button';
      case 'navigation':
        return 'link';
      case 'content':
        return 'content';
      default:
        if (tag === 'button') return 'button';
        if (tag === 'input') return 'input';
        if (tag === 'a') return 'link';
        return 'other';
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

  detectPlatform(url) {
    if (!url || typeof url !== 'string') return 'unknown';
    const lowerUrl = url.toLowerCase();
    
    // E-commerce platforms
    if (lowerUrl.includes('amazon.')) return 'amazon';
    if (lowerUrl.includes('ebay.')) return 'ebay';
    if (lowerUrl.includes('walmart.')) return 'walmart';
    if (lowerUrl.includes('target.')) return 'target';
    if (lowerUrl.includes('bestbuy.')) return 'bestbuy';
    if (lowerUrl.includes('flipkart.')) return 'flipkart';
    if (lowerUrl.includes('snapdeal.')) return 'snapdeal';
    if (lowerUrl.includes('shopclues.')) return 'shopclues';
    if (lowerUrl.includes('shopify.')) return 'shopify';
    if (lowerUrl.includes('bigbasket.')) return 'bigbasket';
    if (lowerUrl.includes('ajio.')) return 'ajio';
    if (lowerUrl.includes('myntra.')) return 'myntra';
    
    // Social media platforms
    if (lowerUrl.includes('x.com') || lowerUrl.includes('twitter.com')) return 'twitter';
    if (lowerUrl.includes('linkedin.com')) return 'linkedin';
    if (lowerUrl.includes('facebook.com')) return 'facebook';
    if (lowerUrl.includes('instagram.com')) return 'instagram';
    if (lowerUrl.includes('youtube.com')) return 'youtube';
    if (lowerUrl.includes('tiktok.com')) return 'tiktok';
    if (lowerUrl.includes('reddit.com')) return 'reddit';
    if (lowerUrl.includes('pinterest.com')) return 'pinterest';
    if (lowerUrl.includes('quora.com')) return 'quora';
    if (lowerUrl.includes('medium.com')) return 'medium';
    if (lowerUrl.includes('dev.to')) return 'devto';
    if (lowerUrl.includes('hashnode.com')) return 'hashnode';
    
    // Chrome-native pages
    if (lowerUrl.startsWith('chrome-native://') || lowerUrl.startsWith('chrome://')) return 'chrome-native';
    if (lowerUrl.startsWith('chrome-extension://')) return 'chrome-extension';
    
    return 'unknown';
  }
  
  determinePageType(url) {
    if (!url || typeof url !== 'string') return 'general';
    
    // Chrome-native pages
    if (url.startsWith('chrome-native://') || url.startsWith('chrome://')) return 'chrome-native';
    
    // Social media page types
    if (url.includes('/compose') || url.includes('/intent/tweet')) return 'compose';
    if (url.includes('/home') || url.includes('/timeline')) return 'home';
    if (url.includes('/login') || url.includes('/signin')) return 'login';
    if (url.includes('/profile') || url.includes('/user/')) return 'profile';
    
    // E-commerce page types
    if (url.includes('/search') || url.includes('/s?')) return 'search';
    if (url.includes('/cart') || url.includes('/basket')) return 'cart';
    if (url.includes('/product/') || url.includes('/dp/')) return 'product';
    if (url.includes('/checkout')) return 'checkout';
    
    return 'general';
  }
  
  // Check if page is chrome-native and needs navigation
  isChromeNativePage(url) {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('chrome-native://') || 
           url.startsWith('chrome://') || 
           url.startsWith('chrome-extension://') ||
           url === 'about:blank';
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
      console.log(`🎯 Executing: ${action.name}`, action.parameters);
      
      // Add enhanced element validation before action execution
      if (action.parameters?.index !== undefined) {
        const currentState = this.lastPageState || await this.getCurrentState();
        const availableIndices = (currentState.interactiveElements || []).map(el => el.index);
        if (!availableIndices.includes(action.parameters.index)) {
          // Index not found, try selector from page state if available
          const el = (currentState.interactiveElements || []).find(e => e.selector === action.parameters.selector);
          if (el && el.selector) {
            delete action.parameters.index;
            action.parameters.selector = el.selector;
          } else {
            // No valid selector, skip action
            return {
              action: action.name,
              input: action.parameters,
              result: { success: false, error: 'Element index/selector not found in page state' },
              success: false
            };
          }
        }
      }
      
      const result = await this.actionRegistry.executeAction(action.name, action.parameters);
      
      // Track failed elements for future avoidance
      if (!result.success && action.parameters?.index) {
        this.failedElements.add(action.parameters.index);
        console.log(`📝 Added index ${action.parameters.index} to failed elements set`);
        console.log(`⚠️ Action failed: ${action.name} on index ${action.parameters.index} - ${result.error}`);
      }
      
      return {
        action: action.name,
        input: action.parameters,
        result: result,
        success: result.success
      };
    } catch (error) {
      console.error(`❌ Action execution error:`, error);
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

  formatRecentActions(recentMessages = []) {
    if (!Array.isArray(recentMessages) || recentMessages.length === 0) {
      return 'No recent actions available';
    }
    return recentMessages.map(msg => {
      const step   = msg.step !== undefined ? `Step ${msg.step}` : 'Recent';
      const role   = msg.role || 'unknown';
      const action = msg.action || 'action';
      const text   = (msg.content || '').toString().substring(0, 100);
      return `${step} (${role}): ${action} – ${text}`;
    }).join('\n');
  }

  // Enhanced context building with all calculated variables
  buildEnhancedContextWithHistory() {
    const ctx = this.memoryManager.compressForPrompt(1200);
    
    return {
      ...ctx,
      procHistory: this.safeCall('formatProceduralSummaries', ctx.proceduralSummaries),
      progress: this.safeCall('analyzeProgressPatterns', ctx, this.executionHistory),
      recent: this.safeCall('formatRecentActions', ctx.recentMessages),
      guidance: this.safeCall('getSequenceGuidance', ctx.recentMessages),
      step: this.currentStep,
      maxSteps: this.maxSteps,
      executionPhase: this.safeCall('determineExecutionPhase'),
      failurePatterns: this.safeCall('detectFailurePatterns'),
      loopPrevention: this.safeCall('getLoopPreventionGuidance')
    };
  }

  // Safe method call helper
  safeCall(fnName, ...args) {
    if (typeof this[fnName] === 'function') {
      return this[fnName](...args);
    }
    console.warn(`⚠️ Missing helper "${fnName}" – returning empty string`);
    return '';
  }

  // Helper methods for enhanced context
  formatProceduralSummaries(summaries) {
    if (!summaries || summaries.length === 0) return "No procedural history available.";
    
    return summaries.map(summary => 
      `Steps ${summary.steps}: ${summary.actions}\nFindings: ${summary.findings}`
    ).join('\n\n');
  }

  analyzeProgressPatterns(context, executionHistory) {
    const recentActions = executionHistory.slice(-5);
    const successRate = recentActions.filter(a => a.success).length / Math.max(recentActions.length, 1);
    
    let analysis = `Recent success rate: ${(successRate * 100).toFixed(0)}%\n`;
    
    if (successRate < 0.3) {
      analysis += "⚠️ Low success rate - consider different approach\n";
    } else if (successRate > 0.8) {
      analysis += "✅ High success rate - continue current strategy\n";
    }
    
    // Detect patterns
    const actionTypes = recentActions.map(a => a.action);
    const uniqueTypes = new Set(actionTypes);
    
    if (uniqueTypes.size === 1 && actionTypes.length >= 3) {
      analysis += " Repetitive pattern detected - diversify actions\n";
    }
    
    return analysis;
  }

  getLoopPreventionGuidance() {
    const recentFailures = this.executionHistory.slice(-5).filter(h => !h.success);
    
    if (recentFailures.length >= 3) {
      return " CRITICAL: Multiple recent failures - avoid repeating same actions/approaches";
    } else if (recentFailures.length >= 2) {
      return "⚠️ Recent failures detected - try alternative targeting methods";
    }
    
    return "✅ No failure patterns - proceed normally";
  }

  determineExecutionPhase() {
    if (this.currentStep <= 3) return "INITIAL_EXPLORATION";
    if (this.currentStep <= 8) return "ACTIVE_EXECUTION";
    if (this.currentStep <= 15) return "REFINEMENT";
    return "FINAL_ATTEMPTS";
  }

  detectFailurePatterns() {
    const recentActions = this.executionHistory.slice(-5);
    const patterns = [];
    
    // Check for repeated action failures
    const actionFailures = {};
    recentActions.forEach(h => {
      if (!h.success && h.action) {
        actionFailures[h.action] = (actionFailures[h.action] || 0) + 1;
      }
    });
    
    Object.entries(actionFailures).forEach(([action, count]) => {
      if (count >= 2) {
        patterns.push(`${action} failed ${count} times`);
      }
    });
    
    return patterns.length > 0 ? patterns.join(', ') : 'No failure patterns detected';
  }

  // Loop prevention
  shouldSkipRepeatedAction(action) {
    const recentFailures = this.executionHistory
      .slice(-5)
      .filter(h => !h.success && h.action === action.name);
      
    // Skip if same action failed 3+ times recently
    if (recentFailures.length >= 3) {
      console.log(`🔄 LOOP PREVENTION: ${action.name} failed ${recentFailures.length} times recently`);
      return true;
    }
    
    // Skip if exact same intent failed recently
    const sameIntentFailures = this.executionHistory
      .slice(-3)
      .filter(h => !h.success && h.intent === action.parameters?.intent);
      
    if (sameIntentFailures.length >= 2) {
      console.log(`🔄 LOOP PREVENTION: Same intent "${action.parameters?.intent}" failed recently`);
      return true;
    }
    
    return false;
  }

  // Enhanced batch validation with loop prevention
  validateAndPreprocessBatchActions(batchActions) {
    const currentState = this.lastPageState || {};
    const availableIndices = (currentState.interactiveElements || []).map(el => el.index);
    const availableSelectors = (currentState.interactiveElements || []).map(el => el.selector);

    return batchActions.map(action => {
      // Only allow index or selector from page state
      if (action.action_type === 'click' || action.action_type === 'type' || action.action_type === 'fill') {
        // Prefer index if available
        if (action.parameters.index !== undefined && availableIndices.includes(action.parameters.index)) {
          // Valid index, use as is
        } else if (action.parameters.selector && availableSelectors.includes(action.parameters.selector)) {
          // Index missing or invalid, use selector from page state
          delete action.parameters.index;
        } else {
          // Neither valid index nor selector from page state, skip this action
          return null;
        }
      }
      // Loop prevention: skip if failed 3+ times
      if (this.shouldSkipRepeatedAction(action)) return null;
      return {
        name: action.action_type,
        parameters: action.parameters
      };
    }).filter(Boolean);
  }

  // Missing method: getSequenceGuidance
  getSequenceGuidance(recentMessages) {
    if (!recentMessages || recentMessages.length === 0) {
      return 'Starting fresh - analyze page and choose appropriate first action';
    }

    const lastAction = recentMessages[recentMessages.length - 1];
    if (!lastAction) {
      return 'Continue with current plan';
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

  // Missing method: analyzeActionHistory
  analyzeActionHistory(context, executionHistory) {
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

    // Check execution history patterns
    const recentExecutionActions = executionHistory.slice(-5);
    const executionSuccessRate = recentExecutionActions.filter(h => h.success).length / Math.max(recentExecutionActions.length, 1);
    
    if (executionSuccessRate > 0.8) {
      analysis.push('📈 EXECUTION: High success rate in recent actions');
    } else if (executionSuccessRate < 0.4) {
      analysis.push('📉 EXECUTION: Low success rate - need strategy change');
    }

    return analysis.join('\n') || 'No specific patterns detected in action history';
  }
}

class MultiLLMService {
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
      'gemini-2.0-flash-exp': 'gemini',
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
        this.llmService = new MultiLLMService(newConfig);
        this.multiAgentExecutor = new MultiAgentExecutor(this.llmService);
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
        
        // Only clear current chat state, not chat histories
        await chrome.storage.local.set({
          isExecuting: false,
          activeTaskId: null,
          taskStartTime: null,
          sessionId: null,
          chatHistory: [] // Only clear current chat
        });
        
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
          completion_criteria: intelligentResult.response.completion_criteria,
          direct_url: intelligentResult.response.direct_url,
          requires_auth: intelligentResult.response.requires_auth || false,
          workflow_type: intelligentResult.response.workflow_type
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