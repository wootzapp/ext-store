// services/products/index.js
import { BACKEND_BASE_URL } from '@/config/backend';

/**
 * GET /api/products/{priceId}/organizations[/]
 */
export async function getOrganizationsForPrice(priceId, { signal } = {}) {
  if (!priceId) throw new Error('priceId is required');

  const base = (BACKEND_BASE_URL || '').replace(/\/+$/, '');
  const paths = [
    `/api/products/${encodeURIComponent(priceId)}/organizations/`,
    `/api/products/${encodeURIComponent(priceId)}/organizations`,
  ];

  let lastErr;
  for (const path of paths) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { Accept: 'application/json' },
        signal,
      });

      if (res.ok) {
        const data = await res.json();
        return {
          organizations: Array.isArray(data?.organizations) ? data.organizations : [],
          priceInfo: data?.priceInfo ?? null,
        };
      }

      if (res.status === 400) throw new Error('400: Invalid price ID');
      if (res.status === 404) {
        // try the next path variant; if none left, throw a helpful message
        lastErr = new Error('404: Price not found or route missing (check priceId and API path)');
        continue;
      }

      // other status codes
      const text = await res.text().catch(() => '');
      throw new Error(`${res.status} ${res.statusText}${text ? ` - ${text}` : ''}`);
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error('Request failed');
}

export default { getOrganizationsForPrice };
