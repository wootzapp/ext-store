import React, { useState, useEffect } from 'react';
import { createOrganization, enrollUser } from '../api/OrganizationAPI';
import { X } from 'lucide-react';

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

export const EnrollUser = ({ onClose, organizationId, onUserEnrolled }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [permissions, setPermissions] = useState({
    admin: false,
    read: false,
    write: false
  });
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [error, setError] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);

  const permissionInfo = {
    admin: "The admin permission will allow all, EXCEPT removing the owner from or deleting the Organization. Check this if they need to be able to add users.",
    read: "The read permission allows the user to see the permissions of other users in this Organization.",
    write: "The write permission includes read, but will also allow them to make changes to Organization, but does not allow them to add users."
  };

  const handleBack = () => {
    setStep(1);
    setActiveTooltip(null);
  };

  const handleCreate = async () => {
    try {
      setError('');
      setIsEnrolling(true);

      await enrollUser(organizationId, email, permissions);
      
      // Call the callback to refresh the users list
      if (onUserEnrolled) {
        await onUserEnrolled();
      }
      
      onClose();
    } catch (error) {
      setError(error.message || 'Failed to enroll user');
      console.error('Error enrolling user:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const renderContent = () => {
    if (step === 1) {
      return (
        <>
          <h3 style={{
            color: '#FFEBC8FF',
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
          }}>
            Let's start with the basic information
          </h3>
          <p style={{
            color: '#FFEBC8FF',
            margin: 0,
            fontSize: '14px',
            marginBottom: '16px',
          }}>
            What's their Email?
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Email Address"
            style={{
              background: 'transparent',
              border: `1px solid ${error ? '#ff4444' : '#FFC35BFF'}`,
              borderRadius: '4px',
              padding: '8px 12px',
              color: '#FFEBC8FF',
              fontSize: '14px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px' }}>
              {error}
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <h3 style={{
          color: '#FFEBC8FF',
          margin: 0,
          fontSize: '18px',
          fontWeight: 'bold',
        }}>
          Add some permissions!
        </h3>
        <p style={{
          color: '#FFEBC8FF',
          margin: 0,
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          What do you want this user to have access to?
        </p>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          {/* Permission Items */}
          {['Admin', 'Read', 'Write'].map((permission) => (
            <div
              key={permission.toLowerCase()}
              style={{
                position: 'relative',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px',
                  background: '#141C2F',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
                onClick={() => setPermissions(prev => ({
                  ...prev,
                  [permission.toLowerCase()]: !prev[permission.toLowerCase()]
                }))}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  border: '1px solid #FFC35BFF',
                  background: permissions[permission.toLowerCase()] ? '#FF7A00' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}>
                  {permissions[permission.toLowerCase()] && '✓'}
                </div>
                <span style={{
                  color: '#FFEBC8FF',
                  fontSize: '14px',
                }}>
                  {permission}
                </span>
                <div 
                  style={{
                    marginLeft: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: '#2C3B5C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    color: '#FFEBC8FF',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTooltip(activeTooltip === permission.toLowerCase() ? null : permission.toLowerCase());
                  }}
                >
                  i
                </div>
              </div>
              {/* Tooltip */}
              {activeTooltip === permission.toLowerCase() && (
                <div style={{
                  position: 'fixed',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: '#2C3B5C',
                  border: '1px solid #FFC35BFF',
                  borderRadius: '4px',
                  padding: '10px 12px',
                  width: '220px',
                  color: '#FFEBC8FF',
                  fontSize: '13px',
                  zIndex: 1000,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  lineHeight: '1.4',
                }}
                onClick={(e) => e.stopPropagation()}
                >
                  {permissionInfo[permission.toLowerCase()]}
                </div>
              )}
            </div>
          ))}
        </div>
      </>
    );
  };

  // Add click handler to close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeTooltip !== null) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeTooltip]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#1A2337',
        border: '1px solid #FFC35BFF',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '320px',
        margin: '0 20px',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <h2 style={{
              color: '#FFEBC8FF',
              margin: 0,
              fontSize: '24px',
              fontWeight: 'bold',
            }}>
              Enroll a User
            </h2>
            <p style={{
              color: '#FFEBC8FF',
              margin: 0,
              fontSize: '16px',
              opacity: 0.8,
            }}>
              Just need some info...
            </p>
          </div>

          {/* Progress Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px',
            background: '#2C3B5C',
            borderRadius: '8px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flex: 1,
            }}>
              {/* Step 1 Circle */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: step >= 1 ? '#FF7A00' : '#FFEBC8',
                marginRight: '8px',
              }} />
              <span style={{
                color: '#FFEBC8FF',
                fontSize: '14px',
                fontWeight: step === 1 ? 'bold' : 'normal',
              }}>
                USER INFORMATION
              </span>
              {/* Progress Line */}
              <div style={{
                flex: 1,
                height: '2px',
                background: step > 1 ? '#FF7A00' : '#FFEBC8',
                margin: '0 8px',
              }} />
              {/* Step 2 Circle */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: step >= 2 ? '#FF7A00' : '#FFEBC8',
                marginRight: '8px',
              }} />
              <span style={{
                color: '#FFEBC8FF',
                fontSize: '14px',
                fontWeight: step === 2 ? 'bold' : 'normal',
              }}>
                PERMISSIONS
              </span>
            </div>
          </div>

          {/* Content Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {renderContent()}
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '16px',
          }}>
            {step === 2 && (
              <button
                onClick={handleBack}
                style={{
                  background: '#1A2337',
                  border: '1px solid #FFC35BFF',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  color: '#FFEBC8FF',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  flex: 1,
                }}
                disabled={isEnrolling}
              >
                BACK
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#1A2337',
                border: '1px solid #FFC35BFF',
                borderRadius: '4px',
                padding: '8px 16px',
                color: '#FFEBC8FF',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                flex: 1,
              }}
              disabled={isEnrolling}
            >
              CANCEL
            </button>
            <button
              onClick={step === 1 ? () => {
                if (!email.trim()) {
                  setError('Email is required');
                  return;
                }
                if (!email.includes('@')) {
                  setError('Invalid email address');
                  return;
                }
                setStep(2);
              } : handleCreate}
              style={{
                background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
                border: 'none',
                borderRadius: '4px',
                padding: '8px 16px',
                color: '#FFFFFF',
                cursor: isEnrolling ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(255, 122, 0, 0.3)',
                flex: 1,
                opacity: isEnrolling ? 0.7 : 1,
              }}
              disabled={isEnrolling}
            >
              {step === 1 ? 'NEXT' : (isEnrolling ? 'CREATING...' : 'CREATE')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization; 