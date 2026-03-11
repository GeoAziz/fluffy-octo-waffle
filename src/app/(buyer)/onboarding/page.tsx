'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, ListPlus, ShieldCheck, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/providers';
import { Skeleton } from '@/components/ui/skeleton';
import { PageWrapper } from '@/components/page-wrapper';

export default function OnboardingPage() {
    const { userProfile, loading } = useAuth();

    if (loading) {
        return (
            <PageWrapper maxWidth="md">
                <Skeleton className="h-[500px] w-full rounded-2xl" />
            </PageWrapper>
        );
    }

    const isSeller = userProfile?.role === 'SELLER';
    const isAdmin = userProfile?.role === 'ADMIN';

    return (
        <PageWrapper maxWidth="md" padding="spacious">
            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-accent to-emerald-500" />
                <CardHeader className="text-center pt-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-bounce-in">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter">Identity Verified</CardTitle>
                    <CardDescription className="text-base font-medium mt-2">
                        Welcome to the registry, {userProfile?.displayName?.split(' ')[0] || 'Member'}. Your secure vault is ready.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-8 pb-12 pt-6">
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center">
                            Protocol Initialization: {isSeller ? 'Seller' : 'Buyer'} Path
                        </h3>
                        
                        <div className="grid gap-4">
                           <Link href="/profile" className="group flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/40 hover:border-primary/30 transition-all hover:shadow-md">
                                <div className="p-3 rounded-xl bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm uppercase tracking-tight">Finalize Profile Protocol</h4>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Add your contact nodes and bio to build verified trust.</p>
                                </div>
                                <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                            </Link>

                             {(isSeller || isAdmin) && (
                                <Link href="/listings/new" className="group flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/40 hover:border-accent/30 transition-all hover:shadow-md">
                                    <div className="p-3 rounded-xl bg-accent/5 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                        <ListPlus className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm uppercase tracking-tight">Vault Your First Property</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Ready to sell? Transmit your first listing to the moderation team.</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                </Link>
                            )}

                            {!isSeller && (
                                <Link href="/explore" className="group flex items-start gap-4 p-5 rounded-2xl bg-background border border-border/40 hover:border-emerald-500/30 transition-all hover:shadow-md">
                                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm uppercase tracking-tight">Enter Discovery Pulse</h4>
                                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Browse the high-trust registry and find verified land opportunities.</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0" />
                                </Link>
                            )}
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-border/40 text-center">
                        <Button asChild variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
                            <Link href={isSeller ? "/dashboard" : "/buyer/dashboard"}>
                                <Home className="mr-2 h-3 w-3" />
                                Go to {isSeller ? 'Seller' : 'Buyer'} Dashboard
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </PageWrapper>
    );
}
