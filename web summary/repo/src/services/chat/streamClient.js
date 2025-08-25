// src/services/chat/streamClient.js
// Ably-powered Markdown streaming for DeepHUD mobile stream endpoints

import Ably from 'ably'; // <-- default import works in webpack/browsers
import { ChatAPI } from './index';

const END_EVENT_NAMES = new Set([
  'done', 'end', 'complete', 'completed', 'finish', 'final'
]);

/**
 * Start a streaming chat and subscribe to markdown chunks.
 *
 * @param {Object} args
 * @param {string} args.prompt              - Final prompt string (Markdown builder output)
 * @param {number} args.orgId               - Organization ID (required)
 * @param {string} [args.model]             - Optional, backend may ignore
 * @param {function(string, string)} [args.onText]  - (chunk, fullSoFar)
 * @param {function(any)} [args.onMeta]     - metadata events
 * @param {function(string)} [args.onDone]  - final buffer
 * @param {function(Error)} [args.onError]  - errors
 *
 * @returns {Promise<{
 *   clientId: string,
 *   sessionId: string,
 *   channelName: string,
 *   getBuffer: () => string,
 *   dispose: () => Promise<void>,
 *   client: any,
 *   channel: any
 * }>}
 */
export async function startStreamingChat({
  prompt,
  orgId,
  model,
  onText,
  onMeta,
  onDone,
  onError,
}) {
  // 1) Create session
  const { success, clientId } = await ChatAPI.createSession();
  if (!success || !clientId) {
    throw new Error('Failed to create streaming session');
  }

  // 2) Get Ably token + E2E encryption key
  const { tokenRequest, sessionId, encryptionKey } = await ChatAPI.getToken(clientId);

  // 3) Connect Ably with provided TokenRequest
  const client = new Ably.Realtime({
    clientId,
    authCallback: (tokenParams, callback) => {
      callback(null, tokenRequest);
    },
  });

  // Wait until connected (guards against racing the subscribe)
  await new Promise((resolve, reject) => {
    const onChange = (stateChange) => {
      if (stateChange.current === 'connected') {
        client.connection.off(onChange);
        resolve();
      } else if (stateChange.current === 'failed' || stateChange.current === 'suspended') {
        client.connection.off(onChange);
        reject(new Error(`Ably connection ${stateChange.current}`));
      }
    };
    client.connection.on(onChange);
  });

  // 4) Prepare encrypted response channel
  const channelName = `llm-response-${clientId}`;
  const channel = client.channels.get(channelName);

  // E2E encryption (backend gives base64 key)
  await channel.setOptions({
    cipher: { key: base64ToArrayBuffer(encryptionKey) },
  });

  // 5) Subscribe to streamed messages
  let buffer = '';
  let disposed = false;

  // ---- watchdog: auto-finish after idle ----
  // If the backend doesn't emit an explicit "done", we'll finalize when idle.
  let idleTimer = null;
  const IDLE_MS = 2500; // adjust if needed

  const bumpIdle = () => {
    if (disposed) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => finalize('idle'), IDLE_MS);
  };

  const finalize = (reason = 'done') => {
    if (disposed) return;
    disposed = true;
    try { if (idleTimer) clearTimeout(idleTimer); } catch {}
    try { onDone?.(buffer); } catch {}
    // clean up ably bits, but do not await (no need to block UI)
    try { channel.unsubscribe(handleMessage); } catch {}
    try { client.close(); } catch {}
  };

  const handleMessage = (msg) => {
    try {
      const { name, data } = msg;

      // Any message keeps the stream alive
      bumpIdle();

      // metadata / errors
      if (name === 'meta') {
        onMeta?.(data);
        return;
      }
      if (name === 'error') {
        onError?.(normalizeError(data));
        return finalize('error');
      }

      // explicit end names
      if (END_EVENT_NAMES.has(String(name || '').toLowerCase())) {
        return finalize(name);
      }

      // data-based end markers
      if (data && typeof data === 'object') {
        const lower = JSON.stringify(data).toLowerCase();
        if (
          data.done === true ||
          data.end === true ||
          data.finished === true ||
          data.complete === true ||
          data.status === 'done' ||
          data.type === 'complete' ||
          lower.includes('"event":"done"') ||
          lower.includes('"name":"done"')
        ) {
          return finalize('data-done');
        }
      }

      // chunk / delta / default
      const chunk =
        typeof data === 'string'
          ? data
          : (data && (data.chunk || data.delta || data.text)) || '';

      if (chunk) {
        buffer += chunk;
        onText?.(chunk, buffer);
      }
    } catch (e) {
      onError?.(e instanceof Error ? e : new Error(String(e)));
      finalize('exception');
    }
  };

  await channel.subscribe(handleMessage);

  // If the channel detaches or connection closes, finalize gracefully
  channel.on((stateChange) => {
    if (stateChange?.current === 'detached' || stateChange?.current === 'failed') {
      finalize('channel-detached');
    }
  });
  client.connection.on((stateChange) => {
    if (stateChange?.current === 'closed' || stateChange?.current === 'failed') {
      finalize('connection-closed');
    }
  });

  // Start idle timer now in case nothing ever comes
  bumpIdle();

  // 6) Kick off generation on the backend
  await ChatAPI.startChat({ prompt, clientId, orgId, model });

  // 7) Return a handle for cleanup
  const dispose = async () => {
    try { disposed = true; } catch {}
    try { if (idleTimer) clearTimeout(idleTimer); } catch {}
    try { await channel.unsubscribe(handleMessage); } catch {}
    try { await client.close(); } catch {}
  };

  return {
    clientId,
    sessionId,
    channelName,
    getBuffer: () => buffer,
    dispose,
    client,
    channel,
  };
}

// ---------- helpers ----------

function base64ToArrayBuffer(b64) {
  const binaryString = atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes.buffer;
}

function normalizeError(err) {
  if (!err) return new Error('Unknown stream error');
  if (err instanceof Error) return err;
  if (typeof err === 'string') return new Error(err);
  if (err.error) return new Error(err.error);
  if (err.message) return new Error(err.message);
  try { return new Error(JSON.stringify(err)); } catch { return new Error('Stream error'); }
}