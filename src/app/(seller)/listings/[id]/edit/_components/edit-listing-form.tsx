'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { editListingAction, generateDescriptionAction } from '@/app/actions';
import { Loader2, Sparkles, FileText, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ToastAction } from '@/components/ui/toast';
import type { Listing } from '@/lib/types';
import Image from 'next/image';
import { ListingLocationPicker } from '@/components/listing-location-picker';
import { FileDragAndDrop } from '@/components/file-drag-and-drop';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EnhancedInput } from '@/components/form/enhanced-input';

const formSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters.')
    .max(100, 'Title cannot exceed 100 characters.'),
  location: z.string().min(3, 'Please specify the neighborhood or town.'),
  county: z.string().min(3, 'County is required.'),
  price: z.coerce.number().min(1000, 'Price must be at least 1,000 Ksh.'),
  area: z.coerce.number().min(0.01, 'Area must be greater than 0.'),
  size: z.string().min(2, 'e.g. "50x100 ft"'),
  landType: z.string().min(3, 'e.g. "Residential"'),
  description: z.string().min(20, 'Please provide more detail (min 20 characters) to help buyers.'),
  images: z.custom<FileList>().optional(),
  evidence: z.custom<FileList>().optional(),
  latitude: z.coerce.number().refine(val => val !== 0, 'Please select a location on the map.'),
  longitude: z.coerce.number().refine(val => val !== 0, 'Please select a location on the map.'),
});

