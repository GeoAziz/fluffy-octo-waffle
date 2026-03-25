import { NextResponse, type NextRequest } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

const MAX_MESSAGE_LENGTH = 2_000;

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipLimit = enforceRateLimit({
      scope: 'message-send-ip',
      identifier: ip,
      maxRequests: 40,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many message attempts. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const userLimit = enforceRateLimit({
      scope: 'message-send-user',
      identifier: userId,
      maxRequests: 30,
      windowMs: 60_000,
    });

    if (!userLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many messages sent. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(userLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const conversationId = typeof body?.conversationId === 'string' ? body.conversationId : '';
    const text = typeof body?.text === 'string' ? body.text.trim() : '';

    if (!conversationId || !text) {
      return NextResponse.json({ error: 'conversationId and text are required.' }, { status: 400 });
    }

    if (text.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json({ error: `Message too long. Max ${MAX_MESSAGE_LENGTH} characters.` }, { status: 400 });
    }

    const conversationRef = adminDb.collection('conversations').doc(conversationId);
    const conversationDoc = await conversationRef.get();
    if (!conversationDoc.exists) {
      return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
    }

    const participantIds = (conversationDoc.data()?.participantIds ?? []) as string[];
    if (!participantIds.includes(userId)) {
      return NextResponse.json({ error: 'Unauthorized to send message in this conversation.' }, { status: 403 });
    }

    const conversationLimit = enforceRateLimit({
      scope: 'message-send-conversation',
      identifier: `${conversationId}:${userId}`,
      maxRequests: 20,
      windowMs: 60_000,
    });

    if (!conversationLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many messages in this conversation. Please slow down.' },
        { status: 429, headers: { 'Retry-After': String(conversationLimit.retryAfterSeconds) } }
      );
    }

    const messageRef = conversationRef.collection('messages').doc();

    await adminDb.runTransaction(async (transaction) => {
      transaction.set(messageRef, {
        senderId: userId,
        text,
        timestamp: FieldValue.serverTimestamp(),
      });

      transaction.update(conversationRef, {
        lastMessage: {
          text,
          senderId: userId,
          timestamp: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
        status: 'responded',
      });
    });

    return NextResponse.json({ status: 'success', messageId: messageRef.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('/api/messages/send error:', message);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
