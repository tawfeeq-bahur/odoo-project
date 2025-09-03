'use client';

import { useState, useEffect } from 'react';
import type { Vehicle } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, CircleDollarSign, Fuel, Wrench, Lightbulb, AlertTriangle } from 'lucide-react';
import { getVehicleInsights, VehicleInsightsOutput } from '@/ai/flows/vehicle-insights';
import { Skeleton } from '../ui/skeleton';

type FleetSummaryProps = {
  vehicles: Vehicle[];
};

export function FleetSummary({ vehicles }: FleetSummaryProps) {
  const [insights, setInsights] = useState<VehicleInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const summary = {
    totalVehicles: vehicles.length,
    onTrip: vehicles.filter(v => v.status === 'On Trip').length,
    idle: vehicles.filter(v => v.status === 'Idle').length,
    maintenance: vehicles.filter(v => v.status === 'Maintenance').length,
  };

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      try {
        const result = await getVehicleInsights({
          totalVehicles: summary.totalVehicles,
          ongoingTrips: summary.onTrip,
          // These are placeholder values for demonstration
          totalExpenses: 12500, 
          fuelConsumption: 8500,
        });
        setInsights(result);
      } catch (error) {
        console.error("Failed to get vehicle insights:", error);
        setInsights(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, [vehicles]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <SummaryCard icon={Truck} title="Total Vehicles" value={summary.totalVehicles} />
      <SummaryCard icon={CircleDollarSign} title="Ongoing Trips" value={summary.onTrip} />
      <SummaryCard icon={Fuel} title="Idle Vehicles" value={summary.idle} />
      <SummaryCard icon={Wrench} title="In Maintenance" value={summary.maintenance} />

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Actionable insights based on your fleet's current activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <InsightsSkeleton />}
          {insights && (
            <>
              <InsightItem title="Efficiency Insight" text={insights.efficiencyInsight} />
              <InsightItem title="Cost Saving Suggestion" text={insights.costSavingSuggestion} />
              <InsightItem 
                title="Anomaly Detection" 
                text={insights.anomalyDetection} 
                icon={insights.anomalyDetection.toLowerCase().includes("normal") ? undefined : AlertTriangle}
                iconColor="text-orange-500"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const SummaryCard = ({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: number | string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const InsightItem = ({ title, text, icon: Icon, iconColor }: { title: string, text: string, icon?: React.ElementType, iconColor?: string }) => (
  <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
    {Icon && <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconColor || ''}`} />}
    <div>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  </div>
);

const InsightsSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
       <Skeleton className="h-5 w-1/4" />
       <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="space-y-2">
       <Skeleton className="h-5 w-1/4" />
       <Skeleton className="h-4 w-full" />
    </div>
     <div className="space-y-2">
       <Skeleton className="h-5 w-1/4" />
       <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);
