'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Listing } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { MapPin, ArrowRight, LandPlot } from 'lucide-react';

const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface ListingMapViewProps {
  listings: Listing[];
}

export function ListingMapView({ listings }: ListingMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        scrollWheelZoom: true,
      }).setView([0.0236, 37.9062], 6); // Center of Kenya

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstance.current);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').on('load', () => {
        setIsLoaded(true);
      });
    }

    // Clear existing markers
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapInstance.current?.removeLayer(layer);
      }
    });

    const markers: L.Marker[] = [];

    listings.forEach((listing) => {
      if (listing.latitude && listing.longitude) {
        const marker = L.marker([listing.latitude, listing.longitude], { icon: customIcon })
          .addTo(mapInstance.current!)
          .bindPopup(`
            <div class="w-64 overflow-hidden rounded-lg">
              <div class="relative h-32 w-full">
                <img src="${listing.images[0]?.url}" alt="${listing.title}" class="h-full w-full object-cover" />
              </div>
              <div class="p-3 space-y-2">
                <h4 class="font-bold text-sm line-clamp-1">${listing.title}</h4>
                <p class="text-xs text-muted-foreground">${listing.location}, ${listing.county}</p>
                <div class="flex items-center justify-between pt-2">
                  <span class="font-black text-primary text-sm">KES ${listing.price.toLocaleString()}</span>
                  <a href="/listings/${listing.id}" class="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">View Assets</a>
                </div>
              </div>
            </div>
          `, {
            maxWidth: 300,
            className: 'custom-map-popup'
          });
        markers.push(marker);
      }
    });

    // Fit map to markers if we have any
    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      mapInstance.current.fitBounds(group.getBounds(), { padding: [50, 50] });
    }

    return () => {
      // Cleanup happens only on full unmount, not on listings update
    };
  }, [listings]);

  return (
    <div className="relative h-[600px] w-full rounded-xl border border-border/40 overflow-hidden shadow-xl animate-in fade-in duration-500">
      {!isLoaded && <Skeleton className="absolute inset-0 z-10 h-full w-full" />}
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Floating Map Legend */}
      <div className="absolute bottom-6 left-6 z-[400] bg-background/90 backdrop-blur-md p-4 rounded-xl border shadow-lg max-w-xs animate-in slide-in-from-left-4 duration-700">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Discovery Pulse</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
            <p className="text-xs font-bold text-foreground">Verified Plot Markers</p>
          </div>
          <p className="text-[10px] leading-relaxed text-muted-foreground font-medium italic">
            "Direct map discovery reduces travel risk by 60%. Zoom in to verify proximity to infrastructure."
          </p>
        </div>
      </div>
    </div>
  );
}
