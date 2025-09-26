
"use client";

import { useSharedState } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Users, BarChart, PieChart, DollarSign, Calendar, Plane, ShoppingBag, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo } from "react";
import { format, subMonths, parseISO } from "date-fns";
import { 
  BarChart as RechartsBarChart, 
  Bar as RechartsBar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const { user, packages, expenses } = useSharedState();

  if (!user) return null;

  const { organizedTours, joinedTours, monthlySpending, expenseByCategory } = useMemo(() => {
    const organized = packages.filter(p => p.organizerName === user.username);
    const joined = packages.filter(p => p.members.includes(user.username) && p.organizerName !== user.username);
    
    const userExpenses = expenses.filter(exp => exp.submittedBy === user.username && exp.status === 'approved');

    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    const spendingData = months.map(month => ({
      name: format(month, 'MMM'),
      "Total Spend (₹)": 0,
    }));

    userExpenses.forEach(exp => {
      const monthStr = format(parseISO(exp.date), 'MMM');
      const monthData = spendingData.find(d => d.name === monthStr);
      if (monthData) {
        monthData["Total Spend (₹)"] += exp.amount;
      }
    });

    const categoryMap: { [key: string]: number } = {};
    userExpenses.forEach(exp => {
      categoryMap[exp.type] = (categoryMap[exp.type] || 0) + exp.amount;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

    return { 
      organizedTours: organized,
      joinedTours: joined,
      monthlySpending: spendingData, 
      expenseByCategory: categoryData 
    };
  }, [packages, expenses, user.username]);
  
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}! Here's your travel analysis.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/join"><Users className="mr-2"/> Join a Tour</Link>
            </Button>
            <Button asChild>
                <Link href="/guide"><PlusCircle className="mr-2"/> Organize Tour</Link>
            </Button>
        </div>
      </div>
      
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart /> Monthly Spending Overview</CardTitle>
                    <CardDescription>Your approved spending over the last 6 months.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={monthlySpending}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <RechartsBar dataKey="Total Spend (₹)" fill="hsl(var(--primary))" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><PieChart /> Expense Breakdown</CardTitle>
                    <CardDescription>How your spending is distributed across categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                         <RechartsPieChart>
                            <Pie
                                data={expenseByCategory}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                nameKey="name"
                                label={(props) => `${props.name} (${(props.percent * 100).toFixed(0)}%)`}
                            >
                                {expenseByCategory.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
      </div>
      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingBag /> My Organized Tours</CardTitle>
                <CardDescription>Tours you are currently organizing.</CardDescription>
              </CardHeader>
              <CardContent>
                  <TourTable tours={organizedTours} />
              </CardContent>
          </Card>
           <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><UserCheck /> My Joined Tours</CardTitle>
                <CardDescription>Tours you are participating in as a member.</CardDescription>
              </CardHeader>
              <CardContent>
                  <TourTable tours={joinedTours} />
              </CardContent>
          </Card>
        </div>
    </div>
  );
}

const TourTable = ({ tours }: { tours: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tour Name</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tours.length > 0 ? tours.map(tour => (
          <TableRow key={tour.id}>
            <TableCell className="font-medium">{tour.name}</TableCell>
            <TableCell>{tour.destination}</TableCell>
            <TableCell>
              <Badge variant={tour.status === 'Active' ? 'default' : 'secondary'}>
                {tour.status}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button asChild variant="ghost" size="sm">
                <Link href={`/tours/${tour.id}`}><Eye className="mr-2" /> View</Link>
              </Button>
            </TableCell>
          </TableRow>
        )) : (
            <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                    No tours in this category yet.
                </TableCell>
            </TableRow>
        )}
      </TableBody>
    </Table>
);
    
