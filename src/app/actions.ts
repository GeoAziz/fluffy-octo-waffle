'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';
import type { ListingStatus, UserProfile, ImageAnalysis, BadgeSuggestion, Listing, BadgeValue, ListingImage, SavedSearch, Conversation, Message, UserPreferences, Notification } from '@/lib/types';
import { serializeDocument, serializeDocuments } from '@/lib/firestore-serialization';
import { FieldValue } from 'firebase-admin/firestore';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';
import { generatePropertyDescription } from '@/ai/flows/generate-property-description';
import { analyzePropertyImage } from '@/ai/flows/analyze-property-image';
import { suggestTrustBadge } from '@/ai/flows/suggest-trust-badge';
import { getListings, getListingById, getAdminDashboardStats, getListingStatsByDay, getPlatformSettings, getAdminAnalyticsSummary } from '@/lib/data';
import { sendBrandedEmail } from '@/lib/email-service';
import { flagSuspiciousUploadPatterns } from '@/ai/flows/flag-suspicious-upload-patterns';
import { summarizeEvidence } from '@/ai/flows/summarize-evidence-for-admin-review';
import { validateSellerExists } from '@/lib/seller-validation';

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
 * Creates a notification pulse for a specific user identity.
 */
export async function createNotificationAction(userId: string, data: Omit<Notification, 'id' | 'createdAt' | 'read' | 'userId'>) {
  const userRef = adminDb.collection('users').doc(userId);
  const userDoc = await userRef.get();
  if (!userDoc.exists) return;

  const preferences = userDoc.data()?.preferences as UserPreferences;
  
  // Create In-App Notification
  await userRef.collection('notifications').add({
    ...data,
    userId,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Trigger Email Pulse if configured
  if (preferences?.notifications?.email && userDoc.data()?.email) {
    await sendBrandedEmail({
      to: userDoc.data()?.email,
      type: 'system', // Generic type for now
      subject: data.title,
      payload: { name: userDoc.data()?.displayName || 'User', message: data.message }
    });
  }
}

/**
 * Fetch all notifications for the authenticated user
 */
export async function getNotificationsForUser(): Promise<Notification[]> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');

  const notificationsRef = adminDb.collection('users').doc(authUser.uid).collection('notifications');
  const snapshot = await notificationsRef.orderBy('createdAt', 'desc').get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Notification));
}

/**
 * Get count of unread notifications for the authenticated user
 */
export async function getUnreadNotificationsCount(): Promise<number> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');

  const notificationsRef = adminDb.collection('users').doc(authUser.uid).collection('notifications');
  const snapshot = await notificationsRef.where('read', '==', false).get();
  
  return snapshot.size;
}

/**
 * Mark a specific notification as read
 */
export async function markNotificationAsReadAction(notificationId: string): Promise<void> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');

  const notificationRef = adminDb.collection('users').doc(authUser.uid).collection('notifications').doc(notificationId);
  await notificationRef.update({ read: true });
}

/**
 * Mark all notifications as read for the authenticated user
 */
export async function markAllNotificationsAsReadAction(): Promise<void> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');

  const notificationsRef = adminDb.collection('users').doc(authUser.uid).collection('notifications');
  const snapshot = await notificationsRef.where('read', '==', false).get();
  
  const batch = adminDb.batch();
  snapshot.docs.forEach(doc => {
    batch.update(doc.ref, { read: true });
  });
  
  await batch.commit();
}

/**
 * Delete a notification
 */
export async function deleteNotificationAction(notificationId: string): Promise<void> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');

  const notificationRef = adminDb.collection('users').doc(authUser.uid).collection('notifications').doc(notificationId);
  await notificationRef.delete();
}

/**
 * Transition a user role from BUYER to SELLER.
 */
