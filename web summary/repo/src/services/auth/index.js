import StorageUtils from '@/storage';
import { BACKEND_BASE_URL, AUTH_URL, withCreds } from '@/config/backend';

class AuthService {
  constructor() {
    this._pollTimer = null;
    this._safetyTimeout = null;
  }

  // ---- API helpers ----
  async _fetchMe() {
    const res = await fetch(`${BACKEND_BASE_URL}/user/`, { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user || null;
  }

  async checkAuthentication() {
    try {
      const user = await this._fetchMe();
      if (user) {
        await StorageUtils.saveAuthUser(user);
        return { isAuthenticated: true, user };
      }
    } catch {}
    try { await StorageUtils.clearAuthSession?.(); } catch {}
    return { isAuthenticated: false, user: null };
  }

  _beginPolling() {
    this._stopPolling();
    this._pollTimer = setInterval(async () => {
      try {
        const user = await this._fetchMe();
        if (user) {
          await StorageUtils.saveAuthUser(user);
          this._stopPolling();
        }
      } catch {}
    }, 2000);
    this._safetyTimeout = setTimeout(() => this._stopPolling(), 300000); // 5 min
  }

  _stopPolling() {
    if (this._pollTimer) clearInterval(this._pollTimer);
    if (this._safetyTimeout) clearTimeout(this._safetyTimeout);
    this._pollTimer = null;
    this._safetyTimeout = null;
  }

  async startGitHubLogin() {
    const authUrl = `${AUTH_URL}/ext/sign-in`;
    this._beginPolling();

    // 1) Try popup window
    try {
      if (chrome?.windows?.create) {
        const popup = await chrome.windows.create({ url: authUrl, type: 'popup', width: 500, height: 600 });

        const closer = setInterval(async () => {
          if (await StorageUtils.isUserAuthenticated()) {
            try { popup?.id && (await chrome.windows.remove(popup.id)); } catch {}
            clearInterval(closer);
          }
        }, 2000);

        return new Promise((resolve) => {
          const check = setInterval(async () => {
            const s = await StorageUtils.getAuthSession();
            if (s.isAuthenticated) { clearInterval(check); resolve(s.user); }
          }, 1000);
          setTimeout(() => { clearInterval(check); resolve(null); }, 300000);
        });
      }
    } catch (e) {
      console.warn('[Auth] windows.create failed:', e?.message || e);
    }

    // 2) Fallback: new tab
    try {
      if (chrome?.tabs?.create) {
        const tab = await chrome.tabs.create({ url: authUrl, active: true });

        const closer = setInterval(async () => {
          if (await StorageUtils.isUserAuthenticated()) {
            try { tab?.id && (await chrome.tabs.remove(tab.id)); } catch {}
            clearInterval(closer);
          }
        }, 2000);

        return new Promise((resolve) => {
          const check = setInterval(async () => {
            const s = await StorageUtils.getAuthSession();
            if (s.isAuthenticated) { clearInterval(check); resolve(s.user); }
          }, 1000);
          setTimeout(() => { clearInterval(check); resolve(null); }, 300000);
        });
      }
    } catch (e) {
      console.warn('[Auth] tabs.create failed:', e?.message || e);
    }

    // 3) Manual link case — caller should show `${AUTH_URL}/ext/sign-in`
    console.warn('[Auth] No extension window/tab APIs available. Show manual link.');
    return null;
  }

  async logout() {
    // optionally: await fetch(`${BACKEND_BASE_URL}/auth/logout`, { method:'POST', credentials:'include' });
    await StorageUtils.clearAuthSession();
    return { success: true };
  }

  async isAuthenticated() {
    return StorageUtils.isUserAuthenticated();
  }

  async getUser() {
    const s = await StorageUtils.getAuthSession();
    return s.user;
  }
}

const auth = new AuthService();
export default auth;
export { BACKEND_BASE_URL, AUTH_URL };