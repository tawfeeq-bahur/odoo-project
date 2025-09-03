
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route, CircleCheck, CircleX, Clock } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { format } from 'date-fns';

const mockTrips: Trip[] = [
    {
        id: 'trip1',
        vehicleId: '1',
        source: 'Chennai, TN',
        destination: 'Bengaluru, KA',
        startDate: new Date('2024-07-28').toISOString(),
        status: 'Ongoing',
        expenses: []
    },
    {
        id: 'trip2',
        vehicleId: '1',
        source: 'Bengaluru, KA',
        destination: 'Hyderabad, TS',
        startDate: new Date('2024-07-25').toISOString(),
        endDate: new Date('2024-07-26').toISOString(),
        status: 'Completed',
        expenses: []
    },
    {
        id: 'trip3',
        vehicleId: '2',
        source: 'Mumbai, MH',
        destination: 'Pune, MH',
        startDate: new Date('2024-07-29').toISOString(),
        status: 'Planned',
        expenses: []
    },
    {
        id: 'trip4',
        vehicleId: '2',
        source: 'Pune, MH',
        destination: 'Mumbai, MH',
        startDate: new Date('2024-07-27').toISOString(),
        endDate: new Date('2024-07-27').toISOString(),
        status: 'Completed',
        expenses: []
    }
];

export default function TripsPage() {
    const { user } = useSharedState();
    
    if (user?.role !== 'employee') {
        return (
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This page is only available for employees.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const employeeTrips = mockTrips.filter(trip => trip.vehicleId === user.assignedVehicleId);

    const ongoingTrips = employeeTrips.filter(t => t.status === 'Ongoing' || t.status === 'Planned');
    const completedTrips = employeeTrips.filter(t => t.status === 'Completed');

    const getStatusBadge = (status: Trip['status']) => {
        switch (status) {
            case 'Ongoing':
                return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700">Ongoing</Badge>;
            case 'Completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">Completed</Badge>;
            case 'Planned':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">Planned</Badge>;
        }
    };

    return (
         <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">My Trips</h1>
                <p className="text-muted-foreground">View your assigned, ongoing, and completed trips.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Clock /> Ongoing & Planned Trips</CardTitle>
                    <CardDescription>These are your currently active or upcoming trips.</CardDescription>
                </CardHeader>
                <CardContent>
                     <TripTable trips={ongoingTrips} getStatusBadge={getStatusBadge} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><CircleCheck /> Completed Trips</CardTitle>
                    <CardDescription>A history of all your completed trips.</CardDescription>
                </CardHeader>
                <CardContent>
                    <TripTable trips={completedTrips} getStatusBadge={getStatusBadge} />
                </CardContent>
            </Card>

        </div>
    )
}

const TripTable = ({trips, getStatusBadge}: {trips: Trip[], getStatusBadge: (status: Trip['status']) => React.ReactNode}) => (
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
                           {trip.status === 'Ongoing' && <Button size="sm">End Trip</Button>}
                           {trip.status === 'Planned' && <Button size="sm">Start Trip</Button>}
                           {trip.status === 'Completed' && <Button size="sm" variant="outline">View Details</Button>}
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
