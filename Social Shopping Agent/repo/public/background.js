/* global chrome */
import { PlannerAgent } from './agents/PlannerAgent.js';
import { ValidatorAgent } from './agents/ValidatorAgent.js';
import { AITaskRouter } from './agents/AITaskRouter.js';
import { ActionRegistry } from './actions/ActionRegistry.js';
import { MemoryManager } from './managers/MemoryManager.js';
import { TaskManager } from './managers/TaskManager.js';
import { ContextManager } from './managers/ContextManager.js';
import { ConnectionManager } from './managers/ConnectionManager.js';
import { MultiLLMService } from './services/MultiLLMService.js';

console.log('AI Universal Agent Background Script Loading...');

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
    this.memoryManager = new MemoryManager();
    this.browserContext = new ContextManager();
    this.actionRegistry = new ActionRegistry(this.browserContext);
    
    this.planner = new PlannerAgent(this.llmService, this.memoryManager);
    this.validator = new ValidatorAgent(this.llmService, this.memoryManager);
    
    // Fixed helper methods
    const helpers = urlValidator();
    this.checkBasicLoginStatus = helpers.checkBasicLoginStatus;
    this.determinePageType = helpers.determinePageType;
    this.detectPlatform = helpers.detectPlatform;
    
    this.maxSteps = 50; 
    this.executionHistory = [];
    this.currentStep = 0;
    this.cancelled = false;
    
    this.actionQueue = [];
    this.currentBatchPlan = null;
    
    // this.failedElements = new Set();
    this.recentActionKeys = new Set();
    this.recentActionKeysMax = 120;
  }

  async execute(userTask, connectionManager, initialPlan = null, isResume = false) {
    if (!isResume) {
      this.currentStep = 0;
      this.cancelled = false;
      this.executionHistory = [];
      this.actionQueue = [];
      this.currentBatchPlan = null;
      // this.failedElements = new Set();
      this.lastPageState = null;
      this.lastValidationResult = null; 

      console.log(`🚀 Universal Multi-agent execution: ${userTask}`);
      console.log(`🧹 State cleaned - Starting fresh`);
    } else {
      console.log(`▶️ Resuming Multi-agent execution: ${userTask}`);
      console.log(`🔄 Resuming from paused state`);
    }
    
    // Store current task for completion detection
    this.currentUserTask = userTask;
    
    // Initialize enhanced task tracking in memory manager
    this.memoryManager.setCurrentTask(userTask);
    
    // Broadcast initial task setup
    connectionManager.broadcast({
      type: 'status_update',
      message: `🎯 Task Started: "${userTask}"`,
      details: `Task components identified: ${this.memoryManager.currentTaskState?.components?.join(', ') || 'analyzing...'}`
    });
    
    let taskCompleted = false;
    let finalResult = null;

    try {
      if (!isResume) {
        connectionManager.broadcast({
          type: 'execution_start',
          message: `🚀 Starting task: ${userTask}`
        });
      } else {
        connectionManager.broadcast({
          type: 'execution_start',
          message: `▶️ Resuming task: ${userTask}`
        });
      }

      while (!taskCompleted && this.currentStep < this.maxSteps && !this.cancelled) {
        this.currentStep++;
        
        console.log(`🔄 Step ${this.currentStep}/${this.maxSteps}`);
        connectionManager.broadcast({
          type: 'status_update',
          step: this.currentStep,
          message: `🔄 Step ${this.currentStep}: Planning next actions...`
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

        if (initialPlan && (this.currentStep === 1 || isResume)) {
          // Handle navigation if needed
          if (initialPlan.direct_url && initialPlan.navigation_needed !== false) {
            console.log(`🎯 Not on the correct page, using direct URL: ${initialPlan.direct_url}`);
            this.actionQueue = [{
              name: 'navigate',
              parameters: {
                url: initialPlan.direct_url,
                intent: 'Navigate directly to target page'
              }
            }];
          } else if (initialPlan.navigation_needed === false) {
            console.log(`🎯 Already on correct page, proceeding with immediate actions`);
            // Set up action queue based on initial plan parameters
            if (initialPlan.next_action) {
              const action = {
                name: initialPlan.next_action,
                parameters: {
                  index: initialPlan.index,
                  selector: initialPlan.selector,
                  text: initialPlan.text,
                  direction: initialPlan.direction,
                  amount: initialPlan.amount,
                  duration: initialPlan.duration,
                  intent: 'Execute immediate action on current page'
                }
              };
              this.actionQueue = [action];
            }
          } else if (isResume && initialPlan.batch_actions && initialPlan.batch_actions.length > 0) {
            // For resumed tasks, use the batch actions from the paused plan
            console.log(`🔄 Resuming with paused plan batch actions:`, initialPlan.batch_actions);
            this.actionQueue = this.validateAndPreprocessBatchActions(initialPlan.batch_actions);
            console.log(`🔄 Action queue set for resume:`, this.actionQueue);
          }

          // Set current batch plan
          this.currentBatchPlan = initialPlan;
          
          // Broadcast status update if observation exists
          if (initialPlan.observation) {
            // Show observation and strategy to user
          connectionManager.broadcast({
            type: 'observation_strategy',
            step: this.currentStep,
            observation: initialPlan.observation,
            strategy: initialPlan.strategy
          });
          }
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
          
          // const shouldRunValidation = (
          //   this.currentBatchPlan?.shouldValidate || // Planner-requested only
          //   (this.currentStep >= 10 && this.currentStep % 10 === 0) || // Reduced frequency
          //   (this.executionHistory.filter(h => h.success).length >= 10 && 
          //   this.executionHistory.slice(-3).every(h => h.success)) // After multiple successes
          // ) && batchResults.anySuccess;
          const shouldRunValidation = this.currentBatchPlan?.shouldValidate && batchResults.anySuccess;
          
          if (shouldRunValidation) {
            console.log('🔍 Running progressive validation as requested by planner...');
            const currentState = await this.getCurrentState();
            const validation = await this.validator.validate(userTask, this.executionHistory, currentState);
            
            // Store validation result for use in next planning cycle
            this.lastValidationResult = validation;

            console.log('📊 Validation result:', {
              is_valid: validation.is_valid,
              confidence: validation.confidence,
              progress: validation.progress_percentage,
              completed: validation.completed_components,
              missing: validation.missing_components
            });

            // Mark completed components in memory manager
            if (validation.completed_components && validation.completed_components.length > 0) {
              validation.completed_components.forEach(component => {
                this.memoryManager.markComponentCompleted(component, validation.evidence || 'Validation confirmed completion');
              });
            }

            // Progressive completion criteria (more lenient but accurate)
            if (validation.is_valid && 
                validation.confidence >= 0.85 && 
                validation.progress_percentage >= 90 &&
                validation.answer && 
                validation.answer.trim() !== '' && 
                !validation.answer.includes('incomplete') &&
                validation.missing_components && 
                validation.missing_components.length === 0) {
              
              taskCompleted = true;
              finalResult = {
                success: true,
                response: `✅ ${validation.answer}`,
                reason: validation.reason,
                steps: this.currentStep,
                confidence: validation.confidence,
                progress_percentage: validation.progress_percentage,
                completed_components: validation.completed_components
              };
              
              // Broadcast task completion observation
              connectionManager.broadcast({
                type: 'status_update',
                message: `🎯 Task Completed (${validation.progress_percentage}%): ${validation.answer}`,
                details: `${validation.reason} | Completed: ${validation.completed_components?.join(', ') || 'all components'}`
              });
              break;
            } else {
              // Provide detailed progress feedback
              const progressMsg = `🔄 Task Progress: ${validation.progress_percentage || 0}% complete`;
              const componentMsg = validation.completed_components?.length > 0 
                ? ` | Completed: ${validation.completed_components.join(', ')}`
                : '';
              const nextMsg = validation.next_required_action 
                ? ` | Next: ${validation.next_required_action}`
                : '';
              
              console.log(`${progressMsg}${componentMsg}${nextMsg}`);
              
              connectionManager.broadcast({
                type: 'status_update',
                message: `${progressMsg}${componentMsg}`,
                details: validation.reason || 'Continuing task execution...'
              });
            }
          } else if (batchResults.anySuccess) {
            console.log('📋 Batch completed successfully, continuing without validation...');
          }

          // Check if task should be completed after executing batch actions
          if (!taskCompleted && this.currentBatchPlan && this.currentBatchPlan.done) {
            console.log('🎯 Task marked as complete by planner after executing batch actions');
            taskCompleted = true;
            finalResult = {
              success: true,
              response: `✅ ${this.currentBatchPlan.completion_criteria || this.currentBatchPlan.reasoning}`,
              steps: this.currentStep,
              isMarkdown: true 
            };
          }

          // If not complete, call PlannerAgent for next batch
          if (!taskCompleted) {
            const currentState = await this.getCurrentState();
            const enhancedContext = this.buildEnhancedContextWithHistory();
            
            // Add previous plan results to context for continuity with enhanced details
            if (this.currentBatchPlan) {
              const completedActions = batchResults.executedActions.map(a => ({
                action: a.action,
                success: a.success,
                intent: a.intent,
                result: a.result,
                error: a.error || null
              }));
              
              const successfulActions = completedActions.filter(a => a.success);
              const failedActions = completedActions.filter(a => !a.success);
              
              enhancedContext.previousPlan = {
                observation: this.currentBatchPlan.observation,
                strategy: this.currentBatchPlan.strategy,
                next_action: this.currentBatchPlan.next_action,
                reasoning: this.currentBatchPlan.reasoning,
                completed_actions: completedActions,
                summary: {
                  total_actions: completedActions.length,
                  successful_actions: successfulActions.length,
                  failed_actions: failedActions.length,
                  last_action: completedActions.length > 0 ? completedActions[completedActions.length - 1] : null,
                  page_changed: batchResults.pageChanged || false
                }
              };
            }
            
            // Add validation results to context for planner
            if (this.lastValidationResult) {
              enhancedContext.lastValidation = {
                progress_percentage: this.lastValidationResult.progress_percentage || 0,
                completed_components: this.lastValidationResult.completed_components || [],
                missing_components: this.lastValidationResult.missing_components || [],
                next_required_action: this.lastValidationResult.next_required_action || '',
                confidence: this.lastValidationResult.confidence || 0
              };
            }
            
            const plan = await this.planner.plan(userTask, currentState, this.executionHistory, 
              enhancedContext);
            
            // Check if execution should be paused
            if (plan && plan.pause === true) {
              console.log(`⏸️ Task paused: ${plan.pause_reason}`);

              if (plan.observation) {
                connectionManager.broadcast({
                  type: 'observation_strategy',
                  step: this.currentStep,
                  observation: plan.observation,
                  strategy: plan.strategy
                });
              }
              
              await this.delay(400);

              // Broadcast pause message
              console.log('📤 Broadcasting task_paused message:', {
                type: 'task_paused',
                message: plan.pause_reason === 'signin' 
                  ? 'Please sign in to continue with your task. Click Resume when you\'re ready.'
                  : plan.pause_reason === 'approval'
                  ? 'Approval Required'
                  : 'Task execution paused. Click Resume when ready.',
                pause_reason: plan.pause_reason,
                pause_description: plan.pause_description || ''
              });
              
              connectionManager.broadcast({
                type: 'task_paused',
                message: plan.pause_reason === 'signin' 
                  ? 'Please sign in to continue with your task. Click Resume when you\'re ready.'
                  : plan.pause_reason === 'approval'
                  ? 'Approval Required'
                  : 'Task execution paused. Click Resume when ready.',
                pause_reason: plan.pause_reason,
                pause_description: plan.pause_description || ''
              });
              
              // Update execution state to paused
              await chrome.storage.local.set({
                isExecuting: false,
                isTyping: false,
                taskStatus: { status: 'paused', message: 'Task paused - waiting for user action' }
              });
              
              // Notify content scripts to hide main popup and show appropriate pause popup
              await this.notifyContentScripts('__agent_hide_popup');
              
              // Show appropriate popup based on pause reason
              if (plan.pause_reason === 'signin') {
                await this.showSigninPopup();
              } else if (plan.pause_reason === 'approval') {
                await this.showApprovalPopup();
              }
              
              // Store the current plan for resumption
              this.pausedPlan = plan;
              this.pausedTask = userTask;
              this.pausedState = currentState;
              
              // Return early - execution will resume when user clicks continue
              return {
                success: false,
                response: 'Task paused for user action',
                reason: 'paused',
                pause_reason: plan.pause_reason,
                steps: this.currentStep,
                confidence: 0.8
              };
            }
            
            // Broadcast planner's observation and strategy
            if (plan && plan.observation) {
              // Show observation and strategy to user
              connectionManager.broadcast({
                type: 'observation_strategy',
                step: this.currentStep,
                observation: plan.observation,
                strategy: plan.strategy
              });
            }
            
            // If planner says done and there are no batch actions to execute, complete the task immediately
            if (plan.done && (!plan.batch_actions || plan.batch_actions.length === 0)) {
              console.log('🎯 Task marked as complete by planner (no batch actions)');
              taskCompleted = true;
              finalResult = {
                success: true,
                response: `✅ ${plan.completion_criteria || plan.reasoning || 'Task completed successfully'}`,
                steps: this.currentStep,
                isMarkdown: true // Enable markdown formatting
              };
              
              // Broadcast completion message
              connectionManager.broadcast({
                type: 'status_update',
                message: `🎯 Task Completed: ${plan.completion_criteria || plan.reasoning || 'Task completed successfully'}`,
                details: `Completed in ${this.currentStep} steps`
              });
              break;
            }
            
            this.actionQueue = this.validateAndPreprocessBatchActions(plan.batch_actions || []);
            this.currentBatchPlan = plan; 
          }

          // Handle critical failures (no recovery needed for now)
          if (batchResults.criticalFailure) {
            connectionManager.broadcast({
              type: 'status_update',
              message: '⚠️ Multiple action failures detected.',
              details: 'Trying alternative approach'
            });
            
            const currentState = await this.getCurrentState();
            const plan = await this.planner.plan(userTask, currentState, this.executionHistory, 
            this.buildEnhancedContextWithHistory());
            
            // Check if execution should be paused
            if (plan && plan.pause === true) {
              console.log(`⏸️ Task paused during recovery: ${plan.pause_reason}`);
              
              
              if (plan.observation) {
                connectionManager.broadcast({
                  type: 'observation_strategy',
                  step: this.currentStep,
                  observation: plan.observation,
                  strategy: plan.strategy
                });
              }
              
              await this.delay(400);

              // Broadcast pause message
              connectionManager.broadcast({
                type: 'task_paused',
                message: plan.pause_reason === 'signin' 
                  ? 'Please sign in to continue with your task. Click Resume when you\'re ready.'
                  : plan.pause_reason === 'approval'
                  ? 'Approval Required'
                  : 'Task execution paused. Click Resume when ready.',
                pause_reason: plan.pause_reason,
                pause_description: plan.pause_description || ''
              });
              
              // Update execution state to paused
              await chrome.storage.local.set({
                isExecuting: false,
                isTyping: false,
                taskStatus: { status: 'paused', message: 'Task paused - waiting for user action' }
              });
              
              // Notify content scripts to hide main popup and show appropriate pause popup
              await this.notifyContentScripts('__agent_hide_popup');
              
              // Show appropriate popup based on pause reason
              if (plan.pause_reason === 'signin') {
                await this.showSigninPopup();
              } else if (plan.pause_reason === 'approval') {
                await this.showApprovalPopup();
              }
              
              // Store the current plan for resumption
              this.pausedPlan = plan;
              this.pausedTask = userTask;
              this.pausedState = currentState;
              
              // Return early - execution will resume when user clicks continue
              return {
                success: false,
                response: 'Task paused for user action',
                reason: 'paused',
                pause_reason: plan.pause_reason,
                steps: this.currentStep,
                confidence: 0.8
              };
            }

            if(plan && plan.done && (!plan.batch_actions || plan.batch_actions.length === 0)) {
              console.log('🎯 Task marked as complete by planner (no batch actions)');
              taskCompleted = true;
              finalResult = {
                success: true,
                response: `✅ ${plan.completion_criteria || plan.reasoning || 'Task completed successfully'}`,
                steps: this.currentStep,
                isMarkdown: true
              };
            }
            
            this.actionQueue = this.validateAndPreprocessBatchActions(plan.batch_actions || []);
            this.currentBatchPlan = plan;
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
          // Add any recent validation results to context for better planning
          if (this.lastValidationResult) {
            enhancedContext.lastValidation = {
              progress_percentage: this.lastValidationResult.progress_percentage || 0,
              completed_components: this.lastValidationResult.completed_components || [],
              missing_components: this.lastValidationResult.missing_components || [],
              next_required_action: this.lastValidationResult.next_required_action || '',
              confidence: this.lastValidationResult.confidence || 0
            };
          }
          
          plan = await this.planner.plan(userTask, currentState, this.executionHistory, enhancedContext);
          
          // Check if execution should be paused
          if (plan && plan.pause === true) {
            console.log(`⏸️ Task paused during replanning: ${plan.pause_reason}`);
            
            
            if (plan.observation) {
              connectionManager.broadcast({
                type: 'observation_strategy',
                step: this.currentStep,
                observation: plan.observation,
                strategy: plan.strategy
              });
            }
            
            await this.delay(400);

            // Broadcast pause message
            connectionManager.broadcast({
              type: 'task_paused',
              message: plan.pause_reason === 'signin' 
                ? 'Please sign in to continue with your task. Click Resume when you\'re ready.'
                : plan.pause_reason === 'approval'
                ? 'Approval Required'
                : 'Task execution paused. Click Resume when ready.',
              pause_reason: plan.pause_reason,
              pause_description: plan.pause_description || ''
            });
            
            // Update execution state to paused
            await chrome.storage.local.set({
              isExecuting: false,
              isTyping: false,
              taskStatus: { status: 'paused', message: 'Task paused - waiting for user action' }
            });
            
            // Notify content scripts to hide main popup and show appropriate pause popup
            await this.notifyContentScripts('__agent_hide_popup');
            
            // Show appropriate popup based on pause reason
            if (plan.pause_reason === 'signin') {
              await this.showSigninPopup();
            } else if (plan.pause_reason === 'approval') {
              await this.showApprovalPopup();
            }
            
            // Store the current plan for resumption
            this.pausedPlan = plan;
            this.pausedTask = userTask;
            this.pausedState = currentState;
            
            // Return early - execution will resume when user clicks continue
            return {
              success: false,
              response: 'Task paused for user action',
              reason: 'paused',
              pause_reason: plan.pause_reason,
              steps: this.currentStep,
              confidence: 0.8
            };
          }
        }

        if (plan && plan.observation) {
          // Show observation and strategy to user
          connectionManager.broadcast({
            type: 'observation_strategy',
            step: this.currentStep,
            observation: plan.observation,
            strategy: plan.strategy
          });
        }

        // If planner says done AND there are no batch actions to execute, complete the task
        if (plan.done && (!plan.batch_actions || plan.batch_actions.length === 0)) {
          console.log('🎯 Task marked as complete by planner (no batch actions)');
          taskCompleted = true;
          finalResult = {
            success: true,
            response: `✅ ${plan.completion_criteria || plan.reasoning || 'Task completed successfully'}`,
            steps: this.currentStep,
            isMarkdown: true
          };
          
          // Broadcast completion message
          connectionManager.broadcast({
            type: 'status_update',
            message: `🎯 Task Completed: ${plan.completion_criteria || plan.reasoning || 'Task completed successfully'}`,
            details: `Completed in ${this.currentStep} steps`
          });
          break;
        }

        // 6. Queue batch actions
        if (plan.batch_actions && Array.isArray(plan.batch_actions)) {
          this.actionQueue = this.validateAndPreprocessBatchActions(plan.batch_actions);
          this.currentBatchPlan = plan;
          
          // Show observation and strategy to user
          connectionManager.broadcast({
            type: 'observation_strategy',
            step: this.currentStep,
            observation: plan.observation,
            strategy: plan.strategy
          });
        } else {
          console.log('⚠️ No valid batch actions received from planner');
          break;
        }

        await this.delay(1000);
      }

      // Enhanced final validation with progressive assessment
      if (!taskCompleted && this.currentStep >= this.maxSteps) {
        console.log('🔍 Max steps reached - running enhanced final validation');
        const finalState = await this.getCurrentState();
        const validation = await this.validator.validate(userTask, this.executionHistory, finalState);
        
        console.log('📊 Final validation result:', {
          is_valid: validation.is_valid,
          confidence: validation.confidence,
          progress: validation.progress_percentage,
          completed: validation.completed_components,
          missing: validation.missing_components
        });
        
        // More lenient final validation - accept partial completion if substantial progress
        if (validation.is_valid && 
            validation.confidence >= 0.8 && 
            validation.progress_percentage >= 80 &&
            validation.answer && 
            validation.answer.trim() !== '') {
          finalResult = {
            success: true,
            response: `✅ ${validation.answer}`,
            reason: validation.reason,
            steps: this.currentStep,
            confidence: validation.confidence,
            progress_percentage: validation.progress_percentage,
            completed_components: validation.completed_components
          };
        } else if (validation.progress_percentage >= 50) {
          // Partial success for significant progress
          finalResult = {
            success: false,
            response: `🔄 Task partially completed (${validation.progress_percentage}%) after ${this.currentStep} steps. ${validation.reason || 'Maximum steps reached'}`,
            reason: validation.reason || 'Task could not be completed within step limit',
            steps: this.currentStep,
            confidence: validation.confidence || 0.3,
            progress_percentage: validation.progress_percentage,
            completed_components: validation.completed_components || []
          };
        } else {
          // Minimal progress - task incomplete
          finalResult = {
            success: false,
            response: `❌ Task incomplete after ${this.currentStep} steps. Progress: ${validation.progress_percentage || 0}%. ${validation.reason || 'Maximum steps reached with insufficient progress'}`,
            reason: validation.reason || 'Task could not be completed within step limit',
            steps: this.currentStep,
            confidence: validation.confidence || 0.2,
            progress_percentage: validation.progress_percentage || 0,
            completed_components: validation.completed_components || [],
            next_required_action: validation.next_required_action || 'Task needs to be restarted or refined'
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

      // Clear element highlighting on task completion
      this.clearElementHighlighting().catch(err => 
        console.warn('Failed to clear highlighting on completion:', err)
      );

      // Broadcast final result
      finalResult.isMarkdown = true; 
      
      connectionManager.broadcast({
        type: 'task_complete',
        result: finalResult
      });

      return finalResult;

    } catch (error) {
      console.error('❌ Universal multi-agent execution error:', error);
      
      // Clear element highlighting on error
      this.clearElementHighlighting().catch(err => 
        console.warn('Failed to clear highlighting on error:', err)
      );
      
      // Use enhanced error formatting for better user experience
      const userFriendlyError = this.formatErrorForUser(error);
      
      const errorResult = {
        success: false,
        response: userFriendlyError,
        reason: 'System error during task execution',
        message: error.message,
        steps: this.currentStep || 0,
        confidence: 0.1,
        originalError: error.message
      };

      connectionManager.broadcast({
        type: 'task_error',
        result: errorResult,
        error: userFriendlyError,
        originalError: error.message
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
    // let ineffectiveCount = 0;
    
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
        const beforeState = this.lastPageState || await this.getCurrentState();
        const urlBefore = beforeState?.pageInfo?.url || 'unknown';
        const targetKey = action.parameters?.selector ?? (Number.isFinite(action.parameters?.index) ? `idx:${action.parameters.index}` : 'none');
        const actKey = `${urlBefore}::${action.name}::${targetKey}`;
        
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
        
        // Add to memory and history with enhanced context
        this.memoryManager.addMessage({
          role: 'step_executor',
          action: action.name,
          content: `Step ${this.currentStep}: Executed ${action.name} - ${actionResult.success ? 'SUCCESS' : 'FAILED'} (Intent: ${action.parameters?.intent || 'No intent specified'})`,
          step: this.currentStep,
          timestamp: new Date().toISOString()
        });
        
        this.executionHistory.push({
          step: this.currentStep,
          plan: `Batch action: ${action.name}`,
          navigation: action.parameters?.intent || 'No intent specified',
          results: [actionResult],
          success: actionResult.success,
          action: action.name,
          intent: action.parameters?.intent || 'No intent specified',
          parameters: action.parameters
        });
        
        // Check for page state change after each action
        let currentState = await this.getCurrentState();
        
        // If page has 0 elements after navigation/click, wait for it to load
        if ((action.name === 'navigate' || action.name === 'click') && 
            (currentState.interactiveElements?.length || 0) === 0) {
          console.log(`🔄 Page loading after ${action.name} - waiting for page to fully load...`);
          await this.delay(3000);
          currentState = await this.getCurrentState();
          console.log(`📊 After wait - Found ${currentState.interactiveElements?.length || 0} elements`);
          
          // Try up to 5 more attempts if no elements found
          let attempts = 0;
          while ((currentState.interactiveElements?.length || 0) === 0 && attempts < 5) {
            attempts++;
            console.log(`🔄 Still loading (attempt ${attempts}/5) - waiting additional 2 seconds...`);
            await this.delay(2000);
            currentState = await this.getCurrentState();
            console.log(`📊 Attempt ${attempts} - Found ${currentState.interactiveElements?.length || 0} elements`);
            if ((currentState.interactiveElements?.length || 0) > 0) {
              break;
            }
          }
        }
        
        const urlChanged = currentState.pageInfo?.url !== this.lastPageState?.pageInfo?.url;
        const elementCountChanged = Math.abs((currentState.interactiveElements?.length || 0) - 
                                           (this.lastPageState?.interactiveElements?.length || 0)) > 5;
        const titleChanged = currentState.pageInfo?.title !== this.lastPageState?.pageInfo?.title;
        
        // NEW: Detect modal/dropdown openings by checking for new element types
        const hasNewModals = (currentState.interactiveElements || []).some(el => 
          el.attributes?.class?.includes('modal') || 
          el.attributes?.class?.includes('dropdown') ||
          el.attributes?.class?.includes('menu') ||
          el.attributes?.role === 'dialog' ||
          el.attributes?.role === 'menu'
        );

        const previousModals = (this.lastPageState?.interactiveElements || []).some(el => 
          el.attributes?.class?.includes('modal') || 
          el.attributes?.class?.includes('dropdown') ||
          el.attributes?.class?.includes('menu') ||
          el.attributes?.role === 'dialog' ||
          el.attributes?.role === 'menu'
        );

        const modalStateChanged = hasNewModals !== previousModals;

        const pageChanged = urlChanged || elementCountChanged || titleChanged || modalStateChanged;
        
        if (pageChanged) {
          console.log('🔄 Page state changed - triggering replanning');
          // Don't break immediately for go_back actions to allow remaining actions to complete
          if (action.name === 'go_back') {
            console.log('🔄 go_back action completed, continuing with remaining actions...');
          } else {
            this.actionQueue = [];
            break;
          }
        }
        
        // If batch only contains navigation/wait, force replan after execution
        if (this.actionQueue.every(a => ['navigate', 'wait'].includes(a.name))) {
          console.log('🔄 Only navigation/wait actions in batch - forcing replan');
          this.actionQueue = [];
          break;
        }
        
        // Mark executed action key (for loop prevention)
        this.recentActionKeys.add(actKey);
        if (this.recentActionKeys.size > this.recentActionKeysMax) {
          this.recentActionKeys = new Set(Array.from(this.recentActionKeys).slice(-this.recentActionKeysMax));
        }
        
        // Small delay between actions
        await this.delay(500);
        
      } catch (error) {
        console.error(`❌ Action execution error:`, error);
        
        results.executedActions.push({
          action: action.name,
          success: false,
          intent: action.parameters?.intent || action.name,
          error: error.message
        });
        
        // If multiple actions fail, mark as critical failure
        const failedActions = results.executedActions.filter(a => !a.success).length;
        if (failedActions >= 3) {
          results.criticalFailure = true;
          console.log(`🚨 Critical failure detected: ${failedActions} actions failed in batch`);
          break;
        }
      }
    }
    
    return results;
  }

  // Clear element highlighting by calling getPageState with debugMode: false
  async clearElementHighlighting() {
    try {
      console.log('🧹 Clearing element highlighting from page');
      
      return new Promise((resolve) => {
        chrome.wootz.getPageState({
          debugMode: false,
          includeHidden: false
        }, (result) => {
          console.log('✅ Element highlighting cleared');
          resolve(result);
        });
      });
    } catch (error) {
      console.warn('⚠️ Failed to clear element highlighting:', error);
    }
  }

  async getCurrentState() {
    try {
      console.log('📊 Getting page state via Wootz API');

      // const config = await chrome.storage.sync.get('agentConfig');
      // const debugMode = config?.agentConfig?.debugMode || false;
      // console.log('🔍 Debug mode:', debugMode);
      
      return new Promise((resolve) => {
        chrome.wootz.getPageState({
          debugMode: true,
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
            // console.log(`📱 Viewport: ${processedState.viewportInfo.deviceType} ${processedState.viewportInfo.width}x${processedState.viewportInfo.height}`);
            // console.log(`🏷️ Categories:`, processedState.elementCategories);
            // console.log(`⚡ Capabilities:`, processedState.pageContext.capabilities);
            
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

  // Process elements directly and filter out HTML tag (0th index element)
  processElementsDirectly(elements) {
    if (!elements || !Array.isArray(elements)) {
      console.log('🔍 Elements not array or null:', elements);
      console.log('🔍 Type of elements:', typeof elements);
      return [];
    }
    
    console.log(`🔍 Processing ${elements.length} elements directly from Wootz API`);
    
    // Filter out HTML tag (0th index element) and process remaining elements
    const filteredElements = elements.filter((el, arrayIndex) => {
      // Skip the 0th index element if it's an HTML tag
      if (arrayIndex === 0 && (el.tagName?.toLowerCase() === 'html' || el.index === 0)) {
        console.log('🔍 Filtering out HTML tag (0th index element)');
        return false;
      }
      return true;
    });
    
    console.log(`🔍 After filtering HTML tag: ${filteredElements.length} elements remaining`);
    
    // Process filtered elements
    const processed = filteredElements.map((el, arrayIndex) => {
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
      
      // Pass connectionManager to ActionRegistry for better communication
      const result = await this.actionRegistry.executeAction(action.name, action.parameters, connectionManager);
      
      // // Track failed elements for future avoidance
      // if (!result.success && action.parameters?.index) {
      //   this.failedElements.add(action.parameters.index);
      //   console.log(`📝 Added index ${action.parameters.index} to failed elements set`);
      //   console.log(`⚠️ Action failed: ${action.name} on index ${action.parameters.index} - ${result.error}`);
      // }
      
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
    // Clear element highlighting when task is cancelled
    this.clearElementHighlighting().catch(err => 
      console.warn('Failed to clear highlighting on cancel:', err)
    );
  }

  // Helper function to notify content scripts about agent status
  async notifyContentScripts(messageType) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: messageType });
      }
    } catch (error) {
      console.log('Could not notify content script:', error.message);
    }
  }

  // Helper function to show signin popup
  async showSigninPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_show_signin_popup' });
      }
    } catch (error) {
      console.log('Could not show signin popup:', error.message);
    }
  }

  // Helper function to hide signin popup
  async hideSigninPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_hide_signin_popup' });
      }
    } catch (error) {
      console.log('Could not hide signin popup:', error.message);
    }
  }

  // Helper function to show approval popup
  async showApprovalPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_show_approval_popup' });
      }
    } catch (error) {
      console.log('Could not show approval popup:', error.message);
    }
  }

  // Helper function to hide approval popup
  async hideApprovalPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_hide_approval_popup' });
      }
    } catch (error) {
      console.log('Could not hide approval popup:', error.message);
    }
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
    if (this.currentStep <= 10) return "ACTIVE_EXECUTION";
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
    // const availableSelectors = (currentState.interactiveElements || []).map(el => el.selector);

    return batchActions.map(action => {
      // Only validate exact indices for basic actions
      if (action.action_type === 'click' || action.action_type === 'type' || action.action_type === 'fill') {
        console.log('ProcessingBatchActions: action_type', action.action_type);
        if (action.parameters.index !== undefined && availableIndices.includes(action.parameters.index)) {
          console.log('ProcessingBatchActions: action.parameters.index', action.parameters.index);
          return {
            name: action.action_type,
            parameters: action.parameters
          };
        } else if (action.parameters.selector) {
          console.log('ProcessingBatchActions: action.parameters.selector', action.parameters.selector);
          // Allow selector-based actions - chrome.wootz.performAction can resolve them
          delete action.parameters.index;
          return {
            name: action.action_type,
            parameters: action.parameters
          };
        } else {
          return null; // Skip invalid basic actions
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

class BackgroundScriptAgent {
  constructor() {
    this.backgroundTaskManager = new TaskManager();
    this.connectionManager = new ConnectionManager(this.backgroundTaskManager);
    this.activeTasks = new Map();
    this.llmService = null;
    this.multiAgentExecutor = null;
    this.taskRouter = null;
    this.currentConfig = null; // Track current config
    
    // Screenshot handling
    this.screenshotPromise = null;
    this.screenshotResolve = null;
    this.screenshotReject = null;
    
    this.setupMessageHandlers();
    this.setupConfigWatcher(); // Add config watcher
    this.setupScreenshotListener(); // Add screenshot listener
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

  // Setup screenshot listener once
  setupScreenshotListener() {
    chrome.wootz.onScreenshotComplete.addListener((result) => {
      console.log('📸 Screenshot Result:', result);
      
      if (this.screenshotResolve) {
        if (result && result.success && result.dataUrl) {
          console.log(`✅ Screenshot captured: ~${Math.round(result.dataUrl.length * 0.75 / 1024)}KB`);
          this.screenshotResolve(result.dataUrl);
        } else {
          console.log('❌ Screenshot capture failed:', result?.error || 'No dataUrl returned');
          this.screenshotResolve(null);
        }
        
        // Reset screenshot handling state
        this.screenshotPromise = null;
        this.screenshotResolve = null;
        this.screenshotReject = null;
      }
    });
  }

  // Capture screenshot using the persistent listener
  async captureScreenshot() {
    try {
      console.log('📸 Capturing screenshot using chrome.wootz.captureScreenshot()...');
      
      // If there's already a screenshot in progress, wait for it
      if (this.screenshotPromise) {
        console.log('📸 Screenshot already in progress, waiting...');
        return await this.screenshotPromise;
      }
      
      // Create new promise for this screenshot
      this.screenshotPromise = new Promise((resolve, reject) => {
        this.screenshotResolve = resolve;
        this.screenshotReject = reject;
        
        // Set up timeout
        setTimeout(() => {
          if (this.screenshotResolve) {
            console.log('❌ Screenshot capture timeout');
            this.screenshotResolve(null);
            this.screenshotPromise = null;
            this.screenshotResolve = null;
            this.screenshotReject = null;
          }
        }, 15000); // 10 second timeout
      });
      
      // Trigger the screenshot capture
      chrome.wootz.captureScreenshot();
      
      return await this.screenshotPromise;
      
    } catch (error) {
      console.error('❌ Screenshot capture error:', error);
      return null;
    }
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
        // Pass the background script's screenshot method to the LLM service
        this.llmService.captureScreenshot = this.captureScreenshot.bind(this);
        this.multiAgentExecutor = new MultiAgentExecutor(this.llmService);
        this.taskRouter = new AITaskRouter(this.llmService);
        
        // Broadcast config update to all connected clients
        const hasValidKey = await this.hasValidApiKey(newConfig);
        this.connectionManager.broadcast({
          type: 'config_updated',
          provider: newConfig.aiProvider,
          hasValidKey: hasValidKey
        });
        
        console.log('✅ Services reinitialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to reinitialize services:', error);
    }
  }

  // Check if current provider has valid API key
  async hasValidApiKey(config) {
    // Check if user prefers personal API
    const userPreference = await this.getUserAPIPreference();
    
    // If user prefers personal API, check for personal API keys
    if (userPreference) {
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
    
    // If user prefers DeepHUD API or no personal API keys, always return true
    // (DeepHUD API doesn't require API keys, it uses session authentication)
    return true;
  }

  async getUserAPIPreference() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['userPreferPersonalAPI'], (result) => {
        resolve(result.userPreferPersonalAPI || false);
      });
    });
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

  // Helper function to notify content scripts about agent status
  async notifyContentScripts(messageType) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: messageType });
      }
    } catch (error) {
      console.log('Could not notify content script:', error.message);
    }
  }

  // Helper function to show signin popup
  async showSigninPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_show_signin_popup' });
      }
    } catch (error) {
      console.log('Could not show signin popup:', error.message);
    }
  }

  // Helper function to hide signin popup
  async hideSigninPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_hide_signin_popup' });
      }
    } catch (error) {
      console.log('Could not hide signin popup:', error.message);
    }
  }

  // Helper function to show approval popup
  async showApprovalPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_show_approval_popup' });
      }
    } catch (error) {
      console.log('Could not show approval popup:', error.message);
    }
  }

  // Helper function to hide approval popup
  async hideApprovalPopup() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_hide_approval_popup' });
      }
    } catch (error) {
      console.log('Could not hide approval popup:', error.message);
    }
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
          isTyping: true,
          activeTaskId: taskId,
          taskStartTime: Date.now(),
          sessionId: this.connectionManager.getCurrentSession()
        });
        
        // Notify content scripts to show popup
        await this.notifyContentScripts('__agent_show_popup');
        
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
            isTyping: false,
            activeTaskId: null,
            taskStartTime: null,
            sessionId: null,
            taskStatus: null
          });
          
          // Notify content scripts to hide popup
          await this.notifyContentScripts('__agent_hide_popup');
          await this.hideSigninPopup();
          await this.hideApprovalPopup();
          
          // Get progress information for cancellation message
          let progressInfo = '';
          if (this.multiAgentExecutor) {
            const currentStep = this.multiAgentExecutor.currentStep || 0;
            const executionHistory = this.multiAgentExecutor.executionHistory || [];
            
            if (currentStep > 0) {
              const successfulSteps = executionHistory.filter(h => h.success).length;
              const failedSteps = executionHistory.filter(h => !h.success).length;
              
              progressInfo = `Completed ${currentStep} steps`;
              if (successfulSteps > 0) {
                progressInfo += ` (${successfulSteps} successful`;
                if (failedSteps > 0) {
                  progressInfo += `, ${failedSteps} failed`;
                }
                progressInfo += ')';
              }
              
              // Add more context about what was accomplished
              if (successfulSteps > 0) {
                const lastSuccessfulAction = executionHistory.findLast(h => h.success);
                if (lastSuccessfulAction) {
                  progressInfo += ` - Last successful action: ${lastSuccessfulAction.action || 'unknown'}`;
                }
              }
            }
          }
          
          this.connectionManager.broadcast({
            type: 'task_cancelled',
            message: 'Task cancelled by user',
            cancelled: cancelled,
            progress: progressInfo || 'No progress made'
          });
          
          console.log(`✅ Task ${activeTaskId} cancelled: ${cancelled}`);
        } else {
          console.log('⚠️ No active task to cancel');
        }
        break;

      case 'resume_task':
        console.log('▶️ Received resume_task request');
        const pausedTaskId = this.connectionManager.getActiveTask();
        if (pausedTaskId) {
          // Resume execution by continuing with the current state
          this.connectionManager.broadcast({
            type: 'task_resumed',
            message: 'Task execution resumed'
          });
          
          // Update execution state
          await chrome.storage.local.set({
            isExecuting: true,
            isTyping: true
          });
          
          // Hide any pause popups and show main popup again
          await this.hideSigninPopup();
          await this.hideApprovalPopup();
          await this.notifyContentScripts('__agent_show_popup');
          
          // Resume the task by calling the executor's resume method
          if (this.backgroundTaskManager && this.backgroundTaskManager.resumeTask) {
            const resumed = this.backgroundTaskManager.resumeTask(pausedTaskId);
            if (resumed) {
              console.log(`✅ Task ${pausedTaskId} resumed successfully`);
              
              // Get the task and restart execution with the paused state
              const task = this.backgroundTaskManager.runningTasks.get(pausedTaskId);
              if (task && task.executor) {
                // Check if we have paused state OR if this is a fresh resume
                const hasPausedState = task.executor.pausedPlan && task.executor.pausedTask && task.executor.pausedState;
                if (hasPausedState) {
                  console.log('🔄 Restarting execution with paused state...');
                  
                  // Restart the execution loop with the paused plan and state
                  setTimeout(async () => {
                    try {
                      // Store paused state before clearing
                      const pausedPlan = task.executor.pausedPlan;
                      const pausedState = task.executor.pausedState;
                      
                      console.log('🔄 Resuming with paused plan:', {
                        hasBatchActions: pausedPlan?.batch_actions?.length > 0,
                        batchActions: pausedPlan?.batch_actions,
                        pauseReason: pausedPlan?.pause_reason,
                        pauseDescription: pausedPlan?.pause_description
                      });
                      
                      // Clear paused state to prevent re-pausing on same condition
                      task.executor.pausedPlan = null;
                      task.executor.pausedTask = null;
                      task.executor.pausedState = null;
                      
                      // Restore the execution state for resumption
                      if (pausedPlan) {
                        task.executor.currentBatchPlan = pausedPlan;
                      }
                      if (pausedState) {
                        task.executor.lastPageState = pausedState;
                      }
                      
                      // Actually resume execution by calling execute method
                      console.log('🔄 Calling execute method to resume task...');
                      const result = await task.executor.execute(
                        task.executor.currentUserTask, 
                        this.connectionManager, 
                        pausedPlan, 
                        true // isResume = true
                      );
                      
                      // Only clean up if task is actually completed (not paused again)
                      if (result && result.success !== false && result.reason !== 'paused') {
                        // Clean up after execution completes
                        this.activeTasks.delete(pausedTaskId);
                        this.connectionManager.setActiveTask(null);
                        
                        // Clear execution state from storage
                        await chrome.storage.local.set({
                          isExecuting: false,
                          activeTaskId: null,
                          taskStartTime: null
                        });
                        
                        // Notify content scripts to hide popup
                        await this.notifyContentScripts('__agent_hide_popup');
                      }
                      
                    } catch (error) {
                      console.error('❌ Error during resumed execution:', error);
                      this.connectionManager.broadcast({
                        type: 'task_error',
                        error: error.message,
                        taskId: pausedTaskId
                      });
                    }
                  }, 100); // Small delay to ensure UI updates
                } else {
                  console.log('⚠️ No paused state found, but task exists - continuing execution');
                  // Continue with normal execution flow
                  setTimeout(async () => {
                    try {
                      const result = await task.executor.execute(
                        task.executor.currentUserTask, 
                        this.connectionManager, 
                        null, 
                        true // isResume = true
                      );
                      
                      // Only clean up if task is actually completed (not paused again)
                      if (result && result.success !== false && result.reason !== 'paused') {
                        // Clean up after execution completes
                        this.activeTasks.delete(pausedTaskId);
                        this.connectionManager.setActiveTask(null);
                        
                        // Clear execution state from storage
                        await chrome.storage.local.set({
                          isExecuting: false,
                          activeTaskId: null,
                          taskStartTime: null
                        });
                        
                        // Notify content scripts to hide popup
                        await this.notifyContentScripts('__agent_hide_popup');
                      }
                    } catch (error) {
                      console.error('❌ Error during resumed execution:', error);
                      this.connectionManager.broadcast({
                        type: 'task_error',
                        error: error.message,
                        taskId: pausedTaskId
                      });
                    }
                  }, 100);
                }
              } else {
                console.log('⚠️ Task or executor not found');
              }
            } else {
              console.log('⚠️ Failed to resume task');
            }
          }
        } else {
          console.log('⚠️ No paused task to resume');
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
          taskStatus: null,
          isTyping: false,
          chatHistory: [] // Only clear current chat
        });
        
        // Notify content scripts to hide popup
        await this.notifyContentScripts('__agent_hide_popup');
        await this.hideSigninPopup();
        await this.hideApprovalPopup();
        
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
        const executionState = await chrome.storage.local.get([
          'isExecuting', 
          'activeTaskId', 
          'sessionId',
          'isTyping',
          'taskStatus'
        ]);
        
        this.connectionManager.safePortMessage(port, {
          type: 'status_response',
          status: status,
          isExecuting: executionState.isExecuting || false,
          isTyping: executionState.isTyping || false,
          taskStatus: executionState.taskStatus || null,
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

      const currentState = await this.multiAgentExecutor.getCurrentState();
      try {
        await this.multiAgentExecutor.clearElementHighlighting();
      } catch (error) {
        console.error('Failed to clear element highlighting:', error);
      }
      
      console.log('🧠 Making single intelligent routing call with detailed page state...');
      const intelligentResult = await this.taskRouter.analyzeAndRoute(task, currentState);
      
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
          strategy: intelligentResult.response.strategy,
          done: intelligentResult.response.done || false,
          next_action: intelligentResult.response.next_action,
          direct_url: intelligentResult.response.direct_url,
          index: intelligentResult.response.index || null,
          selector: intelligentResult.response.selector || null,
          text: intelligentResult.response.text || "",
          direction: intelligentResult.response.direction || "",
          amount: intelligentResult.response.amount || 0,
          duration: intelligentResult.response.duration || 0,
          requires_auth: intelligentResult.response.requires_auth,
          navigation_needed: intelligentResult.response.navigation_needed,
          analysis_result: intelligentResult.response.analysis_result || null
        };
        
        console.log('🎯 Initial plan created:', {
          observation: initialPlan.observation,
          strategy: initialPlan.strategy,
          done: initialPlan.done,
          next_action: initialPlan.next_action,
          direct_url: initialPlan.direct_url,
          index: initialPlan.index,
          selector: initialPlan.selector,
          text: initialPlan.text,
          direction: initialPlan.direction,
          amount: initialPlan.amount,
          duration: initialPlan.duration,
          requires_auth: initialPlan.requires_auth,
          navigation_needed: initialPlan.navigation_needed,
          analysis_result: initialPlan.analysis_result
        });

        // Check if this is an analytical task that's already complete
        if (initialPlan.done && (initialPlan.next_action === 'complete' || !initialPlan.next_action)) {
          console.log('🔍 Analytical task completed at router level');
          
          const finalResult = {
            success: true,
            response: initialPlan.analysis_result || initialPlan.observation,
            reason: initialPlan.strategy,
            steps: 1,
            confidence: intelligentResult.confidence,
            isMarkdown: true
          };
          
          this.connectionManager.broadcast({
            type: 'task_complete',
            result: finalResult,
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
          
          // Notify content scripts to hide popup
          await this.notifyContentScripts('__agent_hide_popup');
          
          return;
        }

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
      
      // Clear element highlighting on error
      if (this.multiAgentExecutor && typeof this.multiAgentExecutor.clearElementHighlighting === 'function') {
        this.multiAgentExecutor.clearElementHighlighting().catch(err => 
          console.warn('Failed to clear highlighting on error:', err)
        );
      }
      
      // Clear execution state from storage on error
      await chrome.storage.local.set({
        isExecuting: false,
        activeTaskId: null,
        taskStartTime: null,
        sessionId: null
      });
      
      // Notify content scripts to hide popup on error
      await this.notifyContentScripts('__agent_hide_popup');
      
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

  // Enhanced error formatting with demo responses
  formatErrorForUser(error) {
    const errorMessage = error.message || 'Unknown error';
    const timestamp = new Date().toLocaleTimeString();
    
    // Handle empty responses from Gemini
    if (errorMessage.includes('Empty response') || errorMessage.includes('missing content parts')) {
      return `🤖 **AI Model Error** (${timestamp})

The AI model returned an empty or invalid response.

**What happened:**
• The model failed to generate a complete response
• This can happen with complex tasks or when the model is overloaded
• Original error: ${errorMessage}

**What you can do:**
• Try again - these errors are often temporary
• Break your request into smaller, simpler steps
• Try a different AI model in Settings
• Consider using your personal API key for better reliability`;
    }

    // Handle MAX_TOKENS errors
    if (errorMessage.includes('MAX_TOKENS') || errorMessage.includes('maximum token limit')) {
      return `📝 **Response Too Long** (${timestamp})

The AI model's response exceeded its length limit.

**What happened:**
• Your task requires a longer response than the model can provide
• The model stopped mid-response to avoid exceeding limits
• Original error: ${errorMessage}

**What you can do:**
• Break your task into smaller steps
• Make your request more specific
• Try a different model with higher limits
• Use simpler instructions`;
    }
    
    // Handle JSON parsing errors specifically
    if (errorMessage.includes('JSON') || errorMessage.includes('parse') || errorMessage.includes('SyntaxError')) {
      return `🔧 **Response Parsing Error** (${timestamp})

The AI model's response couldn't be processed due to formatting issues.

**What happened:**
• The AI response was incomplete or malformed
• This often occurs with complex tasks or when the model is overloaded

**What you can do:**
• Try again with a simpler, more specific task
• Break complex requests into smaller steps
• Wait a moment and retry the same task

**Technical Details:** ${errorMessage}`;
    }
    
    // Handle response truncation/incompleteness
    if (errorMessage.includes('incomplete') || errorMessage.includes('truncated') || errorMessage.includes('cut off')) {
      return `✂️ **Incomplete Response Error** (${timestamp})

The AI model provided an incomplete response, likely due to length limits.

**What happened:**
• The response was cut off before completion
• Complex tasks may exceed response limits

**What you can do:**
• Try breaking your task into smaller, simpler steps
• Reduce the complexity of your request
• Retry with more specific instructions

**Technical Details:** ${errorMessage}`;
    }
    
    // Handle API-specific errors with more detail
    if (errorMessage.includes('429')) {
      return `⚠️ **Rate Limit Exceeded** (${timestamp})

The AI service is currently receiving too many requests. This is temporary.

**What you can do:**
• Wait 1-2 minutes and try again
• Try a simpler task to reduce processing time
• Check if you have multiple agents running
• Consider using your personal API key in Settings

**Technical Details:** ${errorMessage}`;
    }
    
    if (errorMessage.includes('500') || errorMessage.includes('502') || errorMessage.includes('503')) {
      return `🚫 **AI Service Temporarily Unavailable** (${timestamp})

The AI provider is experiencing technical difficulties.

**What you can do:**
• Try again in 5-10 minutes
• Switch to a different AI provider in settings
• Use your personal API key for more reliability
• Check the service status page

**Technical Details:** ${errorMessage}`;
    }
    
    if (errorMessage.includes('401') || errorMessage.includes('authentication') || errorMessage.includes('API key')) {
      return `🔑 **Authentication Failed** (${timestamp})

Your API key is invalid or missing.

**What you can do:**
• Go to Settings and check your API key
• Make sure the key is copied correctly (no extra spaces)
• Verify the key is active on your AI provider's dashboard
• Try using the free trial option instead

**Technical Details:** ${errorMessage}`;
    }
    
    if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
      return `🚫 **Access Denied** (${timestamp})

Your API key doesn't have the required permissions.

**What you can do:**
• Check your AI provider's billing/usage limits
• Ensure your API key has proper permissions
• Contact your AI provider if you're within limits
• Try using the free trial option

**Technical Details:** ${errorMessage}`;
    }
    
    if (errorMessage.includes('400') || errorMessage.includes('invalid')) {
      return `❌ **Invalid Request** (${timestamp})

The request couldn't be processed due to formatting issues.

**What you can do:**
• Try rephrasing your task more clearly
• Use simple commands like "search for X on Y"
• Avoid special characters in your request
• Make sure your task is specific and actionable

**Technical Details:** ${errorMessage}`;
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return `⏱️ **Network Timeout** (${timestamp})

The request took too long to process.

**What you can do:**
• Check your internet connection
• Try the task again (it may work now)
• Break complex tasks into smaller steps
• Ensure you're not behind a restrictive firewall

**Technical Details:** ${errorMessage}`;
    }
    
    // Handle model-specific errors (Gemini, GPT, Claude)
    if (errorMessage.includes('quota') || errorMessage.includes('usage') || errorMessage.includes('limit')) {
      return `📊 **Usage Limit Reached** (${timestamp})

You've reached your API usage limit for this period.

**What you can do:**
• Wait for your quota to reset (usually monthly)
• Upgrade your API plan with your provider
• Switch to a different AI provider in Settings
• Use the free trial option

**Technical Details:** ${errorMessage}`;
    }
    
    if (errorMessage.includes('model') || errorMessage.includes('unsupported') || errorMessage.includes('deprecated')) {
      return `🤖 **Model Error** (${timestamp})

The selected AI model is not available or supported.

**What you can do:**
• Try switching to a different model in Settings
• Update your API configuration
• Check if the model name is correct
• Use the default model instead

**Technical Details:** ${errorMessage}`;
    }
    
    // For any other error, show enhanced message with demo
    return `❌ **Unexpected Error** (${timestamp})

Something went wrong while processing your request.

**What you can do:**
• Try your request again
• Simplify the task if it's complex
• Check the browser console for more details
• Report this issue if it persists

**Technical Details:** ${errorMessage}`;
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

        case 'START_DEEPHUD_LOGIN':
          // Handle authentication in background script context
          try {
            const authUrl = 'https://nextjs-app-410940835135.us-central1.run.app/ext/sign-in';
            
            // Create new tab for authentication
            const tab = await chrome.tabs.create({ 
              url: authUrl, 
              active: true 
            });

            // Poll for authentication success
            const checkAuth = async () => {
              try {
                // Validate session by attempting to fetch user data
                const response = await fetch('https://nextjs-app-410940835135.us-central1.run.app/api/user/', {
                  credentials: 'include'
                });
                
                if (response.ok) {
                  // Authentication successful, close tab
                  try { 
                    if (tab?.id) {
                      await chrome.tabs.remove(tab.id);
                    }
                  } catch (closeError) {
                    console.warn('Could not close auth tab:', closeError);
                  }
                  return { success: true };
                }
              } catch (error) {
                console.warn('Error checking auth:', error);
              }
              return { success: false };
            };

            // Poll every 2 seconds
            const pollInterval = setInterval(async () => {
              const authResult = await checkAuth();
              if (authResult.success) {
                clearInterval(pollInterval);
                
                // Get user data and store it
                try {
                  const userResponse = await fetch('https://nextjs-app-410940835135.us-central1.run.app/api/user/', {
                    credentials: 'include'
                  });
                  
                  if (userResponse.ok) {
                    const userData = await userResponse.json();
                    
                    // Store complete user data in chrome.storage.local
                    await chrome.storage.local.set({
                      userAuth: {
                        user: userData.user,
                        organizations: userData.organizations || [],
                        timestamp: Date.now()
                      },
                      authData: {
                        user: userData.user,
                        timestamp: Date.now()
                      }
                    });
                    
                    sendResponse({ success: true, message: 'Authentication successful', user: userData.user });
                  } else {
                    sendResponse({ success: false, error: 'Failed to get user data' });
                  }
                } catch (error) {
                  sendResponse({ success: false, error: 'Failed to get user data: ' + error.message });
                }
              }
            }, 2000);

            // Timeout after 5 minutes
            setTimeout(() => {
              clearInterval(pollInterval);
              sendResponse({ success: false, error: 'Authentication timeout' });
            }, 300000);

          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
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
    const hasValidKey = await this.hasValidApiKey(config);
    
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
        aiProvider: config.aiProvider || 'anthropic',
        hasValidKey: hasValidKey
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

  hasMarkdownContent(content) {
    if (!content || typeof content !== 'string') {
      return false;
    }
    
    // Check for common markdown patterns
    const markdownPatterns = [
      /\*\*(.*?)\*\*/, // bold
      /\*(.*?)\*/, // italic
      /`(.*?)`/, // inline code
      /```[\s\S]*?```/, // code blocks
      /^#{1,6}\s/, // headers
      /^[-*+]\s/, // unordered lists
      /^\d+\.\s/, // ordered lists
      /\[(.*?)\]\((.*?)\)/, // links
      /!\[(.*?)\]\((.*?)\)/, // images
      /^\|.*\|$/, // tables
      /^>/, // blockquotes
    ];
    
    return markdownPatterns.some(pattern => pattern.test(content));
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

