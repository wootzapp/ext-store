import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingButton = React.memo(({ onAnalysePage, onFactChecker }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = useCallback(() => {
    setIsDropdownOpen(prev => !prev);
  }, []);

  const handleAnalysePage = useCallback(() => {
    setIsDropdownOpen(false);
    onAnalysePage();
  }, [onAnalysePage]);

  const handleFactChecker = useCallback(() => {
    setIsDropdownOpen(false);
    onFactChecker();
  }, [onFactChecker]);

  return (
    <div className="absolute bottom-24 right-5 z-50">
      {/* Main circular button */}
      <motion.button
        onClick={toggleDropdown}
        className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-lg flex items-center justify-center text-white text-lg cursor-pointer border-none outline-none"
        whileHover={{ scale: 1.1, boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6)' }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        title="Web Summary Tools"
      >
        ⚡
      </motion.button>

      {/* Dropdown menu */}
      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            className="absolute bottom-16 right-0 min-w-40 bg-white/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Analyse Page option */}
            <motion.div
              onClick={handleAnalysePage}
              className="flex items-center px-3 py-2 text-gray-800 cursor-pointer transition-all duration-200 hover:bg-red-50"
              whileHover={{ x: 3 }}
              transition={{ duration: 0.1 }}
            >
              <span className="mr-2 text-sm">📊</span>
              <span className="text-xs font-medium">Analyse Page</span>
            </motion.div>

            {/* Facts Checker option */}
            <motion.div
              onClick={handleFactChecker}
              className="flex items-center px-3 py-2 text-gray-800 cursor-pointer transition-all duration-200 hover:bg-red-50"
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
