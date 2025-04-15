import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Plus, ChevronDown, MoreVertical, User, Eye, Edit, Trash, X, ThumbsUp, Key, Users, PlusCircle } from 'lucide-react';
import { createOrganization, getOrganizations, getOrganizationPermissions, getOrganizationDeployments } from '../api/OrganizationAPI';
import { useNavigate } from 'react-router-dom';
import DeploymentsAPI from '../api/DeploymentsAPI';
import styles from '../styles/DeploymentsPage.styles.js';

// Add this responsive style helper function
const getResponsiveStyles = (isMobile) => ({
  // Responsive styles that will be used throughout the component
  pageContainer: {
    padding: isMobile ? '10px' : '20px',
    maxWidth: '100%',
    boxSizing: 'border-box',
  },
  pageHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    padding: isMobile ? '10px' : '20px',
    alignItems: 'center',
    gap: isMobile ? '8px' : '12px',
  },
  // Many more style overrides would be defined here
});

const DeploymentsPage = () => {
  console.log('[RENDER] DeploymentPage rendering');
  
  // Add state for tracking window size
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth <= 768; // Consider mobile below 768px
  
  // Add responsive styles
  const responsiveStyles = getResponsiveStyles(isMobile);
  
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [hasOrganization, setHasOrganization] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Add state for deployments and selected deployment
  const [deployments, setDeployments] = useState([]);
  const [selectedDeployment, setSelectedDeployment] = useState(null);
  
  const [showCreateDeployment, setShowCreateDeployment] = useState(false);
  const [deploymentName, setDeploymentName] = useState('');
  const [deploymentStep, setDeploymentStep] = useState('name'); // 'name' or 'data-ingest'
  const [ingestAllFields, setIngestAllFields] = useState(true);
  const [privateFields, setPrivateFields] = useState([]);
  const [fields, setFields] = useState([]);
  const [newPrivateField, setNewPrivateField] = useState('');
  const [newField, setNewField] = useState('');
  const [userIdField, setUserIdField] = useState(null); // Index of the user ID field
  
  // For tracking component mounts and unmounts
  const componentMountCount = useRef(0);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Add state for editing mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedDeploymentName, setEditedDeploymentName] = useState('');
  
  // Add these new state variables near the top of your component
  const [editingOptIns, setEditingOptIns] = useState(false);
  const [consentDescription, setConsentDescription] = useState('');
  const [sourceField, setSourceField] = useState('');
  const [comparisonType, setComparisonType] = useState('yes_no');
  const [flags, setFlags] = useState([]);
  const [comparisonDropdownOpen, setComparisonDropdownOpen] = useState(false);
  const [flagActive, setFlagActive] = useState(true);
  
  // Add a state to track UI changes to flags (since we can't update them on the backend)
  const [flagUIStates, setFlagUIStates] = useState({});

  // Add these additional state variables near the top of the component
  const [editingDataIngest, setEditingDataIngest] = useState(false);
  const [editIngestAllFields, setEditIngestAllFields] = useState(true);
  const [editPrivateFields, setEditPrivateFields] = useState([]);
  const [editFields, setEditFields] = useState([]);
  const [editNewPrivateField, setEditNewPrivateField] = useState('');
  const [editNewField, setEditNewField] = useState('');
  const [editUserIdField, setEditUserIdField] = useState(null);
  
  // Add state variables at the beginning of your component
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [apiKeys, setApiKeys] = useState([]);
  const [isCreatingKey, setIsCreatingKey] = useState(false);

  // Add this state variable to your component
  const [visibleKeys, setVisibleKeys] = useState({});

  // Add this state variable to track input section visibility
  const [showApiKeyInputSection, setShowApiKeyInputSection] = useState(true);

  // Track component mounting and check for organization
  useEffect(() => {
    componentMountCount.current++;
    console.log(`[LIFECYCLE] Component mounted (${componentMountCount.current} times)`);
    
    // Check for existing organization
    checkForExistingOrganization();
    
    return () => {
      console.log('[LIFECYCLE] Component will unmount');
    };
  }, []);

  // Function to check if user has an existing organization
  const checkForExistingOrganization = async () => {
    console.log('[CHECK] Checking for existing organization');
    try {
      setLoading(true);
      const response = await getOrganizations();
      console.log('[CHECK] Organizations response:', response);
      
      if (response && response.data && response.data.length > 0) {
        console.log('[CHECK] Found organization in API response');
        setHasOrganization(true);
        
        // If organization exists, fetch deployments
        try {
          const organizationId = response.data[0].id;
          const deploymentsResponse = await DeploymentsAPI.getDeployments(organizationId);
          console.log('[CHECK] Deployments response:', deploymentsResponse);
          
          if (deploymentsResponse && deploymentsResponse.data && deploymentsResponse.data.length > 0) {
            setDeployments(deploymentsResponse.data);
            // Set the first deployment as selected by default
            setSelectedDeployment(deploymentsResponse.data[0]);
          }
        } catch (deploymentError) {
          console.error('[CHECK] Error fetching deployments:', deploymentError);
        }
      } else {
        console.log('[CHECK] No organizations found in API response');
        setHasOrganization(false);
        setDeployments([]);
      }
      setLoading(false);
    } catch (err) {
      console.error('[CHECK] Error checking for organizations:', err);
      setLoading(false);
    }
  };

  const handleDeploymentSelect = (deployment) => {
    setSelectedDeployment(deployment);
    if (deployment && deployment.id) {
      fetchFlags(deployment.id);
    }
  };

  const handleAddNew = () => {
    console.log('[UI] Add New button clicked');
    
    if (hasOrganization) {
      console.log('[UI] User has organization, showing create deployment modal');
      setShowCreateDeployment(true);
    } else {
      console.log('[UI] User has no organization, showing create org modal');
      setShowCreateOrg(true);
    }
  };

  const handleCreateOrganization = async () => {
    if (!organizationName.trim()) {
      console.log('[CREATE] No organization name entered');
      alert('Please enter an organization name');
      return;
    }

    console.log('[CREATE] Creating organization:', organizationName);
    try {
      setLoading(true);
      const result = await createOrganization(organizationName);
      console.log('[CREATE] Create organization API response:', result);
      
      if (result && result.data && result.data.id) {
        // Organization created successfully
        console.log('[CREATE] Organization created successfully');
        
        // Reset UI state
        setShowCreateOrg(false);
        setOrganizationName('');
        
        // Set hasOrganization to true immediately to update UI before navigation
        setHasOrganization(true);
        
        // Add debugging log to verify we're about to navigate
        console.log('[NAVIGATE] About to redirect to Settings page');
        
        // You could try these alternatives if the current navigation isn't working:
        
        // Option 1: Use navigate with a delay to ensure state is updated
        setTimeout(() => {
          console.log('[NAVIGATE] Executing delayed navigation to /settings');
          navigate('/dashboard/settings');
        }, 100);
        
        // Option 2: Try with window.location if React Router navigation fails
        // window.location.href = '/settings';
        
        // Option 3: Use a more specific path if your router uses nested routes
        // navigate('/app/settings');
      } else {
        console.error('[CREATE] Invalid organization creation response');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('[CREATE] Error creating organization:', error);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (deploymentStep === 'name') {
      if (!deploymentName.trim()) {
        alert('Please enter a deployment name');
        return;
      }
      // Move to data ingest step instead of creating
      setDeploymentStep('data-ingest');
    } else if (deploymentStep === 'data-ingest') {
      // Now create the deployment
      handleCreateDeployment();
    }
  };

  const handleBack = () => {
    setDeploymentStep('name');
  };

  const addPrivateField = () => {
    if (newPrivateField.trim()) {
      setPrivateFields([...privateFields, { name: newPrivateField }]);
      setNewPrivateField('');
    }
  };

  const addField = () => {
    if (newField.trim()) {
      setFields([...fields, { name: newField }]);
      setNewField('');
    }
  };

  const removePrivateField = (index) => {
    const updatedFields = [...privateFields];
    updatedFields.splice(index, 1);
    setPrivateFields(updatedFields);
    
    // If we're removing the current user ID field, reset it
    if (userIdField === index) {
      setUserIdField(null);
    } else if (userIdField !== null && userIdField > index) {
      // If we're removing a field before the current user ID field, adjust the index
      setUserIdField(userIdField - 1);
    }
  };

  const removeField = (index) => {
    const updatedFields = [...fields];
    updatedFields.splice(index, 1);
    setFields(updatedFields);
  };

  const selectUserIdField = (index) => {
    setUserIdField(index);
  };

  // Updated to include the form fields
  const handleCreateDeployment = async () => {
    try {
      setLoading(true);
      
      if (!ingestAllFields) {
        // When toggle is OFF - just show an alert and don't make API call
        alert('Please turn on "Ingest All Fields" to create a deployment');
        setLoading(false);
        return;
      }
      
      // Only proceed with API call if toggle is ON
      
      // Get the organization ID
      const orgResponse = await getOrganizations();
      const organizationId = orgResponse.data[0].id;
      
      // Create deployment config based on fields selected
      // Check if we have a user ID field selected
      let userFieldValue;
      
      // FIXED: Use editPrivateFields instead of privateFields
      if (editPrivateFields.length > 0 && editUserIdField !== null) {
        userFieldValue = editPrivateFields[editUserIdField].name;
      } else if (editPrivateFields.length > 0) {
        // No user ID selected, but we have private fields - use the first one
        userFieldValue = editPrivateFields[0].name;
      } else {
        // No private fields at all
        alert('At least one Private Field is required');
        setLoading(false);
        return;
      }
      
      // Make sure we have at least one field in each category
      // FIXED: Use editFields instead of fields
      if (editFields.length === 0) {
        alert('At least one Field is required');
        setLoading(false);
        return;
      }
      
      // Format the config to match the expected structure exactly
      // FIXED: Use editPrivateFields and editFields instead
      const config = {
        user_field: userFieldValue,
        fields: editFields.map(field => ({ name: field.name })),
        private_fields: editPrivateFields.map(field => ({ name: field.name }))
      };
      
      // Create the deployment with the exact format required
      const result = await DeploymentsAPI.createDeployment(
        organizationId,
        deploymentName,
        config
      );
      
      // Reset UI and finish
      setShowCreateDeployment(false);
      setDeploymentName('');
      setDeploymentStep('name');
      setIngestAllFields(true);
      setEditPrivateFields([]); // FIXED: Reset edit variables
      setEditFields([]); // FIXED: Reset edit variables
      setEditNewPrivateField(''); // FIXED: Reset edit variables
      setEditNewField(''); // FIXED: Reset edit variables
      setEditUserIdField(null); // FIXED: Reset edit variables
      
      // Refresh deployments
      checkForExistingOrganization();
      
      setLoading(false);
    } catch (error) {
      console.error('[CREATE] Error creating deployment:', error);
      setLoading(false);
      alert(`Failed to create deployment: ${error.message}`);
    }
  };

  // Function to handle dropdown toggle
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Function to select a deployment
  const selectDeployment = (deployment) => {
    setSelectedDeployment(deployment);
    setDropdownOpen(false);
  };

  // Function to enter edit mode
  const handleEditClick = () => {
    if (selectedDeployment) {
      setEditedDeploymentName(selectedDeployment.attributes?.name || '');
      setIsEditing(true);
    }
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedDeploymentName('');
  };

  // Function to save edited deployment name
  const handleSaveEdit = async () => {
    if (!editedDeploymentName.trim()) {
      alert('Please enter a deployment name');
      return;
    }

    try {
      setLoading(true);
      
      // Get the organization ID
      const orgResponse = await getOrganizations();
      const organizationId = orgResponse.data[0].id;
      
      // We need to include the existing config from the selected deployment
      const currentConfig = selectedDeployment.attributes.config;
      
      if (!currentConfig) {
        alert('Unable to update deployment: Missing configuration data');
        setLoading(false);
        return;
      }
      
      // Call the API to update the deployment with both name and config
      await DeploymentsAPI.updateDeployment(
        organizationId,
        selectedDeployment.id,
        editedDeploymentName,
        currentConfig
      );
      
      // Update the deployment in the local state
      const updatedDeployments = deployments.map(dep => {
        if (dep.id === selectedDeployment.id) {
          return {
            ...dep,
            attributes: {
              ...dep.attributes,
              name: editedDeploymentName
            }
          };
        }
        return dep;
      });
      
      setDeployments(updatedDeployments);
      setSelectedDeployment({
        ...selectedDeployment,
        attributes: {
          ...selectedDeployment.attributes,
          name: editedDeploymentName
        }
      });
      
      // Exit edit mode
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      console.error('[UPDATE] Error updating deployment:', error);
      setLoading(false);
      alert(`Failed to update deployment: ${error.message}`);
    }
  };

  // Function to handle delete button click
  const handleDeleteDeployment = async () => {
    try {
      setLoading(true);
      
      // Get the organization ID
      const orgResponse = await getOrganizations();
      const organizationId = orgResponse.data[0].id;
      
      // Call the API to delete the deployment
      await DeploymentsAPI.deleteDeployment(
        organizationId,
        selectedDeployment.id
      );
      
      // Update the local state by removing the deleted deployment
      const updatedDeployments = deployments.filter(dep => dep.id !== selectedDeployment.id);
      
      setDeployments(updatedDeployments);
      
      // If there are still deployments, select the first one
      if (updatedDeployments.length > 0) {
        setSelectedDeployment(updatedDeployments[0]);
      } else {
        setSelectedDeployment(null);
      }
      
      // Exit edit mode
      setIsEditing(false);
      
      setLoading(false);
    } catch (error) {
      console.error('[DELETE] Error deleting deployment:', error);
      setLoading(false);
      alert(`Failed to delete deployment: ${error.message}`);
    }
  };

  // Add a function to fetch flags when a deployment is selected
  const fetchFlags = async (deploymentId) => {
    try {
      const response = await DeploymentsAPI.getFlags(deploymentId);
      if (response && response.data) {
        setFlags(response.data);
      }
    } catch (error) {
      console.error('Error fetching flags:', error);
    }
  };

  // Add this effect to fetch flags when the selected deployment changes
  useEffect(() => {
    if (selectedDeployment && selectedDeployment.id) {
      fetchFlags(selectedDeployment.id);
    }
  }, [selectedDeployment]);

  // Add this function to handle creating a new flag
  const handleCreateFlag = async () => {
    if (!consentDescription || !sourceField) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      await DeploymentsAPI.createFlag(
        selectedDeployment.id,
        consentDescription,
        sourceField,
        comparisonType,
        flagActive
      );

      // Reset form fields
      setConsentDescription('');
      setSourceField('');
      
      // Refetch the flags to update the list
      await fetchFlags(selectedDeployment.id);
      setLoading(false);
    } catch (error) {
      console.error('Error creating flag:', error);
      setLoading(false);
      alert(`Failed to create flag: ${error.message}`);
    }
  };

  // Update the function to handle toggling existing flag checkboxes - removing the alert
  const handleToggleExistingFlag = (flagId, currentState) => {
    // Update the UI state
    setFlagUIStates({
      ...flagUIStates,
      [flagId]: !currentState
    });
    
    // Show feedback to the user that this is UI-only
    // alert("Note: This UI change is for demonstration only. The flag status cannot be updated on the backend as there is no update API available.");
  };

  // Function to handle clicking the Data Ingest edit button
  const handleEditDataIngest = () => {
    if (!selectedDeployment) return;
    
    // Initialize the edit form with the current config values
    const config = selectedDeployment.attributes?.config || {};
    
    setEditIngestAllFields(true); // Default to true 
    
    // Initialize private fields
    const privateFieldsArray = config.private_fields || [];
    setEditPrivateFields(privateFieldsArray.map(field => ({ name: field.name })));
    
    // Initialize regular fields
    const fieldsArray = config.fields || [];
    setEditFields(fieldsArray.map(field => ({ name: field.name })));
    
    // Find the index of the user ID field in the private fields
    const userField = config.user_field;
    const userFieldIndex = privateFieldsArray.findIndex(field => field.name === userField);
    setEditUserIdField(userFieldIndex >= 0 ? userFieldIndex : null);
    
    // Switch to edit mode
    setEditingDataIngest(true);
  };

  // Function to cancel editing
  const handleCancelDataIngestEdit = () => {
    setEditingDataIngest(false);
    setEditPrivateFields([]);
    setEditFields([]);
    setEditNewPrivateField('');
    setEditNewField('');
    setEditUserIdField(null);
  };

  // Functions for adding/removing fields during edit
  const addEditPrivateField = () => {
    if (editNewPrivateField.trim()) {
      setEditPrivateFields([...editPrivateFields, { name: editNewPrivateField }]);
      setEditNewPrivateField('');
    }
  };

  const addEditField = () => {
    if (editNewField.trim()) {
      setEditFields([...editFields, { name: editNewField }]);
      setEditNewField('');
    }
  };

  const removeEditPrivateField = (index) => {
    const updatedFields = [...editPrivateFields];
    updatedFields.splice(index, 1);
    setEditPrivateFields(updatedFields);
    
    // If we're removing the current user ID field, reset it
    if (editUserIdField === index) {
      setEditUserIdField(null);
    } else if (editUserIdField !== null && editUserIdField > index) {
      // If we're removing a field before the current user ID field, adjust the index
      setEditUserIdField(editUserIdField - 1);
    }
  };

  const removeEditField = (index) => {
    const updatedFields = [...editFields];
    updatedFields.splice(index, 1);
    setEditFields(updatedFields);
  };

  const selectEditUserIdField = (index) => {
    setEditUserIdField(index);
  };

  // Function to save the edited deployment configuration
  const handleSaveDataIngest = async () => {
    if (!selectedDeployment) return;

    try {
      setLoading(true);
      
      if (!editIngestAllFields) {
        alert('Please turn on "Ingest All Fields" to save the deployment');
        setLoading(false);
        return;
      }
      
      // Get the organization ID
      const orgResponse = await getOrganizations();
      const organizationId = orgResponse.data[0].id;
      
      // Check if we have a user ID field selected
      let userFieldValue;
      if (editPrivateFields.length > 0 && editUserIdField !== null) {
        userFieldValue = editPrivateFields[editUserIdField].name;
      } else if (editPrivateFields.length > 0) {
        // No user ID selected, but we have private fields - use the first one
        userFieldValue = editPrivateFields[0].name;
      } else {
        // No private fields at all
        alert('At least one Private Field is required');
        setLoading(false);
        return;
      }
      
      // Make sure we have at least one field in each category
      if (editFields.length === 0) {
        alert('At least one Field is required');
        setLoading(false);
        return;
      }
      
      // Create the new config object
      const updatedConfig = {
        user_field: userFieldValue,
        fields: editFields.map(field => ({ name: field.name })),
        private_fields: editPrivateFields.map(field => ({ name: field.name }))
      };
      
      // Update the deployment with new config but keep the same name
      await DeploymentsAPI.updateDeployment(
        organizationId,
        selectedDeployment.id,
        selectedDeployment.attributes.name,
        updatedConfig
      );
      
      // Update the selected deployment in state
      setSelectedDeployment({
        ...selectedDeployment,
        attributes: {
          ...selectedDeployment.attributes,
          config: updatedConfig
        }
      });
      
      // Update the deployment in the deployments list
      const updatedDeployments = deployments.map(dep => {
        if (dep.id === selectedDeployment.id) {
          return {
            ...dep,
            attributes: {
              ...dep.attributes,
              config: updatedConfig
            }
          };
        }
        return dep;
      });
      
      setDeployments(updatedDeployments);
      
      // Exit edit mode
      setEditingDataIngest(false);
      setLoading(false);
    } catch (error) {
      console.error('[UPDATE] Error updating deployment configuration:', error);
      setLoading(false);
      alert(`Failed to update deployment configuration: ${error.message}`);
    }
  };

  // Update the createApiKey function to handle the response correctly
  const handleCreateApiKey = async () => {
    if (!newKeyDescription.trim()) {
      alert('Please enter a description for the API key');
      return;
    }
    
    setIsCreatingKey(true);
    
    try {
      const result = await DeploymentsAPI.createApiKey(
        selectedDeployment.id, 
        newKeyDescription
      );
      
      // Add the new key to the state with the correct fields
      setApiKeys([...apiKeys, {
        id: result.data.id,
        description: result.data.attributes.description,
        key: result.data.attributes.api_key, // Updated to use api_key instead of token
        deploymentId: selectedDeployment.id
      }]);
      
      // Reset the form
      setNewKeyDescription('');
    } catch (error) {
      console.error('Error creating API key:', error);
      alert('Failed to create API key. Please try again.');
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Update the fetchApiKeys function to correctly map the response
  const fetchApiKeys = async () => {
    if (!selectedDeployment) return;
    
    try {
      const result = await DeploymentsAPI.getApiKeys(selectedDeployment.id);
      
      // Transform the data to match our state structure with the correct field names
      const transformedKeys = Array.isArray(result.data) 
        ? result.data.map(key => ({
            id: key.id || '',
            description: key.attributes?.description || '',
            key: key.attributes?.api_key || '', // Updated to use api_key
            deploymentId: selectedDeployment.id
          }))
        : result.data 
          ? [{ // Handle single object response
              id: result.data.id || '',
              description: result.data.attributes?.description || '',
              key: result.data.attributes?.api_key || '', // Updated to use api_key
              deploymentId: selectedDeployment.id
            }] 
          : [];
      
      setApiKeys(transformedKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
    }
  };

  // Add this effect to fetch API keys when the selected deployment changes
  useEffect(() => {
    if (selectedDeployment) {
      fetchApiKeys();
    }
  }, [selectedDeployment]);

  // Add this function to handle key deletion
  const handleDeleteApiKey = async (keyId) => {
    if (!window.confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }
    
    try {
      await DeploymentsAPI.deleteApiKey(selectedDeployment.id, keyId);
      
      // Remove the deleted key from state
      setApiKeys(apiKeys.filter(key => key.id !== keyId));
    } catch (error) {
      console.error('Error deleting API key:', error);
      alert('Failed to delete API key. Please try again.');
    }
  };

  // Add this function to toggle key visibility
  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  // Add effect to handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Main fixes for the UI issues

  // 1. Fix API Key display in the component
  // const toggleKeyVisibility = (keyId) => {
  //   setVisibleKeys(prev => ({
  //     ...prev,
  //     [keyId]: !prev[keyId]
  //   }));
  // };

  // 2. Update the API Keys section with better scrolling and formatting
  const renderApiKeysSection = () => (
    <div style={{
      background: '#141C2F',
      borderRadius: '12px',
      padding: '0',
      border: '1px solid rgba(255, 195, 91, 0.3)',
      marginBottom: '24px',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Add Button in top right */}
      <button 
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          background: 'transparent',
          border: '1px solid #FFC35BFF',
          color: '#FFC35BFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10
        }}
        onClick={() => setShowApiKeyInputSection(!showApiKeyInputSection)}
      >
        {showApiKeyInputSection ? <X size={16} /> : <Plus size={16} />}
      </button>

      {/* Header with icon and title */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 0',
        gap: '8px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          backgroundColor: '#FF7A00',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Key size={24} color="#FFFFFF" />
        </div>
        <h3 style={{
          color: '#FFEBC8FF',
          fontSize: '18px',
          margin: '0'
        }}>
          API Keys
        </h3>
      </div>

      {/* Input section - conditionally shown */}
      {showApiKeyInputSection && (
        <div style={{
          padding: '0 24px 24px 24px',
          display: 'flex',
          gap: '16px'
        }}>
          <input
            type="text"
            placeholder="New Description"
            value={newKeyDescription}
            onChange={(e) => setNewKeyDescription(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'transparent',
              border: '1px solid rgba(255, 195, 91, 0.3)',
              borderRadius: '6px',
              color: '#FFEBC8FF',
              fontSize: '14px'
            }}
          />
          <button
            style={{
              backgroundColor: '#FF7A00',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '0 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
            onClick={handleCreateApiKey}
            disabled={isCreatingKey}
          >
            <Plus size={16} />
            CREATE API KEY
          </button>
        </div>
      )}

      {/* API Keys content - now with vertical card layout */}
      <div style={{
        padding: '0 24px 24px',
        maxHeight: '400px',
        overflowY: 'auto'
      }}>
        {apiKeys.length > 0 ? (
          <div style={{ 
            width: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            gap: '16px'
          }}>
            {apiKeys.map(key => (
              <div key={key.id} style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                borderRadius: '8px',
                background: '#0F172A',
                border: '1px solid rgba(255, 195, 91, 0.15)'
              }}>
                {/* Description and Delete Button Row */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <div style={{ 
                    color: '#FFEBC8FF',
                    fontWeight: 'bold',
                    fontSize: '15px'
                  }}>
                    {key.description || 'No Description'}
                  </div>
                  <button
                    onClick={() => handleDeleteApiKey(key.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Trash size={16} color="#EF4444" />
                  </button>
                </div>
                
                {/* API Key Row */}
                <div style={{ marginBottom: '12px' }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#FFEBC8FF',
                    opacity: 0.7,
                    marginBottom: '4px'
                  }}>
                    API KEY
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(255, 195, 91, 0.05)',
                    padding: '8px 12px',
                    borderRadius: '4px'
                  }}>
                    <div style={{ 
                      fontFamily: 'monospace',
                      fontSize: '14px',
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#FFEBC8FF'
                    }}>
                      {visibleKeys[key.id] ? key.key : '•••••••••••••••••••••••'}
                    </div>
                    <Eye 
                      size={16} 
                      style={{ 
                        cursor: 'pointer', 
                        flexShrink: 0,
                        opacity: 0.8 
                      }} 
                      onClick={() => toggleKeyVisibility(key.id)}
                    />
                  </div>
                </div>
                
                {/* Deployment ID Row */}
                <div>
                  <div style={{
                    fontSize: '12px',
                    color: '#FFEBC8FF',
                    opacity: 0.7,
                    marginBottom: '4px'
                  }}>
                    DEPLOYMENT ID
                  </div>
                  <div style={{ 
                    fontSize: '14px',
                    color: '#FFEBC8FF',
                    padding: '4px 0'
                  }}>
                    {selectedDeployment?.id || 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ 
            color: '#FFEBC8FF', 
            opacity: 0.6,
            textAlign: 'center',
            fontSize: '14px',
            padding: '24px 0'
          }}>
            No API Keys found. Create one using the + button.
          </div>
        )}
      </div>
    </div>
  );

  // 3. Update the rendering of field containers to include proper scrolling
  const renderFieldContainer = (title, icon, fields, newField, setNewField, addField, removeField, 
    userIdField = null, selectUserIdField = null, isPrivate = false) => (
    <div style={{
      flex: 1,
      background: '#0F172A',
      borderRadius: '8px',
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      border: '1px solid rgba(255, 195, 91, 0.3)',
      height: '320px', // Fixed height
      maxHeight: '320px', // Fixed max height
      overflow: 'hidden' // Prevent outer container from expanding
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        background: '#FF7A00',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '8px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <h3 style={{
        color: '#FFFFFF',
        fontSize: '16px',
        margin: '0 0 12px 0',
        textAlign: 'center',
        flexShrink: 0
      }}>{title}</h3>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '16px',
          flexShrink: 0
        }}>
          <input 
            style={{
              flex: 1,
              padding: '10px',
              background: '#141C2F',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: '#FFEBC8FF'
            }}
            placeholder="Field Name"
            value={newField}
            onChange={(e) => setNewField(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                addField();
              }
            }}
          />
          <button 
            style={{
              width: '36px',
              height: '36px',
              background: '#FF7A00',
              borderRadius: '4px',
              border: 'none',
              color: '#FFFFFF',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            onClick={addField}
          >
            +
          </button>
        </div>

        {/* Field list container - scrollable */}
        <div style={{
          width: '100%',
          paddingRight: '4px',
          overflowY: 'auto', // Make scrollable
          flex: 1, // Take remaining space
          borderTop: fields.length > 0 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
          paddingTop: fields.length > 0 ? '8px' : '0'
        }}>
          {fields.map((field, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '8px',
                padding: '6px',
                borderRadius: '4px',
                background: '#141C2F'
              }}
            >
              <button
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#DC2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  cursor: 'pointer',
                  marginRight: '8px',
                  flexShrink: 0
                }}
                onClick={() => removeField(index)}
              >
                <X size={14} color="#FFFFFF" />
              </button>
              
              {isPrivate && selectUserIdField && (
                <button
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '4px',
                    background: userIdField === index ? '#FF7A00' : '#1F2A45',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                    marginRight: '8px',
                    flexShrink: 0
                  }}
                  onClick={() => selectUserIdField(index)}
                >
                  <User size={14} color="#FFFFFF" />
                </button>
              )}
              
              <span style={{
                color: '#FFEBC8FF',
                flex: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {field.name}
              </span>
            </div>
          ))}
          {fields.length === 0 && (
            <div style={{
              color: '#FFEBC8FF',
              opacity: 0.6,
              fontSize: '14px',
              textAlign: 'center',
              padding: '12px 0'
            }}>
              No fields added
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Then update the JSX in the return statement to use these helper functions
  return (
    <div style={{...styles.pageContainer, ...responsiveStyles.pageContainer}}>
      <div style={{
        ...styles.pageHeader,
        ...responsiveStyles.pageHeader,
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        {/* Left side - Title and Icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: isMobile ? '100%' : 'auto',
          justifyContent: isMobile ? 'center' : 'flex-start',
          marginBottom: isMobile ? '10px' : '0',
        }}>
          <Rocket style={styles.pageIcon} size={24} />
          <h1 style={{...styles.pageTitle, fontSize: isMobile ? '18px' : '24px'}}>Deployments</h1>
        </div>
        
        {/* Right side - Edit Form or Regular Dropdown and Buttons */}
        {hasOrganization && deployments.length > 0 ? (
          isEditing ? (
            // Edit Mode UI
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: '12px',
              width: isMobile ? '100%' : 'auto',
            }}>
              <div style={{
                position: 'relative',
                width: isMobile ? '100%' : '350px',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  backgroundColor: '#141C2F',
                  padding: '0 8px',
                  fontSize: '12px',
                  color: '#FFEBC8FF',
                  zIndex: 1
                }}>
                  Deployment Name
                </div>
                <input
                  type="text"
                  value={editedDeploymentName}
                  onChange={(e) => setEditedDeploymentName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px 12px',
                    backgroundColor: 'transparent',
                    color: '#FFEBC8FF',
                    border: '1px solid #FFC35BFF',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              
              {!isMobile && (
                <div style={{
                  position: 'relative',
                  marginLeft: '-5px',
                  marginTop: '6px',
                  fontSize: '14px',
                  color: '#FFEBC8FF',
                }}>
                  Updating Deployment
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: '10px',
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'space-between' : 'flex-start',
                marginTop: isMobile ? '10px' : '0',
              }}>
                {/* Save Button */}
                <button 
                  onClick={handleSaveEdit}
                  disabled={loading}
                  style={{
                    width: isMobile ? '33%' : '40px',
                    height: '40px',
                    backgroundColor: '#22C55E',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                
                {/* Cancel Button */}
                <button 
                  onClick={handleCancelEdit}
                  style={{
                    width: isMobile ? '33%' : '40px',
                    height: '40px',
                    backgroundColor: '#EF4444',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} color="#FFFFFF" />
                </button>
                
                {/* Delete Button */}
                <button 
                  onClick={handleDeleteDeployment}
                  disabled={loading}
                  style={{
                    width: isMobile ? '33%' : '40px',
                    height: '40px',
                    backgroundColor: '#141C2F',
                    borderRadius: '8px',
                    border: '1px solid #EF4444',
                    color: '#EF4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <Trash size={20} />
                </button>
              </div>
            </div>
          ) : (
            // Normal Mode UI - Dropdown and Buttons
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: '12px',
              width: isMobile ? '100%' : 'auto',
            }}>
              {/* Custom Deployment Dropdown */}
              <div style={{
                position: 'relative',
                width: isMobile ? '100%' : '350px',
                marginRight: isMobile ? '0' : '10px',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '20px',
                  backgroundColor: '#141C2F',
                  padding: '0 8px',
                  fontSize: '12px',
                  color: '#FFEBC8FF',
                  zIndex: 1
                }}>
                  Select a Deployment
                </div>
                
                {/* Dropdown header */}
                <div 
                  onClick={toggleDropdown}
                  style={{
                    width: '100%',
                    padding: '16px 12px',
                    backgroundColor: 'transparent',
                    color: '#FFEBC8FF',
                    border: '1px solid #FFC35BFF',
                    borderRadius: '8px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'relative',
                    boxSizing: 'border-box',
                  }}
                >
                  <span>
                    {selectedDeployment?.attributes?.name || 'Dep'}
                  </span>
                  <ChevronDown size={20} color="#FFEBC8FF" />
                </div>
                
                {/* Dropdown options */}
                {dropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 5px)',
                    left: 0,
                    width: '100%',
                    backgroundColor: '#1A2337',
                    border: '1px solid #FFC35BFF',
                    borderRadius: '8px',
                    zIndex: 10,
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}>
                    {deployments.map((deployment) => (
                      <div 
                        key={deployment.id}
                        onClick={() => selectDeployment(deployment)}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid rgba(255, 195, 91, 0.2)',
                          color: '#FFEBC8FF',
                          cursor: 'pointer',
                          backgroundColor: selectedDeployment?.id === deployment.id ? '#141C2F' : 'transparent',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {deployment.attributes?.name || 'Deployment'}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Button Container */}
              <div style={{
                display: 'flex',
                gap: '10px',
                flexShrink: 0,
                width: isMobile ? '100%' : 'auto',
                justifyContent: isMobile ? 'space-between' : 'flex-start',
                marginTop: isMobile ? '10px' : '0',
              }}>
                {/* Add New Button (Plus icon) */}
                <button 
                  onClick={handleAddNew}
                  style={{
                    width: isMobile ? '48%' : '40px',
                    height: '40px',
                    backgroundColor: '#FF7A00',
                    borderRadius: '8px',
                    border: 'none',
                    color: 'white',
                    fontSize: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Plus size={24} />
                </button>
                
                {/* Edit Button */}
                <button 
                  onClick={handleEditClick}
                  style={{
                    width: isMobile ? '48%' : '40px',
                    height: '40px',
                    backgroundColor: '#141C2F',
                    borderRadius: '8px',
                    border: '1px solid #FFC35BFF',
                    color: '#FFEBC8FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Edit size={20} />
                </button>
              </div>
            </div>
          )
        ) : null}
      </div>
      
      {hasOrganization && (
        <div style={{
          display: deployments.length > 0 ? 'none' : 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '24px',
          marginTop: '24px'
        }}>
          {/* Only show standalone Add New button when no deployments exist */}
          {deployments.length === 0 && (
            <button style={styles.addNewButton} onClick={handleAddNew}>
              <Plus size={16} />
              ADD NEW
            </button>
          )}
        </div>
      )}
      
      {loading && <p style={{textAlign: 'center', color: '#FFEBC8FF'}}>Loading...</p>}
      
      {!loading && (
        <div style={styles.organizationSection}>
          {hasOrganization ? (
            deployments.length === 0 ? (
              <p style={{color: '#FFEBC8FF', margin: '10px 0 0 0', fontSize: '16px'}}>
                You have no Deployments. Click <span style={{color: '#FF7A00'}}>+ Add New</span> above to add one.
              </p>
            ) : (
              <div>
                {/* Data Ingest Container */}
                <div style={{
                  background: '#141C2F',
                  borderRadius: '12px',
                  padding: isMobile ? '16px' : '24px',
                  border: '1px solid rgba(255, 195, 91, 0.3)',
                  position: 'relative',
                  marginBottom: '24px',
                  overflowX: isMobile ? 'auto' : 'visible', // Enable horizontal scrolling on mobile
                }}>
                  {!editingDataIngest ? (
                    // Regular display mode
                    <>
                      {/* Header with icon and title - CENTERED */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '36px',
                        borderBottom: '1px solid rgba(255, 195, 91, 0.2)',
                        paddingBottom: '24px'
                      }}>
                        <div style={{
                          width: '64px',
                          height: '64px',
                          backgroundColor: '#FF7A00',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '12px'
                        }}>
                          <span style={{
                            color: 'white',
                            fontSize: '28px',
                            fontWeight: 'bold'
                          }}>
                            {"{ }"}
                          </span>
                        </div>
                        <h3 style={{
                          color: '#FFEBC8FF',
                          fontSize: '18px',
                          margin: '0'
                        }}>
                          Data Ingest
                        </h3>
                        
                        {/* Edit Button */}
                        <button 
                          onClick={handleEditDataIngest}
                          style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '6px',
                            background: 'transparent',
                            border: '1px solid #FFC35BFF',
                            color: '#FFC35BFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                        >
                          <Edit size={16} />
                        </button>
                      </div>

                      {/* Field sections within the same container */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '32px'
                      }}>
                        {/* User Field Section */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            flex: 1
                          }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              backgroundColor: '#FF7A00',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <User size={24} color="#FFFFFF" />
                            </div>
                            <h3 style={{
                              color: '#FFEBC8FF',
                              fontSize: '18px',
                              margin: '0'
                            }}>
                              User Field
                            </h3>
                          </div>
                          <div style={{
                            color: '#FFEBC8FF',
                            fontSize: '14px',
                            opacity: 0.7,
                            flex: 1,
                            textAlign: 'center'
                          }}>
                            {selectedDeployment?.attributes?.config?.user_field || 'Not set'}
                          </div>
                          <div style={{ flex: 1 }}></div>
                        </div>
                        
                        {/* Private Fields Section */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            flex: 1
                          }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              backgroundColor: '#FF7A00',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <rect x="3" y="10" width="18" height="12" rx="2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <h3 style={{
                              color: '#FFEBC8FF',
                              fontSize: '18px',
                              margin: '0'
                            }}>
                              Private Fields
                            </h3>
                          </div>
                          <div style={{
                            color: '#FFEBC8FF',
                            fontSize: '14px',
                            opacity: 0.7,
                            flex: 1,
                            textAlign: 'center'
                          }}>
                            {selectedDeployment?.attributes?.config?.private_fields?.map(field => field.name).join(', ') || 'None'}
                          </div>
                          <div style={{ flex: 1 }}></div>
                        </div>
                        
                        {/* Anon Fields Section */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                        }}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            flex: 1
                          }}>
                            <div style={{
                              width: '48px',
                              height: '48px',
                              backgroundColor: '#FF7A00',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="5" width="20" height="14" rx="2" stroke="#FFFFFF" strokeWidth="2"/>
                                <path d="M2 10h20" stroke="#FFFFFF" strokeWidth="2"/>
                              </svg>
                            </div>
                            <h3 style={{
                              color: '#FFEBC8FF',
                              fontSize: '18px',
                              margin: '0'
                            }}>
                              Anon Fields
                            </h3>
                          </div>
                          <div style={{
                            color: '#FFEBC8FF',
                            fontSize: '14px',
                            opacity: 0.7,
                            flex: 1,
                            textAlign: 'center'
                          }}>
                            {selectedDeployment?.attributes?.config?.fields?.map(field => field.name).join(', ') || 'None'}
                          </div>
                          <div style={{ flex: 1 }}></div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Edit mode UI
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '24px',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px'
                        }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            backgroundColor: '#FF7A00',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{
                              color: 'white',
                              fontSize: '24px',
                              fontWeight: 'bold'
                            }}>
                              {"{ }"}
                            </span>
                          </div>
                          <h3 style={{
                            color: '#FFEBC8FF',
                            fontSize: '18px',
                            margin: '0'
                          }}>
                            Data Ingest
                          </h3>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          gap: '8px'
                        }}>
                          {/* Cancel Button */}
                          <button
                            onClick={handleCancelDataIngestEdit}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'transparent',
                              border: '1px solid #EF4444',
                              color: '#EF4444',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Cancel
                          </button>
                          
                          {/* Save Button */}
                          <button
                            onClick={handleSaveDataIngest}
                            disabled={loading}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#22C55E',
                              border: 'none',
                              color: 'white',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                      
                      {/* Ingest All Fields Toggle */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '24px'
                      }}>
                        <div 
                          style={{
                            position: 'relative',
                            width: '44px',
                            height: '24px',
                            borderRadius: '12px',
                            background: ingestAllFields ? '#FF7A00' : '#374151',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          onClick={() => setIngestAllFields(!ingestAllFields)}
                        >
                          {/* Toggle knob */}
                          <div style={{
                            position: 'absolute',
                            top: '2px',
                            left: ingestAllFields ? 'calc(100% - 20px - 2px)' : '2px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            background: '#FFFFFF',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                          }}></div>
                        </div>
                        <span style={{
                          color: '#FFEBC8FF',
                          fontSize: '16px'
                        }}>Ingest All Fields</span>
                      </div>
                      
                      {/* Field containers with fixed height */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '16px',
                        marginBottom: '24px',
                        flexDirection: isMobile ? 'column' : 'row',
                        maxHeight: isMobile ? 'auto' : '350px', // Height control for desktop
                      }}>
                        {/* For Private Fields */}
                        {renderFieldContainer(
                          'Private Fields',
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <rect x="3" y="10" width="18" height="12" rx="2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>,
                          editPrivateFields,
                          editNewPrivateField,
                          setEditNewPrivateField,
                          addEditPrivateField,
                          removeEditPrivateField,
                          editUserIdField,
                          selectEditUserIdField,
                          true  // isPrivate
                        )}
                        
                        {/* For Regular Fields */}
                        {renderFieldContainer(
                          'Fields',
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <rect x="2" y="5" width="20" height="14" rx="2" stroke="#FFFFFF" strokeWidth="2"/>
                              <path d="M2 10h20" stroke="#FFFFFF" strokeWidth="2"/>
                              <path d="M16 15h2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                          </svg>,
                          editFields,
                          editNewField,
                          setEditNewField,
                          addEditField,
                          removeEditField
                        )}
                          </div>

                      {/* Field identification helper text - only show when there are fields */}
                      {editPrivateFields.length > 0 && (
                        <div style={{
                          width: '100%',
                          textAlign: 'center',
                          margin: '12px 0',
                          color: '#FFEBC8FF',
                          fontSize: '14px'
                        }}>
                          * Click (<span style={{ color: '#FF7A00' }}>
                            <User size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                          </span>) to define which field is the User ID Field.
                        </div>
                      )}

                      {/* Duplicate field warning - shown conditionally */}
                      {editUserIdField !== null && editPrivateFields.length > 0 && editFields.some(field => 
                        field.name === editPrivateFields[editUserIdField].name
                      ) && (
                        <div style={{
                          width: '100%',
                          textAlign: 'center', 
                          margin: '12px 0 24px',
                          color: '#FF6B6B',
                          fontSize: '14px'
                        }}>
                          * Duplicate field found between anon and private fields...
                        </div>
                      )}

                      {/* Opt-In data table below */}
                      <div style={{ 
                        width: '100%',
                        borderTop: '1px solid rgba(255, 195, 91, 0.2)',
                        paddingTop: '24px',
                        marginTop: '8px'
                      }}>
                        {/* Table Headers */}
                        <div style={{
                          display: 'flex',
                          marginBottom: '12px',
                          borderBottom: '1px solid rgba(255, 195, 91, 0.2)',
                          paddingBottom: '8px'
                        }}>
                          <div style={{
                            flex: 3,
                            color: '#FFEBC8FF',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            paddingLeft: '8px'
                          }}>
                            CONSENT DESCRIPTION
                          </div>
                          <div style={{
                            flex: 2,
                            color: '#FFEBC8FF',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            paddingLeft: '8px'
                          }}>
                            SOURCE FIELD
                          </div>
                          <div style={{
                            flex: 2,
                            color: '#FFEBC8FF',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            paddingLeft: '8px'
                          }}>
                            COMPARISON
                          </div>
                          <div style={{
                            flex: 1,
                            color: '#FFEBC8FF',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            paddingLeft: '8px',
                            textAlign: 'center'
                          }}>
                            ACTIVE
                          </div>
                        </div>

                        {/* Opt-In Data Rows */}
                        {flags.map((flag, index) => {
                          // Determine if this flag has a UI override state, otherwise use its actual state
                          const isActive = flag.id in flagUIStates 
                            ? flagUIStates[flag.id] 
                            : flag.attributes?.active;
                          
                          return (
                            <div 
                              key={flag.id || index}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '12px 0',
                                borderBottom: '1px solid rgba(255, 195, 91, 0.1)'
                              }}
                            >
                              <div style={{ 
                                flex: 3, 
                                paddingLeft: '8px', 
                                color: '#FFEBC8FF',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {flag.attributes?.name || '12'}
                              </div>
                              <div style={{ 
                                flex: 2, 
                                paddingLeft: '8px', 
                                color: '#FFEBC8FF',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {flag.attributes?.field_selector || '121'}
                              </div>
                              <div style={{ 
                                flex: 2, 
                                paddingLeft: '8px', 
                                color: '#FFEBC8FF',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}>
                                {flag.attributes?.comparator === 'yes_no' ? 'Yes or No' : 
                                 flag.attributes?.comparator === 'truthy' ? 'Truthy' : 
                                 flag.attributes?.comparator || 'Yes or No'}
                              </div>
                              <div style={{ 
                                flex: 1, 
                                textAlign: 'center',
                                color: '#FFEBC8FF'
                              }}>
                                {/* Simple text instead of blue box */}
                                Active
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Opt-In Fields Section */}
                <div style={{
                  background: '#141C2F',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid rgba(255, 195, 91, 0.3)',
                  position: 'relative',
                  marginBottom: '24px',
                  textAlign: editingOptIns ? 'left' : 'center'
                }}>
                  {/* Edit/Close Button */}
                  <button 
                    style={{
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: 'transparent',
                      border: '1px solid #FFC35BFF',
                      color: '#FFC35BFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => setEditingOptIns(!editingOptIns)}
                  >
                    {editingOptIns ? <X size={16} /> : <Edit size={16} />}
                  </button>

                  {!editingOptIns ? (
                    <>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: '#FF7A00',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <ThumbsUp size={24} color="#FFFFFF" />
                      </div>
                      <h3 style={{
                        color: '#FFEBC8FF',
                        fontSize: '18px',
                        margin: '0 0 16px'
                      }}>
                        Opt-In Fields
                      </h3>
                      <div style={{
                        width: '100%',
                        height: '1px',
                        background: 'rgba(255, 195, 91, 0.2)',
                        margin: '16px 0'
                      }}></div>
                      <p style={{
                        color: '#FFEBC8FF',
                        fontSize: '14px',
                        opacity: 0.7,
                        margin: '0'
                      }}>
                        {flags.length > 0 ? `${flags.length} Opt-In${flags.length > 1 ? 's' : ''} Configured` : 'No Opt-Ins Configured'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '24px'
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          backgroundColor: '#FF7A00',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '16px'
                        }}>
                          <ThumbsUp size={24} color="#FFFFFF" />
                        </div>
                        <h3 style={{
                          color: '#FFEBC8FF',
                          fontSize: '18px',
                          margin: '0'
                        }}>
                          Opt-In Fields
                        </h3>
                      </div>

                      {/* Table Headers */}
                      <div style={{
                        display: 'flex',
                        marginBottom: '16px',
                        borderBottom: '1px solid rgba(255, 195, 91, 0.2)',
                        paddingBottom: '8px'
                      }}>
                        <div style={{
                          flex: 3,
                          color: '#FFEBC8FF',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          paddingLeft: '8px'
                        }}>
                          CONSENT DESCRIPTION
                        </div>
                        <div style={{
                          flex: 2,
                          color: '#FFEBC8FF',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          paddingLeft: '8px'
                        }}>
                          SOURCE FIELD
                        </div>
                        <div style={{
                          flex: 2,
                          color: '#FFEBC8FF',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          paddingLeft: '8px'
                        }}>
                          COMPARISON
                        </div>
                        <div style={{
                          flex: 1,
                          color: '#FFEBC8FF',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          paddingLeft: '8px',
                          textAlign: 'center'
                        }}>
                          ACTIVE
                        </div>
                        <div style={{ width: '40px' }}></div> {/* Space for the add button */}
                      </div>

                      {/* Add New Flag Row */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '16px'
                      }}>
                        {/* Description Input */}
                        <div style={{ flex: 3, paddingRight: '12px' }}>
                          <input
                            type="text"
                            placeholder="Description"
                            value={consentDescription}
                            onChange={(e) => setConsentDescription(e.target.value)}
                            style={{
                              width: '100%',
                              backgroundColor: '#1A2337',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              color: '#FFEBC8FF',
                              fontSize: '14px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        {/* Source Field Input */}
                        <div style={{ flex: 2, paddingRight: '12px' }}>
                          <input
                            type="text"
                            placeholder="Value"
                            value={sourceField}
                            onChange={(e) => setSourceField(e.target.value)}
                            style={{
                              width: '100%',
                              backgroundColor: '#1A2337',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              color: '#FFEBC8FF',
                              fontSize: '14px',
                              boxSizing: 'border-box',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}
                          />
                        </div>

                        {/* Comparison Dropdown */}
                        <div style={{ flex: 2, paddingRight: '12px', position: 'relative' }}>
                          <div 
                            onClick={() => setComparisonDropdownOpen(!comparisonDropdownOpen)}
                            style={{
                              backgroundColor: '#1A2337',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              color: '#FFEBC8FF',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              boxSizing: 'border-box',
                              width: '100%',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span style={{
                              textOverflow: 'ellipsis',
                              overflow: 'hidden',
                              maxWidth: 'calc(100% - 20px)'
                            }}>
                              {comparisonType === 'yes_no' ? 'Yes or No' : comparisonType}
                            </span>
                            <ChevronDown size={16} style={{ flexShrink: 0 }} />
                          </div>
                          
                          {comparisonDropdownOpen && (
                            <div style={{
                              position: 'absolute',
                              top: 'calc(100% + 4px)',
                              left: 0,
                              right: '12px',
                              backgroundColor: '#1A2337',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '4px',
                              zIndex: 10,
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
                            }}>
                              <div 
                                onClick={() => {
                                  setComparisonType('yes_no');
                                  setComparisonDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  color: '#FFEBC8FF',
                                  backgroundColor: comparisonType === 'yes_no' ? 'rgba(255, 122, 0, 0.1)' : 'transparent',
                                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                Yes or No
                              </div>
                              <div 
                                onClick={() => {
                                  setComparisonType('truthy');
                                  setComparisonDropdownOpen(false);
                                }}
                                style={{
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  color: '#FFEBC8FF',
                                  backgroundColor: comparisonType === 'truthy' ? 'rgba(255, 122, 0, 0.1)' : 'transparent',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                Truthy
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Active Toggle */}
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <div 
                            style={{
                              width: '24px',
                              height: '24px',
                              backgroundColor: flagActive ? '#2196F3' : '#1A2337',
                              borderRadius: '4px',
                              margin: '0 auto',
                              border: flagActive ? 'none' : '1px solid #FF7A00',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                            onClick={() => setFlagActive(!flagActive)}
                          >
                            {flagActive && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                        </div>

                        {/* Add Button */}
                        <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                          <button
                            onClick={handleCreateFlag}
                            disabled={loading}
                            style={{
                              width: '24px',
                              height: '24px',
                              backgroundColor: '#22C55E',
                              borderRadius: '4px',
                              border: 'none',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer'
                            }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Existing Flags */}
                      {flags.map((flag, index) => {
                        // Determine if this flag has a UI override state, otherwise use its actual state
                        const isActive = flag.id in flagUIStates 
                          ? flagUIStates[flag.id] 
                          : flag.attributes?.active;
                        
                        return (
                          <div 
                            key={flag.id || index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              marginBottom: '8px',
                              borderBottom: index < flags.length - 1 ? '1px solid rgba(255, 195, 91, 0.1)' : 'none',
                              paddingBottom: '8px'
                            }}
                          >
                            <div style={{ 
                              flex: 3, 
                              paddingLeft: '8px', 
                              paddingRight: '12px',
                              color: '#FFEBC8FF',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {flag.attributes?.name || '12'}
                            </div>
                            <div style={{ 
                              flex: 2, 
                              paddingLeft: '8px', 
                              paddingRight: '12px',
                              color: '#FFEBC8FF',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {flag.attributes?.field_selector || '121'}
                            </div>
                            <div style={{ 
                              flex: 2, 
                              paddingLeft: '8px', 
                              paddingRight: '12px',
                              color: '#FFEBC8FF',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {flag.attributes?.comparator === 'yes_no' ? 'Yes or No' : 
                               flag.attributes?.comparator === 'truthy' ? 'Truthy' : 
                               flag.attributes?.comparator || 'Yes or No'}
                            </div>
                            <div style={{ flex: 1, textAlign: 'center' }}>
                              <div 
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  backgroundColor: isActive ? '#2196F3' : '#1A2337',
                                  borderRadius: '4px',
                                  margin: '0 auto',
                                  border: isActive ? 'none' : '1px solid #FF7A00',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleToggleExistingFlag(flag.id, isActive)}
                              >
                                {isActive && (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div style={{ width: '40px' }}></div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {/* API Keys Section */}
                {renderApiKeysSection()}

                {/* Shared Access Groups Section */}
                <div style={{
                  background: '#141C2F',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid rgba(255, 195, 91, 0.3)',
                  position: 'relative',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  {/* Add Button */}
                  <button style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #FFC35BFF',
                    color: '#FFC35BFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Plus size={16} />
                  </button>

                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#FF7A00',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <Users size={24} color="#FFFFFF" />
                  </div>
                  <h3 style={{
                    color: '#FFEBC8FF',
                    fontSize: '18px',
                    margin: '0 0 16px'
                  }}>
                    Shared Access Groups
                  </h3>
                  <div style={{
                    width: '100%',
                    height: '1px',
                    background: 'rgba(255, 195, 91, 0.2)',
                    margin: '16px 0'
                  }}></div>
                  <p style={{
                    color: '#FFEBC8FF',
                    fontSize: '14px',
                    opacity: 0.7,
                    margin: '0'
                  }}>
                    No Groups Created
                  </p>
                </div>

                {/* Data Unions Section */}
                <div style={{
                  background: '#141C2F',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '1px solid rgba(255, 195, 91, 0.3)',
                  position: 'relative',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  {/* Add Button */}
                  <button style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid #FFC35BFF',
                    color: '#FFC35BFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <Plus size={16} />
                  </button>

                  <div style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: '#FF7A00',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px'
                  }}>
                    <PlusCircle size={24} color="#FFFFFF" />
                  </div>
                  <h3 style={{
                    color: '#FFEBC8FF',
                    fontSize: '18px',
                    margin: '0 0 16px'
                  }}>
                    Data Unions
                  </h3>
                  <div style={{
                    width: '100%',
                    height: '1px',
                    background: 'rgba(255, 195, 91, 0.2)',
                    margin: '16px 0'
                  }}></div>
                  <p style={{
                    color: '#FFEBC8FF',
                    fontSize: '14px',
                    opacity: 0.7,
                    margin: '0'
                  }}>
                    Not Shared With Any Data Union
                  </p>
                </div>
              </div>
            )
          ) : (
            <p style={{color: '#FFEBC8FF', margin: '10px 0 0 0', fontSize: '16px'}}>
              To get started add an <a style={styles.addNewLink} onClick={handleAddNew}>organization</a>.
            </p>
          )}
        </div>
      )}

      {showCreateDeployment && (
        <div style={styles.modalOverlay}>
          <div style={{
            background: '#141C2F',
            borderRadius: '12px',
            maxWidth: '800px',
            width: isMobile ? '95%' : '90%', 
            maxHeight: '90vh',
            overflowY: 'auto',
            margin: '0 auto',
            border: '1px solid rgba(255, 195, 91, 0.3)',
            position: 'relative'
          }}>
            {/* Header - removed the cancel button */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  background: '#FF7A00',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Rocket size={24} color="#FFFFFF" />
                </div>
                <div>
                  <h1 style={{
                    fontSize: '22px',
                    margin: '0',
                    color: '#FFEBC8FF'
                  }}>Create A Deployment</h1>
                  <p style={{
                    margin: '0',
                    color: '#FFEBC8FF',
                    opacity: 0.8
                  }}>Test</p>
                </div>
              </div>
            </div>

            {/* Content container */}
            <div style={{ padding: '20px' }}>
              {/* Progress indicator - changed to orange theme */}
              <div style={{
                background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                position: 'relative',
                border: '1px solid #FFC35BFF'
              }}>
                {/* Line connecting steps */}
                <div style={{
                  position: 'absolute',
                  height: '2px',
                  background: '#FFFFFF',
                  top: '50%',
                  left: '70px',
                  right: '70px',
                  zIndex: 0
                }}></div>
                
                {/* Step 1: NAME */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: '#FFFFFF',
                    borderRadius: '50%',
                    marginBottom: '8px'
                  }}></div>
                  <span style={{
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>NAME</span>
                </div>
                
                {/* Step 2: DATA INGEST */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    background: '#FFFFFF',
                    borderRadius: '50%',
                    marginBottom: '8px'
                  }}></div>
                  <span style={{
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>DATA INGEST</span>
                </div>
              </div>

              {/* Name Step Form */}
              {deploymentStep === 'name' && (
                <>
                  <div style={styles.formSection}>
                    <h2 style={styles.formTitle}>Let's start with the basic information</h2>
                    <p style={styles.formSubtitle}>What's the name of the Deployment?</p>

                    <label style={styles.inputLabel}>Deployment Name</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={deploymentName}
                      onChange={(e) => setDeploymentName(e.target.value)}
                      placeholder="Enter deployment name"
                    />
                  </div>

                  <div style={styles.buttonContainer}>
                    <button 
                      style={styles.cancelButton}
                      onClick={() => {
                        setShowCreateDeployment(false);
                        setDeploymentName('');
                        setDeploymentStep('name');
                      }}
                      disabled={loading}
                    >
                      CANCEL
                    </button>
                    <button 
                      style={styles.createButton}
                      onClick={handleNext}
                      disabled={loading}
                    >
                      {loading ? 'PROCESSING...' : 'NEXT'}
                    </button>
                  </div>
                </>
              )}

              {/* Data Ingest Step Form */}
              {deploymentStep === 'data-ingest' && (
                <>
                  <div style={{
                    textAlign: 'center',
                    color: '#FFEBC8FF',
                    marginBottom: '24px'
                  }}>
                    <h2 style={{
                      fontSize: '24px',
                      margin: '0 0 8px 0'
                    }}>Data Ingest</h2>
                    <p style={{
                      fontSize: '14px',
                      opacity: 0.8,
                      margin: 0
                    }}>(You can adjust this later)</p>
                  </div>

                  {/* Ingest All Fields Toggle - Updated to orange theme */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div 
                      style={{
                        position: 'relative',
                        width: '44px',
                        height: '24px',
                        borderRadius: '12px',
                        background: ingestAllFields ? '#FF7A00' : '#374151',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                      onClick={() => setIngestAllFields(!ingestAllFields)}
                    >
                      {/* Toggle knob */}
                      <div style={{
                        position: 'absolute',
                        top: '2px',
                        left: ingestAllFields ? 'calc(100% - 20px - 2px)' : '2px',
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#FFFFFF',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
                      }}></div>
                    </div>
                    <span style={{
                      color: '#FFEBC8FF',
                      fontSize: '16px'
                    }}>Ingest All Fields</span>
                  </div>

                  {/* Field containers with fixed height */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '16px',
                    marginBottom: '24px',
                    flexDirection: isMobile ? 'column' : 'row',
                    maxHeight: isMobile ? 'auto' : '350px', // Height control for desktop
                  }}>
                    {/* For Private Fields */}
                    {renderFieldContainer(
                      'Private Fields',
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 16a4 4 0 100-8 4 4 0 000 8z" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <rect x="3" y="10" width="18" height="12" rx="2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>,
                      editPrivateFields,
                      editNewPrivateField,
                      setEditNewPrivateField,
                      addEditPrivateField,
                      removeEditPrivateField,
                      editUserIdField,
                      selectEditUserIdField,
                      true  // isPrivate
                    )}
                    
                    {/* For Regular Fields */}
                    {renderFieldContainer(
                      'Fields',
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="2" y="5" width="20" height="14" rx="2" stroke="#FFFFFF" strokeWidth="2"/>
                            <path d="M2 10h20" stroke="#FFFFFF" strokeWidth="2"/>
                            <path d="M16 15h2" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                      </svg>,
                      editFields,
                      editNewField,
                      setEditNewField,
                      addEditField,
                      removeEditField
                    )}
                        </div>

                  {/* Field identification helper text - only show when there are fields */}
                  {editPrivateFields.length > 0 && (
                    <div style={{
                      width: '100%',
                      textAlign: 'center',
                      margin: '12px 0',
                      color: '#FFEBC8FF',
                      fontSize: '14px'
                    }}>
                      * Click (<span style={{ color: '#FF7A00' }}>
                        <User size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      </span>) to define which field is the User ID Field.
                    </div>
                  )}

                  {/* Duplicate field warning - shown conditionally */}
                  {editUserIdField !== null && editPrivateFields.length > 0 && editFields.some(field => 
                    field.name === editPrivateFields[editUserIdField].name
                  ) && (
                  <div style={{
                    width: '100%',
                    textAlign: 'center', 
                      margin: '12px 0 24px',
                    color: '#FF6B6B',
                    fontSize: '14px'
                  }}>
                    * Duplicate field found between anon and private fields...
                  </div>
                  )}

                  {/* Footer buttons - updated colors */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '16px 0'
                  }}>
                    <button 
                      style={{
                        background: 'transparent',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '10px 20px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setShowCreateDeployment(false);
                        setDeploymentName('');
                        setDeploymentStep('name');
                      }}
                      disabled={loading}
                    >
                      CANCEL
                    </button>
                    
                    <div style={{
                      display: 'flex',
                      gap: '12px'
                    }}>
                      <button 
                        style={{
                          background: '#1A2337',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          padding: '10px 24px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                        onClick={handleBack}
                        disabled={loading}
                      >
                        BACK
                      </button>
                      <button 
                        style={{
                          background: '#FF7A00',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '10px 24px',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                        onClick={handleCreateDeployment}
                        disabled={loading}
                      >
                        {loading ? 'CREATING...' : 'CREATE'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showCreateOrg && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContainer}>
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
                  console.log('[UI] Cancel button clicked');
                  setShowCreateOrg(false);
                  setOrganizationName('');
                }}
                disabled={loading}
              >
                CANCEL
              </button>
              <button 
                style={styles.createButton}
                onClick={handleCreateOrganization}
                disabled={loading}
              >
                {loading ? 'CREATING...' : 'CREATE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentsPage; 
