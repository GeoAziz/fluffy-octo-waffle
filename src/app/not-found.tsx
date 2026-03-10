import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileSearch, Home, ShieldAlert } from 'lucide-react';
import { BuyerHeader } from '@/components/buyer/buyer-header';
import { BuyerFooter } from '@/components/buyer/buyer-footer';

/**
 * RootNotFound - Accessible, high-trust 404 recovery experience.
 * Provides clear recovery paths while maintaining visual integrity.
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground" role="alert" aria-relevant="all">
      <BuyerHeader />
      <main id="main-content" className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="relative mb-10" aria-hidden="true">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/10 opacity-20" />
          <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-muted shadow-inner border border-border/40">
            <FileSearch className="h-14 w-12 text-muted-foreground" />
          </div>
        </div>
        
        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary md:text-6xl lg:text-7xl">
          Vault Record Missing
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The requested resource is not present in the property registry. It may have been moved or archived during a recent moderation sweep.
        </p>

        <nav className="mt-12 flex flex-col sm:flex-row gap-4 justify-center" aria-label="Error recovery actions">
          <Button asChild size="lg" className="font-black uppercase text-[11px] tracking-widest px-10 h-14 shadow-glow active:scale-[0.97]">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" aria-hidden="true" />
              Return Home
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-black uppercase text-[11px] tracking-widest px-10 h-14 border-border/60 hover:bg-accent/5 active:scale-[0.97]">
            <Link href="/explore">
              Browse Registry
            </Link>
          </Button>
        </nav>

        <section className="mt-16 rounded-2xl border border-warning/20 bg-warning/5 p-8 max-w-2xl mx-auto shadow-sm" aria-labelledby="security-reminder-title">
          <div className="flex items-start gap-5 text-left">
            <div className="p-3 rounded-xl bg-warning/10" aria-hidden="true">
              <ShieldAlert className="h-7 w-7 text-warning" />
            </div>
            <div>
              <h2 id="security-reminder-title" className="font-black text-warning uppercase text-sm tracking-widest">
                Security Protocol Reminder
              </h2>
              <p className="mt-2 text-sm text-warning/80 leading-relaxed font-medium">
                If you followed a link from a third-party site that is now broken, the listing may have been flagged as suspicious by our AI Trust Engine and removed for community safety. Avoid any off-platform transactions.
              </p>
            </div>
          </div>
        </section>
      </main>
      <BuyerFooter />
    </div>
  );
}
