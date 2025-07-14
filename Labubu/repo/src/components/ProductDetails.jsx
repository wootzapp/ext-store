import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaShoppingCart, FaBell, FaCheck, FaTimes } from 'react-icons/fa';

const ProductDetails = ({ productDetails, onBack, onNotifyWhenAvailable }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationSet, setNotificationSet] = useState(false);
  const [checkingCart, setCheckingCart] = useState(false);
  const [cartResult, setCartResult] = useState(null);

  const handleNotifyWhenAvailable = async () => {
    setIsLoading(true);
    try {
      // Here you would implement the notification logic
      // For now, we'll just simulate it
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotificationSet(true);
    } catch (error) {
      console.error('Error setting notification:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckInCart = async () => {
    setCheckingCart(true);
    setCartResult(null);
    console.log('🟢 UI: [CART] Check in Cart button clicked.');
    // Send message to background to open product page in webcontent and click button
    chrome.runtime.sendMessage({
      type: 'CLICK_AND_CHECK_CART',
      url: productDetails.url,
      productName: productDetails.name
    }, (response) => {
      setCheckingCart(false);
      setCartResult(response);
      if (response && response.success) {
        console.log('🟢 UI: [CART] Cart check completed. See logs for details.');
      } else {
        console.warn('🟢 UI: [CART] Cart check failed or not implemented.');
      }
    });
  };

  const isAvailable = productDetails.availabilityStatus === 'Available';

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-[#1a144b] via-[#3a1c71] to-[#6e1e9c] p-4 sm:p-6 font-labubu flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 120 }}
    >
      {/* Header with back button */}
      <div className="w-full max-w-md mx-auto mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-white hover:text-pink-300 transition-colors mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to Search
        </button>
        
        <h2 className="text-2xl font-extrabold text-white text-center">Product Details</h2>
      </div>

      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Product Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {productDetails.image ? (
            <img
              src={productDetails.image}
              alt={productDetails.name}
              className="w-full h-64 object-cover rounded-2xl border-2 border-pink-400 shadow-lg"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-400 rounded-2xl flex items-center justify-center">
              <span className="text-4xl">🦊</span>
            </div>
          )}
          
          {/* Fallback image placeholder */}
          <div 
            className="w-full h-64 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-2 border-pink-400 rounded-2xl flex items-center justify-center hidden"
            style={{ display: productDetails.image ? 'none' : 'flex' }}
          >
            <span className="text-4xl">🦊</span>
          </div>
        </motion.div>
        {/* Availability Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          {productDetails.buyNowAvailable ? (
            <div className="flex items-center justify-center space-x-2 bg-green-500/20 border border-green-400/40 rounded-xl p-4">
              <FaCheck className="text-green-400" />
              <span className="text-green-200 font-semibold">
                {productDetails.buyNowText || 'Available for Purchase'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2 bg-red-500/20 border border-red-400/40 rounded-xl p-4">
              <FaTimes className="text-red-400" />
              <span className="text-red-200 font-semibold">
                {productDetails.outOfStockMessage || 'Out of Stock'}
              </span>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Buy Now Button - Always shown */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full px-6 py-3 text-white rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center space-x-2 ${
              productDetails.buyNowAvailable 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                : 'bg-gradient-to-r from-gray-500 to-gray-600 opacity-50 cursor-not-allowed'
            }`}
            onClick={() => productDetails.buyNowAvailable && window.open(productDetails.url, '_blank')}
            disabled={!productDetails.buyNowAvailable}
          >
            <FaShoppingCart />
            <span>Buy Now</span>
          </motion.button>

          {/* Notify When Available Button - Always shown */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || notificationSet}
            className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNotifyWhenAvailable}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : notificationSet ? (
              <FaCheck />
            ) : (
              <FaBell />
            )}
            <span>
              {notificationSet ? 'Notification Set!' : 'Notify When Available'}
            </span>
          </motion.button>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default ProductDetails; 