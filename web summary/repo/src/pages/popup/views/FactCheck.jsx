import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { truncateUrl } from '@/lib/urlUtils';
import useChatStream from '@/hooks/useChatStream';
import { renderMarkdown } from '@/lib/markdownUtils';
import SettingsButton from '@/pages/popup/components/SettingsButton';

const FactCheck = ({
  currentPageUrl,
  onBack,
  onClearHistory,
  onSettingsClick,
}) => {
  const { isStreaming, preview, full, error, start, stop, reset } = useChatStream();

  // Start fact-check stream when URL changes
  useEffect(() => {
    if (!currentPageUrl) return;
    (async () => {
      await start({
        kind: 'factCheck',
        payload: { url: currentPageUrl },
      });
    })();
    return () => {
      try { stop(); } catch {}
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPageUrl]);

  // Clear handler
  const handleClear = () => {
    try { stop(); } catch {}
    reset();
    onClearHistory?.();
  };

  const pageText = full || preview || '';

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
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors"
          >
            <span className="text-sm font-medium">Back</span>
          </button>

          <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">Fact Checker</h1>

          <div className="flex items-center gap-3">
            <SettingsButton onSettingsClick={onSettingsClick} />
            <button
              type="button"
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              title="Clear Fact Check"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
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

        {!!pageText && (
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
            <div className="prose max-w-none prose-sm sm:prose-base">
              {renderMarkdown(pageText)}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FactCheck;