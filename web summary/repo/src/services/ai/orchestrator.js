// services/chat/orchestrator.js
// Orchestrates: prompt -> stream -> markdown buffer -> lifecycle

import { buildPrompt } from '@/services/ai/promptBuilder';
import { startStreamingChat } from '@/services/chat/streamClient';
import { createMarkdownBuffer } from '@/services/markdown/streamBuffer';

export const StreamState = Object.freeze({
  IDLE: 'idle',
  CONNECTING: 'connecting',
  STREAMING: 'streaming',
  ENDED: 'ended',
  ERROR: 'error',
});

export class ChatSessionManager {
  /**
   * @param {Object} cfg
   * @param {number} cfg.orgId
   * @param {'chat'|'pageAnalysis'|'research'|'factCheck'|'faq'} cfg.kind
   * @param {Object} cfg.payload           // promptBuilder payload (e.g., { topic, depth } for research)
   * @param {Object} [cfg.options]         // promptBuilder options (tone, audience, etc.)
   * @param {string} [cfg.model]           // optional; backend may ignore
   * @param {function(string)} [cfg.onPreview]  // safe markdown preview (throttled)
   * @param {function(string)} [cfg.onFinal]    // final markdown
   * @param {function(any)}     [cfg.onMeta]    // meta events from stream
   * @param {function(string)}  [cfg.onState]   // state updates
   * @param {function(Error)}   [cfg.onError]   // errors
   */
  constructor(cfg) {
    this.cfg = cfg;
    this.state = StreamState.IDLE;
    this._handle = null;     // from startStreamingChat
    this._buffer = null;     // markdown buffer
    this._final = '';
    this._disposed = false;
  }

  _setState(s) {
    this.state = s;
    this.cfg.onState?.(s);
  }

  get markdown() {
    return this._buffer?.getRaw?.() || this._final || '';
  }

  async start() {
    if (this._disposed) throw new Error('Session disposed');
    if (this.state !== StreamState.IDLE && this.state !== StreamState.ENDED) {
      throw new Error(`Cannot start from state: ${this.state}`);
    }

    this._setState(StreamState.CONNECTING);

    // Build the final Markdown prompt
    const prompt = buildPrompt(this.cfg.kind, this.cfg.payload || {}, this.cfg.options || {});

    // Create a streaming markdown buffer (throttled, safe preview)
    this._buffer = createMarkdownBuffer({
      onUpdate: (preview /*, raw */) => this.cfg.onPreview?.(preview),
      onDone: (finalRaw) => {
        this._final = finalRaw;
        this.cfg.onFinal?.(finalRaw);
      },
      onError: (e) => this.cfg.onError?.(e),
    });

    try {
      // Kick off the encrypted Ably stream; wire events into the buffer
      this._handle = await startStreamingChat({
        prompt,
        orgId: this.cfg.orgId,
        model: this.cfg.model,
        onMeta: (m) => this.cfg.onMeta?.(m),
        onText: (chunk /*, full */) => {
          if (this.state !== StreamState.STREAMING) this._setState(StreamState.STREAMING);
          this._buffer.push(chunk);
        },
        onDone: () => {
          this._buffer.end();
          this._setState(StreamState.ENDED);
        },
        onError: (err) => {
          this._setState(StreamState.ERROR);
          this.cfg.onError?.(err);
        },
      });

      return {
        clientId: this._handle.clientId,
        sessionId: this._handle.sessionId,
        channelName: this._handle.channelName,
      };
    } catch (e) {
      this._setState(StreamState.ERROR);
      this.cfg.onError?.(e instanceof Error ? e : new Error(String(e)));
      throw e;
    }
  }

  async stop() {
    // Graceful stop: unsubscribe & close Ably, finalize state if needed
    if (this._handle) {
      try { await this._handle.dispose(); } catch {}
      this._handle = null;
    }
    if (this._buffer && this.state === StreamState.STREAMING) {
      try { this._buffer.end(); } catch {}
    }
    if (this.state !== StreamState.ERROR && this.state !== StreamState.ENDED) {
      this._setState(StreamState.ENDED);
    }
  }

  async dispose() {
    this._disposed = true;
    await this.stop();
    try { this._buffer?.dispose?.(); } catch {}
    this._buffer = null;
  }
}
