import React from 'react';
import { Helmet } from 'react-helmet-async';
import { generateTitle, generateCanonical } from '../lib/seo';
import { useAdminStore } from '../lib/adminStore';

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  articleData?: {
    author: string;
    publishDate: string;
    modifiedDate?: string;
  };
  jsonLd?: object[];
}

export default function SeoHead({ 
  title, 
  description, 
  path, 
  ogImage, 
  articleData,
  jsonLd = [] 
}: SeoHeadProps) {
  const settings = useAdminStore(state => state.settings);
  const fullTitle = generateTitle(title);
  const canonical = generateCanonical(path);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={articleData ? 'article' : 'website'} />
      <meta property="og:site_name" content={settings.siteName} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Article specific */}
      {articleData && (
        <>
          <meta property="article:author" content={articleData.author} />
          <meta property="article:published_time" content={articleData.publishDate} />
          {articleData.modifiedDate && (
            <meta property="article:modified_time" content={articleData.modifiedDate} />
          )}
        </>
      )}
      
      {/* Robots */}
      <meta name="robots" content={settings.robotsIndex ? 'index,follow' : 'noindex,nofollow'} />
      
      {/* JSON-LD */}
      {jsonLd.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}