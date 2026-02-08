'use client';

import Link from 'next/link';
import { LandPlot } from 'lucide-react';

/**
 * AdminFooter - Admin workspace footer
 * Minimal, workspace-focused footer
 */
export function AdminFooter() {
  return (
    <footer className="border-t bg-muted/20 text-xs text-muted-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <p>&copy; {new Date().getFullYear()} Kenya Land Trust Admin Panel</p>
        <ul className="flex gap-4">
          <li><Link href="/admin/settings" className="hover:text-primary">Settings</Link></li>
          <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
          <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
        </ul>
      </div>
    </footer>
  );
}
