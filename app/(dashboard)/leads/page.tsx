import { auth } from "@/auth";
import { getPagedLeads, getCachedOperators, getCachedActors } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { LeadsToolbar } from "@/components/leads/leads-toolbar";
import { 
  Users, 
  Download, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PageProps {
  searchParams: Promise<{ 
    q?: string; 
    statuses?: string;
    operators?: string;
    actors?: string;
    page?: string 
  }>;
}

export default async function LeadsPage({ searchParams }: PageProps) {
  const session = await auth();
  const params_data = await searchParams;
  
  const query = params_data.q || "";
  const page = Number(params_data.page) || 1;
  const pageSize = 15;

  const statuses = params_data.statuses?.split(",").filter(Boolean);
  const operators = params_data.operators?.split(",").filter(Boolean);
  const actors = params_data.actors?.split(",").filter(Boolean);

  // Default to session operator only if NO filters are applied?
  // User requested "choose which...". 
  // If I default to "me", the user sees only their leads initially.
  // If they use the filter, they can expand scope.
  // BUT: "operators" filter overrides default "my leads" view.
  // If no operator filter is set, should we show ALL or just MINE?
  // Current behavior was "MINE".
  // New behavior: "Command Center" implies broader view, but usually defaults to "My View".
  // However, the filter component allows selecting operators.
  // Strategy: 
  // 1. If 'operators' filter is present, use it.
  // 2. If 'actors' filter is present, use it.
  // 3. If NEITHER, default to session.user.operator_name to keep "My View" as landing state.
  // UNLESS the user explicitly clears filters (Reset). But Reset clears URL params.
  // Let's stick to: If NO filters, show MY leads.
  
  const effectiveOperators = (operators && operators.length > 0) 
    ? operators 
    : (actors && actors.length > 0) ? undefined : [session?.user?.operator_name || ""];

  // Fetch data for filters
  const [opsList, actsList] = await Promise.all([
    getCachedOperators(),
    getCachedActors()
  ]);

  const { data: leads, metadata } = await getPagedLeads(
    page, 
    pageSize, 
    {
        query,
        statuses: statuses,
        operators: effectiveOperators,
        actors: actors
    }
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

      <div className="grid gap-6 grid-cols-1">
        {/* Toolbar */}
        <LeadsToolbar 
            operators={opsList.map(o => ({ label: o.OPR_NAME, value: o.OPR_NAME }))}
            actors={actsList.map(a => ({ label: a.ACT_USERNAME, value: a.ACT_USERNAME }))}
        />

        {/* Main Table */}
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between py-4">
            <div className="flex items-center gap-4">
                <div className="flex flex-col">
                    <CardTitle className="text-base">Target Database</CardTitle>
                    <CardDescription className="text-[10px]">
                        Page {metadata.page} of {metadata.pageCount} • {metadata.total} prospects found
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
                columns={columns} 
                data={leads} 
                pageSize={pageSize}
                enableServerPagination={true}
                pageCount={metadata.pageCount}
                currentPage={metadata.page}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
