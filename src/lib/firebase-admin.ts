import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Unified check for the service account variable.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!getApps().length) {
  if (!serviceAccount) {
    throw new Error(
      'The `FIREBASE_SERVICE_ACCOUNT` environment variable is not set. The Admin SDK requires this to connect to your Firebase project. Please add it to your environment.'
    );
  }

  try {
    const serviceAccountJson = JSON.parse(serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountJson),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
  } catch (error: any) {
    console.error('Firebase Admin SDK Initialization Error:', error.message);
    throw new Error(
      'Could not initialize Firebase Admin SDK. The `FIREBASE_SERVICE_ACCOUNT` environment variable appears to be malformed. Please ensure it is a valid JSON object.'
    );
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
