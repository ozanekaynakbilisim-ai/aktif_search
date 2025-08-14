import React, { useState, useEffect } from 'react';
import { Shield, Lock, User, AlertCircle } from 'lucide-react';
import { useAdminStore } from '../lib/adminStore';

interface AdminAuthProps {
  children: React.ReactNode;
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { isAuthenticated, setAuthenticated, settings } = useAdminStore();
  const maxAttempts = 5;

  // Basit sabit kullanıcı adı ve şifre
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  useEffect(() => {
    // Mevcut oturumu kontrol et
    const session = localStorage.getItem('admin-session');
    const sessionTime = localStorage.getItem('admin-session-time');
    
    if (session === 'authenticated' && sessionTime) {
      const now = new Date().getTime();
      const sessionStart = parseInt(sessionTime);
      const sessionDuration = 60 * 60 * 1000; // 1 saat
      
      if (now - sessionStart < sessionDuration) {
        setAuthenticated(true);
      } else {
        // Oturum süresi dolmuş
        localStorage.removeItem('admin-session');
        localStorage.removeItem('admin-session-time');
        setAuthenticated(false);
      }
    }
    
    setLoading(false);
  }, [setAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (attempts >= maxAttempts) {
      setError('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.');
      return;
    }
    
    // Basit string karşılaştırması
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setAttempts(0);
      
      // Oturum oluştur
      localStorage.setItem('admin-session', 'authenticated');
      localStorage.setItem('admin-session-time', new Date().getTime().toString());
    } else {
      setAttempts(prev => prev + 1);
      setError('Geçersiz kullanıcı adı veya şifre');
      setPassword('');
      
      if (attempts + 1 >= maxAttempts) {
        setError('Çok fazla başarısız deneme. Erişim engellendi.');
      }
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    setUsername('');
    setPassword('');
    localStorage.removeItem('admin-session');
    localStorage.removeItem('admin-session-time');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Shield className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Girişi</h2>
            <p className="mt-2 text-sm text-gray-600">
              Admin paneline erişmek için giriş yapın
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Kullanıcı Adı
                </label>
                <div className="mt-1 relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={attempts >= maxAttempts}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Kullanıcı adını girin"
                  />
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Şifre
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={attempts >= maxAttempts}
                    className="appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Şifreyi girin"
                  />
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={attempts >= maxAttempts || !username || !password}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Giriş Yap
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Deneme: {attempts}/{maxAttempts}
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Çıkış butonu */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 transition-colors"
        >
          Çıkış
        </button>
      </div>
      {children}
    </div>
  );
}