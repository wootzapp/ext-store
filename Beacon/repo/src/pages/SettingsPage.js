import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, MoreVertical, User, Eye, Edit, Trash, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOrganizations } from '../api/OrganizationAPI';
import CreateOrganization from '../components/CreateOrganization';
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

  // Fetch organizations on component mount
  useEffect(() => {
    fetchOrganizations();
  }, []);

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
        
        // Set first organization as selected by default
        if (response.data.length > 0) {
          const firstOrg = response.data[0];
          setSelectedOrg(firstOrg);
          
          // Get enrolled users for the selected organization from included data
          const orgPermissions = response.included?.filter(item => 
            item.type === 'organization_permissions' && 
            item.attributes.organization_id === firstOrg.id
          ) || [];
          
          setEnrolledUsers(orgPermissions);
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles organization selection change
   * Updates selected organization and fetches its enrolled users
   */
  const handleOrgChange = (orgId) => {
    const selected = organizations.find(org => org.id === orgId);
    setSelectedOrg(selected);
    
    if (selected && apiResponse) {
      const orgPermissions = apiResponse.included?.filter(item => 
        item.type === 'organization_permissions' && 
        item.attributes.organization_id === selected.id
      ) || [];
      setEnrolledUsers(orgPermissions);
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
            onSubmit={() => {
              // Handle create logic here
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
              <span style={styles.orgName}>{organization.name}</span>
            </div>
            <MoreVertical size={20} color="#FFEBC8FF" />
          </div>

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
            <Plus size={16} color="#FF7A00" />
          </div>

          {/* Users List */}
          {usersExpanded && organization.users && organization.users.length > 0 && (
            <>
              {organization.users.map((user, index) => (
                <div key={user.id || `user-${index}`} style={styles.userRow}>
                  <div style={styles.userAvatar}>
                    {user.avatar}
                  </div>
                  <div style={styles.userName}>
                    <span style={styles.userEmail}>{user.email}</span>
                    <div style={styles.userRoles}>
                      {user.roles.map((role, idx) => (
                        <div key={`${user.id}-role-${idx}`} style={styles.roleItem}>
                          {getRoleIcon(role)}
                          <span>{role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={styles.userActions}>
                    <MoreVertical size={16} color="rgba(255, 235, 200, 0.6)" />
                  </div>
                </div>
              ))}
            </>
          )}
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