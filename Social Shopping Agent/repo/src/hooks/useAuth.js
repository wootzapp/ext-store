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
      // Check if we have a valid session
      const authResult = await apiService.checkAuthentication();
      
      if (authResult.isAuthenticated) {
        setAuthState({
          isLoggedIn: true,
          user: authResult.user,
          loading: false,
          error: null
        });
      } else {
        await apiService.clearAuthSession();
        setAuthState({
          isLoggedIn: false,
          user: null,
          loading: false,
          error: null
        });
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

  const startDeepHUDLogin = async () => {
    setAuthState(prev => ({ ...prev, error: null, loading: true }));
    
    try {
      // Use the new API service method that follows the DeepHUD pattern
      const user = await apiService.startDeepHUDLogin();
      
      if (user) {
        setAuthState({
          isLoggedIn: true,
          user: user,
          loading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: 'Authentication failed or timed out.'
        }));
      }
    } catch (error) {
      console.error('DeepHUD login error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  const login = async (credentials) => {
    // Use DeepHUD authentication
    return await startDeepHUDLogin();
  };

  const signup = async (userData) => {
    // Use DeepHUD authentication
    return await startDeepHUDLogin();
  };

  const logout = async () => {
    try {
      await apiService.logout();
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
    checkAuthStatus,
    startDeepHUDLogin
  };
};