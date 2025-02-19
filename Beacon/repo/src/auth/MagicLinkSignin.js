import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const styles = {
  container: {
    background: 'linear-gradient(to bottom, #000044, #000022)',
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
    paddingTop: '90px',
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
  }
};

const MagicLinkSignIn = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Magic link requested for:', email);
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.headerCard}>
          <h1 style={styles.headerTitle}>Sign in with magic link</h1>
          <p style={styles.headerText}>Have a new magic link sent to your email.</p>
        </div>
        <div style={styles.mainCard}>
          <form onSubmit={handleSubmit} style={styles.formContainer}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button
              type="submit"
              style={{
                ...styles.button,
              }}
            >
              Send Request
            </button>
          </form>
          <div style={styles.links}>
            <div style={styles.linkGroup}>
              Sign in with email and TOTP?
              <a 
                onClick={() => navigate('/SignIn')}
                style={styles.link}
              >
                Sign In
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

export default MagicLinkSignIn;