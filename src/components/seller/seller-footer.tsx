'use client';

import Link from 'next/link';
import { LandPlot } from 'lucide-react';

/**
 * SellerFooter - Seller workspace footer
 * Shows seller resources and support
 */
export function SellerFooter() {
  return (
    <footer className="border-t bg-muted/30 text-sm">
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="font-semibold mb-3">Seller Resources</h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li><Link href="/contact" className="hover:text-primary">Get Support</Link></li>
              <li><Link href="/terms" className="hover:text-primary">Listing Guidelines</Link></li>
              <li><Link href="/trust" className="hover:text-primary">About Badges</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Account</h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li><Link href="/profile" className="hover:text-primary">Profile Settings</Link></li>
              <li><Link href="/settings" className="hover:text-primary">Preferences</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Legal</h3>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="font-semibold mb-3">Kenya Land Trust</h3>
            <p className="text-xs text-muted-foreground">
              Grow your real estate business with a trusted platform.
            </p>
          </div>
        </div>
        <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Kenya Land Trust. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
