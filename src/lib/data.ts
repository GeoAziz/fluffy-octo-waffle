import { adminDb } from './firebase-admin';
import type { Listing } from './types';
import { cache } from 'react';
import type { Timestamp } from 'firebase-admin/firestore';

// Helper to convert a Firestore document to a serializable Listing object
const toListing = (doc: FirebaseFirestore.DocumentSnapshot): Listing => {
    const data = doc.data();
    if (!data) {
        // This should ideally not happen if doc.exists is true
        throw new Error("Document data is empty");
    }
    
    // The data from Firestore has a Timestamp object for createdAt
    const firestoreListing = {
        id: doc.id,
        ...data,
    } as Omit<Listing, 'createdAt'> & { createdAt: Timestamp };

    // We convert it to a Date object to make it serializable for the client
    return {
        ...firestoreListing,
        createdAt: firestoreListing.createdAt.toDate(),
    };
}

// The 'cache' function from React is used to memoize data requests.
// This is crucial for performance in Next.js, as it prevents the same
// data from being fetched multiple times during a single render cycle.

export const getListings = cache(async (): Promise<Listing[]> => {
  const listingsCol = adminDb.collection('listings');
  // Order by creation date, newest first
  const snapshot = await listingsCol.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(toListing);
});

export const getListingsForSeller = cache(async (sellerId: string): Promise<Listing[]> => {
    if (!sellerId) return [];
    const listingsRef = adminDb.collection("listings");
    const q = listingsRef.where("sellerId", "==", sellerId).orderBy('createdAt', 'desc');
    const snapshot = await q.get();
    return snapshot.docs.map(toListing);
});


export const getListingById = cache(async (id: string): Promise<Listing | undefined> => {
  const docRef = adminDb.collection('listings').doc(id);
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    return toListing(docSnap);
  }
  return undefined;
});
