import { auth } from "@/auth";
import { StatsGrid } from "@/components/stats-grid";
import { StatusDistribution } from "@/components/status-distribution";
import { TopActors } from "@/components/top-actors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { getCachedOperatorStats } from "@/lib/data";

export default async function DashboardPage({
    searchParams,
}: {
    searchParams?: Promise<{ view?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const view = params?.view || "my";
  
  const currentOperator = session?.user?.operator_name || "";
  const filterByOperator = view === "my" ? currentOperator : undefined;

  // Personal performance hub always uses the session operator
  const operatorStats = await getCachedOperatorStats(currentOperator);

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary/80 text-xs font-medium tracking-wide">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Dashboard</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Command Center
            </h1>
            <p className="text-muted-foreground text-sm">
                {view === "my"
                    ? "Your personal outreach performance"
                    : "Team-wide intelligence overview"}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
            <ViewToggle />
            <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-9 gap-2" asChild>
                    <Link href="/logs">
                        <History className="h-4 w-4" />
                        <span className="hidden sm:inline">Logs</span>
                    </Link>
                </Button>
                <Button size="sm" className="h-9 gap-2" asChild>
                    <Link href="/leads">
                        <span className="hidden sm:inline">Leads</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
        </div>
      </div>

      {/* Stats Section */}
      <StatsGrid operatorName={filterByOperator} />

      <div className="grid gap-5 grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Governance & My Stats */}
        <div className="order-2 lg:order-1 lg:col-span-7 space-y-5">
            <OperatorStats data={operatorStats as any} />
            <TeamGoalsWidget />
        </div>

        {/* Right Column: Distribution & Rankings */}
        <div className="order-1 lg:order-2 lg:col-span-5 space-y-5">
            {/* Status Distribution */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <PieChart className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium">Pipeline Health</CardTitle>
                            <CardDescription className="text-xs">
                                {view === "my" ? "Your active leads" : "Team distribution"}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-5">
                    <StatusDistribution operatorName={filterByOperator} />
                </CardContent>
            </Card>

            {/* Top Actors */}
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 border-b border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
                            <CardDescription className="text-xs">Activity leaderboard</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-5">
                    <TopActors />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}