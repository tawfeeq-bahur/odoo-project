"use client";

import { TourPackage } from "@/lib/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, parseISO } from "date-fns";
import {
    MapPin,
    Calendar,
    DollarSign,
    Users,
    Clock,
    User,
    Briefcase,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface TripDetailsDialogProps {
    tour: TourPackage | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function TripDetailsDialog({
    tour,
    open,
    onOpenChange,
}: TripDetailsDialogProps) {
    if (!tour) return null;

    const now = new Date();
    const startDate = tour.startDate ? parseISO(tour.startDate) : null;
    const endDate = tour.endDate ? parseISO(tour.endDate) : null;
    const daysRemaining = startDate ? differenceInDays(startDate, now) : null;

    const memberCount =
        tour.members.length + 1; // +1 for organizer

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "Ongoing":
                return "default";
            case "Up-Coming":
                return "secondary";
            case "Completed":
                return "outline";
            default:
                return "default";
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1.5">
                            <DialogTitle className="text-2xl font-bold">
                                {tour.name}
                            </DialogTitle>
                            <DialogDescription className="flex items-center gap-2 text-base">
                                <MapPin className="h-4 w-4" />
                                {tour.destination}
                            </DialogDescription>
                        </div>
                        <Badge variant={getStatusVariant(tour.status)}>
                            {tour.status}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Trip Dates */}
                    {startDate && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Travel Dates
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Start Date</p>
                                    <p className="text-lg font-semibold">
                                        {format(startDate, "PPP")}
                                    </p>
                                </div>
                                {endDate && (
                                    <div className="space-y-1">
                                        <p className="text-sm text-muted-foreground">End Date</p>
                                        <p className="text-lg font-semibold">
                                            {format(endDate, "PPP")}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Days Remaining */}
                    {tour.status === "Up-Coming" && daysRemaining !== null && (
                        <>
                            <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                                <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Time Until Trip
                                </h3>
                                <p className="text-3xl font-bold text-primary">
                                    {daysRemaining > 0
                                        ? `${daysRemaining} days remaining`
                                        : daysRemaining === 0
                                            ? "Trip starts today!"
                                            : "Trip has started"}
                                </p>
                            </div>
                            <Separator />
                        </>
                    )}

                    {/* Trip Details */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Trip Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoItem
                                icon={Clock}
                                label="Duration"
                                value={`${tour.durationDays} Days`}
                            />
                            <InfoItem
                                icon={DollarSign}
                                label="Price Per Person"
                                value={`₹${tour.pricePerPerson.toLocaleString()}`}
                            />
                            <InfoItem
                                icon={DollarSign}
                                label="Max Budget"
                                value={`₹${tour.maxBudget.toLocaleString()}`}
                            />
                            <InfoItem
                                icon={Users}
                                label="Members"
                                value={`${memberCount} / ${tour.maxMembers}`}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Organizer & Members */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase text-muted-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Participants
                        </h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                                        {tour.organizerName.substring(0, 2).toUpperCase()}
                                    </div>
                                    <span className="font-medium">{tour.organizerName}</span>
                                </div>
                                <Badge variant="outline">Organizer</Badge>
                            </div>
                            {tour.members.length > 0 && (
                                <div className="space-y-2">
                                    {tour.members.map((member, idx) => {
                                        const memberName =
                                            typeof member === "string" ? member : member.name;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center gap-2 p-2 pl-3 rounded-lg hover:bg-muted/50 transition-colors"
                                            >
                                                <div className="h-7 w-7 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
                                                    {memberName.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm">{memberName}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Trip Type & Style */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Trip Type</p>
                            <Badge variant="secondary" className="capitalize">
                                {tour.tripType}
                            </Badge>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Travel Style</p>
                            <Badge variant="secondary" className="capitalize">
                                {tour.travelStyle}
                            </Badge>
                        </div>
                    </div>

                    {/* Invite Code */}
                    <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm text-muted-foreground">Invite Code</p>
                        <p className="text-2xl font-mono font-bold tracking-wider">
                            {tour.inviteCode}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const InfoItem = ({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) => (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
        <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);
