import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchDisplay from './ResearchDisplay';
import FloatingButton from './FloatingButton';
import AnalysisPage from './AnalysisPage';
import FactChecker from './FactChecker';
import aiService from '../utils/aiService';

const LandingPage = React.memo(({ onGetStarted }) => (
  <motion.div 
    className="w-full h-full bg-black flex flex-col relative overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Red gradient background */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-radial from-red-500/20 via-red-600/10 to-transparent"></div>
    </div>
    
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex-1 flex flex-col pt-6 px-6 relative z-10"
    >
      {/* Header with globe logo and AI badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          <span className="text-white font-semibold">Web Summary</span>
        </div>
        <div className="bg-transparent border border-red-500 rounded-full px-3 py-1 flex items-center space-x-1">
          <span className="text-red-500 text-xs">⚡</span>
          <span className="text-white text-xs font-medium">AI</span>
        </div>
      </div>
      
      {/* Welcome text */}
      <motion.h1 
        className="text-2xl font-bold text-white mb-2"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Welcome to
      </motion.h1>
      
      <motion.h2 
        className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Web Summary
      </motion.h2>
      
      {/* Description */}
      <motion.p 
        className="text-white text-sm mb-8 leading-relaxed"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        Conduct comprehensive research with AI for academic sources, credible articles, and expert insights on any topic.
      </motion.p>
      
      {/* Feature boxes */}
      <motion.div 
        className="flex justify-between space-x-2 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        {/* Academic Sources */}
        <div className="flex-1 bg-black/20 border border-red-500/30 rounded-xl p-3 flex flex-col items-center">
          <div className="text-red-500 text-lg mb-1">🎓</div>
          <span className="text-white text-xs font-medium">Academic</span>
        </div>
        
        {/* Credible Articles */}
        <div className="flex-1 bg-black/20 border border-red-500/30 rounded-xl p-3 flex flex-col items-center">
          <div className="text-red-500 text-lg mb-1">📰</div>
          <span className="text-white text-xs font-medium">Credible</span>
        </div>
        
        {/* Expert Insights */}
        <div className="flex-1 bg-black/20 border border-red-500/30 rounded-xl p-3 flex flex-col items-center">
          <div className="text-red-500 text-lg mb-1">👨‍🎓</div>
          <span className="text-white text-xs font-medium">Expert</span>
        </div>
      </motion.div>
      
      {/* Get Started button */}
      <motion.button 
        onClick={onGetStarted}
        className="w-full bg-gradient-to-b from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center space-x-2 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Get Started</span>
        <span className="text-lg">→</span>
      </motion.button>
    </motion.div>
  </motion.div>
));

