import { NextResponse, type NextRequest } from 'next/server';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';
import { recordRuntimeError } from '@/lib/monitoring';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = enforceRateLimit({
      scope: 'monitoring-error-ingest-ip',
      identifier: ip,
      maxRequests: 40,
      windowMs: 60_000,
    });

    if (!limit.allowed) {
      return NextResponse.json(
        { message: 'Too many monitoring requests.' },
        { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } }
      );
    }

    const payload = await request.json();
    const message = typeof payload?.message === 'string' ? payload.message : 'Unknown client error';
    const stack = typeof payload?.stack === 'string' ? payload.stack : undefined;
    const route = typeof payload?.route === 'string' ? payload.route : undefined;
    const digest = typeof payload?.digest === 'string' ? payload.digest : undefined;

    await recordRuntimeError({
      source: 'client',
      message,
      stack,
      route,
      digest,
      severity: 'error',
      context: {
        userAgent: request.headers.get('user-agent') ?? null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error('/api/monitoring/error POST failed:', error);
    return NextResponse.json({ message: 'Monitoring capture failed.' }, { status: 500 });
  }
}
