import React, { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';

const SettingsModal = ({ onClose }) => {
  const { config, updateConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

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
      
      // Show success briefly
      if (saveButton) {
        saveButton.textContent = '✅ Saved!';
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        onClose();
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
          { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Latest)', recommended: true },
          { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
          { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Capable)' }
        ];
      case 'openai':
        return [
          { value: 'gpt-4o', label: 'GPT-4o (Latest)', recommended: true },
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Affordable)' }
        ];
      case 'gemini':
        return [
          { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Latest)', recommended: true },
          { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
          { value: 'gemini-pro', label: 'Gemini Pro' }
        ];
      default:
        return [];
    }
  };

  // Full page styles - exactly matching ChatInterface
  const containerStyle = {
    width: '100vw',
    height: '100vh',
    maxWidth: '400px',
    maxHeight: '600px',
    display: 'flex', 
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#F0F0F0FF',
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation'
  };

  const headerStyle = {
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '8px 12px',
    borderBottom: '1px solid #8A8A8AFF',
    background: 'linear-gradient(to bottom, #B1B1B1FF, #CECECEFF)',
    flexShrink: 0,
    height: '48px',
    boxSizing: 'border-box'
  };

  const contentStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: '0',
    WebkitOverflowScrolling: 'touch'
  };

  const sectionStyle = {
    padding: '12px',
    borderBottom: '1px solid #8A8A8AFF'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '600',
    color: '#000000FF',
    fontSize: '12px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #BEBEBEFF',
    fontSize: '13px',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: '#FDFDFDFF',
    userSelect: 'text',
    WebkitUserSelect: 'text'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")',
    backgroundPosition: 'right 6px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '14px',
    paddingRight: '28px'
  };

  const checkboxContainerStyle = {
    display: 'flex', 
    alignItems: 'flex-start', 
    gap: '8px',
    padding: '8px',
    backgroundColor: '#f7f9fa',
    borderRadius: '6px',
    marginBottom: '6px'
  };

  const footerStyle = {
    padding: '8px 12px',
    display: 'flex', 
    gap: '6px', 
    borderTop: '1px solid #8A8A8AFF',
    background: 'linear-gradient(to top, #B1B1B1FF, #EBEBEBFF)',
    flexShrink: 0
  };

  const buttonStyle = {
    flex: 1,
    padding: '8px 14px', 
    borderRadius: '6px', 
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      {/* Header - matching ChatInterface */}
      <div style={headerStyle}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3 style={{ 
            margin: 0, 
            color: '#00559BFF', 
            fontSize: '16px', 
            fontWeight: '700',
            lineHeight: '20px'
          }}>
            ⚙️ SETTINGS
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#000000FF', 
            fontSize: '12px',
            lineHeight: '12px',
            marginTop: '1px', 
            marginLeft: '10px'
          }}>
            Configure AI models
          </p>
        </div>
        <button 
          onClick={onClose} 
          style={{ 
            padding: '4px 2px', 
              backgroundColor: '#F0F0F0FF',
              border: '1px solid #6B6B6BFF',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: '18px',
          }}
        >
          ❌
        </button>
      </div>

      {/* Scrollable Content */}
      <div style={contentStyle}>
        {/* AI Provider Section */}
        <div style={sectionStyle}>
          <h4 style={{ 
            color: '#000000FF', 
            fontSize: '14px', 
            fontWeight: '600', 
            margin: '0 0 8px 0' 
          }}>
            🤖 AI Provider
          </h4>
          
          <div style={{ marginBottom: '10px' }}>
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
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>
                Anthropic API Key:
              </label>
              <input
                type="password"
                value={localConfig.anthropicApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, anthropicApiKey: e.target.value})}
                placeholder="sk-ant-api03-..."
                style={inputStyle}
              />
            </div>
          )}

          {localConfig.aiProvider === 'openai' && (
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>
                OpenAI API Key:
              </label>
              <input
                type="password"
                value={localConfig.openaiApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, openaiApiKey: e.target.value})}
                placeholder="sk-proj-..."
                style={inputStyle}
              />
            </div>
          )}

          {localConfig.aiProvider === 'gemini' && (
            <div style={{ marginBottom: '10px' }}>
              <label style={labelStyle}>
                Gemini API Key:
              </label>
              <input
                type="password"
                value={localConfig.geminiApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, geminiApiKey: e.target.value})}
                placeholder="AIza..."
                style={inputStyle}
              />
              <p style={{ fontSize: '10px', color: '#657786', margin: '3px 0 0 0' }}>
                Get from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#1da1f2' }}>Google AI Studio</a>
              </p>
            </div>
          )}
        </div>

        {/* Agent Models Section */}
        <div style={sectionStyle}>
          <h4 style={{ 
            color: '#14171a', 
            fontSize: '14px', 
            fontWeight: '600', 
            margin: '0 0 8px 0' 
          }}>
            🧠 Agent Models
          </h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>
              🧭 Navigator (actions):
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

          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>
              📋 Planner (strategy):
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

          <div style={{ marginBottom: '10px' }}>
            <label style={labelStyle}>
              ✅ Validator (check):
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
            backgroundColor: '#e6f3ff', 
            border: '1px solid #b3d9ff',
            borderRadius: '4px', 
            padding: '6px', 
            marginTop: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '10px', color: '#0066cc' }}>
              💡 Use faster models (Haiku, Mini, Flash) for validation to save costs
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div style={sectionStyle}>
          <h4 style={{ 
            color: '#14171a', 
            fontSize: '14px', 
            fontWeight: '600', 
            margin: '0 0 8px 0' 
          }}>
            📱 Preferences
          </h4>
          
          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={localConfig.autoLogin || false}
              onChange={(e) => setLocalConfig({...localConfig, autoLogin: e.target.checked})}
              style={{ width: '14px', height: '14px', margin: '1px 0 0 0' }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#000000FF', textAlign: 'left' }}>
                🔐 Auto-login assistance
              </div>
              <div style={{ fontSize: '10px', color: '#657786', textAlign: 'left' }}>
                Help fill login forms
              </div>
            </div>
          </label>

          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={localConfig.safeMode !== false}
              onChange={(e) => setLocalConfig({...localConfig, safeMode: e.target.checked})}
              style={{ width: '14px', height: '14px', margin: '1px 0 0 0' }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#000000FF', textAlign: 'left' }}>
                🛡️ Safe mode
              </div>
              <div style={{ fontSize: '10px', color: '#657786', textAlign: 'left' }}>
                Human-like delays
              </div>
            </div>
          </label>

          <label style={checkboxContainerStyle}>
            <input
              type="checkbox"
              checked={localConfig.debugMode || false}
              onChange={(e) => setLocalConfig({...localConfig, debugMode: e.target.checked})} 
              style={{ width: '14px', height: '14px', margin: '1px 0 0 0' }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#000000FF', textAlign: 'left' }}>
                🔍 Debug mode
              </div>
              <div style={{ fontSize: '10px', color: '#657786', textAlign: 'left' }}>
                Show highlighted elements
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Fixed Footer */}
      <div style={footerStyle}>
        <button 
          onClick={onClose}
          style={{ 
            ...buttonStyle,
            backgroundColor: '#ffffff',
            color: '#14171a',
            border: '1px solid #e1e8ed'
          }}
        >
          Cancel
        </button>
        <button 
          data-save-button
          onClick={handleSave}
          style={{ 
            ...buttonStyle,
            backgroundColor: '#1da1f2', 
            color: 'white'
          }}
        >
          💾 Save
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
