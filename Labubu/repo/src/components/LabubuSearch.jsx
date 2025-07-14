import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCog } from 'react-icons/fa';
import ProductDetails from './ProductDetails.jsx';

const LABUBU_EMOJI = "🦊"; // Placeholder for Labubu mascot

const resultVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

const LabubuSearch = ({ onBack, userProfile, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }
    setIsLoading(true);
    setError('');
    setSearchResults([]);
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SEARCH_LABUBU',
        query: searchQuery.trim()
      });
      if (response.success) {
        setSearchResults(response.results);
      } else {
        setError(response.error || 'Search failed');
      }
    } catch (error) {
      setError('Failed to perform search');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    setIsLoadingProduct(true);
    setError('');
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'OPEN_PRODUCT_DETAILS',
        url: product.url
      });
      
      if (response.success) {
        setProductDetails(response.productDetails);
      } else {
        setError(response.error || 'Failed to load product details');
        setSelectedProduct(null);
      }
    } catch (error) {
      setError('Failed to load product details');
      setSelectedProduct(null);
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const handleBackToSearch = () => {
    setSelectedProduct(null);
    setProductDetails(null);
    setIsLoadingProduct(false);
    setError('');
  };

  const handleNotifyWhenAvailable = async (productDetails) => {
    // This would implement the notification logic
    console.log('Setting notification for:', productDetails.name);
    // You could store this in chrome.storage or send to a backend
  };

  // Show product details if a product is selected
  if (selectedProduct && productDetails) {
    return (
      <ProductDetails
        productDetails={productDetails}
        onBack={handleBackToSearch}
        onNotifyWhenAvailable={handleNotifyWhenAvailable}
      />
    );
  }

  // Show loading state for product details
  if (selectedProduct && isLoadingProduct) {
    return (
      <motion.div
        className="w-full min-h-screen bg-gradient-to-br from-[#1a144b] via-[#3a1c71] to-[#6e1e9c] p-4 sm:p-6 font-labubu flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 120 }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 border-t-2 border-yellow-400 mb-4"></div>
          <p className="text-lg text-white font-semibold">Loading product details...</p>
          <p className="text-sm text-purple-200 mt-2">Please wait while we fetch the product information</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="w-full min-h-screen bg-gradient-to-br from-[#1a144b] via-[#3a1c71] to-[#6e1e9c] p-4 sm:p-6 font-labubu flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 120 }}
    >
      {/* Top mascot and title */}
      <div className="flex flex-col items-center w-full max-w-md mx-auto mt-2 mb-6 relative">
        {/* Settings button */}
        <button
          className="absolute top-0 right-0 mt-2 mr-2 text-white bg-pink-500/70 hover:bg-pink-600/80 rounded-full p-2 shadow"
          onClick={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <FaCog size={20} />
        </button>
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg mb-2 relative">
          <span className="absolute inset-0 rounded-full bg-pink-500/30 blur-2xl animate-pulse"></span>
          <span className="text-3xl text-white relative z-10">🎀</span>
        </div>
        <h2 className="text-2xl font-extrabold text-white mt-2 text-center">Labubu Search</h2>
        <p className="text-base text-purple-200 mt-1 text-center">Find your favorite Popmart treasures!</p>
      </div>
      <div className="w-full max-w-md mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <input
            type="text"
            placeholder="Search for Labubu products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 sm:px-4 sm:py-3 border border-pink-400 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-white/10 text-base sm:text-lg font-labubu shadow text-white placeholder-purple-200"
          />
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={isLoading}
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-2xl font-bold shadow-lg hover:from-pink-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </motion.button>
        </div>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="text-sm sm:text-base text-red-200 bg-red-400/20 p-2 sm:p-3 rounded-xl font-semibold shadow"
          >
            {error}
          </motion.div>
        )}
        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-3 sm:space-y-4"
            >
              <h3 className="text-base sm:text-lg font-bold text-pink-300 mb-1 sm:mb-2 font-labubu">
                Top Results for "{searchQuery}"
              </h3>
              {searchResults.map((result, i) => (
                <motion.div
                  key={result.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={resultVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProductClick(result)}
                  className="border border-pink-400 rounded-2xl p-3 sm:p-4 bg-white/10 hover:bg-pink-400/10 shadow flex items-start space-x-3 sm:space-x-4 transition-colors cursor-pointer"
                >
                  {result.image && (
                    <img
                      src={result.image}
                      alt={result.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-xl border border-pink-200 shadow"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base sm:text-lg font-bold text-white truncate font-labubu">
                      {result.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm sm:text-base text-pink-200 font-semibold">
                        {result.price}
                      </p>
                    </div>
                    <div className="text-xs sm:text-sm text-pink-300 mt-1 font-labubu">
                      Click to view details →
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-lg w-80 relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-pink-500"
              onClick={() => setShowSettings(false)}
            >
              ✕
            </button>
            <div className="flex flex-col items-center">
              {userProfile?.avatar && (
                <img 
                  src={userProfile.avatar} 
                  alt="User Avatar" 
                  className="w-12 h-12 rounded-full mb-3 border-2 border-pink-300"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div className="text-lg font-bold text-pink-600 mb-1">{userProfile?.username || 'Unknown User'}</div>
              <button
                className="mt-4 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow hover:from-pink-600 hover:to-purple-600"
                onClick={() => {
                  setShowSettings(false);
                  onLogout();
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default LabubuSearch; 