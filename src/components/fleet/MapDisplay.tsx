
'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TripPlannerOutput } from '@/ai/flows/trip-planner';
import { getCoordinates, GeocodeOutput } from '@/ai/flows/geocoder';
import { snapToRoads } from '@/ai/flows/road-snapper';
import L from 'leaflet';
import { Polyline } from 'react-leaflet';
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
  traffic: string;
};

export function MapDisplay({ plan, traffic }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [sourceCoords, setSourceCoords] = useState<GeocodeOutput | null>(null);
  const [destCoords, setDestCoords] = useState<GeocodeOutput | null>(null);
  const [snappedPolyline, setSnappedPolyline] = useState<L.LatLngTuple[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getRouteColor = () => {
    switch (traffic.toLowerCase()) {
      case 'stop & go':
        return 'red';
      case 'normal':
        return 'orange';
      case 'light':
        return 'green';
      default:
        return 'blue';
    }
  }

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
    
    const fetchAndSnapRoute = async () => {
        if (!plan) return;
        try {
            setError(null);
            setSnappedPolyline([]);

            // 1. Get coordinates for source and destination
            const [sourceRes, destRes] = await Promise.all([
                getCoordinates({ location: plan.source }),
                getCoordinates({ location: plan.destination })
            ]);
            setSourceCoords(sourceRes);
            setDestCoords(destRes);

            // 2. Snap the AI-generated polyline to roads
            if (plan.routePolyline && plan.routePolyline.length > 0) {
              const snapperResult = await snapToRoads({ path: plan.routePolyline });
              if (snapperResult.snappedPoints) {
                const positions = snapperResult.snappedPoints.map(p => [p.lat, p.lng] as L.LatLngTuple);
                setSnappedPolyline(positions);
              }
            }
        } catch (err) {
            console.error("Geocoding or Snapping error:", err);
            setError("Could not generate the accurate route. Please try again.");
        }
    };

    fetchAndSnapRoute();

  }, [plan]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear previous layers (markers, polylines)
    map.eachLayer(layer => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Add new layers
    if (sourceCoords && destCoords) {
        const sourceLatLng: L.LatLngTuple = [sourceCoords.latitude, sourceCoords.longitude];
        const destLatLng: L.LatLngTuple = [destCoords.latitude, destCoords.longitude];

        L.marker(sourceLatLng).addTo(map).bindPopup(`<b>Source:</b><br>${plan.source}`);
        L.marker(destLatLng).addTo(map).bindPopup(`<b>Destination:</b><br>${plan.destination}`);
        
        const bounds = L.latLngBounds([sourceLatLng, destLatLng]);
        map.fitBounds(bounds, { padding: [50, 50] });

        if (snappedPolyline.length > 0) {
            L.polyline(snappedPolyline, { color: getRouteColor(), weight: 5 }).addTo(map);
        }
    }
  }, [sourceCoords, destCoords, snappedPolyline, plan]);


  return (
    <>
      <Card>
          <CardHeader>
              <CardTitle>Route Map & Points of Interest</CardTitle>
              <CardDescription>A visual representation of your route and notable locations.</CardDescription>
          </CardHeader>
          <CardContent>
              {error ? (
                 <div className="text-center p-4 text-destructive-foreground bg-destructive/80 rounded-md">{error}</div>
              ) : (
                <div ref={mapRef} className="aspect-video w-full h-[400px] border-2 border-dashed rounded-lg bg-muted/30" />
              )}
          </CardContent>
      </Card>
      {plan.pointsOfInterest && (
        <Card>
            <CardHeader>
                <CardTitle>Points of Interest Along Route</CardTitle>
                <CardDescription>Key locations identified by the AI near your suggested path.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(plan.pointsOfInterest).map(([category, places]) => (
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
      )}
    </>
  );
}
