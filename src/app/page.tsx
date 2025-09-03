
"use client";

import { useSharedState } from "@/components/AppLayout";
import { VehicleList } from "@/components/fleet/VehicleList";
import { FleetSummary } from "@/components/fleet/FleetSummary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, PlusCircle } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { vehicles, updateVehicleStatus, deleteVehicle } = useSharedState();

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline bg-gradient-to-r from-primary via-blue-500 to-green-500 text-transparent bg-clip-text">
          Fleet Dashboard
        </h1>
      </div>
      
      <FleetSummary vehicles={vehicles} />

      <div className="mt-8">
         <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
              Vehicle Status
            </h2>
             <Button asChild>
                <Link href="/vehicles">
                  <PlusCircle className="mr-2" />
                  Manage Vehicles
                </Link>
            </Button>
          </div>
          {vehicles.length > 0 ? (
            <div className="mt-4">
              <VehicleList 
                vehicles={vehicles} 
                onUpdateStatus={updateVehicleStatus} 
                onDeleteVehicle={deleteVehicle} 
              />
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full min-h-60">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <Truck className="w-12 h-12 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">No Vehicles Added</h3>
                  <p className="text-muted-foreground max-w-sm">
                    Your fleet is empty. Get started by adding your first vehicle.
                  </p>
                  <Button asChild className="mt-2">
                    <Link href="/vehicles">
                      <PlusCircle className="mr-2" />
                      Add First Vehicle
                    </Link>
                  </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
