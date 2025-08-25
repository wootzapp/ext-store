// src/services/ai/index.js
import { BACKEND_BASE_URL } from '@/config/backend';
import * as backend from './providers/backend';
import * as openai from './providers/openai';
import * as anthropic from './providers/anthropic';
import * as gemini from './providers/gemini';
import { ensureMarkdown } from './markdown';
import StorageUtils, { SUPPORTED_MODELS } from '@/storage';
export { buildPrompt } from '@/services/ai/promptBuilder';

function buildRequest(kind, payload) {
  try {
    const prompt = (typeof window !== 'undefined' ? require('@/services/ai/promptBuilder') : null)?.buildPrompt?.(kind, payload);
    if (prompt) return { kind, prompt, payload };
  } catch {}
  const { topic, depth = 'comprehensive' } = payload || {};
  const prompt = `# Research Task\nTopic: ${topic}\nDepth: ${depth}\n\nReturn a well-structured Markdown report with sections, bullet points, and links.`;
  return { kind, prompt, payload };
}

function pickProvider({ useOwnKey, selectedModel }) {
  if (!useOwnKey) return { type: 'backend', impl: backend };
  switch (selectedModel) {
    case 'openai':    return { type: 'openai', impl: openai };
    case 'anthropic': return { type: 'anthropic', impl: anthropic };
    case 'gemini':    return { type: 'gemini', impl: gemini };
    default:          return { type: 'backend', impl: backend };
  }
}

/**
 * stream({ kind, payload, signal, onDelta, route?, onProvider? })
 * route: { useOwnKey: boolean, selectedModel?: string, apiKey?: string }
 */
export async function stream({ kind, payload, signal, onDelta, route, onProvider }) {
  // Prefer explicit route from caller (the hook). If absent, make a minimal read from *local*.
  let useOwnKey = route?.useOwnKey;
  let selectedModel = route?.selectedModel;
  let apiKey = route?.apiKey;

  if (useOwnKey == null) {
    // single-source-of-truth in your project is chrome.storage.local
    useOwnKey = !!(await StorageUtils.getUseOwnKey());
  }
  if (!selectedModel) selectedModel = await StorageUtils.getSelectedModel();
  if (!apiKey && selectedModel) apiKey = await StorageUtils.getApiKey(selectedModel);

  const provider = pickProvider({ useOwnKey, selectedModel });
  onProvider?.(provider.type, { useOwnKey, selectedModel });

  const req = buildRequest(kind, payload);
  const ctx = {
    apiKey,
    modelConfig: SUPPORTED_MODELS?.[selectedModel] || {},
    backendBaseUrl: BACKEND_BASE_URL,
    signal,
  };

  const gen = provider.impl.stream({ kind, req, ctx });

  let full = '';
  for await (const chunk of gen) {
    const md = ensureMarkdown(chunk);
    full += md;
    onDelta?.(md);
  }
  return { fullText: full };
}

export default { stream };
