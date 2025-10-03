// Streams Anthropic Messages API (SSE) with non-stream fallback.
// - Honors modelConfig.baseUrlToSearch or baseUrl
// - Forces Markdown style
// - Falls back to single JSON response and chunks it

import { parseSSE } from '../sse';
import { ensureMarkdown, chunkMarkdown } from '../markdown';

function buildEndpoint(modelConfig) {
  if (modelConfig?.baseUrlToSearch) return modelConfig.baseUrlToSearch; // full endpoint provided
  const base = modelConfig?.baseUrl || 'https://api.anthropic.com/v1';
  return `${base}/messages`;
}

export async function* stream({ kind, req, ctx }) {
  const { apiKey, modelConfig, signal } = ctx;
  if (!apiKey) throw new Error('Anthropic API key missing');

  const endpoint = buildEndpoint(modelConfig);
  const model =
    modelConfig?.chatModel ||
    modelConfig?.model ||
    'claude-3-5-sonnet-latest';

  const body = {
    model,
    max_tokens: modelConfig?.maxTokens ?? 2048,
    stream: true,
    temperature: typeof modelConfig?.temperature === 'number' ? modelConfig.temperature : 0.2,
    messages: [{ role: 'user', content: req.prompt }],
    system:
      'You are a concise expert researcher. Reply in GitHub-flavored Markdown with clear headings, bullet lists, and code blocks when helpful.',
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Anthropic error ${res.status}: ${text || res.statusText}`);
  }

  const ctype = res.headers.get('content-type') || '';

  // Non-stream fallback
  if (!ctype.includes('text/event-stream')) {
    const json = await res.json().catch(async () => {
      const t = await res.text().catch(() => '');
      try { return JSON.parse(t); } catch { return {}; }
    });

    // Messages API returns { content: [{ type: 'text', text: '...' }, ...] }
    const text =
      (Array.isArray(json?.content) && json.content
        .map((c) => (typeof c?.text === 'string' ? c.text : ''))
        .join('')) || '';

    const md = ensureMarkdown(text || '_(no content)_');
    for (const piece of chunkMarkdown(md, 2000)) yield piece;
    return;
  }

  // SSE streaming path
  for await (const evt of parseSSE(res)) {
    const d = evt?.data;
    if (!d) continue;
    if (d === '[DONE]') break;

    let json;
    try { json = JSON.parse(d); } catch { continue; }

    // We care about deltas like:
    // { "type":"content_block_delta", "delta":{ "type":"text_delta","text":"..." } }
    if (json?.type === 'content_block_delta' && json?.delta?.text) {
      yield ensureMarkdown(json.delta.text);
    }
  }
}