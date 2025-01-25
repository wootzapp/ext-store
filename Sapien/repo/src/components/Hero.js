import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if the user is logged in
    const token = localStorage.getItem('authToken');
    setIsLoggedIn(!!token);
  }, []);

  const handlePlayNow = async () => {
    // Fetch API and navigate to dashboard
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      navigate('/dashboard');
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className="hero">
      <div className="content">
        <div className="hero-text">
          <h1 className="gradient-text">Play. Earn.<br/>Train AI.</h1>
          <p>Join thousands of players contributing to AI through fun, rewarding tasks—right from your phone!</p>
        </div>

        {isLoggedIn ? (
          <button className="cta-button orange-button" onClick={handlePlayNow}>
            Play Now!
          </button>
        ) : (
          <button className="cta-button orange-button" onClick={handleSignIn}>
            Sign In
          </button>
        )}
      </div>
    </div>
  );
};

export default Hero;