
'use client';

import { useState } from 'react';
import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, CheckCircle, XCircle, User, Activity } from 'lucide-react';
import type { Expense, Vehicle } from '@/lib/types';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function ReportsPage() {
    const { expenses, vehicles, updateExpenseStatus, user } = useSharedState();
    const [selectedEmployee, setSelectedEmployee] = useState<string>('all');

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

    const getEmployeeName = (tripId: string | undefined) => {
        if (!tripId) return 'N/A';
        const vehicle = vehicles.find(v => v.id === tripId);
        return vehicle?.assignedTo || 'Unassigned';
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
    
    const employees = [...new Set(vehicles.map(v => v.assignedTo).filter(Boolean) as string[])];

    const filteredExpenses = expenses.filter(expense => {
        if (selectedEmployee === 'all') return true;
        const employeeName = getEmployeeName(expense.tripId);
        return employeeName === selectedEmployee;
    });

    const performanceData = employees.map(name => {
        const employeeVehicles = vehicles.filter(v => v.assignedTo === name);
        const employeeExpenses = expenses.filter(exp => employeeVehicles.some(v => v.id === exp.tripId));
        return {
            name,
            trips: Math.floor(Math.random() * 20),
            onTime: Math.floor(Math.random() * 19) + 1,
            totalExpenses: employeeExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        }
    })

    const downloadCSV = () => {
        const headers = ["Employee", "Date", "Type", "Amount", "Status"];
        const csvRows = [
            headers.join(','),
            ...filteredExpenses.map(exp => [
                `"${getEmployeeName(exp.tripId)}"`,
                format(new Date(exp.date), 'yyyy-MM-dd'),
                exp.type,
                exp.amount.toFixed(2),
                exp.status
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            const fileName = selectedEmployee === 'all' ? 'all-expenses.csv' : `expenses-${selectedEmployee.replace(' ', '_')}.csv`;
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">Reports & Analytics</h1>
                    <p className="text-muted-foreground">Review expenses, track performance, and generate reports.</p>
                </div>
                 <Button variant="outline" onClick={downloadCSV}>
                    <FileDown className="mr-2" />
                    Export to CSV
                </Button>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Driver Performance
                    </CardTitle>
                    <CardDescription>
                       An overview of driver performance metrics. Click a name to see details.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Trips this Month</TableHead>
                                <TableHead>On-Time Rate</TableHead>
                                <TableHead className="text-right">Total Expenses Submitted</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {performanceData.map((driver) => (
                                <TableRow key={driver.name}>
                                    <TableCell className="font-medium">
                                        <Link href={`/employees/${driver.name}`} className="hover:underline">
                                           {driver.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{driver.trips}</TableCell>
                                    <TableCell>{((driver.onTime / driver.trips) * 100).toFixed(0)}%</TableCell>
                                    <TableCell className="text-right font-medium">₹{driver.totalExpenses.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>
                                {selectedEmployee === 'all' ? 'All Submitted Expenses' : `Expenses for ${selectedEmployee}`}
                            </CardTitle>
                            <CardDescription>
                                {selectedEmployee === 'all' 
                                    ? 'A complete log of all expenses submitted by your drivers.'
                                    : `A complete log of all expenses submitted by ${selectedEmployee}.`
                                }
                            </CardDescription>
                        </div>
                        <div className="w-48">
                            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by employee" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Employees</SelectItem>
                                    {employees.map(emp => (
                                        <SelectItem key={emp} value={emp}>{emp}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredExpenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell>{getEmployeeName(expense.tripId)}</TableCell>
                                    <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                                    <TableCell><Badge variant="secondary">{expense.type}</Badge></TableCell>
                                    <TableCell className="font-medium">₹{expense.amount.toFixed(2)}</TableCell>
                                    <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                    <TableCell className="text-right">
                                       {expense.status === 'pending' && (
                                            <div className="flex gap-2 justify-end">
                                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-900/40" onClick={() => updateExpenseStatus(expense.id, 'approved')}>
                                                    <CheckCircle className="mr-2 h-4 w-4"/> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/40" onClick={() => updateExpenseStatus(expense.id, 'rejected')}>
                                                    <XCircle className="mr-2 h-4 w-4"/> Reject
                                                </Button>
                                            </div>
                                       )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {filteredExpenses.length === 0 && (
                        <div className="text-center p-10 text-muted-foreground">
                            {selectedEmployee === 'all' 
                                ? 'No expenses have been submitted yet.'
                                : `No expenses have been submitted for ${selectedEmployee}.`
                            }
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
