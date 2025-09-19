
"use client";

import { useSharedState } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal, Edit, Trash2, Eye, MapPin, CalendarDays, Users } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from "@/components/ui/badge";
import type { TourPackage } from "@/lib/types";

export default function DashboardPage() {
  const { user, packages, addPackage, deletePackage } = useSharedState();

  if (user?.role === 'member') {
    // Member Dashboard
    const assignedTour = packages.find(p => p.id === user.assignedTourId) || packages[0];
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Trip Dashboard</h1>
        {assignedTour ? (
          <Card>
            <CardHeader>
              <CardTitle>{assignedTour.name}</CardTitle>
              <CardDescription>You are a member of this upcoming trip. Here are the details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> Destination: <span className="font-semibold text-foreground">{assignedTour.destination}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="h-4 w-4" /> Duration: <span className="font-semibold text-foreground">{assignedTour.durationDays} Days</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Organizer: <span className="font-semibold text-foreground">{assignedTour.organizer}</span></div>
              <Button asChild className="mt-4">
                <Link href="/itinerary">View Full Itinerary</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold">You haven't joined a trip yet!</h2>
              <p className="text-muted-foreground mt-2 mb-4">Join a trip using a QR code or an invite link.</p>
              <Button asChild>
                <Link href="/join">Join a Trip</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Organizer Dashboard
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">My Tours</h1>
        <Button onClick={() => addPackage({ name: "New Untitled Tour", destination: "TBD", status: "Draft", price: 0, durationDays: 1, lastUpdated: new Date().toISOString(), organizer: user.username })}>
          <PlusCircle className="mr-2" />
          Create New Tour
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="leading-tight">{pkg.name}</CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem><Edit className="mr-2" /> Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => deletePackage(pkg.id)}>
                      <Trash2 className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardDescription className="flex items-center gap-2 pt-1">
                <MapPin className="h-4 w-4" /> {pkg.destination}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={pkg.status === 'Active' ? 'default' : 'secondary'}>{pkg.status}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Price/Person</span>
                <span className="font-semibold">₹{pkg.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-semibold">{pkg.durationDays} Days</span>
              </div>
            </CardContent>
            <div className="p-6 pt-0">
               <Button asChild className="w-full">
                <Link href={`/tours/${pkg.id}`}><Eye className="mr-2" /> Manage Tour</Link>
               </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
