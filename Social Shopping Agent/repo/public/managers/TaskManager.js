/* global chrome */

export class TaskManager {
  constructor() {
    this.runningTasks = new Map();
    this.taskResults = new Map();
    this.maxConcurrentTasks = 2;
    console.log('✅ TaskManager initialized');
  }

  async startTask(taskId, taskData, executor, connectionManager) {
    console.log(`🚀 TaskManager starting: ${taskId}`);
    
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
      console.log(`⚙️ TaskManager executing independently: ${taskId}`);
      
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
              
              // Notify content scripts to hide popup
              chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs.length > 0) {
                  chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_hide_popup' }).catch(err => {
                    console.log('Could not notify content script of task completion:', err.message);
                  });
                }
              });
              
              console.log(`✅ TaskManager completed: ${taskId}`);
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
      console.error(`❌ TaskManager error: ${taskId}`, error);
      
      // Clear element highlighting on error
      if (executor && typeof executor.clearElementHighlighting === 'function') {
        executor.clearElementHighlighting().catch(err => 
          console.warn('Failed to clear highlighting on error:', err)
        );
      }
      
      // Clear execution state from storage on error
      chrome.storage.local.set({
        isExecuting: false,
        activeTaskId: null,
        taskStartTime: null,
        sessionId: null
      });
      
      // Notify content scripts to hide popup on error
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_hide_popup' }).catch(err => {
            console.log('Could not notify content script of task error:', err.message);
          });
        }
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
      console.log(`🛑 TaskManager cancelling: ${taskId}`);
      
      // Clear element highlighting when cancelling
      if (typeof task.executor.clearElementHighlighting === 'function') {
        task.executor.clearElementHighlighting().catch(err => 
          console.warn('Failed to clear highlighting on cancel:', err)
        );
      }
      
      task.executor.cancel();
      task.status = 'cancelled';
      task.endTime = Date.now();
      
      this.taskResults.set(taskId, task);
      this.runningTasks.delete(taskId);
      
      // Notify content scripts to hide popup when cancelling
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id, { type: '__agent_hide_popup' }).catch(err => {
            console.log('Could not notify content script of task cancellation:', err.message);
          });
        }
      });
      
      return true;
    }
    return false;
  }

  resumeTask(taskId) {
    const task = this.runningTasks.get(taskId);
    if (task && task.executor) {
      console.log(`▶️ TaskManager resuming: ${taskId}`);
      
      // Check if task has paused state
      if (task.executor.pausedPlan && task.executor.pausedTask && task.executor.pausedState) {
        console.log('✅ Task has paused state, ready for resumption');
        return true;
      } else {
        console.warn('Task does not have paused state for resumption');
        return false;
      }
    }
    return false;
  }
}