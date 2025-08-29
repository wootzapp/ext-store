/* global chrome */
import { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

export const useSubscription = (user) => {
  const [subscriptionState, setSubscriptionState] = useState({
    status: null,
    plan_type: null,
    monthly_request_limit: 0,
    requests_used: 0,
    remaining_requests: 0,
    trial_end: null,
    usingPersonalAPI: false,
    hasPersonalKeys: false,
    userPreferPersonalAPI: false, // New: user's toggle preference
    loading: true,
    error: null
  });

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (subscriptionLoadTimeoutRef.current) {
        clearTimeout(subscriptionLoadTimeoutRef.current);
      }
    };
  }, []);

  // Add rate limiting for subscription data loading
  const subscriptionLoadTimeoutRef = useRef(null);
  
  const loadSubscriptionData = async () => {
    // Prevent multiple simultaneous calls
    if (subscriptionLoadTimeoutRef.current) {
      clearTimeout(subscriptionLoadTimeoutRef.current);
    }
    
    subscriptionLoadTimeoutRef.current = setTimeout(async () => {
      try {
        setSubscriptionState(prev => ({ ...prev, loading: true }));

        // Always check subscription status from API first
        const subscription = await apiService.getUserSubscription();
        
        // Get quota data for the active organization
        let monthly_limit = subscription.monthly_request_limit;
        let requests_used = subscription.requests_used;
        
        // If the subscription doesn't have usage data, get it from active organization quota
        if (typeof requests_used === 'undefined') {
          try {
            console.log("useSubscription - calling getActiveOrganizationQuota");
            const quotaData = await apiService.getActiveOrganizationQuota();
            console.log("useSubscription - quota data:", quotaData);
            // Extract quota data from the response
            const quota = quotaData.quotas?.find(q => q.featureKey === 'chat');
            if (quota) {
              monthly_limit = quota.limit || monthly_limit;
              requests_used = quota.currentUsage || 0;
            }
          } catch (quotaError) {
            console.warn('Could not fetch active organization quota:', quotaError);
            requests_used = 0;
          }
        }
        
        const remaining = Math.max(0, monthly_limit - requests_used);
        
        // Check if using personal API keys
        const hasPersonalKeys = await checkPersonalAPIKeys();
        
        // Get user's toggle preference
        const userPreference = await getUserAPIPreference();
        
        // Logic: Use personal API based on user preference, availability, and trial status
        const shouldUsePersonalAPI = determineAPIUsage(remaining, hasPersonalKeys, userPreference);
        
        setSubscriptionState({
          status: subscription.status,
          plan_type: subscription.plan_type,
          monthly_request_limit: monthly_limit,
          requests_used: requests_used,
          remaining_requests: remaining,
          trial_end: subscription.trial_end,
          current_period_end: subscription.current_period_end,
          usingPersonalAPI: shouldUsePersonalAPI,
          hasPersonalKeys: hasPersonalKeys,
          userPreferPersonalAPI: userPreference,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error loading subscription data:', error);
        
        // If API fails, check if we have personal keys as fallback
        const hasPersonalKeys = await checkPersonalAPIKeys();
        const userPreference = await getUserAPIPreference();
        
        setSubscriptionState(prev => ({
          ...prev,
          usingPersonalAPI: hasPersonalKeys && userPreference,
          hasPersonalKeys: hasPersonalKeys,
          userPreferPersonalAPI: userPreference,
          loading: false,
          error: error.message
        }));
      } finally {
        subscriptionLoadTimeoutRef.current = null;
      }
    }, 500); // 500ms debounce
  };

  const determineAPIUsage = (remaining, hasPersonalKeys, userPreference) => {
    // If trial expired and has keys, force personal API
    if (remaining <= 0 && hasPersonalKeys) {
      return true;
    }
    
    // If user prefers personal API and has keys
    if (userPreference && hasPersonalKeys) {
      return true;
    }
    
    // Otherwise use free trial
    return false;
  };

  const checkPersonalAPIKeys = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.sync.get(['agentConfig']);
        const config = result.agentConfig || {};
        return !!(config.anthropicApiKey || config.openaiApiKey || config.geminiApiKey);
      }
    } catch (error) {
      console.error('Error checking personal API keys:', error);
    }
    return false;
  };

  const getUserAPIPreference = async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['userPreferPersonalAPI']);
        return result.userPreferPersonalAPI || false;
      }
    } catch (error) {
      console.error('Error getting user API preference:', error);
    }
    return false;
  };

  const setUserAPIPreference = async (preference) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ userPreferPersonalAPI: preference });
        
        // Update state and recalculate API usage
        const hasPersonalKeys = await checkPersonalAPIKeys();
        const shouldUsePersonalAPI = determineAPIUsage(
          subscriptionState.remaining_requests, 
          hasPersonalKeys, 
          preference
        );
        
        setSubscriptionState(prev => ({
          ...prev,
          userPreferPersonalAPI: preference,
          usingPersonalAPI: shouldUsePersonalAPI
        }));
        
        return true;
      }
    } catch (error) {
      console.error('Error setting user API preference:', error);
      return false;
    }
    return false;
  };

  const refreshUsage = async () => {
    try {
      console.log("useSubscription refreshUsage - calling getActiveOrganizationQuota");
      const quotaData = await apiService.getActiveOrganizationQuota();
      console.log("useSubscription refreshUsage - quota data:", quotaData);
      // Extract quota data from the response
      const quota = quotaData.quotas?.find(q => q.featureKey === 'chat');
      if (quota) {
        const remaining = Math.max(0, quota.limit - quota.currentUsage);
        
        const hasPersonalKeys = await checkPersonalAPIKeys();
        const userPreference = await getUserAPIPreference();
        const shouldUsePersonalAPI = determineAPIUsage(remaining, hasPersonalKeys, userPreference);
        
        setSubscriptionState(prev => ({
          ...prev,
          monthly_request_limit: quota.limit,
          requests_used: quota.currentUsage,
          remaining_requests: remaining,
          usingPersonalAPI: shouldUsePersonalAPI
        }));
      }
    } catch (error) {
      console.error('Error refreshing usage:', error);
    }
  };

  const makeAIRequest = async (prompt, options = {}) => {
    try {
      let response;
      
      // Use their API if we have remaining requests and not forcing personal API
      if (subscriptionState.remaining_requests > 0 && !subscriptionState.usingPersonalAPI) {
        response = await apiService.generateContent(prompt, options);
        await refreshUsage();
      } else if (subscriptionState.hasPersonalKeys) {
        // Use personal API fallback (background script)
        throw new Error('USE_PERSONAL_API');
      } else {
        // No requests left and no personal keys
        throw new Error('TRIAL_EXPIRED');
      }
      
      return response;
    } catch (error) {
      if (error.message === 'TRIAL_EXPIRED' || error.message === 'RATE_LIMITED') {
        try {
          await refreshUsage();
        } catch (refreshError) {
          console.error('Error refreshing usage after limit:', refreshError);
        }
      }
      throw error;
    }
  };

  const isTrialExpired = () => {
    if (subscriptionState.usingPersonalAPI) {
      return false;
    }
    
    return subscriptionState.remaining_requests <= 0 || 
           subscriptionState.status === 'expired' ||
           (subscriptionState.trial_end && new Date(subscriptionState.trial_end) < new Date());
  };

  const getStatusDisplay = () => {
    if (subscriptionState.loading) {
      return { text: 'Loading...', color: '#657786' };
    }

    if (subscriptionState.usingPersonalAPI) {
      return { text: 'Using Personal API', color: '#17bf63' };
    }

    if (subscriptionState.remaining_requests === -1) {
      return { text: 'Unlimited', color: '#17bf63' };
    }

    if (subscriptionState.remaining_requests <= 0) {
      if (subscriptionState.hasPersonalKeys) {
        return { text: 'Trial Expired - Using Personal API', color: '#ffad1f' };
      }
      return { text: 'Trial Expired', color: '#e0245e' };
    }

    if (subscriptionState.remaining_requests <= 2) {
      return { 
        text: `${subscriptionState.remaining_requests}/${subscriptionState.monthly_request_limit} left`, 
        color: '#ffad1f' 
      };
    }

    return { 
      text: `${subscriptionState.remaining_requests}/${subscriptionState.monthly_request_limit} requests`, 
      color: '#17bf63' 
    };
  };

  return {
    ...subscriptionState,
    loadSubscriptionData,
    refreshUsage,
    makeAIRequest,
    isTrialExpired,
    getStatusDisplay,
    setUserAPIPreference
  };
};