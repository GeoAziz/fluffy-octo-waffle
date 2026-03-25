/**
 * Admin Settings Initialization Script
 * 
 * This script initializes the admin platform settings document in Firestore.
 * Run with: npm run seed:settings
 */

import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { PlatformSettings } from './types';
import { assertSeedSafety } from './seed-safety';

const DEFAULT_SETTINGS: PlatformSettings = {
  platformName: 'Kenya Land Trust',
  contactEmail: 'contact@kenyalandtrust.com',
  supportEmail: 'support@kenyalandtrust.com',
  supportPhone: '+254 (0) 700 000 000',
  siteDescription: 'A trusted platform for buying and selling land in Kenya with verified listings and secure transactions.',
  maxUploadSizeMB: 50,
  moderationThresholdDays: 2, // 48 hours target
  maintenanceMode: false,
  maintenanceMessage: '',
  enableUserSignups: true,
  enableListingCreation: true,
  socialFacebook: 'https://facebook.com/kenyalandtrust',
  socialTwitter: 'https://twitter.com/kenyalandtrust',
  socialLinkedin: 'https://linkedin.com/company/kenyalandtrust',
  trustStats: {
    totalListings: 12400,
    totalBuyers: 15000,
    fraudCasesResolved: 100,
  },
  updatedAt: FieldValue.serverTimestamp(),
  updatedBy: 'system-init',
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

async function initializeSettings() {
  try {
    assertSeedSafety({ operationName: 'seed:settings' });
    console.log('🚀 Starting platform settings initialization...\n');

    const settingsDoc = await adminDb.collection('adminConfig').doc('settings').get();

    if (settingsDoc.exists) {
      console.log('✅ Settings document already exists.');
      return;
    }

    await adminDb.collection('adminConfig').doc('settings').set(DEFAULT_SETTINGS);

    console.log('✅ Platform settings initialized successfully!\n');
    console.log(JSON.stringify(DEFAULT_SETTINGS, null, 2));
  } catch (error: unknown) {
    console.error('❌ Error initializing settings:', getErrorMessage(error));
    process.exit(1);
  }
}

initializeSettings().then(() => {
  process.exit(0);
});
