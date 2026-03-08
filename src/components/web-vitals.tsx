'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { analytics } from '@/lib/firebase';
import { logEvent } from 'firebase/analytics';

/**
 * WebVitals - Monitors Core Web Vitals and reports to Firebase Analytics.
 * Tracks LCP, FID, CLS, FCP, and TTFB.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (analytics) {
      // Use metric name as event name, or a generic 'web_vitals' event
      logEvent(analytics, 'web_vitals', {
        metric_id: metric.id,
        metric_name: metric.name,
        metric_value: metric.value,
        metric_rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
        metric_delta: metric.delta,
        page_path: window.location.pathname,
      });
      
      // Also log specific event for better filtering in console
      logEvent(analytics, `vitals_${metric.name.toLowerCase()}`, {
        value: metric.value,
        id: metric.id,
      });
    }
  });

  return null;
}
