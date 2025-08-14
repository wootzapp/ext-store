import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupOverlay.css';

const SignupOverlay = () => {
  const navigate = useNavigate();

  const handleSignup = () => {
    // Add any signup logic here if needed
    navigate('/instructions'); // Redirect to instructions page
  };

  return (
    <div className="signup-overlay">
      <div className="signup-container">
        <div className="signup-content">
          <h1>Sign up to play!</h1>
          <h2>Ready to earn!</h2>
          <button 
            className="signup-button"
            onClick={handleSignup}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupOverlay;