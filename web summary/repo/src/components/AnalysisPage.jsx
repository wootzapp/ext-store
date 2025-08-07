import React from 'react';
import { motion } from 'framer-motion';
import { truncateUrl } from '../utils/urlUtils';

// Helper function to open URLs in new Chrome tabs
const openInNewTab = (url) => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: url });
  }
};

const AnalysisPage = ({ 
  analysisData, 
  currentPageUrl, 
  isLoading, 
  isLoadingSavedAnalysis,
  onBack, 
  onRetry, 
  onAskQuestion,
  onClearHistory 
}) => {
  const [userQuestion, setUserQuestion] = React.useState('');
  const [isAskingQuestion, setIsAskingQuestion] = React.useState(false);
  const [questionAnswer, setQuestionAnswer] = React.useState('');

  const handleAskQuestion = async () => {
    if (!userQuestion.trim() || isAskingQuestion) return;

    setIsAskingQuestion(true);
    setQuestionAnswer('');

    try {
      const result = await onAskQuestion(userQuestion, currentPageUrl);
      if (result && result.success) {
        setQuestionAnswer(result.answer);
      } else {
        setQuestionAnswer('Sorry, I couldn\'t find an answer to your question. Please try rephrasing it.');
      }
    } catch (error) {
      setQuestionAnswer('An error occurred while processing your question. Please try again.');
    } finally {
      setIsAskingQuestion(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

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
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <span>←</span>
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-800">Page Analysis</h1>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={onClearHistory}
              disabled={isLoading}
              className={`${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-red-500 hover:bg-red-600'
              } text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200`}
              title={isLoading ? "Cannot clear history while loading" : "Clear Analysis History"}
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

        {isLoadingSavedAnalysis ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 opacity-60"></div>
            <p className="text-gray-600 text-sm font-medium">Loading saved analysis...</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 opacity-60"></div>
            <p className="text-gray-600 text-sm font-medium">Analyzing page content...</p>
            <p className="text-gray-500 text-xs mt-2">This may take a few moments</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-4">
            {/* Summary Section */}
            {analysisData.summary && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">📊</span>
                  </div>
                  Summary (50 words max)
                </h2>
                <p className="text-gray-700 text-sm leading-relaxed">{analysisData.summary}</p>
              </motion.div>
            )}

            {/* FAQs Section */}
            {analysisData.faqs && analysisData.faqs.length > 0 && (
              <motion.div 
                className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-gray-800 font-semibold mb-4 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm">❓</span>
                  </div>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  {analysisData.faqs.slice(0, 5).map((faq, index) => (
                    <div key={index} className="border-l-4 border-blue-400 pl-4 bg-gray-50 rounded-r-lg p-3">
                      <p className="text-gray-800 font-medium text-sm mb-1">{faq.question}</p>
                      <p className="text-gray-600 text-xs leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Ask Your Own Question Section */}
            <motion.div 
              className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-gray-800 font-semibold mb-4 flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm">💬</span>
                </div>
                Ask Your Own Question
              </h2>
              
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything about this page..."
                    className="flex-1 bg-white text-gray-700 border border-gray-300 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 shadow-sm"
                    disabled={isAskingQuestion}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={!userQuestion.trim() || isAskingQuestion}
                    className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl text-sm transition-all duration-300 disabled:cursor-not-allowed shadow-lg flex items-center"
                  >
                    {isAskingQuestion ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      'Ask'
                    )}
                  </button>
                </div>

                {/* Question Answer Display */}
                {questionAnswer && (
                  <motion.div 
                    className="border-l-4 border-green-400 pl-4 bg-gray-50 rounded-r-lg p-3 mt-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-gray-800 font-medium text-sm mb-1">Answer:</p>
                    <div 
                      className="text-gray-600 text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: questionAnswer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      }}
                    />
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <p className="text-gray-700 text-sm font-medium mb-2">Failed to analyze page</p>
            <p className="text-gray-500 text-xs mb-4 text-center">
              There was an error processing the page content
            </p>
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-3 rounded-xl text-sm transition-all duration-300 shadow-lg"
            >
              Retry Analysis
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnalysisPage;
