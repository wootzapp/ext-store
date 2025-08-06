import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IntegrationHub.css';

const IntegrationHub = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSocialAgentClick = () => {
    // Navigate to existing social shopping agent flow
    navigate('/auth');
  };

  const handleLabubuClick = () => {
    // Navigate to Labubu autobuy flow - use the actual Labubu popup
    navigate('/labubu');
  };

  return (
    <div className={`integration-hub ${mounted ? 'mounted' : ''}`}>
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="floating-orb orb-4"></div>
      </div>

      {/* Main Content */}
      <div className="hub-container">
        {/* Header */}
        <div className="hub-header">
          <div className="logo-container">            <div className="main-logo">
              <span className="logo-icon">🤖</span>
            </div>
          </div>
          <h1 className="hub-title">
            <span className="title-gradient">AI Shopping</span>
            <span className="title-white">Hub</span>
          </h1>
          <p className="hub-subtitle">Choose your shopping experience</p>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          {/* Social Shopping Agent Button */}
          <button 
            className="neon-button social-agent-btn"
            onClick={handleSocialAgentClick}
          >
            <div className="button-content">
              <div className="button-icon">
                <span>🛒</span>
              </div>
              <div className="button-text">
                <h3>Social Shopping Agent</h3>
                <p>AI-powered shopping assistant with intelligent recommendations</p>
              </div>
              <div className="button-arrow">→</div>
            </div>
          </button>

          {/* Labubu Autobuy Button */}
          <button 
            className="neon-button labubu-btn"
            onClick={handleLabubuClick}
          >
            <div className="button-content">
              <div className="button-icon">
                <span>🎀</span>
              </div>
              <div className="button-text">
                <h3>Labubu Autobuy</h3>
                <p>Automated purchasing for Popmart collectibles and rare finds</p>
              </div>
              <div className="button-arrow">→</div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="hub-footer">
          <div className="feature-badges">
            <span className="badge">Agent</span>
            <span className="badge">AI Powered</span>
            <span className="badge">Fast</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationHub;