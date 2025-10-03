import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Research from '@/pages/popup/views/Research';
import Plans from '@/pages/popup/views/Plans';
import Analysis from '@/pages/popup/views/Analysis';
import FactCheck from '@/pages/popup/views/FactCheck';
import Settings from '@/pages/popup/views/Settings';
import ProfilePage from '@/pages/popup/views/ProfilePage';
import ChatInterface from '@/pages/popup/views/ChatInterface';
import LoginPage from '@/pages/popup/views/LoginPage';
import LoaderScreen from '@/pages/popup/components/LoaderScreen';
import aiService from '@/services/ai';
import StorageUtils from '@/storage';
import auth from '@/services/auth'; // ✅ NEW: server-verified auth gate


const Popup = () => {
  // New flow states
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Legacy states (kept for compatibility)
  const [showPlans, setShowPlans] = useState(false);
  const [preselectedOrgId, setPreselectedOrgId] = useState(null); 
  const [showResearch, setShowResearch] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFactChecker, setShowFactChecker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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
  const [messages, setMessages] = useState([]);
  const [authUser, setAuthUser] = useState(null);

  // Removed currentRoute state - using direct state management instead

  const inputRef = useRef(null);

  // ✅ Central gate: verify with backend; if not authed, route to Settings and block
  const ensureAuthedOrRedirect = useCallback(async (target = '/home') => {
    try {
      const { isAuthenticated } = await auth.checkAuthentication();
      if (isAuthenticated) return true;
    } catch {}
    try { await StorageUtils.clearAuthSession?.(); } catch {}
    setIntendedRoute({ route: target, feature: target?.replace('/', '') });
    setShowSettings(true);
    setShowChat(false);
    setShowLogin(false);
    return false;
  }, []);

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
    
    switch (message.route) {
      case '/home':
        if (await ensureAuthedOrRedirect('/home')) {
          setShowChat(true);
          setShowLogin(false);
          setShowSettings(false);
        }
        break;
      case '/research':
        if (await ensureAuthedOrRedirect('/research')) {
          setShowResearch(true);
          setShowChat(false);
          setShowLogin(false);
          setShowSettings(false);
        }
        break;
      case '/analysis':
        handleAnalysePage();
        break;
      case '/fact-checker':
        handleFactChecker();
        break;
      case '/settings':
        setShowSettings(true);
        setShowChat(false);
        setShowLogin(false);
        break;
      default:
        setShowLogin(true);
        setShowChat(false);
        setShowSettings(false);
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

  // ---------- Authentication and Initialization ----------
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsLoading(true);
        
        // Check authentication status directly
        const authResult = await auth.checkAuthentication();
        const isAuth = authResult.isAuthenticated;
        
        setIsAuthenticated(isAuth);
        
        if (isAuth) {
          // Get user data
          const userData = await auth.getUser();
          setAuthUser(userData);
          
          // User is authenticated, show chat interface
          setShowChat(true);
          setShowLogin(false);
        } else {
          // User not authenticated, show login
          setShowLogin(true);
          setShowChat(false);
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        // On error, show login page
        setShowLogin(true);
        setShowChat(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle successful login
  const handleLoginSuccess = useCallback(async () => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setShowChat(true);
    
    // Get user data after successful login
    try {
      const userData = await auth.getUser();
      setAuthUser(userData);
    } catch (error) {
      console.error('Error getting user data after login:', error);
    }
  }, []);

  // Handle settings navigation from chat
  const handleSettingsFromChat = useCallback(() => {
    setShowChat(false);
    setShowSettings(true);
  }, []);

  // ---------- first-open routing ----------
  // Removed checkFirstTime logic as it conflicts with the main initialization
  // The main useEffect handles authentication and routing properly

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
        // ✅ Server truth for auth status
        const { isAuthenticated: isAuthed } = await auth.checkAuthentication();
        const { useOwnKey, hasConfig } = await getCustomKeySetupState();

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


  const handleApiKeyErrorDismiss = () => setApiKeyError(null);


  const navigateToChat = () => {
    setShowSettings(false);
    setShowProfile(false);
    setShowResearch(false);
    setShowAnalysis(false);
    setShowFactChecker(false);
    setShowChat(true);
    setApiKeyError(null);
  };

  const navigateToProfile = () => {
    setShowSettings(false);
    setShowResearch(false);
    setShowAnalysis(false);
    setShowFactChecker(false);
    setShowChat(false);
    setShowProfile(true);
    setApiKeyError(null);
  };

  const navigateToSettings = () => {
    // Reset all states first
    setShowProfile(false);
    setShowResearch(false);
    setShowAnalysis(false);
    setShowFactChecker(false);
    setShowChat(false);
    setApiKeyError(null);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setShowSettings(true);
    }, 0);
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
        case '/research': 
          setShowResearch(true);
          setShowChat(false);
          setShowLogin(false);
          setShowSettings(false);
          break;
        case '/analysis': handleAnalysePage(); break;
        case '/fact-checker': handleFactChecker(); break;
        default: 
          setShowChat(true);
          setShowLogin(false);
          setShowSettings(false);
      }
    } else {
      setShowChat(true);
      setShowLogin(false);
      setShowSettings(false);
    }
  }, [intendedRoute, handleAnalysePage, handleFactChecker]);

  // ✅ Gate inside feature navigations too (in case cookies died mid-session)
  const handleAnalysePage = useCallback(async () => {
    const ok = await ensureAuthedOrRedirect('/analysis');
    if (!ok) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      setCurrentPageUrl(tab?.url || '');
      setShowAnalysis(true);
      setShowChat(false);
      setShowLogin(false);
      setShowSettings(false);
    } catch (error) {
      console.error('Analysis: could not get active tab URL', error);
      setCurrentPageUrl('');
      setShowAnalysis(true);
      setShowChat(false);
      setShowLogin(false);
      setShowSettings(false);
    }
  }, [ensureAuthedOrRedirect]);

  const handleBackFromAnalysis = useCallback(() => {
    setShowChat(true);
    setShowAnalysis(false);
    setShowLogin(false);
    setShowSettings(false);
    setAnalysisData(null);
  }, []);

  const handleRetryAnalysis = useCallback(() => {
    setAnalysisData(null);
    setIsAnalysisLoading(false);
    handleAnalysePage();
  }, [handleAnalysePage]);

  const handleFactChecker = useCallback(async () => {
    const ok = await ensureAuthedOrRedirect('/fact-checker');
    if (!ok) return;
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      setCurrentPageUrl(tab?.url || '');
      setShowFactChecker(true);
      setShowChat(false);
      setShowLogin(false);
      setShowSettings(false);
    } catch (error) {
      console.error('FactChecker: could not get active tab URL', error);
      setCurrentPageUrl('');
      setShowFactChecker(true);
      setShowChat(false);
      setShowLogin(false);
      setShowSettings(false);
    }
  }, [ensureAuthedOrRedirect]);

  const handleBackFromFactChecker = useCallback(() => {
    setShowChat(true);
    setShowFactChecker(false);
    setShowLogin(false);
    setShowSettings(false);
    setFactCheckData(null);
  }, []);

  const handleBackFromResearch = useCallback(() => {
    setShowChat(true);
    setShowResearch(false);
    setShowLogin(false);
    setShowSettings(false);
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
    setShowSettings(true);
    setShowChat(false);
    setShowLogin(false);
  }, []);

  const handleBackFromSettings = useCallback(() => {
    // Reset all states first
    setShowSettings(false);
    setShowResearch(false);
    setShowAnalysis(false);
    setShowFactChecker(false);
    setApiKeyError(null);
    
    // Use setTimeout to ensure state updates are processed
    setTimeout(() => {
      setShowChat(true);
    }, 0);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      setShowLogin(true);
      setShowChat(false);
      setShowProfile(false);
      setShowSettings(false);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const openPlans = useCallback((orgId) => {
    setPreselectedOrgId(orgId ?? null);
    setShowPlans(true);
    setShowChat(false);
    setShowLogin(false);
    setShowSettings(false);
  }, []);

  // ✅ Wrapper so HomeHub buttons are also gated
  const handleOpenResearch = useCallback(async () => {
    const ok = await ensureAuthedOrRedirect('/research');
    if (!ok) return;
    setShowResearch(true);
    setShowChat(false);
    setShowLogin(false);
    setShowSettings(false);
  }, [ensureAuthedOrRedirect]);

  // Removed currentRoute effect as we now use direct state management
  // This prevents automatic navigation conflicts

  return (
    <div className="relative w-full h-full overflow-hidden min-w-0">
      {/* Loader Screen */}
      {isLoading && (
        <LoaderScreen message="Checking authentication..." />
      )}
      
      <AnimatePresence mode="wait">
        {!isLoading && showLogin ? (
          <LoginPage key="login" onLoginSuccess={handleLoginSuccess} />
        ) : showPlans ? (
        <Plans
          key="plans"
          preselectedOrgId={preselectedOrgId}
          defaultCurrency="inr"
          onBack={() => {
            setShowPlans(false);
            setShowChat(true);
            setShowLogin(false);
            setShowSettings(false);
          }}
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
        ) : showProfile ? (
          <ProfilePage 
            key="profile" 
            onBack={() => {
              setShowProfile(false);
              setShowChat(true);
            }}
            onOpenSettings={navigateToSettings}
            onOpenPlans={openPlans}
            onLogout={handleLogout}
          />
              ) : showChat ? (
                <ChatInterface
                  key="chat"
                  onOpenProfile={navigateToProfile}
                  onOpenPlans={openPlans}
                  currentPageUrl={currentPageUrl}
                  onBack={() => {
                    setShowChat(false);
                    setShowLogin(true);
                  }}
                  onNewChat={() => {
                    setMessages([]);
                    setShowChat(true);
                  }}
                  userProfilePicUrl={authUser?.avatarUrl || authUser?.avatar_url}
                />
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
                        className="bg-white/20 hover:bg白/30 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors duration-200"
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