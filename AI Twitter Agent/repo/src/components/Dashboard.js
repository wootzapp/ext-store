import React, { useState } from 'react';

function Dashboard({ 
  agentStatus, 
  loading, 
  onStartAgent, 
  onStopAgent, 
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
        {/* show Agent status and status indicator in one row,  in left and right */}
        <div className="status-card-header">
          <h2>Agent Status</h2>
          <div className={`status-indicator ${agentStatus.isRunning ? 'running' : 'stopped'}`}>
            {agentStatus.isRunning ? 'Running' : 'Stopped'}
          </div>
        </div>
        <div className="status-details">
          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <span role="img" aria-label="agent">🤖</span> Agent Initialized:
            </span>
            <span>{agentStatus.hasAgent ? '✅' : '❌'}</span>
          </p>

          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <span role="img" aria-label="ai-model">🤖</span> AI Model: {agentStatus.config?.aiModel || 'Claude'}
            </span>
            <span>{agentStatus.config?.hasValidAIKey ? '✅' : '❌'}</span>
          </p>

          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <span role="img" aria-label="twitter">🐦</span> Twitter Credentials:
            </span>
            <span>{agentStatus.config?.hasTwitterCredentials ? '✅' : '❌'}</span>
          </p>

          <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              <span role="img" aria-label="topics">📝</span> Topics:
            </span>
            <span>{agentStatus.config?.topicsCount || 0}</span>
          </p>

          {agentStatus.config?.interval && (
            <p style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>
                <span role="img" aria-label="interval">⏱️</span>
                Interval: {agentStatus.config.interval} min
              </span>
              <span>{agentStatus.config.interval}</span>
            </p>
          )}
        </div>
      </div>

      <div className="controls">

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
    </div>
  );
}

export default Dashboard;