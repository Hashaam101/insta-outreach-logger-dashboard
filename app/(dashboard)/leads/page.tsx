import { DataTable } from "@/components/ui/data-table";
import { columns, Lead } from "./columns";
import { LeadsFilter } from "@/components/leads/leads-filter";
import { dbQuery } from "@/lib/db";
import { 
    Users, 
    Filter, 
    Plus,
    FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";

async function getLeads(query?: string): Promise<Lead[]> {
  /*
  REAL DB Logic:
  */
  try {
      const sql = `
        SELECT target_username, status, owner_actor, notes, first_contacted, last_updated, email, phone_number, source_summary 
        FROM PROSPECTS 
        ${query ? "WHERE LOWER(target_username) LIKE :q OR LOWER(status) LIKE :q" : ""}
        ORDER BY last_updated DESC
      `;
      const params = query ? { q: `%${query.toLowerCase()}%` } : {};
      const rows = await dbQuery<any>(sql, params);
      
      return rows.map(r => ({
          target_username: r.TARGET_USERNAME,
          full_name: "", // We don't have full name in this table
          status: r.STATUS,
          last_updated: r.LAST_UPDATED,
          email: r.EMAIL,
          phone_number: r.PHONE_NUMBER,
          source: r.SOURCE_SUMMARY
      }));
  } catch (e) {
      console.error("DB Fetch Error:", e);
      return [];
  }
}

export default async function LeadsPage({
    searchParams,
}: {
    searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q || "";
  const data = await getLeads(query);

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Users className="h-3 w-3" />
                Data Management
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Leads Explorer</h1>
            <p className="text-muted-foreground text-sm">
                Search, filter and manage interactions with all your logged prospects.
            </p>
        </div>

        <div className="flex items-center gap-2">
             <Button variant="outline" size="sm" className="bg-card/40 border-primary/10 gap-2">
                <FileSpreadsheet className="h-4 w-4" /> CSV Export
             </Button>
             <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" /> Add Lead
             </Button>
        </div>
      </div>

      {/* Filter & Table Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/40 p-4 rounded-2xl border border-primary/10 backdrop-blur-sm">
            <LeadsFilter />
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-2 opacity-60 hover:opacity-100">
                    <Filter className="h-3 w-3" /> More Filters
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
