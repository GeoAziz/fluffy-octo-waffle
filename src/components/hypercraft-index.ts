/**
 * Hypercraft Component Library
 * 
 * This file exports all Hypercraft-compliant components following the
 * Kenya Land Trust design system standards. Import from this file for
 * consistency across the application.
 * 
 * Design System Reference:
 * - globals.css: Core tokens (colors, shadows, animations, easing)
 * - tailwind.config.ts: Tailwind utility bindings
 * - Blueprint: docs/blueprint.md
 */

// Animation & Motion Components
export { StaggerContainer } from './animations/stagger-container';
export { LandingSection, LandingSectionGrid, LandingSectionItem } from './landing-section';

// Form Components
export { EnhancedInput } from './form/enhanced-input';
export { AuthForm } from './form/auth-form';
export type { AuthFormField, AuthFormProps } from './form/auth-form';

// Layout Components
export { PageWrapper, PageSection, PageTitle, PageGrid } from './page-wrapper';
export type { PageWrapperProps } from './page-wrapper';

// Feature & Content Components
export { FeatureShowcase, FeatureHighlight } from './feature-showcase-card';
export { CallToAction, CTARow } from './call-to-action';
export { TestimonialCarousel, TestimonialGrid } from './testimonial-carousel';
export type { Testimonial, TestimonialCarouselProps } from './testimonial-carousel';
export type { FeatureCard, FeatureShowcaseProps, FeatureHighlightProps } from './feature-showcase-card';
export type { CallToActionProps, CTARowProps } from './call-to-action';

// Core UI Components (Existing)
export { EmptyState } from './empty-state';
export { TrustBadge } from './trust-badge';
export { MobileBottomNav } from './mobile-bottom-nav';
export { ThemeToggle } from './theme-toggle-advanced';

// Admin Components
export { RiskScoreBadge, ListingQueueItem } from './admin/risk-score-display';

/**
 * Animation Class Reference
 * 
 * Page Transitions:
 * - .animate-page-enter (500ms fade in + slide up)
 * - .animate-page-exit (400ms fade out + slide down)
 * 
 * List Reveals:
 * - .animate-stagger-in (staggered fade in with transform)
 * - .animate-slide-up/down/left/right (directional reveals)
 * 
 * Feedback & Interactions:
 * - .animate-shimmer (loading skeleton animation)
 * - .animate-shake-error (form error indication)
 * - .animate-badge-glow (trust badge highlights)
 * - .animate-bounce-in (springy entry)
 * 
 * Component Animations:
 * - .animate-scale-in (scale from 0.95 to 1)
 * - .animate-rotate-gradient (rotating gradient background)
 * 
 * Dark Mode: All animations automatically adjust for dark mode
 * via CSS variables (--ease-out, --duration-default, etc.)
 * 
 * Reduced Motion: All animations respect user's prefers-reduced-motion
 * setting via @media (prefers-reduced-motion: reduce)
 */

/**
 * Color Palette (Tailwind Classes)
 * 
 * Primary: Deep Green (#0F3D2E)
 * - text-primary, bg-primary, border-primary, etc.
 * - Used for: Primary actions, trust signals, verified states
 * 
 * Secondary: Warm Sand (#F4F1EC)
 * - text-secondary, bg-secondary, border-secondary, etc.
 * - Used for: Backgrounds, neutral surfaces, subtle accents
 * 
 * Accent: Muted Blue (#2F6F95)
 * - text-accent, bg-accent, border-accent, etc.
 * - Used for: Links, interactive elements, secondary actions
 * 
 * Muted: Neutral Gray
 * - Used for: Disabled states, placeholders, secondary text
 * 
 * Status Colors:
 * - text-success (green) - Approved, verified
 * - text-warning (amber) - Pending, caution
 * - text-risk (red) - Rejected, flagged
 * 
 * Dark Mode: All colors auto-adjust via HSL/CSS variables
 * Suffix dark: classes for explicit dark mode overrides
 */

