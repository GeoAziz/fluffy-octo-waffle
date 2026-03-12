'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction } from '@/app/actions';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, MapPin, DollarSign, Home, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BuyerPage } from '@/components/buyer/buyer-page';

const KENYAN_COUNTIES = [
  'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Kajiado', 'Machakos', 'Kiambu',
  'Uasin Gishu', 'Kericho', 'Bungoma', 'Muranga', 'Nyeri', 'Laikipia', 'Nyanza',
  'Western', 'Rift Valley', 'Coastal', 'Central', 'Eastern', 'North Eastern'
];

const PROPERTY_TYPES = [
  'Residential',
  'Agricultural',
  'Commercial',
  'Industrial',
  'Mixed Use'
];

type OnboardingStep = 'welcome' | 'preferences' | 'budget' | 'complete';

export default function OnboardingPage() {
  const router = useRouter();
  const { userProfile, loading } = useAuth();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [selectedCounties, setSelectedCounties] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState('1000000');
  const [budgetMax, setBudgetMax] = useState('5000000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already onboarded or not a buyer, redirect
  useEffect(() => {
    if (!loading && (userProfile?.hasCompletedOnboarding || userProfile?.role !== 'BUYER')) {
      router.push('/');
    }
  }, [userProfile?.hasCompletedOnboarding, userProfile?.role, loading, router]);

  if (loading) {
    return (
      <BuyerPage>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </BuyerPage>
    );
  }

  const handleCountyToggle = (county: string) => {
    setSelectedCounties(prev =>
      prev.includes(county)
        ? prev.filter(c => c !== county)
        : [...prev, county]
    );
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleComplete = async () => {
    if (selectedCounties.length === 0) {
      toast({ variant: 'destructive', title: 'Please select at least one county' });
      return;
    }
    if (selectedTypes.length === 0) {
      toast({ variant: 'destructive', title: 'Please select at least one property type' });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('onboardingData', JSON.stringify({
        hasCompletedOnboarding: true,
        preferredCounties: selectedCounties,
        propertyPreferences: selectedTypes,
        budgetRange: {
          min: parseInt(budgetMin),
          max: parseInt(budgetMax)
        }
      }));

      await updateUserProfileAction(formData);
      setCurrentStep('complete');
      
      // Auto-redirect after 2 seconds
      setTimeout(() => router.push('/explore'), 2000);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error saving preferences', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StepIndicator = ({ step, title }: { step: OnboardingStep; title: string }) => (
    <div className="flex items-center gap-2">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
        currentStep === step || ['welcome', 'preferences', 'budget', 'complete'].indexOf(step) <= ['welcome', 'preferences', 'budget', 'complete'].indexOf(currentStep) ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        {['welcome', 'preferences', 'budget', 'complete'].indexOf(step) + 1}
      </div>
      <span className={cn(
        "text-sm font-medium",
        currentStep === step ? "text-primary" : "text-muted-foreground"
      )}>{title}</span>
    </div>
  );

  return (
    <BuyerPage>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Progress */}
          <div className="mb-12 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <StepIndicator step="welcome" title="Welcome" />
              <StepIndicator step="preferences" title="Preferences" />
              <StepIndicator step="budget" title="Budget" />
              <StepIndicator step="complete" title="Done" />
            </div>
            <div className="h-1 bg-border rounded-full overflow-hidden">
              <div className={cn(
                "h-full bg-gradient-to-r from-primary to-accent transition-all duration-500",
                currentStep === 'welcome' ? "w-[25%]" : 
                currentStep === 'preferences' ? "w-[50%]" :
                currentStep === 'budget' ? "w-[75%]" : "w-full"
              )} />
            </div>
          </div>

          {/* Welcome Step */}
          {currentStep === 'welcome' && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="text-center space-y-3">
                <div className="inline-flex p-3 bg-primary/10 rounded-full">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tight">Welcome to Kenya Land Trust</h1>
                <p className="text-lg text-muted-foreground">Let's set up your account to find the perfect property</p>
              </div>

              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-xl">
                <CardContent className="pt-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                        <MapPin className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Discover Verified Listings</h3>
                        <p className="text-sm text-muted-foreground">Browse hundreds of approved properties with trust badges</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                        <DollarSign className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Smart Filtering</h3>
                        <p className="text-sm text-muted-foreground">Find properties matching your exact budget and location</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="bg-primary/10 rounded-lg p-3 flex-shrink-0">
                        <Home className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold">Connect with Sellers</h3>
                        <p className="text-sm text-muted-foreground">Message sellers directly to ask questions about properties</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => setCurrentStep('preferences')}
                    size="lg"
                    className="w-full h-12 font-bold uppercase tracking-wider group"
                  >
                    Get Started
                    <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Preferences Step */}
          {currentStep === 'preferences' && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Choose Your Preferences</h2>
                <p className="text-muted-foreground">Which counties and property types interest you?</p>
              </div>

              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Preferred Counties
                  </CardTitle>
                  <CardDescription>Select one or more counties</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {KENYAN_COUNTIES.map(county => (
                      <button
                        key={county}
                        onClick={() => handleCountyToggle(county)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition-all text-sm font-medium",
                          selectedCounties.includes(county)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50 text-foreground"
                        )}
                      >
                        {county}
                      </button>
                    ))}
                  </div>
                  {selectedCounties.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedCounties.map(county => (
                        <Badge key={county} variant="secondary" className="px-3 py-1">
                          {county}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Property Types
                  </CardTitle>
                  <CardDescription>What type of property are you seeking?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {PROPERTY_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all">
                        <Checkbox
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => handleTypeToggle(type)}
                        />
                        <span className="font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('welcome')}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep('budget')}
                  className="flex-1 h-12 font-bold uppercase"
                >
                  Next
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Budget Step */}
          {currentStep === 'budget' && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tight">Your Budget</h2>
                <p className="text-muted-foreground">Set your price range to find matching listings</p>
              </div>

              <Card className="bg-card/50 backdrop-blur border-primary/20 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Price Range (KES)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Minimum</label>
                    <input
                      type="number"
                      value={budgetMin}
                      onChange={(e) => setBudgetMin(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      {parseInt(budgetMin).toLocaleString()} KES
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Maximum</label>
                    <input
                      type="number"
                      value={budgetMax}
                      onChange={(e) => setBudgetMax(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-border focus:border-primary focus:outline-none font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      {parseInt(budgetMax).toLocaleString()} KES
                    </p>
                  </div>

                  <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <p className="text-sm font-medium">Your range:</p>
                    <p className="text-lg font-bold text-primary">
                      {parseInt(budgetMin).toLocaleString()} - {parseInt(budgetMax).toLocaleString()} KES
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('preferences')}
                  className="flex-1 h-12"
                >
                  Back
                </Button>
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="flex-1 h-12 font-bold uppercase"
                >
                  {isSubmitting ? <Loader2 className="mr-2 w-4 h-4 animate-spin" /> : null}
                  Complete Setup
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500 text-center">
              <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-emerald-600" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight">All Set!</h1>
              <p className="text-lg text-muted-foreground">Your profile is ready. Let's find your perfect property.</p>
              <div className="text-sm text-muted-foreground">
                Redirecting to Browse Listings...
              </div>
            </div>
          )}
        </div>
      </div>
    </BuyerPage>
  );
}

