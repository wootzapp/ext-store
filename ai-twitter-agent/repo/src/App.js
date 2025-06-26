import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import useAgent from './hooks/useAgent';
import { isExtension } from './utils/browserHelpers';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    agent, 
    status, 
    loading, 
    error, 
    startAgent, 
    stopAgent, 
    postTweet, 
    testClaude, 
    updateConfig
  } = useAgent();

  const environment = isExtension() ? 'Chrome Extension' : 'Web Application';

  const handleAuthorizeTwitter = async () => {
    return await agent.authorizeTwitter();
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>AI Twitter Agent</h1>
          <nav className="nav-tabs">
            <button 
              className={activeTab === 'dashboard' ? 'active' : ''}
              onClick={() => setActiveTab('dashboard')}
            >
              <span>Dashboard</span>
            </button>
            <button 
              className={activeTab === 'settings' ? 'active' : ''}
              onClick={() => setActiveTab('settings')}
            >
              <span>Settings</span>
            </button>
          </nav>
        </div>
      </header>
      
      <main className="App-main">
        {error && (
          <div className="global-error">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {activeTab === 'dashboard' && (
          <Dashboard 
            agentStatus={status}
            loading={loading}
            onStartAgent={startAgent}
            onStopAgent={stopAgent}
            onTestClaude={testClaude}
            onAuthorizeTwitter={handleAuthorizeTwitter}
            postTweet={postTweet}
          />
        )}
        {activeTab === 'settings' && (
          <Settings 
            onConfigUpdate={updateConfig}
          />
        )}
      </main>
    </div>
  );
}

export default App;