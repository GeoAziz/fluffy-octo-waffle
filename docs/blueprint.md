# **App Name**: Kenya Land Trust

## Core Features:

- Listing Creation: Allow sellers to create land listings with details like location, price, and description.
- Evidence Upload: Enable sellers to upload supporting documents (title, agreements, surveys) as evidence.
- Admin Evidence Review: Provide admins with a dashboard to review uploaded evidence.
- Badge Assignment: Allow admins to assign trust badges (EvidenceSubmitted, EvidenceReviewed, TrustedSignal, Suspicious) to listings.
- Public Listing Display: Display listings with associated metadata and trust badges to potential buyers.
- Suspicious Pattern Detection: Use AI to automatically flag suspicious patterns in uploads.
- Evidence Summarization: Use AI tool to create a brief, factual summary of uploaded evidence documents for admin review.

## Style Guidelines:

- Primary color: Deep Green (#0F3D2E) symbolizes land, stability, Kenya context, and trust
- Secondary color: Warm Sand (#F4F1EC) for backgrounds, cards, neutral reading surface
- Accent (Positive) color: Muted Blue (#2F6F95) for actions, links, verified review states
- Warning color: Amber (#C58B2E) for incomplete evidence, caution signals
- Risk / Suspicious color: Muted Red (#8C2F39); Never bright red; no panic colors
- Primary Font: Inter, Headings: Medium weight, tight tracking, Body: Regular, generous line height
- Top Navigation (Sticky): Logo (left), Primary navigation (center), Auth / User Menu (right)
- Main Content Column: Max width: 1200px, Reading-first layouts
- Context Sidebar (Desktop): Trust warnings, Badge explanations, Evidence summaries
- Footer: Legal disclaimers, Trust philosophy, Contact & reporting
- Badge appearance: soft fade + slight scale (200ms)
- Evidence upload: progress bar with checksum confirmation
- Admin review actions: state transition animation (Reviewed → Badge Issued)
- Page transitions: quick opacity fade only