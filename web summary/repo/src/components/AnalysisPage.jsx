import React from 'react';
import { motion } from 'framer-motion';

const AnalysisPage = ({ analysisData, currentPageUrl, isLoading, onBack, onRetry, onAskQuestion }) => {
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
        <h1 className="text-lg font-semibold text-white">Page Analysis</h1>
        <div className="w-12"></div> {/* Spacer for center alignment */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* URL Display */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-red-400 text-xs mb-1">Analyzing URL:</p>
          <p className="text-white text-sm break-all">{currentPageUrl}</p>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mb-4"></div>
            <p className="text-white text-sm">Analyzing page content...</p>
            <p className="text-gray-400 text-xs mt-2">This may take a few moments</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-4">
            {/* Summary Section */}
            {analysisData.summary && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">📊</span>
                  Summary (50 words max)
                </h2>
                <p className="text-white text-sm leading-relaxed">{analysisData.summary}</p>
              </div>
            )}

            {/* FAQs Section */}
            {analysisData.faqs && analysisData.faqs.length > 0 && (
              <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
                <h2 className="text-red-400 font-medium mb-3 flex items-center">
                  <span className="mr-2">❓</span>
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3">
                  {analysisData.faqs.slice(0, 5).map((faq, index) => (
                    <div key={index} className="border-l-2 border-red-500/30 pl-3">
                      <p className="text-white font-medium text-sm mb-1">{faq.question}</p>
                      <p className="text-gray-300 text-xs leading-relaxed">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ask Your Own Question Section */}
            <div className="bg-black/50 border border-red-500/30 rounded-lg p-4">
              <h2 className="text-red-400 font-medium mb-3 flex items-center">
                <span className="mr-2">💬</span>
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
                    className="flex-1 bg-black/70 border border-red-500/30 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:border-red-500"
                    disabled={isAskingQuestion}
                  />
                  <button
                    onClick={handleAskQuestion}
                    disabled={!userQuestion.trim() || isAskingQuestion}
                    className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center"
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
                  <div className="border-l-2 border-red-500/30 pl-3 mt-3">
                    <p className="text-white font-medium text-sm mb-1">Answer:</p>
                    <p className="text-gray-300 text-xs leading-relaxed">{questionAnswer}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-white text-sm mb-2">Failed to analyze page</p>
            <p className="text-gray-400 text-xs mb-4 text-center">
              There was an error processing the page content
            </p>
            <button
              onClick={onRetry}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
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
