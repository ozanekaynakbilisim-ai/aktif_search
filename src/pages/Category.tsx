import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SeoHead from '../components/SeoHead';
import PopularQueries from '../components/PopularQueries';
import { categoryRepo, articleRepo } from '../lib/repo';
import { generateBreadcrumbJSONLD } from '../lib/seo';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const category = categoryRepo.getAll().find(c => c.slug === slug);
  const categoryArticles = articleRepo.getAll()
    .filter(a => a.categoryId === category?.id)
    .slice(0, 20);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
      </div>
    );
  }

  const breadcrumbData = generateBreadcrumbJSONLD([
    { name: 'Home', url: '/' },
    { name: category.name, url: `/category/${category.slug}` }
  ]);

  return (
    <>
      <SeoHead
        title={category.name}
        description={category.description}
        path={`/category/${category.slug}`}
        ogImage={category.heroImage}
        jsonLd={[breadcrumbData]}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{category.name}</h1>
            <p className="text-xl text-gray-600">{category.description}</p>
          </div>
        </div>

        {/* Guide Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {category.name} Guide
          </h2>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">
              Welcome to our comprehensive {category.name.toLowerCase()} guide. Here you'll find expert advice, 
              detailed comparisons, and tools to help you make the best financial decisions.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Tips:</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Compare multiple options before making a decision</li>
              <li>Read the fine print and understand all terms</li>
              <li>Consider your long-term financial goals</li>
              <li>Check your credit score before applying</li>
              <li>Use reputable comparison tools and calculators</li>
              <li>Consult with financial professionals when needed</li>
            </ul>
          </div>
        </div>

        {/* Popular Queries */}
        <PopularQueries 
          queries={category.popularQueries} 
          containerId="category-results"
        />

        {/* Articles List */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Latest {category.name} Articles
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryArticles.map((article) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4"
              >
                <div className="mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-xl">📄</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(article.publishDate).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}