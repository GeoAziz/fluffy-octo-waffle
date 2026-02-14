import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <ShieldAlert className="h-24 w-24 text-destructive" />
      <h1 className="mt-8 text-4xl font-bold tracking-tight text-primary">
        Access Denied
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-xl">
        You do not have permission to view this page with your current account.
      </p>
      <p className="mt-2 text-sm text-muted-foreground max-w-xl">
        If you believe this is an error, contact support and include the page you were trying to access.
      </p>
      <div className="mt-6 max-w-xl rounded-lg border bg-muted/30 p-4 text-left">
        <p className="text-sm font-semibold">Next steps</p>
        <ul className="mt-2 list-disc ml-5 space-y-1 text-sm text-muted-foreground">
          <li>Confirm you are signed in with the intended account.</li>
          <li>Return to the buyer dashboard and use allowed routes.</li>
          <li>Contact support with the blocked URL for access review.</li>
        </ul>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}
