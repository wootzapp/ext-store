import React from 'react';
import { PlusCircle } from 'lucide-react';

const styles = {
  pageContainer: {
    padding: '16px',
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
    gap: '8px',
    marginBottom: '16px',
    background: '#141C2F',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    flexWrap: 'wrap', // Allow wrapping on very small screens
  },
  pageTitle: {
    fontSize: 'clamp(18px, 5vw, 24px)', // Responsive font size
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
    padding: '16px',
    marginTop: '16px',
    width: '100%',
    boxSizing: 'border-box',
  },
  // Add responsive styles for mobile
  '@media (max-width: 600px)': {
    pageContainer: {
      padding: '12px',
    },
    pageHeader: {
      padding: '10px',
    },
    pageContent: {
      padding: '12px',
    },
  }
};

const CreateDataPage = () => {
  // Implement a basic useEffect for responsive styling
  React.useEffect(() => {
    const handleResize = () => {
      // You can add additional responsive logic here if needed
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <PlusCircle style={styles.pageIcon} size={24} />
        <h1 style={styles.pageTitle}>Create Data</h1>
      </div>
      <div style={styles.pageContent}>
        {/* Add your create data page content here */}
        <p>Create new data entries here</p>
      </div>
    </div>
  );
};

export default CreateDataPage; 