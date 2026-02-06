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
import { Loader2 } from 'lucide-react';
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
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'evidence' && value) {
          Array.from(value as FileList).forEach(file => formData.append('evidence', file));
        } else if (value) {
            formData.append(key, String(value));
        }
      });
      
      const { id } = await createListing(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: 'Listing Submitted!',
        description: 'Your property is now pending review by our team.',
      });

      setTimeout(() => {
        router.push(`/listings/${id}`);
      }, 1000);

    } catch (error) {
      clearInterval(progressInterval);
      setIsSubmitting(false);
      setUploadProgress(0);
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Could not create the listing. Please try again.',
      });
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Listing</CardTitle>
          <CardDescription>
            Fill in the details of your property to list it on the platform. It will be reviewed by an admin before being made public.
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
                      Upload title deed, survey maps, agreements, etc. (max 5 files).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isSubmitting && (
                <div className="space-y-2">
                    <Label>Submitting for Review...</Label>
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
                  'Submit for Review'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
