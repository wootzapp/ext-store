import axios from 'axios';

// Base API URL
const API_URL = 'https://api.beaconator.com';

// Gets the auth token - you might want to implement a more secure way to get this
const getAuthToken = () => {
  // This is a placeholder - replace with your actual token retrieval logic
  const token = localStorage.getItem('authToken');
  console.log('[AUTH] Getting token from localStorage:', token ? 'Token found' : 'No token found');
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQ4OTM4YjM3LTJlMTUtNGZmYi04NDNhLWU1MTBjYzNjNzMzZCIsImlhdCI6MTc0MTc3NDc3MH0.y42znc9BAdz7iavvOYxrmWlk0JKQFZ-j0OJTDEcBqD4";
//   return token;
};

/**
 * Create a new organization
 * @param {string} name - Name of the organization to create
 * @returns {Promise} - Promise that resolves to the API response
 */
export const createOrganization = async (name) => {
  console.log('[API] Creating organization with name:', name);
  try {
    const response = await axios.post(
      `${API_URL}/organizations`,
      {
        data: {
          type: 'organizations',
          attributes: {
            name
          }
        }
      },
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    
    console.log('[API] Create organization response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error creating organization:', error);
    throw error;
  }
};

/**
 * Get list of organizations
 * @returns {Promise} - Promise that resolves to the API response with organizations
 */
export const getOrganizations = async () => {
  console.log('[API] Fetching organizations');
  try {
    const response = await axios.get(
      `${API_URL}/organizations?`,
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    
    console.log('[API] Get organizations response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching organizations:', error);
    throw error;
  }
};


/**
 * Get organization users
 * @param {string} orgId - Organization ID to fetch users for
 * @returns {Promise} - Promise that resolves to the API response with users
 */
// export const getOrganizationUsers = async (orgId) => {
//   try {
//     const response = await axios.get(
//       `${API_URL}/organizations/${orgId}/users`,
//       {
//         headers: {
//           'accept': '*/*',
//           'content-type': 'application/json',
//           'authorization': `Bearer ${getAuthToken()}`
//         }
//       }
//     );
    
//     return response.data;
//   } catch (error) {
//     console.error('Error fetching organization users:', error);
//     throw error;
//   }
// };

/**
 * Get organization deployments
 * @param {string} orgId - Organization ID to fetch deployments for
 * @returns {Promise} - Promise that resolves to the API response with deployments
 */
export const getOrganizationDeployments = async (orgId) => {
  console.log('[API] Fetching deployments for organization:', orgId);
  try {
    const response = await axios.get(
      `${API_URL}/organizations/${orgId}/deployments`,
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    
    console.log('[API] Get deployments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching organization deployments:', error);
    throw error;
  }
};

/**
 * Get organization permissions
 * @param {string} orgId - Organization ID to fetch permissions for
 * @returns {Promise} - Promise that resolves to the API response with permissions
 */
export const getOrganizationPermissions = async (orgId) => {
  console.log('[API] Fetching permissions for organization:', orgId);
  try {
    const response = await axios.get(
      `${API_URL}/organizations/${orgId}/permissions?included=user,organization`,
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    
    console.log('[API] Get permissions response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching organization permissions:', error);
    throw error;
  }
};

/**
 * Get details for a specific organization
 * @param {string} organizationId - ID of the organization to fetch
 * @returns {Promise} - Promise that resolves to the API response
 */
export const getOrganizationDetails = async (organizationId) => {
  console.log('[API] Fetching organization details for:', organizationId);
  try {
    const response = await axios.get(
      `${API_URL}/organizations/${organizationId}`,
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    
    console.log('[API] Organization details response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error fetching organization details:', error);
    throw error;
  }
};

/**
 * Update organization name
 * @param {string} organizationId - ID of the organization to update
 * @param {string} newName - New name for the organization
 * @returns {Promise} - Promise that resolves to the API response
 */
export const updateOrganization = async (organizationId, newName) => {
  console.log('[API] Updating organization:', organizationId, 'with name:', newName);
  try {
    const response = await axios.patch(
      `${API_URL}/organizations/${organizationId}`,
      {
        data: {
          type: 'organizations',
          id: organizationId,
          attributes: {
            name: newName
          }
        }
      },
      {
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
          'authorization': `Bearer ${getAuthToken()}`
        }
      }
    );
    
    console.log('[API] Update organization response:', response.data);
    return response.data;
  } catch (error) {
    console.error('[API] Error updating organization:', error);
    throw error;
  }
};

// You can export additional deployment-related API functions here
