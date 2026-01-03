// Types ported from web version

export type TourPackage = {
  id: string;
  name: string;
  destination: string;
  status: "Ongoing" | "Up-Coming" | "Completed";
  pricePerPerson: number;
  durationDays: number;
  lastUpdated: string; // ISO Date
  organizerName: string;
  inviteCode: string;
  members: string[] | { name: string; status: 'pending' | 'present' | 'absent' }[];
  gallery: string[];
  driveLink?: string;
  tripType: 'friends' | 'family' | 'school';
  travelStyle: 'day' | 'night' | 'whole-day';
  maxMembers: number;
  maxBudget: number;
  schoolName?: string;
  schoolLocation?: string;
  startDate?: string;
  endDate?: string;
};

export type Expense = {
  id: string;
  type: "Travel" | "Food" | "Hotel" | "Tickets" | "Misc";
  amount: number;
  date: string; // YYYY-MM-DD
  tourId?: string;
  description: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type ItineraryItem = {
  day: number;
  time: string;
  activity: string;
  notes?: string;
};

export type TripPlan = {
  distance: number;
  duration: number;
  estimatedCost: number;
  route: {
    coordinates: [number, number][];
  };
  itinerary: ItineraryItem[];
  attractions: {
    name: string;
    location: [number, number];
    description: string;
  }[];
};

export type Trip = {
  id: string;
  packageId: string;
  packageName: string;
  organizerName: string;
  source: string;
  destination: string;
  startDate: string;
  endDate?: string;
  status: "Ongoing" | "Completed" | "Planned" | "Cancelled";
  expenses: Expense[];
  members: string[];
  plan?: TripPlan;
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

export type User = {
  username: string;
};

export type PlaceSearchResult = {
  id: string;
  name: string;
  coordinates: [number, number];
  timestamp: string;
};
