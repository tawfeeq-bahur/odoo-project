
'use client';

import { useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TripPlannerOutput } from '@/ai/flows/trip-planner';
import L from 'leaflet';
import { Hospital, Fuel, Utensils, Bed, Bath } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon path issue with bundlers
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const POI_ICONS: { [key: string]: React.ReactNode } = {
  Hospitals: <Hospital className="h-5 w-5 text-red-500" />,
  'Fuel Stations': <Fuel className="h-5 w-5 text-yellow-500" />,
  Restaurants: <Utensils className="h-5 w-5 text-orange-500" />,
  Hotels: <Bed className="h-5 w-5 text-blue-500" />,
  Restrooms: <Bath className="h-5 w-5 text-green-500" />,
};

type MapDisplayProps = {
  plan: TripPlannerOutput;
};

export function MapDisplay({ plan }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    // Set up default icon paths
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: iconRetinaUrl.src,
      iconUrl: iconUrl.src,
      shadowUrl: shadowUrl.src,
    });
    
    if (mapRef.current && !mapInstance.current) {
        mapInstance.current = L.map(mapRef.current).setView([20.5937, 78.9629], 5); // Default to India view

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
    }
    
    if(mapInstance.current && plan) {
      // For now, we don't have real coordinates for the route or POIs.
      // We'll just put markers for source and destination and fit the map to them.
      // A full implementation would parse a GeoJSON route from the AI.
      
      // Clear previous layers
      mapInstance.current.eachLayer(layer => {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
          mapInstance.current?.removeLayer(layer);
        }
      });
      
      // Using placeholder coordinates as we don't have a geocoding service implemented yet.
      const sourceCoords: L.LatLngTuple = [13.0827, 80.2707]; // Chennai
      const destCoords: L.LatLngTuple = [12.9716, 77.5946]; // Bengaluru

      L.marker(sourceCoords).addTo(mapInstance.current).bindPopup(`<b>Source:</b><br>${plan.source}`);
      L.marker(destCoords).addTo(mapInstance.current).bindPopup(`<b>Destination:</b><br>${plan.destination}`);
      
      const bounds = L.latLngBounds([sourceCoords, destCoords]);
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });

      // In a real app, you would draw the `plan.suggestedRoute` polyline here.
    }
  }, [plan]);

  return (
    <>
      <Card>
          <CardHeader>
              <CardTitle>Route Map & Points of Interest</CardTitle>
              <CardDescription>A visual representation of your route and notable locations.</CardDescription>
          </CardHeader>
          <CardContent>
              <div ref={mapRef} className="aspect-video w-full h-[400px] border-2 border-dashed rounded-lg bg-muted/30" />
          </CardContent>
      </Card>
      <Card>
          <CardHeader>
              <CardTitle>Points of Interest Along Route</CardTitle>
              <CardDescription>Key locations identified by the AI near your suggested path.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.pointsOfInterest && Object.entries(plan.pointsOfInterest).map(([category, places]) => (
                  <div key={category} className="p-4 border rounded-lg bg-background">
                      <h3 className="font-semibold flex items-center gap-2 mb-2">
                          {POI_ICONS[category as keyof typeof POI_ICONS]}
                          {category}
                      </h3>
                      <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                        {(places as string[]).map((place: string, index: number) => (
                          <li key={index}>{place}</li>
                        ))}
                      </ul>
                  </div>
              ))}
          </CardContent>
      </Card>
    </>
  );
}
