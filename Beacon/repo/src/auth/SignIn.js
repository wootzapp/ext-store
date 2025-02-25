/* global chrome */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../api/auth';

const styles = {
  container: {
    // background: 'linear-gradient(to bottom, #000044, #000022)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '20px'
  },
  wrapper: {
    width: '100%',
    maxWidth: '400px',
    position: 'relative',
    padding: '0',
    marginTop: '40px'
  },
  headerCard: {
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    border: '1px solid #FFC35BFF',
    borderRadius: '12px',
    padding: '18px 12px',
    margin: '0 20px',
    position: 'absolute',
    boxShadow: '0 1px 5px #FFC35BFF',
    top: '-40px',
    left: '20px',
    right: '20px',
    zIndex: 2,
    textAlign: 'center'
  },
  headerTitle: {
    color: 'white',
    fontSize: '20px',
    marginBottom: '10px',
    fontWeight: 600
  },
  headerText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    lineHeight: '1.4'
  },
  mainCard: {
    backgroundColor: '#141C2F',
    borderRadius: '16px',
    border: '1px solid #FFEBC8FF',
    padding: '32px 24px',
    paddingTop: '60px',
    marginTop: '0',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box'
  },
  formContainer: {
    width: '100%',
    marginTop: '30px'
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: 'rgba(42, 52, 71, 0.3)',
    border: '1px solid #FFC35BFF',
    borderRadius: '8px',
    color: 'white',
    fontSize: '15px',
    marginBottom: '20px',
    outline: 'none',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box',
    '&:focus': {
      borderColor: '#FF7A00',
      boxShadow: '0 0 0 2px rgba(255, 122, 0, 0.2)'
    }
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    border: '1px solid #FFC35BFF',
    borderRadius: '8px',
    color: 'white',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 600,
    marginBottom: '25px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(255, 74, 0, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  links: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#FFEBC8FF',
    marginTop: '8px'
  },
  link: {
    color: '#FF7A00',
    textDecoration: 'none',
    marginLeft: '6px',
    fontWeight: 500,
    transition: 'color 0.2s ease'
  },
  linkGroup: {
    marginBottom: '10px',
    lineHeight: '1.6'
  },
  errorMessage: {
    color: '#FF4B4B',
    fontSize: '14px',
    marginTop: '-10px',
    marginBottom: '15px',
    textAlign: 'left'
  }
};

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [totp, setTotp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginUser(email, totp);
      
      // Store authentication data in chrome storage
      if (response.data?.id) {
        await chrome.storage.local.set({
          userAuth: true,
          userId: response.data.id,
          userEmail: response.data.attributes.email,
          authToken: response.data.attributes.token
        });
        // Login successful - redirect to dashboard
        navigate('/dashboard');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or TOTP code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.headerCard}>
          <h1 style={styles.headerTitle}>Waev Dashboard</h1>
        </div>
        <div style={styles.mainCard}>
          <form onSubmit={handleSubmit} style={styles.formContainer}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={isLoading}
              required
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              placeholder="Enter 6-digit TOTP"
              value={totp}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length <= 6) setTotp(value);
              }}
              style={styles.input}
              disabled={isLoading}
              required
            />
            {error && <div style={styles.errorMessage}>{error}</div>}
            <button
              type="submit"
              style={{
                ...styles.button,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          <div style={styles.links}>
            <div style={styles.linkGroup}>
              Forgot Password? 
              <a 
                onClick={() => navigate('/Recover')}
                style={styles.link}
              >
                Recover Account
              </a>
            </div>
            <div style={styles.linkGroup}>
              Sign in with 
              <a 
                onClick={() => navigate('/')}
                style={styles.link}
              >
                Magic Link
              </a>
            </div>
            <div style={styles.linkGroup}>
              Don't have an account?
              <a 
                onClick={() => navigate('/SignUp')}
                style={styles.link}
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;