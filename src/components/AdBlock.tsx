import React, { useState } from 'react';
import { loadPSE, execute } from '../lib/pse';
import { useAdminStore } from '../lib/adminStore';
import { getAdSize } from '../lib/device';

interface AdBlockProps {
  position: string;
  query?: string;
  containerId?: string;
  article?: any; // Full article object to access cseKeyword
}

export default function AdBlock({ 
  position, 
  query, 
  containerId = 'article-results',
  article
}: AdBlockProps) {
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  
  const settings = useAdminStore(state => state.settings);
  const { adCtaText, adPageLimit } = settings;
  
  // Priority: Admin CX > Env CX > Demo CX
  const getCxId = () => {
    if (settings.cxId && settings.cxId.trim()) return settings.cxId;
    if (import.meta.env.VITE_GOOGLE_CX) return import.meta.env.VITE_GOOGLE_CX;
    return '7301314c507bb45cf'; // Demo fallback
  };
  
  const cxId = getCxId();
  
  // Use custom CSE keyword if available, otherwise use query or article title
  const searchQuery = query || (article?.cseKeyword) || (article?.title) || '';
  const adSize = getAdSize(position);
  const canClick = clickCount < adPageLimit;

  const handleClick = async () => {
    if (!canClick || !searchQuery || !cxId || loading) return;
    
    setLoading(true);
    setClickCount(prev => prev + 1);
    setClicked(true);
    
    try {
      await loadPSE(cxId);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        execute(searchQuery, containerId);
      }, 200);
      
      setLoading(false);
    } catch (error) {
      console.error('Ad block search error:', error);
      alert('Search failed. Please check your internet connection and try again.');
      setLoading(false);
    }
  };

  if (!canClick && clickCount >= adPageLimit) {
    return (
      <div className="my-8 p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-sm text-gray-600">
          Rate limit reached for this page. Please refresh to search again.
        </p>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div 
        className={`bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6 text-center ${
          adSize.includes('320') ? 'min-h-[120px]' : 'min-h-[150px]'
        }`}
      >
        {!clicked ? (
          <div className="flex flex-col items-center justify-center h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Related Financial Information
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Find relevant financial products and advice
            </p>
            <button
              onClick={handleClick}
              disabled={loading || !searchQuery || !cxId}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </div>
              ) : (
                adCtaText
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Sponsored results are shown within this page
            </p>
          </div>
        ) : (
          <>
            {loading && (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            <div id={containerId} className="gcse-searchresults-only min-h-[200px]" data-queryParameterName="q" data-linkTarget="_parent" data-newWindow="false"></div>
          </>
        )}
      </div>
    </div>
  );
}