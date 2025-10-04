// src/services/ai/providers/gemini.js
import { ensureMarkdown, chunkMarkdown } from '../markdown';

function buildEndpoint({ apiKey, modelConfig }) {
  // Prefer explicit endpoint if you stored it (avoids 404s)
  if (modelConfig?.baseUrlToSearch) {
    const sep = modelConfig.baseUrlToSearch.includes('?') ? '&' : '?';
    return `${modelConfig.baseUrlToSearch}${sep}key=${encodeURIComponent(apiKey)}`;
  }
  const base = modelConfig?.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  const rawModel = modelConfig?.model || 'gemini-1.5-pro';
  const modelPath = rawModel.startsWith('models/') ? rawModel : `models/${rawModel}`;
  return `${base}/${modelPath}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

export async function* stream({ kind, req, ctx }) {
  const { apiKey, modelConfig, signal } = ctx;
  if (!apiKey) throw new Error('Gemini API key missing');

  const endpoint = buildEndpoint({ apiKey, modelConfig });

  // return TEXT; do NOT set responseMimeType to application/json
  const generationConfig = {
    temperature: typeof modelConfig?.temperature === 'number' ? modelConfig.temperature : 0.3,
    maxOutputTokens: modelConfig?.maxTokens ?? 2048,
  };

  // (Optional but helpful) nudge Gemini to format as Markdown
  const prompt = `${req.prompt}

---
Please format your answer as GitHub-flavored **Markdown** with clear headings, bullet lists, and code blocks when useful.`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const bodyText = await res.text().catch(() => '');
  if (!res.ok) throw new Error(`Gemini error ${res.status}: ${bodyText || res.statusText}`);

  const json = bodyText ? JSON.parse(bodyText) : {};
  const text =
    json?.candidates?.[0]?.content?.parts?.map(p => p?.text || '').join('') ||
    json?.candidates?.[0]?.content?.parts?.[0]?.text ||
    '';

  const md = ensureMarkdown(text || '_(no content)_');
  
  // Simulate streaming by yielding the response in chunks of 5-6 words for better streaming
  const words = md.split(' ');
  const chunkSize = 5; // Show 5 words at a time
  
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    yield ensureMarkdown(chunk + (i + chunkSize < words.length ? ' ' : ''));
    
    // Add a small delay to simulate real-time streaming (faster than word-by-word)
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}