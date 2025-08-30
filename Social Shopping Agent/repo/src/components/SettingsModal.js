/* global chrome */
import React, { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';
import { useNavigate } from 'react-router-dom';
import { 
  FaCog, 
  FaTimes, 
  FaRobot, 
  FaBrain, 
  FaCompass, 
  FaClipboardList, 
  FaCheckCircle, 
  // FaMobile, 
  // FaLock, 
  // FaShieldAlt, 
  // FaSearch,
  FaSave
} from 'react-icons/fa';

const SettingsModal = () => {
  const { config, updateConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState(config);
  const navigate = useNavigate();

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleClose = () => {
    navigate('/profile');
  };

  const handleSave = async () => {
    try {
      console.log('💾 Saving configuration...');
      
      // Show saving state
      const saveButton = document.querySelector('[data-save-button]');
      if (saveButton) {
        saveButton.textContent = '💾 Saving...';
        saveButton.disabled = true;
      }
      
      // Update config
      await updateConfig(localConfig);
      
      // If API keys were saved, automatically set user preference to use personal API
      const hasApiKeys = !!(
        localConfig.anthropicApiKey || 
        localConfig.openaiApiKey || 
        localConfig.geminiApiKey
      );
      
      if (hasApiKeys && typeof chrome !== 'undefined' && chrome.storage) {
        try {
          await chrome.storage.local.set({ userPreferPersonalAPI: true });
          console.log('✅ Automatically enabled personal API preference');
        } catch (storageError) {
          console.warn('Could not set API preference:', storageError);
        }
      }
      
      // Show success briefly
      if (saveButton) {
        saveButton.textContent = '✅ Saved!';
        setTimeout(() => {
          navigate('/profile');
        }, 500);
      } else {
        navigate('/profile');
      }
      
    } catch (error) {
      console.error('Failed to save config:', error);
      
      // Show error
      const saveButton = document.querySelector('[data-save-button]');
      if (saveButton) {
        saveButton.textContent = '❌ Error';
        saveButton.disabled = false;
        setTimeout(() => {
          saveButton.textContent = '💾 Save';
        }, 2000);
      }
    }
  };

  // Get available models based on provider
  const getAvailableModels = (provider) => {
    switch (provider) {
      case 'anthropic':
        return [
          { value: 'claude-3-7-sonnet-20250219', label: 'Claude 3.7 Sonnet (Latest, Reasoning)'},
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)', recommended: true },
          { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Latest Fast)' },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' }
        ];
      case 'openai':
        return [
          { value: 'o1-preview', label: 'o1-preview (Latest Reasoning)'},
          { value: 'o1-mini', label: 'o1-mini (Fast Reasoning)' },
          { value: 'gpt-4o', label: 'GPT-4o (Latest)' , recommended: true},
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Affordable)' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Latest)', recommended: true },
          { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (Latest, Reasoning)' },
          { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' }
        ];
      default:
        return [];
    }
  };

  // Consistent styling with other pages
  const containerStyle = {
    width: '100vw',
    height: '100vh',
    maxWidth: '500px',
    maxHeight: '600px',
    display: 'flex', 
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#002550FF',
    overflow: 'hidden',
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation'
  };

  const headerStyle = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255, 220, 220, 0.3)',
    background: 'linear-gradient(0deg, #002550FF 0%, #764ba2 100%)',
    flexShrink: 0,
    minHeight: '56px',
    boxSizing: 'border-box'
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
    WebkitOverflowScrolling: 'touch'
  };

  const sectionStyle = {
    padding: '16px',
    borderBottom: '1px solid rgba(255, 220, 220, 0.2)',
    backgroundColor: 'rgba(255, 220, 220, 0.03)',
    backdropFilter: 'blur(5px)',
    margin: '8px 0',
    borderRadius: '8px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontWeight: '600',
    color: '#FFDCDCFF',
    fontSize: '13px'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255, 220, 220, 0.3)',
    fontSize: '14px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: 'rgba(0, 58, 124, 0.8)',
    backdropFilter: 'blur(10px)',
    color: '#FFDCDCFF',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23FFDCDC' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 8px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '32px',
    backdropFilter: 'blur(10px)'
  };

  // const checkboxContainerStyle = {
  //   display: 'flex', 
  //   alignItems: 'flex-start', 
  //   gap: '10px',
  //   padding: '12px',
  //   backgroundColor: '#003A7CFF',
  //   borderRadius: '8px',
  //   marginBottom: '8px',
  //   border: '1px solid rgba(255, 220, 220, 0.2)'
  // };

  const footerStyle = {
    padding: '12px 16px',
    display: 'flex', 
    gap: '8px', 
    borderTop: '1px solid rgba(255, 220, 220, 0.3)',
    background: 'linear-gradient(to top, #00499CFF, #002550FF)',
    flexShrink: 0
  };

  const buttonStyle = {
    flex: 1,
    padding: '10px 16px', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px'
  };

  return (
    <div className="settings-container" style={containerStyle}>
      {/* Background Animation */}
      <div
        className="background-animation"
        style={{
          position: "absolute",
          top: 0,           
          left: 0,          
          right: 0,         
          bottom: 0,        
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <div
          className="settings-orb-1"
          style={{
            position: "absolute",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #FF6B6B, #FF8E8E)",
            filter: "blur(40px)",
            opacity: 0.2,
            top: "10%",
            left: "10%",
            animation: "float 6s ease-in-out infinite",
          }}
        />
        <div
          className="settings-orb-2"
          style={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #4ECDC4, #6EE7DF)",
            filter: "blur(40px)",
            opacity: 0.2,
            top: "60%",
            right: "15%",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        />
        <div
          className="settings-orb-3"
          style={{
            position: "absolute",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #45B7D1, #67C9E1)",
            filter: "blur(40px)",
            opacity: 0.2,
            bottom: "20%",
            left: "20%",
            animation: "float 6s ease-in-out infinite 4s",
          }}
        />
      </div>

      {/* Custom CSS for placeholder styling */}
      <style>
        {`
          .settings-input::placeholder {
            color: rgba(255, 220, 220, 0.6) !important;
            opacity: 1 !important;
          }
          .settings-input::-webkit-input-placeholder {
            color: rgba(255, 220, 220, 0.6) !important;
          }
          .settings-input::-moz-placeholder {
            color: rgba(255, 220, 220, 0.6) !important;
          }
          .settings-input:-ms-input-placeholder {
            color: rgba(255, 220, 220, 0.6) !important;
          }
        `}
      </style>

      {/* Header */}
      <div className="settings-header" style={headerStyle}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 className="settings-title" style={{ 
            margin: 0, 
            color: '#FFDCDCFF', 
            fontSize: '18px', 
            fontWeight: '700',
            lineHeight: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <FaCog />
            SETTINGS
          </h3>
          <p className="settings-subtitle" style={{ 
            margin: 0, 
            color: 'rgba(255, 220, 220, 0.8)', 
            fontSize: '12px',
            lineHeight: '14px',
            marginTop: '2px'
          }}>
            Configure AI models and preferences
          </p>
        </div>
        <button 
          onClick={handleClose} 
          className="settings-button"
          style={{ 
            padding: '6px 8px', 
            backgroundColor: 'rgba(255, 220, 220, 0.2)',
            border: '1px solid rgba(255, 220, 220, 0.3)',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#FFDCDCFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaTimes />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="settings-content" style={contentStyle}>
        {/* AI Provider Section */}
        <div className="settings-provider-section" style={sectionStyle}>
          <h4 style={{ 
            color: '#FFDCDCFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaRobot />
            AI Provider
          </h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>
              Choose Provider:
            </label>
            <select 
              value={localConfig.aiProvider || 'anthropic'}
              onChange={(e) => {
                const newProvider = e.target.value;
                const availableModels = getAvailableModels(newProvider);
                const newConfig = {
                  ...localConfig, 
                  aiProvider: newProvider,
                  navigatorModel: availableModels[0]?.value,
                  plannerModel: availableModels[0]?.value,
                  validatorModel: availableModels[2]?.value || availableModels[1]?.value || availableModels[0]?.value
                };
                setLocalConfig(newConfig);
              }}
              style={selectStyle}
            >
              <option value="anthropic">🔮 Anthropic Claude</option>
              <option value="openai">🚀 OpenAI GPT</option>
              <option value="gemini">💎 Google Gemini</option>
            </select>
          </div>

          {/* API Key Input */}
          {localConfig.aiProvider === 'anthropic' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>
                Anthropic API Key:
              </label>
              <input
                type="password"
                value={localConfig.anthropicApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, anthropicApiKey: e.target.value})}
                placeholder="sk-ant-api03-..."
                style={inputStyle}
                className="settings-input"
              />
            </div>
          )}

          {localConfig.aiProvider === 'openai' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>
                OpenAI API Key:
              </label>
              <input
                type="password"
                value={localConfig.openaiApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, openaiApiKey: e.target.value})}
                placeholder="sk-proj-..."
                style={inputStyle}
                className="settings-input"
              />
            </div>
          )}

          {localConfig.aiProvider === 'gemini' && (
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>
                Gemini API Key:
              </label>
              <input
                type="password"
                value={localConfig.geminiApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, geminiApiKey: e.target.value})}
                placeholder="AIza..."
                style={inputStyle}
                className="settings-input"
              />
              <p style={{ fontSize: '11px', color: 'rgba(255, 220, 220, 0.7)', margin: '4px 0 0 0' }}>
                Get from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Google AI Studio</a>
              </p>
            </div>
          )}
        </div>

        {/* Agent Models Section */}
        <div style={sectionStyle}>
          <h4 style={{ 
            color: '#FFDCDCFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaBrain />
            Agent Models
          </h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>
              <FaClipboardList style={{ marginRight: '6px' }} />
              Planner (strategy):
            </label>
            <select
              value={localConfig.plannerModel || getAvailableModels(localConfig.aiProvider || 'anthropic')[0]?.value}
              onChange={(e) => setLocalConfig({...localConfig, plannerModel: e.target.value})}
              style={selectStyle}
            >
              {getAvailableModels(localConfig.aiProvider || 'anthropic').map(model => (
                <option key={model.value} value={model.value}>
                  {model.label} {model.recommended ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>
              <FaCompass style={{ marginRight: '6px' }} />
              Navigator (actions):
            </label>
            <select
              value={localConfig.navigatorModel || getAvailableModels(localConfig.aiProvider || 'anthropic')[0]?.value}
              onChange={(e) => {
                const newConfig = {...localConfig, navigatorModel: e.target.value};
                if (!localConfig.plannerModel || localConfig.plannerModel === getAvailableModels(localConfig.aiProvider || 'anthropic')[0]?.value) {
                  newConfig.plannerModel = e.target.value;
                }
                setLocalConfig(newConfig);
              }}
              style={selectStyle}
            >
              {getAvailableModels(localConfig.aiProvider || 'anthropic').map(model => (
                <option key={model.value} value={model.value}>
                  {model.label} {model.recommended ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>
              <FaCheckCircle style={{ marginRight: '6px' }} />
              Validator (check):
            </label>
            <select
              value={localConfig.validatorModel || getAvailableModels(localConfig.aiProvider || 'anthropic')[2]?.value}
              onChange={(e) => setLocalConfig({...localConfig, validatorModel: e.target.value})}
              style={selectStyle}
            >
              {getAvailableModels(localConfig.aiProvider || 'anthropic').map(model => (
                <option key={model.value} value={model.value}>
                  {model.label} {model.recommended ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ 
            backgroundColor: '#003A7CFF', 
            border: '1px solid rgba(255, 220, 220, 0.3)',
            borderRadius: '6px', 
            padding: '8px', 
            marginTop: '10px'
          }}>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255, 220, 220, 0.8)' }}>
              💡 Use faster models (Haiku, Mini, Flash) for validation to save costs
            </p>
          </div>
        </div>

        {/* Preferences */}
        {/* <div style={sectionStyle}>
          <h4 style={{ 
            color: '#FFDCDCFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaMobile />
            Preferences
          </h4>
          
          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={localConfig.autoLogin || false}
              onChange={(e) => setLocalConfig({...localConfig, autoLogin: e.target.checked})}
              style={{ width: '16px', height: '16px', margin: '2px 0 0 0' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFDCDCFF', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaLock />
                Auto-login assistance
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 220, 220, 0.7)', textAlign: 'left' }}>
                Help fill login forms
              </div>
            </div>
          </label>

          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={localConfig.safeMode !== false}
              onChange={(e) => setLocalConfig({...localConfig, safeMode: e.target.checked})}
              style={{ width: '16px', height: '16px', margin: '2px 0 0 0' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFDCDCFF', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaShieldAlt />
                Safe mode
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 220, 220, 0.7)', textAlign: 'left' }}>
                Human-like delays
              </div>
            </div>
          </label>

          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={localConfig.debugMode || false}
              onChange={(e) => setLocalConfig({...localConfig, debugMode: e.target.checked})} 
              style={{ width: '16px', height: '16px', margin: '2px 0 0 0' }}
            />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFDCDCFF', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaSearch />
                Debug mode
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255, 220, 220, 0.7)', textAlign: 'left' }}>
                Show highlighted elements
              </div>
            </div>
          </label>
        </div> */}
      </div>

      {/* Fixed Footer */}
      <div style={footerStyle}>
        <button 
          onClick={handleClose}
          style={{ 
            ...buttonStyle,
            backgroundColor: 'rgba(255, 220, 220, 0.2)',
            color: '#FFDCDCFF',
            border: '1px solid rgba(255, 220, 220, 0.3)'
          }}
        >
          <FaTimes />
          Cancel
        </button>
        <button 
          data-save-button
          onClick={handleSave}
          style={{ 
            ...buttonStyle,
            backgroundColor: '#3b82f6', 
            color: 'white'
          }}
        >
          <FaSave />
          Save
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
