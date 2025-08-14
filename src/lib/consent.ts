import { useAdminStore } from './adminStore';

export function hasConsent(): boolean {
  return useAdminStore.getState().settings.consentGranted;
}

export function grantConsent(): void {
  useAdminStore.getState().updateSettings({ consentGranted: true });
  loadUETIfConsented();
}

export function revokeConsent(): void {
  useAdminStore.getState().updateSettings({ consentGranted: false });
}

export function loadUETIfConsented(): void {
  if (!hasConsent()) return;
  
  const uetId = useAdminStore.getState().settings.uetId;
  if (!uetId) return;
  
  // Load Microsoft UET script
  if (!document.querySelector(`script[src*="bat.bing.com"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://bat.bing.com/bat.js';
    script.onload = () => {
      (window as any).uetq = (window as any).uetq || [];
      (window as any).uetq.push('pageLoad');
    };
    document.head.appendChild(script);
  }
}