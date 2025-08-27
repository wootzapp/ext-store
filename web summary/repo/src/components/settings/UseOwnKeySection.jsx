// components/settings/UseOwnKeySection.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SUPPORTED_MODELS } from '@/storage';

function getModelIcon(modelId, size = 'sm') {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  switch (modelId) {
    case 'gemini':    return <img src="icons/Gemini.png" alt="Gemini" className={`${sizeClass} rounded`} />;
    case 'openai':    return <img src="icons/OpenAi.png" alt="OpenAI" className={`${sizeClass} rounded`} />;
    case 'anthropic': return <img src="icons/Claude.png" alt="Claude" className={`${sizeClass} rounded`} />;
    default:
      return <div className={`${sizeClass} bg-gradient-to-br from-red-500 to-orange-500 rounded flex items-center justify-center text-white text-xs`}>AI</div>;
  }
}

export default function UseOwnKeySection({
  isEditMode,
  isValidating,
  useOwnKey, setUseOwnKey,
  selectedModel, setSelectedModel,
  apiKey, setApiKey,
  onKeyPress,
  onSave,
  validationError,
  successMessage,
  showSaveButton = true,
}) {
  const selectedModelConfig = selectedModel ? SUPPORTED_MODELS[selectedModel] : null;

  return (
    <div className="max-w-full">
      <h2 className="text-lg font-medium text-gray-800 mb-4">Use your own API key</h2>

      <div className="p-4 rounded-xl border border-gray-200 bg-white flex items-center justify-between overflow-hidden">
        <div className="min-w-0">
          <div className="font-medium text-gray-800">Use custom API key</div>
          <div className="text-xs text-gray-500">Overrides subscription</div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={useOwnKey}
          aria-label="Use custom API key"
          disabled={!isEditMode}
          onClick={() => isEditMode && setUseOwnKey(v => !v)}
          onKeyDown={(e) => {
            if (!isEditMode) return;
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setUseOwnKey(v => !v);
            }
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
            ${useOwnKey ? 'bg-red-500' : 'bg-gray-300'}
            ${!isEditMode ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform
              ${useOwnKey ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
      </div>

      {/* Provider + API key are always visible */}
      <div className="mt-4 space-y-6">
        <div className="max-w-full">
          <h3 className="text-base font-medium text-gray-800 mb-3">Provider</h3>

          <div role="radiogroup" className="grid gap-3 max-w-full">
            {Object.entries(SUPPORTED_MODELS).map(([modelId, modelConfig]) => {
              const selected = selectedModel === modelId;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  key={modelId}
                  onClick={() => isEditMode && setSelectedModel(modelId)}
                  disabled={!isEditMode}
                  className={`w-full max-w-full p-4 rounded-xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 overflow-hidden
                    ${selected ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                    ${!isEditMode ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3 max-w-full">
                    {getModelIcon(modelId)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 whitespace-normal break-words">
                        {modelConfig.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1 whitespace-normal break-words">
                        {modelConfig.description}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full border
                        ${selected ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 text-transparent'}`}
                      aria-hidden="true"
                    >
                      <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedModel && selectedModelConfig && (
          <div className="max-w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {selectedModelConfig.name} API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={selectedModelConfig.keyPlaceholder}
              className={`w-full px-4 py-3 rounded-lg bg-white
                border border-gray-300
                outline-none focus:outline-none
                ring-0 focus:ring-2 focus:ring-red-500 focus:ring-offset-0
                focus:border-red-500
                shadow-none focus:shadow-none
                transition-colors duration-200
                ${!isEditMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              disabled={isValidating || !isEditMode}
              readOnly={!isEditMode}
            />
          </div>
        )}
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {validationError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg"
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

      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-sm text-green-600">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline Save (kept optional) */}
      {isEditMode && showSaveButton && (
        <motion.button
          onClick={onSave}
          disabled={isValidating}
          className={`mt-4 w-full py-3 px-4 rounded-lg font-medium transition-colors ${
            isValidating
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 shadow-lg'
          }`}
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
  );
}