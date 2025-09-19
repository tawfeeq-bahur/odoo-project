
'use server';
/**
 * @fileOverview Provides a detailed plan for a vehicle trip, including cost and time estimates.
 *
 * - getTripPlan - A function that returns a plan for a given trip.
 * - TripPlannerInput - The input type for the getTripPlan function.
 * - TripPlannerOutput - The return type for the getTripPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TripPlannerInputSchema = z.object({
  source: z.string().describe('The starting point of the trip.'),
  destination: z.string().describe('The final destination of the trip.'),
  vehicleModel: z.string().describe('The mode of travel (e.g., "Car", "Bus", "Train").'),
  routeType: z.string().describe("The primary type of route (e.g., 'City', 'Highway')."),
  traffic: z.string().describe("The expected traffic conditions (e.g., 'Normal', 'Stop & Go', 'Light')."),
  loadKg: z.number().optional().describe("A dummy value, not used for tourism."),
  avg_speed_kmph: z.number().describe("The average speed expected for the trip in kmph."),
  max_speed_kmph: z.number().describe("The maximum speed expected for the trip in kmph."),
});
export type TripPlannerInput = z.infer<typeof TripPlannerInputSchema>;

const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const TripPlannerOutputSchema = z.object({
  source: z.string(),
  destination: z.string(),
  distance: z.string().describe("The estimated total distance of the trip in kilometers."),
  duration: z.string().describe("The estimated total duration of the trip (e.g., '5 hours 30 minutes')."),
  estimatedFuelCost: z.number().describe('Estimated cost of fuel for the trip.'),
  estimatedTollCost: z.number().describe('Estimated cost of tolls for the trip.'),
  suggestedRoute: z.string().describe('A summary of the suggested route or major highways to take.'),
  routePolyline: z.array(LatLngSchema).describe("An array of latitude/longitude points representing the simplified route path that follows major roads and highways."),
  disclaimer: z.string().describe('A disclaimer that all values are estimates and subject to change based on real-world conditions.'),
  routeType: z.string().optional().describe("The primary type of route (e.g., 'City', 'Highway')."),
  traffic: z.string().optional().describe("The expected traffic conditions (e.g., 'Normal', 'Stop & Go', 'Light')."),
  ecoTip: z.string().optional().describe("An eco-friendly travel tip for the trip."),
  pointsOfInterest: z.object({
    Hotels: z.array(z.string()).describe("A list of 2-3 well-rated hotels or stays near the route."),
    Restaurants: z.array(z.string()).describe("A list of 2-3 popular restaurants suitable for tourists along the route."),
    Monuments: z.array(z.string()).describe("A list of 2-3 key monuments or tourist attractions along the route."),
  }),
});
export type TripPlannerOutput = z.infer<typeof TripPlannerOutputSchema>;

export async function getTripPlan(input: TripPlannerInput): Promise<TripPlannerOutput> {
    try {
        const result = await tripPlannerFlow(input);
        if (!result) throw new Error("AI returned no result");
        return result;
    } catch (e) {
        console.warn('AI trip planner failed, returning fallback plan', e);
        return generateFallbackPlan(input);
    }
}

function generateFallbackPlan(input: TripPlannerInput): TripPlannerOutput {
    const distance = 450;
    const duration = '8 hours 30 minutes';
    
    return {
        source: input.source,
        destination: input.destination,
        distance: `${distance} km`,
        duration: duration,
        estimatedFuelCost: (distance / 12) * 105,
        estimatedTollCost: distance * 1.5,
        suggestedRoute: `Take the main national highway from ${input.source} to ${input.destination}.`,
        routePolyline: [],
        disclaimer: 'This is a fallback estimated plan. AI model is currently unavailable. Actual values may vary.',
        routeType: input.routeType,
        traffic: input.traffic,
        ecoTip: 'Consider using public transport for parts of your journey to reduce your carbon footprint.',
        pointsOfInterest: {
            Hotels: ["Hotel Grand View", "Riverside Inn"],
            Restaurants: ["Local Heritage Restaurant", "Highway Treats Dhaba"],
            Monuments: ["Historic Fort", "Ancient Temple Complex"]
        },
    };
}


const prompt = ai.definePrompt({
    name: 'tripPlannerPrompt',
    input: { schema: TripPlannerInputSchema },
    output: { schema: TripPlannerOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `
        You are an expert trip planner for Indian tourism.
        
        Your task is to create a detailed trip plan based on the provided travel information.
        
        Travel Information:
        - Mode of Travel: {{vehicleModel}}
        - Average Speed: {{avg_speed_kmph}} kmph
        - Maximum Speed: {{max_speed_kmph}} kmph

        Trip Conditions:
        - Source: {{source}}
        - Destination: {{destination}}
        - Route Type: {{routeType}}
        - Traffic: {{traffic}}

        Instructions:
        1.  Calculate the estimated distance in kilometers.
        2.  Estimate the trip duration, accounting for traffic, route type, and mode of travel.
        3.  Estimate the fuel/travel cost. Be realistic for India.
        4.  Estimate toll charges if traveling by road.
        5.  Provide a brief summary of the suggested route (e.g., "Take NH44 towards...").
        6.  Generate an accurate, detailed route polyline with enough points to trace the roads on a map.
        7.  Identify 2-3 of each of the following points of interest along the route: well-rated Hotels, popular Restaurants, and key Monuments/Attractions.
        8.  Include a standard disclaimer about the estimates.
    `,
});

const tripPlannerFlow = ai.defineFlow(
    {
        name: 'tripPlannerFlow',
        inputSchema: TripPlannerInputSchema,
        outputSchema: TripPlannerOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output;
    }
);
