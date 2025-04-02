/* global chrome */

import { defineChain } from 'thirdweb'
import { OasisSapphire, OasisSapphireTestnet } from '@thirdweb-dev/chains'
// import { chain } from '@/shared/chain'
// import { client } from '@/shared/client'
import { inAppWallet } from 'thirdweb/wallets'
import { readContract } from 'thirdweb'
import { Account } from 'thirdweb/wallets'
import { useNavigate } from 'react-router-dom';
// import { GAContract } from '../contract'

// Store the token globally (you might want to use a more secure method in production)
let authToken = null;

// export async function loadWallet(token) {
//     const wallet = inAppWallet()

//     return wallet.connect({
//         client,
//         chain,
//         strategy: 'jwt',
//         jwt: token,
//     })
// }

export async function loginWallet(email, password) {
    console.log("HELLLOO : login");

    const url = "https://api-prd-0.gotartifact.com/v2/users/authentication/signin";

    const requestBody = JSON.stringify({
        email: email,
        password: password
    });

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: requestBody,
            redirect: 'follow',
        });

        const responseData = await response.json();
        console.log("Raw login response:", responseData);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(responseData)}`);
        }

        if (!responseData.success || !responseData.data || !responseData.data.id_token) {
            throw new Error(`Invalid response structure: ${JSON.stringify(responseData)}`);
        }

        authToken = responseData.data.id_token;
        localStorage.setItem('authToken', responseData.data.id_token);
        console.log("Authentication token stored successfully", responseData.data.id_token);
        localStorage.setItem('refreshToken', responseData.data.refresh_token);
        console.log("Refresh token stored successfully", responseData.data.refresh_token);

        return responseData;
    } catch (error) {
        console.error("Error in loginWallet:", error);
        throw error;
    }
}

// Function to get the stored auth token
export function getAuthToken() {
    // If you're in a browser extension, use chrome.storage instead
    // return new Promise((resolve) => {
    //     chrome.storage.local.get(['authToken'], (result) => {
    //         resolve(result.authToken);
    //     });
    // });
    return localStorage.getItem('authToken');
}

// Function to use the auth token in other API calls
export async function makeAuthenticatedRequest(url, options = {}) {
    let token = localStorage.getItem('authToken');
    console.log('🔑 Token Aaditesh getuserprofile:', token);
    
    if (!token) {
        console.log('No token found, attempting to refresh...');
        const refreshResult = await refreshAuthToken();
        token = refreshResult.authToken;
        console.log('New tokens after refresh:', refreshResult);
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

async function checkLoginStatus() {
    // This function would make a request to an endpoint that checks if the user is logged in
    // You'll need to implement this based on your API's capabilities
    console.log("Checking login status...");
    // Implement the actual check here
}

export async function refreshAuthToken() {
    console.log('🔄 Attempting to refresh auth token');
    let storedRefreshToken = localStorage.getItem('refreshToken');
  
    try {
      const response = await fetch('https://api-prd-0.gotartifact.com/v2/users/authentication/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          refresh_token: storedRefreshToken
        })
      });
  
      if (!response.ok) {
        throw new Error(`Refresh failed: ${response.status}`);
      }
  
      const { data } = await response.json();
      // Update stored auth token with new value from the correct path
      console.log('🔑 Refresh token response:', data);
      
      // Update both local storage and memory variables
      localStorage.setItem('authToken', data.id_token);
      localStorage.setItem('refreshToken', data.refresh_token);
  
      console.log('🔑 Refreshed data:', {
        authToken: data.id_token,
        refreshToken: data.refresh_token
      });
  
      return {
        authToken: data.id_token,
        refreshToken: data.refresh_token
      };
  
    } catch (error) {
      console.error('❌ Failed to refresh auth token:', error);
    }
  }

export async function logUrl(url) {
    authToken = getAuthToken();
    if (!authToken) {
        throw new Error('Not authenticated. Please login first.');
    }
    const response = await fetch(
        'https://api-prd-0.gotartifact.com/v2/logs/url',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ encrypted_url: url }),
        }
    )
    const data = await response.json()
    console.info(`Log result:`, data)
    return data
}

export async function encrypt(secret, data) {
    authToken = getAuthToken();
    if (!authToken) {
        throw new Error('Not authenticated. Please login first.');
    }
    const response = await fetch(
        'https://api-prd-0.gotartifact.com/v2/encrypt',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rawData: data,
                secretKey: secret,
            }),
        }
    )
    const body = await response.json()
    return body?.base64EncryptedEncodedData
}

export async function getUserProfile() {
    try {
        const data = await makeAuthenticatedRequest('https://api-prd-0.gotartifact.com/v2/users/me', {
            method: 'GET'
        });

        if (!data.success) {
            throw new Error(data.error || 'Failed to retrieve user profile');
        }

        console.log("Full API Response:", data);
        return data.profile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

// Function to store ad activity
export async function storeAdActivity() {
    try {
        const data = await makeAuthenticatedRequest('https://api-prd-0.gotartifact.com/v2/user_privacies/ad_activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Ad activity stored:", data);
        return data;
    } catch (error) {
        console.error('Error storing ad activity:', error);
        throw error;
    }
}