import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { fetchExchangeRates, formatCurrency, formatLastUpdated } from '../lib/currencyApi';
import { useAdminStore } from '../lib/adminStore';

interface CurrencyWidgetProps {
  className?: string;
  compact?: boolean;
}

export default function CurrencyWidget({ className = '', compact = false }: CurrencyWidgetProps) {
  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const settings = useAdminStore(state => state.settings);

  useEffect(() => {
    async function loadRates() {
      if (!settings.currencyApiEnabled || !settings.currencyApiKey) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const fetchedRates = await fetchExchangeRates(settings.currencyApiKey);
        
        if (fetchedRates) {
          setRates(fetchedRates);
        } else {
          setError('Failed to load exchange rates');
        }
      } catch (err) {
        setError('Currency API error');
        console.error('Currency rates error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadRates();
    
    // Refresh rates every 5 minutes
    const interval = setInterval(loadRates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.currencyApiKey, settings.currencyApiEnabled]);

  if (!settings.currencyApiEnabled || !settings.currencyApiKey) return null;

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-3 w-24"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !rates) return null;

  if (compact) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-3 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-3">
            <span className="font-medium">USD/EUR: {rates.EUR.toFixed(4)}</span>
            <span className="font-medium">USD/GBP: {rates.GBP.toFixed(4)}</span>
          </div>
          <DollarSign className="h-4 w-4 text-green-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">Live Exchange Rates</h3>
        <DollarSign className="h-4 w-4 text-green-600" />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">USD/EUR</span>
          <span className="font-medium">{rates.EUR.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">USD/GBP</span>
          <span className="font-medium">{rates.GBP.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Base</span>
          <span className="font-medium">USD 1.0000</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Updated {formatLastUpdated(rates.lastUpdated)}</span>
          <RefreshCw className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}