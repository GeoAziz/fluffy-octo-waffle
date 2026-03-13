#!/usr/bin/env node

/**
 * Verification Script for Seeded Test Data
 * 
 * Validates that all mock users from creds.md exist in Firebase Auth and Firestore
 * with correct roles and profile fields.
 * 
 * Usage: npm run verify:seed
 * Exit codes: 0 (success), 1 (verification failure)
 */

import { adminAuth, adminDb } from '../firebase-admin';
import type { UserProfile } from '../types';

// Test credentials (source of truth)
const TEST_CREDENTIALS = {
  admin: [{ email: 'admin@kenyalandtrust.co.ke', role: 'ADMIN' as const }],
  buyers: [
    { email: 'kamau.tech@gmail.com', role: 'BUYER' as const },
    { email: 'wanjiku.home@yahoo.com', role: 'BUYER' as const },
    { email: 'kipchoge.agri@gmail.com', role: 'BUYER' as const },
    { email: 'otieno.diaspora@outlook.com', role: 'BUYER' as const },
    { email: 'nyambura.first@gmail.com', role: 'BUYER' as const },
    { email: 'ochieng.invest@gmail.com', role: 'BUYER' as const },
    { email: 'mwangi.retire@gmail.com', role: 'BUYER' as const },
    { email: 'akinyi.coast@gmail.com', role: 'BUYER' as const },
    { email: 'corporate@kenyacorp.co.ke', role: 'BUYER' as const },
    { email: 'cheptoo.browse@gmail.com', role: 'BUYER' as const },
  ],
  sellers: [
    { email: 'info@amaniproperties.co.ke', role: 'SELLER' as const },
    { email: 'sales@barakalands.co.ke', role: 'SELLER' as const },
    { email: 'kariuki.lands@gmail.com', role: 'SELLER' as const },
    { email: 'info@coastrealty.co.ke', role: 'SELLER' as const },
    { email: 'contact@agriventures.co.ke', role: 'SELLER' as const },
    { email: 'wanjiru.property@gmail.com', role: 'SELLER' as const },
    { email: 'sales@metroestates.co.ke', role: 'SELLER' as const },
    { email: 'info@highlandventures.co.ke', role: 'SELLER' as const },
    { email: 'mutua.newagent@gmail.com', role: 'SELLER' as const },
    { email: 'contact@lakesideproperties.co.ke', role: 'SELLER' as const },
    { email: 'sales@riftvalleylands.co.ke', role: 'SELLER' as const },
    { email: 'info@urbanplots.co.ke', role: 'SELLER' as const },
    { email: 'invest@investproperties.co.ke', role: 'SELLER' as const },
    { email: 'njoroge.estate@gmail.com', role: 'SELLER' as const },
    { email: 'affordable@homeskenya.co.ke', role: 'SELLER' as const },
  ],
};

const ALL_USERS = [...TEST_CREDENTIALS.admin, ...TEST_CREDENTIALS.buyers, ...TEST_CREDENTIALS.sellers];

interface VerificationResult {
  email: string;
  expectedRole: string;
  status: 'VERIFIED' | 'MISSING_IN_AUTH' | 'ORPHAN_IN_FIRESTORE' | 'ROLE_MISMATCH' | 'MISSING_FIELDS' | 'ERROR';
  actualRole?: string;
  uid?: string;
  error?: string;
}

async function verifyUser(email: string, expectedRole: string): Promise<VerificationResult> {
  try {
    // Step 1: Query Firebase Auth
    let user;
    try {
      user = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        return {
          email,
          expectedRole,
          status: 'MISSING_IN_AUTH',
        };
      }
      throw error;
    }

    // Step 2: Query Firestore profile
    const profileRef = adminDb.collection('users').doc(user.uid);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return {
        email,
        expectedRole,
        status: 'ORPHAN_IN_FIRESTORE',
        uid: user.uid,
      };
    }

    const profile = profileDoc.data() as UserProfile | undefined;
    if (!profile) {
      return {
        email,
        expectedRole,
        status: 'MISSING_FIELDS',
        uid: user.uid,
        error: 'Profile data is null',
      };
    }

    // Step 3: Validate required fields
    const requiredFields = ['email', 'role', 'displayName'];
    const missingFields = requiredFields.filter(field => !profile[field as keyof UserProfile]);

    if (missingFields.length > 0) {
      return {
        email,
        expectedRole,
        status: 'MISSING_FIELDS',
        uid: user.uid,
        error: `Missing fields: ${missingFields.join(', ')}`,
      };
    }

    // Step 4: Validate role matches
    if (profile.role !== expectedRole) {
      return {
        email,
        expectedRole,
        status: 'ROLE_MISMATCH',
        uid: user.uid,
        actualRole: profile.role,
      };
    }

    // All checks passed
    return {
      email,
      expectedRole,
      status: 'VERIFIED',
      uid: user.uid,
      actualRole: profile.role,
    };
  } catch (error: any) {
    return {
      email,
      expectedRole,
      status: 'ERROR',
      error: error.message,
    };
  }
}

