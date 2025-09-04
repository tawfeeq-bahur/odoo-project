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
  vehicleType: z.string().optional().describe('The type of vehicle (e.g., "Truck", "Van", "Car").'),
  fuelType: z.string().optional().describe('The type of fuel the vehicle uses (e.g., "Diesel", "Petrol").'),
  modelYear: z.number().optional().describe("The manufacturing year of the vehicle (e.g., 2022)."),
  engineSizeLiters: z.number().optional().describe("The vehicle's engine size in liters (e.g., 2.5)."),
  routeType: z.string().optional().describe("The primary type of route (e.g., 'City', 'Highway')."),
  traffic: z.string().optional().describe("The expected traffic conditions (e.g., 'Normal', 'Stop & Go')."),
  loadKg: z.number().optional().describe("The weight of the load in kilograms."),
});
export type TripPlannerInput = z.infer<typeof TripPlannerInputSchema>;

const TripPlannerOutputSchema = z.object({
  source: z.string(),
  destination: z.string(),
  distance: z.string().describe("The estimated total distance of the trip in kilometers."),
  duration: z.string().describe("The estimated total duration of the trip (e.g., '5 hours 30 minutes')."),
  estimatedFuelCost: z.number().describe('Estimated cost of fuel for the trip.'),
  estimatedTollCost: z.number().describe('Estimated cost of tolls for the trip.'),
  suggestedRoute: z.string().describe('A summary of the suggested route or major highways to take.'),
  disclaimer: z.string().describe('A disclaimer that all values are estimates and subject to change based on real-world conditions.'),
  pointsOfInterest: z.object({
    Hospitals: z.array(z.string()).describe("A list of 2-3 major hospitals near the route."),
    'Fuel Stations': z.array(z.string()).describe("A list of 2-3 major brand fuel stations (e.g., IOCL, BPCL) near the route."),
    Restaurants: z.array(z.string()).describe("A list of 2-3 well-rated restaurants or food courts suitable for travelers."),
    Hotels: z.array(z.string()).describe("A list of 2-3 suitable hotels for a stopover."),
    Restrooms: z.array(z.string()).describe("A list of 2-3 locations with clean public restrooms, like at major fuel stations or restaurants."),
  }).optional().describe("A list of key points of interest along the generated route."),
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
    You are an expert trip planner for a logistics company in India.
    Based on the following request, provide a detailed trip plan from the source to the destination.

    Source: {{source}}
    Destination: {{destination}}
    {{#if vehicleType}}
    Vehicle Type: {{vehicleType}}
    {{/if}}
     {{#if fuelType}}
    Fuel Type: {{fuelType}}
    {{/if}}
    {{#if modelYear}}
    Model Year: {{modelYear}}
    {{/if}}
    {{#if engineSizeLiters}}
    Engine Size: {{engineSizeLiters}}L
    {{/if}}
    {{#if routeType}}
    Route Type: {{routeType}}
    {{/if}}
    {{#if traffic}}
    Traffic: {{traffic}}
    {{/if}}
    {{#if loadKg}}
    Load: {{loadKg}} kg
    {{/if}}

    Your tasks:
    1.  Calculate and provide the following details, taking all vehicle and trip details into account for fuel efficiency and duration.
        - Total distance in kilometers.
        - Estimated duration of the trip.
        - Estimated fuel cost (assume an average fuel price in India, adjusted for vehicle type, age, load, and conditions).
        - Estimated toll costs along the most common national highway route.
        - A brief summary of the suggested route (major highways, key cities).

    2.  Identify a few key points of interest along the suggested route. For each category (Hospitals, Fuel Stations, Restaurants, Hotels, Restrooms), list 2-3 well-known and reliable options.

    3.  You MUST include the following disclaimer text exactly as it is written here in the 'disclaimer' field: "All values are estimates. Real-world costs and times may vary based on traffic, weather, and other conditions."
    
    Provide a clear, easy-to-understand, and well-structured response in the requested JSON format.
  `,
});


const tripPlannerFlow = ai.defineFlow(
  {
    name: 'tripPlannerFlow',
    inputSchema: TripPlannerInputSchema,
    outputSchema: TripPlannerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);