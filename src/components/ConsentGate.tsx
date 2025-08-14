import React, { useState, useEffect } from 'react';
import { useAdminStore } from '../lib/adminStore';
import { grantConsent, revokeConsent, loadUETIfConsented } from '../lib/consent';

export default function ConsentGate() {
  const [showModal, setShowModal] = useState(false);
  const consentGranted = useAdminStore(state => state.settings.consentGranted);

  useEffect(() => {
    // Check if consent decision has been made
    const hasDecided = localStorage.getItem('consent-decided');
    if (!hasDecided) {
      setShowModal(true);
    } else if (consentGranted) {
      loadUETIfConsented();
    }
  }, [consentGranted]);

  const handleAccept = () => {
    grantConsent();
    localStorage.setItem('consent-decided', 'true');
    setShowModal(false);
  };

  const handleDecline = () => {
    revokeConsent();
    localStorage.setItem('consent-decided', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Cookie Consent
        </h2>
        
        <p className="text-gray-700 mb-6">
          We use cookies and tracking technologies to improve your experience, analyze site usage, and provide personalized content. This includes Microsoft UET for analytics.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Accept All
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Decline
          </button>
        </div>
        
        <p className="text-xs text-gray-500 mt-4 text-center">
          You can change your preferences anytime in the admin settings.
        </p>
      </div>
    </div>
  );
}