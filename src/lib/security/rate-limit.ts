import type { NextRequest } from 'next/server';

type RateLimitWindow = {
  count: number;
  resetAt: number;
};

type EnforceRateLimitArgs = {
  scope: string;
  identifier: string;
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const memoryStore = new Map<string, RateLimitWindow>();

function nowMs() {
  return Date.now();
}

function toStoreKey(scope: string, identifier: string) {
  return `${scope}:${identifier}`;
}

function cleanupExpiredEntries(currentTimeMs: number) {
  if (memoryStore.size < 5_000) return;
  for (const [key, value] of memoryStore.entries()) {
    if (value.resetAt <= currentTimeMs) {
      memoryStore.delete(key);
    }
  }
}

export function enforceRateLimit({
  scope,
  identifier,
  maxRequests,
  windowMs,
}: EnforceRateLimitArgs): RateLimitResult {
  const currentTimeMs = nowMs();
  cleanupExpiredEntries(currentTimeMs);

  const key = toStoreKey(scope, identifier || 'anonymous');
  const existing = memoryStore.get(key);

  if (!existing || existing.resetAt <= currentTimeMs) {
    memoryStore.set(key, {
      count: 1,
      resetAt: currentTimeMs + windowMs,
    });

    return {
      allowed: true,
      remaining: Math.max(0, maxRequests - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - currentTimeMs) / 1000)),
    };
  }

  existing.count += 1;
  memoryStore.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - currentTimeMs) / 1000)),
  };
}

export function getClientIp(request: Request | NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown-ip';
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const connectingIp = request.headers.get('cf-connecting-ip');
  if (connectingIp) {
    return connectingIp.trim();
  }

  return 'unknown-ip';
}
