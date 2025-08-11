import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaRocket, FaEdit, FaKey, FaStar, FaLock, FaRobot } from 'react-icons/fa';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    username: '' // Added username field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.email || !formData.password) {
        throw new Error('Email and password are required');
      }

      if (!isLogin) {
        if (!formData.name) {
          throw new Error('Name is required for signup');
        }
        if (!formData.username) { 
          throw new Error('Username is required for signup');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
      }

      const credentials = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        username: formData.username,
        isNewUser: !isLogin
      };

      const result = await onLogin(credentials);
      
      if (!result.success) {
        // Display the actual API error message
        throw new Error(result.error || 'Authentication failed');
      }
    } catch (err) {
      // Clean up error messages for better user experience
      let displayError = err.message;
      
      // Handle specific API error patterns
      if (displayError.includes('Incorrect email or password')) {
        displayError = 'Incorrect email or password. Please try again.';
      } else if (displayError.includes('User already exists')) {
        displayError = 'An account with this email already exists. Please sign in instead.';
      } else if (displayError.includes('Invalid email format')) {
        displayError = 'Please enter a valid email address.';
      } else if (displayError.includes('Network error')) {
        displayError = 'Connection failed. Please check your internet and try again.';
      }
      
      setError(displayError);
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
    padding: '0px 10px 0px 10px',
    textAlign: 'center',
    background: 'linear-gradient(0deg, #002550FF 0%, #764ba2 100%)',
    color: 'white'
  };

  const contentStyle = {
    flex: 'none',
    padding: '20px',
    paddingTop: '10px'
  };

  const inputContainerStyle = {
    position: 'relative',
    marginBottom: '16px'
  };

  const inputStyle = {
    width: '100%',
    padding: '16px 16px 8px 16px',
    borderRadius: '12px',
    border: '2px solid #FFFFFFFF',
    fontSize: '16px',
    color: '#FFDCDCFF',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    backgroundColor: '#003A7CFF',
    transition: 'border-color 0.3s, padding 0.3s',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    outline: 'none'
  };

  const labelStyle = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#FFDCDCA1',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    pointerEvents: 'none',
    // backgroundColor: '#002550FF',
    borderRadius: '15px',
    padding: '2px 8px',
    zIndex: 1
  };

  const labelActiveStyle = {
    top: '-8px',
    transform: 'translateY(0)',
    fontSize: '12px',
    color: '#FFDCDCFF',
    backgroundColor: '#002550FF'
  };

  const passwordContainerStyle = {
    position: 'relative',
    marginBottom: '16px'
  };

  const eyeButtonStyle = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    color: '#FFDCDCFF',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const buttonStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid #FFCFCFFF',
    fontSize: '16px',
    fontWeight: '600',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.3s',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: loading ? '#94a3b8' : '#3B83F6FF',
    color: '#FFFFFFFF'
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'transparent',
    color: '#FFFFFFFF',
    border: '1px solid #FFCFCFFF'
  };

  return (
    <div className="auth-container" style={{...containerStyle, overflowY: 'auto'}}>
      {/* Background Animation */}
      <div className="background-animation">
        <div className="floating-orb auth-orb-1"></div>
        <div className="floating-orb auth-orb-2"></div>
        <div className="floating-orb auth-orb-3"></div>
      </div>

      {/* Custom CSS for placeholder styling */}
      <style>
        {`
          .floating-label.active {
            top: -8px !important;
            transform: translateY(0) !important;
            font-size: 12px !important;
            color: #FFDCDCFF !important;
            background-color: #002550FF !important;
          }
          
          .auth-input:focus + .floating-label {
            top: -8px !important;
            transform: translateY(0) !important;
            font-size: 12px !important;
            color: #FFDCDCFF !important;
          }
          
          .auth-input:focus {
            border-color: #4A90E2 !important;
          }
          
          @keyframes robot-bounce {
            0%, 100% { transform: translateY(1px); }
            50% { transform: translateY(-5px); }
          }
          
          .robot-icon {
            animation: robot-bounce 2s ease-in-out infinite;
            display: inline-block;
          }
        `}
      </style>

      {/* Header */}
      <div className="auth-header" style={headerStyle}>
        <div className="auth-robot-icon" style={{ fontSize: '40px', marginBottom: '-5px',marginTop: '5px', color: '#FFD1D1FF' }}>
          <FaRobot />
        </div>
        <h2 className="auth-title" style={{ margin: 0, fontSize: '22px', fontWeight: '700' }}>
          SOCIAL SHOPPING AGENT
        </h2>
        <p className="auth-subtitle" style={{ margin: '5px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
          Your intelligent web automation companion
        </p>
      </div>

      {/* Content */}
      <div className="auth-content" style={contentStyle}>
        <div className="auth-welcome-section" style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#FFDCDCFF',
            margin: '0 0 5px 0'
          }}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h3>
          <p style={{ 
            fontSize: '14px', 
            color: '#FFDCDCFF',
            margin: 0
          }}>
            {isLogin ? 'Sign in to continue using Social Shopping Agent' : 'Join thousands of users automating their web tasks'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-input-group signup-only" style={inputContainerStyle}>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{...inputStyle, marginBottom: 0}}
                className="auth-input"
                disabled={loading}
                onFocus={(e) => e.target.parentElement.querySelector('.floating-label').classList.add('active')}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.parentElement.querySelector('.floating-label').classList.remove('active');
                  }
                }}
              />
              <label 
                className="floating-label" 
                style={{
                  ...labelStyle, 
                  ...(formData.name ? labelActiveStyle : {})
                }}
              >
                Full Name
              </label>
            </div>
          )}

          {!isLogin && (
            <div className="auth-input-group signup-only" style={inputContainerStyle}>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                style={{...inputStyle, marginBottom: 0}}
                className="auth-input"
                disabled={loading}
                onFocus={(e) => e.target.parentElement.querySelector('.floating-label').classList.add('active')}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.parentElement.querySelector('.floating-label').classList.remove('active');
                  }
                }}
              />
              <label 
                className="floating-label" 
                style={{
                  ...labelStyle, 
                  ...(formData.username ? labelActiveStyle : {})
                }}
              >
                Username
              </label>
            </div>
          )}
          
          <div className="auth-input-group common-field" style={inputContainerStyle}>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{...inputStyle, marginBottom: 0}}
              className="auth-input"
              disabled={loading}
              onFocus={(e) => e.target.parentElement.querySelector('.floating-label').classList.add('active')}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.parentElement.querySelector('.floating-label').classList.remove('active');
                }
              }}
            />
            <label 
              className="floating-label" 
              style={{
                ...labelStyle, 
                ...(formData.email ? labelActiveStyle : {})
              }}
            >
              Email Address
            </label>
          </div>
          
          <div className="auth-input-group common-field" style={{...passwordContainerStyle, ...inputContainerStyle}}>
            <input
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{...inputStyle, marginBottom: 0}}
              className="auth-input"
              disabled={loading}
              onFocus={(e) => e.target.parentElement.querySelector('.floating-label').classList.add('active')}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.parentElement.querySelector('.floating-label').classList.remove('active');
                }
              }}
            />
            <label 
              className="floating-label" 
              style={{
                ...labelStyle, 
                ...(formData.password ? labelActiveStyle : {})
              }}
            >
              Password
            </label>
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="auth-eye-button"
              style={eyeButtonStyle}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {!isLogin && (
            <div className="auth-input-group signup-only" style={{...passwordContainerStyle, ...inputContainerStyle}}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                style={{...inputStyle, marginBottom: 0}}
                className="auth-input"
                disabled={loading}
                onFocus={(e) => e.target.parentElement.querySelector('.floating-label').classList.add('active')}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.parentElement.querySelector('.floating-label').classList.remove('active');
                  }
                }}
              />
              <label 
                className="floating-label" 
                style={{
                  ...labelStyle, 
                  ...(formData.confirmPassword ? labelActiveStyle : {})
                }}
              >
                Confirm Password
              </label>
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="auth-eye-button"
                style={eyeButtonStyle}
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          )}

          {error && (
            <div className="auth-error" style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              fontSize: '14px',
              color: '#dc2626',
              textAlign: 'left',
              lineHeight: '1.4'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="auth-button auth-primary-button"
            style={primaryButtonStyle}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="auth-loading-spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%'
                }} />
                Processing...
              </>
            ) : (
              <>
                {isLogin ? <FaRocket /> : <FaStar />}
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
            setFormData({
              email: '',
              password: '',
              name: '',
              confirmPassword: '',
              username: '' 
            });
          }}
          className="auth-button auth-secondary-button"
          style={secondaryButtonStyle}
          disabled={loading}
        >
          {isLogin ? (
            <>
              <FaEdit />
              Need an account? Sign Up
            </>
          ) : (
            <>
              <FaKey />
              Already have an account? Sign In
            </>
          )}
        </button>

        <div className="auth-trial-info" style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#FFF9C3FF',
          borderRadius: '10px',
          border: '1px solid #FFFFFFFF'
        }}>
          <div style={{ fontSize: '12px', color: '#000000FF', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <FaStar style={{ fontSize: '14px' }} />
              <strong>New users get a 7-day free trial!</strong>
            </p>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <FaLock style={{ fontSize: '12px' }} />
              Your data is secure and encrypted
            </p>
          </div>
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

export default AuthPage;