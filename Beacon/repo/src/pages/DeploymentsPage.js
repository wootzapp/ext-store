import React, { useState, useEffect, useRef } from 'react';
import { Rocket, Plus, ChevronDown, MoreVertical, User, Eye, Edit, Trash } from 'lucide-react';
import { createOrganization, getOrganizations, getOrganizationPermissions, getOrganizationDeployments } from '../api/OrganizationAPI';
import { useNavigate } from 'react-router-dom';

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
    maxWidth: '100%',
  },
  pageTitle: {
    fontSize: '24px',
    color: '#FF7A00',
    margin: 0,
  },
  pageIcon: {
    color: '#FF7A00',
  },
  organizationHeader: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: '24px',
    marginBottom: '16px',
    width: '100%',
  },
  organizationSection: {
    marginTop: '10px',
    width: '100%',
    textAlign: 'center',
  },
  addNewButton: {
    background: 'linear-gradient(135deg, #FF7A00, #FF4B00)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 4px rgba(255, 122, 0, 0.3)',
  },
  addNewLink: {
    color: '#FF7A00',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    background: '#141C2F',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '480px',
    margin: '20px',
    border: '1px solid #FFC35BFF',
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
  orgCard: {
    background: '#141C2F',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    maxWidth: '420px',
    margin: '32px auto',
    border: '1px solid #FFC35BFF',
    color: '#FFEBC8FF',
    boxShadow: '0 1px 5px rgba(255, 195, 91, 0.2)',
  },
  orgCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  orgLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  orgLogoIcon: {
    width: '48px',
    height: '48px',
    background: '#1A2337',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FF7A00',
  },
  orgName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#FFEBC8FF',
  },
  separator: {
    height: '1px',
    background: 'rgba(255, 195, 91, 0.3)',
    margin: '16px 0',
    width: '100%',
  },
  messageBox: {
    textAlign: 'center',
    padding: '12px 0',
    color: '#FFEBC8FF',
    opacity: 0.8,
  },
  deploymentLink: {
    color: '#FF7A00',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    cursor: 'pointer',
    color: '#FFEBC8FF',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  userCount: {
    opacity: 0.8,
    marginLeft: '6px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0 12px 32px',
    borderBottom: '1px solid rgba(255, 195, 91, 0.1)',
  },
  userAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#78350F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFC35BFF',
    marginRight: '12px',
    border: '2px solid #FF7A00',
  },
  userName: {
    flex: 1,
    textAlign: 'left',
  },
  userEmail: {
    fontSize: '12px',
    opacity: 0.8,
    display: 'block',
    marginTop: '4px',
  },
  userRoles: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    opacity: 0.8,
  },
  userActions: {
    marginLeft: '12px',
  },
  enrolledUserFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '12px 0 12px 32px',
    fontSize: '14px',
  },
  cardFooter: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '12px',
    color: '#FFEBC8FF',
    opacity: 0.7,
  },
};

