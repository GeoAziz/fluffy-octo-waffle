import type { Metadata } from 'next';
import '../globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/providers';
import { ThemeProvider } from '@/components/theme-provider';
import { WebVitals } from '@/components/web-vitals';
import { GlobalErrorBoundary } from '@/components/resilience/global-error-boundary';
import { NetworkStatusProvider } from '@/components/resilience/network-status-provider';
import { OfflineNotice } from '@/components/resilience/offline-notice';

export const metadata: Metadata = {
  title: 'Kenya Land Trust',
  description: 'A trustworthy platform for land transactions in Kenya.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="w-full font-sans antialiased">
        <WebVitals />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          <NetworkStatusProvider>
            <AuthProvider>
              <GlobalErrorBoundary>
                <main id="main-content" className="min-h-screen w-full">
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
