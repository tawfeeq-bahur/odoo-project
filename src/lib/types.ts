

import type { TripPlannerOutput } from "@/ai/flows/trip-planner";

export type TourPackage = {
  id: string;
  name: string;
  destination: string;
  status: "Active" | "Draft" | "Archived";
  price: number; // Price per person
  durationDays: number;
  lastUpdated: string; // ISO Date
  organizer: string | null;
  inviteCode: string; // Unique code to join the tour
  members: string[]; // List of member names who joined
};

export type Expense = {
  id:string;
  type: "Travel" | "Food" | "Hotel" | "Tickets" | "Misc";
  amount: number;
  date: string; // YYYY-MM-DD
  tourId?: string; // Link to a specific tour
  description: string;
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
  organizerName: string;
  source: string;
  destination: string;
  startDate: string; // ISO Date
  endDate?: string; // ISO Date
  status: "Ongoing" | "Completed" | "Planned" | "Cancelled";
  expenses: Expense[];
  itinerary: ItineraryItem[];
  members: Member[];
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

export type User = {
  username: string;
  role: 'organizer' | 'member';
  assignedTourId?: string | null;
}
