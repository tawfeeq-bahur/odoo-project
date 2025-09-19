
'use server';
/**
 * @fileOverview Provides AI-driven insights about tour packages and expenses.
 *
 * - getTourInsights - A function that returns insights based on tour data.
 * - TourInsightsInput - The input type for the getTourInsights function.
 * - TourInsightsOutput - The return type for the getTourInsights function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TourInsightsInputSchema = z.object({
  totalPackages: z.number().describe('The total number of tour packages.'),
  activeTours: z.number().describe('The number of tours currently active or planned.'),
  totalExpenses: z.number().describe('The total expenses for the month.'),
  totalMembers: z.number().describe('The total number of members across all tours.'),
});
export type TourInsightsInput = z.infer<typeof TourInsightsInputSchema>;

const TourInsightsOutputSchema = z.object({
  engagementInsight: z.string().describe("An insight about member engagement or tour popularity."),
  costSavingSuggestion: z.string().describe("A suggestion for how to save costs or optimize budget."),
  growthOpportunity: z.string().describe("A note about a potential growth opportunity, like a popular destination."),
});
export type TourInsightsOutput = z.infer<typeof TourInsightsOutputSchema>;


export async function getTourInsights(input: TourInsightsInput): Promise<TourInsightsOutput> {
  return tourInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tourInsightsPrompt',
  input: { schema: TourInsightsInputSchema },
  output: { schema: TourInsightsOutputSchema },
  model: 'googleai/gemini-2.5-flash',
  prompt: `
    You are a travel business analyst AI. Based on the following summary data for the current month, provide actionable insights for a tour organizer.

    - Total Tour Packages: {{totalPackages}}
    - Active/Planned Tours: {{activeTours}}
    - Total Expenses: ₹{{totalExpenses}}
    - Total Members: {{totalMembers}}

    Analyze this data and generate:
    1.  A concise insight about member engagement or tour popularity.
    2.  One specific, actionable cost-saving suggestion.
    3.  One suggestion for a growth opportunity (e.g., a new type of tour, a popular destination to focus on).

    Be brief, positive, and to the point.
  `,
});


const tourInsightsFlow = ai.defineFlow(
  {
    name: 'tourInsightsFlow',
    inputSchema: TourInsightsInputSchema,
    outputSchema: TourInsightsOutputSchema,
  },
  async (input) => {
    try {
        const {output} = await prompt(input);
        if (!output) {
          throw new Error("AI did not return an output.");
        }
        return output;
    } catch (error) {
        console.error("AI Insight Error:", error);
        return {
            engagementInsight: "Could not retrieve engagement insights at this time.",
            costSavingSuggestion: "Review expenses manually to find savings opportunities.",
            growthOpportunity: "AI analysis is temporarily unavailable. Please try again later."
        }
    }
  }
);
