
import { adminDb, adminStorage } from './firebase-admin';
import type { Listing, Evidence, ListingStatus, BadgeValue, ListingImage, PlatformSettings } from './types';
import { cache } from 'react';
import { Timestamp, type FieldValue } from 'firebase-admin/firestore';
import { validateSellerExists } from './seller-validation';

const isNetworkError = (error: unknown): boolean => {
    const message = error instanceof Error ? error.message : String(error);
    const anyError = error as { code?: number | string; errorInfo?: { code?: string } } | null;
    const code = anyError?.code ?? anyError?.errorInfo?.code;

    return (
        code === 14 ||
        code === 'EAI_AGAIN' ||
        message.includes('EAI_AGAIN') ||
        message.includes('Name resolution failed') ||
        message.includes('getaddrinfo')
    );
};

const toDate = (timestamp: Timestamp | FieldValue | undefined): Date | null => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return null;
}

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

const calculateRiskScore = (data: any): number => {
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

    let images: ListingImage[] = firestoreListing.images || (firestoreListing.image ? [{ url: firestoreListing.image, hint: firestoreListing.imageHint || 'legacy' }] : [{ url: 'https://picsum.photos/seed/placeholder/1200/800', hint: 'landscape' }]);

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

    const evidenceList = snapshot.docs.map(toEvidence);
    return Promise.all(evidenceList.map(async (doc) => {
        if (!doc.storagePath) return doc;
        try {
            const [url] = await adminStorage.bucket().file(doc.storagePath).getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 15 * 60 * 1000,
            });
            return { ...doc, url };
        } catch {
            return doc;
        }
    }));
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

export const getListings = async (options: any = {}) => {
  const { status = 'approved', query, county, limit: queryLimit = 12, startAfter: startAfterId } = options;
  let q: FirebaseFirestore.Query = adminDb.collection('listings');
  if (status !== 'all') q = q.where('status', '==', status);
  if (county) q = q.where('county', '==', county);
  q = q.orderBy('createdAt', 'desc');
  if (startAfterId) {
    const doc = await adminDb.collection('listings').doc(startAfterId).get();
    if (doc.exists) q = q.startAfter(doc);
  }
  q = q.limit(queryLimit);
  const snapshot = await q.get();
  
  // Filter listings and validate sellers
  let listings: Listing[] = [];
  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Validate seller exists
    const sellerValidation = await validateSellerExists(data.ownerId);
    if (!sellerValidation.isValidSeller) {
      console.warn(`[DataFetch] Filtering out listing ${doc.id} - seller validation failed:`, sellerValidation.error);
      continue;
    }
    
    listings.push(toListing(doc, []));
  }
  
  if (query) {
      listings = listings.filter(l => 
          l.county.toLowerCase().includes(query.toLowerCase()) || 
          l.location.toLowerCase().includes(query.toLowerCase()) ||
          l.title.toLowerCase().includes(query.toLowerCase())
      );
  }
  
  const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  return { listings, lastVisibleId: lastVisible ? lastVisible.id : null };
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

export const getAdminAnalyticsSummary = cache(async (options: any = {}) => {
    const stats = await getAdminDashboardStats();
    const snapshot = await adminDb.collection('listings').get();
    const listings = snapshot.docs.map(doc => doc.data() as Listing);
    
    const countyMap: Record<string, number> = {};
    const badgeMap: Record<string, number> = { Gold: 0, Silver: 0, Bronze: 0, None: 0 };
    
    listings.forEach(l => {
        countyMap[l.county] = (countyMap[l.county] || 0) + 1;
        if (l.status === 'approved') {
            const b = l.badge || 'None';
            badgeMap[b] = (badgeMap[b] || 0) + 1;
        }
    });

    return {
        moderationTotals: stats,
        trendDeltas: { approved: 5, pending: -2, rejected: 0 },
        countyDistribution: Object.entries(countyMap).map(([county, count]) => ({ county, count })).sort((a,b) => b.count - a.count).slice(0, 10),
        badgeDistribution: Object.entries(badgeMap).map(([badge, count]) => ({ badge: badge as any, count })),
        moderationTimeline: await getListingStatsByDay(options.days || 30),
        pendingAgeBuckets: [{ bucket: '< 24h', count: 5 }, { bucket: '1-3 days', count: 3 }],
        window: { startDate: new Date().toISOString(), endDate: new Date().toISOString() }
    };
});

export const getListingById = cache(async (id: string) => {
  const docSnap = await adminDb.collection('listings').doc(id).get();
  if (!docSnap.exists) return null;

  const data = docSnap.data();
  
  // Validate seller exists before returning listing
  const sellerValidation = await validateSellerExists(data.ownerId);
  if (!sellerValidation.isValidSeller) {
    console.warn(`[DataFetch] Skipping listing ${id} - seller validation failed:`, sellerValidation.error);
    return null;
  }

  const evidence = await getEvidenceForListing(id);
  return toListing(docSnap, evidence);
});
