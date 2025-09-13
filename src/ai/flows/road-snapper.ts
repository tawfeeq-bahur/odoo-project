
'use server';
/**
 * @fileOverview A flow for snapping a series of GPS points to the nearest roads.
 *
 * - snapToRoads - A function that takes a path and returns a road-snapped polyline.
 * - RoadSnapperInput - The input type for the snapToRoads function.
 * - RoadSnapperOutput - The return type for the snapToRoads function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LatLngSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const RoadSnapperInputSchema = z.object({
  path: z.array(LatLngSchema).describe('An array of latitude/longitude points forming a path.'),
});
export type RoadSnapperInput = z.infer<typeof RoadSnapperInputSchema>;

const RoadSnapperOutputSchema = z.object({
  snappedPoints: z.array(LatLngSchema).describe('An array of latitude/longitude points representing the snapped polyline.'),
});
export type RoadSnapperOutput = z.infer<typeof RoadSnapperOutputSchema>;

export async function snapToRoads(input: RoadSnapperInput): Promise<RoadSnapperOutput> {
  try {
    return await roadSnapperFlow(input);
  } catch (e) {
    console.warn('AI road snapper failed, using fallback snapping', e);
    return getFallbackSnappedPoints(input.path);
  }
}

function getFallbackSnappedPoints(path: Array<{lat: number, lng: number}>): RoadSnapperOutput {
  // If we have a valid path, return it as-is
  if (path && path.length > 0) {
    return { snappedPoints: path };
  }
  
  // Return empty array if no path
  return { snappedPoints: [] };
}

const prompt = ai.definePrompt({
  name: 'roadSnapperPrompt',
  input: {schema: RoadSnapperInputSchema},
  output: {schema: RoadSnapperOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `
    You are a map routing expert. Your task is to take a rough series of GPS coordinates and snap them to the most likely roads to form a realistic route.

    The path provided is a simple polyline. Refine it by adding more points and adjusting the existing ones to make it follow the actual road network (highways, main roads).
    
    Path:
    {{#each path}}
      {{lat}},{{lng}}
    {{/each}}
    
    Return a detailed, road-snapped polyline with sufficient points to be drawn smoothly on a map.
  `,
});

const roadSnapperFlow = ai.defineFlow(
  {
    name: 'roadSnapperFlow',
    inputSchema: RoadSnapperInputSchema,
    outputSchema: RoadSnapperOutputSchema,
  },
  async (input) => {
    // In a real application, you would replace this with a call to the Google Roads API.
    // For example:
    // const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    // const pathString = input.path.map(p => `${p.lat},${p.lng}`).join('|');
    // const response = await fetch(`https://roads.googleapis.com/v1/snapToRoads?path=${pathString}&interpolate=true&key=${apiKey}`);
    // const data = await response.json();
    // return { snappedPoints: data.snappedPoints.map(p => ({ lat: p.location.latitude, lng: p.location.longitude })) };
    
    // For now, we simulate the snapping with an AI call.
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from road snapper prompt');
      }
      return output;
    } catch (e) {
      console.warn('Road snapper failed, falling back to original path', e);
      // Fallback: return the original path so the UI can still render a route
      return { snappedPoints: input.path };
    }
  }
);
