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
import { useToast } from '@/hooks/use-toast';
import { updateUserProfileAction, deleteUserAccountAction, sendEmailVerificationAction, changeUserPasswordAction } from '@/app/actions';
import { Loader2, Upload, CheckCircle2, AlertCircle, Mail, Phone, Shield, LogOut, Trash2, Eye, EyeOff } from 'lucide-react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
    return <ProfileSkeleton />;
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
      <div className="max-w-4xl space-y-6">
        
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
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {userProfile?.role || 'BUYER'}
                    </span>
                    {!userProfile?.verified && (
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Quick Info */}
                  <p className="text-muted-foreground text-sm">
                    Member since {formattedDate}
                  </p>
                </div>
              </div>

              {/* Profile Completeness */}
              <div className="text-right">
                <div className="mb-2">
                  <p className="text-sm font-semibold text-foreground">Profile Complete</p>
                  <p className="text-2xl font-bold text-primary">{completeness}%</p>
                </div>
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300" 
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Personal Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your contact details and bio</CardDescription>
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
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+254 (0) 7XX XXX XXX" {...field} />
                      </FormControl>
                      <FormDescription>
                        Optional, but helps buyers reach you faster
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
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell buyers about yourself (e.g., years of experience, areas of expertise, etc.)" 
                          className="resize-none" 
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        {field.value?.length || 0}/500 characters
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
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input readOnly disabled {...field} className="flex-1" />
                          {userProfile?.verified ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Email cannot be changed. Contact support if you need assistance.
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Sessions
            </CardTitle>
            <CardDescription>Manage your account security and active sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Verification Status */}
            <div className="p-4 bg-accent/30 rounded-lg border border-accent/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    {userProfile?.verified ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Account Verified
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        Account Not Verified
                      </>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userProfile?.verified 
                      ? 'Your email address has been verified' 
                      : 'Verify your email to unlock full features'}
                  </p>
                </div>
                {!userProfile?.verified && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleVerifyEmail}
                    disabled={isVerifying}
                  >
                    {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Verify Now
                  </Button>
                )}
              </div>
            </div>

            {/* Password Change */}
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Change Password</h4>
              <p className="text-sm text-muted-foreground">
                It's a good idea to use a strong, unique password
              </p>
              
              {!showPasswordForm ? (
                <Button 
                  variant="outline"
                  onClick={() => setShowPasswordForm(true)}
                >
                  Update Password
                </Button>
              ) : (
                <div className="p-4 bg-secondary/30 rounded-lg border border-border/40 space-y-4">
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword.current ? 'text' : 'password'}
                                  placeholder="Enter current password" 
                                  {...field} 
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
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword.new ? 'text' : 'password'}
                                  placeholder="Enter new password" 
                                  {...field} 
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
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showPassword.confirm ? 'text' : 'password'}
                                  placeholder="Confirm new password" 
                                  {...field} 
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
                        >
                          {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Change Password
                        </Button>
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false);
                            passwordForm.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>

            {/* Active Sessions */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              <h4 className="font-semibold text-foreground">Current Session</h4>
              <div className="p-3 bg-secondary/30 rounded-lg border border-border/40 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">This device</p>
                  <p className="text-xs text-muted-foreground">Last active: just now</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Card */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible and destructive actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-red-900">Delete Account</p>
                  <p className="text-sm text-red-700 mt-1">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isDeletingAccount}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
              <div className="p-4 bg-red-100 border-2 border-red-400 rounded-lg space-y-3">
                <p className="font-semibold text-red-900">Are you absolutely sure?</p>
                <p className="text-sm text-red-800">
                  This action cannot be undone. All your data including listings, messages, and profile information will be permanently deleted.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Yes, Delete My Account
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeletingAccount}
                  >
                    Cancel
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
    { field: 'displayName', required: true, weight: 20 },
    { field: 'email', required: true, weight: 20 },
    { field: 'phone', required: false, weight: 20 },
    { field: 'bio', required: false, weight: 20 },
    { field: 'photoURL', required: false, weight: 20 },
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
        <BuyerPage title="Profile">
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
        </BuyerPage>
    )
}
