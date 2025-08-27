import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SEARCH_ENGINES } from '@/storage';

function getSearchEngineIcon(id, size = 'sm') {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  switch (id) {
    case 'google':
      return (
        <div className={`${sizeClass} flex items-center justify-center`}>
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>
      );
    case 'bing':
      return (
        <div className={`${sizeClass} flex items-center justify-center`}>
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <path d="M5.5 3v7.5l3 1.5 6-3V6L8 3H5.5z" fill="#00BCF2"/>
            <path d="M8.5 9v3l6 3 4.5-2.25V9l-4.5-1.5-6 1.5z" fill="#0078D4"/>
            <path d="M8.5 12l6 3v3l-6-3v-3z" fill="#1BA1E2"/>
            <path d="M14.5 15v3l4.5-2.25V12.75L14.5 15z" fill="#40E0D0"/>
          </svg>
        </div>
      );
    case 'yahoo':
      return (
        <div className={`${sizeClass} flex items-center justify-center`}>
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <path d="M2 7.5L9 2l7 5.5L9 13l-7-5.5z" fill="#7B46C7"/>
            <path d="M9 13l7-5.5L23 12l-7 5.5L9 13z" fill="#5B2C87"/>
            <path d="M2 16.5L9 11l7 5.5L9 22l-7-5.5z" fill="#410E5F"/>
            <circle cx="9" cy="12" r="2" fill="#FFFFFF"/>
          </svg>
        </div>
      );
    case 'yandex':
      return (
        <div className={`${sizeClass} flex items-center justify-center`}>
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="4" fill="#FC3F1D"/>
            <path d="M12.5 6.5h2.5c1.5 0 2.5 1 2.5 2.5s-1 2.5-2.5 2.5h-1.5v5h-2v-10h1zm1 4h1.5c.5 0 1-.5 1-1s-.5-1-1-1h-1.5v2z" fill="white"/>
            <path d="M8 6.5h2v4.5l2.5-4.5h2.5l-2.5 4.5 3 5.5h-2.5l-2-3.5-1 1.5v2h-2v-10z" fill="white"/>
          </svg>
        </div>
      );
    case 'duckduckgo':
      return (
        <div className={`${sizeClass} flex items-center justify-center`}>
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#DE5833"/>
            <path d="M12 4c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 6c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5zm-7 0c0 .8-.7 1.5-1.5 1.5s-1.5-.7-1.5-1.5.7-1.5 1.5-1.5 1.5.7 1.5 1.5zm3.5 6c-2.2 0-4-1.3-4-3h8c0 1.7-1.8 3-4 3z" fill="#FFFFFF"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${sizeClass} flex items-center justify-center`}>
          <svg className={sizeClass} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="#6B7280"/>
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z" fill="white"/>
          </svg>
        </div>
      );
  }
}

export default function DefaultSearchEngineSection({ isEditMode, selectedSearchEngine, onSelect }) {
  const [expanded, setExpanded] = React.useState(false);

  const selected = React.useMemo(
    () => SEARCH_ENGINES.find(e => e.id === selectedSearchEngine) || null,
    [selectedSearchEngine]
  );

  return (
    <div className="max-w-full">
      {/* Section title to match other sections */}
      <h2 className="text-lg font-medium text-gray-800 mb-3">Default Search Engine</h2>

      {/* Summary / toggle card shows the CURRENT selection, not the section title */}
      <button
        type="button"
        aria-label="Change default search engine"
        onClick={() => setExpanded(v => !v)}
        className="w-full p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-between overflow-hidden"
      >
        <div className="flex items-center gap-3 min-w-0">
          {getSearchEngineIcon(selected?.id, 'sm')}
          <div className="min-w-0">
            <div className="text-xs text-gray-500">Selected</div>
            <div className="font-medium text-gray-800 truncate">
              {selected?.name || 'Not set'}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 111.414 1.414l-4 4A1 1 0 0110 12z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="mt-3 max-w-full"
          >
            <div className="grid gap-3 max-w-full">
              {SEARCH_ENGINES.map((engine) => {
                const isSelected = selectedSearchEngine === engine.id;
                return (
                  <button
                    type="button"
                    key={engine.id}
                    onClick={() => {
                      if (!isEditMode) return;
                      onSelect(engine.id);
                      setExpanded(false);
                    }}
                    className={`w-full max-w-full p-4 rounded-xl border text-left transition-colors overflow-hidden
                      ${isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'}
                      ${!isEditMode ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center space-x-3 max-w-full">
                      {getSearchEngineIcon(engine.id)}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">{engine.name}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shrink-0">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}