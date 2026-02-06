import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!getApps().length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(serviceAccount)),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (e: any) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT:', e.message);
      throw new Error('Could not initialize Firebase Admin SDK. Please check the format of your FIREBASE_SERVICE_ACCOUNT environment variable.');
    }
  } else {
    // Throw a more helpful error if the service account is missing.
    throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it to your .env.local file to initialize the Firebase Admin SDK.');
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
