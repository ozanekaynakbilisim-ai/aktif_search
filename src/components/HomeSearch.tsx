import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { loadPSE, execute } from '../lib/pse';
import { useAdminStore } from '../lib/adminStore';

export default function HomeSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const settings = useAdminStore(state => state.settings);
  
  // Priority: Admin CX > Env CX > Demo CX
  const getCxId = () => {
    if (settings.cxId && settings.cxId.trim()) return settings.cxId;
    if (import.meta.env.VITE_GOOGLE_CX) return import.meta.env.VITE_GOOGLE_CX;
    return '7301314c507bb45cf'; // Demo fallback
  };
  
  const cxId = getCxId();

  const handleSearch = async () => {
    if (!query.trim() || !cxId) return;
    
    setLoading(true);
    setShowResults(true);
    
    try {
      await loadPSE(cxId);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        execute(query, 'home-results');
      }, 200);
      
      setLoading(false);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please check your internet connection and try again.');
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Search Box */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Search Financial Information
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for credit cards, loans, banks, and more..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || !cxId || loading}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px] transition-colors"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Search className="h-5 w-5 mr-2" />
                Search
              </>
            )}
          </button>
        </div>
        
        {!cxId && (
          <p className="text-sm text-red-600 mt-2">
            Search is not configured. Please set up Google CSE in admin settings.
          </p>
        )}
      </div>

      {/* Results Container */}
      {showResults && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Results</h3>
            <p className="text-sm text-gray-600">Powered by Google appears in results</p>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          <div id="home-results" className="gcse-searchresults-only min-h-[200px]" data-queryParameterName="q" data-linkTarget="_parent" data-newWindow="false"></div>
        </div>
      )}
    </div>
  );
}