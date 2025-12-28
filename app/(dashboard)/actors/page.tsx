import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, ShieldCheck, Zap } from "lucide-react";
import { ActorCard } from "@/components/dashboard/ActorCard";
import { ViewToggle } from "@/components/ui/view-toggle";
import { getCachedActorsWithStats, getCachedOperators, ActorWithStats, OperatorBasic } from "@/lib/data";
import { cookies } from "next/headers";

export default async function ActorsPage({
    searchParams,
}: {
    searchParams?: Promise<{ view?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const cookieStore = await cookies();

  // Priority: URL Param -> Cookie -> Default 'my'
  const view = params?.view || cookieStore.get("dashboard_view")?.value || "my";

  const currentOperator = session?.user?.operator_name || "";
  const filterByOperator = view === "my" ? currentOperator : undefined;

  // Sequential queries to avoid connection pool contention
  const actors = await getCachedActorsWithStats(filterByOperator) as ActorWithStats[];
  const operators = await getCachedOperators() as OperatorBasic[];

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Instagram className="h-3 w-3" />
                Asset Management
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Outreach Actors</h1>
            <p className="text-muted-foreground text-sm max-w-md">
                Manage and monitor Instagram accounts assigned to your team.
            </p>
        </div>
        <ViewToggle />
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-2">
                {actors.map((actor) => (
                    <ActorCard 
                        key={actor.ACT_ID} 
                        actor={actor} 
                        operators={operators} 
                    />
                ))}
                {actors.length === 0 && (
                    <Card className="col-span-2 border-dashed border-primary/20 bg-primary/5 p-10 flex flex-col items-center justify-center text-center gap-4">
                        <Instagram className="h-10 w-10 text-muted-foreground opacity-20" />
                        <div>
                            <p className="text-sm font-bold">No active actors found</p>
                            <p className="text-xs text-muted-foreground">Try switching to Team View or connecting a new account.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">Fleet Security</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-background border border-primary/10 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Accounts</p>
                        <p className="text-2xl font-semibold">{actors.filter((a) => a.ACT_STATUS === 'Active').length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-primary/10 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Volume (Filtered)</p>
                        <p className="text-2xl font-semibold text-primary">
                            {actors.reduce((acc: number, curr: ActorWithStats) => acc + Number(curr.TOTAL_DMS), 0)}
                        </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic px-1">
                        Actor status is updated in real-time by the distributed agents.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">Health Check</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium">All agents report normal operation.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}