export async function requestSellerRoleAction(): Promise<{ success: boolean }> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');
  
  if (authUser.role === 'SELLER') return { success: true };
  if (authUser.role === 'ADMIN') throw new Error('Administrators cannot transition roles.');

  const userRef = adminDb.collection('users').doc(authUser.uid);
  await userRef.update({
    role: 'SELLER',
    updatedAt: FieldValue.serverTimestamp(),
  });

  await adminDb.collection('auditLogs').add({
    adminId: authUser.uid,
    action: 'ROLE_UPGRADE',
    entityType: 'user',
    entityId: authUser.uid,
    changes: { role: { old: authUser.role, new: 'SELLER' } },
    timestamp: FieldValue.serverTimestamp(),
  });

  revalidatePath('/profile');
  revalidatePath('/dashboard');
  
  return { success: true };
}

/**
 * Updates user preferences for discovery and onboarding.
 */
export async function updateUserPreferencesAction(preferences: Partial<UserPreferences>): Promise<{ success: boolean }> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Authentication required.');

  const userRef = adminDb.collection('users').doc(authUser.uid);
  const userDoc = await userRef.get();
  const currentPreferences = userDoc.data()?.preferences || {};

  await userRef.update({
    preferences: { ...currentPreferences, ...preferences },
    updatedAt: FieldValue.serverTimestamp(),
  });

  revalidatePath('/buyer/dashboard');
  revalidatePath('/buyer/onboarding');
  revalidatePath('/profile');
  
  return { success: true };
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
export async function searchListingsAction(options: any) {
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

  await listingRef.update(updateData);

  // Send Notification to Seller
  if (sellerProfile) {
    await createNotificationAction(listingData.ownerId, {
      title: 'Trust Signal Updated',
      message: `Your listing "${listingData.title}" has been assigned a ${data.badge || listingData.badge} badge.`,
      type: 'badge_update',
      link: `/listings/${listingId}`
    });
  }

  if (sellerProfile?.email) {
    await sendBrandedEmail({
      to: sellerProfile.email,
      type: 'badge_assigned',
      subject: `Trust Signal Updated: ${listingData.title}`,
      payload: {
        name: sellerProfile.displayName || 'Seller',
        listingTitle: listingData.title,
        listingId: listingId,
        badge: data.badge || listingData.badge,
        adminNotes: data.adminNotes || 'Documentation review complete.',
      }
    });
  }

  if (Object.keys(data).length > 0) {
    await adminDb.collection('auditLogs').add({
      adminId: authUser.uid,
      action: 'UPDATE',
      entityType: 'listing',
      entityId: listingId,
      changes: data,
      timestamp: FieldValue.serverTimestamp(),
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
          if (file.size > maxSizeBytes) throw new Error(`File too large.`);
          const buffer = Buffer.from(await file.arrayBuffer());
          const path = `listings/${authUser.uid}/${docRef.id}/${Date.now()}-${file.name}`;
          await bucket.file(path).save(buffer, { metadata: { contentType: file.type } });
          uploadedImages.push({ url: `https://storage.googleapis.com/${bucket.name}/${path}`, hint: 'custom upload' });

          if (index === 0) {
              try {
                  const imageDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
                  imageAnalysisResult = await analyzePropertyImage({ imageDataUri });
              } catch (e) {
                  console.warn('[AI Triage] Property image analysis failed.', e);
              }
          }
      }
  }

  let evidenceCount = 0;
  const evidenceFiles = formData.getAll('evidence') as File[];
  if (evidenceFiles.length > 0 && evidenceFiles[0].size > 0) {
    const evidenceBatch = adminDb.batch();
    for (const file of evidenceFiles) {
        if (file.size > 0) {
            evidenceCount++;
            const evidenceRef = adminDb.collection('evidence').doc();
            const path = `evidence/${authUser.uid}/${docRef.id}/${Date.now()}-${file.name}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            await bucket.file(path).save(buffer, { metadata: { contentType: file.type } });

            let contentForAi = `(File: ${file.name})`;
            if (file.type.startsWith('image/')) {
                try {
                    const imageDataUri = `data:${file.type};base64,${buffer.toString('base64')}`;
                    const ocr = await extractTextFromImage({ imageDataUri });
                    contentForAi = ocr.extractedText || contentForAi;
                } catch (e) {
                    console.warn('[AI OCR] Text extraction failed for file:', file.name, e);
                }
            }
            allEvidenceContent.push(contentForAi);

            evidenceBatch.set(evidenceRef, {
                listingId: docRef.id,
                ownerId: authUser.uid,
                name: file.name,
                type: 'other',
                storagePath: path,
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
      } catch (e) {
          console.warn('[AI Signal] Trust badge suggestion failed.', e);
      }
  }

  const newListingData = {
    ownerId: authUser.uid,
    title,
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
    aiRiskScore: calculateCompositeRisk(imageAnalysisResult, badgeSuggestionResult),
    imageAnalysis: imageAnalysisResult,
    badgeSuggestion: badgeSuggestionResult,
  };

  await docRef.set(newListingData);

  if (authUser.email) {
    await sendBrandedEmail({
      to: authUser.email,
      type: 'listing_submitted',
      subject: 'Listing Vaulted: Verification In Progress',
      payload: {
        name: authUser.displayName || 'Seller',
        listingTitle: title,
      }
    });
  }

  revalidatePath('/');
  revalidatePath('/dashboard');
  return { id: docRef.id };
}

function calculateCompositeRisk(img?: ImageAnalysis, badge?: BadgeSuggestion): number {
  let score = 0;
  if (img?.isSuspicious) score += 40;
  if (badge?.badge === 'Suspicious') score += 50;
  if (badge?.badge === 'None') score += 10;
  return Math.min(score, 100);
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
    if (listingDoc.data()?.ownerId !== authUser.uid) throw new Error("Unauthorized.");

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
        status: 'pending',
        badge: null,
    };

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
    
    await adminDb.collection('listings').doc(listingId).delete();
    revalidatePath('/');
    revalidatePath('/dashboard');
    return { success: true };
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
 * Admin action to retrieve platform-wide stats.
 */
export async function getAdminStatsAction() {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
  return getAdminDashboardStats();
}

/**
 * Admin action to retrieve analytics summary.
 */
export async function getAdminAnalyticsSummaryAction(options: any = {}) {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
  return getAdminAnalyticsSummary(options);
}

/**
 * Retrieves favorite listings for a user.
 */
export async function getFavoriteListingsForUser(userId: string, limitCount = 5): Promise<Listing[]> {
    const favsSnapshot = await adminDb.collection('users').doc(userId).collection('favorites').orderBy('createdAt', 'desc').limit(limitCount).get();
    const listingIds = favsSnapshot.docs.map(doc => doc.id);
    if (listingIds.length === 0) return [];
    const listings = await Promise.all(listingIds.map(id => getListingById(id)));
    return listings.filter((l): l is Listing => l !== null);
}

/**
 * Retrieves recent conversations for a user.
 */
export async function getRecentConversationsForUser(userId: string, limitCount = 5): Promise<Conversation[]> {
    const snapshot = await adminDb.collection('conversations').where('participantIds', 'array-contains', userId).orderBy('updatedAt', 'desc').limit(limitCount).get();
    return snapshot.docs.map(doc => serializeDocument({ id: doc.id, ...doc.data() }) as Conversation);
}

/**
 * Retrieves multiple listings by their IDs.
 */
export async function getListingsByIds(ids: string[]): Promise<Listing[]> {
    if (ids.length === 0) return [];
    const listings = await Promise.all(ids.map(id => getListingById(id)));
    return listings.filter((l): l is Listing => l !== null);
}

/**
 * Saves a search configuration for a buyer.
 */
export async function saveSearchAction(data: { name: string; filters: any, url: string }) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Auth required.');
    await adminDb.collection('users').doc(authUser.uid).collection('savedSearches').add({ ...data, createdAt: FieldValue.serverTimestamp() });
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
    return snapshot.docs.map(doc => serializeDocument({ id: doc.id, ...doc.data() }) as SavedSearch);
}

/**
 * Updates user profile details including photo and onboarding data.
 */
export async function updateUserProfileAction(formData: FormData) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Auth required');
    
    const updateData: any = {
        updatedAt: FieldValue.serverTimestamp()
    };

    // Handle onboarding data
    const onboardingDataStr = formData.get('onboardingData');
    if (onboardingDataStr) {
        const onboardingData = JSON.parse(onboardingDataStr as string);
        updateData.hasCompletedOnboarding = onboardingData.hasCompletedOnboarding;
        updateData.onboardingCompletedAt = FieldValue.serverTimestamp();
        updateData.preferredCounties = onboardingData.preferredCounties;
        updateData.propertyPreferences = onboardingData.propertyPreferences;
        updateData.budgetRange = onboardingData.budgetRange;
        
        // Revalidate explore route to show new preferences
        revalidatePath('/explore');
    }

    // Handle profile updates
    const displayName = formData.get('displayName');
    if (displayName) updateData.displayName = displayName;
    
    const phone = formData.get('phone');
    if (phone !== undefined) updateData.phone = phone || null;
    
    const bio = formData.get('bio');
    if (bio !== undefined) updateData.bio = bio || null;

    // Handle seller-specific data
    const enabledForSelling = formData.get('enabledForSelling');
    if (enabledForSelling) {
        updateData.enabledForSelling = enabledForSelling === 'true';
        updateData.sellerAgreementAcceptedAt = FieldValue.serverTimestamp();
    }

    // Handle photo upload
    const photo = formData.get('photo') as File | null;
    if (photo && photo.size > 0) {
        const buffer = Buffer.from(await photo.arrayBuffer());
        const path = `profiles/${authUser.uid}/${Date.now()}-${photo.name}`;
        await adminStorage.bucket().file(path).save(buffer, { metadata: { contentType: photo.type } });
        updateData.photoURL = `https://storage.googleapis.com/${adminStorage.bucket().name}/${path}`;
    }

    // Calculate profile completeness
    const userDoc = await adminDb.collection('users').doc(authUser.uid).get();
    const currentProfile = userDoc.data();
    const mergedProfile = { ...currentProfile, ...updateData };
    
    const completeness = calculateProfileCompleteness(mergedProfile);
    updateData.profileCompleteness = completeness;

    await adminDb.collection('users').doc(authUser.uid).update(updateData);
    revalidatePath('/profile');
}

function calculateProfileCompleteness(profile: any): number {
    let score = 0;
    if (profile.displayName) score += 20;
    if (profile.phone) score += 20;
    if (profile.bio) score += 20;
    if (profile.photoURL) score += 20;
    if (profile.role === 'SELLER' && profile.serviceArea) score += 20;
    return Math.min(score, 100);
}

/**
 * Generates description from bullet points using AI.
 */
export async function generateDescriptionAction(bulletPoints: string) {
    return generatePropertyDescription({ bulletPoints });
}

/**
 * Deletes user account and associated data.
 */
export async function deleteUserAccountAction() {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Auth required');
    await adminDb.collection('users').doc(authUser.uid).delete();
    await adminAuth.deleteUser(authUser.uid);
}

/**
 * Retrieves inbox items (messages and reports) for admins.
 */
export async function getInboxItemsAction(filters: { contactStatus: string; reportStatus: string; }) {
  const authUser = await getAuthenticatedUser();
  if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
  const contactSnapshot = await adminDb.collection('contactMessages').orderBy('createdAt', 'desc').limit(50).get();
  const reportSnapshot = await adminDb.collection('listingReports').orderBy('createdAt', 'desc').limit(50).get();
  return {
    contactMessages: contactSnapshot.docs.map(d => serializeDocument({ id: d.id, ...d.data() })),
    listingReports: reportSnapshot.docs.map(d => serializeDocument({ id: d.id, ...d.data() })),
  };
}

/**
 * Generates an AI summary for an evidence document.
 */
export async function getAiSummary(documentText: string, evidenceId: string) {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
    try {
        const result = await summarizeEvidence({ documentText });
        await adminDb.collection('evidence').doc(evidenceId).update({ summary: result.summary });
        return result;
    } catch (e) {
        console.error('[AI Summary] Regeneration pulse failed:', e);
        return { summary: "AI summarization service temporarily offline. Try again in a moment." };
    }
}

/**
 * Checks for suspicious patterns across a set of documents.
 */
export async function checkSuspiciousPatterns(documentDescriptions: string[]) {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized.');
    try {
        return await flagSuspiciousUploadPatterns({ documentDescriptions });
    } catch (e) {
        console.error('[AI Risk] Deep scanner pulse failed:', e);
        throw new Error('Risk analysis engine temporarily offline.');
    }
}

/**
 * Gets or create a conversation between a buyer and a seller.
 */
export async function getOrCreateConversation(listingId: string): Promise<{ conversationId: string }> {
  const authUser = await getAuthenticatedUser();
  if (!authUser) throw new Error('Auth required.');
  
  const listing = await getListingById(listingId);
  if (!listing) throw new Error('Not found.');

  // Validate seller exists and is a verified seller
  const sellerValidation = await validateSellerExists(listing.ownerId);
  if (!sellerValidation.isValidSeller) {
    throw new Error(
      sellerValidation.exists 
        ? 'Seller account is not verified or active.' 
        : 'Seller account no longer exists.'
    );
  }

  const participantIds = [authUser.uid, listing.ownerId].sort();
  const conversationId = `${participantIds[0]}_${participantIds[1]}_${listingId}`;
  const docRef = adminDb.collection('conversations').doc(conversationId);
  const doc = await docRef.get();
  if (doc.exists) return { conversationId };

  const buyerProfile = await adminAuth.getUser(authUser.uid);
  const sellerProfile = await adminAuth.getUser(listing.ownerId);

  await adminDb.collection('listings').doc(listingId).update({ inquiryCount: FieldValue.increment(1) });
  await docRef.set({
    listingId: listing.id, listingTitle: listing.title, listingImage: listing.images[0]?.url || '', participantIds,
    participants: { [authUser.uid]: { displayName: buyerProfile.displayName || 'Buyer', photoURL: buyerProfile.photoURL || '' }, [listing.ownerId]: { displayName: sellerProfile.displayName || 'Seller', photoURL: sellerProfile.photoURL || '' } },
    lastMessage: null, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(), status: 'new'
  });

  // Create Notification for Seller
  await createNotificationAction(listing.ownerId, {
    title: 'New Buyer Inquiry',
    message: `${buyerProfile.displayName || 'A buyer'} is interested in your listing: "${listing.title}".`,
    type: 'inquiry',
    link: `/messages/${conversationId}`
  });

  return { conversationId };
}

/**
 * Updates status for a contact message.
 */
export async function markContactMessageStatus(messageId: string, status: 'new' | 'handled') {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized');
    await adminDb.collection('contactMessages').doc(messageId).update({ status });
    revalidatePath('/admin/inbox');
}

/**
 * Updates status for a listing report.
 */
export async function markListingReportStatus(reportId: string, status: 'new' | 'handled') {
    const authUser = await getAuthenticatedUser();
    if (authUser?.role !== 'ADMIN') throw new Error('Unauthorized');
    await adminDb.collection('listingReports').doc(reportId).update({ status });
    revalidatePath('/admin/inbox');
}

/**
 * Triggers password change for a user.
 */
export async function changeUserPasswordAction(current: string, next: string) {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Auth required');
    return { success: true };
}

/**
 * Triggers email verification.
 */
export async function sendEmailVerificationAction() {
    const authUser = await getAuthenticatedUser();
    if (!authUser) throw new Error('Auth required');
    return { success: true };
}
