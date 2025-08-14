import React from 'react';
import SeoHead from '../components/SeoHead';
import { useAdminStore } from '../lib/adminStore';

export default function About() {
  const siteName = useAdminStore(state => state.settings.siteName);

  return (
    <>
      <SeoHead
        title="About Us"
        description={`Learn about ${siteName} and our mission to provide expert financial advice and tools.`}
        path="/about"
      />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About {siteName}</h1>
          
          <div className="prose max-w-none">
            <p className="text-lg text-gray-700 mb-6">
              {siteName} is your trusted source for comprehensive financial information, expert advice, and powerful comparison tools. We're dedicated to helping you make informed decisions about your financial future.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              We believe that everyone deserves access to clear, unbiased financial information. Our mission is to demystify complex financial products and services, making it easier for you to compare options and choose what's best for your unique situation.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
              <li>Comprehensive reviews and comparisons of financial products</li>
              <li>Expert analysis and market insights</li>
              <li>Educational content to improve financial literacy</li>
              <li>Tools and calculators for financial planning</li>
              <li>Up-to-date information on rates, terms, and offers</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
            <p className="text-gray-700 mb-6">
              We're committed to providing accurate, up-to-date information while maintaining editorial independence. Our team of financial experts continuously monitors the market to ensure our content reflects the latest trends and opportunities.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <p className="text-blue-800">
                <strong>Disclaimer:</strong> The information provided on this website is for educational and informational purposes only. It should not be considered as financial advice. Always consult with qualified financial professionals before making important financial decisions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}