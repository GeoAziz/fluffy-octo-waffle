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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction, deleteUserAccountAction, sendEmailVerificationAction, changeUserPasswordAction, requestSellerRoleAction } from '@/app/actions';
import { Loader2, Upload, CheckCircle2, AlertCircle, Mail, Phone, Shield, LogOut, Trash2, Eye, EyeOff, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BuyerPage } from '@/components/buyer/buyer-page';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters.'),
  phone: z.string().optional(),
  email: z.string().email(),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export default function ProfilePage() {
  const { userProfile, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isUpgradingRole, setIsUpgradingRole] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRoleUpgradeConfirm, setShowRoleUpgradeConfirm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Calculate profile completeness
  const completeness = userProfile ? calculateProfileCompleteness(userProfile) : 0;

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('displayName', values.displayName);
      if (values.phone) {
        formData.append('phone', values.phone);
      }
      if (values.bio) {
        formData.append('bio', values.bio);
      }
      if (selectedPhotoFile) {
        formData.append('photo', selectedPhotoFile);
      }
      
      await updateUserProfileAction(formData);

      toast({
        title: 'Profile Updated',
        description: 'Your changes have been saved successfully.',
      });

      setSelectedPhotoFile(null);
      setPhotoPreview(null);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error instanceof Error ? error.message : 'Could not save your profile.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleUpgradeConfirm = async () => {
    setShowRoleUpgradeConfirm(false);
    setIsUpgradingRole(true);
    try {
      await requestSellerRoleAction();
      toast({
        title: 'Identity Transition Complete',
        description: 'You are now a verified land seller. Transmitting to workspace...',
      });
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transition Failed',
        description: error instanceof Error ? error.message : 'Could not process role upgrade.',
      });
    } finally {
      setIsUpgradingRole(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsChangingPassword(true);
    try {
      await changeUserPasswordAction(values.currentPassword, values.newPassword);

      toast({
        title: 'Password Changed',
        description: 'Your password has been updated successfully.',
      });

      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: error instanceof Error ? error.message : 'Could not change password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please choose an image under 5MB',
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setSelectedPhotoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyEmail = async () => {
    setIsVerifying(true);
    try {
      await sendEmailVerificationAction();
      toast({
        title: 'Verification Email Sent',
        description: 'Check your email inbox for verification link.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Could not send verification email.',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      router.push('/login');
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'Could not log you out. Please try again.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteUserAccountAction();
      await signOut(auth);
      router.push('/');
      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error instanceof Error ? error.message : 'Could not delete account.',
      });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <BuyerPage title="Profile">
        <ProfileSkeleton />
      </BuyerPage>
    );
  }
  
  if (!userProfile) {
    return (
        <BuyerPage title="Profile">
          <div className="max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle>Error</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Could not load user profile. Please try logging in again.</p>
              </CardContent>
            </Card>
          </div>
        </BuyerPage>
    )
  }

  const formattedDate = userProfile.createdAt?.toDate?.() 
    ? new Date(userProfile.createdAt.toDate()).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Unknown';

  return (
    <BuyerPage
      title="Profile"
      description="Manage your account settings and personal information"
    >
      <div className="max-w-4xl space-y-6 pb-20">
        
        {/* Profile Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                {/* Profile Picture */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                    {photoPreview || userProfile?.photoURL ? (
                      <img 
                        src={photoPreview || userProfile?.photoURL || ''} 
                        alt={userProfile?.displayName || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-primary/40">
                        {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-md">
                    <Upload className="h-4 w-4" />
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      accept="image/*" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                </div>

                {/* User Info */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold">{userProfile?.displayName || 'User'}</h2>
                    {userProfile?.verified && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" title="Verified account" />
                    )}
                  </div>
                  
                  {/* Role Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full uppercase tracking-widest">
                      {userProfile?.role || 'BUYER'}
                    </span>
                    {!userProfile?.verified && (
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black uppercase tracking-widest rounded-full flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Quick Info */}
                  <p className="text-muted-foreground text-sm font-medium">
                    Member since {formattedDate}
                  </p>
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vault Integrity</p>
                  <p className="text-2xl font-black text-primary">{completeness}%</p>
                </div>
                <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Business Upgrading Card */}
        {userProfile.role === 'BUYER' && (
          <Card className="border-accent/20 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2 text-accent">
                <Briefcase className="h-5 w-5" /> Business Provisioning
              </CardTitle>
              <CardDescription className="text-xs font-medium text-accent/80">
                Ready to list and sell property? Upgrade your vault to access seller tools and documentation review.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setShowRoleUpgradeConfirm(true)} 
                disabled={isUpgradingRole}
                className="bg-accent text-white font-black uppercase text-[10px] tracking-widest h-11 px-8 shadow-glow"
              >
                {isUpgradingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                Transition to Seller Role
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Role Upgrade Confirmation Dialog */}
        <AlertDialog open={showRoleUpgradeConfirm} onOpenChange={setShowRoleUpgradeConfirm}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-lg font-black uppercase tracking-tight">Confirm Role Transition</AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium leading-relaxed mt-3">
                You are about to transition from Buyer to Seller. This grants access to the seller dashboard where you can create listings and upload evidence documents for verification. This action can be reversed through admin support if needed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="rounded-lg bg-muted/30 border border-border/40 p-4 mt-4">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">You will:</p>
              <ul className="space-y-2 text-xs text-muted-foreground font-medium">
                <li className="flex items-start gap-2"><span className="text-accent font-black mt-0.5">•</span> Access the seller workspace at /dashboard</li>
                <li className="flex items-start gap-2"><span className="text-accent font-black mt-0.5">•</span> Create and manage property listings</li>
                <li className="flex items-start gap-2"><span className="text-accent font-black mt-0.5">•</span> Upload evidence documentation for trust badges</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <AlertDialogCancel className="h-10 px-6 font-black uppercase text-[10px] tracking-widest">Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRoleUpgradeConfirm}
                disabled={isUpgradingRole}
                className="h-10 px-6 bg-accent text-white font-black uppercase text-[10px] tracking-widest hover:bg-accent/90"
              >
                {isUpgradingRole ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                Confirm Transition
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight">Personal Identity</CardTitle>
            <CardDescription className="text-xs font-medium">Update your contact nodes and bio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                {/* Name Field */}
                <FormField
                  control={form.control}
                  name="displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Legal Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Registry name" {...field} className="h-11 font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Phone Node</FormLabel>
                      <FormControl>
                        <Input placeholder="+254 (0) 7XX XXX XXX" {...field} className="h-11 font-bold" />
                      </FormControl>
                      <FormDescription className="text-[10px] italic">
                        Accelerates buyer inquiry resolution.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Bio Field */}
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Narrative</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Provide context for your property transactions..." 
                          className="resize-none" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="text-[10px] font-bold">
                        {field.value?.length || 0} / 500 characters
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email Field (Read-only) */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Encrypted Email Node</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <Input readOnly disabled {...field} className="flex-1 h-11 bg-muted/20 font-mono text-xs opacity-60" />
                          {userProfile?.verified ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription className="text-[10px]">
                        Identity nodes are immutable. Contact Registry Support for change requests.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty} className="h-12 px-10 font-black uppercase text-xs tracking-widest shadow-glow">
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Synchronize Identity
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" /> Security Pulse
            </CardTitle>
            <CardDescription className="text-xs font-medium">Session management and authentication protocols.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Verification Status */}
            <div className="p-4 bg-muted/20 rounded-xl border border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                    {userProfile?.verified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        Account Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 text-yellow-600" />
                        Awaiting Verification
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 font-medium">
                    {userProfile?.verified 
                      ? 'Email handshake confirmed.' 
                      : 'Complete verification to unlock high-trust signals.'}
                  </p>
                </div>
                {!userProfile?.verified && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleVerifyEmail}
                    disabled={isVerifying}
                    className="h-9 text-[10px] font-bold uppercase tracking-widest"
                  >
                    {isVerifying && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Initiate Pulse
                  </Button>
                )}
              </div>
            </div>

            {/* Password Change */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Access Token Rotation</h4>
              <p className="text-xs text-muted-foreground font-medium">
                Cycle your access credentials to maintain vault integrity.
              </p>
              
              {!showPasswordForm ? (
                <Button 
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                  className="h-10 text-[10px] font-bold uppercase tracking-widest"
                >
                  Modify Access Token
                </Button>
              ) : (
                <div className="p-5 bg-secondary/10 rounded-xl border border-border/40 space-y-4 animate-in fade-in slide-in-from-top-2">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black uppercase tracking-widest">Active Token</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword.current ? 'text' : 'password'}
                                  placeholder="Current identifier" 
                                  {...field} 
                                  className="h-11"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(p => ({ ...p, current: !p.current }))}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black uppercase tracking-widest">New Target Token</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword.new ? 'text' : 'password'}
                                  placeholder="Minimum 8 characters" 
                                  {...field} 
                                  className="h-11"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(p => ({ ...p, new: !p.new }))}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black uppercase tracking-widest">Confirm Sync</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword.confirm ? 'text' : 'password'}
                                  placeholder="Repeat target token" 
                                  {...field} 
                                  className="h-11"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(p => ({ ...p, confirm: !p.confirm }))}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={isChangingPassword}
                          className="h-10 px-6 font-bold uppercase text-[10px] tracking-widest"
                        >
                          {isChangingPassword && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                          Update Protocol
                        </Button>
                        <Button 
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setShowPasswordForm(false);
                            passwordForm.reset();
                          }}
                          className="h-10 px-6 font-bold uppercase text-[10px] tracking-widest"
                        >
                          Abort
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div className="space-y-3 pt-4 border-t border-border/40">
              <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Identity Session</h4>
              <div className="p-4 bg-muted/10 rounded-xl border border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-foreground">Primary Terminal</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Active Network Node</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="h-9 border-risk/20 text-risk hover:bg-risk-light hover:text-risk text-[10px] font-black uppercase tracking-widest"
                >
                  {isLoggingOut && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                  <LogOut className="mr-2 h-3.5 w-3.5" />
                  Terminal Exit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-risk/20 bg-risk-light/30">
          <CardHeader>
            <CardTitle className="text-risk flex items-center gap-2 text-lg font-black uppercase tracking-tight">
              <AlertCircle className="h-5 w-5" /> Danger Protocol
            </CardTitle>
            <CardDescription className="text-xs font-medium text-risk/80">Irreversible registry purge and account liquidation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-risk-light/50 rounded-xl border border-risk/20">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-risk">Purge Identity</p>
                  <p className="text-[10px] text-risk/70 mt-1 font-medium leading-relaxed">
                    Permanently delete your property vault and identity history.
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeletingAccount}
                  className="h-10 px-6 font-black uppercase text-[10px] tracking-widest bg-risk shadow-md hover:bg-risk/90"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Execute Liquidation
                </Button>
              </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="p-5 bg-risk border-2 border-risk/40 rounded-xl space-y-4 animate-in shake-error duration-500 text-white">
                <p className="font-black text-sm uppercase tracking-tight">Confirm Deletion Protocol</p>
                <p className="text-xs font-medium leading-relaxed opacity-90">
                  This action is final. All listings, vaulted evidence, and communication nodes associated with this identity will be purged from the registry.
                </p>
                <div className="flex gap-3">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                    className="flex-1 h-11 bg-white text-risk hover:bg-white/90 font-black uppercase text-[10px] tracking-widest"
                  >
                    {isDeletingAccount && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                    Confirm Purge
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeletingAccount}
                    className="flex-1 h-11 border-white/40 text-white hover:bg-white/10 font-black uppercase text-[10px] tracking-widest"
                  >
                    Abort
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </BuyerPage>
  );
}

function calculateProfileCompleteness(profile: any): number {
  let completeness = 0;
  const fields = [
    { field: 'displayName', weight: 20 },
    { field: 'email', weight: 20 },
    { field: 'phone', weight: 20 },
    { field: 'bio', weight: 20 },
    { field: 'photoURL', weight: 20 },
  ];

  fields.forEach(({ field, weight }) => {
    if (profile[field]) {
      completeness += weight;
    }
  });

  return Math.min(completeness, 100);
}


function ProfileSkeleton() {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Header Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <Skeleton className="w-32 h-32 rounded-full" />
              <div className="flex-1 pt-2 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            <div className="text-right space-y-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="w-24 h-2" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Personal Info Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>

      {/* Security Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full rounded-lg" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </CardContent>
      </Card>

      {/* Danger Zone Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
