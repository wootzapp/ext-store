// hooks/useAuthAndPrefs.js
import { useEffect, useState, useCallback } from 'react';
import StorageUtils from '@/storage';
import auth from '@/services/auth';

export default function useAuthAndPrefs() {
  const [authUser, setAuthUser] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const [prefs, setPrefs] = useState({ selectedModel: '', apiKey: '', useOwnKey: false });
  const [selectedSearchEngine, setSelectedSearchEngine] = useState('google');

  // Auth check once
  useEffect(() => {
    (async () => {
      try {
        const s = await StorageUtils.getAuthSession();
        if (s?.isAuthenticated) {
          setIsAuthed(true);
          setAuthUser(s.user || null);
        } else {
          const { isAuthenticated, user } = await auth.checkAuthentication();
          setIsAuthed(!!isAuthenticated);
          setAuthUser(user || null);
          if (isAuthenticated && user) await StorageUtils.saveAuthUser(user);
        }
      } catch {
        setIsAuthed(false);
      } finally {
        setAuthLoading(false);
      }
    })();
  }, []);

  const loadPrefs = useCallback(async () => {
    const p = await StorageUtils.getUserPreferences();
    const se = (await StorageUtils.getSelectedSearchEngine()) || 'google';
    const next = {
      selectedModel: p?.preferences?.selectedModel || '',
      apiKey: p?.preferences?.apiKey || '',
      useOwnKey: !!p?.preferences?.useOwnKey,
    };
    setPrefs(next);
    setSelectedSearchEngine(se);
    return { prefs: next, selectedSearchEngine: se, hasPrefs: !!p?.preferences };
  }, []);

  const savePrefs = useCallback(async (next, engineId) => {
    await StorageUtils.saveUserPreferences(next);
    if (engineId) await StorageUtils.saveSelectedSearchEngine(engineId);
    setPrefs(next);
    if (engineId) setSelectedSearchEngine(engineId);
    return true;
  }, []);

  return {
    // auth
    authUser, isAuthed, authLoading, authError, setAuthError,
    // prefs
    prefs, setPrefs, selectedSearchEngine, setSelectedSearchEngine,
    loadPrefs, savePrefs,
  };
}