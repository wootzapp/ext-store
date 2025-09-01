import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import useChatStream from '@/hooks/useChatStream';
import { renderMarkdown } from '@/lib/markdownUtils';
import useAuthAndPrefs from '@/hooks/useAuthAndPrefs';
import useQuotaGate from '@/hooks/useQuotaGate';
import QuotaGateOverlay from '@/pages/popup/components/QuotaGateOverlay';

/* ---------- Hook: stick to bottom with RAF + near-bottom detection ---------- */
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

/* ------------------------- Typewriter Markdown ------------------------------ */
function TypewriterMarkdown({
  text,
  isStreaming,
  mode = 'word',
  intervalMs = 30,
  onProgress,
}) {
  const [typed, setTyped] = useState('');
  const targetRef = useRef(text);
  const onProgressRef = useRef(onProgress);

  useEffect(() => { targetRef.current = text; }, [text]);
  useEffect(() => { onProgressRef.current = onProgress; }, [onProgress]);

  useEffect(() => {
    if (!isStreaming) {
      // Immediately render all received content and remove the cursor
      setTyped(targetRef.current || '');
    }
  }, [isStreaming]);  

  const lastLenRef = useRef(0);
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
    const count = (s.match(/```/g) || []).length;
    return count % 2 === 1 ? s + '\n```' : s;
  }, []);

  useEffect(() => {
    if (!targetRef.current) { setTyped(''); return; }
    const id = setInterval(() => {
      const src = targetRef.current || '';
      setTyped((curr) => {
        if (curr.length >= src.length) return curr;
        const next = nextIndex(src, curr.length);
        const out = src.slice(0, next);
        onProgressRef.current?.();
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

/* -------------------------------- Component -------------------------------- */
const Research = React.memo(function Research({
  onBack,
  onOpenSettings,
  onAnalysePage,   // (kept for your wiring)
  onFactChecker,   // (kept for your wiring)
  researchDepth = 'comprehensive',
  inputMessage = '',
  onOpenPlans,
  inputRef: externalInputRef,
}) {
  const [topic, setTopic] = useState(inputMessage);
  const [depth, setDepth] = useState(researchDepth);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const localInputRef = useRef(null);
  const inputRef = externalInputRef || localInputRef;

  const { prefs, loadPrefs } = useAuthAndPrefs();
  const [prefsReady, setPrefsReady] = useState(false);
  useEffect(() => { (async () => { await loadPrefs(); setPrefsReady(true); })(); }, [loadPrefs]);
  const useOwnKey = !!prefs?.useOwnKey;

  const quota = useQuotaGate({ useOwnKey });
  const isGated = prefsReady ? (!useOwnKey && quota.shouldGate) : false;

  const { isStreaming, preview, full, error, start, stop } = useChatStream();

  // Stick-to-bottom
  const scrollRef = useRef(null);
  const bumpScroll = useStickToBottom(scrollRef, { threshold: 96 });
  useEffect(() => { bumpScroll(true); }, [isStreaming]);                 // smooth at start/end
  useEffect(() => { bumpScroll(false); }, [preview, full, bumpScroll]);  // instant while typing

  // close depth dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const isDropdownOption = event.target.closest('[data-dropdown-option]');
        if (!isDropdownOption) setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const depthOptions = [
    { value: 'quick',          label: 'Quick Research',  description: 'Fast overview with key points' },
    { value: 'comprehensive',  label: 'Comprehensive',   description: 'Detailed analysis with multiple sources' },
    { value: 'expert',         label: 'Expert Level',    description: 'In-depth research with academic rigor' },
  ];
  const currentOption = depthOptions.find(o => o.value === depth) || depthOptions[1];
  const handleDepthSelect = (v) => { setDepth(v); setIsDropdownOpen(false); };

  const runResearch = async () => {
    if (!topic.trim() || isStreaming || isGated) return;
    await start({ kind: 'research', payload: { topic: topic.trim(), depth } });
  };

  // Stop if gate flips on while streaming
  useEffect(() => {
    if (isGated && isStreaming) { try { stop(); } catch {} }
  }, [isGated, isStreaming, stop]);

  const handleSubmit = async (e) => {
    e?.preventDefault(); e?.stopPropagation();
    if (isGated) return;
    if (isStreaming) await stop(); else await runResearch();
  };

  return (
    <motion.div className="w-full h-full flex flex-col relative overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white"></div>
      </div>

      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm text-gray-800 p-4 shadow-sm relative z-10 border-b border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => onBack?.()}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <span className="text-sm font-medium">Back</span>
          </button>

          <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">AI Researcher</h2>

          <div className="flex items-center gap-3">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-white text-gray-700 border border-gray-300 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 flex items-center justify-between min-w-[160px] hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                disabled={isStreaming || isGated}
                title="Research Depth"
              >
                <span className="font-medium">{currentOption.label}</span>
                <motion.svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              {isDropdownOpen && createPortal(
                <AnimatePresence>
                  <motion.ul
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="fixed bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-sm"
                    style={{ pointerEvents: 'auto', width: 'max-content', minWidth: '200px', maxWidth: '300px', top: '80px', right: '20px', zIndex: 999999 }}
                  >
                    {depthOptions.map((option) => (
                      <li key={option.value} data-dropdown-option="true"
                          className={`px-4 py-3 cursor-pointer transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl ${
                            option.value === currentOption.value ? 'bg-red-50 text-red-700 border-l-4 border-red-500' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                          onClick={() => handleDepthSelect(option.value)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{option.label}</span>
                          {option.value === currentOption.value && (
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                      </li>
                    ))}
                  </motion.ul>
                </AnimatePresence>,
                document.body
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto relative z-10">
        {!preview && !full && !isStreaming && !error && (
          <div className="text-center text-gray-500 mt-8">
            <div className="w-24 h-24 mx-auto mb-6 shadow-lg rounded-full overflow-hidden bg-white p-2">
              <img src="/icons/wootz.png" alt="AI Researcher Logo" className="w-full h-full object-cover" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to AI Researcher!</h3>
            <p className="text-sm text-gray-600">Enter a topic and get a streamed Markdown report with sources, findings, and takeaways.</p>
          </div>
        )}

        {isStreaming && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-red-500 rounded-full animate-spin mb-4 opacity-60"></div>
            {topic && (
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl px-4 py-2 mb-3 max-w-sm">
                <p className="text-gray-800 text-sm font-semibold">{topic}</p>
              </div>
            )}
            <p className="text-gray-500 text-xs">Streaming response…</p>
          </div>
        )}

        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">⚠️</span>
              <span className="text-yellow-700 text-sm font-medium">Stream Error</span>
            </div>
            <p className="text-yellow-700 text-xs mt-1">{String(error.message || error)}</p>
          </div>
        )}

        {(preview || full) && (
          <TypewriterMarkdown
            text={full || preview}
            isStreaming={isStreaming}
            mode="word"
            intervalMs={28}
            onProgress={() => bumpScroll(false)}
          />
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 relative z-10 border-t border-gray-200 bg-white/90 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-stretch gap-2">
            <input
              ref={inputRef}
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e); }}
              placeholder="Enter research topic..."
              className="flex-1 bg-white text-gray-700 border border-gray-300 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 placeholder-gray-400 shadow-sm"
              autoComplete="off"
              disabled={isStreaming || isGated}
            />

            {/* Start / Stop */}
            <button
              type="submit"
              className={`flex-shrink-0 ${isStreaming
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
              } text-white px-3 py-3 rounded-xl transition-all duration-300 shadow-lg`}
              title={isStreaming ? 'Stop' : 'Start'}
                disabled={isGated}
            >
              {isStreaming ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quota gate overlay */}
      <QuotaGateOverlay show={isGated} orgId={quota.orgId} onOpenSettings={onOpenSettings} usingOwnKey={useOwnKey} onOpenPlans={onOpenPlans} />
    </motion.div>
  );
});

export default Research;