'use client';

import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  content: string;
  rating: number;
};

export type TestimonialCarouselProps = {
  testimonials: Testimonial[];
  autoPlay?: boolean;
  autoPlayDelay?: number;
};

/**
 * TestimonialCarousel - Animated testimonial showcase with auto-rotation
 * Features star ratings, avatar images, and cinematic transitions
 * Ideal for landing page social proof sections
 */
export function TestimonialCarousel({
  testimonials,
  autoPlay = true,
  autoPlayDelay = 5000,
}: TestimonialCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(autoPlay);

  useEffect(() => {
    if (!isAutoPlaying || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, autoPlayDelay);

    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlayDelay, testimonials.length]);

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setIsAutoPlaying(false);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
    setIsAutoPlaying(false);
  };

  if (testimonials.length === 0) return null;

  const testimonial = testimonials[current];

  return (
    <div className="w-full space-y-6">
      <Card className="border-border/40 bg-gradient-to-br from-background via-background/50 to-background/30 overflow-hidden">
        <div className="p-8 md:p-12 min-h-[280px] flex flex-col justify-between">
          {/* Star Rating */}
          <div className="flex items-center gap-2 mb-4 animate-fade-in">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star
                key={i}
                className="h-4 w-4 fill-accent text-accent"
              />
            ))}
          </div>

          {/* Testimonial Content */}
          <blockquote className="text-lg md:text-xl font-medium leading-relaxed text-foreground mb-8 italic animate-slide-up" style={{ animationDelay: '100ms' }}>
            &ldquo;{testimonial.content}&rdquo;
          </blockquote>

          {/* Author Info */}
          <div className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            {testimonial.avatar && (
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-muted border-2 border-accent/20">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-bold text-sm text-foreground">{testimonial.name}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-tight font-medium">
                {testimonial.role}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation */}
      {testimonials.length > 1 && (
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrev}
            className="h-10 w-10 p-0 border-border/40 hover:bg-accent/10 hover:text-accent"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Dot Indicators */}
          <div className="flex items-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrent(idx);
                  setIsAutoPlaying(false);
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  idx === current
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted hover:bg-muted-foreground/50 cursor-pointer'
                )}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleNext}
            className="h-10 w-10 p-0 border-border/40 hover:bg-accent/10 hover:text-accent"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * TestimonialGrid - Static grid display of multiple testimonials
 * Better for showing multiple perspectives at once
 */
export function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {testimonials.map((testimonial, idx) => (
        <Card
          key={testimonial.id}
          className={cn(
            'border-border/40 bg-card/50 backdrop-blur-sm p-6 animate-slide-up opacity-0',
            'hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
          )}
          style={{
            animationDelay: `${idx * 100}ms`,
            animationFillMode: 'forwards',
          }}
        >
          {/* Star Rating */}
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: testimonial.rating }).map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5 fill-accent text-accent"
              />
            ))}
          </div>

          {/* Content */}
          <p className="text-sm text-foreground leading-relaxed mb-6 line-clamp-4">
            &ldquo;{testimonial.content}&rdquo;
          </p>

          {/* Author */}
          <div className="flex items-center gap-3 pt-4 border-t border-border/40">
            {testimonial.avatar && (
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-muted">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <p className="font-bold text-xs text-foreground">{testimonial.name}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-tight">
                {testimonial.role}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
