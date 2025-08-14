import React, { useState, useEffect, useRef } from 'react';
import { Settings, ChevronDown, MoreVertical, User, Eye, Edit, Trash, Plus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOrganizations, getOrganizationDetails, updateOrganization, deleteOrganization, getCurrentUser, updateUserPermissions } from '../api/OrganizationAPI';
import DeploymentsAPI from '../api/DeploymentsAPI';
import CreateOrganization, { EnrollUser } from '../components/CreateOrganization';
import styles from '../styles/SettingsPage.styles';

/**
 * SettingsPage Component
 * Main settings page that displays organization management interface
 * Handles organization selection, user management, and deployment information
 */
const SettingsPage = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  
  // State for managing organization creation modal
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  
  // State for managing expandable sections
  const [usersExpanded, setUsersExpanded] = useState(true);
  const [deploymentsExpanded, setDeploymentsExpanded] = useState(true);
  
  // State for managing organizations and users data
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for managing dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // State for managing inline editing
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState('');
  const editInputRef = useRef(null);

  // State for managing delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // State for managing user enrollment modal
  const [showEnrollUser, setShowEnrollUser] = useState(false);

  // Add new state variables
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(null);
  const [showUpdatePermissions, setShowUpdatePermissions] = useState(false);
  const userDropdownRef = useRef(null);

  // State for managing current user
  const [currentUser, setCurrentUser] = useState(null);

  // State for managing permission updates
  const [updatingPermissions, setUpdatingPermissions] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState({
    admin: false,
    read: false,
    write: false
  });

  // Add state for managing deployments data
  const [deployments, setDeployments] = useState([]);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [isEditing]);

  // Add useEffect for handling clicks outside user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Add useEffect to fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await getCurrentUser();
        setCurrentUser(response.data);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Add useEffect to set initial permissions when selectedUser changes
  useEffect(() => {
    if (selectedUser) {
      setSelectedPermissions({
        admin: selectedUser.roles.includes('admin'),
        read: selectedUser.roles.includes('read'),
        write: selectedUser.roles.includes('write')
      });
    }
  }, [selectedUser]);

  /**
   * Fetches organizations from the API and sets up initial state
   * Includes setting the first organization as default and getting its users
   */
  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await getOrganizations();
      console.log('API Response:', response);
      
      if (response && response.data) {
        setOrganizations(response.data);
        setApiResponse(response);
        
        // Set first organization as selected by default and fetch its details
        if (response.data.length > 0) {
          const firstOrg = response.data[0];
          setSelectedOrg(firstOrg);
          await fetchOrganizationDetails(firstOrg.id);
          await fetchDeployments(firstOrg.id);
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add this new function to fetch deployments for the selected organization
  const fetchDeployments = async (orgId) => {
    try {
      const response = await DeploymentsAPI.getDeployments(orgId);
      console.log('Deployments Response:', response);
      
      if (response && response.data) {
        setDeployments(response.data);
      }
    } catch (error) {
      console.error('Error fetching deployments:', error);
    }
  };

  /**
   * Fetches detailed information for a specific organization
   * Updates the enrolled users based on the response
   */
  const fetchOrganizationDetails = async (orgId) => {
    try {
      const response = await getOrganizationDetails(orgId);
      console.log('Organization Details Response:', response);
      
      if (response && response.included) {
        // Update enrolled users from the detailed response
        setEnrolledUsers(response.included.filter(item => 
          item.type === 'organization_permissions'
        ));
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
    }
  };

  /**
   * Handles organization selection change
   * Updates selected organization and fetches its details
   */
  const handleOrgChange = async (orgId) => {
    const selected = organizations.find(org => org.id === orgId);
    setSelectedOrg(selected);
    
    if (selected) {
      await fetchOrganizationDetails(selected.id);
      await fetchDeployments(selected.id);
    }
  };

  /**
   * Transforms API data into a formatted organization object
   * Includes organization details, enrolled users, and their roles
   */
  const organization = selectedOrg ? {
    id: selectedOrg.id,
    name: selectedOrg.attributes.name,
    enrolledUsers: enrolledUsers.length,
    deployments: deployments,
    users: enrolledUsers.map(permission => ({
      id: permission.id,
      name: permission.attributes.users.email,
      email: permission.attributes.users.email,
      avatar: permission.attributes.users.email.substring(0, 2).toUpperCase(),
      roles: Object.entries(permission.attributes.permissions)
        .filter(([_, value]) => value === true)
        .map(([key]) => key)
    }))
  } : null;

  /**
   * Returns appropriate icon component based on user role
   */
  const getRoleIcon = (role) => {
    switch(role.toLowerCase()) {
      case 'owner':
        return <User size={isMobile ? 10 : 12} />;
      case 'admin':
        return <User size={isMobile ? 10 : 12} />;
      case 'read':
        return <Eye size={isMobile ? 10 : 12} />;
      case 'write':
        return <Edit size={isMobile ? 10 : 12} />;
      case 'delete':
        return <Trash size={isMobile ? 10 : 12} />;
      default:
        return <Eye size={isMobile ? 10 : 12} />;
    }
  };

  // Handle edit organization
  const handleEdit = () => {
    setShowDropdown(false);
    setEditName(organization.name);
    setIsEditing(true);
    setEditError('');
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setEditError('Name cannot be empty');
      return;
    }

    try {
      // Optimistically update the UI
      const oldName = organization.name;
      
      // Update local state immediately
      setOrganizations(orgs => orgs.map(org => 
        org.id === selectedOrg.id 
          ? { ...org, attributes: { ...org.attributes, name: editName }} 
          : org
      ));
      
      setSelectedOrg(org => ({
        ...org,
        attributes: { ...org.attributes, name: editName }
      }));

      // Make API call
      await updateOrganization(organization.id, editName);
      
      // Clear editing state
      setIsEditing(false);
      setEditError('');
    } catch (error) {
      // Revert optimistic update on error
      await fetchOrganizations();
      setEditError('Failed to update organization name');
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError('');
  };

  // Handle delete organization
  const handleDelete = () => {
    setShowDropdown(false);
    setShowDeleteConfirm(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedOrg) return;
    
    try {
      // Delete the organization
      await deleteOrganization(selectedOrg.id);
      
      // Remove the deleted organization from local state
      const updatedOrgs = organizations.filter(org => org.id !== selectedOrg.id);
      setOrganizations(updatedOrgs);
      
      // Select the next available organization
      if (updatedOrgs.length > 0) {
        const nextOrg = updatedOrgs[0];
        setSelectedOrg(nextOrg);
        await fetchOrganizationDetails(nextOrg.id);
      } else {
        setSelectedOrg(null);
        setEnrolledUsers([]);
      }
    } catch (error) {
      console.error('Error deleting organization:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  // Handle permission toggle
  const handlePermissionToggle = (permission) => {
    setSelectedPermissions(prev => ({
      ...prev,
      [permission.toLowerCase()]: !prev[permission.toLowerCase()]
    }));
  };

  // Handle permission update confirmation
  const handleUpdatePermissions = async () => {
    if (!selectedUser || !selectedOrg) return;
    
    setUpdatingPermissions(true);
    try {
      await updateUserPermissions(
        selectedOrg.id,
        selectedUser.id,
        selectedPermissions
      );
      
      // Refresh organization details to get updated permissions
      await fetchOrganizationDetails(selectedOrg.id);
      setShowUpdatePermissions(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setUpdatingPermissions(false);
    }
  };

  // Responsive style overrides based on screen size
  const responsiveStyles = {
    pageContainer: {
      ...styles.pageContainer,
      padding: isMobile ? '12px' : '24px',
      overflowX: 'hidden',
    },
    settingsContainer: {
      ...styles.settingsContainer,
      padding: isMobile ? '12px' : '20px',
      flexDirection: isMobile ? 'column' : 'row',
    },
    headerSection: {
      ...styles.headerSection,
      gap: isMobile ? '8px' : '12px',
    },
    pageTitle: {
      ...styles.pageTitle,
      fontSize: isMobile ? 'clamp(18px, 5vw, 24px)' : '24px',
    },
    pageIcon: {
      ...styles.pageIcon,
      minWidth: '24px',
    },
    selectSection: {
      ...styles.selectSection,
      marginTop: isMobile ? '12px' : 0,
      width: isMobile ? '100%' : 'auto',
    },
    select: {
      ...styles.select,
      width: isMobile ? '100%' : 'auto',
      fontSize: isMobile ? '14px' : '16px',
    },
    orgCard: {
      ...styles.orgCard,
      padding: isMobile ? '12px' : '20px',
    },
    orgCardHeader: {
      ...styles.orgCardHeader,
      flexWrap: 'wrap',
    },
    orgName: {
      ...styles.orgName,
      fontSize: isMobile ? '16px' : '18px',
      maxWidth: isMobile ? '200px' : 'none',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    userRow: {
      ...styles.userRow,
      padding: isMobile ? '8px' : '12px',
    },
    userAvatar: {
      ...styles.userAvatar,
      width: isMobile ? '28px' : '32px',
      height: isMobile ? '28px' : '32px',
      fontSize: isMobile ? '10px' : '12px',
    },
    roleItem: {
      ...styles.roleItem,
      padding: isMobile ? '2px 4px' : '3px 6px',
      fontSize: isMobile ? '10px' : '12px',
    },
    userEmail: {
      ...styles.userEmail,
      fontSize: isMobile ? '14px' : '16px',
    },
    sectionHeader: {
      ...styles.sectionHeader,
      padding: isMobile ? '10px 8px' : '12px',
    },
    sectionText: {
      ...styles.sectionText,
      fontSize: isMobile ? '14px' : '16px',
    },
    messageBox: {
      ...styles.messageBox,
      padding: isMobile ? '12px' : '20px',
      fontSize: isMobile ? '14px' : '16px',
    },
    pageFooter: {
      ...styles.pageFooter,
      fontSize: isMobile ? '12px' : '14px',
      marginTop: isMobile ? '24px' : '40px',
    },
  };

  // Loading state display
  if (loading) {
    return (
      <div style={responsiveStyles.pageContainer}>
        <div style={{ ...responsiveStyles.messageBox, marginTop: '20px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={responsiveStyles.pageContainer}>
      {/* Header Section with Settings title */}
      <div style={responsiveStyles.settingsContainer}>
        <div style={responsiveStyles.headerSection}>
          <Settings style={responsiveStyles.pageIcon} size={isMobile ? 20 : 24} />
          <h1 style={responsiveStyles.pageTitle}>Settings</h1>
        </div>

        {/* Organization Selection Dropdown */}
        <div style={responsiveStyles.selectSection}>
          <div style={{
            ...styles.selectLabel,
            fontSize: isMobile ? '14px' : '16px',
          }}>Select an Organization</div>
          <select 
            style={responsiveStyles.select}
            value={selectedOrg?.id || ''}
            onChange={(e) => handleOrgChange(e.target.value)}
          >
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.attributes.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Organization Management Section */}
      <div style={{
        ...styles.organizationSection,
        padding: isMobile ? '12px' : '20px',
      }}>
        <div style={{
          ...styles.organizationHeader,
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '8px' : '0',
        }}>
          <h2 style={{
            ...styles.sectionTitle,
            fontSize: isMobile ? '18px' : '24px',
          }}>Your Organization</h2>
          <button style={{
            ...styles.addButton,
            padding: isMobile ? '6px 12px' : '8px 16px',
            fontSize: isMobile ? '12px' : '14px',
          }} onClick={() => setShowCreateOrg(!showCreateOrg)}>
            + ADD NEW
          </button>
        </div>
        <p style={{
          ...styles.description,
          fontSize: isMobile ? '14px' : '16px',
        }}>Manage your organization here!</p>

        {/* Create Organization Modal */}
        {showCreateOrg && (
          <CreateOrganization
            organizationName={organizationName}
            setOrganizationName={setOrganizationName}
            onClose={() => setShowCreateOrg(false)}
            onSubmit={async () => {
              // Refresh the organizations list after creating new org
              await fetchOrganizations();
              setShowCreateOrg(false);
            }}
          />
        )}
      </div>

      {/* Organization Details Card */}
      {organization && (
        <div style={responsiveStyles.orgCard}>
          {/* Organization Header with Logo */}
          <div style={responsiveStyles.orgCardHeader}>
            <div style={{
              ...styles.orgLogo,
              gap: isMobile ? '8px' : '12px',
            }}>
              <div style={{
                ...styles.orgLogoIcon,
                width: isMobile ? '32px' : '40px',
                height: isMobile ? '32px' : '40px',
              }}>
                <svg width={isMobile ? "20" : "24"} height={isMobile ? "20" : "24"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12L7 2L12 12L17 2L22 12" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L7 22L12 12L17 22L22 12" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {!isEditing && (
                <span style={responsiveStyles.orgName}>{organization.name}</span>
              )}
            </div>
            {!isEditing && (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div 
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  <MoreVertical size={isMobile ? 18 : 20} color="#FFEBC8FF" />
                </div>
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    marginTop: '4px',
                    background: '#1A2337',
                    border: '1px solid #FFC35BFF',
                    borderRadius: '8px',
                    padding: '8px 0',
                    minWidth: '120px',
                    zIndex: 10,
                    maxWidth: isMobile ? 'calc(100vw - 48px)' : '200px',
                  }}>
                    <div
                      onClick={handleEdit}
                      style={{
                        padding: '8px 16px',
                        color: '#FFEBC8FF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: isMobile ? '12px' : '14px',
                        ':hover': {
                          background: 'rgba(255, 195, 91, 0.1)',
                        },
                      }}
                    >
                      <Edit size={isMobile ? 12 : 14} />
                      Edit
                    </div>
                    <div
                      onClick={handleDelete}
                      style={{
                        padding: '8px 16px',
                        color: '#ff4444',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: isMobile ? '12px' : '14px',
                        ':hover': {
                          background: 'rgba(255, 68, 68, 0.1)',
                        },
                      }}
                    >
                      <Trash size={isMobile ? 12 : 14} />
                      Delete
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Edit Input Field - Shown below header when editing */}
          {isEditing && (
            <div style={{
              padding: isMobile ? '12px 0 6px 0' : '16px 0 8px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: isMobile ? '6px' : '8px',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: isMobile ? '6px' : '8px',
                width: '100%',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '6px' : '8px',
                  width: '100%',
                }}>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => {
                      setEditName(e.target.value);
                      setEditError('');
                    }}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${editError ? '#ff4444' : '#FFC35BFF'}`,
                      borderRadius: '4px',
                      padding: isMobile ? '6px 10px' : '8px 12px',
                      color: '#FFEBC8FF',
                      fontSize: isMobile ? '14px' : '16px',
                      fontWeight: 'bold',
                      width: '100%',
                      maxWidth: isMobile ? '100%' : '300px',
                      boxSizing: 'border-box',
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSaveEdit();
                      }
                    }}
                    placeholder="Enter organization name"
                  />
                  <div style={{
                    display: 'flex',
                    gap: isMobile ? '6px' : '8px',
                    alignItems: 'center',
                  }}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: isMobile ? '6px' : '8px',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 3px rgba(255, 122, 0, 0.3)',
                        width: isMobile ? '32px' : '36px',
                        height: isMobile ? '32px' : '36px',
                      }}
                    >
                      <Check size={isMobile ? 14 : 16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        background: '#1A2337',
                        border: '1px solid #FFC35BFF',
                        borderRadius: '4px',
                        padding: isMobile ? '6px' : '8px',
                        color: '#FFEBC8FF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: 'bold',
                        width: isMobile ? '32px' : '36px',
                        height: isMobile ? '32px' : '36px',
                      }}
                    >
                      <X size={isMobile ? 14 : 16} />
                    </button>
                  </div>
                </div>
                {editError && (
                  <div style={{
                    color: '#ff4444',
                    fontSize: isMobile ? '10px' : '12px',
                    marginTop: '4px',
                  }}>
                    {editError}
                  </div>
                )}
              </div>
            </div>
          )}

          <div style={styles.separator} />

          {/* Deployments Section */}
          <div style={responsiveStyles.sectionHeader} onClick={() => setDeploymentsExpanded(!deploymentsExpanded)}>
            <div style={{
              ...styles.sectionTitle,
              gap: isMobile ? '6px' : '8px',
            }}>
              <ChevronDown 
                size={isMobile ? 14 : 16} 
                style={{ 
                  transform: deploymentsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                  marginTop: '4px',
                }} 
              />
              <div style={responsiveStyles.sectionText}>
                Associated Deployments ({organization.deployments?.length || 0})
              </div>
            </div>
            <Plus size={isMobile ? 14 : 16} color="#FF7A00" style={{ flexShrink: 0 }} />
          </div>

          {/* Deployments Content */}
          {deploymentsExpanded && (
            <div>
              {organization.deployments && organization.deployments.length > 0 ? (
                <>
                  {organization.deployments.map((deployment) => (
                    <div 
                      key={deployment.id} 
                      style={{
                        ...responsiveStyles.userRow, 
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                      onClick={() => navigate(`/dashboard/deployments`)}
                    >
                      <div style={{
                        ...responsiveStyles.userAvatar,
                        background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width={isMobile ? "14" : "16"} height={isMobile ? "14" : "16"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L19 7V17L12 22L5 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div style={{
                        ...styles.userName,
                        minWidth: 0,
                        flex: 1,
                        overflow: 'hidden',
                      }}>
                        <span style={{
                          ...responsiveStyles.userEmail,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {deployment.attributes ? deployment.attributes.name : deployment.id}
                        </span>
                        <div style={styles.userRoles}>
                          <div style={{
                            ...responsiveStyles.roleItem,
                            color: '#FF7A00',
                            borderColor: '#FF7A00',
                          }}>
                            <svg width={isMobile ? "10" : "12"} height={isMobile ? "10" : "12"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M22 12H2M16 6L22 12L16 18" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>deployment</span>
                          </div>
                        </div>
                      </div>
                      <div 
                        style={{ 
                          position: 'relative',
                          cursor: 'pointer',
                          flexShrink: 0,
                          marginLeft: '8px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <div>
                          <MoreVertical size={isMobile ? 14 : 16} color="rgba(255, 235, 200, 0.6)" />
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div style={responsiveStyles.messageBox}>
                  <p style={{ fontSize: isMobile ? '14px' : '16px' }}>You have no deployments. Go to the</p>
                  <p style={{ fontSize: isMobile ? '14px' : '16px' }}>
                    <a 
                      style={styles.deploymentLink}
                      onClick={() => navigate('/dashboard/deployments')}
                    >
                      Deployments
                    </a>
                    {' '}page to create one.
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={styles.separator} />

          {/* Enrolled Users Section */}
          <div style={responsiveStyles.sectionHeader} onClick={() => setUsersExpanded(!usersExpanded)}>
            <div style={{
              ...styles.sectionTitle,
              gap: isMobile ? '6px' : '8px',
            }}>
              <ChevronDown 
                size={isMobile ? 14 : 16} 
                style={{ 
                  transform: usersExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }} 
              />
              <div style={responsiveStyles.sectionText}>
                Enrolled Users ({organization.enrolledUsers})
              </div>
            </div>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowEnrollUser(true);
              }}
              style={{ cursor: 'pointer' }}
            >
              <Plus size={isMobile ? 14 : 16} color="#FF7A00" />
            </div>
          </div>

          {/* Enroll User Modal */}
          {showEnrollUser && (
            <EnrollUser
              onClose={() => setShowEnrollUser(false)}
              organizationId={selectedOrg.id}
              onUserEnrolled={async () => {
                // Refresh organization details to get updated user list
                await fetchOrganizationDetails(selectedOrg.id);
              }}
            />
          )}

          {/* Users List */}
          {usersExpanded && organization.users && organization.users.length > 0 && (
            <>
              {organization.users.map((user, index) => (
                <div key={user.id || `user-${index}`} style={{
                  ...responsiveStyles.userRow,
                  minWidth: 0,
                  position: 'relative',
                }}>
                  <div style={responsiveStyles.userAvatar}>
                    {user.avatar}
                  </div>
                  <div style={{
                    ...styles.userName,
                    minWidth: 0,
                    flex: 1,
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      ...responsiveStyles.userEmail,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user.email}
                    </span>
                    <div style={styles.userRoles}>
                      {user.roles.map((role, idx) => (
                        <div key={`${user.id}-role-${idx}`} style={responsiveStyles.roleItem}>
                          {getRoleIcon(role)}
                          <span>{role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div 
                    style={{ 
                      position: 'relative',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}
                  >
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserDropdown(showUserDropdown === user.id ? null : user.id);
                        setSelectedUser(user);
                      }}
                    >
                      <MoreVertical size={isMobile ? 14 : 16} color="rgba(255, 235, 200, 0.6)" />
                    </div>
                    {showUserDropdown === user.id && (
                      <div 
                        ref={userDropdownRef}
                        style={{
                          position: 'absolute',
                          right: isMobile ? 'auto' : 0,
                          left: isMobile ? '-80px' : 'auto',
                          top: '100%',
                          marginTop: '4px',
                          background: '#1A2337',
                          border: '1px solid #FFC35BFF',
                          borderRadius: '8px',
                          padding: '8px 0',
                          minWidth: isMobile ? '140px' : '160px',
                          zIndex: 10,
                          maxWidth: 'calc(100vw - 48px)',
                        }}
                      >
                        <div
                          onClick={() => {
                            setShowUpdatePermissions(true);
                            setShowUserDropdown(null);
                          }}
                          style={{
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            color: '#FFEBC8FF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '6px' : '8px',
                            fontSize: isMobile ? '12px' : '14px',
                            textAlign: 'left',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Edit size={isMobile ? 12 : 14} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>Update Permissions</span>
                        </div>
                        {currentUser && user.email === currentUser.attributes.email && (
                          <div
                            style={{
                              padding: isMobile ? '6px 12px' : '8px 16px',
                              color: '#FFEBC8FF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: isMobile ? '6px' : '8px',
                              fontSize: isMobile ? '12px' : '14px',
                              textAlign: 'left',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                          >
                            <Edit size={isMobile ? 12 : 14} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>Update Name</span>
                          </div>
                        )}
                        <div
                          style={{
                            padding: isMobile ? '6px 12px' : '8px 16px',
                            color: '#ff4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: isMobile ? '6px' : '8px',
                            fontSize: isMobile ? '12px' : '14px',
                            textAlign: 'left',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Trash size={isMobile ? 12 : 14} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>Unenroll User</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Update Permissions Modal */}
          {showUpdatePermissions && selectedUser && (
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
                padding: isMobile ? '16px' : '24px',
                width: '100%',
                maxWidth: isMobile ? '280px' : '320px',
                margin: '0 20px',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: isMobile ? '16px' : '24px',
                }}>
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '6px' : '8px',
                  }}>
                    <h2 style={{
                      color: '#FFEBC8FF',
                      margin: 0,
                      fontSize: isMobile ? '18px' : '24px',
                      fontWeight: 'bold',
                    }}>
                      Updating Permissions for
                    </h2>
                    <p style={{
                      color: '#FFEBC8FF',
                      margin: 0,
                      fontSize: isMobile ? '14px' : '16px',
                    }}>
                      {selectedUser.email}
                    </p>
                  </div>

                  {/* Permissions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '8px' : '12px',
                  }}>
                    {['Admin', 'Read', 'Write'].map((permission) => (
                      <div
                        key={permission}
                        onClick={() => handlePermissionToggle(permission)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: isMobile ? '8px' : '12px',
                          padding: isMobile ? '6px' : '8px',
                          background: '#141C2F',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: isMobile ? '18px' : '20px',
                          height: isMobile ? '18px' : '20px',
                          borderRadius: '4px',
                          border: '1px solid #FFC35BFF',
                          background: selectedPermissions[permission.toLowerCase()] ? '#FF7A00' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: isMobile ? '10px' : '12px',
                        }}>
                          {selectedPermissions[permission.toLowerCase()] && '✓'}
                        </div>
                        <span style={{
                          color: '#FFEBC8FF',
                          fontSize: isMobile ? '12px' : '14px',
                        }}>
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: isMobile ? '8px' : '12px',
                    marginTop: isMobile ? '12px' : '16px',
                  }}>
                    <button
                      onClick={() => setShowUpdatePermissions(false)}
                      disabled={updatingPermissions}
                      style={{
                        background: '#1A2337',
                        border: '1px solid #FFC35BFF',
                        borderRadius: '4px',
                        padding: isMobile ? '6px 12px' : '8px 16px',
                        color: '#FFEBC8FF',
                        cursor: updatingPermissions ? 'not-allowed' : 'pointer',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: 'bold',
                        flex: 1,
                        opacity: updatingPermissions ? 0.7 : 1,
                      }}
                    >
                      CANCEL
                    </button>
                    <button
                      onClick={handleUpdatePermissions}
                      disabled={updatingPermissions}
                      style={{
                        background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: isMobile ? '6px 12px' : '8px 16px',
                        color: '#FFFFFF',
                        cursor: updatingPermissions ? 'not-allowed' : 'pointer',
                        fontSize: isMobile ? '12px' : '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 3px rgba(255, 122, 0, 0.3)',
                        flex: 1,
                        opacity: updatingPermissions ? 0.7 : 1,
                      }}
                    >
                      {updatingPermissions ? 'UPDATING...' : 'CONFIRM'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
            padding: isMobile ? '16px' : '24px',
            width: '100%',
            maxWidth: isMobile ? '280px' : '320px',
            margin: '0 20px',
          }}>
            <h3 style={{
              color: '#FFEBC8FF',
              marginTop: 0,
              marginBottom: isMobile ? '12px' : '16px',
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: 'bold',
            }}>
              Delete Organization?
            </h3>
            <p style={{
              color: '#FFEBC8FF',
              marginBottom: isMobile ? '12px' : '24px',
              fontSize: isMobile ? '14px' : '16px',
            }}>
              Are you sure you want to delete {organization?.name}?
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
            }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  background: '#1A2337',
                  border: '1px solid #FFC35BFF',
                  borderRadius: '4px',
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  color: '#FFEBC8FF',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 'bold',
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{
                  background: '#ff4444',
                  border: 'none',
                  borderRadius: '4px',
                  padding: isMobile ? '6px 12px' : '8px 16px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 'bold',
                }}
              >
                YES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <div style={responsiveStyles.pageFooter}>
        <p>Terms of Use & Privacy Policy</p>
        <p>Waev © 2025</p>
      </div>
    </div>
  );
};

export default SettingsPage; 