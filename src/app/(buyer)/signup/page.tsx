'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, LandPlot } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const GoogleIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );

const formSchema = z.object({
  displayName: z.string()
    .min(2, 'Full legal name must be at least 2 characters.')
    .max(50, 'Name length restricted to 50 characters.'),
  email: z.string().email('Please enter a valid organizational or personal email.'),
  password: z.string()
    .min(8, 'Access token must be at least 8 characters for security.')
    .regex(/[A-Z]/, 'Must include at least one uppercase character.')
    .regex(/[0-9]/, 'Must include at least one numerical digit.')
    .regex(/[^A-Za-z0-9]/, 'Must include at least one special symbol.'),
  phone: z.string().optional(),
});

function getFirebaseAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/email-already-in-use':
            return 'A property vault already exists for this email. Log in instead.';
        case 'auth/invalid-email':
            return 'The email format provided is not recognized by the security layer.';
        case 'auth/weak-password':
            return 'The chosen token is too simple. Enhance with complexity.';
        case 'auth/popup-closed-by-user':
            return 'The SSO handshake was terminated by the user.';
        default:
            return `Identity provisioning failed. Protocol error: ${errorCode}`;
    }
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { displayName: '', email: '', password: '', phone: '' },
  });

  const handleAuthSuccess = async (user: User) => {
    try {
      const idToken = await user.getIdToken();
      
      const response = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
          throw new Error('Identity transmission failed.');
      }

      toast({ title: 'Identity Verified', description: "Initializing your secure property vault." });
      window.location.assign('/onboarding');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Handshake Error', description: err.message });
      setIsSubmitting(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: values.displayName });

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: values.displayName,
        photoURL: user.photoURL,
        phone: values.phone || null,
        role: 'BUYER',
        verified: false,
        createdAt: serverTimestamp(),
      });
      
      await handleAuthSuccess(user);
    } catch (error: any) {
      const message = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
      toast({
        variant: 'destructive',
        title: 'Identity Provisioning Failed',
        description: message,
      });
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleSubmitting(true);
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
             await setDoc(userDocRef, {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                phone: user.phoneNumber || null,
                role: 'BUYER',
                verified: false,
                createdAt: serverTimestamp(),
            });
        }
        
        await handleAuthSuccess(user);
    } catch (error: any) {
        const message = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
        toast({
            variant: 'destructive',
            title: 'SSO Handshake failure',
            description: message,
        });
        setIsGoogleSubmitting(false);
    }
  }

  return (
     <div className="w-full lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2 xl:min-h-[calc(100vh-4rem)]">
      <div className="hidden bg-primary lg:flex flex-col relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
         <div className="relative z-20 flex items-center text-lg font-black uppercase tracking-tighter text-white p-10">
            <LandPlot className="mr-2 h-6 w-6 text-accent" />
            Kenya Land Trust
        </div>
         <div className="relative z-20 flex-1 flex flex-col justify-center items-center p-10 text-center">
            <h2 className="text-4xl font-black tracking-tight text-white uppercase">Vault Creation</h2>
            <p className="mt-4 text-lg text-emerald-50/80 max-w-md">
                Establish your verified identity on Kenya's most secure land network.
            </p>
        </div>
        <div className="relative z-20 mt-auto p-10 border-t border-white/10">
            <blockquote className="space-y-2 text-white/90">
                <p className="text-lg italic">
                    "Transparency starts with a verified account."
                </p>
                <footer className="text-xs font-black uppercase tracking-widest text-emerald-400">Identity Provisioning</footer>
            </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[350px] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight">Provision</h1>
            <p className="text-balance text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Establish your secure property vault
            </p>
          </div>
          <div className="grid gap-4">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Full Legal Name</FormLabel>
                        <FormControl><Input placeholder="John Doe" {...field} className="h-11" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Communication Email</FormLabel>
                        <FormControl><Input placeholder="agent@email.com" {...field} className="h-11" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Contact Node (Optional)</FormLabel>
                        <FormControl><Input placeholder="+254 7XX XXX XXX" {...field} className="h-11" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Access Token</FormLabel>
                         <div className="relative">
                          <FormControl>
                            <Input
                              type={showPassword ? "text" : "password"}
                              className="pr-10 h-11"
                              {...field}
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase leading-tight">Minimum 8 chars, 1 uppercase, 1 number, 1 symbol.</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button variant="default" type="submit" className="w-full h-12 font-black uppercase text-[10px] tracking-widest" disabled={isSubmitting || isGoogleSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Commit Identity
                  </Button>
                </form>
              </Form>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-background px-2 text-muted-foreground">Alternative</span></div>
              </div>
              <Button variant="outline" className="w-full h-12 font-black uppercase text-[10px] tracking-widest" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
                {isGoogleSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Provision with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Already verified?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Terminal Access
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}