import { DataTable } from "@/components/ui/data-table";
import { columns, Lead } from "./columns";
import { LeadsFilter } from "@/components/leads/leads-filter";
import { LeadsStatusFilter } from "@/components/leads/leads-status-filter";
import { dbQuery, dbQueryCached } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import {
    Users,
    Filter,
    Plus,
    FileSpreadsheet,
    UserCheck,
    MessageCircle,
    Target,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeadStats {
    total: number;
    contacted: number;
    replied: number;
    booked: number;
    notContacted: number;
}

async function getLeads(query?: string, status?: string): Promise<Lead[]> {
  try {
      let whereConditions: string[] = [];
      let params: Record<string, string> = {};

      if (query) {
          whereConditions.push("(LOWER(target_username) LIKE :q OR LOWER(status) LIKE :q OR LOWER(email) LIKE :q)");
          params.q = `%${query.toLowerCase()}%`;
      }

      if (status && status !== "all") {
          whereConditions.push("LOWER(status) = :status");
          params.status = status.toLowerCase();
      }

      const sql = `
        SELECT target_username, status, owner_actor, notes, first_contacted, last_updated, email, phone_number, source_summary
        FROM PROSPECTS
        ${whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : ""}
        ORDER BY last_updated DESC
      `;

      // Use cached query for initial load (no filters), regular query for searches
      const hasFilters = query || (status && status !== "all");
      const rows = hasFilters
          ? await dbQuery<any>(sql, params)
          : await dbQueryCached<any>(sql, {}, 'leads:all');

      return rows.map(r => ({
          target_username: r.TARGET_USERNAME,
          full_name: "",
          status: r.STATUS,
          last_updated: r.LAST_UPDATED,
          first_contacted: r.FIRST_CONTACTED,
          email: r.EMAIL,
          phone_number: r.PHONE_NUMBER,
          source: r.SOURCE_SUMMARY,
          owner_actor: r.OWNER_ACTOR
      }));
  } catch (e) {
      console.error("DB Fetch Error:", e);
      return [];
  }
}

async function getLeadStats(): Promise<LeadStats> {
  try {
      const sql = `
        SELECT
          COUNT(*) as TOTAL,
          SUM(CASE WHEN LOWER(status) = 'contacted' THEN 1 ELSE 0 END) as CONTACTED,
          SUM(CASE WHEN LOWER(status) = 'reply received' THEN 1 ELSE 0 END) as REPLIED,
          SUM(CASE WHEN LOWER(status) = 'booked' THEN 1 ELSE 0 END) as BOOKED,
          SUM(CASE WHEN LOWER(status) = 'not contacted' THEN 1 ELSE 0 END) as NOT_CONTACTED
        FROM PROSPECTS
      `;
      const rows = await dbQueryCached<any>(sql, {}, 'leads:stats');
      const row = rows[0] || {};
      return {
          total: Number(row.TOTAL) || 0,
          contacted: Number(row.CONTACTED) || 0,
          replied: Number(row.REPLIED) || 0,
          booked: Number(row.BOOKED) || 0,
          notContacted: Number(row.NOT_CONTACTED) || 0
      };
  } catch (e) {
      console.error("DB Stats Error:", e);
      return { total: 0, contacted: 0, replied: 0, booked: 0, notContacted: 0 };
  }
}

export default async function LeadsPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string; status?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q || "";
  const statusFilter = params?.status || "all";

  const [data, stats] = await Promise.all([
    getLeads(query, statusFilter),
    getLeadStats()
  ]);

  const statItems = [
    {
      label: "Total Leads",
      value: stats.total,
      icon: Users,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      filter: "all"
    },
    {
      label: "Contacted",
      value: stats.contacted,
      icon: MessageCircle,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      filter: "contacted"
    },
    {
      label: "Replies",
      value: stats.replied,
      icon: UserCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      filter: "reply received"
    },
    {
      label: "Booked",
      value: stats.booked,
      icon: Target,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      filter: "booked"
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary/80 text-xs font-medium tracking-wide">
                <Users className="h-3.5 w-3.5" />
                <span>Data Management</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Leads Explorer</h1>
            <p className="text-muted-foreground text-sm">
                Search, filter and manage interactions with all your logged prospects.
            </p>
        </div>

        <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="bg-card/40 border-primary/10 gap-2 h-9">
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
             </Button>
             <Button size="sm" className="gap-2 h-9">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Lead</span>
             </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <Card
            key={item.label}
            className={cn(
              "border-border/50 bg-card/60 backdrop-blur-sm overflow-hidden transition-all cursor-pointer hover:border-primary/30",
              statusFilter === item.filter && "border-primary/50 bg-primary/5"
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold tracking-tight">{item.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
                <div className={cn("p-2.5 rounded-xl", item.bg)}>
                  <item.icon className={cn("h-4 w-4", item.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter & Table Area */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-card/40 p-4 rounded-2xl border border-primary/10 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <LeadsFilter />
                <LeadsStatusFilter currentStatus={statusFilter} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="font-medium">{data.length} results</span>
            </div>
        </div>

        <div className="bg-card/40 rounded-2xl border border-primary/10 backdrop-blur-sm overflow-hidden border-2">
            <DataTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
