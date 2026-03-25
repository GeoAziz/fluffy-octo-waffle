import { NextResponse, type NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

const NewsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type NewsletterInput = z.infer<typeof NewsletterSchema>;

/**
 * POST /api/newsletter/subscribe
 * Subscribe a user to the newsletter
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipLimit = enforceRateLimit({
      scope: 'newsletter-subscribe-ip',
      identifier: ip,
      maxRequests: 15,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { status: 'error', message: 'Too many requests. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = NewsletterSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.flatten().fieldErrors;
      return NextResponse.json(
        { status: 'error', message: 'Validation failed', errors },
        { status: 400 }
      );
    }

    const { email } = validationResult.data as NewsletterInput;

    // Check if already subscribed
    const existingQuery = await adminDb
      .collection('newsletterSubscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      return NextResponse.json(
        { status: 'warning', message: 'This email is already subscribed' },
        { status: 200 }
      );
    }

    // Add to newsletter subscribers
    await adminDb.collection('newsletterSubscribers').add({
      email,
      subscribedAt: FieldValue.serverTimestamp(),
      status: 'active',
      source: 'footer',
    });

    // Queue confirmation email
    try {
      await adminDb.collection('emailQueue').add({
        to: email,
        template: 'newsletter-confirmation',
        subject: 'Welcome to Kenya Land Trust Newsletter',
        payload: {
          email,
        },
        createdAt: FieldValue.serverTimestamp(),
        status: 'queued',
      });
    } catch (emailError: unknown) {
      const message = emailError instanceof Error ? emailError.message : String(emailError);
      console.warn('Failed to queue confirmation email:', message);
      // Don't fail the subscription if email queueing fails
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Successfully subscribed to newsletter',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('/api/newsletter/subscribe error:', message);
    return NextResponse.json(
      { status: 'error', message: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/newsletter/unsubscribe
 * Unsubscribe from the newsletter
 */
export async function DELETE(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const ipLimit = enforceRateLimit({
      scope: 'newsletter-unsubscribe-ip',
      identifier: ip,
      maxRequests: 15,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { status: 'error', message: 'Too many requests. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = NewsletterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { status: 'error', message: 'Invalid email' },
        { status: 400 }
      );
    }

    const { email } = validationResult.data as NewsletterInput;

    // Find and update subscription status
    const query = await adminDb
      .collection('newsletterSubscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (query.empty) {
      return NextResponse.json(
        { status: 'error', message: 'Email not found in subscribers' },
        { status: 404 }
      );
    }

    await query.docs[0].ref.update({
      status: 'unsubscribed',
      unsubscribedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json(
      { status: 'success', message: 'Successfully unsubscribed' },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('/api/newsletter/unsubscribe error:', message);
    return NextResponse.json(
      { status: 'error', message: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
