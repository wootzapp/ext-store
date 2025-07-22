import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  Bot,
  Twitter,
  Hash,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Key,
  User,
  Mail,
  Trash2
} from 'lucide-react';
import useConfig from '../hooks/useConfig';
import { cn } from '../utils/cn';
import './Settings.css';

const Settings = ({ onConfigUpdate }) => {
  const [config, setConfig] = useState({
    ai: {
      model: '',
      apiKeys: {
        claude: '',
        openai: '',
        gemini: ''
      }
    },
    twitter: {
      username: '',
      password: '',
      email: ''
    },
    topics: [''],
    settings: {
      interval: 30,
      style: 'professional but engaging'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const { loadConfig, saveConfig } = useConfig();

  useEffect(() => {
    const loadExistingConfig = async () => {
      try {
        setLoading(true);
        const { config: existingConfig } = await loadConfig();
        if (existingConfig) {
          setConfig(existingConfig);
        }
      } catch (error) {
        console.error('Error loading config:', error);
        setMessage('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    loadExistingConfig();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!config.ai?.model) newErrors.model = 'Please select an AI model';
    if (!config.ai?.apiKeys?.[config.ai.model]) newErrors.apiKey = 'API key is required';
    if (!config.twitter?.username) newErrors.twitterUsername = 'Twitter username is required';
    if (!config.twitter?.password) newErrors.twitterPassword = 'Twitter password is required';
    if (!config.twitter?.email) newErrors.email = 'Email is required';
    if (!config.topics || !config.topics[0] || config.topics[0].trim() === '') newErrors.topics = 'At least one topic is required';
    if (!config.settings?.interval || config.settings.interval < 5 || config.settings.interval > 1440) newErrors.interval = 'Please set a valid interval between 5 and 1440 minutes';

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setMessage('');

    try {
      await saveConfig(config);
      if (onConfigUpdate) {
        onConfigUpdate(config);
      }
      setMessage('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    // Clear errors for the specific field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    // Clear related errors
    if (field === 'ai' && errors.model) {
      setErrors(prev => ({ ...prev, model: '' }));
    }
    if (field === 'ai' && errors.apiKey) {
      setErrors(prev => ({ ...prev, apiKey: '' }));
    }
    if (field === 'twitter' && errors.twitterUsername) {
      setErrors(prev => ({ ...prev, twitterUsername: '' }));
    }
    if (field === 'twitter' && errors.twitterPassword) {
      setErrors(prev => ({ ...prev, twitterPassword: '' }));
    }
    if (field === 'twitter' && errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
    if (field === 'settings' && errors.interval) {
      setErrors(prev => ({ ...prev, interval: '' }));
    }
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...(config.topics || [])];
    newTopics[index] = value;
    setConfig(prev => ({ ...prev, topics: newTopics }));
    if (errors.topics) {
      setErrors(prev => ({ ...prev, topics: '' }));
    }
  };

  const addTopic = () => {
    setConfig(prev => ({ ...prev, topics: [...prev.topics, ''] }));
  };

  const removeTopic = (index) => {
    if ((config.topics || []).length > 1) {
      const newTopics = (config.topics || []).filter((_, i) => i !== index);
      setConfig(prev => ({ ...prev, topics: newTopics }));
    }
  };



  if (loading) {
    return (
      <div className="settings-loading">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="loading-icon"
        >
          <SettingsIcon className="loading-icon-svg" />
        </motion.div>
        <p>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="settings">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="settings-container"
      >
        <div className="settings-header">
          <div className="settings-title">
            <SettingsIcon className="settings-icon" />
            <h1 className="gradient-text">Settings</h1>
          </div>
          <p>Configure your AI Twitter agent preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          {/* AI Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="settings-section card"
          >
            <div className="section-header">
              <Bot className="section-icon" />
              <h2>AI Configuration</h2>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Bot className="label-icon" />
                AI Provider
              </label>
              <select 
                value={config.ai?.model || ''}
                onChange={(e) => handleInputChange('ai', { ...config.ai, model: e.target.value })}
                className={cn("form-input", errors.model && "error")}
              >
                <option value="">Select a provider</option>
                <option value="gpt-4">OpenAI (GPT-4)</option>
                <option value="claude-3">Anthropic (Claude 3)</option>
                <option value="gemini-pro">Google (Gemini Pro)</option>
              </select>
              {errors.model && <span className="error-text">{errors.model}</span>}
            </div>

            {config.ai?.model && (
              <div className="form-group">
                <label className="form-label">
                  <Key className="label-icon" />
                  API Key for {config.ai.model}
                </label>
                <input
                  type="password"
                  value={config.ai?.apiKeys?.[config.ai.model] || ''}
                  onChange={(e) => handleInputChange('ai', { 
                    ...config.ai, 
                    apiKeys: { 
                      ...config.ai?.apiKeys, 
                      [config.ai.model]: e.target.value 
                    } 
                  })}
                  placeholder={`Enter your ${config.ai.model} API key`}
                  className={cn("form-input", errors.apiKey && "error")}
                />
                {errors.apiKey && <span className="error-text">{errors.apiKey}</span>}
                <div className="form-help">
                  Get your API key from{' '}
                  {config.ai.model.includes('gpt') && (
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">
                      OpenAI
                    </a>
                  )}
                  {config.ai.model.includes('claude') && (
                    <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer">
                      Anthropic
                    </a>
                  )}
                  {config.ai.model.includes('gemini') && (
                    <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                      Google AI Studio
                    </a>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Twitter Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="settings-section card"
          >
            <div className="section-header">
              <Twitter className="section-icon" />
              <h2>Twitter Configuration</h2>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <User className="label-icon" />
                Twitter Username
              </label>
              <input
                type="text"
                value={config.twitter?.username || ''}
                onChange={(e) => handleInputChange('twitter', { ...config.twitter, username: e.target.value })}
                placeholder="@username"
                className={cn("form-input", errors.twitterUsername && "error")}
              />
              {errors.twitterUsername && <span className="error-text">{errors.twitterUsername}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Key className="label-icon" />
                Twitter Password
              </label>
              <input
                type="password"
                value={config.twitter?.password || ''}
                onChange={(e) => handleInputChange('twitter', { ...config.twitter, password: e.target.value })}
                placeholder="Enter your password"
                className={cn("form-input", errors.twitterPassword && "error")}
              />
              {errors.twitterPassword && <span className="error-text">{errors.twitterPassword}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Mail className="label-icon" />
                Email Address
              </label>
              <input
                type="email"
                value={config.twitter?.email || ''}
                onChange={(e) => handleInputChange('twitter', { ...config.twitter, email: e.target.value })}
                placeholder="your@email.com"
                className={cn("form-input", errors.email && "error")}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
          </motion.div>

          {/* Agent Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="settings-section card"
          >
            <div className="section-header">
              <SettingsIcon className="section-icon" />
              <h2>Agent Configuration</h2>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                <Clock className="label-icon" />
                Posting Interval (minutes)
              </label>
              <div className="range-container">
                <input
                  type="range"
                  value={config.settings?.interval || 30}
                  onChange={(e) => handleInputChange('settings', { ...config.settings, interval: parseInt(e.target.value) })}
                  min="5"
                  max="1440"
                  step="5"
                  className={cn("range-input", errors.interval && "error")}
                />
                <div className="range-value">
                  <span className="range-display">{config.settings?.interval || 30} minutes</span>
                  <div className="range-labels">
                    <span>5 min</span>
                    <span>1440 min (24h)</span>
                  </div>
                </div>
              </div>
              {errors.interval && <span className="error-text">{errors.interval}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                <Hash className="label-icon" />
                Topics to Tweet About
              </label>
              <div className="topics-container">
                {(config.topics || []).map((topic, index) => (
                  <div key={index} className="topic-input-group">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      placeholder={`Topic ${index + 1}`}
                      className={cn("form-input", errors.topics && "error")}
                    />
                    {(config.topics || []).length > 1 && (
                      <motion.button 
                        type="button" 
                        className="remove-topic-btn"
                        onClick={() => removeTopic(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <X className="remove-icon" />
                      </motion.button>
                    )}
                  </div>
                ))}
                <motion.button 
                  type="button" 
                  className="add-topic-btn"
                  onClick={addTopic}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus className="add-icon" />
                  Add Another Topic
                </motion.button>
              </div>
              {errors.topics && <span className="error-text">{errors.topics}</span>}
            </div>
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

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="settings-actions"
          >
            <motion.button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {saving ? (
                <>
                  <div className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="btn-icon" />
                  Save Settings
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default Settings;