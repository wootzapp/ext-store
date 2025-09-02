// src/services/ai/providers/backend.js
// Streams from your backend. Expects SSE or fetch streaming of plain text/markdown.

import { parseSSE } from '../sse';
import { ensureMarkdown } from '../markdown';

export async function* stream({ kind, req, ctx }) {
  const { backendBaseUrl, signal } = ctx;

  // You can adjust endpoint per kind if needed
  const url = `${backendBaseUrl}/ai/${encodeURIComponent(kind)}/stream`;

  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream, text/plain, application/json',
      credentials: 'include',
    },
    body: JSON.stringify({
      prompt: req.prompt,
      payload: req.payload, // keep raw payload for server if it needs depth/topic
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend error ${res.status}: ${text || res.statusText}`);
  }

  // Prefer SSE; fallback to raw reader if server returns text/plain stream
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('text/event-stream')) {
    for await (const evt of parseSSE(res)) {
      // Support either {delta:"..."} or raw text lines
      const piece = typeof evt?.data === 'string'
        ? evt.data
        : evt?.delta || evt?.content || '';
      if (piece) yield ensureMarkdown(piece);
    }
    return;
  }

  // Fallback: raw text streaming
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    yield ensureMarkdown(decoder.decode(value, { stream: true }));
  }
}