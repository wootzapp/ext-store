import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AIChat from './AIChat';
import FloatingButton from './FloatingButton';
import AnalysisPage from './AnalysisPage';
import FactChecker from './FactChecker';
import aiService from '../utils/aiService';

// Landing Page Component - moved outside to prevent re-creation
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
        Chat with AI for instant answers, help, and information on any topic.
      </motion.p>
      
      {/* Feature boxes */}
      <motion.div 
        className="flex justify-between space-x-2 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        {/* Instant */}
        <div className="flex-1 bg-black/20 border border-red-500/30 rounded-xl p-3 flex flex-col items-center">
          <div className="text-red-500 text-lg mb-1">⚡</div>
          <span className="text-white text-xs font-medium">Instant</span>
        </div>
        
        {/* Smart */}
        <div className="flex-1 bg-black/20 border border-red-500/30 rounded-xl p-3 flex flex-col items-center">
          <div className="text-red-500 text-lg mb-1">📖</div>
          <span className="text-white text-xs font-medium">Smart</span>
        </div>
        
        {/* AI Powered */}
        <div className="flex-1 bg-black/20 border border-red-500/30 rounded-xl p-3 flex flex-col items-center">
          <div className="text-red-500 text-lg mb-1">⭐</div>
          <span className="text-white text-xs font-medium">AI Powered</span>
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
  const [showChat, setShowChat] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFactChecker, setShowFactChecker] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);
  const [factCheckData, setFactCheckData] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Check if this is the first time the extension is being used
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        const storage = await chrome.storage.local.get(['hasSeenLanding']);
        
        if (!storage.hasSeenLanding) {
          // First time user - show landing page
          setShowLanding(true);
        } else {
          // Returning user - show chat
          setShowLanding(false);
          setShowChat(true);
        }
      } catch (error) {
        console.error('Error checking first time status:', error);
        // Fallback to showing landing page
        setShowLanding(true);
      }
    };
    
    checkFirstTime();
  }, []);

  const handleSendMessage = useCallback(async (e) => {
    if (e) {
      e.preventDefault(); // Prevent form submission and page reload
      e.stopPropagation(); // Stop event bubbling
    }
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    const currentInputMessage = inputMessage; // Capture current value
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to background script for AI processing
      const response = await chrome.runtime.sendMessage({
        type: 'chatMessage',
        message: currentInputMessage
      });

      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.reply,
          sender: 'ai',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: Date.now() + 1,
          text: 'Sorry, I encountered an error. Please try again.',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputMessage, isLoading]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default Enter behavior
      e.stopPropagation(); // Stop event bubbling
      handleSendMessage(e);
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((e) => {
    setInputMessage(e.target.value);
  }, []);

  const handleLandingButtonClick = useCallback(async () => {
    try {
      // Mark that user has seen the landing page
      await chrome.storage.local.set({ hasSeenLanding: true });
      setShowLanding(false);
      setShowChat(true);
    } catch (error) {
      console.error('Error saving landing page status:', error);
      setShowLanding(false);
      setShowChat(true);
    }
  }, []);

  const handleAnalysePage = useCallback(async () => {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url) {
        // Set the current page URL
        setCurrentPageUrl(tab.url);
        
        // Switch to analysis page
        setShowChat(false);
        setShowLanding(false);
        setShowAnalysis(true);
        setIsLoading(true);
        setAnalysisData(null);

        // Use aiService to generate page analysis
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

  // Handle going back from analysis page
  const handleBackFromAnalysis = useCallback(() => {
    setShowAnalysis(false);
    setShowChat(true);
    setAnalysisData(null);
    setCurrentPageUrl('');
  }, []);

  // Handle retry analysis
  const handleRetryAnalysis = useCallback(() => {
    handleAnalysePage();
  }, [handleAnalysePage]);

  // Handle fact checker
  const handleFactChecker = useCallback(async () => {
    try {
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url) {
        // Set the current page URL
        setCurrentPageUrl(tab.url);
        
        // Switch to fact checker page
        setShowChat(false);
        setShowLanding(false);
        setShowAnalysis(false);
        setShowFactChecker(true);
        setIsLoading(true);
        setFactCheckData(null);

        // Use aiService to generate fact check
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

  // Handle going back from fact checker page
  const handleBackFromFactChecker = useCallback(() => {
    console.log('🔍 Fact Checker: Going back to chat');
    setShowFactChecker(false);
    setShowChat(true);
    setFactCheckData(null);
    setCurrentPageUrl('');
  }, []);

  // Handle retry fact check
  const handleRetryFactCheck = useCallback(() => {
    console.log('🔍 Fact Checker: Retrying fact check');
    handleFactsChecker();
  }, [handleFactsChecker]);

  // Handle asking personalized questions about the current page
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
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('🔍 Fact Checker: Active tab found:', tab?.url);
      
      if (tab && tab.url) {
        setCurrentPageUrl(tab.url);
        setFactCheckData(null);
        setIsLoading(true);
        
        // Switch to fact checker view
        setShowLanding(false);
        setShowChat(false);
        setShowAnalysis(false);
        setShowFactChecker(true);
        
        console.log('🔍 Fact Checker: Switched to fact checker view, calling AI service...');
        
        // Call AI service directly with the URL
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
        ) : showChat ? (
          <div className="relative w-full h-full">
            <AIChat 
              key="chat"
              messages={messages}
              isLoading={isLoading}
              inputMessage={inputMessage}
              onInputChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
              inputRef={inputRef}
            />
            {/* Floating Button - positioned relative to chat */}
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
