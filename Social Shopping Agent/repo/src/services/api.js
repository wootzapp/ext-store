/* global chrome */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// console.log('🌍 API Base URL:', API_BASE_URL);

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.sessionToken = null;
    this.clientId = null;
    this.ablyToken = null;
    this.encryptionKey = null;
    
    // console.log('🔗 APIService initialized with URL:', this.baseURL);
  }

  setSessionToken(token) {
    this.sessionToken = token;
  }

  async getStoredSessionToken() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['userAuth']);
        return result.userAuth?.sessionToken || null;
      }
    } catch (error) {
      console.error('Error getting stored session token:', error);
    }
    return null;
  }

  // ---- API helpers ----
  async _fetchMe() {
    const res = await fetch(`${this.baseURL}/user/`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    if (!this.sessionToken) {
      this.sessionToken = await this.getStoredSessionToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const config = { 
      ...options, 
      headers,
      credentials: 'include' // Include cookies for NextAuth.js
    };

    // Add session cookie if available
    if (this.sessionToken) {
      config.headers['Cookie'] = `__Secure-authjs.session-token=${this.sessionToken}`;
    }

    try {
      const response = await fetch(url, config);
      
      // Always try to get the response body for error details
      let responseData = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = await response.json();
        } catch (parseError) {
          console.warn('Failed to parse response JSON:', parseError);
        }
      } else {
        // If not JSON, try to get text
        try {
          const text = await response.text();
          responseData = { message: text };
        } catch (textError) {
          console.warn('Failed to get response text:', textError);
        }
      }

      if (response.status === 401) {
        // For authentication endpoints, don't clear auth data immediately
        if (endpoint === '/auth/login' || endpoint === '/auth/signup') {
          const errorMessage = responseData.detail || responseData.message || 'Authentication failed';
          throw new Error(errorMessage);
        }
        
        await this.clearAuthData();
        throw new Error('Authentication failed. Please log in again.');
      }

      if (response.status === 402) {
        throw new Error('TRIAL_EXPIRED');
      }

      if (response.status === 429) {
        throw new Error('RATE_LIMITED');
      }

      if (!response.ok) {
        // Extract the most specific error message available
        let errorMessage = 'An error occurred';
        
        if (responseData.detail) {
          errorMessage = responseData.detail;
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else if (responseData.error) {
          errorMessage = responseData.error;
        } else {
          errorMessage = `HTTP ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }

      return responseData;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      
      // If it's already our custom error, just throw it
      if (error.message.includes('TRIAL_EXPIRED') || 
          error.message.includes('RATE_LIMITED') ||
          error.message.includes('Authentication failed') ||
          error.message.includes('detail')) {
        throw error;
      }
      
      // For network errors or other issues
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your connection.');
      }
      
      throw error;
    }
  }

  async clearAuthData() {
    this.sessionToken = null;
    this.clientId = null;
    this.ablyToken = null;
    this.encryptionKey = null;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(['userAuth', 'authData']);
      }
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  }

  // Authentication methods following the provided pattern
  async checkAuthentication() {
    try {
      const user = await this._fetchMe();
      if (user) {
        await this.saveAuthUser(user);
        return { isAuthenticated: true, user };
      }
    } catch {}
    return { isAuthenticated: false, user: null };
  }

  async saveAuthUser(user) {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        // Save user auth data
        await chrome.storage.local.set({
          userAuth: {
            user: user,
            isAuthenticated: true,
            timestamp: Date.now()
          }
        });

        // Also save auth data in the format expected by MultiLLMService
        if (user && user.sessionToken) {
          await chrome.storage.local.set({
            authData: {
              user: user,
              sessionToken: user.sessionToken,
              userId: user.userId || user.id,
              expires: user.expires,
              timestamp: Date.now()
            }
          });
        }
      }
    } catch (error) {
      console.error('Error saving auth user:', error);
    }
  }

  async isUserAuthenticated() {
    try {
      // First check if we have stored auth data
      const authData = await new Promise((resolve) => {
        chrome.storage.local.get(['authData'], (result) => {
          resolve(result.authData || null);
        });
      });
      
      if (!authData) {
        return false;
      }
      
      // Check if session is still valid by making a test request
      const response = await fetch(`${this.baseURL}/user/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      return response.ok;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  async getAuthSession() {
    try {
      const authData = await new Promise((resolve) => {
        chrome.storage.local.get(['authData'], (result) => {
          resolve(result.authData || null);
        });
      });
      
      if (!authData) {
        return { isAuthenticated: false, user: null };
      }
      
      // Check if session is still valid
      const isAuthenticated = await this.isUserAuthenticated();
      
      return {
        isAuthenticated,
        user: authData.user
      };
    } catch (error) {
      console.error('Error getting auth session:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  async clearAuthSession() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.remove(['userAuth', 'authData']);
      }
    } catch (error) {
      console.error('Error clearing auth session:', error);
    }
  }

  async startDeepHUDLogin() {
    // Use background script for authentication (where chrome.cookies API is available)
    try {
      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'START_DEEPHUD_LOGIN' }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      if (response.success) {
        // Authentication successful, get user data
        const userData = await this.getCurrentUser();
        return userData;
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      throw error;
    }
  }

  async checkAuthStatus() {
    try {
      // Check if session is valid by attempting to fetch user data
      const response = await fetch(`${this.baseURL}/user/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.user && userData.user.sessionToken) {
          this.sessionToken = userData.user.sessionToken;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking auth status:', error);
      return false;
    }
  }

  // User Management APIs
  async getCurrentUser() {
    console.log("API getCurrentUser - making request to /user/");
    const response = await this.makeRequest(`/user/?_t=${Date.now()}`);
    console.log("API getCurrentUser - response:", response);
    return response; // Return the full response with both user and organizations
  }

  // Organization Management APIs
  async getOrganizationsForPrice(priceId) {
    return await this.makeRequest(`/products/${priceId}/organizations/`);
  }

  async createOrganizationForPrice(priceId, organizationData) {
    return await this.makeRequest(`/products/${priceId}/organizations/`, {
      method: 'POST',
      body: JSON.stringify(organizationData)
    });
  }

  // Pricing APIs
  async getProductsByCurrency(currency) {
    return await this.makeRequest('/pricing/currency', {
      method: 'POST',
      body: JSON.stringify({ currency })
    });
  }

  // Payment APIs
  async createCheckoutSession(priceId, organizationId) {
    return await this.makeRequest('/payments/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId, organizationId })
    });
  }

  // Quota APIs
  async getUserQuota(orgId = null) {
    const endpoint = orgId ? `/user/quota?orgId=${orgId}&_t=${Date.now()}` : `/user/quota?_t=${Date.now()}`;
    console.log("API getUserQuota - making request to endpoint:", endpoint);
    return await this.makeRequest(endpoint);
  }

  // Get quota for active organization specifically
  async getActiveOrganizationQuota() {
    try {
      // First get user data to find the active organization
      const userData = await this.getCurrentUser();
      console.log("API getActiveOrganizationQuota - userData:", userData);
      
      const organizations = userData?.organizations || [];
      console.log("API getActiveOrganizationQuota - organizations:", organizations);
      
      // Find the active organization - prioritize selectedOrganizationId from user data
      let activeOrg = null;
      const selectedOrgId = userData?.user?.selectedOrganizationId;
      console.log("API getActiveOrganizationQuota - selectedOrgId from userData.user:", selectedOrgId);
      
      if (selectedOrgId) {
        activeOrg = organizations.find(org => org.id === selectedOrgId);
        console.log("API getActiveOrganizationQuota - found org by selectedOrganizationId:", activeOrg);
      }
      
      // Fallback to isActive or first organization
      if (!activeOrg) {
        activeOrg = organizations.find(org => org.isActive) || organizations[0];
        console.log("API getActiveOrganizationQuota - fallback activeOrg:", activeOrg);
      }
      
      if (!activeOrg) {
        throw new Error('No active organization found');
      }
      
      console.log("API getActiveOrganizationQuota - using activeOrg.id:", activeOrg.id);
      
      // Get quota for the specific active organization
      const quotaResponse = await this.getUserQuota(activeOrg.id);
      console.log("API getActiveOrganizationQuota - quotaResponse:", quotaResponse);
      
      return quotaResponse;
    } catch (error) {
      console.error('Error getting active organization quota:', error);
      throw error;
    }
  }

  // Mobile Streaming APIs
  async createStreamingSession() {
    const response = await this.makeRequest('/streamMobile/createSession/', {
      method: 'POST'
    });
    
    if (response.success) {
      this.clientId = response.clientId;
    }
    
    return response;
  }

  async getStreamingToken() {
    if (!this.clientId) {
      throw new Error('Client ID not available. Create a streaming session first.');
    }

    const response = await this.makeRequest('/streamMobile/getToken/', {
      method: 'POST',
      body: JSON.stringify({ clientId: this.clientId })
    });

    if (response.success) {
      this.ablyToken = response.tokenRequest;
      this.encryptionKey = response.encryptionKey;
    }

    return response;
  }

  async startAIChat(prompt, orgId) {
    if (!this.clientId) {
      throw new Error('Client ID not available. Create a streaming session first.');
    }

    return await this.makeRequest('/streamMobile/startChat/', {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt,
        clientId: this.clientId,
        orgId: orgId
      })
    });
  }

  // LLM Generate API for AI content generation using DeepHUD API
  async generateContent(prompt, options = {}) {
    try {
      // Get authentication data from chrome.storage.local
      const authData = await new Promise((resolve) => {
        chrome.storage.local.get(['authData'], (result) => {
          resolve(result.authData || null);
        });
      });

      if (!authData) {
        throw new Error('Authentication data not found. Please sign in first.');
      }

      // Get cached user data with fallback to API if needed
      const { user, organizations } = await this.getCachedUserData();
      
      if (organizations.length === 0) {
        throw new Error('No organizations found. Please create an organization first.');
      }

      // Use the user's selected organization or the first active one
      const activeOrg = organizations.find(org => org.id === user?.selectedOrganizationId) || 
                       organizations.find(org => org.isActive) || 
                       organizations[0];

      // Prepare request body for direct response mode (no clientId for streaming)
      const requestBody = {
        prompt: prompt,
        orgId: activeOrg.id
      };

      // Add screenshot if provided in options
      if (options.screenshot) {
        // Convert data URL to base64 if needed
        let imageData = options.screenshot;
        if (imageData.startsWith('data:image/')) {
          imageData = imageData.split(',')[1]; // Remove data URL prefix
        }
        
        requestBody.imageData = imageData;
        requestBody.imageMimeType = 'image/jpeg'; // Default to JPEG
      }

      // Start AI chat session in direct response mode (no clientId)
      const chatResponse = await fetch(`${this.baseURL}/streamMobile/startChat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!chatResponse.ok) {
        const errorText = await chatResponse.text();
        throw new Error(`Failed to start chat: ${chatResponse.status} - ${errorText}`);
      }

      const chatData = await chatResponse.json();
      
      // Return the direct response (not streaming)
      if (chatData.success && chatData.response) {
        return chatData.response;
      } else {
        throw new Error('No response received from AI service');
      }
      
    } catch (error) {
      console.error('DeepHUD LLM API error:', error);
      throw error;
    }
  }

  // Helper function to get cached user data with fallback to API
  async getCachedUserData() {
    // Get cached user data instead of making API call
    const cachedUserData = await new Promise((resolve) => {
      chrome.storage.local.get(['userAuth', 'authData'], (result) => {
        // Prefer userAuth (from ProfilePage) as it contains both user and organizations
        if (result.userAuth && result.userAuth.user && result.userAuth.organizations) {
          resolve(result.userAuth);
        } else if (result.authData && result.authData.user) {
          // If only authData is available, we need to fetch organizations
          resolve(result.authData);
        } else {
          resolve(null);
        }
      });
    });

    // If no cached user data found at all, make API call to fetch fresh data
    if (!cachedUserData || !cachedUserData.user) {
      console.log('⚠️ No cached user data found, making API call to /user/...');
      try {
        const userResponse = await fetch(`${this.baseURL}/user/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to get user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        
        // Cache the complete data for future use
        await new Promise((resolve) => {
          chrome.storage.local.set({
            userAuth: {
              user: userData.user,
              organizations: userData.organizations || []
            },
            authData: {
              user: userData.user,
              timestamp: Date.now()
            }
          }, resolve);
        });
        
        console.log('✅ Fresh user data fetched and cached');
        return {
          user: userData.user,
          organizations: userData.organizations || []
        };
      } catch (error) {
        console.error('❌ Failed to fetch user data from API:', error);
        throw new Error(`Failed to fetch user data: ${error.message}`);
      }
    }

    // Check if we have complete cached data (user + organizations)
    let organizations = cachedUserData.organizations;
    if (!organizations) {
      console.log('⚠️ Organizations not cached, making API call to /user/...');
      try {
        const userResponse = await fetch(`${this.baseURL}/user/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to get user data: ${userResponse.status}`);
        }

        const userData = await userResponse.json();
        organizations = userData.organizations || [];
        
        // Cache the complete data for future use to prevent future API calls
        await new Promise((resolve) => {
          chrome.storage.local.set({
            userAuth: {
              user: cachedUserData.user,
              organizations: organizations
            }
          }, resolve);
        });
        console.log('✅ Cached complete user data for future requests');
      } catch (error) {
        console.error('❌ Failed to fetch organizations from API:', error);
        // Return partial data if organizations fetch fails
        organizations = [];
      }
    } else {
      console.log('✅ Using cached user data (no API call needed)');
    }

    return {
      user: cachedUserData.user,
      organizations: organizations
    };
  }

  // Legacy methods for backward compatibility
  async signup(userData) {
    // For Chrome extension, we'll use the popup authentication
    throw new Error('Please use the authentication popup for signup');
  }

  async login(credentials) {
    // For Chrome extension, we'll use the popup authentication
    throw new Error('Please use the authentication popup for login');
  }

  async getUserSubscription() {
    // This will be handled through organization management
    // For now, return a default structure
    return {
      status: 'active',
      plan_type: 'free_trial',
      monthly_request_limit: 100,
      requests_used: 0,
      remaining_requests: 100,
      trial_end: null
    };
  }

  async getUsageStats() {
    // This will be handled through organization management
    return {
      monthly_limit: 100,
      requests_used: 0
    };
  }

  // Helper methods for streaming
  getClientId() {
    return this.clientId;
  }

  getAblyToken() {
    return this.ablyToken;
  }

  getEncryptionKey() {
    return this.encryptionKey;
  }

  async logout() {
    // optionally: await fetch(`${this.baseURL}/auth/logout`, { method:'POST', credentials:'include' });
    await this.clearAuthSession();
    return { success: true };
  }

  async isAuthenticated() {
    return this.isUserAuthenticated();
  }

  async getUser() {
    const s = await this.getAuthSession();
    return s.user;
  }
}

const apiService = new APIService();
export default apiService; 