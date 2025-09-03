
'use server';
/**
 * @fileOverview Provides a detailed plan for a vehicle trip, including cost and time estimates.
 *
 * - getTripPlan - A function that returns a plan for a given trip.
 * - TripPlannerInput - The input type for the getTripPlan function.
 * - TripPlannerOutput - The return type for the getTripPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TripPlannerInputSchema = z.object({
  source: z.string().describe('The starting point of the trip.'),
  destination: z.string().describe('The final destination of the trip.'),
  vehicleType: z.string().optional().describe('The type of vehicle (e.g., "Truck", "Van", "Car").'),
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
    You are an expert trip planner for a logistics company.
    Based on the following request, provide a detailed trip plan from the source to the destination.

    Source: {{source}}
    Destination: {{destination}}
    {{#if vehicleType}}
    Vehicle Type: {{vehicleType}}
    {{/if}}

    Calculate and provide the following details:
    - Total distance in kilometers.
    - Estimated duration of the trip.
    - Estimated fuel cost (assume an average fuel efficiency and a standard fuel price).
    - Estimated toll costs along the most common route.
    - A brief summary of the suggested route.

    Provide a clear, easy-to-understand, and well-structured response in the requested format.
    Finally, you MUST include the following disclaimer text exactly as it is written here in the 'disclaimer' field: "All values are estimates. Real-world costs and times may vary based on traffic, weather, and other conditions."
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
