'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, ChevronRight, ChevronLeft, ShieldCheck, WifiOff } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ToastAction } from '@/components/ui/toast';
import { FileDragAndDrop } from '@/components/file-drag-and-drop';
import { Label } from '@/components/ui/label';
import { SellerPage } from '@/components/seller/seller-page';
import { DetailedUploadProgress } from '@/components/detailed-upload-progress';
import { useNetworkStatus } from '@/components/resilience/network-status-provider';

const ListingLocationPicker = dynamic(() => import('@/components/listing-location-picker').then(mod => ({ default: mod.ListingLocationPicker })), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />,
});

const formSchema = z.object({
  title: z.string()
    .min(5, 'Title is too short (min 5 characters).')
    .max(100, 'Title is too long (max 100 characters).'),
  location: z.string().min(3, 'Please specify a neighborhood or town.'),
  county: z.string().min(3, 'County is required for regional filtering.'),
  price: z.coerce.number().min(1000, 'Price must be at least 1,000 Ksh.'),
  area: z.coerce.number().min(0.01, 'Area must be greater than 0.'),
  size: z.string().min(2, 'e.g. "50x100 ft" or "1 Acre"'),
  landType: z.string().min(3, 'e.g. "Residential" or "Agricultural"'),
  description: z.string().min(20, 'Please provide more detail (min 20 characters) to build buyer trust.'),
  images: z.custom<FileList>().refine(files => files && files.length > 0, 'At least one property photo is required for public view.'),
  evidence: z.custom<FileList>().optional(),
  latitude: z.coerce.number().refine(val => val !== 0, 'Please pin the property location on the map.'),
  longitude: z.coerce.number().refine(val => val !== 0, 'Please pin the property location on the map.'),
});

type FormSchemaType = z.infer<typeof formSchema>;
const stepFields: (keyof FormSchemaType)[][] = [
  ['title', 'location', 'county'],
  ['area', 'size', 'landType', 'price', 'description'],
  ['latitude', 'longitude'],
  ['images', 'evidence']
];

