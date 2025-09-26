import { config } from 'dotenv';
config();

import '@/ai/flows/trip-planner.ts';
import '@/ai/flows/expense-parser.ts';
import '@/ai/flows/vehicle-insights.ts';
import '@/ai/flows/geocoder.ts';
import '@/ai/flows/road-snapper.ts';
import '@/ai/flows/transliteration.ts';
