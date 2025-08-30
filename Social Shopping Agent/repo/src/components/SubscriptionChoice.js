import React from 'react';
import { FaStar, FaKey, FaTimes } from 'react-icons/fa';

const SubscriptionChoice = ({ onSubscribe, onUseAPI, onClose, onRefreshSubscription, user }) => {
  const containerStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const modalStyle = {
    backgroundColor: '#002550FF',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto'
  };

  const buttonStyle = {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s'
  };

  const handleUseAPI = () => {
    onUseAPI();
    setTimeout(() => {
      onRefreshSubscription?.();
    }, 1000);
  };

  return (
    <div className="subscription-choice-overlay" style={containerStyle} onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="subscription-choice-modal" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Background Animation */}
        <div className="background-animation">
          <div className="floating-orb choice-orb-1"></div>
          <div className="floating-orb choice-orb-2"></div>
        </div>

        <div className="choice-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="choice-title" style={{ color: '#FFDCDCFF', margin: 0, fontSize: '20px' }}>
            Choose Your Path
          </h3>
          <button onClick={onClose} className="choice-close-button" style={{ 
            background: 'none', 
            border: 'none', 
            color: '#FFDCDCFF', 
            fontSize: '20px', 
            cursor: 'pointer' 
          }}>
            <FaTimes />
          </button>
        </div>

        <div className="choice-content">
          <p className="choice-subtitle" style={{ color: 'rgba(255, 220, 220, 0.8)', marginBottom: '16px', textAlign: 'center' }}>
            Your request quota has been exhausted. Choose how you'd like to continue:
          </p>
          <p className="choice-description" style={{ color: 'rgba(255, 220, 220, 0.6)', marginBottom: '24px', textAlign: 'center', fontSize: '14px' }}>
            Get more requests with a subscription or use your own API keys for unlimited usage.
          </p>

          <div className="choice-options">
            <button
              onClick={onSubscribe}
              className="choice-option choice-button choice-primary-button"
              style={{
                ...buttonStyle,
                backgroundColor: '#3b82f6',
                color: 'white'
              }}
            >
              <FaStar />
              Subscribe for More Quotas
            </button>

            <button
              onClick={handleUseAPI}
              className="choice-option choice-button choice-secondary-button"
              style={{
                ...buttonStyle,
                backgroundColor: 'transparent',
                color: '#FFDCDCFF',
                border: '1px solid rgba(255, 220, 220, 0.3)'
              }}
            >
              <FaKey />
              Use Your Own API Keys (Unlimited)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionChoice; 