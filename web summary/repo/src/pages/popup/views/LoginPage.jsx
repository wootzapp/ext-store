import React, { useState } from 'react';
import { motion } from 'framer-motion';
import auth from '@/services/auth';

const LoginPage = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const result = await auth.startGitHubLogin();
      if (result.success) {
        onLoginSuccess();
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col relative overflow-hidden min-w-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/80 to-white" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="flex-1 flex flex-col pt-6 px-6 relative z-10 min-w-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 min-w-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-6 h-6 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <span className="text-gray-800 font-semibold truncate">Wootz AI</span>
          </div>
        </div>

        {/* Welcome text */}
        <motion.h1
          className="text-2xl font-bold text-gray-800 mb-2 break-words"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          Welcome to
        </motion.h1>

        <motion.h2
          className="text-3xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent mb-6 break-words"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Wootz AI
        </motion.h2>

        {/* Description */}
        <motion.p
          className="text-gray-600 text-sm mb-8 leading-relaxed break-words"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          AI-powered web analysis with research, page summarization, and fact checking capabilities.
        </motion.p>

        {/* Feature highlights */}
        <motion.div
          className="flex justify-between gap-2 mb-8 min-w-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div className="flex-1 max-w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
            <div className="text-red-500 text-lg mb-1">🔍</div>
            <span className="text-gray-800 text-xs font-medium">Research</span>
          </div>
          <div className="flex-1 max-w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
            <div className="text-red-500 text-lg mb-1">📄</div>
            <span className="text-gray-800 text-xs font-medium">Analysis</span>
          </div>
          <div className="flex-1 max-w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-xl p-3 flex flex-col items-center shadow-lg">
            <div className="text-red-500 text-lg mb-1">✅</div>
            <span className="text-gray-800 text-xs font-medium">Fact Check</span>
          </div>
        </motion.div>

        {/* Login button */}
        <motion.button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full max-w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold flex items-center justify-center gap-2 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          whileHover={{ scale: isLoading ? 1 : 1.05 }}
          whileTap={{ scale: isLoading ? 1 : 0.95 }}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign in to Continue</span>
              <span className="text-lg">→</span>
            </>
          )}
        </motion.button>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default LoginPage;
