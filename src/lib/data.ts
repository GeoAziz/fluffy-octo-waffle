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
export const getListings = cache(async (): Promise<Listing[]> => {
  const listingsCol = adminDb.collection('listings');
  // Public users only see 'approved' listings
  const snapshot = await listingsCol
    .where('status', '==', 'approved')
    .orderBy('createdAt', 'desc')
    .get();

  return Promise.all(snapshot.docs.map(async (doc) => {
    const evidence = await getEvidenceForListing(doc.id);
    return toListing(doc, evidence);
  }));
});

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
