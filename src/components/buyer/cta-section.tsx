'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export function CtaSection() {
  return (
    <section className="border-t bg-muted/30 py-12 sm:py-16">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to find your perfect plot?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Get alerts when new verified listings go live, and connect with trusted sellers faster.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/listings">Browse Listings</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">Sell with Us</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border bg-background p-6 shadow-sm">
            <h3 className="text-lg font-semibold">Email me new listings</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Subscribe for weekly updates on verified land opportunities.
            </p>
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => event.preventDefault()}
            >
              <Input type="email" placeholder="you@example.com" required />
              <Button type="submit">Notify me</Button>
            </form>
            <p className="mt-3 text-xs text-muted-foreground">
              We respect your inbox. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
