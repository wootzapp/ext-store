/* global chrome */
import { useState, useEffect, useCallback } from 'react';
import BrowserStorage from '../services/storage/browserStorage';

const useAgent = () => {
  const [agent, setAgent] = useState(null);
  const [storage] = useState(new BrowserStorage());
  const [status, setStatus] = useState({
    isRunning: false,
    hasAgent: false,
    config: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAgent = async () => {
      setAgent(null);
      await updateStatus();
    };
    
    initAgent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendMessageToBackground = (message) => {    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  };

  const updateStatus = async (agentInstance = agent) => {
    try {
      const response = await sendMessageToBackground({ action: 'AGENT_STATUS' });
      setStatus(response);
    } catch (error) {
      console.error('Error getting agent status:', error);
      setStatus({
        isRunning: false,
        hasAgent: false,
        config: {}
      });
    }
  };

  const startAgent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentConfig = await storage.getConfig();
      console.log('Starting agent with config:', currentConfig);
      
      const response = await sendMessageToBackground({
        action: 'AGENT_START',
        config: currentConfig
      });
      
      if (response.success) {
        await updateStatus();
      } else {
        setError(response.error);
      }
      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const stopAgent = async () => {
    console.log('useAgent: Stop agent called');
    setLoading(true);
    setError(null);
    
    try {
      console.log('useAgent: Sending AGENT_STOP to background script');
      const response = await sendMessageToBackground({
        action: 'AGENT_STOP'
      });
      
      console.log('useAgent: Background script response:', response);
      
      if (response.success) {
        await updateStatus();
      } else {
        setError(response.error);
      }
      return response;
    } catch (err) {
      console.error('useAgent: Error in stopAgent:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const postTweet = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sendMessageToBackground({
        action: 'GENERATE_AND_POST_TWEET'
      });
      
      if (!response.success) {
        setError(response.error);
      }
      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await sendMessageToBackground({
        action: 'UPDATE_CONFIG',
        config: newConfig
      });
      
      if (response.success) {
        await updateStatus();
      } else {
        setError(response.error);
      }
      return response;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // NEW: Add postTweetViaTab method
  const postTweetViaTab = useCallback(async (content) => {
    try {
      const response = await sendMessageToBackground({
        action: 'POST_TWEET_VIA_TAB',
        content: content
      });
        return response;
    } catch (error) {
      console.error('useAgent: Failed to post tweet via tab:', error);
      return { success: false, error: error.message };
    }
  }, [agent]);

  return {
    agent,
    status,
    loading,
    error,
    startAgent,
    stopAgent,
    postTweet,
    updateConfig,
    updateStatus,
    postTweetViaTab // NEW: Add this to the return object
  };
};

export default useAgent;