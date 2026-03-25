
import { adminDb } from './firebase-admin';
import type { Listing, Evidence, ListingImage, PlatformSettings } from './types';
import { cache } from 'react';
import { Timestamp, type FieldValue } from 'firebase-admin/firestore';
import { validateSellerExists } from './seller-validation';

const toDate = (timestamp: Timestamp | FieldValue | undefined): Date | null => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return null;
}

const normalizeText = (value: string | undefined | null) => (value || '').toLowerCase().trim();

const tokenizeSearchInput = (value: string | undefined | null): string[] => {
    const normalized = normalizeText(value)
        .replace(/[^a-z0-9\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!normalized) return [];
    return Array.from(new Set(normalized.split(' ').filter(Boolean)));
};

const toDateFromUnknown = (value: unknown): Date | null => {
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === 'string' || typeof value === 'number') {
        const candidate = new Date(value);
        return Number.isNaN(candidate.getTime()) ? null : candidate;
    }
    if (value && typeof value === 'object' && 'toDate' in (value as Record<string, unknown>)) {
        try {
            const converted = (value as { toDate: () => Date }).toDate();
            return converted instanceof Date ? converted : null;
        } catch {
            return null;
        }
    }
    return null;
};

const generateCoordsFromLocation = (location: string): { latitude: number; longitude: number } => {
    if (!location) return { latitude: 0.0236, longitude: 37.9062 };

    let hash = 0;
    for (let i = 0; i < location.length; i++) {
        const char = location.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }

    const latMin = -4.7, latMax = 5.0;
    const lonMin = 34.0, lonMax = 41.9;

    const lat = latMin + ((hash & 0xffff) / 0xffff) * (latMax - latMin);
    const lon = lonMin + (((hash >> 16) & 0xffff) / 0xffff) * (lonMax - lonMin);
    
    return { latitude: parseFloat(lat.toFixed(6)), longitude: parseFloat(lon.toFixed(6)) };
}

type RiskInput = {
    imageAnalysis?: { isSuspicious?: boolean };
    badgeSuggestion?: { badge?: string };
};

const calculateRiskScore = (data: RiskInput): number => {
  let score = 0;
  if (data.imageAnalysis?.isSuspicious) score += 40;
  if (data.badgeSuggestion?.badge === 'Suspicious') score += 50;
  if (data.badgeSuggestion?.badge === 'None') score += 10;
  return Math.min(score, 100);
}

const toListing = (doc: FirebaseFirestore.DocumentSnapshot, evidence: Evidence[] = []): Listing => {
    const data = doc.data();
    if (!data) throw new Error("Document data is empty");
    
    const firestoreListing = {
        id: doc.id,
        ...data,
    } as Omit<Listing, 'createdAt' | 'updatedAt' | 'adminReviewedAt' | 'evidence'> & { 
        createdAt: Timestamp;
        updatedAt: Timestamp;
        adminReviewedAt?: Timestamp;
    };

    const images: ListingImage[] = firestoreListing.images || (firestoreListing.image ? [{ url: firestoreListing.image, hint: firestoreListing.imageHint || 'legacy' }] : [{ url: 'https://picsum.photos/seed/placeholder/1200/800', hint: 'landscape' }]);

    let coords = { latitude: data.latitude, longitude: data.longitude };
    let isApproximateLocation = false;
    if (coords.latitude === undefined || coords.longitude === undefined) {
        coords = generateCoordsFromLocation(data.location);
        isApproximateLocation = true;
    }

    return {
        ...firestoreListing,
        createdAt: toDate(firestoreListing.createdAt)!,
        updatedAt: toDate(firestoreListing.updatedAt)!,
        adminReviewedAt: toDate(firestoreListing.adminReviewedAt),
        evidence,
        images,
        latitude: coords.latitude,
        longitude: coords.longitude,
        isApproximateLocation,
        aiRiskScore: firestoreListing.aiRiskScore ?? calculateRiskScore(data),
        views: firestoreListing.views || 0,
        inquiryCount: firestoreListing.inquiryCount || 0,
        badge: firestoreListing.badge || null,
    };
}

const toEvidence = (doc: FirebaseFirestore.DocumentSnapshot): Evidence => {
    const data = doc.data();
    if (!data) throw new Error("Evidence data is empty");
    const firestoreEvidence = { id: doc.id, ...data } as Omit<Evidence, 'uploadedAt'> & { uploadedAt: Timestamp };
    return { ...firestoreEvidence, uploadedAt: toDate(firestoreEvidence.uploadedAt)! };
}

const getEvidenceForListing = async (listingId: string): Promise<Evidence[]> => {
    const snapshot = await adminDb.collection('evidence').where('listingId', '==', listingId).get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(toEvidence);
}

