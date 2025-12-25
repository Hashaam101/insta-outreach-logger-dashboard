import { auth } from "@/auth";
import { StatsGrid } from "@/components/stats-grid";
import { RecentActivity } from "@/components/recent-activity";
import { StatusDistribution } from "@/components/status-distribution";
import { TopActors } from "@/components/top-actors";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowRight, 
  Download, 
  ExternalLink,
  Activity,
  History,
  PieChart,
  Target
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="space-y-10 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Sparkles className="h-3 w-3" />
                Management Console
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/50 bg-clip-text text-transparent">
                Command Center
            </h1>
            <p className="text-muted-foreground text-sm max-w-md">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'User'}. Real-time intelligence from your Instagram outreach team.
            </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-card/40 border-primary/10 hover:bg-primary/5 gap-2">
                <Download className="h-4 w-4" /> Export All Data
            </Button>
            <Button size="sm" className="shadow-lg shadow-primary/20 gap-2" asChild>
                <Link href="/leads">
                    Leads Explorer <ArrowRight className="h-4 w-4" />
                </Link>
            </Button>
        </div>
      </div>
      
      {/* Stats Section */}
      <StatsGrid />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Activity Feed */}
        <Card className="lg:col-span-6 border-primary/10 bg-card/40 backdrop-blur-sm border-2">
          <CardHeader className="border-b border-primary/5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle className="text-lg">Real-time Outreach</CardTitle>
                        <CardDescription>Latest messages sent via actors</CardDescription>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="text-[10px] uppercase font-bold tracking-widest text-primary hover:bg-primary/5">
                    Live Feed
                </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <RecentActivity />
          </CardContent>
        </Card>

        <div className="lg:col-span-6 space-y-6">
            {/* Status Distribution */}
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-primary/5">
                    <div className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-sm">Lead Status Distribution</CardTitle>
                            <CardDescription className="text-[10px]">CRM Pipeline Health</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <StatusDistribution />
                </CardContent>
            </Card>

            {/* Top Actors */}
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-primary/5">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-sm">Top Performing Actors</CardTitle>
                            <CardDescription className="text-[10px]">Instagram Activity Ranking</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <TopActors />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
