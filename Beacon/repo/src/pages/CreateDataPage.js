import React from 'react';
import { PlusCircle } from 'lucide-react';

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

const CreateDataPage = () => {
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