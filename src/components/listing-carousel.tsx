'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Expand, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ListingImage } from '@/lib/types';

interface ListingCarouselProps {
    images: ListingImage[];
    title: string;
    className?: string;
}

/**
 * ListingCarousel - High-trust property showcase with accessibility protocols.
 * Supports keyboard navigation, screen reader descriptions, and focus trapping.
 */
export function ListingCarousel({ images, title, className }: ListingCarouselProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
             <div className="relative aspect-video w-full bg-muted overflow-hidden rounded-t-lg">
               <Image
                  src={'https://picsum.photos/seed/fallback/1200/800'}
                  alt={`${title} - Placeholder image showing typical Kenyan landscape`}
                  fill
                  className="object-cover"
                  data-ai-hint={'landscape placeholder'}
                  priority
              />
             </div>
        )
    }

    return (
        <>
            <Carousel 
              className={className} 
              aria-label={`Visual evidence vault for ${title}`}
              role="region"
              aria-roledescription="carousel"
            >
                <CarouselContent>
                {images.map((image, index) => (
                    <CarouselItem key={index} role="group" aria-roledescription="slide" aria-label={`Asset ${index + 1} of ${images.length}`}>
                      <button
                        type="button"
                        className="relative block w-full outline-none focus-visible:ring-4 focus-visible:ring-accent focus-visible:ring-offset-0"
                        onClick={() => {
                          setActiveIndex(index);
                          setLightboxOpen(true);
                        }}
                        aria-label={`Enlarge asset ${index + 1}: ${title}`}
                      >
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image
                              src={image.url}
                              alt={`${title} - property photo showing details (${index + 1}/${images.length})`}
                              fill
                              className="object-cover transition-transform duration-700 hover:scale-105"
                              data-ai-hint={image.hint}
                              priority={index === 0}
                              sizes="(min-width: 1280px) 800px, (min-width: 768px) 100vw, 100vw"
                          />
                        </div>
                        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-xl bg-black/60 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md shadow-lg" aria-hidden="true">
                          <Expand className="h-3.5 w-3.5" />
                          Inspect Asset
                        </span>
                      </button>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <div className="hidden sm:block">
                  <CarouselPrevious className="absolute left-4 bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white/20" aria-label="Inspect previous asset" />
                  <CarouselNext className="absolute right-4 bg-white/10 text-white border-white/20 backdrop-blur-md hover:bg-white/20" aria-label="Inspect next asset" />
                </div>
            </Carousel>

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent className="max-w-6xl border-none bg-black/95 p-3 text-white sm:p-6" aria-describedby="lightbox-description">
                <DialogHeader>
                  <DialogTitle className="text-white font-black uppercase tracking-widest text-sm">
                    Asset Inspection: {activeIndex + 1} of {images.length}
                  </DialogTitle>
                  <DialogDescription id="lightbox-description" className="text-white/60 text-xs font-medium">
                    Viewing original resolution proof for {title}. High-fidelity visual audit.
                  </DialogDescription>
                </DialogHeader>
                <div className="relative mt-4">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute -top-12 right-0 z-20 text-white hover:bg-white/20 h-10 w-10"
                    onClick={() => setLightboxOpen(false)}
                    aria-label="Close high-fidelity inspection"
                  >
                    <X className="h-6 w-6" aria-hidden="true" />
                  </Button>

                  <div className="relative mx-auto flex h-[70vh] items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-white/10 shadow-2xl">
                    <Image
                      src={images[activeIndex].url}
                      alt={`Full-resolution asset for ${title} (${activeIndex + 1}/${images.length})`}
                      width={1800}
                      height={1200}
                      className="max-h-full w-auto object-contain"
                      data-ai-hint={images[activeIndex].hint}
                      sizes="100vw"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest text-white/80" aria-live="polite">
                        Identity Sync: {activeIndex + 1} / {images.length}
                      </p>
                      <p className="text-[10px] text-white/40 font-medium">Original Metadata Preserved</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest h-11 px-6"
                        onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                        aria-label="View previous asset"
                      >
                        <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold uppercase text-[10px] tracking-widest h-11 px-6"
                        onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                        aria-label="View next asset"
                      >
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </>
    );
}
