import React, { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';

const SettingsModal = ({ onClose }) => {
  const { config, updateConfig } = useConfig();
  const [localConfig, setLocalConfig] = useState(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    overflow: 'auto'
  };

  const contentStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    height: '100%',
    maxWidth: '500px',
    maxHeight: '90%',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    margin: '20px'
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <h3 style={{ margin: 0, color: '#1da1f2' }}>Settings</h3>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'none', 
              border: 'none', 
              fontSize: '24px', 
              cursor: 'pointer',
              color: '#657786'
            }}
          >
            ✕
          </button>
        </div>

        {/* AI Configuration */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#14171a', marginBottom: '16px' }}>AI Configuration</h4>
          
          <div style={{ marginBottom: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#14171a'
            }}>
              AI Provider:
            </label>
            <select 
              value={localConfig.aiProvider || 'anthropic'}
              onChange={(e) => setLocalConfig({...localConfig, aiProvider: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '8px', 
                border: '1px solid #e1e8ed',
                fontSize: '14px'
              }}
            >
              <option value="anthropic">Anthropic Claude</option>
              <option value="openai">OpenAI GPT</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          {localConfig.aiProvider === 'anthropic' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: 'bold',
                color: '#14171a'
              }}>
                Anthropic API Key:
              </label>
              <input
                type="password"
                value={localConfig.anthropicApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, anthropicApiKey: e.target.value})}
                placeholder="sk-ant-..."
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid #e1e8ed',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {localConfig.aiProvider === 'openai' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: 'bold',
                color: '#14171a'
              }}>
                OpenAI API Key:
              </label>
              <input
                type="password"
                value={localConfig.openaiApiKey || ''}
                onChange={(e) => setLocalConfig({...localConfig, openaiApiKey: e.target.value})}
                placeholder="sk-..."
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  borderRadius: '8px', 
                  border: '1px solid #e1e8ed',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
        </div>

        {/* Agent Models */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#14171a', marginBottom: '16px' }}>Agent Models</h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#14171a',
              fontSize: '13px'
            }}>
              Navigator Model (performs actions):
            </label>
            <input
              type="text"
              value={localConfig.navigatorModel || 'claude-3-sonnet-20240229'}
              onChange={(e) => setLocalConfig({...localConfig, navigatorModel: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '6px', 
                border: '1px solid #e1e8ed',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#14171a',
              fontSize: '13px'
            }}>
              Planner Model (creates strategies):
            </label>
            <input
              type="text"
              value={localConfig.plannerModel || 'claude-3-sonnet-20240229'}
              onChange={(e) => setLocalConfig({...localConfig, plannerModel: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '6px', 
                border: '1px solid #e1e8ed',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '6px', 
              fontWeight: 'bold',
              color: '#14171a',
              fontSize: '13px'
            }}>
              Validator Model (checks results):
            </label>
            <input
              type="text"
              value={localConfig.validatorModel || 'claude-3-sonnet-20240229'}
              onChange={(e) => setLocalConfig({...localConfig, validatorModel: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '8px', 
                borderRadius: '6px', 
                border: '1px solid #e1e8ed',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* Social Media Settings */}
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#14171a', marginBottom: '16px' }}>Social Media Settings</h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={localConfig.autoLogin || false}
                onChange={(e) => setLocalConfig({...localConfig, autoLogin: e.target.checked})}
              />
              <span style={{ fontSize: '14px' }}>Enable automatic login assistance</span>
            </label>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={localConfig.safeMode !== false}
                onChange={(e) => setLocalConfig({...localConfig, safeMode: e.target.checked})}
              />
              <span style={{ fontSize: '14px' }}>Safe mode (human-like delays)</span>
            </label>
          </div>
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          position: 'sticky',
          bottom: 0,
          backgroundColor: 'white',
          paddingTop: '16px',
          borderTop: '1px solid #e1e8ed',
          marginTop: '24px'
        }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '10px 20px', 
              border: '1px solid #e1e8ed', 
              borderRadius: '8px', 
              cursor: 'pointer',
              backgroundColor: '#ffffff',
              color: '#14171a'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#1da1f2', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
