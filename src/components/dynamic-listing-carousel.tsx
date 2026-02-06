'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import type { ListingImage } from '@/lib/types';

const Carousel = dynamic(() => import('@/components/listing-carousel').then(mod => mod.ListingCarousel), {
    ssr: false,
    // Using rounded-t-lg which works for both admin and listing detail page contexts
    loading: () => <Skeleton className="aspect-video w-full rounded-t-lg" /> 
});

export function DynamicListingCarousel(props: { images: ListingImage[]; title: string; className?: string }) {
    return <Carousel {...props} />;
}
