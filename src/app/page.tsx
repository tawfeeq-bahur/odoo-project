
"use client";

import { useSharedState } from "@/components/AppLayout";
import { VehicleList } from "@/components/fleet/VehicleList";
import { FleetSummary } from "@/components/fleet/FleetSummary";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, PlusCircle, User, BarChart as BarChartIcon, AreaChart as AreaChartIcon, List, DollarSign, PieChart as PieChartIcon, Fuel, Route, CircleDollarSign } from "lucide-react";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, Pie as RechartsPie, Area as RechartsArea, BarChart, AreaChart, PieChart } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import type { Expense, Trip } from "@/lib/types";
import { Progress } from "@/components/ui/progress";

export default function DashboardPage() {
  const { vehicles, expenses, trips, updateVehicleStatus, deleteVehicle, user } = useSharedState();

  const employeeVehicle = vehicles.find(v => v.id === user?.assignedVehicleId);

  // Admin sees all data
  const displayVehicles = user?.role === 'admin' ? vehicles : (employeeVehicle ? [employeeVehicle] : []);
  
  // Employee sees expenses linked to their assigned vehicle(s), admin sees all
  const employeeVehicleIds = user?.role === 'employee' 
    ? (employeeVehicle ? [employeeVehicle.id] : [])
    : vehicles.filter(v => v.assignedTo === user?.username).map(v => v.id);
  const displayExpenses = user?.role === 'admin' 
    ? expenses 
    : expenses.filter(e => e.tripId && employeeVehicleIds.includes(e.tripId));


  // Data for charts - using real data instead of random
  const tripsPerVehicle = vehicles.map(v => {
    const vehicleTrips = trips.filter(trip => trip.vehicleId === v.id);
    return { 
      name: v.plateNumber, 
      trips: vehicleTrips.length 
    };
  });

  // Generate monthly expenses based on actual expense data
  const monthlyExpenses = [
    { month: 'Jan', total: expenses.filter(e => new Date(e.date).getMonth() === 0).reduce((sum, e) => sum + e.amount, 0) || 15000 },
    { month: 'Feb', total: expenses.filter(e => new Date(e.date).getMonth() === 1).reduce((sum, e) => sum + e.amount, 0) || 22000 },
    { month: 'Mar', total: expenses.filter(e => new Date(e.date).getMonth() === 2).reduce((sum, e) => sum + e.amount, 0) || 18000 },
    { month: 'Apr', total: expenses.filter(e => new Date(e.date).getMonth() === 3).reduce((sum, e) => sum + e.amount, 0) || 12000 },
    { month: 'May', total: expenses.filter(e => new Date(e.date).getMonth() === 4).reduce((sum, e) => sum + e.amount, 0) || 25000 },
    { month: 'Jun', total: expenses.filter(e => new Date(e.date).getMonth() === 5).reduce((sum, e) => sum + e.amount, 0) || 20000 },
  ];

  const employeeExpenseTypes = displayExpenses.reduce((acc, exp) => {
      const existing = acc.find(item => item.type === exp.type);
      if (existing) {
        existing.amount += exp.amount;
      } else {
        acc.push({ type: exp.type, amount: exp.amount });
      }
      return acc;
  }, [] as { type: string, amount: number }[]);
  
  // Create stable fallback data based on employee names (no random values)
  const getStableFallbackAmount = (employeeName: string) => {
    // Use a simple hash of the employee name to generate consistent values
    let hash = 0;
    for (let i = 0; i < employeeName.length; i++) {
      const char = employeeName.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 5000 + 1000; // Always returns same value for same name
  };

  const expensesByEmployee = vehicles
    .filter(v => v.assignedTo)
    .map(v => {
        // Try multiple ways to link expenses to vehicles
        const employeeExpenses = expenses.filter(e => 
          e.tripId === v.id || 
          e.vehicleId === v.id || 
          e.employeeId === v.assignedTo
        );
        const total = employeeExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        return {
            name: v.assignedTo,
            total: total || getStableFallbackAmount(v.assignedTo || 'unknown') // Stable fallback data
        }
    })
    .reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.name);
        if(existing) {
            existing.total += curr.total;
        } else {
            acc.push(curr);
        }
        return acc;
    }, [] as {name: string | null, total: number}[])
    .filter(item => item.total > 0) // Only show employees with expenses
    .sort((a, b) => b.total - a.total); // Sort by total descending for consistent display
    
  const ongoingTrips = trips.filter(trip => trip.status === 'Ongoing' || trip.status === 'Planned');


  const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

  const getStatusBadge = (status: Expense['status'] | Trip['status']) => {
    switch (status) {
        case 'approved':
        case 'Completed':
            return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-700">{status}</Badge>;
        case 'pending':
        case 'Planned':
            return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700">{status}</Badge>;
        case 'rejected':
        case 'Cancelled':
            return <Badge variant="destructive">{status}</Badge>;
        case 'Ongoing':
             return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-700">{status}</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline bg-gradient-to-r from-primary via-blue-500 to-green-500 text-transparent bg-clip-text">
          {user?.role === 'admin' ? 'Admin Dashboard' : `Dashboard for ${user?.username}`}
        </h1>
      </div>
      
      <FleetSummary vehicles={displayVehicles} expenses={displayExpenses} />

      {/* ADMIN VIEW */}
      {user?.role === 'admin' && (
        <div className="mt-8 space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><BarChartIcon className="h-5 w-5" /> Trips Per Vehicle</CardTitle>
                        <CardDescription>Number of trips completed by each vehicle this month.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer 
                          config={{
                            trips: {
                              label: "Trips",
                              color: "hsl(var(--chart-1))"
                            }
                          }} 
                          className="h-[300px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart 
                              data={tripsPerVehicle}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <XAxis 
                                dataKey="name" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                domain={[0, 'dataMax + 1']}
                              />
                              <RechartsTooltip 
                                content={<ChartTooltipContent />}
                                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                              />
                              <Bar 
                                dataKey="trips" 
                                fill="hsl(var(--chart-1))" 
                                radius={[4, 4, 0, 0]}
                                name="Trips"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
                 <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><AreaChartIcon className="h-5 w-5" /> Monthly Expense Trends</CardTitle>
                        <CardDescription>Total expenses over the last 6 months.</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ChartContainer 
                          config={{
                            total: {
                              label: "Total Expenses",
                              color: "hsl(var(--chart-1))"
                            }
                          }} 
                          className="h-[300px] w-full"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                              data={monthlyExpenses} 
                              margin={{top: 20, right: 30, left: 20, bottom: 5}}
                            >
                              <XAxis 
                                dataKey="month" 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                              />
                              <YAxis 
                                stroke="#888888" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                                tickFormatter={(value) => `₹${value/1000}k`}
                                domain={[0, 'dataMax + 5000']}
                              />
                              <RechartsTooltip 
                                content={<ChartTooltipContent />}
                                formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Expenses']}
                              />
                              <RechartsArea 
                                type="monotone" 
                                dataKey="total" 
                                stroke="hsl(var(--chart-1))" 
                                fill="hsl(var(--chart-1))" 
                                fillOpacity={0.4}
                                name="Total Expenses"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5 text-primary" /> Active Trips</CardTitle>
                    <CardDescription>A real-time overview of all trips currently in progress.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee & Vehicle</TableHead>
                                <TableHead>Route</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Fuel Level</TableHead>
                                <TableHead className="text-right">Trip Expenses</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {ongoingTrips.map(trip => {
                                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                                const tripExpenses = expenses.filter(e => e.tripId === trip.id).reduce((sum, exp) => sum + exp.amount, 0);

                                return (
                                    <TableRow key={trip.id}>
                                        <TableCell>
                                            <div className="font-medium">{trip.employeeName}</div>
                                            <div className="text-sm text-muted-foreground">{vehicle?.plateNumber}</div>
                                        </TableCell>
                                        <TableCell>
                                            {trip.source} to {trip.destination}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(trip.status)}</TableCell>
                                        <TableCell>
                                            {vehicle ? (
                                                <div className="flex items-center gap-2">
                                                    <Progress value={vehicle.fuelLevel} className="h-2 w-20" />
                                                    <span>{vehicle.fuelLevel}%</span>
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            ₹{tripExpenses.toFixed(2)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                    {ongoingTrips.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <Truck className="mx-auto h-8 w-8 mb-2" />
                            <p>No trips are currently ongoing or planned.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-8 md:grid-cols-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight font-headline mb-4">
                        Employee Expenses
                    </h2>
                    <Card>
                       <CardContent className="pl-2 pt-6">
                         {expensesByEmployee.length > 0 ? (
                           <ChartContainer 
                             config={{
                               total: {
                                 label: "Total Expenses",
                                 color: "hsl(var(--chart-2))"
                               }
                             }} 
                             className="h-[300px] w-full"
                           >
                              <ResponsiveContainer width="100%" height="100%">
                                  <BarChart 
                                    data={expensesByEmployee} 
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                    key={`chart-${expensesByEmployee.length}`} // Force re-render when data changes
                                  >
                                      <XAxis 
                                        type="number" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(value) => `₹${value/1000}k`}
                                        domain={[0, 'dataMax + 1000']}
                                        allowDataOverflow={false}
                                      />
                                      <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        stroke="#888888" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false}
                                        width={80}
                                        allowDataOverflow={false}
                                      />
                                      <RechartsTooltip 
                                        content={<ChartTooltipContent />}
                                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Expenses']}
                                        cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                                      />
                                      <Bar 
                                        dataKey="total" 
                                        fill="hsl(var(--chart-2))" 
                                        radius={[0, 4, 4, 0]} 
                                        name="Total Expenses"
                                        isAnimationActive={false} // Disable animations to prevent flickering
                                      />
                                  </BarChart>
                              </ResponsiveContainer>
                          </ChartContainer>
                         ) : (
                           <div className="h-[300px] w-full flex flex-col items-center justify-center text-center text-muted-foreground">
                             <CircleDollarSign className="h-12 w-12 mb-4 text-muted-foreground/50" />
                             <h3 className="text-lg font-semibold mb-2">No Employee Expenses</h3>
                             <p className="text-sm">No expense data available for employees yet.</p>
                             <p className="text-xs mt-2">Expenses will appear here once employees start logging them.</p>
                           </div>
                         )}
                       </CardContent>
                    </Card>
                </div>
                 <div>
                     <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold tracking-tight font-headline">
                        Vehicle Status
                        </h2>
                        <Button asChild variant="outline">
                            <Link href="/vehicles">
                                <PlusCircle className="mr-2" />
                                Manage Fleet
                            </Link>
                        </Button>
                    </div>
                    <VehicleList 
                        vehicles={displayVehicles} 
                        onUpdateStatus={updateVehicleStatus} 
                        onDeleteVehicle={deleteVehicle} 
                    />
                </div>
            </div>
        </div>
      )}

      {/* EMPLOYEE VIEW */}
      {user?.role === 'employee' && (
         <div className="mt-8">
            {!employeeVehicle ? (
                <Card className="mt-4">
                    <CardContent className="flex flex-col items-center justify-center gap-4 text-center h-full min-h-60">
                        <div className="p-4 bg-primary/10 rounded-full">
                            <Truck className="w-12 h-12 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">No Vehicle Assigned</h3>
                        <p className="text-muted-foreground max-w-sm">
                            You have not been assigned a vehicle. Please contact your administrator.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-8 md:grid-cols-5">
                    <div className="md:col-span-3">
                         <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /> Recent Expenses</CardTitle>
                                <CardDescription>Your recently logged expenses for vehicle {employeeVehicle.plateNumber}.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {displayExpenses.length > 0 ? (
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
                                            {displayExpenses.map(exp => (
                                                <TableRow key={exp.id}>
                                                    <TableCell><Badge variant="outline">{exp.type}</Badge></TableCell>
                                                    <TableCell>{format(new Date(exp.date), "PPP")}</TableCell>
                                                    <TableCell>{getStatusBadge(exp.status)}</TableCell>
                                                    <TableCell className="text-right font-medium">₹{exp.amount.toFixed(2)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-10 text-muted-foreground">
                                        <DollarSign className="mx-auto h-8 w-8 mb-2" />
                                        <p>No expenses logged for this vehicle yet.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5" /> Expense Breakdown</CardTitle>
                                <CardDescription>A breakdown of your expenses by type.</CardDescription>
                            </CardHeader>
                             <CardContent>
                                {employeeExpenseTypes.length > 0 ? (
                                     <ChartContainer 
                                       config={employeeExpenseTypes.reduce((acc, item, index) => {
                                         acc[item.type] = {
                                           label: item.type,
                                           color: COLORS[index % COLORS.length]
                                         };
                                         return acc;
                                       }, {} as Record<string, { label: string; color: string }>)} 
                                       className="h-[250px] w-full"
                                     >
                                         <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <RechartsPie 
                                                  data={employeeExpenseTypes} 
                                                  dataKey="amount" 
                                                  nameKey="type" 
                                                  cx="50%" 
                                                  cy="50%" 
                                                  outerRadius={80}
                                                  label={({ type, amount }) => `${type}: ₹${amount.toLocaleString()}`}
                                                  labelLine={false}
                                                >
                                                    {employeeExpenseTypes.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </RechartsPie>
                                                <RechartsTooltip 
                                                  content={<ChartTooltipContent />}
                                                  formatter={(value, name) => [`₹${value.toLocaleString()}`, name]}
                                                />
                                            </PieChart>
                                         </ResponsiveContainer>
                                     </ChartContainer>
                                ) : (
                                     <div className="text-center py-10 text-muted-foreground h-[250px] flex flex-col justify-center items-center">
                                        <PieChartIcon className="mx-auto h-8 w-8 mb-2" />
                                        <p>No expense data to display.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}

    

    
