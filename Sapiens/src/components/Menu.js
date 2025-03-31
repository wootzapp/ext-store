import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Menu.css';

const Menu = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="menu">
      <header>
        <button className="back-button" onClick={handleBack}>←</button>
        <h1>Menu</h1>
      </header>
      
      <div className="menu-items">
        <button className="menu-item">FAQ</button>
        <button className="menu-item">Tagger Profile</button>
        <button className="menu-item">Points</button>
        <button className="menu-item">Sign In</button>
      </div>
    </div>
  );
};

export default Menu;