
'use server';
/**
 * @fileOverview Provides AI-driven insights about the vehicle fleet.
 *
 * - getVehicleInsights - A function that returns insights based on fleet data.
 * - VehicleInsightsInput - The input type for the getVehicleInsights function.
 * - VehicleInsightsOutput - The return type for the getVehicleInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VehicleInsightsInputSchema = z.object({
  totalVehicles: z.number().describe('The total number of vehicles in the fleet.'),
  ongoingTrips: z.number().describe('The number of trips currently in progress.'),
  totalExpenses: z.number().describe('The total expenses for the month.'),
  fuelConsumption: z.number().describe('The total fuel consumption in liters for the month.'),
});
export type VehicleInsightsInput = z.infer<typeof VehicleInsightsInputSchema>;

const VehicleInsightsOutputSchema = z.object({
  efficiencyInsight: z.string().describe("An insight about the fleet's overall efficiency."),
  costSavingSuggestion: z.string().describe("A suggestion for how to save costs."),
  anomalyDetection: z.string().describe("A note about any detected anomalies, or a confirmation that everything looks normal."),
});
export type VehicleInsightsOutput = z.infer<typeof VehicleInsightsOutputSchema>;


export async function getVehicleInsights(input: VehicleInsightsInput): Promise<VehicleInsightsOutput> {
  return vehicleInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'vehicleInsightsPrompt',
  input: { schema: VehicleInsightsInputSchema },
  output: { schema: VehicleInsightsOutputSchema },
  model: 'googleai/gemini-2.0-flash-preview',
  prompt: `
    You are a fleet management analyst AI. Based on the following summary data for the current month, provide actionable insights.

    - Total Vehicles: {{totalVehicles}}
    - Ongoing Trips: {{ongoingTrips}}
    - Total Expenses: $ {{totalExpenses}}
    - Fuel Consumption: {{fuelConsumption}} Liters

    Analyze this data and generate:
    1.  A concise insight about the fleet's current operational efficiency.
    2.  One specific, actionable cost-saving suggestion.
    3.  One anomaly detection note. If no anomalies are apparent, state that "Operations look normal."

    Be brief and to the point.
  `,
});


const vehicleInsightsFlow = ai.defineFlow(
  {
    name: 'vehicleInsightsFlow',
    inputSchema: VehicleInsightsInputSchema,
    outputSchema: VehicleInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
