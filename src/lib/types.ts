

import type { TripPlannerOutput } from "@/ai/flows/trip-planner";

export type TourPackage = {
  id: string;
  name: string;
  destination: string;
  status: "Ongoing" | "Up-Coming" | "Completed";
  pricePerPerson: number;
  durationDays: number;
  lastUpdated: string; // ISO Date
  organizerName: string; // The user who created this package
  inviteCode: string; // Unique code to join the tour
  members: string[] | { name: string; status: 'pending' | 'present' | 'absent' }[]; // List of member usernames who joined, or student objects
  gallery: string[]; // List of image URLs
  driveLink?: string; // Unique Google Drive link for the tour
  tripType: 'friends' | 'family' | 'school';
  travelStyle: 'day' | 'night' | 'whole-day';
  maxMembers: number;
  maxBudget: number;
  schoolName?: string;
  schoolLocation?: string;
  startDate?: string; // ISO Date - Trip start date
  endDate?: string; // ISO Date - Trip end date
};

export type Expense = {
  id: string;
  type: "Travel" | "Food" | "Hotel" | "Tickets" | "Misc";
  amount: number;
  date: string; // YYYY-MM-DD
  tourId?: string; // Link to a specific tour
  description: string;
  submittedBy: string; // Username of the person who submitted it
  status: 'pending' | 'approved' | 'rejected';
};

export type ItineraryItem = {
  day: number;
  time: string;
  activity: string;
  notes?: string;
}

export type Trip = {
  id: string;
  packageId: string;
  packageName: string;
  organizerName: string;
  source: string;
  destination: string;
  startDate: string; // ISO Date
  endDate?: string; // ISO Date
  status: "Ongoing" | "Completed" | "Planned" | "Cancelled";
  expenses: Expense[];
  members: string[]; // Usernames of members in this trip
  plan: TripPlannerOutput;
};

export type Member = {
  id: string;
  name: string;
  contact: string;
  role: 'Organizer' | 'Member';
  tourId?: string;
};


export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  disclaimer?: string;
  timestamp?: string;
};

// Simplified User type - no more global role
export type User = {
  username: string;
}

// Travel preference answers collected during onboarding
export type TravelPreferences = {
  // What kind of scenery/environment the traveller loves
  sceneTypes: Array<'greenery' | 'roadways' | 'nature' | 'cities' | 'beaches' | 'mountains' | 'deserts' | 'heritage'>;
  // How often and how far they travel
  travelFrequency: 'daily' | 'weekends' | 'monthly' | 'long-haul';
  // Their usual group
  groupType: 'solo' | 'friends' | 'family' | 'school' | 'couple';
  // Budget comfort
  budgetRange: 'budget' | 'mid-range' | 'luxury';
  // Their interests
  interests: Array<'food' | 'adventure' | 'culture' | 'shopping' | 'wildlife' | 'photography' | 'spiritual' | 'sports'>;
  // Preferred pace
  travelPace: 'relaxed' | 'moderate' | 'fast-paced';
  // When they prefer to travel
  preferredTime: 'day' | 'night' | 'both';
  // Any dream destinations (free text)
  dreamDestinations: string;
  // Special needs / notes (free text)
  specialNotes: string;
}