/**
 * Touch Target Guidelines
 * 
 * All interactive elements use:
 * - min-h-[44px] / min-w-[44px] on mobile
 * - .touch-target utility class for convenience
 * 
 * Button heights:
 * - Size "sm": h-9 (36px) - Tertiary actions
 * - Size "md": h-10 (40px) - Secondary actions
 * - Size "lg": h-12 (48px) - Primary actions
 * - Default: h-10 (40px)
 * 
 * All buttons include active:scale-95 for tactile feedback
 */

/**
 * Typography System
 * 
 * Headings:
 * - text-hero: Hero text (clamp)
 * - text-h1: 2.5rem
 * - text-h2: 2rem
 * - text-h3: 1.5rem
 * - text-h4: 1.25rem
 * - text-h5: 1rem
 * 
 * Body:
 * - text-base: 1rem (default)
 * - text-sm: 0.875rem
 * - text-xs: 0.75rem
 * - text-[10px]: Smallest (labels, metadata)
 * 
 * All use clamp() for responsive scaling
 * Font weights: 400 (normal), 600 (semibold), 700 (bold), 900 (black)
 */

/**
 * Shadow System
 * 
 * Layered shadows for depth:
 * - shadow-xs: Subtle elevation (1px)
 * - shadow-sm: Small cards, buttons
 * - shadow-md: Medium cards
 * - shadow-lg: Large cards, modals
 * - shadow-xl: Prominent modals
 * - shadow-2xl: Maximum elevation
 * - shadow-inner: Inset shadows
 * 
 * Colored shadows:
 * - shadow-primary: Green tinted
 * - shadow-accent: Blue tinted
 * - shadow-risk: Red tinted
 * 
 * Dark mode: Shadows automatically increase intensity
 */

/**
 * Border Radius Scale
 * 
 * - rounded-xs: 4px (inputs, small elements)
 * - rounded-sm: 6px (buttons)
 * - rounded-md: 8px (cards)
 * - rounded-lg: 12px (standard - KEA)
 * - rounded-xl: 16px (prominent cards)
 * - rounded-2xl: 20px (hero sections)
 * - rounded-full: 9999px (avatars, badges)
 */

/**
 * Duration Scale
 * 
 * - duration-instant: 50ms (micro interactions)
 * - duration-fast: 150ms (hover states)
 * - duration-default: 300ms (standard animations)
 * - duration-normal: 500ms (page transitions)
 * - duration-slow: 700ms (dramatic reveals)
 * - duration-dramatic: 1000ms+ (emphasis animations)
 * 
 * Applied via var(--duration-*) in animations
 */

/**
 * Easing Functions
 * 
 * - var(--ease-out): cubic-bezier(0.16, 1, 0.3, 1) - Default
 * - var(--ease-in): cubic-bezier(0.4, 0, 1, 1)
 * - var(--ease-spring): cubic-bezier(0.175, 0.885, 0.32, 1.275)
 * - var(--ease-bounce): cubic-bezier(0.34, 1.56, 0.64, 1)
 * - var(--ease-smooth): cubic-bezier(0.25, 0.46, 0.45, 0.94)
 * 
 * Use in animations via var(--ease-*) for consistency
 */

/**
 * Responsive Breakpoints (Tailwind)
 * 
 * Mobile-first approach:
 * - base: <640px
 * - sm: ≥640px
 * - md: ≥768px (tablet)
 * - lg: ≥1024px (desktop)
 * - xl: ≥1280px
 * - 2xl: ≥1536px
 * 
 * Safe area insets for notched devices:
 * - - safe-area-top
 * - .safe-area-bottom
 * - .safe-area-left
 * - .safe-area-right
 */

/**
 * Implementation Tips
 * 
 * 1. Always use Hypercraft components for consistency
 * 2. Import animations via class names (not React)
 * 3. Use CSS variables for dynamic control
 * 4. Check dark mode with theme toggle
 * 5. Test mobile with touch interactions
 * 6. Verify reduced-motion via browser DevTools
 * 7. Use StaggerContainer for list reveals
 * 8. Apply animations only when animated prop = true
 * 9. Use animationDelay for stagger effects
 * 10. Follow touch target minimums (44px+)
 */
