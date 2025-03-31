import React, { useEffect, useState } from 'react';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const styles = {
  pageContainer: {
    padding: '12px',
    color: '#FFEBC8FF',
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: 'calc(100vh - 64px)',
    width: '100%',
    boxSizing: 'border-box',
    overflowX: 'hidden',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    background: '#141C2F',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 'clamp(18px, 5vw, 24px)',
    color: '#FF7A00',
    margin: 0,
  },
  pageIcon: {
    color: '#FF7A00',
    minWidth: '24px',
  },
  buttonContainer: {
    marginTop: '16px',
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    padding: '0 8px',
  },
  twitterButton: {
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 16px',
    fontSize: 'clamp(14px, 4vw, 16px)',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    maxWidth: '100%',
    width: 'fit-content',
    textAlign: 'center',
    justifyContent: 'center',
  }
};

const HomePage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNavigateToTwitterControl = () => {
    navigate('/dashboard/twitter-control');
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <Home style={styles.pageIcon} size={isMobile ? 20 : 24} />
        <h1 style={styles.pageTitle}>Home</h1>
      </div>

      <div style={styles.buttonContainer}>
        <button 
          style={styles.twitterButton}
          onClick={handleNavigateToTwitterControl}
        >
          <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22 4.01c-1 .49-1.98.689-3 .99-1.121-1.265-2.783-1.335-4.38-.737S11.977 6.323 12 8v1c-3.245.083-6.135-1.395-8-4 0 0-4.182 7.433 4 11-1.872 1.247-3.739 2.088-6 2 3.308 1.803 6.913 2.423 10.034 1.517 3.58-1.04 6.522-3.723 7.651-7.742a13.84 13.84 0 0 0 .497-3.753C20.18 7.773 21.692 5.25 22 4.009z" fill="white" />
          </svg>
          {isMobile ? 'Twitter Control' : 'Navigate to Twitter Control'}
        </button>
      </div>
    </div>
  );
};

export default HomePage; 