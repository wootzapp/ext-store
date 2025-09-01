import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaHeart, FaTag, FaInfoCircle } from 'react-icons/fa';

const ProductDetails = ({ productDetails, onBack, toastInfo }) => {
  const [toast, setToast] = useState(toastInfo || { show: false, message: '', type: 'success' });

  useEffect(() => {
    if (toastInfo && toastInfo.show) {
      setToast(toastInfo);
      // Auto-hide toast after 4 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 4000);
    }
  }, [toastInfo]);

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-[#0f0a2e] via-[#2d1b69] to-[#4c1d95] p-4 sm:p-6 font-labubu flex flex-col items-center relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 120 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-pink-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto mb-8 relative z-10">
        <div className="flex items-center justify-between w-full mb-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onBack}
            className="flex items-center space-x-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
          >
            <FaArrowLeft className="w-5 h-5 text-white" />
            <span className="text-white font-semibold">Back to Search</span>
          </motion.button>
        </div>
      </div>

      {/* Product Content */}
      <div className="w-full max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative"
        >
          <div className="relative group">
            {productDetails.image ? (
              <img
                src={productDetails.image}
                alt={productDetails.name}
                className="w-full h-96 object-cover rounded-3xl border-2 border-white/20 shadow-2xl group-hover:border-pink-400/50 transition-all duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="w-full h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-white/20 rounded-3xl flex items-center justify-center hidden shadow-2xl"
              style={{ display: productDetails.image ? 'none' : 'flex' }}
            >
              <span className="text-8xl">🦊</span>
            </div>
            
            {/* Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Quick actions */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-pink-500/80 transition-all duration-200"
              >
                <FaHeart className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Product Information */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Product Name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mr-3">
                <FaInfoCircle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-pink-400 font-semibold text-lg uppercase tracking-wide">Product Name</h3>
            </div>
            <h1 className="text-3xl font-bold text-white leading-tight">
              {productDetails.name || "Product name not available"}
            </h1>
          </motion.div>

          {/* Product Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-md rounded-3xl p-6 border border-pink-400/30 shadow-xl"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mr-3">
                <FaTag className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-green-400 font-semibold text-lg uppercase tracking-wide">Price</h3>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-4xl font-bold text-white">
                  {productDetails.price || "Price not available"}
                </span>
                <span className="text-lg text-purple-300 font-medium">USD</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Toast Notification */}
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className={`w-full max-w-4xl mx-auto rounded-3xl shadow-2xl border backdrop-blur-md overflow-hidden ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-500/95 via-emerald-500/95 to-green-600/95 text-white border-green-400/30 shadow-green-500/25' 
              : toast.type === 'error'
              ? 'bg-gradient-to-r from-red-500/95 via-pink-500/95 to-red-600/95 text-white border-red-400/30 shadow-red-500/25'
              : 'bg-gradient-to-r from-blue-500/95 via-purple-500/95 to-blue-600/95 text-white border-blue-400/30 shadow-blue-500/25'
          }`}>
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md ${
                  toast.type === 'success' 
                    ? 'bg-green-400/30 border border-green-300/50' 
                    : toast.type === 'error' 
                    ? 'bg-red-400/30 border border-red-300/50' 
                    : 'bg-blue-400/30 border border-blue-300/50'
                }`}>
                  <span className="text-2xl">
                    {toast.type === 'success' ? '🎉' : toast.type === 'error' ? '❌' : 'ℹ️'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-lg">
                    {toast.type === 'success' ? 'Success!' : toast.type === 'error' ? 'Error!' : 'Info'}
                  </span>
                  <span className="text-white/90 font-medium">{toast.message}</span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setToast({ show: false, message: '', type: 'success' })}
                className="p-2 rounded-2xl bg-white/20 hover:bg-white/30 transition-all duration-200 backdrop-blur-md"
              >
                <span className="text-white text-lg">×</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProductDetails; 