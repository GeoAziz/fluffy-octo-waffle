# Kenya Land Trust

A high-trust marketplace for verified land listings in Kenya. Focused on transparency, documentation-first protocols, and structural trust signals to solve endemic real estate fraud.

## 🚀 Core Purpose
Kenya Land Trust introduces a structured trust layer into Kenya's land transaction market. We create a verified, transparent space where buyers browse with confidence and sellers present documentation through credible signals.

## ⚠️ The Problem Space
Land transactions in Kenya are plagued by:
1. **Endemic Fraud**: Fake title deeds and double-allocation are common.
2. **Information Asymmetry**: Buyers cannot distinguish legitimate listings from scams.
3. **High Discovery Friction**: Travel costs and wasted site visits for unverified properties.
4. **Channel Instability**: Informal channels (WhatsApp/Facebook) offer zero accountability.

## 🛠 The Solution
We solve these issues through three interconnected mechanisms:

### 1. Progressive Trust Badge System
We quantify confidence through four distinct tiers:
- **Gold Badge**: Strong evidence with complete, verified documentation.
- **Silver Badge**: Substantial evidence provided and checked for basic validity.
- **Bronze Badge**: Initial evidence submission awaiting deep triage.
- **Suspicious**: Flagged inconsistencies or community-reported risk.

### 2. Structured Evidence Protocol
Sellers must vault supporting documents (Title Deeds, Survey Maps, ID Proof) to earn badges. This creates an accountability barrier that fraudulent actors avoid.

### 3. AI-Assisted Moderation
We use a GenAI-powered Trust Engine to:
- Perform OCR extraction on physical title deeds.
- Detect suspicious patterns across multiple documents.
- Generate factual summaries for admin review.
- Suggest trust tiers based on documentation completeness.

## 🏗 Technology Stack
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Shadcn UI
- **Backend**: Firebase Firestore (Real-time data), Firebase Auth (Session management), Cloud Storage (Secure evidence vault)
- **AI**: Genkit with Google Gemini 2.5 Flash
- **Design System**: "Hypercraft" Cinematic UI (Fluid typography, layered shadows, accessibility-first)

## 📦 Getting Started

### Prerequisites
- Node.js 20+
- Firebase Project
- Resend API Key (for notifications)

### Installation
```bash
npm install
npm run dev
```

### Environment Variables
```
RESEND_API_KEY=...
NEXT_PUBLIC_FIREBASE_API_KEY=...
# See docs/PERFORMANCE_MONITORING.md for details
```

## 📚 Documentation
- `docs/PERFORMANCE_MONITORING.md` - Core Web Vitals & Tracing
- `docs/COST_CONTROLS.md` - Firestore, storage lifecycle, AI quota guardrails
- `docs/BUYER_JOURNEY.md` - Permissions & UX Flow
- `docs/ADMIN_SETTINGS.md` - Platform Configuration
- `docs/ui-ux-review-audit.md` - Quality standards
- `docs/DEPLOYMENT_GUARDRAILS.md` - Required CI, branch protection, and Vercel launch checks
- `SECURITY.md` - Vulnerability reporting and disclosure policy

---
**Kenya Land Trust** is trust-as-a-feature. We build confidence before you engage professionals.
