/* global chrome */
import { useState, useEffect } from 'react';
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
    loading: true,
    error: null
  });

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSubscriptionData = async () => {
    try {
      setSubscriptionState(prev => ({ ...prev, loading: true }));

      // Always check subscription status from API first
      const subscription = await apiService.getUserSubscription();
      
      // Handle both subscription API and usage API response formats
      let monthly_limit = subscription.monthly_request_limit;
      let requests_used = subscription.requests_used;
      
      // If the subscription doesn't have usage data, get it from usage endpoint
      if (typeof requests_used === 'undefined') {
        try {
          const usage = await apiService.getUsageStats();
          monthly_limit = usage.monthly_limit || monthly_limit;
          requests_used = usage.requests_used || 0;
        } catch (usageError) {
          console.warn('Could not fetch usage stats:', usageError);
          requests_used = 0;
        }
      }
      
      const remaining = Math.max(0, monthly_limit - requests_used);
      
      // Check if using personal API keys
      const hasPersonalKeys = await checkPersonalAPIKeys();
      
      // Logic: Use personal API if (requests = 0 AND has keys) OR (requests > 0 AND no keys)
      // But prefer their API when requests > 0
      const shouldUsePersonalAPI = remaining <= 0 && hasPersonalKeys;
      
      setSubscriptionState({
        status: subscription.status,
        plan_type: subscription.plan_type,
        monthly_request_limit: monthly_limit,
        requests_used: requests_used,
        remaining_requests: remaining,
        trial_end: subscription.trial_end,
        current_period_end: subscription.current_period_end,
        usingPersonalAPI: shouldUsePersonalAPI,
        hasPersonalKeys: hasPersonalKeys, // Track if keys are available
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Error loading subscription data:', error);
      
      // If API fails, check if we have personal keys as fallback
      const hasPersonalKeys = await checkPersonalAPIKeys();
      
      setSubscriptionState(prev => ({
        ...prev,
        usingPersonalAPI: hasPersonalKeys,
        hasPersonalKeys: hasPersonalKeys,
        loading: false,
        error: error.message
      }));
    }
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

  const refreshUsage = async () => {
    if (subscriptionState.usingPersonalAPI) {
      return subscriptionState;
    }

    try {
      const usage = await apiService.getUsageStats();
      const remaining = Math.max(0, usage.monthly_limit - usage.requests_used);
      
      setSubscriptionState(prev => ({
        ...prev,
        requests_used: usage.requests_used,
        remaining_requests: remaining,
        monthly_request_limit: usage.monthly_limit
      }));

      return { ...usage, remaining_requests: remaining };
    } catch (error) {
      console.error('Error refreshing usage:', error);
      throw error;
    }
  };

  const makeAIRequest = async (prompt, options = {}) => {
    try {
      let response;
      
      // Use their API if we have remaining requests, otherwise use personal API
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
    getStatusDisplay
  };
};