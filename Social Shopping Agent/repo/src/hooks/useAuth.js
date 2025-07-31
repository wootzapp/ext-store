/* global chrome */
import { useState, useEffect } from 'react';
import apiService from '../services/api';

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['userAuth']);
        
        const tokenValid = result.userAuth?.access_token && 
                          result.userAuth?.tokenExpiry && 
                          result.userAuth.tokenExpiry > Date.now();
        
        if (tokenValid) {
          apiService.setToken(result.userAuth.access_token);
          
          try {
            const user = await apiService.getCurrentUser();
            setAuthState({
              isLoggedIn: true,
              user: user,
              loading: false,
              error: null
            });
          } catch (error) {
            await apiService.clearAuthData();
            setAuthState({
              isLoggedIn: false,
              user: null,
              loading: false,
              error: null
            });
          }
        } else {
          await apiService.clearAuthData();
          setAuthState({
            isLoggedIn: false,
            user: null,
            loading: false,
            error: null
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        error: error.message
      });
    }
  };

  const login = async (credentials) => {
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      await apiService.login(credentials);
      const user = await apiService.getCurrentUser();
      
      setAuthState({
        isLoggedIn: true,
        user: user,
        loading: false,
        error: null
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      return { success: false, error: error.message };
    }
  };

  const signup = async (userData) => {
    setAuthState(prev => ({ ...prev, error: null }));
    
    try {
      await apiService.signup(userData);
      const loginResult = await login({
        email: userData.email,
        password: userData.password
      });
      
      return loginResult;
    } catch (error) {
      console.error('Signup error:', error);
      
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiService.clearAuthData();
      setAuthState({
        isLoggedIn: false,
        user: null,
        loading: false,
        error: null
      });
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    ...authState,
    login,
    signup,
    logout,
    checkAuthStatus
  };
};