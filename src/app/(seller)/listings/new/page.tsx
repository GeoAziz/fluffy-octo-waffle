'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage, FormControl } from '@/components/ui/form';
import { EnhancedInput } from '@/components/form/enhanced-input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronRight, ChevronLeft, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { FileDragAndDrop } from '@/components/file-drag-and-drop';
import { SellerPage } from '@/components/seller/seller-page';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const ListingLocationPicker = dynamic(() => import('@/components/listing-location-picker').then(mod => ({ default: mod.ListingLocationPicker })), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />,
});

const formSchema = z.object({
  title: z.string().min(5, 'Title is too short.').max(100),
  location: z.string().min(3, 'Location description is required.'),
  county: z.string().min(3, 'County signal is required.'),
  price: z.coerce.number().min(1000, 'Minimum price threshold not met.'),
  area: z.coerce.number().min(0.01, 'Invalid area metric.'),
  size: z.string().min(2, 'Dimensions required.'),
  landType: z.string().min(3, 'Category selection required.'),
  description: z.string().min(20, 'Narrative too brief for verification.'),
  images: z.custom<FileList>().refine(f => f?.length > 0, 'Visual proof required.'),
  evidence: z.custom<FileList>().optional(),
  latitude: z.coerce.number().refine(v => v !== 0, 'Coordinate triage required.'),
  longitude: z.coerce.number().refine(v => v !== 0, 'Coordinate triage required.'),
});

