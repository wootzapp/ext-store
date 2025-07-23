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
  Lightbulb,
  Twitter,
  Instagram
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
  const [activeTab, setActiveTab] = useState('twitter'); // 'twitter' or 'instagram'

  const handleStartAgent = async () => {
    if (!config) {
      setMessage('Please configure your settings first');
      return;
    }
    
    console.log('Dashboard: Config for start agent:', config);
    
    // Validate config structure based on active tab
    let hasValidConfig = false;
    
    if (activeTab === 'twitter') {
      hasValidConfig = config.ai?.model && 
                      config.ai?.apiKeys?.[config.ai.model] &&
                      config.twitter?.username && 
                      config.twitter?.password &&
                      config.twitter?.topics && 
                      config.twitter?.topics.length > 0;
    } else if (activeTab === 'instagram') {
      hasValidConfig = config.ai?.model && 
                      config.ai?.apiKeys?.[config.ai.model] &&
                      config.instagram?.username && 
                      config.instagram?.password &&
                      config.instagram?.topics && 
                      config.instagram?.topics.length > 0;
    }
    
    console.log('Dashboard: Config validation:', {
      activeTab,
      hasAiModel: !!config.ai?.model,
      hasApiKey: !!config.ai?.apiKeys?.[config.ai.model],
      hasUsername: activeTab === 'twitter' ? !!config.twitter?.username : !!config.instagram?.username,
      hasPassword: activeTab === 'twitter' ? !!config.twitter?.password : !!config.instagram?.password,
      hasTopics: activeTab === 'twitter' ? 
        !!(config.twitter?.topics && config.twitter?.topics.length > 0) :
        !!(config.instagram?.topics && config.instagram?.topics.length > 0),
      hasValidConfig
    });
    
    if (!hasValidConfig) {
      const platform = activeTab === 'twitter' ? 'Twitter' : 'Instagram';
      setMessage(`Please complete your ${platform} configuration in Settings (AI model, API key, ${platform} credentials, and topics)`);
      return;
    }
    
    setIsStarting(true);
    setMessage('');
    
    try {
      // Pass the active platform to the start agent function
      const result = await onStartAgent(activeTab);
      if (result.success) {
        setMessage(`${activeTab === 'twitter' ? 'Twitter' : 'Instagram'} agent started successfully!`);
      } else {
        setMessage(`Failed to start ${activeTab} agent: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error starting ${activeTab} agent: ${error.message}`);
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
        setMessage(`${activeTab === 'twitter' ? 'Twitter' : 'Instagram'} agent stopped successfully!`);
      } else {
        setMessage(`Failed to stop ${activeTab} agent: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error stopping ${activeTab} agent: ${error.message}`);
    } finally {
      setIsStopping(false);
    }
  };

  const handlePostContent = async () => {
    if (!config) {
      setMessage('Please configure your settings first');
      return;
    }
    
    console.log('Dashboard: Config for post content:', config);
    
    // Validate config structure based on active tab
    let hasValidConfig = false;
    
    if (activeTab === 'twitter') {
      hasValidConfig = config.ai?.model && 
                      config.ai?.apiKeys?.[config.ai.model] &&
                      config.twitter?.username && 
                      config.twitter?.password &&
                      config.twitter?.topics && 
                      config.twitter?.topics.length > 0;
    } else if (activeTab === 'instagram') {
      hasValidConfig = config.ai?.model && 
                      config.ai?.apiKeys?.[config.ai.model] &&
                      config.instagram?.username && 
                      config.instagram?.password &&
                      config.instagram?.topics && 
                      config.instagram?.topics.length > 0;
    }
    
    console.log('Dashboard: Post content config validation:', {
      activeTab,
      hasAiModel: !!config.ai?.model,
      hasApiKey: !!config.ai?.apiKeys?.[config.ai.model],
      hasUsername: activeTab === 'twitter' ? !!config.twitter?.username : !!config.instagram?.username,
      hasPassword: activeTab === 'twitter' ? !!config.twitter?.password : !!config.instagram?.password,
      hasTopics: activeTab === 'twitter' ? 
        !!(config.twitter?.topics && config.twitter?.topics.length > 0) :
        !!(config.instagram?.topics && config.instagram?.topics.length > 0),
      hasValidConfig
    });
    
    if (!hasValidConfig) {
      const platform = activeTab === 'twitter' ? 'Twitter' : 'Instagram';
      setMessage(`Please complete your ${platform} configuration in Settings (AI model, API key, ${platform} credentials, and topics)`);
      return;
    }
    
    setIsPosting(true);
    setMessage('');
    
    try {
      const result = await postTweet();
      if (result.success) {
        const contentType = activeTab === 'twitter' ? 'Tweet' : 'Post';
        setMessage(`${contentType} generated and posted successfully!`);
      } else {
        setMessage(`Failed to post ${activeTab} content: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error posting ${activeTab} content: ${error.message}`);
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
              <h1>Welcome to AI Social Media Agent</h1>
              <p>Your intelligent social media companion</p>
            </div>
          </div>
        </motion.div>

        {/* Platform Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="platform-tabs"
        >
          <motion.button
            className={cn("platform-tab", activeTab === 'twitter' && "active")}
            onClick={() => setActiveTab('twitter')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Twitter className="tab-icon" />
            <span>Twitter</span>
          </motion.button>
          
          <motion.button
            className={cn("platform-tab", activeTab === 'instagram' && "active")}
            onClick={() => setActiveTab('instagram')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Instagram className="tab-icon" />
            <span>Instagram</span>
          </motion.button>
        </motion.div>

        {/* Platform Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'twitter' && (
            <motion.div
              key="twitter"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="platform-content"
            >
              {/* Twitter Agent Controls */}
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
                      Start Twitter Agent
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
                      Stop Twitter Agent
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Generate & Post Tweet Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="content-section"
              >
                <motion.button
                  className="content-btn glass-effect"
                  onClick={handlePostContent}
                  disabled={isPosting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPosting ? (
                    <>
                      <div className="spinner" />
                      <div className="content-content">
                        <span className="content-title">Generating Tweet...</span>
                        <span className="content-subtitle">Creating viral-worthy content</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Send className="content-icon" />
                      <div className="content-content">
                        <span className="content-title">Generate & Post Tweet</span>
                        <span className="content-subtitle">Create viral-worthy content</span>
                      </div>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'instagram' && (
            <motion.div
              key="instagram"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="platform-content"
            >
              {/* Instagram Agent Controls */}
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
                      Start Instagram Agent
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
                      Stop Instagram Agent
                    </>
                  )}
                </motion.button>
              </motion.div>

              {/* Generate & Post Instagram Content Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="content-section"
              >
                <motion.button
                  className="content-btn glass-effect"
                  onClick={handlePostContent}
                  disabled={isPosting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isPosting ? (
                    <>
                      <div className="spinner" />
                      <div className="content-content">
                        <span className="content-title">Generating Post...</span>
                        <span className="content-subtitle">Creating engaging content</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Send className="content-icon" />
                      <div className="content-content">
                        <span className="content-title">Generate & Post Content</span>
                        <span className="content-subtitle">Create engaging content</span>
                      </div>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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