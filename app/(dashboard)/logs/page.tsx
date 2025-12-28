import { auth } from "@/auth";
import { getPagedLogs } from "@/lib/data";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LogsScopeFilter } from "@/components/logs/logs-scope-filter";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function LogsPage(props: {
  searchParams: SearchParams
}) {
  const session = await auth();
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;

  // Determine filters based on scope
  const scope = typeof searchParams.scope === 'string' ? searchParams.scope : 'operator';
  const actorParam = typeof searchParams.actor === 'string' ? searchParams.actor : undefined;
  
  let operatorFilter: string | undefined = undefined;
  let actorFilter: string | undefined = undefined;

  if (scope === 'operator') {
    operatorFilter = session?.user?.operator_name;
  } else if (scope === 'actor' && actorParam) {
    actorFilter = actorParam;
  }
  // if scope === 'all', filters remain undefined

  const { data: logs, metadata } = await getPagedLogs(
    page,
    pageSize,
    {
      operatorName: operatorFilter,
      actorUsername: actorFilter
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
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                    <CardTitle className="text-base">Real-time Stream</CardTitle>
                    <CardDescription className="text-[10px]">
                        Page {metadata.page} of {metadata.pageCount} • {metadata.total} total events
                    </CardDescription>
                </div>
            </div>
            
            <LogsScopeFilter operatorName={session?.user?.operator_name} />
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