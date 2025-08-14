import React from 'react';
import { Database } from 'lucide-react';

const styles = {
  pageContainer: {
    padding: '24px',
    color: '#FFEBC8FF',
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: 'calc(100vh - 64px)',  // Account for app bar height
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
  },
  pageContent: {
    background: '#141C2F',
    borderRadius: '12px',
    border: '1px solid #FFC35BFF',
    padding: '24px',
    marginTop: '24px',
  }
};

const ViewDataPage = () => {
  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <Database style={styles.pageIcon} size={24} />
        <h1 style={styles.pageTitle}>View Data</h1>
      </div>
      <div style={styles.pageContent}>
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ color: '#FF7A00', marginBottom: '16px' }}>Data Overview</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{ padding: '16px', border: '1px solid #FF7A00', borderRadius: '8px' }}>
              <h3 style={{ color: '#FF7A00', marginBottom: '8px' }}>Total Records</h3>
              <p style={{ fontSize: '24px' }}>1,234</p>
            </div>
            <div style={{ padding: '16px', border: '1px solid #FF7A00', borderRadius: '8px' }}>
              <h3 style={{ color: '#FF7A00', marginBottom: '8px' }}>Active Sources</h3>
              <p style={{ fontSize: '24px' }}>5</p>
            </div>
          </div>
          <div style={{ 
            border: '1px solid #FF7A00', 
            borderRadius: '8px', 
            padding: '16px',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <p>Data visualization will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDataPage; 