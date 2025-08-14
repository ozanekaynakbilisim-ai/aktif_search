import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from './apiClient';

export interface AdminSettings {
  // Branding
  siteName: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  accentColor: string;
  footerText: string;
  contactEmail: string;

  // SEO
  titlePattern: string;
  defaultMetaDescription: string;
  canonicalBaseUrl: string;
  robotsIndex: boolean;
  ogDefaults: {
    siteName: string;
    type: string;
    locale: string;
  };

  // Google CSE
  cxId: string;
  queryParam: string;
  safeSearch: string;
  asqGuard: boolean;
  customEmbedCode: string;

  // AI Info Box
  aiProvider: 'wikipedia' | 'duckduckgo' | 'openai';
  aiMaxWords: number;
  aiBaseUrl: string;
  aiModel: string;
  aiApiKey: string;

  // ChatGPT Content
  chatgptBaseUrl: string;
  chatgptModel: string;
  chatgptApiKey: string;
  chatgptSystemPrompt: string;
  chatgptTone: string;
  chatgptMinWords: number;
  chatgptIncludeFaq: boolean;

  // Ads
  adRules: {
    lowWordCount: number;
    lowWordAds: number;
    highWordAds: number;
  };
  adSizes: {
    mobile: string[];
    desktop: string[];
  };
  adPositions: string[];
  adCtaText: string;
  adPageLimit: number;

  // Analytics
  uetId: string;
  customScripts: string;
  consentGranted: boolean;

  // IndexNow
  indexNowApiKey: string;
  indexNowEnabled: boolean;

  // Content Automation
  contentAutomationEnabled: boolean;
  dailyContentLimit: number;
  hourlyContentLimit: number;

  // Social Media
  socialMediaEnabled: boolean;
  facebookAccessToken: string;
  twitterApiKey: string;
  linkedinAccessToken: string;

  // External APIs
  newsApiKey: string;
  newsApiEnabled: boolean;
  currencyApiKey: string;
  currencyApiEnabled: boolean;
  youtubeApiKey: string;
  youtubeApiEnabled: boolean;
  trendsApiEnabled: boolean;

  // Feature toggles
  aiEnabled: boolean;
  chatgptEnabled: boolean;
  adsEnabled: boolean;
  analyticsEnabled: boolean;

  // Custom Head Scripts
  customHeadScripts: string;

  // Webmaster Tools & Embed Codes
  googleSearchConsole: string;
  bingWebmasterTools: string;
  googleAnalytics: string;
  googleTagManager: string;
  facebookPixel: string;
  customEmbedCodes: Array<{
    id: string;
    name: string;
    code: string;
    enabled: boolean;
    position: 'head' | 'body' | 'footer';
  }>;

  // Admin Security
  adminUsername: string;
  adminPassword: string;
  adminSessionTimeout: number;
}

interface AdminStore {
  settings: AdminSettings;
  updateSettings: (updates: Partial<AdminSettings>) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetSettings: () => void;
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
}

const defaultSettings: AdminSettings = {
  siteName: 'FinanceAdd',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#1E40AF',
  accentColor: '#059669',
  footerText: '© 2025 FinanceAdd. All rights reserved.',
  contactEmail: 'contact@financeadd.com',

  titlePattern: '{title} | {siteName}',
  defaultMetaDescription: 'Expert financial advice and tools to help you make informed decisions about credit, loans, investing, and personal finance.',
  canonicalBaseUrl: 'https://financeadd.com',
  robotsIndex: true,
  ogDefaults: {
    siteName: 'FinanceAdd',
    type: 'website',
    locale: 'en_US'
  },

  cxId: import.meta.env.VITE_GOOGLE_CX || '',
  cxId: import.meta.env.VITE_GOOGLE_CX || '7301314c507bb45cf',
  queryParam: 'q',
  safeSearch: 'high',
  asqGuard: true,
  customEmbedCode: '',

  aiProvider: 'wikipedia',
  aiMaxWords: 80,
  aiBaseUrl: 'https://api.openai.com/v1',
  aiModel: 'gpt-3.5-turbo',
  aiApiKey: import.meta.env.VITE_AI_INFOBOX_API_KEY || '',

  chatgptBaseUrl: 'https://api.openai.com/v1',
  chatgptModel: 'gpt-3.5-turbo',
  chatgptApiKey: import.meta.env.VITE_CHATGPT_API_KEY || '',
  chatgptSystemPrompt: 'You are a senior SEO finance writer. Create comprehensive, accurate, and engaging financial content that helps readers make informed decisions.',
  chatgptTone: 'Professional',
  chatgptMinWords: 800,
  chatgptIncludeFaq: true,

  adRules: {
    lowWordCount: 400,
    lowWordAds: 1,
    highWordAds: 2
  },
  adSizes: {
    mobile: ['320x100'],
    desktop: ['728x90', '300x250']
  },
  adPositions: ['afterIntro', 'midContent'],
  adCtaText: 'Show Related Results',
  adPageLimit: 3,

  uetId: import.meta.env.VITE_MS_UET_ID || '',
  customScripts: '',
  consentGranted: false,

  indexNowApiKey: '',
  indexNowEnabled: false,

  contentAutomationEnabled: false,
  dailyContentLimit: 12,
  hourlyContentLimit: 1,

  socialMediaEnabled: false,
  facebookAccessToken: '',
  twitterApiKey: '',
  linkedinAccessToken: '',

  newsApiKey: 'e227184aaeae4694bcc1f8ecb89e6ed6',
  newsApiEnabled: true,
  currencyApiKey: '',
  currencyApiEnabled: false,
  youtubeApiKey: '',
  youtubeApiEnabled: false,
  trendsApiEnabled: false,

  aiEnabled: true,
  chatgptEnabled: false,
  adsEnabled: true,
  analyticsEnabled: false,

  customHeadScripts: '',

  googleSearchConsole: '',
  bingWebmasterTools: '',
  googleAnalytics: '',
  googleTagManager: '',
  facebookPixel: '',
  customEmbedCodes: [],

  adminUsername: 'admin',
  adminPassword: 'admin123',
  adminSessionTimeout: 60 // minutes
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      isAuthenticated: false,
      
      updateSettings: async (updates) => {
        const newSettings = { ...get().settings, ...updates };
        set({ settings: newSettings });
        
        try {
          await apiClient.updateSettings(newSettings);
        } catch (error) {
          console.error('Failed to save settings to database:', error);
          // Revert local changes if database update fails
          set({ settings: get().settings });
          throw error;
        }
      },
      
      loadSettings: async () => {
        try {
          const serverSettings = await apiClient.getSettings();
          const mergedSettings = { ...defaultSettings, ...serverSettings };
          set({ settings: mergedSettings });
        } catch (error) {
          console.error('Failed to load settings from database:', error);
          // Use default settings if loading fails
          set({ settings: defaultSettings });
        }
      },
      
      resetSettings: () => set({ settings: defaultSettings }),
      setAuthenticated: (auth) => set({ isAuthenticated: auth })
    }),
    {
      name: 'admin-settings',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);