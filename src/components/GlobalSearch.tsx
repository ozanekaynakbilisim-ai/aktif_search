import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { loadPSE, execute } from '../lib/pse';
import { useAdminStore } from '../lib/adminStore';

interface GlobalSearchProps {
  onClose?: () => void;
  isModal?: boolean;
}

export default function GlobalSearch({ onClose, isModal = false }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const settings = useAdminStore(state => state.settings);
  
  const getCxId = () => {
    if (settings.cxId && settings.cxId.trim()) return settings.cxId;
    if (import.meta.env.VITE_GOOGLE_CX) return import.meta.env.VITE_GOOGLE_CX;
    return '7301314c507bb45cf';
  };
  
  const cxId = getCxId();

  const handleSearch = async () => {
    if (!query.trim() || !cxId) return;
    
    setLoading(true);
    setShowResults(true);
    
    try {
      await loadPSE(cxId);
      setTimeout(() => {
        execute(query, 'global-search-results');
      }, 200);
      setLoading(false);
    } catch (error) {
      console.error('Global search error:', error);
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const SearchContent = () => (
    <div className="w-full">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Search financial topics..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoFocus={isModal}
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <Search className="h-4 w-4" />
          )}
        </button>
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="px-3 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showResults && (
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="font-semibold text-gray-900 mb-3">Search Results</h3>
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          )}
          <div id="global-search-results" className="gcse-searchresults-only min-h-[300px]" data-queryParameterName="q" data-linkTarget="_parent" data-newWindow="false"></div>
        </div>
      )}
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20 px-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
          <SearchContent />
        </div>
      </div>
    );
  }

  return <SearchContent />;
}