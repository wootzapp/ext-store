import { useState, useEffect } from 'react';
import BrowserStorage from '../services/storage/browserStorage';

const useConfig = () => {
  const [config, setConfig] = useState({
    // Backward compatibility: keep anthropicApiKey for existing users
    anthropicApiKey: '',
    // New AI configuration structure
    ai: {
      model: 'claude', // Default to claude for backward compatibility
      apiKeys: {
        claude: '',
        openai: '',
        gemini: ''
      }
    },
    twitter: {
      username: '',
      password: '',
      email: ''
    },
    topics: [
      'Artificial Intelligence trends',
      'Machine Learning innovations',
      'Web Development tips',
      'Tech industry news',
      'Programming best practices'
    ],
    settings: {
      interval: 240,
      style: 'professional but engaging',
      enabled: false
    }
  });
  const [loading, setLoading] = useState(true);
  const [storage] = useState(new BrowserStorage());

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const savedConfig = await storage.getConfig();
      
      // Handle migration from old config to new AI structure
      if (savedConfig.anthropicApiKey && !savedConfig.ai?.apiKeys?.claude) {
        savedConfig.ai = {
          model: 'claude',
          apiKeys: {
            claude: savedConfig.anthropicApiKey,
            openai: '',
            gemini: ''
          }
        };
      }
      
      setConfig(savedConfig);
    } catch (error) {
      console.error('Error loading config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async (newConfig) => {
    try {
      const updatedConfig = { ...config, ...newConfig };
      
      // Ensure backward compatibility: sync anthropicApiKey with ai.apiKeys.claude
      if (updatedConfig.ai?.apiKeys?.claude) {
        updatedConfig.anthropicApiKey = updatedConfig.ai.apiKeys.claude;
      }
      
      await storage.setConfig(updatedConfig);
      setConfig(updatedConfig);
      return { success: true };
    } catch (error) {
      console.error('Error saving config:', error);
      return { success: false, error: error.message };
    }
  };

  const updateConfig = (updates) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  return {
    config,
    loading,
    saveConfig,
    updateConfig,
    loadConfig
  };
};

export default useConfig;