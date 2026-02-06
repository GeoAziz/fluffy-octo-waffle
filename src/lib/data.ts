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
  query?: string; // for county search
  minPrice?: number;
  maxPrice?: number;
  landType?: string;
  limit?: number;
  startAfter?: string; // a document ID
} = {}): Promise<{ listings: Listing[], lastVisibleId: string | null }> => {
  const {
    status = 'approved',
    query,
    minPrice,
    maxPrice,
    landType,
    limit: queryLimit = 12,
    startAfter: startAfterId
  } = options;

  let listingsQuery: FirebaseFirestore.Query = adminDb.collection('listings');

  if (status !== 'all') {
    listingsQuery = listingsQuery.where('status', '==', status);
  }
  
  if (query) {
     // Firestore doesn't support case-insensitive or partial string searches natively.
     // For a production app, a search service like Algolia is recommended.
     // Here, we'll do a simple equality check on a capitalized version.
     const capitalizedQuery = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
     listingsQuery = listingsQuery.where('county', '>=', capitalizedQuery).where('county', '<=', capitalizedQuery + '\uf8ff');
  }

  if (landType) {
    listingsQuery = listingsQuery.where('landType', '==', landType);
  }
  
  // Price filtering. Firestore requires ordering by the field being used in a range filter.
  // We prioritize ordering by date, so price filtering will be done in-memory.
  // This is a trade-off for this implementation.
  listingsQuery = listingsQuery.orderBy('createdAt', 'desc');

  if (startAfterId) {
    const startAfterDoc = await adminDb.collection('listings').doc(startAfterId).get();
    if (startAfterDoc.exists) {
      listingsQuery = listingsQuery.startAfter(startAfterDoc);
    }
  }

  listingsQuery = listingsQuery.limit(queryLimit);

  const snapshot = await listingsQuery.get();

  let listings = snapshot.docs.map(doc => toListing(doc, []));
  
  // In-memory filtering for price
  if (minPrice || maxPrice) {
      listings = listings.filter(l => {
          const price = l.price;
          const isAboveMin = minPrice ? price >= minPrice : true;
          const isBelowMax = maxPrice ? price <= maxPrice : true;
          return isAboveMin && isBelowMax;
      });
  }

  const lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
  return {
    listings,
    lastVisibleId: lastVisible ? lastVisible.id : null,
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
