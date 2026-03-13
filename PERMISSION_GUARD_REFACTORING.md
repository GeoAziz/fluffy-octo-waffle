# PermissionGuard Refactoring Guide

## Overview

This document outlines the systematic refactoring of inline role checks across the codebase to use the centralized `PermissionGuard` component pattern. This improves security, maintainability, and auditability of authorization logic.

## Why PermissionGuard?

**Problems with inline role checks:**
- Scattered authorization logic across 50+ components
- Hard to audit (missing role checks)
- Visual manipulation vulnerability (role checks can be accidentally removed)
- No single source of truth for authorization
- Inconsistent fallback behavior

**Benefits of PermissionGuard pattern:**
- Centralized authorization logic
- Auditable and testable
- Type-safe role checking
- Composable with fallback UI
- Prevents accidental authorization bypass

## PermissionGuard API

```tsx
<PermissionGuard
  allowedRoles={['SELLER', 'ADMIN']}  // Required: Array of roles with access
  fallback={<Component />}             // Optional: UI to show if not authorized (default: null)
  requireVerified={false}              // Optional: Require user verification (default: false)
>
  <ProtectedFeature />
</PermissionGuard>
```

### Examples

**Show feature for sellers and admins only:**
```tsx
<PermissionGuard allowedRoles={['SELLER', 'ADMIN']} fallback={null}>
  <Link href="/dashboard">Dashboard</Link>
</PermissionGuard>
```

**Show fallback UI for unauthorized users:**
```tsx
<PermissionGuard 
  allowedRoles={['ADMIN']} 
  fallback={<p>Admin access required</p>}
>
  <AdminPanel />
</PermissionGuard>
```

**Require both role and verification:**
```tsx
<PermissionGuard 
  allowedRoles={['SELLER']} 
  requireVerified={true}
  fallback={<VerifyAccountPrompt />}
>
  <CreateListingForm />
</PermissionGuard>
```

## Refactoring Patterns

### Pattern 1: Simple Conditional Rendering

**Before:**
```tsx
{userProfile.role === 'ADMIN' && (
  <Link href="/admin">Admin Panel</Link>
)}
```

**After:**
```tsx
<PermissionGuard allowedRoles={['ADMIN']} fallback={null}>
  <Link href="/admin">Admin Panel</Link>
</PermissionGuard>
```

### Pattern 2: Ternary with Fallback

**Before:**
```tsx
{userProfile.role === 'ADMIN' ? (
  <Link href="/admin/inbox">Inbox</Link>
) : (
  <Link href="/messages">Messages</Link>
)}
```

**After:**
```tsx
<PermissionGuard 
  allowedRoles={['ADMIN']} 
  fallback={
    <Link href="/messages">Messages</Link>
  }
>
  <Link href="/admin/inbox">Inbox</Link>
</PermissionGuard>
```

### Pattern 3: Multiple Roles

**Before:**
```tsx
{(userProfile.role === 'SELLER' || userProfile.role === 'ADMIN') && (
  <Link href="/dashboard">Dashboard</Link>
)}
```

**After:**
```tsx
<PermissionGuard allowedRoles={['SELLER', 'ADMIN']} fallback={null}>
  <Link href="/dashboard">Dashboard</Link>
</PermissionGuard>
```

### Pattern 4: Negation Checks

**Before:**
```tsx
{userProfile.role !== 'BUYER' ? (
  <Link href="/seller-portal">Seller Tools</Link>
) : null}
```

**After:**
```tsx
<PermissionGuard allowedRoles={['SELLER', 'ADMIN']} fallback={null}>
  <Link href="/seller-portal">Seller Tools</Link>
</PermissionGuard>
```

## Refactoring Checklist

### ✅ COMPLETED

- [x] `src/components/header.tsx` - All 5 role checks refactored
  - Admin Panel link (ADMIN)
  - Dashboard link (SELLER|ADMIN)
  - New Listing link (SELLER|ADMIN)
  - Desktop Inbox/Messages conditional (ADMIN fallback)
  - Mobile Inbox/Messages conditional (ADMIN fallback)

