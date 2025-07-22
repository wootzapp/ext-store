import { useState } from 'react';
import browserStorage from '../services/storage/browserStorage';

const useConfig = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading config from storage...');
      
      // Try to load from both storage keys for backward compatibility
      let savedConfig = await browserStorage.get('config');
      const onboardingCompleted = await browserStorage.get('onboardingCompleted');
      
      // If no config found with 'config' key, try 'agentConfig'
      if (!savedConfig) {
        savedConfig = await browserStorage.get('agentConfig');
      }
      
      console.log('Saved config:', savedConfig);
      console.log('Onboarding completed:', onboardingCompleted);
      
      // Transform flat structure to nested structure if needed
      if (savedConfig && savedConfig.model && !savedConfig.ai) {
        savedConfig = {
          ai: {
            model: savedConfig.model,
            apiKeys: {
              [savedConfig.model]: savedConfig.apiKey
            }
          },
          twitter: {
            username: savedConfig.twitterUsername || '',
            password: savedConfig.twitterPassword || '',
            email: savedConfig.email || ''
          },
          topics: savedConfig.topics || [],
          settings: {
            interval: savedConfig.setInterval || 30,
            style: 'professional but engaging'
          }
        };
      }
      
      setConfig(savedConfig || {});
      return { 
        config: savedConfig, 
        onboardingCompleted: !!onboardingCompleted 
      };
    } catch (err) {
      console.error('Error loading config:', err);
      setError(err.message);
      return { config: null, onboardingCompleted: false };
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Saving config:', newConfig);
      
      // Transform nested structure to flat structure for onboarding compatibility
      let configToSave = newConfig;
      if (newConfig.ai && newConfig.twitter) {
        // This is the new nested structure, save as is
        configToSave = newConfig;
      } else if (newConfig.model) {
        // This is the old flat structure from onboarding, transform it
        configToSave = {
          ai: {
            model: newConfig.model,
            apiKeys: {
              [newConfig.model]: newConfig.apiKey
            }
          },
          twitter: {
            username: newConfig.twitterUsername || '',
            password: newConfig.twitterPassword || '',
            email: newConfig.email || ''
          },
          topics: newConfig.topics || [],
          settings: {
            interval: newConfig.setInterval || 30,
            style: 'professional but engaging'
          }
        };
      }
      
      // Save both config and onboarding status
      await browserStorage.set('config', configToSave);
      await browserStorage.set('agentConfig', configToSave); // Also save to agentConfig for backward compatibility
      await browserStorage.set('onboardingCompleted', true);
      
      setConfig(configToSave);
      return true;
    } catch (err) {
      console.error('Failed to save config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedConfig = { ...config, ...updates };
      await browserStorage.set('config', updatedConfig);
      await browserStorage.set('agentConfig', updatedConfig); // Also save to agentConfig for backward compatibility
      setConfig(updatedConfig);
      return true;
    } catch (err) {
      console.error('Failed to update config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetConfig = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await browserStorage.remove('config');
      await browserStorage.remove('agentConfig');
      await browserStorage.remove('onboardingCompleted');
      
      setConfig(null);
      return true;
    } catch (err) {
      console.error('Failed to reset config:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    loadConfig,
    saveConfig,
    updateConfig,
    resetConfig
  };
};

export default useConfig;