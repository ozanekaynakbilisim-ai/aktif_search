import React, { useState, useEffect } from 'react';
import { Info, ExternalLink } from 'lucide-react';
import { getInfoBoxContent } from '../lib/aiInfobox';
import { useAdminStore } from '../lib/adminStore';

interface AIInfoBoxProps {
  topic: string;
  className?: string;
}

export default function AIInfoBox({ topic, className = '' }: AIInfoBoxProps) {
  const [content, setContent] = useState<{ text: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const settings = useAdminStore(state => state.settings);
  const { aiProvider, aiMaxWords, aiApiKey, aiBaseUrl, aiModel } = settings;

  // Don't render if AI is disabled
  if (!settings.aiEnabled) return null;

  useEffect(() => {
    async function fetchContent() {
      if (!topic) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const result = await getInfoBoxContent(topic, aiProvider, {
          maxWords: aiMaxWords,
          apiKey: aiApiKey,
          baseUrl: aiBaseUrl,
          model: aiModel
        });
        
        setContent(result);
      } catch (err) {
        setError(null); // Don't show error, just show fallback content
        console.error('AI InfoBox error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [topic, aiProvider, aiMaxWords, aiApiKey, aiBaseUrl, aiModel]);

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="flex items-center mb-4">
            <div className="h-6 w-6 bg-gray-300 rounded mr-2"></div>
            <div className="h-4 bg-gray-300 rounded w-24"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  // Always show content, even if API fails - provide fallback info
  const displayContent = content || {
    text: `${topic} is an important financial topic. Understanding the basics, comparing options, and making informed decisions are key to financial success. Consider consulting with financial professionals for personalized advice.`
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Quick Info</h3>
        </div>
        <span className="text-xs text-gray-500 capitalize">
          {content ? `via ${aiProvider}` : 'general info'}
        </span>
      </div>
      
      {displayContent.image && (
        <img 
          src={displayContent.image} 
          alt={topic}
          className="w-full h-32 object-cover rounded-lg mb-4"
        />
      )}
      
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        {displayContent.text}
      </p>
      
      {aiProvider === 'wikipedia' && content && (
        <a
          href={`https://en.wikipedia.org/wiki/${topic.replace(/\s+/g, '_')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
        >
          Read more on Wikipedia
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      )}
    </div>
  );
}