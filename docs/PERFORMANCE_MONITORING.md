# Performance & Monitoring Guide

This document outlines the performance strategy and monitoring tools implemented for the Kenya Land Trust platform.

## 1. Firebase Performance Monitoring
Firebase Performance is enabled for automatic tracing of:
- **Page Load Time**: Duration from request to page fully interactive.
- **Network Requests**: Latency and success rates of Firestore and internal API calls.
- **App Start**: Cold-start performance.

To view these metrics:
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Select **Performance** from the left navigation.
3. Review the "Dashboard" for automated traces and "Network" for API performance.

## 2. Core Web Vitals (Real-User Metrics)
Next.js Core Web Vitals are instrumented and reported to **Firebase Analytics** under the event name `web_vitals`.

### Tracked Metrics:
- **LCP (Largest Contentful Paint)**: Measures loading performance. Target: **< 2.5s**.
- **FID (First Input Delay)**: Measures interactivity. Target: **< 100ms**.
- **CLS (Cumulative Layout Shift)**: Measures visual stability. Target: **< 0.1**.
- **FCP (First Contentful Paint)**: Time to first text/image.
- **TTFB (Time to First Byte)**: Server responsiveness.

To analyze these in Firebase:
1. Go to **Analytics** -> **Events**.
2. Search for the `web_vitals` event.
3. Use the `metric_name` and `metric_value` parameters to build reports.

## 3. Image Optimization Strategy
We utilize the `next/image` component with the following optimizations:
- **Lazy Loading**: Default for all listing grid images to reduce initial bandwidth.
- **Priority Loading**: The `priority` attribute is used for:
  - Landing page hero image.
  - First image in property carousels.
  - Featured listings thumbnails.
- **Dynamic Sizes**: The `sizes` attribute is configured to inform the browser of the expected display width, preventing high-DPI devices from downloading unnecessarily large assets.

## 4. Lighthouse Audits
We recommend running Lighthouse audits during development to maintain performance thresholds.
- **Goal Score**: 90+ across all categories.
- **Focus**: Accessibility, SEO, and Performance.

## 5. Maintenance
- **API Performance**: Monitor the `/api/admin/settings` and `/api/listings` endpoints for latency spikes.
- **Asset Size**: Ensure any new UI illustrations are provided in optimized SVG or WebP formats.
