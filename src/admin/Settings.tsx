import React, { useState } from 'react';
import { useEffect } from 'react';
import { Save, TestTube, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { useAdminStore } from '../lib/adminStore';
import { fetchFinanceNews } from '../lib/newsApi';
import { fetchYouTubeVideos } from '../lib/youtubeApi';

export default function Settings() {
  const { settings, updateSettings } = useAdminStore();
  
  useEffect(() => {
    // Load settings from database on component mount
    useAdminStore.getState().loadSettings();
  }, []);
  const [activeTab, setActiveTab] = useState('branding');
  const [testResults, setTestResults] = useState<any>({});
  const [testing, setTesting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const tabs = [
    { id: 'branding', name: 'Branding' },
    { id: 'seo', name: 'SEO' },
    { id: 'cse', name: 'Google CSE' },
    { id: 'ai', name: 'AI Info Box' },
    { id: 'chatgpt', name: 'ChatGPT' },
    { id: 'ads', name: 'Ads' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'apis', name: 'External APIs' }
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // API Test Functions
  const testNewsAPI = async () => {
    if (!settings.newsApiKey || !settings.newsApiEnabled) {
      setTestResults(prev => ({ ...prev, news: { success: false, message: 'API disabled or no key provided' } }));
      return;
    }

    setTesting('news');
    try {
      const articles = await fetchFinanceNews(settings.newsApiKey, 'business', 2);
      setTestResults(prev => ({ 
        ...prev, 
        news: { 
          success: articles && articles.length > 0, 
          message: articles ? `Found ${articles.length} articles` : 'No articles found' 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        news: { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` } 
      }));
    } finally {
      setTesting(null);
    }
  };

  const testYouTubeAPI = async () => {
    if (!settings.youtubeApiKey || !settings.youtubeApiEnabled) {
      setTestResults(prev => ({ ...prev, youtube: { success: false, message: 'API disabled or no key provided' } }));
      return;
    }

    setTesting('youtube');
    try {
      const videos = await fetchYouTubeVideos('personal finance', settings.youtubeApiKey, 3);
      setTestResults(prev => ({ 
        ...prev, 
        youtube: { 
          success: videos && videos.length > 0, 
          message: videos ? `Found ${videos.length} videos` : 'No videos found' 
        } 
      }));
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        youtube: { success: false, message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}` } 
      }));
    } finally {
      setTesting(null);
    }
  };

  const testAllAPIs = async () => {
    setTesting('all');
    setTestResults({});
    
    await Promise.all([
      testNewsAPI(),
      testYouTubeAPI()
    ]);
    
    setTesting(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'branding':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => updateSettings({ siteName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accent Color
                </label>
                <input
                  type="color"
                  value={settings.accentColor}
                  onChange={(e) => updateSettings({ accentColor: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Text
              </label>
              <input
                type="text"
                value={settings.footerText}
                onChange={(e) => updateSettings({ footerText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'seo':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title Pattern
              </label>
              <input
                type="text"
                value={settings.titlePattern}
                onChange={(e) => updateSettings({ titlePattern: e.target.value })}
                placeholder="{title} | {siteName}"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Use {'{title}'} and {'{siteName}'} as placeholders
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Meta Description
              </label>
              <textarea
                value={settings.defaultMetaDescription}
                onChange={(e) => updateSettings({ defaultMetaDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canonical Base URL
              </label>
              <input
                type="url"
                value={settings.canonicalBaseUrl}
                onChange={(e) => updateSettings({ canonicalBaseUrl: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="robotsIndex"
                checked={settings.robotsIndex}
                onChange={(e) => updateSettings({ robotsIndex: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="robotsIndex" className="ml-2 text-sm text-gray-700">
                Allow search engine indexing
              </label>
            </div>
          </div>
        );

      case 'cse':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Custom Search Engine ID
              </label>
              <input
                type="text"
                value={settings.cxId}
                onChange={(e) => updateSettings({ cxId: e.target.value })}
                placeholder="Enter your Google CSE ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Get your CSE ID from Google Custom Search Engine console
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Query Parameter
                </label>
                <input
                  type="text"
                  value={settings.queryParam}
                  onChange={(e) => updateSettings({ queryParam: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Safe Search
                </label>
                <select
                  value={settings.safeSearch}
                  onChange={(e) => updateSettings({ safeSearch: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="off">Off</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'ai':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">AI Info Box Settings</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="aiEnabled"
                  checked={settings.aiEnabled || false}
                  onChange={(e) => updateSettings({ aiEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="aiEnabled" className="ml-2 text-sm text-gray-700">
                  Enable AI Info Box
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Provider
                </label>
                <select
                  value={settings.aiProvider}
                  onChange={(e) => updateSettings({ aiProvider: e.target.value as any })}
                  disabled={!settings.aiEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="wikipedia">Wikipedia</option>
                  <option value="duckduckgo">DuckDuckGo</option>
                  <option value="openai">OpenAI</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Words
                </label>
                <input
                  type="number"
                  min="20"
                  max="200"
                  value={settings.aiMaxWords}
                  onChange={(e) => updateSettings({ aiMaxWords: parseInt(e.target.value) })}
                  disabled={!settings.aiEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
            
            {settings.aiProvider === 'openai' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  value={settings.aiApiKey}
                  onChange={(e) => updateSettings({ aiApiKey: e.target.value })}
                  disabled={!settings.aiEnabled}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            )}
          </div>
        );

      case 'chatgpt':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">ChatGPT Content Generation</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="chatgptEnabled"
                  checked={settings.chatgptEnabled || false}
                  onChange={(e) => updateSettings({ chatgptEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="chatgptEnabled" className="ml-2 text-sm text-gray-700">
                  Enable ChatGPT Content Generation
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.chatgptApiKey}
                onChange={(e) => updateSettings({ chatgptApiKey: e.target.value })}
                disabled={!settings.chatgptEnabled}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={settings.chatgptBaseUrl}
                  onChange={(e) => updateSettings({ chatgptBaseUrl: e.target.value })}
                  disabled={!settings.chatgptEnabled}
                  placeholder="https://openrouter.ai/api/v1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  API endpoint URL (e.g., OpenRouter, OpenAI, etc.)
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={settings.chatgptModel}
                  onChange={(e) => updateSettings({ chatgptModel: e.target.value })}
                  disabled={!settings.chatgptEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="openai/gpt-4o">OpenRouter GPT-4o</option>
                  <option value="openai/gpt-4o-mini">OpenRouter GPT-4o Mini</option>
                  <option value="anthropic/claude-3.5-sonnet">OpenRouter Claude 3.5 Sonnet</option>
                  <option value="meta-llama/llama-3.1-8b-instruct:free">OpenRouter Llama 3.1 8B (Free)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Words
                </label>
                <input
                  type="number"
                  min="200"
                  max="2000"
                  value={settings.chatgptMinWords}
                  onChange={(e) => updateSettings({ chatgptMinWords: parseInt(e.target.value) })}
                  disabled={!settings.chatgptEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Writing Tone
              </label>
              <select
                value={settings.chatgptTone}
                onChange={(e) => updateSettings({ chatgptTone: e.target.value })}
                disabled={!settings.chatgptEnabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="Professional">Professional</option>
                <option value="Friendly">Friendly</option>
                <option value="Authoritative">Authoritative</option>
                <option value="Conversational">Conversational</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeFaq"
                checked={settings.chatgptIncludeFaq}
                onChange={(e) => updateSettings({ chatgptIncludeFaq: e.target.checked })}
                disabled={!settings.chatgptEnabled}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:bg-gray-100"
              />
              <label htmlFor="includeFaq" className="ml-2 text-sm text-gray-700">
                Include FAQ section in generated content
              </label>
            </div>
          </div>
        );

      case 'ads':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ad Settings</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="adsEnabled"
                  checked={settings.adsEnabled || false}
                  onChange={(e) => updateSettings({ adsEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="adsEnabled" className="ml-2 text-sm text-gray-700">
                  Enable Ads
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Word Count Threshold
                </label>
                <input
                  type="number"
                  min="100"
                  max="1000"
                  value={settings.adRules.lowWordCount}
                  onChange={(e) => updateSettings({ 
                    adRules: { 
                      ...settings.adRules, 
                      lowWordCount: parseInt(e.target.value) 
                    } 
                  })}
                  disabled={!settings.adsEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Low Word Ads
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={settings.adRules.lowWordAds}
                  onChange={(e) => updateSettings({ 
                    adRules: { 
                      ...settings.adRules, 
                      lowWordAds: parseInt(e.target.value) 
                    } 
                  })}
                  disabled={!settings.adsEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  High Word Ads
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.adRules.highWordAds}
                  onChange={(e) => updateSettings({ 
                    adRules: { 
                      ...settings.adRules, 
                      highWordAds: parseInt(e.target.value) 
                    } 
                  })}
                  disabled={!settings.adsEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ad CTA Text
                </label>
                <input
                  type="text"
                  value={settings.adCtaText}
                  onChange={(e) => updateSettings({ adCtaText: e.target.value })}
                  disabled={!settings.adsEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Limit
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={settings.adPageLimit}
                  onChange={(e) => updateSettings({ adPageLimit: parseInt(e.target.value) })}
                  disabled={!settings.adsEnabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Analytics Settings</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="analyticsEnabled"
                  checked={settings.analyticsEnabled || false}
                  onChange={(e) => updateSettings({ analyticsEnabled: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="analyticsEnabled" className="ml-2 text-sm text-gray-700">
                  Enable Analytics
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Microsoft UET ID
              </label>
              <input
                type="text"
                value={settings.uetId}
                onChange={(e) => updateSettings({ uetId: e.target.value })}
                disabled={!settings.analyticsEnabled}
                placeholder="Enter your UET ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Head Scripts
              </label>
              <textarea
                value={settings.customHeadScripts}
                onChange={(e) => updateSettings({ customHeadScripts: e.target.value })}
                disabled={!settings.analyticsEnabled}
                rows={5}
                placeholder="Enter custom JavaScript code for head section"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm disabled:bg-gray-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Add custom analytics or tracking scripts here
              </p>
            </div>
          </div>
        );

      case 'apis':
        return (
          <div className="space-y-8">
            {/* NewsAPI */}
            {settings.newsApiEnabled && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">NewsAPI</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Enabled
                    </span>
                  </div>
                  <button
                    onClick={() => updateSettings({ newsApiEnabled: false })}
                    className="flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Disable
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NewsAPI Key
                    </label>
                    <input
                      type="password"
                      value={settings.newsApiKey}
                      onChange={(e) => updateSettings({ newsApiKey: e.target.value })}
                      placeholder="Enter your NewsAPI.org API key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Get your free API key from NewsAPI.org
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={testNewsAPI}
                      disabled={testing === 'news' || !settings.newsApiKey}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {testing === 'news' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test API
                        </>
                      )}
                    </button>
                    
                    {testResults.news && (
                      <div className={`flex items-center text-sm ${
                        testResults.news.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResults.news.success ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {testResults.news.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!settings.newsApiEnabled && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">NewsAPI (Disabled)</h3>
                <button
                  onClick={() => updateSettings({ newsApiEnabled: true })}
                  className="flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Enable
                </button>
              </div>
            )}

            {/* YouTube API */}
            {settings.youtubeApiEnabled && (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h3 className="text-lg font-medium text-gray-900 mr-3">YouTube API</h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Enabled
                    </span>
                  </div>
                  <button
                    onClick={() => updateSettings({ youtubeApiEnabled: false })}
                    className="flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Disable
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      YouTube API Key
                    </label>
                    <input
                      type="password"
                      value={settings.youtubeApiKey}
                      onChange={(e) => updateSettings({ youtubeApiKey: e.target.value })}
                      placeholder="Enter your YouTube Data API v3 key"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Get API key from Google Cloud Console
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={testYouTubeAPI}
                      disabled={testing === 'youtube' || !settings.youtubeApiKey}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                    >
                      {testing === 'youtube' ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-4 w-4 mr-2" />
                          Test API
                        </>
                      )}
                    </button>
                    
                    {testResults.youtube && (
                      <div className={`flex items-center text-sm ${
                        testResults.youtube.success ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {testResults.youtube.success ? (
                          <CheckCircle className="h-4 w-4 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 mr-1" />
                        )}
                        {testResults.youtube.message}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!settings.youtubeApiEnabled && (
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">YouTube API (Disabled)</h3>
                <button
                  onClick={() => updateSettings({ youtubeApiEnabled: true })}
                  className="flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-colors bg-green-100 text-green-700 hover:bg-green-200"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Enable
                </button>
              </div>
            )}

            {/* Test All APIs */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">API Test Center</h3>
                  <p className="text-sm text-gray-600">Test all enabled APIs at once</p>
                </div>
                <button
                  onClick={testAllAPIs}
                  disabled={testing === 'all'}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {testing === 'all' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Testing All APIs...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Test All APIs
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your site settings and integrations.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {renderTabContent()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}