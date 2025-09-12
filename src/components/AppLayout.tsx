

"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, Truck, Settings, User, Map, DollarSign, ScanLine, LogOut, BarChart, LifeBuoy, Route, Bell, Users, Send, HeartPulse } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import type { Vehicle, Expense, User as UserType, Trip } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";
import LoginPage from "@/app/login/page";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { TripPlannerOutput } from "@/ai/flows/trip-planner";

const adminMenuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/guide", label: "Assign Trip", icon: Send },
  { href: "/trip-summary", label: "Trip Summary", icon: Route },
  { href: "/vehicles", label: "Vehicle Management", icon: Truck },
  { href: "/employees", label: "Employee Management", icon: Users },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart },
];

const employeeMenuItems = [
  { href: "/", label: "My Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Route },
  { href: "/vehicle-health", label: "Vehicle Health", icon: HeartPulse },
  { href: "/scanner", label: "Log Expense", icon: ScanLine },
  { href: "/profile", label: "My Profile", icon: User },
  { href: "/support", label: "Support", icon: LifeBuoy },
];

// Define the shape of the shared state
interface SharedState {
  vehicles: Vehicle[];
  expenses: Expense[];
  trips: Trip[];
  user: UserType | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  updateVehicleFuelLevel: (vehicleId: string, fuelLevel: number) => void;
  deleteVehicle: (vehicleId: string) => void;
  assignVehicle: (vehicleId: string, assignedTo: string | null) => void;
  addExpense: (expense: Omit<Expense, "id" | "status">) => void;
  updateExpenseStatus: (expenseId: string, status: Expense['status']) => void;
  addTrip: (trip: Omit<Trip, 'id' | 'status' | 'expenses'>) => void;
  updateTripStatus: (tripId: string, status: Trip['status']) => void;
}

// Create the context
const SharedStateContext = createContext<SharedState | undefined>(undefined);

// Create a custom hook to use the shared state
export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};


const initialVehicles: Vehicle[] = [
  {
    id: "1",
    name: "Volvo Prime Mover",
    plateNumber: "TRK-001",
    model: "VNL 860",
    status: "Idle",
    fuelLevel: 75,
    lastMaintenance: new Date('2024-06-15').toISOString(),
    assignedTo: 'Raja'
  },
  {
    id: "2",
    name: "Ford Transit Van",
    plateNumber: "VAN-002",
    model: "Transit-250",
    status: "Idle",
    fuelLevel: 90,
    lastMaintenance: new Date('2024-07-20').toISOString(),
    assignedTo: 'Ram'
  },
  {
    id: "3",
    name: "Scania Rigid Truck",
    plateNumber: "TRK-003",
    model: "P-series",
    status: "Maintenance",
    fuelLevel: 20,
    lastMaintenance: new Date().toISOString(),
    assignedTo: null
  },
];

const initialExpenses: Expense[] = [
    {id: 'exp1', type: 'Fuel', amount: 15075, date: new Date('2024-07-28').toISOString(), tripId: '1', status: 'approved'},
    {id: 'exp2', type: 'Toll', amount: 2500, date: new Date('2024-07-28').toISOString(), tripId: '1', status: 'approved'},
    {id: 'exp3', type: 'Maintenance', amount: 35000, date: new Date('2024-07-25').toISOString(), tripId: '2', status: 'rejected'},
    {id: 'exp4', type: 'Fuel', amount: 12050, date: new Date('2024-07-22').toISOString(), tripId: '2', status: 'pending'},
]

// Simulate a global database for state that needs to be shared across components
// This is a workaround for the lack of a real backend.
let globalExpenses: Expense[] = initialExpenses;
const expenseListeners: React.Dispatch<React.SetStateAction<Expense[]>>[] = [];

const useGlobalExpenses = () => {
    const [expenses, setExpenses] = useState(globalExpenses);

    React.useEffect(() => {
        expenseListeners.push(setExpenses);
        return () => {
            const index = expenseListeners.indexOf(setExpenses);
            if (index > -1) {
                expenseListeners.splice(index, 1);
            }
        };
    }, []);

    const setGlobalExpenses = (newExpenses: Expense[] | ((prev: Expense[]) => Expense[])) => {
        if (typeof newExpenses === 'function') {
            globalExpenses = newExpenses(globalExpenses);
        } else {
            globalExpenses = newExpenses;
        }
        expenseListeners.forEach(listener => listener(globalExpenses));
    };

    return [expenses, setGlobalExpenses] as const;
};


let globalTrips: Trip[] = [];
const tripListeners: React.Dispatch<React.SetStateAction<Trip[]>>[] = [];

const useGlobalTrips = () => {
    const [trips, setTrips] = useState(globalTrips);

    React.useEffect(() => {
        tripListeners.push(setTrips);
        return () => {
            const index = tripListeners.indexOf(setTrips);
            if (index > -1) {
                tripListeners.splice(index, 1);
            }
        };
    }, []);

    const setGlobalTrips = (newTrips: Trip[] | ((prev: Trip[]) => Trip[])) => {
        if (typeof newTrips === 'function') {
            globalTrips = newTrips(globalTrips);
        } else {
            globalTrips = newTrips;
        }
        tripListeners.forEach(listener => listener(globalTrips));
    };

    return [trips, setGlobalTrips] as const;
};



