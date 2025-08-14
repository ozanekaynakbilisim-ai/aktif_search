interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ContentGenerationOptions {
  title: string;
  category: string;
  tone: string;
  minWords: number;
  includeFaq: boolean;
  systemPrompt: string;
  apiKey: string;
  baseUrl: string;
  model: string;
}

export async function generateArticleContent(options: ContentGenerationOptions): Promise<{
  content: string;
  wordCount: number;
  excerpt: string;
  optimizedTitle: string;
} | null> {
  const {
    title,
    category,
    tone,
    minWords,
    includeFaq,
    systemPrompt,
    apiKey,
    baseUrl,
    model
  } = options;

  if (!apiKey || !title) {
    throw new Error('API key and title are required');
  }

  const faqSection = includeFaq ? '\n\nInclude a comprehensive FAQ section at the end with 5-7 relevant questions and detailed answers.' : '';
  
  const titlePrompt = `Create an SEO-optimized, click-attractive title for the keyword "${title}" in the ${category} category.

Requirements for title:
- Make it engaging and click-worthy
- Include the main keyword naturally
- Target US audience interested in personal finance
- Use only letters, numbers, spaces, and basic punctuation (no quotes, special characters)
- Keep it clean and professional
- Examples: "The Ultimate Guide to Credit Cards: How to Make Informed Financial Decisions" or "Personal Loans 2025: Complete Guide to Finding the Best Rates"

Return ONLY the optimized title, nothing else.`;

  const contentPrompt = `Write a comprehensive, SEO-optimized article about "${title}" in the ${category} category. 

Requirements:
- Tone: ${tone}
- Minimum ${minWords} words (aim for 1000+ for high-value topics)
- Use proper HTML formatting with semantic tags
- Structure: <h2> for main sections, <h3> for subsections, <p> for paragraphs
- DO NOT use markdown formatting (**bold**, ##headings, etc.)
- DO NOT include CSS classes in HTML tags
- DO NOT use ### or ** or any markdown symbols
- DO NOT include document structure tags (<!DOCTYPE>, <html>, <head>, <body>)
- Return ONLY the article content, not a full HTML document
- Structure: Introduction (1-2 paragraphs) → Main sections with subheadings → Conclusion
- Write for a US audience interested in personal finance
- Include practical tips, specific examples, and real-world scenarios
- Natural keyword integration (avoid keyword stuffing)
- Make it engaging for both beginners and experienced readers
- DO NOT repeat the title in the content - it will be displayed separately
- Use proper paragraph spacing with <p> tags
- Ensure clean, readable formatting without CSS classes
- End with an FAQ section using <h2>Frequently Asked Questions</h2> followed by <h3> for questions and <p> for answers

Focus on providing genuine value and expert insights. Use only content-level HTML tags, no document structure.

Example structure:
<h2>Understanding the Basics</h2>
<p>Content here...</p>
<h2>Key Considerations</h2>
<p>Content here...</p>
<h3>Important Factors</h3>
<p>Content here...</p>
<h2>Frequently Asked Questions</h2>
<h3>Question 1?</h3>
<p>Answer here...</p>`;

  try {
    // First, generate optimized title
    const titleResponse = await fetch(`${baseUrl}/chat/completions`, {
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
            content: 'You are an expert SEO copywriter specializing in financial content. Create compelling, click-worthy titles.'
          },
          {
            role: 'user',
            content: titlePrompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7
      })
    });

    if (!titleResponse.ok) {
      if (titleResponse.status === 401) {
        throw new Error('Invalid API key. Please check your ChatGPT API key in Settings.');
      } else if (titleResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (titleResponse.status === 403) {
        throw new Error('Access denied. Please check your API key permissions.');
      } else {
        const errorData = await titleResponse.json().catch(() => ({}));
        throw new Error(`Title generation failed: ${titleResponse.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const titleData: ChatGPTResponse = await titleResponse.json();
    let optimizedTitle = titleData.choices[0]?.message?.content?.trim() || title;
    
    // Clean title: remove quotes and special characters
    optimizedTitle = optimizedTitle
      .replace(/["""''`]/g, '') // Remove all types of quotes
      .replace(/[^\w\s\-:.]/g, '') // Keep only letters, numbers, spaces, hyphens, colons, periods
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();

    // Then generate content
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
            content: 'You are a senior SEO finance writer specializing in US personal finance content. Write comprehensive, well-structured articles using proper HTML formatting.'
          },
          {
            role: 'user',
            content: contentPrompt
          }
        ],
        max_tokens: Math.ceil(minWords * 2), // Allow for longer responses
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key. Please check your ChatGPT API key in Settings.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else if (response.status === 403) {
        throw new Error('Access denied. Please check your API key permissions.');
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }
    }

    const data: ChatGPTResponse = await response.json();
    let content = data.choices[0]?.message?.content || '';
    
    if (!content) {
      throw new Error('No content generated');
    }

    // Clean up the content - remove document structure tags
    content = content
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<\/?html[^>]*>/gi, '')
      .replace(/<\/?head[^>]*>/gi, '')
      .replace(/<\/?body[^>]*>/gi, '')
      .replace(/<title[^>]*>.*?<\/title>/gi, '')
      .replace(/<meta[^>]*>/gi, '')
      .replace(/class="[^"]*"/gi, '') // Remove all CSS classes
      .replace(/###\s*/g, '') // Remove ### markdown headers
      .replace(/##\s*/g, '') // Remove ## markdown headers
      .replace(/#\s*/g, '') // Remove # markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Convert **bold** to <strong>
      .replace(/\*([^*]+)\*/g, '<em>$1</em>') // Convert *italic* to <em>
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    // Remove any duplicate titles at the beginning
    content = content.replace(/^<h1[^>]*>.*?<\/h1>\s*/i, ''); // Remove h1 titles
    
    // Remove title repetition at the start of content
    const titleWords = optimizedTitle.toLowerCase().split(' ').slice(0, 3).join('|');
    const titleRegex = new RegExp(`^<[^>]+>[^<]*(?:${titleWords})[^<]*<\/[^>]+>\\s*`, 'i');
    content = content.replace(titleRegex, '');

    // Calculate word count
    const textContent = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(/\s+/).length;
    
    // Generate excerpt from first paragraph
    const firstPMatch = content.match(/<p[^>]*>(.*?)<\/p>/i);
    const firstParagraphText = firstPMatch ? firstPMatch[1] : textContent.substring(0, 200);
    const excerpt = firstParagraphText.length > 160 
      ? firstParagraphText.substring(0, 157) + '...'
      : firstParagraphText;

    return {
      content: content.trim(),
      wordCount,
      excerpt: excerpt.replace(/<[^>]*>/g, '').trim(), // Remove HTML tags from excerpt
      optimizedTitle: optimizedTitle
    };

  } catch (error: any) {
    if (error.message?.includes('does not exist') || error.message?.includes('not found')) {
      throw new Error(`Model access error: The model "${options.model}" is not available. Try "gpt-3.5-turbo" or check your API key permissions.`);
    }
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

export function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith('sk-') && apiKey.length > 20;
}

export function estimateTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(text.length / 4);
}

export function estimateCost(tokens: number, model: string): number {
  // Rough cost estimates (as of 2024)
  const costs = {
    'gpt-4': 0.03 / 1000, // $0.03 per 1K tokens
    'gpt-4-turbo': 0.01 / 1000, // $0.01 per 1K tokens
    'gpt-3.5-turbo': 0.002 / 1000 // $0.002 per 1K tokens
  };
  
  return tokens * (costs[model as keyof typeof costs] || costs['gpt-3.5-turbo']);
}