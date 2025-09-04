
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
  vehicleModel: z.string().describe('The model of the vehicle (e.g., "VNL 860", "Transit-250").'),
  routeType: z.string().describe("The primary type of route (e.g., 'City', 'Highway')."),
  traffic: z.string().describe("The expected traffic conditions (e.g., 'Normal', 'Stop & Go', 'Light')."),
  loadKg: z.number().optional().describe("The weight of the load in kilograms."),
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
  pointsOfInterest: z.object({
    Hospitals: z.array(z.string()).describe("A list of 2-3 major hospitals near the route."),
    'Fuel Stations': z.array(z.string()).describe("A list of 2-3 major brand fuel stations (e.g., IOCL, BPCL) near the route."),
    Restaurants: z.array(z.string()).describe("A list of 2-3 restaurants or dhabas suitable for truck drivers along the route."),
  }),
});
export type TripPlannerOutput = z.infer<typeof TripPlannerOutputSchema>;

export async function getTripPlan(input: TripPlannerInput): Promise<TripPlannerOutput> {
    return tripPlannerFlow(input);
}

const prompt = ai.definePrompt({
    name: 'tripPlannerPrompt',
    input: { schema: TripPlannerInputSchema },
    output: { schema: TripPlannerOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `
        You are an expert trip planner for Indian logistics.
        
        Your task is to create a detailed trip plan based on the provided vehicle and route information.
        
        Vehicle Information:
        - Model: {{vehicleModel}}
        - Load: {{loadKg}} kg (if provided)

        Trip Conditions:
        - Source: {{source}}
        - Destination: {{destination}}
        - Route Type: {{routeType}}
        - Traffic: {{traffic}}

        Instructions:
        1.  Calculate the estimated distance in kilometers.
        2.  Estimate the trip duration, accounting for traffic and route type.
        3.  Estimate the fuel cost. Be realistic, considering the vehicle model and load.
        4.  Estimate the toll charges based on the most likely highway route.
        5.  Provide a brief summary of the suggested route (e.g., "Take NH44 to Hyderabad...").
        6.  Generate an accurate, detailed route polyline. This polyline must follow the actual national highways and major roads. It should not be a straight line or a rough guess. It should have enough points to trace the roads on a map.
        7.  Identify 2-3 of each of the following points of interest along the route: major Hospitals, major brand Fuel Stations (like IOCL, BPCL, HPCL), and Restaurants/Dhabas suitable for drivers.
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
        return output!;
    }
);
