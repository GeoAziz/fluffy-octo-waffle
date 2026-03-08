'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * GlobalErrorBoundary - Catches JS errors anywhere in the child component tree.
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[GlobalErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
          <Card className="max-w-md border-risk/20 shadow-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-risk-light">
                <AlertTriangle className="h-8 w-8 text-risk" />
              </div>
              <CardTitle className="text-2xl font-black uppercase tracking-tight">System Recovery</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                The application encountered an unexpected runtime error. Your secure session remains active, but the current view crashed.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="rounded-md bg-black p-3 text-left overflow-auto max-h-40">
                  <code className="text-[10px] text-emerald-400 font-mono">
                    {this.state.error.toString()}
                  </code>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button onClick={this.handleReset} className="w-full font-black uppercase text-xs tracking-widest h-12">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Reload Application
              </Button>
              <Button asChild variant="outline" className="w-full font-black uppercase text-xs tracking-widest h-12">
                <Link href="/">
                  <Home className="mr-2 h-4 w-4" />
                  Return Home
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
