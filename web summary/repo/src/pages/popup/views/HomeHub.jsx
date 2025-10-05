// src/pages/popup/views/HomeHub.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaArrowLeft, FaUser, FaRobot, FaSearch, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import useAuthAndPrefs from '@/hooks/useAuthAndPrefs';
import useUserOrgs from '@/hooks/useUserOrgs';
import useQuotaGate from '@/hooks/useQuotaGate';
import QuotaCard from '@/pages/popup/components/QuotaCard';

const PRICING_URL = 'https://nextjs-app-410940835135.us-central1.run.app/pricing';
const DEBUG = true;

function log(...args) { if (DEBUG) console.log('[HomeHub]', ...args); }
function group(label, fn) {
  if (!DEBUG) return fn?.();
  console.groupCollapsed(`[HomeHub] ${label}`);
  try { fn?.(); } finally { console.groupEnd(); }
}

// Small wrapper to log QuotaCard mount/unmount + prop changes
function DebugQuotaCard(props) {
  useEffect(() => {
    group('QuotaCard mount', () => console.log('props:', props));
    return () => log('QuotaCard unmount (orgId=', props.orgId, ')');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    log('QuotaCard props changed →', { orgId: props.orgId, pricingUrl: props.pricingUrl, usingOwnKey: props.usingOwnKey });
  }, [props.orgId, props.pricingUrl, props.usingOwnKey]);
  return <QuotaCard {...props} />;
}

