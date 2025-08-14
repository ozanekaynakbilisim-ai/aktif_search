import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, DollarSign, Building, TrendingUp, Shield } from 'lucide-react';
import HomeSearch from '../components/HomeSearch';
import SeoHead from '../components/SeoHead';
import NewsSection from '../components/NewsSection';
import CurrencyWidget from '../components/CurrencyWidget';
import YouTubeVideos from '../components/YouTubeVideos';
import { categoryRepo, articleRepo } from '../lib/repo';
import { useAdminStore } from '../lib/adminStore';

export default function Home() {
  const categories = categoryRepo.getAll();
  const recentArticles = articleRepo.getAll().slice(0, 6);
  const settings = useAdminStore(state => state.settings);

  const categoryIcons = {
    'credit-cards': CreditCard,
    'personal-loans': DollarSign,
    'banking': Building,
    'investing': TrendingUp,
    'insurance': Shield
  };

  return (
    <>
      <SeoHead
        title="Expert Financial Advice & Tools"
        description="Find the best credit cards, loans, banks, and investment options. Compare rates, read expert reviews, and make informed financial decisions."
        path="/"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Search */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Your Financial Authority
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Expert advice, comprehensive comparisons, and powerful tools to help you make informed financial decisions.
          </p>
          
          <HomeSearch />
        </div>

        {/* Featured Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Explore Financial Topics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const IconComponent = categoryIcons[category.slug as keyof typeof categoryIcons] || DollarSign;
              
              return (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6"
                >
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-center">{category.description}</p>
                  <div className="flex items-center justify-center text-blue-600 group-hover:text-blue-800 transition-colors">
                    <span className="font-medium">Explore {category.name}</span>
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* API Widgets Row - Only show if APIs are enabled */}
        {(settings.newsApiEnabled || settings.currencyApiEnabled) && (
          <section className="mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Currency Widget */}
              {settings.currencyApiEnabled && (
                <div>
                  <CurrencyWidget />
                </div>
              )}
              
              {/* Latest News */}
              {settings.newsApiEnabled && (
                <div className={settings.currencyApiEnabled ? "lg:col-span-2" : "lg:col-span-3"}>
                  <NewsSection 
                    maxResults={3}
                    title="Latest Financial News"
                    showImages={false}
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* YouTube Videos Section - Only show if enabled */}
        {settings.youtubeApiEnabled && (
          <YouTubeVideos 
            topic="personal finance tips"
            maxResults={6}
            className="mb-12"
            title="Latest Relevant Videos"
          />
        )}

        {/* Recent Articles */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Articles</h2>
            <Link
              to="/articles"
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors"
            >
              View All Articles
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6"
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📄</span>
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">{article.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{article.author}</span>
                  <span>{new Date(article.publishDate).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}