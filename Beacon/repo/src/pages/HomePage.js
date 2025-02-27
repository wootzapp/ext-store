import React from 'react';
import { Home } from 'lucide-react';

const styles = {
  pageContainer: {
    padding: '24px',
    color: '#FFEBC8FF',
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: 'calc(100vh - 64px)',
    width: '100%',
    boxSizing: 'border-box',
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    background: '#141C2F',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
  },
  pageTitle: {
    fontSize: '24px',
    color: '#FF7A00',
    margin: 0,
  },
  pageIcon: {
    color: '#FF7A00',
  }
};

const HomePage = () => {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <Home style={styles.pageIcon} size={24} />
        <h1 style={styles.pageTitle}>Home</h1>
      </div>
    </div>
  );
};

export default HomePage; 