/**
 * Mock Admin Activity, Favorites, and Saved Searches Generator
 */
import { faker } from '@faker-js/faker';
import type { AuditLog, SavedSearch } from '../types';

/**
 * Generate timestamp X days ago with optional hours offset
 */
const daysAgo = (days: number, hoursOffset: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(date.getHours() - hoursOffset);
  return date;
};

/**
 * Admin actions for audit logs
 */
const ADMIN_ACTIONS = [
  {
    action: 'listing_approved',
    entityType: 'listing',
    changeTemplate: (listingId: string, badge: string) => ({
      listingId,
      previousStatus: 'pending',
      newStatus: 'approved',
      badge: badge,
      reason: 'All evidence verified and authenticated. Property meets trust standards.'
    })
  },
  {
    action: 'listing_rejected',
    entityType: 'listing',
    changeTemplate: (listingId: string) => ({
      listingId,
      previousStatus: 'pending',
      newStatus: 'rejected',
      reason: 'Evidence documents do not match property details. Suspicious activity detected.'
    })
  },
  {
    action: 'badge_assigned',
    entityType: 'listing',
    changeTemplate: (listingId: string, badge: string, previousBadge: string) => ({
      listingId,
      previousBadge: previousBadge || 'None',
      newBadge: badge,
      reason: 'Badge updated after additional evidence review.'
    })
  },
  {
    action: 'evidence_verified',
    entityType: 'evidence',
    changeTemplate: (evidenceId: string, listingId: string) => ({
      evidenceId,
      listingId,
      verified: true,
      verificationNote: 'Document authenticity confirmed via land registry verification.'
    })
  },
  {
    action: 'user_verified',
    entityType: 'user',
    changeTemplate: (userId: string) => ({
      userId,
      previousVerified: false,
      newVerified: true,
      verificationMethod: 'KYC documents reviewed and approved'
    })
  },
  {
    action: 'settings_updated',
    entityType: 'settings',
    changeTemplate: () => ({
      settingKey: faker.helpers.arrayElement(['maintenanceMode', 'enableUserSignups', 'moderationThresholdDays']),
      previousValue: faker.datatype.boolean(),
      newValue: !faker.datatype.boolean(),
      updatedBy: 'admin'
    })
  },
  {
    action: 'listing_flagged',
    entityType: 'listing',
    changeTemplate: (listingId: string) => ({
      listingId,
      flagReason: faker.helpers.arrayElement([
        'Duplicate listing',
        'Suspicious documentation',
        'User report',
        'AI risk score too high',
        'Stock photos detected'
      ]),
      flaggedForReview: true
    })
  },
  {
    action: 'evidence_requested',
    entityType: 'listing',
    changeTemplate: (listingId: string) => ({
      listingId,
      requestedEvidence: faker.helpers.arrayElement(['title_deed', 'survey_map', 'rate_clearance']),
      requestNote: 'Please provide additional documentation for verification.'
    })
  }
];

/**
 * Generate audit log entry
 */
export const generateAuditLog = (
  adminId: string,
  entityId: string,
  daysAgoCreated: number
): AuditLog => {
  const actionTemplate = ADMIN_ACTIONS[Math.floor(Math.random() * ADMIN_ACTIONS.length)];
  
  let changes;
  if (actionTemplate.action === 'listing_approved') {
    const badge = faker.helpers.arrayElement(['TrustedSignal', 'EvidenceReviewed', 'EvidenceSubmitted']);
    changes = (actionTemplate.changeTemplate as (...args: unknown[]) => Record<string, unknown>)(entityId, badge);
  } else if (actionTemplate.action === 'listing_rejected') {
    changes = (actionTemplate.changeTemplate as (...args: unknown[]) => Record<string, unknown>)(entityId);
  } else if (actionTemplate.action === 'badge_assigned') {
    const badge = faker.helpers.arrayElement(['TrustedSignal', 'EvidenceReviewed', 'EvidenceSubmitted']);
    const previousBadge = faker.helpers.arrayElement(['EvidenceSubmitted', 'None']);
    changes = (actionTemplate.changeTemplate as (...args: unknown[]) => Record<string, unknown>)(entityId, badge, previousBadge);
  } else if (actionTemplate.action === 'evidence_verified') {
    changes = (actionTemplate.changeTemplate as (...args: unknown[]) => Record<string, unknown>)(`evidence-${entityId}`, entityId);
  } else if (actionTemplate.action === 'user_verified') {
    changes = (actionTemplate.changeTemplate as (...args: unknown[]) => Record<string, unknown>)(entityId);
  } else {
    changes = (actionTemplate.changeTemplate as (...args: unknown[]) => Record<string, unknown>)(entityId);
  }

  return {
    id: `audit-${faker.string.uuid()}`,
    adminId: adminId,
    action: actionTemplate.action,
    entityType: actionTemplate.entityType,
    entityId: entityId,
    changes: changes,
    timestamp: daysAgo(daysAgoCreated, faker.number.int({ min: 0, max: 23 }))
  };
};

/**
 * Generate audit logs for a listing's lifecycle
 */
export const generateListingAuditTrail = (
  adminId: string,
  listingId: string,
  listingCreatedDaysAgo: number,
  listingStatus: 'approved' | 'rejected' | 'pending'
): AuditLog[] => {
  const logs: AuditLog[] = [];

  if (listingStatus === 'approved') {
    // Evidence verification
    logs.push({
      id: `audit-${listingId}-evidence`,
      adminId: adminId,
      action: 'evidence_verified',
      entityType: 'evidence',
      entityId: `evidence-${listingId}-title-deed`,
      changes: {
        evidenceId: `evidence-${listingId}-title-deed`,
        listingId: listingId,
        verified: true,
        verificationNote: 'Title deed verified against land registry records.'
      },
      timestamp: daysAgo(listingCreatedDaysAgo - 2, 10)
    });

    // Badge assignment
    const badge = faker.helpers.arrayElement(['TrustedSignal', 'EvidenceReviewed']);
    logs.push({
      id: `audit-${listingId}-badge`,
      adminId: adminId,
      action: 'badge_assigned',
      entityType: 'listing',
      entityId: listingId,
      changes: {
        listingId: listingId,
        previousBadge: 'None',
        newBadge: badge,
        reason: 'All required evidence verified and approved.'
      },
      timestamp: daysAgo(listingCreatedDaysAgo - 2, 5)
    });

    // Approval
    logs.push({
      id: `audit-${listingId}-approved`,
      adminId: adminId,
      action: 'listing_approved',
      entityType: 'listing',
      entityId: listingId,
      changes: {
        listingId: listingId,
        previousStatus: 'pending',
        newStatus: 'approved',
        badge: badge,
        reason: 'Property verification complete. All documents authentic.'
      },
      timestamp: daysAgo(listingCreatedDaysAgo - 2, 2)
    });
  } else if (listingStatus === 'rejected') {
    // Flagged for review
    logs.push({
      id: `audit-${listingId}-flagged`,
      adminId: adminId,
      action: 'listing_flagged',
      entityType: 'listing',
      entityId: listingId,
      changes: {
        listingId: listingId,
        flagReason: 'AI risk score elevated - documents require manual review',
        flaggedForReview: true
      },
      timestamp: daysAgo(listingCreatedDaysAgo - 1, 15)
    });

    // Rejection
    logs.push({
      id: `audit-${listingId}-rejected`,
      adminId: adminId,
      action: 'listing_rejected',
      entityType: 'listing',
      entityId: listingId,
      changes: {
        listingId: listingId,
        previousStatus: 'pending',
        newStatus: 'rejected',
        reason: 'Evidence documents do not match property details. Possible fraud detected.'
      },
      timestamp: daysAgo(listingCreatedDaysAgo - 1, 8)
    });
  }

  return logs;
};

