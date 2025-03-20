import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';

const ViewDataPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const styles = {
    pageContainer: {
      padding: isMobile ? '16px' : '24px',
      color: '#FFEBC8FF',
      background: 'linear-gradient(to bottom, #000044, #000022)',
      minHeight: 'calc(100vh - 64px)',  // Account for app bar height
      width: '100%',
      boxSizing: 'border-box',
      overflowX: 'hidden', // Prevent horizontal scrolling
    },
    pageHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '8px' : '12px',
      marginBottom: isMobile ? '16px' : '24px',
      background: '#141C2F',
      padding: isMobile ? '12px 16px' : '20px',
      borderRadius: '12px',
      border: '1px solid #FFC35BFF',
    },
    pageTitle: {
      fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : '24px',
      color: '#FF7A00',
      margin: 0,
    },
    pageIcon: {
      color: '#FF7A00',
      minWidth: '24px', // Ensure icon doesn't shrink too much
    },
    pageContent: {
      background: '#141C2F',
      borderRadius: '12px',
      border: '1px solid #FFC35BFF',
      padding: isMobile ? '16px' : '24px',
      marginTop: isMobile ? '16px' : '24px',
    },
    sectionTitle: {
      color: '#FF7A00', 
      marginBottom: isMobile ? '12px' : '16px',
      fontSize: isMobile ? 'clamp(16px, 4vw, 20px)' : '20px',
    },
    dataGrid: {
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', 
      gap: isMobile ? '12px' : '20px',
      marginBottom: isMobile ? '24px' : '32px'
    },
    dataCard: {
      padding: isMobile ? '12px' : '16px', 
      border: '1px solid #FF7A00', 
      borderRadius: '8px'
    },
    cardTitle: {
      color: '#FF7A00', 
      marginBottom: isMobile ? '4px' : '8px',
      fontSize: isMobile ? '16px' : '18px',
    },
    cardValue: {
      fontSize: isMobile ? '20px' : '24px'
    },
    visualizationBox: {
      border: '1px solid #FF7A00', 
      borderRadius: '8px', 
      padding: isMobile ? '12px' : '16px',
      height: isMobile ? '200px' : '300px', // Shorter height on mobile
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: isMobile ? '14px' : '16px',
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <Database style={styles.pageIcon} size={isMobile ? 20 : 24} />
        <h1 style={styles.pageTitle}>View Data</h1>
      </div>
      <div style={styles.pageContent}>
        <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
          <h2 style={styles.sectionTitle}>Data Overview</h2>
          <div style={styles.dataGrid}>
            <div style={styles.dataCard}>
              <h3 style={styles.cardTitle}>Total Records</h3>
              <p style={styles.cardValue}>1,234</p>
            </div>
            <div style={styles.dataCard}>
              <h3 style={styles.cardTitle}>Active Sources</h3>
              <p style={styles.cardValue}>5</p>
            </div>
          </div>
          <div style={styles.visualizationBox}>
            <p>Data visualization will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDataPage; 