// Create the provider component
export const SharedStateProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [expenses, setExpenses] = useGlobalExpenses();
  const [trips, setTrips] = useGlobalTrips();
  const [user, setUser] = useState<UserType | null>(null);

  const login = (username: string, password: string): boolean => {
    // Admin login
    if (username === 'admin' && password === '123') {
      setUser({ username: 'Admin', role: 'admin' });
      return true;
    }
    
    // Employee login (using assigned name as username)
    const employee = vehicles.find(v => v.assignedTo?.toLowerCase() === username.toLowerCase());
    if(employee && password === '123') {
       setUser({ 
            username: employee.assignedTo!, 
            role: 'employee',
            assignedVehicleId: employee.id
        });
        return true;
    }


    // Employee login (using plate number as username)
    const assignedVehicle = vehicles.find(v => v.plateNumber.toLowerCase() === username.toLowerCase() && v.assignedTo);
    if (assignedVehicle && password === '123') {
        setUser({ 
            username: assignedVehicle.assignedTo!, 
            role: 'employee',
            assignedVehicleId: assignedVehicle.id
        });
        return true;
    }

    return false;
  };
  
  const logout = () => {
    setUser(null);
  };

  const addVehicle = (vehicle: Omit<Vehicle, "id">) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: new Date().toISOString(),
    };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicleStatus = (vehicleId: string, status: Vehicle['status']) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status } : v));
  }
  
  const updateVehicleFuelLevel = (vehicleId: string, fuelLevel: number) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, fuelLevel } : v));
  };

  const deleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };
  
  const assignVehicle = (vehicleId: string, assignedTo: string | null) => {
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, assignedTo } : v));
  };

  const addExpense = (expense: Omit<Expense, "id" | "status">) => {
    const newExpense: Expense = {
      ...expense,
      id: new Date().toISOString(),
      status: 'pending'
    };
    setExpenses(prev => [...prev, newExpense]);
  }

  const updateExpenseStatus = (expenseId: string, status: Expense['status']) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status } : e));
  }

  const addTrip = (trip: Omit<Trip, 'id' | 'status' | 'expenses'>) => {
      const newTrip: Trip = {
          ...trip,
          id: new Date().toISOString(),
          status: 'Planned',
          expenses: []
      };
      setTrips(prev => [...prev, newTrip]);
      updateVehicleStatus(trip.vehicleId, 'On Trip');
  }

  const updateTripStatus = (tripId: string, status: Trip['status']) => {
      setTrips(prev => prev.map(t => {
          if (t.id === tripId) {
              const vehicleId = t.vehicleId;
              if (status === 'Completed' || status === 'Cancelled') {
                  updateVehicleStatus(vehicleId, 'Idle');
              }
               if (status === 'Ongoing') {
                  updateVehicleStatus(vehicleId, 'On Trip');
              }
              return { ...t, status, endDate: ['Completed', 'Cancelled'].includes(status) ? new Date().toISOString() : undefined };
          }
          return t;
      }));
  }

  const value = {
    vehicles,
    expenses,
    trips,
    user,
    login,
    logout,
    addVehicle,
    updateVehicleStatus,
    updateVehicleFuelLevel,
    deleteVehicle,
    assignVehicle,
    addExpense,
    updateExpenseStatus,
    addTrip,
    updateTripStatus
  };

  return (
    <SharedStateContext.Provider value={value}>
      {children}
    </SharedStateContext.Provider>
  );
};


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useSharedState();

  if (!user) {
    return <LoginPage />;
  }

  const menuItems = user.role === 'admin' ? adminMenuItems : employeeMenuItems;
  const userEmail = user.role === 'admin' ? 'admin@fleetflow.com' : `${user.username.toLowerCase().replace(' ', '.')}@fleetflow.com`;
  const userName = user.username;
  const userFallback = userName.substring(0, 2).toUpperCase();

  return (
    <SidebarProvider>
          <div className="flex min-h-screen">
            <Sidebar>
              <SidebarHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
                            <Truck className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col">
                            <span className="font-semibold font-headline">FleetFlow</span>
                        </div>
                    </div>
                </div>
              </SidebarHeader>
              <SidebarContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={pathname === item.href}
                        tooltip={{
                          children: item.label,
                          className: "bg-primary text-primary-foreground",
                        }}
                      >
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
              <SidebarFooter className="space-y-3">
                 <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                    <LogOut className="mr-2" /> Logout
                 </Button>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png?text=${userFallback}`} alt="User" data-ai-hint="person portrait" />
                    <AvatarFallback>{userFallback}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{userName}</span>
                    <span className="text-xs text-muted-foreground">{userEmail}</span>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>
            <div className="flex flex-col w-full">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
                  <SidebarTrigger className="md:hidden" />
                  
                  <div className="flex-1">
                    {/* Placeholder for breadcrumbs or page title */}
                  </div>
                  
                  <div className="flex items-center gap-2">
                     {user.role === 'admin' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Bell />
                                    <span className="sr-only">Notifications</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Service due for TRK-003</DropdownMenuItem>
                                <DropdownMenuItem>Expense from Ram approved</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                     )}
                     <ThemeToggle />
                  </div>
                </header>
                <SidebarInset>{children}</SidebarInset>
            </div>
          </div>
    </SidebarProvider>
  );
}

    