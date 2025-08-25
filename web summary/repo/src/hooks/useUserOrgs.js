// hooks/useUserOrgs.js
import { useEffect, useState } from 'react';
import userService from '@/services/user';
import { getOrganizationsForPrice } from '@/services/products'; // optional for price meta

export default function useUserOrgs({ testPriceId } = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [priceInfo, setPriceInfo] = useState(null);

  useEffect(() => {
    const ab = new AbortController();
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { user, organizations: orgs } = await userService.getCurrentUser({ signal: ab.signal });
        setUser(user || null);
        setOrganizations(orgs || []);

        if (testPriceId) {
          try {
            const { priceInfo } = await getOrganizationsForPrice(testPriceId, { signal: ab.signal });
            setPriceInfo(priceInfo || null);
          } catch {
            /* price info is optional */
          }
        }
      } catch (e) {
        setError(e?.message || 'Failed to load organizations');
      } finally {
        setLoading(false);
      }
    })();
    return () => ab.abort();
  }, [testPriceId]);

  return { loading, error, user, organizations, priceInfo };
}