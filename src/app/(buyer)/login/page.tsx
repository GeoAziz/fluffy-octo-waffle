'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, type User, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LandPlot } from 'lucide-react';
import Link from 'next/link';
import { AuthForm, type AuthFormField } from '@/components/form/auth-form';
import { PageWrapper } from '@/components/page-wrapper';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { UserProfile } from '@/lib/types';
import { validateRedirect } from '@/lib/utils';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [serverError, setServerError] = useState<string | undefined>(undefined);

  const loginFields: AuthFormField[] = [
    {
      name: 'email',
      label: 'Network Email',
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
        minLength: 1,
        errorMessage: 'Access token is required to unlock your vault.',
      }
    }
  ];

  const handleLoginSuccess = async (user: User) => {
    try {
      const idToken = await user.getIdToken();
      
      // Set role hint cookie before continuing
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const profile = userDoc.data() as UserProfile;
      const role = profile?.role || 'BUYER';

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      
      if (!response.ok) throw new Error('Security session negotiation failed.');
      
      toast({ title: 'Welcome Back', description: "Security handshake complete." });
      
      // Role-Aware Landing Protocol
      const requestedRedirect = searchParams.get('redirect');
      const safeRedirect = validateRedirect(requestedRedirect, role);
      
      if (safeRedirect) {
        window.location.assign(safeRedirect);
        return;
      }

      // Canonical Dashboard Redirects
      if (role === 'ADMIN') {
        window.location.assign('/admin');
      } else if (role === 'SELLER') {
        window.location.assign('/dashboard');
      } else {
        // Direct buyers to dashboard if onboarded, else onboarding
        const target = profile?.hasCompletedOnboarding ? '/buyer/dashboard' : '/buyer/onboarding';
        window.location.assign(target);
      }
    } catch (err: any) {
      setServerError(err.message);
    }
  };

  const onEmailSubmit = async (data: Record<string, string>) => {
    setServerError(undefined);
    setIsLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      await handleLoginSuccess(userCredential.user);
    } catch (error: any) {
      setServerError('Incorrect identity credentials. Please verify your email and token.');
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setServerError(undefined);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
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
      await handleLoginSuccess(user);
    } catch (error: any) {
      setServerError('SSO Protocol Failure.');
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
          <h2 className="text-4xl font-black tracking-tight text-white uppercase">Vault Access</h2>
          <p className="mt-4 text-lg text-emerald-50/80 max-w-md">Secure authentication for Kenya's most trusted land marketplace.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 bg-background">
        <PageWrapper maxWidth="sm" className="w-full">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-black uppercase tracking-tight">Identity</h1>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Authenticate to unlock your property vault</p>
            </div>

            <AuthForm 
              fields={loginFields} 
              onSubmit={onEmailSubmit} 
              submitLabel="Transmit Identity"
              isLoading={isLoading}
              serverError={serverError}
            />

            <div className="flex items-center space-x-2 py-2">
              <Checkbox 
                id="remember" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label htmlFor="remember" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
                Maintain Identity Pulse (Stay Logged In)
              </Label>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-background px-2 text-muted-foreground">Alternative</span></div>
            </div>

            <Button variant="outline" className="w-full h-12 font-black uppercase text-[10px] tracking-widest" onClick={handleGoogleSignIn} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Terminal SSO
            </Button>

            <div className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
              No secure vault yet? <Link href="/signup" className="text-accent hover:underline">Provision One</Link>
            </div>
          </div>
        </PageWrapper>
      </div>
    </div>
  );
}
