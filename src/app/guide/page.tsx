

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { TripPlannerOutput } from '@/ai/flows/trip-planner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Map as MapIcon, Milestone, Fuel, Clock, AlertTriangle, Route, Compass, Send, Plane, Train as TrainIcon, Car as CarIcon, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { useSharedState } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransportMode, getTransportRecommendation, calculateDistance } from '@/utils/distance-calculator';
import type { AttractionsOutput } from '@/ai/flows/attractions';
import { AttractionCard } from '@/components/AttractionCard';
import { RouteAdvisories } from '@/components/RouteAdvisories';
import { useLanguage } from '@/context/LanguageContext';

const MapDisplay = dynamic(
    () => import('@/components/fleet/MapDisplay').then((mod) => mod.MapDisplay),
    {
        ssr: false,
        loading: () => <Skeleton className="aspect-video w-full h-[400px] border-2 border-dashed rounded-lg bg-muted/30" />
    }
);


const formSchema = z.object({
    source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
    destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
    vehicleModel: z.string().min(1, "Please select a travel mode."),
    routeType: z.string({ required_error: "Route type is required." }).min(1, "Route type is required."),
    traffic: z.string({ required_error: "Traffic condition is required." }).min(1, "Traffic condition is required."),
    avg_speed_kmph: z.coerce.number().min(1, "Average speed must be at least 1 kmph").max(200, "Average speed cannot exceed 200 kmph"),
    max_speed_kmph: z.coerce.number().min(1, "Max speed must be at least 1 kmph").max(200, "Max speed cannot exceed 200 kmph"),
    packageId: z.string().min(1, "Please select a tour package for this route."),
});


