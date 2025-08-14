import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  Bot,
  Twitter,
  Instagram,
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
      email: '',
      interval: 30,
      topics: ['']
    },
    instagram: {
      username: '',
      password: '',
      email: '',
      interval: 30,
      topics: ['']
    },
    settings: {
      style: 'professional but engaging'
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('twitter'); // 'twitter' or 'instagram'

  const { loadConfig, saveConfig } = useConfig();

  useEffect(() => {
    const loadExistingConfig = async () => {
      try {
        setLoading(true);
        const { config: existingConfig } = await loadConfig();
        if (existingConfig) {
          // Handle migration from old config format
          const migratedConfig = {
            ai: existingConfig.ai || { model: '', apiKeys: { claude: '', openai: '', gemini: '' } },
            twitter: {
              username: existingConfig.twitter?.username || '',
              password: existingConfig.twitter?.password || '',
              email: existingConfig.twitter?.email || '',
              interval: existingConfig.twitter?.interval || existingConfig.settings?.interval || 30,
              topics: existingConfig.twitter?.topics || existingConfig.topics || ['']
            },
            instagram: {
              username: existingConfig.instagram?.username || '',
              password: existingConfig.instagram?.password || '',
              email: existingConfig.instagram?.email || '',
              interval: existingConfig.instagram?.interval || 30,
              topics: existingConfig.instagram?.topics || ['']
            },
            settings: {
              style: existingConfig.settings?.style || 'professional but engaging'
            }
          };
          setConfig(migratedConfig);
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
    
    // AI Configuration validation
    if (!config.ai?.model) newErrors.model = 'Please select an AI model';
    if (!config.ai?.apiKeys?.[config.ai.model]) newErrors.apiKey = 'API key is required';
    
    // Twitter Configuration validation
    if (!config.twitter?.username) newErrors.twitterUsername = 'Twitter username is required';
    if (!config.twitter?.password) newErrors.twitterPassword = 'Twitter password is required';
    if (!config.twitter?.email) newErrors.twitterEmail = 'Twitter email is required';
    if (!config.twitter?.topics || !config.twitter?.topics[0] || config.twitter?.topics[0].trim() === '') newErrors.twitterTopics = 'At least one Twitter topic is required';
    if (!config.twitter?.interval || config.twitter?.interval < 5 || config.twitter?.interval > 1440) newErrors.twitterInterval = 'Please set a valid Twitter interval between 5 and 1440 minutes';
    
    // Instagram Configuration validation
    if (!config.instagram?.username) newErrors.instagramUsername = 'Instagram username is required';
    if (!config.instagram?.password) newErrors.instagramPassword = 'Instagram password is required';
    if (!config.instagram?.email) newErrors.instagramEmail = 'Instagram email is required';
    if (!config.instagram?.topics || !config.instagram?.topics[0] || config.instagram?.topics[0].trim() === '') newErrors.instagramTopics = 'At least one Instagram topic is required';
    if (!config.instagram?.interval || config.instagram?.interval < 5 || config.instagram?.interval > 1440) newErrors.instagramInterval = 'Please set a valid Instagram interval between 5 and 1440 minutes';

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
    if (field === 'twitter' && errors.twitterEmail) {
      setErrors(prev => ({ ...prev, twitterEmail: '' }));
    }
    if (field === 'twitter' && errors.twitterInterval) {
      setErrors(prev => ({ ...prev, twitterInterval: '' }));
    }
    if (field === 'instagram' && errors.instagramUsername) {
      setErrors(prev => ({ ...prev, instagramUsername: '' }));
    }
    if (field === 'instagram' && errors.instagramPassword) {
      setErrors(prev => ({ ...prev, instagramPassword: '' }));
    }
    if (field === 'instagram' && errors.instagramEmail) {
      setErrors(prev => ({ ...prev, instagramEmail: '' }));
    }
    if (field === 'instagram' && errors.instagramInterval) {
      setErrors(prev => ({ ...prev, instagramInterval: '' }));
    }
  };

  const handleTopicChange = (platform, index, value) => {
    const newTopics = [...(config[platform]?.topics || [])];
    newTopics[index] = value;
    setConfig(prev => ({ 
      ...prev, 
      [platform]: { 
        ...prev[platform], 
        topics: newTopics 
      } 
    }));
    if (errors[`${platform}Topics`]) {
      setErrors(prev => ({ ...prev, [`${platform}Topics`]: '' }));
    }
  };

  const addTopic = (platform) => {
    setConfig(prev => ({ 
      ...prev, 
      [platform]: { 
        ...prev[platform], 
        topics: [...(prev[platform]?.topics || []), ''] 
      } 
    }));
  };

  const removeTopic = (platform, index) => {
    if ((config[platform]?.topics || []).length > 1) {
      const newTopics = (config[platform]?.topics || []).filter((_, i) => i !== index);
      setConfig(prev => ({ 
        ...prev, 
        [platform]: { 
          ...prev[platform], 
          topics: newTopics 
        } 
      }));
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
          <p>Configure your AI Social Media agent preferences</p>
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

          {/* Platform Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="platform-tabs"
          >
            <motion.button
              type="button"
              className={cn("platform-tab", activeTab === 'twitter' && "active")}
              onClick={() => setActiveTab('twitter')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Twitter className="tab-icon" />
              <span>Twitter Settings</span>
            </motion.button>
            
            <motion.button
              type="button"
              className={cn("platform-tab", activeTab === 'instagram' && "active")}
              onClick={() => setActiveTab('instagram')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Instagram className="tab-icon" />
              <span>Instagram Settings</span>
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
                      Twitter Email Address
                    </label>
                    <input
                      type="email"
                      value={config.twitter?.email || ''}
                      onChange={(e) => handleInputChange('twitter', { ...config.twitter, email: e.target.value })}
                      placeholder="your@email.com"
                      className={cn("form-input", errors.twitterEmail && "error")}
                    />
                    {errors.twitterEmail && <span className="error-text">{errors.twitterEmail}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Clock className="label-icon" />
                      Twitter Posting Interval (minutes)
                    </label>
                    <div className="range-container">
                      <input
                        type="range"
                        value={config.twitter?.interval || 30}
                        onChange={(e) => handleInputChange('twitter', { ...config.twitter, interval: parseInt(e.target.value) })}
                        min="5"
                        max="1440"
                        step="5"
                        className={cn("range-input", errors.twitterInterval && "error")}
                      />
                      <div className="range-value">
                        <span className="range-display">{config.twitter?.interval || 30} minutes</span>
                        <div className="range-labels">
                          <span>5 min</span>
                          <span>1440 min (24h)</span>
                        </div>
                      </div>
                    </div>
                    {errors.twitterInterval && <span className="error-text">{errors.twitterInterval}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Hash className="label-icon" />
                      Twitter Topics to Tweet About
                    </label>
                    <div className="topics-container">
                      {(config.twitter?.topics || []).map((topic, index) => (
                        <div key={index} className="topic-input-group">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => handleTopicChange('twitter', index, e.target.value)}
                            placeholder={`Twitter Topic ${index + 1}`}
                            className={cn("form-input", errors.twitterTopics && "error")}
                          />
                          {(config.twitter?.topics || []).length > 1 && (
                            <motion.button 
                              type="button" 
                              className="remove-topic-btn"
                              onClick={() => removeTopic('twitter', index)}
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
                        onClick={() => addTopic('twitter')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="add-icon" />
                        Add Another Twitter Topic
                      </motion.button>
                    </div>
                    {errors.twitterTopics && <span className="error-text">{errors.twitterTopics}</span>}
                  </div>
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
                {/* Instagram Configuration */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="settings-section card"
                >
                  <div className="section-header">
                    <Instagram className="section-icon" />
                    <h2>Instagram Configuration</h2>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">
                      <User className="label-icon" />
                      Instagram Username
                    </label>
                    <input
                      type="text"
                      value={config.instagram?.username || ''}
                      onChange={(e) => handleInputChange('instagram', { ...config.instagram, username: e.target.value })}
                      placeholder="@username"
                      className={cn("form-input", errors.instagramUsername && "error")}
                    />
                    {errors.instagramUsername && <span className="error-text">{errors.instagramUsername}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Key className="label-icon" />
                      Instagram Password
                    </label>
                    <input
                      type="password"
                      value={config.instagram?.password || ''}
                      onChange={(e) => handleInputChange('instagram', { ...config.instagram, password: e.target.value })}
                      placeholder="Enter your password"
                      className={cn("form-input", errors.instagramPassword && "error")}
                    />
                    {errors.instagramPassword && <span className="error-text">{errors.instagramPassword}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Mail className="label-icon" />
                      Instagram Email Address
                    </label>
                    <input
                      type="email"
                      value={config.instagram?.email || ''}
                      onChange={(e) => handleInputChange('instagram', { ...config.instagram, email: e.target.value })}
                      placeholder="your@email.com"
                      className={cn("form-input", errors.instagramEmail && "error")}
                    />
                    {errors.instagramEmail && <span className="error-text">{errors.instagramEmail}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Clock className="label-icon" />
                      Instagram Posting Interval (minutes)
                    </label>
                    <div className="range-container">
                      <input
                        type="range"
                        value={config.instagram?.interval || 30}
                        onChange={(e) => handleInputChange('instagram', { ...config.instagram, interval: parseInt(e.target.value) })}
                        min="5"
                        max="1440"
                        step="5"
                        className={cn("range-input", errors.instagramInterval && "error")}
                      />
                      <div className="range-value">
                        <span className="range-display">{config.instagram?.interval || 30} minutes</span>
                        <div className="range-labels">
                          <span>5 min</span>
                          <span>1440 min (24h)</span>
                        </div>
                      </div>
                    </div>
                    {errors.instagramInterval && <span className="error-text">{errors.instagramInterval}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Hash className="label-icon" />
                      Instagram Topics to Post About
                    </label>
                    <div className="topics-container">
                      {(config.instagram?.topics || []).map((topic, index) => (
                        <div key={index} className="topic-input-group">
                          <input
                            type="text"
                            value={topic}
                            onChange={(e) => handleTopicChange('instagram', index, e.target.value)}
                            placeholder={`Instagram Topic ${index + 1}`}
                            className={cn("form-input", errors.instagramTopics && "error")}
                          />
                          {(config.instagram?.topics || []).length > 1 && (
                            <motion.button 
                              type="button" 
                              className="remove-topic-btn"
                              onClick={() => removeTopic('instagram', index)}
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
                        onClick={() => addTopic('instagram')}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="add-icon" />
                        Add Another Instagram Topic
                      </motion.button>
                    </div>
                    {errors.instagramTopics && <span className="error-text">{errors.instagramTopics}</span>}
                  </div>
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