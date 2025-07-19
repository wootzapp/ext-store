import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaShoppingCart, FaSearch, FaHeart, FaStar } from 'react-icons/fa';
import ProductDetails from './ProductDetails.jsx';
import CartManager from './CartManager.jsx';

const LabubuSearch = ({ onBack, userProfile, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(new Set());
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showCartManager, setShowCartManager] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const resultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100
      }
    }),
    exit: { opacity: 0, y: -20 }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');
    setSearchResults([]);
    setHasSearched(true); // Mark that user has searched
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SEARCH_LABUBU',
        query: searchQuery
      });
      
      if (response.success) {
        setSearchResults(response.results || []);
      } else {
        setError(response.error || 'No results found');
      }
    } catch (error) {
      setError('Failed to search for products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleAddToCart = async (product) => {
    // Set loading state for this specific product
    setLoadingProducts(prev => new Set(prev).add(product.id));
    setError('');
    
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'OPEN_PRODUCT_DETAILS',
        url: product.url,
        price: product.price
      });
      
      if (response.success) {
        // Check the actual addedToCart value from the response
        if (response.addedToCart === true) {
          setToast({
            show: true,
            message: '🎉 Successfully added to cart!',
            type: 'success'
          });
        } else {
          setToast({
            show: true,
            message: '⏰ Added to waitlist - will automatically add to cart when available!',
            type: 'info'
          });
        }
        
        // Redirect to product details
        setSelectedProduct(product);
        setProductDetails(response.productDetails);
      } else {
        setToast({
          show: true,
          message: response.error || 'Failed to add item to cart',
          type: 'error'
        });
      }
    } catch (error) {
      setToast({
        show: true,
        message: '❌ Failed to add item to cart',
        type: 'error'
      });
    } finally {
      // Clear loading state for this specific product
      setLoadingProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
      
      // Auto-hide toast after 4 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 4000);
    }
  };

  const handleBackToSearch = () => {
    setSelectedProduct(null);
    setProductDetails(null);
    setError('');
  };

  const handleBackFromCartManager = () => {
    setShowCartManager(false);
  };

  if (showCartManager) {
    return (
      <CartManager
        onBack={handleBackFromCartManager}
      />
    );
  }

  if (selectedProduct && productDetails) {
    return (
      <ProductDetails
        productDetails={productDetails}
        onBack={handleBackToSearch}
        toastInfo={toast}
      />
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
      <div className="flex flex-col items-center w-full max-w-2xl mx-auto mt-4 mb-8 relative z-10">
        {/* Top navigation */}
        <div className="flex items-center justify-between w-full mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl">
              <span className="text-2xl">🎀</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Labubu</h1>
              <p className="text-sm text-purple-300">Popmart Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
              onClick={() => setShowCartManager(true)}
              aria-label="Cart Manager"
            >
              <FaShoppingCart className="w-5 h-5 text-white" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-200 shadow-lg"
              onClick={() => setShowSettings(true)}
              aria-label="Settings"
            >
              <FaCog className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>

        {/* Search section */}
        <div className="w-full max-w-lg">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="w-5 h-5 text-purple-300" />
            </div>
            <input
              type="text"
              placeholder="Search for Labubu treasures..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full pl-12 pr-24 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent text-white placeholder-purple-300 font-medium shadow-xl transition-all duration-200"
            />
            <motion.button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Search'
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Results section */}
      <div className="w-full max-w-4xl mx-auto space-y-6 relative z-10">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center p-4 bg-red-500/20 backdrop-blur-md border border-red-400/30 rounded-2xl text-red-200 font-medium shadow-lg"
          >
            {error}
          </motion.div>
        )}

        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Found {searchResults.length} treasures for "{searchQuery}"
              </h2>
              <div className="flex items-center space-x-2 text-purple-300">
                <FaStar className="w-4 h-4" />
                <span className="text-sm">Premium Results</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result, i) => (
                <motion.div
                  key={result.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={resultVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 shadow-xl hover:shadow-2xl"
                >
                  {/* Product Image */}
                  <div className="relative mb-4">
                    {result.image ? (
                      <img
                        src={result.image}
                        alt={result.name}
                        className="w-full h-48 object-cover rounded-xl border border-white/20 shadow-lg group-hover:border-pink-400/50 transition-all duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-full h-48 bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/20 rounded-xl flex items-center justify-center hidden"
                      style={{ display: result.image ? 'none' : 'flex' }}
                    >
                      <span className="text-4xl">🦊</span>
                    </div>
                    
                  </div>

                  {/* Product Info */}
                  <div className="space-y-3">
                    <h3 className="font-bold text-white text-lg leading-tight line-clamp-2">
                      {result.name}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-pink-400">
                          {result.price}
                        </span>
                        <span className="text-sm text-purple-300">USD</span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAddToCart(result)}
                      disabled={loadingProducts.has(result.id)}
                      className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {loadingProducts.has(result.id) ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state - only show if user has actually searched */}
        {!isLoading && hasSearched && searchResults.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No treasures found</h3>
            <p className="text-purple-300">Try searching with different keywords</p>
          </motion.div>
        )}

        {/* Initial state - show when no search has been performed */}
        {!hasSearched && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">🦊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to discover Labubu treasures?</h3>
            <p className="text-purple-300">Search for your favorite Popmart collectibles</p>
          </motion.div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSettings(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl w-96 max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center">
              {userProfile?.avatar && (
                <img 
                  src={userProfile.avatar} 
                  alt="User Avatar" 
                  className="w-20 h-20 rounded-full mb-4 border-4 border-pink-300 shadow-lg"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <h3 className="text-2xl font-bold text-gray-800 mb-1">{userProfile?.username || 'Labubu User'}</h3>
              <p className="text-gray-600 mb-6">Welcome back! 👋</p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-purple-600 transition-all"
                onClick={() => {
                  setShowSettings(false);
                  onLogout();
                }}
              >
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}


    </motion.div>
  );
};

export default LabubuSearch; 