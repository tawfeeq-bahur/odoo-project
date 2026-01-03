'use server';
/**
 * @fileOverview Provides intelligent place search with AI-powered suggestions
 * 
 * - searchPlaces - Returns detailed information about searched places
 * - PlaceInfo - Type definition for place data
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PlaceSearchInputSchema = z.object({
    query: z.string().describe('The place/destination to search for'),
});

export type PlaceSearchInput = z.infer<typeof PlaceSearchInputSchema>;

const PlaceInfoSchema = z.object({
    name: z.string().describe('Full name of the place'),
    location: z.string().describe('State/Country location (e.g., "State of India", "Country")'),
    type: z.string().describe('Type of place (e.g., "Beach Destination", "Hill Station", "City", "Country")'),
    description: z.string().describe('Brief 2-3 line description'),
    bestFor: z.array(z.string()).describe('What this place is best known for (3-5 items)'),
    bestTimeToVisit: z.string().describe('Best season/months'),
    famousFor: z.array(z.string()).describe('Top 3 things the place is famous for'),
    nearbyPlaces: z.array(z.string()).describe('3-4 nearby tourist destinations'),
    travelTip: z.string().describe('One helpful travel tip'),
    estimatedBudget: z.string().describe('Estimated daily budget for travelers'),
});

const PlaceSearchOutputSchema = z.object({
    results: z.array(PlaceInfoSchema).describe('Top 3 matching places (in case of ambiguity)'),
    searchQuery: z.string().describe('The original search query'),
});

export type PlaceInfo = z.infer<typeof PlaceInfoSchema>;
export type PlaceSearchOutput = z.infer<typeof PlaceSearchOutputSchema>;

export async function searchPlaces(input: PlaceSearchInput): Promise<PlaceSearchOutput> {
    try {
        const result = await placeSearchFlow(input);
        if (!result) throw new Error("AI returned no result");
        return result;
    } catch (e) {
        console.warn('AI place search failed, returning fallback', e);
        return generateFallbackPlaceSearch(input);
    }
}

function generateFallbackPlaceSearch(input: PlaceSearchInput): PlaceSearchOutput {
    return {
        searchQuery: input.query,
        results: [
            {
                name: input.query,
                location: 'India',
                type: 'Destination',
                description: `${input.query} is a popular travel destination. Plan your trip and explore amazing places.`,
                bestFor: ['Sightseeing', 'Culture', 'Food'],
                bestTimeToVisit: 'October to March',
                famousFor: ['Tourist attractions', 'Local culture', 'Cuisine'],
                nearbyPlaces: [],
                travelTip: 'Book accommodations in advance during peak season',
                estimatedBudget: '₹2,000 - ₹5,000 per day',
            },
        ],
    };
}

const prompt = ai.definePrompt({
    name: 'placeSearchPrompt',
    input: { schema: PlaceSearchInputSchema },
    output: { schema: PlaceSearchOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `
        You are a travel search assistant that provides detailed information about places worldwide.
        
        The user searched for: "{{query}}"
        
        Your task:
        1. Identify the most likely place(s) matching this query
        2. If the query is ambiguous (e.g., "Paris" could be France or Texas), return top 2-3 matches
        3. For each place, provide comprehensive travel information
        4. Focus on accuracy and usefulness for travelers
        5. Include practical information like budget and travel tips
        
        Instructions:
        - Be specific about location (e.g., "Goa, India" not just "Goa")
        - Mention what the place is best known for
        - Provide realistic budget estimates
        - Give actionable travel tips
        - List actual nearby destinations
        
        If the query doesn't match any known place, still try to provide the best possible information.
    `,
});

const placeSearchFlow = ai.defineFlow(
    {
        name: 'placeSearchFlow',
        inputSchema: PlaceSearchInputSchema,
        outputSchema: PlaceSearchOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error("AI place search did not return valid output.");
        }
        return output;
    }
);