const DRAFT_KEY = 'seller:new-listing:draft:v3';
type ListingFormValues = z.infer<typeof formSchema>;

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<ListingFormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { title: '', location: '', county: '', price: 0, area: 0, size: '', landType: '', description: '', latitude: 0, longitude: 0 },
  });

  useEffect(() => {
    const draft = localStorage.getItem(DRAFT_KEY);
    if (draft) {
      try {
        form.reset({ ...form.getValues(), ...JSON.parse(draft) });
        toast({ title: 'Draft restored', description: 'Your unsaved progress has been recovered.' });
      } catch {}
    }
  }, [form, toast]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (form.formState.isDirty && !isSubmitting) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...form.getValues(), images: undefined, evidence: undefined }));
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [form, isSubmitting]);

  const onNext = async () => {
    const fields: Array<keyof ListingFormValues> = step === 1 ? ['title', 'location', 'county'] : step === 2 ? ['area', 'size', 'landType', 'price', 'description'] : step === 3 ? ['latitude', 'longitude'] : [];
    if (await form.trigger(fields)) setStep(s => s + 1);
  };

  async function onSubmit(values: ListingFormValues) {
    setIsSubmitting(true);
    setUploadProgress(10);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([k, v]) => {
        if (v instanceof FileList) Array.from(v).forEach(f => formData.append(k, f));
        else if (v != null) formData.append(k, String(v));
      });
      const res = await fetch('/api/listings', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const { id } = await res.json();
      localStorage.removeItem(DRAFT_KEY);
      
      toast({ 
        title: 'Listing Vaulted!', 
        description: 'Your property is now pending verification by the trust team.' 
      });
      
      router.push(`/listings/${id}`);
    } catch {
      setIsSubmitting(false);
      toast({ variant: 'destructive', title: 'Submission Failed', description: 'Could not transmit listing assets to the vault.' });
    }
  }

  const steps = [
    { id: 1, label: 'Identity' },
    { id: 2, label: 'Specs' },
    { id: 3, label: 'Triage' },
    { id: 4, label: 'Evidence' },
  ];

  return (
    <SellerPage title="Provision New Listing" description={`Protocol Stage ${step} of 4`}>
      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Elite Step Indicator */}
            <div className="relative mb-12 px-2">
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-muted -translate-y-1/2" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-primary transition-all duration-500 -translate-y-1/2" 
                style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
              />
              <div className="relative flex justify-between">
                {steps.map((s) => (
                  <div key={s.id} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "h-8 w-8 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 z-10",
                      step >= s.id ? "bg-primary border-primary text-white scale-110 shadow-lg" : "bg-background border-muted text-muted-foreground"
                    )}>
                      {step > s.id ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      step >= s.id ? "text-primary" : "text-muted-foreground"
                    )}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b bg-muted/10">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black uppercase tracking-tight">
                            {step === 1 && 'Core Identity'}
                            {step === 2 && 'Technical Specs'}
                            {step === 3 && 'Coordinate Triage'}
                            {step === 4 && 'Evidence Vaulting'}
                        </CardTitle>
                        <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                            {step === 1 && 'Establish the property&lsquo;s public profile'}
                            {step === 2 && 'Define pricing and physical dimensions'}
                            {step === 3 && 'Pinpoint exact geographic boundaries'}
                            {step === 4 && 'Upload restricted documentation proof'}
                        </CardDescription>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-10">
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <FormField name="title" render={({ field }) => (
                      <FormItem>
                        <EnhancedInput 
                          label="Registry Title" 
                          placeholder="e.g., 5-Acre Prime Agricultural Land" 
                          {...field} 
                          success={field.value.length >= 5} 
                        />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="location" render={({ field }) => <FormItem><EnhancedInput label="Neighborhood Node" placeholder="e.g., Isinya" {...field} /></FormItem>} />
                      <FormField name="county" render={({ field }) => <FormItem><EnhancedInput label="County Signal" placeholder="e.g., Kajiado" {...field} /></FormItem>} />
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="area" render={({ field }) => <FormItem><EnhancedInput type="number" label="Area Metric (Acres)" {...field} /></FormItem>} />
                      <FormField name="price" render={({ field }) => <FormItem><EnhancedInput type="number" label="Asking Value (Ksh)" {...field} /></FormItem>} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField name="size" render={({ field }) => <FormItem><EnhancedInput label="Physical Dimensions" placeholder='e.g. 50x100 ft' {...field} /></FormItem>} />
                      <FormField name="landType" render={({ field }) => <FormItem><EnhancedInput label="Registry Category" placeholder='e.g. Residential' {...field} /></FormItem>} />
                    </div>
                    <FormField name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest">Listing Narrative</FormLabel>
                        <FormControl><Textarea className="min-h-[150px] resize-none" placeholder="Provide a detailed factual overview..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                )}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <Alert className="bg-accent/5 border-accent/20">
                            <MapPin className="h-4 w-4 text-accent" />
                            <AlertTitle className="text-xs font-bold uppercase">Boundary Verification</AlertTitle>
                            <AlertDescription className="text-xs">
                                Drag the pin to the property&lsquo;s exact entry point. This coordinate is cross-checked against your survey map.
                            </AlertDescription>
                        </Alert>
                        <ListingLocationPicker />
                    </div>
                )}
                {step === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <Alert className="bg-emerald-50 border-emerald-200 text-emerald-900">
                        <ShieldCheck className="h-4 w-4" />
                        <AlertTitle className="text-xs font-bold uppercase">Evidence Standard</AlertTitle>
                        <AlertDescription className="text-xs font-medium">
                            To achieve a <strong>Trusted Signal (Gold)</strong> badge, please upload:
                            <ul className="mt-2 list-disc ml-4 space-y-1">
                                <li>Current Title Deed (Full scan)</li>
                                <li>Approved Survey Map</li>
                                <li>Seller ID & PIN Proof</li>
                            </ul>
                        </AlertDescription>
                    </Alert>
                    
                    <FileDragAndDrop 
                      name="images" 
                      label="Public Visual Assets" 
                      accept="image/*" 
                      multiple 
                      description="Minimum 3 high-resolution photos recommended." 
                    />
                    <div className="h-px bg-border/40" />
                    <FileDragAndDrop 
                      name="evidence" 
                      label="Restricted Documentation" 
                      multiple 
                      isEvidence 
                      description="PDF or high-res JPG scans. Max 10MB per file." 
                    />
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-muted/10 p-6">
                <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 1} className="h-12 font-bold uppercase text-[10px] tracking-widest">
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                
                {step < 4 ? (
                    <Button type="button" onClick={onNext} className="h-12 font-bold uppercase text-[10px] tracking-widest px-8 shadow-glow">
                        Continue <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button type="submit" disabled={isSubmitting} className="h-12 font-black uppercase text-[10px] tracking-widest px-10 shadow-glow bg-primary">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                        Transmit to Vault
                    </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </FormProvider>
      
      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md flex items-center justify-center">
            <div className="max-w-md w-full p-8 text-center space-y-6">
                <div className="relative mx-auto h-24 w-24">
                    <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary text-white">
                        <Loader2 className="h-10 w-10 animate-spin" />
                    </div>
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Vault Sync Active</h2>
                <p className="text-sm text-muted-foreground font-medium">Securing assets and initiating AI documentation triage. This may take up to 30 seconds for large files.</p>
                <Progress value={uploadProgress} className="h-2" />
            </div>
        </div>
      )}
    </SellerPage>
  );
}
