'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * WebVitals - Monitors Core Web Vitals and reports to Firebase Analytics.
 * Tracks LCP (Largest Contentful Paint), FID (First Input Delay), 
 * CLS (Cumulative Layout Shift), FCP (First Contentful Paint), and TTFB (Time to First Byte).
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (analytics) {
      // Log Core Web Vital metrics to Firebase Analytics
      logEvent(analytics, 'web_vitals', {
        metric_id: metric.id,
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
        metric_delta: metric.delta,
        page_path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      });
      
      // Specifically log LCP for high-trust speed monitoring
      if (metric.name === 'LCP') {
        logEvent(analytics, 'speed_lcp', {
          value: metric.value,
          id: metric.id,
        });
      }
    }
  });

  return null;
}
