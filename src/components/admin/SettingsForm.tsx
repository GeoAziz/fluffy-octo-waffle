'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PermissionGuard } from '@/components/auth/permission-guard';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import { Loader2, Globe, ShieldCheck, Mail, Sliders } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SettingsSchema = z.object({
  platformName: z.string().min(1, 'Platform name is required').max(100),
  contactEmail: z.string().email('Invalid contact email'),
  supportEmail: z.string().email('Invalid support email'),
  supportPhone: z.string().optional().default(''),
  siteDescription: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  maxUploadSizeMB: z.coerce.number().min(1, 'Max upload size must be at least 1 MB').max(1000),
  moderationThresholdDays: z.coerce.number().min(1, 'Must be at least 1 day').max(365),
  maintenanceMode: z.boolean(),
  maintenanceMessage: z.string().optional().default(''),
  enableUserSignups: z.boolean(),
  enableListingCreation: z.boolean(),
  socialFacebook: z.string().url('Invalid Facebook URL').optional().or(z.literal('')),
  socialTwitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  socialLinkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  trustStats: z.object({
    totalListings: z.coerce.number().min(0),
    totalBuyers: z.coerce.number().min(0),
    fraudCasesResolved: z.coerce.number().min(0),
  }),
});

type SettingsFormData = z.infer<typeof SettingsSchema>;

function SettingsFormContent() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { settings, isLoading } = useSettings();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: {
      platformName: '',
      contactEmail: '',
      supportEmail: '',
      siteDescription: '',
      maxUploadSizeMB: 50,
      moderationThresholdDays: 7,
      maintenanceMode: false,
      maintenanceMessage: '',
      enableUserSignups: true,
      enableListingCreation: true,
      trustStats: {
        totalListings: 0,
        totalBuyers: 0,
        fraudCasesResolved: 0,
      }
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      form.reset(settings as SettingsFormData);
      setLastSaved(new Date());
    }
  }, [settings, form]);

  const onSubmit = async (data: SettingsFormData) => {
    try {
      setIsSaving(true);
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save settings');
      }



      setLastSaved(new Date());
      toast({
        title: 'Settings updated',
        description: 'Platform settings have been saved and audit trail updated.',
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to save platform settings';
      toast({
        variant: 'destructive',
        title: 'Error saving settings',
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            {/* Identity & SEO */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Globe className="h-5 w-5 text-accent" /> Identity & Discovery
                </CardTitle>
                <CardDescription className="text-xs">Core branding and search engine configuration.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="platformName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Legal Platform Name</FormLabel>
                      <FormControl><Input placeholder="Kenya Land Trust" {...field} className="h-11 font-bold" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="siteDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">SEO Narrative</FormLabel>
                      <FormControl><Textarea rows={4} {...field} className="resize-none" /></FormControl>
                      <FormDescription className="text-[10px] italic">Displayed in search results and landing metadata.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Constraints & SLAs */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-primary" /> Guardrails & SLAs
                </CardTitle>
                <CardDescription className="text-xs">Configure system limits and seller expectations.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="maxUploadSizeMB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload Ceiling (MB)</FormLabel>
                        <FormControl><Input type="number" {...field} className="h-11 font-bold" /></FormControl>
                        <FormDescription className="text-[10px]">Maximum size per property asset or document.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="moderationThresholdDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Review SLA (Hours)</FormLabel>
                        <FormControl><Input type="number" {...field} className="h-11 font-bold" /></FormControl>
                        <FormDescription className="text-[10px]">Displayed to sellers as target turnaround time.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Proof Stats */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-success" /> Social Proof Registry
                </CardTitle>
                <CardDescription className="text-xs">Override system metrics for marketing display.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="trustStats.totalListings"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Listings Metric</FormLabel>
                        <FormControl><Input type="number" {...field} className="h-11" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trustStats.totalBuyers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Buyers Metric</FormLabel>
                        <FormControl><Input type="number" {...field} className="h-11" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="trustStats.fraudCasesResolved"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fraud Resolve %</FormLabel>
                        <FormControl><Input type="number" {...field} className="h-11" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            {/* Communication Hub */}
            <Card className="border-none shadow-xl">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                  <Mail className="h-5 w-5 text-accent" /> Contact Nodes
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="supportEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Support Intake</FormLabel>
                      <FormControl><Input type="email" {...field} className="h-11" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="supportPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hotline</FormLabel>
                      <FormControl><Input {...field} className="h-11" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Status Switches */}
            <Card className="border-none shadow-xl bg-muted/10">
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="enableUserSignups"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <FormLabel className="text-xs font-black uppercase tracking-widest">Public Onboarding</FormLabel>
                        <FormDescription className="text-[9px]">Allow new buyer/seller accounts.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <Separator className="bg-border/40" />
                <FormField
                  control={form.control}
                  name="enableListingCreation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <FormLabel className="text-xs font-black uppercase tracking-widest">Vault Transmissions</FormLabel>
                        <FormDescription className="text-[9px]">Allow new property listings.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
                <Separator className="bg-border/40" />
                <FormField
                  control={form.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <FormLabel className="text-xs font-black uppercase tracking-widest text-risk">Maintenance Lock</FormLabel>
                        <FormDescription className="text-[9px]">Restrict all public access.</FormDescription>
                      </div>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="sticky bottom-8 space-y-4">
              <Button type="submit" disabled={isSaving} className="w-full h-14 font-black uppercase text-xs tracking-widest shadow-glow">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Commit Configuration
              </Button>
              {lastSaved && (
                <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Last Sync: {lastSaved.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
}

/**
 * SettingsForm - Admin-only component for platform configuration
 * Protected by PermissionGuard to ensure only admins can access
 */
export function SettingsForm() {
  return (
    <PermissionGuard 
      allowedRoles={['ADMIN']}
      fallback={
        <div className="flex items-center justify-center py-20">
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-sm font-semibold text-destructive">Access Denied</p>
              <p className="text-xs text-muted-foreground mt-2">Only administrators can modify platform settings.</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SettingsFormContent />
    </PermissionGuard>
  );
}
