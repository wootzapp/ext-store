/* global chrome */
import { useState, useEffect, useCallback } from 'react';

export const useChatHistory = () => {
  const [chatHistories, setChatHistories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChatHistories = useCallback(async () => {
    try {
      setLoading(true);
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['chatHistories']);
        const histories = result.chatHistories || [];
        console.log('Loaded chat histories:', histories.length, 'conversations');
        const sortedHistories = histories.sort((a, b) => b.updatedAt - a.updatedAt);
        setChatHistories(sortedHistories);
      }
    } catch (error) {
      console.error('Error loading chat histories:', error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies to prevent loops

  useEffect(() => {
    loadChatHistories();
  }, []); // Only run once on mount

  const saveChatHistory = useCallback(async (messages, title = null) => {
    if (!messages || messages.length === 0) return null;

    try {
      const chatId = Date.now().toString();
      const firstUserMessage = messages.find(msg => msg.type === 'user');
      const autoTitle = firstUserMessage?.content.substring(0, 50) + 
                       (firstUserMessage?.content.length > 50 ? '...' : '');

      const chatHistory = {
        id: chatId,
        title: title || autoTitle || 'New Chat',
        messages: messages,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Get fresh data from storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['chatHistories']);
        const currentHistories = result.chatHistories || [];
        const updatedHistories = [chatHistory, ...currentHistories].slice(0, 50);
        
        // Update storage
        await chrome.storage.local.set({ chatHistories: updatedHistories });
        
        // Update state
        const sortedHistories = updatedHistories.sort((a, b) => b.updatedAt - a.updatedAt);
        setChatHistories(sortedHistories);
      }

      return chatId;
    } catch (error) {
      console.error('Error saving chat history:', error);
      return null;
    }
  }, []);

  const updateChatHistory = useCallback(async (chatId, messages) => {
    try {
      // Get fresh data from storage
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['chatHistories']);
        const currentHistories = result.chatHistories || [];
        
        const updatedHistories = currentHistories.map(chat => 
          chat.id === chatId 
            ? { ...chat, messages, updatedAt: Date.now() }
            : chat
        );
        
        // Update storage
        await chrome.storage.local.set({ chatHistories: updatedHistories });
        
        // Update state
        const sortedHistories = updatedHistories.sort((a, b) => b.updatedAt - a.updatedAt);
        setChatHistories(sortedHistories);
      }
    } catch (error) {
      console.error('Error updating chat history:', error);
    }
  }, []);

  const deleteChatHistory = useCallback(async (chatId) => {
    try {
      const updatedHistories = chatHistories.filter(chat => chat.id !== chatId);
      setChatHistories(updatedHistories);

      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ chatHistories: updatedHistories });
      }
    } catch (error) {
      console.error('Error deleting chat history:', error);
    }
  }, [chatHistories]);

  const clearAllChatHistories = useCallback(async () => {
    try {
      setChatHistories([]);
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(['chatHistories']);
      }
    } catch (error) {
      console.error('Error clearing chat histories:', error);
    }
  }, []);

  const getChatHistory = useCallback((chatId) => {
    return chatHistories.find(chat => chat.id === chatId);
  }, [chatHistories]);

  return {
    chatHistories,
    loading,
    saveChatHistory,
    deleteChatHistory,
    clearAllChatHistories,
    getChatHistory,
    updateChatHistory,
    loadChatHistories
  };
}; 