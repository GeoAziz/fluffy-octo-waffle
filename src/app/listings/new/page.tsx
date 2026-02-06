'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createListing } from '@/app/actions';
import { Loader2, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const formSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.'),
  location: z.string().min(5, 'Location must be at least 5 characters.'),
  price: z.coerce.number().min(1, 'Price must be a positive number.'),
  description: z.string().min(20, 'Description must be at least 20 characters.'),
  evidence: z.custom<FileList>().optional(),
});

export default function NewListingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      location: '',
      price: 0,
      description: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    setUploadProgress(0);

    // Simulate file upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // The `createListing` action needs FormData
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'evidence') {
          if (value) {
            Array.from(value).forEach((file) => {
              formData.append('evidence', file);
            });
          }
        } else {
            formData.append(key, String(value));
        }
      });
      
      const newListing = await createListing(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: 'Listing Created!',
        description: 'Your property has been successfully listed.',
      });

      // Redirect to the new listing or admin page after a short delay
      setTimeout(() => {
        router.push(`/listings/${newListing.id}`);
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setUploadProgress(0);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: 'Could not create the listing. Please try again.',
      });
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Listing</CardTitle>
          <CardDescription>
            Fill in the details of your property to list it on the platform.
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
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 5 Acres in Kitengela" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kitengela, Kajiado County" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (Ksh)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="e.g., 5500000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the property..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="evidence"
                render={({ field: { onChange, value, ...rest } }) => (
                  <FormItem>
                    <FormLabel>Evidence Documents</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        multiple 
                        {...rest}
                        onChange={(e) => onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload title deed, survey maps, agreements, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSubmitting && (
                <div className="space-y-2">
                    <Label>Uploading...</Label>
                    <Progress value={uploadProgress} />
                </div>
              )}

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Create Listing'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
