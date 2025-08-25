/* global chrome */

export class ConnectionManager {
  constructor(backgroundTaskManager) {
    this.connections = new Map();
    this.messageQueue = [];
    this.backgroundTaskManager = backgroundTaskManager;
    this.activeTask = null;
    this.lastSentMessageId = new Map();
    this.currentSessionId = null; // Track current session
  }

  async addConnection(connectionId, port) {
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

    try {
      // Get stored messages and execution state
      const storage = await chrome.storage.local.get([
        'currentSessionMessages',
        'isExecuting',
        'activeTaskId',
        'sessionId',
        'disconnectedMessages'
      ]);

      // Merge and deduplicate messages
      let allMessages = [];
      
      // Add current session messages first (if any)
      if (storage.currentSessionMessages?.length > 0) {
        allMessages.push(...storage.currentSessionMessages);
      }
      
      // Add disconnected messages (if any)
      if (storage.disconnectedMessages?.length > 0) {
        allMessages.push(...storage.disconnectedMessages);
      }

      // Remove duplicates and sort by timestamp
      if (allMessages.length > 0) {
        const uniqueMessages = allMessages
          .filter((message, index, self) => 
            index === self.findIndex((m) => m.id === message.id))
          .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

        console.log(`📤 Sending ${uniqueMessages.length} unique messages after deduplication`);
        
        // Store the deduplicated messages
        await chrome.storage.local.set({ currentSessionMessages: uniqueMessages });
        await chrome.storage.local.remove(['disconnectedMessages']);

        // Send messages in order
        uniqueMessages.forEach(message => {
          this.safePortMessage(port, {
            type: 'restore_message',
            message
          });
        });
      }

      // Send current execution state if needed
      if (storage.isExecuting && storage.sessionId === this.currentSessionId) {
        this.safePortMessage(port, {
          type: 'execution_state',
          isExecuting: true,
          activeTaskId: storage.activeTaskId,
          sessionId: this.currentSessionId
        });
      }

      // Send connected status
      this.safePortMessage(port, {
        type: 'connected',
        sessionId: this.currentSessionId
      });

    } catch (error) {
      console.error('Error handling connection setup:', error);
    }
  }

  async removeConnection(connectionId) {
    console.log(`🔌 Removing connection: ${connectionId}`);
    
    try {
      // Get current session messages and execution state
      const storage = await chrome.storage.local.get([
        'currentSessionMessages',
        'isExecuting',
        'activeTaskId'
      ]);
      
      const currentMessages = storage.currentSessionMessages || [];
      
      // Only store messages if there's an active task or there are messages
      if ((storage.isExecuting && storage.activeTaskId) || currentMessages.length > 0) {
        console.log(`📥 Storing ${currentMessages.length} messages for disconnected state`);
        
        // Store messages with timestamps for proper ordering
        const timestampedMessages = currentMessages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp || Date.now(),
          disconnectedAt: Date.now()
        }));
        
        await chrome.storage.local.set({
          disconnectedMessages: timestampedMessages
        });
        
        // Clear current session messages to prevent duplicates
        await chrome.storage.local.remove(['currentSessionMessages']);
      }
      
      this.connections.delete(connectionId);
      
    } catch (error) {
      console.error('Error handling connection removal:', error);
      this.connections.delete(connectionId);
    }
  }

  async broadcast(message) {
    // Add unique ID, session ID, and timestamp
    message.id = Date.now() + Math.random();
    message.sessionId = this.currentSessionId;
    message.timestamp = Date.now();
    
    let messageSent = false;
    
    // Send to all connected ports
    this.connections.forEach((connection, connectionId) => {
      if (connection.connected && this.safePortMessage(connection.port, message)) {
        messageSent = true;
        this.lastSentMessageId.set(connectionId, message.id);
      }
    });

    try {
      // Get current messages
      const storage = await chrome.storage.local.get(['currentSessionMessages']);
      let currentMessages = storage.currentSessionMessages || [];
      
      // For task_complete messages, ensure the content is properly extracted and stored
      let messageToStore = { ...message };
      
      // Special handling for task_complete messages to ensure content is accessible
      if (message.type === 'task_complete' && message.result) {
        const responseContent = message.result.response || message.result.message;
        if (responseContent) {
          // Ensure the message has the content directly accessible for restoration
          messageToStore.content = responseContent;
          messageToStore.isMarkdown = message.result.isMarkdown || false;
          console.log('📝 Storing task_complete message with extracted content:', responseContent.substring(0, 100) + '...');
        } else {
          console.warn('⚠️ task_complete message has no response content:', message.result);
        }
      }
      
      // Add new message
      currentMessages.push(messageToStore);
      
      // Remove duplicates by ID and sort by timestamp
      currentMessages = currentMessages
        .filter((msg, index, self) => 
          index === self.findIndex((m) => m.id === msg.id))
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
      
      // Keep only last 100 messages to prevent memory issues
      if (currentMessages.length > 100) {
        currentMessages = currentMessages.slice(-100);
      }
      
      // Store updated messages
      await chrome.storage.local.set({ currentSessionMessages: currentMessages });
      
      // Add to queue for future connections (only current session)
      this.messageQueue.push(messageToStore);
      
      // Keep only last 20 messages in memory queue
      if (this.messageQueue.length > 20) {
        this.messageQueue = this.messageQueue.slice(-20);
      }

      if (!messageSent) {
        console.log('📦 Message stored for background persistence:', message.type);
      }
    } catch (error) {
      console.error('Error storing message:', error);
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