export const getPlatformSettings = cache(async (): Promise<PlatformSettings> => {
  try {
    const doc = await adminDb.collection('adminConfig').doc('settings').get();
    return doc.exists ? (doc.data() as PlatformSettings) : {
      platformName: 'Kenya Land Trust',
      contactEmail: 'contact@kenyalandtrust.com',
      supportEmail: 'support@kenyalandtrust.com',
      siteDescription: 'Trusted platform for land in Kenya',
      maxUploadSizeMB: 50,
      moderationThresholdDays: 2,
      maintenanceMode: false,
      enableUserSignups: true,
      enableListingCreation: true,
    };
  } catch {
    return { platformName: 'Kenya Land Trust', contactEmail: '', supportEmail: '', siteDescription: '', maxUploadSizeMB: 50, moderationThresholdDays: 2, maintenanceMode: false, enableUserSignups: true, enableListingCreation: true };
  }
});

type GetListingsOptions = {
    status?: 'all' | Listing['status'];
    query?: string;
    county?: string;
        landType?: string;
        minPrice?: number;
        maxPrice?: number;
        minArea?: number;
        maxArea?: number;
        badges?: Array<NonNullable<Listing['badge']>>;
    limit?: number;
    startAfter?: string;
};

export const getListings = async (options: GetListingsOptions = {}) => {
    const {
        status = 'approved',
        query,
        county,
        landType,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        badges,
        limit: queryLimit = 12,
        startAfter: startAfterId,
    } = options;

    const requestedLimit = Math.max(1, Math.min(queryLimit, 50));
    const batchLimit = Math.max(20, Math.min(requestedLimit * 2, 50));

  let q: FirebaseFirestore.Query = adminDb.collection('listings');
  if (status !== 'all') q = q.where('status', '==', status);
  if (county) q = q.where('county', '==', county);
    if (landType) q = q.where('landType', '==', landType);
    if (typeof minPrice === 'number') q = q.where('price', '>=', minPrice);
    if (typeof maxPrice === 'number') q = q.where('price', '<=', maxPrice);
    if (typeof minArea === 'number') q = q.where('area', '>=', minArea);
    if (typeof maxArea === 'number') q = q.where('area', '<=', maxArea);
  q = q.orderBy('createdAt', 'desc');

    const searchTokens = tokenizeSearchInput(query);
    const badgeFilter = new Set((badges || []).filter(Boolean));
    const listings: Listing[] = [];
    const sellerValidationCache = new Map<string, Awaited<ReturnType<typeof validateSellerExists>>>();

    let cursorDoc: FirebaseFirestore.DocumentSnapshot | null = null;
  if (startAfterId) {
    const doc = await adminDb.collection('listings').doc(startAfterId).get();
        if (doc.exists) {
            cursorDoc = doc;
        }
  }

    let hasMore = false;

    while (listings.length < requestedLimit) {
        let pageQuery = q.limit(batchLimit);
        if (cursorDoc) {
            pageQuery = pageQuery.startAfter(cursorDoc);
        }

        const snapshot = await pageQuery.get();
        if (snapshot.empty) {
            hasMore = false;
            break;
        }

        cursorDoc = snapshot.docs[snapshot.docs.length - 1];
        hasMore = snapshot.size === batchLimit;

        for (const doc of snapshot.docs) {
            const data = doc.data();

            const ownerId = String(data.ownerId || '');
            if (!ownerId) continue;

            const sellerValidation = sellerValidationCache.has(ownerId)
                ? sellerValidationCache.get(ownerId)!
                : await validateSellerExists(ownerId);
            sellerValidationCache.set(ownerId, sellerValidation);
            if (!sellerValidation.isValidSeller) {
                console.warn(`[DataFetch] Filtering out listing ${doc.id} - seller validation failed:`, sellerValidation.error);
                continue;
            }

            const listing = toListing(doc, []);

            if (badgeFilter.size > 0) {
                const listingBadge = listing.badge || 'None';
                if (!badgeFilter.has(listingBadge)) {
                    continue;
                }
            }

            if (searchTokens.length > 0) {
                const existingTokens = Array.isArray((data as { searchTokens?: unknown }).searchTokens)
                    ? ((data as { searchTokens?: unknown }).searchTokens as string[])
                    : tokenizeSearchInput(`${listing.title} ${listing.location} ${listing.county}`);

                const normalizedTokens = new Set(existingTokens.map(token => normalizeText(token)));
                const allTokensMatch = searchTokens.every(token => normalizedTokens.has(token));
                if (!allTokensMatch) {
                    continue;
                }
            }

            listings.push(listing);
            if (listings.length >= requestedLimit) {
                break;
            }
    }

        if (!hasMore) {
            break;
        }
  }

    return {
        listings,
        lastVisibleId: hasMore && cursorDoc ? cursorDoc.id : null,
    };
};

