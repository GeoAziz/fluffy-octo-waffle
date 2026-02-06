import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!getApps().length) {
  // This check is critical for server-side actions to work.
  if (!serviceAccount) {
    throw new Error(
      'Firebase Admin SDK Error: The `FIREBASE_SERVICE_ACCOUNT` environment variable is not set. Please add it to your project environment settings to enable backend features.'
    );
  }

  try {
    // Attempt to parse the service account JSON.
    const serviceAccountJson = JSON.parse(serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error: any) {
    // This error happens if the JSON is malformed.
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    throw new Error(
      'Firebase Admin SDK Error: The `FIREBASE_SERVICE_ACCOUNT` environment variable is malformed. Please ensure it is a valid JSON key from your Firebase project console.'
    );
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
