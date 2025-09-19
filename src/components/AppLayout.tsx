

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileText, Wallet, BarChart, Route, LogOut, Bell, Compass, MessageSquare, History, ListChecks, PlusCircle, User as UserIcon } from "lucide-react";
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
import type { TourPackage, Expense, User as UserType, Trip, ItineraryItem } from "@/lib/types";
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
import { subDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast";

// Unified menu for all users
const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/guide", label: "Plan a Route", icon: Route },
  { href: "/members", label: "Manage Members", icon: Users },
  { href: "/scanner", label: "Log Expense", icon: Wallet },
  { href: "/reports", label: "Analytics", icon: BarChart },
];


interface SharedState {
  packages: TourPackage[];
  expenses: Expense[];
  trips: Trip[];
  itineraries: ItineraryItem[];
  user: UserType | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addPackage: (pkg: Omit<TourPackage, 'id' | 'lastUpdated' | 'organizerName' | 'inviteCode' | 'members' | 'gallery'>) => void;
  updatePackage: (pkgId: string, updates: Partial<TourPackage>) => void;
  deletePackage: (pkgId: string) => void;
  addExpense: (expense: Omit<Expense, "id" | "status" | "submittedBy">) => void;
  updateExpenseStatus: (expenseId: string, status: Expense['status']) => void;
  addTrip: (trip: Omit<Trip, 'id' | 'status' | 'expenses' | 'itinerary' | 'members'>) => void;
  updateTripStatus: (tripId: string, status: Trip['status']) => void;
  joinTour: (inviteCode: string) => boolean;
  addPhotoToTour: (tourId: string, photoUrl: string) => void;
}

const SharedStateContext = createContext<SharedState | undefined>(undefined);

export const useSharedState = () => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};

// Helper to generate a random invite code
const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- Initial Demo Data ---
const demoUsers = ["Arun", "Priya", "Ravi"]; // Usernames for login

const initialPackages: TourPackage[] = [
  { id: "1", name: "Himalayan Adventure", destination: "Manali", status: "Active", price: 25000, durationDays: 7, lastUpdated: new Date().toISOString(), organizerName: "Arun", inviteCode: generateInviteCode(), members: ['Priya'], gallery: ['/placeholders/himalayas1.jpg', '/placeholders/himalayas2.jpg'] },
  { id: "2", name: "Coastal Wonders", destination: "Goa", status: "Active", price: 18000, durationDays: 5, lastUpdated: new Date().toISOString(), organizerName: "Priya", inviteCode: generateInviteCode(), members: [], gallery: [] },
  { id: "3", name: "Solo Backpacking", destination: "Rajasthan", status: "Draft", price: 30000, durationDays: 8, lastUpdated: new Date().toISOString(), organizerName: "Ravi", inviteCode: generateInviteCode(), members: [], gallery: [] },
];

const initialExpenses: Expense[] = [
    {id: 'exp1', type: 'Food', amount: 5000, date: subDays(new Date(), 2).toISOString(), tourId: '1', description: 'Group Dinner', status: 'approved', submittedBy: 'Arun'},
    {id: 'exp2', type: 'Travel', amount: 12000, date: subDays(new Date(), 3).toISOString(), tourId: '1', description: 'Bus Tickets', status: 'approved', submittedBy: 'Arun'},
    {id: 'exp3', type: 'Hotel', amount: 35000, date: subDays(new Date(), 1).toISOString(), tourId: '2', description: '3-night stay', status: 'pending', submittedBy: 'Priya'},
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
  const [itineraries, setItineraries] = useState<ItineraryItem[]>(initialItineraries);
  const [user, setUser] = useState<UserType | null>(null);
  const { toast } = useToast();

  const login = (username: string, password: string): boolean => {
    const validUser = demoUsers.find(u => u.toLowerCase() === username.toLowerCase());
    if (validUser && password === '123') {
      setUser({ username: validUser });
      return true;
    }
    return false;
  };
  
  const logout = () => {
    setUser(null);
  };
  
  const addPackage = (pkg: Omit<TourPackage, 'id' | 'lastUpdated' | 'organizerName' | 'inviteCode' | 'members' | 'gallery'>) => {
    if (!user) {
        toast({ title: "Error", description: "You must be logged in to create a tour.", variant: "destructive"});
        return;
    }
    const newPackage: TourPackage = { 
        ...pkg, 
        id: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        organizerName: user.username,
        inviteCode: generateInviteCode(),
        members: [], // Starts with no members
        gallery: [], // Starts with an empty gallery
    };
    setPackages(prev => [newPackage, ...prev]);
    toast({ title: "Tour Created!", description: `"${pkg.name}" has been created.`});
  };
  
  const updatePackage = (pkgId: string, updates: Partial<TourPackage>) => {
    setPackages(prev => prev.map(p => p.id === pkgId ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p));
  };

  const deletePackage = (pkgId: string) => {
    setPackages(prev => prev.filter(p => p.id !== pkgId));
  };
  
  const addExpense = (expense: Omit<Expense, "id" | "status" | "submittedBy">) => {
    if (!user) return;
    const newExpense: Expense = {
      ...expense,
      id: `exp_${Date.now()}`,
      status: 'pending',
      submittedBy: user.username
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

  const joinTour = (inviteCode: string): boolean => {
    const tour = packages.find(p => p.inviteCode.toLowerCase() === inviteCode.toLowerCase());
    if (tour && user) {
        if (tour.organizerName === user.username) {
            toast({ title: "Already Organizer", description: "You are the organizer of this tour.", variant: "destructive"});
            return false;
        }
        if (tour.members.includes(user.username)) {
            toast({ title: "Already a Member", description: "You have already joined this tour.", variant: "destructive"});
            return false;
        }
      
      setPackages(prev => prev.map(p => {
        if (p.id === tour.id) {
          return { ...p, members: [...p.members, user.username] };
        }
        return p;
      }));
      return true;
    }
    return false;
  };

  const addPhotoToTour = (tourId: string, photoUrl: string) => {
    setPackages(prev => prev.map(p => {
      if (p.id === tourId) {
        return { ...p, gallery: [...p.gallery, photoUrl] };
      }
      return p;
    }));
  };

  
  const value = {
    packages,
    expenses,
    trips,
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
    updateTripStatus,
    joinTour,
    addPhotoToTour,
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

  const userEmail = `${user.username.toLowerCase()}@tourjet.com`;
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
