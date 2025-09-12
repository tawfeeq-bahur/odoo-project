
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Expense, Trip } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Route, Truck } from 'lucide-react';

export default function TripSummaryPage() {
    const { user, trips, vehicles, expenses } = useSharedState();

    if (user?.role !== 'admin') {
        return (
            <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>You do not have permission to view this page.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const getStatusBadge = (status: Trip['status']) => {
        switch (status) {
            case 'Ongoing':
                 return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700">{status}</Badge>;
            case 'Completed':
                return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">{status}</Badge>;
            case 'Planned':
                return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">{status}</Badge>;
            case 'Cancelled':
                 return <Badge variant="destructive">{status}</Badge>;
        }
    };
    
    const ongoingTrips = trips.filter(trip => trip.status === 'Ongoing' || trip.status === 'Planned');


    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Live Trip Summary</h1>
                    <p className="text-muted-foreground">A real-time overview of all trips currently in progress or planned.</p>
                </div>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5 text-primary" /> Active Trips</CardTitle>
                    <CardDescription>A real-time overview of all trips currently in progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee & Vehicle</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fuel Level</TableHead>
                                <TableHead className="text-right">Trip Expenses</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ongoingTrips.map(trip => {
                                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                                const tripExpenses = expenses.filter(e => e.tripId === trip.id).reduce((sum, exp) => sum + exp.amount, 0);

                                return (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            <div className="font-medium">{trip.employeeName}</div>
                                            <div className="text-sm text-muted-foreground">{vehicle?.plateNumber}</div>
                                        </TableCell>
                                        <TableCell>
                                            {trip.source} to {trip.destination}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(trip.status)}</TableCell>
                                        <TableCell>
                                            {vehicle ? (
                                                <div className="flex items-center gap-2">
                                                    <Progress value={vehicle.fuelLevel} className="h-2 w-20" />
                                                    <span>{vehicle.fuelLevel}%</span>
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ₹{tripExpenses.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    {ongoingTrips.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <Truck className="mx-auto h-8 w-8 mb-2" />
                            <p>No trips are currently ongoing or planned.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

    