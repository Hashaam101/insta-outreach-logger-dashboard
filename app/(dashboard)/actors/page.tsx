import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, ShieldCheck, Zap } from "lucide-react";
import { ActorCard, GroupedActor, ActorAssignment } from "@/components/dashboard/ActorCard";
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

export default async function ActorsPage({ searchParams }: PageProps) {
  const session = await auth();
  const params_data = await searchParams;
  const cookieStore = await cookies();

  // Load Display Preferences
  const prefsCookie = cookieStore.get("actor_display_prefs")?.value;
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

  const [allActors, operators] = await Promise.all([
    getCachedActorsWithStats({
        range1: displayPrefs.range1,
        range2: displayPrefs.range2
    }),
    getCachedOperators() as Promise<OperatorBasic[]>
  ]);

  // Grouping Logic (Deduplicate shared actors)
  const groupedMap = new Map<string, GroupedActor>();

  allActors.forEach((raw: ActorWithStats) => {
      const handleKey = raw.ACT_USERNAME.toLowerCase();
      const existing = groupedMap.get(handleKey);
      
      const assignment: ActorAssignment = {
          ACT_ID: raw.ACT_ID,
          OPR_ID: raw.OPR_ID,
          OPR_NAME: raw.OPR_NAME,
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

      const metric2Key = `P2_${displayPrefs.metric2}` as keyof ActorAssignment;
      const currentMetricValue = Number(assignment[metric2Key]);

      if (existing) {
          existing.ASSIGNMENTS.push(assignment);
          // Update TOP_OPERATOR based on selected metric2 in Range 2
          if (currentMetricValue > Number(existing.TOP_OPERATOR.VALUE)) {
              existing.TOP_OPERATOR = { 
                  NAME: assignment.OPR_NAME, 
                  VALUE: currentMetricValue.toString() 
              };
          }
      } else {
          groupedMap.set(raw.ACT_USERNAME, {
              ACT_USERNAME: raw.ACT_USERNAME,
              F1_DMS: raw.F1_DMS,
              F1_TARGETS: raw.F1_TARGETS,
              F1_REPLIES: raw.F1_REPLIES,
              F1_WARM: raw.F1_WARM,
              F1_BOOKED: raw.F1_BOOKED,
              F1_PAID: raw.F1_PAID,
              F2_DMS: raw.F2_DMS,
              F2_TARGETS: raw.F2_TARGETS,
              F2_REPLIES: raw.F2_REPLIES,
              F2_WARM: raw.F2_WARM,
              F2_BOOKED: raw.F2_BOOKED,
              F2_PAID: raw.F2_PAID,
              ASSIGNMENTS: [assignment],
              TOP_OPERATOR: { 
                  NAME: assignment.OPR_NAME, 
                  VALUE: currentMetricValue.toString()
              }
          });
      }
  });

  const groupedActors = Array.from(groupedMap.values());

  // Apply Filters to grouped list
  const filteredGrouped = groupedActors.filter(actor => {
      const matchesQuery = !query || 
          actor.ACT_USERNAME.toLowerCase().includes(query.toLowerCase()) ||
          actor.ASSIGNMENTS.some(as => as.OPR_NAME.toLowerCase().includes(query.toLowerCase()));

      const matchesOperator = !selectedOperators || selectedOperators.length === 0 ||
          actor.ASSIGNMENTS.some(as => selectedOperators.includes(as.OPR_NAME));

      const matchesStatus = !selectedStatuses || selectedStatuses.length === 0 ||
          actor.ASSIGNMENTS.some(as => selectedStatuses.includes(as.ACT_STATUS));

      const matchesHandle = !selectedHandles || selectedHandles.length === 0 ||
          selectedHandles.includes(actor.ACT_USERNAME);

      return matchesQuery && matchesOperator && matchesStatus && matchesHandle;
  });

  const uniqueHandles = Array.from(new Set(allActors.map(a => a.ACT_USERNAME)));

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
      </div>

      <ActorsToolbar 
        operators={operators
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
        initialPrefs={displayPrefs}
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-8">
            <div className="grid gap-4 md:grid-cols-2">
                {filteredGrouped.map((actor) => (
                    <ActorCard 
                        key={actor.ACT_USERNAME} 
                        actor={actor} 
                        operators={operators} 
                        displayPrefs={displayPrefs}
                    />
                ))}
                {filteredGrouped.length === 0 && (
                    <Card className="col-span-2 border-dashed border-primary/20 bg-primary/5 p-10 flex flex-col items-center justify-center text-center gap-4">
                        <Instagram className="h-10 w-10 text-muted-foreground opacity-20" />
                        <div>
                            <p className="text-sm font-bold">No matching actors found</p>
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
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">Fleet Security</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="p-4 rounded-xl bg-background border border-primary/10 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Unique Accounts</p>
                        <p className="text-2xl font-semibold">{filteredGrouped.length}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-background border border-primary/10 space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Volume ({displayPrefs.range1})</p>
                        <p className="text-2xl font-semibold text-primary">
                            {filteredGrouped.reduce((acc, curr) => acc + Number(curr.F1_DMS), 0)}
                        </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic px-1">
                        Fleet assets with multiple operators show aggregated performance stats.
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
