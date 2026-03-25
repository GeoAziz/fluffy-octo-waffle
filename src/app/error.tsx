'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

/**
 * Root Error Page - Handles unexpected routing or data fetching errors.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Root Error]', error);
    void fetch('/api/monitoring/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        route: window.location.pathname,
      }),
    }).catch(() => {
      // intentionally swallow monitoring submission errors
    });
  }, [error]);

  return (
    <div className="flex min-h-[80dvh] items-center justify-center p-4">
      <Card className="max-w-md border-warning/20 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning-light">
            <AlertCircle className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl font-black uppercase tracking-tight text-primary">Unexpected Logic Failure</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            We encountered a problem loading this part of the platform. This is usually temporary and may be caused by a network timeout.
          </p>
          <p className="text-[10px] font-mono text-muted-foreground uppercase opacity-60">
            Internal ID: {error.digest || 'ERR_UNKNOWN'}
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button onClick={() => reset()} className="w-full font-black uppercase text-xs tracking-widest h-12">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Retry Triage
          </Button>
          <Button asChild variant="outline" className="w-full font-black uppercase text-xs tracking-widest h-12">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
