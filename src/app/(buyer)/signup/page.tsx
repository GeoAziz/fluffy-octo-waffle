'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, type User } from 'firebase/auth';
import { doc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LandPlot, ShieldCheck, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { AuthForm, type AuthFormField } from '@/components/form/auth-form';
import { PageWrapper } from '@/components/page-wrapper';
import { cn, validateRedirect } from '@/lib/utils';

export default function SignupPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<'BUYER' | 'SELLER'>('BUYER');

  const signupFields: AuthFormField[] = [
    {
      name: 'displayName',
      label: 'Full Legal Name',
      placeholder: 'John Doe',
      required: true,
      validation: { minLength: 2 }
    },
    {
      name: 'email',
      label: 'Communication Email',
      type: 'email',
      placeholder: 'agent@email.com',
      required: true,
    },
    {
      name: 'password',
      label: 'Access Token',
      type: 'password',
      required: true,
      validation: {
        minLength: 8,
        errorMessage: 'Access token must be at least 8 characters.',
      }
    }
  ];

  const handleAuthSuccess = async (user: User) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) throw new Error('Identity transmission failed.');
      toast({ title: 'Identity Verified', description: "Initializing your secure property vault." });
      
      // 1. Check for validated redirect param (security: prevents open redirects)
      const requestedRedirect = searchParams.get('redirect');
      const safeRedirect = validateRedirect(requestedRedirect, role);
      if (safeRedirect) {
        window.location.assign(safeRedirect);
        return;
      }

      // 2. Default landing protocol
      const redirectPath = role === 'SELLER' ? '/dashboard' : '/buyer/onboarding';
      window.location.assign(redirectPath);
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  const onEmailSubmit = async (data: Record<string, string>) => {
    setServerError(undefined);
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.displayName });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid, 
        email: data.email, 
        displayName: data.displayName,
        role: role, // Chosen role committed to vault
        verified: false, 
        createdAt: serverTimestamp(),
      });
      await handleAuthSuccess(userCredential.user);
    } catch (error: any) {
      setServerError(error.code === 'auth/email-already-in-use' ? 'A property vault already exists for this email.' : 'Identity provisioning failed.');
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setServerError(undefined);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      // Identity Protocol: Only sets role if this is a fresh account creation
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid, 
          email: user.email, 
          displayName: user.displayName,
          role: role, // Intent captured from selection UI
          verified: false, 
          createdAt: serverTimestamp(),
        });
      }
      await handleAuthSuccess(user);
    } catch (error: any) {
      setServerError('SSO Handshake failure.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="hidden bg-primary lg:flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="relative z-20 flex items-center text-lg font-black uppercase tracking-tighter text-white p-10">
          <LandPlot className="mr-2 h-6 w-6 text-accent" />
          Kenya Land Trust
        </div>
        <div className="relative z-20 flex-1 flex flex-col justify-center items-center p-10 text-center">
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">Vault Creation</h2>
          <p className="mt-4 text-lg text-emerald-50/80 max-w-md">Establish your verified identity on Kenya's most secure land network.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-background">
        <PageWrapper maxWidth="sm" className="w-full">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tight">Provision</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Establish your secure property vault</p>
            </div>

            {/* Role Selection Protocol */}
            <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-muted/30 border border-border/40">
              <button
                type="button"
                onClick={() => setRole('BUYER')}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all border-2",
                  role === 'BUYER' 
                    ? "bg-background border-primary text-primary shadow-sm" 
                    : "border-transparent text-muted-foreground hover:bg-background/50"
                )}
              >
                <ShoppingCart className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Buy Land</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all border-2",
                  role === 'SELLER' 
                    ? "bg-background border-accent text-accent shadow-sm" 
                    : "border-transparent text-muted-foreground hover:bg-background/50"
                )}
              >
                <ShieldCheck className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Sell Land</span>
              </button>
            </div>

            <AuthForm 
              fields={signupFields} 
              onSubmit={onEmailSubmit} 
              submitLabel="Commit Identity"
              isLoading={isLoading}
              serverError={serverError}
            />

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-background px-2 text-muted-foreground">Alternative</span></div>
            </div>

            <Button variant="outline" className="w-full h-12 font-black uppercase text-[10px] tracking-widest" onClick={handleGoogleSignIn} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Provision with Google
            </Button>

            <div className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Already verified? <Link href="/login" className="text-accent hover:underline">Terminal Access</Link>
            </div>
          </div>
        </PageWrapper>
      </div>
    </div>
  );
}