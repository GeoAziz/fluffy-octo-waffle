'use client';

import { cn } from '@/lib/utils';

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  threshold?: number;
  duration?: number;
}

/**
 * StaggerContainer - Applies staggered reveal animations to child elements.
 * Each child animates in sequence with a delay for premium cinematic effect.
 */
export function StaggerContainer({
  children,
  className,
  threshold = 0.1,
  duration = 500,
}: StaggerContainerProps) {
  return (
    <div className={cn('group', className)}>
      {Array.isArray(children)
        ? children.map((child, idx) => (
            <div
              key={idx}
              className="animate-stagger-in opacity-0"
              style={{
                animationDelay: `${idx * 60}ms`,
                animationFillMode: 'forwards',
                animationDuration: `${duration}ms`,
              }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
