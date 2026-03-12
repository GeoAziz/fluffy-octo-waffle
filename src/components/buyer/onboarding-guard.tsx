'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * OnboardingGuard - Enforces onboarding for first-time buyers
 * Redirects BUYER users who haven't completed onboarding (except when already on /onboarding)
 * 
 * Features:
 * - Real-time check of hasCompletedOnboarding flag
 * - Smooth redirect to /onboarding for new users
 * - Transparent passthrough for returning users
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile, loading } = useAuth();
  const [shouldShowContent, setShouldShowContent] = useState(true);

  useEffect(() => {
    if (loading) {
      setShouldShowContent(false);
      return;
    }

    // Don't redirect if not authenticated or not a buyer
    if (!userProfile || userProfile.role !== 'BUYER') {
      setShouldShowContent(true);
      return;
    }

    // If already on onboarding page, show content
    if (pathname === '/onboarding' || pathname?.includes('/onboarding')) {
      setShouldShowContent(true);
      return;
    }

    // If onboarding is not completed, redirect to onboarding page
    if (!userProfile.hasCompletedOnboarding) {
      setShouldShowContent(false);
      router.push('/onboarding');
      return;
    }

    // For already-onboarded buyers, show content
    setShouldShowContent(true);
  }, [userProfile, loading, pathname, router]);

  // Show loading state while checking auth
  if (loading || !shouldShowContent) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Initializing Protocol...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
