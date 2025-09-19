

'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, CheckCircle, XCircle, DollarSign, Activity } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { format } from 'date-fns';
import { useMemo } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
    const { expenses, user } = useSharedState();

    if (!user) return null;

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
    
    const userExpenses = expenses.filter(exp => exp.submittedBy === user.username);
    const totalSpent = userExpenses.filter(e => e.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);

    const expenseByCategory = useMemo(() => {
        const categories: { [key: string]: number } = {
            Travel: 0, Food: 0, Hotel: 0, Tickets: 0, Misc: 0,
        };
        userExpenses.forEach(exp => {
            if (exp.status === 'approved') {
                categories[exp.type] = (categories[exp.type] || 0) + exp.amount;
            }
        });
        return Object.entries(categories).map(([name, amount]) => ({ name, amount }));
    }, [userExpenses]);

    const downloadCSV = () => {
        const headers = ["Submitted By", "Date", "Type", "Amount", "Status"];
        const csvRows = [
            headers.join(','),
            ...userExpenses.map(exp => [
                `"${exp.submittedBy}"`,
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
            const fileName = `expenses-${user.username}.csv`;
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
                    <h1 className="text-3xl font-bold tracking-tight font-headline">My Expense Analytics</h1>
                    <p className="text-muted-foreground">Review your spending and generate reports.</p>
                </div>
                 <Button variant="outline" onClick={downloadCSV}>
                    <FileDown className="mr-2" />
                    Export My Expenses
                </Button>
            </div>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Approved Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{userExpenses.filter(e=>e.status==='pending').length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>My Submitted Expenses</CardTitle>
                        <CardDescription>A log of all expenses you have submitted.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                                        <TableCell><Badge variant="secondary">{expense.type}</Badge></TableCell>
                                        <TableCell className="font-medium">₹{expense.amount.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {userExpenses.length === 0 && (
                            <div className="text-center p-10 text-muted-foreground">
                                No expenses have been submitted by you yet.
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Spending by Category</CardTitle>
                        <CardDescription>Visual breakdown of your approved spending.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsBarChart data={expenseByCategory}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="amount" fill="hsl(var(--primary))" name="Amount (₹)"/>
                            </RechartsBarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
