/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../api/auth';

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
  },
  checkbox: {
    marginRight: '10px',
    height: '50px',
    width: '50px',
    accentColor: '#FF7A00',
    display: 'flex',
    alignItems: 'flex-start',
  },
  termsText: {
    fontSize: '12px',
    color: '#FFEBC8FF',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'flex-start',
    textAlign: 'justify',
    lineHeight: '1.5'
  },
  termsLink: {
    color: '#FF7A00',
    textDecoration: 'none',
    fontWeight: 500
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    position: 'relative',
    width: '90%',
    maxWidth: '800px',
    height: '80vh',
    backgroundColor: '#141C2F',
    borderRadius: '16px',
    border: '1px solid #FFEBC8FF',
    boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden'
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none'
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    border: '1px solid #FFC35BFF',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: 'bold',
    zIndex: 1001
  },
  errorMessage: {
    color: '#FF4500',
    marginBottom: '10px'
  }
};

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) return;

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const response = await registerUser(email, firstName, lastName);
      setSuccess('Registration successful! Check your email for the TOTP QR Code. Redirecting to login...');
      // Wait for 3 seconds before redirecting to allow user to read the message
      if(response){
        setTimeout(() => {
          navigate('/SignIn');
        }, 3000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type) => {
    const url = type === 'terms' 
      ? 'https://waevdata.com/terms/'
      : 'https://waevdata.com/privacy/';
    setModalContent(url);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.headerCard}>
          <h1 style={styles.headerTitle}>Join us today</h1>
          <p style={styles.headerText}>Enter your Name and Email to register.</p>
        </div>
        <div style={styles.mainCard}>
          <form onSubmit={handleSubmit} style={styles.formContainer}>
            {error && <div style={styles.errorMessage}>{error}</div>}
            {success && <div style={{...styles.errorMessage, color: '#4CAF50'}}>{success}</div>}
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={styles.input}
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <div style={styles.termsText}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                style={styles.checkbox}
              />
              <span>
                By checking this box and clicking "SIGN UP", I acknowledge that I read and understand the 
                <a 
                  onClick={() => openModal('terms')}
                  style={{...styles.termsLink, cursor: 'pointer'}}
                > Waev Terms of Use</a>, including the
                <a 
                  onClick={() => openModal('privacy')}
                  style={{...styles.termsLink, cursor: 'pointer'}}
                > Privacy Policy</a>, and agree to be bound by both.
              </span>
            </div>
            <button
              type="submit"
              disabled={!acceptedTerms}
              style={{
                ...styles.button,
                opacity: acceptedTerms ? 1 : 0.5,
                cursor: acceptedTerms ? 'pointer' : 'not-allowed'
              }}
            >
              {isLoading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </form>
          <div style={styles.links}>
            <div style={styles.linkGroup}>
              Already have an account?
              <a 
                onClick={() => navigate('/SignIn')}
                style={styles.link}
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      </div>

      {modalContent && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={closeModal}>×</button>
            <iframe
              src={modalContent}
              style={styles.iframe}
              title="Terms and Conditions"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;