import React, { useState } from 'react';

const LabubuSearch = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      console.log('🔴 Search: Empty search query');
      setError('Please enter a search query');
      return;
    }

    console.log('🔴 Search: Starting search for:', searchQuery);
    setIsLoading(true);
    setError('');
    setSearchResults([]);

    try {
      console.log('🔴 Search: Sending SEARCH_LABUBU message to background');
      const response = await chrome.runtime.sendMessage({
        type: 'SEARCH_LABUBU',
        query: searchQuery.trim()
      });

      console.log('🔴 Search: Received response:', response);

      if (response.success) {
        console.log('🔴 Search: Search successful, found', response.results.length, 'results');
        setSearchResults(response.results);
      } else {
        console.log('🔴 Search: Search failed:', response.error);
        setError(response.error || 'Search failed');
      }
    } catch (error) {
      console.error('🔴 Search: Search error:', error);
      setError('Failed to perform search');
    } finally {
      setIsLoading(false);
      console.log('🔴 Search: Search completed');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      console.log('🔴 Search: Enter key pressed, triggering search');
      handleSearch();
    }
  };

  return (
    <div className="p-4 w-80 bg-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">🔍 Labubu Search</h2>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 text-sm"
        >
          ← Back
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Search for Labubu products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">
              Top Results for "{searchQuery}"
            </h3>
            {searchResults.map((result) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start space-x-3">
                  {result.image && (
                    <img 
                      src={result.image} 
                      alt={result.name}
                      className="w-12 h-12 object-cover rounded"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {result.name}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-gray-500">
                        {result.price}
                      </p>
                      {result.availability && (
                        <span className={`text-xs px-2 py-1 rounded ${
                          result.availability.includes('OUT OF STOCK') 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {result.availability}
                        </span>
                      )}
                    </div>
                    <a 
                      href={result.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-block"
                    >
                      View Product →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabubuSearch; 