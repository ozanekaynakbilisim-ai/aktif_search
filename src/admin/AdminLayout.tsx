import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import AdminAuth from '../components/AdminAuth';
import { 
  LayoutDashboard, 
  Settings, 
  FolderOpen, 
  FileText, 
  Search, 
  Users, 
  ExternalLink,
  ArrowLeft,
  Zap,
  Globe,
  TrendingUp
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen },
    { name: 'Articles', href: '/admin/articles', icon: FileText },
    { name: 'Queries', href: '/admin/queries', icon: Search },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Reference Sites', href: '/admin/reference-sites', icon: ExternalLink },
    { name: 'Content Automation', href: '/admin/content-automation', icon: Zap },
    { name: 'SEO Tools', href: '/admin/seo-tools', icon: Globe }
  ];

  return (
    <AdminAuth>
      <div className="min-h-screen bg-gray-100">
        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                <Link
                  to="/"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Back to Site"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <nav className="p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.href || 
                    (item.href === '/admin' && location.pathname === '/admin');
                  
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminAuth>
  );
}