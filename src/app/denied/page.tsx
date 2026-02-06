import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="h-24 w-24 text-destructive" />
      <h1 className="mt-8 text-4xl font-bold tracking-tight text-primary">
        Access Denied
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        You do not have permission to view this page.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
