import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  schema?: any;
}

export default function SEO({ 
  title, 
  description, 
  image = 'https://manglanam.com/images/manglanam.png',
  url = 'https://manglanam.com',
  type = 'website',
  schema
}: SEOProps) {
  const fullTitle = `${title} | Manglanam Naturals`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Schema.org Markup */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
} 