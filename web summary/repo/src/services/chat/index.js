// services/chat/index.js
import { BACKEND_BASE_URL, withCreds } from '@/config/backend';

const okOrThrow = async (res) => {
  if (res.ok) return res.json();
  let msg = `HTTP ${res.status}`;
  try {
    const j = await res.json();
    msg = j?.error || msg;
  } catch {}
  throw new Error(msg);
};

export const ChatAPI = {
  // 1) Create streaming session -> { success, clientId }
  async createSession() {
    const res = await fetch(`${BACKEND_BASE_URL}/streamMobile/createSession/`, {
      method: 'POST',
      ...withCreds
    });
    return okOrThrow(res);
  },

  // 2) Exchange clientId for Ably token & crypto -> tokenRequest, sessionId, encryptionKey
  async getToken(clientId) {
    const res = await fetch(`${BACKEND_BASE_URL}/streamMobile/getToken/`, {
      method: 'POST',
      ...withCreds,
      body: JSON.stringify({ clientId })
    });
    return okOrThrow(res);
  },

  // 3) Start chat (backend does model routing; optional model if you add it later)
  async startChat({ prompt, clientId, orgId, model }) {
    const body = { prompt, clientId, orgId };
    if (model) body.model = model; // harmless if backend ignores
    const res = await fetch(`${BACKEND_BASE_URL}/streamMobile/startChat/`, {
      method: 'POST',
      ...withCreds,
      body: JSON.stringify(body)
    });
    return okOrThrow(res);
  },

  // Convenience for current user (per docs)
  async getUser() {
    const res = await fetch(`${BACKEND_BASE_URL}/user/`, {
      method: 'GET',
      ...withCreds
    });
    return okOrThrow(res);
  }
};
