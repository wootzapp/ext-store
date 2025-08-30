// src/services/ai/markdown.js

// If provider spits plain text, this makes it safe to render as Markdown.
// If JSON sneaks in, we pretty-print as fenced code.
export function ensureMarkdown(text) {
    if (!text) return '';
    const trimmed = String(text);
    // Heuristic: if it looks like a JSON object/array without MD hints, fence it.
    const looksJson = /^[\s\n]*[\[{].*[\]}][\s\n]*$/.test(trimmed);
    if (looksJson && !/```/.test(trimmed)) {
      try {
        const pretty = JSON.stringify(JSON.parse(trimmed), null, 2);
        return `\n\n\`\`\`json\n${pretty}\n\`\`\`\n`;
      } catch {
        // fall through to plain
      }
    }
    return trimmed;
  }
  
  // Optional: split big Markdown into smaller UI-friendly chunks
  export function chunkMarkdown(md, size = 1000) {
    const out = [];
    for (let i = 0; i < md.length; i += size) out.push(md.slice(i, i + size));
    return out;
  }