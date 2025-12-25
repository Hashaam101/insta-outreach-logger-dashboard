import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Target, ShieldCheck, Mail, Phone, Zap, Clock } from "lucide-react";
import { 
    getCachedOutreachVolume, 
    getCachedOperatorPerformance, 
    getCachedStatusDistribution, 
    getCachedEnrichmentStats,
    getCachedActivityHeatmap
} from "@/lib/data";
import { VolumeChart } from "@/components/analytics/volume-chart";
import { PerformanceChart } from "@/components/analytics/performance-chart";
import { StatusPieChart } from "@/components/analytics/status-pie-chart";
import { TimeFilter } from "@/components/analytics/time-filter";
import { HourlyActivityChart } from "@/components/analytics/hourly-chart";

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams?: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = Number(params?.range || "30");

  const [volumeData, performanceData, statusData, enrichmentData, heatmapData] = await Promise.all([
    getCachedOutreachVolume(range),
    getCachedOperatorPerformance(range),
    getCachedStatusDistribution(),
    getCachedEnrichmentStats(),
    getCachedActivityHeatmap()
  ]);

  const enrichmentRate = enrichmentData.TOTAL > 0 
    ? Math.round(((Number(enrichmentData.WITH_EMAIL) + Number(enrichmentData.WITH_PHONE)) / (Number(enrichmentData.TOTAL) * 2)) * 100) 
    : 0;

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <BarChart3 className="h-3 w-3" />
                System Intelligence
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Advanced Analytics</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">
                A comprehensive overview of your distributed outreach system performance.
            </p>
        </div>
        <TimeFilter />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Main Outreach Volume Chart */}
        <Card className="lg:col-span-8 border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden border-2">
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between space-y-0">
            <div>
                <CardTitle className="text-lg">Outreach Velocity</CardTitle>
                <CardDescription>Daily message volume across all accounts (Last {range} days)</CardDescription>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-bold">
                TOTAL: {volumeData.reduce((acc: number, curr: any) => acc + Number(curr.TOTAL), 0)}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <VolumeChart data={volumeData as any} />
          </CardContent>
        </Card>

        {/* Hourly Heatmap */}
        <Card className="lg:col-span-4 border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader className="border-b border-primary/5">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                    <CardTitle className="text-sm">Peak Activity Hours</CardTitle>
                    <CardDescription className="text-[10px]">When is outreach most active? (24h)</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <HourlyActivityChart data={heatmapData as any} />
            <p className="text-[10px] text-muted-foreground text-center mt-4 italic">
                Data based on server timestamps for the last 30 days.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Operator Leaderboard */}
        <Card className="lg:col-span-6 border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader className="border-b border-primary/5">
            <CardTitle className="text-lg">Team Performance</CardTitle>
            <CardDescription>Messages sent by each operator (Last {range} days)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <PerformanceChart data={performanceData as any} />
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card className="lg:col-span-6 border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader className="border-b border-primary/5">
            <CardTitle className="text-lg">Conversion Pipeline</CardTitle>
            <CardDescription>Overall CRM lead distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <StatusPieChart data={statusData as any} />
          </CardContent>
        </Card>
      </div>

      {/* Enrichment Section */}
      <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
              <Zap className="h-40 w-40 text-primary" />
          </div>
          <CardHeader className="border-b border-primary/5">
              <CardTitle className="text-lg">Data Enrichment Health</CardTitle>
              <CardDescription>How much actionable data are we extracting from prospects?</CardDescription>
          </CardHeader>
          <CardContent className="pt-10 pb-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="bg-primary/10 p-4 rounded-3xl mb-2">
                          <Target className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-4xl font-extrabold">{enrichmentRate}%</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enrichment Score</p>
                  </div>
                  
                  <div className="space-y-1 text-center md:text-left flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-blue-500 mb-1">
                          <Mail className="h-4 w-4" />
                          <span className="text-2xl font-bold">{enrichmentData.WITH_EMAIL}</span>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-7">Emails Verified</p>
                  </div>

                  <div className="space-y-1 text-center md:text-left flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-pink-500 mb-1">
                          <Phone className="h-4 w-4" />
                          <span className="text-2xl font-bold">{enrichmentData.WITH_PHONE}</span>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-7">Phones Found</p>
                  </div>

                  <div className="space-y-1 text-center md:text-left flex flex-col justify-center">
                      <div className="flex items-center gap-3 text-purple-500 mb-1">
                          <ShieldCheck className="h-4 w-4" />
                          <span className="text-2xl font-bold">{enrichmentData.TOTAL}</span>
                      </div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider ml-7">Total Profiles</p>
                  </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
