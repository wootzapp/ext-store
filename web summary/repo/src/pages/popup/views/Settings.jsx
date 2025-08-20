import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StorageUtils, { SUPPORTED_MODELS, SEARCH_ENGINES } from '@/storage';

const Settings = ({ onBack, onSetupComplete }) => {
  const [selectedModel, setSelectedModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [selectedSearchEngine, setSelectedSearchEngine] = useState('google');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasBeenSaved, setHasBeenSaved] = useState(false);

  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        const preferences = await StorageUtils.getUserPreferences();
        const savedSearchEngine = await StorageUtils.getSelectedSearchEngine();
        
        if (preferences?.preferences) {
          setSelectedModel(preferences.preferences.selectedModel || '');
          setApiKey(preferences.preferences.apiKey || '');
          setHasBeenSaved(true);
          setIsEditMode(false);
        } else {
          setIsEditMode(true);
        }
        
        setSelectedSearchEngine(savedSearchEngine);
      } catch (error) {
        console.error('Error loading current settings:', error);
        setIsEditMode(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentSettings();
  }, []);

  useEffect(() => {
    // Removed automatic clearing of validation error when apiKey changes
    // Error should persist until user tries to save again
  }, [apiKey]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleModelSelect = (modelId) => {
    if (!isEditMode) return; 
    setSelectedModel(modelId);
    // Removed setValidationError('') - error should persist until save attempt
    setSuccessMessage('');
  };

  const handleSearchEngineSelect = (searchEngineId) => {
    if (!isEditMode) return;
    setSelectedSearchEngine(searchEngineId);
    // Removed setValidationError('') - error should persist until save attempt
    setSuccessMessage('');
  };

  const handleApiKeyChange = (e) => {
    if (!isEditMode) return;
    setApiKey(e.target.value);
    // Removed setValidationError('') - error should persist until save attempt
    setSuccessMessage('');
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    // Removed setValidationError('') - error should persist until save attempt
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);

    loadCurrentSettings();
    // Removed setValidationError('') - error should persist until save attempt
    setSuccessMessage('');
  };

  const loadCurrentSettings = async () => {
    try {
      const preferences = await StorageUtils.getUserPreferences();
      const savedSearchEngine = await StorageUtils.getSelectedSearchEngine();
      
      if (preferences?.preferences) {
        setSelectedModel(preferences.preferences.selectedModel || '');
        setApiKey(preferences.preferences.apiKey || '');
      }
      
      setSelectedSearchEngine(savedSearchEngine);
    } catch (error) {
      console.error('Error loading current settings:', error);
    }
  };

  const validateAndSave = async () => {
    if (!selectedModel) {
      setValidationError('Please select a model');
      return;
    }

    if (!apiKey.trim()) {
      setValidationError('Please enter your API key');
      return;
    }

    setIsValidating(true);
    setValidationError('');
    setSuccessMessage('');

    try {
      const formatValidation = StorageUtils.validateApiKey(selectedModel, apiKey);
      if (!formatValidation.valid) {
        setValidationError(`Invalid API key format: ${formatValidation.error}`);
        setIsValidating(false);
        return;
      }

      const testResult = await StorageUtils.testApiKey(selectedModel, apiKey.trim());
      if (!testResult.valid) {
        const baseError = testResult.error || 'The API key you entered is not valid or has expired.';
        let userFriendlyError;
        
        // Provide more specific error messages based on the error content
        if (baseError.includes('Unauthorized') || baseError.includes('401')) {
          userFriendlyError = `❌ Invalid API Key: ${baseError}\n\nPlease verify that you have copied the correct API key and that it hasn't been revoked.`;
        } else if (baseError.includes('Forbidden') || baseError.includes('403')) {
          userFriendlyError = `🚫 Access Denied: ${baseError}\n\nYour API key may not have the required permissions for this service.`;
        } else if (baseError.includes('Rate limit') || baseError.includes('429')) {
          userFriendlyError = `⏰ Rate Limited: ${baseError}\n\nPlease wait a few minutes before trying again.`;
        } else if (baseError.includes('Network error')) {
          userFriendlyError = `🌐 Connection Issue: ${baseError}\n\nPlease check your internet connection and try again.`;
        } else if (baseError.includes('server') || baseError.includes('500')) {
          userFriendlyError = `🔧 Server Issue: ${baseError}\n\nThe AI service is temporarily unavailable. Please try again later.`;
        } else {
          userFriendlyError = `❌ Validation Failed: ${baseError}\n\nPlease check your API key and try again.`;
        }
        
        setValidationError(userFriendlyError);
        setIsValidating(false);
        return;
      }

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

      await StorageUtils.saveApiKey(selectedModel, apiKey.trim());
      await StorageUtils.saveSelectedModel(selectedModel);
      
      await StorageUtils.saveSelectedSearchEngine(selectedSearchEngine);

      const selectedEngineData = SEARCH_ENGINES.find(engine => engine.id === selectedSearchEngine);
      const selectedModelData = SUPPORTED_MODELS[selectedModel];
      
      if (chrome && chrome.wootz && chrome.wootz.changeWootzAppSearchConfiguration) {
        chrome.wootz.changeWootzAppSearchConfiguration(
          selectedEngineData?.keyword,
          selectedModelData?.baseUrlToSearch,
          apiKey.trim(),
          (result) => {
            if (result.success) {
              console.log('✅ Wootz configuration saved successfully');
            } else {
              console.error('❌ Error saving Wootz configuration:', result.error);
            }
          }
        );
      } else {
        console.log('🔧 Chrome Wootz API not available');
      }

      setSuccessMessage('Settings saved successfully!');
      console.log('✅ Settings updated successfully');
      
      setHasBeenSaved(true);
      setIsEditMode(false);

      // Removed automatic redirection - user stays in settings
      // User can manually navigate using back button or other navigation

    } catch (error) {
      console.error('❌ Settings update error:', error);
      setValidationError('Failed to save settings. Please check your connection and try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isValidating && apiKey.trim() && selectedModel) {
      validateAndSave();
    }
  };

  const getModelIcon = (modelId, size = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
    
    switch (modelId) {
      case 'gemini':
        return <img src="icons/Gemini.png" alt="Gemini" className={`${sizeClass} rounded`} />;
      case 'openai':
        return <img src="icons/OpenAi.png" alt="OpenAI" className={`${sizeClass} rounded`} />;
      case 'anthropic':
        return <img src="icons/Claude.png" alt="Claude" className={`${sizeClass} rounded`} />;
      default:
        return <div className={`${sizeClass} bg-gradient-to-br from-red-500 to-orange-500 rounded flex items-center justify-center text-white text-xs`}>AI</div>;
    }
  };

  const getSearchEngineIcon = (searchEngineId, size = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
    
    switch (searchEngineId) {
      case 'google':
        return (
          <div className={`${sizeClass} flex items-center justify-center`}>
            <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
        );
      case 'yahoo':
        return (
          <div className={`${sizeClass} flex items-center justify-center`}>
            <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
              <path d="M2 7.5L9 2l7 5.5L9 13l-7-5.5z" fill="#7B46C7"/>
              <path d="M9 13l7-5.5L23 12l-7 5.5L9 13z" fill="#5B2C87"/>
              <path d="M2 16.5L9 11l7 5.5L9 22l-7-5.5z" fill="#410E5F"/>
              <circle cx="9" cy="12" r="2" fill="#FFFFFF"/>
            </svg>
          </div>
        );
      case 'bing':
        return (
          <div className={`${sizeClass} flex items-center justify-center`}>
            <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
              <path d="M5.5 3v7.5l3 1.5 6-3V6L8 3H5.5z" fill="#00BCF2"/>
              <path d="M8.5 9v3l6 3 4.5-2.25V9l-4.5-1.5-6 1.5z" fill="#0078D4"/>
              <path d="M8.5 12l6 3v3l-6-3v-3z" fill="#1BA1E2"/>
              <path d="M14.5 15v3l4.5-2.25V12.75L14.5 15z" fill="#40E0D0"/>
            </svg>
          </div>
        );
      case 'yandex':
        return (
          <div className={`${sizeClass} flex items-center justify-center`}>
            <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
              <rect width="24" height="24" rx="4" fill="#FC3F1D"/>
              <path d="M12.5 6.5h2.5c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5h-1.5v5h-2v-10h1zm1 4h1.5c.5 0 1-.5 1-1s-.5-1-1-1h-1.5v2z" fill="white"/>
              <path d="M8 6.5h2v4.5l2.5-4.5h2.5l-2.5 4.5 3 5.5h-2.5l-2-3.5-1 1.5v2h-2v-10z" fill="white"/>
            </svg>
          </div>
        );
      case 'duckduckgo':
        return (
          <div className={`${sizeClass} flex items-center justify-center`}>
            <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#DE5833"/>
              <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 6c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5zm-7 0c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5zm3.5 6c-2.2 0-4-1.3-4-3h8c0 1.7-1.8 3-4 3z" fill="#FFFFFF"/>
              <circle cx="9" cy="10" r="1" fill="#DE5833"/>
              <circle cx="15" cy="10" r="1" fill="#DE5833"/>
              <path d="M12 14c-1.1 0-2-.4-2-1h4c0 .6-.9 1-2 1z" fill="#DE5833"/>
            </svg>
          </div>
        );
      default:
        return (
          <div className={`${sizeClass} flex items-center justify-center`}>
            <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" fill="#6B7280"/>
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="white"/>
            </svg>
          </div>
        );
    }
  };

  const getModelDisplayName = (modelConfig) => {
    return modelConfig.name;
  };

  const selectedModelConfig = selectedModel ? SUPPORTED_MODELS[selectedModel] : null;

  if (isLoading) {
    return (
      <motion.div 
        className="w-full h-full flex items-center justify-center bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full bg-white flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-4 shadow-sm relative z-10 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <motion.button
              onClick={onBack}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          </div>
          <div className="flex items-center justify-center flex-1">
            <h1 className="text-lg font-bold text-gray-800">Settings</h1>
          </div>
          <div className="flex items-center justify-end space-x-3 flex-1">
            {!isEditMode && hasBeenSaved && (
              <motion.button
                onClick={handleEditClick}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Edit Settings
              </motion.button>
            )}
            {isEditMode && hasBeenSaved && (
              <motion.button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            )}
            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto relative z-10">
        {!isEditMode && hasBeenSaved && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-sm text-green-700 font-medium">Settings saved and active</p>
            </div>
          </div>
        )}
        <div className="space-y-6">
          {/* Search Engine Selection */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Default Search Engine</h2>
            <div className="grid gap-3">
              {SEARCH_ENGINES.map((searchEngine) => (
                <motion.div
                  key={searchEngine.id}
                  onClick={() => handleSearchEngineSelect(searchEngine.id)}
                  className={`
                    p-4 rounded-xl border transition-all duration-200
                    ${selectedSearchEngine === searchEngine.id 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${!isEditMode ? 'cursor-default opacity-75' : 'cursor-pointer'}
                  `}
                  whileHover={isEditMode ? { scale: 1.02 } : {}}
                  whileTap={isEditMode ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center space-x-3">
                    {getSearchEngineIcon(searchEngine.id)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {searchEngine.name}
                      </div>
                    </div>
                    {selectedSearchEngine === searchEngine.id && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI Model Selection */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">AI Model</h2>
            <div className="grid gap-3">
              {Object.entries(SUPPORTED_MODELS).map(([modelId, modelConfig]) => (
                <motion.div
                  key={modelId}
                  onClick={() => handleModelSelect(modelId)}
                  className={`
                    p-4 rounded-xl border transition-all duration-200
                    ${selectedModel === modelId 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${!isEditMode ? 'cursor-default opacity-75' : 'cursor-pointer'}
                  `}
                  whileHover={isEditMode ? { scale: 1.02 } : {}}
                  whileTap={isEditMode ? { scale: 0.98 } : {}}
                >
                  <div className="flex items-center space-x-3">
                    {getModelIcon(modelId)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {getModelDisplayName(modelConfig)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {modelConfig.description}
                      </div>
                    </div>
                    {selectedModel === modelId && (
                      <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Error Message - moved outside selectedModelConfig block to show validation errors */}
          <AnimatePresence>
            {validationError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start space-x-2">
                  <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm text-red-800 font-medium">Validation Error</p>
                    <div className="text-sm text-red-700 mt-1 whitespace-pre-line">{validationError}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message - moved outside selectedModelConfig block */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <p className="text-sm text-green-600">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {selectedModelConfig && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-medium text-gray-800 mb-4">API Key</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedModelConfig.name} API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={handleApiKeyChange}
                    onKeyPress={handleKeyPress}
                    placeholder={selectedModelConfig.keyPlaceholder}
                    className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 ${!isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                    disabled={isValidating || !isEditMode}
                    readOnly={!isEditMode}
                  />
                </div>

                {/* Save Button */}
                {isEditMode && (
                  <motion.button
                    onClick={validateAndSave}
                    disabled={!selectedModel || !apiKey.trim() || isValidating}
                    className={`
                      w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
                      ${(!selectedModel || !apiKey.trim() || isValidating)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg'
                      }
                    `}
                    whileHover={(!selectedModel || !apiKey.trim() || isValidating) ? {} : { scale: 1.02 }}
                    whileTap={(!selectedModel || !apiKey.trim() || isValidating) ? {} : { scale: 0.98 }}
                  >
                    {isValidating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Validating...
                      </div>
                    ) : (
                      'Save Settings'
                    )}
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;