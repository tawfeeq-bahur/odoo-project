

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, Truck, Settings, User, Map, DollarSign, ScanLine, LogOut, BarChart, LifeBuoy, Route, Bell, Users, Send, HeartPulse, Camera } from "lucide-react";
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
  { href: "/routes", label: "Routes", icon: Route },
  { href: "/vehicles", label: "Vehicle Management", icon: Truck },
  { href: "/employees", label: "Employee Management", icon: Users },
  { href: "/odometer", label: "Odometer Verification", icon: Camera },
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
  login: (username: string, password: string, adminCode?: string) => boolean;
  logout: () => void;
  refreshData: () => Promise<boolean>;
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
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load data from database on app start
  useEffect(() => {
    const loadDataFromDatabase = async () => {
      try {
        console.log('🔄 Starting to load data from database...');
        
        // Try the refresh endpoint first
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const refreshResponse = await fetch('/api/refresh-data?type=all', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('✅ Refresh data response:', refreshData);
            
            if (refreshData.data && refreshData.data.vehicles) {
              setVehicles(refreshData.data.vehicles);
              console.log('✅ Loaded vehicles from database:', refreshData.data.vehicles);
            }
            
            if (refreshData.data && refreshData.data.trips) {
              setTrips(refreshData.data.trips);
              console.log('✅ Loaded trips from database:', refreshData.data.trips);
            }
            
            if (refreshData.data && refreshData.data.expenses) {
              setExpenses(refreshData.data.expenses);
              console.log('✅ Loaded expenses from database:', refreshData.data.expenses);
            }
            
            console.log('✅ Successfully loaded all data from refresh endpoint');
            return; // Success, no need to try individual endpoints
          } else {
            console.warn('⚠️ Refresh endpoint failed with status:', refreshResponse.status);
          }
        } catch (refreshError) {
          console.warn('⚠️ Refresh endpoint failed:', refreshError);
        }

        // Fallback to individual endpoints
        console.log('🔄 Trying individual endpoints...');
        
        try {
          const vehiclesResponse = await fetch('/api/admin/vehicles', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (vehiclesResponse.ok) {
            const dbVehicles = await vehiclesResponse.json();
            setVehicles(dbVehicles);
            console.log('✅ Loaded vehicles from individual endpoint:', dbVehicles);
          } else {
            console.warn('⚠️ Vehicles endpoint failed with status:', vehiclesResponse.status);
          }
        } catch (vehiclesError) {
          console.warn('⚠️ Vehicles endpoint failed:', vehiclesError);
        }

        try {
          const tripsResponse = await fetch('/api/admin/trips', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (tripsResponse.ok) {
            const dbTrips = await tripsResponse.json();
            setTrips(dbTrips);
            console.log('✅ Loaded trips from individual endpoint:', dbTrips);
          } else {
            console.warn('⚠️ Trips endpoint failed with status:', tripsResponse.status);
          }
        } catch (tripsError) {
          console.warn('⚠️ Trips endpoint failed:', tripsError);
        }

        try {
          const expensesResponse = await fetch('/api/employee/expenses', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (expensesResponse.ok) {
            const dbExpenses = await expensesResponse.json();
            setExpenses(dbExpenses);
            console.log('✅ Loaded expenses from individual endpoint:', dbExpenses);
          } else {
            console.warn('⚠️ Expenses endpoint failed with status:', expensesResponse.status);
          }
        } catch (expensesError) {
          console.warn('⚠️ Expenses endpoint failed:', expensesError);
        }

        console.log('✅ Data loading process completed');

      } catch (error) {
        console.error('💥 Error loading data from database:', error);
        // Don't throw the error, just log it and continue
      } finally {
        setIsDataLoaded(true);
        console.log('✅ Data loading finished, isDataLoaded set to true');
      }
    };

    loadDataFromDatabase();
  }, [setTrips, setExpenses]);

  const login = (username: string, password: string, adminCode?: string): boolean => {
    // Admin login - requires 6-digit admin code
    if (username === 'admin' && password === '123') {
      // Check if admin code is provided and valid (6 digits)
      if (!adminCode || adminCode.length !== 6 || !/^\d{6}$/.test(adminCode)) {
        return false;
      }
      // For demo purposes, accept any 6-digit code starting with '1'
      // In production, you would validate against a secure admin code
      if (adminCode.startsWith('1')) {
        setUser({ username: 'Admin', role: 'admin' });
        return true;
      }
      return false;
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

  const refreshData = async () => {
    try {
      const refreshResponse = await fetch('/api/refresh-data?type=all');
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        
        if (refreshData.data.vehicles) {
          setVehicles(refreshData.data.vehicles);
        }
        
        if (refreshData.data.trips) {
          setTrips(refreshData.data.trips);
        }
        
        if (refreshData.data.expenses) {
          setExpenses(refreshData.data.expenses);
        }
        
        console.log('Data refreshed successfully');
        return true;
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    return false;
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

  const addExpense = async (expense: Omit<Expense, "id" | "status">) => {
    const newExpense: Expense = {
      ...expense,
      id: `expense_${Date.now()}`,
      status: 'pending'
    };
    
    try {
      // Save to database
      const response = await fetch('/api/employee/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newExpense,
          employeeId: 'current-user' // This should come from auth context
        }),
      });

      if (response.ok) {
        // Update local state only after successful database save
        setExpenses(prev => [...prev, newExpense]);
        console.log('Expense added successfully to database');
      } else {
        console.error('Failed to save expense to database');
        // Still update local state for immediate UI feedback
        setExpenses(prev => [...prev, newExpense]);
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      // Still update local state for immediate UI feedback
      setExpenses(prev => [...prev, newExpense]);
    }
  }

  const updateExpenseStatus = (expenseId: string, status: Expense['status']) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status } : e));
  }

  const addTrip = async (trip: Omit<Trip, 'id' | 'status' | 'expenses'>) => {
      const newTrip: Trip = {
          ...trip,
          id: `trip_${Date.now()}`,
          status: 'Planned',
          expenses: []
      };
      
      console.log('Creating trip with data:', newTrip);
      console.log('Available vehicles:', vehicles);
      console.log('Trip vehicleId:', trip.vehicleId);
      
      try {
        // Save trip to database
        const tripResponse = await fetch('/api/admin/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newTrip),
        });

        // Also save route to routes collection for the routes page
        const selectedVehicle = vehicles.find(v => v.id === trip.vehicleId);
        console.log('Selected vehicle for route:', selectedVehicle);
        
        if (!selectedVehicle) {
          console.error('Vehicle not found for trip:', trip.vehicleId);
          throw new Error(`Vehicle with ID ${trip.vehicleId} not found`);
        }
        
        // Parse distance from trip plan
        let distance = 0;
        let emissions = 0;
        
        if (trip.plan?.distance && trip.plan.distance !== '—') {
          const distanceStr = trip.plan.distance.toString();
          const numericDistance = parseFloat(distanceStr.replace(/[^\d.]/g, ''));
          distance = isNaN(numericDistance) ? 0 : numericDistance;
          emissions = Math.round(distance * 0.18); // Rough estimate: 0.18g CO2 per km
        } else {
          // If no distance available, use a default estimate based on source/destination
          distance = 50; // Default 50km
          emissions = 9; // Default emissions for 50km
          console.warn('No distance available in trip plan, using default values');
        }
        
        console.log('Distance parsing:', {
          originalDistance: trip.plan?.distance,
          parsedDistance: distance,
          calculatedEmissions: emissions
        });
        
        const routeData = {
          source: trip.source,
          destination: trip.destination,
          vehicleType: selectedVehicle.type || 'truck',
          vehicleYear: selectedVehicle.year,
          distance: distance,
          emissions: emissions,
          routeSource: 'AI Trip Planner',
          fuelType: selectedVehicle.fuelType,
          routeType: trip.plan?.routeType || 'Highway',
          traffic: trip.plan?.traffic || 'Normal',
          ecoTip: trip.plan?.ecoTip || 'Drive efficiently to reduce emissions'
        };
        
        console.log('Creating route with data:', routeData);
        
        // Validate required fields before API call
        if (!routeData.source || !routeData.destination || !routeData.vehicleType || routeData.distance == null || routeData.emissions == null) {
          console.error('Missing required fields for route:', {
            source: routeData.source,
            destination: routeData.destination,
            vehicleType: routeData.vehicleType,
            distance: routeData.distance,
            emissions: routeData.emissions
          });
          throw new Error('Missing required fields for route creation');
        }

        const routeResponse = await fetch('/api/routes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(routeData),
        });

        if (tripResponse.ok && routeResponse.ok) {
          // Update local state only after successful database save
          setTrips(prev => [...prev, newTrip]);
          updateVehicleStatus(trip.vehicleId, 'On Trip');
          console.log('Trip and route added successfully to database');
        } else {
          const tripError = tripResponse.ok ? 'OK' : `Trip API failed: ${tripResponse.status} ${tripResponse.statusText}`;
          const routeError = routeResponse.ok ? 'OK' : `Route API failed: ${routeResponse.status} ${routeResponse.statusText}`;
          console.error('Failed to save trip or route to database:', { tripError, routeError });
          
          // Log response bodies for debugging
          if (!tripResponse.ok) {
            const tripErrorBody = await tripResponse.text();
            console.error('Trip API error body:', tripErrorBody);
          }
          if (!routeResponse.ok) {
            const routeErrorBody = await routeResponse.text();
            console.error('Route API error body:', routeErrorBody);
          }
          
          // Still update local state for immediate UI feedback
          setTrips(prev => [...prev, newTrip]);
          updateVehicleStatus(trip.vehicleId, 'On Trip');
        }
      } catch (error) {
        console.error('Error saving trip:', error);
        // Still update local state for immediate UI feedback
        setTrips(prev => [...prev, newTrip]);
        updateVehicleStatus(trip.vehicleId, 'On Trip');
      }
  }

  const updateTripStatus = async (tripId: string, status: Trip['status']) => {
      const updatedTrip = {
          id: tripId,
          status,
          endDate: ['Completed', 'Cancelled'].includes(status) ? new Date().toISOString() : undefined
      };
      
      try {
        // Update in database
        const response = await fetch('/api/admin/trips', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTrip),
        });

        if (response.ok) {
          // Update local state only after successful database save
          setTrips(prev => prev.map(t => {
              if (t.id === tripId) {
                  const vehicleId = t.vehicleId;
                  if (status === 'Completed' || status === 'Cancelled') {
                      updateVehicleStatus(vehicleId, 'Idle');
                  }
                   if (status === 'Ongoing') {
                      updateVehicleStatus(vehicleId, 'On Trip');
                  }
                  return { ...t, status, endDate: updatedTrip.endDate };
              }
              return t;
          }));
          console.log('Trip status updated in database');
        } else {
          console.error('Failed to update trip status in database');
          // Still update local state for immediate UI feedback
          setTrips(prev => prev.map(t => {
              if (t.id === tripId) {
                  const vehicleId = t.vehicleId;
                  if (status === 'Completed' || status === 'Cancelled') {
                      updateVehicleStatus(vehicleId, 'Idle');
                  }
                   if (status === 'Ongoing') {
                      updateVehicleStatus(vehicleId, 'On Trip');
                  }
                  return { ...t, status, endDate: updatedTrip.endDate };
              }
              return t;
          }));
        }
      } catch (error) {
        console.error('Error updating trip status:', error);
        // Still update local state for immediate UI feedback
        setTrips(prev => prev.map(t => {
            if (t.id === tripId) {
                const vehicleId = t.vehicleId;
                if (status === 'Completed' || status === 'Cancelled') {
                    updateVehicleStatus(vehicleId, 'Idle');
                }
                 if (status === 'Ongoing') {
                    updateVehicleStatus(vehicleId, 'On Trip');
                }
                return { ...t, status, endDate: updatedTrip.endDate };
            }
            return t;
        }));
      }
  }

  const value = {
    vehicles,
    expenses,
    trips,
    user,
    login,
    logout,
    refreshData,
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

    