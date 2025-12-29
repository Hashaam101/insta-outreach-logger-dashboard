import { Suspense } from "react";
import { auth } from "@/auth";
import { StatsGrid } from "@/components/stats-grid";
import { StatusDistribution } from "@/components/status-distribution";
import { TopActors } from "@/components/top-actors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sparkles, 
  ArrowRight, 
  History,
  PieChart,
  Target
} from "lucide-react";
import Link from "next/link";
import { TeamGoalsWidget } from "@/components/dashboard/TeamGoalsWidget";
import { OperatorStats } from "@/components/dashboard/OperatorStats";
import { ViewToggle } from "@/components/ui/view-toggle";
import { getCachedOperatorStats, OperatorStatsData } from "@/lib/data";
import { cookies } from "next/headers";

function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-xl bg-primary/5" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="space-y-4 pt-4">
      <Skeleton className="h-8 w-full bg-primary/5" />
      <Skeleton className="h-8 w-[90%] bg-primary/5" />
      <Skeleton className="h-8 w-[80%] bg-primary/5" />
    </div>
  );
}

export default async function DashboardPage({
    searchParams,
}: {
    searchParams?: Promise<{ view?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const cookieStore = await cookies();
  
  // Priority: URL Param -> Cookie -> Default 'my'
  const view = params?.view || cookieStore.get("dashboard_view")?.value || "my";
  
  const currentOperator = session?.user?.operator_name || "";
  const filterByOperator = view === "my" ? currentOperator : undefined;

  // Personal performance hub always uses the session operator
  const operatorStats = await getCachedOperatorStats(currentOperator) as OperatorStatsData;

  return (
    <div className="space-y-8 md:space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3" />
                Management Console
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Command Center
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
                {view === "my" 
                    ? `Viewing your personal outreach performance.` 
                                              : "Comprehensive intelligence from the entire fleet."}            </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <ViewToggle />
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="bg-card/40 border-primary/10 hover:bg-primary/5 gap-2 rounded-xl h-9" asChild>
                    <Link href="/logs">
                        <History className="h-4 w-4" /> <span className="hidden sm:inline">Logs</span>
                    </Link>
                </Button>
                <Button size="sm" className="shadow-lg shadow-primary/20 gap-2 rounded-xl h-9" asChild>
                    <Link href="/leads">
                        <span className="hidden sm:inline">Leads</span> <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
      </div>
      
      {/* Stats Section */}
      <Suspense fallback={<StatsGridSkeleton />}>
        <StatsGrid operatorName={filterByOperator} />
      </Suspense>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Governance & My Stats */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-6">
            <OperatorStats data={operatorStats} />
            <Suspense fallback={<Skeleton className="h-[300px] rounded-2xl bg-primary/5" />}>
              <TeamGoalsWidget />
            </Suspense>
        </div>

        {/* Right Column: Distribution & Rankings */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-6">
            {/* Status Distribution */}
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4 text-primary" />
                        <div>
                            <CardTitle className="text-sm">Pipeline Health</CardTitle>
                            <CardDescription className="text-[10px]">
                                {view === "my" ? "Your active leads" : "Global team distribution"}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <Suspense fallback={<ChartSkeleton />}>
                      <StatusDistribution operatorName={filterByOperator} />
                    </Suspense>
                </CardContent>
            </Card>

            {/* Top Actors */}
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <div>
                            <CardTitle className="text-sm">Asset Ranking</CardTitle>
                            <CardDescription className="text-[10px]">Instagram Activity Leaderboard</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <Suspense fallback={<ChartSkeleton />}>
                      <TopActors />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}