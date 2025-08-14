import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Calendar, Wand2, Loader } from 'lucide-react';
import { articleRepo, categoryRepo } from '../lib/mysqlRepo';
import { generateArticleContent } from '../lib/contentGen';
import { useAdminStore } from '../lib/adminStore';
import type { Article } from '../lib/mysqlRepo';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    heroImage: '',
    content: '',
    author: '',
    categoryId: '',
    status: 'draft' as 'draft' | 'published',
    disableAds: false,
    cseKeyword: ''
  });

  const settings = useAdminStore(state => state.settings);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [articlesData, categoriesData] = await Promise.all([
        articleRepo.getAll(),
        categoryRepo.getAll()
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).length;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const articleData = {
      ...formData,
      word_count: countWords(formData.content),
      publish_date: editingArticle?.publish_date || new Date().toISOString()
    };
    
    try {
      if (editingArticle) {
        await articleRepo.update(editingArticle.id, articleData);
      } else {
        await articleRepo.create(articleData);
      }
      await loadData();
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again.');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      heroImage: article.heroImage,
      content: article.content,
      author: article.author,
      categoryId: article.category_id,
      status: article.status,
      disableAds: article.disable_ads,
      cseKeyword: article.cse_keyword || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await articleRepo.delete(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      heroImage: '',
      content: '',
      author: '',
      categoryId: '',
      status: 'draft',
      disableAds: false,
      cseKeyword: ''
    });
  };

  const wordCount = countWords(formData.content);
  const adCount = formData.disableAds ? 0 : (wordCount >= settings.adRules.lowWordCount ? settings.adRules.highWordAds : settings.adRules.lowWordAds);

  const handleGenerateContent = async () => {
    if (!formData.title || !formData.categoryId) {
      alert('Please enter a title and select a category first.');
      return;
    }

    if (!settings.chatgptApiKey) {
      alert('Please configure ChatGPT API key in Settings first.');
      return;
    }

    const category = categories.find(c => c.id === formData.categoryId);
    if (!category) return;

    setGeneratingContent(true);
    try {
      const result = await generateArticleContent({
        title: formData.title,
        category: category.name,
        tone: settings.chatgptTone,
        minWords: settings.chatgptMinWords,
        includeFaq: settings.chatgptIncludeFaq,
        systemPrompt: settings.chatgptSystemPrompt,
        apiKey: settings.chatgptApiKey,
        baseUrl: settings.chatgptBaseUrl,
        model: settings.chatgptModel
      });

      if (result) {
        setFormData(prev => ({
          ...prev,
          title: result.optimizedTitle,
          content: result.content,
          excerpt: prev.excerpt || result.excerpt
        }));
        setShowGenerator(false);
      }
    } catch (error) {
      console.error('Content generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('Invalid API key')) {
        alert('❌ Invalid API key detected!\n\nPlease:\n1. Go to Settings\n2. Enter a valid ChatGPT API key\n3. Save settings and try again\n\nAPI keys start with "sk-" and can be obtained from OpenAI.');
      } else {
        alert(`Content generation failed: ${errorMessage}`);
      }
    } finally {
      setGeneratingContent(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Articles</h1>
          <p className="text-gray-600">Manage your article content and SEO settings.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Article
        </button>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Article
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Words
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {articles.map((article) => {
                const category = categories.find(c => c.id === article.category_id);
                return (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {article.heroImage ? (
                          <img
                            src={article.hero_image}
                            alt={article.title}
                            className="h-10 w-10 object-cover rounded-lg mr-3"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.pexels.com/photos/164527/pexels-photo-164527.jpeg?auto=compress&cs=tinysrgb&w=800';
                            }}
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg mr-3 flex items-center justify-center">
                            <span className="text-sm">📄</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{article.title}</p>
                          <p className="text-sm text-gray-500">{article.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {category?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {article.word_count}
                      <span className="text-xs text-gray-500 ml-1">
                        ({article.disable_ads ? '0' : article.word_count >= settings.adRules.lowWordCount ? settings.adRules.highWordAds : settings.adRules.lowWordAds} ads)
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(article.publish_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(article)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(article.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingArticle ? 'Edit Article' : 'Add Article'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        title,
                        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt *
                </label>
                <textarea
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hero Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.heroImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, heroImage: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to use default placeholder image
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CSE Search Keyword (Optional)
                </label>
                <input
                  type="text"
                  value={formData.cseKeyword}
                  onChange={(e) => setFormData(prev => ({ ...prev, cseKeyword: e.target.value }))}
                  placeholder="Custom keyword for CSE search (defaults to article title)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This keyword will be used for CSE searches. Leave empty to use article title.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content *
                </label>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Article content</span>
                  <button
                    type="button"
                    onClick={() => setShowGenerator(!showGenerator)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center transition-colors"
                  >
                    <Wand2 className="h-4 w-4 mr-1" />
                    AI Generate
                  </button>
                </div>
                
                {showGenerator && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-blue-900">AI Content Generator</h4>
                      <span className="text-xs text-blue-700">
                        {settings.chatgptModel} • {settings.chatgptMinWords}+ words
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Title:</span>
                        <span className="ml-2 text-blue-700">{formData.title || 'Not set'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Category:</span>
                        <span className="ml-2 text-blue-700">
                          {categories.find(c => c.id === formData.categoryId)?.name || 'Not selected'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Tone:</span>
                        <span className="ml-2 text-blue-700">{settings.chatgptTone}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">FAQ:</span>
                        <span className="ml-2 text-blue-700">{settings.chatgptIncludeFaq ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={handleGenerateContent}
                        disabled={generatingContent || !formData.title || !formData.categoryId || !settings.chatgptApiKey}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        {generatingContent ? (
                          <>
                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-4 w-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowGenerator(false)}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                    
                    {!settings.chatgptApiKey && (
                      <p className="text-xs text-red-600 mt-2">
                        Configure ChatGPT API key in Settings to use this feature.
                      </p>
                    )}
                  </div>
                )}
                
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter article content with HTML formatting or use AI generator above..."
                />
                <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                  <span>{wordCount} words (HTML content)</span>
                  <span>Will show {adCount} ad blocks</span>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="disableAds"
                  checked={formData.disableAds}
                  onChange={(e) => setFormData(prev => ({ ...prev, disableAds: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="disableAds" className="ml-2 text-sm text-gray-700">
                  Disable ads for this article
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingArticle ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}