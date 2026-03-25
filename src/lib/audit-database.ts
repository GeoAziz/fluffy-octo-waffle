#!/usr/bin/env node

/**
 * Database Audit Script
 * Identifies orphaned data, invalid references, and inconsistencies
 * Usage: npm run audit:db
 */
import { adminDb } from './firebase-admin';
import { MOCK_SELLERS } from './mock/mock-user-journeys';

export type AuditReport = {
  timestamp: string;
  summary: {
    totalListings: number;
    totalConversations: number;
    totalUsers: number;
    orphanedListings: number;
    orphanedConversations: number;
    unexpectedSellers: number;
  };
  orphanedListings: Array<{
    id: string;
    title: string;
    ownerId: string;
    sellerName?: string;
    ownerExists: boolean;
  }>;
  orphanedConversations: Array<{
    id: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    buyerExists: boolean;
    sellerExists: boolean;
  }>;
  unexpectedSellers: Array<{
    uid: string;
    email: string;
    displayName: string;
    verifiedInMock: boolean;
  }>;
  sellerListingCounts: Record<string, number>;
  hakikaPropertiesData?: {
    id: string;
    title: string;
    ownerId: string;
    status: string;
    createdAt: string;
  };
};

const EXPECTED_SELLER_IDS = new Set(MOCK_SELLERS.map(s => s.profile.uid));

