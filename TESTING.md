# Testing Guide

This document describes the testing strategy, how to run tests, and how to extend them.

---

## Overview

| Layer | Framework | Files | Count |
|-------|-----------|-------|-------|
| Unit / Integration | Vitest + React Testing Library | `__tests__/**` | 51 tests |
| E2E | Playwright | `e2e/**` | 18 tests |
| **Total** | | | **69 tests** |

---

## Running Tests

### Unit Tests

```bash
# Run once
npm test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage report
npm run test:coverage

# Interactive UI
npm run test:ui
```

### E2E Tests

> E2E tests require the Next.js app to be running. Playwright will start the dev server automatically if it is not already running.

```bash
# Run all E2E tests (headless)
npm run e2e

# Run with browser visible
npm run e2e:headed

# Interactive debugger
npm run e2e:debug
```

### All Tests (Unit + E2E)

```bash
npm run test:all
```

---

## Test Structure

```
.
├── __tests__/                  # Unit / integration tests (Vitest)
│   ├── app/api/
│   │   ├── conversations.test.ts   # Conversation data model tests
│   │   └── listings.test.ts        # /api/listings route handler
│   ├── components/
│   │   ├── BecomeSellerModal.test.tsx
│   │   ├── OnboardingGuard.test.tsx
│   │   └── PermissionGuard.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   ├── lib/
│   │   ├── auth-helpers.test.ts    # validateRedirect security checks
│   │   └── role-helpers.test.ts    # Workspace navigation + seller tier
│   └── middleware.test.ts          # Route protection logic
│
├── e2e/                        # End-to-End tests (Playwright)
│   ├── auth.spec.ts            # Login / signup / redirect
│   ├── authorization.spec.ts   # Protected routes for unauthenticated users
│   ├── buyer-journey.spec.ts   # Homepage, explore, buyer routes
│   ├── seller-journey.spec.ts  # Seller dashboard route protection
│   ├── admin-journey.spec.ts   # Admin route protection
│   ├── messaging.spec.ts       # Messaging route protection
│   └── onboarding.spec.ts      # Onboarding route protection
│
└── tests/                      # Shared test infrastructure
    ├── fixtures/
    │   ├── auth.ts             # Mock user profiles (buyer, seller, admin)
    │   ├── firebase.ts         # Firebase mock helpers
    │   └── mock-data.ts        # Mock listings, conversations, notifications
    └── utils/
        └── test-helpers.ts     # renderWithProviders, createMockRequest, etc.
```

---

## Coverage

Coverage is collected when you run `npm run test:coverage`. Reports are written to:

- **Terminal** – summary table
- `coverage/index.html` – full interactive HTML report (open in browser)

Coverage thresholds are set in `vitest.config.ts`:

```
Lines:      65%
Functions:  65%
Branches:   60%
Statements: 65%
```

These thresholds are enforced as the post-launch baseline.

---

## Firebase Emulator (Local E2E with auth)

The E2E suite includes an authenticated post-launch workflow test in `e2e/post-launch-authenticated-flow.spec.ts` (seller create + evidence upload → admin approval → buyer messaging). To run authenticated flows locally:

1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Start the emulator suite:
   ```bash
   firebase emulators:start --only auth,firestore
   ```
   Default ports: Auth `9099`, Firestore `8080`, UI `4000`
3. Set the environment variables:
   ```bash
   NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true npm run dev
   ```
4. Provide test credentials (or use defaults defined in `e2e/helpers/auth.ts`):
  ```bash
  export E2E_ADMIN_EMAIL="admin@kenyalandtrust.co.ke"
  export E2E_ADMIN_PASSWORD="Password123!"
  export E2E_SELLER_EMAIL="sales@metroestates.co.ke"
  export E2E_SELLER_PASSWORD="Password123!"
  export E2E_BUYER_EMAIL="kamau.tech@gmail.com"
  export E2E_BUYER_PASSWORD="Password123!"
  export E2E_REAL_AUTH="true"
  ```
5. Run E2E tests against the running dev server:
   ```bash
   npm run e2e
   ```

### Troubleshooting: `Session creation failed with status 401`

If authenticated E2E flows fail with a 401 from `/api/auth/session`, your Firebase client auth and server admin auth are likely pointed at different projects.

- Verify the web SDK config used by the app (API key/project) and `serviceAccountKey.json` belong to the same Firebase project.
- If running emulators, ensure both client and server are configured for emulator mode.
- Keep `E2E_REAL_AUTH=true` only when this alignment is confirmed.

---

## Writing New Tests

### Unit Test (Vitest)

1. Create a file in `__tests__/` with a `.test.ts` or `.test.tsx` extension.
2. Use the `@` path alias (e.g. `@/lib/utils`) – it maps to `src/`.
3. Mock external dependencies with `vi.mock()`.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { myFunction } from '@/lib/my-module';

vi.mock('@/lib/some-dependency', () => ({ helper: vi.fn() }));

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected output');
  });
});
```

### E2E Test (Playwright)

1. Create a file in `e2e/` with a `.spec.ts` extension.
2. Use `page.goto()` with paths relative to `http://localhost:9002`.

```typescript
import { test, expect } from '@playwright/test';

test('my page loads', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page.getByRole('heading', { name: 'My Page' })).toBeVisible();
});
```

---

## CI/CD

Tests run automatically on every **push to `main`** and every **pull request** via GitHub Actions (`.github/workflows/ci.yml`).

The workflow:

1. **Unit Tests job** – lint + vitest with coverage → uploads `coverage/` as an artifact.
2. **E2E Tests job** (after unit tests pass) – builds the app → runs Playwright → uploads `playwright-report/` as an artifact.

Download the artifacts from the GitHub Actions run to view detailed reports.
