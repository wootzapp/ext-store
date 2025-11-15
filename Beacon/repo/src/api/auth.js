/* global chrome */

const API_BASE_URL = 'https://api.beaconator.com';

/**
 * Request a magic link for authentication
 * @param {string} email - User's email address
 * @returns {Promise<{ data: { type: string, attributes: { message: string } } }>}
 */
export const requestMagicLink = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/magiclink`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.errors?.[0]?.detail || 
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Magic link request error:', error);
    throw error;
  }
};

/**
 * Verify magic link and get authentication token
 * @param {string} email - User's email address
 * @param {string} key - Verification key from magic link
 * @returns {Promise<{ data: { type: string, attributes: { email: string, token: string } } }>}
 */
export const verifyMagicLink = async (email, key) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify_link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': chrome.runtime.getURL(''),
        'X-Extension-Id': chrome.runtime.id
      },
      body: JSON.stringify({ email, key })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Store authentication data in chrome storage
    if (data.data?.attributes?.token) {
      await chrome.storage.local.set({
        userAuth: true,
        authToken: data.data.attributes.token,
        userEmail: email,
        extensionContext: true
      });
    }

    return data;
  } catch (error) {
    console.error('Magic link verification error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
  try {
    const auth = await chrome.storage.local.get(['userAuth', 'authToken']);
    return !!(auth.userAuth && auth.authToken);
  } catch (error) {
    console.error('Auth check error:', error);
    return false;
  }
};

/**
 * Get stored auth token
 * @returns {Promise<string|null>}
 */
export const getAuthToken = async () => {
  try {
    const auth = await chrome.storage.local.get(['authToken']);
    return auth.authToken || null;
  } catch (error) {
    console.error('Get token error:', error);
    return null;
  }
};

/**
 * Clear authentication data
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    await chrome.storage.local.remove(['userAuth', 'authToken', 'userId', 'userEmail']);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {string} email - User's email address
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {Promise<Object>} Response data from the server
 */
export const registerUser = async (email, firstName, lastName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        data: {
          type: 'users',
          attributes: {
            email,
            first_name: firstName,
            last_name: lastName
          }
        }
      })
    });
    

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.errors?.[0]?.detail || 
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    
    // Store user data in chrome storage
    if (data.data?.id) {
      await chrome.storage.local.set({
        userId: data.data.id,
        userEmail: data.data.attributes.email,
        userType: data.data.type,
        deploymentPermissions: data.data.relationships['deployment-permissions'].data,
        groupPermissions: data.data.relationships['group-permissions'].data,
        organizationPermissions: data.data.relationships['organization-permissions'].data
      });
    }

    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Login with email and TOTP
 * @param {string} email - User's email address
 * @param {string} totp - TOTP code from authenticator app
 * @returns {Promise<Object>} Response data from the server
 */
export const loginUser = async (email, totp) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({
        email,
        totp
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.errors?.[0]?.detail || 
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Request password recovery (new TOTP QR Code)
 * @param {string} email - User's email address
 * @returns {Promise<{ data: { type: string } }>}
 */
export const requestPasswordRecovery = async (email) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.errors?.[0]?.detail || 
        `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Password recovery request error:', error);
    throw error;
  }
};
