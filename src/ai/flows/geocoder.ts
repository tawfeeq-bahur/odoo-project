
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
  try {
    return await geocoderFlow(input);
  } catch (e) {
    console.warn('AI geocoder failed, using fallback coordinates', e);
    return getFallbackCoordinates(input.location);
  }
}

function getFallbackCoordinates(location: string): GeocodeOutput {
  // Fallback coordinates for common Indian cities
  const cityCoordinates: { [key: string]: { lat: number; lng: number } } = {
    'mumbai': { lat: 19.0760, lng: 72.8777 },
    'delhi': { lat: 28.7041, lng: 77.1025 },
    'bangalore': { lat: 12.9716, lng: 77.5946 },
    'chennai': { lat: 13.0827, lng: 80.2707 },
    'hyderabad': { lat: 17.3850, lng: 78.4867 },
    'pune': { lat: 18.5204, lng: 73.8567 },
    'kolkata': { lat: 22.5726, lng: 88.3639 },
    'coimbatore': { lat: 11.0168, lng: 76.9558 },
    'erode': { lat: 11.3410, lng: 77.7172 },
    'madurai': { lat: 9.9252, lng: 78.1198 },
    'salem': { lat: 11.6643, lng: 78.1460 },
    'tirupur': { lat: 11.1085, lng: 77.3411 },
    'trichy': { lat: 10.7905, lng: 78.7047 },
    'karur': { lat: 10.9601, lng: 78.0767 },
    'namakkal': { lat: 11.2212, lng: 78.1672 },
    'dindigul': { lat: 10.3450, lng: 77.9600 },
    'tirunelveli': { lat: 8.7139, lng: 77.7567 },
    'tuticorin': { lat: 8.7642, lng: 78.1348 },
    'thanjavur': { lat: 10.7869, lng: 79.1378 },
    'vellore': { lat: 12.9202, lng: 79.1500 },
    'tiruvannamalai': { lat: 12.2300, lng: 79.0600 },
    'cuddalore': { lat: 11.7447, lng: 79.7680 },
    'villupuram': { lat: 11.9394, lng: 79.5000 },
    'pondicherry': { lat: 11.9139, lng: 79.8145 },
    'ariyalur': { lat: 11.1374, lng: 79.0758 },
    'perambalur': { lat: 11.2400, lng: 78.8800 },
    'pudukkottai': { lat: 10.3800, lng: 78.8200 },
    'sivaganga': { lat: 9.8500, lng: 78.4800 },
    'ramanathapuram': { lat: 9.3700, lng: 78.8200 },
    'virudhunagar': { lat: 9.5800, lng: 77.9600 },
    'theni': { lat: 10.0100, lng: 77.4800 },
    'kanyakumari': { lat: 8.0883, lng: 77.5385 },
    'nilgiris': { lat: 11.4600, lng: 76.6400 },
    'dharmapuri': { lat: 12.1200, lng: 78.1600 },
    'krishnagiri': { lat: 12.5200, lng: 78.2200 }
  };
  
  const locationLower = location.toLowerCase();
  const cityKey = Object.keys(cityCoordinates).find(city => 
    cityLower.includes(city) || city.includes(locationLower)
  );
  
  if (cityKey) {
    return cityCoordinates[cityKey];
  }
  
  // Default to a central location in India if city not found
  return { lat: 20.5937, lng: 78.9629 };
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
