import { useAdminStore } from './adminStore';

export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  articleData?: {
    author: string;
    publishDate: string;
    modifiedDate?: string;
  };
}

export function generateTitle(pageTitle: string): string {
  const { siteName, titlePattern } = useAdminStore.getState().settings;
  return titlePattern
    .replace('{title}', pageTitle)
    .replace('{siteName}', siteName);
}

export function generateCanonical(path: string): string {
  const { canonicalBaseUrl } = useAdminStore.getState().settings;
  return `${canonicalBaseUrl}${path}`;
}

export function generateArticleJSONLD(article: any, category: any): object {
  const settings = useAdminStore.getState().settings;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: settings.siteName,
      logo: {
        '@type': 'ImageObject',
        url: settings.logoUrl
      }
    },
    datePublished: article.publishDate,
    dateModified: article.publishDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': generateCanonical(`/article/${article.slug}`)
    },
    image: article.heroImage,
    articleSection: category.name
  };
}

export function generateBreadcrumbJSONLD(items: Array<{ name: string; url: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}