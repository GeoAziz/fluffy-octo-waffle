'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export type CTAAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: LucideIcon;
};

export type CallToActionProps = {
  pretitle?: string;
  title: string;
  subtitle?: string;
  description?: string;
  primaryAction: CTAAction;
  secondaryAction?: CTAAction;
  className?: string;
  background?: 'default' | 'gradient' | 'muted';
};

/**
 * CallToAction - Premium CTA section with animated entrance
 * Ideal for bottom-of-page conversion prompts and feature sections
 */
export function CallToAction({
  pretitle,
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  className,
  background = 'default',
}: CallToActionProps) {
  const bgClasses = {
    default: 'bg-background border-border/40',
    gradient: 'bg-gradient-to-br from-primary/10 via-background to-accent/10 border-primary/20',
    muted: 'bg-muted/30 border-border/60',
  };

  return (
    <section
      className={cn(
        'rounded-2xl border p-8 md:p-12 text-center space-y-6',
        'animate-slide-up',
        bgClasses[background],
        className
      )}
    >
      {/* Pre-title */}
      {pretitle && (
        <div className="text-xs font-black uppercase tracking-widest text-primary/70">
          {pretitle}
        </div>
      )}

      {/* Main Title */}
      <div className="space-y-2">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-muted-foreground font-medium">{subtitle}</p>
        )}
      </div>

      {/* Description */}
      {description && (
        <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {description}
        </p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
        {/* Primary Action */}
        <Button
          asChild
          className="h-12 px-8 bg-primary hover:bg-primary-mid text-white font-black uppercase text-[11px] tracking-widest rounded-lg shadow-md hover:shadow-lg transition-all duration-300 active:scale-95"
        >
          <Link href={primaryAction.href} className="inline-flex items-center gap-2">
            {primaryAction.icon && <primaryAction.icon className="h-5 w-5" />}
            {primaryAction.label}
          </Link>
        </Button>

        {/* Secondary Action */}
        {secondaryAction && (
          <Button
            asChild
            variant="outline"
            className="h-12 px-8 border-border/40 hover:bg-accent/10 hover:text-accent font-black uppercase text-[11px] tracking-widest rounded-lg transition-all duration-300"
          >
            <Link href={secondaryAction.href} className="inline-flex items-center gap-2">
              {secondaryAction.icon && <secondaryAction.icon className="h-5 w-5" />}
              {secondaryAction.label}
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}

/**
 * CTARow - Horizontal CTA row with left content and right action
 * Compact version for mid-page placements
 */
export type CTARowProps = {
  title: string;
  description?: string;
  action: CTAAction;
  isDark?: boolean;
};

export function CTARow({ title, description, action, isDark = false }: CTARowProps) {
  const ActionIcon = action.icon;

  return (
    <div
      className={cn(
        'rounded-xl border p-6 md:p-8 flex items-center justify-between gap-6',
        'animate-slide-up',
        isDark
          ? 'bg-slate-950 border-slate-800'
          : 'bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20'
      )}
    >
      <div className="flex-1 space-y-1">
        <h3 className="font-bold text-base md:text-lg">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Button
        asChild
        className="h-10 px-6 bg-primary hover:bg-primary-mid text-white font-bold uppercase text-[10px] tracking-tight rounded-lg shadow-sm hover:shadow-md transition-all whitespace-nowrap flex-shrink-0"
      >
        <Link href={action.href} className="inline-flex items-center gap-2">
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {action.label}
        </Link>
      </Button>
    </div>
  );
}
