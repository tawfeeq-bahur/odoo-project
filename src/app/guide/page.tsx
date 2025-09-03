
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getTripPlan, TripPlannerOutput } from '@/ai/flows/trip-planner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Map, Milestone, Fuel, Clock, AlertTriangle, Route } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  source: z.string().min(2, { message: 'Source must be at least 2 characters.' }),
  destination: z.string().min(2, { message: 'Destination must be at least 2 characters.' }),
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

  return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Trip Planner</h1>
          <p className="text-muted-foreground">
            Enter a source and destination to get an AI-powered trip plan and cost estimation.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Plan a New Trip</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col md:flex-row items-end gap-4">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem className="flex-1 w-full">
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Los Angeles, CA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem className="flex-1 w-full">
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                  {isLoading ? 'Generating...' : 'Get Plan'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {isLoading && <PlanSkeleton />}
        {error && <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        
        {plan && (
          <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-2xl font-headline">Trip Plan: {plan.source} to {plan.destination}</CardTitle>
                <CardDescription>{plan.suggestedRoute}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-4 gap-6 text-center">
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
        )}
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
  <Card className="mt-6">
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
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-16 w-full" />
    </CardContent>
  </Card>
);
