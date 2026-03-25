import { NextResponse } from 'next/server';
import { generatePropertyDescription } from '@/ai/flows/generate-property-description';
import { enforceRateLimit, getClientIp } from '@/lib/security/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const ipLimit = enforceRateLimit({
      scope: 'generate-description-ip',
      identifier: ip,
      maxRequests: 20,
      windowMs: 60_000,
    });

    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many AI generation requests. Please retry shortly.' },
        { status: 429, headers: { 'Retry-After': String(ipLimit.retryAfterSeconds) } }
      );
    }

    const body = await req.json();
    const bulletPoints = body?.bulletPoints;
    if (!bulletPoints) {
      return NextResponse.json({ error: 'Missing bulletPoints' }, { status: 400 });
    }

    const result = await generatePropertyDescription({ bulletPoints });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
