// src/pages/popup/views/HomeHub.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import SettingsButton from '@/pages/popup/components/SettingsButton';
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

export default function HomeHub({ onOpenSettings, onOpenResearch, onOpenAnalysis, onOpenFactChecker }) {
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

  const openPlans = () => {
    log('Open Plans clicked');
    try {
      if (chrome?.tabs?.open) chrome.tabs.open(PRICING_URL);
      else if (chrome?.tabs?.create) chrome.tabs.create({ url: PRICING_URL });
      else window.open(PRICING_URL, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(PRICING_URL, '_blank', 'noopener,noreferrer');
    }
  };

  // Also log what we’re about to render for the quota area
  useEffect(() => {
    if (loading) log('Quota section: loading (showing skeleton)');
    else if (error) log('Quota section: error →', error);
    else log('Quota section: ready, will mount QuotaCard with orgId=', selectedOrgId, 'usingOwnKey=', useOwnKey);
  }, [loading, error, selectedOrgId, useOwnKey]);

  return (
    <motion.div
      className="w-full h-full flex flex-col relative min-w-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white" />
      </div>

      {/* Foreground */}
      <div className="flex-1 flex flex-col p-4 relative z-10 min-w-0 pointer-events-auto overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <img src={avatar} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
            <span className="text-gray-800 font-semibold truncate">
              {authUser?.name || authUser?.login || 'You'}
            </span>
          </div>
          <button type="button" onClick={() => { log('Settings clicked'); onOpenSettings?.(); }} className="shrink-0" aria-label="Open settings">
            <SettingsButton />
          </button>
        </div>

        {/* Quota */}
        {error ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Couldn’t load quota right now. You can still use the features below.
          </div>
        ) : loading ? (
          <div className="mb-4 h-24 rounded-xl border border-gray-200 bg-white/70 animate-pulse" />
        ) : (
          <DebugQuotaCard
            key={`quota-${selectedOrgId ?? 'none'}`} // ensures clean remount when org changes
            plan={plan}
            orgId={selectedOrgId}
            pricingUrl={PRICING_URL}
            className="mb-4"
            onViewPlans={openPlans}
            onUseOwnKey={() => {
              log('Use your own key clicked');
              try { localStorage.setItem('intent.scrollToOwnKeyOnce', '1'); } catch {}
              onOpenSettings?.();
            }}
            // show “Using your key” + “Manage key” when the toggle is on
            usingOwnKey={useOwnKey}
          />
        )}

        {/* Features */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { title: 'AI Research', subtitle: 'Deep-dive research with sources & takeaways', onClick: () => { log('Open Research clicked'); onOpenResearch?.(); } },
            { title: 'Page Analysis', subtitle: 'Summarize and extract key insights', onClick: () => { log('Open Analysis clicked'); onOpenAnalysis?.(); } },
            { title: 'Fact Checker', subtitle: 'Verify claims with citations', onClick: () => { log('Open Fact Checker clicked'); onOpenFactChecker?.(); } },
          ].map(({ title, subtitle, onClick }) => (
            <button
              key={title}
              type="button"
              onClick={onClick}
              className="group w-full text-left rounded-xl p-4 bg-white/95 border border-gray-200 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <p className="text-xs text-gray-500 group-hover:text-white/90">Feature</p>
              <p className="text-lg font-semibold text-gray-900 group-hover:text-white">{title}</p>
              <p className="text-xs text-gray-600 mt-1 group-hover:text-white/90">{subtitle}</p>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}