# Performance & Monitoring Strategy

This document outlines the performance protocols and monitoring tools implemented for the Kenya Land Trust platform.

## 1. Core Web Vitals (Real-User Metrics)
Next.js Core Web Vitals are instrumented via `next/web-vitals` and reported directly to **Firebase Analytics** under the event `web_vitals`.

### Tracked Metrics:
- **LCP (Largest Contentful Paint)**: Target < 2.5s. Measures perceived loading speed.
- **FID (First Input Delay)**: Target < 100ms. Measures responsiveness.
- **CLS (Cumulative Layout Shift)**: Target < 0.1. Measures visual stability.
- **TTFB (Time to First Byte)**: Measures server responsiveness.

## 2. Firebase Performance Monitoring
The Firebase Performance SDK is initialized in production to provide:
- **Automated Trace**: "App Start" and "Screen Trace" durations.
- **Network Request Latency**: Tracking of Firestore and Server Action overhead.
- **Trace Customization**: Specific segments like AI Triage or Documentation Upload are tagged for bottleneck analysis.

## 2.1 Server Trace Collection

Post-launch tracing now records server action execution into `serverTraces` for:
- listing search and retrieval actions
- listing creation/update workflows
- analytics summary generation
- messaging conversation bootstrap

Each trace stores status (`ok`/`error`), duration, route context, and identifiers to support regression triage.

## 2.2 Performance Budgets & Regression Tracking

Client-side web vitals are validated against explicit budgets and breaches are recorded via `/api/monitoring/performance-budget` into `performanceBudgets`:
- **LCP** target: < 2500ms
- **INP** target: < 200ms
- **CLS** target: < 0.1

Budget violations are logged as telemetry events and can trigger ops spike alerts.

## 3. Image Optimization Protocol
We strictly follow Next.js optimization best-practices to ensure a high-trust, fast-loading visual experience:
- **Priority Loading**: All above-the-fold assets (Landing Hero, first 4 listing cards) use the `priority` attribute to optimize LCP.
- **Lazy Loading**: Grid-level listings and gallery thumbnails use native lazy-loading to preserve bandwidth.
- **Responsive Sizes**: All `Image` components implement `sizes` to ensure mobile devices do not download desktop-resolution assets.

## 4. Operational Maintenance
- **Turbopack**: Utilized in development for sub-100ms HMR (Hot Module Replacement).
- **ISR (Incremental Static Regeneration)**: Listing pages are revalidated on-demand after mutations to balance speed and data freshness.
- **Bundle Analysis**: Periodic audits are conducted to ensure client-side JS remains under 250KB (gzip).