const NEW_LISTING_DRAFT_KEY = 'seller:new-listing:draft:v2';

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { isOnline } = useNetworkStatus();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulletPoints, setBulletPoints] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploadFinished, setIsUploadFinished] = useState(false);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      location: '',
      county: '',
      price: 0,
      area: 0,
      size: '',
      landType: '',
      description: '',
      latitude: 0,
      longitude: 0,
    },
  });

  const watchedValues = form.watch();

  const completeness = useMemo(() => {
    let completedFields = 0;
    const allFields = stepFields.flat();
    allFields.forEach(field => {
      const value = watchedValues[field];
      if (value instanceof FileList) {
        if (value.length > 0) completedFields++;
      } else if (typeof value === 'string') {
        if (value.trim()) completedFields++;
      } else if (typeof value === 'number') {
        if (value > 0) completedFields++;
      } else if (value) {
        completedFields++;
      }
    });
    return Math.round((completedFields / allFields.length) * 100);
  }, [watchedValues]);

  const totalUploadSize = useMemo(() => {
    let size = 0;
    if (watchedValues.images) Array.from(watchedValues.images).forEach(f => size += f.size);
    if (watchedValues.evidence) Array.from(watchedValues.evidence).forEach(f => size += f.size);
    return size;
  }, [watchedValues.images, watchedValues.evidence]);

  const totalFilesCount = (watchedValues.images?.length || 0) + (watchedValues.evidence?.length || 0);

  // Restore draft on mount
  useEffect(() => {
    const draftRaw = localStorage.getItem(NEW_LISTING_DRAFT_KEY);
    if (draftRaw) {
      try {
        const parsed = JSON.parse(draftRaw);
        form.reset({ ...form.getValues(), ...parsed });
        toast({ title: 'Draft restored', description: 'Recovered your unsaved progress.' });
      } catch {}
    }
  }, [form, toast]);

  // Save draft periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!form.formState.isDirty || isSubmitting) return;
      const values = form.getValues();
      const draftPayload = {
        ...values,
        images: undefined, // Cannot JSON stringify FileList
        evidence: undefined,
      };
      localStorage.setItem(NEW_LISTING_DRAFT_KEY, JSON.stringify(draftPayload));
    }, 3000);
    return () => clearInterval(interval);
  }, [form, isSubmitting]);

  const goToNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast({ 
        title: 'Validation Required', 
        description: 'Please fix the errors highlighted before continuing.', 
        variant: 'destructive' 
      });
    }
  };

  const goToPrevStep = () => {
    setCurrentStep(s => s - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateDescription = async () => {
    if (!bulletPoints) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide some key features.' });
      return;
    }
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-description', { method: 'POST', body: JSON.stringify({ bulletPoints }) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setGeneratedDescription(data.description);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'AI Error', description: e.message });
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: FormSchemaType) {
    if (!isOnline) {
      toast({
        variant: 'destructive',
        title: 'Network Required',
        description: 'You are currently offline. Listing creation requires an active vault connection.',
        action: <ToastAction altText="Try again" onClick={() => onSubmit(values)}>Retry</ToastAction>
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploadFinished(false);
    setUploadProgress(10);

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 90) return prev + Math.random() * 5;
        return prev;
      });
    }, 400);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof FileList) {
          Array.from(value).forEach(file => formData.append(key, file));
        } else if (value != null) {
          formData.append(key, String(value));
        }
      });
      
      const res = await fetch('/api/listings', { method: 'POST', body: formData });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to create listing');
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setIsUploadFinished(true);
      
      const { id } = await res.json();
      localStorage.removeItem(NEW_LISTING_DRAFT_KEY);
      
      toast({
        title: 'Listing Vaulted!',
        description: 'Property details and evidence secured for review.',
        action: <ToastAction altText="View" onClick={() => router.push(`/listings/${id}`)}>View</ToastAction>
      });
      
      setTimeout(() => router.push(`/listings/${id}`), 2000);

    } catch (error) {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setUploadProgress(0);
      
      const isNetworkError = !navigator.onLine || error instanceof TypeError;
      
      toast({ 
        variant: 'destructive', 
        title: isNetworkError ? 'Network Interrupted' : 'Submission Failed', 
        description: isNetworkError 
          ? 'Connection to the property vault was lost. Your progress is saved as a draft.' 
          : (error instanceof Error ? error.message : 'Could not create listing.'),
        action: isNetworkError ? <ToastAction altText="Retry" onClick={() => onSubmit(values)}>Retry Transmission</ToastAction> : undefined
      });
    }
  }

  return (
    <SellerPage title="Create New Listing" description={`Stage ${currentStep} of 4: ${['Core Identity', 'Specifications', 'Map Triage', 'Evidence Vault'][currentStep-1]}`}>
       <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {!isOnline && (
                <Card className="border-risk/40 bg-risk-light">
                  <CardContent className="p-4 flex items-center gap-3">
                    <WifiOff className="h-5 w-5 text-risk" />
                    <p className="text-xs font-bold text-risk uppercase tracking-tight">
                      You are offline. Data is being cached locally but cannot be transmitted to the vault.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30 border-b p-0">
                  <div className="h-1.5 w-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 ease-out" 
                      style={{ width: `${(currentStep / 4) * 100}%` }}
                    />
                  </div>
                  <div className="px-6 py-4 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verification Path</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Stage {currentStep} / 4</span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className={currentStep === 1 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}>
                    <div className="space-y-8">
                      <FormField name="title" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest">Property Title</FormLabel>
                          <Input placeholder="e.g., 5 Acres in Kitengela" {...field} className="h-12 text-lg font-bold" />
                          <FormMessage />
                        </FormItem>
                      )} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField name="location" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">General Location</FormLabel>
                            <Input placeholder="e.g., Isinya" {...field} className="h-11" />
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField name="county" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">County</FormLabel>
                            <Input placeholder="e.g., Kajiado County" {...field} className="h-11" />
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>
                  </div>

                  <div className={currentStep === 2 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField name="area" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Area (in Acres)</FormLabel>
                            <Input type="number" step="0.01" placeholder="e.g., 5" {...field} className="h-11" />
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField name="size" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Plot Dimensions</FormLabel>
                            <Input placeholder="e.g., 100x100 ft" {...field} className="h-11" />
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField name="landType" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Land Category</FormLabel>
                            <Input placeholder="e.g., Residential, Agricultural" {...field} className="h-11" />
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField name="price" render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest">Price (Ksh)</FormLabel>
                            <Input type="number" placeholder="e.g., 5500000" {...field} className="h-11 font-bold text-primary" />
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                      <Separator />
                      <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/5 p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="h-4 w-4 text-accent" />
                          <Label className="text-xs font-black uppercase tracking-widest text-accent">AI Narrative Generator</Label>
                        </div>
                        <Textarea placeholder="Enter key features as bullets...&#10;- Prime volcanic soil&#10;- Electricity nearby" value={bulletPoints} onChange={(e) => setBulletPoints(e.target.value)} className="min-h-[100px] border-accent/20 focus-visible:ring-accent/20" />
                        <Button type="button" variant="outline" onClick={handleGenerateDescription} disabled={isGenerating || !isOnline} className="w-full h-10 border-accent/40 text-accent font-bold uppercase text-[10px] tracking-widest">
                          {!isOnline ? <><WifiOff className="mr-2 h-3 w-3" />Requires Connection</> : isGenerating ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Synthesizing...</> : <><Sparkles className="mr-2 h-3 w-3" />Synthesize Narrative</>}
                        </Button>
                        {generatedDescription && <Card className="bg-background/80 border-accent/20 animate-in zoom-in-95 duration-300"><CardContent className="pt-4"><p className="text-xs italic leading-relaxed text-muted-foreground">"{generatedDescription}"</p></CardContent><CardFooter><Button type="button" size="sm" variant="ghost" className="text-accent font-bold text-[10px] uppercase tracking-widest" onClick={() => form.setValue('description', generatedDescription, { shouldValidate: true })}>Use AI Narrative</Button></CardFooter></Card>}
                      </div>
                      <FormField name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-widest">Full Listing Narrative</FormLabel>
                          <Textarea placeholder="Describe the potential, neighborhood access, and unique values..." className="min-h-[150px]" {...field} />
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className={currentStep === 3 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}>
                    <div className="space-y-6">
                      <FormField name="latitude" render={() => (
                        <FormItem>
                          <ListingLocationPicker />
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </div>

                  <div className={currentStep === 4 ? 'block animate-in fade-in slide-in-from-right-4 duration-500' : 'hidden'}>
                    <div className="space-y-10">
                       <FileDragAndDrop name="images" label="Public Property Showcase" description="The first image will be the primary hero photo. Landscape orientation preferred." accept="image/*" multiple />
                       <FileDragAndDrop name="evidence" label="Restricted Evidence Vault" description="Upload title deeds, survey maps, or ID documents. Shared ONLY with trust administrators." multiple isEvidence />
                       
                       {isSubmitting && (
                         <DetailedUploadProgress 
                            progress={Math.floor(uploadProgress)} 
                            filesCount={totalFilesCount} 
                            totalSize={totalUploadSize}
                            isComplete={isUploadFinished}
                         />
                       )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between bg-muted/10 border-t p-6">
                  <Button type="button" variant="outline" onClick={goToPrevStep} disabled={currentStep === 1 || isSubmitting} className="h-11 px-6 font-bold uppercase text-[10px] tracking-widest">
                    <ChevronLeft className="mr-2 h-4 w-4"/>Return
                  </Button>
                  {currentStep < 4 ? (
                    <Button type="button" onClick={goToNextStep} disabled={isSubmitting} className="h-11 px-8 font-bold uppercase text-[10px] tracking-widest">
                      Continue <ChevronRight className="ml-2 h-4 w-4"/>
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isSubmitting} variant="accent" className="h-11 px-10 font-black uppercase text-[10px] tracking-widest shadow-glow">
                      {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Transmitting Assets...</> : 'Commit Listing to Review'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </form>
          </Form>
        </FormProvider>

        <div className="space-y-6 lg:sticky lg:top-24 h-min">
          <Card className="border-none shadow-lg">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-black uppercase tracking-tight">Transmission Status</CardTitle><CardDescription className="text-xs">Data is locally cached as you type.</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Input Quality</span>
                  <span>{completeness}%</span>
                </div>
                <Progress value={completeness} className="h-1.5" />
              </div>
              <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5" /> Target Signal Logic
                </p>
                <ul className="space-y-2">
                  <li className="text-[11px] leading-tight font-medium text-foreground/80"><strong className="text-primary font-bold">Bronze:</strong> Title deed + Map pin.</li>
                  <li className="text-[11px] leading-tight font-medium text-foreground/80"><strong className="text-primary font-bold">Silver:</strong> Current survey + 3 Photos.</li>
                  <li className="text-[11px] leading-tight font-medium text-foreground/80"><strong className="text-primary font-bold">Gold:</strong> Identity verified + Full documentation pack.</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-background/50">
            <CardHeader className="pb-3"><CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Security Reminder</CardTitle></CardHeader>
            <CardContent>
              <p className="text-[11px] leading-relaxed text-muted-foreground font-medium italic">
                "Verified documentation is our #1 buyer search criteria. High-quality uploads increase conversion by 400%."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerPage>
  );
}
