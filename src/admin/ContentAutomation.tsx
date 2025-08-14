import React, { useState, useEffect } from 'react';
import { Play, Pause, Plus, Trash2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { contentAutomation, type KeywordBatch } from '../lib/contentAutomation';
import { categoryRepo } from '../lib/repo';
import { useAdminStore } from '../lib/adminStore';

export default function ContentAutomation() {
  const [batches, setBatches] = useState<KeywordBatch[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newKeywords, setNewKeywords] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  const categories = categoryRepo.getAll();
  const settings = useAdminStore(state => state.settings);
  const updateSettings = useAdminStore(state => state.updateSettings);

  useEffect(() => {
    setBatches(contentAutomation.getBatches());
    const interval = setInterval(() => {
      setBatches(contentAutomation.getBatches());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddBatch = () => {
    if (!newKeywords.trim() || !selectedCategory) return;
    
    const keywords = newKeywords
      .split('\n')
      .map(k => k.trim())
      .filter(k => k.length > 0)
      .slice(0, 100); // Limit to 100 keywords
    
    console.log('Adding batch with keywords:', keywords);
    
    contentAutomation.addKeywordBatch(keywords, selectedCategory);
    setBatches(contentAutomation.getBatches());
    setShowAddModal(false);
    setNewKeywords('');
    setSelectedCategory('');
  };

  const handleStartStop = async () => {
    if (isRunning) {
      contentAutomation.stopAutomation();
      setIsRunning(false);
    } else {
      if (!settings.chatgptApiKey) {
        alert('Please configure ChatGPT API key in Settings first.');
        return;
      }
      
      // Detaylı kontroller
      console.log('=== CONTENT AUTOMATION DEBUG ===');
      console.log('Settings check:', {
        hasApiKey: !!settings.chatgptApiKey,
        apiKeyStart: settings.chatgptApiKey?.substring(0, 10) + '...',
        baseUrl: settings.chatgptBaseUrl,
        model: settings.chatgptModel,
        enabled: settings.chatgptEnabled,
        automationEnabled: settings.contentAutomationEnabled
      });
      
      const pendingBatches = batches.filter(b => b.status === 'pending');
      
      try {
        await contentAutomation.startAutomation({
          enabled: settings.contentAutomationEnabled,
          dailyLimit: settings.dailyContentLimit,
          hourlyLimit: settings.hourlyContentLimit,
          autoIndexNow: settings.indexNowEnabled,
          autoSocialShare: settings.socialMediaEnabled
        });
        setIsRunning(true);
      } catch (error) {
        console.error('Failed to start automation:', error);
        alert('Failed to start automation: ' + (error instanceof Error ? error.message : 'Unknown error'));
      }
    }
  };

  const handleDeleteBatch = (id: string) => {
    if (confirm('Are you sure you want to delete this batch?')) {
      contentAutomation.deleteBatch(id);
      setBatches(contentAutomation.getBatches());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Automation</h1>
          <p className="text-gray-600">Automate content generation with AI.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Keywords
          </button>
          <button
            onClick={handleStartStop}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
              isRunning 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop Automation
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Automation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Automation Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Limit
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Günde maksimum kaç makale oluşturulacağını belirler. Yüksek değerler API limitlerini aşabilir.
            </p>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.dailyContentLimit}
              onChange={(e) => updateSettings({ dailyContentLimit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Limit
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Saatte maksimum kaç makale oluşturulacağını belirler. API rate limit koruması sağlar.
            </p>
            <input
              type="number"
              min="1"
              max="10"
              value={settings.hourlyContentLimit}
              onChange={(e) => updateSettings({ hourlyContentLimit: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="automationEnabled"
              checked={settings.contentAutomationEnabled}
              onChange={(e) => updateSettings({ contentAutomationEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="automationEnabled" className="ml-2 text-sm text-gray-700">
              Enable Automation
            </label>
          </div>
        </div>
      </div>

      {/* Batches */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Keyword Batches</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {batches.map((batch) => {
                const category = categories.find(c => c.id === batch.categoryId);
                return (
                  <tr key={batch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getStatusIcon(batch.status)}
                        <span className="ml-2 text-sm capitalize">{batch.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {category?.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(batch.processedCount / batch.totalCount) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {batch.processedCount}/{batch.totalCount}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteBatch(batch.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Keywords Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Add Keyword Batch</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keywords (one per line, max 100) *
                </label>
                <textarea
                  value={newKeywords}
                  onChange={(e) => setNewKeywords(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="best credit cards 2025&#10;personal loan rates&#10;mortgage calculator&#10;..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newKeywords.split('\n').filter(k => k.trim()).length} keywords
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBatch}
                disabled={!newKeywords.trim() || !selectedCategory}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                Add Batch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}