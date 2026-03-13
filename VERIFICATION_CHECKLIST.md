# Quick Verification Checklist

Use this checklist to verify all enhancements are working correctly post-deployment.

## Trust Badge Widget ✅

**Where to test:** Seller Dashboard (`/dashboard`)

- [ ] Sidebar shows "Trust Badge Progress" widget
- [ ] Widget displays a tier: Gold, Silver, Bronze, or Unverified
- [ ] Progress bar matches tier (Gold=100%, Silver=70%, Bronze=30%, Unverified=0%)
- [ ] Description text changes with tier
- [ ] Widget updates automatically when new listing is added
- [ ] Collapsed sidebar hides widget (responsive)

**Test Data:** Create a test seller with:
- 1 listing with Gold badge (TrustedSignal)
- Expected: Widget shows "Gold 100%"

---

## Role-Based Authorization ✅

**Where to test:** Header navigation (`/` or any page)

### Desktop Menu (3 items should gate-check)
- [ ] **Admin Panel** - Visible ONLY for ADMIN role
  - Test: Login as ADMIN → see link
  - Test: Login as SELLER → link hidden
  - Test: Login as BUYER → link hidden

- [ ] **Dashboard** - Visible for SELLER and ADMIN roles
  - Test: Login as SELLER → see link
  - Test: Login as ADMIN → see link
  - Test: Login as BUYER → link hidden

- [ ] **New Listing** - Visible for SELLER and ADMIN roles
  - Test: Login as SELLER → see link
  - Test: Login as ADMIN → see link
  - Test: Login as BUYER → link hidden

### Mobile Menu (Sheet)
- [ ] Same gating behavior as desktop when hamburger menu opened
- [ ] Inbox/Messages conditional works:
  - Test: ADMIN → see "Inbox" with badge count
  - Test: BUYER → see "Messages"
  - Test: SELLER → see "Messages"

---

## Buyer Onboarding CTA ✅

**Where to test:** Complete onboarding flow

Step 1-3: Go through normal onboarding → select county/budget
- [ ] See "Initialize Discovery" or "Global Registry Explorer" heading
- [ ] Complete all steps

Step 4 (Complete):
- [ ] See pro-tip card with TrendingUp icon
- [ ] Card says "Save Your First Search"
- [ ] Text explains "Explore Listings & Save Searches"
- [ ] Button links to `/explore`
- [ ] Clicking button redirects to explore page

---

## Role-Aware Theme System ✅

**Where to test:** Any page when logged in

**Technical test (Developer Console):**
```javascript
// In Console, run:
document.documentElement.getAttribute('data-role')
// Expected output: 'BUYER', 'SELLER', or 'ADMIN'
```

**Visual test:**
- [ ] Different roles may have different theme colors applied
- [ ] Switch between user roles → colors update
- [ ] No manual page refresh needed

---

## Trust Badge Glows ✅

**Where to test:** Listings explore page (`/explore`)

**Gold Badge (TrustedSignal):**
- [ ] Card has glowing amber border
- [ ] Glow appears around entire card
- [ ] Hover state brightens glow (more visible)

**Silver Badge (EvidenceReviewed):**
- [ ] Card has glowing blue border
- [ ] Glow slightly more subtle than Gold
- [ ] Hover state brightens glow

**Bronze Badge (EvidenceSubmitted):**
- [ ] Card has glowing warm amber border
- [ ] Glow more subtle than Gold/Silver
- [ ] Hover state brightens glow

**No Badge / Suspicious:**
- [ ] Card has no special glow
- [ ] Normal border rendering

---

## Tier Calculation Logic ✅

**Where to test:** Seller's own listings

**Test Scenario 1: All Gold**
- Create/approve 3 listings with Gold badges
- Expected: Widget shows "Gold" tier, 100% progress

**Test Scenario 2: Mixed Gold+Silver**
- Create/approve 5 listings:
  - 3 × Gold (TrustedSignal)
  - 2 × Silver (EvidenceReviewed)
- Expected: Widget shows "Gold" tier (60% Gold)

**Test Scenario 3: Mixed with Bronze**
- Create/approve 6 listings:
  - 2 × Gold
  - 2 × Silver
  - 2 × Bronze (EvidenceSubmitted)
- Expected: Widget shows "Silver" tier (66% Gold+Silver)

**Test Scenario 4: Only Bronze**
- Create/approve 1-3 listings with Bronze only
- Expected: Widget shows "Bronze" tier, 30% progress

**Test Scenario 5: No Badges**
- Create but DON'T approve any listings
- Expected: Widget shows "Unverified" tier, 0% progress

---

## Performance Baseline ✅

**Measure on first login:**
- [ ] Page load time: <2 seconds
- [ ] No console errors
- [ ] Badge widget appears within 1 second
- [ ] Theme attribute sets before page render

**Measure on subsequent navigation:**
- [ ] Route changes responsive (<500ms)
- [ ] Theme updates instantly on role change
- [ ] No flickering or layout shift

---

## Error Handling ✅

**Test error states:**

**No listings:**
- [ ] Widget shows "Unverified 0%"
- [ ] No errors in console

**User logs out:**
- [ ] Theme attribute removed
- [ ] PermissionGuard hides all restricted elements
- [ ] Login page loads cleanly

**Firebase offline (dev mode):**
- [ ] Widget still renders with last known state
- [ ] No hard crashes
- [ ] Graceful fallback behavior

---

## Rollback Testing ✅

**If reverting changes needed:**

1. **Revert to previous header.tsx**
   - [ ] Inline role checks still work
   - [ ] No console errors
   - [ ] Navigation functional

2. **Revert seller-nav.tsx to original**
   - [ ] Widget shows hardcoded "Gold 100%"
   - [ ] No import errors

3. **Keep theme provider (optional)**
   - [ ] Non-breaking change
   - [ ] Can stay or revert independently

---

## Accessibility Verification ✅

- [ ] PermissionGuard elements keyboard navigable
- [ ] Hidden elements not in tab order
- [ ] ARIA attributes preserved
- [ ] Screen reader announces role-gated content correctly (or not if hidden)

---

## Browser Compatibility ✅

Test on:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari iOS
- [ ] Chrome Mobile/Android

---

## Known Gotchas ⚠️

### Theme System
- First render may not have data-role attribute (loads after hydration)
- Workaround: CSS has sensible defaults, theme loads within 100ms

### Badge Widget
- Requires seller to have at least 1 approved listing with a badge
- With 0 approved listings: Shows "Unverified 0%"

### PermissionGuard
- Doesn't replace server-side authorization (already handled by middleware)
- Only affects client-side visibility

---

## Sign-Off

- [ ] All tests passed
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Ready for production
- [ ] Team trained on new patterns

**Date Tested:** _______________
**Tested By:** _______________
**Approved By:** _______________
