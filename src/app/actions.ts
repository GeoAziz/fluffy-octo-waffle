'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { BadgeStatus, Listing, UserProfile } from '@/lib/types';
import { summarizeEvidence } from '@/ai/flows/summarize-evidence-for-admin-review';
import { flagSuspiciousUploadPatterns } from '@/ai/flows/flag-suspicious-upload-patterns';
import { FieldValue } from 'firebase-admin/firestore';

async function getAuthenticatedUser(): Promise<{uid: string, role: UserProfile['role']} | null> {
    const sessionCookie = cookies().get('__session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists) return null;
        
        const userProfile = userDoc.data() as UserProfile;
        return { uid: decodedToken.uid, role: userProfile.role };
    } catch(e) {
        // Invalid cookie, it will be cleared on next request by middleware
        return null;
    }
}

// Action to create a new listing
export async function createListing(formData: FormData): Promise<Listing> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    throw new Error('Authentication required. Please log in.');
  }

  // Get user profile to get displayName and photoURL
  const userRecord = await adminAuth.getUser(authUser.uid);

  const newListingData: Omit<Listing, 'id'> = {
    title: formData.get('title') as string,
    location: formData.get('location') as string,
    price: Number(formData.get('price')),
    description: formData.get('description') as string,
    badge: formData.has('evidence') && (formData.get('evidence') as File).size > 0 ? ('EvidenceSubmitted' as BadgeStatus) : ('None' as BadgeStatus),
    image: 'https://picsum.photos/seed/newland/600/400', // Placeholder
    imageHint: 'generic landscape',
    sellerId: authUser.uid,
    seller: {
        name: userRecord.displayName || 'Anonymous Seller',
        avatarUrl: userRecord.photoURL || `https://i.pravatar.cc/150?u=${authUser.uid}`
    },
    evidence: [], // In a real app, you would handle file upload to a bucket here
    createdAt: FieldValue.serverTimestamp(),
  };

  const docRef = await adminDb.collection('listings').add(newListingData);
  
  revalidatePath('/');
  revalidatePath('/dashboard');
  
  // Create a version of the object that is serializable to the client
  return { 
      id: docRef.id, 
      ...newListingData, 
      createdAt: new Date()
    } as unknown as Listing;
}

// Action to update a listing's badge
export async function updateListingBadge(listingId: string, badge: BadgeStatus) {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') {
    throw new Error('Authorization required: Only admins can update badges.');
  }

  const listingRef = adminDb.collection('listings').doc(listingId);
  await listingRef.update({ badge });

  revalidatePath('/admin');
  revalidatePath(`/admin/listings/${listingId}`);
  revalidatePath(`/listings/${listingId}`);
}

// Action to call the AI summarization flow
export async function getAiSummary(documentText: string) {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') {
        throw new Error('Authorization required.');
    }
    if (!documentText) {
        throw new Error('Document text is required.');
    }
    const result = await summarizeEvidence({ documentText });
    return result;
}

// Action to call the suspicious pattern detection flow
export async function checkSuspiciousPatterns(documentDescriptions: string[]) {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') {
        throw new Error('Authorization required.');
    }
    if (documentDescriptions.length === 0) {
        throw new Error('At least one document description is required.');
    }
    const result = await flagSuspiciousUploadPatterns({ documentDescriptions });
    return result;
}
