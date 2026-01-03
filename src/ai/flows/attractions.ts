
'use server';
/**
 * @fileOverview Provides tourist attraction suggestions for a destination using AI
 * 
 * - getDestinationAttractions - Returns must-visit places for a destination
 * - TouristAttraction - Type definition for attraction data
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const AttractionInputSchema = z.object({
    destination: z.string().describe('The destination city/place for which to get attractions'),
    country: z.string().optional().describe('Country of the destination for better context'),
});

export type AttractionInput = z.infer<typeof AttractionInputSchema>;

const TouristAttractionSchema = z.object({
    name: z.string().describe('Name of the tourist attraction'),
    type: z.string().describe('Type of attraction (e.g., "Lake", "Palace", "Temple", "Monument")'),
    description: z.string().describe('Brief 1-2 line description of why to visit'),
    rating: z.number().min(1).max(5).describe('Estimated popularity rating out of 5'),
    mustVisit: z.boolean().describe('Whether this is a must-visit attraction'),
});

const AttractionsOutputSchema = z.object({
    destination: z.string(),
    attractions: z.array(TouristAttractionSchema).describe('List of top tourist attractions (8-12 items)'),
    bestTimeToVisit: z.string().describe('Best season/months to visit this destination'),
    travelTip: z.string().describe('One helpful travel tip for this destination'),
});

export type TouristAttraction = z.infer<typeof TouristAttractionSchema>;
export type AttractionsOutput = z.infer<typeof AttractionsOutputSchema>;

export async function getDestinationAttractions(input: AttractionInput): Promise<AttractionsOutput> {
    try {
        const result = await attractionsFlow(input);
        if (!result) throw new Error("AI returned no result");
        return result;
    } catch (e) {
        console.warn('AI attractions fetcher failed, returning fallback', e);
        return generateFallbackAttractions(input);
    }
}

function generateFallbackAttractions(input: AttractionInput): AttractionsOutput {
    return {
        destination: input.destination,
        attractions: [
            {
                name: `${input.destination} City Center`,
                type: 'Landmark',
                description: 'Explore the heart of the city with local markets and culture',
                rating: 4.0,
                mustVisit: true,
            },
            {
                name: 'Local Museum',
                type: 'Museum',
                description: 'Learn about the rich history and heritage',
                rating: 4.2,
                mustVisit: false,
            },
            {
                name: 'Popular Viewpoint',
                type: 'Viewpoint',
                description: 'Get panoramic views of the destination',
                rating: 4.5,
                mustVisit: true,
            },
        ],
        bestTimeToVisit: 'October to March',
        travelTip: 'Book accommodations in advance during peak season',
    };
}

const prompt = ai.definePrompt({
    name: 'attractionsPrompt',
    input: { schema: AttractionInputSchema },
    output: { schema: AttractionsOutputSchema },
    model: 'googleai/gemini-2.5-flash',
    prompt: `
        You are a travel expert specializing in tourist destinations in India and worldwide.
        
        Your task is to provide a comprehensive list of must-visit tourist attractions for {{destination}}{{#if country}}, {{country}}{{/if}}.
        
        Instructions:
        1. List 8-12 top tourist attractions in {{destination}}
        2. Include popular landmarks, monuments, natural wonders, temples, museums, and viewpoints
        3. For each attraction, provide:
           - Exact name of the place
           - Type (Lake, Fort, Temple, Beach, Museum, etc.)
           - Brief compelling description (1-2 lines)
           - Realistic rating (3.5-5.0 based on popularity)
           - Mark truly iconic places as mustVisit: true
        4. Provide the best time to visit this destination
        5. Give one practical travel tip
        
        Focus on accuracy and include only real, well-known attractions.
        Order attractions by importance and popularity.
    `,
});

const attractionsFlow = ai.defineFlow(
    {
        name: 'attractionsFlow',
        inputSchema: AttractionInputSchema,
        outputSchema: AttractionsOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error("AI attractions did not return valid output.");
        }
        return output;
    }
);
