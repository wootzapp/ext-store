import React, { useState } from 'react';
import { 
  FaBullseye, 
  FaUnlock, 
  FaEdit, 
  FaComments, 
  FaCrown, 
  FaGift, 
  FaCreditCard,
  FaKey,
  FaArrowLeft
} from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';

const SubscriptionPage = ({ onSubscribe, onLogout, onOpenSettings, user }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const plans = {
    monthly: {
      name: 'Monthly',
      price: 14.99,
      period: '/month',
      features: [
        'Unlimited web automation',
        'All AI models included',
        'Priority support',
        'Regular updates'
      ]
    },
    yearly: {
      name: 'One Year',
      price: 149.99,
      period: '/year',
      originalPrice: 179.88,
      savings: 'Save $29.89',
      features: [
        'Everything in Monthly',
        '2 months FREE',
        'Priority customer support',
        'Advanced AI models',
        'Beta features access'
      ],
      recommended: true
    }
  };

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await onSubscribe({
        plan: selectedPlan,
        price: plans[selectedPlan].price,
        user: user
      });

      if (!result.success) {
        throw new Error(result.error || 'Subscription failed');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleTrial = async () => {
    setError('');
    setLoading(true);

    try {
      // Start 7-day trial
      const result = await onSubscribe({
        plan: 'trial',
        price: 0,
        user: user,
        trial: true
      });

      if (!result.success) {
        throw new Error(result.error || 'Trial activation failed');
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

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
    padding: '10px 10px 0px 10px',
    background: 'linear-gradient(0deg, #002550FF 0%, #764ba2 100%)',
    color: 'white',
    textAlign: 'center'
  };

  const contentStyle = {
    flex: 'none',
    padding: '20px',
    paddingTop: '10px',
    backgroundColor: '#002550FF'
  };

  const planCardStyle = (isSelected, isRecommended) => ({
    backgroundColor: isSelected ? '#003A7CFF' : '#002550FF',
    border: `2px solid ${isSelected ? '#3b82f6' : '#FFDCDCFF'}`,
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    ...(isRecommended && {
      borderColor: '#10b981',
      boxShadow: '0 0 0 1px #10b981'
    })
  });

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    marginBottom: '12px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', 
        top: 0,           
        left: 0,          
        right: 0,         
        bottom: 0,        
        width: '100%',    
        height: '100%',   
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#002550FF',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 220, 220, 0.3)',
          borderTop: '4px solid #FFDCDCFF',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }} />
        <div style={{ 
          fontSize: '16px', 
          color: '#FFDCDCFF',
          textAlign: 'center'
        }}>
          <span id="loading-text">Loading</span>
        </div>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            @keyframes dots {
              0% { content: 'Loading'; }
              33% { content: 'Loading.'; }
              66% { content: 'Loading..'; }
              100% { content: 'Loading...'; }
            }
            
            #loading-text::after {
              content: '';
              animation: dots 1.5s infinite;
            }
          `}
        </style>
      </div>
    );
  }

  return (
    <div style={{...containerStyle, overflowY: 'auto'}} onClick={(e) => {
      if (e.target === e.currentTarget) {
        onOpenSettings();
      }
    }}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/profile')}
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
              justifyContent: 'center',
              marginLeft: '6px'
            }}
            title="Back to Profile"
          >
            <FaArrowLeft />
          </button>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              Unleash AI's full powers with Premium
            </h3>
          </div>
          
          <div style={{ width: '40px' }}></div> {/* Spacer for centering */}
        </div>
        <p style={{ margin: '8px 0 0 0', fontSize: '13px', opacity: 0.9, color: '#FFDCDCFF' }}>
          Welcome, {user?.name || user?.email}!
        </p>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Features */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#003A7CFF',
            borderRadius: '8px',
            border: '1px solid rgba(255, 220, 220, 0.2)'
          }}>
            <FaBullseye style={{ fontSize: '20px', color: '#FFDCDCFF' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFDCDCFF' }}>
                Explore different AI models
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 220, 220, 0.8)' }}>
                Priority access to powerful models with different skills.
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#003A7CFF',
            borderRadius: '8px',
            border: '1px solid rgba(255, 220, 220, 0.2)'
          }}>
            <FaUnlock style={{ fontSize: '20px', color: '#FFDCDCFF' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFDCDCFF' }}>
                Unlock your creativity
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 220, 220, 0.8)' }}>
                Access models better suited for creative tasks and content generation.
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#003A7CFF',
            borderRadius: '8px',
            border: '1px solid rgba(255, 220, 220, 0.2)'
          }}>
            <FaEdit style={{ fontSize: '20px', color: '#FFDCDCFF' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFDCDCFF' }}>
                Stay on topic
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 220, 220, 0.8)' }}>
                Get more accurate answers for more nuanced conversations.
              </div>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#003A7CFF',
            borderRadius: '8px',
            border: '1px solid rgba(255, 220, 220, 0.2)'
          }}>
            <FaComments style={{ fontSize: '20px', color: '#FFDCDCFF' }} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600', color: '#FFDCDCFF' }}>
                Chat for longer
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 220, 220, 0.8)' }}>
                Get higher rate limits for longer conversations.
              </div>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div style={{ marginBottom: '20px' }}>
          {Object.entries(plans).map(([key, plan]) => (
            <div
              key={key}
              onClick={() => setSelectedPlan(key)}
              style={planCardStyle(selectedPlan === key, plan.recommended)}
            >
              {plan.recommended && (
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#10b981',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: '600',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FaCrown style={{ fontSize: '8px' }} />
                  BEST VALUE
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#FFDCDCFF' }}>
                    {plan.name}
                  </div>
                  {plan.savings && (
                    <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                      {plan.savings}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: '#FFDCDCFF' }}>
                    USD ${plan.price}
                    <span style={{ fontSize: '12px', fontWeight: '400' }}>
                      {plan.period}
                    </span>
                  </div>
                  {plan.originalPrice && (
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'rgba(255, 220, 220, 0.6)', 
                      textDecoration: 'line-through' 
                    }}>
                      ${plan.originalPrice}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#dc2626'
          }}>
            {error}
          </div>
        )}

        {/* Trial Button */}
        <button
          onClick={handleTrial}
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? '#4a5568' : '#10b981',
            color: 'white'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Processing...
            </>
          ) : (
            <>
              <FaGift />
              Try 7 days free
            </>
          )}
        </button>

        {/* Subscribe Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            ...buttonStyle,
            backgroundColor: loading ? '#4a5568' : '#3b82f6',
            color: 'white'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid transparent',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              Processing...
            </>
          ) : (
            <>
              <FaCreditCard />
              Subscribe {plans[selectedPlan].name}
            </>
          )}
        </button>

        {/* Use API Key Button */}
        <button
          onClick={onOpenSettings}
          style={{
            ...buttonStyle,
            backgroundColor: 'transparent',
            color: '#FFDCDCFF',
            border: '1px solid rgba(255, 220, 220, 0.3)',
            marginBottom: '16px'
          }}
        >
          <FaKey />
          Use your API key instead
        </button>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{ 
            fontSize: '11px', 
            color: 'rgba(255, 220, 220, 0.8)',
            margin: '0 0 12px 0'
          }}>
            All subscriptions are auto-renewed but can be cancelled at any time before renewal.
          </p>
        </div>
      </div>

      {/* Spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default SubscriptionPage;