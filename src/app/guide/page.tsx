

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
import { Map as MapIcon, Milestone, Fuel, Clock, AlertTriangle, Route, Truck, Settings, Send, User as UserIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import dynamic from 'next/dynamic';
import { useSharedState } from '@/components/AppLayout';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

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
  employeeId: z.string().min(1, "Please select an employee."),
  vehicleId: z.string().min(1, "Please select a vehicle."),
  routeType: z.string({required_error: "Route type is required."}).min(1, "Route type is required."),
  traffic: z.string({required_error: "Traffic condition is required."}).min(1, "Traffic condition is required."),
  loadKg: z.coerce.number().optional(),
});


export default function TripPlannerPage() {
  const [plan, setPlan] = useState<TripPlannerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, vehicles, addTrip } = useSharedState();
  const { toast } = useToast();

  const plannerForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      source: '',
      destination: '',
      routeType: 'Highway',
      traffic: 'Normal',
      employeeId: undefined,
      vehicleId: undefined,
      loadKg: undefined,
    },
  });
  
  const isFormValid = plannerForm.formState.isValid;
  const currentTraffic = plannerForm.watch('traffic');
  
  const availableVehicles = vehicles.filter(v => v.status === 'Idle');
  
  const uniqueEmployees = [...new Map(vehicles.filter(v => v.assignedTo).map(item => [item.assignedTo, item.assignedTo])).values()];


  const pageTitle = user?.role === 'admin' ? "Assign a Trip" : "Trip Planner";
  const pageDescription = user?.role === 'admin' 
    ? "Generate a detailed trip plan and assign it to an available employee and vehicle."
    : "View your assigned trip details on the 'My Trips' page.";


  async function onPlannerSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setPlan(null);

    const selectedVehicle = vehicles.find(v => v.id === values.vehicleId);
    if (!selectedVehicle) {
        setError('Selected vehicle not found.');
        setIsLoading(false);
        return;
    }
    
    const employeeName = values.employeeId;
    if (!employeeName) {
        setError('Selected employee not found or is not properly assigned.');
        setIsLoading(false);
        return;
    }

    try {
      const result = await getTripPlan({
        source: values.source,
        destination: values.destination,
        vehicleModel: selectedVehicle.model,
        routeType: values.routeType,
        traffic: values.traffic,
        loadKg: values.loadKg
      });
      
      addTrip({
          source: result.source,
          destination: result.destination,
          startDate: new Date().toISOString(),
          vehicleId: selectedVehicle.id,
          employeeName: employeeName,
          plan: result,
      });

      toast({
          title: "Trip Assigned!",
          description: `${employeeName} has been assigned the trip from ${result.source} to ${result.destination}.`
      });

      setPlan(result);
      plannerForm.reset();

    } catch (err) {
      setError('Sorry, I could not generate a trip plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }
  
  // This is the view for non-admin users
  if (user?.role !== 'admin') {
      return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
           <Card>
                <CardHeader>
                    <CardTitle>{pageTitle}</CardTitle>
                    <CardDescription>{pageDescription}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>To view your assigned trips, please go to the <Link href="/trips" className="text-primary hover:underline">My Trips</Link> page.</p>
                </CardContent>
           </Card>
        </div>
      )
  }

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">{pageTitle}</h1>
          <p className="text-muted-foreground">
            {pageDescription}
          </p>
        </div>
      <Form {...plannerForm}>
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 flex flex-col gap-8">
                    <form onSubmit={plannerForm.handleSubmit(onPlannerSubmit)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Trip Details</CardTitle>
                                <CardDescription>Start by entering the source and destination for the trip.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                <CardTitle>2. Assignment</CardTitle>
                                <CardDescription>Assign an available employee and vehicle to this trip.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <FormField
                                    control={plannerForm.control}
                                    name="employeeId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="flex items-center gap-2"><UserIcon className="h-4 w-4" /> Employee</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select an available employee" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {uniqueEmployees.length > 0 ? uniqueEmployees.map(emp => (
                                                        <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                                                    )) : <SelectItem value="none" disabled>No employees available</SelectItem>}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={plannerForm.control}
                                    name="vehicleId"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel className="flex items-center gap-2"><Truck className="h-4 w-4" /> Vehicle</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger><SelectValue placeholder="Select an available vehicle" /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                               {availableVehicles.length > 0 ? availableVehicles.map(v => (
                                                    <SelectItem key={v.id} value={v.id}>{v.name} ({v.plateNumber})</SelectItem>
                                                )) : <SelectItem value="none" disabled>No vehicles available</SelectItem>}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>3. Trip Conditions</CardTitle>
                                <CardDescription>Describe the conditions expected for this trip.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
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
                                                <SelectItem value="Stop & Go">Stop & Go</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                    />
                                <FormField
                                    control={plannerForm.control}
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
                            <Send className="mr-2"/>
                            {isLoading ? 'Generating & Assigning...' : 'Generate & Assign Trip'}
                        </Button>
                    </form>
            </div>
            <div className="lg:col-span-2">
                {isLoading && <PlanSkeleton />}
                {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                
                {!plan && !isLoading && (
                    <Card className="h-full">
                        <CardContent className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-8">
                            <MapIcon className="h-24 w-24 mb-4 text-primary/50" />
                            <h2 className="text-2xl font-semibold">Your Assigned Trip Plan Will Appear Here</h2>
                            <p className="max-w-md mt-2">Fill out all the trip and assignment fields, then click "Generate & Assign Trip" to see the generated plan and assign it to the employee.</p>
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
                            <InfoCard icon={MapIcon} title="Distance" content={plan.distance} />
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

    