const DeploymentsPage = () => {
  console.log('[RENDER] DeploymentPage rendering');
  
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [showAddButton, setShowAddButton] = useState(false);
  const [organization, setOrganization] = useState(null);
  const [usersExpanded, setUsersExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const navigate = useNavigate();
  
  // For tracking component mounts and unmounts
  const componentMountCount = useRef(0);
  
  // Track component mounting
  useEffect(() => {
    componentMountCount.current++;
    console.log(`[LIFECYCLE] Component mounted (${componentMountCount.current} times)`);
    
    // Check for saved organization on mount
    const savedOrg = localStorage.getItem('createdOrganization');
    if (savedOrg) {
      try {
        const parsedOrg = JSON.parse(savedOrg);
        console.log('[STORAGE] Found saved organization in localStorage:', parsedOrg);
        setOrganization(parsedOrg);
        setShowAddButton(true);
      } catch (err) {
        console.error('[STORAGE] Error parsing saved organization:', err);
      }
    } else {
      console.log('[STORAGE] No saved organization found in localStorage');
    }
    
    return () => {
      console.log('[LIFECYCLE] Component will unmount');
    };
  }, []);

  // Log organization state changes
  useEffect(() => {
    console.log('[STATE] Organization state changed:', organization);
    
    // Save to localStorage whenever the organization changes
    if (organization) {
      console.log('[STORAGE] Saving organization to localStorage');
      localStorage.setItem('createdOrganization', JSON.stringify(organization));
    }
  }, [organization]);

  // Fetch organizations on component mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      console.log('[FETCH] Starting organization fetch');
      try {
        setLoading(true);
        const response = await getOrganizations();
        console.log('[FETCH] Organizations response:', response);
        
        if (response && response.data && response.data.length > 0) {
          console.log('[FETCH] Found organizations in response');
          const org = {
            id: response.data[0].id || 'org-123',
            name: response.data[0].attributes.name,
            enrolledUsers: 1, // Default value
            users: [] // Will be populated from permissions
          };
          
          console.log('[FETCH] Created organization object:', org);
          
          // Fetch permissions for this organization
          // Uncomment this to actually get the user data
          console.log('[FETCH] Will fetch permissions for org:', org.id);
          await fetchPermissions(org.id, org);
          
          setShowAddButton(true);
        } else {
          console.log('[FETCH] No organizations found in API response');
        }
        setLoading(false);
      } catch (err) {
        console.error('[FETCH] Error fetching organizations:', err);
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  // Function to fetch permissions for an organization
  const fetchPermissions = async (orgId, orgData) => {
    console.log('[PERMISSIONS] Fetching permissions for org:', orgId);
    try {
      const permissionsResponse = await getOrganizationPermissions(orgId);
      console.log('[PERMISSIONS] Permissions response:', permissionsResponse);
      
      if (permissionsResponse && permissionsResponse.data) {
        // This will store all processed users
        const userMap = new Map();
        
        // Store raw permissions data in localStorage for future reference
        localStorage.setItem(`org_permissions_${orgId}`, JSON.stringify(permissionsResponse));
        console.log('[PERMISSIONS] Stored raw permissions data in localStorage');
        
        // Process each permission entry in the response
        permissionsResponse.data.forEach(permission => {
          // Get the user ID directly from the attributes
          const userId = permission.attributes?.user_id;
          
          if (userId) {
            console.log('[PERMISSIONS] Processing permission for user:', userId);
            
            // Get user details directly from attributes.users
            const userDetails = permission.attributes?.users;
            
            if (!userMap.has(userId)) {
              // Create a user object with the available information
              const userObj = {
                id: userId,
                name: userDetails ? `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim() : 'Unknown User',
                email: userDetails?.email || 'No email',
                roles: [],
                avatar: userDetails ? getUserInitials(`${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim()) : 'U',
                // Store the complete permissions object for reference
                permissionsObj: permission.attributes?.permissions || {}
              };
              
              console.log('[PERMISSIONS] Creating new user object:', userObj);
              userMap.set(userId, userObj);
            }
            
            // Process permissions from the permissions object
            const permissionsObj = permission.attributes?.permissions || {};
            
            // Convert the permissions object to an array of role names for those that are true
            Object.entries(permissionsObj).forEach(([role, hasPermission]) => {
              if (hasPermission === true && !userMap.get(userId).roles.includes(role)) {
                console.log(`[PERMISSIONS] Adding role "${role}" to user ${userId}`);
                userMap.get(userId).roles.push(role);
              }
            });
            
            // Store individual user permissions in localStorage
            localStorage.setItem(`user_permissions_${userId}_${orgId}`, JSON.stringify(permissionsObj));
            console.log(`[PERMISSIONS] Stored permissions for user ${userId} in localStorage`);
          }
        });
        
        // Update organization with users
        const usersArray = Array.from(userMap.values());
        console.log('[PERMISSIONS] Final users array:', usersArray);
        
        // Create a new object to ensure state update
        const updatedOrgData = {
          ...orgData,
          users: usersArray,
          enrolledUsers: usersArray.length
        };
        
        console.log('[PERMISSIONS] Setting organization with users:', updatedOrgData);
        
        // IMPORTANT: Save to localStorage before setting state to ensure persistence
        localStorage.setItem('createdOrganization', JSON.stringify(updatedOrgData));
        
        // Set state with a COPY of the object to ensure React detects the change
        setOrganization({...updatedOrgData});
        setPermissions(permissionsResponse.data);
      }
    } catch (error) {
      console.error('[PERMISSIONS] Error fetching permissions:', error);
    }
  };
  
  // Helper function to get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleAddNew = () => {
    console.log('[UI] Add New button clicked');
    setShowCreateOrg(true);
  };

  const handleOrganizationClick = () => {
    console.log('[UI] Organization link clicked');
    setShowAddButton(true);
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
        // Get the organization ID from the create result
        const orgId = result.data.id;
        
        // Fetch permissions to get user data rather than using hardcoded values
        const permissionsResponse = await getOrganizationPermissions(orgId);
        console.log('[CREATE] Organization permissions response:', permissionsResponse);
        
        if (permissionsResponse && permissionsResponse.data && permissionsResponse.data.length > 0) {
          // Get the first permission entry (usually the creator)
          const permissionData = permissionsResponse.data[0];
          const userAttributes = permissionData.attributes;
          
          // Extract user ID and details from the actual response
          const userId = userAttributes.user_id;
          const userDetails = userAttributes.users;
          const permissions = userAttributes.permissions;
          
          // Store actual permissions from API
          localStorage.setItem(`user_permissions_${userId}_${orgId}`, JSON.stringify(permissions));
          
          // Create organization object with actual user data from API
          const newOrg = {
            name: organizationName,
            id: orgId,
            enrolledUsers: 1,
            users: [
              {
                id: userId,
                name: `${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim(),
                email: userDetails.email || '',
                roles: Object.keys(permissions).filter(role => permissions[role]),
                permissionsObj: permissions,
                avatar: getUserInitials(`${userDetails.first_name || ''} ${userDetails.last_name || ''}`.trim())
              }
            ]
          };
          
          console.log('[CREATE] Created new organization object:', newOrg);
          
          // Save to persistent storage
          console.log('[CREATE] Saving to localStorage');
          localStorage.setItem('createdOrganization', JSON.stringify(newOrg));
          
          // Reset UI state in the correct order
          setShowCreateOrg(false);
          setOrganization({...newOrg});
          setOrganizationName('');
          setShowAddButton(true);
        } else {
          console.error('[CREATE] No permissions data found in response');
        }
      } else {
        console.error('[CREATE] Invalid organization creation response');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('[CREATE] Error creating organization:', error);
      setLoading(false);
    }
  };

  const toggleUsersSection = () => {
    console.log('[UI] Toggling users section, current value:', usersExpanded);
    setUsersExpanded(!usersExpanded);
  };

  // Function to get appropriate icon for a role
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

  const fetchDeployments = async (orgId) => {
    console.log('[DEPLOYMENTS] Fetching deployments for org:', orgId);
    try {
      const deployments = await getOrganizationDeployments(orgId);
      console.log('[DEPLOYMENTS] Deployments response:', deployments);
    } catch (error) {
      console.error('[DEPLOYMENTS] Failed to fetch deployments:', error);
    }
  };

  // Render debugging info
  console.log('[RENDER] Organization state before render:', organization);
  console.log('[RENDER] Loading state before render:', loading);
  console.log('[RENDER] ShowAddButton before render:', showAddButton);

  return (
    <div style={styles.pageContainer}>
      <div style={styles.pageHeader}>
        <Rocket style={styles.pageIcon} size={24} />
        <h1 style={styles.pageTitle}>Deployments</h1>
      </div>
      
      {showAddButton && (
        <div style={styles.organizationHeader}>
          <button style={styles.addNewButton} onClick={handleAddNew}>
            <Plus size={16} />
            ADD NEW
          </button>
        </div>
      )}
      
      {loading && <p style={{textAlign: 'center', color: '#FFEBC8FF'}}>Loading...</p>}
      
      {!organization && !loading && (
        <div style={styles.organizationSection}>
          {!showAddButton ? (
            <p style={{color: '#FFEBC8FF', margin: '10px 0 0 0', fontSize: '16px'}}>
              To get started add an <a style={styles.addNewLink} onClick={handleOrganizationClick}>organization</a>.
            </p>
          ) : (
            <p style={{color: '#FFEBC8FF', margin: '10px 0 0 0', fontSize: '16px'}}>
              You have no Organizations. Click <a style={styles.addNewLink} onClick={handleAddNew}>+ Add New</a> to create one.
            </p>
          )}
        </div>
      )}

      {/* Organization Card - Shown after creation */}
      {organization && (
        <div key={organization.id || 'default-org-key'} style={styles.orgCard}>
          {console.log('[RENDER] Rendering organization card:', organization)}
          <div style={styles.orgCardHeader}>
            <div style={styles.orgLogo}>
              <div style={styles.orgLogoIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 12L7 2L12 12L17 2L22 12" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L7 22L12 12L17 22L22 12" stroke="#FF7A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={styles.orgName}>{organization.name}</span>
            </div>
            <MoreVertical size={20} color="#FFEBC8FF" />
          </div>
          
          <div style={styles.separator}></div>
          
          <div style={styles.messageBox}>
            <p>You have no deployments. Go to the</p>
            <p><a style={styles.deploymentLink}>Deployments</a> page to create one.</p>
          </div>
          
          <div style={styles.separator}></div>
          
          <div style={styles.sectionHeader} onClick={toggleUsersSection}>
            <div style={styles.sectionTitle}>
              <ChevronDown size={16} 
                style={{ transform: usersExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} 
              />
              <span>Enrolled Users <span style={styles.userCount}>({organization.enrolledUsers || 0})</span></span>
            </div>
            <Plus size={16} color="#FF7A00" />
          </div>
          
          {usersExpanded && organization.users && organization.users.length > 0 && (
            <>
              {console.log('[RENDER] Rendering users:', organization.users)}
              {organization.users.map((user, index) => {
                // Try to get stored permissions for this user
                let storedPermissions = null;
                try {
                  const permissionData = localStorage.getItem(`user_permissions_${user.id}_${organization.id}`);
                  if (permissionData) {
                    storedPermissions = JSON.parse(permissionData);
                    console.log(`[RENDER] Found stored permissions for user ${user.id}:`, storedPermissions);
                  }
                } catch (e) {
                  console.error(`[RENDER] Error reading stored permissions for user ${user.id}:`, e);
                }
                
                // Use the stored permissions if available, otherwise fall back to the roles array
                const displayRoles = user.permissionsObj || storedPermissions || 
                                    (Array.isArray(user.roles) ? 
                                      user.roles.reduce((obj, role) => ({...obj, [role]: true}), {}) : 
                                      {});
                
                return (
                  <div key={user.id || `user-${index}`} style={styles.userRow}>
                    {console.log('[RENDER] Rendering user:', user)}
                    <div style={styles.userAvatar}>
                      {user.avatar || 'U'}
                    </div>
                    <div style={styles.userName}>
                      <span>{user.name || 'Unknown User'}</span>
                      <span style={styles.userEmail}>{user.email || 'No email'}</span>
                    </div>
                    <div style={styles.userRoles}>
                      {/* Display all permissions from the stored object */}
                      {Object.entries(displayRoles).map(([role, hasPermission], idx) => 
                        hasPermission ? (
                          <div key={`${user.id}-role-${idx}`} style={styles.roleItem}>
                            {getRoleIcon(role)}
                            <span>{role}</span>
                          </div>
                        ) : null
                      )}
                    </div>
                    <div style={styles.userActions}>
                      <MoreVertical size={16} color="#FFEBC8FF" />
                    </div>
                  </div>
                );
              })}
              
              <div style={styles.enrolledUserFooter}>
                <span>Enrolled User</span>
                <span>{organization.enrolledUsers || organization.users.length}</span>
              </div>
            </>
          )}
          
          <div style={styles.cardFooter}>
            <p>Terms of Use & Privacy Policy</p>
            <p>Waev © 2025</p>
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