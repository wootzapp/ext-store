import React from 'react';
import { motion } from 'framer-motion';
import { truncateUrl } from '@/lib/urlUtils';
import {
  renderMarkdown,
  CopyButton,
  formatSectionForCopy,
  formatPageForCopy,
} from '@/lib/markdownUtils';
import SettingsButton from '@/pages/popup/components/SettingsButton';


// Helper function to open URLs in new Chrome tabs
const openInNewTab = (url) => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: url });
  } else {
    console.log('🔗 Failed to open URL in new tab');
  }
};

const FactCheck = ({ 
  factCheckData, 
  currentPageUrl, 
  isLoading, 
  isLoadingSavedFactCheck,
  onBack, 
  onRetry,
  onClearHistory,
  onSettingsClick 
}) => {
  // No local state needed - all URL change logic handled in parent

  return (
    <motion.div 
      className="w-full h-full flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
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
            <SettingsButton onSettingsClick={onSettingsClick} />
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
            >
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
          <div className="flex items-center justify-center flex-1">
            <h1 className="text-lg font-bold text-gray-800">Fact Checker</h1>
          </div>
          <div className="flex items-center justify-end space-x-3 flex-1">
            {factCheckData && (
              <CopyButton
                text={formatPageForCopy(factCheckData, 'Fact Check Results', currentPageUrl)}
                variant="secondary"
                size="lg"
              >
                Copy All
              </CopyButton>
            )}
            <button
              type="button"
              onClick={onClearHistory}
              disabled={isLoading}
              className={`${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600'
              } text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200`}
              title={isLoading ? "Cannot clear history while loading" : "Clear Fact Check History"}
            >
              Clear History
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {/* URL Display */}
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-lg">
          <p className="text-gray-600 text-xs font-medium mb-1">Analyzing the page:</p>
          <p className="text-gray-800 text-sm truncate">{truncateUrl(currentPageUrl, 60)}</p>
        </div>

        {isLoadingSavedFactCheck ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 opacity-60"></div>
            <p className="text-gray-600 text-sm font-medium">Loading saved fact check...</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 opacity-60"></div>
            <p className="text-gray-600 text-sm font-medium">Fact-checking page content...</p>
            <p className="text-gray-500 text-xs mt-2">AI is analyzing claims and verifying facts</p>
          </div>
        ) : factCheckData ? (
          <div className="space-y-4">
            {/* Overall Assessment */}
            {factCheckData.overallAssessment && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 font-semibold flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">🎯</span>
                    </div>
                    Overall Assessment
                  </h2>
                  <CopyButton
                    text={formatSectionForCopy(factCheckData.overallAssessment, 'Overall Assessment')}
                    size="xs"
                  />
                </div>
                <div className="text-gray-700 text-sm leading-relaxed">
                  {renderMarkdown(factCheckData.overallAssessment)}
                </div>
              </motion.div>
            )}

            {/* Credibility Score */}
            {factCheckData.credibilityScore && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 font-semibold flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">📊</span>
                    </div>
                    Credibility Score
                  </h2>
                  <CopyButton
                    text={formatSectionForCopy(factCheckData.credibilityScore, 'Credibility Score')}
                    size="xs"
                  />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        factCheckData.credibilityScore >= 80 ? 'bg-green-500' :
                        factCheckData.credibilityScore >= 60 ? 'bg-yellow-500' :
                        factCheckData.credibilityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${factCheckData.credibilityScore}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-800 text-sm font-medium">{factCheckData.credibilityScore}%</span>
                </div>
              </motion.div>
            )}

            {/* Verified Claims */}
            {factCheckData.verifiedClaims && factCheckData.verifiedClaims.length > 0 && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 font-semibold flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">✅</span>
                    </div>
                    Verified Claims
                  </h2>
                  <CopyButton
                    text={formatSectionForCopy(factCheckData.verifiedClaims, 'Verified Claims')}
                    size="xs"
                  />
                </div>
                <div className="space-y-4">
                  {factCheckData.verifiedClaims.map((claim, index) => (
                    <div key={index} className="border-l-4 border-green-400 pl-4 bg-gray-50 rounded-r-lg p-3 relative">
                      <div className="absolute top-2 right-2">
                        <CopyButton
                          text={formatSectionForCopy(claim, `Verified Claim ${index + 1}`)}
                          size="xs"
                          variant="default"
                        />
                      </div>
                      <div className="text-gray-800 font-medium text-sm mb-1 pr-16">
                        {renderMarkdown(claim.statement)}
                      </div>
                      <p className="text-green-600 text-xs mb-1 font-medium">✓ {claim.status}</p>
                      {claim.evidence && (
                        <div className="text-gray-600 text-xs leading-relaxed pr-16">
                          {renderMarkdown(claim.evidence)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Disputed Claims */}
            {factCheckData.disputedClaims && factCheckData.disputedClaims.length > 0 && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 font-semibold flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">⚠️</span>
                    </div>
                    Disputed Claims
                  </h2>
                  <CopyButton
                    text={formatSectionForCopy(factCheckData.disputedClaims, 'Disputed Claims')}
                    size="xs"
                  />
                </div>
                <div className="space-y-4">
                  {factCheckData.disputedClaims.map((claim, index) => (
                    <div key={index} className="border-l-4 border-yellow-400 pl-4 bg-gray-50 rounded-r-lg p-3 relative">
                      <div className="absolute top-2 right-2">
                        <CopyButton
                          text={formatSectionForCopy(claim, `Disputed Claim ${index + 1}`)}
                          size="xs"
                          variant="default"
                        />
                      </div>
                      <div className="text-gray-800 font-medium text-sm mb-1 pr-16">
                        {renderMarkdown(claim.statement)}
                      </div>
                      <p className="text-yellow-600 text-xs mb-1 font-medium">⚠️ {claim.status}</p>
                      {claim.evidence && (
                        <div className="text-gray-600 text-xs leading-relaxed pr-16">
                          {renderMarkdown(claim.evidence)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* False Claims */}
            {factCheckData.falseClaims && factCheckData.falseClaims.length > 0 && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-800 font-semibold flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm">❌</span>
                    </div>
                    False Claims
                  </h2>
                  <CopyButton
                    text={formatSectionForCopy(factCheckData.falseClaims, 'False Claims')}
                    size="xs"
                  />
                </div>
                <div className="space-y-4">
                  {factCheckData.falseClaims.map((claim, index) => (
                    <div key={index} className="border-l-4 border-red-400 pl-4 bg-gray-50 rounded-r-lg p-3 relative">
                      <div className="absolute top-2 right-2">
                        <CopyButton
                          text={formatSectionForCopy(claim, `False Claim ${index + 1}`)}
                          size="xs"
                          variant="default"
                        />
                      </div>
                      <div className="text-gray-800 font-medium text-sm mb-1 pr-16">
                        {renderMarkdown(claim.statement)}
                      </div>
                      <p className="text-red-600 text-xs mb-1 font-medium">❌ {claim.status}</p>
                      {claim.evidence && (
                        <div className="text-gray-600 text-xs leading-relaxed pr-16">
                          {renderMarkdown(claim.evidence)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Sources */}
            {factCheckData.sources && factCheckData.sources.length > 0 && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">🔗</span>
                  </div>
                  Sources Used
                </h2>
                <div className="space-y-3">
                  {factCheckData.sources.map((source, index) => (
                    <div key={index} className="text-xs">
                      <button 
                        onClick={() => openInNewTab(source.url)}
                        className="text-blue-600 hover:text-blue-700 underline break-all font-medium cursor-pointer bg-transparent border-none p-0 text-left"
                      >
                        {source.title || source.url}
                      </button>
                      {source.description && (
                        <p className="text-gray-600 mt-1">{source.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommendations */}
            {factCheckData.recommendations && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  Recommendations
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">{factCheckData.recommendations}</p>
              </motion.div>
            )}

            {/* Raw Response (fallback for unstructured data) */}
            {factCheckData.rawResponse && !factCheckData.overallAssessment && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <h2 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  Fact Check Report
                </h2>
                <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {factCheckData.rawResponse}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <p className="text-gray-700 text-sm font-medium mb-2">Failed to fact-check page</p>
            <p className="text-gray-500 text-xs mb-4 text-center">
              There was an error processing the page for fact-checking
            </p>
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl text-sm transition-all duration-300 shadow-lg"
            >
              Retry Fact Check
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FactCheck;
