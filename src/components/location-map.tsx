'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Leaflet's default icon paths are not set up correctly in Next.js by default.
// This code manually sets the paths for the marker icons.
const customIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


export default function LocationMap({ lat, lon, title }: { lat: number; lon: number; title: string }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    // Ensure this code runs only on the client
    if (typeof window === 'undefined') return;

    if (mapRef.current && !mapInstance.current) {
        // Initialize the map only once
        mapInstance.current = L.map(mapRef.current, {
            scrollWheelZoom: false, // Disable scroll wheel zoom
        }).setView([lat, lon], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        L.marker([lat, lon], { icon: customIcon }).addTo(mapInstance.current)
            .bindPopup(title)
            .openPopup();
    }

    // Cleanup function to remove the map instance when the component unmounts
    return () => {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    };
  }, [lat, lon, title]);

  return <div ref={mapRef} style={{ height: '400px', width: '100%', borderRadius: 'var(--radius)' }} />;
}