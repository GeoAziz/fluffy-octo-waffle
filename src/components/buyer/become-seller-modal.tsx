'use client';

import { useState } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { requestSellerRoleAction } from '@/app/actions';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BecomeSellerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BecomeSellerModal({ open, onOpenChange }: BecomeSellerModalProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState<'info' | 'agreement' | 'loading'>('info');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleBecomeSeller = async () => {
    if (!agreedToTerms) {
      toast({ variant: 'destructive', title: 'Please accept the seller agreement' });
      return;
    }

    setStep('loading');
    try {
      await requestSellerRoleAction();
      toast({ title: 'Success!', description: 'You can now create listings and sell property.' });
      onOpenChange(false);
      setStep('info');
      setAgreedToTerms(false);
      router.push('/dashboard/create-listing');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
      setStep('agreement');
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        {step === 'info' && (
          <div className="space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">Become a Seller</AlertDialogTitle>
              <AlertDialogDescription>
                Start selling property on Kenya Land Trust and reach thousands of buyers
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Create Multiple Listings</p>
                      <p className="text-sm text-muted-foreground">Post as many properties as you want</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Upload Evidence Documents</p>
                      <p className="text-sm text-muted-foreground">Verify your listings to earn trust badges</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Direct Buyer Messaging</p>
                      <p className="text-sm text-muted-foreground">Communicate with interested buyers instantly</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Analytics Dashboard</p>
                      <p className="text-sm text-muted-foreground">Track views, inquiries, and interested buyers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-warning/10 border-warning/40">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-warning" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>• Complete your profile (name, phone, email)</p>
                  <p>• Provide clear property information and images</p>
                  <p>• Upload ownership documents or evidence</p>
                  <p>• Listings must be reviewed and approved by our team</p>
                  <p>• Maintain professional communication with buyers</p>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4 justify-end">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => setStep('agreement')}>
                Continue
              </AlertDialogAction>
            </div>
          </div>
        )}

        {step === 'agreement' && (
          <div className="space-y-6">
            <AlertDialogHeader>
              <AlertDialogTitle>Seller Agreement</AlertDialogTitle>
              <AlertDialogDescription>
                Please review and agree to our terms
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="max-h-96 overflow-y-auto space-y-4 text-sm">
              <div>
                <h4 className="font-bold mb-2">1. Seller Responsibility</h4>
                <p className="text-muted-foreground">
                  You agree that all property information you provide is accurate and complete. You are responsible for providing original or valid documentation.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">2. Trust and Safety</h4>
                <p className="text-muted-foreground">
                  You commit to treating all buyers with respect and professionalism. Fraudulent listings or deceptive practices will result in account suspension.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">3. Evidence Review</h4>
                <p className="text-muted-foreground">
                  Our team will review uploaded documents to verify property authenticity. Listings may take 24-48 hours to appear on the platform.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">4. Fees and Payments</h4>
                <p className="text-muted-foreground">
                  Kenya Land Trust is free to use. We do not charge listing or transaction fees.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-2">5. Account Suspension</h4>
                <p className="text-muted-foreground">
                  Repeated violations of community standards or suspicious activity may result in account suspension or permanent ban.
                </p>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
              />
              <span className="text-sm">
                I agree to the Kenya Land Trust Seller Agreement and commit to selling responsibly
              </span>
            </label>

            <div className="flex gap-4 justify-end">
              <AlertDialogCancel onClick={() => setStep('info')}>Back</AlertDialogCancel>
              <AlertDialogAction onClick={handleBecomeSeller} disabled={!agreedToTerms}>
                Agree & Become Seller
              </AlertDialogAction>
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-muted-foreground">Upgrading your account...</p>
          </div>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
