// src/services/ai/sse.js
// Async generator that yields { event?, data? } objects from a fetch Response with SSE.

export async function* parseSSE(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
  
    let buf = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
  
      // Split by double-newline "events"
      let idx;
      while ((idx = buf.indexOf('\n\n')) !== -1) {
        const raw = buf.slice(0, idx);
        buf = buf.slice(idx + 2);
  
        // Parse lines
        let eventName = undefined, data = '';
        for (const line of raw.split('\n')) {
          if (line.startsWith('event:')) {
            eventName = line.slice(6).trim();
          } else if (line.startsWith('data:')) {
            data += line.slice(5).trim();
          }
        }
        yield { event: eventName, data };
      }
    }
  
    if (buf.trim()) {
      // trailing data (best effort)
      yield { data: buf.trim() };
    }
  }  
