# Testing Guide - Kenya Land Trust

This document outlines the testing strategy, setup, and best practices for the Kenya Land Trust marketplace.

## Table of Contents

- [Testing Overview](#testing-overview)
- [Setup & Installation](#setup--installation)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Coverage Targets](#coverage-targets)
- [Best Practices](#best-practices)
- [Mocking & Fixtures](#mocking--fixtures)
- [Troubleshooting](#troubleshooting)

---

## Testing Overview

Kenya Land Trust uses a **three-layer testing strategy** for comprehensive coverage:

| Layer | Tool | Path | Purpose |
|-------|------|------|---------|
| **Unit Tests** | Jest + React Testing Library | `src/**/__tests__/*.test.ts(x)` | Test utilities, hooks, components in isolation |
| **Integration Tests** | Jest + Mocked Firebase | `src/**/__tests__/*.test.ts(x)` | Test server actions, auth flows, data layer |
| **E2E Tests** | Playwright | `tests/e2e/*.spec.ts` | Test critical user journeys end-to-end |

### Test Stack

```json
{
  "jest": "^29.0.0",                        // Test runner
  "react-test-library": "^14.0.0",          // Component testing
  "jest-mock-extended": "^3.0.0",           // Advanced mocking
  "@testing-library/user-event": "^14.0.0", // User interaction simulation
  "@playwright/test": "^1.40.0",            // E2E browser testing
  "jest-environment-jsdom": "^29.0.0"       // DOM environment for Jest
}
```

---

## Setup & Installation

### Prerequisites

- Node.js 18+ (see `package.json` engines field)
- npm or yarn
- Firefox, Chrome, WebKit (for Playwright)

### Install & Configure

1. **Install testing dependencies:**
   ```bash
   npm install
   ```
   Dependencies include Jest, React Testing Library, Playwright, and supporting libraries.

2. **Verify configuration:**
   ```bash
   # Check jest.config.ts exists
   ls -la jest.config.ts
   
   # Check playwright.config.ts exists
   ls -la playwright.config.ts
   
   # Check jest.setup.ts exists
   ls -la jest.setup.ts
   ```

3. **Install Playwright browsers (for E2E tests):**
   ```bash
   npx playwright install
   ```

---

## Running Tests

### Local Development

**Watch mode (auto-rerun on file changes):**
```bash
npm run test
```
Exits with error if coverage thresholds not met in the file you're testing.

**Run specific test file:**
```bash
npm run test -- src/lib/__tests__/utils.test.ts
```

**Debug mode (Node debugger):**
```bash
npm run test:debug
```
Then open `chrome://inspect` in DevTools.

### CI Mode (Full Coverage Report)

**Run all tests with coverage:**
```bash
npm run test:ci
```
Fails if global coverage drops below thresholds:
- **Lines:** 70%
- **Statements:** 70%
- **Branches:** 60%
- **Functions:** 70%

**View coverage report:**
```bash
# After running npm run test:ci
open coverage/lcov-report/index.html
```

### E2E Testing

**Run all E2E tests (headless):**
```bash
npm run test:e2e
```

**Run E2E tests with UI (interactive mode):**
```bash
npm run test:e2e:ui
```
Opens Playwright UI where you can visually step through tests.

**Run specific E2E test file:**
```bash
npx playwright test tests/e2e/buyer-browse.spec.ts
```

**Run E2E test in debug mode:**
```bash
npm run test:e2e:debug
```

**Run E2E tests on specific browser:**
```bash
npx playwright test --project=chromium
# or --project=firefox, --project=webkit
```

---

## Test Structure

### Directory Layout

```
src/
  lib/
    __tests__/
      utils.test.ts          # Utility functions
      data.test.ts           # Firestore query helpers
  hooks/
    __tests__/
      use-favorites.test.ts  # Hook tests
      use-toast.test.ts
      use-mobile.test.tsx
  components/
    __tests__/
      trust-badge.test.tsx   # Component tests
      favorite-button.test.tsx
      status-badge.test.tsx
  app/
    __tests__/
      actions.test.ts        # Server actions (integration)
      middleware.test.ts     # Auth middleware

tests/
  __mocks__/
    styleMock.ts             # CSS mock
    fileMock.ts              # Image/file mock
  setup.ts                   # Test utilities & mock users
  e2e/
    pages/
      landing.page.ts        # Page objects
      explore.page.ts
      listing-detail.page.ts
      auth.page.ts
    buyer-browse.spec.ts     # E2E tests
    buyer-listing-detail.spec.ts
```

### Unit Test Template

```typescript
describe('ModuleName', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('functionName', () => {
    it('should do something when condition is met', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = myFunction(input);
      
      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge cases', () => {
      expect(myFunction(null)).toThrow();
    });
  });
});
```

### Component Test Template

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/my-component';

describe('MyComponent', () => {
  it('should render with required props', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const user = userEvent.setup();
    render(<MyComponent onSubmit={jest.fn()} />);
    
    const button = screen.getByRole('button');
    await user.click(button);
    
    expect(button).toHaveBeenCalled();
  });
});
```

### E2E Test Template

```typescript
import { test, expect } from '@playwright/test';
import { LandingPage } from './pages/landing.page';

test.describe('User Journey', () => {
  let page: LandingPage;

  test.beforeEach(async ({ browser }) => {
    page = new LandingPage(browser.newPage());
    await page.goto();
  });

  test('should complete critical path', async ({ page }) => {
    // Act
    await page.clickButton('Submit');

    // Assert
    expect(page.url()).toContain('/success');
  });
});
```

---

## Coverage Targets

### Global Thresholds

We enforce **70% coverage** globally to balance quality with developer velocity:

```javascript
coverageThreshold: {
  global: {
    lines: 70,
    statements: 70,
    branches: 60,      // Lower: some branches are path-specific
    functions: 70,
  },
```

### Higher Standards for Critical Paths

**Utils & helpers: 90%**
```typescript
./src/lib/: {
  lines: 90,
  functions: 90,
  branches: 85,
  statements: 90,
}
```

**Hooks: 85%**
```typescript
./src/hooks/: {
  lines: 85,
  functions: 85,
  branches: 75,
  statements: 85,
}
```

### Coverage Exclusions

Tests exclude these patterns:
- `.d.ts` files (type definitions)
- `.stories.ts(x)` files (Storybook stories)
- `__tests__/` directories (test code itself)
- `app/` routes (page files tested via E2E)

---

## Best Practices

### ✅ DO

- **Use semantic queries** in React Testing Library:
  ```typescript
  // Good
  screen.getByRole('button', { name: /submit/i });
  screen.getByLabelText('Email');
  
  // Avoid
  screen.getByTestId('btn-submit');
  container.querySelector('.submit-btn');
  ```

- **Mock external dependencies** (Firebase, API calls):
  ```typescript
  jest.mock('@/lib/firebase-admin');
  const mockDb = adminDb as jest.Mocked<typeof adminDb>;
  mockDb.collection.mockReturnValue(...);
  ```

- **Test user behavior**, not implementation:
  ```typescript
  // Good: Test what user does
  await user.click(button);
  expect(screen.getByText('Success')).toBeInTheDocument();
  
  // Avoid: Testing internals
  expect(setState).toHaveBeenCalled();
  ```

- **Group related tests** with nested `describe` blocks:
  ```typescript
  describe('useFavorites', () => {
    describe('addFavorite', () => { /* tests */ });
    describe('removeFavorite', () => { /* tests */ });
  });
  ```

- **Use page objects** for E2E to reduce duplicate selectors:
  ```typescript
  const landingPage = new LandingPage(page);
  await landingPage.clickBrowseButton();
  ```

- **Wait for async operations:**
  ```typescript
  await waitFor(() => {
    expect(result.current.loading).toBe(false);
  });
  ```

### ❌ DON'T

- **Don't test third-party libraries:**
  ```typescript
  // Skip - testing React or Material-UI behavior
  // Your tests should assume they work
  ```

- **Don't test styling directly:**
  ```typescript
  // Skip: brittle, unrelated to behavior
  expect(element).toHaveStyle('color: red');
  ```

- **Don't mock everything:**
  ```typescript
  // Only mock boundaries (Firebase, API) not your code
  // Test real logic when possible
  ```

- **Don't use `waitFor` for non-async operations:**
  ```typescript
  // Good
  expect(screen.getByText('Text')).toBeInTheDocument();
  
  // Avoid
  await waitFor(() => {
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
  ```

---

## Mocking & Fixtures

### Firebase Admin Mocking

 The `jest.setup.ts` automatically mocks Firebase Admin SDK:

```typescript
jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnThis(),
      get: jest.fn(),
      doc: jest.fn().mockReturnValue({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
      }),
      // ... other methods
    }),
  },
  adminStorage: { /* ... */ },
  adminAuth: { /* ... */ },
}));
```

### Using Mock Data

Use helpers from `tests/setup.ts`:

```typescript
import {
  mockAuthenticatedUser,
  mockAdminUser,
  mockSellerUser,
  mockListing,
  mockEvidence,
  render,
  userEvent,
} from '@/tests/setup';

// Create mock users
const buyer = mockAuthenticatedUser({ email: 'buyer@example.com' });
const admin = mockAdminUser();
const seller = mockSellerUser();

// Create mock data
const listing = mockListing({ title: 'Custom Listing' });
const evidence = mockEvidence({ type: 'title_deed' });
```

### Custom Fixtures

Create reusable test data:

```typescript
// tests/fixtures/listings.ts
export const fixtureListings = {
  goldBadge: {
    id: 'listing-gold-1',
    title: 'Prime Property with Complete Docs',
    badge: 'Gold',
    status: 'approved',
    // ...
  },
  pending: {
    id: 'listing-pending-1',
    title: 'Under Review',
    status: 'pending',
    // ...
  },
};
```

---

## Troubleshooting

### Common Issues

#### **"Cannot find module '@/lib/something'"**
- Ensure `jest.config.ts` has correct `moduleNameMapper`
- Run `npm install` again
- Restart Jest watch mode

#### **"ReferenceError: define is not defined"**
- Some libraries need `identity-obj-proxy` for CSS
- Verify `jest.config.ts` includes CSS mock

#### **"TypeError: Firebase.auth is not a function"**
- Verify `jest.setup.ts` mocks Firebase correctly
- Check that test doesn't directly import Firebase client

#### **E2E tests timeout**
- Increase timeout: `test.setTimeout(60000);`
- Verify dev server is running on port 9002
- Check network connectivity for external resources

#### **E2E tests fail on CI but pass locally**
- Use `waitForLoadState('networkidle')` for stability
- Avoid hardcoded delays; use Playwright's auto-wait
- Check `.env` variables are set in CI

#### **Coverage threshold failures**
- Add tests for new functions/components
- For low-complexity code, use `/* istanbul ignore next */`
- Run `npm run test:ci` to see detailed report

---

## CI/CD Integration

### GitHub Actions Workflow

Tests run automatically on push/PR to `main` and `develop`:

1. **Unit tests** (matrix: Node 18.x, 20.x)
   - Lint check
   - TypeScript check
   - Jest with coverage
   - Upload to Codecov

2. **E2E tests** (after unit tests pass)
   - Install Playwright browsers
   - Build application
   - Run E2E test suite
   - Upload test report artifacts

3. **Coverage threshold check**
   - Fail if global coverage < 70%
   - Comment PR with coverage breakdown

See `.github/workflows/test.yml` for details.

---

## Performance Tips

### Speed Up Tests

1. **Run tests in parallel:** Jest does this by default
   ```bash
   npm run test:ci -- --maxWorkers=4
   ```

2. **Use `--onlyChanged` flag** during development:
   ```bash
   npm run test -- --onlyChanged
   ```

3. **Skip expensive operations** in tests:
   - Mock API calls instead of hitting real endpoints
   - Use in-memory databases for integration tests
   - Pre-compile TS fixtures rather than compiling in tests

4. **Cache dependencies:**
   ```bash
   npm ci  # Faster than npm install on CI
   ```

### E2E Performance

1. **Use test data seeding** instead of manual form filling
2. **Reuse browser context** across tests when possible
3. **Run E2E tests only on PRs**, not on every commit
4. **Parallel browser instances:**
   ```bash
   npx playwright test --workers=4
   ```

---

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Playwright Docs](https://playwright.dev/)
- [Firebase Testing Patterns](https://firebase.google.com/docs/testing)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## Contact & Questions

For testing questions, issues, or improvements:
1. Check existing tests for examples
2. Review this guide
3. Open an issue with reproduction steps
4. Reference the relevant test file and error

---

**Last Updated:** February 2026
**Test Coverage:** 70%+ (lines, statements, functions); 60%+ (branches)
**Maintained By:** Kenya Land Trust Dev Team
