// src/services/user/quota.js
import { BACKEND_BASE_URL, withCreds } from '@/config/backend';

/**
 * Get user quota for all orgs or a specific org.
 * @param {Object} opts
 * @param {number|string} [opts.orgId]
 * @param {AbortSignal}   [opts.signal]
 */
export async function getUserQuota({ orgId, signal } = {}) {
  const qs = orgId != null ? `?orgId=${encodeURIComponent(orgId)}` : '';
  const url = `${BACKEND_BASE_URL}/user/quota${qs}`;

  const res = await fetch(url, {
    method: 'GET',
    ...withCreds,                           // ensures credentials: 'include' and common headers
    headers: { ...(withCreds.headers || {}), Accept: 'application/json' },
    signal,
  });

  if (!res.ok) {
    // keep a friendly 401 for auth issues, otherwise surface status
    const body = await res.text().catch(() => '');
    const msg = res.status === 401 ? 'Not authenticated' : `Failed to fetch quota (HTTP ${res.status})`;
    throw new Error(body ? `${msg}: ${body}` : msg);
  }

  return res.json();
}