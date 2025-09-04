
'use client';

import { useState } from 'react';
import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route, CircleCheck, CircleX, Clock, MoreHorizontal, AlertTriangle, Play } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function TripsPage() {
    const { user, trips, updateTripStatus } = useSharedState();
    const { toast } = useToast();
    
    if (user?.role !== 'employee') {
        return (
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This page is only available for employees. Admins manage trips via other pages.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const employeeTrips = trips.filter(trip => trip.employeeName === user.username);

    const ongoingTrips = employeeTrips.filter(t => t.status === 'Ongoing' || t.status === 'Planned');
    const completedTrips = employeeTrips.filter(t => t.status === 'Completed' || t.status === 'Cancelled');

    const handleStartTrip = (tripId: string) => {
        updateTripStatus(tripId, 'Ongoing');
        toast({ title: "Trip Started", description: "The trip is now marked as ongoing." });
    }

    const handleEndTrip = (tripId: string) => {
        updateTripStatus(tripId, 'Completed');
        toast({
            title: "Trip Completed",
            description: `Trip has been marked as completed.`
        });
    };
    
    const handleViewDetails = (trip: Trip) => {
        // In a real app, this would navigate to a detailed trip page.
        alert(`Trip Details:\n\nRoute: ${trip.source} to ${trip.destination}\nStatus: ${trip.status}\nStart Date: ${format(new Date(trip.startDate), 'PPP')}`);
    }

    const getStatusBadge = (status: Trip['status']) => {
        switch (status) {
            case 'Ongoing':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700">Ongoing</Badge>;
            case 'Completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">Completed</Badge>;
            case 'Planned':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">Planned</Badge>;
            case 'Cancelled':
                 return <Badge variant="destructive">Cancelled</Badge>;
        }
    };

    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">My Trips</h1>
                <p className="text-muted-foreground">View your assigned, ongoing, and completed trips.</p>
            </div>
            
            {employeeTrips.length === 0 && (
                 <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full min-h-60">
                        <Route className="w-12 h-12 text-primary" />
                        <h3 className="text-xl font-semibold">No Trips Assigned</h3>
                        <p className="text-muted-foreground max-w-sm">
                           You currently have no trips assigned to you. Your administrator will assign you one soon.
                        </p>
                    </CardContent>
                </Card>
            )}

            {ongoingTrips.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock /> Ongoing & Planned Trips</CardTitle>
                        <CardDescription>These are your currently active or upcoming trips.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TripTable trips={ongoingTrips} getStatusBadge={getStatusBadge} onStartTrip={handleStartTrip} onEndTrip={handleEndTrip} onViewDetails={handleViewDetails} />
                    </CardContent>
                </Card>
            )}

            {completedTrips.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CircleCheck /> Completed Trips</CardTitle>
                        <CardDescription>A history of all your completed trips.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TripTable trips={completedTrips} getStatusBadge={getStatusBadge} onStartTrip={handleStartTrip} onEndTrip={handleEndTrip} onViewDetails={handleViewDetails} />
                    </CardContent>
                </Card>
            )}

        </div>
    )
}

interface TripTableProps {
    trips: Trip[];
    getStatusBadge: (status: Trip['status']) => React.ReactNode;
    onStartTrip: (tripId: string) => void;
    onEndTrip: (tripId: string) => void;
    onViewDetails: (trip: Trip) => void;
}


const TripTable = ({trips, getStatusBadge, onStartTrip, onEndTrip, onViewDetails}: TripTableProps) => (
    <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Route</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {trips.map(trip => (
                    <TableRow key={trip.id}>
                        <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <Route className="h-4 w-4 text-muted-foreground" />
                                <span>{trip.source} to {trip.destination}</span>
                            </div>
                        </TableCell>
                        <TableCell>{format(new Date(trip.startDate), 'PPP')}</TableCell>
                        <TableCell>{trip.endDate ? format(new Date(trip.endDate), 'PPP') : '-'}</TableCell>
                        <TableCell>{getStatusBadge(trip.status)}</TableCell>
                        <TableCell className="text-right">
                           <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" size="icon">
                                       <MoreHorizontal className="h-4 w-4" />
                                   </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end">
                                   {trip.status === 'Planned' && <DropdownMenuItem onClick={() => onStartTrip(trip.id)}><Play className="mr-2"/>Start Trip</DropdownMenuItem>}
                                   {trip.status === 'Ongoing' && <DropdownMenuItem onClick={() => onEndTrip(trip.id)}><CircleCheck className="mr-2"/>End Trip</DropdownMenuItem>}
                                   {trip.status === 'Completed' && <DropdownMenuItem onClick={() => onViewDetails(trip)}>View Details</DropdownMenuItem>}
                                   {(trip.status === 'Planned' || trip.status === 'Ongoing') && (
                                    <DropdownMenuItem asChild>
                                      <Link href="/support" className="text-destructive focus:text-destructive">
                                        <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                                      </Link>
                                    </DropdownMenuItem>
                                   )}
                               </DropdownMenuContent>
                           </DropdownMenu>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
        {trips.length === 0 && (
            <div className="text-center p-10 text-muted-foreground">
                <CircleX className="mx-auto h-8 w-8 mb-2" />
                <p>No trips to display in this category.</p>
            </div>
        )}
    </>
)
