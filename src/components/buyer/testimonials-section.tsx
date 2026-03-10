'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

/**
 * TestimonialsSection - Social proof through buyer testimonials
 * Demonstrates real user experiences with Kenya Land Trust.
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
    <section className="py-24 md:py-32 border-t bg-muted/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter md:text-5xl">
            Trusted by Kenyans
          </h2>
          <p className="mt-2 text-muted-foreground text-lg">
            Real stories from buyers who found their perfect property with certainty.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300">
              <CardContent className="pt-8 h-full flex flex-col">
                <div className="space-y-6">
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
                  <p className="text-base leading-relaxed text-foreground italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/40">
                    <Avatar className="h-12 w-12 border border-border/40">
                      <AvatarImage src={testimonial.image} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-bold text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                        {testimonial.title}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}