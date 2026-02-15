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

export function ListingCarousel({ images, title, className }: ListingCarouselProps) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
             <Image
                src={'https://picsum.photos/seed/fallback/1200/800'}
                alt={`${title} - placeholder image`}
                width={1200}
                height={800}
                className="aspect-video w-full object-cover"
                data-ai-hint={'landscape placeholder'}
                priority
            />
        )
    }

    return (
        <>
            <Carousel className={className}>
                <CarouselContent>
                {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <button
                        type="button"
                        className="relative block w-full"
                        onClick={() => {
                          setActiveIndex(index);
                          setLightboxOpen(true);
                        }}
                        aria-label={`Open image ${index + 1} in lightbox`}
                      >
                        <Image
                            src={image.url}
                            alt={`${title} - image ${index + 1}`}
                            width={1200}
                            height={800}
                            className="aspect-video w-full object-cover"
                            data-ai-hint={image.hint}
                            priority={index === 0}
                        />
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                          <Expand className="h-3.5 w-3.5" />
                          View
                        </span>
                      </button>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-4" />
                <CarouselNext className="absolute right-4" />
            </Carousel>

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
              <DialogContent className="max-w-6xl border-none bg-black/95 p-3 text-white sm:p-6">
                <DialogHeader className="sr-only">
                  <DialogTitle>Image lightbox for {title}</DialogTitle>
                  <DialogDescription>
                    Enlarged view of property images. Use arrow buttons to navigate between images.
                  </DialogDescription>
                </DialogHeader>
                <div className="relative">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="absolute right-2 top-2 z-20 text-white hover:bg-white/20 hover:text-white"
                    onClick={() => setLightboxOpen(false)}
                    aria-label="Close lightbox"
                  >
                    <X className="h-5 w-5" />
                  </Button>

                  <div className="relative mx-auto flex max-h-[80vh] items-center justify-center overflow-hidden rounded-md">
                    <Image
                      src={images[activeIndex].url}
                      alt={`${title} - enlarged image ${activeIndex + 1}`}
                      width={1800}
                      height={1200}
                      className="max-h-[80vh] w-auto object-contain"
                      data-ai-hint={images[activeIndex].hint}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-white/80">Image {activeIndex + 1} of {images.length}</p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                      >
                        <ChevronLeft className="mr-1 h-4 w-4" />
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                      >
                        Next
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        </>
    );
}
