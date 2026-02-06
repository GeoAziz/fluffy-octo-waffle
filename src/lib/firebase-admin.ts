import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import fs from 'fs';
import path from 'path';

if (!getApps().length) {
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json');
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

  let serviceAccount;

  if (fs.existsSync(serviceAccountPath)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    } catch (error: any) {
      console.error('Error parsing serviceAccountKey.json:', error.message);
      throw new Error(
        'Could not initialize Firebase Admin SDK. The `serviceAccountKey.json` file appears to be malformed. Please ensure it is a valid JSON object.'
      );
    }
  } else if (serviceAccountEnv) {
    try {
      serviceAccount = JSON.parse(serviceAccountEnv);
    } catch (error: any) {
      console.error('Error parsing FIREBASE_SERVICE_ACCOUNT env var:', error.message);
      throw new Error(
        "Firebase Admin SDK Error: 'serviceAccountKey.json' was not found. The fallback 'FIREBASE_SERVICE_ACCOUNT' environment variable was used, but it is malformed. Please ensure the env var is a valid JSON string or that 'serviceAccountKey.json' exists in your project root."
      );
    }
  } else {
    throw new Error(
      'Firebase Admin SDK Error: Could not find `serviceAccountKey.json` in the project root, and the `FIREBASE_SERVICE_ACCOUNT` environment variable is not set. Please provide one of them.'
    );
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
