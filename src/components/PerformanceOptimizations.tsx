import { useEffect } from 'react';

export default function PerformanceOptimizations() {
  useEffect(() => {
    // Preload critical assets
    const preloadAssets = () => {
      const criticalAssets = [
        '/images/manglanam.png',
        '/images/FSSAI.svg',
        '/images/pepper.svg'
      ];

      criticalAssets.forEach(asset => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = asset.endsWith('.svg') ? 'image/svg+xml' : 'image';
        link.href = asset;
        document.head.appendChild(link);
      });
    };

    // Add resource hints
    const addResourceHints = () => {
      const hints = [
        { rel: 'dns-prefetch', href: 'https://manglanam.com' },
        { rel: 'preconnect', href: 'https://manglanam.com' }
      ];

      hints.forEach(hint => {
        const link = document.createElement('link');
        link.rel = hint.rel;
        link.href = hint.href;
        document.head.appendChild(link);
      });
    };

    // Implement lazy loading for images
    const setupLazyLoading = () => {
      if ('loading' in HTMLImageElement.prototype) {
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
          (img as HTMLImageElement).src = (img as HTMLImageElement).dataset.src;
        });
      } else {
        // Fallback for browsers that don't support native lazy loading
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(script);
      }
    };

    // Add performance monitoring
    const setupPerformanceMonitoring = () => {
      if ('performance' in window) {
        window.addEventListener('load', () => {
          const timing = window.performance.timing;
          const loadTime = timing.loadEventEnd - timing.navigationStart;
          console.log(`Page load time: ${loadTime}ms`);
        });
      }
    };

    preloadAssets();
    addResourceHints();
    setupLazyLoading();
    setupPerformanceMonitoring();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return null;
} 