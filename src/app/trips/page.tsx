

'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route, CircleCheck, CircleX, Clock, MoreHorizontal, AlertTriangle, Play, FileText, Upload } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { OdometerUpload } from '@/components/odometer/OdometerUpload';
import { useLanguage } from '@/context/LanguageContext';

const MapDisplay = dynamic(
  () => import('@/components/fleet/MapDisplay').then((mod) => mod.MapDisplay),
  { 
    ssr: false,
    loading: () => <Skeleton className="aspect-video w-full h-[300px] border-2 border-dashed rounded-lg bg-muted/30" />
  }
);


export default function TripsPage() {
    const { user, trips, updateTripStatus } = useSharedState();
    const { toast } = useToast();
    const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
    const [showOdometerUpload, setShowOdometerUpload] = useState(false);
    const { t } = useLanguage();
    
    if (user?.role !== 'employee') {
        return (
             <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("Access Denied")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{t("This page is only available for employees. Admins manage trips via other pages.")}</p>
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
        setSelectedTrip(trip);
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
                <h1 className="text-3xl font-bold tracking-tight font-headline">{t("My Trips")}</h1>
                <p className="text-muted-foreground">{t("View your assigned, ongoing, and completed trips.")}</p>
            </div>
            
            {employeeTrips.length === 0 && (
                 <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full min-h-60">
                        <Route className="w-12 h-12 text-primary" />
                        <h3 className="text-xl font-semibold">{t("No Trips Assigned")}</h3>
                        <p className="text-muted-foreground max-w-sm">
                           {t("You currently have no trips assigned to you. Your administrator will assign you one soon.")}
                        </p>
                    </CardContent>
                </Card>
            )}

            {ongoingTrips.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock /> {t("Ongoing & Planned Trips")}</CardTitle>
                        <CardDescription>{t("These are your currently active or upcoming trips.")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TripTable trips={ongoingTrips} getStatusBadge={getStatusBadge} onStartTrip={handleStartTrip} onEndTrip={handleEndTrip} onViewDetails={handleViewDetails} />
                    </CardContent>
                </Card>
            )}

            {completedTrips.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CircleCheck /> {t("Completed Trips")}</CardTitle>
                        <CardDescription>{t("A history of all your completed trips.")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <TripTable trips={completedTrips} getStatusBadge={getStatusBadge} onStartTrip={handleStartTrip} onEndTrip={handleEndTrip} onViewDetails={handleViewDetails} />
                    </CardContent>
                </Card>
            )}

            {selectedTrip && (
                 <Dialog open={!!selectedTrip} onOpenChange={(isOpen) => !isOpen && setSelectedTrip(null)}>
                    <DialogContent className="max-w-4xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-headline">{t("Trip Details")}: {selectedTrip.source} {t("to")} {selectedTrip.destination}</DialogTitle>
                            <DialogDescription>{selectedTrip.plan.suggestedRoute}</DialogDescription>
                        </DialogHeader>
                        <div className="grid md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-4">
                            <div className="space-y-4">
                                <MapDisplay plan={selectedTrip.plan} traffic={selectedTrip.plan.traffic || 'Normal'}/>

                                <Alert>
                                    <AlertTriangle className="h-5 w-5" />
                                    <AlertTitle>{t("Disclaimer")}</AlertTitle>
                                    <AlertDescription>{selectedTrip.plan.disclaimer}</AlertDescription>
                                </Alert>
                            </div>
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("Trip Summary")}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-4 text-sm">
                                        <InfoItem label={t("Distance")} value={selectedTrip.plan.distance} />
                                        <InfoItem label={t("Duration")} value={selectedTrip.plan.duration} />
                                        <InfoItem label={t("Est. Fuel Cost")} value={`₹${selectedTrip.plan.estimatedFuelCost.toFixed(2)}`} />
                                        <InfoItem label={t("Est. Toll Cost")} value={`₹${selectedTrip.plan.estimatedTollCost.toFixed(2)}`} />
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("Log Expenses for this Trip")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{t("Upload receipts or manually enter costs related to this specific trip.")}</p>
                                        <Button asChild className="w-full">
                                            <Link href={`/scanner?tripId=${selectedTrip.id}`}>
                                                <Upload className="mr-2"/> {t("Upload Expenses for this Trip")}
                                            </Link>
                                        </Button>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>{t("Update Odometer")}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">{t("Take a geo-tagged photo of your odometer reading for verification.")}</p>
                                        <Button 
                                            onClick={() => setShowOdometerUpload(true)}
                                            className="w-full"
                                        >
                                            <Upload className="mr-2"/> {t("Update Odometer Reading")}
                                        </Button>
                                    </CardContent>
                                </Card>

                            </div>
                        </div>
                    </DialogContent>
                 </Dialog>
            )}

            {showOdometerUpload && selectedTrip && (
                <Dialog open={showOdometerUpload} onOpenChange={setShowOdometerUpload}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>{t("Update Odometer Reading")}</DialogTitle>
                            <DialogDescription>
                                Take a photo of your odometer for trip: {selectedTrip.source} to {selectedTrip.destination}
                            </DialogDescription>
                        </DialogHeader>
                        <OdometerUpload
                            vehicleId={selectedTrip.vehicleId}
                            tripId={selectedTrip.id}
                            onSuccess={() => {
                                setShowOdometerUpload(false);
                                toast({
                                    title: "Odometer reading submitted",
                                    description: "Your reading has been submitted for verification"
                                });
                            }}
                            onCancel={() => setShowOdometerUpload(false)}
                        />
                    </DialogContent>
                </Dialog>
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


const TripTable = ({trips, getStatusBadge, onStartTrip, onEndTrip, onViewDetails}: TripTableProps) => {
    const { t } = useLanguage();
    return (
    <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>{t("Route")}</TableHead>
                    <TableHead>{t("Start Date")}</TableHead>
                    <TableHead>{t("End Date")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
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
                                   <DropdownMenuItem onClick={() => onViewDetails(trip)}><FileText className="mr-2"/>{t("View Details")}</DropdownMenuItem>
                                   {trip.status === 'Planned' && <DropdownMenuItem onClick={() => onStartTrip(trip.id)}><Play className="mr-2"/>{t("Start Trip")}</DropdownMenuItem>}
                                   {trip.status === 'Ongoing' && <DropdownMenuItem onClick={() => onEndTrip(trip.id)}><CircleCheck className="mr-2"/>{t("End Trip")}</DropdownMenuItem>}
                                   {(trip.status === 'Planned' || trip.status === 'Ongoing') && (
                                    <DropdownMenuItem asChild>
                                      <Link href="/support" className="text-destructive focus:text-destructive">
                                        <AlertTriangle className="mr-2 h-4 w-4" /> {t("Report Issue")}
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
                <p>{t("No trips to display in this category.")}</p>
            </div>
        )}
    </>
    )
}

const InfoItem = ({ label, value }: { label: string, value: string | React.ReactNode }) => (
    <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold">{value}</p>
    </div>
)

