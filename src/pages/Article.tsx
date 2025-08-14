import React from 'react';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import AIInfoBox from '../components/AIInfoBox';
import FAQSection from '../components/FAQSection';
import NewsSection from '../components/NewsSection';
import YouTubeVideos from '../components/YouTubeVideos';
import CurrencyWidget from '../components/CurrencyWidget';
import { loadPSE, execute } from '../lib/pse';
import { articleRepo, categoryRepo } from '../lib/mysqlRepo';
import { generateArticleJSONLD, generateBreadcrumbJSONLD } from '../lib/seo';
import { useAdminStore } from '../lib/adminStore';

export default function Article() {
  const { slug } = useParams<{ slug: string }>();
  const [cseLoaded, setCseLoaded] = useState(false);
  const [article, setArticle] = useState(null);
  const [category, setCategory] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const settings = useAdminStore(state => state.settings);

  useEffect(() => {
    async function loadArticleData() {
      if (!slug) return;
      
      try {
        const articleData = await articleRepo.getBySlug(slug);
        if (articleData) {
          setArticle(articleData);
          const categoryData = await categoryRepo.getById(articleData.category_id);
          setCategory(categoryData);
          
          if (categoryData) {
            const related = await articleRepo.getByCategory(categoryData.id, 5);
            setRelatedArticles(related.filter(a => a.id !== articleData.id));
          }
        }
      } catch (error) {
        console.error('Error loading article data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadArticleData();
  }, [slug]);

  // Generate FAQ from article content
  const generateFAQs = (title: string, content: string) => {
    // Simple FAQ generation based on article topic
    const topic = title.toLowerCase();
    
    if (topic.includes('credit card')) {
      return [
        {
          question: "What documents are required for a credit card application?",
          answer: "Credit card applications typically require identification, proof of income, proof of residence, and pay stubs if available. Banks may request additional documents."
        },
        {
          question: "How are credit card interest rates determined?",
          answer: "Credit card interest rates are determined based on the central bank's policy rate, the bank's cost structure, and the customer's credit risk assessment."
        },
        {
          question: "How can I pay off credit card debt faster?",
          answer: "Make payments as large as possible instead of minimum payments, pay off high-interest cards first, and avoid additional spending."
        }
      ];
    }
    
    if (topic.includes('loan') || topic.includes('kredi')) {
      return [
        {
          question: "How do I apply for a personal loan?",
          answer: "You can apply for a personal loan by visiting the bank branch, applying through online banking, or using the mobile application."
        },
        {
          question: "What should I do if my loan application is rejected?",
          answer: "If your loan application is rejected, check your credit score, update your income documentation, and get quotes from different banks."
        },
        {
          question: "How are loan interest rates calculated?",
          answer: "Loan interest rates are determined using compound interest calculations on the principal. Taxes and fees are also added to the interest."
        }
      ];
    }
    
    // Default financial FAQs
    return [
      {
        question: "What criteria are important for this financial product?",
        answer: "When choosing financial products, evaluate factors such as interest rates, fees, term options, and the bank's reliability."
      },
      {
        question: "How long does the application process take?",
        answer: "The application process typically takes 1-5 business days. The timeline may extend if documents are missing."
      },
      {
        question: "In what situations can an application be rejected?",
        answer: "Low credit score, insufficient income, missing documents, or existing high debt load can cause application rejection."
      }
    ];
  };
  // Auto-load CSE results when article loads
  useEffect(() => {
    if (!article || cseLoaded) return;
    
    const loadCSEResults = async () => {
      const getCxId = () => {
        if (settings.cxId && settings.cxId.trim()) return settings.cxId;
        if (import.meta.env.VITE_GOOGLE_CX) return import.meta.env.VITE_GOOGLE_CX;
        return '7301314c507bb45cf';
      };
      
      const cxId = getCxId();
      if (!cxId) return;
      
      try {
        await loadPSE(cxId);
        // Use custom CSE keyword if provided, otherwise use article title
        const searchKeyword = article.cseKeyword || article.title;
        setTimeout(() => {
          execute(searchKeyword, 'article-top-results');
          setCseLoaded(true);
        }, 500);
      } catch (error) {
        console.error('Auto CSE load error:', error);
      }
    };
    
    loadCSEResults();
  }, [article, settings.cxId, cseLoaded]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!article || !category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Article not found</h1>
      </div>
    );
  }

  const shouldShowTwoAds = article.word_count >= settings.adRules.lowWordCount && !article.disable_ads;
  const shouldShowOneAd = article.word_count < settings.adRules.lowWordCount && !article.disable_ads;

  const articleJSONLD = generateArticleJSONLD(article, category);
  const breadcrumbJSONLD = generateBreadcrumbJSONLD([
    { name: 'Home', url: '/' },
    { name: category.name, url: `/category/${category.slug}` },
    { name: article.title, url: `/article/${article.slug}` }
  ]);

  // Split content for ad insertion
  const contentParts = article.content.split('\n\n');
  const introEnd = Math.ceil(contentParts.length * 0.25);
  const midContent = Math.ceil(contentParts.length * 0.6);

  return (
    <>
      <SeoHead
        title={article.title}
        description={article.excerpt}
        path={`/article/${article.slug}`}
        ogImage={article.heroImage}
        articleData={{
          author: article.author,
          publishDate: article.publish_date
        }}
        jsonLd={[articleJSONLD, breadcrumbJSONLD]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {article.title}
              </h1>
            </header>

            {/* Auto-loaded CSE Results */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Related Financial Information</h3>
                  <p className="text-sm text-gray-600">Find relevant financial products and advice related to this topic</p>
                </div>
                
                {!cseLoaded && (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading related results...</span>
                  </div>
                )}
                
                <div id="article-top-results" className="gcse-searchresults-only min-h-[300px]" data-queryParameterName="q" data-linkTarget="_parent" data-newWindow="false"></div>
              </div>
            </div>

            {/* Article Title and Content */}
            <div 
              className="prose max-w-none mb-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Article Content with Dynamic Ads */}
            {/* YouTube Videos Section - Only show if enabled */}
            {settings.youtubeApiEnabled && (
              <YouTubeVideos 
                topic={article.title}
                maxResults={4}
                className="mb-8"
                title="Related Videos"
              />
            )}

            {/* News Section - Only show if enabled */}
            {settings.newsApiEnabled && (
              <NewsSection 
                topic={category.name}
                maxResults={2}
                className="mb-8"
                title={`Latest ${category.name} News`}
              />
            )}

            {/* Article Excerpt at the end */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Article Summary</h3>
              <p className="text-xl text-gray-600 leading-relaxed mb-4">
                {article.excerpt}
              </p>
            </div>

            {/* Related Articles */}
            <section className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.slice(0, 4)
                  .map((relatedArticle) => (
                    <Link
                      key={relatedArticle.id}
                      to={`/article/${relatedArticle.slug}`}
                      className="group flex space-x-4 bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                        <span className="text-2xl">📄</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-sm">
                          {relatedArticle.title}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {relatedArticle.excerpt.substring(0, 100)}...
                        </p>
                      </div>
                    </Link>
                  ))}
              </div>
            </section>
          </div>

          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <FAQSection faqs={generateFAQs(article.title, article.content)} />
          </div>

          {/* Sidebar */}
          <div className="mt-8 lg:mt-0">
            <div className="sticky top-8">
              <AIInfoBox topic={article.title} className="mb-6" />
              
              {/* Currency Widget - Only show if enabled */}
              {settings.currencyApiEnabled && (
                <CurrencyWidget className="mb-6" />
              )}
              
              {/* Category Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="font-bold text-gray-900 mb-3">More in {category.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                <Link
                  to={`/category/${category.slug}`}
                  className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                >
                  View All {category.name} Articles
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}