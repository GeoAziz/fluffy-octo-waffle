import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { WebVitals } from '@/components/web-vitals';
import { GlobalErrorBoundary } from '@/components/resilience/global-error-boundary';
import { NetworkStatusProvider } from '@/components/resilience/network-status-provider';
import { OfflineNotice } from '@/components/resilience/offline-notice';

export const metadata: Metadata = {
  title: 'Kenya Land Trust - High-Trust Land Marketplace',
  description: 'Verified land listings in Kenya with transparent documentation and AI-powered risk assessment.',
};

/**
 * RootLayout - The foundational shell of the Kenya Land Trust platform.
 * Implements high-trust protocols for security, accessibility, and resilience.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className="w-full font-sans antialiased bg-background text-foreground">
        <WebVitals />
        
        {/* Accessibility: Skip Link for Keyboard Navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to main content
        </a>

        <ThemeProvider>
          <NetworkStatusProvider>
            <AuthProvider>
              <GlobalErrorBoundary>
                <main id="main-content" className="min-h-screen w-full flex flex-col">
                  <OfflineNotice />
                  {children}
                </main>
                <Toaster />
              </GlobalErrorBoundary>
            </AuthProvider>
          </NetworkStatusProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
