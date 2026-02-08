'use client';

import Link from 'next/link';
import { LandPlot, Mail, Phone, Facebook, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

/**
 * BuyerFooter - Buyer-focused footer
 * Emphasizes trust, verification, educational content, and engagement
 */
export function BuyerFooter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-5 mb-8">
          {/* Brand Section */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <LandPlot className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Kenya Land Trust</span>
            </Link>
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              Your trusted marketplace for verified land transactions in Kenya. We connect buyers and sellers with transparency and confidence.
            </p>
            
            {/* Newsletter Signup */}
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground">Stay Updated</p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  required
                />
                <Button type="submit" size="sm" className="h-9">
                  {subscribed ? '✓' : 'Join'}
                </Button>
              </form>
              {subscribed && <p className="text-xs text-green-600">Thank you for subscribing!</p>}
            </div>
          </div>

          {/* Browse Section */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Browse</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">All Listings</Link></li>
              <li><Link href="/trust" className="text-muted-foreground hover:text-primary transition-colors">Trust Badges</Link></li>
              <li><Link href="/favorites" className="text-muted-foreground hover:text-primary transition-colors">Saved Properties</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">New Listings Alert</Link></li>
            </ul>
          </div>

          {/* Learn Section */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Learn</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/trust" className="text-muted-foreground hover:text-primary transition-colors">How We Verify</Link></li>
              <li><Link href="/trust" className="text-muted-foreground hover:text-primary transition-colors">Property Guides</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Ask Questions</Link></li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="font-semibold mb-4 text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/report" className="text-muted-foreground hover:text-primary transition-colors">Report Listing</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Support</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border/40 my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Kenya Land Trust. All rights reserved.
          </p>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <a href="mailto:support@kenyalandtrust.com" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="h-4 w-4" />
              support@kenyalandtrust.com
            </a>
            <a href="tel:+254700000000" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              +254 (0) 700 000 000
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            <a href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
              <Twitter className="h-4 w-4" />
            </a>
            <a href="#" aria-label="LinkedIn" className="text-muted-foreground hover:text-primary transition-colors">
              <Linkedin className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
