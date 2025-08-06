import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ResearchDisplay from './ResearchDisplay';
import FloatingButton from './FloatingButton';
import AnalysisPage from './AnalysisPage';
import FactChecker from './FactChecker';
import ModelSelection from './ModelSelection';
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
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full"></div>
          </div>
          <span className="text-gray-800 font-semibold">Web Summary</span>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full px-3 py-1 flex items-center space-x-1 shadow-sm">
          <span className="text-white text-xs">⚡</span>
          <span className="text-white text-xs font-medium">AI</span>
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
  const [showModelSelection, setShowModelSelection] = useState(false);
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
  const [intendedRoute, setIntendedRoute] = useState(null); // Store intended route after setup
  
  // Routing state
  const [currentRoute, setCurrentRoute] = useState('landing'); // 'landing', 'research', 'analysis', 'fact-checker', 'model-selection'
  
  const inputRef = useRef(null);

  // Chrome message listener for routing
  useEffect(() => {
    
    const handleBackgroundMessage = (message, _sender, sendResponse) => {
      if (message?.type === 'navigateToRoute') {
        processRouteMessage(message);
        if (sendResponse) sendResponse({ acknowledged: true });
      }
    };

    chrome.runtime.onMessage.addListener(handleBackgroundMessage);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleBackgroundMessage);
    };
  }, []); // Remove currentRoute dependency to prevent infinite loop

  // Check for pending route messages in storage on popup open
  useEffect(() => {
    const checkPendingRouteMessage = async () => {
      try {
        console.log('📱 POPUP: Checking for pending route messages...');
        const result = await chrome.storage.local.get(['pendingRouteMessage', 'pendingRouteTimestamp']);
        
        if (result.pendingRouteMessage && result.pendingRouteTimestamp) {
          const messageAge = Date.now() - result.pendingRouteTimestamp;
          console.log('📱 POPUP: Found pending route message, age:', messageAge, 'ms');
          
          // Only process if message is less than 5 seconds old
          if (messageAge < 5000) {
            console.log('📱 POPUP: Processing pending route message:', result.pendingRouteMessage);
            processRouteMessage(result.pendingRouteMessage);
            
            // Clear the pending message
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
  }, []); // Run once on popup mount

  // Helper function to process route messages
  const processRouteMessage = (message) => {
    console.log('📱 POPUP: Processing route message:', message);
    
    // If setup is required, go to model selection first
    if (message.setupRequired) {
      console.log('📱 POPUP: Setup required, storing intended route and going to model selection');
      setIntendedRoute({
        route: message.originalRoute || message.route,
        feature: message.feature,
        originalMessage: message
      });
      setCurrentRoute('model-selection');
      return;
    }
    
    // Normal route processing
    switch (message.route) {
      case '/research':
        setCurrentRoute('research');
        break;
      case '/analysis':
        handleAnalysePage();
        break;
      case '/fact-checker':
        handleFactChecker();
        break;
      case '/model-selection':
        setCurrentRoute('model-selection');
        break;
      default:
        setCurrentRoute('landing');
    }
  };

  // Load saved research results on component mount
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

  // Load saved analysis data on component mount
  useEffect(() => {
    const loadSavedAnalysis = async () => {
      try {
        const storage = await chrome.storage.local.get(['savedAnalysisData', 'savedAnalysisUrl']);
        if (storage.savedAnalysisData && storage.savedAnalysisUrl) {
          setAnalysisData(storage.savedAnalysisData);
          setCurrentPageUrl(storage.savedAnalysisUrl);
        }
      } catch (error) {
        console.error('Error loading saved analysis:', error);
      } finally {
        setIsLoadingSavedAnalysis(false);
      }
    };
    
    loadSavedAnalysis();
  }, []);

  // Load saved fact check data on component mount
  useEffect(() => {
    const loadSavedFactCheck = async () => {
      try {
        const storage = await chrome.storage.local.get(['savedFactCheckData', 'savedFactCheckUrl']);
        if (storage.savedFactCheckData && storage.savedFactCheckUrl) {
          setFactCheckData(storage.savedFactCheckData);
          setCurrentPageUrl(storage.savedFactCheckUrl);
        }
      } catch (error) {
        console.error('Error loading saved fact check:', error);
      } finally {
        setIsLoadingSavedFactCheck(false);
      }
    };
    
    loadSavedFactCheck();
  }, []);

  // Save research results whenever they change
  useEffect(() => {
    const saveResearchResults = async () => {
      try {
        if (researchResults) {
          await chrome.storage.local.set({
            savedResearchResults: researchResults,
            savedResearchTopic: currentResearchTopic
          });
        } else {
          // Clear saved data if no results
          await chrome.storage.local.remove(['savedResearchResults', 'savedResearchTopic']);
        }
      } catch (error) {
        console.error('Error saving research results:', error);
      }
    };
    
    saveResearchResults();
  }, [researchResults, currentResearchTopic]);

  // Save analysis data whenever it changes
  useEffect(() => {
    const saveAnalysisData = async () => {
      try {
        console.log('💾 Save Function: analysisData exists:', !!analysisData);
        console.log('💾 Save Function: currentPageUrl:', currentPageUrl);
        
        if (analysisData && currentPageUrl) {
          const normalizedUrl = normalizeUrl(currentPageUrl);
          console.log('💾 Save Function: Saving analysis data with URL:', normalizedUrl);
          
          await chrome.storage.local.set({
            savedAnalysisData: analysisData,
            savedAnalysisUrl: normalizedUrl
          });
          
          console.log('💾 Save Function: Analysis data saved successfully');
        } else if (!analysisData && currentPageUrl) {
          // Don't clear data when user is just navigating back (analysisData is null but URL exists)
          console.log('💾 Save Function: Preserving saved analysis data - user navigating back');
        } else {
          console.log('💾 Save Function: Clearing analysis data - no analysisData or currentPageUrl');
          // Clear saved data if no results
          await chrome.storage.local.remove(['savedAnalysisData', 'savedAnalysisUrl']);
        }
      } catch (error) {
        console.error('Error saving analysis data:', error);
      }
    };
    
    saveAnalysisData();
  }, [analysisData, currentPageUrl]);

  // Save fact check data whenever it changes
  useEffect(() => {
    const saveFactCheckData = async () => {
      try {
        console.log('💾 Save Function: factCheckData exists:', !!factCheckData);
        console.log('💾 Save Function: currentPageUrl:', currentPageUrl);
        
        if (factCheckData && currentPageUrl) {
          const normalizedUrl = normalizeUrl(currentPageUrl);
          console.log('💾 Save Function: Saving data with URL:', normalizedUrl);
          
          await chrome.storage.local.set({
            savedFactCheckData: factCheckData,
            savedFactCheckUrl: normalizedUrl
          });
          
          console.log('💾 Save Function: Data saved successfully');
        } else if (!factCheckData && currentPageUrl) {
          // Don't clear data when user is just navigating back (factCheckData is null but URL exists)
          console.log('💾 Save Function: Preserving saved data - user navigating back');
        } else {
          console.log('💾 Save Function: Clearing saved data - no factCheckData or currentPageUrl');
          // Clear saved data if no results
          await chrome.storage.local.remove(['savedFactCheckData', 'savedFactCheckUrl']);
        }
      } catch (error) {
        console.error('Error saving fact check data:', error);
      }
    };
    
    saveFactCheckData();
  }, [factCheckData, currentPageUrl]);

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

  // Check if setup is completed on component mount
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
          // Setup is not complete, we'll show model selection when needed
        } else {
          console.log('🔍 Setup completed, initializing AI service...');
          // Initialize AI service with saved config
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

  // Initialize AI service with user's saved configuration
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
    
    // Create new abort controller for this research request
    const controller = new AbortController();
    setAbortController(controller);
    setIsUserCancelled(false); // Reset cancellation flag
    
    setCurrentResearchTopic(inputMessage);
    setInputMessage('');
    setIsResearchLoading(true);
    setResearchResults(null);

    try {
      const result = await aiService.performResearch(currentInputMessage, currentResearchDepth, controller);
      
      // If user cancelled during the API call, ignore the result
      if (isUserCancelled) {
        console.log('🛑 Ignoring API result - user cancelled research');
        return;
      }
      
      if (result.success) {
        setResearchResults(result);
      } else if (result.message === 'Research was cancelled') {
        // Don't set any results for user cancellation
        setResearchResults(null);
      } else {
        setResearchResults({
          error: true,
          message: result.message || 'Failed to complete research',
          details: result.details
        });
      }
    } catch (error) {
      console.error('Error performing research:', error);
      
      // If user cancelled during the API call, ignore the error
      if (isUserCancelled) {
        console.log('🛑 Ignoring API error - user cancelled research');
        return;
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
    
    // Check if setup is completed before proceeding
    if (!setupCompleted && !isCheckingSetup) {
      console.log('🎯 GET STARTED: Setup not completed, showing model selection');
      setCurrentRoute('model-selection');
      return;
    }

    try {
      await chrome.storage.local.set({ hasSeenLanding: true });
      console.log('🎯 GET STARTED: Saved landing status, navigating to research');
      setCurrentRoute('research');
    } catch (error) {
      console.error('Error saving landing page status:', error);
      console.log('🎯 GET STARTED: Error occurred, still navigating to research');
      setCurrentRoute('research');
    }
  }, [setupCompleted, isCheckingSetup]);

  // Handle model selection completion
  const handleModelSelectionComplete = useCallback(async () => {
    console.log('🎯 MODEL SELECTION: Setup completed');
    
    // Re-initialize AI service with new configuration
    await initializeAIService();
    setSetupCompleted(true);
    
    // Mark that user has seen landing
    try {
      await chrome.storage.local.set({ hasSeenLanding: true });
    } catch (error) {
      console.error('Error saving landing page status:', error);
    }
    
    // Navigate to intended route if there is one, otherwise go to research
    if (intendedRoute) {
      console.log('🎯 MODEL SELECTION: Navigating to intended route:', intendedRoute.route);
      
      // Clear the intended route
      setIntendedRoute(null);
      
      // Navigate based on the original intended route
      switch (intendedRoute.route) {
        case '/research':
          setCurrentRoute('research');
          break;
        case '/analysis':
          handleAnalysePage();
          break;
        case '/fact-checker':
          handleFactChecker();
          break;
        default:
          setCurrentRoute('research');
      }
    } else {
      console.log('🎯 MODEL SELECTION: No intended route, going to research');
      setCurrentRoute('research');
    }
  }, [intendedRoute, handleAnalysePage, handleFactChecker]);

  // Handle going back from model selection
  const handleModelSelectionBack = useCallback(() => {
    console.log('🎯 MODEL SELECTION: Going back to landing');
    setIntendedRoute(null); // Clear any intended route
    setCurrentRoute('landing');
  }, []);

  const handleAnalysePage = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab && tab.url) {
        const currentUrl = tab.url;
        console.log('📊 Analysis: Current URL:', currentUrl);
        setCurrentPageUrl(currentUrl);
        
        // Check if we already have saved analysis data for this URL
        const storage = await chrome.storage.local.get(['savedAnalysisData', 'savedAnalysisUrl']);
        console.log('📊 Analysis: Saved URL from storage:', storage.savedAnalysisUrl);
        console.log('📊 Analysis: Saved data exists:', !!storage.savedAnalysisData);
        
        // Compare normalized URLs only (strips trailing slash/protocol but keeps full path)
        const currentNormalized = normalizeUrl(currentUrl);
        const savedNormalized = storage.savedAnalysisUrl ? normalizeUrl(storage.savedAnalysisUrl) : '';
        const urlMatch = savedNormalized && savedNormalized === currentNormalized;

        console.log('📊 Analysis: Saved normalized URL:', savedNormalized);
        console.log('📊 Analysis: Current normalized URL:', currentNormalized);
        console.log('📊 Analysis: URL match:', urlMatch);

        if (storage.savedAnalysisData && urlMatch) {
          // Load saved data instead of making API call
          console.log('📊 Analysis: Loading saved analysis data for URL:', currentUrl);
          setAnalysisData(storage.savedAnalysisData);
          setCurrentRoute('analysis');
          setIsAnalysisLoading(false);
          return;
        }
        
        console.log('📊 Analysis: No saved data found, making API call for URL:', currentUrl);
        setCurrentRoute('analysis');
        setIsAnalysisLoading(true);
        setAnalysisData(null);

        const result = await aiService.generatePageAnalysis(currentUrl);
        
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
      setIsAnalysisLoading(false);
    }
  }, []);
  const handleBackFromAnalysis = useCallback(() => {
    console.log('⬅️ BACK: From analysis to research');
    setCurrentRoute('research');
    setAnalysisData(null);
    // Don't clear currentPageUrl to preserve saved data
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
        setCurrentPageUrl(currentUrl);
        
        // Check if we already have saved fact check data for this URL
        const storage = await chrome.storage.local.get(['savedFactCheckData', 'savedFactCheckUrl']);
        console.log('🔍 Fact Checker: Saved URL from storage:', storage.savedFactCheckUrl);
        console.log('🔍 Fact Checker: Saved data exists:', !!storage.savedFactCheckData);
        
        // Compare normalized URLs only (no loose domain matches)
        const currentNormalized = normalizeUrl(currentUrl);
        const savedNormalized = storage.savedFactCheckUrl ? normalizeUrl(storage.savedFactCheckUrl) : '';
        const urlMatch = savedNormalized && savedNormalized === currentNormalized;

        console.log('🔍 Fact Checker: Saved normalized URL:', savedNormalized);
        console.log('🔍 Fact Checker: Current normalized URL:', currentNormalized);
        console.log('🔍 Fact Checker: URL match:', urlMatch);

        if (storage.savedFactCheckData && urlMatch) {
          // Load saved data instead of making API call
          console.log('🔍 Fact Checker: Loading saved fact check data for URL:', currentUrl);
          setFactCheckData(storage.savedFactCheckData);
          setCurrentRoute('fact-checker');
          setIsFactCheckerLoading(false);
          console.log('🔍 Fact Checker: Loaded saved fact check data');
          return;
        }
        
        console.log('🔍 Fact Checker: No saved data found, making API call for URL:', currentUrl);
        setFactCheckData(null);

        setCurrentRoute('fact-checker');
        setIsFactCheckerLoading(true);
        
        console.log('🔍 Fact Checker: Switched to fact checker view, calling AI service...');

        const result = await aiService.generateFactCheck(currentUrl);
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
      setIsFactCheckerLoading(false);
      console.log('🔍 Fact Checker: Process completed');
    }
  }, []);

  const handleBackFromFactChecker = useCallback(() => {
    console.log('⬅️ BACK: From fact checker to research');
    setCurrentRoute('research');
    setFactCheckData(null);
    // Don't clear currentPageUrl to preserve saved data
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
      // Clear from storage
      await chrome.storage.local.remove(['savedAnalysisData', 'savedAnalysisUrl']);
      // Clear from state
      setAnalysisData(null);
      setCurrentPageUrl('');
    } catch (error) {
      console.error('Error clearing analysis history:', error);
    }
  }, []);

  const handleClearFactCheckHistory = useCallback(async () => {
    try {
      // Clear from storage
      await chrome.storage.local.remove(['savedFactCheckData', 'savedFactCheckUrl']);
      // Clear from state
      setFactCheckData(null);
      setCurrentPageUrl('');
    } catch (error) {
      console.error('Error clearing fact check history:', error);
    }
  }, []);

  const handleClearAllHistory = useCallback(async () => {
    try {
      // Clear all saved data
      await chrome.storage.local.remove([
        'savedResearchResults', 
        'savedResearchTopic',
        'savedAnalysisData', 
        'savedAnalysisUrl',
        'savedFactCheckData', 
        'savedFactCheckUrl'
      ]);
      // Clear from state
      setResearchResults(null);
      setCurrentResearchTopic('');
      setAnalysisData(null);
        setFactCheckData(null);
      setCurrentPageUrl('');
      console.log('🧹 Cleared all saved data');
    } catch (error) {
      console.error('Error clearing all history:', error);
    }
  }, []);


  // Update routing based on currentRoute state
  useEffect(() => {
    console.log('🔄 ROUTING: CurrentRoute changed to:', currentRoute);
    
    switch (currentRoute) {
      case 'research':
        console.log('🔄 ROUTING: Switching to research view');
        setShowLanding(false);
        setShowAnalysis(false);
        setShowFactChecker(false);
        setShowModelSelection(false);
        setShowResearch(true);
        break;
      case 'analysis':
        console.log('🔄 ROUTING: Switching to analysis view');
        setShowLanding(false);
        setShowResearch(false);
        setShowFactChecker(false);
        setShowModelSelection(false);
        setShowAnalysis(true);
        // Auto-trigger analysis using existing function (handles URL matching automatically)
        handleAnalysePage();
        break;
      case 'fact-checker':
        console.log('🔄 ROUTING: Switching to fact-checker view');
        setShowLanding(false);
        setShowResearch(false);
        setShowAnalysis(false);
        setShowModelSelection(false);
        setShowFactChecker(true);
        // Auto-trigger fact check using existing function (handles URL matching automatically)
        handleFactChecker();
        break;
      case 'model-selection':
        console.log('🔄 ROUTING: Switching to model selection view');
        setShowLanding(false);
        setShowResearch(false);
        setShowAnalysis(false);
        setShowFactChecker(false);
        setShowModelSelection(true);
        break;
      case 'landing':
      default:
        console.log('🔄 ROUTING: Switching to landing view');
        setShowResearch(false);
        setShowAnalysis(false);
        setShowFactChecker(false);
        setShowModelSelection(false);
        setShowLanding(true);
        break;
    }
    
    console.log('🔄 ROUTING: View switch completed for route:', currentRoute);
  }, [currentRoute, handleAnalysePage, handleFactChecker]); // Include the handler functions as dependencies

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
          />
        ) : showModelSelection ? (
          <ModelSelection
            key="model-selection"
            onSetupComplete={handleModelSelectionComplete}
            onBack={handleModelSelectionBack}
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
              inputRef={inputRef}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-white">
            {/* Fallback blank UI */}
          </div>
        )}
      </AnimatePresence>
      

    </div>
  );
};

export default Popup;
