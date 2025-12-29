import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Target, MessageCircleHeart, Activity } from "lucide-react";
import { getCachedDashboardMetrics } from "@/lib/data";
import { cn } from "@/lib/utils";

interface StatsGridProps {
    operatorName?: string
}

export async function StatsGrid({ operatorName }: StatsGridProps) {
  const metrics = await getCachedDashboardMetrics(operatorName);

  const totalDms = Number(metrics.TOTAL_DMS);
  const booked = Number(metrics.BOOKED_LEADS);
  const replies = Number(metrics.POSITIVE_REPLIES);
  const active24h = Number(metrics.ACTIVE_24H);

  const responseRate = totalDms > 0 ? ((replies / totalDms) * 100).toFixed(1) : "0";
  const bookingRate = totalDms > 0 ? ((booked / totalDms) * 100).toFixed(1) : "0";

  const items = [
    { label: "Total Outreach", value: totalDms, icon: MessageSquare, sub: "DMs sent", color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Positive Replies", value: replies, icon: MessageCircleHeart, sub: `${responseRate}% rate`, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Booked Leads", value: booked, icon: Target, sub: `${bookingRate}% rate`, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Active Today", value: active24h, icon: Activity, sub: "Last 24h", color: "text-amber-400", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden group hover:border-border transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2 rounded-lg", item.bg)}>
                <item.icon className={cn("h-4 w-4", item.color)} />
              </div>
            </div>
            <div className="space-y-1">
                <p className="text-2xl font-semibold tracking-tight">{item.value.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className={cn("text-xs font-medium", item.color)}>{item.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
