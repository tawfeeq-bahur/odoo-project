
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
  vehicleType: z.string().describe('The type of vehicle (e.g., "Truck", "Van", "Car").'),
  fuelType: z.string().describe('The type of fuel the vehicle uses (e.g., "Diesel", "Petrol").'),
  modelYear: z.number().describe("The manufacturing year of the vehicle (e.g., 2022)."),
  engineSizeLiters: z.number().describe("The vehicle's engine size in liters (e.g., 2.5)."),
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
  routePolyline: z.array(LatLngSchema).describe("An array of latitude/longitude points representing the simplified route path."),
  disclaimer: z.string().describe('A disclaimer that all values are estimates and subject to change based on real-world conditions.'),
  pointsOfInterest: z.object({
    Hospitals: z.array(z.string()).describe("A list of 2-3 major hospitals near the route."),
    'Fuel Stations': z.array(z.string()).describe("A list of 2-3 major brand fuel stations (e.g., IOCL, BPCL) near the route."),
    Restaurants: z.array(z\