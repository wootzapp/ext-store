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
    
    // If text is smaller than chunk size, return as single chunk
    if (md.length <= size) {
      return [md];
    }
    
    // Split at natural boundaries (sentences, then words, then characters)
    let currentPos = 0;
    
    while (currentPos < md.length) {
      let endPos = Math.min(currentPos + size, md.length);
      
      // Try to find a good break point within the chunk
      if (endPos < md.length) {
        // Look for sentence endings first
        const sentenceEnd = md.lastIndexOf('. ', endPos);
        const questionEnd = md.lastIndexOf('? ', endPos);
        const exclamationEnd = md.lastIndexOf('! ', endPos);
        const lineBreak = md.lastIndexOf('\n', endPos);
        
        const bestBreak = Math.max(sentenceEnd, questionEnd, exclamationEnd, lineBreak);
        
        if (bestBreak > currentPos + size * 0.5) { // Only use if it's not too far back
          endPos = bestBreak + 1; // Include the punctuation
        } else {
          // Look for word boundaries
          const wordBreak = md.lastIndexOf(' ', endPos);
          if (wordBreak > currentPos + size * 0.7) { // Only use if not too far back
            endPos = wordBreak + 1; // Include the space
          }
        }
      }
      
      out.push(md.slice(currentPos, endPos));
      currentPos = endPos;
    }
    
    return out;
  }