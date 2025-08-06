import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaArrowLeft, 
  FaEnvelope, 
  FaCrown, 
  FaCalendarAlt, 
  FaChartBar,
  FaSignOutAlt,
  FaKey,
  FaInfinity,
  FaClock,
  FaStar,
  FaCog,
  FaToggleOn,
  FaToggleOff
} from 'react-icons/fa';

const ProfilePage = ({ user, subscription, onLogout }) => {
  const navigate = useNavigate();
  const [isToggling, setIsToggling] = useState(false);
  
  // Refresh subscription data when component gains focus (returning from settings)
  useEffect(() => {
    const handleFocus = () => {
      if (subscription.loadSubscriptionData) {
        subscription.loadSubscriptionData();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [subscription]);

  const handleBack = () => {
    navigate('/chat');
  };

  const handleTogglePersonalAPI = async () => {
    if (isToggling) return;
    
    setIsToggling(true);
    
    try {
      const newPreference = !subscription.userPreferPersonalAPI;
      
      // If turning ON and no API keys, redirect to settings
      if (newPreference && !subscription.hasPersonalKeys) {
        navigate('/settings');
        setIsToggling(false);
        return;
      }
      
      // Set the preference
      const success = await subscription.setUserAPIPreference(newPreference);
      
      if (success) {
        console.log(`API preference set to: ${newPreference ? 'Personal API' : 'Free Trial'}`);
      }
    } catch (error) {
      console.error('Error toggling API preference:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSubscriptionStatus = () => {
    if (subscription.loading) {
      return { text: 'Loading...', color: '#657786', icon: <FaClock /> };
    }

    if (subscription.usingPersonalAPI) {
      return { 
        text: `Personal API`, 
        color: '#17bf63',
        icon: <FaKey />
      };
    }

    if (subscription.status === 'trial') {
      return { 
        text: 'Free Trial', 
        color: '#ffad1f',
        icon: <FaStar />
      };
    }

    if (subscription.status === 'active') {
      return { 
        text: 'Premium Subscription', 
        color: '#17bf63',
        icon: <FaCrown />
      };
    }

    return { 
      text: 'Trial Expired', 
      color: '#e0245e',
      icon: <FaClock />
    };
  };

  const status = getSubscriptionStatus();

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
    padding: '16px',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none'
  };

  const sectionStyle = {
    marginBottom: '24px'
  };

  const cardStyle = {
    backgroundColor: 'rgba(255, 220, 220, 0.08)',
    border: '1px solid rgba(255, 220, 220, 0.2)',
    borderRadius: '12px',
    padding: '16px'
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  return (
    <div className="profile-container" style={containerStyle}>
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-orb profile-orb-1"></div>
        <div className="floating-orb profile-orb-2"></div>
        <div className="floating-orb profile-orb-3"></div>
      </div>

      {/* Header */}
      <div className="profile-header" style={headerStyle}>
        <button 
          onClick={handleBack}
          className="profile-back-button"
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
          title="Back"
        >
          <FaArrowLeft />
        </button>
        
        <div style={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
          <h3 className="profile-title" style={{ 
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
            <FaUser />
            PROFILE
          </h3>
          <p className="profile-subtitle" style={{ 
            margin: 0, 
            color: 'rgba(255, 220, 220, 0.8)', 
            fontSize: '12px',
            lineHeight: '14px',
            marginTop: '2px'
          }}>
            Account details and usage
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/settings')}
          className="profile-button"
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
          title="Settings"
        >
          <FaCog />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="profile-content" style={contentStyle}>
        {/* User Info */}
        <div className="profile-user-info" style={sectionStyle}>
          <h4 style={{ 
            color: '#FFDCDCFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaUser />
            Account Information
          </h4>

          <div style={cardStyle}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div className="profile-avatar" style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#764ba2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                color: 'white',
                fontWeight: '600'
              }}>
                {user?.full_name?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="profile-user-details" style={{ flex: 1 }}>
                <div className="profile-user-name" style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FFDCDCFF',
                  marginBottom: '2px',
                  textAlign: 'left'
                }}>
                  {user?.full_name || 'User'}
                </div>
                <div className="profile-user-email" style={{ 
                  fontSize: '13px', 
                  color: 'rgba(255, 220, 220, 0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '2px'
                }}>
                  <FaEnvelope style={{ fontSize: '11px' }} />
                  {user?.email}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 220, 220, 0.7)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  @{user?.username}
                </div>
              </div>
            </div>

            <div className="profile-join-date" style={{ 
              fontSize: '12px', 
              color: 'rgba(255, 220, 220, 0.7)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 220, 220, 0.2)'
            }}>
              <FaCalendarAlt />
              Member since {formatDate(user?.created_at)}
            </div>
          </div>
        </div>

        {/* API Key Toggle Section */}
        <div style={sectionStyle}>
          <h4 style={{ 
            color: '#FFDCDCFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaKey />
            API Configuration
          </h4>

          <div style={cardStyle}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#FFDCDCFF',
                  marginBottom: '4px'
                }}>
                  Use Personal API Key
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 220, 220, 0.8)',
                  lineHeight: '1.4'
                }}>
                  Turn on to use your own API key for unlimited usage
                </div>
              </div>
              <button
                onClick={handleTogglePersonalAPI}
                disabled={isToggling}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: isToggling ? 'wait' : 'pointer',
                  fontSize: '24px',
                  color: subscription.userPreferPersonalAPI && subscription.hasPersonalKeys 
                    ? '#17bf63' 
                    : '#657786',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  opacity: isToggling ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
                title={
                  subscription.userPreferPersonalAPI && subscription.hasPersonalKeys
                    ? 'Click to use free trial API'
                    : !subscription.hasPersonalKeys
                      ? 'Configure API keys in settings first'
                      : 'Click to use personal API key'
                }
              >
                {subscription.userPreferPersonalAPI && subscription.hasPersonalKeys 
                  ? <FaToggleOn /> 
                  : <FaToggleOff />}
              </button>
            </div>
            
            {/* Status indicator */}
            <div style={{ 
              marginTop: '12px',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: subscription.usingPersonalAPI 
                ? 'rgba(23, 191, 99, 0.1)' 
                : subscription.remaining_requests <= 0 
                  ? 'rgba(224, 36, 94, 0.1)'
                  : 'rgba(255, 173, 31, 0.1)',
              border: subscription.usingPersonalAPI 
                ? '1px solid rgba(23, 191, 99, 0.3)' 
                : subscription.remaining_requests <= 0 
                  ? '1px solid rgba(224, 36, 94, 0.3)'
                  : '1px solid rgba(255, 173, 31, 0.3)',
              fontSize: '12px',
              color: subscription.usingPersonalAPI 
                ? '#17bf63' 
                : subscription.remaining_requests <= 0 
                  ? '#e0245e'
                  : '#ffad1f'
            }}>
              {subscription.usingPersonalAPI 
                ? '✅ Currently using your personal API key'
                : subscription.hasPersonalKeys 
                  ? '🔄 Currently using free trial API'
                  : '⚠️ Configure API keys in settings to enable personal API'}
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div style={sectionStyle}>
          <h4 style={{ 
            color: '#FFDCDCFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaCrown />
            Subscription Status
          </h4>

          <div style={cardStyle}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ color: status.color, fontSize: '20px' }}>
                {status.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FFDCDCFF',
                  marginBottom: '2px'
                }}>
                  {status.text}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 220, 220, 0.8)'
                }}>
                  {subscription.usingPersonalAPI 
                    ? 'Unlimited usage with your API key'
                    : subscription.plan_type === 'free_trial' 
                      ? `Trial expires ${formatDate(subscription.trial_end)}`
                      : subscription.current_period_end
                        ? `Next billing ${formatDate(subscription.current_period_end)}`
                        : 'Active subscription'
                  }
                </div>
              </div>
            </div>

            {!subscription.usingPersonalAPI && (
              <button
                onClick={() => navigate('/subscription')}
                style={{
                  ...buttonStyle,
                  backgroundColor: subscription.remaining_requests <= 0 ? '#e0245e' : '#3b82f6',
                  color: 'white'
                }}
              >
                <FaChartBar />
                {subscription.remaining_requests <= 0 ? 'Upgrade Plan' : 'Manage Subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Usage Stats */}
        <div style={sectionStyle}>
          <h4 style={{ 
            color: '#FFDCDCFF', 
            fontSize: '16px', 
            fontWeight: '600', 
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaChartBar />
            Usage Statistics
          </h4>

          <div style={cardStyle}>
            {subscription.usingPersonalAPI ? (
              <div style={{
                textAlign: 'center',
                padding: '20px',
                color: '#17bf63'
              }}>
                <FaInfinity style={{ fontSize: '32px', marginBottom: '8px' }} />
                <div style={{ fontSize: '16px', fontWeight: '600' }}>Unlimited Usage</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 220, 220, 0.8)' }}>
                  Using your personal API key
                </div>
              </div>
            ) : (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#FFDCDCFF' }}>
                    Requests Used
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: subscription.remaining_requests <= 0 ? '#e0245e' : '#FFDCDCFF'
                  }}>
                    {subscription.requests_used} / {subscription.monthly_request_limit}
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 220, 220, 0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min((subscription.requests_used / subscription.monthly_request_limit) * 100, 100)}%`,
                    height: '100%',
                    backgroundColor: subscription.remaining_requests <= 0 ? '#e0245e' : 
                                   subscription.remaining_requests <= 2 ? '#ffad1f' : '#17bf63',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 220, 220, 0.8)',
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  {subscription.remaining_requests > 0 
                    ? `${subscription.remaining_requests} requests remaining`
                    : 'Trial expired - upgrade or use personal API'
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout Button */}
        <div style={sectionStyle}>
          <button
            onClick={onLogout}
            style={{
              ...buttonStyle,
              backgroundColor: '#e0245e',
              color: 'white'
            }}
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 