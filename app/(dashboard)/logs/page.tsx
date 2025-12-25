import { DataTable } from "@/components/ui/data-table";
import { columns, OutreachLog } from "./columns";
import { dbQuery, dbQueryCached } from "@/lib/db";
import { MessageSquare, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeadsFilter } from "@/components/leads/leads-filter";

async function getLogs(query?: string): Promise<OutreachLog[]> {
  try {
      const sql = `
        SELECT l.LOG_ID, l.TARGET_USERNAME, l.ACTOR_USERNAME, l.MESSAGE_TEXT, l.CREATED_AT, a.OWNER_OPERATOR
        FROM OUTREACH_LOGS l
        LEFT JOIN ACTORS a ON l.ACTOR_USERNAME = a.USERNAME
        ${query ? "WHERE LOWER(l.TARGET_USERNAME) LIKE :q OR LOWER(l.ACTOR_USERNAME) LIKE :q OR LOWER(l.MESSAGE_TEXT) LIKE :q" : ""}
        ORDER BY l.CREATED_AT DESC
      `;
      const params = query ? { q: `%${query.toLowerCase()}%` } : {};

      // Use cached query for initial load (no search), regular query for searches
      const rows = query
          ? await dbQuery<any>(sql, params)
          : await dbQueryCached<any>(sql, {}, 'logs:all');

      return rows.map(r => ({
          log_id: r.LOG_ID,
          target_username: r.TARGET_USERNAME,
          actor_username: r.ACTOR_USERNAME,
          message_text: r.MESSAGE_TEXT,
          created_at: r.CREATED_AT,
          operator_name: r.OWNER_OPERATOR
      }));
  } catch (e) {
      console.error("DB Fetch Error (Logs):", e);
      return [];
  }
}

export default async function LogsPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q || "";
  const data = await getLogs(query);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary/80 text-xs font-medium tracking-wide">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Audit Trail</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground text-sm">
                A complete history of all direct messages sent by the team.
            </p>
        </div>

        <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="bg-card/40 border-primary/10 gap-2">
                <Download className="h-4 w-4" /> Export Logs
             </Button>
        </div>
      </div>

      {/* Filter & Table Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 p-4 rounded-2xl border border-primary/10 backdrop-blur-sm">
            <LeadsFilter /> {/* This works for logs too as it just sets the 'q' param */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-2 opacity-60 hover:opacity-100">
                    <Filter className="h-3 w-3" /> Filter by Actor
                </Button>
            </div>
        </div>
        
        <div className="bg-card/40 rounded-2xl border border-primary/10 backdrop-blur-sm overflow-hidden border-2">
            <DataTable columns={columns} data={data} />
        </div>
      </div>
    </div>
  );
}
