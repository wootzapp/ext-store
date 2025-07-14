/* global chrome */
import { useState, useEffect } from 'react';

export const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['chatHistory']);
        if (result.chatHistory && Array.isArray(result.chatHistory)) {
          setMessages(result.chatHistory);
        }
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (message) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: message.timestamp || Date.now()
    };
    
    setMessages(prev => {
      const updated = [...prev, newMessage];
      
      // Keep only last 100 messages
      const limited = updated.slice(-100);
      
      // Save to storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ chatHistory: limited }).catch(console.error);
      }
      
      return limited;
    });
  };

  const clearMessages = async () => {
    setMessages([]);
    
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(['chatHistory']);
      }
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  };

  const updateMessage = (messageId, updates) => {
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, ...updates } : msg
      )
    );
  };

  return { 
    messages, 
    addMessage, 
    clearMessages, 
    updateMessage,
    loading 
  };
};