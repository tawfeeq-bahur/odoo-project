
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getTripPlan, TripPlannerOutput } from '@/ai/flows/trip-planner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Map, Milestone, Fuel, Clock, AlertTriangle, Route, Truck, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';

const MapDisplay = dynamic(
  () => import('@/components/fleet/MapDisplay').then((mod) => mod.MapDisplay),
  { 
    ssr: false,
    loading: () => <Skeleton className="aspect-video w-full h-[400px] border-2 border-dashed rounded-lg bg-muted/30" />
  }
);


const formSchema = z.object({
  source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
  vehicleType: z.string({required_error: "Vehicle type is required."}).min(1, "Vehicle type is required."),
  fuelType: z.string({required_error: "Fuel type is required."}).min(1, "Fuel type is required."),
  modelYear: z.coerce.number({required_error: "Model year is required."}).min(1980, "Enter a valid year.").max(new Date().getFullYear() + 1),
  engineSizeLiters: z.coerce.number({required_error: "Engine size is required."}).min(0.1, "Enter a valid size.").max(20),
  routeType: z.string({required_error: "Route type is required."}).min(1, "Route type is required."),
  traffic: z.string({required_error: "Traffic condition is required."}).min(1, "Traffic condition is required."),
  loadKg: z.coerce.number().optional(),
});

export default function TripPlannerPage() {
  const [plan, setPlan] = useState<TripPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      source: '',
      destination: '',
      vehicleType: '',
      fuelType: '',
      routeType: '',
      traffic: '',
      modelYear: undefined,
      engineSizeLiters: undefined,
      loadKg: undefined,
    },
  });

  const isFormValid = form.formState.isValid;
  const currentTraffic = form.watch('traffic');


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
  
  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">AI Trip Planner</h1>
          <p className="text-muted-foreground">
            Enter detailed trip information to get an optimized plan, cost estimation, and points of interest.
          </p>
        </div>
      <Form {...form}>
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Plan a New Trip</CardTitle>
                                <CardDescription>Start by entering the source and destination for your trip.</CardDescription>
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
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5"/> Vehicle Information</CardTitle>
                                <CardDescription>Provide details about the vehicle being used for the trip.</CardDescription>
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
                                        <FormMessage />
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
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="modelYear"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Model Year</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 2022" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="engineSizeLiters"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Engine Size (Liters)</FormLabel>
                                        <FormControl><Input type="number" step="0.1" placeholder="e.g., 2.5" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5"/> Trip Conditions</CardTitle>
                                <CardDescription>Describe the conditions expected for this trip.</CardDescription>
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
                                        <FormMessage />
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
                                                <SelectItem value="light">Light</SelectItem>
                                                <SelectItem value="normal">Normal</SelectItem>
                                                <SelectItem value="stop_and_go">Stop & Go</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={form.control}
                                    name="loadKg"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Load in kg (Optional)</FormLabel>
                                        <FormControl><Input type="number" placeholder="e.g., 5000" {...field} value={field.value ?? ''} /></FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                            </CardContent>
                        </Card>
                         <Button type="submit" disabled={isLoading || !isFormValid} className="w-full">
                            <Route className="mr-2"/>
                            {isLoading ? 'Generating Plan...' : 'Generate Trip Plan'}
                        </Button>
                    </form>
            </div>
            <div className="lg:col-span-2">
                {isLoading && <PlanSkeleton />}
                {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                
                {!plan && !isLoading && (
                    <Card className="h-full">
                        <CardContent className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <Map className="h-24 w-24 mb-4 text-primary/50" />
                            <h2 className="text-2xl font-semibold">Your Trip Plan Will Appear Here</h2>
                            <p className="max-w-md mt-2">Fill out all the required fields in the form and click "Generate Trip Plan" to see your estimated route, costs, and points of interest on the map.</p>
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
                   <MapDisplay plan={plan} traffic={currentTraffic} />
                </div>
                )}
            </div>
        </div>
    </Form>
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
