import React, { useState, useEffect } from 'react';
import DeploymentsAPI from '../api/DeploymentsAPI';

const DeploymentDetails = ({ 
  selectedDeployment, 
  organizationId,
  onBackToList,
  refreshDeployments
}) => {
  // Add responsive state
  const [isMobile, setIsMobile] = useState(false);
  
  // State for Data Ingest
  const [editingDataIngest, setEditingDataIngest] = useState(false);
  const [editFields, setEditFields] = useState([]);
  const [editPrivateFields, setEditPrivateFields] = useState([]);
  const [editSelectedUserIdField, setEditSelectedUserIdField] = useState(null);

  // State for API Keys
  const [apiKeys, setApiKeys] = useState([]);
  const [apiKeyDescription, setApiKeyDescription] = useState('');
  const [visibleKeys, setVisibleKeys] = useState({});

  // State for Flags
  const [flags, setFlags] = useState([]);
  const [newFlagName, setNewFlagName] = useState('');
  const [newFlagField, setNewFlagField] = useState('');
  const [newFlagComparator, setNewFlagComparator] = useState('yes_no');

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (selectedDeployment) {
      // Load data needed for this deployment
      fetchFlags(selectedDeployment.id);
      fetchApiKeys(selectedDeployment.id);
      
      // Initialize edit states with current deployment data
      if (selectedDeployment.attributes.config?.fields) {
        setEditFields([...selectedDeployment.attributes.config.fields]);
      } else {
        setEditFields([]);
      }
      
      if (selectedDeployment.attributes.config?.private_fields) {
        setEditPrivateFields([...selectedDeployment.attributes.config.private_fields]);
      } else {
        setEditPrivateFields([]);
      }
      
      // Set user field index - find the index of the field that matches user_field
      const userFieldName = selectedDeployment.attributes.config?.user_field;
      if (userFieldName && selectedDeployment.attributes.config?.private_fields) {
        const userFieldIndex = selectedDeployment.attributes.config.private_fields.findIndex(
          field => field.name === userFieldName
        );
        setEditSelectedUserIdField(userFieldIndex >= 0 ? userFieldIndex : null);
      } else {
        setEditSelectedUserIdField(null);
      }
    }
  }, [selectedDeployment]);

  // Data Ingest Methods
  const handleEditDataIngest = () => {
    setEditingDataIngest(true);
    
    // Initialize edit state with current deployment data
    if (selectedDeployment.attributes.config?.fields) {
      setEditFields([...selectedDeployment.attributes.config.fields]);
    } else {
      setEditFields([]);
    }
    
    if (selectedDeployment.attributes.config?.private_fields) {
      setEditPrivateFields([...selectedDeployment.attributes.config.private_fields]);
    } else {
      setEditPrivateFields([]);
    }
    
    setEditSelectedUserIdField(selectedDeployment.attributes.config?.user_field ? selectedDeployment.attributes.config.private_fields.findIndex(field => field.name === selectedDeployment.attributes.config.user_field) : null);
  };

  const handleCancelDataIngestEdit = () => {
    setEditingDataIngest(false);
  };

  const addEditPrivateField = () => {
    setEditPrivateFields([...editPrivateFields, { name: '', type: 'string' }]);
  };

  const addEditField = () => {
    setEditFields([...editFields, { name: '', type: 'string' }]);
  };

  const removeEditPrivateField = (index) => {
    const newFields = [...editPrivateFields];
    newFields.splice(index, 1);
    
    // If we're removing the field that's selected as the user ID field, clear that selection
    if (editSelectedUserIdField === index) {
      setEditSelectedUserIdField(null);
    } else if (editSelectedUserIdField !== null && editSelectedUserIdField > index) {
      // If removing a field before the selected user ID field, adjust the index
      setEditSelectedUserIdField(editSelectedUserIdField - 1);
    }
    
    setEditPrivateFields(newFields);
  };

  const removeEditField = (index) => {
    const newFields = [...editFields];
    newFields.splice(index, 1);
    setEditFields(newFields);
  };

  const selectEditUserIdField = (index) => {
    setEditSelectedUserIdField(index);
  };

  const handleSaveDataIngest = async () => {
    try {
      // Get the user field name from the selected index
      const userFieldName = editSelectedUserIdField !== null && editPrivateFields[editSelectedUserIdField] 
        ? editPrivateFields[editSelectedUserIdField].name 
        : null;

      // Create a new config object with the updated schema
      const updatedConfig = {
        ...selectedDeployment.attributes.config,
        fields: editFields,
        private_fields: editPrivateFields,
        user_field: userFieldName
      };

      // Call the API to update the deployment
      await DeploymentsAPI.updateDeployment(
        organizationId,
        selectedDeployment.id,
        selectedDeployment.attributes.name,
        updatedConfig
      );

      // Exit edit mode and refresh the deployments list
      setEditingDataIngest(false);
      refreshDeployments();
    } catch (error) {
      console.error('Error saving data ingest configuration:', error);
      alert('Failed to save data ingest configuration. Please try again.');
    }
  };

  // Flag Methods
  const fetchFlags = async (deploymentId) => {
    try {
      const response = await DeploymentsAPI.getFlags(deploymentId);
      setFlags(response.data || []);
    } catch (error) {
      console.error('Error fetching flags:', error);
    }
  };

  const handleCreateFlag = async () => {
    if (!newFlagName || !newFlagField) {
      alert('Please provide a name and field for the flag');
      return;
    }

    try {
      await DeploymentsAPI.createFlag(
        selectedDeployment.id,
        newFlagName,
        newFlagField,
        newFlagComparator,
        true
      );

      // Reset form and refresh flags
      setNewFlagName('');
      setNewFlagField('');
      setNewFlagComparator('yes_no');
      fetchFlags(selectedDeployment.id);
    } catch (error) {
      console.error('Error creating flag:', error);
      alert('Failed to create flag. Please try again.');
    }
  };

  const handleToggleExistingFlag = (flagId, currentState) => {
    // This would need to be implemented with the API
    // For now, just re-fetch flags to show the change
    fetchFlags(selectedDeployment.id);
  };

  // API Keys Methods
  const fetchApiKeys = async (deploymentId) => {
    try {
      const response = await DeploymentsAPI.getApiKeys(deploymentId);
      setApiKeys(response.data || []);
      
      // Initialize visibility state for new keys
      const newVisibleKeys = { ...visibleKeys };
      response.data.forEach(key => {
        if (newVisibleKeys[key.id] === undefined) {
          newVisibleKeys[key.id] = false; // Default to hidden
        }
      });
      setVisibleKeys(newVisibleKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  const handleCreateApiKey = async () => {
    if (!apiKeyDescription.trim()) {
      alert('Please provide a description for the API key');
      return;
    }

    try {
      await DeploymentsAPI.createApiKey(
        selectedDeployment.id, 
        apiKeyDescription
      );
      
      // Reset form and refresh keys
      setApiKeyDescription('');
      fetchApiKeys(selectedDeployment.id);
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key. Please try again.');
    }
  };

  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await DeploymentsAPI.deleteApiKey(selectedDeployment.id, keyId);
      fetchApiKeys(selectedDeployment.id);
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key. Please try again.');
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys({
      ...visibleKeys,
      [keyId]: !visibleKeys[keyId]
    });
  };

  if (!selectedDeployment) {
    return null;
  }

  // Responsive styles based on screen size
  const styles = {
    deploymentDetails: {
      padding: isMobile ? '10px' : '20px',
      maxWidth: '100%',
      overflowX: 'hidden',
    },
    deploymentHeader: {
      marginBottom: isMobile ? '12px' : '20px',
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '8px' : '16px',
    },
    backButton: {
      padding: isMobile ? '6px 10px' : '8px 12px',
      fontSize: isMobile ? '14px' : '16px',
      marginBottom: isMobile ? '8px' : '0',
      cursor: 'pointer',
      backgroundColor: '#141C2F',
      color: '#FF7A00',
      border: '1px solid #FF7A00',
      borderRadius: '4px',
    },
    h2: {
      fontSize: isMobile ? '18px' : '24px',
      margin: isMobile ? '0 0 8px' : '0',
      color: '#FF7A00',
    },
    section: {
      marginBottom: isMobile ? '20px' : '32px',
      padding: isMobile ? '12px' : '20px',
      backgroundColor: '#141C2F',
      borderRadius: '8px',
      border: '1px solid #FFC35BFF',
    },
    h3: {
      fontSize: isMobile ? '16px' : '20px',
      marginBottom: isMobile ? '10px' : '16px',
      color: '#FF7A00',
    },
    h4: {
      fontSize: isMobile ? '14px' : '18px',
      marginBottom: isMobile ? '8px' : '12px',
      color: '#FFEBC8FF',
    },
    h5: {
      fontSize: isMobile ? '13px' : '16px',
      marginBottom: isMobile ? '6px' : '10px',
      color: '#FFEBC8FF',
    },
    fieldSection: {
      marginBottom: isMobile ? '12px' : '20px',
    },
    fieldRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      marginBottom: isMobile ? '10px' : '8px',
      gap: isMobile ? '6px' : '8px',
      alignItems: isMobile ? 'flex-start' : 'center',
      padding: isMobile ? '10px' : '8px',
      backgroundColor: '#1A2337',
      borderRadius: '4px',
    },
    inputFields: {
      width: isMobile ? '100%' : 'auto',
      padding: isMobile ? '8px' : '6px 10px',
      fontSize: isMobile ? '14px' : '16px',
      borderRadius: '4px',
      border: '1px solid #FFC35BFF',
      backgroundColor: '#1A2337',
      color: '#FFEBC8FF',
    },
    inputRow: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '8px' : '10px',
      marginBottom: isMobile ? '12px' : '16px',
      width: '100%',
    },
    button: {
      padding: isMobile ? '8px 10px' : '8px 16px',
      fontSize: isMobile ? '14px' : '16px',
      cursor: 'pointer',
      backgroundColor: '#FF7A00',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      marginTop: isMobile ? '8px' : '0',
    },
    secondaryButton: {
      padding: isMobile ? '8px 10px' : '8px 16px',
      fontSize: isMobile ? '14px' : '16px',
      cursor: 'pointer',
      backgroundColor: 'transparent',
      color: '#FFEBC8FF',
      border: '1px solid #FFC35BFF',
      borderRadius: '4px',
    },
    buttonRow: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '10px',
      marginTop: '16px',
      flexDirection: isMobile ? 'column' : 'row',
      width: isMobile ? '100%' : 'auto',
    },
    list: {
      listStyle: 'none',
      padding: '0',
      margin: '0',
    },
    listItem: {
      padding: isMobile ? '8px' : '10px',
      borderBottom: '1px solid rgba(255, 195, 91, 0.3)',
      fontSize: isMobile ? '14px' : '16px',
      color: '#FFEBC8FF',
    },
    apiKeyItem: {
      padding: isMobile ? '10px' : '16px',
      marginBottom: isMobile ? '8px' : '12px',
      border: '1px solid #FFC35BFF',
      borderRadius: '8px',
      backgroundColor: '#1A2337',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '10px' : '12px',
    },
    keyInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    keyDescription: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: 'bold',
      color: '#FFEBC8FF',
    },
    keyCreated: {
      fontSize: isMobile ? '12px' : '14px',
      color: 'rgba(255, 235, 200, 0.7)',
    },
    keyValue: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      backgroundColor: '#141C2F',
      padding: '8px',
      borderRadius: '4px',
      flexDirection: isMobile ? 'column' : 'row',
      alignItems: isMobile ? 'flex-start' : 'center',
    },
    code: {
      fontSize: isMobile ? '12px' : '14px',
      fontFamily: 'monospace',
      color: '#FFEBC8FF',
      wordBreak: 'break-all',
      width: '100%',
    },
    flagItem: {
      padding: isMobile ? '10px' : '16px',
      marginBottom: isMobile ? '8px' : '12px',
      border: '1px solid #FFC35BFF',
      borderRadius: '8px',
      backgroundColor: '#1A2337',
      display: 'flex',
      flexDirection: 'column',
      gap: isMobile ? '10px' : '12px',
    },
    flagInfo: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    flagName: {
      fontSize: isMobile ? '14px' : '16px',
      fontWeight: 'bold',
      color: '#FFEBC8FF',
    },
    flagField: {
      fontSize: isMobile ? '12px' : '14px',
      color: 'rgba(255, 235, 200, 0.7)',
    },
    userIdBadge: {
      backgroundColor: '#FF7A00',
      color: 'white',
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: isMobile ? '10px' : '12px',
      marginLeft: '6px',
    },
    radioLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: isMobile ? '12px' : '14px',
      color: '#FFEBC8FF',
    },
    radio: {
      margin: 0,
    },
  };

  return (
    <div style={styles.deploymentDetails}>
      <div style={styles.deploymentHeader}>
        <button style={styles.backButton} onClick={onBackToList}>
          &larr; Back to Deployments
        </button>
        <h2 style={styles.h2}>{selectedDeployment.attributes.name}</h2>
      </div>

      {/* Data Ingest Section */}
      <div style={styles.section}>
        <h3 style={styles.h3}>Data Ingest</h3>
        {!editingDataIngest ? (
          <div>
            <h4 style={styles.h4}>Schema Configuration</h4>
            <h5 style={styles.h5}>Public Fields</h5>
            <ul style={styles.list}>
              {selectedDeployment.attributes.config?.fields?.map((field, index) => (
                <li key={index} style={styles.listItem}>
                  {field.name} {field.type && `(${field.type})`}
                </li>
              ))}
              {(!selectedDeployment.attributes.config?.fields || selectedDeployment.attributes.config.fields.length === 0) && (
                <li style={{...styles.listItem, fontStyle: 'italic', opacity: 0.7}}>No public fields defined</li>
              )}
            </ul>
            
            <h5 style={styles.h5}>Private Fields</h5>
            <ul style={styles.list}>
              {selectedDeployment.attributes.config?.private_fields?.map((field, index) => (
                <li key={index} style={styles.listItem}>
                  {field.name} {field.type && `(${field.type})`}
                  {selectedDeployment.attributes.config?.user_field === field.name && 
                    <span style={styles.userIdBadge}>User ID Field</span>}
                </li>
              ))}
              {(!selectedDeployment.attributes.config?.private_fields || selectedDeployment.attributes.config.private_fields.length === 0) && (
                <li style={{...styles.listItem, fontStyle: 'italic', opacity: 0.7}}>No private fields defined</li>
              )}
            </ul>
            
            <button 
              style={{...styles.button, marginTop: '16px'}}
              onClick={handleEditDataIngest}
            >
              Edit Schema
            </button>
          </div>
        ) : (
          <div className="edit-data-ingest">
            <h4 style={styles.h4}>Edit Schema Configuration</h4>
            
            <div style={styles.fieldSection}>
              <h5 style={styles.h5}>Public Fields</h5>
              {editFields.map((field, index) => (
                <div key={index} style={styles.fieldRow}>
                  <input
                    style={styles.inputFields}
                    type="text"
                    value={field.name}
                    onChange={(e) => {
                      const newFields = [...editFields];
                      newFields[index].name = e.target.value;
                      setEditFields(newFields);
                    }}
                    placeholder="Field name"
                  />
                  <select
                    style={styles.inputFields}
                    value={field.type}
                    onChange={(e) => {
                      const newFields = [...editFields];
                      newFields[index].type = e.target.value;
                      setEditFields(newFields);
                    }}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <button 
                    style={{...styles.secondaryButton, width: isMobile ? '100%' : 'auto'}}
                    onClick={() => removeEditField(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                style={{...styles.button, marginTop: '10px'}}
                onClick={addEditField}
              >
                Add Field
              </button>
            </div>
            
            <div style={styles.fieldSection}>
              <h5 style={styles.h5}>Private Fields</h5>
              {editPrivateFields.map((field, index) => (
                <div key={index} style={styles.fieldRow}>
                  <input
                    style={styles.inputFields}
                    type="text"
                    value={field.name}
                    onChange={(e) => {
                      const newFields = [...editPrivateFields];
                      newFields[index].name = e.target.value;
                      setEditPrivateFields(newFields);
                    }}
                    placeholder="Field name"
                  />
                  <select
                    style={styles.inputFields}
                    value={field.type}
                    onChange={(e) => {
                      const newFields = [...editPrivateFields];
                      newFields[index].type = e.target.value;
                      setEditPrivateFields(newFields);
                    }}
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean</option>
                  </select>
                  <div style={styles.radioLabel}>
                    <input
                      style={styles.radio}
                      type="radio"
                      checked={editSelectedUserIdField === index}
                      onChange={() => selectEditUserIdField(index)}
                    />
                    <label>User ID Field</label>
                  </div>
                  <button 
                    style={{...styles.secondaryButton, width: isMobile ? '100%' : 'auto'}}
                    onClick={() => removeEditPrivateField(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                style={{...styles.button, marginTop: '10px'}}
                onClick={addEditPrivateField}
              >
                Add Private Field
              </button>
            </div>
            
            <div style={styles.buttonRow}>
              <button 
                style={styles.secondaryButton} 
                onClick={handleCancelDataIngestEdit}
              >
                Cancel
              </button>
              <button 
                style={styles.button} 
                onClick={handleSaveDataIngest}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* API Keys Section */}
      <div style={styles.section}>
        <h3 style={styles.h3}>API Keys</h3>
        
        <div style={styles.inputRow}>
          <input
            style={{...styles.inputFields, flex: 1}}
            type="text"
            value={apiKeyDescription}
            onChange={(e) => setApiKeyDescription(e.target.value)}
            placeholder="Key Description"
          />
          <button 
            style={{...styles.button, width: isMobile ? '100%' : 'auto'}}
            onClick={handleCreateApiKey}
          >
            Create API Key
          </button>
        </div>
        
        <div style={{marginTop: '20px'}}>
          <h4 style={styles.h4}>Existing API Keys</h4>
          {apiKeys.length === 0 ? (
            <p style={{color: '#FFEBC8FF', fontSize: isMobile ? '14px' : '16px', opacity: 0.7, textAlign: 'center', padding: '10px 0'}}>
              No API keys found. Create one above.
            </p>
          ) : (
            <ul style={styles.list}>
              {apiKeys.map(key => (
                <li key={key.id} style={styles.apiKeyItem}>
                  <div style={styles.keyInfo}>
                    <span style={styles.keyDescription}>{key.attributes.description}</span>
                    <span style={styles.keyCreated}>
                      Created: {new Date(key.attributes.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div style={styles.keyValue}>
                    <code style={styles.code}>
                      {visibleKeys[key.id] ? key.attributes.token : '••••••••••••••••'}
                    </code>
                    <button 
                      style={{...styles.secondaryButton, width: isMobile ? '100%' : 'auto'}}
                      onClick={() => toggleKeyVisibility(key.id)}
                    >
                      {visibleKeys[key.id] ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  <button 
                    style={{
                      ...styles.secondaryButton, 
                      backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                      borderColor: '#ff4444',
                      color: '#ff4444',
                      width: isMobile ? '100%' : 'auto',
                      alignSelf: isMobile ? 'stretch' : 'flex-end'
                    }}
                    onClick={() => handleDeleteApiKey(key.id)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Flags Section */}
      <div style={styles.section}>
        <h3 style={styles.h3}>Feature Flags</h3>
        
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? '8px' : '10px',
          marginBottom: '20px'
        }}>
          <input
            style={{...styles.inputFields, flex: 1}}
            type="text"
            value={newFlagName}
            onChange={(e) => setNewFlagName(e.target.value)}
            placeholder="Flag Name"
          />
          <input
            style={{...styles.inputFields, flex: 1}}
            type="text"
            value={newFlagField}
            onChange={(e) => setNewFlagField(e.target.value)}
            placeholder="Field Selector"
          />
          <select
            style={{...styles.inputFields, flex: isMobile ? 1 : 0.5}}
            value={newFlagComparator}
            onChange={(e) => setNewFlagComparator(e.target.value)}
          >
            <option value="yes_no">Yes/No</option>
            <option value="equals">Equals</option>
            <option value="contains">Contains</option>
          </select>
          <button 
            style={{...styles.button, width: isMobile ? '100%' : 'auto'}}
            onClick={handleCreateFlag}
          >
            Create Flag
          </button>
        </div>
        
        <div>
          <h4 style={styles.h4}>Existing Flags</h4>
          {flags.length === 0 ? (
            <p style={{color: '#FFEBC8FF', fontSize: isMobile ? '14px' : '16px', opacity: 0.7, textAlign: 'center', padding: '10px 0'}}>
              No flags found. Create one above.
            </p>
          ) : (
            <ul style={styles.list}>
              {flags.map(flag => (
                <li key={flag.id} style={styles.flagItem}>
                  <div style={styles.flagInfo}>
                    <span style={styles.flagName}>{flag.attributes.name}</span>
                    <span style={styles.flagField}>Field: {flag.attributes.field_selector}</span>
                    <span style={styles.flagField}>
                      Comparator: {flag.attributes.comparator}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: isMobile ? 'flex-start' : 'flex-end'
                  }}>
                    <label style={{
                      position: 'relative',
                      display: 'inline-block',
                      width: '40px',
                      height: '24px'
                    }}>
                      <input
                        type="checkbox"
                        checked={flag.attributes.active}
                        onChange={() => handleToggleExistingFlag(
                          flag.id, 
                          flag.attributes.active
                        )}
                        style={{
                          opacity: 0,
                          width: 0,
                          height: 0
                        }}
                      />
                      <span style={{
                        position: 'absolute',
                        cursor: 'pointer',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: flag.attributes.active ? '#FF7A00' : '#1A2337',
                        transition: '0.4s',
                        borderRadius: '12px',
                        border: '1px solid #FF7A00'
                      }}>
                        <span style={{
                          position: 'absolute',
                          content: '',
                          height: '16px',
                          width: '16px',
                          left: flag.attributes.active ? '20px' : '4px',
                          bottom: '3px',
                          backgroundColor: '#FFEBC8FF',
                          transition: '0.4s',
                          borderRadius: '50%'
                        }}></span>
                      </span>
                    </label>
                    <span style={{
                      color: '#FFEBC8FF',
                      fontSize: isMobile ? '12px' : '14px'
                    }}>
                      {flag.attributes.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Shared Access Groups Section - Placeholder */}
      <div style={styles.section}>
        <h3 style={styles.h3}>Shared Access Groups</h3>
        <p style={{color: '#FFEBC8FF', fontSize: isMobile ? '14px' : '16px', opacity: 0.7, textAlign: 'center', padding: '10px 0'}}>
          Shared access groups functionality will be implemented here.
        </p>
      </div>

      {/* Data Union Section - Placeholder */}
      <div style={styles.section}>
        <h3 style={styles.h3}>Data Union</h3>
        <p style={{color: '#FFEBC8FF', fontSize: isMobile ? '14px' : '16px', opacity: 0.7, textAlign: 'center', padding: '10px 0'}}>
          Data union functionality will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default DeploymentDetails;
