import React from 'react';
import { motion } from 'framer-motion';

const FactChecker = ({ factCheckData, currentPageUrl, isLoading, onBack, onRetry }) => {

  return (
    <motion.div 
      className="w-full h-full bg-black flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-red-500/30">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-white hover:text-red-400 transition-colors"
        >
          <span>←</span>
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-lg font-semibold text-white">Fact Checker</h1>
        <div className="w-12"></div> {/* Spacer for center alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* URL Display */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-xs mb-1">Fact-checking URL:</p>
          <p className="text-white text-sm break-all">{currentPageUrl}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white text-sm">Fact-checking page content...</p>
            <p className="text-gray-400 text-xs mt-2">AI is analyzing claims and verifying facts</p>
          </div>
        ) : factCheckData ? (
          <div className="space-y-4">
            {/* Overall Assessment */}
            {factCheckData.overallAssessment && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">🎯</span>
                  Overall Assessment
                </h2>
                <p className="text-white text-sm leading-relaxed">{factCheckData.overallAssessment}</p>
              </div>
            )}

            {/* Credibility Score */}
            {factCheckData.credibilityScore && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">📊</span>
                  Credibility Score
                </h2>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        factCheckData.credibilityScore >= 80 ? 'bg-green-500' :
                        factCheckData.credibilityScore >= 60 ? 'bg-yellow-500' :
                        factCheckData.credibilityScore >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${factCheckData.credibilityScore}%` }}
                    ></div>
                  </div>
                  <span className="text-white text-sm font-medium">{factCheckData.credibilityScore}%</span>
                </div>
              </div>
            )}

            {/* Verified Claims */}
            {factCheckData.verifiedClaims && factCheckData.verifiedClaims.length > 0 && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">✅</span>
                  Verified Claims
                </h2>
                <div className="space-y-3">
                  {factCheckData.verifiedClaims.map((claim, index) => (
                    <div key={index} className="border-l-2 border-green-500/50 pl-3">
                      <p className="text-white font-medium text-sm mb-1">{claim.statement}</p>
                      <p className="text-green-400 text-xs mb-1">✓ {claim.status}</p>
                      {claim.evidence && (
                        <p className="text-gray-300 text-xs leading-relaxed">{claim.evidence}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disputed Claims */}
            {factCheckData.disputedClaims && factCheckData.disputedClaims.length > 0 && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">⚠️</span>
                  Disputed Claims
                </h2>
                <div className="space-y-3">
                  {factCheckData.disputedClaims.map((claim, index) => (
                    <div key={index} className="border-l-2 border-yellow-500/50 pl-3">
                      <p className="text-white font-medium text-sm mb-1">{claim.statement}</p>
                      <p className="text-yellow-400 text-xs mb-1">⚠️ {claim.status}</p>
                      {claim.evidence && (
                        <p className="text-gray-300 text-xs leading-relaxed">{claim.evidence}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* False Claims */}
            {factCheckData.falseClaims && factCheckData.falseClaims.length > 0 && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">❌</span>
                  False Claims
                </h2>
                <div className="space-y-3">
                  {factCheckData.falseClaims.map((claim, index) => (
                    <div key={index} className="border-l-2 border-red-500/50 pl-3">
                      <p className="text-white font-medium text-sm mb-1">{claim.statement}</p>
                      <p className="text-red-400 text-xs mb-1">❌ {claim.status}</p>
                      {claim.evidence && (
                        <p className="text-gray-300 text-xs leading-relaxed">{claim.evidence}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sources */}
            {factCheckData.sources && factCheckData.sources.length > 0 && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">🔗</span>
                  Sources Used
                </h2>
                <div className="space-y-2">
                  {factCheckData.sources.map((source, index) => (
                    <div key={index} className="text-xs">
                      <a 
                        href={source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline break-all"
                      >
                        {source.title || source.url}
                      </a>
                      {source.description && (
                        <p className="text-gray-400 mt-1">{source.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {factCheckData.recommendations && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">💡</span>
                  Recommendations
                </h2>
                <p className="text-white text-sm leading-relaxed">{factCheckData.recommendations}</p>
              </div>
            )}

            {/* Raw Response (fallback for unstructured data) */}
            {factCheckData.rawResponse && !factCheckData.overallAssessment && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">📋</span>
                  Fact Check Report
                </h2>
                <div className="text-white text-sm leading-relaxed whitespace-pre-wrap">
                  {factCheckData.rawResponse}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-white text-sm mb-2">Failed to fact-check page</p>
            <p className="text-gray-400 text-xs mb-4 text-center">
              There was an error processing the page for fact-checking
            </p>
            <button
              onClick={onRetry}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Retry Fact Check
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FactChecker;
