import React, { useState } from 'react';
import { createOrganization } from '../api/OrganizationAPI';

const styles = {
  createOrgContainer: {
    background: '#141C2F',
    borderRadius: '12px',
    padding: '32px',
    width: '95%',
    maxWidth: '900px',
    marginTop: '24px',
    border: '1px solid #FFC35BFF',
    boxSizing: 'border-box',
    margin: '24px auto 0',
  },
  modalTitle: {
    color: '#FFEBC8FF',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '8px',
  },
  modalSubtitle: {
    color: '#FFEBC8FF',
    textAlign: 'center',
    marginBottom: '32px',
    opacity: 0.8,
  },
  iconContainer: {
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #FFC35BFF',
    boxShadow: '0 1px 5px #FFC35BFF',
  },
  circleIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#FFFFFF',
    marginBottom: '8px',
  },
  iconLabel: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  formSection: {
    marginBottom: '32px',
  },
  formTitle: {
    color: '#FFEBC8FF',
    fontSize: '20px',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '16px',
  },
  formSubtitle: {
    color: '#FFEBC8FF',
    textAlign: 'center',
    marginBottom: '24px',
    opacity: 0.8,
  },
  inputLabel: {
    color: '#FFEBC8FF',
    fontSize: '14px',
    marginBottom: '8px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #FFC35BFF',
    background: 'transparent',
    color: '#FFEBC8FF',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
  },
  cancelButton: {
    background: '#1A2337',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1,
  },
  createButton: {
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1,
    boxShadow: '0 1px 3px rgba(255, 122, 0, 0.3)',
  },
};

const CreateOrganization = ({ organizationName, setOrganizationName, onClose, onSubmit }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles the organization creation process
   */
  const handleCreateOrganization = async () => {
    if (!organizationName.trim()) {
      setError('Organization name is required');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      // Call the create organization API
      await createOrganization(organizationName);
      
      // Call the onSubmit prop to refresh the organizations list
      onSubmit();
      
      // Close the modal and reset the form
      onClose();
      setOrganizationName('');
    } catch (error) {
      setError(error.message || 'Failed to create organization');
      console.error('Error creating organization:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={styles.createOrgContainer}>
      <h1 style={styles.modalTitle}>Create an Organization</h1>
      <p style={styles.modalSubtitle}>Just need some info...</p>

      <div style={styles.iconContainer}>
        <div style={styles.circleIcon}></div>
        <span style={styles.iconLabel}>NAME</span>
      </div>

      <div style={styles.formSection}>
        <h2 style={styles.formTitle}>Let's start with the basic information</h2>
        <p style={styles.formSubtitle}>What's the name of the Organization?</p>

        <label style={styles.inputLabel}>Organization Name</label>
        <input
          type="text"
          style={{
            ...styles.input,
            borderColor: error ? '#ff4444' : '#FFC35BFF',
          }}
          value={organizationName}
          onChange={(e) => {
            setOrganizationName(e.target.value);
            setError('');
          }}
          placeholder="Enter organization name"
          disabled={isCreating}
        />
        {error && (
          <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px' }}>
            {error}
          </div>
        )}
      </div>

      <div style={styles.buttonContainer}>
        <button 
          style={styles.cancelButton}
          onClick={() => {
            onClose();
            setOrganizationName('');
            setError('');
          }}
          disabled={isCreating}
        >
          CANCEL
        </button>
        <button 
          style={{
            ...styles.createButton,
            opacity: isCreating ? 0.7 : 1,
            cursor: isCreating ? 'not-allowed' : 'pointer',
          }}
          onClick={handleCreateOrganization}
          disabled={isCreating}
        >
          {isCreating ? 'CREATING...' : 'CREATE'}
        </button>
      </div>
    </div>
  );
};

export default CreateOrganization; 