import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileSearch, Home, ShieldAlert } from 'lucide-react';
import { BuyerHeader } from '@/components/buyer/buyer-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';

/**
 * Root Not Found Page
 * Provides a high-trust recovery interface for any 404 encountered on the platform.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <BuyerHeader />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="relative mb-8">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 opacity-20" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-muted">
            <FileSearch className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary md:text-6xl">
          Protocol Deviation
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          The requested resource is not present in the property registry or has been moved during a moderation cycle.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="font-black uppercase text-[10px] tracking-widest px-8 h-14">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-black uppercase text-[10px] tracking-widest px-8 h-14">
            <Link href="/explore">
              Browse Registry
            </Link>
          </Button>
        </div>

        <div className="mt-12 rounded-xl border border-warning/20 bg-warning/5 p-6 max-w-lg mx-auto">
          <div className="flex items-start gap-4 text-left">
            <ShieldAlert className="h-6 w-6 text-warning flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-warning uppercase text-xs tracking-wider">Security Reminder</h4>
              <p className="mt-1 text-sm text-warning/80 leading-relaxed">
                If you followed a link from a third-party site that is now 404ing, the listing may have been flagged as suspicious and removed for community safety.
              </p>
            </div>
          </div>
        </div>
      </main>
      <BuyerFooter />
    </div>
  );
}