export const getListingsForSeller = cache(async (sellerId: string) => {
    const q = adminDb.collection("listings").where("ownerId", "==", sellerId).orderBy('createdAt', 'desc');
    const snapshot = await q.get();
    return snapshot.docs.map(doc => toListing(doc, []));
});

export const getAdminDashboardStats = cache(async () => {
    const snapshot = await adminDb.collection('listings').get();
    const stats = { total: snapshot.size, pending: 0, approved: 0, rejected: 0 };
    snapshot.forEach(doc => {
        const s = doc.data().status;
        if (s === 'pending') stats.pending++;
        else if (s === 'approved') stats.approved++;
        else if (s === 'rejected') stats.rejected++;
    });
    return stats;
});

export const getListingStatsByDay = cache(async (days = 30) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const snapshot = await adminDb.collection('listings')
        .where('status', '==', 'approved')
        .where('adminReviewedAt', '>=', start)
        .get();
    const statsByDay: Record<string, number> = {};
    snapshot.forEach(doc => {
        const d = toDate(doc.data().adminReviewedAt);
        if (d) {
            const s = d.toISOString().split('T')[0];
            statsByDay[s] = (statsByDay[s] || 0) + 1;
        }
    });
    const result = [];
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(end.getDate() - i);
        const s = d.toISOString().split('T')[0];
        result.push({ date: s, count: statsByDay[s] || 0 });
    }
    return result.reverse();
});

