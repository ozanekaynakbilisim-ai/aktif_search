export function isMobile(): boolean {
  return window.innerWidth < 768;
}

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getAdSize(position: string): string {
  const device = getDeviceType();
  
  if (device === 'mobile') {
    return '320x100';
  }
  
  // Desktop/tablet
  if (position === 'afterIntro') {
    return '728x90';
  }
  
  return '300x250';
}