export default function HomeHub({
  onOpenProfile,
  onOpenResearch,
  onOpenAnalysis,
  onOpenFactChecker,
  onOpenPlans,
  onOpenChat,
  onOpenSettings,
}) {
  const { authUser, prefs, loadPrefs } = useAuthAndPrefs();

  // hydrate prefs so prefs.useOwnKey is available here (outside Settings)
  const [prefsReady, setPrefsReady] = useState(false);
  useEffect(() => { (async () => { await loadPrefs(); setPrefsReady(true); })(); }, [loadPrefs]);

  // the ONLY correct source of the toggle
  const useOwnKey = !!prefs?.useOwnKey;

  // gate only when NOT using own key
  const quota = useQuotaGate({ useOwnKey });
  const isGated = prefsReady ? (!useOwnKey && quota.shouldGate) : false;

  const { loading, error, user, organizations, selectedOrg, plan } = useUserOrgs();

  // Be explicit about id derivation so we can log it
  const selectedOrgId = useMemo(
    () => selectedOrg?.id ?? selectedOrg?.organizationId ?? null,
    [selectedOrg]
  );

  const avatar = authUser?.avatarUrl || authUser?.avatar_url || '/icons/wootz.png';

  // ====== LOGGING HOOK STATE ======
  useEffect(() => {
    group('Auth state', () => {
      console.log('authUser:', authUser);
      console.log('prefs:', prefs);
      console.log('useOwnKey (from prefs):', useOwnKey, 'prefsReady:', prefsReady);
      console.log('avatar url used:', avatar);
      try { console.log('cookie (domain-scoped):', document.cookie || '(empty)'); } catch {}
    });
  }, [authUser, prefs, useOwnKey, prefsReady, avatar]);

  useEffect(() => {
    group('useUserOrgs state', () => {
      console.log('loading:', loading, 'error:', error);
      console.log('user:', user);
      console.log('selectedOrg (object):', selectedOrg);
      console.log('selectedOrgId (derived):', selectedOrgId);
      console.log('plan:', plan);
      console.log('organizations length:', Array.isArray(organizations) ? organizations.length : '(not array)');
      if (Array.isArray(organizations)) {
        try { console.table(organizations.map(o => ({
          id: o.id ?? o.organizationId,
          name: o.name,
          subscriptionType: o.subscriptionType,
          subscriptionStatus: o.subscriptionStatus,
          isActive: o.isActive,
          priceId: o.priceId,
          productId: o.productId
        }))); } catch { console.log('organizations:', organizations); }
      }
    });
  }, [loading, error, user, organizations, selectedOrg, selectedOrgId, plan]);

  // Make it easy to poke around from DevTools
  useEffect(() => {
    if (!DEBUG) return;
    window.__homeHubDebug = {
      get snapshot() {
        return {
          loading, error, user, organizations, selectedOrg, selectedOrgId,
          avatar, authUser, prefs, useOwnKey, prefsReady, quota, isGated
        };
      }
    };
    log('Debug handle available at window.__homeHubDebug');
  }, [loading, error, user, organizations, selectedOrg, selectedOrgId, avatar, authUser, prefs, useOwnKey, prefsReady, quota, isGated]);

  // Also log what we’re about to render for the quota area
  useEffect(() => {
    if (loading) log('Quota section: loading (showing skeleton)');
    else if (error) log('Quota section: error →', error);
    else log('Quota section: ready, will mount QuotaCard with orgId=', selectedOrgId, 'usingOwnKey=', useOwnKey);
  }, [loading, error, selectedOrgId, useOwnKey]);

  // Utility: 2-line clamp without Tailwind plugin
  const clamp2 = {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  };

  return (
    <div className="profile-container w-full h-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col relative overflow-hidden">
      {/* Background Animation */}
      <div className="background-animation">
        <div className="profile-orb-1 floating-orb"></div>
        <div className="profile-orb-2 floating-orb"></div>
        <div className="profile-orb-3 floating-orb"></div>
      </div>

      {/* Header */}
      <div className="profile-header bg-white/95 backdrop-blur-sm border-b border-gray-200 p-4 relative z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onOpenProfile}
            className="profile-back-button flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <img src={avatar} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
            <span className="font-medium">{authUser?.name || authUser?.login || 'You'}</span>
          </button>
          
          <div className="text-center">
            <h1 className="profile-title text-xl font-bold text-gray-800">Web Summary</h1>
            <p className="profile-subtitle text-sm text-gray-600">AI-powered web analysis</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
              title="Settings"
            >
              <FaCog size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content flex-1 p-6 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Main Chat Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="profile-user-info bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <FaRobot className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Start Chat</h3>
                <p className="text-sm text-gray-600">AI-powered web analysis</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Get comprehensive research, page analysis, and fact checking in one intelligent conversation.
            </p>
            <button
              onClick={() => { log('Start Chat clicked'); onOpenChat?.(); }}
              className="profile-button w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 rounded-xl font-medium hover:from-red-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Start Chat
            </button>
          </motion.div>

          {/* Available Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="profile-stats bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-6">
              <FaSearch className="text-blue-500" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Available Features</h3>
                <p className="text-sm text-gray-600">Choose your AI analysis type</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  title: 'AI Research',
                  subtitle: 'Comprehensive research with citations',
                  icon: FaSearch,
                  color: 'text-blue-500',
                  bgColor: 'bg-blue-50',
                  onClick: onOpenResearch
                },
                {
                  title: 'Page Analysis',
                  subtitle: 'Summarize and analyze web content',
                  icon: FaFileAlt,
                  color: 'text-green-500',
                  bgColor: 'bg-green-50',
                  onClick: onOpenAnalysis
                },
                {
                  title: 'Fact Checker',
                  subtitle: 'Verify claims against trusted sources',
                  icon: FaCheckCircle,
                  color: 'text-purple-500',
                  bgColor: 'bg-purple-50',
                  onClick: onOpenFactChecker
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.button
                    key={feature.title}
                    onClick={feature.onClick}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${feature.bgColor} p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 text-left`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                        <Icon className={`${feature.color}`} size={20} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{feature.title}</h4>
                        <p className="text-sm text-gray-600">{feature.subtitle}</p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>

          {/* Quota Information */}
          {!useOwnKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="profile-subscription bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
            >
              <DebugQuotaCard
                orgId={selectedOrgId}
                plan={plan}
                pricingUrl={PRICING_URL}
                onOpenPlans={onOpenPlans}
                onUseOwnKey={() => onOpenSettings?.()}
                usingOwnKey={useOwnKey}
                alwaysShowActions={false}
                warnAt={0.8}
              />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}