interface WikipediaResponse {
  title: string;
  extract: string;
  thumbnail?: {
    source: string;
  };
}

interface DuckDuckGoResponse {
  Abstract: string;
  AbstractText: string;
  Image: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function getInfoBoxContent(
  query: string,
  provider: 'wikipedia' | 'duckduckgo' | 'openai',
  options: {
    maxWords?: number;
    apiKey?: string;
    baseUrl?: string;
    model?: string;
  } = {}
): Promise<{ text: string; image?: string } | null> {
  const { maxWords = 80 } = options;

  try {
    switch (provider) {
      case 'wikipedia':
        return await getWikipediaInfo(query, maxWords);
      
      case 'duckduckgo':
        return await getDuckDuckGoInfo(query, maxWords);
      
      case 'openai':
        if (!options.apiKey) {
          throw new Error('OpenAI API key required');
        }
        return await getOpenAIInfo(query, maxWords, options);
      
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching info from ${provider}:`, error);
    return null;
  }
}

async function getWikipediaInfo(query: string, maxWords: number): Promise<{ text: string; image?: string } | null> {
  const title = query.replace(/\s+/g, '_');
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  
  const response = await fetch(url);
  if (!response.ok) return null;
  
  const data: WikipediaResponse = await response.json();
  const text = truncateToWords(data.extract, maxWords);
  
  return {
    text,
    image: data.thumbnail?.source
  };
}

async function getDuckDuckGoInfo(query: string, maxWords: number): Promise<{ text: string; image?: string } | null> {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  
  const response = await fetch(url);
  if (!response.ok) return null;
  
  const data: DuckDuckGoResponse = await response.json();
  const text = truncateToWords(data.AbstractText || data.Abstract, maxWords);
  
  return {
    text,
    image: data.Image
  };
}

async function getOpenAIInfo(
  query: string, 
  maxWords: number, 
  options: { apiKey: string; baseUrl?: string; model?: string }
): Promise<{ text: string } | null> {
  const { apiKey, baseUrl = 'https://api.openai.com/v1', model = 'gpt-3.5-turbo' } = options;
  
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: `Provide a concise, factual summary about the topic in exactly ${maxWords} words or less. Focus on key facts and avoid promotional language.`
        },
        {
          role: 'user',
          content: `Summarize: ${query}`
        }
      ],
      max_tokens: Math.ceil(maxWords * 1.5),
      temperature: 0.3
    })
  });
  
  if (!response.ok) return null;
  
  const data: OpenAIResponse = await response.json();
  const text = data.choices[0]?.message?.content || '';
  
  return { text: truncateToWords(text, maxWords) };
}

function truncateToWords(text: string, maxWords: number): string {
  const words = text.split(' ');
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(' ') + '...';
}