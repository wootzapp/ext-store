import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { truncateUrl } from '@/lib/urlUtils';
import useChatStream from '@/hooks/useChatStream';
import { renderMarkdown } from '@/lib/markdownUtils';
import useAuthAndPrefs from '@/hooks/useAuthAndPrefs';
import useQuotaGate from '@/hooks/useQuotaGate';
import QuotaGateOverlay from '@/pages/popup/components/QuotaGateOverlay';

/* stick-to-bottom (RAF + near-bottom detection) */
function useStickToBottom(scrollRef, { threshold = 96 } = {}) {
  const pinnedRef = useRef(true);
  const rafRef = useRef(0);

  const measure = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight;
    pinnedRef.current = dist <= threshold;
  }, [scrollRef, threshold]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    measure();
    const onScroll = () => measure();
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [measure, scrollRef]);

  const bump = useCallback((smooth = false) => {
    const el = scrollRef.current;
    if (!el || !pinnedRef.current) return;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (smooth) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
      else el.scrollTop = el.scrollHeight;
    });
  }, [scrollRef]);

  return bump;
}

/** TypewriterMarkdown (same as Analysis) */
function TypewriterMarkdown({ text, isStreaming, intervalMs = 28, mode = 'word', onProgress }) {
  const [typed, setTyped] = useState('');
  const targetRef = useRef(text);
  const lastLenRef = useRef(0);
  const onProgressRef = useRef(onProgress);

  useEffect(() => { targetRef.current = text; }, [text]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  useEffect(() => {
    if (text.length < lastLenRef.current) setTyped('');
    lastLenRef.current = text.length;
  }, [text.length]);

  const nextIndex = useCallback((src, from) => {
    if (from >= src.length) return src.length;
    if (mode === 'char') return from + 1;
    const re = /(\s+|[^\s]+)/g; re.lastIndex = from;
    const m = re.exec(src);
    return m ? re.lastIndex : src.length;
  }, [mode]);

  const patchUnclosedFences = useCallback((s) => {
    const cnt = (s.match(/```/g) || []).length;
    return cnt % 2 === 1 ? s + '\n```' : s;
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const src = targetRef.current || '';
      setTyped(curr => {
        if (curr.length >= src.length) return curr;
        const next = nextIndex(src, curr.length);
        const out = src.slice(0, next);
        onProgressRef.current?.(); // instant nudge
        return out;
      });
    }, Math.max(8, intervalMs));
    return () => clearInterval(id);
  }, [intervalMs, nextIndex]);

  const visible = patchUnclosedFences(typed);
  const compiled = renderMarkdown(visible);
  const isString = typeof compiled === 'string';

  return (
    <div className="prose max-w-none prose-sm sm:prose-base prose-pre:rounded-lg prose-pre:shadow-sm">
      {isString ? <div dangerouslySetInnerHTML={{ __html: compiled }} /> : compiled}
      {(isStreaming || typed.length < (targetRef.current?.length || 0)) && (
        <span aria-hidden className="inline-block align-baseline w-[1px] h-4 ml-0.5 bg-gray-700 animate-pulse" />
      )}
    </div>
  );
}

const FactCheck = ({ currentPageUrl, onBack, onClearHistory, onOpenSettings, onOpenPlans }) => {
  const { isStreaming, preview, full, error, start, stop, reset } = useChatStream();

  const { prefs, loadPrefs } = useAuthAndPrefs();
  const [prefsReady, setPrefsReady] = useState(false);
  useEffect(() => { (async () => { await loadPrefs(); setPrefsReady(true); })(); }, [loadPrefs]);
  const useOwnKey = !!prefs?.useOwnKey;

  const quota = useQuotaGate({ useOwnKey });
  const isGated = prefsReady ? (!useOwnKey && quota.shouldGate) : false;
  // Start fact-check stream when URL changes (only if allowed)
  useEffect(() => {
    if (!currentPageUrl) return;
    if (quota.loading || isGated) return;
    (async () => {
      await start({ kind: 'factCheck', payload: { url: currentPageUrl } });
    })();
    return () => { try { stop(); } catch {} reset(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageUrl, quota.loading, isGated]);

  // Stop if the gate flips on
  useEffect(() => { if (isGated && isStreaming) { try { stop(); } catch {} } }, [isGated, isStreaming, stop]);

  const handleClear = () => { try { stop(); } catch {} reset(); onClearHistory?.(); };
  const pageText = full || preview || '';

  // better auto-scroll
  const scrollRef = useRef(null);
  const bumpScroll = useStickToBottom(scrollRef, { threshold: 96 });
  useEffect(() => { bumpScroll(true); }, [isStreaming, bumpScroll]); // smooth on start/end
  useEffect(() => { bumpScroll(false); }, [pageText, bumpScroll]);   // instant while typing

  return (
    <motion.div
      className="w-full h-full flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-4 shadow-sm relative z-10 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <button onClick={onBack} className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">Fact Checker</h1>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              title="Clear Fact Check"
              disabled={isGated}
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {/* URL panel */}
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-4 shadow-lg">
          <p className="text-gray-600 text-xs font-medium mb-1">Fact-checking:</p>
          <p className="text-gray-800 text-sm truncate">{truncateUrl(currentPageUrl, 60)}</p>
        </div>

        {isStreaming && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 opacity-60"></div>
            <p className="text-gray-600 text-sm font-medium">Analyzing claims…</p>
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-700 text-sm font-medium">Stream Error</span>
            </div>
            <p className="text-yellow-700 text-xs mt-1">{String(error.message || error)}</p>
          </div>
        )}

        {/* Plain summary (no rectangle) */}
        {!!pageText && (
          <div className="mt-2">
            <TypewriterMarkdown
              text={pageText}
              isStreaming={isStreaming}
              intervalMs={28}
              mode="word"
              onProgress={() => bumpScroll(false)}
            />
          </div>
        )}
      </div>

      {/* Quota gate overlay */}
      <QuotaGateOverlay show={isGated} orgId={quota.orgId} onOpenSettings={onOpenSettings} usingOwnKey={useOwnKey} onOpenPlans={onOpenPlans} />
    </motion.div>
  );
};

export default FactCheck;