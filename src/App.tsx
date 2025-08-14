import React from 'react';
import { useEffect } from 'react';
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Category from './pages/Category';
import Article from './pages/Article';
import About from './pages/About';
import Contact from './pages/Contact';
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import Settings from './admin/Settings';
import Categories from './admin/Categories';
import Articles from './admin/Articles';
import Queries from './admin/Queries';
import Users from './admin/Users';
import ReferenceCSESites from './admin/ReferenceCSESites';
import ContentAutomation from './admin/ContentAutomation';
import SEOTools from './admin/SEOTools';
import { useAdminStore } from './lib/adminStore';

function App() {
  const loadSettings = useAdminStore(state => state.loadSettings);

  useEffect(() => {
    // Load settings from database on app start
    loadSettings().catch(console.error);
  }, [loadSettings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="settings" element={<Settings />} />
            <Route path="categories" element={<Categories />} />
            <Route path="articles" element={<Articles />} />
            <Route path="queries" element={<Queries />} />
            <Route path="users" element={<Users />} />
            <Route path="reference-sites" element={<ReferenceCSESites />} />
            <Route path="content-automation" element={<ContentAutomation />} />
            <Route path="seo-tools" element={<SEOTools />} />
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;