'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import Image from 'next/image';

export type FeatureCard = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: string;
  href?: string;
};

export type FeatureShowcaseProps = {
  features: FeatureCard[];
  columns?: 1 | 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'expanded';
};

/**
 * FeatureShowcase - Animated grid of feature cards
 * Supports multiple variants and staggered animations
 * Ideal for landing page feature sections
 */
export function FeatureShowcase({
  features,
  columns = 3,
  variant = 'default',
}: FeatureShowcaseProps) {
  const columnClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  const variantClasses = {
    default: 'p-6',
    compact: 'p-4',
    expanded: 'p-8',
  };

  const variantHeights = {
    default: 'min-h-[240px]',
    compact: 'min-h-[180px]',
    expanded: 'min-h-[300px]',
  };

  return (
    <div className={cn('grid gap-6', columnClass[columns])}>
      {features.map((feature, idx) => {
        const Icon = feature.icon;
        const link = feature.href;

        const cardContent = (
          <div className={cn(
            'h-full flex flex-col',
            'rounded-2xl border border-border/40 bg-gradient-to-br from-background via-background/50 to-muted/30',
            'hover:shadow-lg hover:border-accent/40 transition-all duration-300',
            variantHeights[variant],
            variantClasses[variant],
            'animate-slide-up opacity-0'
          )}
            style={{
              animationDelay: `${idx * 80}ms`,
              animationFillMode: 'forwards',
            }}
          >
            {/* Icon Container */}
            <div className="mb-4">
              <div className="inline-flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 p-3 ring-1 ring-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h3 className="text-base font-bold leading-tight mb-2 text-foreground line-clamp-2">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed flex-grow line-clamp-3">
              {feature.description}
            </p>

            {/* Highlight / Link */}
            {feature.highlight && (
              <div className="mt-4 pt-4 border-t border-border/40">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  {feature.highlight}
                </span>
              </div>
            )}
          </div>
        );

        if (link) {
          return (
            <a
              key={feature.id}
              href={link}
              className="group"
              aria-label={feature.title}
            >
              <div className="group-hover:scale-105 transition-transform duration-300">
                {cardContent}
              </div>
            </a>
          );
        }

        return (
          <div key={feature.id}>
            {cardContent}
          </div>
        );
      })}
    </div>
  );
}

/**
 * FeatureHighlight - Prominent feature display with image
 * Use for primary feature explanations on landing page
 */
export type FeatureHighlightProps = {
  title: string;
  subtitle?: string;
  description: string;
  icon: LucideIcon;
  bullet?: string[];
  imageUrl?: string;
  reversed?: boolean;
};

export function FeatureHighlight({
  title,
  subtitle,
  description,
  icon: Icon,
  bullet,
  imageUrl,
  reversed = false,
}: FeatureHighlightProps) {
  return (
    <div className="grid gap-12 md:grid-cols-2 items-center animate-slide-up">
      {/* Content */}
      <div className={cn('space-y-6', reversed && 'md:order-last')}>
        <div className="space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 p-3 ring-1 ring-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-3xl font-black tracking-tight">{title}</h3>
          {subtitle && <p className="text-lg text-muted-foreground font-medium">{subtitle}</p>}
        </div>

        <p className="text-base text-muted-foreground leading-relaxed max-w-lg">
          {description}
        </p>

        {bullet && (
          <ul className="space-y-3 pt-4">
            {bullet.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-3 text-sm animate-slide-up opacity-0"
                style={{
                  animationDelay: `${(idx + 1) * 100}ms`,
                  animationFillMode: 'forwards',
                }}
              >
                <div className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">✓</span>
                </div>
                <span className="text-foreground font-medium leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Image / Visual */}
      {imageUrl && (
        <div className={cn('relative aspect-square overflow-hidden rounded-2xl bg-muted', reversed && 'md:order-first')}>
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
    </div>
  );
}
