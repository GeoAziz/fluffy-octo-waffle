#!/usr/bin/env ts-node
/**
 * Comprehensive Mock Data Seeding Script
 * 
 * This script populates the database with realistic mock data:
 * - Users (Buyers, Sellers, Admin)
 * - Listings with time-based scenarios
 * - Evidence documents
 * - Conversations between buyers and sellers
 * - Favorites and saved searches
 * - Admin audit logs
 * 
 * Usage:
 *   npm run seed:all
 *   npm run seed:all -- --clear       # Clear existing data first
 *   npm run seed:all -- --listings=50  # Specify number of listings
 */

import { adminAuth, adminDb } from '../firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { 
  MOCK_BUYERS, 
  MOCK_SELLERS, 
  MOCK_ADMIN, 
  getAllMockUsers,
  type UserJourney 
} from './mock-user-journeys';
import { 
  generateSellerListings, 
  LISTING_SCENARIOS 
} from './mock-listings';
import { generateListingEvidence } from './mock-evidence';
import { 
  generateBuyerConversations
} from './mock-conversations';
import {
  generateListingAuditTrail,
  generateAdminDashboardAuditLogs,
  generateBuyerFavorites,
  generateSavedSearches
} from './mock-admin-activity';
import { assertSeedSafety } from '../seed-safety';

// Configuration
const DEFAULT_LISTINGS_PER_SELLER = 4;
const SEED_PASSWORD = 'Password123!';

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

/**
 * Parse command line arguments
 */
const parseArgs = (): { clear: boolean; listingsPerSeller: number } => {
  const args = process.argv.slice(2);
  const config = {
    clear: args.includes('--clear'),
    listingsPerSeller: DEFAULT_LISTINGS_PER_SELLER
  };

  const listingsArg = args.find(arg => arg.startsWith('--listings='));
  if (listingsArg) {
    const count = parseInt(listingsArg.split('=')[1]);
    if (!isNaN(count) && count > 0) {
      config.listingsPerSeller = count;
    }
  }

  return config;
};

/**
 * Clear all existing data
 */
