

export type Vehicle = {
  id: string;
  name: string;
  plateNumber: string;
  model: string;
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

    