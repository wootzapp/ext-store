import React from 'react';
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
  FaCog
} from 'react-icons/fa';

const ProfilePage = ({ user, subscription, onLogout }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/chat');
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
    padding: '0',
    WebkitOverflowScrolling: 'touch'
  };

  const sectionStyle = {
    padding: '16px',
    borderBottom: '1px solid rgba(255, 220, 220, 0.2)'
  };

  const cardStyle = {
    backgroundColor: '#003A7CFF',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '16px',
    border: '1px solid rgba(255, 220, 220, 0.2)'
  };

  const buttonStyle = {
    width: '100%',
    padding: '12px 16px', 
    borderRadius: '8px', 
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    textAlign: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '12px'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button 
          onClick={handleBack}
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
          <h3 style={{ 
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
          <p style={{ 
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
      <div style={contentStyle}>
        {/* User Info */}
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
              <div style={{
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
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FFDCDCFF',
                  marginBottom: '2px',
                  textAlign: 'left'
                }}>
                  {user?.full_name || 'User'}
                </div>
                <div style={{ 
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

            <div style={{ 
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
                  color: 'white',
                  marginBottom: 0
                }}
              >
                {subscription.remaining_requests <= 0 ? 'Upgrade Now' : 'Manage Subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Usage Statistics */}
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
            {subscription.loading ? (
              <div style={{ 
                textAlign: 'center', 
                color: 'rgba(255, 220, 220, 0.8)',
                padding: '20px'
              }}>
                Loading usage data...
              </div>
            ) : subscription.usingPersonalAPI ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <FaInfinity style={{ 
                  fontSize: '32px', 
                  color: '#17bf63',
                  marginBottom: '8px'
                }} />
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#FFDCDCFF',
                  marginBottom: '4px'
                }}>
                  Unlimited Usage
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 220, 220, 0.8)'
                }}>
                  Using your personal API key
                </div>
              </div>
            ) : (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px'
                }}>
                  <span style={{ 
                    fontSize: '14px', 
                    color: 'rgba(255, 220, 220, 0.8)'
                  }}>
                    Requests Used
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#FFDCDCFF'
                  }}>
                    {subscription.requests_used} / {subscription.monthly_request_limit}
                  </span>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 220, 220, 0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: `${Math.min(100, (subscription.requests_used / subscription.monthly_request_limit) * 100)}%`,
                    height: '100%',
                    backgroundColor: subscription.remaining_requests <= 2 ? '#e0245e' : '#17bf63',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <div style={{ 
                  fontSize: '12px', 
                  color: subscription.remaining_requests <= 2 ? '#e0245e' : 'rgba(255, 220, 220, 0.8)',
                  textAlign: 'center'
                }}>
                  {subscription.remaining_requests} requests remaining this month
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={sectionStyle}>
          <button
            onClick={onLogout}
            style={{
              ...buttonStyle,
              backgroundColor: '#e0245e',
              color: 'white',
              marginBottom: 0
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