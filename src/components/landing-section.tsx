'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type LandingSectionProps = {
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
};

/**
 * LandingSection - Reusable wrapper for scroll-triggered animations
 * Applies consistent entrance animations to landing page sections
 * with optional stagger delays and directional reveals
 */
export function LandingSection({
  children,
  className,
  animated = true,
  delay = 0,
  direction = 'up',
}: LandingSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!animated || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay the visibility toggle to trigger animation
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [animated, delay]);

  // Map direction to animation class
  const directionMap = {
    up: 'animate-slide-up',
    down: 'animate-slide-down',
    left: 'animate-slide-left',
    right: 'animate-slide-right',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        animated && !isVisible && 'opacity-0 scale-95',
        animated && isVisible && `opacity-100 scale-100 ${directionMap[direction]}`,
        className
      )}
      style={animated && !isVisible ? { transform: `translate${direction === 'up' || direction === 'down' ? 'Y' : 'X'}(${direction === 'up' || direction === 'left' ? 20 : -20}px)` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * LandingSectionGrid - Grid layout for section content with staggered animations
 * Ideal for card grids, feature lists, testimonials, etc.
 */
export function LandingSectionGrid({
  children,
  className,
  columns = 3,
  gap = 'gap-6',
}: {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3 | 4;
  gap?: string;
}) {
  const colMap = {
    1: 'grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid', colMap[columns], gap, className)}>
      {children}
    </div>
  );
}

/**
 * LandingSectionItem - Individual animated item within a section grid
 * Automatically staggers animation based on index
 */
export function LandingSectionItem({
  children,
  className,
  index = 0,
}: {
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <div
      className={cn('animate-slide-up opacity-0', className)}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: 'forwards',
      }}
    >
      {children}
    </div>
  );
}