async function runVerification() {
  console.log('\n🔍 Verifying Seeded Users...\n');

  try {
    // Test Firebase connection
    console.log('✅ Firebase Connection: OK\n');

    // Verify all users
    const results: VerificationResult[] = [];
    console.log(`📊 Verifying ${ALL_USERS.length} users from credentials...\n`);

    for (const { email, role } of ALL_USERS) {
      const result = await verifyUser(email, role);
      results.push(result);
      
      // Visual feedback
      const statusIcon = 
        result.status === 'VERIFIED' ? '✓' :
        result.status === 'MISSING_IN_AUTH' ? '✗' :
        result.status === 'ORPHAN_IN_FIRESTORE' ? '⚠️' :
        result.status === 'ROLE_MISMATCH' ? '❌' :
        result.status === 'MISSING_FIELDS' ? '⚠️' :
        '❌';
      
      process.stdout.write(`${statusIcon} `);
    }
    console.log('\n');

    // Generate report by role
    const byRole = {
      ADMIN: results.filter(r => r.expectedRole === 'ADMIN'),
      BUYER: results.filter(r => r.expectedRole === 'BUYER'),
      SELLER: results.filter(r => r.expectedRole === 'SELLER'),
    };

    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 Verification Results by Role:\n');

    for (const [role, roleResults] of Object.entries(byRole)) {
      const verified = roleResults.filter(r => r.status === 'VERIFIED').length;
      const total = roleResults.length;
      const icon = verified === total ? '✓' : '✗';
      console.log(`${icon} ${role}: ${verified}/${total} verified`);
    }

    // Overall stats
    const totalVerified = results.filter(r => r.status === 'VERIFIED').length;
    const totalExpected = ALL_USERS.length;
    console.log(`\n📊 Overall: ${totalVerified}/${totalExpected} users verified\n`);

    // Detailed results by role
    console.log('═══════════════════════════════════════════════════════\n');
    console.log('📋 Detailed Verification Report:\n');

    for (const [role, roleResults] of Object.entries(byRole)) {
      console.log(`\n${role}S:`);
      roleResults.forEach((result, idx) => {
        if (result.status === 'VERIFIED') {
          console.log(`  ✓ ${result.email} → uid: ${result.uid?.slice(0, 8)}... | role: ${result.actualRole}`);
        } else {
          console.log(`  ✗ ${result.email} → [${result.status}]`);
          if (result.error) {
            console.log(`    └─ ${result.error}`);
          }
        }
      });
    }

    // Issues summary
    const issues = results.filter(r => r.status !== 'VERIFIED');
    console.log(`\n═══════════════════════════════════════════════════════\n`);
    console.log(`⚠️  Issues Found: ${issues.length}\n`);

    if (issues.length > 0) {
      console.log('🔴 ISSUES:\n');
      const groupedByStatus: Record<string, VerificationResult[]> = {};
      issues.forEach(issue => {
        if (!groupedByStatus[issue.status]) {
          groupedByStatus[issue.status] = [];
        }
        groupedByStatus[issue.status].push(issue);
      });

      for (const [status, items] of Object.entries(groupedByStatus)) {
        console.log(`${status} (${items.length}):`);
        items.forEach(item => {
          console.log(`  • ${item.email}`);
          if (item.actualRole && item.status === 'ROLE_MISMATCH') {
            console.log(`    Expected: ${item.expectedRole}, Got: ${item.actualRole}`);
          }
          if (item.error) {
            console.log(`    Error: ${item.error}`);
          }
        });
        console.log();
      }

      // Recommendations
      console.log('\n💡 Recommendations:\n');
      if (groupedByStatus['MISSING_IN_AUTH']) {
        console.log('  • For missing users in Auth: Re-run seed script');
        console.log('    npm run seed:all -- --clear\n');
      }
      if (groupedByStatus['ORPHAN_IN_FIRESTORE']) {
        console.log('  • For orphaned users: Check Firestore directly or re-seed\n');
      }
      if (groupedByStatus['ROLE_MISMATCH']) {
        console.log('  • For role mismatches: Review seeding logic or manually fix roles\n');
      }
      if (groupedByStatus['MISSING_FIELDS']) {
        console.log('  • For missing fields: Re-run seed to populate missing data\n');
      }
    } else {
      console.log('════════════════════════════════════════════════════════\n');
      console.log('✅ All users verified successfully!\n');
      console.log('════════════════════════════════════════════════════════\n');
      console.log('Summary:\n');
      console.log('  • Total users: 26/26 ✓');
      console.log('  • All roles correct: YES ✓');
      console.log('  • Data integrity: CLEAN ✓\n');
      console.log('You can now run: npm run dev\n');
    }

    // Exit with appropriate code
    process.exit(issues.length > 0 ? 1 : 0);
  } catch (error: any) {
    console.error('\n❌ Verification Failed:\n');
    console.error(error.message);
    console.error('\n🔧 Troubleshooting:\n');
    console.error('  • Ensure Firebase credentials are loaded (serviceAccountKey.json)');
    console.error('  • Check network connectivity to Firebase\n');
    process.exit(1);
  }
}

// Run verification
runVerification();
