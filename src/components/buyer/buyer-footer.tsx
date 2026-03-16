'use client';

import Link from 'next/link';
import { LandPlot, Mail, Phone, Facebook, Twitter, Linkedin, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/use-settings';
import type { PlatformSettings } from '@/lib/types';

/**
 * BuyerFooter - Modern, efficient buyer-focused footer
 * Features dynamic settings and trust stats from the admin panel.
 */

interface NavLink {
  href: string;
  label: string;
  description?: string;
}

export function BuyerFooter() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<'idle' | 'success' | 'error'>('idle');
  const { settings, isLoading } = useSettings();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubscriptionState('success');
        setEmail('');
        toast({ title: 'Subscribed!', description: 'Check your email for confirmation.' });
        setTimeout(() => setSubscriptionState('idle'), 4000);
      } else {
        throw new Error('Subscription failed');
      }
    } catch (error: any) {
      setSubscriptionState('error');
      setTimeout(() => setSubscriptionState('idle'), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const platformName = settings?.platformName || 'Kenya Land Trust';
  const contactEmail = settings?.contactEmail || 'contact@kenyalandtrust.com';
  const supportPhone = settings?.supportPhone || '+254 (0) 700 000 000';
  const trustStats = settings?.trustStats || { totalListings: 10000, totalBuyers: 5000, fraudCasesResolved: 0 };

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: settings?.socialFacebook },
    { icon: Twitter, label: 'Twitter', href: settings?.socialTwitter },
    { icon: Linkedin, label: 'LinkedIn', href: settings?.socialLinkedin },
  ].filter(link => link.href);

  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        
        {/* Trust Stats Bar */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-3 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/10">
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-black text-primary">{(trustStats.totalListings / 1000).toFixed(1)}K+</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Verified Listings</p>
          </div>
          <div className="text-center">
            <p className="text-2xl md:text-3xl font-black text-primary">{(trustStats.totalBuyers / 1000).toFixed(1)}K+</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Happy Buyers</p>
          </div>
          <div className="col-span-2 md:col-span-1 text-center">
            <p className="text-2xl md:text-3xl font-black text-primary">{trustStats.fraudCasesResolved > 0 ? `${trustStats.fraudCasesResolved}%` : '100%'}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Fraud-Free Ops</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 md:grid-cols-5">
          <div className="md:col-span-2 space-y-6">
            <Link href="/" className="flex items-center space-x-2">
              <LandPlot className="h-6 w-6 text-primary" />
              <span className="font-black text-lg uppercase tracking-tighter">{platformName}</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              The premier ecosystem for verified land transactions in the Republic of Kenya. Built on a foundation of documentation first.
            </p>
            
            <div className="space-y-3 p-5 bg-accent/10 rounded-xl border border-accent/20">
              <p className="text-[10px] font-black uppercase tracking-widest text-accent">Security Pulse</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="agent@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10 bg-background"
                  required
                />
                <Button type="submit" size="sm" className="h-10 px-4 font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : subscriptionState === 'success' ? <CheckCircle2 className="h-4 w-4" /> : 'Join'}
                </Button>
              </form>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 md:col-span-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registry</h3>
              <ul className="space-y-2 text-sm font-bold">
                <li><Link href="/explore" className="hover:text-accent">All Records</Link></li>
                <li><Link href="/trust" className="hover:text-accent">SLA Policy</Link></li>
                <li><Link href="/favorites" className="hover:text-accent">Saved Vaults</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Protocols</h3>
              <ul className="space-y-2 text-sm font-bold">
                <li><Link href="/terms" className="hover:text-accent">Service Terms</Link></li>
                <li><Link href="/privacy" className="hover:text-accent">Privacy Ops</Link></li>
                <li><Link href="/report" className="hover:text-accent">Risk Report</Link></li>
              </ul>
            </div>
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact Nodes</h3>
              <ul className="space-y-3 text-sm font-bold">
                <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-accent" /> {contactEmail}</li>
                <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-accent" /> {supportPhone}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} {platformName}. High-Trust Infrastructure.
          </p>
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a key={social.label} href={social.href} className="text-muted-foreground hover:text-accent transition-colors">
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
