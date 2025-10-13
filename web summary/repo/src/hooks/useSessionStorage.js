/* global chrome */
import { useState, useEffect, useCallback } from 'react';

export const useSessionStorage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load current session messages from storage
  const loadCurrentSessionMessages = useCallback(async () => {
    try {
      setLoading(true);
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['currentSessionMessages']);
        if (result.currentSessionMessages && Array.isArray(result.currentSessionMessages)) {
          // Validate and clean messages
          const validMessages = result.currentSessionMessages
            .filter(message => {
              // Validate message structure
              const isValid = message && 
                            message.id && 
                            message.type && 
                            message.timestamp &&
                            message.content !== undefined;
              
              if (!isValid) {
                console.warn('Filtered out invalid message:', message);
                return false;
              }
              
              return true;
            })
            .map(message => ({
                ...message,
                id: message.id,
                type: message.type,
                content: message.content || '',
                timestamp: typeof message.timestamp === 'number' ? message.timestamp : new Date(message.timestamp).getTime()
            }))
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          
          setMessages(validMessages);
          console.log('📥 Loaded current session:', validMessages.length, 'messages');
        } else {
          setMessages([]);
          console.log('📥 No current session messages found');
        }
      }
    } catch (error) {
      console.error('Error loading current session messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save messages to session storage
  const saveMessages = useCallback(async (newMessages) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Keep only the last 50 messages to prevent storage bloat
        const limitedMessages = newMessages.slice(-50);
        
        await chrome.storage.local.set({ 
          currentSessionMessages: limitedMessages,
          lastMessageTimestamp: Date.now()
        });
        
        console.log('💾 Saved session messages:', limitedMessages.length, 'messages');
      }
    } catch (error) {
      console.error('Error saving session messages:', error);
    }
  }, []);

  // Add a new message to the session
  const addMessage = useCallback((message) => {
    const messageId = message.id || Date.now().toString(36) + Math.random().toString(36).substr(2);
    const timestamp = message.timestamp ? 
      (typeof message.timestamp === 'number' ? message.timestamp : new Date(message.timestamp).getTime()) : 
      Date.now();
    
    const newMessage = {
      ...message,
      id: messageId,
      type: message.type || 'system',
      content: message.content || '',
      timestamp: timestamp
    };
    
    setMessages(prev => {
      const updated = [...prev, newMessage];
      const limited = updated.slice(-50); // Keep last 50 messages
      
      // Save to storage
      saveMessages(limited);
      
      return limited;
    });
  }, [saveMessages]);

  // Update an existing message
  const updateMessage = useCallback((messageId, updates) => {
    setMessages(prev => {
      const updated = prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      
      // Save to storage
      saveMessages(updated);
      
      return updated;
    });
  }, [saveMessages]);

  // Clear all session messages
  const clearSession = useCallback(async () => {
    setMessages([]);
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(['currentSessionMessages', 'lastMessageTimestamp']);
        console.log('🗑️ Cleared session storage');
      }
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }, []);

  // Load session on mount
  useEffect(() => {
    loadCurrentSessionMessages();
  }, [loadCurrentSessionMessages]);

  return {
    messages,
    loading,
    addMessage,
    updateMessage,
    clearSession,
    saveMessages
  };
};
