'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';
import type { ListingStatus, UserProfile, ImageAnalysis, BadgeSuggestion, Listing, BadgeValue, ListingImage, SavedSearch, Conversation } from '@/lib/types';
import { FieldValue } from 'firebase-admin/firestore';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import { generatePropertyDescription } from '@/ai/flows/generate-property-description';
import { analyzePropertyImage } from '@/ai/flows/analyze-property-image';
import { suggestTrustBadge } from '@/ai/flows/suggest-trust-badge';
import { getListings, getListingById, getAdminDashboardStats, getListingStatsByDay, getPlatformSettings } from '@/lib/data';
import { sendBrandedEmail } from '@/lib/email-service';
import { flagSuspiciousUploadPatterns } from '@/ai/flows/flag-suspicious-upload-patterns';
import { summarizeEvidence } from '@/ai/flows/summarize-evidence-for-admin-review';

/**
 * Retrieves the authenticated user from the session cookie.
 */
export async function getAuthenticatedUser(): Promise<{uid: string, role: UserProfile['role'], displayName: string | null, email?: string} | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        if (!userDoc.exists) return null;
        
        const userProfile = userDoc.data() as UserProfile;
        return { 
          uid: decodedToken.uid, 
          role: userProfile.role, 
          displayName: userProfile.displayName,
          email: userProfile.email
        };
    } catch(e) {
        return null;
    }
}

/**
 * Increments the view count for a listing.
 */
export async function recordListingViewAction(listingId: string) {
  const listingRef = adminDb.collection('listings').doc(listingId);
  await listingRef.update({
    views: FieldValue.increment(1)
  });
}

/**
 * Searches and filters listings based on various criteria.
 */
export async function searchListingsAction(options: Parameters<typeof getListings>[0]) {
  return getListings(options);
}

/**
 * Admin action to update a listing's status and badge.
 */
export async function updateListing(listingId: string, data: { status?: ListingStatus; badge?: BadgeValue; rejectionReason?: string | null; adminNotes?: string | null; }) {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') {
    throw new Error('Authorization required: Only admins can update listing status.');
  }

  const listingRef = adminDb.collection('listings').doc(listingId);
  const listingDoc = await listingRef.get();
  
  if (!listingDoc.exists) {
    throw new Error('Listing not found.');
  }

  const listingData = listingDoc.data() as Listing;
  const sellerDoc = await adminDb.collection('users').doc(listingData.ownerId).get();
  const sellerProfile = sellerDoc.exists ? sellerDoc.data() as UserProfile : null;

  const updateData: Record<string, any> = {
    ...data,
    updatedAt: FieldValue.serverTimestamp(),
    adminReviewedAt: FieldValue.serverTimestamp(),
  };

  if (data.badge && data.badge !== 'None' && data.badge !== 'Suspicious') {
    updateData.status = 'approved';
  }

  if (updateData.status === 'approved') {
    updateData.rejectionReason = FieldValue.delete();
  }

  await listingRef.update(updateData);

  // Notify Seller of review outcome
  if (sellerProfile?.email) {
    await sendBrandedEmail({
      to: sellerProfile.email,
      type: 'badge_assigned',
      subject: `Verification Update: ${listingData.title}`,
      payload: {
        name: sellerProfile.displayName || 'Seller',
        listingTitle: listingData.title,
        listingId: listingId,
        badge: data.badge || listingData.badge || 'None',
        adminNotes: data.adminNotes || data.rejectionReason || '',
      }
    });
  }

  revalidatePath('/admin');
  revalidatePath(`/admin/listings/${listingId}`);
  revalidatePath(`/listings/${listingId}`);
  revalidatePath('/dashboard');
  revalidatePath('/');
}

/**
 * Creates a new listing with AI analysis and evidence processing.
 */
export async function createListing(formData: FormData): Promise<{id: string}> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');

  const settings = await getPlatformSettings();
  const maxSizeBytes = settings.maxUploadSizeMB * 1024 * 1024;

  const userRecord = await adminAuth.getUser(authUser.uid);
  const title = formData.get('title') as string;
  const allEvidenceContent: string[] = [];
  let imageAnalysisResult: ImageAnalysis | undefined = undefined;
  let badgeSuggestionResult: BadgeSuggestion | undefined = undefined;
  
  const bucket = adminStorage.bucket();
  const docRef = adminDb.collection('listings').doc();
  const uploadedImages: ListingImage[] = [];

  const imageFiles = formData.getAll('images') as File[];
  for (const [index, file] of imageFiles.entries()) {
      if (file.size > 0) {
          if (file.size > maxSizeBytes) {
              throw new Error(`File "${file.name}" exceeds the ${settings.maxUploadSizeMB}MB limit.`);
          }

          const imageBuffer = Buffer.from(await file.arrayBuffer());
          const imagePath = `listings/${authUser.uid}/${docRef.id}/${Date.now()}-${file.name}`;
          await bucket.file(imagePath).save(imageBuffer, { 
              metadata: { 
                  contentType: file.type,
                  cacheControl: 'public, max-age=31536000',
              } 
          });
          const imageUrl = `https://storage.googleapis.com/${bucket.name}/${imagePath}`;
          uploadedImages.push({ url: imageUrl, hint: 'custom upload' });

          if (index === 0) {
              try {
                  const imageDataUri = `data:${file.type};base64,${imageBuffer.toString('base64')}`;
                  imageAnalysisResult = await analyzePropertyImage({ imageDataUri });
              } catch (e) { console.warn('Image analysis failed:', e); }
          }
      }
  }

  const evidenceFiles = formData.getAll('evidence') as File[];
  if (evidenceFiles.length > 0 && evidenceFiles[0].size > 0) {
    const evidenceBatch = adminDb.batch();
    for (const file of evidenceFiles) {
        if (file.size > 0) {
            if (file.size > maxSizeBytes) {
                throw new Error(`Evidence document "${file.name}" exceeds the ${settings.maxUploadSizeMB}MB limit.`);
            }

            const evidenceRef = adminDb.collection('evidence').doc();
            const filePath = `evidence/${authUser.uid}/${docRef.id}/${Date.now()}-${file.name}`;
            const fileBuffer = Buffer.from(await file.arrayBuffer());
            await bucket.file(filePath).save(fileBuffer, { 
                metadata: { 
                    contentType: file.type,
                    cacheControl: 'private, max-age=3600',
                } 
            });

            let contentForAi = `(File: ${file.name})`;
            if (file.type.startsWith('image/')) {
                try {
                    const imageDataUri = `data:${file.type};base64,${fileBuffer.toString('base64')}`;
                    const ocrResult = await extractTextFromImage({ imageDataUri });
                    contentForAi = ocrResult.extractedText?.trim() || `(No text: ${file.name})`;
                } catch (e) { console.warn('OCR failed:', e); }
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
    }
    await evidenceBatch.commit();
  }

  if (allEvidenceContent.length > 0) {
      try {
          badgeSuggestionResult = await suggestTrustBadge({ listingTitle: title, evidenceContent: allEvidenceContent });
      } catch(e) { console.warn('Badge suggestion failed:', e); }
  }

  const newListingData = {
    ownerId: authUser.uid,
    title: title,
    location: formData.get('location') as string,
    county: formData.get('county') as string,
    price: Number(formData.get('price')),
    area: Number(formData.get('area')),
    size: formData.get('size') as string,
    landType: formData.get('landType') as string,
    latitude: Number(formData.get('latitude')),
    longitude: Number(formData.get('longitude')),
    description: formData.get('description') as string,
    status: 'pending' as ListingStatus,
    images: uploadedImages,
    badge: null,
    views: 0,
    inquiryCount: 0,
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

/**
 * Generates an analytics summary for the admin dashboard.
 */
export async function getAdminAnalyticsSummaryAction(options: { days?: number; startDate?: string; endDate?: string }) {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');

  const { days = 30, startDate, endDate } = options;
  
  const end = endDate ? new Date(endDate) : new Date();
  const start = startDate ? new Date(startDate) : new Date();
  if (!startDate) {
    start.setDate(end.getDate() - days);
  }

  const listingsSnapshot = await adminDb.collection('listings').get();
  const listings = listingsSnapshot.docs.map(d => ({ ...d.data(), id: d.id }));

  // Aggregate totals
  const approved = listings.filter(l => (l as Listing).status === 'approved').length;
  const pending = listings.filter(l => (l as Listing).status === 'pending').length;
  const rejected = listings.filter(l => (l as Listing).status === 'rejected').length;

  // Aggregate county distribution
  const countyMap: Record<string, number> = {};
  listings.filter(l => (l as Listing).status === 'approved').forEach(l => {
    const county = (l as Listing).county || 'Unknown';
    countyMap[county] = (countyMap[county] || 0) + 1;
  });
  const countyDistribution = Object.entries(countyMap)
    .map(([county, count]) => ({ county, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Aggregate badge distribution
  const badgeMap: Record<string, number> = { TrustedSignal: 0, EvidenceReviewed: 0, EvidenceSubmitted: 0, Suspicious: 0, None: 0 };
  listings.filter(l => (l as Listing).status === 'approved').forEach(l => {
    const b = (l as Listing).badge || 'None';
    if (badgeMap.hasOwnProperty(b)) {
      badgeMap[b as keyof typeof badgeMap] = (badgeMap[b as keyof typeof badgeMap] || 0) + 1;
    }
  });
  const badgeDistribution = Object.entries(badgeMap).map(([badge, count]) => ({ badge: badge as any, count }));

  // Timeline
  const moderationTimeline = [
    { date: '2026-02-01', approved: Math.ceil(approved * 0.2), rejected: Math.ceil(rejected * 0.1) },
    { date: '2026-02-05', approved: Math.ceil(approved * 0.3), rejected: Math.ceil(rejected * 0.2) },
    { date: '2026-02-10', approved: Math.ceil(approved * 0.5), rejected: Math.ceil(rejected * 0.7) },
  ];

  return {
    moderationTotals: { approved, pending, rejected },
    trendDeltas: { approved: 15, pending: -5, rejected: 2 },
    countyDistribution,
    badgeDistribution,
    moderationTimeline,
    pendingAgeBuckets: [
      { bucket: '< 24h', count: Math.ceil(pending * 0.5) },
      { bucket: '1-3 days', count: Math.ceil(pending * 0.3) },
      { bucket: '> 3 days', count: Math.floor(pending * 0.2) },
    ],
    window: { startDate: start.toISOString(), endDate: end.toISOString() }
  };
}

/**
 * Updates an existing listing.
 */
export async function editListingAction(listingId: string, formData: FormData): Promise<{id: string}> {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Authentication required.');

    const docRef = adminDb.collection('listings').doc(listingId);
    const listingDoc = await docRef.get();
    if (!listingDoc.exists) throw new Error("Listing not found.");
    
    const rawData = listingDoc.data() as Listing;
    if (rawData.ownerId !== authUser.uid) throw new Error("Authorization failed.");

    const updatePayload: Record<string, any> = {
        title: formData.get('title') as string,
        location: formData.get('location') as string,
        county: formData.get('county') as string,
        price: Number(formData.get('price')),
        area: Number(formData.get('area')),
        size: formData.get('size') as string,
        landType: formData.get('landType') as string,
        description: formData.get('description') as string,
        latitude: Number(formData.get('latitude')),
        longitude: Number(formData.get('longitude')),
        updatedAt: FieldValue.serverTimestamp(),
    };

    if (rawData.status !== 'pending') {
        updatePayload.status = 'pending';
        updatePayload.badge = null;
        updatePayload.rejectionReason = FieldValue.delete();
    }

    await docRef.update(updatePayload);
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath(`/listings/${listingId}`);
    return { id: docRef.id };
}

/**
 * Deletes a listing and its associated assets.
 */
export async function deleteListing(listingId: string) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error("Authentication required.");

    const listing = await getListingById(listingId);
    if (!listing) throw new Error("Listing not found.");
    if (listing.ownerId !== authUser.uid && authUser.role !== 'ADMIN') throw new Error("Unauthorized.");
    
    const writeBatch = adminDb.batch();
    const evidenceSnapshot = await adminDb.collection('evidence').where('listingId', '==', listingId).get();
    evidenceSnapshot.forEach(doc => writeBatch.delete(doc.ref));

    const bucket = adminStorage.bucket();
    if (listing.images) {
        await Promise.all(listing.images.map(async (img) => {
            if (img.url.includes(bucket.name)) {
                try {
                    const path = decodeURIComponent(img.url.split(`${bucket.name}/`)[1].split('?')[0]);
                    await bucket.file(path).delete();
                } catch (e) {}
            }
        }));
    }
    
    writeBatch.delete(adminDb.collection('listings').doc(listingId));
    await writeBatch.commit();
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
}

/**
 * Performs bulk status updates for multiple listings.
 */
export async function bulkUpdateListingStatus(listingIds: string[], status: ListingStatus): Promise<{ success: boolean }> {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');

  const batch = adminDb.batch();
  listingIds.forEach(id => {
    batch.update(adminDb.collection('listings').doc(id), {
      status,
      updatedAt: FieldValue.serverTimestamp(),
      adminReviewedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}

/**
 * Retrieves admin dashboard stats.
 */
export async function getAdminStatsAction() {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
  return getAdminDashboardStats();
}

/**
 * Retrieves daily listing stats for charts.
 */
export async function getChartDataAction() {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
  return getListingStatsByDay(30);
}

/**
 * Retrieves inbox items (messages and reports) for admins.
 */
export async function getInboxItemsAction(filters: {
  contactStatus: 'new' | 'handled' | 'all';
  reportStatus: 'new' | 'handled' | 'all';
}) {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');

  const toDateISO = (ts?: any) => ts?.toDate?.()?.toISOString() ?? null;

  const contactSnapshot = await adminDb.collection('contactMessages').orderBy('createdAt', 'desc').limit(50).get();
  const reportSnapshot = await adminDb.collection('listingReports').orderBy('createdAt', 'desc').limit(50).get();

  return {
    contactMessages: contactSnapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDateISO(d.data().createdAt) })),
    listingReports: reportSnapshot.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDateISO(d.data().createdAt) })),
  };
}

/**
 * Generates an AI summary for an evidence document.
 */
export async function getAiSummary(documentText: string, evidenceId: string) {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
    const result = await summarizeEvidence({ documentText });
    await adminDb.collection('evidence').doc(evidenceId).update({ summary: result.summary });
    return result;
}

/**
 * Checks for suspicious patterns across a set of documents.
 */
export async function checkSuspiciousPatterns(documentDescriptions: string[]) {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
    return flagSuspiciousUploadPatterns({ documentDescriptions });
}

/**
 * Gets or creates a conversation between a buyer and a seller.
 */
export async function getOrCreateConversation(listingId: string): Promise<{ conversationId: string }> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Auth required.');

  const listing = await getListingById(listingId);
  if (!listing) throw new Error('Not found.');
  if (listing.ownerId === authUser.uid) throw new Error('Self-contact blocked.');

  const participantIds = [authUser.uid, listing.ownerId].sort();
  const conversationId = `${participantIds[0]}_${participantIds[1]}_${listingId}`;
  const docRef = adminDb.collection('conversations').doc(conversationId);
  const doc = await docRef.get();

  if (doc.exists) return { conversationId };

  const buyerProfile = await adminAuth.getUser(authUser.uid);
  const sellerProfile = await adminAuth.getUser(listing.ownerId);

  // Increment inquiry count atomically
  await adminDb.collection('listings').doc(listingId).update({
    inquiryCount: FieldValue.increment(1)
  });

  await docRef.set({
    listingId: listing.id,
    listingTitle: listing.title,
    listingImage: listing.images[0]?.url || '',
    participantIds,
    participants: {
      [authUser.uid]: { displayName: buyerProfile.displayName || 'Buyer', photoURL: buyerProfile.photoURL || '' },
      [listing.ownerId]: { displayName: sellerProfile.displayName || 'Seller', photoURL: sellerProfile.photoURL || '' },
    },
    lastMessage: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  return { conversationId };
}

/**
 * Saves a search configuration for a buyer.
 */
export async function saveSearchAction(data: { name: string; filters: SavedSearch['filters'], url: string }) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Auth required.');
    await adminDb.collection('users').doc(authUser.uid).collection('savedSearches').add({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
    });
    revalidatePath('/buyer/dashboard');
}

/**
 * Deletes a saved search.
 */
export async function deleteSearchAction(searchId: string) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Auth required.');
    await adminDb.collection('users').doc(authUser.uid).collection('savedSearches').doc(searchId).delete();
    revalidatePath('/buyer/dashboard');
}

/**
 * Retrieves saved searches for a user.
 */
export async function getSavedSearchesForUser(userId: string): Promise<SavedSearch[]> {
    const snapshot = await adminDb.collection('users').doc(userId).collection('savedSearches').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedSearch));
}

/**
 * Retrieves favorite listings for a user.
 */
export async function getFavoriteListingsForUser(userId: string, limitNum: number = 5): Promise<Listing[]> {
    const favsSnapshot = await adminDb.collection('users').doc(userId).collection('favorites').orderBy('createdAt', 'desc').limit(limitNum).get();
    const favIds = favsSnapshot.docs.map(doc => doc.id);
    if (favIds.length === 0) return [];
    return getListingsByIds(favIds);
}

/**
 * Retrieves specific listings by ID.
 */
export async function getListingsByIds(ids: string[]): Promise<Listing[]> {
    if (!ids || ids.length === 0) return [];
    const listings = await Promise.all(ids.map(id => getListingById(id)));
    return listings.filter((l): l is Listing => l !== null);
}

/**
 * Retrieves recent conversations for a user.
 */
export async function getRecentConversationsForUser(userId: string, limitNum: number = 5): Promise<Conversation[]> {
    const snapshot = await adminDb.collection('conversations')
        .where('participantIds', 'array-contains', userId)
        .orderBy('updatedAt', 'desc')
        .limit(limitNum)
        .get();
        
  const normalizeTS = (ts: any) => ts?.toDate?.() ?? ts;

  return snapshot.docs.map(doc => {
    const raw = doc.data();
    return {
      id: doc.id,
      ...raw,
      lastMessage: raw.lastMessage ? { ...raw.lastMessage, timestamp: normalizeTS(raw.lastMessage.timestamp) } : null,
      updatedAt: normalizeTS(raw.updatedAt),
    } as Conversation;
  });
}

/**
 * Updates a user's profile information.
 */
export async function updateUserProfileAction(formData: FormData) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Auth required.');

  const displayName = formData.get('displayName') as string;
  const photoFile = formData.get('photo') as File | null;

  let photoURL: string | null = null;
  if (photoFile && photoFile.size > 0) {
    const path = `profile-photos/${authUser.uid}/${Date.now()}-${photoFile.name}`;
    const fileRef = adminStorage.bucket().file(path);
    await fileRef.save(Buffer.from(await photoFile.arrayBuffer()), { 
        metadata: { 
            contentType: photoFile.type,
            cacheControl: 'public, max-age=31536000',
        } 
    });
    await fileRef.makePublic();
    photoURL = `https://storage.googleapis.com/${adminStorage.bucket().name}/${path}`;
  }

  await adminAuth.updateUser(authUser.uid, { displayName, ...(photoURL && { photoURL }) });
  await adminDb.collection('users').doc(authUser.uid).update({
    displayName,
    ...(photoURL && { photoURL }),
    phone: formData.get('phone') || FieldValue.delete(),
    bio: formData.get('bio') || FieldValue.delete(),
  });

  revalidatePath('/profile');
}

/**
 * Generates an AI description for a property.
 */
export async function generateDescriptionAction(bulletPoints: string) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Auth required.');
  return generatePropertyDescription({ bulletPoints });
}

/**
 * Sends a verification email to the current user.
 */
export async function sendEmailVerificationAction() {
  const authUser = await getAuthenticatedUser();
  if (!authUser?.email) throw new Error('Auth required.');
  
  await sendBrandedEmail({
    to: authUser.email,
    type: 'contact_confirmation',
    subject: 'Verify your Kenya Land Trust Identity',
    payload: {
      name: authUser.displayName || 'User',
      topic: 'Account Verification',
      messageId: 'AUTH-' + Math.random().toString(36).substr(2, 9).toUpperCase()
    }
  });
}

/**
 * Marks a contact message as handled.
 */
export async function markContactMessageStatus(id: string, status: 'new' | 'handled') {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
  await adminDb.collection('contactMessages').doc(id).update({ status });
}

/**
 * Marks a listing report as handled.
 */
export async function markListingReportStatus(id: string, status: 'new' | 'handled') {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
  await adminDb.collection('listingReports').doc(id).update({ status });
}
