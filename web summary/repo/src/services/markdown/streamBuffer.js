// services/markdown/streamBuffer.js
// Minimal helper to assemble streamed chunks and emit a safe preview for ReactMarkdown.

const DEFAULTS = {
    throttleMs: 50,        // prevent too-frequent re-renders
    maxChars: 300_000,     // avoid unbounded memory growth
    onUpdate: (_preview, _raw) => {},
    onDone: (_raw) => {},
    onError: (_err) => {},
  };
  
  const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g;
  
  function sanitize(md) {
    if (!md) return '';
    return md.replace(CONTROL_CHARS, '');
  }

  export function makeSafePreview(raw) {   // <-- export this
    const md = sanitize(raw);
    const fenceCount = (md.match(/```/g) || []).length;
    if (fenceCount % 2 === 1) return md + '\n```';
    return md;
  }
  
  // Optional helpers if you want to pull metadata from the final markdown.
  export function extractTitle(md) {
    const m = md.match(/^\s*#\s+(.+?)\s*$/m);
    return m ? m[1].trim() : null;
  }
  
  export function extractSources(md) {
    // Parses a "## Sources" or "## References" section of markdown list items.
    const section = md.split(/\n##+\s+(Sources|References)\b/i)[1]
      ? md.split(/\n##+\s+(Sources|References)\b/i)[2] // content after the heading
      : '';
    if (!section) return [];
    const lines = section.split('\n').slice(0, 200); // safety cap
    const items = [];
    for (const line of lines) {
      const li = line.match(/^\s*[-*+]\s+(.*)/);
      if (!li) {
        // break when next heading starts
        if (/^\s*##+\s+/.test(line)) break;
        continue;
      }
      const text = li[1].trim();
      const link = text.match(/\[([^\]]+)\]\(([^)]+)\)/);
      items.push({
        title: (link ? link[1] : text).trim(),
        url: link ? link[2] : null,
        raw: text,
      });
    }
    return items;
  }
  
  export function createMarkdownBuffer(opts = {}) {
    const cfg = { ...DEFAULTS, ...opts };
    let raw = '';
    let timer = null;
    let disposed = false;
  
    const emit = () => {
      if (disposed) return;
      timer = null;
      const preview = makeSafePreview(raw);
      try {
        cfg.onUpdate(preview, raw);
      } catch (e) {
        cfg.onError(e);
      }
    };
  
    const schedule = () => {
      if (timer || disposed) return;
      timer = setTimeout(emit, cfg.throttleMs);
    };
  
    return {
      push(chunk) {
        if (disposed || !chunk) return;
        // clamp size if needed
        if (raw.length + chunk.length > cfg.maxChars) {
          const keep = Math.floor(cfg.maxChars * 0.8);
          raw = raw.slice(-keep);
        }
        raw += chunk;
        schedule();
      },
      end() {
        if (disposed) return;
        // ensure the UI gets the final, safe frame
        try {
          cfg.onUpdate(makeSafePreview(raw), raw);
          cfg.onDone(raw);
        } catch (e) {
          cfg.onError(e);
        }
      },
      reset() {
        raw = '';
      },
      getRaw() {
        return raw;
      },
      dispose() {
        disposed = true;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
    };
  }
  