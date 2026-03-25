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
    const budgets: Record<string, number> = {
      LCP: 2500,
      INP: 200,
      CLS: 0.1,
    };

    const budget = budgets[metric.name];
    const isBudgetBreach = typeof budget === 'number' && metric.value > budget;

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

      if (isBudgetBreach) {
        logEvent(analytics, 'web_vitals_budget_breach', {
          metric_name: metric.name,
          metric_value: metric.value,
          threshold: budget,
          page_path: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        });
      }
    }

    if (isBudgetBreach) {
      fetch('/api/monitoring/performance-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: metric.name,
          value: metric.value,
          threshold: budget,
          pagePath: typeof window !== 'undefined' ? window.location.pathname : 'unknown',
        }),
        keepalive: true,
      }).catch(() => {
        // Silent fail for telemetry path.
      });
    }
  });

  return null;
}
