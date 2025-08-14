import React, { useState } from 'react';
import { Download, Send, Globe, Search, FileText } from 'lucide-react';
import { generateSitemap, downloadSitemap } from '../lib/sitemap';
import { submitToIndexNow, pingSearchEngines } from '../lib/indexnow';
import { useAdminStore } from '../lib/adminStore';

export default function SEOTools() {
  const [indexNowUrls, setIndexNowUrls] = useState('');
  const [indexNowLoading, setIndexNowLoading] = useState(false);
  const [pingLoading, setPingLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  
  const settings = useAdminStore(state => state.settings);
  const updateSettings = useAdminStore(state => state.updateSettings);

  const handleIndexNowSubmit = async () => {
    if (!settings.indexNowApiKey || !indexNowUrls.trim()) {
      alert('Please configure IndexNow API key and enter URLs.');
      return;
    }

    setIndexNowLoading(true);
    const urls = indexNowUrls.split('\n').map(u => u.trim()).filter(u => u);
    
    try {
      const result = await submitToIndexNow(urls, settings.indexNowApiKey);
      setResults({ type: 'indexnow', ...result });
    } catch (error) {
      setResults({ type: 'indexnow', success: false, message: 'Submission failed' });
    } finally {
      setIndexNowLoading(false);
    }
  };

  const handleSearchEnginePing = async () => {
    setPingLoading(true);
    const sitemapUrl = `${settings.canonicalBaseUrl}/sitemap.xml`;
    
    try {
      const result = await pingSearchEngines([sitemapUrl]);
      setResults({ type: 'ping', ...result });
    } catch (error) {
      setResults({ type: 'ping', google: false, bing: false, yandex: false });
    } finally {
      setPingLoading(false);
    }
  };

  const handleGenerateRobotsTxt = () => {
    const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${settings.canonicalBaseUrl}/sitemap.xml

# Block admin area
Disallow: /admin/

# Block search results
Disallow: /*?q=*
Disallow: /*&q=*`;

    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Tools</h1>
        <p className="text-gray-600">Manage sitemaps, IndexNow, and search engine submissions.</p>
      </div>

      {/* IndexNow Settings */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">IndexNow Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IndexNow API Key
            </label>
            <input
              type="text"
              value={settings.indexNowApiKey}
              onChange={(e) => updateSettings({ indexNowApiKey: e.target.value })}
              placeholder="Enter your IndexNow API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="indexNowEnabled"
              checked={settings.indexNowEnabled}
              onChange={(e) => updateSettings({ indexNowEnabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="indexNowEnabled" className="ml-2 text-sm text-gray-700">
              Enable automatic IndexNow submissions
            </label>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URLs to Submit (one per line)
          </label>
          <textarea
            value={indexNowUrls}
            onChange={(e) => setIndexNowUrls(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder={`${settings.canonicalBaseUrl}/article/example-article\n${settings.canonicalBaseUrl}/category/example-category`}
          />
        </div>

        <button
          onClick={handleIndexNowSubmit}
          disabled={indexNowLoading || !settings.indexNowApiKey}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center"
        >
          {indexNowLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit to IndexNow
            </>
          )}
        </button>
      </div>

      {/* Sitemap Tools */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Sitemap Management</h2>
        
        <div className="flex gap-4">
          <button
            onClick={downloadSitemap}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Sitemap
          </button>
          
          <button
            onClick={handleGenerateRobotsTxt}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate Robots.txt
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Sitemap URL:</strong> {settings.canonicalBaseUrl}/sitemap.xml
          </p>
        </div>
      </div>

      {/* Search Engine Ping */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Search Engine Ping</h2>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Direct browser-based pings may be blocked by CORS policy. 
            For reliable search engine notifications, consider implementing a server-side solution.
          </p>
        </div>
        
        <button
          onClick={handleSearchEnginePing}
          disabled={pingLoading}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors flex items-center"
        >
          {pingLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Pinging...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2" />
              Ping Search Engines
            </>
          )}
        </button>
        
        <p className="text-sm text-gray-600 mt-2">
          This will notify Google, Bing, and Yandex about your sitemap updates.
        </p>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Results</h2>
          
          {results.type === 'indexnow' && (
            <div className={`p-4 rounded-lg ${results.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <p className="font-medium">
                {results.success ? '✅ IndexNow Submission Successful' : '❌ IndexNow Submission Failed'}
              </p>
              {results.message && <p className="text-sm mt-1">{results.message}</p>}
            </div>
          )}
          
          {results.type === 'ping' && (
            <div className="space-y-2">
              {results.error && (
                <div className="p-3 rounded-lg bg-yellow-50 text-yellow-800 mb-3">
                  <p className="text-sm">{results.error}</p>
                </div>
              )}
              <div className={`p-3 rounded-lg ${results.google ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                Google: {results.google ? '✅ Success' : '❌ Not Available (Requires Authentication)'}
              </div>
              <div className={`p-3 rounded-lg ${results.bing ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                Bing: {results.bing ? '✅ Attempted' : '❌ CORS Blocked'}
              </div>
              <div className={`p-3 rounded-lg ${results.yandex ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                Yandex: {results.yandex ? '✅ Attempted' : '❌ CORS Blocked'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}