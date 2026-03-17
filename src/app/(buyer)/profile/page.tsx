'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/components/providers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction, requestSellerRoleAction, updateUserPreferencesAction } from '@/app/actions';
import { Loader2, Upload, CheckCircle2, AlertCircle, Mail, Phone, Shield, LogOut, Briefcase, Sparkles, Bell } from 'lucide-react';
import { EmptyState } from '@/components/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { BuyerPage } from '@/components/buyer/buyer-page';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().optional(),
  email: z.string().email(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

/**
 * ProfilePage - Identity node management with Vault Integrity tracking.
 * Features specialized Notification Protocol preferences (Strategic Enhancement).
 */
export default function ProfilePage() {
  const { userProfile, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isUpgradingRole, setIsUpgradingRole] = useState(false);
  const [showRoleUpgradeConfirm, setShowRoleUpgradeConfirm] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: userProfile?.displayName || '',
      phone: userProfile?.phone || '',
      email: userProfile?.email || '',
      bio: userProfile?.bio || '',
    },
  });

  const completeness = userProfile ? calculateProfileCompleteness(userProfile) : 0;

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('displayName', values.displayName);
      if (values.phone) formData.append('phone', values.phone);
      if (values.bio) formData.append('bio', values.bio);
      if (selectedPhotoFile) formData.append('photo', selectedPhotoFile);
      
      await updateUserProfileAction(formData);
      toast({ title: 'Identity Nodes Synchronized', description: 'Your profile vault has been updated successfully.' });
      setSelectedPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Sync Protocol Failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNotificationToggle = async (type: 'email' | 'inApp', value: boolean) => {
    try {
      const current = userProfile?.preferences?.notifications || { email: true, inApp: true };
      await updateUserPreferencesAction({
        notifications: { ...current, [type]: value }
      });
      toast({ title: 'Pulse Preferences Updated' });
    } catch (e) {
      toast({ variant: 'destructive', title: 'Preference Sync Failed' });
    }
  };

  const handleRoleUpgradeConfirm = async () => {
    setShowRoleUpgradeConfirm(false);
    setIsUpgradingRole(true);
    try {
      await requestSellerRoleAction();
      toast({ title: 'Identity Transition Complete', description: 'Transmitting to workspace...' });
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Transition Failed' });
    } finally { setIsUpgradingRole(false); }
  };

  if (loading) return <BuyerPage title="Identity Vault"><ProfileSkeleton /></BuyerPage>;
  if (!userProfile) return <BuyerPage title="Identity Vault"><EmptyState icon="AlertCircle" title="Registry Error" description="Could not load identity record." actions={[{ label: 'Return to Login', href: '/login' }]} /></BuyerPage>;

  return (
    <BuyerPage title="Identity Profile" description="Manage your secure identity nodes and notification protocols.">
      <div className="max-w-4xl space-y-6 pb-32 md:pb-12">
        
        {/* Profile Header Card */}
        <Card className="border-none shadow-xl overflow-hidden bg-card/50 backdrop-blur-sm">
          <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-emerald-500" />
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="relative group">
                  <div className={cn(
                    "w-32 h-32 rounded-full flex items-center justify-center overflow-hidden border-2 transition-all duration-500",
                    photoPreview || userProfile?.photoURL ? "border-primary/20" : "bg-muted border-dashed border-muted-foreground/30 animate-pulse"
                  )}>
                    {photoPreview || userProfile?.photoURL ? (
                      <img src={photoPreview || userProfile?.photoURL || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-primary/40">{userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}</span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2.5 rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg active:scale-90">
                    <Upload className="h-4 w-4" />
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => { setPhotoPreview(reader.result as string); setSelectedPhotoFile(file); };
                        reader.readAsDataURL(file);
                      }
                    }} className="hidden" />
                  </label>
                </div>
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black uppercase tracking-tight">{userProfile?.displayName || 'Identity Pending'}</h2>
                    {userProfile?.verified && <CheckCircle2 className="h-5 w-5 text-emerald-600 animate-bounce-in" />}
                  </div>
                  <Badge className="bg-primary text-white font-black uppercase text-[10px] tracking-widest border-none px-3">
                    {userProfile?.role || 'BUYER'} ACCOUNT
                  </Badge>
                </div>
              </div>
              <div className="bg-background/40 p-4 rounded-2xl border border-border/40 text-center min-w-[160px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Vault Integrity</p>
                <p className={cn("text-3xl font-black", completeness >= 80 ? "text-emerald-600" : "text-warning")}>{completeness}%</p>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div className={cn("h-full transition-all duration-1000", completeness >= 80 ? "bg-emerald-600" : "bg-warning")} style={{ width: `${completeness}%` }} />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Strategic Enhancement: Notification Protocol Card */}
        <Card className="border-none shadow-xl bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" /> Pulse Settings
            </CardTitle>
            <CardDescription className="text-xs">Configure how you receive transaction and trust signal updates.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
              <div>
                <p className="text-xs font-bold uppercase tracking-tight">Email Transmissions</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Critical registry updates & inquiries</p>
              </div>
              <Switch 
                checked={userProfile?.preferences?.notifications?.email ?? true} 
                onCheckedChange={(v) => handleNotificationToggle('email', v)}
              />
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/40">
              <div>
                <p className="text-xs font-bold uppercase tracking-tight">In-App Registry Pulse</p>
                <p className="text-[10px] text-muted-foreground uppercase font-medium">Real-time engagement alerts</p>
              </div>
              <Switch 
                checked={userProfile?.preferences?.notifications?.inApp ?? true} 
                onCheckedChange={(v) => handleNotificationToggle('inApp', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Identity Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField control={form.control} name="displayName" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name *</FormLabel>
                    <FormControl><Input {...field} className="h-12 font-bold" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Phone</FormLabel>
                      <FormControl><Input placeholder="+254 7XX XXX XXX" {...field} className="h-12 font-bold" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verified Email Node</FormLabel>
                      <FormControl><Input readOnly disabled {...field} className="h-12 bg-muted/20 font-mono text-xs opacity-60" /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="bio" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Narrative</FormLabel>
                    <FormControl><Textarea placeholder="Describe your property interests..." className="resize-none min-h-[120px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} className="h-14 px-12 font-black uppercase text-xs tracking-widest shadow-glow active:scale-95 transition-all">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Synchronize Registry Vault
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {userProfile.role === 'BUYER' && (
          <Card className="border-accent/20 bg-accent/5 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-accent"><Briefcase className="h-5 w-5" /> Business Provisioning</CardTitle>
              <CardDescription className="text-xs font-medium text-accent/80">Ready to sell property? Upgrade your vault to access seller analytics.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowRoleUpgradeConfirm(true)} disabled={isUpgradingRole} className="bg-accent text-white font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-glow">
                {isUpgradingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                Transition to Seller Role
              </Button>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={showRoleUpgradeConfirm} onOpenChange={setShowRoleUpgradeConfirm}>
          <AlertDialogContent className="max-w-md border-none shadow-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2"><Shield className="h-5 w-5 text-accent" /> Role Transition Protocol</AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium leading-relaxed mt-3">You are about to transition your buyer identity to a **SELLER** status.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end mt-8">
              <AlertDialogCancel className="font-black uppercase text-[10px]">Abort</AlertDialogCancel>
              <AlertDialogAction onClick={handleRoleUpgradeConfirm} disabled={isUpgradingRole} className="bg-accent text-white font-black uppercase text-[10px]">Execute Transition</AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </BuyerPage>
  );
}

function calculateProfileCompleteness(profile: any): number {
  let completeness = 0;
  if (profile.displayName) completeness += 25;
  if (profile.phone) completeness += 25;
  if (profile.bio) completeness += 25;
  if (profile.photoURL) completeness += 25;
  return completeness;
}

function ProfileSkeleton() {
  return <div className="max-w-4xl space-y-6"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-96 w-full rounded-2xl" /></div>;
}
