

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
import { Map as MapIcon, Milestone, Fuel, Clock, AlertTriangle, Route, Compass, Send } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { useSharedState } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';

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
  vehicleModel: z.string().min(1, "Please select a travel mode."),
  routeType: z.string({required_error: "Route type is required."}).min(1, "Route type is required."),
  traffic: z.string({required_error: "Traffic condition is required."}).min(1, "Traffic condition is required."),
  avg_speed_kmph: z.coerce.number().min(1, "Average speed must be at least 1 kmph").max(200, "Average speed cannot exceed 200 kmph"),
  max_speed_kmph: z.coerce.number().min(1, "Max speed must be at least 1 kmph").max(200, "Max speed cannot exceed 200 kmph"),
  packageId: z.string().min(1, "Please select a tour package for this route."),
});


export default function TourPlannerPage() {
  const [plan, setPlan] = useState<TripPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, packages, addTrip } = useSharedState();
  const { toast } = useToast();

  const plannerForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      source: '',
      destination: '',
      routeType: 'Highway',
      traffic: 'Normal',
      vehicleModel: 'Car',
      avg_speed_kmph: 60,
      max_speed_kmph: 100,
      packageId: '',
    },
  });
  
  const isFormValid = plannerForm.formState.isValid;
  const currentTraffic = plannerForm.watch('traffic');
  
  async function onPlannerSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setPlan(null);

    const selectedPackage = packages.find(p => p.id === values.packageId);
    if (!selectedPackage || !user) {
        setError('Could not find the selected package or user.');
        setIsLoading(false);
        return;
    }

    try {
      const result = await getTripPlan({
        ...values,
        durationDays: selectedPackage.durationDays,
        loadKg: 100, // Dummy value
      });
      
      addTrip({
          source: result.source,
          destination: result.destination,
          startDate: new Date().toISOString(),
          organizerName: user.username,
          packageId: selectedPackage.id,
          packageName: selectedPackage.name, // Pass the package name
          plan: result,
      });

      toast({
          title: "Route Plan Generated!",
          description: `A plan for ${result.source} to ${result.destination} has been created and assigned to "${selectedPackage.name}".`
      });

      setPlan(result);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sorry, I could not generate a trip plan. The AI model might be unavailable. Please try again.';
      setError(errorMessage);
      const fallbackPlan = generateFallbackPlan({
        ...values,
        durationDays: selectedPackage.durationDays,
        loadKg: 100,
      });
      addTrip({
        source: fallbackPlan.source,
        destination: fallbackPlan.destination,
        startDate: new Date().toISOString(),
        organizerName: user.username,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        plan: fallbackPlan,
      });
      setPlan(fallbackPlan);
    } finally {
      setIsLoading(false);
    }
  }

  function generateFallbackPlan(input: z.infer<typeof formSchema> & { loadKg: number, durationDays: number }): TripPlannerOutput {
    const distance = 450;
    const duration = '8 hours 30 minutes';
    
    return {
        source: input.source,
        destination: input.destination,
        distance: `${distance} km`,
        duration: duration,
        estimatedFuelCost: (distance / 12) * 105,
        estimatedTollCost: distance * 1.5,
        suggestedRoute: `Take the main national highway from ${input.source} to ${input.destination}.`,
        routePolyline: [],
        disclaimer: 'This is a fallback estimated plan. AI model is currently unavailable. Actual values may vary.',
        routeType: input.routeType,
        traffic: input.traffic,
        ecoTip: 'Consider using public transport for parts of your journey to reduce your carbon footprint.',
        itinerary: Array.from({ length: input.durationDays || 1 }).map((_, i) => ({
            day: i + 1,
            time: 'Morning',
            activity: i === 0 ? 'Start journey' : `Explore ${input.destination}`,
            notes: i === 0 ? 'Have a safe trip!' : 'Discover local sights.',
        })),
    };
  }
  
  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Route Planner</h1>
          <p className="text-muted-foreground">
            Generate a detailed travel plan with AI, including route, costs, and points of interest.
          </p>
        </div>
      <Form {...plannerForm}>
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
                <form onSubmit={plannerForm.handleSubmit(onPlannerSubmit)} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. Trip Details</CardTitle>
                            <CardDescription>Enter the source and destination for your trip.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={plannerForm.control}
                                name="packageId"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Tour Package</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Assign this route to a tour" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {packages.map(pkg => (
                                                <SelectItem key={pkg.id} value={pkg.id}>{pkg.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={plannerForm.control}
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
                                control={plannerForm.control}
                                name="destination"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Destination</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Manali, HP" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>2. Travel Conditions</CardTitle>
                            <CardDescription>Describe the conditions expected for this trip.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <FormField
                                control={plannerForm.control}
                                name="vehicleModel"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Primary Mode of Travel</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select travel mode" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Car">Car</SelectItem>
                                            <SelectItem value="Bus">Bus</SelectItem>
                                            <SelectItem value="Train">Train</SelectItem>
                                            <SelectItem value="Plane">Plane</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={plannerForm.control}
                                name="routeType"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Route Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select route type" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="City">City</SelectItem>
                                            <SelectItem value="Highway">Highway</SelectItem>
                                            <SelectItem value="Mixed">City & Highway</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={plannerForm.control}
                                name="traffic"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Expected Traffic</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select traffic condition" /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Light">Light</SelectItem>
                                            <SelectItem value="Normal">Normal</SelectItem>
                                            <SelectItem value="Stop & Go">Heavy / Stop & Go</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={plannerForm.control}
                                name="avg_speed_kmph"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Average Speed (kmph)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 60" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={plannerForm.control}
                                name="max_speed_kmph"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Maximum Speed (kmph)</FormLabel>
                                    <FormControl><Input type="number" placeholder="e.g., 100" {...field} /></FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                        </CardContent>
                    </Card>
                     <Button type="submit" disabled={isLoading || !isFormValid} className="w-full">
                        <Send className="mr-2"/>
                        {isLoading ? 'Generating Plan...' : 'Generate Travel Plan'}
                    </Button>
                </form>
            </div>
            <div className="lg:col-span-2">
                {isLoading && <PlanSkeleton />}
                {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                
                {!plan && !isLoading && (
                    <Card className="h-full">
                        <CardContent className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <Compass className="h-24 w-24 mb-4 text-primary/50" />
                            <h2 className="text-2xl font-semibold">Your AI-Generated Travel Plan Will Appear Here</h2>
                            <p className="max-w-md mt-2">Fill out the fields and click "Generate Travel Plan" to see the magic happen.</p>
                        </CardContent>
                    </Card>
                )}

                {plan && (
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl font-headline">Travel Plan: {plan.source} to {plan.destination}</CardTitle>
                            <CardDescription>{plan.suggestedRoute}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                            <InfoCard icon={Route} title="Distance" content={plan.distance} />
                            <InfoCard icon={Clock} title="Duration" content={plan.duration} />
                            <InfoCard icon={Fuel} title="Fuel Cost" content={`₹${plan.estimatedFuelCost.toFixed(2)}`} />
                            <InfoCard icon={Milestone} title="Toll Cost" content={`₹${plan.estimatedTollCost.toFixed(2)}`} />
                        </div>
                        <Separator />
                         <Alert>
                            <AlertTriangle className="h-5 w-5" />
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
        <Skeleton className="aspect-video w-full" />
        <Skeleton className="h-48 w-full" />
    </div>
);
