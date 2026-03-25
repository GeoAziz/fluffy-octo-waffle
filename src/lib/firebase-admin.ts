import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import fs from 'node:fs';
import path from 'node:path';
import type { ServiceAccount } from 'firebase-admin';

/**
 * @fileOverview Firebase Admin SDK initialization.
 * Streamlined to be compatible with environments that might perform static analysis 
 * for Edge Runtime, avoiding direct 'fs' and 'path' usage at the top level.
 */

if (!getApps().length) {
  let serviceAccount: ServiceAccount | undefined;

  // Priority 1: Base64 encoded JSON (Recommended for production/Vercel)
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_B64;
  if (b64) {
    try {
      serviceAccount = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
    } catch {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_B64');
    }
  }

  // Priority 2: Minified JSON string
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccount && raw) {
    try {
      serviceAccount = JSON.parse(raw);
    } catch {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY');
    }
  }

  // Priority 3: Individual fields
  if (!serviceAccount && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }

  if (serviceAccount) {
    const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.projectId || process.env.FIREBASE_PROJECT_ID}.appspot.com`;
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket,
    });
  } else {
      // Optional local fallback only when explicitly enabled.
      // This prevents accidental file-based secret dependency in production-like environments.
    let localInitialized = false;
      const allowLocalKeyFile = process.env.ALLOW_LOCAL_SERVICE_ACCOUNT_FILE === 'true';
      if (allowLocalKeyFile) {
        try {
          const keyPath = path.join(process.cwd(), 'serviceAccountKey.json');
          if (fs.existsSync(keyPath)) {
            const keyFile = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
            admin.initializeApp({
              credential: admin.credential.cert(keyFile),
              storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${keyFile.project_id}.appspot.com`,
            });
            localInitialized = true;
            console.log('Firebase Admin: Initialized from explicitly enabled local key file');
          }
        } catch {
          console.warn('Firebase Admin: Local key-file fallback failed. Configure env credentials instead.');
        }
    }
    
    if (!localInitialized) {
      // No credentials found. Initialize with minimal config so module-level
      // exports (admin.auth(), etc.) don't throw at import time during build.
      // Actual service calls will fail at runtime with a clearer error.
      console.warn('Firebase Admin: No credentials found. Initializing with minimal config (project ID only).');
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'unset-project-id',
      });
    }
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const adminStorage = admin.storage();
