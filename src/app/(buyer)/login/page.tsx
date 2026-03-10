'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, type User, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff, LandPlot } from 'lucide-react';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

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
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required to access your vault.'),
  rememberMe: z.boolean().default(true),
});

function getFirebaseAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Incorrect email or password. Please verify your details.';
        case 'auth/invalid-email':
            return 'The email address format is not recognized.';
        case 'auth/user-disabled':
            return 'This account has been suspended for security review.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Access temporarily restricted.';
        default:
            return `System error encountered. Please retry. (Code: ${errorCode})`;
    }
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    let isActive = true;
    const checkExistingSession = async () => {
      try {
        const response = await fetch('/api/auth/session', { method: 'GET', credentials: 'include' });
        if (!response.ok) return;
        const data = await response.json();
        if (!isActive || !data?.authenticated) return;
        const role = data.role ?? 'BUYER';
        const redirectTarget = role === 'ADMIN' ? '/admin' : role === 'SELLER' ? '/dashboard' : '/';
        router.replace(redirectTarget);
      } catch (error) {
        console.warn('[Login] Unable to check existing session:', error);
      }
    };
    checkExistingSession();
    return () => {
      isActive = false;
    };
  }, [router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '', rememberMe: true },
  });
  
  const handleLoginSuccess = async (user: User) => {
    try {
      const idToken = await user.getIdToken();

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Session negotiation failed.' }));
          throw new Error(errorData.message || 'Failed to establish security session.');
      }
      
      toast({ title: 'Welcome Back', description: "Security handshake complete." });
      
      const requestedRedirect = searchParams.get('redirect');

      if (requestedRedirect) {
        window.location.assign(requestedRedirect);
        return;
      }

      try {
        const sessionResp = await fetch('/api/auth/session', { method: 'GET', credentials: 'include' });
        if (sessionResp.ok) {
          const data = await sessionResp.json();
          const role = data.role ?? 'BUYER';
          const redirectTarget = role === 'ADMIN' ? '/admin' : role === 'SELLER' ? '/dashboard' : '/';
          window.location.assign(redirectTarget);
          return;
        }
      } catch (err) {
        console.warn('[Login] unable to fetch session after creating cookie, falling back to root', err);
      }

      window.location.assign('/');

    } catch (err: any) {
      console.error('[Login] handleLoginSuccess error:', err);
      throw err;
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      await setPersistence(auth, values.rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      await handleLoginSuccess(userCredential.user);
    } catch (error: any) {
      const message = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
      toast({
        variant: 'destructive',
        title: 'Authentication Denied',
        description: message,
      });
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleSubmitting(true);
    try {
        const provider = new GoogleAuthProvider();
        await setPersistence(auth, browserLocalPersistence);
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
        
        await handleLoginSuccess(user);

    } catch (error: any) {
        const message = error.code ? getFirebaseAuthErrorMessage(error.code) : error.message;
        toast({
            variant: 'destructive',
            title: 'SSO Handshake Failed',
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
            <h2 className="text-4xl font-black tracking-tight text-white uppercase">Vault Access</h2>
            <p className="mt-4 text-lg text-emerald-50/80 max-w-md">
                Secure authentication for Kenya's most trusted land marketplace.
            </p>
        </div>
        <div className="relative z-20 mt-auto p-10 border-t border-white/10">
            <blockquote className="space-y-2 text-white/90">
                <p className="text-lg italic font-medium">
                    "Documentation is the only language of trust in real estate."
                </p>
                <footer className="text-xs font-black uppercase tracking-widest text-emerald-400">Security Terminal</footer>
            </blockquote>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-background">
        <div className="mx-auto grid w-[350px] gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-black uppercase tracking-tight">Identity</h1>
            <p className="text-balance text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Authenticate to unlock your property vault
            </p>
          </div>
          <div className="grid gap-4">
             <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Network Email</FormLabel>
                        <FormControl><Input placeholder="agent@kenyalandtrust.com" {...field} className="h-11" /></FormControl>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between">
                     <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            </FormControl>
                            <FormLabel className="text-xs font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
                            Persistent
                            </FormLabel>
                        </FormItem>
                        )}
                    />
                    <Link
                        href="/forgot-password"
                        className="text-xs font-bold uppercase tracking-widest text-accent hover:underline"
                    >
                        Reset access?
                    </Link>
                  </div>

                  <Button variant="accent" type="submit" className="w-full h-12 font-black uppercase text-[10px] tracking-widest" disabled={isSubmitting || isGoogleSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Transmit Identity
                  </Button>
                </form>
              </Form>
             <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-background px-2 text-muted-foreground">Alternative</span></div>
             </div>
             <Button variant="outline" className="w-full h-12 font-black uppercase text-[10px] tracking-widest" onClick={handleGoogleSignIn} disabled={isSubmitting || isGoogleSubmitting}>
                {isGoogleSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon />}
                SSO with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
            No secure vault yet?{" "}
            <Link href="/signup" className="text-accent hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
