import React, { useState } from 'react';
import { Plus, Search, Trash2, TestTube } from 'lucide-react';
import { categoryRepo } from '../lib/repo';
import { loadPSE, execute } from '../lib/pse';
import { useAdminStore } from '../lib/adminStore';

interface Query {
  id: string;
  text: string;
  categoryId: string;
  isPopular: boolean;
}

export default function Queries() {
  const [queries, setQueries] = useState<Query[]>([]);
  const [newQuery, setNewQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [testQuery, setTestQuery] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [showTestResults, setShowTestResults] = useState(false);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  const settings = useAdminStore(state => state.settings);

  // Load categories on component mount
  React.useEffect(() => {
    async function loadCategories() {
      try {
        const fetchedCategories = await categoryRepo.getAll();
        setCategories(Array.isArray(fetchedCategories) ? fetchedCategories : []);
        setCategoriesError(null);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
        setCategoriesError('Failed to load categories. Please check database connection.');
      }
    }
    
    loadCategories();
  }, []);

  const handleAddQuery = () => {
    if (!newQuery.trim() || !selectedCategory) return;
    
    const query: Query = {
      id: Date.now().toString(),
      text: newQuery.trim(),
      categoryId: selectedCategory,
      isPopular: true
    };
    
    setQueries(prev => [...prev, query]);
    setNewQuery('');
  };

  const handleDeleteQuery = (id: string) => {
    setQueries(prev => prev.filter(q => q.id !== id));
  };

  const handleTestQuery = async () => {
    const getCxId = () => {
      if (settings.cxId && settings.cxId.trim()) return settings.cxId;
      if (import.meta.env.VITE_GOOGLE_CX) return import.meta.env.VITE_GOOGLE_CX;
      return '7301314c507bb45cf'; // Demo fallback
    };
    
    const activeCxId = getCxId();
    
    if (!testQuery || !activeCxId) {
      alert('Please enter a test query. CX ID will be used from settings.');
      return;
    }
    
    setTestLoading(true);
    setShowTestResults(true);
    
    try {
      await loadPSE(activeCxId);
      
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        execute(testQuery, 'query-test');
      }, 200);
      
      setTestLoading(false);
    } catch (error) {
      console.error('Query test error:', error);
      alert('Query test failed. Please check the CSE configuration.');
      setTestLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Query Management</h1>
        <p className="text-gray-600">Manage popular search queries for each category.</p>
      </div>

      {/* Categories Error Message */}
      {categoriesError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <div className="text-red-600">
              <h3 className="text-sm font-medium">Database Connection Error</h3>
              <p className="text-xs mt-1">{categoriesError}</p>
              <p className="text-xs mt-1">
                Please check your database configuration in <code>api/config/database.php</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Query Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Popular Query</h2>
        
        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={categories.length === 0}
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="Enter popular query"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={handleAddQuery}
            disabled={!newQuery.trim() || !selectedCategory || categories.length === 0}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add
          </button>
        </div>
      </div>

      {/* Query Test */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Test Query</h2>
        
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            placeholder="Enter query to test"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleTestQuery}
            disabled={!testQuery || testLoading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center"
          >
            {testLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Testing...
              </>
            ) : (
              <>
                <TestTube className="h-4 w-4 mr-2" />
                Test
              </>
            )}
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-red-600 mb-4">
            <strong>Active CX ID:</strong> {(() => {
              if (settings.cxId && settings.cxId.trim()) return `${settings.cxId} (Admin)`;
              if (import.meta.env.VITE_GOOGLE_CX) return `${import.meta.env.VITE_GOOGLE_CX} (Environment)`;
              return '7301314c507bb45cf (Demo Fallback)';
            })()}
          </p>
        </div>
        
        {showTestResults && (
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Test Results</h3>
            
            {testLoading && (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            <div id="query-test" className="gcse-searchresults-only min-h-[200px]" data-queryParameterName="q" data-linkTarget="_parent" data-newWindow="false"></div>
          </div>
        )}
      </div>

      {/* Queries by Category */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categoryQueries = queries.filter(q => q.categoryId === category.id);
          const defaultQueries = category.popularQueries || [];
          
          return (
            <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {category.name} - Popular Queries
              </h3>
              
              {/* Default Queries */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Default Queries</h4>
                <div className="flex flex-wrap gap-2">
                  {defaultQueries.map((query, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      {query}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Custom Queries */}
              {categoryQueries.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Custom Queries</h4>
                  <div className="space-y-2">
                    {categoryQueries.map((query) => (
                      <div key={query.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{query.text}</span>
                        <button
                          onClick={() => handleDeleteQuery(query.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}