import React from 'react';
import { Link } from 'react-router-dom';
import { useAdminStore } from '../lib/mysqlAdminStore';

export default function Footer() {
  const { siteName, footerText, contactEmail } = useAdminStore(state => state.settings);

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4">{siteName}</h3>
            <p className="text-gray-300 mb-4">
              Your trusted source for financial advice, tools, and comparisons.
            </p>
            <p className="text-sm text-gray-400">
              Contact: <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Disclaimer */}
          <div>
            <h3 className="text-lg font-bold mb-4">Disclaimer</h3>
            <p className="text-sm text-gray-300">
              Information provided is for educational purposes only. Always consult with qualified financial professionals before making financial decisions.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">{footerText}</p>
        </div>
      </div>
    </footer>
  );
}