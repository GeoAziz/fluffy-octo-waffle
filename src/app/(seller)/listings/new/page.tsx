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
import { Loader2, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ToastAction } from '@/components/ui/toast';
import { FileDragAndDrop } from '@/components/file-drag-and-drop';
import { Label } from '@/components/ui/label';
import { SellerPage } from '@/components/seller/seller-page';

const ListingLocationPicker = dynamic(() => import('@/components/listing-location-picker').then(mod => ({ default: mod.ListingLocationPicker })), {
  ssr: false,
  loading: () => <div className="h-96 bg-muted animate-pulse rounded-lg" />,
});

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  location: z.string().min(3, 'Location must be at least 3 characters.'),
  county: z.string().min(3, 'County must be at least 3 characters.'),
  price: z.coerce.number().min(1, 'Price must be a positive number.'),
  area: z.coerce.number().min(0.01, 'Area must be a positive number.'),
  size: z.string().min(2, 'Size must be at least 2 characters (e.g., "50x100").'),
  landType: z.string().min(3, 'Land type must be at least 3 characters (e.g., "Residential").'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  images: z.custom<FileList>().refine(files => files && files.length > 0, 'At least one property image is required.'),
  evidence: z.custom<FileList>().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

type FormSchemaType = z.infer<typeof formSchema>;
const stepFields: (keyof FormSchemaType)[][] = [
  ['title', 'location', 'county'],
  ['area', 'size', 'landType', 'price', 'description'],
  ['latitude', 'longitude'],
  ['images', 'evidence']
];

const NEW_LISTING_DRAFT_KEY = 'seller:new-listing:draft:v1';

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulletPoints, setBulletPoints] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      location: '',
      county: '',
      price: 0,
      area: 0,
      size: '',
      landType: '',
      description: '',
      latitude: 0.0236, // Default to central Kenya
      longitude: 37.9062,
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

  useEffect(() => {
    const draftRaw = localStorage.getItem(NEW_LISTING_DRAFT_KEY);
    if (draftRaw) {
      try {
        const parsed = JSON.parse(draftRaw);
        form.reset({ ...form.getValues(), ...parsed });
        toast({ title: 'Draft restored', description: 'Recovered unsaved progress.' });
      } catch {}
    }
  }, [form, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!form.formState.isDirty || isSubmitting) return;
      localStorage.setItem(NEW_LISTING_DRAFT_KEY, JSON.stringify(form.getValues()));
    }, 2000);
    return () => clearInterval(interval);
  }, [form, isSubmitting]);

  const goToNextStep = async () => {
    const fieldsToValidate = stepFields[currentStep - 1];
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(s => s + 1);
    } else {
      toast({ title: 'Please fix the errors on this step before continuing.', variant: 'destructive' });
    }
  };

  const goToPrevStep = () => setCurrentStep(s => s - 1);

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
    setIsSubmitting(true);
    setUploadProgress(10); // Initial progress

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value instanceof FileList) {
          Array.from(value).forEach(file => formData.append(key, file));
        } else if (value != null) {
          formData.append(key, String(value));
        }
      });
      
      setUploadProgress(30);

      const res = await fetch('/api/listings', { method: 'POST', body: formData });
      
      setUploadProgress(80);

      if (!res.ok) throw new Error((await res.json()).error || 'Failed to create listing');
      
      const { id } = await res.json();
      setUploadProgress(100);
      localStorage.removeItem(NEW_LISTING_DRAFT_KEY);
      
      toast({
        title: 'Listing Submitted!',
        description: 'Your property is now pending review.',
        action: <ToastAction altText="View" onClick={() => router.push(`/listings/${id}`)}>View</ToastAction>
      });
      setTimeout(() => router.push(`/listings/${id}`), 1000);

    } catch (error) {
      setIsSubmitting(false);
      setUploadProgress(0);
      toast({ variant: 'destructive', title: 'Submission Failed', description: error instanceof Error ? error.message : 'Could not create listing.' });
    }
  }

  return (
    <SellerPage title="Create New Listing" description={`Step ${currentStep} of 4: ${['Details', 'Specifications', 'Location', 'Documents'][currentStep-1]}`}>
       <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <FormProvider {...form}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Card>
                <CardHeader>
                  <Progress value={(currentStep / 4) * 100} className="h-2" />
                </CardHeader>
                <CardContent>
                  <div className={currentStep === 1 ? 'block' : 'hidden'}>
                    <div className="space-y-8">
                      <FormField name="title" render={({ field }) => <FormItem><FormLabel>Property Title</FormLabel><Input placeholder="e.g., 5 Acres in Kitengela" {...field} /><FormMessage /></FormItem>} />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField name="location" render={({ field }) => <FormItem><FormLabel>General Location</FormLabel><Input placeholder="e.g., Isinya" {...field} /><FormMessage /></FormItem>} />
                        <FormField name="county" render={({ field }) => <FormItem><FormLabel>County</FormLabel><Input placeholder="e.g., Kajiado County" {...field} /><FormMessage /></FormItem>} />
                      </div>
                    </div>
                  </div>

                  <div className={currentStep === 2 ? 'block' : 'hidden'}>
                    <div className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField name="area" render={({ field }) => <FormItem><FormLabel>Area (in Acres)</FormLabel><Input type="number" placeholder="e.g., 5" {...field} /><FormMessage /></FormItem>} />
                        <FormField name="size" render={({ field }) => <FormItem><FormLabel>Plot Dimensions</FormLabel><Input placeholder="e.g., 100x100 ft" {...field} /><FormMessage /></FormItem>} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <FormField name="landType" render={({ field }) => <FormItem><FormLabel>Land Type</FormLabel><Input placeholder="e.g., Residential, Agricultural" {...field} /><FormMessage /></FormItem>} />
                        <FormField name="price" render={({ field }) => <FormItem><FormLabel>Price (Ksh)</FormLabel><Input type="number" placeholder="e.g., 5500000" {...field} /><FormMessage /></FormItem>} />
                      </div>
                      <Separator />
                      <div className="space-y-4">
                        <Label>Generate Description with AI</Label>
                        <Textarea placeholder="Key features...&#10;- 5 acres prime land&#10;- Ready title deed" value={bulletPoints} onChange={(e) => setBulletPoints(e.target.value)} />
                        <Button type="button" variant="outline" onClick={handleGenerateDescription} disabled={isGenerating}>{isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Generate</Button>
                        {generatedDescription && <Card className="bg-secondary/50"><CardContent className="pt-4"><p className="text-sm">{generatedDescription}</p></CardContent><CardFooter><Button type="button" size="sm" onClick={() => form.setValue('description', generatedDescription, { shouldValidate: true })}>Use this</Button></CardFooter></Card>}
                      </div>
                      <FormField name="description" render={({ field }) => <FormItem><FormLabel>Property Description</FormLabel><Textarea placeholder="Detailed description..." className="min-h-[150px]" {...field} /><FormMessage /></FormItem>} />
                    </div>
                  </div>

                  <div className={currentStep === 3 ? 'block' : 'hidden'}>
                    <ListingLocationPicker />
                  </div>

                  <div className={currentStep === 4 ? 'block' : 'hidden'}>
                    <div className="space-y-8">
                       <FileDragAndDrop name="images" label="Property Images" description="The first image will be the main photo. You can upload multiple images." accept="image/*" multiple />
                       <FileDragAndDrop name="evidence" label="Evidence Documents" description="Upload title deed, survey maps, etc. (images or PDFs)." multiple />
                       {isSubmitting && <div className="space-y-2"><Label>Submitting...</Label><Progress value={uploadProgress} /><p className="text-xs text-muted-foreground">Uploading files and running analysis...</p></div>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goToPrevStep} disabled={currentStep === 1 || isSubmitting}><ChevronLeft className="mr-2 h-4 w-4"/>Back</Button>
                  {currentStep < 4 ? <Button type="button" variant="outline" onClick={goToNextStep} disabled={isSubmitting}>Next<ChevronRight className="ml-2 h-4 w-4"/></Button> : null}
                  {currentStep === 4 ? <Button type="submit" disabled={isSubmitting} variant="accent" className="font-semibold">{isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : 'Submit for Review'}</Button> : null}
                </CardFooter>
              </Card>
            </form>
          </Form>
        </FormProvider>
        <Card className="h-min lg:sticky lg:top-24">
          <CardHeader><CardTitle>Listing Progress</CardTitle><CardDescription>Autosaved locally.</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <Progress value={completeness} />
            <p className="text-sm text-muted-foreground">{completeness}% complete</p>
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              <p className="font-semibold">Badge target guidance</p>
              <ul className="mt-2 list-disc ml-5 space-y-1 text-muted-foreground">
                <li><strong>Bronze:</strong> title deed + basic location.</li>
                <li><strong>Silver:</strong> add survey + clear photos.</li>
                <li><strong>Gold:</strong> all documents match + high-quality evidence.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerPage>
  );
}
