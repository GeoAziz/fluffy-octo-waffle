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
import { Loader2, Sparkles, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ToastAction } from '@/components/ui/toast';
import type { Listing } from '@/lib/types';
import Image from 'next/image';
import { ListingLocationPicker } from '@/components/listing-location-picker';
import { FileDragAndDrop } from '@/components/file-drag-and-drop';
import { Label } from '@/components/ui/label';

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
      toast({ title: 'Draft restored', description: 'Recovered your unsaved edits.' });
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
        toast({ title: 'Description generated!', description: 'You can now review or apply the narrative below.' });
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'AI Error', description: e.message });
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
        title: 'Listing Updated!',
        description: 'Changes have been secured and queued for moderation.',
        action: <ToastAction altText="View" onClick={() => router.push(`/listings/${id}`)}>View</ToastAction>
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
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Could not update the listing. Please retry.',
      });
    }
  }

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Edit Listing Identity</CardTitle>
        <CardDescription>
          Significant changes to location or documentation will reset your trust signal status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Property Title</FormLabel>
                    <Input placeholder="e.g., 5 Acres in Kitengela" {...field} className="h-12 font-bold" />
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
                      <FormLabel className="text-xs font-bold uppercase tracking-widest">Neighborhood</FormLabel>
                      <Input placeholder="e.g., Isinya" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest">County</FormLabel>
                      <Input placeholder="e.g., Kajiado County" {...field} />
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
                      <FormLabel className="text-xs font-bold uppercase tracking-widest">Area (Acres)</FormLabel>
                      <Input type="number" step="0.01" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest">Dimensions</FormLabel>
                      <Input placeholder="e.g., 100x100 ft" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <FormField
                  control={form.control}
                  name="landType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest">Land Type</FormLabel>
                      <Input placeholder="e.g., Residential" {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-widest">Price (Ksh)</FormLabel>
                      <Input type="number" {...field} className="font-bold text-primary" />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Separator />

              <div className="space-y-4 rounded-xl border border-accent/20 bg-accent/5 p-6">
                 <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    <Label className="text-xs font-bold uppercase tracking-widest text-accent">AI Content Assist</Label>
                 </div>
                 <Textarea 
                    placeholder="Enter key features...&#10;- Prime volcanic soil&#10;- Near SGR station"
                    className="min-h-[100px] border-accent/20"
                    value={bulletPoints}
                    onChange={(e) => setBulletPoints(e.target.value)}
                 />
                 <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating} className="border-accent/40 text-accent font-bold uppercase text-[10px] tracking-widest">
                    {isGenerating ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <Sparkles className="mr-2 h-3 w-3" />}
                    Regenerate Narrative
                 </Button>
                 {generatedDescription && (
                    <Card className="bg-background border-accent/20">
                        <CardContent className="pt-4">
                            <p className="text-xs italic leading-relaxed text-muted-foreground">"{generatedDescription}"</p>
                        </CardContent>
                        <CardFooter>
                            <Button type="button" size="sm" variant="ghost" className="text-accent font-bold text-[10px] uppercase tracking-widest" onClick={useGeneratedDescription}>Apply Narrative</Button>
                        </CardFooter>
                    </Card>
                 )}
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-widest">Full Narrative</FormLabel>
                    <Textarea placeholder="A detailed description of the property..." className="min-h-[150px]" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className="rounded-md border bg-muted/30 p-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Map Triage</div>
              <ListingLocationPicker initialPosition={{ lat: listing.latitude, lon: listing.longitude }} />

              <Separator />

              <div className="space-y-4">
                <FormLabel className="text-xs font-bold uppercase tracking-widest">Active Assets</FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {listing.images.map((image, index) => (
                        <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                            <Image src={image.url} alt="" fill className="object-cover" />
                        </div>
                    ))}
                </div>
              </div>

              <FileDragAndDrop 
                  name="images"
                  label="Update Public Showcase"
                  description="Replacing images will trigger a new visual authenticity analysis."
                  accept="image/*"
                  multiple
              />

              <div className="space-y-4">
                <FormLabel className="text-xs font-bold uppercase tracking-widest">Evidence Vault</FormLabel>
                 {listing.evidence.length > 0 ? (
                    <div className="space-y-2 p-4 border rounded-lg bg-muted/10">
                        <ul className="space-y-2">
                            {listing.evidence.map(doc => (
                                <li key={doc.id} className="flex items-center gap-2 text-xs font-medium">
                                    <FileText className="h-3.5 w-3.5 text-accent" />
                                    <span>{doc.name}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 ) : (
                    <p className="text-xs text-muted-foreground p-4 border border-dashed rounded-lg">No evidence provided yet.</p>
                 )}
              </div>

              <FileDragAndDrop
                name="evidence"
                label="Add Verification Proof"
                description="Securely upload title deeds or survey maps. Existing documents are preserved."
                multiple
                isEvidence
              />

              {isSubmitting && (
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-accent">
                      <span>Transmitting assets</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}

              <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} variant="default" className="h-12 w-full md:w-auto font-black uppercase text-[10px] tracking-widest px-10">
                {isSubmitting ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transmitting... </> ) : ( 'Commit Changes' )}
              </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}