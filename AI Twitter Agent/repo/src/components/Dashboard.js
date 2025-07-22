import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Square,
  Send,
  Activity,
  Clock,
  Hash,
  CheckCircle,
  AlertCircle,
  Bot,
  TrendingUp,
  Users,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { cn } from '../utils/cn';
import './Dashboard.css';

function Dashboard({
  agentStatus,
  loading,
  onStartAgent,
  onStopAgent,
  postTweet,
  config
}) {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState('');

  const handleStartAgent = async () => {
    if (!config) {
      setMessage('Please configure your settings first');
      return;
    }
    
    console.log('Dashboard: Config for start agent:', config);
    
    // Validate config structure
    const hasValidConfig = config.ai?.model && 
                          config.ai?.apiKeys?.[config.ai.model] &&
                          config.twitter?.username && 
                          config.twitter?.password &&
                          config.topics && 
                          config.topics.length > 0;
    
    console.log('Dashboard: Config validation:', {
      hasAiModel: !!config.ai?.model,
      hasApiKey: !!config.ai?.apiKeys?.[config.ai.model],
      hasTwitterUsername: !!config.twitter?.username,
      hasTwitterPassword: !!config.twitter?.password,
      hasTopics: !!(config.topics && config.topics.length > 0),
      topicsCount: config.topics?.length || 0,
      hasValidConfig
    });
    
    if (!hasValidConfig) {
      setMessage('Please complete your configuration in Settings (AI model, API key, Twitter credentials, and topics)');
      return;
    }
    
    setIsStarting(true);
    setMessage('');
    
    try {
      const result = await onStartAgent();
      if (result.success) {
        setMessage('Agent started successfully!');
      } else {
        setMessage(`Failed to start agent: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error starting agent: ${error.message}`);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopAgent = async () => {
    setIsStopping(true);
    setMessage('');
    
    try {
      const result = await onStopAgent();
      if (result.success) {
        setMessage('Agent stopped successfully!');
      } else {
        setMessage(`Failed to stop agent: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error stopping agent: ${error.message}`);
    } finally {
      setIsStopping(false);
    }
  };

  const handlePostTweet = async () => {
    if (!config) {
      setMessage('Please configure your settings first');
      return;
    }
    
    console.log('Dashboard: Config for post tweet:', config);
    
    // Validate config structure
    const hasValidConfig = config.ai?.model && 
                          config.ai?.apiKeys?.[config.ai.model] &&
                          config.twitter?.username && 
                          config.twitter?.password &&
                          config.topics && 
                          config.topics.length > 0;
    
    console.log('Dashboard: Post tweet config validation:', {
      hasAiModel: !!config.ai?.model,
      hasApiKey: !!config.ai?.apiKeys?.[config.ai.model],
      hasTwitterUsername: !!config.twitter?.username,
      hasTwitterPassword: !!config.twitter?.password,
      hasTopics: !!(config.topics && config.topics.length > 0),
      topicsCount: config.topics?.length || 0,
      hasValidConfig
    });
    
    if (!hasValidConfig) {
      setMessage('Please complete your configuration in Settings (AI model, API key, Twitter credentials, and topics)');
      return;
    }
    
    setIsPosting(true);
    setMessage('');
    
    try {
      const result = await postTweet();
      if (result.success) {
        setMessage('Tweet generated and posted successfully!');
      } else {
        setMessage(`Failed to post tweet: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error posting tweet: ${error.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="welcome-header"
        >
          <div className="welcome-content">
            <div className="welcome-icon">
              <Sparkles className="sparkle-icon" />
            </div>
            <div className="welcome-text">
              <h1>Welcome to AI Twitter Agent</h1>
              <p>Your intelligent social media companion</p>
            </div>
          </div>
        </motion.div>

        {/* Agent Status Card */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="status-card glass-effect"
        >
          <div className="status-content">
            <div className="status-info">
              <div className="status-details">
                <h3>Agent Status</h3>
              </div>
            </div>
            <div className="status-indicator">
              <motion.div
                animate={{
                  scale: agentStatus?.isRunning ? [1, 1.1, 1] : 1
                }}
                transition={{
                  duration: 2,
                  repeat: agentStatus?.isRunning ? Infinity : 0
                }}
                className={cn(
                  "status-dot",
                  agentStatus?.isRunning ? "online" : "offline"
                )}
              />
              <span className="status-text">
                {agentStatus?.isRunning ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </motion.div> */}

        {/* Start/Stop Agent Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="agent-controls"
        >
          <motion.button
            className="agent-btn start-btn"
            onClick={handleStartAgent}
            disabled={agentStatus?.isRunning || isStarting || isStopping}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isStarting ? (
              <>
                <div className="spinner" />
                Starting...
              </>
            ) : (
              <>
                <Play className="btn-icon" />
                Start Agent
              </>
            )}
          </motion.button>
          
          <motion.button
            className="agent-btn stop-btn"
            onClick={handleStopAgent}
            disabled={!agentStatus?.isRunning || isStarting || isStopping}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isStopping ? (
              <>
                <div className="spinner" />
                Stopping...
              </>
            ) : (
              <>
                <Square className="btn-icon" />
                Stop Agent
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Generate & Post Tweet Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="tweet-section"
        >
          <motion.button
            className="tweet-btn glass-effect"
            onClick={handlePostTweet}
            disabled={isPosting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isPosting ? (
              <>
                <div className="spinner" />
                <div className="tweet-content">
                  <span className="tweet-title">Generating Tweet...</span>
                  <span className="tweet-subtitle">Creating viral-worthy content</span>
                </div>
              </>
            ) : (
              <>
                <Send className="tweet-icon" />
                <div className="tweet-content">
                  <span className="tweet-title">Generate & Post Tweet</span>
                  <span className="tweet-subtitle">Create viral-worthy content</span>
                </div>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Message Display */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={cn(
                "message",
                message.includes('successfully') ? "success" : "error"
              )}
            >
              <div className="message-content">
                {message.includes('successfully') ? (
                  <CheckCircle className="message-icon" />
                ) : (
                  <AlertCircle className="message-icon" />
                )}
                <span>{message}</span>
              </div>
              <button 
                onClick={() => setMessage('')}
                className="message-close"
              >
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Dashboard;