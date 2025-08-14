interface ExchangeRates {
  USD: number;
  EUR: number;
  GBP: number;
  lastUpdated: string;
}

// Multiple API providers for better reliability
interface CurrencyApiResponse {
  data?: {
    [key: string]: number;
  };
  meta?: {
    last_updated_at: string;
  };
  // Alternative format for different providers
  rates?: {
    [key: string]: number;
  };
  base?: string;
  date?: string;
}

export async function fetchExchangeRates(apiKey: string): Promise<ExchangeRates | null> {
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }

  // Try multiple API providers
  const providers = [
    {
      name: 'FreeCurrencyAPI',
      url: `https://api.freecurrencyapi.com/v1/latest?apikey=${apiKey}&currencies=EUR,GBP&base_currency=USD`
    },
    {
      name: 'CurrencyAPI',
      url: `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&currencies=EUR,GBP&base_currency=USD`
    },
    {
      name: 'ExchangeRate-API',
      url: `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    }
  ];

  for (const provider of providers) {
    try {
      const response = await fetch(provider.url);
      
      if (!response.ok) {
        if (response.status === 403) {
          console.error(`CurrencyAPI ${provider.name}: Invalid API key (403 Forbidden)`);
        } else if (response.status === 401) {
          console.error(`CurrencyAPI ${provider.name}: Unauthorized (401)`);
        } else if (response.status === 429) {
          console.error(`CurrencyAPI ${provider.name}: Rate limit exceeded (429)`);
        } else {
          console.error(`CurrencyAPI ${provider.name}: HTTP error ${response.status}`);
        }
        continue; // Try next provider
      }
      
      const data: CurrencyApiResponse = await response.json();
      
      // Handle different response formats
      let rates: { [key: string]: number } = {};
      
      if (data.data) {
        // FreeCurrencyAPI format
        rates = data.data;
      } else if (data.rates) {
        // ExchangeRate-API format
        rates = data.rates;
      } else {
        continue;
      }
      
      const result: ExchangeRates = {
        USD: 1, // Base currency
        EUR: Number(rates.EUR) || 0.85,
        GBP: Number(rates.GBP) || 0.73,
        lastUpdated: data.meta?.last_updated_at || data.date || new Date().toISOString()
      };
      
      return result;
      
    } catch (error) {
      continue; // Try next provider
    }
  }
  
  // All providers failed, return fallback rates
  return {
    USD: 1,
    EUR: Number(0.85),
    GBP: Number(0.73),
    lastUpdated: new Date().toISOString()
  };
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£'
  };
  
  return `${symbols[currency] || currency} ${amount.toFixed(4)}`;
}

export function formatLastUpdated(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just updated';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
  return date.toLocaleDateString();
}