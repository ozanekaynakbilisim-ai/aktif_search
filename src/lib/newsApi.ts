interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface NewsApiResponse {
  articles: NewsArticle[];
  status: string;
  totalResults: number;
}

// Multiple CORS proxies for better reliability
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
];

export async function fetchFinanceNews(
  apiKey: string,
  category: string = 'business',
  pageSize: number = 3
): Promise<NewsArticle[]> {
  if (!apiKey || apiKey.trim() === '') {
    return [];
  }

  const newsUrl = `https://newsapi.org/v2/top-headlines?category=business&country=us&pageSize=${Math.min(pageSize, 3)}&apiKey=${apiKey}`;
  
  // Try multiple CORS proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(newsUrl)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        continue; // Try next proxy
      }
      
      const data: NewsApiResponse = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        continue; // Try next proxy
      }
      
      const validArticles = data.articles.filter(article => 
        article.title && 
        article.description && 
        !article.title.includes('[Removed]') &&
        article.title !== '[Removed]' &&
        article.description !== '[Removed]'
      );
      
      return validArticles;
      
    } catch (error) {
      // Continue to next proxy
    }
  }
  
  // All proxies failed, try direct request as last resort
  try {
    const response = await fetch(newsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinanceApp/1.0'
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('NewsAPI: Invalid API key (401 Unauthorized)');
      } else if (response.status === 426) {
        console.error('NewsAPI: Upgrade required (426) - Invalid or expired API key');
      } else if (response.status === 429) {
        console.error('NewsAPI: Rate limit exceeded (429)');
      }
      return [];
    }
    
    const data: NewsApiResponse = await response.json();
    
    const validArticles = data.articles.filter(article => 
      article.title && 
      article.description && 
      !article.title.includes('[Removed]') &&
      article.title !== '[Removed]' &&
      article.description !== '[Removed]'
    );
    
    return validArticles;
    
  } catch (error) {
    console.error('NewsAPI: Request failed:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export async function fetchTopicNews(
  query: string,
  apiKey: string,
  pageSize: number = 3
): Promise<NewsArticle[]> {
  if (!apiKey || apiKey.trim() === '' || !query) {
    return [];
  }

  const newsUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&language=en&pageSize=${Math.min(pageSize, 3)}&apiKey=${apiKey}`;
  
  // Try multiple CORS proxies
  for (let i = 0; i < CORS_PROXIES.length; i++) {
    const proxy = CORS_PROXIES[i];
    try {
      const proxyUrl = `${proxy}${encodeURIComponent(newsUrl)}`;
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(30000) // 30 second timeout
      });
      
      if (!response.ok) {
        continue; // Try next proxy
      }
      
      const data: NewsApiResponse = await response.json();
      
      if (!data.articles || data.articles.length === 0) {
        continue; // Try next proxy
      }
      
      const validArticles = data.articles.filter(article => 
        article.title && 
        article.description && 
        !article.title.includes('[Removed]') &&
        article.title !== '[Removed]' &&
        article.description !== '[Removed]'
      );
      
      return validArticles;
      
    } catch (error) {
      // Continue to next proxy
    }
  }
  
  // All proxies failed, try direct request as last resort
  try {
    const response = await fetch(newsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FinanceApp/1.0'
      }
    });
    
    if (!response.ok) {
      return [];
    }
    
    const data: NewsApiResponse = await response.json();
    
    const validArticles = data.articles.filter(article => 
      article.title && 
      article.description && 
      !article.title.includes('[Removed]') &&
      article.title !== '[Removed]'
    );
    
    return validArticles;
    
  } catch (error) {
    console.error('NewsAPI Topic: Request failed:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

export function formatNewsDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}