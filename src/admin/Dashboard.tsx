import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  FolderOpen, 
  Search, 
  Users, 
  Settings,
  TrendingUp,
  Eye
} from 'lucide-react';
import { categoryRepo, articleRepo } from '../lib/repo';
import { useAdminStore } from '../lib/adminStore';

export default function Dashboard() {
  const categories = categoryRepo.getAll();
  const articles = articleRepo.getAll();
  const settings = useAdminStore(state => state.settings);

  const stats = [
    {
      name: 'Total Categories',
      value: categories.length,
      icon: FolderOpen,
      color: 'bg-blue-500'
    },
    {
      name: 'Published Articles',
      value: articles.filter(a => a.status === 'published').length,
      icon: FileText,
      color: 'bg-green-500'
    },
    {
      name: 'Draft Articles',
      value: articles.filter(a => a.status === 'draft').length,
      icon: Eye,
      color: 'bg-yellow-500'
    },
    {
      name: 'High-CPC Categories',
      value: categories.filter(c => c.isHighCpc).length,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  const quickActions = [
    { name: 'Add Article', href: '/admin/articles', icon: FileText },
    { name: 'Manage Categories', href: '/admin/categories', icon: FolderOpen },
    { name: 'CSE Settings', href: '/admin/settings', icon: Search },
    { name: 'User Management', href: '/admin/users', icon: Users }
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the {settings.siteName} admin panel. Manage your content and settings here.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.name}
                  to={action.href}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <Icon className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-gray-900">{action.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Articles</h2>
          <div className="space-y-3">
            {articles.slice(0, 5).map((article) => (
              <div key={article.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{article.title}</h3>
                  <p className="text-xs text-gray-500">
                    {article.status} • {new Date(article.publishDate).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/admin/articles`}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          
          <Link
            to="/admin/articles"
            className="block mt-4 text-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            View All Articles
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Google CSE</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              settings.cxId ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {settings.cxId ? 'Configured' : 'Not Set'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">AI Provider</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
              {settings.aiProvider}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <span className="text-sm font-medium text-gray-900">Analytics</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              settings.uetId ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {settings.uetId ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}