/*global chrome*/
import React, { useState } from "react";
import EmailInput from "./EmailInput";
import OTPInput from "./OTPInput";
import "../styles/OpenEmailInputButton.css"; // Add this line to import the CSS

const OpenEmailInputButton = () => {
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleOpenEmailInput = () => {
    console.log("Opening email input form");
    setShowEmailInput(true);
  };

  const handleOtpSent = (email) => {
    console.log("OTP sent to:", email);
    console.log("Transitioning to OTP input screen");
    setEmail(email);
    console.log("Email state updated");
    setShowOtpInput(true);
    console.log("OTP input form displayed");
    console.log("Current state - showEmailInput:", showEmailInput, "showOtpInput:", showOtpInput);
  };

  const handleAuthComplete = (token) => {
    console.log("Authentication successful");
    console.log("Token received:", token.substring(0, 10) + "...");  // Only log first 10 chars for security
    console.log("Updating authentication state");

    try {
      // Parse the response data
      const authData = JSON.parse(token);
      
      // Save relevant data to chrome.storage
      chrome.storage.local.set({
        authToken: authData.token,
        privyAccessToken: authData.privy_access_token,
        refreshToken: authData.refresh_token,
        userId: authData.user.id,
        userEmail: authData.user.linked_accounts.find(acc => acc.type === 'email')?.address
      }, () => {
        console.log('Auth data saved to chrome.storage with:');
        console.log('- Auth Token:', authData.token.substring(0, 10) + '...');
        console.log('- Privy Access Token:', authData.privy_access_token.substring(0, 10) + '...');
        console.log('- User ID:', authData.user.id);
      });

      // Verify the data was saved correctly
      chrome.storage.local.get(['authToken', 'userId', 'userEmail'], function(result) {
        console.log('Verified stored auth data:', {
          authToken: result.authToken ? result.authToken.substring(0, 10) + '...' : null,
          userId: result.userId,
          userEmail: result.userEmail
        });
      });
      
      setIsLoggedIn(true);
      setShowEmailInput(false);
      setShowOtpInput(false);
    } catch (err) {
      console.error("Failed to store auth data:", err);
      // Still complete the auth flow even if storage fails
      setIsLoggedIn(true);
      setShowEmailInput(false);
      setShowOtpInput(false);
    }
  };

  const handleLogout = () => {
    console.log("User logged out");
    // Clear auth data from chrome.storage
    chrome.storage.local.remove([
      'authToken',
      'privyAccessToken',
      'refreshToken',
      'userId',
      'userEmail'
    ], () => {
      console.log("Auth data cleared from chrome.storage");
      
      // Verify the data was cleared
      chrome.storage.local.get(['authToken'], function(result) {
        console.log('Verified auth data cleared:', result);
      });
    });
    
    setIsLoggedIn(false);
    setEmail("");
  };

  console.log('Current component state:');
  console.log('showEmailInput:', showEmailInput);
  console.log('showOtpInput:', showOtpInput);
  console.log('email:', email);

  return (
    <div>
      {!isLoggedIn ? (
        <button className="login-signup-button" onClick={handleOpenEmailInput}>
          Login/Signup
        </button>
      ) : (
        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      )}
      {(showEmailInput || showOtpInput) && (
        <div className={`slide-up-popup ${showEmailInput || showOtpInput ? "open" : ""}`}>
          <div className="popup-content">
            {showOtpInput ? (
              <OTPInput email={email} onAuthComplete={handleAuthComplete} />
            ) : (
              <EmailInput onOtpSent={handleOtpSent} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenEmailInputButton;