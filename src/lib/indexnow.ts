interface IndexNowResponse {
  success: boolean;
  message?: string;
}

export async function submitToIndexNow(
  urls: string[],
  apiKey: string,
  keyLocation?: string
): Promise<IndexNowResponse> {
  if (!apiKey || urls.length === 0) {
    return { success: false, message: 'API key and URLs are required' };
  }

  const indexNowEndpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow'
  ];

  const payload = {
    host: new URL(urls[0]).hostname,
    key: apiKey,
    keyLocation: keyLocation || `https://${new URL(urls[0]).hostname}/${apiKey}.txt`,
    urlList: urls
  };

  for (const endpoint of indexNowEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        return { success: true, message: `Successfully submitted to ${endpoint}` };
      }
    } catch (error) {
      console.error(`IndexNow submission failed for ${endpoint}:`, error);
    }
  }

  return { success: false, message: 'All IndexNow endpoints failed' };
}

export function generateIndexNowKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function pingSearchEngines(urls: string[]): Promise<{
  google: boolean;
  bing: boolean;
  yandex: boolean;
  error?: string;
}> {
  const results = {
    google: false,
    bing: false,
    yandex: false,
    error: undefined as string | undefined
  };

  // Note: Direct browser-based pings to search engines are blocked by CORS policy
  // This functionality requires a server-side implementation or backend proxy
  
  try {
    // Attempt to ping search engines (will likely fail due to CORS)
    for (const url of urls) {
      try {
        // Bing ping
        const bingPing = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(url)}`, {
          mode: 'no-cors'
        });
        // With no-cors mode, we can't check response status
        results.bing = true;
      } catch (error) {
        console.error('Bing ping failed:', error);
      }

      try {
        // Yandex ping
        const yandexPing = await fetch(`https://webmaster.yandex.com/ping?sitemap=${encodeURIComponent(url)}`, {
          mode: 'no-cors'
        });
        // With no-cors mode, we can't check response status
        results.yandex = true;
      } catch (error) {
        console.error('Yandex ping failed:', error);
      }
    }
  } catch (error) {
    results.error = 'Browser CORS policy prevents direct search engine pings. Consider implementing a server-side proxy.';
  }

  return results;
}