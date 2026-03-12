'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  FileText,
  MessageSquare,
  BarChart3,
  ArrowRight,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Shield,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SellerOnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  action: React.ReactNode;
  benefits?: string[];
}

/**
 * SellerOnboardingWizard - First-time seller onboarding flow
 * Guides new sellers through platform features, listing setup, and success tips
 * 
 * Features:
 * - 5-step guided flow (Welcome → Features → First Listing → Evidence → Complete)
 * - Visual progress tracking
 * - Feature highlights with benefits
 * - Direct links to actionable next steps
 * - Hypercraft styling with animations
 */
export function SellerOnboardingWizard() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);

  // Only show for users who just became sellers
  useEffect(() => {
    if (!userProfile?.enabledForSelling) {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  const steps: SellerOnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Seller Workspace',
      subtitle: 'Ready to list your land?',
      description: 'You\'ve successfully upgraded to a seller account. Let\'s get you started with creating your first listing and connecting with buyers.',
      icon: <Briefcase className="h-16 w-16 text-primary" />,
      action: (
        <Button size="lg" onClick={() => setCurrentStep(1)} className="h-11 px-8 font-bold uppercase text-xs tracking-widest">
          Get Started <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: 'features',
      title: 'Explore Your Tools',
      subtitle: 'Powerful features await',
      description: 'As a seller, you have access to tools designed to showcase your properties and reach qualified buyers.',
      icon: <TrendingUp className="h-16 w-16 text-accent" />,
      benefits: [
        'Create and manage multiple listings with detailed descriptions',
        'Upload evidence documents (title deeds, survey maps) for buyer confidence',
        'Message buyers directly and respond to inquiries instantly',
        'View analytics on listing views, inquiries, and buyer engagement',
        'Build your seller reputation with trust badges',
      ],
      action: (
        <div className="flex gap-2">
          <Button size="lg" onClick={() => setCurrentStep(2)} className="h-11 px-6 font-bold uppercase text-xs tracking-widest">
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={() => setIsSkipping(true)} className="h-11 px-6 font-bold uppercase text-xs tracking-widest">
            Skip Tour
          </Button>
        </div>
      ),
    },
    {
      id: 'listing',
      title: 'Create Your First Listing',
      subtitle: 'Start with the essentials',
      description: 'Your first listing is the foundation of your seller presence. Add details, photos, and location to attract interested buyers.',
      icon: <FileText className="h-16 w-16 text-emerald-500" />,
      benefits: [
        'Set title, location, and price details',
        'Add photos and description of your property',
        'Specify land type, size, and other features',
        'Set your asking price competitively',
        'Submit for admin review and approval',
      ],
      action: (
        <div className="flex gap-2">
          <Button size="lg" asChild className="h-11 px-6 font-bold uppercase text-xs tracking-widest">
            <Link href="/listings/new">Create Listing <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" onClick={() => setCurrentStep(3)} className="h-11 px-6 font-bold uppercase text-xs tracking-widest">
            Next
          </Button>
        </div>
      ),
    },
    {
      id: 'evidence',
      title: 'Upload Evidence Documents',
      subtitle: 'Build buyer trust',
      description: 'Evidence documents like title deeds and survey maps significantly increase buyer confidence and listing visibility.',
      icon: <Shield className="h-16 w-16 text-blue-500" />,
      benefits: [
        'Upload title deeds to prove ownership',
        'Add survey maps for boundary clarity',
        'Include ID documents for verification',
        'Get trust badges based on document quality',
        'Increase listing visibility in searches',
      ],
      action: (
        <div className="flex gap-2">
          <Button size="lg" variant="outline" onClick={() => setCurrentStep(4)} className="h-11 px-6 font-bold uppercase text-xs tracking-widest">
            Next Step <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="ghost" onClick={() => setIsSkipping(true)} className="h-11 px-6 font-bold uppercase text-xs tracking-widest">
            Skip
          </Button>
        </div>
      ),
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      subtitle: 'Your journey begins',
      description: 'Congratulations! You\'re ready to start connecting with buyers. Monitor your messages, respond to inquiries, and manage your listings from the dashboard.',
      icon: <CheckCircle2 className="h-16 w-16 text-emerald-500 animate-pulse" />,
      benefits: [
        'Check your dashboard regularly for new inquiries',
        'Respond to buyer messages within 24 hours for better ratings',
        'Update listings as properties sell or become unavailable',
        'Track your seller rating and performance metrics',
        'Adjust prices or add details to improve visibility',
      ],
      action: (
        <Button
          size="lg"
          asChild
          className="h-11 px-8 font-bold uppercase text-xs tracking-widest shadow-glow"
        >
          <Link href="/dashboard">Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      ),
    },
  ];

  const step = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  if (isSkipping) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12 md:py-24">
        <Card className="border-none shadow-xl bg-gradient-to-br from-accent/10 to-primary/5">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <Clock className="h-16 w-16 text-accent mb-6" />
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Tutorial Skipped</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-md">
              No problem! You can explore the features at your own pace or visit these resources anytime.
            </p>
            <div className="flex flex-col gap-2 w-full">
              <Button size="lg" asChild className="h-11 font-bold uppercase text-xs tracking-widest">
                <Link href="/listings/new">Create Your First Listing</Link>
              </Button>
              <Button size="lg" asChild variant="outline" className="h-11 font-bold uppercase text-xs tracking-widest">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 md:py-24">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Seller Onboarding</p>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">
              {step.title}
            </h1>
            <p className="text-lg text-muted-foreground mt-2">{step.subtitle}</p>
          </div>
          <Badge variant="secondary" className="text-xs font-black uppercase tracking-widest flex-shrink-0">
            {currentStep + 1} of {steps.length}
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted" />
      </div>

      {/* Step Display */}
      <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20 animate-in fade-in slide-in-from-bottom-4">
        <CardHeader className="flex flex-row items-start gap-6 pb-6">
          <div className="flex-shrink-0">{step.icon}</div>
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>
        </CardHeader>

        {step.benefits && (
          <CardContent className="pb-6 border-t border-border/30 pt-6">
            <div className="space-y-3">
              {step.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm font-medium leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {/* Action Buttons */}
        <CardContent className="flex justify-between items-center pt-6 border-t border-border/30">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="h-11 px-6 font-bold uppercase text-xs tracking-widest"
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {step.action}
          </div>
        </CardContent>
      </Card>

      {/* Helpful Tips */}
      <Alert className="mt-8 border-accent/30 bg-accent/5">
        <AlertCircle className="h-4 w-4 text-accent" />
        <AlertDescription className="text-xs font-medium text-muted-foreground mt-2">
          💡 <strong>Pro Tip:</strong> Quality photos and complete evidence documents significantly increase your chances of getting a trust badge and attracting serious buyers.
        </AlertDescription>
      </Alert>
    </div>
  );
}
