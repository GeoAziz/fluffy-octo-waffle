'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export type PageWrapperProps = {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl';
  padding?: 'compact' | 'default' | 'spacious';
  animated?: boolean;
  background?: 'default' | 'muted' | 'transparent';
  fullHeight?: boolean;
};

/**
 * PageWrapper - Consistent page layout with responsive padding and animations
 * Ensures visual consistency across all pages in the application
 * Provides proper content boundaries, animations, and accessibility
 */
export function PageWrapper({
  children,
  className,
  maxWidth = '7xl',
  padding = 'default',
  animated = true,
  background = 'default',
  fullHeight = false,
}: PageWrapperProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '7xl': 'max-w-7xl',
  };

  const paddingClasses = {
    compact: 'px-4 py-8 md:px-6 md:py-12',
    default: 'px-4 py-12 md:px-6 md:py-16 lg:px-8',
    spacious: 'px-4 py-16 md:px-6 md:py-24 lg:px-8',
  };

  const bgClasses = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    transparent: 'bg-transparent',
  };

  return (
    <div
      className={cn(
        'w-full',
        fullHeight && 'min-h-screen',
        bgClasses[background],
        animated && 'animate-fade-in',
        className
      )}
    >
      <div
        className={cn(
          'mx-auto w-full',
          maxWidthClasses[maxWidth],
          paddingClasses[padding]
        )}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * PageSection - Individual content section with optional separator and animations
 * Use multiple PageSections within a PageWrapper to organize content
 */
export function PageSection({
  children,
  className,
  withSeparator = false,
  animated = true,
  id,
  'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  className?: string;
  withSeparator?: boolean;
  animated?: boolean;
  id?: string;
  'aria-label'?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={cn(
        'w-full space-y-8',
        withSeparator && 'py-8 md:py-12 border-b border-border/40',
        animated && 'animate-slide-up',
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * PageTitle - Consistent page heading with subtitle
 * Use at the top of pages after PageWrapper
 */
export function PageTitle({
  title,
  subtitle,
  description,
  className,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3 md:space-y-4', className)}>
      {subtitle && (
        <p className="text-xs font-black uppercase tracking-widest text-primary/70">
          {subtitle}
        </p>
      )}
      <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
        {title}
      </h1>
      {description && (
        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

/**
 * PageGrid - Responsive grid container for content
 * Automatically handles mobile/tablet/desktop layouts
 */
export function PageGrid({
  children,
  columns = 1,
  className,
}: {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}) {
  const columnClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6 md:gap-8', columnClasses[columns], className)}>
      {children}
    </div>
  );
}
