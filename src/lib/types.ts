

import type { TripPlannerOutput } from "@/ai/flows/trip-planner";

export type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  model: string;
  type?: string; // Vehicle type (truck, van, etc.)
  year?: number; // Vehicle year
  fuelType?: string; // Fuel type (diesel, petrol, etc.)
  status: "On Trip" | "Idle" | "Maintenance";
  fuelLevel: number; // Percentage
  lastMaintenance: string; // ISO Date
  assignedTo: string | null;
};

export type Expense = {
  id:string;
  type: "Fuel" | "Toll" | "Maintenance" | "Health" | "Travel Allowance" | "Other";
  amount: number;
  date: string; // YYYY-MM-DD
  tripId?: string; // Optional: link to a specific trip or vehicle
  vehicleId?: string; // Optional: link to a specific vehicle
  employeeId?: string; // Optional: link to a specific employee
  status: 'pending' | 'approved' | 'rejected';
};

export type Trip = {
  id: string;
  vehicleId: string;
  employeeName: string;
  source: string;
  destination: string;
  startDate: string; // ISO Date
  endDate?: string; // ISO Date
  status: "Ongoing" | "Completed" | "Planned" | "Cancelled";
  expenses: Expense[];
  plan: TripPlannerOutput;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  disclaimer?: string;
};

export type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  initials: string;
};

export type Reminder = {
  id: string;
  medicationName: string;
  time: string;
  status: 'pending' | 'snoozed';
};

export type User = {
  username: string;
  role: 'admin' | 'employee';
  assignedVehicleId?: string | null;
}

export type EmployeeProfile = {
  id: string;
  name: string;
  employeeId: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  assignedVehicleId?: string | null;
  emergencyContacts?: Array<{
    name: string;
    phone: string;
    relationship: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export type OdometerReading = {
  id: string;
  driverId: string;
  vehicleId: string;
  tripId?: string;
  odometerValue: number;
  photoUrl: string;
  latitude: number;
  longitude: number;
  timestamp: string; // ISO Date
  submittedAt: string; // ISO Date
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  exifData?: {
    gpsLatitude?: number;
    gpsLongitude?: number;
    gpsTimestamp?: string;
    cameraMake?: string;
    cameraModel?: string;
  };
}

    