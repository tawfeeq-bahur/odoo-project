
'use server';
/**
 * @fileOverview A flow for getting latitude and longitude for a given location string.
 *
 * - getCoordinates - A function that returns the lat/long for a location.
 * - GeocodeInput - The input type for the getCoordinates function.
 * - GeocodeOutput - The return type for the getCoordinates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeocodeInputSchema = z.object({
  location: z.string().describe('The address or location name to geocode.'),
});
export type GeocodeInput = z.infer<typeof GeocodeInputSchema>;

const GeocodeOutputSchema = z.object({
  latitude: z.number().describe('The latitude of the location.'),
  longitude: z.number().describe('The longitude of the location.'),
});
export type GeocodeOutput = z.infer<typeof GeocodeOutputSchema>;

export async function getCoordinates(input: GeocodeInput): Promise<GeocodeOutput> {
  return geocoderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'geocoderPrompt',
  input: {schema: GeocodeInputSchema},
  output: {schema: GeocodeOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a geocoding expert. Your task is to find the precise latitude and longitude for the given location.
  
  Location: {{location}}
  
  Return only the coordinates in the requested JSON format.`,
});

const geocoderFlow = ai.defineFlow(
  {
    name: 'geocoderFlow',
    inputSchema: GeocodeInputSchema,
    outputSchema: GeocodeOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from geocoder prompt');
      }
      return output;
    } catch (e) {
        console.error(e);
        throw new Error('Unable to geocode location, AI model may be temporarily unavailable.')
    }
  }
);
