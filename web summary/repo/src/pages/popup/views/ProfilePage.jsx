import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUser, FaCog, FaSignOutAlt, FaArrowLeft, FaChartLine, FaKey, FaUsers, 
  FaCrown, FaCheck, FaBuilding, FaCalendarAlt, FaIdCard, FaTag, 
  FaCheckCircle, FaTimesCircle, FaCreditCard, FaCalendarCheck, 
  FaShieldAlt, FaSync, FaToggleOn, FaToggleOff, FaChevronDown, 
  FaChevronUp, FaInfinity, FaClock, FaStar, FaChartBar
} from 'react-icons/fa';

import useAuthAndPrefs from '@/hooks/useAuthAndPrefs';
import useUserOrgs from '@/hooks/useUserOrgs';
import useQuotaGate from '@/hooks/useQuotaGate';
import auth from '@/services/auth';

const ProfilePage = ({ onBack, onOpenSettings, onOpenPlans, onLogout }) => {
  const {
    authUser, isAuthed, authLoading, authError, prefs, loadPrefs,
  } = useAuthAndPrefs();

  const { loading: orgsLoading, error: orgsError, user: userFromApi, organizations } = useUserOrgs();
  
  // Get quota information
  const [prefsReady, setPrefsReady] = useState(false);
  useEffect(() => { (async () => { await loadPrefs(); setPrefsReady(true); })(); }, [loadPrefs]);
  const useOwnKey = !!prefs?.useOwnKey;
  const quota = useQuotaGate({ useOwnKey });
  const isGated = prefsReady ? (!useOwnKey && quota.shouldGate) : false;

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await auth.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }, [onLogout]);

  const getDisplayName = (user) => {
    return user?.name || user?.login || user?.username || (user?.email ? user.email.split('@')[0] : 'User');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getSubscriptionStatus = () => {
    if (!organizations || organizations.length === 0) {
      return { status: 'free', text: 'Free Plan', color: 'text-gray-600' };
    }

    const org = organizations[0];
    const status = org.subscriptionStatus?.toLowerCase();
    const type = org.subscriptionType?.toLowerCase();

    if (type === 'paid' && status === 'active') {
      return { status: 'active', text: 'Active', color: 'text-green-600' };
    } else if (status === 'canceled') {
      return { status: 'canceled', text: 'Canceled', color: 'text-red-600' };
    } else if (status === 'past_due') {
      return { status: 'past_due', text: 'Past Due', color: 'text-orange-600' };
    } else {
      return { status: 'free', text: 'Free Plan', color: 'text-gray-600' };
    }
  };

  const subscriptionInfo = getSubscriptionStatus();
  const displayName = getDisplayName(authUser);
  const avatarUrl = authUser?.avatarUrl || authUser?.avatar_url || '/icons/wootz.png';
  const memberSince = formatDate(authUser?.createdAt);

  return (
    <div className="profile-container w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col relative overflow-hidden">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="profile-orb-1 floating-orb"></div>
        <div className="profile-orb-2 floating-orb"></div>
        <div className="profile-orb-3 floating-orb"></div>
      </div>

      {/* Header */}
      <div className="profile-header bg-white/95 backdrop-blur-sm border-b border-gray-200 p-3 relative z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="profile-back-button flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <FaArrowLeft size={16} />
            <span className="font-medium">Back</span>
          </button>
          
          <div className="text-center">
            <h1 className="profile-title text-xl font-bold text-gray-800">Profile</h1>
            <p className="profile-subtitle text-sm text-gray-600">Manage your account</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
              title="Settings"
            >
              <FaCog size={16} />
            </button>
            {/* <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="p-2 text-gray-600 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50"
              title="Logout"
            >
              <FaSignOutAlt size={16} />
            </button> */}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content flex-1 p-4 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto space-y-4">
          
          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="profile-user-info bg-white rounded-2xl shadow-lg p-4 border border-gray-200 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center space-x-3">
              <div className="profile-avatar relative">
                <img 
                  src={avatarUrl} 
                  alt="User Avatar" 
                  className="w-16 h-16 rounded-full object-cover border-3 border-gradient-to-r from-red-500 to-orange-500 shadow-lg" 
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <FaCheck size={10} className="text-white" />
                </div>
              </div>
              <div className="profile-user-details flex-1">
                <h2 className="profile-user-name text-2xl font-bold text-gray-800 mb-1">{displayName}</h2>
                <p className="profile-user-email text-gray-600 mb-2">{authUser?.email || 'No email provided'}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaCalendarAlt size={12} />
                    <span>Joined {memberSince}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FaIdCard size={12} />
                    <span>Verified User</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Usage Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="profile-stats bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-blue-500" size={20} />
                  <h3 className="font-semibold text-gray-800">Usage</h3>
                </div>
                <FaSync className="text-gray-400" size={16} />
              </div>
              
              {!orgsLoading && quota ? (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requests</span>
                    <span className="font-semibold text-gray-800">{quota.used || 0} / {quota.limit || 100}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((quota.used || 0) / (quota.limit || 100) * 100, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Math.round(((quota.used || 0) / (quota.limit || 100)) * 100)}% used</span>
                    <span>{quota.limit - (quota.used || 0)} remaining</span>
                  </div>
                  
                  {isGated && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center gap-2 text-amber-800 mb-1">
                        <FaCrown size={12} />
                        <span className="text-xs font-medium">Upgrade needed</span>
                      </div>
                      <p className="text-xs text-amber-700">You've reached your limit</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              )}
            </motion.div>

            {/* Subscription Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="profile-subscription bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaCrown className="text-yellow-500" size={20} />
                  <h3 className="font-semibold text-gray-800">Plan</h3>
                </div>
                <FaBuilding className="text-gray-400" size={16} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-800">{subscriptionInfo.text}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    subscriptionInfo.status === 'active' ? 'bg-green-100 text-green-800' :
                    subscriptionInfo.status === 'canceled' ? 'bg-red-100 text-red-800' :
                    subscriptionInfo.status === 'past_due' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {subscriptionInfo.status === 'active' ? 'Active' :
                     subscriptionInfo.status === 'canceled' ? 'Canceled' :
                     subscriptionInfo.status === 'past_due' ? 'Past Due' : 'Basic'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {organizations && organizations.length > 0 ? 
                    `Type: ${organizations[0]?.subscriptionType || 'Free'}` : 
                    'Limited features'
                  }
                </p>
                {organizations && organizations[0]?.subExpiry && (
                  <p className="text-xs text-gray-500">
                    Expires: {formatDate(organizations[0].subExpiry)}
                  </p>
                )}
              </div>
            </motion.div>

            {/* API Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="profile-api-settings bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaKey className="text-purple-500" size={20} />
                  <h3 className="font-semibold text-gray-800">API</h3>
                </div>
                <FaShieldAlt className="text-gray-400" size={16} />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">Configuration</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {useOwnKey ? 'Personal' : 'Backend'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {useOwnKey ? 'Using your own API keys' : 'Using backend service'}
                </p>
                <button
                  onClick={onOpenSettings}
                  className="w-full mt-3 px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Manage Settings
                </button>
              </div>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <button
              onClick={onOpenSettings}
              className="profile-button flex items-center justify-center gap-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FaCog className="text-gray-600" size={20} />
              <div className="text-left">
                <div className="font-semibold text-gray-800">API Settings</div>
                <div className="text-sm text-gray-600">Configure your API keys</div>
              </div>
            </button>
            
            <button
              onClick={onOpenPlans}
              className="profile-button flex items-center justify-center gap-3 p-4 bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <FaChartLine className="text-gray-600" size={20} />
              <div className="text-left">
                <div className="font-semibold text-gray-800">View Plans</div>
                <div className="text-sm text-gray-600">Upgrade your subscription</div>
              </div>
            </button>
          </motion.div>

          {/* Logout Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <FaSignOutAlt className="text-red-500" size={20} />
                <h3 className="font-semibold text-gray-800">Account Actions</h3>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="profile-button w-full max-w-xs mx-auto flex items-center justify-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl border border-red-200 hover:bg-red-100 transition-all duration-300 disabled:opacity-50"
              >
                <FaSignOutAlt size={16} />
                <span className="font-medium">
                  {isLoggingOut ? 'Signing out...' : 'Sign Out'}
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;