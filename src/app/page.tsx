
"use client";

import { useSharedState } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Eye, Users, BarChart, PieChart, DollarSign, Calendar, Plane } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
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
import { AddPackageDialog } from "@/components/fleet/AddVehicleDialog";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const { user, packages, trips, expenses, addPackage } = useSharedState();
  const [isAddPackageDialogOpen, setIsAddPackageDialogOpen] = useState(false);

  if (!user) return null;

  const userTrips = useMemo(() => trips.filter(trip => trip.organizerName === user.username || trip.members.includes(user.username)), [trips, user.username]);
  const userExpenses = useMemo(() => expenses.filter(exp => exp.submittedBy === user.username && exp.status === 'approved'), [expenses, user.username]);

  const totalSpend = useMemo(() => userExpenses.reduce((sum, exp) => sum + exp.amount, 0), [userExpenses]);
  const totalTrips = userTrips.length;
  const totalDays = useMemo(() => userTrips.filter(t => t.status === 'Completed').reduce((sum, trip) => sum + (packages.find(p => p.id === trip.packageId)?.durationDays || 0), 0), [userTrips, packages]);

  const monthlySpending = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    const data = months.map(month => ({
      name: format(month, 'MMM'),
      total: 0,
    }));

    userExpenses.forEach(exp => {
      const monthStr = format(parseISO(exp.date), 'MMM');
      const monthData = data.find(d => d.name === monthStr);
      if (monthData) {
        monthData.total += exp.amount;
      }
    });

    return data;
  }, [userExpenses]);
  
  const expenseByCategory = useMemo(() => {
    const categoryMap: { [key: string]: number } = {};
    userExpenses.forEach(exp => {
      categoryMap[exp.type] = (categoryMap[exp.type] || 0) + exp.amount;
    });
    return Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  }, [userExpenses]);
  
  const recentTrips = useMemo(() => {
      return userTrips
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
          .slice(0, 5);
  }, [userTrips]);


  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}! Here's your travel analysis.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button asChild variant="outline">
                <Link href="/join"><Users className="mr-2"/> Join a Tour</Link>
            </Button>
            <AddPackageDialog onAddPackage={addPackage}>
                <Button><PlusCircle className="mr-2"/> Organize Tour</Button>
            </AddPackageDialog>
        </div>
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={DollarSign} title="Total Spend" value={`₹${totalSpend.toLocaleString()}`} description="Approved expenses" />
          <StatCard icon={Plane} title="Total Trips" value={totalTrips.toString()} description="Organized or joined" />
          <StatCard icon={Calendar} title="Total Days Traveled" value={totalDays.toString()} description="From completed trips" />
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2">
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
                            <RechartsBar dataKey="total" fill="hsl(var(--primary))" name="Total Spend (₹)" />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

             <Card>
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
      
       <Card>
          <CardHeader>
            <CardTitle>Recent Trips</CardTitle>
            <CardDescription>Your most recent travel activity.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Tour Name</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>My Role</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {recentTrips.map(trip => (
                          <TableRow key={trip.id}>
                              <TableCell className="font-medium">{trip.packageName}</TableCell>
                              <TableCell>{trip.destination}</TableCell>
                              <TableCell>{format(parseISO(trip.startDate), 'PPP')}</TableCell>
                              <TableCell>
                                  <Badge variant={trip.organizerName === user.username ? 'default' : 'secondary'}>
                                      {trip.organizerName === user.username ? 'Organizer' : 'Member'}
                                  </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                  <Button asChild variant="ghost" size="sm">
                                      <Link href={`/tours/${trip.packageId}`}><Eye className="mr-2" /> View Details</Link>
                                  </Button>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
               {recentTrips.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                      No trips found. Create or join a tour to get started!
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}


const StatCard = ({ icon: Icon, title, value, description }: { icon: React.ElementType, title: string, value: string, description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

    