import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import type { Listing } from './types';
import { cache } from 'react';

// The 'cache' function from React is used to memoize data requests.
// This is crucial for performance in Next.js, as it prevents the same
// data from being fetched multiple times during a single render cycle.

export const getListings = cache(async (): Promise<Listing[]> => {
  const listingsCol = collection(db, 'listings');
  const snapshot = await getDocs(listingsCol);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
});

export const getListingsForSeller = cache(async (sellerId: string): Promise<Listing[]> => {
    if (!sellerId) return [];
    const listingsRef = collection(db, "listings");
    const q = query(listingsRef, where("sellerId", "==", sellerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Listing));
});


export const getListingById = cache(async (id: string): Promise<Listing | undefined> => {
  const docRef = doc(db, 'listings', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Listing;
  }
  return undefined;
});
