/* global chrome */
import { useState, useEffect, useCallback } from 'react';
import { useChatHistory } from './useChatHistory';

export const useChat = (chatId = null) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(chatId);
  const { saveChatHistory, updateChatHistory } = useChatHistory();

  useEffect(() => {
    // Clear existing messages before loading new ones
    setMessages([]);
    
    if (chatId) {
      loadChatFromHistory(chatId);
    } else {
      loadCurrentSessionMessages();
    }
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Add cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear messages when component unmounts
      setMessages([]);
    };
  }, []);

  const loadChatFromHistory = useCallback(async (id) => {
    try {
      setLoading(true);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['chatHistories']);
        const histories = result.chatHistories || [];
        const chatHistory = histories.find(chat => chat.id === id);
        
        if (chatHistory && chatHistory.messages) {
          setMessages(chatHistory.messages);
          setCurrentChatId(id);
          console.log('Loaded chat history:', chatHistory.title, 'with', chatHistory.messages.length, 'messages');
        } else {
          console.warn('Chat history not found for ID:', id);
          setMessages([]);
          setCurrentChatId(null);
        }
      }
    } catch (error) {
      console.error('Error loading chat from history:', error);
      setMessages([]);
      setCurrentChatId(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load current session messages (for active tasks)
  const loadCurrentSessionMessages = useCallback(async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Check if there's an active connection that will handle message restoration
        const storage = await chrome.storage.local.get(['isExecuting', 'activeTaskId', 'currentSessionMessages', 'disconnectedMessages']);
        
        // If there's an active task OR disconnected messages exist, don't load messages here
        // ConnectionManager will handle restoration via restore_message events
        if ((storage.isExecuting && storage.activeTaskId) || storage.disconnectedMessages?.length > 0) {
          console.log('Active task or disconnected messages detected - skipping message loading, will receive via restore_message events');
          setLoading(false);
          return;
        }
        
        const result = await chrome.storage.local.get(['currentSessionMessages', 'lastMessageTimestamp']);
        if (result.currentSessionMessages && Array.isArray(result.currentSessionMessages)) {
          // Remove duplicates by message ID and ensure all required fields are present
          const uniqueMessages = result.currentSessionMessages
            .filter((message, index, self) => 
              index === self.findIndex((m) => m.id === message.id))
            .filter(message => {
              // Validate message structure
              const isValid = message && 
                            message.id && 
                            message.type && 
                            message.timestamp;
              
              // Special handling for task_complete messages that might have content in result
              if (message.type === 'task_complete' && message.result) {
                const responseContent = message.result.response || message.result.message;
                if (responseContent && !message.content) {
                  message.content = responseContent;
                  message.isMarkdown = message.result.isMarkdown || false;
                }
              }
              
              // Ensure content exists (either directly or in result)
              const hasContent = message.content !== undefined || 
                               (message.result && (message.result.response || message.result.message));
              
              if (!isValid || !hasContent) {
                console.warn('Filtered out invalid message:', message);
                return false;
              }
              
              return true;
            })
            .map(message => {
              // Ensure all required fields are present with defaults
              let content = message.content;
              
              // For task_complete messages, extract content from result if not directly available
              if (message.type === 'task_complete' && message.result && !content) {
                content = message.result.response || message.result.message;
              }
              
              return {
                ...message,
                id: message.id,
                type: message.type,
                content: content || '',
                timestamp: message.timestamp,
                isMarkdown: message.isMarkdown || false,
                // Preserve state information for pause/approval messages
                resumed: message.resumed || false,
                approved: message.approved || false,
                declined: message.declined || false,
                // Preserve other state fields
                pauseReason: message.pauseReason,
                pauseDescription: message.pauseDescription
              };
            })
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          
          setMessages(uniqueMessages);
          console.log('Loaded current session:', uniqueMessages.length, 'unique messages');
          
          // Debug: Check for approval/pause messages and their states
          const approvalMessages = uniqueMessages.filter(msg => msg.type === 'approval' || msg.type === 'pause');
          if (approvalMessages.length > 0) {
            console.log('🔍 Found approval/pause messages with states:', approvalMessages.map(msg => ({
              id: msg.id,
              type: msg.type,
              approved: msg.approved,
              declined: msg.declined,
              resumed: msg.resumed,
              pauseReason: msg.pauseReason,
              pauseDescription: msg.pauseDescription
            })));
          }
          
          console.log('📥 Loaded messages from storage:', {
            totalMessages: uniqueMessages.length,
            approvalMessages: approvalMessages.length,
            messageTypes: uniqueMessages.map(m => m.type)
          });
          
          // Update storage with validated messages
          if (uniqueMessages.length !== result.currentSessionMessages.length) {
            console.log('Updated storage with validated messages');
            await chrome.storage.local.set({ currentSessionMessages: uniqueMessages });
          }
        }
      }
    } catch (error) {
      console.error('Error loading current session messages:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = useCallback((message) => {
    // If message already has an ID, use it; otherwise generate new one
    const messageId = message.id || Date.now().toString(36) + Math.random().toString(36).substr(2);
    const timestamp = message.timestamp || Date.now();
    
    // Extract content from complex message structures
    let content = message.content;
    let isMarkdown = message.isMarkdown || false;
    
    // For task_complete messages, extract content from result if not directly available
    if (message.type === 'task_complete' && message.result && !content) {
      content = message.result.response || message.result.message;
      isMarkdown = message.result.isMarkdown || false;
    }
    
    // Ensure all required fields are present with proper types
    const newMessage = {
      ...message,
      id: messageId,
      type: message.type || 'system',
      content: content || '',
      timestamp: timestamp,
      isMarkdown: isMarkdown,
      // Preserve state information for pause/approval messages
      resumed: message.resumed || false,
      approved: message.approved || false,
      declined: message.declined || false
    };
    
    // Validate message structure
    if (!newMessage.type || !newMessage.content) {
      console.error('Invalid message structure:', newMessage);
      return;
    }
    
    setMessages(prev => {
      // Check if message with same ID already exists
      const messageExists = prev.some(m => m.id === messageId);
      if (messageExists) {
        console.log('Skipping duplicate message:', messageId);
        return prev;
      }
      
      const updated = [...prev, newMessage];
      const limited = updated.slice(-100); // Keep last 100 messages
      
      // Save current session messages to storage for persistence during active tasks
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ 
          currentSessionMessages: limited,
          lastMessageTimestamp: timestamp // Store last message timestamp
        }).catch(console.error);
      }
      
      return limited;
    });
  }, []);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    setCurrentChatId(null);
  
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Clear session messages and ensure no duplicates remain
        await chrome.storage.local.remove(['currentSessionMessages']);
        
        // Also clear any stored disconnected messages to prevent duplicates
        await chrome.storage.local.remove(['disconnectedMessages']);
        
        console.log('Cleared all message storage');
      }
    } catch (error) {
      console.error('Error clearing current chat:', error);
    }
  }, []);

  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => {
      const updated = prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      
      // Update session storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ currentSessionMessages: updated }).catch(console.error);
      }
      
      return updated;
    });
  }, []);

  // Update message state (for pause/approval messages)
  const updateMessageState = useCallback((messageId, state) => {
    console.log('🔄 updateMessageState called:', { messageId, state });
    setMessages(prev => {
      const updated = prev.map(msg => {
        if (msg.id === messageId) {
          const newMsg = { 
            ...msg, 
            ...state,
            // Ensure timestamp is updated for state changes
            lastStateUpdate: Date.now()
          };
          console.log('📝 Updated message state:', { messageId, oldState: { approved: msg.approved, declined: msg.declined, resumed: msg.resumed }, newState: state });
          return newMsg;
        }
        return msg;
      });
      
      // Update session storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ currentSessionMessages: updated }).catch(console.error);
        console.log('💾 Message state persisted to storage');
      }
      
      return updated;
    });
  }, []);

  // Manual save function (called only when explicitly needed)
  const saveCurrentChat = useCallback(async () => {
    if (messages.length >= 1) {
      const userMessages = messages.filter(msg => msg.type === 'user' || msg.type === 'assistant');
      if (userMessages.length >= 1) {
        if (currentChatId) {
          await updateChatHistory(currentChatId, messages);
        } else {
          const newChatId = await saveChatHistory(messages);
          if (newChatId) {
            setCurrentChatId(newChatId);
          }
        }
        
        // Clear current session after saving to history
        if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.remove(['currentSessionMessages']).catch(console.error);
        }
      }
    }
  }, [messages, currentChatId, updateChatHistory, saveChatHistory]);

  return { 
    messages, 
    addMessage, 
    clearMessages, 
    updateMessage,
    updateMessageState,
    loading,
    currentChatId,
    saveCurrentChat
  };
};