export function EditListingForm({ listing }: { listing: Listing }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [bulletPoints, setBulletPoints] = useState('');
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const draftKey = `seller:edit-listing:draft:${listing.id}`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: listing.title,
      location: listing.location,
      county: listing.county,
      price: listing.price,
      area: listing.area,
      size: listing.size,
      landType: listing.landType,
      description: listing.description,
      latitude: listing.latitude,
      longitude: listing.longitude,
    },
  });

  const watchedValues = form.watch();

  const completeness = useMemo(() => {
    const checks = [
      Boolean(watchedValues.title?.trim()),
      Boolean(watchedValues.location?.trim()),
      Boolean(watchedValues.county?.trim()),
      Number(watchedValues.price) > 0,
      Number(watchedValues.area) > 0,
      Boolean(watchedValues.landType?.trim()),
      Boolean(watchedValues.description?.trim() && watchedValues.description.trim().length >= 20),
      Number(watchedValues.latitude) !== 0 || Number(watchedValues.longitude) !== 0,
    ];
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / checks.length) * 100);
  }, [watchedValues]);

  useEffect(() => {
    const draftRaw = localStorage.getItem(draftKey);
    if (!draftRaw) return;
    try {
      const parsed = JSON.parse(draftRaw);
      form.reset({ ...form.getValues(), ...parsed });
      toast({ title: 'Draft restored', description: 'Recovered your unsaved listing edits.' });
    } catch {
      // ignore invalid draft
    }
  }, [draftKey, form, toast]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!form.formState.isDirty || isSubmitting) return;
      const values = form.getValues();
      const draftPayload = {
        ...values,
        images: undefined,
        evidence: undefined,
      };
      localStorage.setItem(draftKey, JSON.stringify(draftPayload));
    }, 3000);
    return () => clearInterval(interval);
  }, [draftKey, form, isSubmitting]);

  const handleGenerateDescription = async () => {
    if (!bulletPoints) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please provide some key features.' });
        return;
    }
    setIsGenerating(true);
    setGeneratedDescription('');
    try {
        const result = await generateDescriptionAction(bulletPoints);
        setGeneratedDescription(result.description);
        toast({ title: 'Narrative Generated', description: 'Review or apply the AI description below.' });
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'AI Protocol Failure', description: e.message });
    } finally {
        setIsGenerating(false);
    }
  }

  const useGeneratedDescription = () => {
    if (generatedDescription) {
        form.setValue('description', generatedDescription, { shouldValidate: true, shouldDirty: true });
        setGeneratedDescription('');
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
          if (value instanceof FileList) {
              Array.from(value).forEach(file => formData.append(key, file));
          } else if (value !== undefined && value !== null) {
              formData.append(key, String(value));
          }
      });
      
      const { id } = await editListingAction(listing.id, formData);
      localStorage.removeItem(draftKey);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: 'Listing Re-Vaulted!',
        description: 'Changes secured. Listing reset to pending status for trust triage.',
        action: <ToastAction altText="View" onClick={() => router.push(`/listings/${id}`)}>View Vault</ToastAction>
      });

      setTimeout(() => {
        router.push(`/listings/${id}`);
        router.refresh();
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setUploadProgress(0);
      toast({
        variant: 'destructive',
        title: 'Transmission Failed',
        description: error instanceof Error ? error.message : 'Could not commit changes to the vault.',
      });
    }
  }

  return (
    <div className="space-y-8">
      {listing.status === 'rejected' && (
        <Alert variant="destructive" className="bg-risk-light border-risk/20 animate-shake">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-sm font-black uppercase tracking-tight">Listing Rejected: Correction Required</AlertTitle>
          <AlertDescription className="mt-2 text-xs font-medium leading-relaxed">
            <strong>Admin Pulse:</strong> "{listing.rejectionReason || 'Documentation inconsistencies detected. Please verify your title deed scan matches the location coordinates.'}"
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-none shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="h-1.5 bg-accent/40 w-full" />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Registry Modification</CardTitle>
                <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                    Signficant changes will reset your current trust signal status.
                </CardDescription>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Completeness</p>
                <p className="text-xl font-black text-accent">{completeness}%</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <EnhancedInput label="Registry Title" {...field} className="h-12 font-bold" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <EnhancedInput label="Neighborhood Node" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="county"
                    render={({ field }) => (
                      <FormItem>
                        <EnhancedInput label="County Signal" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <EnhancedInput type="number" step="0.01" label="Area Metric (Acres)" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <EnhancedInput label="Physical Dimensions" {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                <div className="space-y-4 rounded-2xl border border-accent/20 bg-accent/5 p-6 backdrop-blur-sm">
                   <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-accent" />
                      <Label className="text-[10px] font-black uppercase tracking-widest text-accent">AI Content Synthesis</Label>
                   </div>
                   <Textarea 
                      placeholder="Enter raw features (e.g., Near bypass, Red soil, Gated)..."
                      className="min-h-[100px] border-accent/20 bg-background/50 resize-none"
                      value={bulletPoints}
                      onChange={(e) => setBulletPoints(e.target.value)}
                   />
                   <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating} className="h-10 border-accent/40 text-accent font-black uppercase text-[10px] tracking-widest px-6 shadow-sm">
                      {isGenerating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
                      Regenerate Narrative Pulse
                   </Button>
                   {generatedDescription && (
                      <Card className="bg-background border-accent/20 shadow-lg animate-in slide-in-from-bottom-2">
                          <CardContent className="pt-4">
                              <p className="text-xs italic leading-relaxed text-muted-foreground font-medium">"{generatedDescription}"</p>
                          </CardContent>
                          <CardFooter>
                              <Button type="button" size="sm" className="bg-accent text-white font-black text-[10px] uppercase tracking-widest px-6" onClick={useGeneratedDescription}>Apply to Registry</Button>
                          </CardFooter>
                      </Card>
                   )}
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest">Listing Narrative</FormLabel>
                      <Textarea placeholder="Detailed registry narrative..." className="min-h-[150px] resize-none" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Coordinate Triage</Label>
                    <ListingLocationPicker initialPosition={{ lat: listing.latitude, lon: listing.longitude }} />
                </div>

                <Separator />

                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vaulted Visuals</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {listing.images.map((image, index) => (
                          <div key={index} className="relative aspect-video rounded-xl overflow-hidden border border-border/40 shadow-sm group">
                              <Image src={image.url} alt="" fill className="object-cover transition-transform group-hover:scale-110" />
                              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                      ))}
                  </div>
                  <FileDragAndDrop 
                      name="images"
                      label="Sync New Assets"
                      description="Replacing visuals will trigger fresh visual authenticity triage."
                      accept="image/*"
                      multiple
                  />
                </div>

                <Separator />

                <div className="space-y-6">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Documentation Vault</Label>
                   {listing.evidence.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-border/40 rounded-2xl bg-muted/10">
                          {listing.evidence.map(doc => (
                              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/40">
                                  <FileText className="h-4 w-4 text-accent" />
                                  <span className="text-xs font-bold truncate flex-1">{doc.name}</span>
                                  {doc.verified && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                              </div>
                          ))}
                      </div>
                   ) : (
                      <div className="p-10 border-2 border-dashed rounded-2xl text-center">
                        <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No primary evidence vaulted</p>
                      </div>
                   )}
                   <FileDragAndDrop
                    name="evidence"
                    label="Append Verified Proof"
                    description="Securely sync new Title Deeds or Survey Maps. Existing documents are preserved."
                    multiple
                    isEvidence
                  />
                </div>

                {isSubmitting && (
                  <div className="space-y-3 p-6 bg-accent/5 rounded-2xl border border-accent/20">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-accent">
                        <span className="flex items-center gap-2"><Loader2 className="h-3 w-3 animate-spin" /> Transmitting Protocol</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} variant="default" className="h-14 w-full md:w-auto font-black uppercase text-[11px] tracking-widest px-12 shadow-glow active:scale-95 transition-all">
                  {isSubmitting ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronizing... </> ) : ( 'Commit Registry Changes' )}
                </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
