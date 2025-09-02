// services/user/index.js
import { BACKEND_BASE_URL, withCreds } from '@/config/backend';
export * from './quota';

const USER_API = `${BACKEND_BASE_URL}/user`;
const LS_KEY = 'selectedOrganizationId';
const TTL_MS = 30_000;

let _cache = { key: null, data: null, fetchedAt: 0 };

const now = () => Date.now();

/**
 * Fetch current user + organizations.
 * - Default: GET /api/user
 * - Filtered: GET /api/user?organizationId=XX
 */
export async function getCurrentUser({ organizationId, signal, force = false } = {}) {
  const key = organizationId ? `org:${organizationId}` : 'all';
  const fresh = _cache.data && _cache.key === key && (now() - _cache.fetchedAt) < TTL_MS;

  if (!force && fresh) return _cache.data;

  const url = organizationId ? `${USER_API}?organizationId=${encodeURIComponent(organizationId)}` : USER_API;

  const res = await fetch(url, {
    method: 'GET',
    ...withCreds,
    headers: { ...(withCreds.headers || {}), Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    const msg = res.status === 401 ? 'Not authenticated' : `User fetch failed (${res.status})`;
    throw new Error(msg);
  }

  const json = await res.json();
  const data = {
    user: json?.user ?? null,
    organizations: Array.isArray(json?.organizations) ? json.organizations : [],
  };

  _cache = { key, data, fetchedAt: now() };
  return data;
}

/** Clear the in-memory cache. */
export function clearUserCache() {
  _cache = { key: null, data: null, fetchedAt: 0 };
}

/** Local selection (persisted in browser only). */
export function getLocalSelectedOrgId() {
  if (typeof localStorage === 'undefined') return null;
  const v = localStorage.getItem(LS_KEY);
  return v ? Number(v) : null;
}

export function setLocalSelectedOrgId(id) {
  if (typeof localStorage !== 'undefined') {
    if (id == null) localStorage.removeItem(LS_KEY);
    else localStorage.setItem(LS_KEY, String(id));
  }
  clearUserCache();
}

/**
 * Choose the working organization for the session.
 * Priority: localStorage → user.selectedOrganizationId → active paid → active → first
 */
export function pickOrganization({ user, organizations }) {
  if (!Array.isArray(organizations) || organizations.length === 0) return null;

  const wantedId = getLocalSelectedOrgId() ?? user?.selectedOrganizationId ?? null;
  const byId = wantedId ? organizations.find(o => Number(o.id) === Number(wantedId)) : null;
  if (byId) return byId;

  const active = organizations.filter(o => !!o.isActive);
  const paidActive = active.find(o => (o.subscriptionType || '').toLowerCase() === 'paid');
  if (paidActive) return paidActive;
  if (active[0]) return active[0];
  return organizations[0] ?? null;
}

/**
 * Normalize plan info for gating.
 * Returns { tier, status, isActive, priceId, productId, subExpiry, limits }
 */
export function derivePlan(org) {
  if (!org) {
    return { tier: 'guest', status: 'inactive', isActive: false, limits: { dailyMsgs: 0, maxContexts: 0 } };
  }

  const status = String(org.subscriptionStatus || 'inactive').toLowerCase();
  const type = String(org.subscriptionType || 'free').toLowerCase();

  const tier = type === 'paid' ? 'pro' : 'free';
  const isActive = status === 'active' || status === 'trialing';

  const limits = tier === 'pro'
    ? { dailyMsgs: Infinity, maxContexts: 64_000 }
    : { dailyMsgs: 50,       maxContexts: 16_000 };

  return {
    tier,
    status,
    isActive,
    priceId: org.priceId ?? null,
    productId: org.productId ?? null,
    subExpiry: org.subExpiry ?? null,
    limits,
  };
}

/**
 * Attach an Organization header when calling other APIs (if backend honors it).
 * Example: fetch('/api/chat/stream', withOrg({ method:'POST', body: ... }, org.id))
 */
export function withOrg(init = {}, orgId) {
  const id = orgId ?? getLocalSelectedOrgId();
  return {
    ...init,
    headers: { ...(init.headers || {}), ...(id ? { 'X-Organization-ID': String(id) } : {}) },
  };
}

export default {
  getCurrentUser,
  clearUserCache,
  pickOrganization,
  derivePlan,
  getLocalSelectedOrgId,
  setLocalSelectedOrgId,
  withOrg,
};
