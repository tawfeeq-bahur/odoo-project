
'use client';

import type { Vehicle } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MoreHorizontal, Trash2, Wrench } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '../ui/card';
import { format } from 'date-fns';

type VehicleListProps = {
  vehicles: Vehicle[];
  onUpdateStatus: (id: string, status: Vehicle['status']) => void;
  onDeleteVehicle: (id: string) => void;
};

export function VehicleList({ vehicles, onUpdateStatus, onDeleteVehicle }: VehicleListProps) {
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
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell>
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
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                       <DropdownMenuItem onClick={() => onUpdateStatus(vehicle.id, 'Maintenance')}>
                        <Wrench className="mr-2" />
                        Send for Maintenance
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => onDeleteVehicle(vehicle.id)}>
                        <Trash2 className="mr-2" />
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
  );
}
