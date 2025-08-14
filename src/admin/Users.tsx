import React, { useState } from 'react';
import { Lock, User, Shield } from 'lucide-react';

export default function Users() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  const correctPassword = 'admin123'; // In production, this would be properly hashed

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setAttempts(0);
    } else {
      setAttempts(prev => prev + 1);
      setPassword('');
      
      if (attempts + 1 >= maxAttempts) {
        alert('Too many failed attempts. Please try again later.');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Enter password to access user management</p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={attempts >= maxAttempts}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter admin password"
              />
              {attempts > 0 && attempts < maxAttempts && (
                <p className="text-sm text-red-600 mt-1">
                  Incorrect password. {maxAttempts - attempts} attempts remaining.
                </p>
              )}
              {attempts >= maxAttempts && (
                <p className="text-sm text-red-600 mt-1">
                  Account locked due to too many failed attempts.
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={attempts >= maxAttempts || !password}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              <Lock className="h-4 w-4 inline mr-2" />
              Login
            </button>
          </form>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Demo Password:</strong> admin123
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user access and permissions.</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Demo User Management</h2>
          <p className="text-gray-600 mb-4">
            This is a demonstration of the user management system. In a production environment, 
            this would include full user CRUD operations, role management, and proper authentication.
          </p>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left max-w-md mx-auto">
            <h3 className="font-medium text-green-800 mb-2">Current Session</h3>
            <p className="text-sm text-green-700">
              • User: Admin<br />
              • Role: Administrator<br />
              • Logged in: {new Date().toLocaleString()}<br />
              • Failed attempts: {attempts}/{maxAttempts}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}