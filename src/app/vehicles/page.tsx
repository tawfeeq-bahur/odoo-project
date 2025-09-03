
'use client';

import { useState } from 'react';
import { useSharedState } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Truck, Fuel, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddVehicleDialog } from '@/components/fleet/AddVehicleDialog';
import type { Vehicle } from '@/lib/types';
import { format } from 'date-fns';

export default function VehicleManagementPage() {
  const { vehicles, addVehicle, deleteVehicle, updateVehicleStatus } = useSharedState();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    addVehicle(vehicle);
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'On Trip':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700">On Trip</Badge>;
      case 'Idle':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">Idle</Badge>;
      case 'Maintenance':
        return <Badge variant="destructive">Maintenance</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Vehicle Management</h1>
            <p className="text-muted-foreground">Add, edit, and manage your fleet of vehicles.</p>
        </div>
        <AddVehicleDialog onAddVehicle={handleAddVehicle}>
            <Button>
                <PlusCircle className="mr-2" />
                Add Vehicle
            </Button>
        </AddVehicleDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fuel Level</TableHead>
                <TableHead>Last Maintenance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium">
                    <div className="font-medium">{vehicle.name}</div>
                    <div className="text-sm text-muted-foreground">{vehicle.model}</div>
                  </TableCell>
                  <TableCell>{vehicle.plateNumber}</TableCell>
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-2">
                        <Progress value={vehicle.fuelLevel} className="h-2 w-24" />
                        <span className="text-sm text-muted-foreground">{vehicle.fuelLevel}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(vehicle.lastMaintenance), 'PPP')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                         </DropdownMenuItem>
                         <DropdownMenuItem onClick={() => onUpdateStatus(vehicle.id, 'Maintenance')}>
                            <Wrench className="mr-2 h-4 w-4" />
                            Send to Maintenance
                         </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => deleteVehicle(vehicle.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {vehicles.length === 0 && (
         <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full min-h-60">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Truck className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Vehicles Added</h3>
                <p className="text-muted-foreground max-w-sm">
                    Your fleet is empty. Get started by adding your first vehicle.
                </p>
                <AddVehicleDialog onAddVehicle={handleAddVehicle}>
                    <Button className="mt-2">
                        <PlusCircle className="mr-2" />
                        Add First Vehicle
                    </Button>
                </AddVehicleDialog>
            </CardContent>
        </Card>
      )}
    </div>
  );
}

