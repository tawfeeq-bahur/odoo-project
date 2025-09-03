
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Truck, Phone, Mail, FileText, Banknote, CheckCircle, XCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { format } from 'date-fns';
import type { Expense } from '@/lib/types';
import Link from 'next/link';

export default function EmployeeDetailsPage() {
  const params = useParams();
  const employeeName = decodeURIComponent(params.name as string);

  const { vehicles, expenses } = useSharedState();
  const assignedVehicle = vehicles.find(v => v.assignedTo === employeeName);
  
  const employeeExpenses = expenses.filter(exp => exp.tripId === assignedVehicle?.id);

  if (!assignedVehicle) {
    // This is a simplified check. A real app would have a dedicated list of employees.
    notFound();
  }

  const getStatusBadge = (status: Expense['status']) => {
    switch (status) {
        case 'approved':
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">Approved</Badge>;
        case 'pending':
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">Pending</Badge>;
        case 'rejected':
            return <Badge variant="destructive">Rejected</Badge>;
    }
  };


  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <div className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">{employeeName}</h1>
            <p className="text-muted-foreground">Driver Profile & Activity</p>
         </div>
       </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
            <Card>
                <CardHeader className="items-center text-center">
                    <Image src={`https://placehold.co/100x100.png?text=${employeeName.substring(0,2)}`} alt={employeeName} width={100} height={100} className="rounded-full mb-4" data-ai-hint="person portrait" />
                    <CardTitle>{employeeName}</CardTitle>
                    <CardDescription>Driver</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-3">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4"/>
                        <span>{employeeName.toLowerCase().replace(' ', '.')}@fleetflow.com</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4"/>
                        <span>+91 98765 43210</span>
                    </div>
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Assigned Vehicle</CardTitle>
                </CardHeader>
                <CardContent>
                    {assignedVehicle ? (
                        <Link href={`/vehicles/${assignedVehicle.id}`} className="space-y-2 group">
                            <p className="font-semibold group-hover:underline">{assignedVehicle.name}</p>
                            <p className="text-sm text-muted-foreground">{assignedVehicle.plateNumber}</p>
                        </Link>
                    ) : (
                        <p className="text-muted-foreground">No vehicle assigned.</p>
                    )}
                </CardContent>
            </Card>
        </div>

        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Expenses</CardTitle>
                    <CardDescription>A list of expenses submitted by {employeeName}.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employeeExpenses.map(exp => (
                                <TableRow key={exp.id}>
                                    <TableCell><Badge variant="outline">{exp.type}</Badge></TableCell>
                                    <TableCell>{format(new Date(exp.date), "PPP")}</TableCell>
                                    <TableCell>{getStatusBadge(exp.status)}</TableCell>
                                    <TableCell className="text-right font-medium">₹{exp.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {employeeExpenses.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <Banknote className="mx-auto h-8 w-8 mb-2" />
                            <p>No expenses submitted by this employee yet.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
