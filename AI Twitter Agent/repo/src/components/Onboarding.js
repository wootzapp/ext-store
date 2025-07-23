import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Twitter, 
  Settings, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Key,
  User,
  Mail,
  Hash,
  Clock,
  AlertCircle,
  Instagram
} from 'lucide-react';
import useConfig from '../hooks/useConfig';
import { cn } from '../utils/cn';
import './Onboarding.css';

const Onboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    provider: '', // Changed from model to provider
    apiKey: '',
    twitterUsername: '',
    twitterPassword: '',
    twitterEmail: '',
    instagramUsername: '',
    instagramPassword: '',
    instagramEmail: '',
    twitterInterval: '30',
    instagramInterval: '30',
    twitterTopics: [''],
    instagramTopics: ['']
  });
  const [errors, setErrors] = useState({});
  
  const { saveConfig } = useConfig();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Provider and API Key
        if (!formData.provider) newErrors.provider = 'Please select a provider';
        if (!formData.apiKey) newErrors.apiKey = 'API key is required';
        else if (formData.apiKey.length < 10) newErrors.apiKey = 'API key seems too short';
        break;
        
      case 1: // Twitter credentials and email
        if (!formData.twitterUsername) newErrors.twitterUsername = 'Twitter username is required';
        if (!formData.twitterPassword) newErrors.twitterPassword = 'Twitter password is required';
        if (!formData.twitterEmail) newErrors.twitterEmail = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.twitterEmail)) newErrors.twitterEmail = 'Please enter a valid email';
        break;
        
      case 2: // Instagram credentials and email
        if (!formData.instagramUsername) newErrors.instagramUsername = 'Instagram username is required';
        if (!formData.instagramPassword) newErrors.instagramPassword = 'Instagram password is required';
        if (!formData.instagramEmail) newErrors.instagramEmail = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.instagramEmail)) newErrors.instagramEmail = 'Please enter a valid email';
        break;
        
      case 3: // Twitter interval and topics
        if (!formData.twitterInterval || formData.twitterInterval < 5 || formData.twitterInterval > 1440) newErrors.twitterInterval = 'Please set a valid interval between 5 and 1440 minutes';
        if (!formData.twitterTopics[0] || formData.twitterTopics[0].trim() === '') newErrors.twitterTopics = 'At least one Twitter topic is required';
        break;
        
      case 4: // Instagram interval and topics
        if (!formData.instagramInterval || formData.instagramInterval < 5 || formData.instagramInterval > 1440) newErrors.instagramInterval = 'Please set a valid interval between 5 and 1440 minutes';
        if (!formData.instagramTopics[0] || formData.instagramTopics[0].trim() === '') newErrors.instagramTopics = 'At least one Instagram topic is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateStep(currentStep)) return;
    
    if (currentStep === 4) {
      // Final step - save configuration
      setSaving(true);
      try {
        // Map provider to specific model for background script
        const providerToModelMap = {
          'openai': 'gpt-4',
          'anthropic': 'claude-3',
          'google': 'gemini-pro'
        };
        
        const configToSave = {
          ai: {
            model: providerToModelMap[formData.provider],
            apiKeys: {
              [providerToModelMap[formData.provider]]: formData.apiKey
            }
          },
          twitter: {
            username: formData.twitterUsername,
            password: formData.twitterPassword,
            email: formData.twitterEmail,
            interval: parseInt(formData.twitterInterval),
            topics: formData.twitterTopics.filter(topic => topic.trim() !== '')
          },
          instagram: {
            username: formData.instagramUsername,
            password: formData.instagramPassword,
            email: formData.instagramEmail,
            interval: parseInt(formData.instagramInterval),
            topics: formData.instagramTopics.filter(topic => topic.trim() !== '')
          },
          settings: {
            style: 'professional but engaging'
          }
        };
        
        await saveConfig(configToSave);
        onComplete();
      } catch (error) {
        console.error('Failed to save configuration:', error);
        setErrors({ general: 'Failed to save configuration. Please try again.' });
      } finally {
        setSaving(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleTopicChange = (index, value) => {
    const newTopics = [...formData.twitterTopics];
    newTopics[index] = value;
    setFormData(prev => ({ ...prev, twitterTopics: newTopics }));
    if (errors.twitterTopics) {
      setErrors(prev => ({ ...prev, twitterTopics: '' }));
    }
  };

  const addTopic = () => {
    setFormData(prev => ({ ...prev, twitterTopics: [...prev.twitterTopics, ''] }));
  };

  const removeTopic = (index) => {
    if (formData.twitterTopics.length > 1) {
      const newTopics = formData.twitterTopics.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, twitterTopics: newTopics }));
    }
  };

  const handleInstagramTopicChange = (index, value) => {
    const newTopics = [...formData.instagramTopics];
    newTopics[index] = value;
    setFormData(prev => ({ ...prev, instagramTopics: newTopics }));
    if (errors.instagramTopics) {
      setErrors(prev => ({ ...prev, instagramTopics: '' }));
    }
  };

  const addInstagramTopic = () => {
    setFormData(prev => ({ ...prev, instagramTopics: [...prev.instagramTopics, ''] }));
  };

  const removeInstagramTopic = (index) => {
    if (formData.instagramTopics.length > 1) {
      const newTopics = formData.instagramTopics.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instagramTopics: newTopics }));
    }
  };

  if (loading) {
    return (
      <div className="onboarding-container">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="onboarding-card glass-effect"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="loading-icon"
          >
            <Sparkles className="sparkles-icon" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="gradient-text"
          >
            Setting up your AI agent...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Please wait while we prepare everything for you
          </motion.p>
        </motion.div>
      </div>
    );
  }

  const steps = [
    {
      title: "Choose Your AI Provider",
      subtitle: "Select your preferred AI provider and add your API key",
      icon: Bot
    },
    {
      title: "Connect Your Twitter",
      subtitle: "Enter your Twitter credentials and email",
      icon: Twitter
    },
    {
      title: "Connect Your Instagram",
      subtitle: "Enter your Instagram credentials and email",
      icon: Instagram
    },
    {
      title: "Configure Twitter Agent",
      subtitle: "Set Twitter posting interval and choose topics",
      icon: Twitter
    },
    {
      title: "Configure Instagram Agent",
      subtitle: "Set Instagram posting interval and choose topics",
      icon: Instagram
    }
  ];

  return (
    <div className="onboarding-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="onboarding-card glass-effect"
      >
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <motion.div 
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="step-indicator">
            Step {currentStep + 1} of 5
          </div>
        </div>
        
        {/* Step Header */}
        <div className="step-header">
          <div className="step-icon">
            {React.createElement(steps[currentStep].icon, { className: "step-icon-svg" })}
          </div>
          <div className="step-info">
            <motion.h2
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="gradient-text"
            >
              {steps[currentStep].title}
            </motion.h2>
            <motion.p
              key={`subtitle-${currentStep}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="step-subtitle"
            >
              {steps[currentStep].subtitle}
            </motion.p>
          </div>
        </div>
        
        {/* Error Message */}
        <AnimatePresence>
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="error-message"
            >
              <AlertCircle className="error-icon" />
              {errors.general}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="step-content"
        >
          {currentStep === 0 && (
            <div className="step-form">
              <div className="form-group">
                <label className="form-label">
                  <Bot className="label-icon" />
                  AI Provider
                </label>
                <select 
                  value={formData.provider}
                  onChange={(e) => handleInputChange('provider', e.target.value)}
                  className={cn("form-input", errors.provider && "error")}
                >
                  <option value="">Select a provider</option>
                  <option value="openai">OpenAI (GPT-4)</option>
                  <option value="anthropic">Anthropic (Claude 3)</option>
                  <option value="google">Google (Gemini Pro)</option>
                </select>
                {errors.provider && <span className="error-text">{errors.provider}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Key className="label-icon" />
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => handleInputChange('apiKey', e.target.value)}
                  placeholder="Enter your API key"
                  className={cn("form-input", errors.apiKey && "error")}
                />
                {errors.apiKey && <span className="error-text">{errors.apiKey}</span>}
              </div>
            </div>
          )}
          
          {currentStep === 1 && (
            <div className="step-form">
              <div className="form-group">
                <label className="form-label">
                  <User className="label-icon" />
                  Twitter Username
                </label>
                <input
                  type="text"
                  value={formData.twitterUsername}
                  onChange={(e) => handleInputChange('twitterUsername', e.target.value)}
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
                  value={formData.twitterPassword}
                  onChange={(e) => handleInputChange('twitterPassword', e.target.value)}
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
                  value={formData.twitterEmail}
                  onChange={(e) => handleInputChange('twitterEmail', e.target.value)}
                  placeholder="your@email.com"
                  className={cn("form-input", errors.twitterEmail && "error")}
                />
                {errors.twitterEmail && <span className="error-text">{errors.twitterEmail}</span>}
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="step-form">
              <div className="form-group">
                <label className="form-label">
                  <User className="label-icon" />
                  Instagram Username
                </label>
                <input
                  type="text"
                  value={formData.instagramUsername}
                  onChange={(e) => handleInputChange('instagramUsername', e.target.value)}
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
                  value={formData.instagramPassword}
                  onChange={(e) => handleInputChange('instagramPassword', e.target.value)}
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
                  value={formData.instagramEmail}
                  onChange={(e) => handleInputChange('instagramEmail', e.target.value)}
                  placeholder="your@email.com"
                  className={cn("form-input", errors.instagramEmail && "error")}
                />
                {errors.instagramEmail && <span className="error-text">{errors.instagramEmail}</span>}
              </div>
            </div>
          )}
          
          {currentStep === 3 && (
            <div className="step-form">
              <div className="form-group">
                <label className="form-label">
                  <Clock className="label-icon" />
                  Twitter Posting Interval (minutes)
                </label>
                <div className="range-container">
                  <input
                    type="range"
                    value={formData.twitterInterval}
                    onChange={(e) => handleInputChange('twitterInterval', e.target.value)}
                    min="5"
                    max="1440"
                    step="5"
                    className={cn("range-input", errors.twitterInterval && "error")}
                  />
                  <div className="range-value">
                    <span className="range-display">{formData.twitterInterval} minutes</span>
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
                {formData.twitterTopics.map((topic, index) => (
                  <div key={index} className="topic-input-group">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      placeholder={`Topic ${index + 1}`}
                      className={cn("form-input", errors.twitterTopics && "error")}
                    />
                    {formData.twitterTopics.length > 1 && (
                      <motion.button 
                        type="button" 
                        className="remove-topic-btn"
                        onClick={() => removeTopic(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ×
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
                  + Add Another Topic
                </motion.button>
                {errors.twitterTopics && <span className="error-text">{errors.twitterTopics}</span>}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="step-form">
              <div className="form-group">
                <label className="form-label">
                  <Clock className="label-icon" />
                  Instagram Posting Interval (minutes)
                </label>
                <div className="range-container">
                  <input
                    type="range"
                    value={formData.instagramInterval}
                    onChange={(e) => handleInputChange('instagramInterval', e.target.value)}
                    min="5"
                    max="1440"
                    step="5"
                    className={cn("range-input", errors.instagramInterval && "error")}
                  />
                  <div className="range-value">
                    <span className="range-display">{formData.instagramInterval} minutes</span>
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
                {formData.instagramTopics.map((topic, index) => (
                  <div key={index} className="topic-input-group">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => handleInstagramTopicChange(index, e.target.value)}
                      placeholder={`Topic ${index + 1}`}
                      className={cn("form-input", errors.instagramTopics && "error")}
                    />
                    {formData.instagramTopics.length > 1 && (
                      <motion.button 
                        type="button" 
                        className="remove-topic-btn"
                        onClick={() => removeInstagramTopic(index)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ×
                      </motion.button>
                    )}
                  </div>
                ))}
                <motion.button 
                  type="button" 
                  className="add-topic-btn"
                  onClick={addInstagramTopic}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  + Add Another Topic
                </motion.button>
                {errors.instagramTopics && <span className="error-text">{errors.instagramTopics}</span>}
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Step Actions */}
        <div className="step-actions">
          {currentStep > 0 && (
            <motion.button 
              className="btn btn-secondary"
              onClick={handleBack}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="btn-icon" />
              Back
            </motion.button>
          )}
          
          <motion.button 
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={saving}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {saving ? (
              <>
                <div className="spinner" />
                Saving...
              </>
            ) : (
              <>
                {currentStep === 4 ? 'Complete Setup' : 'Continue'}
                <ArrowRight className="btn-icon" />
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Onboarding; 