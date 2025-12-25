import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Users, Target, ShieldCheck, Mail, Phone, Zap, Clock, UserCheck } from "lucide-react";
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
import { EnrichmentFilter } from "@/components/analytics/enrichment-filter";

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams?: Promise<{ range?: string; enrichmentRange?: string }>;
}) {
  const params = await searchParams;
  const range = Number(params?.range || "30");
  const enrichmentRange = Number(params?.enrichmentRange || "30");

  const [volumeData, performanceData, statusData, enrichmentData, heatmapData] = await Promise.all([
    getCachedOutreachVolume(range),
    getCachedOperatorPerformance(range),
    getCachedStatusDistribution(),
    getCachedEnrichmentStats(enrichmentRange),
    getCachedActivityHeatmap()
  ]);

  const enrichmentRate = Number(enrichmentData.TOTAL) > 0
    ? Math.round(((Number(enrichmentData.WITH_EMAIL) + Number(enrichmentData.WITH_PHONE)) / (Number(enrichmentData.TOTAL) * 2)) * 100)
    : 0;

  const enrichmentFromDate = new Date(Date.now() - enrichmentRange * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary/80 text-xs font-medium tracking-wide">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>System Intelligence</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Intelligence Hub</h1>
            <p className="text-muted-foreground text-sm">
                A comprehensive overview of your distributed outreach system performance.
            </p>
        </div>
        <TimeFilter />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Main Outreach Volume Chart */}
        <Card className="col-span-1 lg:col-span-8 border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden border-2 rounded-2xl">
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:space-y-0">
            <div>
                <CardTitle className="text-lg">Outreach Velocity</CardTitle>
                <CardDescription>Daily message volume (Last {range} days)</CardDescription>
            </div>
            <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-bold shrink-0 border border-primary/20">
                TOTAL: {volumeData.reduce((acc: number, curr: any) => acc + Number(curr.TOTAL), 0)}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <VolumeChart data={volumeData as any} />
          </CardContent>
        </Card>

        {/* Hourly Heatmap */}
        <Card className="col-span-1 lg:col-span-4 border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                    <CardTitle className="text-sm">Peak Activity Hours</CardTitle>
                    <CardDescription className="text-[10px]">Active periods (24h)</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-2">
            <HourlyActivityChart data={heatmapData as any} />
            <p className="text-[9px] text-muted-foreground text-center mt-4 italic">
                Data based on server timestamps.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
        {/* Operator Leaderboard */}
        <Card className="col-span-1 lg:col-span-6 border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5">
            <CardTitle className="text-lg">Team Performance</CardTitle>
            <CardDescription>Top operators (Last {range} days)</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <PerformanceChart data={performanceData as any} />
          </CardContent>
        </Card>

        {/* Lead Status Distribution */}
        <Card className="col-span-1 lg:col-span-6 border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5">
            <CardTitle className="text-lg">Conversion Pipeline</CardTitle>
            <CardDescription>Overall lead distribution</CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <StatusPieChart data={statusData as any} />
          </CardContent>
        </Card>
      </div>

      {/* Enrichment Section */}
      <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden relative group border-2 rounded-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none hidden lg:block">
              <Zap className="h-40 w-40 text-primary" />
          </div>
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:space-y-0">
              <div>
                <CardTitle className="text-lg">Data Enrichment Health</CardTitle>
                <CardDescription>Prospects updated since {enrichmentFromDate}</CardDescription>
              </div>
              <EnrichmentFilter />
          </CardHeader>
          <CardContent className="pt-8 sm:pt-10 pb-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {/* Enrichment Score */}
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="bg-primary/10 p-4 rounded-3xl mb-2">
                          <Target className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-4xl font-black tracking-tighter">{enrichmentRate}%</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Enrichment Score</p>
                  </div>

                  {/* Emails Verified */}
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="bg-blue-500/10 p-4 rounded-3xl mb-2">
                          <Mail className="h-8 w-8 text-blue-500" />
                      </div>
                      <h3 className="text-4xl font-black tracking-tighter">{enrichmentData.WITH_EMAIL}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Emails Verified</p>
                  </div>

                  {/* Phones Found */}
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="bg-pink-500/10 p-4 rounded-3xl mb-2">
                          <Phone className="h-8 w-8 text-pink-500" />
                      </div>
                      <h3 className="text-4xl font-black tracking-tighter">{enrichmentData.WITH_PHONE}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phones Found</p>
                  </div>

                  {/* Total Profiles */}
                  <div className="flex flex-col items-center justify-center text-center gap-2">
                      <div className="bg-purple-500/10 p-4 rounded-3xl mb-2">
                          <UserCheck className="h-8 w-8 text-purple-500" />
                      </div>
                      <h3 className="text-4xl font-black tracking-tighter">{enrichmentData.TOTAL}</h3>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Profiles</p>
                  </div>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}