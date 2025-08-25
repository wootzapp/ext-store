import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchDisplay from './ResearchDisplay';
import FloatingButton from './FloatingButton';
import AnalysisPage from './AnalysisPage';
import FactChecker from './FactChecker';
import Settings from './Settings';
import SettingsButton from './SettingsButton';
import aiService from '../utils/aiService';
import StorageUtils from '../utils/storageUtils';
import { normalizeUrl } from '../utils/urlUtils';

const LandingPage = React.memo(({ onGetStarted }) => (
  <motion.div 
    className="w-full h-full flex flex-col relative overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Background */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white"></div>
    </div>
    
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="flex-1 flex flex-col pt-6 px-6 relative z-10"
    >
      {/* Header with globe logo and AI badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-800 font-semibold">Web Summary</span>
        </div>
        <div className="flex items-center justify-end flex-1">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full px-3 py-1 flex items-center space-x-1 shadow-sm">
            <span className="text-white text-xs">⚡</span>
            <span className="text-white text-xs font-medium">AI</span>
          </div>
        </div>
      </div>
      
      {/* Welcome text */}
      <motion.h1 
        className="text-2xl font-bold text-gray-800 mb-2"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Welcome to
      </motion.h1>
      
      <motion.h2 
        className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-6"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Web Summary
      </motion.h2>
      
      {/* Description */}
      <motion.p 
        className="text-gray-600 text-sm mb-8 leading-relaxed"
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
        <div className="flex-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-red-500 text-lg mb-1">🎓</div>
          <span className="text-gray-800 text-xs font-medium">Academic</span>
        </div>
        
        {/* Credible Articles */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-red-500 text-lg mb-1">📰</div>
          <span className="text-gray-800 text-xs font-medium">Credible</span>
        </div>
        
        {/* Expert Insights */}
        <div className="flex-1 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-red-500 text-lg mb-1">👨‍🎓</div>
          <span className="text-gray-800 text-xs font-medium">Expert</span>
        </div>
      </motion.div>
      
      {/* Get Started button */}
      <motion.button 
        onClick={onGetStarted}
        className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center space-x-2 mb-6"
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
  const [showSettings, setShowSettings] = useState(false);
  const [researchResults, setResearchResults] = useState(null);
  const [inputMessage, setInputMessage] = useState('');
  const [researchDepth, setResearchDepth] = useState('comprehensive');
  const [isResearchLoading, setIsResearchLoading] = useState(false);
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  const [isFactCheckerLoading, setIsFactCheckerLoading] = useState(false);
  const [currentResearchTopic, setCurrentResearchTopic] = useState('');
  const [analysisData, setAnalysisData] = useState(null);
  const [factCheckData, setFactCheckData] = useState(null);
  const [currentPageUrl, setCurrentPageUrl] = useState('');
  const [abortController, setAbortController] = useState(null);
  const [isUserCancelled, setIsUserCancelled] = useState(false);
  const [isLoadingSavedResearch, setIsLoadingSavedResearch] = useState(true);
  const [isLoadingSavedAnalysis, setIsLoadingSavedAnalysis] = useState(true);
  const [isLoadingSavedFactCheck, setIsLoadingSavedFactCheck] = useState(true);
  const [isCheckingSetup, setIsCheckingSetup] = useState(true);
  const [setupCompleted, setSetupCompleted] = useState(false);
  const [intendedRoute, setIntendedRoute] = useState(null);
  const [apiKeyError, setApiKeyError] = useState(null);
  
  const [currentRoute, setCurrentRoute] = useState(null);
  
  const inputRef = useRef(null);

  useEffect(() => {
    
    const handleBackgroundMessage = async (message, _sender, sendResponse) => {
      if (message?.type === 'navigateToRoute') {
        await processRouteMessage(message);
        if (sendResponse) sendResponse({ acknowledged: true });
      }
    };

    chrome.runtime.onMessage.addListener(handleBackgroundMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleBackgroundMessage);
    };
  }, []);

  useEffect(() => {
    const checkPendingRouteMessage = async () => {
      try {
        console.log('📱 POPUP: Checking for pending route messages...');
        const result = await chrome.storage.local.get(['pendingRouteMessage', 'pendingRouteTimestamp']);
        
        if (result.pendingRouteMessage && result.pendingRouteTimestamp) {
          const messageAge = Date.now() - result.pendingRouteTimestamp;
          console.log('📱 POPUP: Found pending route message, age:', messageAge, 'ms');
          
          if (messageAge < 5000) {
            console.log('📱 POPUP: Processing pending route message:', result.pendingRouteMessage);
            await processRouteMessage(result.pendingRouteMessage);
            
            await chrome.storage.local.remove(['pendingRouteMessage', 'pendingRouteTimestamp']);
            console.log('📱 POPUP: Cleared pending route message');
          } else {
            console.log('📱 POPUP: Pending route message too old, ignoring');
            await chrome.storage.local.remove(['pendingRouteMessage', 'pendingRouteTimestamp']);
          }
        } else {
          console.log('📱 POPUP: No pending route messages found');
        }
      } catch (error) {
        console.error('📱 POPUP: Error checking pending route messages:', error);
      }
    };

    checkPendingRouteMessage();
  }, []);

  const processRouteMessage = async (message) => {
    console.log('📱 POPUP: Processing route message:', message);
    
    if (message.setupRequired) {
      console.log('📱 POPUP: Setup required, storing intended route and going to settings');
      setIntendedRoute({
        route: message.originalRoute || message.route,
        feature: message.feature,
        originalMessage: message
      });
      setCurrentRoute('settings');
      return;
    }
    
    switch (message.route) {
      case '/research':
        setCurrentRoute('/research');
        break;
      case '/analysis':
        handleAnalysePage();
        break;
      case '/fact-checker':
        handleFactChecker();
        break;
      case '/settings':
        console.log('📱 POPUP: Opening settings via event router, marking landing as seen');
        try {
          await chrome.storage.local.set({ hasSeenLanding: true });
        } catch (error) {
          console.error('Error saving landing page status:', error);
        }
        setCurrentRoute('/settings');
        break;
      default:
        setCurrentRoute('/landing');
        break;
    }
  };

  useEffect(() => {
    const loadSavedResearch = async () => {
      try {
        const storage = await chrome.storage.local.get(['savedResearchResults', 'savedResearchTopic']);
        if (storage.savedResearchResults) {
          setResearchResults(storage.savedResearchResults);
          setCurrentResearchTopic(storage.savedResearchTopic || '');
        }
      } catch (error) {
        console.error('Error loading saved research:', error);
      } finally {
        setIsLoadingSavedResearch(false);
      }
    };
    
    loadSavedResearch();
  }, []);

  useEffect(() => {

    setIsLoadingSavedAnalysis(false);
  }, []);

  useEffect(() => {
    setIsLoadingSavedFactCheck(false);
  }, []);

  useEffect(() => {
    const saveResearchResults = async () => {
      try {
        if (researchResults) {
          await chrome.storage.local.set({
            savedResearchResults: researchResults,
            savedResearchTopic: currentResearchTopic
          });
        } else {
          await chrome.storage.local.remove(['savedResearchResults', 'savedResearchTopic']);
        }
      } catch (error) {
        console.error('Error saving research results:', error);
      }
    };
    
    saveResearchResults();
  }, [researchResults, currentResearchTopic]);

  useEffect(() => {
    console.log('� Save Function: Analysis data storage disabled for fresh API calls');
  }, [analysisData, currentPageUrl]);

  useEffect(() => {
    // No longer saving fact check data to storage - always use fresh data
    console.log('� Save Function: Fact check data storage disabled for fresh API calls');
  }, [factCheckData, currentPageUrl]);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        // Don't run if currentRoute is already set
        if (currentRoute !== null) {
          console.log('📱 POPUP: Route already set to:', currentRoute, ', skipping first time check');
          return;
        }
        
        // Check if there's a pending route message first
        const pendingRoute = await chrome.storage.local.get(['pendingRouteMessage']);
        if (pendingRoute.pendingRouteMessage) {
          console.log('📱 POPUP: Pending route message exists, skipping first time check');
          return;
        }
        
        const storage = await chrome.storage.local.get(['hasSeenLanding']);
        
        if (!storage.hasSeenLanding) {
          console.log('📱 POPUP: First time user, showing landing page');
          setCurrentRoute('/landing');
        } else {
          const isSetupComplete = await StorageUtils.isSetupCompleted();
          if (isSetupComplete) {
            console.log('📱 POPUP: Setup complete, navigating to research');
            setCurrentRoute('/research');
          } else {
            console.log('📱 POPUP: Setup incomplete, navigating to settings');
            setCurrentRoute('/settings');
          }
        }
      } catch (error) {
        console.error('Error checking first time status:', error);
        setCurrentRoute('/landing');
      }
    };
    
    checkFirstTime();
  }, []);

  useEffect(() => {
    const updateCurrentUrl = async () => {
      try {
        console.log('🔍 POPUP: Getting current tab URL...');
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (tab && tab.url) {
          const currentUrl = tab.url;
          console.log('🔍 POPUP: Current tab URL:', currentUrl);
          setCurrentPageUrl(currentUrl);
        } else {
          console.log('🔍 POPUP: No active tab found or invalid URL');
        }
      } catch (error) {
        console.error('❌ POPUP: Error getting current URL:', error);
      }
    };

    // Only run this when popup opens normally (not via route message)
    const checkForRouteMessage = async () => {
      const result = await chrome.storage.local.get(['pendingRouteMessage']);
      if (!result.pendingRouteMessage) {
        console.log('🔍 POPUP: No pending route message, getting current URL...');
        await updateCurrentUrl();
      } else {
        console.log('🔍 POPUP: Pending route message exists, skipping URL update');
      }
    };

    checkForRouteMessage();
  }, []);

  useEffect(() => {
    const checkSetupStatus = async () => {
      setIsCheckingSetup(true);
      try {
        console.log('🔍 Checking setup status...');
        const isSetupComplete = await StorageUtils.isSetupCompleted();
        console.log('🔍 Setup completed:', isSetupComplete);
        
        setSetupCompleted(isSetupComplete);
        
        if (!isSetupComplete) {
          console.log('🔍 Setup not completed, will show model selection');
        } else {
          console.log('🔍 Setup completed, initializing AI service...');
          await initializeAIService();
        }
      } catch (error) {
        console.error('❌ Error checking setup status:', error);
        setSetupCompleted(false);
      } finally {
        setIsCheckingSetup(false);
      }
    };

    checkSetupStatus();
  }, []);

  const initializeAIService = async () => {
    try {
      const config = await StorageUtils.getCurrentConfig();
      if (config) {
        console.log('🤖 Initializing AI service with model:', config.modelId);
        await aiService.updateConfiguration(config);
        console.log('🤖 AI service initialized successfully');
      } else {
        console.log('🤖 No saved configuration found');
        setSetupCompleted(false);
      }
    } catch (error) {
      console.error('❌ Error initializing AI service:', error);
      setSetupCompleted(false);
    }
  };

  const handleSendMessage = useCallback(async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!inputMessage.trim() || isResearchLoading) return;

    const currentInputMessage = inputMessage;
    const currentResearchDepth = researchDepth;
    
    const controller = new AbortController();
    setAbortController(controller);
    setIsUserCancelled(false);
    
    setCurrentResearchTopic(inputMessage);
    setInputMessage('');
    setIsResearchLoading(true);
    setResearchResults(null);

    try {
      const result = await aiService.performResearch(currentInputMessage, currentResearchDepth, controller);
      
      if (isUserCancelled) {
        console.log('🛑 Ignoring API result - user cancelled research');
        return;
      }
      
      if (result.success) {
        setResearchResults(result);
        setApiKeyError(null); // Clear any previous API key errors
      } else if (result.message === 'Research was cancelled') {
        setResearchResults(null);
      } else {
        // Check if this is an API key related error
        const isApiKeyError = result.message && (
          result.message.includes('Unauthorized') ||
          result.message.includes('401') ||
          result.message.includes('403') ||
          result.message.includes('invalid') ||
          result.message.includes('Invalid API key') ||
          result.message.includes('API key')
        );
        
        if (isApiKeyError) {
          setApiKeyError({
            message: result.message,
            details: result.details,
            timestamp: Date.now()
          });
        }
        
        setResearchResults({
          error: true,
          message: result.message || 'Failed to complete research',
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error performing research:', error);
      
      if (isUserCancelled) {
        console.log('🛑 Ignoring API error - user cancelled research');
        return;
      }
      
      // Check if this is an API key related error
      const isApiKeyError = error.message && (
        error.message.includes('Unauthorized') ||
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('invalid') ||
        error.message.includes('Invalid API key') ||
        error.message.includes('API key') ||
        error.message.includes('not configured')
      );
      
      if (isApiKeyError) {
        setApiKeyError({
          message: error.message,
          timestamp: Date.now()
        });
      }
      
      setResearchResults({
        error: true,
        message: 'Failed to complete research',
        details: error.message
      });
    } finally {
      setIsResearchLoading(false);
      setAbortController(null);
      setIsUserCancelled(false);
    }
  }, [inputMessage, researchDepth, isResearchLoading, isUserCancelled]);

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

  const handleStopResearch = useCallback(() => {
    if (abortController) {
      console.log('🛑 Stopping research...');
      setIsUserCancelled(true);
      abortController.abort();
      setIsResearchLoading(false);
      setAbortController(null);
      setResearchResults(null);
      setCurrentResearchTopic('');
    }
  }, [abortController, isUserCancelled]);

  const handleLandingButtonClick = useCallback(async () => {
    console.log('🎯 GET STARTED: Button clicked');
    
    try {
      await chrome.storage.local.set({ hasSeenLanding: true });
      console.log('🎯 GET STARTED: Saved landing status, navigating to settings');
      setCurrentRoute('/settings');
    } catch (error) {
      console.error('Error saving landing page status:', error);
      console.log('🎯 GET STARTED: Error occurred, still navigating to settings');
      setCurrentRoute('/settings');
    }
  }, []);

  const handleApiKeyErrorDismiss = () => {
    setApiKeyError(null);
  };

  const navigateToSettings = () => {
    setShowSettings(true);
    setShowResearch(false);
    setShowAnalysis(false);
    setShowFactChecker(false);
    setApiKeyError(null); 
  };

  const handleSettingsComplete = useCallback(async () => {
    console.log('🎯 SETTINGS: Setup completed');
    
    await initializeAIService();
    setSetupCompleted(true);
    setApiKeyError(null); 
    
    try {
      await chrome.storage.local.set({ hasSeenLanding: true });
    } catch (error) {
      console.error('Error saving landing page status:', error);
    }
    
    if (intendedRoute) {
      console.log('🎯 SETTINGS: Navigating to intended route:', intendedRoute.route);
      
      setIntendedRoute(null);
      
      switch (intendedRoute.route) {
        case '/research':
          setCurrentRoute('/research');
          break;
        case '/analysis':
          handleAnalysePage();
          break;
        case '/fact-checker':
          handleFactChecker();
          break;
        default:
          setCurrentRoute('/research');
      }
    } else {
      console.log('🎯 SETTINGS: No intended route, navigating to research page');
      // Navigate to research page after setup completion
      setCurrentRoute('/research');
    }
  }, [intendedRoute, handleAnalysePage, handleFactChecker]);

  const handleAnalysePage = useCallback(async () => {
    try {
      console.log('📊 Analysis: Starting analysis process...');
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url) {
        const currentUrl = tab.url;
        console.log('📊 Analysis: Current URL:', currentUrl);
        
        // Always update current URL
        setCurrentPageUrl(currentUrl);

        // Switch to analysis route
        setCurrentRoute('/analysis');

        // Always make fresh API call - no storage checking
        console.log('📊 Analysis: Making fresh API call for URL:', currentUrl);
        setAnalysisData(null);
        setIsAnalysisLoading(true);

        const result = await aiService.generatePageAnalysis(currentUrl);
        
        if (result.success) {
          setAnalysisData({
            summary: result.summary,
            faqs: result.faqs
          });
          console.log('📊 Analysis: Analysis completed successfully');
        } else {
          console.error('📊 Analysis: API call failed:', result.error);
          setAnalysisData(null);
        }
      } else {
        console.error('📊 Analysis: Unable to get current tab URL');
        setAnalysisData(null);
        setCurrentRoute('/analysis');
      }
    } catch (error) {
      console.error('📊 Analysis: Error during analysis:', error);
      setAnalysisData(null);
      setCurrentRoute('/analysis');
    } finally {
      setIsAnalysisLoading(false);
      console.log('📊 Analysis: Process completed');
    }
  }, []);

  const handleBackFromAnalysis = useCallback(() => {
    console.log('⬅️ BACK: From analysis to research');
    setCurrentRoute('/research');
    setAnalysisData(null);
  }, []);

  const handleRetryAnalysis = useCallback(() => {
    console.log('📊 Analysis: Retrying analysis');
    // Reset analysis state before retry
    setAnalysisData(null);
    setIsAnalysisLoading(false);
    // Trigger analysis
    handleAnalysePage();
  }, []);

  const handleFactChecker = useCallback(async () => {
    console.log('🔍 Fact Checker: Starting fact check process...');
    
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      console.log('🔍 Fact Checker: Active tab found:', tab?.url);
      
      if (tab && tab.url) {
        const currentUrl = tab.url;
        console.log('🔍 Fact Checker: Current URL:', currentUrl);
        
        // Always update current URL
        setCurrentPageUrl(currentUrl);

        // Switch to fact checker route
        setCurrentRoute('/fact-checker');

        // Always make fresh API call - no storage checking
        console.log('🔍 Fact Checker: Making fresh API call for URL:', currentUrl);
        setFactCheckData(null);
        setIsFactCheckerLoading(true);
        
        console.log('🔍 Fact Checker: Calling AI service...');

        const result = await aiService.generateFactCheck(currentUrl);
        console.log('🔍 Fact Checker: AI service response:', result);
        
        if (result.success) {
          setFactCheckData(result);
          console.log('🔍 Fact Checker: Fact check completed successfully');
        } else {
          console.error('🔍 Fact Checker: API call failed:', result.error);
          setFactCheckData(null);
        }
      } else {
        console.error('🔍 Fact Checker: No active tab found or invalid URL');
        setFactCheckData(null);
        setCurrentRoute('/fact-checker');
      }
    } catch (error) {
      console.error('🔍 Fact Checker: Error during fact checking:', error);
      setFactCheckData(null);
      setCurrentRoute('/fact-checker');
    } finally {
      setIsFactCheckerLoading(false);
      console.log('🔍 Fact Checker: Process completed');
    }
  }, []);

  const handleBackFromFactChecker = useCallback(() => {
    console.log('⬅️ BACK: From fact checker to research');
    setCurrentRoute('/research');
    setFactCheckData(null);
  }, []);

  const handleRetryFactCheck = useCallback(() => {
    console.log('🔍 Fact Checker: Retrying fact check');
    // Reset fact check state before retry
    setFactCheckData(null);
    setIsFactCheckerLoading(false);
    // Trigger fact check
    handleFactChecker();
  }, []);

  const handleAskQuestion = useCallback(async (question, pageUrl) => {
    try {
      console.log('🤔 POPUP: Asking question:', question, 'for URL:', pageUrl);
      
      const questionPrompt = `Based on the webpage at ${pageUrl}, please answer the following question:

Question: ${question}

Please provide a detailed and helpful answer based on the content and context of the webpage. If the question cannot be answered from the page content, please explain what information would be needed.`;

      console.log('🤔 POPUP: Sending message to background with prompt:', questionPrompt);

      const response = await chrome.runtime.sendMessage({
        type: 'chatMessage',
        message: questionPrompt
      });

      console.log('🤔 POPUP: Received response from background:', response);

      if (response && response.success) {
        console.log('🤔 POPUP: Question answered successfully');
        return {
          success: true,
          answer: response.reply
        };
      } else {
        console.log('🤔 POPUP: Question failed:', response);
        return {
          success: false,
          answer: response?.reply || 'Sorry, I couldn\'t process your question at this time.'
        };
      }
    } catch (error) {
      console.error('🤔 POPUP: Error asking question:', error);
      return {
        success: false,
        answer: 'An error occurred while processing your question.'
      };
    }
  }, []);

  const handleClearHistory = useCallback(async () => {
    try {
      // Clear from storage
      await chrome.storage.local.remove(['savedResearchResults', 'savedResearchTopic']);
      // Clear from state
      setResearchResults(null);
      setCurrentResearchTopic('');
    } catch (error) {
      console.error('Error clearing research history:', error);
    }
  }, []);

  const handleClearAnalysisHistory = useCallback(async () => {
    try {
      console.log('🧹 Clearing analysis history');
      // Just clear from state - no storage to clear
      setAnalysisData(null);
    } catch (error) {
      console.error('Error clearing analysis history:', error);
    }
  }, []);

  const handleClearFactCheckHistory = useCallback(async () => {
    try {
      console.log('🧹 Clearing fact check history');
      // Just clear from state - no storage to clear
      setFactCheckData(null);
    } catch (error) {
      console.error('Error clearing fact check history:', error);
    }
  }, []);

  const handleClearAllHistory = useCallback(async () => {
    try {
      console.log('🧹 Clearing all history');
      // Only clear research data from storage - analysis and fact check data are no longer stored
      await chrome.storage.local.remove([
        'savedResearchResults', 
        'savedResearchTopic'
      ]);

      setResearchResults(null);
      setCurrentResearchTopic('');
      setAnalysisData(null);
      setFactCheckData(null);
      console.log('🧹 Cleared all saved data');
    } catch (error) {
      console.error('Error clearing all history:', error);
    }
  }, []);

  // Settings handlers
  const handleSettingsClick = useCallback(async () => {
    console.log('⚙️ Settings: Opening settings');
    try {
      await chrome.storage.local.set({ hasSeenLanding: true });
      console.log('⚙️ Settings: Marked landing as seen when opening settings manually');
    } catch (error) {
      console.error('Error saving landing page status:', error);
    }
    setCurrentRoute('/settings');
  }, []);

  const handleBackFromSettings = useCallback(() => {
    if (intendedRoute) {
      console.log('⬅️ BACK: From settings to landing (canceling setup)');
      console.log(intendedRoute.route)
      setCurrentRoute(intendedRoute.route);
    } else {
      console.log('⬅️ BACK: From settings to research');
      setCurrentRoute('/research');
    }
  }, [intendedRoute]);


  useEffect(() => {
    console.log('🔄 ROUTING: CurrentRoute changed to:', currentRoute);
    
    switch (currentRoute) {
      case '/research':
        console.log('🔄 ROUTING: Switching to research view');
        setShowLanding(false);
        setShowAnalysis(false);
        setShowFactChecker(false);
        setShowSettings(false);
        setShowResearch(true);
        break;
      case '/analysis':
        console.log('🔄 ROUTING: Switching to analysis view');
        setShowLanding(false);
        setShowResearch(false);
        setShowFactChecker(false);
        setShowSettings(false);
        setShowAnalysis(true);
        handleAnalysePage();
        break;
      case '/fact-checker':
        console.log('🔄 ROUTING: Switching to fact-checker view');
        setShowLanding(false);
        setShowResearch(false);
        setShowAnalysis(false);
        setShowSettings(false);
        setShowFactChecker(true);
        // Auto-trigger fact check using existing function (handles URL matching automatically)
        handleFactChecker();
        break;
      case '/settings':
        console.log('🔄 ROUTING: Switching to settings view');
        setShowLanding(false);
        setShowResearch(false);
        setShowAnalysis(false);
        setShowFactChecker(false);
        setShowSettings(true);
        break;
      case '/landing':
        console.log('🔄 ROUTING: Switching to landing view');
        setShowResearch(false);
        setShowAnalysis(false);
        setShowFactChecker(false);
        setShowSettings(false);
        setShowLanding(true);
        break;
      case null:
        // Don't render anything until route is determined
        console.log('🔄 ROUTING: Route not yet determined, waiting...');
        return;
      default:
        console.log('🔄 ROUTING: Unknown route, defaulting to landing view');
        setShowResearch(false);
        setShowAnalysis(false);
        setShowFactChecker(false);
        setShowSettings(false);
        setShowLanding(true);
        break;
    }
    
    console.log('🔄 ROUTING: View switch completed for route:', currentRoute);
  }, [currentRoute, handleAnalysePage, handleFactChecker]); 

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
            isLoading={isAnalysisLoading}
            isLoadingSavedAnalysis={isLoadingSavedAnalysis}
            onBack={handleBackFromAnalysis}
            onRetry={handleRetryAnalysis}
            onAskQuestion={handleAskQuestion}
            onClearHistory={handleClearAnalysisHistory}
            onSettingsClick={handleSettingsClick}
          />
        ) : showFactChecker ? (
          <FactChecker
            key="factchecker"
            factCheckData={factCheckData}
            currentPageUrl={currentPageUrl}
            isLoading={isFactCheckerLoading}
            isLoadingSavedFactCheck={isLoadingSavedFactCheck}
            onBack={handleBackFromFactChecker}
            onRetry={handleRetryFactCheck}
            onClearHistory={handleClearFactCheckHistory}
            onSettingsClick={handleSettingsClick}
          />
        ) : showSettings ? (
          <Settings
            key="settings"
            onBack={handleBackFromSettings}
            onSetupComplete={handleSettingsComplete}
          />
        ) : showResearch ? (
          <div className="relative w-full h-full">
            <ResearchDisplay 
              key="research"
              researchResults={researchResults}
              isLoading={isResearchLoading}
              isLoadingSavedResearch={isLoadingSavedResearch}
              inputMessage={inputMessage}
              currentResearchTopic={currentResearchTopic}
              researchDepth={researchDepth}
              onInputChange={handleInputChange}
              onDepthChange={handleDepthChange}
              onKeyDown={handleKeyDown}
              onSendMessage={handleSendMessage}
              onStopResearch={handleStopResearch}
              onAnalysePage={handleAnalysePage}
              onFactChecker={handleFactChecker}
              onSettingsClick={handleSettingsClick}
              inputRef={inputRef}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-white">
            {/* Fallback blank UI */}
          </div>
        )}
      </AnimatePresence>
      
      {/* API Key Error Notification */}
      <AnimatePresence>
        {apiKeyError && (
          <motion.div
            key="api-error"
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.3 }}
            className="absolute top-0 left-0 right-0 z-50 p-4"
          >
            <div className="bg-red-500 text-white rounded-lg shadow-lg border border-red-600">
              <div className="flex items-start justify-between p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white">API Key Error</h3>
                    <p className="text-sm text-red-100 mt-1">{apiKeyError.message}</p>
                    <div className="flex items-center space-x-3 mt-3">
                      <button
                        onClick={navigateToSettings}
                        className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200"
                      >
                        Fix Settings
                      </button>
                      <button
                        onClick={handleApiKeyErrorDismiss}
                        className="text-red-100 hover:text-white text-sm underline transition-colors duration-200"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleApiKeyErrorDismiss}
                  className="text-red-100 hover:text-white p-1 rounded transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Popup;
