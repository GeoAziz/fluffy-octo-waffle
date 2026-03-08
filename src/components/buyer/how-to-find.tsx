'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Search, FileCheck, MessageSquare } from 'lucide-react';

/**
 * HowToFind - Simple 3-step guide for first-time users
 * Shows users how to find their property
 */
export function HowToFind() {
  const steps = [
    {
      icon: Search,
      number: '1',
      title: 'Browse & Filter',
      description: 'Explore verified listings or use filters to narrow by location, price, size, and trust badge.',
    },
    {
      icon: FileCheck,
      number: '2',
      title: 'Check Documentation',
      description: 'Review verified documents, survey maps, and trust badges to assess property quality.',
    },
    {
      icon: MessageSquare,
      number: '3',
      title: 'Connect with Seller',
      description: 'Message the seller directly to ask questions, negotiate, and arrange a site visit.',
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            How to Find Your Property
          </h2>
          <p className="mt-2 text-muted-foreground">
            Three simple steps to your next land investment
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative">
                {/* Step */}
                <div className="mb-4 flex items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                      {step.number}
                    </span>
                  </div>
                </div>

                {/* Divider for desktop */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                )}

                {/* Content */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
