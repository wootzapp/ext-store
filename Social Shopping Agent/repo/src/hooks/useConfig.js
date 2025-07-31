/* global chrome */
import { useState, useEffect } from 'react';

const DEFAULT_CONFIG = {
  aiProvider: 'anthropic',
  navigatorModel: 'claude-3-5-sonnet-20241022',
  plannerModel: 'claude-3-5-sonnet-20241022', 
  validatorModel: 'claude-3-haiku-20240307',
  autoLogin: true,
  safeMode: true,
  voiceInput: true,
  humanDelay: true,
  debugMode: true,
  maxRetries: 3,
  timeout: 30000
};

export const useConfig = () => {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get(['agentConfig']);
        const savedConfig = result.agentConfig || {};
        setConfig({ ...DEFAULT_CONFIG, ...savedConfig });
      }
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (newConfig) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.set({ agentConfig: updatedConfig });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating config:', error);
      return { success: false, error: error.message };
    }
  };

  const resetConfig = async () => {
    try {
      setConfig(DEFAULT_CONFIG);
      
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.sync.set({ agentConfig: DEFAULT_CONFIG });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error resetting config:', error);
      return { success: false, error: error.message };
    }
  };

  return { 
    config, 
    updateConfig, 
    resetConfig, 
    loading 
  };
};