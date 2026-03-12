
import { ai } from '@/ai/genkit';
import { z } from 'zod';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const TripPlannerInputSchema = z.object({
    source: z.string(),
    destination: z.string(),
    vehicleModel: z.string(),
    routeType: z.string(),
    traffic: z.string(),
    loadKg: z.number().optional(),
    avg_speed_kmph: z.number(),
    max_speed_kmph: z.number(),
    durationDays: z.number(),
    transportMode: z.enum(['road', 'train', 'flight', 'multi-modal']).optional(),
});
export type TripPlannerInput = z.infer<typeof TripPlannerInputSchema>;

const LatLngSchema = z.object({ lat: z.number(), lng: z.number() });

const ItineraryItemSchema = z.object({
    day: z.number(),
    time: z.string(),
    activity: z.string(),
    notes: z.string().optional(),
});

const TripPlannerOutputSchema = z.object({
    source: z.string(),
    destination: z.string(),
    distance: z.string(),
    duration: z.string(),
    estimatedFuelCost: z.number(),
    estimatedTollCost: z.number(),
    suggestedRoute: z.string(),
    routePolyline: z.array(LatLngSchema),
    disclaimer: z.string(),
    routeType: z.string().optional(),
    traffic: z.string().optional(),
    ecoTip: z.string().optional(),
    itinerary: z.array(ItineraryItemSchema),
});
export type TripPlannerOutput = z.infer<typeof TripPlannerOutputSchema>;

// AI generates ONLY these three fields
const AIOnlySchema = z.object({
    suggestedRoute: z.string(),
    ecoTip: z.string(),
    itinerary: z.array(ItineraryItemSchema),
});

// ─── In-memory cache ─────────────────────────────────────────────────────────

const tripCache = new Map<string, TripPlannerOutput>();

function cacheKey(input: TripPlannerInput): string {
    const src = normalizeCity(input.source);
    const dst = normalizeCity(input.destination);
    return `${src}-${dst}-${input.durationDays}d-${input.transportMode || 'road'}`;
}

// ─── City distance table (km) ────────────────────────────────────────────────

