
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Truck, Fuel, Wrench, User, Calendar, Upload, FileText, Share2, Printer } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';

export default function VehicleDetailsPage({ params }: { params: { id: string } }) {
  const { vehicles } = useSharedState();
  const vehicle = vehicles.find(v => v.id === params.id);

  if (!vehicle) {
    notFound();
  }
  
  const getStatusBadge = (status: 'On Trip' | 'Idle' | 'Maintenance') => {
    switch (status) {
      case 'On Trip':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700">{status}</Badge>;
      case 'Idle':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">{status}</Badge>;
      case 'Maintenance':
        return <Badge variant="destructive">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{vehicle.name}</h1>
            <p className="text-muted-foreground">{vehicle.plateNumber}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Printer className="mr-2"/> Generate Report</Button>
            <Button><Share2 className="mr-2"/> Share Details</Button>
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="aspect-video rounded-lg overflow-hidden border">
                         <Image src="https://placehold.co/600x400.png?text=Vehicle" alt={vehicle.name} width={600} height={400} data-ai-hint="truck vehicle" />
                    </div>
                    <Button variant="outline" className="w-full mt-4"><Upload className="mr-2"/> Upload Image</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>Registration, insurance, etc.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary"/>
                            <span className="text-sm font-medium">Registration.pdf</span>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                    </div>
                     <div className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary"/>
                            <span className="text-sm font-medium">Insurance.pdf</span>
                        </div>
                        <Button variant="ghost" size="sm">View</Button>
                    </div>
                    <Button variant="secondary" className="w-full mt-2"><Upload className="mr-2"/> Upload Document</Button>
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Vehicle Details</CardTitle>
                    <CardDescription>A complete overview of the vehicle's status and details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <InfoItem icon={Truck} label="Model" value={vehicle.model} />
                        <InfoItem icon={Wrench} label="Status" value={getStatusBadge(vehicle.status)} />
                        <InfoItem icon={User} label="Assigned To" value={vehicle.assignedTo || 'Unassigned'} />
                        <InfoItem icon={Calendar} label="Last Maintenance" value={format(new Date(vehicle.lastMaintenance), 'PPP')} />
                    </div>

                    <Separator />

                    <div>
                        <h4 className="text-sm font-medium mb-2">Fuel Level</h4>
                        <div className="flex items-center gap-4">
                           <Progress value={vehicle.fuelLevel} className="h-3" />
                           <span className="font-bold text-lg">{vehicle.fuelLevel}%</span>
                        </div>
                    </div>

                     <Separator />

                     <div>
                        <h4 className="text-sm font-medium mb-4">Recent Activity</h4>
                        <p className="text-muted-foreground">Trip and maintenance history will be shown here.</p>
                        {/* Placeholder for trip history table */}
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

const InfoItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | React.ReactNode }) => (
    <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 text-muted-foreground mt-1" />
        <div>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-semibold">{value}</p>
        </div>
    </div>
)
