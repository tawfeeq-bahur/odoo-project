
'use client';

import { useState, useEffect } from 'react';
import { useSharedState } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, MoreHorizontal, Trash2, Edit, Truck, Fuel, Wrench, User, UserMinus } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Link from 'next/link';


export default function VehicleManagementPage() {
  const { vehicles, addVehicle, deleteVehicle, updateVehicleStatus, user, assignVehicle } = useSharedState();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [assignToName, setAssignToName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles from database on component mount
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        const response = await fetch('/api/admin/vehicles');
        if (response.ok) {
          const dbVehicles = await response.json();
          console.log('Loaded vehicles from database:', dbVehicles);
          // Note: The vehicles are already loaded in the shared state
          // This is just for verification and future use
        }
      } catch (error) {
        console.error('Error loading vehicles from database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, []);


  if (user?.role !== 'admin') {
    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You do not have permission to view this page.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  const handleAddVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      // Generate a unique ID
      const vehicleWithId = {
        ...vehicle,
        id: `vehicle_${Date.now()}`
      };

      // Save to database
      const response = await fetch('/api/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vehicleWithId),
      });

      if (response.ok) {
        // Update local state only after successful database save
        addVehicle(vehicle);
        setIsAddDialogOpen(false);
        console.log('Vehicle added successfully to database');
      } else {
        console.error('Failed to save vehicle to database');
        // Still update local state for immediate UI feedback
        addVehicle(vehicle);
        setIsAddDialogOpen(false);
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      // Still update local state for immediate UI feedback
      addVehicle(vehicle);
      setIsAddDialogOpen(false);
    }
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

  const handleAssign = async (vehicleId: string) => {
    try {
      // Update in database
      const response = await fetch('/api/admin/vehicles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: vehicleId,
          assignedTo: assignToName
        }),
      });

      if (response.ok) {
        // Update local state only after successful database save
        assignVehicle(vehicleId, assignToName);
        setAssignToName('');
        console.log('Vehicle assignment updated in database');
      } else {
        console.error('Failed to update vehicle assignment in database');
        // Still update local state for immediate UI feedback
        assignVehicle(vehicleId, assignToName);
        setAssignToName('');
      }
    } catch (error) {
      console.error('Error updating vehicle assignment:', error);
      // Still update local state for immediate UI feedback
      assignVehicle(vehicleId, assignToName);
      setAssignToName('');
    }
  }

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
                <TableHead>Assigned To</TableHead>
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
                    <Link href={`/vehicles/${vehicle.id}`} className="hover:underline">
                      <div className="font-medium">{vehicle.name}</div>
                      <div className="text-sm text-muted-foreground">{vehicle.plateNumber}</div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    {vehicle.assignedTo ? (
                      <Badge variant="secondary" className="capitalize flex w-fit items-center gap-1.5"><User className="h-3 w-3" />{vehicle.assignedTo}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
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
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" className="w-full justify-start text-sm font-normal h-8 px-2">
                                  <User className="mr-2 h-4 w-4" />
                                  {vehicle.assignedTo ? 'Re-assign' : 'Assign'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Assign Vehicle to Employee</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Enter the name of the employee you want to assign this vehicle to.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <Input 
                                    placeholder="Employee Name"
                                    value={assignToName}
                                    onChange={(e) => setAssignToName(e.target.value)}
                                />
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleAssign(vehicle.id)}>Assign</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                           </AlertDialog>
                          
                           {vehicle.assignedTo && (
                             <DropdownMenuItem onClick={async () => {
                               try {
                                 const response = await fetch('/api/admin/vehicles', {
                                   method: 'PUT',
                                   headers: { 'Content-Type': 'application/json' },
                                   body: JSON.stringify({ id: vehicle.id, assignedTo: null })
                                 });
                                 if (response.ok) {
                                   assignVehicle(vehicle.id, null);
                                   console.log('Vehicle unassigned in database');
                                 }
                               } catch (error) {
                                 console.error('Error unassigning vehicle:', error);
                                 assignVehicle(vehicle.id, null);
                               }
                             }}>
                                <UserMinus className="mr-2 h-4 w-4" />
                                Unassign
                            </DropdownMenuItem>
                           )}

                         <DropdownMenuItem onClick={async () => {
                           try {
                             const response = await fetch('/api/admin/vehicles', {
                               method: 'PUT',
                               headers: { 'Content-Type': 'application/json' },
                               body: JSON.stringify({ id: vehicle.id, status: 'Maintenance' })
                             });
                             if (response.ok) {
                               updateVehicleStatus(vehicle.id, 'Maintenance');
                               console.log('Vehicle status updated in database');
                             }
                           } catch (error) {
                             console.error('Error updating vehicle status:', error);
                             updateVehicleStatus(vehicle.id, 'Maintenance');
                           }
                         }}>
                            <Wrench className="mr-2 h-4 w-4" />
                            Send to Maintenance
                         </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={async () => {
                          try {
                            const response = await fetch(`/api/admin/vehicles?id=${vehicle.id}`, {
                              method: 'DELETE'
                            });
                            if (response.ok) {
                              deleteVehicle(vehicle.id);
                              console.log('Vehicle deleted from database');
                            }
                          } catch (error) {
                            console.error('Error deleting vehicle:', error);
                            deleteVehicle(vehicle.id);
                          }
                        }}>
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
