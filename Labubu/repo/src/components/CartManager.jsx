import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaClock, FaSync, FaCheckCircle, FaExclamationTriangle, FaArrowLeft, FaTrash, FaHeart } from 'react-icons/fa';

const CartManager = ({ onBack }) => {
  const [cartProducts, setCartProducts] = useState([]);
  const [waitlistProducts, setWaitlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    loadCartData();
    
    const handleRetrySuccess = (message) => {
      if (message.type === 'RETRY_SUCCESS') {
        setToast({
          show: true,
          message: `🎉 ${message.productName} is now back in stock and added to cart!`,
          type: 'success'
        });
        
        loadCartData();
        setTimeout(() => {
          setToast({ show: false, message: '', type: 'success' });
        }, 5000);
      }
    };

    chrome.runtime.onMessage.addListener(handleRetrySuccess);
    
    return () => {
      chrome.runtime.onMessage.removeListener(handleRetrySuccess);
    };
  }, []);

  const loadCartData = async () => {
    setLoading(true);
    try {
      const cartResponse = await chrome.runtime.sendMessage({
        type: 'LOAD_CART_PRODUCTS'
      });

      if (cartResponse.success) {
        setCartProducts(cartResponse.products || []);
      }
      const waitlistResponse = await chrome.runtime.sendMessage({
        type: 'LOAD_WAITLIST_PRODUCTS'
      });

      if (waitlistResponse.success) {
        setWaitlistProducts(waitlistResponse.products || []);
      }
    } catch (error) {
      console.error('Error loading cart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = async () => {
    setRefreshing(true);
    try {
      await loadCartData();
    } finally {
      setRefreshing(false);
    }
  };




  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-[#0f0a2e] via-[#2d1b69] to-[#4c1d95] flex items-center justify-center font-labubu">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-purple-400 mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Loading your treasures...</h2>
          <p className="text-purple-300">Please wait while we fetch your cart information</p>
        </div>
      </div>
    );
  }

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
      <div className="flex flex-col items-center w-full max-w-6xl mx-auto mb-8 relative z-10">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
            >
              <FaArrowLeft className="w-5 h-5 text-white" />
            </motion.button>
            <div>
              <h1 className="text-3xl font-bold text-white">Cart Manager</h1>
              <p className="text-purple-300">Manage your Popmart treasures</p>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={refreshCart}
            disabled={refreshing}
            className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 shadow-lg"
          >
            <FaSync className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="font-semibold">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </motion.button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <FaShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">In Cart</h3>
                  <p className="text-purple-300 text-sm">Ready to purchase</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-green-400">{cartProducts.length}</span>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <FaClock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Waitlist</h3>
                  <p className="text-purple-300 text-sm">Waiting for stock</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-orange-400">{waitlistProducts.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Products Added to Cart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <FaShoppingCart className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Shopping Cart</h2>
          </div>

          {cartProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center">
                <FaShoppingCart className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
              <p className="text-purple-300">Start adding some treasures!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-white/20 shadow-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgzMlYzMkgxNlYxNloiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate">{product.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xl font-bold text-green-400">{product.price}</span>

                      </div>
                      {product.addedAt && (
                        <p className="text-xs text-purple-300 mt-1">
                          Added: {new Date(product.addedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add to Cart When Available */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <FaClock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Waitlist</h2>
          </div>

          {waitlistProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full flex items-center justify-center">
                <FaClock className="w-10 h-10 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No items in waitlist</h3>
              <p className="text-purple-300">Items will appear here when out of stock</p>
              <p className="text-blue-300 text-sm mt-2">Auto-retry system will attempt to add them every 5 minutes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {waitlistProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl border border-white/20 shadow-lg"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAxNkgzMlYzMkgxNlYxNloiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-lg truncate">{product.name}</h3>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-xl font-bold text-orange-400">{product.price}</span>
                        <div className="flex items-center space-x-1 text-orange-400">
                          <FaExclamationTriangle className="w-4 h-4" />
                          <span className="text-sm">Out of Stock</span>
                        </div>
                      </div>
                      {product.addedAt && (
                        <p className="text-xs text-purple-300 mt-1">
                          Added: {new Date(product.addedAt).toLocaleDateString()}
                        </p>
                      )}
                      <div className="flex items-center space-x-1 text-blue-400 mt-2">
                        <FaSync className="w-3 h-3 animate-spin" />
                        <span className="text-xs">Auto-retrying every 5 minutes</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CartManager; 