'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers';
import { Skeleton } from '@/components/ui/skeleton';
import { PageWrapper } from '@/components/page-wrapper';

/**
 * OnboardingPage - Guided post-signup experience strictly for Buyers.
 * Features auto-redirection for established users to prevent redundant cycles.
 */
export default function OnboardingPage() {
    const { userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // Redirection Protocol: If the user is already established, move them to the dashboard.
        if (!loading && userProfile && userProfile.bio) {
            router.replace('/buyer/dashboard');
        }
    }, [userProfile, loading, router]);

    if (loading) {
        return (
            <PageWrapper maxWidth="md">
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </PageWrapper>
        );
    }

    return (
        <PageWrapper maxWidth="md" padding="spacious">
            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-emerald-500" />
                <CardHeader className="text-center pt-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce-in">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter">Identity Verified</CardTitle>
                    <CardDescription className="text-base font-medium mt-2">
                        Welcome to the registry, {userProfile?.displayName?.split(' ')[0] || 'Member'}. Your secure buyer vault is ready.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-8 pb-12 pt-6">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center">
                            Buyer Initialization Protocol
                        </h3>
                        
                        <div className="grid gap-4">
                           <Link href="/profile" className="group flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/40 hover:border-primary/30 transition-all hover:shadow-md">
                                <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm uppercase tracking-tight">Complete Identity Node</h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Add your contact details and bio to build verified trust with land owners.</p>
                                </div>
                                <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                            </Link>

                            <Link href="/explore" className="group flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/40 hover:border-emerald-500/30 transition-all hover:shadow-md">
                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm uppercase tracking-tight">Enter Discovery Pulse</h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Browse the high-trust registry and filter listings by Gold, Silver, or Bronze signals.</p>
                                </div>
                                <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                            </Link>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-border/40 text-center">
                        <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                            <Link href="/buyer/dashboard">
                                <Home className="mr-2 h-3 w-3" />
                                Proceed to Buyer Dashboard
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
