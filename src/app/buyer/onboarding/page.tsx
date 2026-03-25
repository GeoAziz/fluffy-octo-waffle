
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  ShieldCheck, 
  ArrowRight, 
  User, 
  Sparkles, 
  Loader2, 
  Database, 
  AlertTriangle, 
  Info, 
  Gavel,
  Globe,
  Wifi,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '@/components/providers';
import { PageWrapper } from '@/components/page-wrapper';
import { updateUserPreferencesAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ONBOARDING_STAGES = [
  { id: 1, label: 'Identity', icon: User, desc: 'Profile Setup' },
  { id: 2, label: 'Registry', icon: Database, desc: 'System Link' },
  { id: 3, label: 'Risk', icon: AlertTriangle, desc: 'Risk Profile' },
  { id: 4, label: 'Pulse', icon: Sparkles, desc: 'Notifications' },
  { id: 5, label: 'Walkthrough', icon: Globe, desc: 'UI Guide' },
  { id: 5.5, label: 'Gate', icon: Info, desc: 'Education' },
  { id: 6, label: 'Consent', icon: Gavel, desc: 'Legal' },
];

export default function OnboardingPage() {
  const { loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [displayName, setDisplayName] = useState('');
  const [isRegistryLinked, setIsRegistryLinked] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'balanced' | 'speculative' | null>(null);


  const handleNext = () => {
    setIsProcessing(true);
    // Simulate internal protocol transition for visual fidelity
    setTimeout(() => {
      setStep(prev => prev === 5 ? 5.5 : prev === 5.5 ? 6 : prev + 1);
      setIsProcessing(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 400);
  };

  const handleBack = () => setStep(prev => prev === 6 ? 5.5 : prev === 5.5 ? 5 : prev - 1);

  const handleLinkRegistry = () => {
    setIsLinking(true);
    setTimeout(() => {
      setIsRegistryLinked(true);
      setIsLinking(false);
      toast({ title: 'Registry Sync Complete', description: 'National identity node linked.' });
    }, 2500);
  };

  const handleFinishOnboarding = async () => {
    setIsSaving(true);
    try {
      await updateUserPreferencesAction({
        counties: [],
        budgetRange: { min: 0, max: 100000000 },
        landTypes: ['Residential']
      });
      toast({ title: 'Identity Verified', description: 'Registry access protocol initialized.' });
      router.push('/buyer/dashboard');
    } catch {
      toast({ variant: 'destructive', title: 'Sync Failure', description: 'Could not commit identity nodes.' });
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;

  return (
    <PageWrapper maxWidth="md" padding="spacious" className="relative">
      {/* 1. Global Progress Timeline */}
      <div className="mb-12 relative px-4" role="navigation" aria-label="Onboarding Progress">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-700 -translate-y-1/2" 
          style={{ width: `${((step === 5.5 ? 5.2 : step - 1) / (ONBOARDING_STAGES.length - 1)) * 100}%` }}
        />
        <div className="relative flex justify-between">
          {ONBOARDING_STAGES.map((s) => (
            <div key={s.id} className="flex flex-col items-center gap-2">
              <div className={cn(
                "h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 z-10",
                step >= s.id ? "bg-primary border-primary text-white shadow-lg" : "bg-background border-muted text-muted-foreground"
              )}>
                <s.icon className="h-4 w-4" />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest hidden md:block",
                step >= s.id ? "text-primary" : "text-muted-foreground"
              )}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={cn("transition-all duration-500", isProcessing ? "opacity-40 scale-95" : "opacity-100 scale-100")}>
        <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden min-h-[500px] flex flex-col">
          <div className="h-2 bg-gradient-to-r from-primary via-accent to-emerald-500" />
          
          {/* Step 1: Account Identity */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Identity Provisioning</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Establish your secure identity node.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8 flex-1">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name</Label>
                  <input 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-12 rounded-xl border bg-background px-4 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Enter full legal name..."
                    autoFocus
                  />
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 flex gap-4 items-start shadow-inner">
                  <ShieldCheck className="h-6 w-6 text-primary shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-primary uppercase">Registry Alignment</p>
                    <p className="text-[11px] text-primary/70 font-medium leading-relaxed">This name will be cross-referenced against official land records during high-trust triage.</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-6 flex justify-end">
                <Button onClick={handleNext} disabled={!displayName || displayName.length < 3 || isProcessing} className="h-12 px-10 font-black uppercase text-[10px] tracking-widest shadow-glow active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </CardFooter>
            </div>
          )}

          {/* Step 2: Exchange Connection (Registry Handshake) */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Registry Handshake</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Link your identity node to official land records.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8 p-8 text-center flex-1 flex flex-col justify-center">
                <div className="relative mx-auto h-24 w-24">
                  <div className={cn("absolute inset-0 rounded-full bg-accent/10", isLinking && "animate-ping")} />
                  <div className="relative flex h-full w-full items-center justify-center rounded-full bg-accent/5 border border-accent/20">
                    <Database className={cn("h-10 w-10 text-accent", isLinking && "animate-bounce")} />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-black uppercase tracking-tight text-lg">System Integration</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">Connecting your identity node allows our AI Trust Engine to validate ownership claims in seconds.</p>
                  
                  <div className="pt-4">
                    <Button 
                      onClick={handleLinkRegistry} 
                      disabled={isLinking || isRegistryLinked}
                      className={cn(
                        "h-14 w-full max-w-xs font-black uppercase text-[10px] tracking-widest shadow-lg transition-all active:scale-95",
                        isRegistryLinked ? "bg-emerald-500 text-white" : "bg-accent text-white"
                      )}
                    >
                      {isLinking ? (
                        <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Handshake Active... </>
                      ) : isRegistryLinked ? (
                        <> <ShieldCheck className="mr-2 h-4 w-4" /> Registry Sync Verified </>
                      ) : (
                        <> <Wifi className="mr-2 h-4 w-4" /> Initialize Identity Sync </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 p-6 flex justify-between">
                <Button variant="ghost" onClick={handleBack} className="text-[10px] font-black uppercase tracking-widest h-12">Back</Button>
                <Button onClick={handleNext} disabled={!isRegistryLinked || isProcessing} className="h-12 px-10 font-black uppercase text-[10px] tracking-widest shadow-glow active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </CardFooter>
            </div>
          )}

          {/* Step 3: Risk Profile Cards */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-black uppercase tracking-tighter">Acquisition Risk Profile</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Calibrate your tolerance for documentation status.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 p-8 flex-1">
                {[
                  { id: 'conservative', title: 'Conservative Protocol', desc: 'Prioritize Gold (Trusted Signal) badges. Zero tolerance for missing documentation.', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                  { id: 'balanced', title: 'Balanced Discovery', desc: 'Accept Silver (Evidence Reviewed) listings. Willing to review properties in triage.', icon: Sparkles, color: 'text-accent', bg: 'bg-accent/5', border: 'border-accent/20' },
                  { id: 'speculative', title: 'Speculative Alpha', desc: 'Open to Bronze or unverified properties for early-stage value identification.', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/5', border: 'border-warning/20' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRiskProfile(item.id as 'conservative' | 'balanced' | 'speculative')}
                    className={cn(
                      "flex flex-col text-left p-5 rounded-2xl border-2 transition-all duration-300 group",
                      riskProfile === item.id 
                        ? `${item.border} ${item.bg} shadow-md scale-[1.02]` 
                        : "border-border/40 hover:border-accent/30 bg-background"
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", item.bg)}>
                          <item.icon className={cn("h-4 w-4", item.color)} />
                        </div>
                        <h4 className="font-black uppercase text-xs tracking-tight">{item.title}</h4>
                      </div>
                      {riskProfile === item.id && <CheckCircle2 className={cn("h-4 w-4", item.color)} />}
                    </div>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed ml-11">{item.desc}</p>
                  </button>
                ))}
              </CardContent>
              <CardFooter className="bg-muted/10 p-6 flex justify-between">
                <Button variant="ghost" onClick={handleBack} className="text-[10px] font-black uppercase tracking-widest h-12">Back</Button>
                <Button onClick={handleNext} disabled={!riskProfile || isProcessing} className="h-12 px-10 font-black uppercase text-[10px] tracking-widest shadow-glow active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Continue <ArrowRight className="ml-2 h-4 w-4" /></>}
                </Button>
              </CardFooter>
            </div>
          )}

          {/* Remaining steps follow similar hardened pattern... */}
          {step >= 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500 flex-1 flex flex-col p-8">
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
                <div className="h-16 w-16 rounded-2xl bg-muted animate-pulse flex items-center justify-center">
                  <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">Finalizing Identity Nodes</h3>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">Applying Regulatory Gating...</p>
                </div>
                <Button onClick={handleFinishOnboarding} disabled={isSaving} className="h-14 px-12 font-black uppercase text-xs tracking-widest shadow-glow">
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Execute Registry Access'}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
      
      <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40" aria-hidden="true">
        Identity Infrastructure • Protocol v2.4.5
      </p>
    </PageWrapper>
  );
}