export default function TourPlannerPage() {
    const [plan, setPlan] = useState<TripPlannerOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModeDialog, setShowModeDialog] = useState(false);
    const [selectedMode, setSelectedMode] = useState<TransportMode>('road');
    const [recommendedMode, setRecommendedMode] = useState<TransportMode>('road');
    const [distance, setDistance] = useState<number>(0);
    const [pendingFormData, setPendingFormData] = useState<any>(null);
    const [currentTransportMode, setCurrentTransportMode] = useState<TransportMode>('road');
    const [attractions, setAttractions] = useState<AttractionsOutput | null>(null);
    const [attractionsLoading, setAttractionsLoading] = useState(false);
    const [isAiUpgrading, setIsAiUpgrading] = useState(false); // true while AI is upgrading a shown fallback
    // Pre-geocoded coords passed to MapDisplay to avoid re-geocoding
    const [geocodedCoords, setGeocodedCoords] = useState<{ src: { latitude: number; longitude: number }; dst: { latitude: number; longitude: number } } | null>(null);
    const { user, packages, addTrip } = useSharedState();
    const { t } = useLanguage();
    const { toast } = useToast();

    // Local city coordinate lookup — no network needed for these cities
    const LOCAL_CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
        'chennai': { latitude: 13.0827, longitude: 80.2707 },
        'madras': { latitude: 13.0827, longitude: 80.2707 },
        'mumbai': { latitude: 19.0760, longitude: 72.8777 },
        'bombay': { latitude: 19.0760, longitude: 72.8777 },
        'delhi': { latitude: 28.6139, longitude: 77.2090 },
        'new delhi': { latitude: 28.6139, longitude: 77.2090 },
        'bengaluru': { latitude: 12.9716, longitude: 77.5946 },
        'bangalore': { latitude: 12.9716, longitude: 77.5946 },
        'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
        'kolkata': { latitude: 22.5726, longitude: 88.3639 },
        'calcutta': { latitude: 22.5726, longitude: 88.3639 },
        'pune': { latitude: 18.5204, longitude: 73.8567 },
        'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
        'jaipur': { latitude: 26.9124, longitude: 75.7873 },
        'surat': { latitude: 21.1702, longitude: 72.8311 },
        'lucknow': { latitude: 26.8467, longitude: 80.9462 },
        'kanpur': { latitude: 26.4499, longitude: 80.3319 },
        'nagpur': { latitude: 21.1458, longitude: 79.0882 },
        'visakhapatnam': { latitude: 17.6868, longitude: 83.2185 },
        'vizag': { latitude: 17.6868, longitude: 83.2185 },
        'indore': { latitude: 22.7196, longitude: 75.8577 },
        'bhopal': { latitude: 23.2599, longitude: 77.4126 },
        'patna': { latitude: 25.5941, longitude: 85.1376 },
        'vadodara': { latitude: 22.3072, longitude: 73.1812 },
        'coimbatore': { latitude: 11.0168, longitude: 76.9558 },
        'ludhiana': { latitude: 30.9010, longitude: 75.8573 },
        'agra': { latitude: 27.1767, longitude: 78.0081 },
        'nashik': { latitude: 19.9975, longitude: 73.7898 },
        'faridabad': { latitude: 28.4089, longitude: 77.3178 },
        'meerut': { latitude: 28.9845, longitude: 77.7064 },
        'rajkot': { latitude: 22.3039, longitude: 70.8022 },
        'kalyan': { latitude: 19.2403, longitude: 73.1305 },
        'varanasi': { latitude: 25.3176, longitude: 82.9739 },
        'kashi': { latitude: 25.3176, longitude: 82.9739 },
        'amritsar': { latitude: 31.6340, longitude: 74.8723 },
        'kochi': { latitude: 9.9312, longitude: 76.2673 },
        'cochin': { latitude: 9.9312, longitude: 76.2673 },
        'ernakulam': { latitude: 9.9816, longitude: 76.2999 },
        'thiruvananthapuram': { latitude: 8.5241, longitude: 76.9366 },
        'trivandrum': { latitude: 8.5241, longitude: 76.9366 },
        'kozhikode': { latitude: 11.2588, longitude: 75.7804 },
        'calicut': { latitude: 11.2588, longitude: 75.7804 },
        'thrissur': { latitude: 10.5276, longitude: 76.2144 },
        'madurai': { latitude: 9.9252, longitude: 78.1198 },
        'tiruchirappalli': { latitude: 10.7905, longitude: 78.7047 },
        'trichy': { latitude: 10.7905, longitude: 78.7047 },
        'tiruchy': { latitude: 10.7905, longitude: 78.7047 },
        'salem': { latitude: 11.6643, longitude: 78.1460 },
        'tirunelveli': { latitude: 8.7139, longitude: 77.7567 },
        'vellore': { latitude: 12.9165, longitude: 79.1325 },
        'thoothukudi': { latitude: 8.7642, longitude: 78.1348 },
        'tuticorin': { latitude: 8.7642, longitude: 78.1348 },
        'erode': { latitude: 11.3410, longitude: 77.7172 },
        'tiruppur': { latitude: 11.1085, longitude: 77.3411 },
        'dindigul': { latitude: 10.3624, longitude: 77.9695 },
        'thanjavur': { latitude: 10.7870, longitude: 79.1378 },
        'tanjore': { latitude: 10.7870, longitude: 79.1378 },
        'cuddalore': { latitude: 11.7447, longitude: 79.7689 },
        'kanyakumari': { latitude: 8.0883, longitude: 77.5385 },
        'rameswaram': { latitude: 9.2876, longitude: 79.3129 },
        'ooty': { latitude: 11.4102, longitude: 76.6950 },
        'udhagamandalam': { latitude: 11.4102, longitude: 76.6950 },
        'kodaikanal': { latitude: 10.2381, longitude: 77.4892 },
        'mysore': { latitude: 12.2958, longitude: 76.6394 },
        'mysuru': { latitude: 12.2958, longitude: 76.6394 },
        'munnar': { latitude: 10.0889, longitude: 77.0595 },
        'thekkady': { latitude: 9.6034, longitude: 77.1534 },
        'alleppey': { latitude: 9.4981, longitude: 76.3388 },
        'alappuzha': { latitude: 9.4981, longitude: 76.3388 },
        'goa': { latitude: 15.2993, longitude: 74.1240 },
        'panaji': { latitude: 15.4909, longitude: 73.8278 },
        'manali': { latitude: 32.2432, longitude: 77.1892 },
        'shimla': { latitude: 31.1048, longitude: 77.1734 },
        'dharamsala': { latitude: 32.2190, longitude: 76.3234 },
        'darjeeling': { latitude: 27.0360, longitude: 88.2627 },
        'gangtok': { latitude: 27.3389, longitude: 88.6065 },
        'shillong': { latitude: 25.5788, longitude: 91.8933 },
        'guwahati': { latitude: 26.1445, longitude: 91.7362 },
        'dehradun': { latitude: 30.3165, longitude: 78.0322 },
        'haridwar': { latitude: 29.9457, longitude: 78.1642 },
        'rishikesh': { latitude: 30.0869, longitude: 78.2676 },
        'nainital': { latitude: 29.3919, longitude: 79.4542 },
        'mussoorie': { latitude: 30.4598, longitude: 78.0644 },
        'jodhpur': { latitude: 26.2389, longitude: 73.0243 },
        'udaipur': { latitude: 24.5854, longitude: 73.7125 },
        'ajmer': { latitude: 26.4499, longitude: 74.6399 },
        'bikaner': { latitude: 28.0229, longitude: 73.3119 },
        'pushkar': { latitude: 26.4906, longitude: 74.5511 },
        'aurangabad': { latitude: 19.8762, longitude: 75.3433 },
        'shirdi': { latitude: 19.7673, longitude: 74.4762 },
        'kolhapur': { latitude: 16.7050, longitude: 74.2433 },
        'solapur': { latitude: 17.6599, longitude: 75.9064 },
        'amravati': { latitude: 20.9320, longitude: 77.7523 },
        'chandigarh': { latitude: 30.7333, longitude: 76.7794 },
        'patiala': { latitude: 30.3398, longitude: 76.3869 },
        'jalandhar': { latitude: 31.3260, longitude: 75.5762 },
        'jammu': { latitude: 32.7266, longitude: 74.8570 },
        'srinagar': { latitude: 34.0837, longitude: 74.7973 },
        'leh': { latitude: 34.1526, longitude: 77.5771 },
        'bhubaneswar': { latitude: 20.2961, longitude: 85.8245 },
        'puri': { latitude: 19.8135, longitude: 85.8312 },
        'cuttack': { latitude: 20.4625, longitude: 85.8828 },
        'raipur': { latitude: 21.2514, longitude: 81.6296 },
        'ranchi': { latitude: 23.3441, longitude: 85.3096 },
        'jamshedpur': { latitude: 22.8046, longitude: 86.2029 },
        'gwalior': { latitude: 26.2183, longitude: 78.1828 },
        'jabalpur': { latitude: 23.1815, longitude: 79.9864 },
        'allahabad': { latitude: 25.4358, longitude: 81.8463 },
        'prayagraj': { latitude: 25.4358, longitude: 81.8463 },
        'mathura': { latitude: 27.4924, longitude: 77.6737 },
        'vrindavan': { latitude: 27.5794, longitude: 77.6961 },
        'ayodhya': { latitude: 26.7922, longitude: 82.1998 },
        'pondicherry': { latitude: 11.9416, longitude: 79.8083 },
        'puducherry': { latitude: 11.9416, longitude: 79.8083 },
        'mahabalipuram': { latitude: 12.6269, longitude: 80.1927 },
        'kumbakonam': { latitude: 10.9602, longitude: 79.3845 },
        'chidambaram': { latitude: 11.3993, longitude: 79.6935 },
        'tiruvannamalai': { latitude: 12.2253, longitude: 79.0747 },
        'velankanni': { latitude: 10.6849, longitude: 79.8537 },
        'nagapattinam': { latitude: 10.7672, longitude: 79.8449 },
    };

    function localGeocode(city: string): { latitude: number; longitude: number } | null {
        const key = city.trim().toLowerCase();
        return LOCAL_CITY_COORDS[key] || null;
    }

    async function geocodeCity(city: string): Promise<{ latitude: number; longitude: number }> {
        // Try local lookup first — instant, no network
        const local = localGeocode(city);
        if (local) return local;
        // Fallback to Nominatim with proper headers
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city + ', India')}&limit=1`;
        const resp = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'Accept-Language': 'en',
                'User-Agent': 'TourJet/1.0 (travel planning app)',
            },
        });
        if (!resp.ok) throw new Error(`Nominatim error: ${resp.status}`);
        const data = await resp.json();
        if (!Array.isArray(data) || !data[0]) throw new Error(`City not found: ${city}`);
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }

    const plannerForm = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        mode: 'onChange',
        defaultValues: {
            source: '',
            destination: '',
            routeType: 'Highway',
            traffic: 'Normal',
            vehicleModel: 'Car',
            avg_speed_kmph: 60,
            max_speed_kmph: 100,
            packageId: '',
        },
    });

    const isFormValid = plannerForm.formState.isValid;
    const currentTraffic = plannerForm.watch('traffic');

    // Step 1: Calculate distance and show mode selection dialog
    async function onPlannerSubmit(values: z.infer<typeof formSchema>) {
        // Geocode source and destination to get coordinates
        try {
            // Parallel geocoding — both cities at the same time
            const [srcCoords, dstCoords] = await Promise.all([
                geocodeCity(values.source),
                geocodeCity(values.destination),
            ]);

            const srcLat = srcCoords.latitude;
            const srcLon = srcCoords.longitude;
            const dstLat = dstCoords.latitude;
            const dstLon = dstCoords.longitude;

            // Store coords so MapDisplay doesn't re-geocode the same cities
            setGeocodedCoords({
                src: { latitude: srcLat, longitude: srcLon },
                dst: { latitude: dstLat, longitude: dstLon },
            });

            // Calculate distance using proper Haversine formula
            const distanceKm = calculateDistance(srcLat, srcLon, dstLat, dstLon);

            // Get transport recommendation
            const recommendation = getTransportRecommendation(distanceKm);

            setDistance(recommendation.distance);
            setRecommendedMode(recommendation.recommendedMode);
            setPendingFormData(values);

            // If distance is short, proceed directly with road
            if (recommendation.distance < 300) {
                setSelectedMode('road');
                setCurrentTransportMode('road');
                proceedWithPlanGeneration(values, 'road');
            } else {
                // Show mode selection dialog
                setShowModeDialog(true);
            }
        } catch (err) {
            console.error('Distance calculation error:', err);
            setError('Error calculating distance. Please try again.');
        }
    }

    // Step 2: Generate plan with selected mode
    async function proceedWithPlanGeneration(values: z.infer<typeof formSchema>, mode: TransportMode) {
        setShowModeDialog(false);
        setCurrentTransportMode(mode);
        setIsLoading(true);
        setError(null);
        setPlan(null);
        setIsAiUpgrading(false);

        const selectedPackage = packages.find(p => p.id === values.packageId);
        if (!selectedPackage || !user) {
            setError('Could not find the selected package or user.');
            setIsLoading(false);
            return;
        }

        const planInput = {
            ...values,
            durationDays: selectedPackage.durationDays,
            loadKg: 100,
            transportMode: mode,
        };

        // ── INSTANT: show local fallback in <100ms so user sees something immediately ──
        const instantPlan = generateFallbackPlan(planInput);
        setPlan(instantPlan);
        setIsLoading(false);        // hide spinner — card is now visible
        setIsAiUpgrading(true);     // show subtle "AI upgrading" badge
        setAttractionsLoading(true);

        // ── BACKGROUND: fire AI in parallel, silently upgrade when ready ──
        try {
            const [aiPlan, attractionsResult] = await Promise.all([
                fetch('/api/ai/trip-plan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(planInput),
                }).then(r => r.json() as Promise<TripPlannerOutput>),
                fetch('/api/ai/attractions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destination: values.destination }),
                }).then(r => r.ok ? r.json() as Promise<AttractionsOutput> : null).catch(() => null),
            ]);

            addTrip({
                source: aiPlan.source,
                destination: aiPlan.destination,
                startDate: new Date().toISOString(),
                organizerName: user.username,
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                plan: aiPlan,
            });

            setPlan(aiPlan);                // replace fallback with AI plan
            setAttractions(attractionsResult);
            setIsAiUpgrading(false);
            setAttractionsLoading(false);

            toast({
                title: "AI Plan Ready!",
                description: `Detailed route for ${aiPlan.source} → ${aiPlan.destination} loaded.`
            });
        } catch (err) {
            // AI failed — fallback is already showing, just clear the upgrading badge
            console.warn('AI plan failed, keeping local fallback:', err);
            setIsAiUpgrading(false);
            setAttractionsLoading(false);
            addTrip({
                source: instantPlan.source,
                destination: instantPlan.destination,
                startDate: new Date().toISOString(),
                organizerName: user.username,
                packageId: selectedPackage.id,
                packageName: selectedPackage.name,
                plan: instantPlan,
            });
        }
    }

    // fetchAttractions is now called inline in parallel with getTripPlan above

    function generateFallbackPlan(input: z.infer<typeof formSchema> & { loadKg: number, durationDays: number, transportMode?: TransportMode }): TripPlannerOutput {
        // Import distance table logic inline
        const CITY_DISTANCES: Record<string, number> = {
            'chennai-ooty': 540, 'ooty-chennai': 540, 'chennai-coimbatore': 495, 'coimbatore-chennai': 495,
            'chennai-madurai': 460, 'madurai-chennai': 460, 'chennai-bangalore': 350, 'bangalore-chennai': 350,
            'chennai-bengaluru': 350, 'bengaluru-chennai': 350, 'chennai-hyderabad': 625, 'hyderabad-chennai': 625,
            'madurai-ooty': 180, 'ooty-madurai': 180, 'madurai-coimbatore': 215, 'coimbatore-madurai': 215,
            'coimbatore-ooty': 86, 'ooty-coimbatore': 86, 'bangalore-mysore': 145, 'mysore-bangalore': 145,
            'bengaluru-mysore': 145, 'mysore-bengaluru': 145, 'bangalore-ooty': 270, 'ooty-bangalore': 270,
            'bengaluru-ooty': 270, 'ooty-bengaluru': 270, 'mumbai-delhi': 1420, 'delhi-mumbai': 1420,
            'delhi-agra': 210, 'agra-delhi': 210, 'delhi-jaipur': 280, 'jaipur-delhi': 280,
            'bangalore-mumbai': 984, 'mumbai-bangalore': 984, 'bengaluru-mumbai': 984, 'mumbai-bengaluru': 984,
        };
        const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, '').replace('bengaluru', 'bangalore').replace('new delhi', 'delhi');
        const src = normalize(input.source);
        const dst = normalize(input.destination);
        const distance = src === dst ? 10 : (CITY_DISTANCES[`${src}-${dst}`] || 350);
        const mode = input.transportMode || 'road';

        // Calculate duration and costs based on mode
        let duration = '';
        let fuelCost = 0;
        let tollCost = 0;

        if (mode === 'flight' || mode === 'multi-modal') {
            const hours = Math.floor(distance / 800);
            const minutes = Math.round((distance / 800 - hours) * 60);
            duration = `${hours} hours ${minutes} minutes (flight time)`;
            fuelCost = distance * 8; // Airfare: ~₹8 per km
            tollCost = 0; // No tolls
        } else if (mode === 'train') {
            const hours = Math.floor(distance / 80);
            const minutes = Math.round((distance / 80 - hours) * 60);
            duration = `${hours} hours ${minutes} minutes`;
            fuelCost = distance * 1.5; // Train ticket: ~₹1.5 per km
            tollCost = 0; // No tolls
        } else {
            const hours = Math.floor(distance / 60);
            const minutes = Math.round((distance / 60 - hours) * 60);
            duration = `${hours} hours ${minutes} minutes`;
            fuelCost = (distance / 12) * 105; // Fuel: 12 km/L @ ₹105/L
            tollCost = distance * 1.5; // Toll: ₹1.5 per km
        }

        return {
            source: input.source,
            destination: input.destination,
            distance: `${distance} km`,
            duration: duration,
            estimatedFuelCost: fuelCost,
            estimatedTollCost: tollCost,
            suggestedRoute: mode === 'flight' ? `Flight from ${input.source} to ${input.destination}` : mode === 'train' ? `Train route from ${input.source} to ${input.destination}` : `Take the main national highway from ${input.source} to ${input.destination}.`,
            routePolyline: [],
            disclaimer: 'This is a fallback estimated plan. AI model is currently unavailable. Actual values may vary.',
            routeType: input.routeType,
            traffic: input.traffic,
            ecoTip: mode === 'train' ? 'Train travel is eco-friendly and scenic!' : mode === 'flight' ? 'Consider carbon offsetting for your flight.' : 'Consider using public transport to reduce carbon footprint.',
            itinerary: Array.from({ length: input.durationDays || 1 }).map((_, i) => ({
                day: i + 1,
                time: 'Morning',
                activity: i === 0 ? 'Start journey' : `Explore ${input.destination}`,
                notes: i === 0 ? 'Have a safe trip!' : 'Discover local sights.',
            })),
        };
    }


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 min-w-0 overflow-x-hidden">
            <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">{t("Route Planner")}</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                    {t("Generate a detailed travel plan with AI, including route, costs, and points of interest.")}
                </p>
            </div>

            {/* Transport Mode Selection Dialog */}
            <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Select Transport Mode")}</DialogTitle>
                        <DialogDescription>
                            {t("Distance")}: {distance.toFixed(0)} km - {recommendedMode === 'multi-modal' ? t('Flight recommended for this distance') : `${t(recommendedMode)} ${t('recommended')}`}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {distance < 800 && (
                            <Button
                                variant={selectedMode === 'road' ? 'default' : 'outline'}
                                className="w-full justify-start h-auto py-4"
                                onClick={() => {
                                    setSelectedMode('road');
                                    proceedWithPlanGeneration(pendingFormData, 'road');
                                }}
                            >
                                <CarIcon className="mr-3 h-6 w-6" />
                                <div className="text-left">
                                    <div className="font-semibold">{t("Road (Car/Bus)")}</div>
                                    <div className="text-sm text-muted-foreground">~{Math.round(distance / 60)} hours</div>
                                </div>
                            </Button>
                        )}

                        {distance >= 300 && distance < 2000 && (
                            <Button
                                variant={selectedMode === 'train' ? 'default' : 'outline'}
                                className="w-full justify-start h-auto py-4"
                                onClick={() => {
                                    setSelectedMode('train');
                                    proceedWithPlanGeneration(pendingFormData, 'train');
                                }}
                            >
                                <TrainIcon className="mr-3 h-6 w-6" />
                                <div className="text-left">
                                    <div className="font-semibold">{t("Train")}</div>
                                    <div className="text-sm text-muted-foreground">~{Math.round(distance / 80)} hours (Recommended)</div>
                                </div>
                            </Button>
                        )}

                        {distance >= 800 && (
                            <Button
                                variant={selectedMode === 'flight' || selectedMode === 'multi-modal' ? 'default' : 'outline'}
                                className="w-full justify-start h-auto py-4"
                                onClick={() => {
                                    setSelectedMode(distance > 2000 ? 'multi-modal' : 'flight');
                                    proceedWithPlanGeneration(pendingFormData, distance > 2000 ? 'multi-modal' : 'flight');
                                }}
                            >
                                <Plane className="mr-3 h-6 w-6" />
                                <div className="text-left">
                                    <div className="font-semibold">{t("Flight")} {distance > 2000 && `(${t('Multi-Modal')})`}</div>
                                    <div className="text-sm text-muted-foreground">~{Math.round(distance / 800)} hours (Fastest)</div>
                                </div>
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Form {...plannerForm}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                    <div className="lg:col-span-1 lg:sticky lg:top-16 lg:self-start flex flex-col gap-4 sm:gap-8">
                        <form onSubmit={plannerForm.handleSubmit(onPlannerSubmit)} className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("1. Trip Details")}</CardTitle>
                                    <CardDescription>{t("Enter the source and destination for your trip.")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={plannerForm.control}
                                        name="packageId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Tour Package")}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder={t("Assign this route to a tour")} /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {packages.map(pkg => (
                                                            <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={plannerForm.control}
                                        name="source"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Source")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Chennai, TN" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={plannerForm.control}
                                        name="destination"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Destination")}</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Manali, HP" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{t("2. Travel Conditions")}</CardTitle>
                                    <CardDescription>{t("Describe the conditions expected for this trip.")}</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={plannerForm.control}
                                        name="vehicleModel"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Primary Mode of Travel")}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder={t("Select travel mode")} /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Car">Car</SelectItem>
                                                        <SelectItem value="Bus">Bus</SelectItem>
                                                        <SelectItem value="Train">Train</SelectItem>
                                                        <SelectItem value="Plane">Plane</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={plannerForm.control}
                                        name="routeType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Route Type")}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder={t("Select route type")} /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="City">City</SelectItem>
                                                        <SelectItem value="Highway">Highway</SelectItem>
                                                        <SelectItem value="Mixed">City & Highway</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={plannerForm.control}
                                        name="traffic"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Expected Traffic")}</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder={t("Select traffic condition")} /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Light">Light</SelectItem>
                                                        <SelectItem value="Normal">Normal</SelectItem>
                                                        <SelectItem value="Stop & Go">Heavy / Stop & Go</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={plannerForm.control}
                                        name="avg_speed_kmph"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Average Speed (kmph)")}</FormLabel>
                                                <FormControl><Input type="number" placeholder="e.g., 60" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={plannerForm.control}
                                        name="max_speed_kmph"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("Maximum Speed (kmph)")}</FormLabel>
                                                <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                            <Button type="submit" disabled={isLoading || !isFormValid} className="w-full">
                                <Send className="mr-2 h-4 w-4" />
                                {isLoading ? t('Generating Plan...') : t('Generate Travel Plan')}
                            </Button>
                        </form>
                    </div>
                    <div className="lg:col-span-2">
                        {isLoading && <PlanSkeleton />}
                        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}

                        {!plan && !isLoading && (
                            <Card className="h-full">
                                <CardContent className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                                    <Compass className="h-24 w-24 mb-4 text-primary/50" />
                                    <h2 className="text-2xl font-semibold">{t("Your AI-Generated Travel Plan Will Appear Here")}</h2>
                                    <p className="max-w-md mt-2">{t('Fill out the fields and click "Generate Travel Plan" to see the magic happen.')}</p>
                                </CardContent>
                            </Card>
                        )}

                        {plan && (
                            <div className="space-y-8">
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <CardTitle className="text-lg sm:text-2xl font-headline break-words">{t("Travel Plan:")}{" "}{plan.source} {t("to")} {plan.destination}</CardTitle>
                                          {isAiUpgrading && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 animate-pulse">
                                              <span className="h-1.5 w-1.5 rounded-full bg-orange-500 inline-block"></span>
                                              AI enhancing plan…
                                            </span>
                                          )}
                                        </div>
                                        <CardDescription className="break-words">{plan.suggestedRoute}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 text-center">
                                            <InfoCard icon={Route} title={t("Distance")} content={plan.distance} />
                                            <InfoCard icon={Clock} title={t("Duration")} content={plan.duration} />
                                            <InfoCard
                                                icon={Fuel}
                                                title={currentTransportMode === 'flight' || currentTransportMode === 'multi-modal' ? t("Airfare") : currentTransportMode === 'train' ? t("Train Fare") : t("Fuel Cost")}
                                                content={`₹${plan.estimatedFuelCost.toFixed(2)}`}
                                            />
                                            {(currentTransportMode === 'road') && (
                                                <InfoCard icon={Milestone} title={t("Toll Cost")} content={`₹${plan.estimatedTollCost.toFixed(2)}`} />
                                            )}
                                        </div>
                                        <Separator />
                                        <Alert>
                                            <AlertTriangle className="h-5 w-5" />
                                            <AlertTitle>{t("Disclaimer")}</AlertTitle>
                                            <AlertDescription>
                                                {plan.disclaimer}
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>

                                {/* Route Advisories - Political rallies, festivals, road blocks, best times */}
                                <RouteAdvisories source={plan.source} destination={plan.destination} />

                                <MapDisplay
                                    plan={plan}
                                    traffic={currentTraffic}
                                    sourceLatLng={geocodedCoords?.src}
                                    destLatLng={geocodedCoords?.dst}
                                />

                                {/* Must-Visit Places Section */}
                                {(attractions || attractionsLoading) && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg break-words">
                                                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" /> <span className="break-words">{t("Must-Visit Places in")} {plan.destination}</span>
                                            </CardTitle>
                                            <CardDescription>
                                                {attractionsLoading ? t('Loading attractions...') : `${t('Top')} ${attractions?.attractions.length || 0} ${t('places to visit')}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {attractionsLoading ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                                        <Skeleton key={i} className="h-40 w-full rounded-lg" />
                                                    ))}
                                                </div>
                                            ) : attractions ? (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                                        {attractions.attractions.map((attraction, idx) => (
                                                            <AttractionCard key={idx} attraction={attraction} />
                                                        ))}
                                                    </div>
                                                    <Separator className="my-4" />
                                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                                        <div>
                                                            <strong className="text-primary">{t("Best Time to Visit:")} </strong>
                                                            <p className="text-muted-foreground mt-1">{attractions.bestTimeToVisit}</p>
                                                        </div>
                                                        <div>
                                                            <strong className="text-primary">{t("Travel Tip:")} </strong>
                                                            <p className="text-muted-foreground mt-1">{attractions.travelTip}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : null}
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Form>
        </div>
    );
}

const InfoCard = ({ icon: Icon, title, content }: { icon: React.ElementType, title: string, content: string }) => (
    <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-lg bg-muted/50 min-w-0 overflow-hidden">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary shrink-0" />
        <div className="min-w-0 w-full text-center">
            <h3 className="font-semibold text-xs sm:text-sm text-muted-foreground truncate">{title}</h3>
            <p className="text-base sm:text-xl font-bold truncate">{content}</p>
        </div>
    </div>
);

const PlanSkeleton = () => (
    <div className="space-y-4 sm:space-y-8">
        <Card>
            <CardHeader>
                <div className="space-y-2">
                    <Skeleton className="h-8 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    <Skeleton className="h-24 sm:h-28 w-full" />
                    <Skeleton className="h-24 sm:h-28 w-full" />
                    <Skeleton className="h-24 sm:h-28 w-full" />
                    <Skeleton className="h-24 sm:h-28 w-full" />
                </div>
                <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-48 w-full" />
    </div>
);
