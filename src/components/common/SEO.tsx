import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export const SEO = ({
  title = 'DakShiksha - GDS Training Platform',
  description = 'Complete training platform for India Post GDS exam preparation. Study materials, video lectures, practice tests, and more.',
  keywords = 'GDS, India Post, exam preparation, study materials, online learning, postal exam',
  image = '/hero.png',
  url,
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', 'DakShiksha Team');
    updateMetaTag('robots', 'index, follow');

    // Open Graph meta tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', 'website', true);
    updateMetaTag('og:site_name', 'DakShiksha', true);

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Additional SEO tags
    updateMetaTag('theme-color', '#C8102E');
    updateMetaTag('application-name', 'DakShiksha');
    updateMetaTag('apple-mobile-web-app-title', 'DakShiksha');
  }, [title, description, keywords, image, currentUrl]);

  return null;
};
