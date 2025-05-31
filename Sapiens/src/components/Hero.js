import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  const handlePlayNow = () => {
    navigate('/dashboard');
  };

  return (
    <div className="hero">
      <div className="hero-content">
        <h1>
          <span>Play.</span> <span>Earn.</span>
          <br />
          <span className="highlight">Train AI.</span>
        </h1>
        <p>
          Join thousands of players contributing to AI through fun,
          <br />
          rewarding tasks—right from your phone!
        </p>
        <button className="play-button" onClick={handlePlayNow}>Play Now!</button>
      </div>
      <div className="hero-image">
        <div className="sphere-animation"></div>
      </div>
    </div>
  );
};

export default Hero;