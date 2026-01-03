"use client";

import { useSharedState } from "@/components/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Eye, Users, BarChart as BarChartIcon, PieChart as PieChartIcon, DollarSign, Calendar, Plane, ShoppingBag, UserCheck, Briefcase, ChevronRight, Route, Search, Filter, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState } from "react";
import { format, subMonths, parseISO } from "date-fns";
import {
  BarChart,
  Bar,
  PieChart,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function DashboardPage() {
  const { user, packages, expenses, addPackage } = useSharedState();

  // Search, Filter, Sort states
  const [searchQuery, setSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<"all" | "conducted" | "joined">("all");
  const [filterBy, setFilterBy] = useState<"all" | "active" | "draft" | "archived">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "budget" | "duration">("name");

  if (!user) return null;

  const { organizedTours, joinedTours, monthlySpending, expenseByCategory, totalExpenses } = useMemo(() => {
    const organized = packages.filter(p => p.organizerName === user.username);
    const joined = packages.filter(p => p.members.some(member => (typeof member === 'string' ? member : member.name) === user.username) && p.organizerName !== user.username);

    const userExpenses = expenses.filter(exp => exp.submittedBy === user.username && exp.status === 'approved');

    const totalExp = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);

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
      expenseByCategory: categoryData,
      totalExpenses: totalExp,
    };
  }, [packages, expenses, user.username]);

  // Filter and sort tours
  const getFilteredAndSortedTours = (tours: any[]) => {
    let filtered = tours;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(tour =>
        tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tour.destination.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterBy !== "all") {
      filtered = filtered.filter(tour => tour.status.toLowerCase() === filterBy);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case "budget":
          return (b.maxBudget || 0) - (a.maxBudget || 0);
        case "duration":
          return (b.durationDays || 0) - (a.durationDays || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const displayedOrganizedTours = getFilteredAndSortedTours(organizedTours);
  const displayedJoinedTours = getFilteredAndSortedTours(joinedTours);

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}! Here's your travel analysis.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/join"><Users className="mr-2" /> Join a Tour</Link>
          </Button>
          <AddPackageDialog onAddPackage={addPackage}>
            <Button>
              <PlusCircle className="mr-2" /> Organize Tour
            </Button>
          </AddPackageDialog>
        </div>
      </div>

      {/* Search, Filter, Sort Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tours..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Group By */}
            <Select value={groupBy} onValueChange={(value: any) => setGroupBy(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tours</SelectItem>
                <SelectItem value="conducted">Conducted</SelectItem>
                <SelectItem value="joined">Joined</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter */}
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatedCard index={1} icon={Briefcase} title="Organized Tours" value={organizedTours.length} />
        <AnimatedCard index={2} icon={Users} title="Joined Tours" value={joinedTours.length} />
        <AnimatedCard index={3} icon={DollarSign} title="Total Approved Spend" value={`₹${totalExpenses.toLocaleString()}`} />
      </div>

      {/* Tour Tables with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag /> My Tours
          </CardTitle>
          <CardDescription>
            {searchQuery && `Search results for "${searchQuery}"`}
            {!searchQuery && "View and manage your tours"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {groupBy === "all" ? (
            <Tabs defaultValue="conducted" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conducted">
                  Conducted Tours ({displayedOrganizedTours.length})
                </TabsTrigger>
                <TabsTrigger value="joined">
                  Joined Tours ({displayedJoinedTours.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="conducted">
                <TourTable tours={displayedOrganizedTours} />
              </TabsContent>
              <TabsContent value="joined">
                <TourTable tours={displayedJoinedTours} />
              </TabsContent>
            </Tabs>
          ) : groupBy === "conducted" ? (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Conducted Tours ({displayedOrganizedTours.length})</h3>
              </div>
              <TourTable tours={displayedOrganizedTours} />
            </>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Joined Tours ({displayedJoinedTours.length})</h3>
              </div>
              <TourTable tours={displayedJoinedTours} />
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChartIcon /> Monthly Spending Overview</CardTitle>
            <CardDescription>Your approved spending over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlySpending.every(d => d["Total Spend (₹)"] === 0) ? (
              <p className="text-muted-foreground text-center py-8">No approved expenses yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Total Spend (₹)" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon /> Expense Breakdown</CardTitle>
            <CardDescription>How your spending is distributed across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No expense data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
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
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div >
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
        <TableRow key={tour.id} className="hover:bg-muted/50 transition-colors">
          <TableCell className="font-medium flex items-center gap-2"><Route className="h-4 w-4 text-muted-foreground" /> {tour.name}</TableCell>
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

const AnimatedCard = ({ icon: Icon, title, value, index }: { icon: React.ElementType; title: string; value: number | string; index: number }) => (
  <Card className="animate-in fade-in-0 slide-in-from-bottom-6" style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);



