// src/popup/index.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import { MESSAGE_ACTIONS, MESSAGE_SOURCES, PROVIDERS } from '../utils/constants';

const PopupApp = () => {
    const [statusMessage, setStatusMessage] = useState('Select a provider to start verification.');
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    // Backend URL for generating configuration
    const BACKEND_GENERATE_CONFIG_URL = "https://43ed303a36ab.ngrok-free.app/generate-config";

    const sendMessageToBackground = async (actionType, payload = {}) => {
        try {
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage({
                    action: actionType,
                    source: MESSAGE_SOURCES.POPUP,
                    target: MESSAGE_SOURCES.BACKGROUND,
                    data: payload
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        reject(new Error(chrome.runtime.lastError.message));
                    } else {
                        resolve(response);
                    }
                });
            });
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const handleProviderSelect = (providerKey) => {
        setSelectedProvider(providerKey);
        setDropdownOpen(false);
        setStatusMessage(`Selected ${PROVIDERS[providerKey].name}. Click "Start Verification" to begin.`);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleClickOutside = (event) => {
        if (!event.target.closest('.dropdown-container')) {
            setDropdownOpen(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        if (dropdownOpen) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [dropdownOpen]);

    const handlePerformAction = async () => {
        if (!selectedProvider) {
            setStatusMessage('Please select a provider first.');
            return;
        }

        setLoading(true);
        setStatusMessage('Fetching verification configuration...');

        try {
            const response = await fetch(BACKEND_GENERATE_CONFIG_URL, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true',
                    'Origin': 'chrome-extension://' + chrome.runtime.id,
                    'ngrok-skip-browser-warning': 'true'
                },
                mode: 'cors'
            });

            if (!response.ok) {
                const responseText = await response.text();
                
                if (responseText.includes('<!DOCTYPE html>') && responseText.includes('ngrok')) {
                    throw new Error('Network error: cannot reach backend. Ensure your backend server is running and its ngrok tunnel is active. Check if it\'s down.');
                    } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'Failed to generate configuration');
            }

            setStatusMessage('Starting verification process...');

            // Send the configuration to background script
            const result = await sendMessageToBackground(MESSAGE_ACTIONS.START_VERIFICATION, {
                reclaimProofRequestConfig: data.config,
                sessionId: data.sessionId,
                providerName: PROVIDERS[selectedProvider].name,
                providerLoginUrl: PROVIDERS[selectedProvider].loginUrl
            });

            if (result && result.success) {
                setStatusMessage('Verification started! Check the new tab.');
            } else {
                setStatusMessage(result?.error || 'Failed to start verification.');
            }

        } catch (error) {
            setStatusMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleResetSession = async () => {
        setResetting(true);
        setStatusMessage('Resetting session state...');
        
        try {
            const response = await sendMessageToBackground(
                MESSAGE_ACTIONS.RESET_SESSION,
                {}
            );

            if (response.success) {
                setStatusMessage('Session reset successfully. You can now start a new verification.');
            } else {
                setStatusMessage(`Reset failed: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            setStatusMessage(`Reset error: ${error.message}`);
        } finally {
            setResetting(false);
        }
    };

    useEffect(() => {
        const messageListener = (message, sender, sendResponse) => {
            const isTargetedForPopup = message.target === MESSAGE_SOURCES.POPUP;

            switch (message.action) {
                case MESSAGE_ACTIONS.VERIFICATION_STATUS:
                    if (isTargetedForPopup || !message.target) {
                        setStatusMessage(message.data.message);
                    }
                    break;
                case MESSAGE_ACTIONS.VERIFICATION_COMPLETE:
                    if (isTargetedForPopup || !message.target) {
                        // Check if we have a view URL for the proof
                        if (message.data.viewUrl) {
                            setStatusMessage(`Verification completed successfully! Click here to view proof: ${message.data.viewUrl}`);
                        } else {
                            setStatusMessage('Verification completed successfully!');
                        }
                        setLoading(false);
                    }
                    break;
                case MESSAGE_ACTIONS.VERIFICATION_ERROR:
                    if (isTargetedForPopup || !message.target) {
                        setStatusMessage(`Verification failed: ${message.data.error}`);
                        setLoading(false);
                    }
                    break;
                default:
                    // Unhandled message action
                    break;
            }

            sendResponse({ success: true, message: "Popup received message." });
            return true;
        };

        chrome.runtime.onMessage.addListener(messageListener);

        return () => {
            chrome.runtime.onMessage.removeListener(messageListener);
        };
    }, []);

    // Extract view URL from status message if it exists
    const viewUrlMatch = statusMessage.match(/https:\/\/[^\s]+/);
    const viewUrl = viewUrlMatch ? viewUrlMatch[0] : null;

    return (
        <div className="fade-in">
            {/* Header */}
            <div className="popup-header">
                <img className="popup-logo" src={chrome.runtime.getURL('assets/img/logo.png')} alt="Reclaim Protocol" />
                <h1 className="popup-title">Reclaim Protocol</h1>
            </div>

            {/* Content */}
            <div className="popup-content">
                {/* Provider Selection */}
                <div className="provider-selection">
                    <h3>Select Provider:</h3>
                    <div className="dropdown-container">
                        <button
                            onClick={toggleDropdown}
                            disabled={loading || resetting}
                            className={`dropdown-button ${selectedProvider ? 'selected' : ''} ${dropdownOpen ? 'open' : ''}`}
                        >
                            <div className="dropdown-content">
                                {selectedProvider ? (
                                    <>
                                        <span className="provider-icon">{PROVIDERS[selectedProvider].icon}</span>
                                        <div className="provider-info">
                                            <div className="provider-name">{PROVIDERS[selectedProvider].name}</div>
                                            <div className="provider-description">{PROVIDERS[selectedProvider].description}</div>
                                        </div>
                                    </>
                                ) : (
                                    <span className="placeholder-text">Choose a provider...</span>
                                )}
                            </div>
                            <svg className="dropdown-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                        
                        <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
                            {Object.entries(PROVIDERS).map(([key, provider]) => (
                                <div
                                    key={key}
                                    onClick={() => handleProviderSelect(key)}
                                    className={`dropdown-item ${selectedProvider === key ? 'selected' : ''}`}
                                >
                                    <span className="provider-icon">{provider.icon}</span>
                                    <div className="provider-info">
                                        <div className="provider-name">{provider.name}</div>
                                        <div className="provider-description">{provider.description}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status Message */}
                <div className="status-message">
                {viewUrl ? (
                    <>
                        Verification completed successfully!{' '}
                        <a 
                            href={viewUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            Click here to view proof details
                        </a>
                    </>
                ) : (
                    statusMessage
                )}
                </div>
                
                {/* Backend Info */}
                <div className="backend-info">
                Backend: {BACKEND_GENERATE_CONFIG_URL}
            </div>
                
                {/* Action Buttons */}
                <div className="action-buttons">
            <button
                onClick={handlePerformAction}
                        disabled={loading || resetting || !selectedProvider}
                        className="primary-button"
            >
                {loading ? 'Starting...' : 'Start Reclaim Verification'}
            </button>
                    
                    <button
                        onClick={handleResetSession}
                        disabled={loading || resetting}
                        className="secondary-button"
                    >
                        {resetting ? 'Resetting...' : 'Reset Session'}
                    </button>
                </div>
            
            {/* Debug section */}
                <div className="debug-section">
                <details>
                    <summary>Debug Info</summary>
                    <div>Extension ID: {chrome.runtime.id}</div>
                    <div>Timestamp: {new Date().toISOString()}</div>
                        {selectedProvider && (
                            <div>Selected Provider: {PROVIDERS[selectedProvider].name}</div>
                        )}
                    {viewUrl && (
                        <div>
                            <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                                View All Proofs
                            </a>
                        </div>
                    )}
                </details>
                </div>
            </div>
        </div>
    );
};

const appRootElement = document.getElementById('app-root');
if (appRootElement) {
    const root = ReactDOM.createRoot(appRootElement);
    root.render(
        <React.StrictMode>
            <PopupApp />
        </React.StrictMode>
    );
} else {
    console.error('Root element #app-root not found in popup HTML!');
}