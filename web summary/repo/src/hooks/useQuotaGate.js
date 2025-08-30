// src/hooks/useQuotaGate.js
import { useEffect, useMemo, useState } from 'react';
import useUserOrgs from '@/hooks/useUserOrgs';
import { getUserQuota } from '@/services/user/quota';

const TTL_MS = 30_000;

export default function useQuotaGate({ useOwnKey }) {
  const { selectedOrgId } = useUserOrgs();
  const [state, setState] = useState({ loading: true, used: 0, limit: null, isUnlimited: false, fetchedAt: 0 });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!selectedOrgId) { setState(s => ({ ...s, loading: false })); return; }

      const fresh = state.fetchedAt && (Date.now() - state.fetchedAt) < TTL_MS && state.orgId === selectedOrgId;
      if (fresh) { setState(s => ({ ...s, loading: false })); return; }

      setState(s => ({ ...s, loading: true, orgId: selectedOrgId }));
      try {
        const res = await getUserQuota({ orgId: selectedOrgId });
        if (cancelled) return;
        const qArr = res?.quotas ?? res?.organizations?.[0]?.quotas ?? [];
        const q = qArr.find(x => (x.featureKey || '').toLowerCase() === 'chat') || qArr[0] || null;

        const rawLimit = q?.limit;
        const isUnlimited = rawLimit == null || Number(rawLimit) === -1;
        const limit = isUnlimited ? null : Number(rawLimit) || 0;
        const used = Number(q?.currentUsage ?? 0);

        setState({ loading: false, used, limit, isUnlimited, fetchedAt: Date.now(), orgId: selectedOrgId });
      } catch {
        setState({ loading: false, used: 0, limit: null, isUnlimited: true, fetchedAt: Date.now(), orgId: selectedOrgId });
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrgId]);

  const shouldGate = useMemo(() => {
    if (useOwnKey) return false;                 // ← allow if user uses own key
    if (state.isUnlimited) return false;
    if (!state.limit || state.limit <= 0) return false;
    return state.used >= state.limit;
  }, [state.isUnlimited, state.limit, state.used, useOwnKey]);

  return { ...state, shouldGate, orgId: selectedOrgId, usingOwnKey: !!useOwnKey };
}