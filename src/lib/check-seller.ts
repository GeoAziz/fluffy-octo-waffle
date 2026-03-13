#!/usr/bin/env node

import { adminDb } from './firebase-admin';

async function main() {
  const sellerUid = process.argv[2];

  if (!sellerUid) {
    console.error('Usage: npm run db:check-seller -- <sellerUid>');
    process.exit(1);
  }

  const doc = await adminDb.collection('users').doc(sellerUid).get();

  if (!doc.exists) {
    console.log(JSON.stringify({ exists: false, sellerUid }, null, 2));
    process.exit(0);
  }

  const data = doc.data() as {
    displayName?: string | null;
    email?: string | null;
    role?: string;
    verified?: boolean;
    enabledForSelling?: boolean;
  };

  console.log(
    JSON.stringify(
      {
        exists: true,
        sellerUid,
        displayName: data.displayName ?? null,
        email: data.email ?? null,
        role: data.role ?? null,
        verified: data.verified ?? null,
        enabledForSelling: data.enabledForSelling ?? null,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error('db:check-seller failed:', error);
  process.exit(1);
});
