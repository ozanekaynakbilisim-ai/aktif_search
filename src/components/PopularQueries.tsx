import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { loadPSE, execute } from '../lib/pse';
import { useAdminStore } from '../lib/adminStore';

interface PopularQueriesProps {
  queries: string[];
  containerId: string;
}

export default function PopularQueries({ queries, containerId }: PopularQueriesProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const settings = useAdminStore(state => state.settings);
  
  // Priority: Admin CX > Env CX > Demo CX
  const getCxId = () => {
    if (settings.cxId && settings.cxId.trim()) return settings.cxId;
    if (import.meta.env.VITE_GOOGLE_CX) return import.meta.env.VITE_GOOGLE_CX;
    return '7301314c507bb45cf'; // Demo fallback
  };
  
  const cxId = getCxId();

  const handleQueryClick = async (query: string) => {
    if (!cxId || loading) return;
    
    setLoading(query);
    setShowResults(true);
    
    try {
      await loadPSE(cxId);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        execute(query, containerId);
      }, 200);
      
      setLoading(null);
    } catch (error) {
      console.error('Query search error:', error);
      alert('Search failed. Please check your internet connection and try again.');
      setLoading(null);
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Searches</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {queries.map((query, index) => (
          <button
            key={index}
            onClick={() => handleQueryClick(query)}
            disabled={loading === query || !cxId}
            className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all disabled:bg-gray-50 disabled:cursor-not-allowed group"
          >
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
              {query}
            </span>
            {loading === query ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <Search className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            )}
          </button>
        ))}
      </div>

      {showResults && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-2">Search Results</h4>
            <p className="text-sm text-gray-600">Powered by Google appears in results</p>
          </div>
          
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          <div id={containerId} className="gcse-searchresults-only min-h-[300px]" data-queryParameterName="q" data-linkTarget="_parent" data-newWindow="false"></div>
        </div>
      )}
    </div>
  );
}