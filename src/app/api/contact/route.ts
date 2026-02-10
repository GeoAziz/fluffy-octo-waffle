import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

type ContactTopic = 'general' | 'technical' | 'listing' | 'verification';

const VALID_TOPICS: ContactTopic[] = ['general', 'technical', 'listing', 'verification'];

function normalizeTopic(topic: unknown): ContactTopic {
  return typeof topic === 'string' && VALID_TOPICS.includes(topic as ContactTopic)
    ? (topic as ContactTopic)
    : 'general';
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const name = typeof payload?.name === 'string' ? payload.name.trim() : '';
    const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
    const message = typeof payload?.message === 'string' ? payload.message.trim() : '';
    const topic = normalizeTopic(payload?.topic);

    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, email, and message are required.' }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({ message: 'A valid email is required.' }, { status: 400 });
    }

    const messageRef = await adminDb.collection('contactMessages').add({
      name,
      email,
      topic,
      message,
      createdAt: FieldValue.serverTimestamp(),
      status: 'new',
    });

    await adminDb.collection('emailQueue').add({
      to: email,
      template: 'contact-confirmation',
      subject: 'Thanks for contacting Kenya Land Trust',
      payload: {
        name,
        topic,
        messageId: messageRef.id,
      },
      createdAt: FieldValue.serverTimestamp(),
      status: 'queued',
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Contact form submission failed:', error);
    return NextResponse.json({ message: 'Failed to submit message.' }, { status: 500 });
  }
}
