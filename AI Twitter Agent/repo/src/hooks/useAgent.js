/* global chrome */
import { useState, useEffect, useCallback } from 'react';
import useConfig from './useConfig';

const useAgent = () => {
  const [status, setStatus] = useState({
    isRunning: false,
    hasAgent: false,
    config: {
      aiModel: 'Not set',
      hasValidAIKey: false,
      hasTwitterCredentials: false,
      hasInstagramCredentials: false,
      twitterTopicsCount: 0,
      instagramTopicsCount: 0,
      twitterInterval: null,
      instagramInterval: null
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { config, loadConfig } = useConfig(); // Add loadConfig to get fresh config

  // Transform config to match background script expectations
  const transformConfigForBackground = useCallback((config) => {
    if (!config) return null;
    
    console.log('useAgent: Transforming config:', config);
    
    // Handle both old flat structure and new nested structure
    if (config.ai && config.twitter) {
      // New nested structure - use as is
      console.log('useAgent: Using new nested structure');
      return config;
    } else if (config.model) {
      // Old flat structure - transform to nested
      console.log('useAgent: Transforming old flat structure');
      return {
        ai: {
          model: config.model,
          apiKeys: {
            [config.model]: config.apiKey
          }
        },
        twitter: {
          username: config.twitterUsername,
          password: config.twitterPassword,
          email: config.email,
          topics: config.topics || [],
          settings: {
            interval: config.setInterval || 30,
            style: 'professional but engaging'
          }
        },
        instagram: {
          username: config.instagramUsername || '',
          password: config.instagramPassword || '',
          email: config.instagramEmail || '',
          topics: config.instagramTopics || [],
          settings: {
            interval: config.instagramInterval || 30,
            style: config.instagramStyle || 'professional but engaging'
          }
        }
      };
    }
    
    console.log('useAgent: No valid config structure found');
    return null;
  }, []);

  // Update status when config changes
  const updateStatusFromConfig = useCallback((config) => {
    console.log('useAgent: Updating status from config:', config);
    
    if (config) {
      // Handle both old flat structure and new nested structure
      let aiModel = 'Not set';
      let hasValidAIKey = false;
      let hasTwitterCredentials = false;
      let hasInstagramCredentials = false;
      let twitterTopicsCount = 0;
      let instagramTopicsCount = 0;
      let twitterInterval = null;
      let instagramInterval = null;

      if (config.ai && (config.twitter || config.instagram)) {
        // New nested structure
        aiModel = config.ai.model || 'Not set';
        hasValidAIKey = !!config.ai.apiKeys?.[config.ai.model];
        hasTwitterCredentials = !!(config.twitter?.username && config.twitter?.password);
        hasInstagramCredentials = !!(config.instagram?.username && config.instagram?.password);
        twitterTopicsCount = config.twitter?.topics ? config.twitter.topics.length : 0;
        instagramTopicsCount = config.instagram?.topics ? config.instagram.topics.length : 0;
        twitterInterval = config.twitter?.settings?.interval;
        instagramInterval = config.instagram?.settings?.interval;
      } else if (config.model) {
        // Old flat structure
        aiModel = config.model || 'Not set';
        hasValidAIKey = !!config.apiKey;
        hasTwitterCredentials = !!(config.twitterUsername && config.twitterPassword);
        hasInstagramCredentials = !!(config.instagramUsername && config.instagramPassword);
        twitterTopicsCount = config.twitterTopics ? config.twitterTopics.length : (config.topics ? config.topics.length : 0);
        instagramTopicsCount = config.instagramTopics ? config.instagramTopics.length : 0;
        twitterInterval = config.twitterInterval || config.setInterval;
        instagramInterval = config.instagramInterval;
      }

      setStatus(prev => ({
        ...prev,
        config: {
          aiModel,
          hasValidAIKey,
          hasTwitterCredentials,
          hasInstagramCredentials,
          twitterTopicsCount,
          instagramTopicsCount,
          twitterInterval,
          instagramInterval
        }
      }));
    }
  }, []);

  const startAgent = useCallback(async (platform = 'twitter') => {
    try {
      setLoading(true);
      setError(null);
      
      // Get fresh config from storage to ensure we have the latest
      const { config: freshConfig } = await loadConfig();
      console.log(`useAgent: Starting ${platform} agent with fresh config:`, freshConfig);
      
      const transformedConfig = transformConfigForBackground(freshConfig);
      console.log(`useAgent: Transformed config for ${platform} background:`, transformedConfig);
      
      if (!transformedConfig) {
        throw new Error('No valid configuration found');
      }
      
      // Validate required fields
      if (!transformedConfig.ai?.model) {
        throw new Error('AI model not configured');
      }
      
      if (!transformedConfig.ai?.apiKeys?.[transformedConfig.ai.model]) {
        throw new Error(`${transformedConfig.ai.model} API key not configured`);
      }
      
      // Platform-specific validation
      if (platform === 'twitter') {
        if (!transformedConfig.twitter?.username || !transformedConfig.twitter?.password) {
          throw new Error('Twitter credentials not configured');
        }
        
        if (!transformedConfig.twitter?.topics || transformedConfig.twitter.topics.length === 0) {
          throw new Error('No Twitter topics configured');
        }
      } else if (platform === 'instagram') {
        if (!transformedConfig.instagram?.username || !transformedConfig.instagram?.password) {
          throw new Error('Instagram credentials not configured');
        }
        
        if (!transformedConfig.instagram?.topics || transformedConfig.instagram.topics.length === 0) {
          throw new Error('No Instagram topics configured');
        }
      }
      
      // Store config in sync storage first
      await chrome.storage.sync.set({ agentConfig: transformedConfig });
      
      // Send message to background script to start agent
      const response = await chrome.runtime.sendMessage({
        action: 'AGENT_START',
        config: transformedConfig,
        platform: platform
      });
      
      console.log(`Start ${platform} agent response:`, response);
      
      if (response.success) {
        setStatus(prev => ({ ...prev, isRunning: true }));
        return { success: true, message: response.message || `${platform} agent started successfully` };
      } else {
        throw new Error(response.error || `Failed to start ${platform} agent`);
      }
    } catch (err) {
      console.error(`Error starting ${platform} agent:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadConfig, transformConfigForBackground]);

  const stopAgent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Stopping agent');
      
      // Send message to background script to stop agent
      const response = await chrome.runtime.sendMessage({
        action: 'AGENT_STOP'
      });
      
      console.log('Stop agent response:', response);
      
      if (response.success) {
        setStatus(prev => ({ ...prev, isRunning: false }));
        return { success: true, message: response.message || 'Agent stopped successfully' };
      } else {
        throw new Error(response.error || 'Failed to stop agent');
      }
    } catch (err) {
      console.error('Error stopping agent:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const postTweet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get fresh config from storage to ensure we have the latest
      const { config: freshConfig } = await loadConfig();
      console.log('useAgent: Posting tweet with fresh config:', freshConfig);
      
      const transformedConfig = transformConfigForBackground(freshConfig);
      console.log('useAgent: Transformed config for post tweet:', transformedConfig);
      
      if (!transformedConfig) {
        throw new Error('No valid configuration found');
      }
      
      // Validate required fields
      if (!transformedConfig.ai?.model) {
        throw new Error('AI model not configured');
      }
      
      if (!transformedConfig.ai?.apiKeys?.[transformedConfig.ai.model]) {
        throw new Error(`${transformedConfig.ai.model} API key not configured`);
      }
      
      if (!transformedConfig.twitter?.username || !transformedConfig.twitter?.password) {
        throw new Error('Twitter credentials not configured');
      }
      
      if (!transformedConfig.twitter?.topics || transformedConfig.twitter.topics.length === 0) {
        throw new Error('No Twitter topics configured');
      }
      
      // Store the transformed config in sync storage first
      await chrome.storage.sync.set({ agentConfig: transformedConfig });
      
      console.log('Stored config in sync storage:', transformedConfig);
      
      // Send message to background script to post tweet
      const response = await chrome.runtime.sendMessage({
        action: 'GENERATE_AND_POST_TWEET'
      });
      
      console.log('Post tweet response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to post tweet');
      }
      
      return response;
    } catch (err) {
      console.error('Error posting tweet:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadConfig, transformConfigForBackground]);

  const checkInstagramLogin = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('useAgent: Checking Instagram login status...');
      
      // Send message to background script to check Instagram login
      const response = await chrome.runtime.sendMessage({
        action: 'CHECK_INSTAGRAM_LOGIN'
      });
      
      console.log('Instagram login check response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to check Instagram login');
      }
      
      return response;
    } catch (err) {
      console.error('Error checking Instagram login:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const postInstagramContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get fresh config from storage to ensure we have the latest
      const { config: freshConfig } = await loadConfig();
      console.log('useAgent: Posting Instagram content with fresh config:', freshConfig);
      
      const transformedConfig = transformConfigForBackground(freshConfig);
      console.log('useAgent: Transformed config for post Instagram content:', transformedConfig);
      
      if (!transformedConfig) {
        throw new Error('No valid configuration found');
      }
      
      // Validate required fields
      if (!transformedConfig.ai?.model) {
        throw new Error('AI model not configured');
      }
      
      if (!transformedConfig.ai?.apiKeys?.[transformedConfig.ai.model]) {
        throw new Error(`${transformedConfig.ai.model} API key not configured`);
      }
      
      if (!transformedConfig.instagram?.username || !transformedConfig.instagram?.password) {
        throw new Error('Instagram credentials not configured');
      }
      
      if (!transformedConfig.instagram?.topics || transformedConfig.instagram.topics.length === 0) {
        throw new Error('No Instagram topics configured');
      }
      
      // Store the transformed config in sync storage first
      await chrome.storage.sync.set({ agentConfig: transformedConfig });
      
      console.log('Stored config in sync storage:', transformedConfig);
      
      // Send message to background script to post Instagram content
      const response = await chrome.runtime.sendMessage({
        action: 'GENERATE_AND_POST_INSTAGRAM'
      });
      
      console.log('Post Instagram content response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to post Instagram content');
      }
      
      return response;
    } catch (err) {
      console.error('Error posting Instagram content:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadConfig, transformConfigForBackground]);

  const updateConfig = useCallback(async (newConfig) => {
    try {
      setError(null);
      
      console.log('Updating agent config:', newConfig);
      
      const transformedConfig = transformConfigForBackground(newConfig);
      
      if (!transformedConfig) {
        throw new Error('Invalid configuration format');
      }
      
      // Send message to background script to update config
      const response = await chrome.runtime.sendMessage({
        action: 'UPDATE_CONFIG',
        config: transformedConfig
      });
      
      console.log('Update config response:', response);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update config');
      }
      
      // Update local status with new config
      updateStatusFromConfig(newConfig);
      
      return response;
    } catch (err) {
      console.error('Error updating config:', err);
      setError(err.message);
      throw err;
    }
  }, [transformConfigForBackground, updateStatusFromConfig]);

  // Listen for status updates from background script
  useEffect(() => {
    const handleMessage = (message, sender, sendResponse) => {
      console.log('useAgent received message:', message);
      
      if (message.type === 'agentStatus') {
        setStatus(message.status);
      } else if (message.type === 'agentError') {
        setError(message.error);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Check initial agent status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        console.log('Checking initial agent status');
        const response = await chrome.runtime.sendMessage({
          action: 'AGENT_STATUS'
        });
        
        console.log('Initial status response:', response);
        
        if (response) {
          setStatus(response);
        }
      } catch (err) {
        console.error('Error checking agent status:', err);
      }
    };
    
    checkStatus();
  }, []);

  // Update status when config changes - ADDED MORE LOGGING
  useEffect(() => {
    console.log('useAgent: Config changed, updating status. Config:', config);
    updateStatusFromConfig(config);
  }, [config, updateStatusFromConfig]);

  return {
    status,
    loading,
    error,
    startAgent,
    stopAgent,
    postTweet,
    checkInstagramLogin,
    postInstagramContent,
    updateConfig
  };
};

export default useAgent;