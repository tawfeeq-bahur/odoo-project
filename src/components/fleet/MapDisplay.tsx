
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
  traffic?: string;
};

export function MapDisplay({ plan, traffic }: MapDisplayProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [sourceCoords, setSourceCoords] = useState<GeocodeOutput | null>(null);
  const [destCoords, setDestCoords] = useState<GeocodeOutput | null>(null);
  const [snappedPolyline, setSnappedPolyline] = useState<L.LatLngTuple[]>([]);
  const [roadPolyline, setRoadPolyline] = useState<L.LatLngTuple[]>([]);
  const [altPolylines, setAltPolylines] = useState<L.LatLngTuple[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const startMarkerRef = useRef<L.Marker | null>(null);
  const endMarkerRef = useRef<L.Marker | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const routeGroupRef = useRef<L.LayerGroup | null>(null);
  const markerIndexRef = useRef<Map<string, L.Marker>>(new Map());
  const [poiList, setPoiList] = useState<Record<string, { name: string; lat: number; lon: number }[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const getRouteColor = () => {
    const level = (traffic || 'normal').toLowerCase();
    switch (level) {
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

        // Create panes to lock z-order so markers don't vanish behind tiles/line
        const map = mapInstance.current;
        if (map && !map.getPane('routePane')) {
          map.createPane('routePane');
          const rp = map.getPane('routePane') as HTMLElement; rp.style.zIndex = '450';
        }
        if (map && !map.getPane('poiPane')) {
          map.createPane('poiPane');
          const pp = map.getPane('poiPane') as HTMLElement; pp.style.zIndex = '650';
        }
    }
    
    const fetchAndSnapRoute = async () => {
        if (!plan) return;
        try {
            setError(null);
            setSnappedPolyline([]);
            setRoadPolyline([]);
            setAltPolylines([]);

            // 1. Get coordinates for source and destination (fast geocoder first)
            const fastGeocode = async (query: string): Promise<GeocodeOutput> => {
              try {
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
                const r = await fetch(url, { headers: { 'Accept': 'application/json' } });
                const j = await r.json();
                if (Array.isArray(j) && j[0]) {
                  return { latitude: parseFloat(j[0].lat), longitude: parseFloat(j[0].lon) };
                }
                throw new Error('nominatim empty');
              } catch {
                // Fallback to AI geocoder
                return await getCoordinates({ location: query });
              }
            };

            const [sourceRes, destRes] = await Promise.all([
                fastGeocode(plan.source),
                fastGeocode(plan.destination)
            ]);
            setSourceCoords(sourceRes);
            setDestCoords(destRes);

            // 2. Fetch a road-following route and alternatives from OSRM between source and destination
            try {
              const src = `${sourceRes.longitude},${sourceRes.latitude}`;
              const dst = `${destRes.longitude},${destRes.latitude}`;
              const url = `https://router.project-osrm.org/route/v1/driving/${src};${dst}?overview=full&geometries=geojson&alternatives=3&steps=false`;
              const resp = await fetch(url, { cache: 'no-store' });
              if (resp.ok) {
                const data = await resp.json();
                const routes: any[] = Array.isArray(data?.routes) ? data.routes : [];
                if (routes.length > 0) {
                  // Sort by shortest duration to ensure primary is the fastest path
                  routes.sort((a, b) => (a?.duration ?? Infinity) - (b?.duration ?? Infinity));
                  const primaryCoords: [number, number][] = routes[0]?.geometry?.coordinates || [];
                  const primary: L.LatLngTuple[] = primaryCoords.map(([lng, lat]: [number, number]) => [lat, lng]);
                  setRoadPolyline(primary);

                  const altList: L.LatLngTuple[][] = routes.slice(1).map(r => {
                    const c: [number, number][] = r?.geometry?.coordinates || [];
                    return c.map(([lng, lat]) => [lat, lng] as L.LatLngTuple);
                  });
                  setAltPolylines(altList);
                }
              }
            } catch (e) {
              console.warn('OSRM routing failed, will try snap fallback', e);
            }

            // 3. Fallback: Snap the AI-generated polyline to roads (if available)
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

    // Remove previous dynamic layers without touching base tiles or POIs
    if (routeLineRef.current) {
      try { map.removeLayer(routeLineRef.current); } catch {}
      routeLineRef.current = null;
    }
    if (routeGroupRef.current) {
      try { map.removeLayer(routeGroupRef.current); } catch {}
      routeGroupRef.current = null;
    }
    if (startMarkerRef.current) {
      try { map.removeLayer(startMarkerRef.current); } catch {}
      startMarkerRef.current = null;
    }
    if (endMarkerRef.current) {
      try { map.removeLayer(endMarkerRef.current); } catch {}
      endMarkerRef.current = null;
    }

    // Add new layers
    if (sourceCoords && destCoords) {
        const sourceLatLng: L.LatLngTuple = [sourceCoords.latitude, sourceCoords.longitude];
        const destLatLng: L.LatLngTuple = [destCoords.latitude, destCoords.longitude];

        const pinIcon = (color: string) => L.divIcon({
          className: 'custom-pin',
          html: `<div style="position:relative;width:22px;height:22px;transform:translate(-11px,-22px);">
                   <svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7z" fill="${color}" stroke="#ffffff" stroke-width="1"/>
                     <circle cx="12" cy="9" r="3.2" fill="#ffffff"/>
                   </svg>
                 </div>`
        });

        startMarkerRef.current = L.marker(sourceLatLng, { icon: pinIcon('#3b82f6'), zIndexOffset: 1000, pane: 'poiPane' }).addTo(map).bindPopup(`<b>Source:</b><br>${plan.source}`);
        endMarkerRef.current = L.marker(destLatLng, { icon: pinIcon('#ef4444'), zIndexOffset: 1000, pane: 'poiPane' }).addTo(map).bindPopup(`<b>Destination:</b><br>${plan.destination}`);
        
        const bounds = L.latLngBounds([sourceLatLng, destLatLng]);
        map.fitBounds(bounds, { padding: [50, 50] });

        if (roadPolyline.length > 0) {
            // Create a group so we can manage multiple lines together
            const group = L.layerGroup([], { pane: 'routePane' as any }).addTo(map);
            routeGroupRef.current = group;
            // Primary route in green
            L.polyline(roadPolyline, { color: '#16a34a', weight: 6 }).addTo(group);
            // Alternative routes in red
            altPolylines.forEach(alt => {
              L.polyline(alt, { color: '#ef4444', weight: 4, dashArray: '6,6' }).addTo(group);
            });
        } else if (snappedPolyline.length > 0) {
            // Fallback single route should still be primary style (green)
            routeLineRef.current = L.polyline(snappedPolyline, { color: '#16a34a', weight: 5, pane: 'routePane' }).addTo(map);
        }
    }
  }, [sourceCoords, destCoords, roadPolyline, altPolylines, snappedPolyline, plan]);

  // Fetch and render essential landmarks along the road route (no side panel)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;
    if (roadPolyline.length === 0) return;

    // Remove old markers layer
    if (markersLayerRef.current) {
      map.removeLayer(markersLayerRef.current);
    }
    markerIndexRef.current.clear();
    setPoiList({});

    const layer = L.layerGroup(undefined, { pane: 'poiPane' as any });
    markersLayerRef.current = layer;
    layer.addTo(map);

    const buildDivIcon = (bg: string, emoji: string) =>
      L.divIcon({
        className: 'poi-marker',
        html: `<div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;border:2px solid ${bg};background:${bg}22;box-shadow:0 2px 6px rgba(0,0,0,.25)"><span style="font-size:16px;line-height:1">${emoji}</span></div>`
      });

    const CATEGORY_STYLES: Record<string, { query: string; color: string; emoji: string }> = {
      Hospitals: { query: 'node[amenity=hospital]', color: '#ef4444', emoji: '🏥' },
      'Fuel Stations': { query: 'node[amenity=fuel]', color: '#f59e0b', emoji: '⛽' },
      Restaurants: { query: 'node[amenity=restaurant]', color: '#fb923c', emoji: '🍽️' },
      Hotels: { query: 'node[tourism=hotel]', color: '#3b82f6', emoji: '🏨' },
      Restrooms: { query: 'node[amenity=toilets]', color: '#10b981', emoji: '🚻' },
      'EV Stations': { query: 'node[amenity=charging_station]', color: '#22c55e', emoji: '⚡' },
    };

    const bounds = L.latLngBounds(roadPolyline as L.LatLngTuple[]);
    const south = bounds.getSouth();
    const west = bounds.getWest();
    const north = bounds.getNorth();
    const east = bounds.getEast();

    const overpassUrl = 'https://overpass-api.de/api/interpreter';

    const buildQuery = () => {
      const parts = Object.values(CATEGORY_STYLES).map(c => `${c.query}(${south},${west},${north},${east});`);
      return `[out:json][timeout:25];(${parts.join('')});out center;`;
    };

    const toMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371000;
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const pointToSegmentDistance = (pt: L.LatLngTuple, a: L.LatLngTuple, b: L.LatLngTuple) => {
      // Approximate using planar projection for small deltas
      const [py, px] = pt;
      const [ay, ax] = a;
      const [by, bx] = b;
      const A = { x: ax, y: ay };
      const B = { x: bx, y: by };
      const P = { x: px, y: py };
      const ABx = B.x - A.x, ABy = B.y - A.y;
      const APx = P.x - A.x, APy = P.y - A.y;
      const ab2 = ABx * ABx + ABy * ABy || 1e-12;
      let t = (APx * ABx + APy * ABy) / ab2;
      t = Math.max(0, Math.min(1, t));
      const proj = { x: A.x + t * ABx, y: A.y + t * ABy };
      return toMeters(P.y, P.x, proj.y, proj.x);
    };

    const distanceToPolyline = (pt: L.LatLngTuple, line: L.LatLngTuple[]) => {
      let best = Number.POSITIVE_INFINITY;
      for (let i = 1; i < line.length; i++) {
        const d = pointToSegmentDistance(pt, line[i - 1], line[i]);
        if (d < best) best = d;
      }
      return best;
    };

    const fetchPOIs = async () => {
      try {
        const query = buildQuery();
        const resp = await fetch(overpassUrl, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' }, body: `data=${encodeURIComponent(query)}` });
        if (!resp.ok) return;
        const data = await resp.json();
        const elements = Array.isArray(data?.elements) ? data.elements : [];

        // 1200 meters threshold to the route
        const MAX_DISTANCE_M = 1200;
        const counts: Record<string, number> = {};
        const LIMIT_PER_CAT = 20;

        const nextList: Record<string, { name: string; lat: number; lon: number }[]> = {};

        elements.forEach((e: any) => {
          const lat = e.lat || e.center?.lat;
          const lon = e.lon || e.center?.lon;
          if (typeof lat !== 'number' || typeof lon !== 'number') return;
          const pt: L.LatLngTuple = [lat, lon];
          const dist = distanceToPolyline(pt, roadPolyline);
          if (dist > MAX_DISTANCE_M) return;

          const tags = e.tags || {};
          let category: keyof typeof CATEGORY_STYLES | null = null;
          if (tags.amenity === 'hospital') category = 'Hospitals';
          else if (tags.amenity === 'fuel') category = 'Fuel Stations';
          else if (tags.amenity === 'restaurant') category = 'Restaurants';
          else if (tags.amenity === 'toilets') category = 'Restrooms';
          else if (tags.tourism === 'hotel') category = 'Hotels';
          if (!category) return;

          counts[category] = (counts[category] || 0) + 1;
          if (counts[category] > LIMIT_PER_CAT) return;

          const style = CATEGORY_STYLES[category];
          const icon = buildDivIcon(style.color, style.emoji);
          const name = (tags.name || tags.brand || category) as string;
          const key = `${name}-${lat.toFixed(5)}-${lon.toFixed(5)}`;
          const marker = L.marker(pt, { icon, zIndexOffset: 500, pane: 'poiPane' }).addTo(layer).bindPopup(`<strong>${name}</strong><br>${category}`);
          markerIndexRef.current.set(key, marker);
          if (!nextList[category]) nextList[category] = [];
          nextList[category].push({ name, lat, lon });
        });

        setPoiList(nextList);
      } catch (err) {
        console.warn('POI fetch failed', err);
      }
    };

    fetchPOIs();
  }, [roadPolyline]);


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
      {(plan.pointsOfInterest || poiList) && (
        <Card>
            <CardHeader>
                <CardTitle>Points of Interest Along Route</CardTitle>
                <CardDescription>Key locations identified by the AI near your suggested path.</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries({
                  Hospitals: (poiList.Hospitals || []) as any,
                  Restaurants: (poiList.Restaurants || []) as any,
                  Restrooms: (poiList.Restrooms || []) as any,
                  'Fuel Stations': (poiList['Fuel Stations'] || []) as any,
                  'EV Stations': (poiList['EV Stations'] || []) as any,
                }).map(([category, places]) => {
                  const open = expanded[category] ?? true;
                  return (
                    <div key={category} className="p-4 border rounded-lg bg-background">
                      <button
                        type="button"
                        className="font-semibold w-full flex items-center justify-between"
                        onClick={() => setExpanded(prev => ({ ...prev, [category]: !open }))}
                      >
                        <span className="flex items-center gap-2">
                          {POI_ICONS[category as keyof typeof POI_ICONS]}
                          {category}
                        </span>
                        <span className="text-xs text-muted-foreground">{open ? 'Hide' : 'Show'} ({(places as any[]).length})</span>
                      </button>
                      {open && (
                        <ul className="mt-2 space-y-1 text-sm text-muted-foreground pl-5">
                          {(places as { name: string; lat: number; lon: number }[]).map((place, index) => {
                            const key = `${place.name}-${place.lat.toFixed(5)}-${place.lon.toFixed(5)}`;
                            return (
                              <li key={index}>
                                <button
                                  type="button"
                                  className="underline hover:text-primary text-left"
                                  onClick={() => {
                                    const map = mapInstance.current;
                                    const marker = markerIndexRef.current.get(key);
                                    if (map && marker) {
                                      map.setView(marker.getLatLng(), Math.max(map.getZoom(), 15), { animate: true });
                                      marker.openPopup();
                                    }
                                  }}
                                >
                                  {place.name}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  );
                })}
            </CardContent>
        </Card>
      )}
    </>
  );
}
