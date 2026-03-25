'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/**
 * global-error.tsx - The ultimate fail-safe for errors in the root layout.
 * Must include <html> and <body> tags.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Global Error]', error);
    void fetch('/api/monitoring/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        digest: error.digest,
        route: 'global-layout',
      }),
    }).catch(() => {
      // intentionally swallow monitoring submission errors
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-risk mb-4">Critical Handshake Failure</h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            The platform root layout crashed. This is a severe error often related to identity providers or global state.
          </p>
          {error?.digest ? <p className="sr-only">Digest: {error.digest}</p> : null}
          <Button 
            onClick={() => reset()} 
            className="w-full h-12 font-black uppercase text-xs tracking-widest bg-primary"
          >
            Attempt Application Reset
          </Button>
        </div>
      </body>
    </html>
  );
}