async function clearDatabase() {
  console.log('\n🗑️  Clearing existing data...');
  
  const collections = [
    'listings',
    'evidence',
    'conversations',
    'auditLogs',
    'contactMessages',
    'listingReports'
  ];

  for (const collectionName of collections) {
    const snapshot = await adminDb.collection(collectionName).get();
    if (snapshot.size > 0) {
      console.log(`   Deleting ${snapshot.size} documents from ${collectionName}...`);
      const batch = adminDb.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  // Clear user subcollections
  const usersSnapshot = await adminDb.collection('users').get();
  for (const userDoc of usersSnapshot.docs) {
    // Clear favorites
    const favoritesSnapshot = await adminDb
      .collection('users')
      .doc(userDoc.id)
      .collection('favorites')
      .get();
    if (favoritesSnapshot.size > 0) {
      const batch = adminDb.batch();
      favoritesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }

    // Clear saved searches
    const searchesSnapshot = await adminDb
      .collection('users')
      .doc(userDoc.id)
      .collection('savedSearches')
      .get();
    if (searchesSnapshot.size > 0) {
      const batch = adminDb.batch();
      searchesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  console.log('   ✓ Database cleared\n');
}

/**
 * Create or update users in Firebase Auth and Firestore
 */
async function seedUsers(users: UserJourney[]): Promise<Map<string, string>> {
  console.log(`\n👥 Creating ${users.length} users...`);
  
  const userIdMap = new Map<string, string>(); // mockId -> firebaseUid

  for (const userJourney of users) {
    const { profile } = userJourney;
    
    try {
      const firebaseUser = await adminAuth.getUserByEmail(profile.email).catch(() => null);
      let uid: string;

      if (firebaseUser) {
        uid = firebaseUser.uid;
        console.log(`   ✓ User exists: ${profile.email} (${profile.role})`);
        await adminAuth.updateUser(uid, {
          displayName: profile.displayName || undefined,
          password: SEED_PASSWORD,
          emailVerified: true
        });
      } else {
        const newUser = await adminAuth.createUser({
          email: profile.email,
          password: SEED_PASSWORD,
          displayName: profile.displayName || undefined,
          emailVerified: true
        });
        uid = newUser.uid;
        console.log(`   ✓ Created user: ${profile.email} (${profile.role})`);
      }

      // Store in Firestore
      await adminDb.collection('users').doc(uid).set({
        uid: uid,
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        phone: profile.phone,
        bio: profile.bio,
        role: profile.role,
        verified: profile.verified,
        createdAt: FieldValue.serverTimestamp()
      }, { merge: true });

      userIdMap.set(profile.uid, uid);
    } catch (error: unknown) {
      console.error(`   ✗ Failed to create user ${profile.email}:`, getErrorMessage(error));
    }
  }

  console.log(`   ✓ Created/updated ${userIdMap.size} users`);
  return userIdMap;
}

/**
 * Seed listings with evidence
 */
async function seedListings(
  sellers: UserJourney[],
  userIdMap: Map<string, string>,
  listingsPerSeller: number
): Promise<string[]> {
  console.log(`\n🏘️  Creating listings (${listingsPerSeller} per seller)...`);
  
  const listingIds: string[] = [];
  let totalListings = 0;
  let totalEvidence = 0;

  for (const seller of sellers) {
    const firebaseUid = userIdMap.get(seller.profile.uid);
    if (!firebaseUid) continue;

    const listings = generateSellerListings(
      firebaseUid,
      seller.profile.displayName || 'Unknown Seller',
      seller.profile.photoURL || '',
      listingsPerSeller
    );

    for (const listing of listings) {
      const listingRef = adminDb.collection('listings').doc();
      const listingId = listingRef.id;

      // Generate evidence
      const scenario = LISTING_SCENARIOS.find(s => 
        s.status === listing.status && s.badge === listing.badge
      ) || LISTING_SCENARIOS[0];
      
      const evidence = generateListingEvidence(listingId, firebaseUid, scenario);
      
      // Convert dates to Firestore timestamps
      const firestoreListing = {
        ...listing,
        id: listingId,
        ownerId: firebaseUid,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        adminReviewedAt: listing.adminReviewedAt ? FieldValue.serverTimestamp() : null
      };

      // Remove undefined fields from firestoreListing before saving
      const cleanListing = Object.entries(firestoreListing).reduce<Record<string, unknown>>((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {});

      await listingRef.set(cleanListing);
      listingIds.push(listingId);
      totalListings++;

      // Store evidence in separate collection
      if (evidence.length > 0) {
        const evidenceBatch = adminDb.batch();
        for (const evidenceDoc of evidence) {
          const evidenceRef = adminDb.collection('evidence').doc(evidenceDoc.id);
          evidenceBatch.set(evidenceRef, {
            ...evidenceDoc,
            uploadedAt: FieldValue.serverTimestamp()
          });
          totalEvidence++;
        }
        await evidenceBatch.commit();
      }
    }

    console.log(`   ✓ ${seller.profile.displayName}: ${listings.length} listings, ${listings.reduce((sum, l) => sum + (l.evidence?.length || 0), 0)} evidence docs`);
  }

  console.log(`   ✓ Total: ${totalListings} listings, ${totalEvidence} evidence documents`);
  return listingIds;
}

/**
 * Seed conversations between buyers and sellers
 */
async function seedConversations(
  buyers: UserJourney[],
  sellers: UserJourney[],
  userIdMap: Map<string, string>
): Promise<void> {
  console.log('\n💬 Creating conversations...');
  
  let totalConversations = 0;
  let totalMessages = 0;

  // Get all listings grouped by seller
  const listingsSnapshot = await adminDb.collection('listings')
    .where('status', '==', 'approved')
    .limit(100)
    .get();

  type ListingSnapshotShape = {
    id: string;
    title?: string;
    ownerId?: string;
    images?: Array<{ url?: string }>;
  };
  const listingsBySeller = new Map<string, ListingSnapshotShape[]>();
  listingsSnapshot.docs.forEach(doc => {
    const listing = doc.data() as { ownerId?: string; title?: string; images?: Array<{ url?: string }> };
    if (!listing.ownerId) {
      return;
    }
    if (!listingsBySeller.has(listing.ownerId)) {
      listingsBySeller.set(listing.ownerId, []);
    }
    listingsBySeller.get(listing.ownerId)?.push({
      id: doc.id,
      ...listing
    });
  });

  // Generate conversations for each buyer
  for (const buyer of buyers.slice(0, 8)) { // Limit to first 8 buyers
    const firebaseBuyerId = userIdMap.get(buyer.profile.uid);
    if (!firebaseBuyerId) continue;

    const sellerData = sellers.slice(0, 5).map(s => ({
      id: userIdMap.get(s.profile.uid) || '',
      name: s.profile.displayName || '',
      photo: s.profile.photoURL || ''
    })).filter(s => s.id);

    const allListings: Array<{ id: string; title: string; image: string; ownerId: string }> = [];
    sellerData.forEach(seller => {
      const sellerListings = listingsBySeller.get(seller.id) || [];
      allListings.push(...sellerListings.map(l => ({
        id: l.id,
        title: l.title || 'Untitled Listing',
        image: l.images?.[0]?.url || '',
        ownerId: seller.id
      })));
    });

    if (allListings.length === 0) continue;

    const conversations = generateBuyerConversations(
      firebaseBuyerId,
      buyer.profile.displayName || '',
      buyer.profile.photoURL || '',
      sellerData,
      allListings,
      Math.min(3, allListings.length)
    );

    for (const { conversation, messages } of conversations) {
      const convRef = adminDb.collection('conversations').doc(conversation.id);
      await convRef.set({
        ...conversation,
        updatedAt: FieldValue.serverTimestamp()
      });

      // Store messages in subcollection
      const messagesBatch = adminDb.batch();
      for (const message of messages) {
        const msgRef = convRef.collection('messages').doc(message.id);
        messagesBatch.set(msgRef, {
          ...message,
          timestamp: FieldValue.serverTimestamp()
        });
      }
      await messagesBatch.commit();

      totalConversations++;
      totalMessages += messages.length;
    }
  }

  console.log(`   ✓ Created ${totalConversations} conversations with ${totalMessages} messages`);
}

/**
 * Seed buyer favorites and saved searches
 */
async function seedBuyerData(
  buyers: UserJourney[],
  userIdMap: Map<string, string>,
  listingIds: string[]
): Promise<void> {
  console.log('\n⭐ Creating favorites and saved searches...');
  
  let totalFavorites = 0;
  let totalSearches = 0;

  for (const buyer of buyers) {
    const firebaseUid = userIdMap.get(buyer.profile.uid);
    if (!firebaseUid) continue;

    // Generate favorites
    const favoriteCount = Math.floor(Math.random() * 8) + 2; // 2-10 favorites
    const favorites = generateBuyerFavorites(listingIds, favoriteCount);

    const favoritesBatch = adminDb.batch();
    for (const listingId of favorites) {
      const favoriteRef = adminDb
        .collection('users')
        .doc(firebaseUid)
        .collection('favorites')
        .doc(listingId);
      favoritesBatch.set(favoriteRef, {
        listingId: listingId,
        createdAt: FieldValue.serverTimestamp()
      });
      totalFavorites++;
    }
    await favoritesBatch.commit();

    // Generate saved searches
    const searches = generateSavedSearches(
      firebaseUid,
      buyer.behavior.preferredCounties || [],
      buyer.behavior.budgetRange
    );

    const searchesBatch = adminDb.batch();
    for (const search of searches) {
      const searchRef = adminDb
        .collection('users')
        .doc(firebaseUid)
        .collection('savedSearches')
        .doc(search.id);
      searchesBatch.set(searchRef, {
        ...search,
        createdAt: FieldValue.serverTimestamp()
      });
      totalSearches++;
    }
    await searchesBatch.commit();
  }

  console.log(`   ✓ Created ${totalFavorites} favorites and ${totalSearches} saved searches`);
}

/**
 * Seed admin audit logs
 */
async function seedAdminActivity(
  adminUid: string,
  listingIds: string[]
): Promise<void> {
  console.log('\n📋 Creating admin audit logs...');
  
  // Generate audit trails for each listing
  let totalLogs = 0;
  const listingsSnapshot = await adminDb.collection('listings').get();

  const batch = adminDb.batch();
  for (const listingDoc of listingsSnapshot.docs) {
    const listing = listingDoc.data();
    const logs = generateListingAuditTrail(
      adminUid,
      listingDoc.id,
      30, // created 30 days ago (approximate)
      listing.status as 'approved' | 'rejected' | 'pending'
    );

    for (const log of logs) {
      const logRef = adminDb.collection('auditLogs').doc(log.id || adminDb.collection('auditLogs').doc().id);
      batch.set(logRef, {
        ...log,
        timestamp: FieldValue.serverTimestamp()
      });
      totalLogs++;
    }
  }

  // Add additional dashboard logs
  const dashboardLogs = generateAdminDashboardAuditLogs(adminUid, listingIds, 50);
  for (const log of dashboardLogs) {
    const logRef = adminDb.collection('auditLogs').doc(log.id || adminDb.collection('auditLogs').doc().id);
    batch.set(logRef, {
      ...log,
      timestamp: FieldValue.serverTimestamp()
    });
    totalLogs++;
  }

  await batch.commit();
  console.log(`   ✓ Created ${totalLogs} audit log entries`);
}

/**
 * Main seeding function
 */
async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Kenya Land Trust - Mock Data Seeding Script  ║');
  console.log('╚════════════════════════════════════════════════╝');

  const config = parseArgs();
  assertSeedSafety({ operationName: 'seed:all', allowClear: config.clear });

  console.log('\n📋 Configuration:');
  console.log(`   Clear existing data: ${config.clear ? 'YES' : 'NO'}`);
  console.log(`   Listings per seller: ${config.listingsPerSeller}`);
  console.log(`   Total sellers: ${MOCK_SELLERS.length}`);
  console.log(`   Total buyers: ${MOCK_BUYERS.length}`);
  console.log(`   Expected listings: ~${config.listingsPerSeller * MOCK_SELLERS.length}`);

  const startTime = Date.now();

  try {
    // Step 1: Clear database if requested
    if (config.clear) {
      await clearDatabase();
    }

    // Step 2: Create users
    const allUsers = getAllMockUsers();
    const userIdMap = await seedUsers(allUsers);

    // Step 3: Create listings with evidence
    const listingIds = await seedListings(MOCK_SELLERS, userIdMap, config.listingsPerSeller);

    // Step 4: Create conversations
    await seedConversations(MOCK_BUYERS, MOCK_SELLERS, userIdMap);

    // Step 5: Create favorites and saved searches
    await seedBuyerData(MOCK_BUYERS, userIdMap, listingIds);

    // Step 6: Create admin audit logs
    const adminUid = userIdMap.get(MOCK_ADMIN.profile.uid);
    if (adminUid) {
      await seedAdminActivity(adminUid, listingIds);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║              ✅ Seeding Complete!              ║');
    console.log('╚════════════════════════════════════════════════╝');
    console.log(`\n⏱️  Total time: ${duration}s`);
    console.log('\n📊 Summary:');
    console.log(`   Users: ${userIdMap.size}`);
    console.log(`   Listings: ${listingIds.length}`);
    console.log(`   Admin: admin@kenyalandtrust.co.ke`);
    console.log(`   Password (all users): ${SEED_PASSWORD}`);
    console.log('\n🚀 You can now start the app with: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
