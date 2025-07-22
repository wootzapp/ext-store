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
  AlertCircle
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
    email: '',
    setInterval: '30',
    topics: ['']
  });
  const [errors, setErrors] = useState({});
  
  const { saveConfig } = useConfig();

  useEffect(() => {
    // Show "Setting up your AI agent" for 2 seconds
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
        if (!formData.email) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Please enter a valid email';
        break;
        
      case 2: // Set interval and topics
        if (!formData.setInterval || formData.setInterval < 5 || formData.setInterval > 1440) newErrors.setInterval = 'Please set a valid interval between 5 and 1440 minutes';
        if (!formData.topics[0] || formData.topics[0].trim() === '') newErrors.topics = 'At least one topic is required';
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validateStep(currentStep)) return;
    
    if (currentStep === 2) {
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
            email: formData.email
          },
          topics: formData.topics.filter(topic => topic.trim() !== ''),
          settings: {
            interval: parseInt(formData.setInterval),
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
    const newTopics = [...formData.topics];
    newTopics[index] = value;
    setFormData(prev => ({ ...prev, topics: newTopics }));
    if (errors.topics) {
      setErrors(prev => ({ ...prev, topics: '' }));
    }
  };

  const addTopic = () => {
    setFormData(prev => ({ ...prev, topics: [...prev.topics, ''] }));
  };

  const removeTopic = (index) => {
    if (formData.topics.length > 1) {
      const newTopics = formData.topics.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, topics: newTopics }));
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
      title: "Configure Your Agent",
      subtitle: "Set posting interval and choose topics",
      icon: Settings
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
              animate={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />
          </div>
          <div className="step-indicator">
            Step {currentStep + 1} of 3
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
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={cn("form-input", errors.email && "error")}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="step-form">
              <div className="form-group">
                <label className="form-label">
                  <Clock className="label-icon" />
                  Posting Interval (minutes)
                </label>
                <div className="range-container">
                  <input
                    type="range"
                    value={formData.setInterval}
                    onChange={(e) => handleInputChange('setInterval', e.target.value)}
                    min="5"
                    max="1440"
                    step="5"
                    className={cn("range-input", errors.setInterval && "error")}
                  />
                  <div className="range-value">
                    <span className="range-display">{formData.setInterval} minutes</span>
                    <div className="range-labels">
                      <span>5 min</span>
                      <span>1440 min (24h)</span>
                    </div>
                  </div>
                </div>
                {errors.setInterval && <span className="error-text">{errors.setInterval}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <Hash className="label-icon" />
                  Topics to Tweet About
                </label>
                {formData.topics.map((topic, index) => (
                  <div key={index} className="topic-input-group">
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => handleTopicChange(index, e.target.value)}
                      placeholder={`Topic ${index + 1}`}
                      className={cn("form-input", errors.topics && "error")}
                    />
                    {formData.topics.length > 1 && (
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
                {errors.topics && <span className="error-text">{errors.topics}</span>}
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
                {currentStep === 2 ? 'Complete Setup' : 'Continue'}
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