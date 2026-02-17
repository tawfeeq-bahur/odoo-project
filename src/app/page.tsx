"use client";

import { useSharedState } from "@/components/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Eye,
  Users,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DollarSign,
  Calendar,
  Plane,
  ShoppingBag,
  UserCheck,
  Briefcase,
  ChevronRight,
  Route,
  Search,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo, useState } from "react";
import { format, subMonths, parseISO } from "date-fns";
import { searchPlaces, PlaceSearchOutput } from "@/ai/flows/place-search";
import { PlaceCard } from "@/components/PlaceCard";
import { Skeleton } from "@/components/ui/skeleton";
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
  ResponsiveContainer,
} from "recharts";
import { AddPackageDialog } from "@/components/fleet/AddVehicleDialog";
import { useLanguage } from "@/context/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const { user, packages, expenses, addPackage } = useSharedState();
  const { t } = useLanguage();

  // Place search (global destination search)
  const [placeSearch, setPlaceSearch] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceSearchOutput[]>([]);
  const [placeLoading, setPlaceLoading] = useState(false);

  // Tours filter search (for My Tours section)
  const [toursSearchQuery, setToursSearchQuery] = useState("");
  const [groupBy, setGroupBy] = useState<"all" | "conducted" | "joined">("all");
  const [filterBy, setFilterBy] = useState<
    "all" | "ongoing" | "up-coming" | "completed"
  >("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "budget" | "duration">(
    "name",
  );

  // Handle place search
  const handlePlaceSearch = async () => {
    if (!placeSearch.trim()) return;
    setPlaceLoading(true);
    try {
      const results = await searchPlaces({ query: placeSearch });
      setPlaceResults((prev) => [...prev, results]);
    } catch (err) {
      console.error("Place search failed:", err);
    } finally {
      setPlaceLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handlePlaceSearch();
  };

  if (!user) return null;

  const {
    organizedTours,
    joinedTours,
    monthlySpending,
    expenseByCategory,
    totalExpenses,
  } = useMemo(() => {
    const organized = packages.filter((p) => p.organizerName === user.username);
    const joined = packages.filter(
      (p) =>
        p.members.some(
          (member) =>
            (typeof member === "string" ? member : member.name) ===
            user.username,
        ) && p.organizerName !== user.username,
    );

    const userExpenses = expenses.filter(
      (exp) => exp.submittedBy === user.username && exp.status === "approved",
    );

    const totalExp = userExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    const months = Array.from({ length: 6 }, (_, i) =>
      subMonths(new Date(), 5 - i),
    );
    const spendingData = months.map((month) => ({
      name: format(month, "MMM"),
      "Total Spend (₹)": 0,
    }));

    userExpenses.forEach((exp) => {
      const monthStr = format(parseISO(exp.date), "MMM");
      const monthData = spendingData.find((d) => d.name === monthStr);
      if (monthData) {
        monthData["Total Spend (₹)"] += exp.amount;
      }
    });

    const categoryMap: { [key: string]: number } = {};
    userExpenses.forEach((exp) => {
      categoryMap[exp.type] = (categoryMap[exp.type] || 0) + exp.amount;
    });
    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
      name,
      value,
    }));

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

    // Tours search filter (for My Tours section)
    if (toursSearchQuery) {
      filtered = filtered.filter(
        (tour) =>
          tour.name.toLowerCase().includes(toursSearchQuery.toLowerCase()) ||
          tour.destination
            .toLowerCase()
            .includes(toursSearchQuery.toLowerCase()),
      );
    }

    // Status filter
    if (filterBy !== "all") {
      filtered = filtered.filter(
        (tour) => tour.status.toLowerCase() === filterBy,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "date":
          return (
            new Date(b.lastUpdated).getTime() -
            new Date(a.lastUpdated).getTime()
          );
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-headline">
            {t("Dashboard")}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t("Welcome back,")} {user.username}! {t("Here's your travel analysis.")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="sm:size-default">
            <Link href="/join">
              <Users className="mr-1 sm:mr-2 h-4 w-4" /> {t("Join a Tour")}
            </Link>
          </Button>
          <AddPackageDialog onAddPackage={addPackage}>
            <Button size="sm" className="sm:size-default">
              <PlusCircle className="mr-1 sm:mr-2 h-4 w-4" /> {t("Organize Tour")}
            </Button>
          </AddPackageDialog>
        </div>
      </div>

      {/* Global Place/Destination Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            <Input
              placeholder={t("Search destinations...")}
              value={placeSearch}
              onChange={(e) => setPlaceSearch(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 sm:pl-12 pr-24 sm:pr-32 py-4 sm:py-6 text-sm sm:text-lg"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 flex gap-1 sm:gap-2">
              {placeSearch && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setPlaceSearch("");
                    setPlaceResults([]);
                  }}
                >
                  {t("Clear")}
                </Button>
              )}
              <Button
                size="sm"
                onClick={handlePlaceSearch}
                disabled={!placeSearch.trim() || placeLoading}
              >
                {placeLoading ? t("Searching...") : t("Search")}
              </Button>
            </div>
          </div>
          {placeLoading && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-96 w-full rounded-lg" />
              ))}
            </div>
          )}
          {placeResults.length > 0 && !placeLoading && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t("All Search Results")}</h3>
                <div className="flex items-center gap-2">
                  <Badge>
                    {placeResults.reduce((acc, r) => acc + r.results.length, 0)} results from {placeResults.length} {placeResults.length === 1 ? "search" : "searches"}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => setPlaceResults([])}>
                    {t("Clear All")}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {placeResults.flatMap((r) => r.results).map((place, idx) => (
                  <PlaceCard key={idx} place={place} />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatedCard
          index={1}
          icon={Briefcase}
          title={t("Organized Tours")}
          value={organizedTours.length}
        />
        <AnimatedCard
          index={2}
          icon={Users}
          title={t("Joined Tours")}
          value={joinedTours.length}
        />
        <AnimatedCard
          index={3}
          icon={DollarSign}
          title={t("Total Approved Spend")}
          value={`₹${totalExpenses.toLocaleString()}`}
        />
      </div>

      {/* Tour Tables with Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag /> {t("My Tours")}
          </CardTitle>
          <CardDescription>
            {toursSearchQuery
              ? `${t("Search results for")} "${toursSearchQuery}"`
              : t("View and manage your tours")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tours Filter Search and Controls */}
          <div className="mb-6 space-y-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("Filter your tours by name or destination...")}
                value={toursSearchQuery}
                onChange={(e) => setToursSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Group By */}
              <Select
                value={groupBy}
                onValueChange={(value: any) => setGroupBy(value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Group by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Tours")}</SelectItem>
                  <SelectItem value="conducted">{t("Conducted")}</SelectItem>
                  <SelectItem value="joined">{t("Joined")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter */}
              <Select
                value={filterBy}
                onValueChange={(value: any) => setFilterBy(value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("All Status")}</SelectItem>
                  <SelectItem value="ongoing">{t("Ongoing")}</SelectItem>
                  <SelectItem value="up-coming">{t("Upcoming")}</SelectItem>
                  <SelectItem value="completed">{t("Completed")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort By */}
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t("Name")}</SelectItem>
                  <SelectItem value="date">{t("Date")}</SelectItem>
                  <SelectItem value="budget">{t("Budget")}</SelectItem>
                  <SelectItem value="duration">{t("Duration")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tours Display */}
          {groupBy === "all" ? (
            <Tabs defaultValue="conducted" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="conducted">
                  {t("Conducted Tours")} ({displayedOrganizedTours.length})
                </TabsTrigger>
                <TabsTrigger value="joined">
                  {t("Joined Tours")} ({displayedJoinedTours.length})
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
                <h3 className="text-lg font-semibold">
                  {t("Conducted Tours")} ({displayedOrganizedTours.length})
                </h3>
              </div>
              <TourTable tours={displayedOrganizedTours} />
            </>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {t("Joined Tours")} ({displayedJoinedTours.length})
                </h3>
              </div>
              <TourTable tours={displayedJoinedTours} />
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-8">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon /> {t("Monthly Spending Overview")}
            </CardTitle>
            <CardDescription>
              {t("Your approved spending over the last 6 months.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlySpending.every((d) => d["Total Spend (₹)"] === 0) ? (
              <p className="text-muted-foreground text-center py-8">
                {t("No approved expenses yet.")}
              </p>
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
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon /> {t("Expense Breakdown")}
            </CardTitle>
            <CardDescription>
              {t("How your spending is distributed across categories.")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                {t("No expense data available.")}
              </p>
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
                    label={(props) =>
                      `${props.name} (${(props.percent * 100).toFixed(0)}%)`
                    }
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
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
    </div>
  );
}

const TourTable = ({ tours }: { tours: any[] }) => {
  const { t } = useLanguage();
  return (
  <div className="overflow-x-auto -mx-4 sm:mx-0">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[140px]">{t("Tour Name")}</TableHead>
          <TableHead className="hidden sm:table-cell">{t("Destination")}</TableHead>
          <TableHead>{t("Status")}</TableHead>
          <TableHead className="text-right">{t("Actions")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tours.length > 0 ? (
          tours.map((tour) => (
            <TableRow
              key={tour.id}
              className="hover:bg-muted/50 transition-colors"
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground shrink-0" /> 
                  <div>
                    <span>{tour.name}</span>
                    <p className="text-xs text-muted-foreground sm:hidden">{tour.destination}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell">{tour.destination}</TableCell>
              <TableCell>
                <Badge
                  variant={tour.status === "Ongoing" ? "default" : "secondary"}
                >
                  {t(tour.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/tours/${tour.id}`}>
                    <Eye className="sm:mr-2" /> <span className="hidden sm:inline">{t("View")}</span>
                  </Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={4}
              className="text-center text-muted-foreground h-24"
            >
              {t("No tours in this category yet.")}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  </div>
  );
};

const AnimatedCard = ({
  icon: Icon,
  title,
  value,
  index,
}: {
  icon: React.ElementType;
  title: string;
  value: number | string;
  index: number;
}) => (
  <Card
    className="animate-in fade-in-0 slide-in-from-bottom-6"
    style={{
      animationDelay: `${index * 100}ms`,
      animationFillMode: "backwards",
    }}
  >
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

