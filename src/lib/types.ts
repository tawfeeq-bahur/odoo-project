

import type { TripPlannerOutput } from "@/ai/flows/trip-planner";

export type TourPackage = {
  id: string;
  name: string;
  destination: string;
  status: "Active" | "Draft" | "Archived";
  price: number; // Price per person
  durationDays: number;
  lastUpdated: string; // ISO Date
  organizerName: string; // The user who created this package
  inviteCode: string; // Unique code to join the tour
  members: string[]; // List of member usernames who joined
  gallery: string[]; // List of image URLs
};

export type Expense = {
  id:string;
  type: "Travel" | "Food" | "Hotel" | "Tickets" | "Misc";
  amount: number;
  date: string; // YYYY-MM-DD
  tourId?: string; // Link to a specific tour
  description: string;
  submittedBy: string; // Username of the person who submitted it
  status: 'pending' | 'approved' | 'rejected';
};

export type ItineraryItem = {
    id: string;
    day: number;
    time: string;
    place: string;
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
  itinerary: ItineraryItem[];
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
};

// Simplified User type - no more global role
export type User = {
  username: string;
}
