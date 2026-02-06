import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!getApps().length) {
  // This check is critical for server-side actions to work.
  if (!serviceAccount) {
    throw new Error(
      'Firebase Admin SDK Error: The `FIREBASE_SERVICE_ACCOUNT` environment variable is not set. Go to your Firebase Project Settings > Service Accounts and generate a new private key. Then, add it to your environment variables.'
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
      'Firebase Admin SDK Error: The `FIREBASE_SERVICE_ACCOUNT` environment variable is malformed. It must be a valid JSON string. Please copy the entire JSON object from your Firebase service account key file.'
    );
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
