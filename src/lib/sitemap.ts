import { articleRepo, categoryRepo } from './repo';
import { useAdminStore } from './adminStore';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export function generateSitemap(): string {
  const settings = useAdminStore.getState().settings;
  const baseUrl = settings.canonicalBaseUrl;
  
  const urls: SitemapUrl[] = [];

  // Homepage
  urls.push({
    loc: baseUrl,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: 1.0
  });

  // Static pages
  const staticPages = ['/about', '/contact'];
  staticPages.forEach(page => {
    urls.push({
      loc: `${baseUrl}${page}`,
      lastmod: new Date().toISOString(),
      changefreq: 'monthly',
      priority: 0.8
    });
  });

  // Categories
  const categories = categoryRepo.getAll();
  categories.forEach(category => {
    urls.push({
      loc: `${baseUrl}/category/${category.slug}`,
      lastmod: new Date().toISOString(),
      changefreq: 'weekly',
      priority: 0.9
    });
  });

  // Articles
  const articles = articleRepo.getAll().filter(a => a.status === 'published');
  articles.forEach(article => {
    urls.push({
      loc: `${baseUrl}/article/${article.slug}`,
      lastmod: article.publishDate,
      changefreq: 'monthly',
      priority: 0.7
    });
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
}

export function downloadSitemap(): void {
  const xml = generateSitemap();
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}