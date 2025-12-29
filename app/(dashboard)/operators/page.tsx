import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShieldCheck, Zap, User } from "lucide-react";
import { OperatorCard, GroupedOperator, ManagedActor } from "@/components/dashboard/OperatorCard";
import { getCachedActorsWithStats, getCachedOperators, ActorWithStats, OperatorBasic } from "@/lib/data";
import { cookies } from "next/headers";
import { ActorsToolbar } from "@/components/actors/actors-toolbar";

interface PageProps {
    searchParams: Promise<{ 
        q?: string;
        statuses?: string;
        operators?: string;
        handles?: string;
    }>;
}

export default async function OperatorsPage({ searchParams }: PageProps) {
  const session = await auth();
  const params_data = await searchParams;
  const cookieStore = await cookies();

  // Load Display Preferences (Using same key as actors for consistency or separate?)
  // Let's use separate cookie for operators display prefs
  const prefsCookie = cookieStore.get("operator_display_prefs")?.value;
  const displayPrefs = prefsCookie ? JSON.parse(prefsCookie) : {
      metric1: "DMS",
      range1: "All Time",
      metric2: "TARGETS",
      range2: "All Time"
  };

  const selectedStatuses = params_data.statuses?.split(",").filter(Boolean);
  const selectedOperators = params_data.operators?.split(",").filter(Boolean);
  const selectedHandles = params_data.handles?.split(",").filter(Boolean);
  const query = params_data.q || "";

  const [allActors, operatorsList] = await Promise.all([
    getCachedActorsWithStats({
        range1: displayPrefs.range1,
        range2: displayPrefs.range2
    }),
    getCachedOperators() as Promise<OperatorBasic[]>
  ]);

  // Grouping Logic: Inverse of Actors (Group by Operator)
  const groupedMap = new Map<string, GroupedOperator>();

  allActors.forEach((raw: ActorWithStats) => {
      const opKey = raw.OPR_NAME.toLowerCase();
      const existing = groupedMap.get(opKey);
      
      const managedActor: ManagedActor = {
          ACT_ID: raw.ACT_ID,
          ACT_USERNAME: raw.ACT_USERNAME,
          ACT_STATUS: raw.ACT_STATUS,
          P1_DMS: raw.P1_DMS,
          P1_TARGETS: raw.P1_TARGETS,
          P1_REPLIES: raw.P1_REPLIES,
          P1_WARM: raw.P1_WARM,
          P1_BOOKED: raw.P1_BOOKED,
          P1_PAID: raw.P1_PAID,
          P2_DMS: raw.P2_DMS,
          P2_TARGETS: raw.P2_TARGETS,
          P2_REPLIES: raw.P2_REPLIES,
          P2_WARM: raw.P2_WARM,
          P2_BOOKED: raw.P2_BOOKED,
          P2_PAID: raw.P2_PAID
      };

      const metric2Key = `P2_${displayPrefs.metric2}` as keyof ManagedActor;
      const currentMetricValue = Number(managedActor[metric2Key]);

      if (existing) {
          existing.MANAGED_ACTORS.push(managedActor);
          
          // Accumulate totals for Range 1
          existing.TOTAL_P1_DMS = (Number(existing.TOTAL_P1_DMS) + Number(raw.P1_DMS)).toString();
          existing.TOTAL_P1_TARGETS = (Number(existing.TOTAL_P1_TARGETS) + Number(raw.P1_TARGETS)).toString();
          existing.TOTAL_P1_REPLIES = (Number(existing.TOTAL_P1_REPLIES) + Number(raw.P1_REPLIES)).toString();
          existing.TOTAL_P1_WARM = (Number(existing.TOTAL_P1_WARM) + Number(raw.P1_WARM)).toString();
          existing.TOTAL_P1_BOOKED = (Number(existing.TOTAL_P1_BOOKED) + Number(raw.P1_BOOKED)).toString();
          existing.TOTAL_P1_PAID = (Number(existing.TOTAL_P1_PAID) + Number(raw.P1_PAID)).toString();

          // Accumulate totals for Range 2
          existing.TOTAL_P2_DMS = (Number(existing.TOTAL_P2_DMS) + Number(raw.P2_DMS)).toString();
          existing.TOTAL_P2_TARGETS = (Number(existing.TOTAL_P2_TARGETS) + Number(raw.P2_TARGETS)).toString();
          existing.TOTAL_P2_REPLIES = (Number(existing.TOTAL_P2_REPLIES) + Number(raw.P2_REPLIES)).toString();
          existing.TOTAL_P2_WARM = (Number(existing.TOTAL_P2_WARM) + Number(raw.P2_WARM)).toString();
          existing.TOTAL_P2_BOOKED = (Number(existing.TOTAL_P2_BOOKED) + Number(raw.P2_BOOKED)).toString();
          existing.TOTAL_P2_PAID = (Number(existing.TOTAL_P2_PAID) + Number(raw.P2_PAID)).toString();

          // Update TOP_ACTOR based on selected metric2 in Range 2
          if (currentMetricValue > Number(existing.TOP_ACTOR.VALUE)) {
              existing.TOP_ACTOR = { 
                  USERNAME: managedActor.ACT_USERNAME, 
                  VALUE: currentMetricValue.toString() 
              };
          }
      } else {
          // Find operator metadata
          const opMeta = operatorsList.find(o => o.OPR_NAME.toLowerCase() === opKey);
          
          groupedMap.set(opKey, {
              OPR_ID: opMeta?.OPR_ID || 'N/A',
              OPR_NAME: raw.OPR_NAME,
              OPR_EMAIL: opMeta?.OPR_EMAIL || 'N/A',
              OPR_STATUS: opMeta?.OPR_STATUS || 'offline',
              TOTAL_P1_DMS: raw.P1_DMS,
              TOTAL_P1_TARGETS: raw.P1_TARGETS,
              TOTAL_P1_REPLIES: raw.P1_REPLIES,
              TOTAL_P1_WARM: raw.P1_WARM,
              TOTAL_P1_BOOKED: raw.P1_BOOKED,
              TOTAL_P1_PAID: raw.P1_PAID,
              TOTAL_P2_DMS: raw.P2_DMS,
              TOTAL_P2_TARGETS: raw.P2_TARGETS,
              TOTAL_P2_REPLIES: raw.P2_REPLIES,
              TOTAL_P2_WARM: raw.P2_WARM,
              TOTAL_P2_BOOKED: raw.P2_BOOKED,
              TOTAL_P2_PAID: raw.P2_PAID,
              MANAGED_ACTORS: [managedActor],
              TOP_ACTOR: { 
                  USERNAME: managedActor.ACT_USERNAME, 
                  VALUE: currentMetricValue.toString()
              }
          });
      }
  });

  const groupedOperators = Array.from(groupedMap.values());

  // Apply Filters
  const filteredOperators = groupedOperators.filter(op => {
      const matchesQuery = !query || 
          op.OPR_NAME.toLowerCase().includes(query.toLowerCase()) ||
          op.MANAGED_ACTORS.some(a => a.ACT_USERNAME.toLowerCase().includes(query.toLowerCase()));

      const matchesOperator = !selectedOperators || selectedOperators.length === 0 ||
          selectedOperators.includes(op.OPR_NAME);

      const matchesStatus = !selectedStatuses || selectedStatuses.length === 0 ||
          op.MANAGED_ACTORS.some(a => selectedStatuses.includes(a.ACT_STATUS));

      const matchesHandle = !selectedHandles || selectedHandles.length === 0 ||
          op.MANAGED_ACTORS.some(a => selectedHandles.includes(a.ACT_USERNAME));

      return matchesQuery && matchesOperator && matchesStatus && matchesHandle;
  });

  const uniqueHandles = Array.from(new Set(allActors.map(a => a.ACT_USERNAME)));

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Human Intelligence
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Operator Fleet</h1>
            <p className="text-muted-foreground text-sm max-w-md">
                Monitor performance distribution across your team members.
            </p>
        </div>
      </div>

      <ActorsToolbar 
        operators={operatorsList
            .map(o => ({ 
                label: o.OPR_NAME === session?.user?.operator_name ? `${o.OPR_NAME} (you)` : o.OPR_NAME, 
                value: o.OPR_NAME 
            }))
            .sort((a, b) => {
                if (a.label.endsWith('(you)')) return -1;
                if (b.label.endsWith('(you)')) return 1;
                return 0;
            })
        }
        handles={uniqueHandles.map(h => ({ label: h, value: h }))}
        initialPrefs={{...displayPrefs, endpoint: '/api/prefs/operators'}}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-2">
                {filteredOperators.map((op) => (
                    <OperatorCard 
                        key={op.OPR_ID} 
                        operator={op} 
                        displayPrefs={displayPrefs}
                    />
                ))}
                {filteredOperators.length === 0 && (
                    <Card className="col-span-2 border-dashed border-primary/20 bg-primary/5 p-10 flex flex-col items-center justify-center text-center gap-4">
                        <User className="h-10 w-10 text-muted-foreground opacity-20" />
                        <div>
                            <p className="text-sm font-bold">No matching operators found</p>
                            <p className="text-xs text-muted-foreground">Try adjusting your filters or clearing search.</p>
                        </div>
                    </Card>
                )}
            </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">Team Overview</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-background border border-primary/10 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Operators</p>
                        <p className="text-2xl font-semibold">{filteredOperators.filter(o => o.OPR_STATUS === 'online').length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-primary/10 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Team Volume ({displayPrefs.range1})</p>
                        <p className="text-2xl font-semibold text-primary">
                            {filteredOperators.reduce((acc, curr) => acc + Number(curr.TOTAL_P1_DMS), 0)}
                        </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic px-1">
                        Operators managing multiple accounts show aggregated performance stats.
                    </p>
                </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">Human Pulse</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-3 text-xs">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="font-medium">All operators are performing within safe limits.</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
