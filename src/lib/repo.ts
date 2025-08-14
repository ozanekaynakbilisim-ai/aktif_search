export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  hero_image: string;
  is_high_cpc: boolean;
  popular_queries: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  hero_image: string;
  content: string;
  author: string;
  publish_date: string;
  status: 'draft' | 'published';
  category_id: string;
  word_count: number;
  disable_ads: boolean;
  cse_keyword?: string;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  category_slug?: string;
}

export interface ReferenceSite {
  id: string;
  name: string;
  url: string;
  category: string;
  notes: string;
  created_at?: string;
  updated_at?: string;
}

// MySQL Repository Classes
class MySQLRepository<T extends { id: string }> {
  constructor(private endpoint: string) {}

  async getAll(): Promise<T[]> {
    try {
      return await apiClient.request(`/${this.endpoint}/`);
    } catch (error) {
      console.error(`Error fetching ${this.endpoint}:`, error);
      return [];
    }
  }

  async getById(id: string): Promise<T | undefined> {
    try {
      return await apiClient.request(`/${this.endpoint}/?id=${id}`);
    } catch (error) {
      console.error(`Error fetching ${this.endpoint} by ID:`, error);
      return undefined;
    }
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    return await apiClient.request(`/${this.endpoint}/`, {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    try {
      await apiClient.request(`/${this.endpoint}/?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return await this.getById(id) || null;
    } catch (error) {
      console.error(`Error updating ${this.endpoint}:`, error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await apiClient.request(`/${this.endpoint}/?id=${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.endpoint}:`, error);
      return false;
    }
  }
}

// Specialized Category Repository
class CategoryRepository extends MySQLRepository<Category> {
  constructor() {
    super('categories');
  }

  async getBySlug(slug: string): Promise<Category | undefined> {
    try {
      return await apiClient.getCategoryBySlug(slug);
    } catch (error) {
      console.error('Error fetching category by slug:', error);
      return undefined;
    }
  }
}

// Specialized Article Repository
class ArticleRepository extends MySQLRepository<Article> {
  constructor() {
    super('articles');
  }

  async getBySlug(slug: string): Promise<Article | undefined> {
    try {
      return await apiClient.getArticleBySlug(slug);
    } catch (error) {
      console.error('Error fetching article by slug:', error);
      return undefined;
    }
  }

  async getByCategory(categoryId: string, limit: number = 20): Promise<Article[]> {
    try {
      return await apiClient.getArticlesByCategory(categoryId, limit);
    } catch (error) {
      console.error('Error fetching articles by category:', error);
      return [];
    }
  }

  async getPublished(limit: number = 50): Promise<Article[]> {
    try {
      return await apiClient.getArticles({ status: 'published', limit });
    } catch (error) {
      console.error('Error fetching published articles:', error);
      return [];
    }
  }
}

// Repository instances
export const categoryRepo = new CategoryRepository();
export const articleRepo = new ArticleRepository();
export const referenceSiteRepo = new MySQLRepository<ReferenceSite>('reference-sites');

// Helper function to get site articles for CSE integration
export async function getArticlesForCSE(): Promise<Array<{
  title: string;
  url: string;
  description: string;
  category: string;
}>> {
  try {
    const [articles, categories] = await Promise.all([
      articleRepo.getPublished(),
      categoryRepo.getAll()
    ]);
    
    return articles.map(article => {
      const category = categories.find(c => c.id === article.category_id);
      return {
        title: article.title,
        url: `/article/${article.slug}`,
        description: article.excerpt,
        category: category?.name || 'General'
      };
    });
  } catch (error) {
    console.error('Error getting articles for CSE:', error);
    return [];
  }
}