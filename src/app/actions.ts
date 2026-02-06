'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';
import type { ListingStatus, UserProfile, ImageAnalysis, BadgeSuggestion } from '@/lib/types';
import { summarizeEvidence } from '@/ai/flows/summarize-evidence-for-admin-review';
import { flagSuspiciousUploadPatterns } from '@/ai/flows/flag-suspicious-upload-patterns';
import { FieldValue } from 'firebase-admin/firestore';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import { generatePropertyDescription } from '@/ai/flows/generate-property-description';
import { analyzePropertyImage } from '@/ai/flows/analyze-property-image';
import { suggestTrustBadge } from '@/ai/flows/suggest-trust-badge';

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

// Action to generate a property description
export async function generateDescriptionAction(bulletPoints: string) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      throw new Error('Authentication required.');
    }
    if (!bulletPoints) {
        throw new Error('Bullet points are required to generate a description.');
    }
    const result = await generatePropertyDescription({ bulletPoints });
    return result;
}


// Action to create a new listing
export async function createListing(formData: FormData): Promise<{id: string}> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    throw new Error('Authentication required. Please log in.');
  }

  const userRecord = await adminAuth.getUser(authUser.uid);

  const title = formData.get('title') as string;
  const allEvidenceContent: string[] = [];
  let imageAnalysisResult: ImageAnalysis | undefined = undefined;
  let badgeSuggestionResult: BadgeSuggestion | undefined = undefined;
  let mainImageUrl = 'https://picsum.photos/seed/newland/1200/800'; // Default placeholder

  const bucket = adminStorage.bucket();

  // 1. Handle main property image upload and analysis
  const mainImageFile = formData.get('mainImage') as File;
  if (mainImageFile && mainImageFile.size > 0) {
      const imageBuffer = Buffer.from(await mainImageFile.arrayBuffer());
      const imagePath = `listings/${authUser.uid}/${Date.now()}-${mainImageFile.name}`;
      
      await bucket.file(imagePath).save(imageBuffer, {
          metadata: { contentType: mainImageFile.type }
      });
      mainImageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;

      try {
          const imageDataUri = `data:${mainImageFile.type};base64,${imageBuffer.toString('base64')}`;
          imageAnalysisResult = await analyzePropertyImage({ imageDataUri });
      } catch (e) {
          console.error('Image analysis failed:', e);
          // Fail gracefully, allow listing creation to continue
      }
  }


  const docRef = adminDb.collection('listings').doc();

  // 2. Handle evidence upload and OCR
  const evidenceFiles = formData.getAll('evidence') as File[];
  if (evidenceFiles.length > 0 && evidenceFiles[0].size > 0) {
    const evidenceBatch = adminDb.batch();

    await Promise.all(evidenceFiles.map(async (file) => {
        if (file.size > 0) {
            const evidenceRef = adminDb.collection('evidence').doc();
            const filePath = `evidence/${authUser.uid}/${docRef.id}/${Date.now()}-${file.name}`;
            const fileBuffer = Buffer.from(await file.arrayBuffer());

            await bucket.file(filePath).save(fileBuffer, {
                metadata: {
                    contentType: file.type,
                    metadata: { ownerId: authUser.uid, listingId: docRef.id }
                }
            });

            let contentForAi = `(File: ${file.name}, Type: ${file.type} - cannot be summarized)`;
            if (file.type.startsWith('image/')) {
                try {
                    const imageDataUri = `data:${file.type};base64,${fileBuffer.toString('base64')}`;
                    const ocrResult = await extractTextFromImage({ imageDataUri });
                    contentForAi = ocrResult.extractedText?.trim() || `(Image file: ${file.name} - No text found)`;
                } catch (ocrError) {
                    console.error(`OCR failed for ${file.name}:`, ocrError);
                    contentForAi = `(OCR failed for image: ${file.name})`;
                }
            }
            allEvidenceContent.push(contentForAi);

            evidenceBatch.set(evidenceRef, {
                listingId: docRef.id,
                ownerId: authUser.uid,
                name: file.name,
                type: 'other',
                storagePath: filePath,
                uploadedAt: FieldValue.serverTimestamp(),
                content: contentForAi,
                verified: false,
            });
        }
    }));
    await evidenceBatch.commit();
  }

  // 3. Suggest a trust badge based on evidence
  if (allEvidenceContent.length > 0) {
      try {
          badgeSuggestionResult = await suggestTrustBadge({ listingTitle: title, evidenceContent: allEvidenceContent });
      } catch(e) {
          console.error('Badge suggestion failed:', e);
      }
  }

  // 4. Assemble and save the final listing
  const newListingData = {
    ownerId: authUser.uid,
    title: title,
    location: formData.get('location') as string,
    county: formData.get('county') as string,
    price: Number(formData.get('price')),
    area: Number(formData.get('area')),
    size: formData.get('size') as string,
    landType: formData.get('landType') as string,
    description: formData.get('description') as string,
    status: 'pending' as ListingStatus,
    image: mainImageUrl,
    imageHint: 'custom upload',
    seller: {
        name: userRecord.displayName || 'Anonymous Seller',
        avatarUrl: userRecord.photoURL || `https://i.pravatar.cc/150?u=${authUser.uid}`
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    ...(imageAnalysisResult && { imageAnalysis: imageAnalysisResult }),
    ...(badgeSuggestionResult && { badgeSuggestion: badgeSuggestionResult }),
  };

  await docRef.set(newListingData);
  
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

// Action to delete a listing and its associated evidence
export async function deleteListing(listingId: string) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error("Authentication required.");

    const listingRef = adminDb.collection('listings').doc(listingId);
    const listingDoc = await listingRef.get();

    if (!listingDoc.exists) throw new Error("Listing not found.");

    const listing = listingDoc.data();
    if (!listing) throw new Error("Listing data is missing.");


    // Authorization Check: Must be owner or admin
    if (listing.ownerId !== authUser.uid && authUser.role !== 'ADMIN') {
        throw new Error("Authorization required: You do not have permission to delete this listing.");
    }

    const writeBatch = adminDb.batch();

    // 1. Delete evidence documents from Firestore
    const evidenceQuery = adminDb.collection('evidence').where('listingId', '==', listingId);
    const evidenceSnapshot = await evidenceQuery.get();
    
    evidenceSnapshot.forEach(doc => {
        writeBatch.delete(doc.ref);
    });

    // 2. Delete files from Cloud Storage
    const bucket = adminStorage.bucket();
    // Delete main image
    if (listing.image && listing.image.includes(bucket.name)) {
        try {
            const imagePath = listing.image.split(`${bucket.name}/`)[1].split('?')[0];
            await bucket.file(imagePath).delete();
        } catch (error) {
             console.error(`Failed to delete main image ${listing.image}`, error);
        }
    }
    // Delete evidence files
    const prefix = `evidence/${listing.ownerId}/${listingId}/`;
    try {
        await bucket.deleteFiles({ prefix });
    } catch (error: any) {
        if (error.code !== 404) { // Ignore not found errors
            console.error(`Failed to delete evidence files for prefix ${prefix}`, error);
        }
    }

    // 3. Delete the main listing document
    writeBatch.delete(listingRef);

    // 4. Commit all deletions
    await writeBatch.commit();

    // 5. Revalidate paths
    revalidatePath('/');
    revalidatePath('/dashboard');
    if (authUser.role === 'ADMIN') {
        revalidatePath('/admin');
    }
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
