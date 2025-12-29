import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Instagram, User, Landmark, Globe } from "lucide-react";
import { ActorCard, GroupedActor, ActorAssignment } from "@/components/dashboard/ActorCard";
import { IdTag } from "@/components/ui/id-tag";
import { getCachedActorsWithStats, getCachedOperators, ActorWithStats, OperatorBasic } from "@/lib/data";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";

export default async function GlobalSettingsPage() {
  const cookieStore = await cookies();

  // Load Display Preferences
  const prefsCookie = cookieStore.get("actor_display_prefs")?.value;
  const displayPrefs = prefsCookie ? JSON.parse(prefsCookie) : {
      metric1: "DMS",
      range1: "All Time",
      metric2: "TARGETS",
      range2: "All Time"
  };

  const [allActors, operators] = await Promise.all([
    getCachedActorsWithStats({
        range1: displayPrefs.range1,
        range2: displayPrefs.range2
    }),
    getCachedOperators() as Promise<OperatorBasic[]>
  ]) as [ActorWithStats[], OperatorBasic[]];

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
          // Update TOP_OPERATOR based on selected metric2
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

  return (
    <div className="flex flex-col gap-10 pb-10">
      <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              <Landmark className="h-3 w-3" />
              Team Governance
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">System Global Settings</h1>
          <p className="text-muted-foreground text-sm max-w-md">
              High-level overview of team assets and system-wide configurations.
          </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Team Directory */}
        <Card className="md:col-span-4 border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
                <User className="h-4 w-4 text-primary" />
                Team Directory
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Registered Operators</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
                {operators.map((op) => (
                    <div key={op.OPR_ID} className="flex items-center justify-between p-3 rounded-xl bg-background border border-primary/5 hover:border-primary/10 transition-colors">
                        <span className="text-xs font-bold">{op.OPR_NAME}</span>
                        <IdTag id={op.OPR_ID} />
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Global Overview Section */}
        <div className="md:col-span-8 grid gap-6 grid-cols-1">
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Globe className="h-4 w-4 text-primary" /> System Health
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                            <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Fleet Sync</p>
                            <p className="text-xl font-bold text-primary">Active</p>
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                            <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Database</p>
                            <p className="text-xl font-bold text-primary">Healthy</p>
                        </div>
                        <div className="flex-1 p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                            <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Governance</p>
                            <p className="text-xl font-bold text-primary">Active</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base font-bold">Instagram Actors</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-bold uppercase border-primary/10 bg-primary/5">
                        {groupedActors.length} Unique Handles
                    </Badge>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {groupedActors.map((actor) => (
                            <ActorCard 
                                key={actor.ACT_USERNAME} 
                                actor={actor} 
                                operators={operators} 
                                displayPrefs={displayPrefs}
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
