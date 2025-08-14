import { generateArticleContent } from './contentGen';
import { articleRepo, categoryRepo } from './repo';
import { submitToIndexNow } from './indexnow';
import { useAdminStore } from './adminStore';

export interface KeywordBatch {
  id: string;
  keywords: string[];
  categoryId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedCount: number;
  totalCount: number;
}

export interface AutomationSettings {
  enabled: boolean;
  dailyLimit: number;
  hourlyLimit: number;
  autoIndexNow: boolean;
  autoSocialShare: boolean;
}

class ContentAutomationManager {
  private batches: KeywordBatch[] = [];
  private processing = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    this.loadBatches();
  }

  private loadBatches(): void {
    const stored = localStorage.getItem('content-batches');
    if (stored) {
      this.batches = JSON.parse(stored);
    }
  }

  private saveBatches(): void {
    localStorage.setItem('content-batches', JSON.stringify(this.batches));
  }

  addKeywordBatch(keywords: string[], categoryId: string): string {
    const batch: KeywordBatch = {
      id: Date.now().toString(),
      keywords: keywords.filter(k => k.trim()),
      categoryId,
      status: 'pending',
      createdAt: new Date().toISOString(),
      processedCount: 0,
      totalCount: keywords.length
    };

    this.batches.push(batch);
    this.saveBatches();
    return batch.id;
  }

  async startAutomation(settings: AutomationSettings): Promise<void> {
    if (this.processing) return;

    const adminSettings = useAdminStore.getState().settings;

    this.processing = true;
    
    // Eğer limit yoksa veya 0 ise, tüm keyword'leri hemen işle
    if (!settings.hourlyLimit || settings.hourlyLimit === 0) {
      await this.processAllKeywords(settings);
    } else {
      const hourlyLimit = Math.min(settings.hourlyLimit, settings.dailyLimit / 24);

      this.intervalId = setInterval(async () => {
        await this.processNextKeywords(hourlyLimit, settings);
      }, 60 * 60 * 1000); // Every hour

      // Process immediately
      await this.processNextKeywords(hourlyLimit, settings);
    }
  }

  private async processAllKeywords(settings: AutomationSettings): Promise<void> {
    const pendingBatch = this.batches.find(b => b.status === 'pending' || b.status === 'processing');
    if (!pendingBatch) return;

    pendingBatch.status = 'processing';
    this.saveBatches();

    const adminSettings = useAdminStore.getState().settings;
    const category = categoryRepo.getById(pendingBatch.categoryId);
    if (!category) return;

    // API key kontrolü
    if (!adminSettings.chatgptApiKey || adminSettings.chatgptApiKey.trim() === '') {
      console.error('ChatGPT API key is missing!');
      pendingBatch.status = 'failed';
      this.processing = false;
      this.saveBatches();
      return;
    }

    // Tüm keyword'leri işle
    for (const keyword of pendingBatch.keywords) {
      try {
        const result = await generateArticleContent({
          title: keyword,
          category: category.name,
          tone: adminSettings.chatgptTone,
          minWords: adminSettings.chatgptMinWords,
          includeFaq: adminSettings.chatgptIncludeFaq,
          systemPrompt: adminSettings.chatgptSystemPrompt,
          apiKey: adminSettings.chatgptApiKey,
          baseUrl: adminSettings.chatgptBaseUrl,
          model: adminSettings.chatgptModel
        });

        if (result) {
          const article = articleRepo.create({
            title: result.optimizedTitle,
            slug: result.optimizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            excerpt: result.excerpt,
            heroImage: '',
            content: result.content,
            author: 'AI Content Generator',
            publishDate: new Date().toISOString(),
            categoryId: pendingBatch.categoryId,
            status: 'published',
            disableAds: false
          });

          // Auto IndexNow submission
          if (settings.autoIndexNow && adminSettings.indexNowApiKey) {
            const articleUrl = `${adminSettings.canonicalBaseUrl}/article/${article.slug}`;
            await submitToIndexNow([articleUrl], adminSettings.indexNowApiKey);
          }

          pendingBatch.processedCount++;
          this.saveBatches();
        } else {
          pendingBatch.processedCount++;
          this.saveBatches();
        }
      } catch (error) {
        console.error(`Failed to generate content for keyword: ${keyword}`, error);
        // Mark as failed but continue with next keyword
        pendingBatch.processedCount++;
        this.saveBatches();
      }

      // Kısa delay API'yi korumak için
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    pendingBatch.status = 'completed';
    this.processing = false;
    this.saveBatches();
  }
  stopAutomation(): void {
    this.processing = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async processNextKeywords(limit: number, settings: AutomationSettings): Promise<void> {
    const pendingBatch = this.batches.find(b => b.status === 'pending' || b.status === 'processing');
    if (!pendingBatch) return;

    pendingBatch.status = 'processing';
    this.saveBatches();

    const adminSettings = useAdminStore.getState().settings;
    const category = categoryRepo.getById(pendingBatch.categoryId);
    if (!category) return;

    const keywordsToProcess = pendingBatch.keywords.slice(
      pendingBatch.processedCount,
      pendingBatch.processedCount + limit
    );

    console.log('Processing keywords:', keywordsToProcess);
    for (const keyword of keywordsToProcess) {
      try {
        const result = await generateArticleContent({
          title: keyword,
          category: category.name,
          tone: adminSettings.chatgptTone,
          minWords: adminSettings.chatgptMinWords,
          includeFaq: adminSettings.chatgptIncludeFaq,
          systemPrompt: adminSettings.chatgptSystemPrompt,
          apiKey: adminSettings.chatgptApiKey,
          baseUrl: adminSettings.chatgptBaseUrl,
          model: adminSettings.chatgptModel
        });

        if (result) {
          const article = articleRepo.create({
            title: result.optimizedTitle,
            slug: result.optimizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
            excerpt: result.excerpt,
            heroImage: '',
            content: result.content,
            author: 'AI Content Generator',
            publishDate: new Date().toISOString(),
            categoryId: pendingBatch.categoryId,
            status: 'published',
            disableAds: false
          });

          // Auto IndexNow submission
          if (settings.autoIndexNow && adminSettings.indexNowApiKey) {
            const articleUrl = `${adminSettings.canonicalBaseUrl}/article/${article.slug}`;
            await submitToIndexNow([articleUrl], adminSettings.indexNowApiKey);
          }

          pendingBatch.processedCount++;
        }
      } catch (error) {
        console.error(`Failed to generate content for keyword: ${keyword}`, error);
        // Mark as processed even if failed to continue with next keywords
        pendingBatch.processedCount++;
      }

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (pendingBatch.processedCount >= pendingBatch.totalCount) {
      pendingBatch.status = 'completed';
    }

    this.saveBatches();
  }

  getBatches(): KeywordBatch[] {
    return this.batches;
  }

  deleteBatch(id: string): void {
    this.batches = this.batches.filter(b => b.id !== id);
    this.saveBatches();
  }
}

export const contentAutomation = new ContentAutomationManager();