// src/pages/popup/components/QuotaCard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { getUserQuota } from '@/services/user/quota';

export default function QuotaCard({
  orgId,
  plan,
  pricingUrl,
  onViewPlans,
  onUseOwnKey,
  className = '',
  alwaysShowActions = false,
  warnAt = 0.8,
  usingOwnKey = false,
}) {
  const [state, setState] = useState({ loading: true, error: null, data: null });

  const resolvedOrgId = useMemo(() => {
    if (orgId === null || orgId === undefined) return null;
    const n = Number(orgId);
    return Number.isFinite(n) ? n : String(orgId);
  }, [orgId]);

  useEffect(() => {
    let aborted = false;
    async function run() {
      if (resolvedOrgId == null) {
        setState({ loading: true, error: null, data: null });
        return;
      }
      setState({ loading: true, error: null, data: null });
      try {
        const res = await getUserQuota({ orgId: resolvedOrgId });
        if (aborted) return;

        const orgName = res?.organizationName ?? res?.organizations?.[0]?.organizationName ?? '';
        const qArr = res?.quotas ?? res?.organizations?.[0]?.quotas ?? [];
        const q = qArr.find(q => (q.featureKey || '').toLowerCase() === 'chat') || qArr[0] || null;

        const rawLimit = q?.limit;
        const isUnlimited = rawLimit == null || Number(rawLimit) === -1;
        const limit = isUnlimited ? null : Number(rawLimit) || 0;
        const used = Number(q?.currentUsage ?? 0);

        setState({ loading: false, error: null, data: { orgName, used, limit, isUnlimited } });
      } catch (e) {
        if (aborted) return;
        setState({ loading: false, error: new Error(e?.message || 'Failed to load quota. Please try again.'), data: null });
      }
    }
    run();
    return () => { aborted = true; };
  }, [resolvedOrgId]);

  const pct = useMemo(() => {
    const d = state.data;
    if (!d || d.isUnlimited || !Number.isFinite(d.limit) || d.limit <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((d.used / d.limit) * 100)));
  }, [state.data]);

  const shouldShowActions = useMemo(() => {
    if (alwaysShowActions) return true;
    const d = state.data;

    const planSuggests = !!plan && (!plan.isActive || (plan.tier || 'free').toLowerCase() !== 'pro');
    const usageHigh = d && !d.isUnlimited && Number.isFinite(d.limit) && d.limit > 0 && (d.used / d.limit) >= warnAt;

    return planSuggests || usageHigh || usingOwnKey; // show actions if using own key (to “Manage key”)
  }, [alwaysShowActions, plan, state.data, warnAt, usingOwnKey]);

  const handleOpenPlans = () => {
    if (typeof onViewPlans === 'function') return onViewPlans();
    if (pricingUrl) {
      try {
        if (chrome?.tabs?.open) chrome.tabs.open(pricingUrl);
        else if (chrome?.tabs?.create) chrome.tabs.create({ url: pricingUrl });
        else window.open(pricingUrl, '_blank', 'noopener,noreferrer');
      } catch {
        window.open(pricingUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const handleUseOwnKey = () => {
    try { localStorage.setItem('intent.scrollToOwnKeyOnce', '1'); } catch {}
    try { window.dispatchEvent(new CustomEvent('settings:focusOwnKey')); } catch {}
    onUseOwnKey?.();
  };

  if (state.loading || resolvedOrgId == null) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white/95 shadow-sm p-4 ${className}`}>
        <div className="animate-pulse h-5 w-28 bg-gray-200 rounded mb-3" />
        <div className="h-2 w-full bg-gray-100 rounded overflow-hidden">
          <div className="h-full w-1/3 bg-gray-200" />
        </div>
        <div className="text-xs text-gray-500 mt-2">Loading quota…</div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`rounded-xl border border-amber-200 bg-amber-50 p-4 ${className}`}>
        <div className="text-sm text-amber-900 font-semibold">Couldn’t load usage.</div>
        <div className="text-xs text-amber-700 mt-1 break-words">
          {String(state.error?.message || state.error)}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1.5 rounded-md text-sm bg-white border border-amber-300 text-amber-900 hover:bg-amber-100" onClick={handleOpenPlans}>
            View plans
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm bg-amber-600 text-white hover:bg-amber-700" onClick={handleUseOwnKey}>
            {usingOwnKey ? 'Manage key' : 'Use your own key'}
          </button>
        </div>
      </div>
    );
  }

  const d = state.data || { used: 0, limit: 0, isUnlimited: false, orgName: '' };

  return (
    <div className={`rounded-xl border border-gray-200 bg-white/95 shadow-sm p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 font-semibold flex items-center gap-2">
          <span>Usage{d.orgName ? ` · ${d.orgName}` : ''}</span>
          {usingOwnKey && (
            <span className="inline-flex items-center gap-1 px-2 py-[2px] rounded-md text-[11px] font-medium bg-green-50 text-green-700 border border-green-200">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              Using your key
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {d.isUnlimited ? `${d.used} / Unlimited` : `${d.used}/${d.limit} requests`}
        </div>
      </div>

      {!d.isUnlimited && (
        <>
          <div className="mt-2 h-2 w-full bg-gray-100 rounded overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-500 to-orange-500" style={{ width: `${pct}%` }} />
          </div>
        </>
      )}
      {!d.isUnlimited && <div className="mt-2 text-xs text-gray-500">{pct}% used</div>}

      {shouldShowActions && (
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1.5 rounded-md text-sm bg-white border border-gray-200 hover:bg-gray-50" onClick={handleOpenPlans}>
            View plans
          </button>
          <button className="px-3 py-1.5 rounded-md text-sm bg-red-600 text-white hover:bg-red-700" onClick={handleUseOwnKey}>
            {usingOwnKey ? 'Manage key' : 'Use your own key'}
          </button>
        </div>
      )}
    </div>
  );
}