interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount?: string;
  duration?: string;
}

interface YouTubeApiResponse {
  items: Array<{
    id: { videoId: string };
    snippet: {
      title: string;
      description: string;
      thumbnails: {
        medium: { url: string };
        high: { url: string };
      };
      channelTitle: string;
      publishedAt: string;
    };
    statistics?: {
      viewCount: string;
    };
    contentDetails?: {
      duration: string;
    };
  }>;
}

export async function fetchYouTubeVideos(
  query: string,
  apiKey: string,
  maxResults: number = 6
): Promise<YouTubeVideo[]> {
  if (!apiKey || !query) return [];

  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}&order=relevance&safeSearch=strict`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
    
    const data: YouTubeApiResponse = await response.json();
    
    return data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description.substring(0, 150) + '...',
      thumbnail: item.snippet.thumbnails.medium.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount,
      duration: item.contentDetails?.duration
    }));
  } catch (error) {
    console.error('YouTube API fetch error:', error);
    return [];
  }
}

export function formatYouTubeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

export function formatViewCount(viewCount: string): string {
  const count = parseInt(viewCount);
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
  return `${count} views`;
}