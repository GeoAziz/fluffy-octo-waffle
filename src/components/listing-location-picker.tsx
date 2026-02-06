'use client';

import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useFormContext } from 'react-hook-form';
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from './ui/form';
import { Skeleton } from './ui/skeleton';

// Leaflet's default icon paths fix
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface ListingLocationPickerProps {
  initialPosition?: { lat: number; lon: number };
}

// Default to center of Kenya
const DEFAULT_CENTER = { lat: 0.0236, lon: 37.9062 }; 

export function ListingLocationPicker({ initialPosition = DEFAULT_CENTER }: ListingLocationPickerProps) {
  const { setValue, formState: { errors } } = useFormContext();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerInstance = useRef<L.Marker | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
        setIsLoaded(true);
        
        mapInstance.current = L.map(mapRef.current, {
            scrollWheelZoom: true,
        }).setView([initialPosition.lat, initialPosition.lon], initialPosition.lat === DEFAULT_CENTER.lat ? 6 : 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        markerInstance.current = L.marker([initialPosition.lat, initialPosition.lon], { 
            icon: customIcon,
            draggable: true 
        }).addTo(mapInstance.current);

        // Set initial form values if they are not already set
        setValue('latitude', initialPosition.lat);
        setValue('longitude', initialPosition.lon);

        // Handle map click
        mapInstance.current.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (markerInstance.current) {
                markerInstance.current.setLatLng([lat, lng]);
                setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
                setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
            }
        });

        // Handle marker drag
        markerInstance.current.on('dragend', () => {
             if (markerInstance.current) {
                const { lat, lng } = markerInstance.current.getLatLng();
                setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
                setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });
             }
        });
    }

    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPosition.lat, initialPosition.lon, setValue]);

  return (
      <FormItem>
          <FormLabel>Property Location on Map</FormLabel>
          <FormDescription>Click on the map or drag the marker to set the precise location.</FormDescription>
          <FormControl>
             <div className="h-[400px] w-full rounded-md border relative">
                {!isLoaded && <Skeleton className="h-full w-full" />}
                <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 'var(--radius)', zIndex: 0 }} />
            </div>
          </FormControl>
          {(errors.latitude || errors.longitude) && <FormMessage>Please select a location on the map.</FormMessage>}
      </FormItem>
  );
}
