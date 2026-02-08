# Kenya Land Trust

A marketplace for verified land listings in Kenya — focused on transparency, documentation-first listings, and trust signals (Gold / Silver / Bronze badges) to help buyers make informed decisions.

## Purpose & Goals

- Provide a trustworthy place for buyers and sellers to transact land with clear documentation.
- Surface trust signals and documentation quality so buyers can quickly assess listings.
- Offer seller tools and an admin workspace to manage verification workflows and moderate content.

## Key Features

- Buyer-facing landing page with listings, filters, trust badge legend, and testimonials
- Seller workspace: dashboard, listings management, upload flow
- Admin workspace: analytics, inbox, listings moderation
- Trust badges (Gold/Silver/Bronze) that summarize documentation completeness
- Firebase Auth + Firestore for data storage and session management
- AI flows for document summarization and suggested listing descriptions (optional)
- Tailwind CSS + Radix UI + lucide icons

## Quick Start (local development)

Requirements:

- Node.js 18+ (or the version in `engines` in `package.json`)
- npm or yarn
- A Firebase project and service account key to enable admin API usage (optional for some features)

Steps:

1. Install dependencies:

```bash
npm install
```

2. Add environment variables (copy `.env.example` if present) and place a `serviceAccountKey.json` in the project root if you need admin server features.

3. Start the dev server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Directory overview

- `src/app` — Next.js app routes and route group layouts (`(buyer)`, `(seller)`, `admin`)
- `src/components` — UI components used across the app (buyer/seller/admin sections, UI primitives)
- `src/lib` — helpers, firebase clients, types
- `src/ai/flows` — AI flows used to assist description generation and document analysis
- `scripts` — utility scripts (e.g. test helpers)

## Important files

- `src/app/layout.tsx` — root layout (global providers)
- `src/app/(buyer)/layout.tsx` — buyer landing layout, header & footer
- `src/app/(seller)/layout.tsx` — seller workspace layout with sidebar
- `src/app/admin/layout.tsx` — admin workspace layout with sidebar
- `src/components/buyer/badge-legend.tsx` — explains trust badges
- `src/components/buyer/landing-hero.tsx` — hero & CTA for landing page

## Notes & Troubleshooting

- If you see Google Fonts network errors, the project is set to rely on system fonts — no external google font fetch required.
- Footer appearing sticky: ensure layouts use `min-h-screen` and `flex` column with `flex-1` main content. See `src/app/layout.tsx` and `src/app/(buyer)/layout.tsx` for examples.
- If Firebase admin operations fail locally, double-check `serviceAccountKey.json` and `.env` values.

## Contributing

- Follow existing code patterns for route groups and components.
- Run lint/tests before opening PRs:

```bash
npm run lint
npm test
```

If you'd like me to add docs pages (like a guided 'How Trust Badges Work' walkthrough, tests, or CI instructions), tell me which one to prioritize next.

---
Generated and maintained by the project maintainers.
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.
