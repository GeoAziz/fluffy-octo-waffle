import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import type { PlatformSettings, AuditLog } from '@/lib/types';

const SettingsSchema = z.object({
  platformName: z.string().min(1, 'Platform name is required').max(100),
  contactEmail: z.string().email('Invalid contact email'),
  supportEmail: z.string().email('Invalid support email'),
  supportPhone: z.string().optional().default(''),
  siteDescription: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  maxUploadSizeMB: z.number().min(1, 'Max upload size must be at least 1 MB').max(1000),
  moderationThresholdDays: z.number().min(1, 'Must be at least 1 day').max(365),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional().default(''),
  enableUserSignups: z.boolean(),
  enableListingCreation: z.boolean(),
  socialFacebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  socialTwitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  socialLinkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  trustStats: z.object({
    totalListings: z.number().min(0),
    totalBuyers: z.number().min(0),
    fraudCasesResolved: z.number().min(0),
  }).optional(),
});

async function verifyAdmin(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value;
  if (!sessionCookie) return { authenticated: false, error: 'Auth required', status: 401 };

  try {
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    const userRole = userDoc.exists ? userDoc.data()?.role : null;

    if (userRole !== 'ADMIN') return { authenticated: false, error: 'Forbidden', status: 403 };
    return { authenticated: true, uid: decodedToken.uid };
  } catch (error) {
    return { authenticated: false, error: 'Verification failed', status: 401 };
  }
}

export async function GET(request: NextRequest) {
  try {
    const verifyResult = await verifyAdmin(request);
    if (!verifyResult.authenticated) {
      return NextResponse.json({ status: 'error', message: verifyResult.error }, { status: verifyResult.status });
    }

    const settingsDoc = await adminDb.collection('adminConfig').doc('settings').get();
    const settings = settingsDoc.exists ? settingsDoc.data() : {
      platformName: 'Kenya Land Trust',
      contactEmail: 'contact@kenyalandtrust.com',
      supportEmail: 'support@kenyalandtrust.com',
      siteDescription: 'A trusted platform for buying and selling land in Kenya',
      maxUploadSizeMB: 50,
      moderationThresholdDays: 7,
      maintenanceMode: false,
      enableUserSignups: true,
      enableListingCreation: true,
      trustStats: { totalListings: 10000, totalBuyers: 5000, fraudCasesResolved: 0 }
    };

    return NextResponse.json({ status: 'success', data: settings });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: 'Sync failed' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const verifyResult = await verifyAdmin(request);
    if (!verifyResult.authenticated) {
      return NextResponse.json({ status: 'error', message: verifyResult.error }, { status: verifyResult.status });
    }

    const body = await request.json();
    const validatedData = SettingsSchema.parse(body);

    const settingsDoc = await adminDb.collection('adminConfig').doc('settings').get();
    const currentSettings = settingsDoc.exists ? settingsDoc.data() : {};

    const updateData = {
      ...validatedData,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: verifyResult.uid,
    };

    await adminDb.collection('adminConfig').doc('settings').set(updateData, { merge: true });

    // Track Audit
    const changes: Record<string, any> = {};
    Object.entries(validatedData).forEach(([key, value]) => {
      if (JSON.stringify((currentSettings as any)[key]) !== JSON.stringify(value)) {
        changes[key] = { old: (currentSettings as any)[key], new: value };
      }
    });

    if (Object.keys(changes).length > 0) {
      await adminDb.collection('auditLogs').add({
        adminId: verifyResult.uid,
        action: 'UPDATE',
        entityType: 'platform_settings',
        entityId: 'settings',
        changes,
        timestamp: FieldValue.serverTimestamp(),
      });
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return NextResponse.json({ status: 'success', data: updateData });
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
