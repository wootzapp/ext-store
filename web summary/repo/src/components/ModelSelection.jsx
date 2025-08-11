import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StorageUtils, { SUPPORTED_MODELS } from '../utils/storageUtils';

const ModelSelection = ({ onSetupComplete, onBack }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [step, setStep] = useState(1); // 1: model selection, 2: API key input

  // Reset validation error when user starts typing (but not when we set errors)
  useEffect(() => {
    if (validationError && apiKey) {
      console.log('🔍 useEffect clearing validation error because user is typing');
      setValidationError('');
    }
  }, [apiKey]); // Removed validationError from dependencies to prevent clearing when we set errors

  const handleModelSelect = (modelId) => {
    setSelectedModel(modelId);
    setApiKey('');
    setValidationError('');
    setStep(2);
    setShowApiKeyInput(true);
  };

  const handleBackToModelSelection = () => {
    setStep(1);
    setShowApiKeyInput(false);
    setSelectedModel('');
    setApiKey('');
    setValidationError('');
  };

  const validateAndSave = async () => {
    if (!selectedModel || !apiKey.trim()) {
      setValidationError('Please enter your API key');
      return;
    }

    setIsValidating(true);
    setValidationError('');

    try {
      // First validate the format
      const formatValidation = StorageUtils.validateApiKey(selectedModel, apiKey);
      if (!formatValidation.valid) {
        setValidationError(`Invalid API key format: ${formatValidation.error}`);
        setIsValidating(false);
        return;
      }

      // Test the API key
      const testResult = await StorageUtils.testApiKey(selectedModel, apiKey.trim());
      if (!testResult.valid) {
        setValidationError(`Invalid API key: ${testResult.error || 'The API key you entered is not valid or has expired. Please check your key and try again.'}`);
        setIsValidating(false);
        return;
      }

      // Save the preferences
      const preferences = {
        selectedModel,
        apiKey: apiKey.trim(),
        setupDate: new Date().toISOString()
      };

      const saveResult = await StorageUtils.saveUserPreferences(preferences);
      if (!saveResult.success) {
        setValidationError('Failed to save preferences. Please try again.');
        setIsValidating(false);
        return;
      }

      // Also save the API key separately for easier access
      await StorageUtils.saveApiKey(selectedModel, apiKey.trim());
      await StorageUtils.saveSelectedModel(selectedModel);

      console.log('✅ Setup completed successfully');
      onSetupComplete && onSetupComplete();

    } catch (error) {
      console.error('❌ Setup error:', error);
      setValidationError('Setup failed. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isValidating && apiKey.trim()) {
      validateAndSave();
    }
  };

  const getModelIcon = (modelId, size = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
    
    switch (modelId) {
      case 'gemini': 
        return <img src="/icons/Gemini.png" alt="Gemini" className={`${sizeClass} object-contain`} />;
      case 'openai': 
        return <img src="/icons/OpenAi.png" alt="OpenAI" className={`${sizeClass} object-contain`} />;
      case 'anthropic': 
        return <img src="/icons/Claude.png" alt="Claude" className={`${sizeClass} object-contain`} />;
      default: 
        return <div className={`${sizeClass} bg-gray-400 rounded text-white text-xs flex items-center justify-center`}>⚡</div>;
    }
  };

  const getModelDisplayName = (modelConfig) => {
    if (!modelConfig) return '';
    
    const modelString = modelConfig.model;
    
    // Extract model version from the model string
    switch (modelConfig.id) {
      case 'gemini':
        // Convert "models/gemini-2.5-flash" to "Gemini 2.5 Flash"
        if (modelString.includes('gemini-2.5-flash')) return 'Gemini 2.5 Flash';
        if (modelString.includes('gemini-2.5-pro')) return 'Gemini 2.5 Pro';
        if (modelString.includes('gemini-1.5-pro')) return 'Gemini 1.5 Pro';
        return 'Gemini';
        
      case 'openai':
        // Convert "gpt-4" to "GPT-4", "gpt-3.5-turbo" to "GPT-3.5 Turbo"
        if (modelString === 'gpt-4') return 'GPT-4';
        if (modelString === 'gpt-3.5-turbo') return 'GPT-3.5 Turbo';
        if (modelString === 'gpt-4-turbo') return 'GPT-4 Turbo';
        return modelString.toUpperCase();
        
      case 'anthropic':
        // Convert "claude-3-sonnet-20240229" to "Claude 3 Sonnet"
        if (modelString.includes('claude-3-sonnet')) return 'Claude 3 Sonnet';
        if (modelString.includes('claude-3-opus')) return 'Claude 3 Opus';
        if (modelString.includes('claude-3-haiku')) return 'Claude 3 Haiku';
        return 'Claude';
        
      default:
        return modelConfig.name;
    }
  };

  const selectedModelConfig = selectedModel ? SUPPORTED_MODELS[selectedModel] : null;

  return (
    <motion.div 
      className="w-full h-full flex flex-col relative overflow-hidden bg-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-gray-200">
        {step === 2 && (
          <button
            onClick={handleBackToModelSelection}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>←</span>
            <span className="text-sm">Back</span>
          </button>
        )}
        <div className="flex items-center mx-auto">
          <span className="text-lg font-bold text-gray-800">Setup AI Model</span>
        </div>
        {onBack && step === 1 && (
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            Cancel
          </button>
        )}
      </div>

      <div className="flex-1 p-6 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="model-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Step indicator */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">Choose Your AI Model</div>
                <div className="text-gray-600 text-sm">Step 1 of 2</div>
              </div>

              {/* Model options */}
              <div className="space-y-3">
                {Object.entries(SUPPORTED_MODELS).map(([modelId, config]) => (
                  <motion.button
                    key={modelId}
                    onClick={() => handleModelSelect(modelId)}
                    className="w-full p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-300 hover:shadow-md transition-all duration-300 text-left group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex items-center justify-center w-8 h-8">{getModelIcon(modelId)}</div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors">
                          {config.name}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {config.description}
                        </div>
                      </div>
                      <div className="text-gray-400 group-hover:text-red-500 transition-colors">
                        →
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Info note */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <div className="text-red-500 text-sm">💡</div>
                  <div className="text-red-700 text-sm">
                    <div className="font-medium mb-1">Need an API key?</div>
                    <div>You'll need to sign up for an API key from your chosen provider. Don't worry, we'll guide you through the process!</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="api-key-input"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Step indicator */}
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800 mb-2">Enter API Key</div>
                <div className="text-gray-600 text-sm">Step 2 of 2</div>
              </div>

              {/* Selected model info */}
              {selectedModelConfig && (
                <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-200">
                      {getModelIcon(selectedModel, 'lg')}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="font-bold text-gray-800 text-lg">{getModelDisplayName(selectedModelConfig)}</div>
                        <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                          Selected
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Selected AI Model</div>
                      <div className="text-xs text-gray-500">{selectedModelConfig.description}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* API key input */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg space-y-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔑</span>
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold">API Key Configuration</h3>
                    <p className="text-gray-600 text-sm">Enter your API key to complete setup</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedModelConfig?.keyPlaceholder}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 shadow-sm"
                    disabled={isValidating}
                  />
                  {validationError && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
                    >
                      <div className="text-sm text-red-600 flex items-center space-x-2">
                        <span>❌</span>
                        <span>{validationError}</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>



              {/* Action buttons */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
                <motion.button
                  onClick={validateAndSave}
                  disabled={!apiKey.trim() || isValidating}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Validating API Key...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <span>✅</span>
                    </>
                  )}
                </motion.button>
              </div>

              {/* Security note */}
              <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🔒</span>
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold">Security & Privacy</h3>
                  </div>
                </div>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <div className="font-medium text-gray-700 mb-1">Your API key is completely secure</div>
                  <div>All keys are stored locally in your browser and never shared with third parties. Only you have access to your API credentials.</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ModelSelection;