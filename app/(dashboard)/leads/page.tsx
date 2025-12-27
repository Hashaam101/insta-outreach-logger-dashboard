import { auth } from "@/auth";
import { dbQuery } from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { columns, Lead } from "./columns";
import { LeadsFilter } from "@/components/leads/leads-filter";
import { 
  Users, 
  Search, 
  Download, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeadsStatusFilter } from "@/components/leads/leads-status-filter";

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const session = await auth();
  const params_data = await searchParams;
  const query = params_data.q || "";
  const statusFilter = params_data.status || "All";

  // Build dynamic query
  const whereConditions = ["1=1"];
  const queryParams: Record<string, string> = {};

  if (query) {
    whereConditions.push("(LOWER(target_username) LIKE :q)");
    queryParams.q = `%${query.toLowerCase()}%`;
  }

  if (statusFilter !== "All") {
    whereConditions.push("status = :status");
    queryParams.status = statusFilter;
  }

  const leads = await dbQuery<Lead>(
    `SELECT target_username, status, TO_CHAR(last_updated, 'YYYY-MM-DD HH24:MI:SS') as last_updated, email, phone_number, source_summary 
     FROM prospects 
     WHERE ${whereConditions.join(" AND ")}
     ORDER BY last_updated DESC`,
    queryParams
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Users className="h-3 w-3" />
                Relationship Manager
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Leads Explorer</h1>
            <p className="text-muted-foreground text-sm max-w-md">
                A master repository of every prospect discovered by the distributed agents.
            </p>
        </div>
        
        <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="bg-card/40 border-primary/10 hover:bg-primary/5 gap-2 rounded-xl">
                <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export CSV</span>
            </Button>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Filters */}
        <div className="lg:col-span-12 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
                <LeadsFilter />
            </div>
            <div className="w-full md:w-64">
                <LeadsStatusFilter />
            </div>
        </div>

        {/* Main Table */}
        <Card className="lg:col-span-12 border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-primary" />
                <div>
                    <CardTitle className="text-base">Target Database</CardTitle>
                    <CardDescription className="text-[10px]">
                        {leads.length} prospects matching your current filters
                    </CardDescription>
                </div>
            </div>
            {session?.user?.operator_name && (
                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-bold border border-primary/20">
                    OPERATOR: {session.user.operator_name}
                </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
                columns={columns} 
                data={leads} 
                pageSize={15}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}