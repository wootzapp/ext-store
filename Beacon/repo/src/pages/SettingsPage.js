import React, { useState, useEffect } from 'react';
import { Settings, ChevronDown, MoreVertical, User, Eye, Edit, Trash, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getOrganizations } from '../api/OrganizationAPI';

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
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
    minWidth: 0,
    flex: 1,
    fontSize: '16px',
  },
  sectionText: {
    whiteSpace: 'normal',
    overflow: 'visible',
    textOverflow: 'clip',
    lineHeight: '1.4',
    paddingTop: '2px',
  },
  sectionCount: {
    opacity: 0.8,
    marginLeft: '6px',
    whiteSpace: 'nowrap',
  },
  sectionActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: '12px',
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
  orgCard: {
    background: '#141C2F',
    borderRadius: '12px',
    padding: '24px',
    width: '95%',
    maxWidth: '900px',
    margin: '24px auto 0',
    border: '1px solid #FFC35BFF',
    color: '#FFEBC8FF',
    boxSizing: 'border-box',
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
    minWidth: 0,
  },
  userCount: {
    opacity: 0.8,
    marginLeft: '6px',
  },
  userRow: {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px 16px',
    gap: '12px',
    position: 'relative',
    minHeight: '48px',
    width: '100%',
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#78350F',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFC35BFF',
    flexShrink: 0,
    fontSize: '14px',
    fontWeight: '500',
  },
  userName: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-start',
    paddingRight: '32px',
  },
  userEmail: {
    fontSize: '14px',
    color: '#FFEBC8FF',
    display: 'block',
    textAlign: 'left',
    width: '100%',
  },
  userRoles: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    alignItems: 'flex-start',
    width: '100%',
  },
  roleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: 'rgba(255, 235, 200, 0.6)',
    padding: '0',
  },
  userActions: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
  },
  enrolledUserFooter: {
    display: 'flex',
    // justifyContent: 'space-between',
    padding: '12px 0 12px 32px',
    fontSize: '14px',
    alignItems: 'right',
  },
  cardFooter: {
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '12px',
    color: '#FFEBC8FF',
    opacity: 0.7,
  },
  deploymentSection: null,
  deploymentTitle: null,
  deploymentText: null,
  deploymentCount: null,
  deploymentActions: null,
  pageFooter: {
    textAlign: 'center',
    marginTop: '40px',
    marginBottom: '24px',
    fontSize: '12px',
    color: '#FFEBC8FF',
    opacity: 0.7,
    width: '95%',
    maxWidth: '900px',
    margin: '40px auto 24px',
  },
};

const SettingsPage = () => {
  const navigate = useNavigate();
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [organizationName, setOrganizationName] = useState('');
  const [usersExpanded, setUsersExpanded] = useState(true);
  const [deploymentsExpanded, setDeploymentsExpanded] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

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

  // Update the organization object to use API data
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

  // Helper function to get role icon
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
      <div style={styles.settingsContainer}>
        <div style={styles.headerSection}>
          <Settings style={styles.pageIcon} size={24} />
          <h1 style={styles.pageTitle}>Settings</h1>
        </div>

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

      {/* Organization Card */}
      {organization && (
        <div style={styles.orgCard}>
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

      <div style={styles.pageFooter}>
        <p>Terms of Use & Privacy Policy</p>
        <p>Waev © 2025</p>
      </div>
    </div>
  );
};

export default SettingsPage; 