import React, { useState, useEffect } from 'react';
import { Play, Clock, Eye } from 'lucide-react';
import { fetchYouTubeVideos, formatYouTubeDate, formatViewCount } from '../lib/youtubeApi';
import { useAdminStore } from '../lib/adminStore';

interface YouTubeVideosProps {
  topic: string;
  maxResults?: number;
  className?: string;
  title?: string;
}

export default function YouTubeVideos({ 
  topic, 
  maxResults = 6, 
  className = '',
  title = 'Related Videos'
}: YouTubeVideosProps) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const settings = useAdminStore(state => state.settings);

  useEffect(() => {
    async function loadVideos() {
      if (!settings.youtubeApiEnabled || !settings.youtubeApiKey || !topic) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedVideos = await fetchYouTubeVideos(topic, settings.youtubeApiKey, maxResults);
        setVideos(fetchedVideos);
      } catch (err) {
        setError('Failed to load videos');
        console.error('YouTube videos error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
  }, [topic, settings.youtubeApiKey, settings.youtubeApiEnabled, maxResults]);

  if (!settings.youtubeApiEnabled || !settings.youtubeApiKey) return null;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-300 rounded-lg h-32 mb-3"></div>
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || videos.length === 0) return null;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <Play className="h-5 w-5 text-red-600" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <a
            key={video.id}
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                <Play className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="p-3">
              <h4 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-red-600 transition-colors">
                {video.title}
              </h4>
              <p className="text-xs text-gray-600 mt-1">{video.channelTitle}</p>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatYouTubeDate(video.publishedAt)}
                </span>
                {video.viewCount && (
                  <span className="flex items-center">
                    <Eye className="h-3 w-3 mr-1" />
                    {formatViewCount(video.viewCount)}
                  </span>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}