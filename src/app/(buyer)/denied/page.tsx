import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Home, Mail, LayoutDashboard } from 'lucide-react';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { getRoleAwareDashboardPath } from '@/lib/workspace-navigation';

interface DeniedPageProps {
  searchParams: Promise<{
    role?: string;
    required?: string;
    path?: string;
  }>;
}

/**
 * AccessDeniedPage - Context-aware authorization failure screen.
 * Displays specific reasons for access denial and provides role-aware
 * recovery links so each user type is guided back to their correct workspace.
 */
export default async function AccessDeniedPage({ searchParams }: DeniedPageProps) {
  const params = await searchParams;
  const role = params.role;
  const required = params.required;
  const path = params.path;

  const isRoleMismatch = !!(role && required);

  // Try to resolve the authenticated user's actual role for workspace link
  let workspacePath: string = '/';
  let workspaceLabel: string = 'Return to Home';
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (sessionCookie) {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
      const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
      const userRole = userDoc.exists ? userDoc.data()?.role : null;
      if (userRole) {
        workspacePath = getRoleAwareDashboardPath(userRole);
        workspaceLabel =
          userRole === 'ADMIN' ? 'Go to Admin Console' :
          userRole === 'SELLER' ? 'Go to Seller Workspace' :
          'Go to Buyer Dashboard';
      }
    }
  } catch {
    // Session cookie may be invalid or expired — silently fall back to the home link.
    // This is intentional: the denied page must always render, even without a valid session.
  }

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-4 animate-page-enter">
      <div className="relative mb-10">
        <div className="absolute inset-0 animate-ping rounded-full bg-risk/10 opacity-20" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-risk-light border border-risk/20 shadow-xl">
          <ShieldAlert className="h-12 w-12 text-risk" />
        </div>
      </div>

      <h1 className="text-4xl font-black uppercase tracking-tighter text-primary md:text-5xl">
        Access Restricted
      </h1>
      
      <div className="mt-6 max-w-xl space-y-4">
        <p className="text-lg text-muted-foreground font-medium leading-relaxed">
          {isRoleMismatch 
            ? `The requested protocol requires ${required} authorization. Your current identity is provisioned as ${role}.`
            : "You do not have the required permissions to access this secure registry sector."
          }
        </p>
        
        {path && (
          <div className="inline-block rounded-md bg-muted px-3 py-1 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest border">
            Node: {path}
          </div>
        )}
      </div>

      <div className="mt-10 max-w-lg rounded-2xl border border-border/40 bg-muted/30 p-8 text-left shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
          Identity Protocols
        </h2>
        <ul className="space-y-3 text-sm text-muted-foreground font-medium">
          <li className="flex items-start gap-3">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span>Confirm you are logged into the correct agent account for this workspace.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span>If you are a land owner, ensure your role has been upgraded to <strong>SELLER</strong> in Profile settings.</span>
          </li>
          <li className="flex items-start gap-3">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
            <span>Administrators must be provisioned with full registry clearance.</span>
          </li>
        </ul>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <Button asChild size="lg" className="h-14 px-8 font-black uppercase text-[11px] tracking-widest shadow-glow active:scale-95 transition-all">
          <Link href={workspacePath}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {workspaceLabel}
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-14 px-8 border-border/60 font-black uppercase text-[11px] tracking-widest hover:bg-muted active:scale-95 transition-all">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Return to Home
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-14 px-8 border-border/60 font-black uppercase text-[11px] tracking-widest hover:bg-accent/5 hover:text-accent transition-all active:scale-95">
          <Link href="/contact">
            <Mail className="mr-2 h-4 w-4" />
            Clearance Support
          </Link>
        </Button>
      </div>
      
      <p className="mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
        High-Trust Security Infrastructure • Protocol v1.4
      </p>
    </div>
  );
}
