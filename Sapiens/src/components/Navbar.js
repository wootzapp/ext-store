import React from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/sapien-logo.svg" alt="Sapien" />
      </div>
      <div className="announcement">
        <span role="img" aria-label="rocket">🚀</span>
        Sapien.io: A Decentralized Data Foundry Raises $10.5M
      </div>
      <div className="nav-links">
        <a href="/about">About Us</a>
        <a href="/how-it-works">How It Works</a>
        <a href="/faq">F.A.Q.</a>
        <a href="/blog" className="blog-link">/blog</a>
      </div>
    </nav>
  );
};

export default Navbar;