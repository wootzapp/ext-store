/* global chrome */
import { useState, useEffect } from 'react';

export const useChat = (chatId = null) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load chat history if chatId is provided
  useEffect(() => {
    if (chatId) {
      loadChatHistory(chatId);
    }
  }, [chatId]);

  const loadChatHistory = async (historyId) => {
    try {
      setLoading(true);
      const result = await chrome.storage.local.get(['chatHistories']);
      const histories = result.chatHistories || {};
      
      if (histories[historyId]) {
        setMessages(histories[historyId].messages || []);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const saveCurrentChat = async () => {
    if (messages.length === 0) return;

    try {
      const result = await chrome.storage.local.get(['chatHistories']);
      const histories = result.chatHistories || {};
      
      const chatId = chatId || Date.now().toString();
      const title = messages.find(m => m.type === 'user')?.content?.substring(0, 50) || 'New Chat';
      
      histories[chatId] = {
        id: chatId,
        title: title,
        messages: messages,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await chrome.storage.local.set({ chatHistories: histories });
      console.log('Chat saved successfully');
    } catch (error) {
      console.error('Error saving chat:', error);
    }
  };

  return {
    messages,
    addMessage,
    clearMessages,
    loading,
    saveCurrentChat
  };
};