/**
 * Generate comprehensive audit logs for admin dashboard
 */
export const generateAdminDashboardAuditLogs = (
  adminId: string,
  listingIds: string[],
  count: number
): AuditLog[] => {
  const logs: AuditLog[] = [];
  
  for (let i = 0; i < count; i++) {
    const listingId = listingIds[Math.floor(Math.random() * listingIds.length)];
    const daysAgoCreated = faker.number.int({ min: 1, max: 90 });
    
    const log = generateAuditLog(adminId, listingId, daysAgoCreated);
    logs.push(log);
  }

  // Sort by timestamp descending (newest first)
  return logs.sort((a, b) => {
    const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
    const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
    return timeB - timeA;
  });
};

/**
 * Generate buyer favorites (listing IDs)
 */
export const generateBuyerFavorites = (
  listingIds: string[],
  count: number
): string[] => {
  const favoriteCount = Math.min(count, listingIds.length);
  const favorites: string[] = [];
  const availableListings = [...listingIds];

  for (let i = 0; i < favoriteCount; i++) {
    const randomIndex = Math.floor(Math.random() * availableListings.length);
    favorites.push(availableListings[randomIndex]);
    availableListings.splice(randomIndex, 1);
  }

  return favorites;
};

/**
 * Generate saved searches for a buyer
 */
export const generateSavedSearches = (
  userId: string,
  preferredCounties: string[],
  budgetRange?: { min: number; max: number }
): SavedSearch[] => {
  const searches: SavedSearch[] = [];

  // Search 1: County-specific search
  if (preferredCounties.length > 0) {
    const county = preferredCounties[0];
    searches.push({
      id: `search-${userId}-county`,
      name: `Properties in ${county}`,
      url: `/explore?county=${encodeURIComponent(county)}`,
      createdAt: daysAgo(faker.number.int({ min: 5, max: 30 })),
      filters: {
        county: county
      }
    });
  }

  // Search 2: Budget-based search
  if (budgetRange) {
    searches.push({
      id: `search-${userId}-budget`,
      name: `Within my budget (${(budgetRange.min / 1000000).toFixed(1)}M - ${(budgetRange.max / 1000000).toFixed(1)}M)`,
      url: `/explore?minPrice=${budgetRange.min}&maxPrice=${budgetRange.max}`,
      createdAt: daysAgo(faker.number.int({ min: 10, max: 40 })),
      filters: {
        minPrice: budgetRange.min,
        maxPrice: budgetRange.max
      }
    });
  }

  // Search 3: Verified properties only
  searches.push({
    id: `search-${userId}-verified`,
    name: 'Verified Properties Only',
    url: '/explore?badges=TrustedSignal,EvidenceReviewed',
    createdAt: daysAgo(faker.number.int({ min: 15, max: 45 })),
    filters: {
      badges: ['TrustedSignal', 'EvidenceReviewed']
    }
  });

  // Search 4: Land type specific
  const landType = faker.helpers.arrayElement(['Agricultural', 'Residential', 'Commercial']);
  searches.push({
    id: `search-${userId}-landtype`,
    name: `${landType} Land`,
    url: `/explore?landType=${encodeURIComponent(landType)}`,
    createdAt: daysAgo(faker.number.int({ min: 20, max: 50 })),
    filters: {
      landType: landType
    }
  });

  // Search 5: Size-based search
  if (Math.random() > 0.5) {
    const minArea = faker.number.int({ min: 1, max: 5 });
    const maxArea = faker.number.int({ min: minArea + 5, max: 50 });
    searches.push({
      id: `search-${userId}-size`,
      name: `${minArea}-${maxArea} Acres`,
      url: `/explore?minArea=${minArea}&maxArea=${maxArea}`,
      createdAt: daysAgo(faker.number.int({ min: 25, max: 60 })),
      filters: {
        minArea: minArea,
        maxArea: maxArea
      }
    });
  }

  return searches;
};
