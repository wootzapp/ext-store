import React, { useState } from 'react';
import { isExtension } from '../utils/browserHelpers';

function Dashboard({ 
  agentStatus, 
  loading, 
  onStartAgent, 
  onStopAgent, 
  onTestClaude,
  postTweet
}) {
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Debug logging
  console.log('Dashboard: Current agent status:', agentStatus);
  console.log('Dashboard: Loading state:', loading);
  console.log('Dashboard: Action loading state:', actionLoading);

  const handleStartAgent = async () => {
    console.log('Dashboard: Start agent clicked');
    setActionLoading(true);
    setMessage('');
    try {
      const result = await onStartAgent();
      console.log('Dashboard: Start agent result:', result);
      setMessage(result.success ? result.message : `Error: ${result.error}`);
    } catch (error) {
      console.error('Dashboard: Start agent error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopAgent = async () => {
    console.log('Dashboard: Stop agent clicked');
    setActionLoading(true);
    setMessage('');
    try {
      const result = await onStopAgent();
      console.log('Dashboard: Stop agent result:', result);
      setMessage(result.success ? result.message : `Error: ${result.error}`);
    } catch (error) {
      console.error('Dashboard: Stop agent error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestClaude = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      const result = await onTestClaude();
      if (result.success) {
        setMessage(`✨ Claude test successful! Generated: "${result.tweet}"`);
      } else {
        setMessage(`❌ Claude test failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handlePostTweet = async () => {
    setActionLoading(true);
    setMessage('');
    try {
      const result = await postTweet();
      if (result.success) {
        const status = result.posted ? 'posted to Twitter' : 'generated successfully';
        setMessage(`✅ Tweet ${status}: "${result.tweet}"`);
        if (result.error) {
          setMessage(prev => prev + ` (Note: ${result.error})`);
        }
      } else {
        setMessage(`❌ Post tweet failed: ${result.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const isLoading = loading || actionLoading;

  return (
    <div className="dashboard">
      <div className="status-card">
        <h2>Agent Status</h2>
        <div className={`status-indicator ${agentStatus.isRunning ? 'running' : 'stopped'}`}>
          {agentStatus.isRunning ? '🟢 Running' : '🔴 Stopped'}
        </div>
        <div className="status-details">
          <p>
            <span role="img" aria-label="agent">🤖</span>
            Agent Initialized: {agentStatus.hasAgent ? '✅' : '❌'}
          </p>
          <p>
            <span role="img" aria-label="api">🔑</span>
            Anthropic API: {agentStatus.config?.hasAnthropicKey ? '✅' : '❌'}
          </p>
          <p>
            <span role="img" aria-label="ai-model">🤖</span>
            AI Model: {agentStatus.config?.aiModel || 'Claude'} {agentStatus.config?.hasValidAIKey ? '✅' : '❌'}
          </p>
          <p>
            <span role="img" aria-label="twitter">🐦</span>
            Twitter Credentials: {agentStatus.config?.hasTwitterCredentials ? '✅' : '❌'}
          </p>
          <p>
            <span role="img" aria-label="topics">📝</span>
            Topics: {agentStatus.config?.topicsCount || 0}
          </p>
          <p>
            <span role="img" aria-label="environment">🌐</span>
            {isExtension() ? 'Chrome Extension' : 'Web Application'}
          </p>
          {agentStatus.config?.interval && (
            <p>
              <span role="img" aria-label="interval">⏱️</span>
              Interval: {agentStatus.config.interval} min
            </p>
          )}
          {agentStatus.schedules && agentStatus.schedules.length > 0 && (
            <p>
              <span role="img" aria-label="schedules">📅</span>
              Active Schedules: {agentStatus.schedules.length}
            </p>
          )}
        </div>
      </div>

      {!isExtension() && (
        <div className="webapp-notice">
          <h3>
            <span role="img" aria-label="info">ℹ️</span>
            Web Application Mode
          </h3>
          <p>
            Running in web mode. Twitter posting requires Chrome extension. 
            You can test Claude AI generation and manage settings.
          </p>
        </div>
      )}

      <div className="controls">
        {/* <button 
          onClick={handleTestClaude} 
          disabled={isLoading}
          className="btn btn-secondary"
        >
          {isLoading ? '🔄 Testing...' : `🤖 Test ${agentStatus.config?.aiModel || 'Claude'} AI`}
        </button> */}

        <button 
          onClick={handleStartAgent} 
          disabled={isLoading || agentStatus.isRunning}
          className="btn btn-success"
        >
          {isLoading ? '🔄 Starting...' : '▶️ Start Agent'}
        </button>
        
        <button 
          onClick={handleStopAgent} 
          disabled={isLoading || !agentStatus.isRunning}
          className="btn btn-danger"
        >
          {isLoading ? '🔄 Stopping...' : '⏹️ Stop Agent'}
        </button>
        
        <button 
          onClick={handlePostTweet} 
          disabled={isLoading}
          className="btn btn-primary"
        >
          {isLoading ? '🔄 Generating & Posting...' : '🐦 Generate & Post Tweet'}
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('failed') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {agentStatus.schedules && agentStatus.schedules.length > 0 && (
        <div className="schedules-info">
          <h3>
            <span role="img" aria-label="schedules">📅</span>
            Active Schedules
          </h3>
          {agentStatus.schedules.map((schedule, index) => (
            <div key={index} className="schedule-item">
              <span>
                <span role="img" aria-label="schedule">⏰</span>
                {schedule.name}
              </span>
              {schedule.periodInMinutes && (
                <span>Every {schedule.periodInMinutes} minutes</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;