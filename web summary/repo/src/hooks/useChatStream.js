// src/hooks/useChatStream.js
import { useCallback, useEffect, useRef, useState } from 'react';
import { buildPrompt } from '@/services/ai/promptBuilder';
import { startStreamingChat } from '@/services/chat/streamClient';
import { createMarkdownBuffer } from '@/services/markdown/streamBuffer';
import StorageUtils from '@/storage';
import ai from '@/services/ai';

const LOG = (...a) => console.debug('[useChatStream]', ...a);

async function readPrefsSnapshot() {
  const flag = await StorageUtils.getUseOwnKey();
  const selectedModel = await StorageUtils.getSelectedModel();
  const apiKey = selectedModel ? await StorageUtils.getApiKey(selectedModel) : null;

  if (flag === null) {
    const inferred = !!(selectedModel && apiKey && String(apiKey).trim());
    return { useOwnKey: inferred, selectedModel, apiKey };
  }
  return { useOwnKey: flag, selectedModel, apiKey };
}

async function resolveOrgId() {
  try {
    const session = await StorageUtils.getAuthSession();
    const orgId = Number(session?.user?.selectedOrganizationId);
    if (Number.isFinite(orgId)) return orgId;
  } catch (e) {
    console.warn('[resolveOrgId] error reading session:', e);
  }
  throw new Error('Missing orgId. Sign in first.');
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [preview, setPreview] = useState('');
  const [full, setFull] = useState('');
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState(null);

  const handleRef = useRef(null);
  const modeRef = useRef('backend');
  const stoppedRef = useRef(false);
  const abortRef = useRef(null);

  const bufferRef = useRef(
    createMarkdownBuffer({
      throttleMs: 50,
      onUpdate: (safePreview) => setPreview(safePreview),
      onDone: (raw) => setFull(raw),
      onError: (e) => setError(e),
    })
  );

  const reset = useCallback(() => {
    bufferRef.current.reset();
    setPreview('');
    setFull('');
    setError(null);
    setMeta(null);
  }, []);

  const stop = useCallback(async () => {
    try {
      stoppedRef.current = true;
      try { abortRef.current?.abort?.(); } catch {}
      await handleRef.current?.dispose?.();
    } finally {
      bufferRef.current.end();
      setIsStreaming(false);
      LOG('stop() → streaming=false');
    }
  }, []);

  const start = useCallback(
    async ({ kind = 'research', payload } = {}) => {
      if (!payload) throw new Error('start() requires payload for promptBuilder');
      reset();
      stoppedRef.current = false;
      setIsStreaming(true);

      const snapshot = await readPrefsSnapshot();
      const useOwnKeyEffective = !!snapshot.useOwnKey;
      const resolvedModel = snapshot.selectedModel;

      modeRef.current = useOwnKeyEffective ? 'direct' : 'backend';
      LOG('start()', { kind, useOwnKey: useOwnKeyEffective, selectedModel: resolvedModel, mode: modeRef.current });

      const ac = new AbortController();
      abortRef.current = ac;
      handleRef.current = { dispose: () => { try { ac.abort(); } catch {} } };

      try {
        if (modeRef.current === 'backend') {
          const prompt = buildPrompt(kind, payload);
          const orgId = await resolveOrgId();
          setMeta({ mode: 'backend', orgId, model: null });

          const handle = await startStreamingChat({
            prompt,
            orgId,
            signal: ac.signal,
            onMeta: (m) => setMeta((prev) => ({ ...prev, ...m })),
            onText: (chunk) => { if (!stoppedRef.current) bufferRef.current.push(chunk); },
            onDone: () => {
              bufferRef.current.end();
              setIsStreaming(false);
              LOG('backend.onDone');
            },
            onError: (e) => {
              setError(e instanceof Error ? e : new Error(String(e)));
              bufferRef.current.end();
              setIsStreaming(false);
              console.error('[useChatStream] backend.onError', e);
            },
          });

          if (handle) {
            handleRef.current = {
              dispose: () => {
                try { handle.dispose?.(); } catch {}
                try { ac.abort(); } catch {}
              }
            };
          }
          return;
        }

        setMeta({ mode: 'direct', provider: resolvedModel || 'auto' });

        ai.stream({
          kind,
          payload,
          signal: ac.signal,
          route: {
            useOwnKey: useOwnKeyEffective,
            selectedModel: resolvedModel,
            apiKey: snapshot.apiKey,
          },
          onDelta: (delta) => { if (!stoppedRef.current) bufferRef.current.push(delta); },
          onProvider: (providerType, info) => {
            setMeta((m) => ({ ...m, provider: providerType, providerInfo: info }));
          },
        })
        .then(({ fullText }) => {
          bufferRef.current.end();
          setIsStreaming(false);
          setMeta((m) => ({ ...m, bytes: fullText?.length || 0 }));
        })
        .catch((e) => {
          if (e?.name !== 'AbortError') setError(e instanceof Error ? e : new Error(String(e)));
          bufferRef.current.end();
          setIsStreaming(false);
        });

      } catch (e) {
        setError(e instanceof Error ? e : new Error(String(e)));
        bufferRef.current.end();
        setIsStreaming(false);
      }
    },
    [reset]
  );

  useEffect(() => {
    return () => {
      try { handleRef.current?.dispose?.(); } catch {}
      try { bufferRef.current?.dispose?.(); } catch {}
      try { abortRef.current?.abort?.(); } catch {}
    };
  }, []);

  return { isStreaming, preview, full, error, meta, start, stop, reset };
}

export default useChatStream;