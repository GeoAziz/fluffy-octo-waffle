'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type BreadcrumbItem = {
  href: string;
  label: string;
};

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('mb-4', className)}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <Fragment key={item.href}>
            <li>
              {index < items.length - 1 ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="font-medium text-foreground max-w-xs truncate" title={item.label}>
                  {item.label}
                </span>
              )}
            </li>
            {index < items.length - 1 && (
              <li role="presentation" aria-hidden="true">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
            )}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}
