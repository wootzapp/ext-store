import React from 'react';
import { FaInfinity, FaClock, FaExclamationTriangle, FaKey } from 'react-icons/fa';

const RequestCounter = ({ subscriptionState, onUpgradeClick }) => {
  if (subscriptionState.loading) {
    return (
      <div style={{
        fontSize: '12px',
        color: '#657786',
        display: 'flex',
        alignItems: 'center',
        gap: '4px', 
        marginLeft: '8px'
      }}>
        <FaClock />
        Loading...
      </div>
    );
  }

  const { text, color } = subscriptionState.getStatusDisplay();

  const getIcon = () => {
    if (subscriptionState.usingPersonalAPI) return <FaKey />;
    if (subscriptionState.remaining_requests === -1) return <FaInfinity />;
    if (subscriptionState.remaining_requests <= 0) return <FaExclamationTriangle />;
    if (subscriptionState.remaining_requests <= 2) return <FaExclamationTriangle />;
    return <FaClock />;
  };

  const handleClick = () => {
    if (subscriptionState.remaining_requests <= 0 && !subscriptionState.usingPersonalAPI) {
      onUpgradeClick?.();
    }
  };

  const getTooltipText = () => {
    if (subscriptionState.usingPersonalAPI) {
      return subscriptionState.userPreferPersonalAPI 
        ? 'Using your personal API key (user preference)'
        : 'Using your personal API key (auto-switched - trial expired)';
    }
    
    if (subscriptionState.remaining_requests <= 0) {
      return subscriptionState.hasPersonalKeys 
        ? 'Trial expired - Click to upgrade or switch to personal API'
        : 'Click to upgrade or add API keys';
    }
    
    return `${subscriptionState.requests_used} requests used`;
  };

  return (
    <div 
      style={{
        fontSize: '11px',
        color: color,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        cursor: subscriptionState.remaining_requests <= 0 && !subscriptionState.usingPersonalAPI ? 'pointer' : 'default',
        padding: '2px 4px',
        borderRadius: '4px',
        backgroundColor: subscriptionState.remaining_requests <= 0 && !subscriptionState.usingPersonalAPI 
          ? 'rgba(224, 36, 94, 0.1)' 
          : 'transparent'
      }}
      onClick={handleClick}
      title={getTooltipText()}
    >
      {getIcon()}
      <span>{text}</span>
      {subscriptionState.remaining_requests <= 0 && !subscriptionState.usingPersonalAPI && (
        <span style={{ marginLeft: '4px' }}>⚡</span>
      )}
    </div>
  );
};

export default RequestCounter; 