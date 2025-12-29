import { getPagedLogs, getCachedOperators, getCachedActors } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogsToolbar } from "@/components/logs/logs-toolbar";

interface PageProps {
  searchParams: Promise<{ 
      q?: string;
      operators?: string;
      actors?: string;
      page?: string;
      types?: string;
      timeRange?: string;
  }>;
}

export default async function LogsPage({ searchParams }: PageProps) {
  const params_data = await searchParams;
  const page = Number(params_data.page) || 1;
  const pageSize = 20;

  const query = params_data.q || "";
  const selectedOperators = params_data.operators?.split(",").filter(Boolean);
  const selectedActors = params_data.actors?.split(",").filter(Boolean);
  const selectedTypes = params_data.types?.split(",").filter(Boolean);
  const timeRange = params_data.timeRange || "All Time";

  // User requested: If no filters, show ALL.
  const effectiveOperators = (selectedOperators && selectedOperators.length > 0) ? selectedOperators : undefined;

  // Fetch lists for filters
  const [opsList, actsList] = await Promise.all([
    getCachedOperators(),
    getCachedActors()
  ]);

  // Dedup lists for filters
  const uniqueOperators = Array.from(new Set(opsList.map(o => o.OPR_NAME))).sort();
  const uniqueActors = Array.from(new Set(actsList.map(a => a.ACT_USERNAME))).sort();

  const { data: logs, metadata } = await getPagedLogs(
    page,
    pageSize,
    {
      operatorNames: effectiveOperators,
      actorUsernames: selectedActors,
      eventTypes: selectedTypes,
      query: query,
      timeRange: timeRange
    }
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Security & Audit
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground text-sm max-w-md">
                A granular trail of every message sent across the distributed fleet.
            </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <LogsToolbar 
            operators={uniqueOperators.map(o => ({ label: o, value: o }))}
            actors={uniqueActors.map(a => ({ label: a, value: a }))}
        />

        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                    <CardTitle className="text-base">Real-time Stream</CardTitle>
                    <CardDescription className="text-[10px]">
                        Page {metadata.page} of {metadata.pageCount} • {metadata.total} total events
                    </CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
                columns={columns} 
                data={logs} 
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
