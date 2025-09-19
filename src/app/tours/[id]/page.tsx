
'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MapPin,
  Calendar,
  Users,
  Route,
  Wallet,
  Camera,
  Upload,
  ArrowLeft,
  Clock,
  Home,
  Utensils,
  Ticket
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo, useState, useRef } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
  const { packages, trips, expenses, itineraries, user, addPhotoToTour } = useSharedState();
  
  const tourId = params.id as string;
  const tour = packages.find(p => p.id === tourId);
  const tripPlan = trips.find(t => t.packageId === tourId);
  const tourExpenses = expenses.filter(e => e.tourId === tourId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  if (!tour) {
    notFound();
  }

  // Check if current user is part of the tour
  const isMember = tour.organizerName === user?.username || tour.members.includes(user?.username || '');
  if (!isMember) {
    notFound(); // Or show an access denied message
  }

  const totalExpenses = useMemo(() => {
    return tourExpenses.reduce((total, exp) => total + exp.amount, 0);
  }, [tourExpenses]);

  const expenseByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    tourExpenses.forEach(exp => {
        categoryMap[exp.type] = (categoryMap[exp.type] || 0) + exp.amount;
    });
    return Object.entries(categoryMap);
  }, [tourExpenses]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // In a real app, you'd upload this to a server and get back a URL.
        // For this demo, we'll just use the base64 data URI.
        addPhotoToTour(tour.id, result);
        toast({
          title: "Photo Added!",
          description: "Your photo has been added to the tour gallery.",
        });
      };
      reader.readAsDataURL(file);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/')} className="mb-2">
            <ArrowLeft className="mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{tour.name}</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4" /> {tour.destination}
          </p>
        </div>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href={`/scanner?tourId=${tour.id}`}>
                    <Wallet className="mr-2" /> Log Expense
                </Link>
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-2"/> Add Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                />
            </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Trip Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <InfoItem icon={Calendar} label="Duration" value={`${tour.durationDays} Days`} />
              <InfoItem icon={Users} label="Organizer" value={tour.organizerName} />
              <InfoItem icon={Users} label="Members" value={`${tour.members.length + 1} Total`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
                {itineraries.length > 0 ? (
                    <div className="space-y-4">
                        {itineraries.map(item => (
                            <div key={item.id} className="flex gap-4">
                                <div className="text-center">
                                    <p className="font-bold">Day {item.day}</p>
                                    <p className="text-xs text-muted-foreground">{item.time}</p>
                                </div>
                                <div className="border-l-2 border-primary pl-4">
                                    <p className="font-semibold">{item.place}</p>
                                    {item.notes && <p className="text-xs text-muted-foreground italic">"{item.notes}"</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ): (
                    <div className="text-center text-muted-foreground py-8">
                        <Clock className="mx-auto h-8 w-8 mb-2" />
                        <p>No itinerary has been set for this tour yet.</p>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-8">
          {tripPlan ? (
            <MapDisplay plan={tripPlan.plan} />
          ) : (
            <Card>
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

          <Card>
            <CardHeader>
                <CardTitle>Photo Gallery</CardTitle>
            </CardHeader>
            <CardContent>
                {tour.gallery.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {tour.gallery.map((url, index) => (
                            <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                                <Image src={url} alt={`Tour photo ${index + 1}`} width={200} height={200} className="object-cover w-full h-full" data-ai-hint="travel landscape"/>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center text-muted-foreground py-12">
                        <Camera className="mx-auto h-12 w-12 mb-4" />
                        <h3 className="font-semibold">No Photos Yet</h3>
                        <p>Be the first to add a photo to this tour's gallery!</p>
                    </div>
                )}
            </CardContent>
          </Card>

           <Card>
                <CardHeader>
                    <CardTitle>Expense Summary</CardTitle>
                    <CardDescription>
                        Total amount spent on this tour: <span className="font-bold">₹{totalExpenses.toLocaleString()}</span>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   <ul className="space-y-2">
                    {expenseByCategory.map(([category, amount]) => (
                        <li key={category} className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2">
                                {getCategoryIcon(category)}
                                {category}
                            </span>
                            <span className="font-medium">₹{amount.toLocaleString()}</span>
                        </li>
                    ))}
                   </ul>
                   {tourExpenses.length === 0 && (
                     <div className="text-center text-muted-foreground py-8">
                        <Wallet className="mx-auto h-8 w-8 mb-2" />
                        <p>No expenses have been logged for this tour.</p>
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
    <div className="flex items-start gap-3">
        <div className="p-2 bg-muted rounded-md">
            <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
);
