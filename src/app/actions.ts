'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import type { Listing, ListingStatus, UserProfile } from '@/lib/types';
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
        return null;
    }
}

// Action to create a new listing
export async function createListing(formData: FormData): Promise<{id: string}> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    throw new Error('Authentication required. Please log in.');
  }

  // Get user profile to get displayName and photoURL
  const userRecord = await adminAuth.getUser(authUser.uid);

  const newListingData = {
    ownerId: authUser.uid,
    title: formData.get('title') as string,
    location: formData.get('location') as string,
    price: Number(formData.get('price')),
    description: formData.get('description') as string,
    status: 'pending' as ListingStatus,
    image: 'https://picsum.photos/seed/newland/1200/800', // Placeholder
    imageHint: 'generic landscape',
    seller: {
        name: userRecord.displayName || 'Anonymous Seller',
        avatarUrl: userRecord.photoURL || `https://i.pravatar.cc/150?u=${authUser.uid}`
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const docRef = await adminDb.collection('listings').add(newListingData);

  // Handle evidence upload
  const evidenceFiles = formData.getAll('evidence') as File[];
  if (evidenceFiles.length > 0) {
    const evidenceBatch = adminDb.batch();
    for(const file of evidenceFiles) {
        if (file.size > 0) {
            const evidenceRef = adminDb.collection('evidence').doc();
            // NOTE: File upload to a bucket (e.g., Firebase Storage) is NOT implemented.
            // We are storing file metadata and content directly in Firestore for this PoC,
            // which is not a scalable practice for real files.
            evidenceBatch.set(evidenceRef, {
                listingId: docRef.id,
                ownerId: authUser.uid,
                name: file.name,
                type: 'other', // In a real app, you might determine this from file type
                storageUrl: 'placeholder/path/to/' + file.name,
                content: `(Simulated content of ${file.name})`, // In a real app, you'd extract text via OCR if needed
                uploadedAt: FieldValue.serverTimestamp(),
            });
        }
    }
    await evidenceBatch.commit();
  }
  
  revalidatePath('/');
  revalidatePath('/dashboard');
  
  return { id: docRef.id };
}

// Action to update a listing's status
export async function updateListingStatus(listingId: string, status: ListingStatus) {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') {
    throw new Error('Authorization required: Only admins can update status.');
  }

  const listingRef = adminDb.collection('listings').doc(listingId);
  await listingRef.update({ 
      status,
      updatedAt: FieldValue.serverTimestamp(),
      adminReviewedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/admin');
  revalidatePath(`/admin/listings/${listingId}`);
  revalidatePath(`/listings/${listingId}`);
  revalidatePath('/');
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
