
'use client';

import { useEffect, useState } from 'react';
import type { TourPackage, Expense, Member } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Suitcase, CircleDollarSign, Users, Wrench, Lightbulb, AlertTriangle } from 'lucide-react';
import { getTourInsights, TourInsightsOutput } from '@/ai/flows/vehicle-insights';
import { Skeleton } from '@/components/ui/skeleton';

type TourSummaryProps = {
  packages: TourPackage[];
  expenses: Expense[];
  members: Member[];
};

export function TourSummary({ packages, expenses, members }: TourSummaryProps) {
  const [insights, setInsights] = useState<TourInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  useEffect(() => {
    async function fetchInsights() {
      setIsLoading(true);
      try {
        const result = await getTourInsights({
          totalPackages: packages.length,
          activeTours: packages.filter(p => p.status === 'Active').length,
          totalExpenses: totalExpenses,
          totalMembers: members.length,
        });
        setInsights(result);
      } catch (error) {
        console.error("Failed to fetch AI insights:", error);
        setInsights({
          engagementInsight: "Could not load insights.",
          costSavingSuggestion: "Could not load suggestions.",
          growthOpportunity: "Analysis currently unavailable."
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInsights();
  }, [packages, expenses, members, totalExpenses]);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard icon={Suitcase} title="Total Packages" value={packages.length} />
        <SummaryCard icon={CircleDollarSign} title="Total Expenses" value={`₹${totalExpenses.toLocaleString()}`} />
        <SummaryCard icon={Users} title="Total Members" value={members.length} />
        <SummaryCard icon={Wrench} title="Draft Packages" value={packages.filter(p => p.status === 'Draft').length} />
      </div>

      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Actionable insights based on your current tour activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <InsightsSkeleton /> : (
            <>
              <InsightItem title="Engagement Insight" text={insights?.engagementInsight} />
              <InsightItem title="Cost Saving Suggestion" text={insights?.costSavingSuggestion} />
              <InsightItem title="Growth Opportunity" text={insights?.growthOpportunity} />
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}

const SummaryCard = ({ icon: Icon, title, value }: { icon: React.ElementType; title: string; value: number | string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const InsightItem = ({ title, text }: { title: string; text?: string }) => (
  <div className="p-3 rounded-lg bg-muted/50 flex items-start gap-3">
    <div>
      <h4 className="font-semibold text-sm">{title}</h4>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  </div>
);

const InsightsSkeleton = () => (
  <div className="space-y-4">
    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-3/4" />
    </div>
    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-full" />
    </div>
    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  </div>
);
