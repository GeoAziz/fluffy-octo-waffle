/**
 * Mock Data Module - Central Export
 * 
 * This module provides comprehensive mock data generation for the Kenya Land Trust platform.
 * 
 * @example
 * ```typescript
 * import { getAllMockUsers, generateSellerListings } from '@/lib/mock';
 * ```
 */

// Kenya-specific data
export * from './kenya-data';

// User journeys and personas
export * from './mock-user-journeys';

// Listings with time-based scenarios
export * from './mock-listings';

// Evidence documents
export * from './mock-evidence';

// Conversations and messaging
export * from './mock-conversations';

// Admin activity, favorites, and saved searches
export * from './mock-admin-activity';

// Seeding script (use via CLI)
export * from './seed-all';
