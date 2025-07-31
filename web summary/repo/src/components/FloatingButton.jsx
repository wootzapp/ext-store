import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingButton = React.memo(({ onAnalysePage, onFactsChecker }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleAnalysePage = useCallback(() => {
    setIsDropdownOpen(false);
    onAnalysePage();
  }, [onAnalysePage]);

  const handleFactsChecker = useCallback(() => {
    setIsDropdownOpen(false);
    onFactsChecker();
  }, [onFactsChecker]);

  return (
    <div className="absolute bottom-16 right-2 z-50">
      {/* Main circular button */}
      <motion.button
        onClick={toggleDropdown}
        className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg flex items-center justify-center text-white text-base cursor-pointer border-none outline-none"
        whileHover={{ scale: 1.1, boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)' }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        title="Web Summary Tools"
      >
        🔍
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className="absolute bottom-12 right-0 min-w-40 bg-black/95 backdrop-blur-lg rounded-xl shadow-2xl border border-white/10 overflow-hidden"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Analyse Page option */}
            <motion.div
              onClick={handleAnalysePage}
              className="flex items-center px-3 py-2 text-white cursor-pointer transition-all duration-200 hover:bg-red-500/20"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.1 }}
            >
              <span className="mr-2 text-sm">📊</span>
              <span className="text-xs font-medium">Analyse Page</span>
            </motion.div>

            {/* Facts Checker option */}
            <motion.div
              onClick={handleFactsChecker}
              className="flex items-center px-3 py-2 text-white cursor-pointer transition-all duration-200 hover:bg-red-500/20"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.1 }}
            >
              <span className="mr-2 text-sm">✅</span>
              <span className="text-xs font-medium">Facts Checker</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close dropdown when clicking outside */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-[-1]"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
});

FloatingButton.displayName = 'FloatingButton';

export default FloatingButton;
