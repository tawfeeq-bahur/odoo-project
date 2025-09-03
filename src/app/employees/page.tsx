
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Truck, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';


export default function EmployeeManagementPage() {
  const { vehicles, user } = useSharedState();
  
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

  const employees = vehicles
    .filter(v => v.assignedTo)
    .map(v => ({
      name: v.assignedTo!,
      vehicleName: v.name,
      vehiclePlate: v.plateNumber,
    }))
    // Deduplicate employees who might be assigned multiple vehicles (though current logic assigns 1)
    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Employee Management</h1>
            <p className="text-muted-foreground">View and manage your drivers.</p>
        </div>
        <Button>
            <PlusCircle className="mr-2" />
            Add Employee
        </Button>
      </div>

       <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Assigned Vehicle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={`https://placehold.co/40x40.png?text=${employee.name.substring(0,2)}`} data-ai-hint="person portrait" />
                            <AvatarFallback>{employee.name.substring(0,2)}</AvatarFallback>
                        </Avatar>
                        <div>
                             <Link href={`/employees/${employee.name}`} className="hover:underline">
                                {employee.name}
                            </Link>
                            <p className="text-sm text-muted-foreground">{employee.name.toLowerCase().replace(' ', '.')}@fleetflow.com</p>
                        </div>
                    </div>
                  </TableCell>
                  <TableCell>
                      <Badge variant="secondary" className="flex w-fit items-center gap-1.5"><Truck className="h-3 w-3" />{employee.vehicleName} ({employee.vehiclePlate})</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <Button asChild variant="outline" size="sm">
                        <Link href={`/employees/${employee.name}`}>
                            View Profile
                        </Link>
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       {employees.length === 0 && (
         <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full min-h-60">
                <div className="p-4 bg-primary/10 rounded-full">
                    <Users className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">No Employees Found</h3>
                <p className="text-muted-foreground max-w-sm">
                   Assign a vehicle to an employee to see them here.
                </p>
            </CardContent>
        </Card>
      )}

    </div>
  );
}

