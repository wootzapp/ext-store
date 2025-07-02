import React, { useState, useEffect } from 'react';
import useConfig from '../hooks/useConfig';
import { validateTwitterCredentials } from '../utils/browserHelpers';
import AIClientFactory from '../services/ai/aiClientFactory';

function Settings({ onConfigUpdate }) {
  const { config, loading, saveConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      // Validate AI configuration
      const selectedModel = localConfig.ai?.model || 'claude';
      const apiKey = localConfig.ai?.apiKeys?.[selectedModel] || localConfig.anthropicApiKey;
      
      if (!apiKey) {
        throw new Error(`${AIClientFactory.getSupportedModels().find(m => m.value === selectedModel)?.label} API key is required`);
      }

      if (!AIClientFactory.validateApiKey(selectedModel, apiKey)) {
        throw new Error(`Invalid ${AIClientFactory.getSupportedModels().find(m => m.value === selectedModel)?.label} API key format`);
      }

      if (localConfig.twitter?.username && !validateTwitterCredentials(localConfig.twitter)) {
        throw new Error('Twitter credentials incomplete');
      }

      // Save config
      const result = await saveConfig(localConfig);
      
      if (result.success) {
        setMessage('Configuration updated successfully!');
        if (onConfigUpdate) {
          await onConfigUpdate(localConfig);
        }
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...(localConfig.topics || [])];
    newTopics[index] = value;
    setLocalConfig({ ...localConfig, topics: newTopics });
  };

  const addTopic = () => {
    setLocalConfig({ 
      ...localConfig, 
      topics: [...(localConfig.topics || []), ''] 
    });
  };

  const removeTopic = (index) => {
    const newTopics = (localConfig.topics || []).filter((_, i) => i !== index);
    setLocalConfig({ ...localConfig, topics: newTopics });
  };

  const handleSettingChange = (key, value) => {
    setLocalConfig({
      ...localConfig,
      settings: {
        ...localConfig.settings,
        [key]: value
      }
    });
  };

  const handleAIModelChange = (model) => {
    setLocalConfig({
      ...localConfig,
      ai: {
        ...localConfig.ai,
        model: model
      }
    });
  };

  const handleAPIKeyChange = (model, apiKey) => {
    setLocalConfig({
      ...localConfig,
      ai: {
        ...localConfig.ai,
        apiKeys: {
          ...localConfig.ai?.apiKeys,
          [model]: apiKey
        }
      },
      // Maintain backward compatibility for claude
      ...(model === 'claude' && { anthropicApiKey: apiKey })
    });
  };

  const getCurrentAPIKey = () => {
    const selectedModel = localConfig.ai?.model || 'claude';
    return localConfig.ai?.apiKeys?.[selectedModel] || localConfig.anthropicApiKey || '';
  };

  if (loading) {
    return <div className="loading">Loading configuration...</div>;
  }

  const supportedModels = AIClientFactory.getSupportedModels();
  const selectedModel = localConfig.ai?.model || 'claude';

  return (
    <div className="settings">      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h3 className="section-title">
            <span role="img" aria-label="ai">🤖</span> AI Configuration
          </h3>
          
          <div className="form-group">
            <label className="form-label">AI Model</label>
            <select
              className="form-select"
              value={selectedModel}
              onChange={(e) => handleAIModelChange(e.target.value)}
            >
              {supportedModels.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
            <small className="form-help">
              {supportedModels.find(m => m.value === selectedModel)?.description}
            </small>
          </div>

          <div className="form-group">
            <label className="form-label">
              {supportedModels.find(m => m.value === selectedModel)?.label} API Key
            </label>
            <input
              type="password"
              className="form-input"
              value={getCurrentAPIKey()}
              onChange={(e) => handleAPIKeyChange(selectedModel, e.target.value)}
              placeholder={AIClientFactory.getApiKeyPlaceholder(selectedModel)}
            />
            <small className="form-help">
              Get your API key from: <a 
                href={AIClientFactory.getApiKeyHelpUrl(selectedModel)} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {AIClientFactory.getApiKeyHelpUrl(selectedModel)}
              </a>
            </small>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">
            <span role="img" aria-label="twitter">🕊️</span> Twitter Credentials
          </h3>
          <div className="form-group">
            <label className="form-label">Username/Email</label>
            <input
              type="text"
              className="form-input"
              value={localConfig.twitter?.username || ''}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                twitter: { ...localConfig.twitter, username: e.target.value }
              })}
              placeholder="Twitter username"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={localConfig.twitter?.password || ''}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                twitter: { ...localConfig.twitter, password: e.target.value }
              })}
              placeholder="Twitter password"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email (for verification)</label>
            <input
              type="email"
              className="form-input"
              value={localConfig.twitter?.email || ''}
              onChange={(e) => setLocalConfig({
                ...localConfig,
                twitter: { ...localConfig.twitter, email: e.target.value }
              })}
              placeholder="Email for verification"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">
            <span role="img" aria-label="settings">⚙️</span> Agent Settings
          </h3>
          <div className="form-group">
            <label className="form-label">Tweet Interval</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                className="form-input"
                min="1"
                max="1440"
                value={localConfig.settings?.interval || 240}
                onChange={(e) => handleSettingChange('interval', parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ 
                fontSize: '0.8rem', 
                color: '#718096', 
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}>
                minutes
              </span>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Writing Style</label>
            <select
              className="form-select"
              value={localConfig.settings?.style || 'professional but engaging'}
              onChange={(e) => handleSettingChange('style', e.target.value)}
            >
              <option value="professional but engaging">Professional but Engaging</option>
              <option value="casual and friendly">Casual and Friendly</option>
              <option value="technical and informative">Technical and Informative</option>
              <option value="creative and inspiring">Creative and Inspiring</option>
              <option value="news and factual">News and Factual</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">
            <span role="img" aria-label="topics">📝</span> Tweet Topics
          </h3>
          <div className="topics-container">
            {(localConfig.topics || ['']).map((topic, index) => (
              <div key={index} className="topic-group">
                <input
                  type="text"
                  className="form-input topic-input"
                  value={topic}
                  onChange={(e) => handleTopicChange(index, e.target.value)}
                  placeholder="Enter a topic for tweet generation"
                />
                <button 
                  type="button" 
                  onClick={() => removeTopic(index)}
                  className="btn btn-small btn-danger topic-btn"
                  disabled={(localConfig.topics || []).length <= 1}
                  title="Remove topic"
                >
                  <span role="img" aria-label="remove">🗑️</span>
                </button>
              </div>
            ))}
          </div>
          <button 
            type="button" 
            onClick={addTopic}
            className="btn btn-small btn-secondary add-topic-btn"
            style={{ marginTop: 12 }}
          >
            <span role="img" aria-label="add">➕</span> Add Topic
          </button>
        </div>

        <div className="settings-actions">
          <button 
            type="submit" 
            className="btn btn-primary submit-btn"
            disabled={saving}
          >
            {saving ? '🔄 Updating...' : 'Update Configurations'}
          </button>
        </div>
      </form>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}
    </div>
  );
}

export default Settings;