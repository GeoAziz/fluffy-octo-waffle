/**
 * Cleanup Script for Orphaned Data
 * Removes conversations where buyer/seller no longer exist in /users
 * Keeps all listing-seller connections intact
 */
import { adminDb } from './firebase-admin';

type CleanupResult = {
  deleted: number;
  errors: string[];
  timestamp: string;
};

async function cleanupOrphanedConversations(): Promise<CleanupResult> {
  console.log('\n🧹 Starting orphaned conversations cleanup...\n');
  
  const result: CleanupResult = {
    deleted: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    // Get all users
    const usersSnapshot = await adminDb.collection('users').get();
    const validUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));
    
    console.log(`📋 Found ${validUserIds.size} valid users in database`);

    // Get all conversations
    const conversationsSnapshot = await adminDb.collection('conversations').get();
    console.log(`💬 Found ${conversationsSnapshot.size} total conversations\n`);

    let checked = 0;

    // Check each conversation
    for (const convDoc of conversationsSnapshot.docs) {
      checked++;
      const conversation = convDoc.data();
      const participantIds = conversation.participantIds || [];
      
      if (participantIds.length < 2) {
        console.log(`⚠️  Conversation ${convDoc.id} has invalid participantIds: ${JSON.stringify(participantIds)}`);
        continue;
      }

      const buyerId = participantIds[0];
      const sellerId = participantIds[1];
      const buyerExists = validUserIds.has(buyerId);
      const sellerExists = validUserIds.has(sellerId);

      // If either participant is missing, delete the conversation
      if (!buyerExists || !sellerExists) {
        try {
          await convDoc.ref.delete();
          result.deleted++;
          const reason = !buyerExists && !sellerExists ? 'both missing' : !buyerExists ? 'buyer missing' : 'seller missing';
          console.log(`   ✓ Deleted: ${convDoc.id} (${reason})`);
        } catch (error) {
          const msg = `Failed to delete ${convDoc.id}: ${error instanceof Error ? error.message : String(error)}`;
          console.error(`   ✗ ${msg}`);
          result.errors.push(msg);
        }
      }
    }

    console.log(`\n📊 Cleanup Results:`);
    console.log(`   Conversations checked: ${checked}`);
    console.log(`   Orphaned conversations deleted: ${result.deleted}`);
    console.log(`   Cleanup errors: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      result.errors.forEach(err => console.log(`   - ${err}`));
    }

    console.log(`\n✅ Cleanup complete!\n`);
  } catch (error) {
    const msg = `Cleanup failed: ${error instanceof Error ? error.message : String(error)}`;
    console.error(`\n❌ ${msg}`);
    result.errors.push(msg);
  }

  return result;
}

// Run cleanup
cleanupOrphanedConversations()
  .then((result) => {
    console.log('\n📄 Summary:');
    console.log(JSON.stringify({
      deleted: result.deleted,
      errors: result.errors.length,
      timestamp: result.timestamp,
    }, null, 2));
    
    process.exit(result.errors.length > 0 ? 1 : 0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
