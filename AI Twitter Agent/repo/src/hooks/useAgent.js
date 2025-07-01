import { useState, useEffect, useCallback } from 'react';
import BrowserTwitterAgent from '../agents/browserTwitterAgent';
import BrowserStorage from '../services/storage/browserStorage';
import { isExtension, sendMessageToBackground } from '../utils/browserHelpers';
import { getCurrentAIConfig } from '../utils/browserHelpers';

const useAgent = () => {
  const [agent, setAgent] = useState(null);
  const [storage] = useState(new BrowserStorage()); // Add this line
  const [status, setStatus] = useState({
    isRunning: false,
    hasAgent: false,
    config: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initAgent = async () => {
      if (isExtension()) {
        // For Chrome extension, we don't need a local agent instance
        // We'll communicate directly with the background script
        setAgent(null);
        await updateStatus();
      } else {
        // For web app, use the browser agent
        const newAgent = new BrowserTwitterAgent();
        setAgent(newAgent);
        await updateStatus(newAgent);
      }
    };
    
    initAgent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateStatus = async (agentInstance = agent) => {
    if (isExtension()) {
      // Get status from background script
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
    } else if (agentInstance) {
      const newStatus = await agentInstance.getStatus();
      setStatus(newStatus);
    }
  };

  const startAgent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isExtension()) {
        // Get config from storage and send to background script
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
      } else {
        // Web app logic
        if (!agent) return;
        
        // Get current config before starting
        const currentConfig = await storage.getConfig();
        
        console.log('Starting agent with config:', currentConfig);
        
        // CRITICAL: Initialize the agent with config first
        const initResult = await agent.initialize();
        console.log('useAgent: Agent initialization result:', initResult);
        
        if (!initResult.success) {
          throw new Error(initResult.error || 'Agent initialization failed');
        }
        
        const result = await agent.start(currentConfig);
        if (result.success) {
          await updateStatus();
        } else {
          setError(result.error);
        }
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const stopAgent = async () => {
    console.log('useAgent: Stop agent called, isExtension:', isExtension());
    setLoading(true);
    setError(null);
    
    try {
      if (isExtension()) {
        // Send stop command to background script
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
      } else {
        // Web app logic
        if (!agent) return;
        
        const result = await agent.stop();
        if (result.success) {
          await updateStatus();
        } else {
          setError(result.error);
        }
        return result;
      }
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
      if (isExtension()) {
        // Send generate and post tweet command to background script
        const response = await sendMessageToBackground({
          action: 'GENERATE_AND_POST_TWEET'
        });
        
        if (!response.success) {
          setError(response.error);
        }
        return response;
      } else {
        // Web app logic
        if (!agent) {
          return { success: false, error: 'Agent not initialized' };
        }
        
        const result = await agent.generateAndPostTweetManual();
        if (!result.success) {
          setError(result.error);
        }
        return result;
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const testClaude = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (isExtension()) {
        // Get config and send test command to background script
        const currentConfig = await storage.getConfig();
        const aiConfig = getCurrentAIConfig(currentConfig);
        
        if (!aiConfig.isValid) {
          throw new Error(`${aiConfig.model} API key not configured`);
        }
        
        const response = await sendMessageToBackground({
          action: `${aiConfig.model.toUpperCase()}_GENERATE`,
          apiKey: aiConfig.apiKey,
          topic: 'Artificial Intelligence'
        });
        
        if (!response.success) {
          setError(response.error);
        }
        return response;
      } else {
        // Web app logic
        if (!agent) return;
        
        const result = await agent.testClaude();
        if (!result.success) {
          setError(result.error);
        }
        return result;
      }
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
      if (isExtension()) {
        // Send config update to background script
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
      } else {
        // Web app logic
        if (!agent) return;
        
        const result = await agent.updateConfig(newConfig);
        if (result.success) {
          await updateStatus();
        } else {
          setError(result.error);
        }
        return result;
      }
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
      if (isExtension()) {
        // Send post tweet command to background script
        const response = await sendMessageToBackground({
          action: 'POST_TWEET_VIA_TAB',
          content: content
        });
        return response;
      } else {
        // Web app logic
        if (!agent) {
          return { success: false, error: 'Agent not initialized' };
        }

        console.log('useAgent: Posting tweet via tab...');
        return await agent.postTweetViaTab(content);
      }
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
    testClaude,
    updateConfig,
    updateStatus,
    postTweetViaTab // NEW: Add this to the return object
  };
};

export default useAgent;