export async function auditDatabase(): Promise<AuditReport> {
  console.log('\n🔍 Starting Database Audit...\n');

  const report: AuditReport = {
    timestamp: new Date().toISOString(),
    summary: {
      totalListings: 0,
      totalConversations: 0,
      totalUsers: 0,
      orphanedListings: 0,
      orphanedConversations: 0,
      unexpectedSellers: 0,
    },
    orphanedListings: [],
    orphanedConversations: [],
    unexpectedSellers: [],
    sellerListingCounts: {},
  };

  try {
    // 1. Get all users and check for valid sellers
    console.log('📋 Auditing Users...');
    const usersSnapshot = await adminDb.collection('users').get();
    report.summary.totalUsers = usersSnapshot.size;

    const userMap = new Map<string, { role?: string; email?: string; displayName?: string }>();
    const sellersInDb = new Set<string>();

    usersSnapshot.forEach(doc => {
      const user = doc.data();
      userMap.set(doc.id, user);
      if (user.role === 'SELLER') {
        sellersInDb.add(doc.id);
      }
    });

    // Check for unexpected sellers not in mock data
    const unexpectedSellerIds = new Set<string>();
    sellersInDb.forEach(sellerId => {
      if (!EXPECTED_SELLER_IDS.has(sellerId)) {
        unexpectedSellerIds.add(sellerId);
        const seller = userMap.get(sellerId);
        report.unexpectedSellers.push({
          uid: sellerId,
          email: seller?.email || 'N/A',
          displayName: seller?.displayName || 'N/A',
          verifiedInMock: false,
        });
      }
    });
    report.summary.unexpectedSellers = unexpectedSellerIds.size;

    if (unexpectedSellerIds.size > 0) {
      console.log(`⚠️  Found ${unexpectedSellerIds.size} unexpected sellers in database`);
      report.unexpectedSellers.forEach(seller => {
        console.log(`   - ${seller.displayName} (${seller.email})`);
      });
    }

    // 2. Audit all listings
    console.log('\n📸 Auditing Listings...');
    const listingsSnapshot = await adminDb.collection('listings').get();
    report.summary.totalListings = listingsSnapshot.size;

    const listingsByOwner = new Map<string, number>();

    listingsSnapshot.forEach(doc => {
      const listing = doc.data();
      const ownerId = listing.ownerId;

      // Count listings by owner
      listingsByOwner.set(ownerId, (listingsByOwner.get(ownerId) || 0) + 1);

      // Check if owner exists
      const ownerExists = userMap.has(ownerId);

      if (!ownerExists) {
        report.orphanedListings.push({
          id: doc.id,
          title: listing.title,
          ownerId: ownerId,
          sellerName: listing.seller?.name,
          ownerExists: false,
        });
        report.summary.orphanedListings++;
      }

      // Check for Hakika Properties
      if (listing.title.toLowerCase().includes('hakika') || 
          listing.seller?.name?.toLowerCase().includes('hakika')) {
        report.hakikaPropertiesData = {
          id: doc.id,
          title: listing.title,
          ownerId: ownerId,
          status: listing.status,
          createdAt: listing.createdAt?.toDate?.().toISOString() || 'N/A',
        };
      }
    });

    // Convert counts to record
    listingsByOwner.forEach((count, sellerId) => {
      report.sellerListingCounts[sellerId] = count;
    });

    if (report.summary.orphanedListings > 0) {
      console.log(`❌ Found ${report.summary.orphanedListings} orphaned listing(s)`);
      report.orphanedListings.forEach(listing => {
        console.log(`   - "${listing.title}" (owner: ${listing.ownerId})`);
      });
    }

    // 3. Audit all conversations
    console.log('\n💬 Auditing Conversations...');
    const conversationsSnapshot = await adminDb.collection('conversations').get();
    report.summary.totalConversations = conversationsSnapshot.size;

    conversationsSnapshot.forEach(doc => {
      const conversation = doc.data();
      const buyerId = conversation.buyerId;
      const sellerId = conversation.sellerId;

      const buyerExists = userMap.has(buyerId);
      const sellerExists = userMap.has(sellerId);

      if (!buyerExists || !sellerExists) {
        report.orphanedConversations.push({
          id: doc.id,
          buyerId,
          sellerId,
          listingId: conversation.listingId,
          buyerExists,
          sellerExists,
        });
        report.summary.orphanedConversations++;
      }
    });

    if (report.summary.orphanedConversations > 0) {
      console.log(`❌ Found ${report.summary.orphanedConversations} orphaned conversation(s)`);
      report.orphanedConversations.forEach(conv => {
        const issues = [];
        if (!conv.buyerExists) issues.push(`buyer missing`);
        if (!conv.sellerExists) issues.push(`seller missing`);
        console.log(`   - Conversation ${conv.id}: ${issues.join(', ')}`);
      });
    }

    // 4. Summary
    console.log('\n📊 Audit Summary:');
    console.log(`   Total Users: ${report.summary.totalUsers}`);
    console.log(`   Total Listings: ${report.summary.totalListings}`);
    console.log(`   Total Conversations: ${report.summary.totalConversations}`);
    console.log(`   Orphaned Listings: ${report.summary.orphanedListings}`);
    console.log(`   Orphaned Conversations: ${report.summary.orphanedConversations}`);
    console.log(`   Unexpected Sellers: ${report.summary.unexpectedSellers}`);

    if (report.hakikaPropertiesData) {
      console.log(`\n🎯 Found "Hakika Properties":`);
      console.log(`   ID: ${report.hakikaPropertiesData.id}`);
      console.log(`   Owner ID: ${report.hakikaPropertiesData.ownerId}`);
      console.log(`   Status: ${report.hakikaPropertiesData.status}`);
      console.log(`   Created: ${report.hakikaPropertiesData.createdAt}`);
      const ownerExists = userMap.has(report.hakikaPropertiesData.ownerId);
      console.log(`   Owner Exists: ${ownerExists ? '✅' : '❌'}`);
      if (!ownerExists) {
        console.log(`   ⚠️  This is an orphaned listing!`);
      }
    }

    console.log('\n✅ Audit complete!\n');
  } catch (error) {
    console.error('❌ Audit failed:', error);
    throw error;
  }

  return report;
}

// Run audit if executed directly
auditDatabase().then(report => {
  console.log('\n📄 Full Report:');
  console.log(JSON.stringify(report, null, 2));
  process.exit(0);
}).catch(error => {
  console.error(error);
  process.exit(1);
});
