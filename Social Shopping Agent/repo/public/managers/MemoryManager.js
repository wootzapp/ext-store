export class MemoryManager {
    constructor() {
      this.messages = [];
      this.proceduralSummaries = [];
      this.maxMessages = 50;  
      this.maxSummaries = 10;     
      this.stepCounter = 0;
      this.taskHistory = [];     
      this.currentTaskState = null; 
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
        proceduralSummaries: this.proceduralSummaries.slice(-10),
        currentStep: this.stepCounter
      };
    }
  
    // Enhanced context compressor with increased limits
    compressForPrompt(maxTokens = 2000) {
      const ctx = this.getContext();
      const json = JSON.stringify(ctx);
      if (json.length > maxTokens * 4 && ctx.proceduralSummaries.length) {
        ctx.proceduralSummaries.shift();
      }
      while (JSON.stringify(ctx).length > maxTokens * 4 && ctx.recentMessages.length > 10) {
        ctx.recentMessages.shift();
      }
      
      ctx.taskState = this.currentTaskState;
      ctx.taskHistory = this.taskHistory.slice(-5); 
      
      return ctx;
    }
  
    clear() {
      this.messages = [];
      this.proceduralSummaries = [];
      this.stepCounter = 0;
      this.taskHistory = [];
      this.currentTaskState = null;
    }
  
    setCurrentTask(task) {
      this.currentTaskState = {
        originalTask: task,
        components: this.decomposeTask(task),
        completedComponents: [],
        startTime: Date.now()
      };
    }
  
    markComponentCompleted(component, evidence) {
      if (this.currentTaskState) {
        this.currentTaskState.completedComponents.push({
          component: component,
          evidence: evidence,
          timestamp: Date.now(),
          step: this.stepCounter
        });
        this.taskHistory.push({
          component: component,
          evidence: evidence,
          timestamp: Date.now()
        });
      }
    }
  
    decomposeTask(task) {
      const taskLower = task.toLowerCase();
      const components = [];
      
      // Navigation component
      if (taskLower.includes('go to') || taskLower.includes('open') || taskLower.includes('visit')) {
        components.push('navigate_to_site');
      }
      
      // Search component
      if (taskLower.includes('search') || taskLower.includes('find') || taskLower.includes('look for')) {
        components.push('perform_search');
      }
      
      // Click/interaction component
      if (taskLower.includes('click') || taskLower.includes('select') || taskLower.includes('choose')) {
        components.push('interact_with_element');
      }
      
      // Data extraction component
      if (taskLower.includes('get') || taskLower.includes('extract') || taskLower.includes('show')) {
        components.push('extract_information');
      }
      
      // Social media components
      if (taskLower.includes('post') || taskLower.includes('tweet') || taskLower.includes('share')) {
        components.push('create_post');
      }
      
      // Shopping components
      if (taskLower.includes('buy') || taskLower.includes('purchase') || taskLower.includes('cart')) {
        components.push('shopping_action');
      }
      
      return components.length > 0 ? components : ['complete_task'];
    }
  }