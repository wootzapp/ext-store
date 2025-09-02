// src/hooks/useUserOrgs.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import userService, { pickOrganization, derivePlan } from '@/services/user';
import { getOrganizationsForPrice } from '@/services/products'; // optional

/**
 * useUserOrgs
 * - Loads current user + organizations (with cookies)
 * - Returns a stable selectedOrg/selectedOrgId
 * - Optional priceInfo lookup for a given price
 */
export default function useUserOrgs({ organizationId, testPriceId } = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [priceInfo, setPriceInfo] = useState(null);

  // lets you force a re-fetch without changing deps
  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = useCallback(() => setRefreshTick(t => t + 1), []);

  // protect against state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await userService.getCurrentUser({
          organizationId,
          signal: ac.signal,
          // bust the in-memory cache when refresh() is called
          force: refreshTick > 0,
        });

        if (!mountedRef.current) return;
        setUser(data?.user ?? null);
        setOrganizations(Array.isArray(data?.organizations) ? data.organizations : []);

        if (testPriceId) {
          try {
            const { priceInfo } = await getOrganizationsForPrice(testPriceId, { signal: ac.signal });
            if (mountedRef.current) setPriceInfo(priceInfo || null);
          } catch {
            /* price info is optional */
          }
        }
      } catch (e) {
        if (!mountedRef.current) return;
        setError(e?.message || 'Failed to load organizations');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [organizationId, testPriceId, refreshTick]);

  // Pick the working org (localStorage → user.selectedOrganizationId → active paid → active → first)
  const selectedOrg = useMemo(
    () => pickOrganization({ user, organizations }),
    [user, organizations]
  );

  const selectedOrgId =
    selectedOrg?.id ?? selectedOrg?.organizationId ?? null;

  // Useful gating info (free/pro, status, limits, etc.)
  const plan = useMemo(() => derivePlan(selectedOrg), [selectedOrg]);

  // Allow UI to persist a manual org choice without a refetch
  const setSelectedOrgId = useCallback((id) => {
    userService.setLocalSelectedOrgId(id ?? null); // persists and clears user cache
    // trigger re-pick immediately using current arrays
    setOrganizations(orgs => orgs.slice());
  }, []);

  return {
    loading,
    error,
    user,
    organizations,
    selectedOrg,
    selectedOrgId,
    plan,
    priceInfo,
    refresh,           // call to refetch /api/user
    setSelectedOrgId,  // persist a manual selection
  };
}