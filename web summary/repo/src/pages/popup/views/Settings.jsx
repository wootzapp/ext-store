import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCog, FaArrowLeft, FaSave, FaRobot, FaBrain, FaCompass, 
  FaClipboardList, FaCheckCircle, FaTimes, FaKey, FaShieldAlt,
  FaToggleOn, FaToggleOff, FaChevronDown, FaChevronUp,
  FaExclamationTriangle, FaInfoCircle, FaSpinner
} from 'react-icons/fa';

import useAuthAndPrefs from '@/hooks/useAuthAndPrefs';
import useUserOrgs from '@/hooks/useUserOrgs';
import StorageUtils, { SUPPORTED_MODELS } from '@/storage';

const Settings = ({ onBack, onOpenPlans }) => {
  const {
    authUser, isAuthed, authLoading, authError,
    prefs, setPrefs, loadPrefs, savePrefs,
  } = useAuthAndPrefs();

  const { loading: orgsLoading, error: orgsError, user: userFromApi, organizations } = useUserOrgs();

  // Local state
  const [localConfig, setLocalConfig] = useState({
    useOwnKey: false,
    selectedModel: 'gemini',
    apiKey: '',
    anthropicApiKey: '',
    openaiApiKey: '',
    geminiApiKey: ''
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load configuration on mount
  useEffect(() => {
    const loadConfig = async () => {
      try {
        setIsLoading(true);
        await loadPrefs();
        
        // Load API keys
        const anthropicKey = await StorageUtils.getApiKey('anthropic');
        const openaiKey = await StorageUtils.getApiKey('openai');
        const geminiKey = await StorageUtils.getApiKey('gemini');
        const selectedModel = await StorageUtils.getSelectedModel();
        const useOwnKey = await StorageUtils.getUseOwnKey();
        
        setLocalConfig({
          useOwnKey: useOwnKey || false,
          selectedModel: selectedModel || 'gemini',
          apiKey: '',
          anthropicApiKey: anthropicKey || '',
          openaiApiKey: openaiKey || '',
          geminiApiKey: geminiKey || ''
        });
      } catch (error) {
        console.error('Error loading config:', error);
        setValidationError('Failed to load configuration');
      } finally {
      setIsLoading(false);
      }
    };

    loadConfig();
  }, [loadPrefs]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
    setValidationError('');
    setSuccessMessage('');

      // Validate API key if using own key
      if (localConfig.useOwnKey) {
        const currentApiKey = localConfig[`${localConfig.selectedModel}ApiKey`];
        if (!currentApiKey) {
          setValidationError('Please enter an API key for the selected model');
          return;
        }

        // Test API key
    setIsValidating(true);
        const validation = await StorageUtils.testApiKey(localConfig.selectedModel, currentApiKey);
        if (!validation.valid) {
          setValidationError(validation.error);
          setIsValidating(false);
          return;
        }
          setIsValidating(false);
      }

      // Save configuration
      await StorageUtils.setUseOwnKey(localConfig.useOwnKey);
      await StorageUtils.saveSelectedModel(localConfig.selectedModel);
      
      if (localConfig.useOwnKey) {
        const currentApiKey = localConfig[`${localConfig.selectedModel}ApiKey`];
        if (currentApiKey) {
          await StorageUtils.saveApiKey(localConfig.selectedModel, currentApiKey);
        }
      }

      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (error) {
      console.error('Error saving config:', error);
      setValidationError('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvailableModels = (provider) => {
    switch (provider) {
      case 'anthropic':
        return [
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)', recommended: true },
          { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast)' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' }
        ];
      case 'openai':
        return [
          { value: 'gpt-4o', label: 'GPT-4o (Latest)', recommended: true },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Latest)', recommended: true },
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' }
        ];
      default:
        return [];
    }
  };

  const getCurrentApiKey = () => {
    return localConfig[`${localConfig.selectedModel}ApiKey`] || '';
  };

  const setCurrentApiKey = (value) => {
    setLocalConfig(prev => ({
      ...prev,
      [`${prev.selectedModel}ApiKey`]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="settings-container w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-container w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col relative overflow-hidden">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="settings-orb-1 floating-orb"></div>
        <div className="settings-orb-2 floating-orb"></div>
        <div className="settings-orb-3 floating-orb"></div>
      </div>

      {/* Header */}
      <div className="settings-header bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3 relative z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="settings-back-button flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <FaArrowLeft size={14} />
            <span className="font-medium text-sm">Back</span>
          </button>

          <div className="text-center">
            <h1 className="settings-title text-lg font-bold text-gray-800">API Settings</h1>
            <p className="settings-subtitle text-xs text-gray-600">Configure your AI providers</p>
          </div>
          
          <button
                  onClick={handleSave}
            disabled={isSaving || isValidating}
            className="settings-save-button flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm"
          >
            {isSaving ? (
              <FaSpinner className="animate-spin" size={12} />
            ) : (
              <FaSave size={12} />
            )}
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="settings-content flex-1 p-3 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto space-y-3">
          
          {/* Provider Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="settings-provider-section bg-white rounded-xl shadow-lg p-3 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <FaRobot className="text-blue-500" size={18} />
              <div>
                <h3 className="text-base font-semibold text-gray-800">AI Provider</h3>
                <p className="text-xs text-gray-600">Choose your preferred AI model</p>
              </div>
            </div>

            <div className="provider-tabs grid grid-cols-3 gap-2">
              {[
                { id: 'anthropic', name: 'Anthropic', icon: FaBrain, color: 'text-orange-500' },
                { id: 'openai', name: 'OpenAI', icon: FaCompass, color: 'text-green-500' },
                { id: 'gemini', name: 'Google', icon: FaClipboardList, color: 'text-purple-500' }
              ].map((provider) => {
                const Icon = provider.icon;
                return (
                  <button
                    key={provider.id}
                    onClick={() => setLocalConfig(prev => ({ ...prev, selectedModel: provider.id }))}
                    className={`provider-tab p-3 rounded-lg border-2 transition-all duration-300 ${
                      localConfig.selectedModel === provider.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`${provider.color} mx-auto mb-1`} size={18} />
                    <div className="font-medium text-sm">{provider.name}</div>
                  </button>
                );
              })}
          </div>
          </motion.div>

          {/* API Key Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="settings-api-section bg-white rounded-xl shadow-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-2 mb-4">
              <FaKey className="text-purple-500" size={18} />
              <div>
                <h3 className="text-base font-semibold text-gray-800">API Configuration</h3>
                <p className="text-xs text-gray-600">Configure your API keys and preferences</p>
              </div>
            </div>

            {/* Use Own Key Toggle */}
            <div className="api-toggle-section mb-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FaShieldAlt className="text-gray-600" size={16} />
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Use Your Own API Key</div>
                    <div className="text-xs text-gray-600">
                      {localConfig.useOwnKey 
                        ? 'Using your personal API keys' 
                        : 'Using backend service (recommended)'
                      }
                    </div>
                  </div>
                </div>
                    <button
                  onClick={() => setLocalConfig(prev => ({ ...prev, useOwnKey: !prev.useOwnKey }))}
                  className={`api-toggle p-1.5 rounded-lg transition-colors ${
                    localConfig.useOwnKey ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {localConfig.useOwnKey ? <FaToggleOn size={16} /> : <FaToggleOff size={16} />}
                    </button>
              </div>
            </div>

            {/* API Key Input */}
            {localConfig.useOwnKey && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="api-input-group space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    API Key for {localConfig.selectedModel.charAt(0).toUpperCase() + localConfig.selectedModel.slice(1)}
                  </label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={getCurrentApiKey()}
                      onChange={(e) => setCurrentApiKey(e.target.value)}
                      placeholder={`Enter your ${localConfig.selectedModel} API key...`}
                      className="api-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is stored locally and never shared
                  </p>
                </div>

                {/* Model Selection */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Model
                  </label>
                  <select
                    value={localConfig.selectedModel}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, selectedModel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    {getAvailableModels(localConfig.selectedModel).map((model) => (
                      <option key={model.value} value={model.value}>
                        {model.label} {model.recommended ? '(Recommended)' : ''}
                      </option>
                    ))}
                  </select>
              </div>
              </motion.div>
            )}

            {/* Backend Service Info */}
            {!localConfig.useOwnKey && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <FaInfoCircle className="text-blue-500 mt-0.5" size={14} />
                  <div>
                    <div className="font-medium text-blue-800 text-sm">Using Backend Service</div>
                    <div className="text-xs text-blue-700 mt-1">
                      Your requests are processed through our secure backend service. 
                      No API keys required - just start using the extension!
          </div>
        </div>
      </div>
              </motion.div>
            )}
          </motion.div>

          {/* Status Messages */}
      <AnimatePresence>
            {validationError && (
          <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="settings-message bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <FaExclamationTriangle className="text-red-500" size={14} />
                  <span className="text-red-800 text-sm">{validationError}</span>
                </div>
              </motion.div>
            )}

            {successMessage && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="settings-message bg-green-50 border border-green-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <FaCheckCircle className="text-green-500" size={14} />
                  <span className="text-green-800 text-sm">{successMessage}</span>
                </div>
              </motion.div>
            )}

            {isValidating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="settings-message bg-blue-50 border border-blue-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-blue-500" size={14} />
                  <span className="text-blue-800 text-sm">Validating API key...</span>
                </div>
              </motion.div>
            )}
      </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Settings;