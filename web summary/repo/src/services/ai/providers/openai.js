// Streams OpenAI chat.completions (SSE) with non-stream fallback.
// - Honors modelConfig.baseUrlToSearch or baseUrl
// - Always nudges Markdown formatting
// - Falls back to JSON response and artificial chunking if SSE isn't enabled

import { parseSSE } from '../sse';
import { ensureMarkdown, chunkMarkdown } from '../markdown';

function buildEndpoint(modelConfig) {
  if (modelConfig?.baseUrlToSearch) return modelConfig.baseUrlToSearch; // full endpoint provided
  const base = modelConfig?.baseUrl || 'https://api.openai.com/v1';
  return `${base}/chat/completions`;
}

export async function* stream({ kind, req, ctx }) {
  const { apiKey, modelConfig, signal } = ctx;
  if (!apiKey) throw new Error('OpenAI API key missing');

  const endpoint = buildEndpoint(modelConfig);
  const model =
    modelConfig?.chatModel ||
    modelConfig?.model ||
    'gpt-4o-mini';

  const messages = [
    {
      role: 'system',
      content:
        'You are a concise expert researcher. Always reply in GitHub-flavored Markdown (headings, lists, tables, code blocks when useful).',
    },
    { role: 'user', content: req.prompt },
  ];

  const res = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      temperature: typeof modelConfig?.temperature === 'number' ? modelConfig.temperature : 0.2,
      max_tokens: modelConfig?.maxTokens,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`OpenAI error ${res.status}: ${text || res.statusText}`);
  }

  // If server is not actually streaming, fall back to one-shot JSON.
  const ctype = res.headers.get('content-type') || '';
  if (!ctype.includes('text/event-stream')) {
    const json = await res.json().catch(async () => {
      // Some gateways still mark as app/json but body is text
      const t = await res.text().catch(() => '');
      try { return JSON.parse(t); } catch { return {}; }
    });
    const text =
      json?.choices?.[0]?.message?.content ??
      json?.choices?.[0]?.delta?.content ??
      '';
    const md = ensureMarkdown(text || '_(no content)_');
    for (const piece of chunkMarkdown(md, 2000)) yield piece;
    return;
  }

  // SSE path
  for await (const evt of parseSSE(res)) {
    if (!evt?.data) continue;
    if (evt.data === '[DONE]') break;

    let json;
    try { json = JSON.parse(evt.data); } catch { continue; }
    const delta = json?.choices?.[0]?.delta?.content ?? '';
    if (delta) yield ensureMarkdown(delta);
  }
}