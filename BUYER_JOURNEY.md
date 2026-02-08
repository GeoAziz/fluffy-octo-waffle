# Buyer Journey & Permissions Guide

## Overview
This document outlines the complete journey for a user with the `BUYER` role. It details their privileges, the features available to them, and the security mechanisms in place to enforce their permissions. The buyer experience is designed to be intuitive, secure, and transparent.

---

## 1. Key Privileges & Implemented Features

### Anonymous Browsing (No Login Required)
Anyone visiting the site has public access to core discovery features.

- **View Approved Listings**: Can browse and view the full details of any listing with an `approved` status.
- **Search & Filter**: Can use all search and filtering functionality on the homepage and `/explore` page.
- **Read Informational Pages**: Can access static content like `/trust`, `/contact`, `/terms`, and `/privacy`.

**Verification:**
- `firestore.rules` on `/listings/{listingId}` only `allow get, list` if `resource.data.status == 'approved'`.

### Authenticated Buyer (Logged In)
After signing up (which defaults to the `BUYER` role) or logging in, users gain access to personalized features.

- **Profile Management**:
  - **Privilege**: Can create and update their own user profile (display name, phone number).
  - **Location**: `/profile` page.
  - **Verification**: `firestore.rules` on `/users/{userId}` only allows a user to write to their own document (`allow write: if request.auth.uid == userId;`).

- **Favorites**:
  - **Privilege**: Can add or remove any listing from their personal "Favorites" list.
  - **Location**: Heart icon on listing cards; viewable at `/favorites`.
  - **Verification**: The `useFavorites()` hook writes to a `favorites` subcollection. `firestore.rules` on `/users/{userId}/favorites/{listingId}` ensures a user can only modify their own list.

- **Seller Communication**:
  - **Privilege**: Can initiate a new conversation with a seller from a listing page and exchange messages.
  - **Location**: "Contact Seller" button on a listing page; conversations are managed in the `/messages` inbox.
  - **Verification**: The `getOrCreateConversation` action creates a conversation document. `firestore.rules` on `/conversations/{conversationId}` restricts read/write access to participants (`request.auth.uid in resource.data.participantIds`).

- **Trust & Safety**:
  - **Privilege**: Can report a listing for review by an admin.
  - **Location**: `/report` page.
  - **Verification**: The `/api/report` endpoint accepts the submission and creates a document in the `listingReports` collection, which is only readable by admins.

---

## 2. How Permissions Are Enforced

The buyer's permissions are enforced at three key levels, creating a robust security model.

### Level 1: UI (What the User Sees)
- **File**: `src/components/buyer/buyer-header.tsx`
- **Logic**: This component uses the `useAuth()` hook to check if a user is logged in and what their role is. It then uses conditional rendering to show or hide UI elements.
- **Example**: It shows "Log in" and "Sign Up" buttons for anonymous users, but shows the user profile menu with links to "Favorites" and "Profile" for a logged-in buyer.

### Level 2: Middleware (Who Can Access a Page)
- **File**: `src/middleware.ts`
- **Logic**: This server-side function runs before a page is rendered. It checks for a valid session cookie on all protected routes.
- **Example**: If an unauthenticated user tries to access `/favorites`, the middleware intercepts the request and redirects them to `/login?redirect=/favorites`. It is the primary gatekeeper for page access.

### Level 3: Firestore Rules (Who Can Access Data)
- **File**: `firestore.rules`
- **Logic**: This is the most critical security layer. It defines the access control rules directly on the database. Even if the UI and middleware were bypassed, these rules would prevent unauthorized data access.
- **Example**: The rule `match /users/{userId} { allow write: if request.auth.uid == userId; }` guarantees that a user can *only* ever update their own profile, preventing them from maliciously editing another user's data.

---

## 3. Future Enhancements (What's Left to Be Done)

The core buyer journey is complete, secure, and functional. Future work could focus on adding value-add features:

- **Buyer Dashboard**: A central hub for buyers to see their recent activity, including new messages, saved properties, and recently viewed listings.
- **Saved Searches & Email Alerts**: An opt-in feature allowing buyers to save a set of search filters and receive an email notification when a new property matching their criteria is approved.
- **Property Comparison Tool**: A feature that would allow buyers to select 2-3 listings and view their key details in a side-by-side comparison table.
- **Integrated Tour Scheduling**: A system to request a site visit directly through the platform, with a shared calendar or scheduling assistant for the seller.
- **Offer Management System**: A formal workflow for a buyer to submit an offer on a property, which the seller can then accept, reject, or counter.

---
**Last Updated:** February 8, 2026
**Status:** Core Functionality Complete & Verified. Ready for future enhancements.