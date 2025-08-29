import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import HomeHub from '@/pages/popup/views/HomeHub';
import Research from '@/pages/popup/views/Research';
import Plans from '@/pages/popup/views/Plans';
import Analysis from '@/pages/popup/views/Analysis';
import FactCheck from '@/pages/popup/views/FactCheck';
import Settings from '@/pages/popup/views/Settings';
import aiService from '@/services/ai';
import StorageUtils from '@/storage';

const LandingPage = React.memo(({ onGetStarted }) => (
  <motion.div
    className="w-full h-full flex flex-col relative overflow-hidden min-w-0"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    {/* Background */}
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white" />
    </div>

    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      className="flex-1 flex flex-col pt-6 px-6 relative z-10 min-w-0"
    >
      {/* Header with globe logo and AI badge */}
      <div className="flex items-center justify-between mb-6 min-w-0">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          <span className="text-gray-800 font-semibold truncate">Web Summary</span>
        </div>
        <div className="flex items-center justify-end flex-1 min-w-0">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-full px-3 py-1 flex items-center gap-1 shadow-sm">
            <span className="text-white text-xs">⚡</span>
            <span className="text-white text-xs font-medium">AI</span>
          </div>
        </div>
      </div>

      {/* Welcome text */}
      <motion.h1
        className="text-2xl font-bold text-gray-800 mb-2 break-words"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Welcome to
      </motion.h1>

      <motion.h2
        className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-6 break-words"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        Web Summary
      </motion.h2>

      {/* Description */}
      <motion.p
        className="text-gray-600 text-sm mb-8 leading-relaxed break-words"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        Conduct comprehensive research with AI for academic sources, credible articles, and expert insights on any topic.
      </motion.p>

      {/* Feature boxes */}
      <motion.div
        className="flex justify-between gap-2 mb-4 min-w-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        {/* Academic Sources */}
        <div className="flex-1 max-w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-red-500 text-lg mb-1">🎓</div>
          <span className="text-gray-800 text-xs font-medium">Academic</span>
        </div>

        {/* Credible Articles */}
        <div className="flex-1 max-w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-red-500 text-lg mb-1">📰</div>
          <span className="text-gray-800 text-xs font-medium">Credible</span>
        </div>

        {/* Expert Insights */}
        <div className="flex-1 max-w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
          <div className="text-red-500 text-lg mb-1">👨‍🎓</div>
          <span className="text-gray-800 text-xs font-medium">Expert</span>
        </div>
      </motion.div>

      {/* Get Started button */}
      <motion.button
        onClick={onGetStarted}
        className="w-full max-w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center gap-2 mb-6"
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
  const [showPlans, setShowPlans] = useState(false);
  const [preselectedOrgId, setPreselectedOrgId] = useState(null); 
  const [showLanding, setShowLanding] = useState(true);
  const [showHome, setShowHome] = useState(false);      // NEW hub screen
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

  // -------- helpers for startup logic --------
  const safeGetUseOwnKey = useCallback(async () => {
    try {
      if (typeof StorageUtils.getUseOwnKey === 'function') {
        const v = await StorageUtils.getUseOwnKey();
        if (typeof v === 'boolean') return v;
      }
    } catch {}
    try {
      const { useOwnKey } = await chrome.storage.sync.get(['useOwnKey']);
      if (typeof useOwnKey === 'boolean') return useOwnKey;
    } catch {}
    try {
      const { prefs } = await chrome.storage.local.get(['prefs']);
      if (prefs && typeof prefs.useOwnKey === 'boolean') return prefs.useOwnKey;
    } catch {}
    return false; // default: not using own key
  }, []);

  const getCustomKeySetupState = useCallback(async () => {
    // Returns { useOwnKey, hasConfig }
    const useOwnKey = await safeGetUseOwnKey();
    if (!useOwnKey) return { useOwnKey, hasConfig: false };
    try {
      const cfg = await StorageUtils.getCurrentConfig();
      const hasApi = !!cfg?.config?.apiKey?.trim?.();
      const hasModel = !!(cfg?.modelId || cfg?.config?.model);
      return { useOwnKey, hasConfig: hasApi && hasModel };
    } catch {
      return { useOwnKey, hasConfig: false };
    }
  }, [safeGetUseOwnKey]);

  useEffect(() => {
    const handleBackgroundMessage = async (message, _sender, sendResponse) => {
      if (message?.type === 'navigateToRoute') {
        await processRouteMessage(message);
        if (sendResponse) sendResponse({ acknowledged: true });
      }
    };

    chrome.runtime.onMessage.addListener(handleBackgroundMessage);
    return () => chrome.runtime.onMessage.removeListener(handleBackgroundMessage);
  }, []);

  useEffect(() => {
    const checkPendingRouteMessage = async () => {
      try {
        const result = await chrome.storage.local.get(['pendingRouteMessage', 'pendingRouteTimestamp']);
        if (result.pendingRouteMessage && result.pendingRouteTimestamp) {
          const messageAge = Date.now() - result.pendingRouteTimestamp;
          if (messageAge < 5000) {
            await processRouteMessage(result.pendingRouteMessage);
            await chrome.storage.local.remove(['pendingRouteMessage', 'pendingRouteTimestamp']);
          } else {
            await chrome.storage.local.remove(['pendingRouteMessage', 'pendingRouteTimestamp']);
          }
        }
      } catch (error) {
        console.error('📱 POPUP: Error checking pending route messages:', error);
      }
    };

    checkPendingRouteMessage();
  }, []);

  const processRouteMessage = async (message) => {
    if (message.setupRequired) {
      setIntendedRoute({
        route: message.originalRoute || message.route,
        feature: message.feature,
        originalMessage: message
      });
      setCurrentRoute('/settings'); // fixed to use '/settings'
      return;
    }
    switch (message.route) {
      case '/home':
        setCurrentRoute('/home');
        break;
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
        try { await chrome.storage.local.set({ hasSeenLanding: true }); } catch {}
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

  useEffect(() => { setIsLoadingSavedAnalysis(false); }, []);
  useEffect(() => { setIsLoadingSavedFactCheck(false); }, []);

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
    console.log('� Save Function: Fact check data storage disabled for fresh API calls');
  }, [factCheckData, currentPageUrl]);

  // ---------- first-open routing ----------
  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        if (currentRoute !== null) return;

        const pendingRoute = await chrome.storage.local.get(['pendingRouteMessage']);
        if (pendingRoute.pendingRouteMessage) return;

        const storage = await chrome.storage.local.get(['hasSeenLanding']);

        if (!storage.hasSeenLanding) {
          setCurrentRoute('/landing');
        } else {
          // NEW: also check auth
          const isAuthed = await StorageUtils.isUserAuthenticated();
          if (!isAuthed) {
            setCurrentRoute('/settings');
            return;
          }

          // Only force Settings if using own key AND not configured
          const { useOwnKey, hasConfig } = await getCustomKeySetupState();
          if (useOwnKey && !hasConfig) {
            setCurrentRoute('/settings');
          } else {
            setCurrentRoute('/home');
          }
        }
      } catch (error) {
        console.error('Error checking first time status:', error);
        setCurrentRoute('/landing');
      }
    };
    checkFirstTime();
  }, [currentRoute, getCustomKeySetupState]);

  useEffect(() => {
    const updateCurrentUrl = async () => {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url) setCurrentPageUrl(tab.url);
      } catch (error) {
        console.error('❌ POPUP: Error getting current URL:', error);
      }
    };

    const checkForRouteMessage = async () => {
      const result = await chrome.storage.local.get(['pendingRouteMessage']);
      if (!result.pendingRouteMessage) await updateCurrentUrl();
    };

    checkForRouteMessage();
  }, []);

  useEffect(() => {
    const checkSetupStatus = async () => {
      setIsCheckingSetup(true);
      try {
        const isAuthed = await StorageUtils.isUserAuthenticated();
        const { useOwnKey, hasConfig } = await getCustomKeySetupState();

        // Setup is "complete" if:
        // - user is authenticated AND
        // - (not using own key OR using own key with config)
        const completed = isAuthed && (!useOwnKey || hasConfig);
        setSetupCompleted(completed);

        if (isAuthed && useOwnKey && hasConfig) {
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
  }, [getCustomKeySetupState]);

  const initializeAIService = async () => {
    try {
      const { useOwnKey, hasConfig } = await getCustomKeySetupState();
      if (!useOwnKey || !hasConfig) {
        console.log('🤖 AI service init skipped (not using own key or config missing).');
        return;
      }
      const config = await StorageUtils.getCurrentConfig();
      if (config) {
        console.log('🤖 Initializing AI service with model:', config.modelId);
        await aiService.updateConfiguration(config);
      } else {
        console.log('🤖 No saved configuration found');
      }
    } catch (error) {
      console.error('❌ Error initializing AI service:', error);
    }
  };

  const handleSendMessage = useCallback(async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
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
      if (isUserCancelled) return;
      if (result.success) {
        setResearchResults(result);
        setApiKeyError(null);
      } else if (result.message === 'Research was cancelled') {
        setResearchResults(null);
      } else {
        const isApiKeyError = result.message && (
          result.message.includes('Unauthorized') ||
          result.message.includes('401') ||
          result.message.includes('403') ||
          result.message.includes('invalid') ||
          result.message.includes('Invalid API key') ||
          result.message.includes('API key')
        );
        if (isApiKeyError) {
          setApiKeyError({ message: result.message, details: result.details, timestamp: Date.now() });
        }
        setResearchResults({ error: true, message: result.message || 'Failed to complete research', details: result.details });
      }
    } catch (error) {
      if (isUserCancelled) return;
      const isApiKeyError = error.message && (
        error.message.includes('Unauthorized') ||
        error.message.includes('401') ||
        error.message.includes('403') ||
        error.message.includes('invalid') ||
        error.message.includes('Invalid API key') ||
        error.message.includes('API key') ||
        error.message.includes('not configured')
      );
      if (isApiKeyError) setApiKeyError({ message: error.message, timestamp: Date.now() });
      setResearchResults({ error: true, message: 'Failed to complete research', details: error.message });
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

  const handleDepthChange = useCallback((e) => setResearchDepth(e.target.value), []);

  const handleStopResearch = useCallback(() => {
    if (abortController) {
      setIsUserCancelled(true);
      abortController.abort();
      setIsResearchLoading(false);
      setAbortController(null);
      setResearchResults(null);
      setCurrentResearchTopic('');
    }
  }, [abortController, isUserCancelled]);

  const handleLandingButtonClick = useCallback(async () => {
    try { await chrome.storage.local.set({ hasSeenLanding: true }); } catch {}
    setCurrentRoute('/settings');
  }, []);

  const handleApiKeyErrorDismiss = () => setApiKeyError(null);

  const navigateToSettings = () => {
    setShowSettings(true);
    setShowResearch(false);
    setShowAnalysis(false);
    setShowFactChecker(false);
    setApiKeyError(null);
  };

  const handleSettingsComplete = useCallback(async () => {
    await initializeAIService();
    setSetupCompleted(true);
    setApiKeyError(null);
    try { await chrome.storage.local.set({ hasSeenLanding: true }); } catch {}

    if (intendedRoute) {
      const target = intendedRoute.route;
      setIntendedRoute(null);
      switch (target) {
        case '/research': setCurrentRoute('/research'); break;
        case '/analysis': handleAnalysePage(); break;
        case '/fact-checker': handleFactChecker(); break;
        default: setCurrentRoute('/home');
      }
    } else {
      setCurrentRoute('/home');
    }
  }, [intendedRoute, handleAnalysePage, handleFactChecker]);

  const handleAnalysePage = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      setCurrentPageUrl(tab?.url || '');
      setCurrentRoute('/analysis');
    } catch (error) {
      console.error('Analysis: could not get active tab URL', error);
      setCurrentPageUrl('');
      setCurrentRoute('/analysis');
    }
  }, []);

  const handleBackFromAnalysis = useCallback(() => {
    setCurrentRoute('/home');
    setAnalysisData(null);
  }, []);

  const handleRetryAnalysis = useCallback(() => {
    setAnalysisData(null);
    setIsAnalysisLoading(false);
    handleAnalysePage();
  }, [handleAnalysePage]);

  const handleFactChecker = useCallback(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      setCurrentPageUrl(tab?.url || '');
      setCurrentRoute('/fact-checker');
    } catch (error) {
      console.error('FactChecker: could not get active tab URL', error);
      setCurrentPageUrl('');
      setCurrentRoute('/fact-checker');
    }
  }, []);

  const handleBackFromFactChecker = useCallback(() => {
    setCurrentRoute('/home');
    setFactCheckData(null);
  }, []);

  const handleBackFromResearch = useCallback(() => {
    setCurrentRoute('/home');
  }, []);

  const handleRetryFactCheck = useCallback(() => {
    setFactCheckData(null);
    setIsFactCheckerLoading(false);
    handleFactChecker();
  }, [handleFactChecker]);

  const handleAskQuestion = useCallback(async (question, pageUrl) => {
    try {
      const questionPrompt = `Based on the webpage at ${pageUrl}, please answer the following question:

Question: ${question}

Please provide a detailed and helpful answer based on the content and context of the webpage. If the question cannot be answered from the page content, please explain what information would be needed.`;

      const response = await chrome.runtime.sendMessage({ type: 'chatMessage', message: questionPrompt });

      if (response && response.success) {
        return { success: true, answer: response.reply };
      } else {
        return { success: false, answer: response?.reply || 'Sorry, I couldn\'t process your question at this time.' };
      }
    } catch (error) {
      console.error('🤔 POPUP: Error asking question:', error);
      return { success: false, answer: 'An error occurred while processing your question.' };
    }
  }, []);

  const handleClearHistory = useCallback(async () => {
    try {
      await chrome.storage.local.remove(['savedResearchResults', 'savedResearchTopic']);
      setResearchResults(null);
      setCurrentResearchTopic('');
    } catch (error) {
      console.error('Error clearing research history:', error);
    }
  }, []);

  const handleClearAnalysisHistory = useCallback(async () => {
    try { setAnalysisData(null); } catch (error) { console.error('Error clearing analysis history:', error); }
  }, []);

  const handleClearFactCheckHistory = useCallback(async () => {
    try { setFactCheckData(null); } catch (error) { console.error('Error clearing fact check history:', error); }
  }, []);

  const handleClearAllHistory = useCallback(async () => {
    try {
      await chrome.storage.local.remove(['savedResearchResults', 'savedResearchTopic']);
      setResearchResults(null);
      setCurrentResearchTopic('');
      setAnalysisData(null);
      setFactCheckData(null);
    } catch (error) {
      console.error('Error clearing all history:', error);
    }
  }, []);

  // Settings handlers
  const handleSettingsClick = useCallback(async () => {
    try { await chrome.storage.local.set({ hasSeenLanding: true }); } catch {}
    setCurrentRoute('/settings');
  }, []);

  const handleBackFromSettings = useCallback(() => {
    if (intendedRoute) {
      setCurrentRoute(intendedRoute.route);
    } else {
      setCurrentRoute('/home');
    }
  }, [intendedRoute]);

  const openPlans = useCallback((orgId) => {
    setPreselectedOrgId(orgId ?? null);
    setCurrentRoute('/plans');
  }, []);

  useEffect(() => {
    switch (currentRoute) {
      case '/home':
        setShowLanding(false); setShowPlans(false); setShowAnalysis(false); setShowFactChecker(false); setShowSettings(false); setShowResearch(false); setShowHome(true);
        break;
      case '/plans':
        setShowLanding(false); setShowHome(false); setShowResearch(false); setShowAnalysis(false); setShowFactChecker(false); setShowSettings(false); setShowPlans(true);
        break;
      case '/research':
        setShowLanding(false); setShowPlans(false); setShowHome(false); setShowAnalysis(false); setShowFactChecker(false); setShowSettings(false); setShowResearch(true);
        break;
      case '/analysis':
        setShowLanding(false); setShowPlans(false); setShowHome(false); setShowResearch(false); setShowFactChecker(false); setShowSettings(false); setShowAnalysis(true);
        handleAnalysePage();
        break;
      case '/fact-checker':
        setShowLanding(false); setShowPlans(false); setShowHome(false); setShowResearch(false); setShowAnalysis(false); setShowSettings(false); setShowFactChecker(true);
        handleFactChecker();
        break;
      case '/settings':
        setShowLanding(false); setShowPlans(false); setShowHome(false); setShowResearch(false); setShowAnalysis(false); setShowFactChecker(false); setShowSettings(true);
        break;
      case '/landing':
        setShowResearch(false); setShowPlans(false); setShowHome(false); setShowAnalysis(false); setShowFactChecker(false); setShowSettings(false); setShowLanding(true);
        break;
      case null:
        return;
      default:
        setShowResearch(false); setShowPlans(false); setShowHome(false); setShowAnalysis(false); setShowFactChecker(false); setShowSettings(false); setShowLanding(true);
        break;
    }
  }, [currentRoute, handleAnalysePage, handleFactChecker]);

  return (
    <div className="relative w-full h-full overflow-hidden min-w-0">
      <AnimatePresence mode="wait">
        {showLanding ? (
          <LandingPage key="landing" onGetStarted={handleLandingButtonClick} />
        ) : showHome ? (
        <HomeHub
          key="home"
          onOpenSettings={handleSettingsClick}
          onOpenResearch={() => {
            setShowHome(false);
            setShowResearch(true);
            setCurrentRoute('/research');
          }}
          onOpenAnalysis={handleAnalysePage}
          onOpenFactChecker={handleFactChecker}
          onOpenPlans={openPlans}
        />
      ) : showPlans ? (
        <Plans
          key="plans"
          preselectedOrgId={preselectedOrgId}
          defaultCurrency="inr"
          onBack={() => setCurrentRoute('/home')}
        />
      ) : showAnalysis ? (
          <Analysis
            key="analysis"
            analysisData={analysisData}
            currentPageUrl={currentPageUrl}
            isLoading={isAnalysisLoading}
            isLoadingSavedAnalysis={isLoadingSavedAnalysis}
            onBack={handleBackFromAnalysis}
            onRetry={handleRetryAnalysis}
            onAskQuestion={handleAskQuestion}
            onClearHistory={handleClearAnalysisHistory}
            onOpenSettings={handleSettingsClick}
            onOpenPlans={openPlans}
          />
        ) : showFactChecker ? (
          <FactCheck
            key="factchecker"
            factCheckData={factCheckData}
            currentPageUrl={currentPageUrl}
            isLoading={isFactCheckerLoading}
            isLoadingSavedFactCheck={isLoadingSavedFactCheck}
            onBack={handleBackFromFactChecker}
            onRetry={handleRetryFactCheck}
            onClearHistory={handleClearFactCheckHistory}
            onOpenSettings={handleSettingsClick}
            onOpenPlans={openPlans}
          />
        ) : showSettings ? (
          <Settings key="settings" onBack={handleBackFromSettings} onSetupComplete={handleSettingsComplete} onOpenPlans={openPlans} />
        ) : showResearch ? (
          <div className="relative w-full h-full overflow-hidden min-w-0">
            <Research
              key="research"
              onBack={handleBackFromResearch}
              researchResults={researchResults}
              isLoading={isResearchLoading}
              isLoadingSavedResearch={isLoadingSavedResearch}
              inputMessage={inputMessage}
              currentResearchTopic={currentResearchTopic}
              researchDepth={researchDepth}
              onInputChange={setInputMessage}
              onDepthChange={handleDepthChange}
              onKeyDown={handleKeyDown}
              onSendMessage={handleSendMessage}
              onStopResearch={handleStopResearch}
              onAnalysePage={handleAnalysePage}
              onFactChecker={handleFactChecker}
              onOpenSettings={handleSettingsClick}
              inputRef={inputRef}
              onOpenPlans={openPlans}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-white" />
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
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white">API Key Error</h3>
                    <p className="text-sm text-red-100 mt-1 break-words">{apiKeyError.message}</p>
                    <div className="flex items-center gap-3 mt-3">
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