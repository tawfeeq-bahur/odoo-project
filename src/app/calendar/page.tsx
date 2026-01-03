"use client";

import { useSharedState } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    ChevronRight,
    MapPin,
} from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
    parseISO,
    getDay,
} from "date-fns";
import { TourPackage } from "@/lib/types";
import { TripDetailsDialog } from "@/components/TripDetailsDialog";
import { AddPackageDialog } from "@/components/fleet/AddVehicleDialog";
import { cn } from "@/lib/utils";

export default function CalendarPage() {
    const { packages, user } = useSharedState();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedTour, setSelectedTour] = useState<TourPackage | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
    const dialogTriggerRef = useRef<HTMLButtonElement>(null);

    // Auto-trigger dialog when date is clicked
    useEffect(() => {
        if (scheduleDialogOpen && dialogTriggerRef.current) {
            dialogTriggerRef.current.click();
        }
    }, [scheduleDialogOpen]);

    if (!user) return null;

    // Get all user's tours (organized + joined)
    const userTours = useMemo(() => {
        const organized = packages.filter((p) => p.organizerName === user.username);
        const joined = packages.filter(
            (p) =>
                p.members.some(
                    (member) =>
                        (typeof member === "string" ? member : member.name) === user.username
                ) && p.organizerName !== user.username
        );
        return [...organized, ...joined].filter((tour) => tour.startDate);
    }, [packages, user.username]);

    // Get days in current month
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get tours for a specific date
    const getToursForDate = (date: Date): TourPackage[] => {
        return userTours.filter((tour) => {
            if (!tour.startDate) return false;
            const startDate = parseISO(tour.startDate);
            const endDate = tour.endDate ? parseISO(tour.endDate) : startDate;

            // Check if date is within the tour range
            return date >= startDate && date <= endDate;
        });
    };

    // Get the starting day of the week for the month (0 = Sunday, 1 = Monday, etc.)
    const monthStartDay = getDay(monthStart);

    // Create empty cells for days before the month starts
    const emptyDays = Array.from({ length: monthStartDay }, (_, i) => i);

    const handleDateClick = (day: Date, tours: TourPackage[]) => {
        if (tours.length > 0) {
            // Show existing tour details
            setSelectedTour(tours[0]);
            setDialogOpen(true);
        } else {
            // Open schedule new tour dialog
            setSelectedDate(day);
            setScheduleDialogOpen(true);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Ongoing":
                return "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300";
            case "Up-Coming":
                return "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300";
            case "Completed":
                return "bg-gray-500/20 border-gray-500 text-gray-700 dark:text-gray-300";
            default:
                return "bg-primary/20 border-primary";
        }
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const goToToday = () => setCurrentMonth(new Date());

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-2">
                        <CalendarIcon className="h-8 w-8" />
                        Travel Calendar
                    </h1>
                    <p className="text-muted-foreground">
                        View all your travel plans throughout the year
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Trips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userTours.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Upcoming Trips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {userTours.filter((t) => t.status === "Up-Coming").length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Ongoing Trips
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {userTours.filter((t) => t.status === "Ongoing").length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Calendar */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-bold">
                            {format(currentMonth, "MMMM yyyy")}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={goToToday}>
                                Today
                            </Button>
                            <Button variant="outline" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={nextMonth}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                        {/* Weekday headers */}
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                            <div
                                key={day}
                                className="text-center text-sm font-semibold text-muted-foreground py-2"
                            >
                                {day}
                            </div>
                        ))}

                        {/* Empty cells for days before month starts */}
                        {emptyDays.map((i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {/* Calendar days */}
                        {daysInMonth.map((day) => {
                            const tours = getToursForDate(day);
                            const isToday = isSameDay(day, new Date());
                            const hasTrips = tours.length > 0;

                            return (
                                <div
                                    key={day.toISOString()}
                                    className={cn(
                                        "aspect-square p-2 border rounded-lg transition-all relative overflow-hidden",
                                        hasTrips
                                            ? "cursor-pointer hover:shadow-lg hover:scale-105"
                                            : "bg-muted/30",
                                        isToday && "ring-2 ring-primary"
                                    )}
                                    onClick={() => handleDateClick(day, tours)}
                                >
                                    <div className="flex flex-col h-full">
                                        <span
                                            className={cn(
                                                "text-sm font-semibold mb-1",
                                                isToday && "text-primary",
                                                !isSameMonth(day, currentMonth) && "text-muted-foreground"
                                            )}
                                        >
                                            {format(day, "d")}
                                        </span>
                                        <div className="space-y-1 flex-1 overflow-hidden">
                                            {tours.slice(0, 2).map((tour, idx) => (
                                                <div
                                                    key={idx}
                                                    className={cn(
                                                        "text-xs px-1.5 py-0.5 rounded border truncate",
                                                        getStatusColor(tour.status)
                                                    )}
                                                    title={tour.name}
                                                >
                                                    <MapPin className="h-2.5 w-2.5 inline mr-1" />
                                                    {tour.destination}
                                                </div>
                                            ))}
                                            {tours.length > 2 && (
                                                <div className="text-xs text-muted-foreground px-1.5">
                                                    +{tours.length - 2} more
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Status Legend</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border bg-green-500/20 border-green-500" />
                            <span className="text-sm">Ongoing</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border bg-blue-500/20 border-blue-500" />
                            <span className="text-sm">Up-Coming</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 rounded border bg-gray-500/20 border-gray-500" />
                            <span className="text-sm">Completed</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Trips List */}
            {userTours.filter((t) => t.status === "Up-Coming").length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Upcoming Trips</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {userTours
                                .filter((t) => t.status === "Up-Coming")
                                .sort((a, b) => {
                                    if (!a.startDate || !b.startDate) return 0;
                                    return (
                                        parseISO(a.startDate).getTime() -
                                        parseISO(b.startDate).getTime()
                                    );
                                })
                                .map((tour) => (
                                    <div
                                        key={tour.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                                        onClick={() => {
                                            setSelectedTour(tour);
                                            setDialogOpen(true);
                                        }}
                                    >
                                        <div className="space-y-1">
                                            <h4 className="font-semibold">{tour.name}</h4>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {tour.destination}
                                            </p>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-sm font-medium">
                                                {tour.startDate &&
                                                    format(parseISO(tour.startDate), "MMM dd, yyyy")}
                                            </p>
                                            <Badge variant="secondary">{tour.durationDays} days</Badge>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Trip Details Dialog */}
            <TripDetailsDialog
                tour={selectedTour}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />

            {/* Schedule New Travel Dialog */}
            <AddPackageDialog onAddPackage={() => setScheduleDialogOpen(false)}>
                <Button ref={dialogTriggerRef} style={{ display: 'none' }} />
            </AddPackageDialog>
        </div>
    );
}


