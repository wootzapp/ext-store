import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmailInput from './EmailInput';
import OTPInput from './OTPInput';
import '../styles/AuthenticationPage.css';

const AuthenticationPage = () => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleOtpSent = (email) => {
    setEmail(email);
    setShowOtpInput(true);
  };

  const handleAuthComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="authentication-page">
      <Navbar />
      <div className="content">
        {!showOtpInput ? (
          <EmailInput onOtpSent={handleOtpSent} />
        ) : (
          <OTPInput email={email} onAuthComplete={handleAuthComplete} />
        )}
      </div>
    </div>
  );
};

export default AuthenticationPage;