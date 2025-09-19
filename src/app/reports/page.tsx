
'use client';

import { useSharedState } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, DollarSign, Activity, Calendar as CalendarIcon, Filter } from 'lucide-react';
import type { Expense } from '@/lib/types';
import { format, isWithinInterval } from 'date-fns';
import { useMemo, useState } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ReportsPage() {
    const { expenses, user, packages } = useSharedState();
    const [date, setDate] = useState<DateRange | undefined>();
    const [selectedTourId, setSelectedTourId] = useState<string>('all');

    if (!user) return null;

    const userTours = useMemo(() => {
        return packages.filter(p => p.organizerName === user.username || p.members.includes(user.username));
    }, [packages, user.username]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(exp => {
            const isUserExpense = exp.submittedBy === user.username;
            if (!isUserExpense) return false;

            const isTourMatch = selectedTourId === 'all' || exp.tourId === selectedTourId;
            
            const isDateMatch = !date || (!date.from && !date.to) ||
                (date.from && !date.to && new Date(exp.date) >= date.from) ||
                (!date.from && date.to && new Date(exp.date) <= date.to) ||
                (date.from && date.to && isWithinInterval(new Date(exp.date), { start: date.from, end: date.to }));

            return isTourMatch && isDateMatch;
        });
    }, [expenses, user.username, selectedTourId, date]);


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
    
    const totalSpent = filteredExpenses.filter(e => e.status === 'approved').reduce((sum, exp) => sum + exp.amount, 0);

    const expenseByCategory = useMemo(() => {
        const categories: { [key: string]: number } = {
            Travel: 0, Food: 0, Hotel: 0, Tickets: 0, Misc: 0,
        };
        filteredExpenses.forEach(exp => {
            if (exp.status === 'approved') {
                categories[exp.type] = (categories[exp.type] || 0) + exp.amount;
            }
        });
        return Object.entries(categories).map(([name, amount]) => ({ name, amount }));
    }, [filteredExpenses]);

    const downloadCSV = () => {
        const headers = ["Submitted By", "Date", "Type", "Amount", "Status", "Description", "Tour ID"];
        const csvRows = [
            headers.join(','),
            ...filteredExpenses.map(exp => [
                `"${exp.submittedBy}"`,
                format(new Date(exp.date), 'yyyy-MM-dd'),
                exp.type,
                exp.amount.toFixed(2),
                exp.status,
                `"${exp.description || ''}"`,
                exp.tourId || 'N/A'
            ].join(','))
        ];

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const tourName = selectedTourId === 'all' ? 'all-tours' : packages.find(p => p.id === selectedTourId)?.name.replace(/\s+/g, '-').toLowerCase() || 'tour';
            const fileName = `expenses-${user.username}-${tourName}.csv`;
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };


    return (
        <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
             <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-headline">My Expense Analytics</h1>
                    <p className="text-muted-foreground">Review your spending and generate reports.</p>
                </div>
                 <Button variant="outline" onClick={downloadCSV}>
                    <FileDown className="mr-2" />
                    Export Filtered Expenses
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Filter /> Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                        <SelectTrigger className="w-full md:w-[280px]">
                            <SelectValue placeholder="Filter by tour..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All My Trips</SelectItem>
                            {userTours.map(tour => (
                                <SelectItem key={tour.id} value={tour.id}>{tour.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    
                    <Popover>
                        <PopoverTrigger asChild>
                        <Button
                            id="date"
                            variant={"outline"}
                            className="w-full md:w-[300px] justify-start text-left font-normal"
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date?.from ? (
                            date.to ? (
                                <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                            ) : (
                            <span>Pick a date range</span>
                            )}
                        </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={date?.from}
                            selected={date}
                            onSelect={setDate}
                            numberOfMonths={2}
                        />
                        </PopoverContent>
                    </Popover>
                    <Button variant="ghost" onClick={() => { setDate(undefined); setSelectedTourId('all'); }}>
                        Clear Filters
                    </Button>
                </CardContent>
            </Card>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Approved Spend</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalSpent.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Based on current filters</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Expenses</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredExpenses.filter(e=>e.status==='pending').length}</div>
                         <p className="text-xs text-muted-foreground">Based on current filters</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle>My Submitted Expenses</CardTitle>
                        <CardDescription>A log of all your submitted expenses matching the current filters.</CardDescription>
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
                                {filteredExpenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{format(new Date(expense.date), 'PPP')}</TableCell>
                                        <TableCell><Badge variant="secondary">{expense.type}</Badge></TableCell>
                                        <TableCell className="font-medium">₹{expense.amount.toFixed(2)}</TableCell>
                                        <TableCell>{getStatusBadge(expense.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filteredExpenses.length === 0 && (
                            <div className="text-center p-10 text-muted-foreground">
                                No expenses match the current filters.
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
