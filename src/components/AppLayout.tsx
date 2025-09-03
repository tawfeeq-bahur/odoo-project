
"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, LayoutDashboard, Truck, Settings, User, Map, DollarSign, ScanLine } from "lucide-react";
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
import type { Vehicle, Expense } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/guide", label: "Trip Planner", icon: Map },
  { href: "/scanner", label: "Expense Scanner", icon: ScanLine },
  { href: "/vehicles", label: "Vehicle Management", icon: Truck },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Define the shape of the shared state
interface SharedState {
  vehicles: Vehicle[];
  expenses: Expense[];
  addVehicle: (vehicle: Omit<Vehicle, "id">) => void;
  updateVehicleStatus: (vehicleId: string, status: Vehicle['status']) => void;
  deleteVehicle: (vehicleId: string) => void;
  addExpense: (expense: Omit<Expense, "id"> & { id?: string }) => void;
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
    status: "On Trip",
    fuelLevel: 75,
    lastMaintenance: new Date('2024-06-15').toISOString()
  },
  {
    id: "2",
    name: "Ford Transit Van",
    plateNumber: "VAN-002",
    model: "Transit-250",
    status: "Idle",
    fuelLevel: 90,
    lastMaintenance: new Date('2024-07-20').toISOString()
  },
  {
    id: "3",
    name: "Scania Rigid Truck",
    plateNumber: "TRK-003",
    model: "P-series",
    status: "Maintenance",
    fuelLevel: 20,
    lastMaintenance: new Date().toISOString()
  },
];


// Create the provider component
export const SharedStateProvider = ({ children }: { children: ReactNode }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles);
  const [expenses, setExpenses] = useState<Expense[]>([]);

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

  const deleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };
  
  const addExpense = (expense: Omit<Expense, "id"> & { id?: string }) => {
    const newExpense: Expense = {
      ...expense,
      id: expense.id || new Date().toISOString(),
    };
    setExpenses(prev => [...prev, newExpense]);
  }


  const value = {
    vehicles,
    expenses,
    addVehicle,
    updateVehicleStatus,
    deleteVehicle,
    addExpense,
  };

  return (
    <SharedStateContext.Provider value={value}>
      {children}
    </SharedStateContext.Provider>
  );
};


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
                     <ThemeToggle />
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
              <SidebarFooter>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person portrait" />
                    <AvatarFallback>FM</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Fleet Manager</span>
                    <span className="text-xs text-muted-foreground">manager@fleetflow.com</span>
                  </div>
                </div>
              </SidebarFooter>
            </Sidebar>
            <div className="flex flex-col w-full">
                <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 md:hidden">
                  <SidebarTrigger />
                  <h1 className="text-lg font-semibold font-headline">FleetFlow</h1>
                  <div className="ml-auto">
                    <ThemeToggle />
                  </div>
                </header>
                <SidebarInset>{children}</SidebarInset>
            </div>
          </div>
    </SidebarProvider>
  );
}
