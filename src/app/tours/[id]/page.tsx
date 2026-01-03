

'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Calendar,
  Users,
  Route,
  Wallet,
  Camera,
  ArrowLeft,
  Clock,
  Home,
  Utensils,
  Ticket,
  User as UserIcon,
  CheckCircle,
  FolderSync,
  Save,
  Briefcase,
  Sun,
  Moon,
  Mountain
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

const MapDisplay = dynamic(
  () => import('@/components/fleet/MapDisplay').then((mod) => mod.MapDisplay),
  {
    ssr: false,
    loading: () => <Skeleton className="aspect-video w-full h-[400px] border-2 border-dashed rounded-lg bg-muted/30" />
  }
);

export default function TourDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { packages, trips, expenses, user, updatePackage } = useSharedState();

  const tourId = params.id as string;
  const tour = packages.find(p => p.id === tourId);
  const tripPlan = trips.find(t => t.packageId === tourId);
  const tourExpenses = expenses.filter(e => e.tourId === tourId);
  const itinerary = tripPlan?.plan?.itinerary || [];

  const [driveLink, setDriveLink] = useState(tour?.driveLink || '');

  if (!tour) {
    notFound();
  }

  // Check if current user is part of the tour (either organizer or member)
  const isOrganizer = tour.organizerName === user?.username;
  const isMember = isOrganizer || (Array.isArray(tour.members) && tour.members.some(member => (typeof member === 'string' ? member : member.name) === user?.username));

  if (!isMember) {
    // If not a member, deny access by showing a 404.
    notFound();
  }

  const totalExpenses = useMemo(() => {
    return tourExpenses.reduce((total, exp) => total + exp.amount, 0);
  }, [tourExpenses]);


  const handleSaveDriveLink = () => {
    updatePackage(tour.id, { driveLink: driveLink });
    toast({
      title: "Drive Link Saved!",
      description: "The shared album link has been updated.",
    });
  };

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "Food": return <Utensils className="h-4 w-4 text-muted-foreground" />;
      case "Travel": return <Route className="h-4 w-4 text-muted-foreground" />;
      case "Hotel": return <Home className="h-4 w-4 text-muted-foreground" />;
      case "Tickets": return <Ticket className="h-4 w-4 text-muted-foreground" />;
      default: return <Wallet className="h-4 w-4 text-muted-foreground" />;
    }
  }


  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
        <div>
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-2 -ml-4">
            <ArrowLeft className="mr-2" /> Back to Dashboard
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight font-headline">{tour.name}</h1>
            <Badge variant={tour.status === 'Ongoing' ? 'default' : 'secondary'}>{tour.status}</Badge>
          </div>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <MapPin className="h-4 w-4" /> {tour.destination}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CheckCircle className="mr-2" /> Check-in Location
          </Button>
          <Button asChild>
            <Link href={`/scanner?tourId=${tour.id}`}>
              <Wallet className="mr-2" /> Log Expense
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Trip Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <InfoItem icon={Calendar} label="Duration" value={`${tour.durationDays} Days`} />
              <InfoItem icon={Briefcase} label="Organizer" value={tour.organizerName} />
              <InfoItem icon={Users} label="Max Group Size" value={`${tour.maxMembers} members`} />
              <InfoItem icon={tour.travelStyle === 'day' ? Sun : tour.travelStyle === 'night' ? Moon : Mountain} label="Travel Style" value={tour.travelStyle.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} />
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle>Members ({tour.members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {tour.members.length > 0 ? (
                <div className="space-y-3">
                  {tour.members.map((member, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium flex items-center gap-2"><UserIcon className="h-4 w-4 text-muted-foreground" /> {typeof member === 'string' ? member : member.name}</span>
                      <span className="text-xs text-muted-foreground">Location not shared</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No members have joined yet.</p>
              )}
            </CardContent>
          </Card>

          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
            <CardHeader>
              <CardTitle>Shared Photo Album</CardTitle>
              <CardDescription>A shared Google Drive folder for all tour photos.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full" variant="outline">
                <a href={tour.driveLink || '#'} target="_blank" rel="noopener noreferrer">
                  <FolderSync className="mr-2" /> Access Shared Album
                </a>
              </Button>

              {isOrganizer && (
                <div className="space-y-2 pt-4 border-t">
                  <Label htmlFor="driveLinkInput">Edit Drive Link</Label>
                  <Input
                    id="driveLinkInput"
                    placeholder="Paste Google Drive link here"
                    value={driveLink}
                    onChange={(e) => setDriveLink(e.target.value)}
                  />
                  <Button onClick={handleSaveDriveLink} className="w-full">
                    <Save className="mr-2" /> Save Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {tripPlan && tripPlan.plan ? (
            <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle>Route Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <MapDisplay plan={tripPlan.plan} traffic={tripPlan.plan.traffic} />
              </CardContent>
            </Card>
          ) : (
            <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '400ms' }}>
              <CardHeader>
                <CardTitle>Route Plan</CardTitle>
              </CardHeader>
              <CardContent className="text-center text-muted-foreground py-12">
                <Route className="mx-auto h-12 w-12 mb-4" />
                <h3 className="font-semibold">No Route Planned Yet</h3>
                <p>The organizer hasn't generated a route plan for this tour.</p>
              </CardContent>
            </Card>
          )}

          <Card className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500" style={{ animationDelay: '500ms' }}>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              {itinerary.length > 0 ? (
                <div className="space-y-4">
                  {itinerary.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="text-center">
                        <p className="font-bold">Day {item.day}</p>
                        <p className="text-xs text-muted-foreground">{item.time}</p>
                      </div>
                      <div className="border-l-2 border-primary pl-4">
                        <p className="font-semibold">{item.activity}</p>
                        {item.notes && <p className="text-xs text-muted-foreground italic">"{item.notes}"</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Clock className="mx-auto h-8 w-8 mb-2" />
                  <p>No itinerary has been set for this tour yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) => (
  <div className="flex items-center gap-3">
    <div className="p-2 bg-muted rounded-md">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  </div>
);
