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
 */
export function SellerOnboardingWizard() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);

  const steps: SellerOnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Seller Workspace',
      subtitle: 'Ready to list your land?',
      description: 'You\'ve successfully established your identity vault. Let\'s get you started with creating your first listing and building buyer trust through documentation.',
      icon: <Briefcase className="h-16 w-16 text-primary" />,
      action: (
        <Button size="lg" onClick={() => setCurrentStep(1)} className="h-11 px-8 font-bold uppercase text-xs tracking-widest">
          Start Triage <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: 'features',
      title: 'Unlock Trust Signals',
      subtitle: 'Documentation is your asset',
      description: 'The key to success on Kenya Land Trust is the Badge Protocol. High-quality documentation attracts 4x more serious inquiries.',
      icon: <Shield className="h-16 w-16 text-accent" />,
      benefits: [
        'Bronze Badge: Basic documentation vaulted',
        'Silver Badge: Primary title deed verified',
        'Gold Badge: Full registry alignment complete',
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
      title: 'Initialize Your Registry',
      subtitle: 'Start with the essentials',
      description: 'Your first listing is the foundation of your seller presence. Our 4-step wizard will guide you through Identity, Specs, Triage, and Evidence.',
      icon: <FileText className="h-16 w-16 text-emerald-500" />,
      action: (
        <Button size="lg" asChild className="h-11 px-8 font-bold uppercase text-xs tracking-widest shadow-glow">
          <Link href="/listings/new">Provision First Listing <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      ),
    },
  ];

  const step = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  if (isSkipping) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Onboarding Protocol</p>
        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest">
          {currentStep + 1} of {steps.length}
        </Badge>
      </div>
      
      <Card className="border-none shadow-xl bg-gradient-to-br from-background to-muted/20 overflow-hidden">
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <CardHeader className="flex flex-row items-center gap-6 pb-6">
          <div className="flex-shrink-0 bg-white/50 p-4 rounded-2xl shadow-sm">{step.icon}</div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black uppercase tracking-tight">{step.title}</CardTitle>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{step.subtitle}</p>
          </div>
        </CardHeader>

        <CardContent className="pb-6">
          <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-2xl mb-6">
            {step.description}
          </p>

          {step.benefits && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {step.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl bg-background/50 border border-border/40">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-tight">{benefit}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            {step.action}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
