import React from 'react';
import { motion } from 'framer-motion';

const LoaderScreen = ({ message = "Loading..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full h-full flex flex-col items-center justify-center bg-white"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000
      }}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-orange-500/5 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Spinner Loader */}
        <div className="loader mb-4" />
        
        {/* Animated Loading Text */}
        <div className="loading-text-loader" />
      </div>
    </motion.div>
  );
};

export default LoaderScreen;
