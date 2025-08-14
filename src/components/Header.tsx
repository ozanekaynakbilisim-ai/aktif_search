import React from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, Search, Settings, X } from 'lucide-react';
import { useAdminStore } from '../lib/mysqlAdminStore';
import GlobalSearch from './GlobalSearch';

export default function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const { siteName, logoUrl, primaryColor } = useAdminStore(state => state.settings);
  
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Credit Cards', href: '/category/credit-cards' },
    { name: 'Loans', href: '/category/personal-loans' },
    { name: 'Banking', href: '/category/banking' },
    { name: 'Investing', href: '/category/investing' },
    { name: 'Insurance', href: '/category/insurance' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-8 w-auto" />
            ) : (
              <Search className="h-8 w-8" style={{ color: primaryColor }} />
            )}
            <span className="text-xl font-bold text-gray-900">{siteName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === item.href
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Admin Link */}
          <div className="flex items-center space-x-4">
            {/* Global Search Button */}
            <button
              onClick={() => setSearchModalOpen(true)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            
            <Link
              to="/admin"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Admin Panel"
            >
              <Settings className="h-5 w-5" />
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Desktop Search Bar */}
        <div className="hidden lg:block border-t border-gray-200 py-3">
          <div className="max-w-md mx-auto">
            <GlobalSearch />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-base font-medium transition-colors rounded-lg ${
                  location.pathname === item.href
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Search Modal */}
      {searchModalOpen && (
        <GlobalSearch 
          isModal={true} 
          onClose={() => setSearchModalOpen(false)} 
        />
      )}
    </header>
  );
}