import React, { useState, useEffect } from 'react';
import { ExternalLink, Clock, Newspaper } from 'lucide-react';
import { fetchFinanceNews, fetchTopicNews, formatNewsDate } from '../lib/newsApi';
import { useAdminStore } from '../lib/adminStore';

interface NewsSectionProps {
  topic?: string;
  maxResults?: number;
  className?: string;
  title?: string;
  showImages?: boolean;
}

export default function NewsSection({ 
  topic,
  maxResults = 2, 
  className = '',
  title,
  showImages = true
}: NewsSectionProps) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);
  
  const settings = useAdminStore(state => state.settings);

  useEffect(() => {
    async function loadNews() {
      if (!settings.newsApiEnabled || !settings.newsApiKey || settings.newsApiKey.trim() === '') {
        setShowApiKeyWarning(true);
        setLoading(false);
        return;
      }

      setShowApiKeyWarning(false);
      setLoading(true);
      setError(null);
      
      try {
        let fetchedArticles;
        if (topic) {
          fetchedArticles = await fetchTopicNews(topic, settings.newsApiKey, maxResults);
        } else {
          fetchedArticles = await fetchFinanceNews(settings.newsApiKey, 'business', maxResults);
        }
        
        setArticles(fetchedArticles || []);
        
        // Don't show error for empty results, just show empty state
        if (!fetchedArticles || fetchedArticles.length === 0) {
          // Silently handle empty results
        }
      } catch (err) {
        // Don't show error to user, just log it
        console.error('News fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadNews();
  }, [topic, settings.newsApiKey, settings.newsApiEnabled, maxResults]);

  if (showApiKeyWarning || !settings.newsApiEnabled) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <Newspaper className="h-5 w-5 text-yellow-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              {!settings.newsApiEnabled ? 'NewsAPI Disabled' : 'NewsAPI Configuration Required'}
            </h3>
            <p className="text-xs text-yellow-700 mt-1">
              {!settings.newsApiEnabled 
                ? 'Enable NewsAPI in Admin Settings → External APIs to display news articles.'
                : 'Add your NewsAPI.org key in Admin Settings → External APIs to display news articles.'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sectionTitle = title || (topic ? `Latest ${topic} News` : 'Latest Financial News');

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{sectionTitle}</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex space-x-4">
              {showImages && <div className="bg-gray-300 rounded-lg w-20 h-16 flex-shrink-0"></div>}
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-2/3 mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center">
          <Newspaper className="h-5 w-5 text-red-600 mr-2" />
          <div>
            <h3 className="text-sm font-medium text-red-800">News Loading Error</h3>
            <p className="text-xs text-red-700 mt-1">{error}</p>
            <p className="text-xs text-red-600 mt-1">
              Check console for detailed error information
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{sectionTitle}</h3>
        <Newspaper className="h-5 w-5 text-blue-600" />
      </div>
      
      <div className="space-y-4">
        {articles.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block hover:bg-gray-50 rounded-lg p-3 -m-3 transition-colors"
          >
            <div className="flex space-x-4">
              {showImages && article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              )}
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                  {article.description}
                </p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{article.source.name}</span>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatNewsDate(article.publishedAt)}
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </div>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}