import { Card, CardContent } from "@/components/ui/card";
import { Users, Instagram, MessageSquare, UserCheck } from "lucide-react";
import { getCachedStats } from "@/lib/data";
import { cn } from "@/lib/utils";

async function getStats() {
  try {
    const stats = await getCachedStats();
    return {
      totalLeads: stats.PROSPECTS_TOTAL,
      totalLogs: stats.LOGS_TOTAL,
      activeActors: stats.ACTORS_TOTAL,
      teamSize: stats.OPERATORS_TOTAL,
    };
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return { totalLeads: 0, totalLogs: 0, activeActors: 0, teamSize: 0 };
  }
}

export async function StatsGrid() {
  const stats = await getStats();

  const items = [
    { label: "Total Prospects", value: stats.totalLeads, icon: Users, sub: "Total CRM Leads", color: "text-blue-500" },
    { label: "Outreach Logs", value: stats.totalLogs, icon: MessageSquare, sub: "Messages Sent", color: "text-purple-500" },
    { label: "Insta Accounts", value: stats.activeActors, icon: Instagram, sub: "Active Actors", color: "text-pink-500" },
    { label: "Team Members", value: stats.teamSize, icon: UserCheck, sub: "Assigned Operators", color: "text-green-500" },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className={cn("p-2.5 rounded-xl transition-colors bg-white/5", item.color)}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
                <h2 className="text-3xl font-bold tracking-tight">{item.value}</h2>
                <p className="text-xs font-medium text-muted-foreground mt-1 uppercase tracking-wider">{item.label}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{item.sub}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}