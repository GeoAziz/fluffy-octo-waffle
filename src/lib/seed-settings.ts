/**
 * Admin Settings Initialization Script
 * 
 * This script initializes the admin platform settings document in Firestore.
 * Run with: npm run seed:settings
 */

import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import type { PlatformSettings } from './types';

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

async function initializeSettings() {
  try {
    console.log('🚀 Starting platform settings initialization...\n');

    const settingsDoc = await adminDb.collection('adminConfig').doc('settings').get();

    if (settingsDoc.exists) {
      console.log('✅ Settings document already exists.');
      return;
    }

    await adminDb.collection('adminConfig').doc('settings').set(DEFAULT_SETTINGS as any);

    console.log('✅ Platform settings initialized successfully!\n');
    console.log(JSON.stringify(DEFAULT_SETTINGS, null, 2));
  } catch (error: any) {
    console.error('❌ Error initializing settings:', error?.message || error);
    process.exit(1);
  }
}

initializeSettings().then(() => {
  process.exit(0);
});
