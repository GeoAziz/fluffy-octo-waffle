import { NextResponse, type NextRequest } from 'next/server';
import { adminAuth, adminDb, adminStorage } from '@/lib/firebase-admin';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

function isValidEvidenceStoragePath(storagePath: string) {
  return storagePath.startsWith('evidence/') && !storagePath.includes('..') && !storagePath.includes('\\');
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipLimit = enforceRateLimit({
      scope: 'evidence-download-ip',
      identifier: ip,
      maxRequests: 30,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many evidence download requests. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Authentication required.' }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decoded.uid;

    const userLimit = enforceRateLimit({
      scope: 'evidence-download-user',
      identifier: userId,
      maxRequests: 20,
      windowMs: 60_000,
    });

    if (!userLimit.allowed) {
      return NextResponse.json(
        { message: 'Too many evidence downloads from this account. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(userLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const evidenceId = typeof body?.evidenceId === 'string' ? body.evidenceId : '';
    if (!evidenceId) {
      return NextResponse.json({ message: 'evidenceId is required.' }, { status: 400 });
    }

    const [userDoc, evidenceDoc] = await Promise.all([
      adminDb.collection('users').doc(userId).get(),
      adminDb.collection('evidence').doc(evidenceId).get(),
    ]);

    if (!evidenceDoc.exists) {
      return NextResponse.json({ message: 'Evidence not found.' }, { status: 404 });
    }

    const userRole = userDoc.exists ? userDoc.data()?.role : null;
    const evidenceData = evidenceDoc.data();
    const evidenceOwnerId = evidenceData?.ownerId;
    const storagePath = evidenceData?.storagePath;

    if (typeof storagePath !== 'string' || !isValidEvidenceStoragePath(storagePath)) {
      return NextResponse.json({ message: 'Invalid evidence storage path.' }, { status: 400 });
    }

    const isAdmin = userRole === 'ADMIN';
    const isOwner = evidenceOwnerId === userId;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: 'Unauthorized.' }, { status: 403 });
    }

    const expiresMinutes = Number(process.env.EVIDENCE_SIGNED_URL_TTL_MINUTES ?? '15');
    const clampedExpiresMinutes = Number.isFinite(expiresMinutes)
      ? Math.min(Math.max(expiresMinutes, 1), 60)
      : 15;

    const [url] = await adminStorage
      .bucket()
      .file(storagePath)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + clampedExpiresMinutes * 60 * 1000,
      });

    return NextResponse.json({
      url,
      expiresInMinutes: clampedExpiresMinutes,
    });
  } catch (error) {
    console.error('/api/evidence/download-url POST failed:', error);
    return NextResponse.json({ message: 'Failed to generate evidence download URL.' }, { status: 500 });
  }
}
