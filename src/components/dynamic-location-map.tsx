'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Map = dynamic(() => import('@/components/location-map'), { 
  ssr: false, 
  loading: () => <Skeleton className="h-[400px] w-full" />
});

export function DynamicLocationMap(props: { lat: number; lon: number; title: string }) {
    return <Map {...props} />
}
