
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Suitcase, Users, FileText, Wallet, BarChart, Route, LogOut, Bell, Compass, MessageSquare, ListChecks, History, QrCode } from "lucide-react";
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
import type { TourPackage, Expense, User as UserType, Trip, Member, ItineraryItem } from "@/lib/types";
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
import { addDays, format, subDays } from 'date-fns';

const organizerMenuItems = [
  { href: "/", label: "My Tours", icon: LayoutDashboard },
  { href: "/guide", label: "Plan Route", icon: Route },
  { href: "/members", label: "Member Management", icon: Users },
  { href: "/itinerary", label: "Itinerary Management", icon: ListChecks },
  { href: "/expenses", label: "Expense & Budget", icon: Wallet },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart },
];

const memberMenuItems = [
  { href: "/", label: "Trip Dashboard", icon: LayoutDashboard },
  { href: "/join", label: "Join a Trip", icon: QrCode },
  { href: "/itinerary", label: "Itinerary", icon: ListChecks },
  { href: "/expenses", label: "Shared Expenses", icon: Wallet },
  { href: "/group", label: "Group Chat", icon: MessageSquare },
  { href: "/history", label: "My History", icon: History },
];


interface SharedState {
  packages: TourPackage[];
  expenses: Expense[];
  trips: Trip[];
  members: Member[];
  itineraries: ItineraryItem[];
  user: UserType | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addPackage: (pkg: Omit<TourPackage, "id">) => void;
  updatePackage: (pkgId: string, updates: Partial<TourPackage>) => void;
  deletePackage: (pkgId: string) => void;
  addExpense: (expense: Omit<Expense, "id" | "status">) => void;
  updateExpenseStatus: (expenseId: string, status: Expense['status']) => void;
  addTrip: (trip: Omit<Trip, 'id' | 'status' | 'expenses' | 'itinerary' | 'members'>) => void;
  updateTripStatus: (tripId: string, status: Trip['status']) => void;
}

const SharedStateContext = createContext<SharedState | undefined>(undefined);

export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};

// Initial Data
const initialPackages: TourPackage[] = [
  { id: "1", name: "Himalayan Adventure", destination: "Manali", status: "Active", price: 25000, durationDays: 7, lastUpdated: new Date().toISOString(), organizer: "Admin" },
  { id: "2", name: "Coastal Wonders", destination: "Goa", status: "Active", price: 18000, durationDays: 5, lastUpdated: new Date().toISOString(), organizer: "Admin" },
  { id: "3", name: "Desert Safari", destination: "Rajasthan", status: "Draft", price: 30000, durationDays: 8, lastUpdated: new Date().toISOString(), organizer: "Admin" },
];

const initialExpenses: Expense[] = [
    {id: 'exp1', type: 'Food', amount: 5000, date: subDays(new Date(), 2).toISOString(), tourId: '1', description: 'Group Dinner', status: 'approved'},
    {id: 'exp2', type: 'Travel', amount: 12000, date: subDays(new Date(), 3).toISOString(), tourId: '1', description: 'Bus Tickets', status: 'approved'},
    {id: 'exp3', type: 'Hotel', amount: 35000, date: subDays(new Date(), 1).toISOString(), tourId: '2', description: '3-night stay', status: 'pending'},
];

const initialMembers: Member[] = [
    { id: 'mem1', name: 'Arun', contact: 'arun@email.com', role: 'Member' },
    { id: 'mem2', name: 'Priya', contact: 'priya@email.com', role: 'Member' },
    { id: 'mem3', name: 'Ravi', contact: 'ravi@email.com', role: 'Member' },
];

const initialItineraries: ItineraryItem[] = [
    { id: 'it1', day: 1, time: '09:00', place: 'Solang Valley', notes: 'Wear warm clothes' },
    { id: 'it2', day: 1, time: '14:00', place: 'Hadimba Temple', notes: '' },
    { id: 'it3', day: 2, time: '10:00', place: 'Rohtang Pass', notes: 'Carry ID proof' },
];


export const SharedStateProvider = ({ children }: { children: ReactNode }) => {
  const [packages, setPackages] = useState<TourPackage[]>(initialPackages);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [itineraries, setItineraries] = useState<ItineraryItem[]>(initialItineraries);
  const [user, setUser] = useState<UserType | null>(null);

  const login = (username: string, password: string): boolean => {
    if (username.toLowerCase() === 'organizer' && password === '123') {
      setUser({ username: 'Organizer', role: 'organizer' });
      return true;
    }
    
    if (username.toLowerCase() === 'member' && password === '123') {
       setUser({ 
            username: "Arun Kumar", 
            role: 'member',
            assignedTourId: '1'
        });
        return true;
    }
    return false;
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const addPackage = (pkg: Omit<TourPackage, "id">) => {
    const newPackage: TourPackage = { ...pkg, id: new Date().toISOString() };
    setPackages(prev => [newPackage, ...prev]);
  };
  
  const updatePackage = (pkgId: string, updates: Partial<TourPackage>) => {
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p));
  };

  const deletePackage = (pkgId: string) => {
    setPackages(prev => prev.filter(p => p.id !== pkgId));
  };
  
  const addExpense = (expense: Omit<Expense, "id" | "status">) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
      status: 'pending'
    };
    setExpenses(prev => [...prev, newExpense]);
  }

  const updateExpenseStatus = (expenseId: string, status: Expense['status']) => {
    setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, status } : e));
  }
  
  const addTrip = (trip: Omit<Trip, 'id' | 'status' | 'expenses' | 'itinerary' | 'members'>) => {
    const newTrip: Trip = {
      ...trip,
      id: `trip_${Date.now()}`,
      status: 'Planned',
      expenses: [],
      itinerary: [],
      members: [],
    };
    setTrips(prev => [newTrip, ...prev]);
  }
  
  const updateTripStatus = (tripId: string, status: Trip['status']) => {
    setTrips(prev => prev.map(t => {
        if (t.id === tripId) {
            return { ...t, status, endDate: ['Completed', 'Cancelled'].includes(status) ? new Date().toISOString() : undefined };
        }
        return t;
    }));
  }
  
  const value = {
    packages,
    expenses,
    trips,
    members,
    itineraries,
    user,
    login,
    logout,
    addPackage,
    updatePackage,
    deletePackage,
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

  const menuItems = user.role === 'organizer' ? organizerMenuItems : memberMenuItems;
  const userEmail = user.role === 'organizer' ? 'organizer@tourjet.com' : `${user.username.toLowerCase().split(' ')[0]}@tourjet.com`;
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
                            <Compass className="h-4 w-4" />
                        </Button>
                        <div className="flex flex-col">
                            <span className="font-semibold font-headline">TourJet</span>
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
                            <DropdownMenuItem>New member joined 'Himalayan Adventure'</DropdownMenuItem>
                            <DropdownMenuItem>Expense for Food approved</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                     <ThemeToggle />
                  </div>
                </header>
                <SidebarInset>{children}</SidebarInset>
            </div>
          </div>
    </SidebarProvider>
  );
}
