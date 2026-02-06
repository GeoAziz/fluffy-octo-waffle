import { adminDb } from './firebase-admin';
import type { Listing, Evidence, ListingStatus } from './types';
import { cache } from 'react';
import type { Timestamp, FieldValue } from 'firebase-admin/firestore';

// Helper to convert a Firestore Timestamp to a serializable Date
const toDate = (timestamp: Timestamp | FieldValue | undefined): Date | null => {
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }
    return null;
}

// Helper to convert a Firestore document to a serializable Listing object
const toListing = (doc: FirebaseFirestore.DocumentSnapshot, evidence: Evidence[] = []): Listing => {
    const data = doc.data();
    if (!data) {
        throw new Error("Document data is empty");
    }
    
    // Create a base object that matches the structure but may have Timestamps
    const firestoreListing = {
        id: doc.id,
        ...data,
    } as Omit<Listing, 'createdAt' | 'updatedAt' | 'adminReviewedAt' | 'evidence'> & { 
        createdAt: Timestamp;
        updatedAt: Timestamp;
        adminReviewedAt?: Timestamp;
    };

    // Convert all timestamp fields to serializable Date objects
    return {
        ...firestoreListing,
        createdAt: toDate(firestoreListing.createdAt)!,
        updatedAt: toDate(firestoreListing.updatedAt)!,
        adminReviewedAt: toDate(firestoreListing.adminReviewedAt),
        evidence,
    };
}

// Helper to convert Firestore doc to serializable Evidence object
const toEvidence = (doc: FirebaseFirestore.DocumentSnapshot): Evidence => {
    const data = doc.data();
    if (!data) {
        throw new Error("Evidence document data is empty");
    }
     const firestoreEvidence = {
        id: doc.id,
        ...data,
    } as Omit<Evidence, 'uploadedAt'> & { uploadedAt: Timestamp };

    return {
        ...firestoreEvidence,
        uploadedAt: toDate(firestoreEvidence.uploadedAt)!,
    }
}


// Fetches evidence documents for a given listing ID
const getEvidenceForListing = async (listingId: string): Promise<Evidence[]> => {
    const evidenceCol = adminDb.collection('evidence');
    const snapshot = await evidenceCol.where('listingId', '==', listingId).get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(toEvidence);
}

// The 'cache' function from React is used to memoize data requests.
export const getListings = async (options: {
  status?: ListingStatus | 'all';
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  landType?: string;
  badge?: string;
  limit?: number;
  startAfter?: string; // a document ID
} = {}): Promise<{ listings: Listing[], lastVisibleId: string | null }> => {
  const {
    status = 'approved',
    query,
    minPrice = 0,
    maxPrice,
    minArea = 0,
    maxArea,
    landType,
    badge,
    limit: queryLimit = 12,
    startAfter: startAfterId
  } = options;

  let listingsQuery: FirebaseFirestore.Query = adminDb.collection('listings');

  if (status !== 'all') {
    listingsQuery = listingsQuery.where('status', '==', status);
  }
  
  if (landType) {
    listingsQuery = listingsQuery.where('landType', '==', landType);
  }

  if (badge) {
    listingsQuery = listingsQuery.where('badgeSuggestion.badge', '==', badge);
  }
  
  // Firestore requires the first orderBy to be on the same field as an inequality filter.
  // We'll prioritize filtering by price if it's specified.
  const hasPriceFilter = typeof maxPrice === 'number' && maxPrice < 50000000;
  
  if (hasPriceFilter) {
    listingsQuery = listingsQuery.where('price', '>=', minPrice);
    if (maxPrice) {
        listingsQuery = listingsQuery.where('price', '<=', maxPrice);
    }
    listingsQuery = listingsQuery.orderBy('price');
  } else {
    // Default sort order when not filtering by price
    listingsQuery = listingsQuery.orderBy('createdAt', 'desc');
  }

  // NOTE: Firestore limitations prevent querying by multiple range filters (e.g., price AND area)
  // at the same time without creating composite indexes. For this implementation, we filter by
  // price in the query and will filter by area and query string in memory for flexibility.
  // For a large-scale app, a dedicated search service like Algolia or Typesense is recommended.

  if (startAfterId) {
    const startAfterDoc = await adminDb.collection('listings').doc(startAfterId).get();
    if (startAfterDoc.exists) {
      listingsQuery = listingsQuery.startAfter(startAfterDoc);
    }
  }

  listingsQuery = listingsQuery.limit(queryLimit);

  const snapshot = await listingsQuery.get();

  let listings = snapshot.docs.map(doc => toListing(doc, []));
  
  // In-memory filtering for area and text query
  if (query || (typeof maxArea === 'number' && maxArea < 100)) {
      listings = listings.filter(l => {
          const isAreaMatch = maxArea && maxArea < 100 ? l.area >= minArea && l.area <= maxArea : true;
          
          const isQueryMatch = query ? 
              l.county.toLowerCase().includes(query.toLowerCase()) || 
              l.location.toLowerCase().includes(query.toLowerCase()) ||
              l.title.toLowerCase().includes(query.toLowerCase())
              : true;
              
          return isAreaMatch && isQueryMatch;
      });
  }

  const lastVisible = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
  const hasMoreListings = snapshot.docs.length === queryLimit;
  
  return {
    listings,
    lastVisibleId: hasMoreListings && lastVisible ? lastVisible.id : null,
  };
};

export const getListingsForSeller = cache(async (sellerId: string): Promise<Listing[]> => {
    if (!sellerId) return [];
    const listingsRef = adminDb.collection("listings");
    const q = listingsRef.where("ownerId", "==", sellerId).orderBy('createdAt', 'desc');
    const snapshot = await q.get();

    return Promise.all(snapshot.docs.map(async (doc) => {
        // We don't need full evidence for the dashboard view to keep it fast
        return toListing(doc, []);
    }));
});

export const getAllListingsForAdmin = cache(async (): Promise<Listing[]> => {
    const listingsCol = adminDb.collection('listings');
    const snapshot = await listingsCol.orderBy('createdAt', 'desc').get();
    // Admin dashboard doesn't need evidence details upfront
    return snapshot.docs.map(doc => toListing(doc, []));
});


export const getListingById = cache(async (id: string): Promise<Listing | null> => {
  const docRef = adminDb.collection('listings').doc(id);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    const evidence = await getEvidenceForListing(id);
    return toListing(docSnap, evidence);
  }
  return null;
});
