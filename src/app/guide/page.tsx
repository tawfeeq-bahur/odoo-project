
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getTripPlan, TripPlannerOutput } from '@/ai/flows/trip-planner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Map, Milestone, Fuel, Clock, AlertTriangle, Route, Car, Droplet, Calendar, Gauge, Settings, Thermometer, Box, Truck, Building2, Hospital, Utensils, Bed, Bath } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  vehicleType: z.string().optional(),
  fuelType: z.string().optional(),
  modelYear: z.coerce.number().optional(),
  engineSizeLiters: z.coerce.number().optional(),
  routeType: z.string().optional(),
  traffic: z.string().optional(),
  loadKg: z.coerce.number().optional(),
});

export default function TripPlannerPage() {
  const [plan, setPlan] = useState<TripPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: '',
      destination: '',
      vehicleType: 'truck',
      fuelType: 'diesel',
      routeType: 'highway',
      traffic: 'normal',
      modelYear: '' as any,
      engineSizeLiters: '' as any,
      loadKg: '' as any,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setPlan(null);
    try {
      const result = await getTripPlan(values);
      setPlan(result);
    } catch (err) {
      setError('Sorry, I could not generate a trip plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const POI_ICONS = {
    Hospitals: <Hospital className="h-5 w-5 text-red-500" />,
    'Fuel Stations': <Fuel className="h-5 w-5 text-yellow-500" />,
    Restaurants: <Utensils className="h-5 w-5 text-orange-500" />,
    Hotels: <Bed className="h-5 w-5 text-blue-500" />,
    Restrooms: <Bath className="h-5 w-5 text-green-500" />,
  };

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">AI Trip Planner</h1>
          <p className="text-muted-foreground">
            Enter detailed trip information to get an optimized plan, cost estimation, and points of interest.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan a New Trip</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="source"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Source</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Chennai, TN" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="destination"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Destination</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Bengaluru, KA" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <Button type="submit" disabled={isLoading} className="w-full">
                                    <Route className="mr-2"/>
                                {isLoading ? 'Generating Plan...' : 'Generate Trip Plan'}
                                </Button>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> Vehicle Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="vehicleType"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Vehicle Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="car">Car</SelectItem>
                                                <SelectItem value="bike">Bike/Motorcycle</SelectItem>
                                                <SelectItem value="bus">Bus</SelectItem>
                                                <SelectItem value="truck">Truck</SelectItem>
                                                <SelectItem value="electric">Electric Vehicle</SelectItem>
                                                <SelectItem value="hybrid">Hybrid Vehicle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="fuelType"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Fuel Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="petrol">Petrol/Gasoline</SelectItem>
                                                <SelectItem value="diesel">Diesel</SelectItem>
                                                <SelectItem value="cng">CNG</SelectItem>
                                                <SelectItem value="electric">Electric</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="modelYear"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Model Year</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 2022" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="engineSizeLiters"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Engine Size (Liters)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                    />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/> Trip Conditions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="routeType"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Route Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select route type" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="city">City</SelectItem>
                                                <SelectItem value="highway">Highway</SelectItem>
                                                <SelectItem value="city_and_highway">City & Highway</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="traffic"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Expected Traffic</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select traffic condition" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="stop_and_go">Stop & Go</SelectItem>
                                                <SelectItem value="light">Light</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="loadKg"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Load in kg (Optional)</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 5000" {...field} /></FormControl>
                                        </FormItem>
                                    )}
                                    />
                            </CardContent>
                        </Card>
                    </form>
                </Form>
            </div>
            <div className="lg:col-span-2">
                {isLoading && <PlanSkeleton />}
                {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                
                {!plan && !isLoading && (
                    <Card className="h-full">
                        <CardContent className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <Map className="h-24 w-24 mb-4 text-primary/50" />
                            <h2 className="text-2xl font-semibold">Your Trip Plan Will Appear Here</h2>
                            <p className="max-w-md mt-2">Fill out the form on the left and click "Generate Trip Plan" to see your estimated route, costs, and points of interest on the map.</p>
                        </CardContent>
                    </Card>
                )}

                {plan && (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Trip Plan: {plan.source} to {plan.destination}</CardTitle>
                            <CardDescription>{plan.suggestedRoute}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                            <InfoCard icon={Map} title="Distance" content={plan.distance} />
                            <InfoCard icon={Clock} title="Duration" content={plan.duration} />
                            <InfoCard icon={Fuel} title="Fuel Cost" content={`₹${plan.estimatedFuelCost.toFixed(2)}`} />
                            <InfoCard icon={Milestone} title="Toll Cost" content={`₹${plan.estimatedTollCost.toFixed(2)}`} />
                        </div>
                        <Separator />
                        <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/40 dark:text-blue-300">
                            <AlertTriangle className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                            <AlertTitle>Disclaimer</AlertTitle>
                            <AlertDescription>
                                {plan.disclaimer}
                            </AlertDescription>
                        </Alert>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Route Map & Points of Interest</CardTitle>
                            <CardDescription>A visual representation of your route and notable locations.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-video w-full border-2 border-dashed rounded-lg flex items-center justify-center relative bg-muted/30">
                                <Image src="/map-placeholder.png" alt="Map placeholder with a route" layout="fill" objectFit="cover" className="rounded-lg" data-ai-hint="map route" />
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle>Points of Interest Along Route</CardTitle>
                            <CardDescription>Key locations identified by the AI near your suggested path.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plan.pointsOfInterest && Object.entries(plan.pointsOfInterest).map(([category, places]) => (
                                <div key={category} className="p-4 border rounded-lg bg-background">
                                    <h3 className="font-semibold flex items-center gap-2 mb-2">
                                        {POI_ICONS[category as keyof typeof POI_ICONS]}
                                        {category}
                                    </h3>
                                    <ul className="space-y-1 text-sm text-muted-foreground list-disc pl-5">
                                      {(places as string[]).map((place: string, index: number) => (
                                        <li key={index}>{place}</li>
                                      ))}
                                    </ul>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                )}
            </div>
        </div>
      </div>
  );
}

const InfoCard = ({ icon: Icon, title, content }: { icon: React.ElementType, title: string, content: string }) => (
    <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-muted/50">
        <Icon className="h-8 w-8 text-primary" />
        <div>
            <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
            <p className="text-xl font-bold">{content}</p>
        </div>
    </div>
);

const PlanSkeleton = () => (
    <div className="space-y-8">
        <Card>
            <CardHeader>
            <div className="space-y-2">
                <Skeleton className="h-8 w-2/3" />
                <Skeleton className="h-4 w-full" />
            </div>
            </CardHeader>
            <CardContent className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
            </div>
            <Skeleton className="h-16 w-full" />
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                 <Skeleton className="h-6 w-1/2" />
                 <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
                <Skeleton className="aspect-video w-full" />
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-32 w-full" />
               <Skeleton className="h-32 w-full" />
            </CardContent>
        </Card>
    </div>
);
