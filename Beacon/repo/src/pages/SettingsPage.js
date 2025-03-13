import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const styles = {
  pageContainer: {
    padding: '16px',
    color: '#FFEBC8FF',
    background: 'linear-gradient(to bottom, #000044, #000022)',
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
  },
  settingsContainer: {
    background: '#141C2F',
    padding: '24px',
    borderRadius: '12px',
    // border: '1px solid #FFC35BFF',
    maxWidth: '900px',
    width: '95%',
    margin: '0 auto',
    // marginRight: '100px',
  },
  headerSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
  },
  pageIcon: {
    color: '#FF7A00',
    background: '#1E50FF',
    padding: '8px',
    borderRadius: '50%',
  },
  pageTitle: {
    fontSize: '24px',
    color: '#FF7A00',
    margin: 0,
  },
  selectSection: {
    marginBottom: '24px',
    position: 'relative',
  },
  selectLabel: {
    position: 'absolute',
    top: '-10px',
    left: '12px',
    color: '#FFEBC8FF',
    fontSize: '14px',
    background: '#141C2F',
    padding: '0 4px',
    zIndex: 1,
  },
  select: {
    width: '100%',
    background: '#1A2337',
    color: '#FFEBC8FF',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #FFC35BFF',
    fontSize: '16px',
    cursor: 'pointer',
    outline: 'none',
  },
  organizationSection: {
    width: '95%',
    maxWidth: '900px',
    margin: '24px auto 0',
  },
  organizationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    width: '100%',
    flexWrap: 'nowrap',
  },
  sectionTitle: {
    fontSize: '20px',
    color: '#FFEBC8FF',
    margin: 0,
    textAlign: 'left',
    flex: '1',
    paddingLeft: '0',
    minWidth: '0',
    whiteSpace: 'nowrap',
  },
  addButton: {
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 16px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: '12px',
    whiteSpace: 'nowrap',
    minWidth: 'fit-content',
  },
  description: {
    color: '#FFEBC8FF',
    fontSize: '16px',
    textAlign: 'left',
    paddingLeft: '0',
    marginLeft: '0'
  },
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

const SettingsPage = () => {
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [organizationName, setOrganizationName] = useState('');

  return (
    <div style={styles.pageContainer}>
      <div style={styles.settingsContainer}>
        <div style={styles.headerSection}>
          <Settings style={styles.pageIcon} size={24} />
          <h1 style={styles.pageTitle}>Settings</h1>
        </div>

        <div style={styles.selectSection}>
          <div style={styles.selectLabel}>Select an Organization</div>
          <select style={styles.select}>
            <option value="wootzapp">Wootzapp</option>
          </select>
        </div>
      </div>

      <div style={styles.organizationSection}>
        <div style={styles.organizationHeader}>
          <h2 style={styles.sectionTitle}>Your Organization</h2>
          <button style={styles.addButton} onClick={() => setShowCreateOrg(!showCreateOrg)}>
            + ADD NEW
          </button>
        </div>
        <p style={styles.description}>Manage your organization here!</p>

        {showCreateOrg && (
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
                style={styles.input}
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
              />
            </div>

            <div style={styles.buttonContainer}>
              <button 
                style={styles.cancelButton}
                onClick={() => {
                  setShowCreateOrg(false);
                  setOrganizationName('');
                }}
              >
                CANCEL
              </button>
              <button 
                style={styles.createButton}
                onClick={() => {
                  // Handle create logic here
                  setShowCreateOrg(false);
                  setOrganizationName('');
                }}
              >
                CREATE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage; 