const CITY_DISTANCES: Record<string, number> = {
    'chennai-ooty': 540,        'ooty-chennai': 540,
    'chennai-coimbatore': 495,  'coimbatore-chennai': 495,
    'chennai-madurai': 460,     'madurai-chennai': 460,
    'chennai-bangalore': 350,   'bangalore-chennai': 350,
    'chennai-bengaluru': 350,   'bengaluru-chennai': 350,
    'chennai-hyderabad': 625,   'hyderabad-chennai': 625,
    'chennai-mumbai': 1330,     'mumbai-chennai': 1330,
    'chennai-delhi': 2200,      'delhi-chennai': 2200,
    'chennai-kolkata': 1670,    'kolkata-chennai': 1670,
    'chennai-trichy': 330,      'trichy-chennai': 330,
    'chennai-tiruchy': 330,     'tiruchy-chennai': 330,
    'chennai-tirunelveli': 620, 'tirunelveli-chennai': 620,
    'chennai-salem': 340,       'salem-chennai': 340,
    'chennai-vellore': 135,     'vellore-chennai': 135,
    'chennai-pondicherry': 160, 'pondicherry-chennai': 160,
    'chennai-puducherry': 160,  'puducherry-chennai': 160,
    'chennai-kanyakumari': 720, 'kanyakumari-chennai': 720,
    'madurai-ooty': 180,        'ooty-madurai': 180,
    'madurai-coimbatore': 215,  'coimbatore-madurai': 215,
    'madurai-bangalore': 440,   'bangalore-madurai': 440,
    'madurai-bengaluru': 440,   'bengaluru-madurai': 440,
    'madurai-tirunelveli': 160, 'tirunelveli-madurai': 160,
    'madurai-trichy': 135,      'trichy-madurai': 135,
    'madurai-tiruchy': 135,     'tiruchy-madurai': 135,
    'madurai-munnar': 195,      'munnar-madurai': 195,
    'madurai-rameswaram': 170,  'rameswaram-madurai': 170,
    'madurai-kanyakumari': 245, 'kanyakumari-madurai': 245,
    'madurai-kodaikanal': 120,  'kodaikanal-madurai': 120,
    'coimbatore-ooty': 86,      'ooty-coimbatore': 86,
    'coimbatore-bangalore': 365,'bangalore-coimbatore': 365,
    'coimbatore-bengaluru': 365,'bengaluru-coimbatore': 365,
    'coimbatore-munnar': 155,   'munnar-coimbatore': 155,
    'coimbatore-kochi': 187,    'kochi-coimbatore': 187,
    'bangalore-mumbai': 984,    'mumbai-bangalore': 984,
    'bengaluru-mumbai': 984,    'mumbai-bengaluru': 984,
    'bangalore-hyderabad': 570, 'hyderabad-bangalore': 570,
    'bengaluru-hyderabad': 570, 'hyderabad-bengaluru': 570,
    'bangalore-goa': 560,       'goa-bangalore': 560,
    'bengaluru-goa': 560,       'goa-bengaluru': 560,
    'bangalore-delhi': 2150,    'delhi-bangalore': 2150,
    'bengaluru-delhi': 2150,    'delhi-bengaluru': 2150,
    'bangalore-ooty': 270,      'ooty-bangalore': 270,
    'bengaluru-ooty': 270,      'ooty-bengaluru': 270,
    'bangalore-mysore': 145,    'mysore-bangalore': 145,
    'bengaluru-mysore': 145,    'mysore-bengaluru': 145,
    'bangalore-kodaikanal': 470,'kodaikanal-bangalore': 470,
    'bengaluru-kodaikanal': 470,'kodaikanal-bengaluru': 470,
    'mumbai-delhi': 1420,       'delhi-mumbai': 1420,
    'mumbai-goa': 590,          'goa-mumbai': 590,
    'mumbai-pune': 150,         'pune-mumbai': 150,
    'mumbai-hyderabad': 710,    'hyderabad-mumbai': 710,
    'mumbai-kolkata': 2050,     'kolkata-mumbai': 2050,
    'delhi-agra': 210,          'agra-delhi': 210,
    'delhi-jaipur': 280,        'jaipur-delhi': 280,
    'delhi-chandigarh': 260,    'chandigarh-delhi': 260,
    'delhi-amritsar': 450,      'amritsar-delhi': 450,
    'delhi-kolkata': 1480,      'kolkata-delhi': 1480,
    'delhi-varanasi': 820,      'varanasi-delhi': 820,
    'delhi-lucknow': 555,       'lucknow-delhi': 555,
    'delhi-shimla': 345,        'shimla-delhi': 345,
    'delhi-manali': 570,        'manali-delhi': 570,
    'delhi-haridwar': 220,      'haridwar-delhi': 220,
    'delhi-rishikesh': 240,     'rishikesh-delhi': 240,
    'hyderabad-kolkata': 1490,  'kolkata-hyderabad': 1490,
    'hyderabad-goa': 600,       'goa-hyderabad': 600,
    'kochi-munnar': 130,        'munnar-kochi': 130,
    'kochi-ooty': 190,          'ooty-kochi': 190,
    'kochi-thiruvananthapuram': 220,'thiruvananthapuram-kochi': 220,
    'kochi-alleppey': 85,       'alleppey-kochi': 85,
    'kolkata-darjeeling': 600,  'darjeeling-kolkata': 600,
    'kolkata-gangtok': 680,     'gangtok-kolkata': 680,
    'agra-jaipur': 235,         'jaipur-agra': 235,
    'agra-varanasi': 560,       'varanasi-agra': 560,
    'jaipur-udaipur': 420,      'udaipur-jaipur': 420,
    'jaipur-jodhpur': 340,      'jodhpur-jaipur': 340,
    'mysore-ooty': 120,         'ooty-mysore': 120,
    'mysore-coimbatore': 210,   'coimbatore-mysore': 210,
    'pune-goa': 460,            'goa-pune': 460,
    'manali-shimla': 255,       'shimla-manali': 255,
    'manali-leh': 480,          'leh-manali': 480,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeCity(name: string): string {
    return name.trim().toLowerCase()
        .replace(/\s+/g, '')
        .replace('bengaluru', 'bangalore')
        .replace('newdelhi', 'delhi')
        .replace('thiruvananathapuram', 'thiruvananthapuram');
}

export function estimateDistance(source: string, destination: string): number {
    const src = normalizeCity(source);
    const dst = normalizeCity(destination);
    if (src === dst) return 10;
    return CITY_DISTANCES[`${src}-${dst}`] || 350;
}

function formatDuration(distKm: number, avgSpeed = 60): string {
    const mins = Math.round((distKm / avgSpeed) * 60);
    const h = Math.floor(mins / 60), m = mins % 60;
    if (h === 0) return `${m} minutes`;
    if (m === 0) return `${h} hour${h > 1 ? 's' : ''}`;
    return `${h} hour${h > 1 ? 's' : ''} ${m} minutes`;
}

function calcCosts(distance: number, mode: string) {
    if (mode === 'flight')      return { fuel: Math.round(distance * 5.5), toll: 0 };
    if (mode === 'train')       return { fuel: Math.round(distance * 1.2), toll: 0 };
    if (mode === 'multi-modal') return { fuel: Math.round(distance * 3.5), toll: 0 };
    return { fuel: Math.round((distance / 12) * 105), toll: Math.round(distance * 1.5) };
}

export function generateFallbackPlan(input: TripPlannerInput): TripPlannerOutput {
    const distance = estimateDistance(input.source, input.destination);
    const mode = input.transportMode || 'road';
    const avgSpeed = mode === 'flight' ? 700 : (input.avg_speed_kmph || 60);
    const duration = mode === 'flight'
        ? (() => { const m = Math.round((distance / 700) * 60) + 90; return `${Math.floor(m/60)}h ${m%60}m (incl. airport)`; })()
        : formatDuration(distance, avgSpeed);
    const { fuel, toll } = calcCosts(distance, mode);
    return {
        source: input.source, destination: input.destination,
        distance: `${distance} km`, duration,
        estimatedFuelCost: fuel, estimatedTollCost: toll,
        suggestedRoute: mode === 'flight' ? `Flight from ${input.source} to ${input.destination}`
            : mode === 'train' ? `Train from ${input.source} to ${input.destination}`
            : `National highway route: ${input.source} to ${input.destination}`,
        routePolyline: [],
        disclaimer: 'Estimated plan. AI itinerary loading. Values may vary.',
        routeType: input.routeType, traffic: input.traffic,
        ecoTip: 'Consider public transport to reduce your carbon footprint.',
        itinerary: Array.from({ length: input.durationDays || 1 }).map((_, i) => ({
            day: i + 1, time: 'Morning',
            activity: i === 0 ? `Depart from ${input.source}` : `Explore ${input.destination}`,
            notes: i === 0 ? 'Start early.' : 'Check local guides.',
        })),
    };
}

// ─── AI prompt — itinerary ONLY (~500 tokens) ────────────────────────────────

const itineraryPrompt = ai.definePrompt({
    name: 'itineraryOnlyPrompt',
    input: { schema: TripPlannerInputSchema },
    output: { schema: AIOnlySchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `Indian trip planner. Return ONLY valid JSON. No extra text.

Trip: {{source}} to {{destination}} | {{durationDays}} days | {{transportMode}} | {{traffic}} traffic

Generate exactly:
1. suggestedRoute: one sentence (highway names or flight route)
2. ecoTip: one short eco tip
3. itinerary: {{durationDays}} days, 2 activities each. activity = max 8 words. Include real landmarks.`,
});

const itineraryFlow = ai.defineFlow(
    { name: 'itineraryFlow', inputSchema: TripPlannerInputSchema, outputSchema: AIOnlySchema },
    async (input) => {
        const { output } = await itineraryPrompt(input, {
            config: { temperature: 0.4, maxOutputTokens: 600 },
        });
        if (!output) throw new Error('No AI output');
        return output;
    }
);

// ─── Popular routes — preloaded silently on first request ────────────────────

const POPULAR_ROUTES = [
    { source: 'Chennai',   destination: 'Ooty',        durationDays: 2, transportMode: 'road' as const },
    { source: 'Chennai',   destination: 'Kodaikanal',  durationDays: 2, transportMode: 'road' as const },
    { source: 'Bangalore', destination: 'Ooty',        durationDays: 2, transportMode: 'road' as const },
    { source: 'Bangalore', destination: 'Mysore',      durationDays: 1, transportMode: 'road' as const },
    { source: 'Bangalore', destination: 'Goa',         durationDays: 3, transportMode: 'road' as const },
    { source: 'Mumbai',    destination: 'Goa',         durationDays: 3, transportMode: 'road' as const },
    { source: 'Mumbai',    destination: 'Pune',        durationDays: 1, transportMode: 'road' as const },
    { source: 'Delhi',     destination: 'Agra',        durationDays: 1, transportMode: 'road' as const },
    { source: 'Delhi',     destination: 'Jaipur',      durationDays: 2, transportMode: 'road' as const },
    { source: 'Delhi',     destination: 'Manali',      durationDays: 4, transportMode: 'road' as const },
    { source: 'Kochi',     destination: 'Munnar',      durationDays: 2, transportMode: 'road' as const },
    { source: 'Madurai',   destination: 'Rameswaram',  durationDays: 1, transportMode: 'road' as const },
];

let preloadDone = false;

function preloadPopularRoutes() {
    if (preloadDone) return;
    preloadDone = true;
    console.log('[Cache] Preloading', POPULAR_ROUTES.length, 'popular routes in background...');
    POPULAR_ROUTES.forEach(r => {
        const input: TripPlannerInput = {
            ...r, vehicleModel: 'Car', routeType: 'Highway',
            traffic: 'Normal', avg_speed_kmph: 60, max_speed_kmph: 100, loadKg: 0,
        };
        if (!tripCache.has(cacheKey(input))) {
            getTripPlan(input)
                .then(() => console.log(`[Cache] ✅ ${r.source} → ${r.destination}`))
                .catch(() => {});
        }
    });
}

// ─── Main exported function ───────────────────────────────────────────────────

export async function getTripPlan(input: TripPlannerInput): Promise<TripPlannerOutput> {
    if (!preloadDone) preloadPopularRoutes(); // fire-and-forget on first call

    const key = cacheKey(input);

    // ⚡ Cache hit → 0ms
    if (tripCache.has(key)) {
        console.log(`[Cache] HIT: ${key}`);
        return tripCache.get(key)!;
    }

    // Local math — instant
    const distance = estimateDistance(input.source, input.destination);
    const mode = input.transportMode || 'road';
    const avgSpeed = mode === 'flight' ? 700 : (input.avg_speed_kmph || 60);
    const duration = mode === 'flight'
        ? (() => { const m = Math.round((distance / 700) * 60) + 90; return `${Math.floor(m/60)}h ${m%60}m (incl. airport)`; })()
        : formatDuration(distance, avgSpeed);
    const { fuel, toll } = calcCosts(distance, mode);

    try {
        // AI does ONLY itinerary + route hint + eco tip (~500 tokens)
        const aiOut = await itineraryFlow(input);
        const result: TripPlannerOutput = {
            source: input.source, destination: input.destination,
            distance: `${distance} km`, duration,
            estimatedFuelCost: fuel, estimatedTollCost: toll,
            suggestedRoute: aiOut.suggestedRoute,
            routePolyline: [],
            disclaimer: 'All values are estimates and may vary based on real-world conditions.',
            routeType: input.routeType, traffic: input.traffic,
            ecoTip: aiOut.ecoTip,
            itinerary: aiOut.itinerary,
        };
        tripCache.set(key, result);
        return result;
    } catch (e) {
        console.warn('[TripPlanner] AI failed, caching fallback:', e);
        const fallback = generateFallbackPlan(input);
        tripCache.set(key, fallback);
        return fallback;
    }
}
