// API Client for PHP Backend
const API_BASE_URL = '/api';

class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(): Promise<any[]> {
    return this.request('/categories/');
  }

  async getCategory(id: string): Promise<any> {
    return this.request(`/categories/?id=${id}`);
  }

  async getCategoryBySlug(slug: string): Promise<any> {
    return this.request(`/categories/?slug=${slug}`);
  }

  async createCategory(data: any): Promise<any> {
    return this.request('/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: any): Promise<any> {
    return this.request(`/categories/?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<any> {
    return this.request(`/categories/?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Articles
  async getArticles(params: { limit?: number; offset?: number; status?: string } = {}): Promise<any[]> {
    const queryString = new URLSearchParams(params as any).toString();
    return this.request(`/articles/?${queryString}`);
  }

  async getArticle(id: string): Promise<any> {
    return this.request(`/articles/?id=${id}`);
  }

  async getArticleBySlug(slug: string): Promise<any> {
    return this.request(`/articles/?slug=${slug}`);
  }

  async getArticlesByCategory(categoryId: string, limit: number = 20): Promise<any[]> {
    return this.request(`/articles/?category_id=${categoryId}&limit=${limit}`);
  }

  async createArticle(data: any): Promise<any> {
    return this.request('/articles/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateArticle(id: string, data: any): Promise<any> {
    return this.request(`/articles/?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteArticle(id: string): Promise<any> {
    return this.request(`/articles/?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Settings
  async getSettings(): Promise<any> {
    return this.request('/settings/');
  }

  async updateSettings(data: any): Promise<any> {
    return this.request('/settings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reference Sites
  async getReferenceSites(): Promise<any[]> {
    return this.request('/reference-sites/');
  }

  async getReferenceSite(id: string): Promise<any> {
    return this.request(`/reference-sites/?id=${id}`);
  }

  async createReferenceSite(data: any): Promise<any> {
    return this.request('/reference-sites/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReferenceSite(id: string, data: any): Promise<any> {
    return this.request(`/reference-sites/?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReferenceSite(id: string): Promise<any> {
    return this.request(`/reference-sites/?id=${id}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();