export const getAdminAnalyticsSummary = cache(async (options: { days?: number; startDate?: string; endDate?: string } = {}) => {
    const stats = await getAdminDashboardStats();
    const now = new Date();
    const days = options.days || 30;
    const windowStart = options.startDate ? new Date(options.startDate) : new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const windowEnd = options.endDate ? new Date(options.endDate) : now;

    type AnalyticsListing = {
        id: string;
        county?: unknown;
        status?: unknown;
        badge?: unknown;
        ownerId?: unknown;
        aiRiskScore?: unknown;
        adminReviewedAt?: unknown;
        rejectionReason?: unknown;
        adminNotes?: unknown;
        createdAt?: unknown;
    };

    const listingSnapshot = await adminDb.collection('listings').get();
    const listings: AnalyticsListing[] = listingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Record<string, unknown>),
    }));
    const evidenceSnapshot = await adminDb.collection('evidence').get();
    const aiSuggestionSnapshot = await adminDb.collection('aiSuggestionLogs').where('adminDecision', '!=', null).get();
    
    const countyMap: Record<string, number> = {};
    const badgeMap: Record<string, number> = { Gold: 0, Silver: 0, Bronze: 0, None: 0 };
    const rejectionReasonMap: Record<string, number> = {};
    const sellerRejectionMap: Record<string, number> = {};

    const evidenceByListing = new Map<string, Set<string>>();
    evidenceSnapshot.docs.forEach((doc) => {
        const data = doc.data() as { listingId?: string; type?: string };
        if (!data.listingId) return;
        const existing = evidenceByListing.get(data.listingId) || new Set<string>();
        if (data.type) existing.add(data.type);
        evidenceByListing.set(data.listingId, existing);
    });

    const moderationTimelineMap: Record<string, { approved: number; rejected: number }> = {};
    const dayCursor = new Date(windowStart);
    while (dayCursor <= windowEnd) {
        const key = dayCursor.toISOString().split('T')[0];
        moderationTimelineMap[key] = { approved: 0, rejected: 0 };
        dayCursor.setDate(dayCursor.getDate() + 1);
    }

    const evidenceScores: number[] = [];
    let suspiciousCount = 0;
    
    listings.forEach((listing) => {
        const county = typeof listing.county === 'string' ? listing.county : 'Unknown';
        countyMap[county] = (countyMap[county] || 0) + 1;

        const listingStatus = typeof listing.status === 'string' ? listing.status : 'pending';
        const badge = typeof listing.badge === 'string' ? listing.badge : 'None';
        const ownerId = typeof listing.ownerId === 'string' ? listing.ownerId : 'unknown';
        const aiRiskScore = typeof listing.aiRiskScore === 'number' ? listing.aiRiskScore : 0;
        const reviewedAt = toDateFromUnknown(listing.adminReviewedAt);

        if (listingStatus === 'approved') {
            const badgeKey = badge === 'TrustedSignal'
                ? 'Gold'
                : badge === 'EvidenceReviewed'
                ? 'Silver'
                : badge === 'EvidenceSubmitted'
                ? 'Bronze'
                : 'None';
            badgeMap[badgeKey] = (badgeMap[badgeKey] || 0) + 1;
        }

        if (listingStatus === 'rejected') {
            sellerRejectionMap[ownerId] = (sellerRejectionMap[ownerId] || 0) + 1;
            const rawReason = typeof listing.rejectionReason === 'string'
                ? listing.rejectionReason
                : typeof listing.adminNotes === 'string'
                ? listing.adminNotes
                : 'Unspecified';
            const reason = rawReason.trim().slice(0, 80) || 'Unspecified';
            rejectionReasonMap[reason] = (rejectionReasonMap[reason] || 0) + 1;
        }

        if (aiRiskScore >= 70 || badge === 'Suspicious') {
            suspiciousCount += 1;
        }

        const evidenceTypes = evidenceByListing.get(listing.id) || new Set<string>();
        const requiredCount = ['title_deed', 'survey_map', 'id_document', 'rate_clearance']
            .filter((requiredType) => evidenceTypes.has(requiredType)).length;
        evidenceScores.push(Math.round((requiredCount / 4) * 100));

        if (reviewedAt) {
            const dateKey = reviewedAt.toISOString().split('T')[0];
            if (dateKey in moderationTimelineMap) {
                if (listingStatus === 'approved') moderationTimelineMap[dateKey].approved += 1;
                if (listingStatus === 'rejected') moderationTimelineMap[dateKey].rejected += 1;
            }
        }
    });

    const reviewedSuggestions = aiSuggestionSnapshot.docs.map((doc) => doc.data() as {
        output?: { badge?: string };
        adminDecision?: string;
        override?: boolean | null;
    });
    const reviewedCount = reviewedSuggestions.length;
    const overridesCount = reviewedSuggestions.filter((entry) => {
        if (entry.override === true) return true;
        const aiBadge = entry.output?.badge;
        return !!entry.adminDecision && !!aiBadge && entry.adminDecision !== aiBadge;
    }).length;

    const evidenceCompletenessAverage = evidenceScores.length > 0
        ? Math.round(evidenceScores.reduce((sum, score) => sum + score, 0) / evidenceScores.length)
        : 0;

    const pendingAgeBuckets = [{ bucket: '< 24h', count: 0 }, { bucket: '1-3 days', count: 0 }, { bucket: '> 3 days', count: 0 }];
    listings
        .filter((listing) => listing.status === 'pending')
        .forEach((listing) => {
            const createdAt = toDateFromUnknown(listing.createdAt);
            if (!createdAt) return;
            const ageHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
            if (ageHours < 24) pendingAgeBuckets[0].count += 1;
            else if (ageHours <= 72) pendingAgeBuckets[1].count += 1;
            else pendingAgeBuckets[2].count += 1;
        });

    const moderationTimeline = Object.entries(moderationTimelineMap)
        .map(([date, values]) => ({ date, approved: values.approved, rejected: values.rejected }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        moderationTotals: stats,
        trendDeltas: { approved: 5, pending: -2, rejected: 0 },
        countyDistribution: Object.entries(countyMap).map(([county, count]) => ({ county, count })).sort((a,b) => b.count - a.count).slice(0, 10),
        badgeDistribution: Object.entries(badgeMap).map(([badge, count]) => ({ badge, count })),
        moderationTimeline,
        pendingAgeBuckets,
        rejectionReasons: Object.entries(rejectionReasonMap)
            .map(([reason, count]) => ({ reason, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8),
        repeatOffenders: Object.entries(sellerRejectionMap)
            .filter(([, count]) => count > 1)
            .map(([ownerId, count]) => ({ ownerId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10),
        fraudSignals: {
            suspiciousListings: suspiciousCount,
            evidenceCompletenessAverage,
        },
        modelDrift: {
            reviewedCount,
            overridesCount,
            overrideRate: reviewedCount > 0 ? Number(((overridesCount / reviewedCount) * 100).toFixed(2)) : 0,
        },
        window: { startDate: windowStart.toISOString(), endDate: windowEnd.toISOString() }
    };
});

export const getListingById = cache(async (id: string) => {
  const docSnap = await adminDb.collection('listings').doc(id).get();
  if (!docSnap.exists) return null;

  const data = docSnap.data();
  
  // Validate seller exists before returning listing
  if (!data) return null;
  const sellerValidation = await validateSellerExists(data.ownerId);
  if (!sellerValidation.isValidSeller) {
    console.warn(`[DataFetch] Skipping listing ${id} - seller validation failed:`, sellerValidation.error);
    return null;
  }

  const evidence = await getEvidenceForListing(id);
  return toListing(docSnap, evidence);
});