### 🟡 PRIORITY (HIGH IMPACT)

These files have authorization-critical role checks visible to all users:

- [ ] `src/components/buyer/buyer-header.tsx` (Lines 69, 155)
  - Line 69: `const isBuyer = userProfile?.role === 'BUYER'`
  - Line 155: `{isBuyer && (...)}`
  - Impact: Affects all buyer-facing features
  - Status: UX display checks (non-critical)

- [ ] `src/components/admin/**/*.tsx` (Multiple files)
  - Admin settings display
  - Moderation tools visibility
  - Analytics access
  - Impact: CRITICAL - Admin-only features

- [ ] `src/components/seller/**/*.tsx` (Multiple files)
  - Seller dashboard features
  - Listing management tools
  - Evidence upload restrictions
  - Impact: HIGH - Seller-only features

### 🟢 RECOMMENDED (NICE TO HAVE)

These files have role-based UX state checks (display logic, not auth):

- [ ] `src/components/buyer/buyer-home-page.tsx` (Line 27)
  - Line 27: `const isFirstTimer = !user || (userProfile && userProfile.role === 'BUYER' && ...)`
  - Impact: UX state (not authorization)
  - Pattern: State-based conditional display

- [ ] `src/components/buyer/onboarding-guard.tsx` (Line 30)
  - Line 30: `if (!userProfile || userProfile.role !== 'BUYER')`
  - Impact: Route guard logic (client-side)
  - Pattern: Not suitable for PermissionGuard (routing, not rendering)

## Implementation Steps

1. **Identify the role check:**
   ```
   Find: userProfile.role === 'X'
   Or: userProfile.role !== 'X'
   Or: isSellerOrAdmin && (...)
   ```

2. **Determine allowed roles:**
   - Use role array: `['SELLER', 'ADMIN']`
   - Or negation logic: `!== 'BUYER'` → `['SELLER', 'ADMIN']`

3. **Identify fallback UI:**
   - If `&& operator`: fallback is `null`
   - If ternary: fallback is the false branch
   - If `!== operator`: fallback is hidden content

4. **Replace with PermissionGuard:**
   ```tsx
   <PermissionGuard 
     allowedRoles={[/* roles */]} 
     fallback={/* fallback UI */}
   >
     {/* protected content */}
   </PermissionGuard>
   ```

5. **Test:**
   - Login as each role
   - Verify protected feature shows/hides correctly
   - Verify fallback displays (if applicable)

## Audit Results

**Total role checks in codebase:** 30+ matches

**By type:**
- Route middleware (server-side): ✅ Already handled
- Header/nav components: ✅ Header done, buyer-header pending
- Admin components: ❌ Not yet refactored
- Seller components: ❌ Not yet refactored
- Helper functions: ✅ OK (utils, config, workflow)

**Files with 3+ role checks:**
1. `src/components/header.tsx` - ✅ DONE (5 refactored)
2. `src/components/admin/**/*.tsx` - (est. 8-12 checks)
3. `src/components/seller/**/*.tsx` - (est. 6-10 checks)
4. `src/lib/workspace-navigation.ts` - (8 checks, but utility functions - OK to keep)

## Next Steps

### Immediate (This Sprint)
1. Audit admin components and create refactoring PR
2. Audit seller components and create refactoring PR
3. Create test fixtures for role-based component rendering

### Future Enhancements
1. Add `requireVerified` flag usage across components
2. Create PermissionGuard variants (e.g., `RoleNotification` for admin alerts)
3. Add Storybook stories for PermissionGuard test scenarios
4. Implement analytics tracking for authorization checks (audit trail)

## Questions?

- **Q: Should I refactor UX state checks?**  
  A: Only if they gate access to features. Display/styling logic can stay.

- **Q: What about server-side authorization?**  
  A: Server actions already use `getAuthenticatedUser()`. Don't add PermissionGuard.

- **Q: Can PermissionGuard wrap route-level logic?**  
  A: No. Use middleware for route guards. PermissionGuard is for component visibility only.

- **Q: How do I test PermissionGuard changes?**  
  A: Mock `useAuth()` with different roles and verify render output.
