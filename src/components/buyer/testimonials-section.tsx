'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

/**
 * TestimonialsSection - Social proof through buyer testimonials
 * Demonstrates real user experiences with Kenya Land Trust
 */
export function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah Kipchoge',
      title: 'Land Buyer',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      quote: 'I was skeptical about buying land online, but the detailed documentation and trust badges gave me confidence. Closed the deal in 3 weeks!',
      rating: 5,
    },
    {
      name: 'James Mwangi',
      title: 'Property Investor',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
      quote: 'The verified listings saved me so much time. No more dealing with fake properties. Kenya Land Trust is transparent and trustworthy.',
      rating: 5,
    },
    {
      name: 'Amina Hassan',
      title: 'First-time Buyer',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=amina',
      quote: 'As a first-time land buyer, I was nervous. The badge system helped me understand property documentation instantly. Love the platform!',
      rating: 5,
    },
  ];

  return (
    <section className="py-12 sm:py-16 border-t">
      <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Trusted by Kenyans
          </h2>
          <p className="mt-2 text-muted-foreground">
            Real stories from buyers who found their perfect property
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 auto-rows-max">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden h-full">
              <CardContent className="pt-6 h-full flex flex-col">
                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-sm leading-relaxed text-foreground italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Metrics */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 p-6 sm:p-8 rounded-lg bg-muted/30 border">
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              2,500+
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Happy Buyers
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              Ksh 5B+
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Verified Transactions
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              500+
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Active Listings
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary">
              4.9★
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Average Rating
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
