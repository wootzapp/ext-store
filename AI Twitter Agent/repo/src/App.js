import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Settings as SettingsIcon, 
  BarChart3, 
  Sparkles,
  Twitter,
  Zap,
  ArrowLeft
} from 'lucide-react';
import useAgent from './hooks/useAgent';
import useConfig from './hooks/useConfig';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import Onboarding from './components/Onboarding';
import { cn } from './utils/cn';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { status: agentStatus, startAgent, stopAgent, postTweet } = useAgent();
  const { loadConfig, saveConfig, updateConfig } = useConfig();

  // Debug logging for config and agent status
  useEffect(() => {
    console.log('App: Current config:', config);
    console.log('App: Current agent status:', agentStatus);
  }, [config, agentStatus]);

  useEffect(() => {
    const checkFirstTime = async () => {
      try {
        setLoading(true);
        const { config: savedConfig, onboardingCompleted } = await loadConfig();
        
        // Check for both old flat structure and new nested structure
        const hasValidConfig = savedConfig && (
          // Old flat structure
          (savedConfig.apiKey && savedConfig.model) ||
          // New nested structure
          (savedConfig.ai?.model && savedConfig.ai?.apiKeys?.[savedConfig.ai.model])
        );
        
        if (!onboardingCompleted || !hasValidConfig) {
          setShowOnboarding(true);
        } else {
          setConfig(savedConfig);
        }
      } catch (err) {
        console.error('Error loading config:', err);
        setError('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    checkFirstTime();
  }, []);

  const handleOnboardingComplete = async () => {
    try {
      const { config: savedConfig } = await loadConfig();
      setConfig(savedConfig);
      setShowOnboarding(false);
    } catch (err) {
      console.error('Error after onboarding:', err);
      setError('Failed to complete onboarding');
    }
  };

  const handleConfigUpdate = async (newConfig) => {
    try {
      await saveConfig(newConfig);
      setConfig(newConfig);
    } catch (err) {
      console.error('Error updating config:', err);
      setError('Failed to update configuration');
    }
  };

  const handleBackToDashboard = () => {
    setActiveTab('dashboard');
  };

  if (loading) {
    return (
      <div className="app-loading">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="loading-container"
        >
          <div className="loading-icon">
            <Sparkles className="sparkles-icon" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="loading-title gradient-text"
          >
            AI Twitter Agent
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="spinner"
          />
        </motion.div>
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="app-container"
      >
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="app-header glass-effect"
        >
          <div className="header-content">
            <div className="header-brand">
              <div className="brand-icon">
                <Twitter className="twitter-icon" />
                <Zap className="zap-icon" />
              </div>
              <h1 className="gradient-text">AI Twitter Agent</h1>
            </div>
            <div className="header-actions">
              <div className="header-status">
                <motion.div
                  animate={{ 
                    scale: agentStatus.isRunning ? [1, 1.1, 1] : 1 
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: agentStatus.isRunning ? Infinity : 0 
                  }}
                  className={cn(
                    "status-indicator",
                    agentStatus.isRunning ? "running" : "stopped"
                  )}
                />
                <span className="status-text">
                  {agentStatus.isRunning ? 'Active' : 'Inactive'}
                </span>
              </div>
              {activeTab === 'dashboard' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('settings')}
                  className="header-settings-btn"
                >
                  <SettingsIcon className="settings-icon" />
                </motion.button>
              )}
              {activeTab === 'settings' && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToDashboard}
                  className="header-back-btn"
                >
                  <ArrowLeft className="back-icon" />
                  <span>Back</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="app-main"
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="global-error"
              >
                <h3>Error</h3>
                <p>{error}</p>
                <button onClick={() => setError(null)}>Dismiss</button>
              </motion.div>
            )}

            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Dashboard
                  agentStatus={agentStatus}
                  loading={loading}
                  onStartAgent={startAgent}
                  onStopAgent={stopAgent}
                  postTweet={postTweet}
                  config={config}
                />
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Settings onConfigUpdate={handleConfigUpdate} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </motion.div>
    </div>
  );
}

export default App;