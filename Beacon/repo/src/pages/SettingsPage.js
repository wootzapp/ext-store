import React, { useState, useEffect, useRef } from 'react';
import { Settings, ChevronDown, MoreVertical, User, Eye, Edit, Trash, Plus, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOrganizations, getOrganizationDetails, updateOrganization, deleteOrganization, getCurrentUser, updateUserPermissions } from '../api/OrganizationAPI';
import CreateOrganization, { EnrollUser } from '../components/CreateOrganization';
import styles from '../styles/SettingsPage.styles';

/**
 * SettingsPage Component
 * Main settings page that displays organization management interface
 * Handles organization selection, user management, and deployment information
 */
const SettingsPage = () => {
  const navigate = useNavigate();
  
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
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
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
    deployments: [],
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
        return <User size={12} />;
      case 'admin':
        return <User size={12} />;
      case 'read':
        return <Eye size={12} />;
      case 'write':
        return <Edit size={12} />;
      case 'delete':
        return <Trash size={12} />;
      default:
        return <Eye size={12} />;
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

  // Loading state display
  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={{ ...styles.messageBox, marginTop: '20px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* Header Section with Settings title */}
      <div style={styles.settingsContainer}>
        <div style={styles.headerSection}>
          <Settings style={styles.pageIcon} size={24} />
          <h1 style={styles.pageTitle}>Settings</h1>
        </div>

        {/* Organization Selection Dropdown */}
        <div style={styles.selectSection}>
          <div style={styles.selectLabel}>Select an Organization</div>
          <select 
            style={styles.select}
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
      <div style={styles.organizationSection}>
        <div style={styles.organizationHeader}>
          <h2 style={styles.sectionTitle}>Your Organization</h2>
          <button style={styles.addButton} onClick={() => setShowCreateOrg(!showCreateOrg)}>
            + ADD NEW
          </button>
        </div>
        <p style={styles.description}>Manage your organization here!</p>

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
        <div style={styles.orgCard}>
          {/* Organization Header with Logo */}
          <div style={styles.orgCardHeader}>
            <div style={styles.orgLogo}>
              <div style={styles.orgLogoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12L7 2L12 12L17 2L22 12" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L7 22L12 12L17 22L22 12" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              {!isEditing && (
                <span style={styles.orgName}>{organization.name}</span>
              )}
            </div>
            {!isEditing && (
              <div style={{ position: 'relative' }} ref={dropdownRef}>
                <div 
                  onClick={() => setShowDropdown(!showDropdown)}
                  style={{ cursor: 'pointer' }}
                >
                  <MoreVertical size={20} color="#FFEBC8FF" />
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
                        fontSize: '14px',
                        ':hover': {
                          background: 'rgba(255, 195, 91, 0.1)',
                        },
                      }}
                    >
                      <Edit size={14} />
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
                        fontSize: '14px',
                        ':hover': {
                          background: 'rgba(255, 68, 68, 0.1)',
                        },
                      }}
                    >
                      <Trash size={14} />
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
              padding: '16px 0 8px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              width: '100%',
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
              }}>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
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
                      padding: '8px 12px',
                      color: '#FFEBC8FF',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      width: '100%',
                      maxWidth: '300px',
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
                    gap: '8px',
                    alignItems: 'center',
                  }}>
                    <button
                      onClick={handleSaveEdit}
                      style={{
                        background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px',
                        color: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        boxShadow: '0 1px 3px rgba(255, 122, 0, 0.3)',
                        width: '36px',
                        height: '36px',
                      }}
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      style={{
                        background: '#1A2337',
                        border: '1px solid #FFC35BFF',
                        borderRadius: '4px',
                        padding: '8px',
                        color: '#FFEBC8FF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        width: '36px',
                        height: '36px',
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                {editError && (
                  <div style={{
                    color: '#ff4444',
                    fontSize: '12px',
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
          <div style={styles.sectionHeader} onClick={() => setDeploymentsExpanded(!deploymentsExpanded)}>
            <div style={styles.sectionTitle}>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: deploymentsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                  marginTop: '4px',
                }} 
              />
              <div style={styles.sectionText}>
                Associated Deployments ({organization.deployments?.length || 0})
              </div>
            </div>
            <Plus size={16} color="#FF7A00" style={{ flexShrink: 0 }} />
          </div>

          {/* Deployments Content */}
          {deploymentsExpanded && (
            <div style={styles.messageBox}>
              <p>You have no deployments. Go to the</p>
              <p>
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

          <div style={styles.separator} />

          {/* Enrolled Users Section */}
          <div style={styles.sectionHeader} onClick={() => setUsersExpanded(!usersExpanded)}>
            <div style={styles.sectionTitle}>
              <ChevronDown 
                size={16} 
                style={{ 
                  transform: usersExpanded ? 'rotate(180deg)' : 'rotate(0deg)', 
                  transition: 'transform 0.2s',
                  flexShrink: 0,
                }} 
              />
              <div style={styles.sectionText}>
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
              <Plus size={16} color="#FF7A00" />
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
                  ...styles.userRow,
                  minWidth: 0,
                  position: 'relative',
                }}>
                  <div style={styles.userAvatar}>
                    {user.avatar}
                  </div>
                  <div style={{
                    ...styles.userName,
                    minWidth: 0,
                    flex: 1,
                    overflow: 'hidden',
                  }}>
                    <span style={{
                      ...styles.userEmail,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {user.email}
                    </span>
                    <div style={styles.userRoles}>
                      {user.roles.map((role, idx) => (
                        <div key={`${user.id}-role-${idx}`} style={styles.roleItem}>
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
                      <MoreVertical size={16} color="rgba(255, 235, 200, 0.6)" />
                    </div>
                    {showUserDropdown === user.id && (
                      <div 
                        ref={userDropdownRef}
                        style={{
                          position: 'absolute',
                          right: 0,
                          top: '100%',
                          marginTop: '4px',
                          background: '#1A2337',
                          border: '1px solid #FFC35BFF',
                          borderRadius: '8px',
                          padding: '8px 0',
                          minWidth: '160px',
                          zIndex: 10,
                          maxWidth: 'calc(100vw - 48px)',
                          '@media (max-width: 480px)': {
                            right: 'auto',
                            left: 'auto',
                            transform: 'translateX(-50%)',
                          },
                        }}
                      >
                        <div
                          onClick={() => {
                            setShowUpdatePermissions(true);
                            setShowUserDropdown(null);
                          }}
                          style={{
                            padding: '8px 16px',
                            color: '#FFEBC8FF',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            textAlign: 'left',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Edit size={14} style={{ flexShrink: 0 }} />
                          <span style={{ flex: 1 }}>Update Permissions</span>
                        </div>
                        {currentUser && user.email === currentUser.attributes.email && (
                          <div
                            style={{
                              padding: '8px 16px',
                              color: '#FFEBC8FF',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              textAlign: 'left',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                          >
                            <Edit size={14} style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>Update Name</span>
                          </div>
                        )}
                        <div
                          style={{
                            padding: '8px 16px',
                            color: '#ff4444',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            textAlign: 'left',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        >
                          <Trash size={14} style={{ flexShrink: 0 }} />
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
                      Updating Permissions for
                    </h2>
                    <p style={{
                      color: '#FFEBC8FF',
                      margin: 0,
                      fontSize: '16px',
                    }}>
                      {selectedUser.email}
                    </p>
                  </div>

                  {/* Permissions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    {['Admin', 'Read', 'Write'].map((permission) => (
                      <div
                        key={permission}
                        onClick={() => handlePermissionToggle(permission)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px',
                          background: '#141C2F',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          border: '1px solid #FFC35BFF',
                          background: selectedPermissions[permission.toLowerCase()] ? '#FF7A00' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                        }}>
                          {selectedPermissions[permission.toLowerCase()] && '✓'}
                        </div>
                        <span style={{
                          color: '#FFEBC8FF',
                          fontSize: '14px',
                        }}>
                          {permission}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Buttons */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '16px',
                  }}>
                    <button
                      onClick={() => setShowUpdatePermissions(false)}
                      disabled={updatingPermissions}
                      style={{
                        background: '#1A2337',
                        border: '1px solid #FFC35BFF',
                        borderRadius: '4px',
                        padding: '8px 16px',
                        color: '#FFEBC8FF',
                        cursor: updatingPermissions ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
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
                        padding: '8px 16px',
                        color: '#FFFFFF',
                        cursor: updatingPermissions ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
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
            padding: '24px',
            width: '100%',
            maxWidth: '320px',
            margin: '0 20px',
          }}>
            <h3 style={{
              color: '#FFEBC8FF',
              marginTop: 0,
              marginBottom: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
            }}>
              Delete Organization?
            </h3>
            <p style={{
              color: '#FFEBC8FF',
              marginBottom: '24px',
              fontSize: '14px',
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
                  padding: '8px 16px',
                  color: '#FFEBC8FF',
                  cursor: 'pointer',
                  fontSize: '14px',
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
                  padding: '8px 16px',
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  fontSize: '14px',
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
      <div style={styles.pageFooter}>
        <p>Terms of Use & Privacy Policy</p>
        <p>Waev © 2025</p>
      </div>
    </div>
  );
};

export default SettingsPage; 