const Popup = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [showResearch, setShowResearch] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFactChecker, setShowFactChecker] = useState(false);
  const [researchResults, setResearchResults] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [researchDepth, setResearchDepth] = useState('comprehensive');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [factCheckData, setFactCheckData] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState('');
  const inputRef = useRef(null);



  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const storage = await chrome.storage.local.get(['hasSeenLanding']);
        
        if (!storage.hasSeenLanding) {
          setShowLanding(true);
        } else {
          setShowLanding(false);
          setShowResearch(true);
        }
      } catch (error) {
        console.error('Error checking first time status:', error);
        setShowLanding(true);
      }
    };
    
    checkFirstTime();
  }, []);

  const handleSendMessage = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!inputMessage.trim() || isLoading) return;

    const currentInputMessage = inputMessage;
    const currentResearchDepth = researchDepth;
    
    setInputMessage('');
    setIsLoading(true);
    setResearchResults(null);

    try {
      const result = await aiService.performResearch(currentInputMessage, currentResearchDepth);
      
      if (result.success) {
        setResearchResults(result);
      } else {
        setResearchResults({
          error: true,
          message: result.message || 'Failed to complete research',
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error performing research:', error);
      setResearchResults({
        error: true,
        message: 'Failed to complete research',
        details: error.message
      });
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, researchDepth, isLoading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  const handleDepthChange = useCallback((e) => {
    setResearchDepth(e.target.value);
  }, []);

  const handleLandingButtonClick = useCallback(async () => {
    try {
      await chrome.storage.local.set({ hasSeenLanding: true });
      setShowLanding(false);
      setShowResearch(true);
    } catch (error) {
      console.error('Error saving landing page status:', error);
      setShowLanding(false);
      setShowResearch(true);
    }
  }, []);

  const handleAnalysePage = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url) {
        setCurrentPageUrl(tab.url);
        
        setShowResearch(false);
        setShowLanding(false);
        setShowAnalysis(true);
        setIsLoading(true);
        setAnalysisData(null);

        const result = await aiService.generatePageAnalysis(tab.url);
        
        if (result.success) {
          setAnalysisData({
            summary: result.summary,
            faqs: result.faqs
          });
        } else {
          console.error('Page analysis failed:', result.error);
          setAnalysisData(null);
        }
      } else {
        console.error('Unable to get current tab URL');
        setAnalysisData(null);
      }
    } catch (error) {
      console.error('Error triggering page analysis:', error);
      setAnalysisData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  const handleBackFromAnalysis = useCallback(() => {
    setShowAnalysis(false);
    setShowResearch(true);
    setAnalysisData(null);
    setCurrentPageUrl('');
  }, []);

  const handleRetryAnalysis = useCallback(() => {
    handleAnalysePage();
  }, [handleAnalysePage]);

  const handleFactChecker = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url) {
        setCurrentPageUrl(tab.url);
        
        setShowResearch(false);
        setShowLanding(false);
        setShowAnalysis(false);
        setShowFactChecker(true);
        setIsLoading(true);
        setFactCheckData(null);

        const result = await aiService.generateFactCheck(tab.url);
        
        if (result.success) {
          setFactCheckData({
            overallAssessment: result.overallAssessment,
            credibilityScore: result.credibilityScore,
            verifiedClaims: result.verifiedClaims || [],
            disputedClaims: result.disputedClaims || [],
            falseClaims: result.falseClaims || [],
            sources: result.sources || [],
            recommendations: result.recommendations,
            rawResponse: result.rawResponse
          });
        } else {
          console.error('Fact check failed:', result.error);
          setFactCheckData(null);
        }
      } else {
        console.error('Unable to get current tab URL');
        setFactCheckData(null);
      }
    } catch (error) {
      console.error('Error triggering fact check:', error);
      setFactCheckData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBackFromFactChecker = useCallback(() => {
    console.log('🔍 Fact Checker: Going back to research');
    setShowFactChecker(false);
    setShowResearch(true);
    setFactCheckData(null);
    setCurrentPageUrl('');
  }, []);

  const handleRetryFactCheck = useCallback(() => {
    console.log('🔍 Fact Checker: Retrying fact check');
    handleFactsChecker();
  }, [handleFactsChecker]);

  const handleAskQuestion = useCallback(async (question, pageUrl) => {
    try {
      const questionPrompt = `Based on the webpage at ${pageUrl}, please answer the following question:

Question: ${question}

Please provide a detailed and helpful answer based on the content and context of the webpage. If the question cannot be answered from the page content, please explain what information would be needed.`;

      const response = await chrome.runtime.sendMessage({
        type: 'chatMessage',
        message: questionPrompt
      });

      if (response && response.success) {
        return {
          success: true,
          answer: response.reply
        };
      } else {
        return {
          success: false,
          answer: 'Sorry, I couldn\'t process your question at this time.'
        };
      }
    } catch (error) {
      console.error('Error asking question:', error);
      return {
        success: false,
        answer: 'An error occurred while processing your question.'
      };
    }
  }, []);

  const handleFactsChecker = useCallback(async () => {
    console.log('🔍 Fact Checker: Starting fact check process...');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('🔍 Fact Checker: Active tab found:', tab?.url);
      
      if (tab && tab.url) {
        setCurrentPageUrl(tab.url);
        setFactCheckData(null);
        setIsLoading(true);
        
        setShowLanding(false);
        setShowResearch(false);
        setShowAnalysis(false);
        setShowFactChecker(true);
        
        console.log('🔍 Fact Checker: Switched to fact checker view, calling AI service...');
        
        const result = await aiService.generateFactCheck(tab.url);
        console.log('🔍 Fact Checker: AI service response:', result);
        
        if (result.success) {
          setFactCheckData(result);
          console.log('🔍 Fact Checker: Fact check completed successfully');
        } else {
          console.error('🔍 Fact Checker: AI service error:', result.error);
          setFactCheckData(null);
        }
      } else {
        console.error('🔍 Fact Checker: No active tab found or invalid URL');
      }
    } catch (error) {
      console.error('🔍 Fact Checker: Error during fact checking:', error);
      setFactCheckData(null);
    } finally {
      setIsLoading(false);
      console.log('🔍 Fact Checker: Process completed');
    }
  }, []);

  return (
    <div className="relative w-full h-full">
      <AnimatePresence mode="wait">
        {showLanding ? (
          <LandingPage 
            key="landing" 
            onGetStarted={handleLandingButtonClick}
          />
        ) : showAnalysis ? (
          <AnalysisPage
            key="analysis"
            analysisData={analysisData}
            currentPageUrl={currentPageUrl}
            isLoading={isLoading}
            onBack={handleBackFromAnalysis}
            onRetry={handleRetryAnalysis}
            onAskQuestion={handleAskQuestion}
          />
        ) : showFactChecker ? (
          <FactChecker
            key="factchecker"
            factCheckData={factCheckData}
            currentPageUrl={currentPageUrl}
            isLoading={isLoading}
            onBack={handleBackFromFactChecker}
            onRetry={handleRetryFactCheck}
          />
        ) : showResearch ? (
          <div className="relative w-full h-full">
            <ResearchDisplay 
              key="research"
              researchResults={researchResults}
              isLoading={isLoading}
              inputMessage={inputMessage}
              researchDepth={researchDepth}
              onInputChange={handleInputChange}
              onDepthChange={handleDepthChange}
              onKeyDown={handleKeyDown}
              onSendMessage={handleSendMessage}
              inputRef={inputRef}
            />    
            <FloatingButton 
              onAnalysePage={handleAnalysePage}
              onFactsChecker={handleFactsChecker}
            />
          </div>
        ) : (
          <div style={{ width: '400px', height: '600px', backgroundColor: 'white' }}>
            {/* Fallback blank UI */}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Popup;
