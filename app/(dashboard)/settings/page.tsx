import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Instagram, Shield, User, Landmark } from "lucide-react";
import { ActorCard } from "@/components/dashboard/ActorCard";
import { GoalsDashboard } from "@/components/governance/goals-dashboard";
import { getGoalsDashboardData } from "@/app/actions/governance";
import { IdTag } from "@/components/ui/id-tag";
import { getCachedActorsWithStats, getCachedOperators, ActorWithStats, OperatorBasic } from "@/lib/data";

export default async function SettingsPage() {
  const session = await auth();

  // Use cached functions instead of direct DB queries
  const actors = await getCachedActorsWithStats() as ActorWithStats[];
  const operators = await getCachedOperators() as OperatorBasic[];
  const goalsData = await getGoalsDashboardData();
  
  const recentLogs: any[] = []; 

  // Find my ID
  const myOp = operators.find(o => o.OPR_NAME === session?.user?.operator_name);

  return (
    <div className="flex flex-col gap-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Landmark className="h-3 w-3" />
                Team Governance
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground text-sm max-w-md">
                Manage your identity, transfer assets, and set performance targets.
            </p>
        </div>
      </div>

      {/* 1. Governance & Goals */}
      <GoalsDashboard initialGoals={goalsData || []} recentLogs={recentLogs} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. Identity Section */}
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Your Profile
            </CardTitle>
            <CardDescription>Your authenticated identity within the ecosystem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</Label>
              <div className="p-3 rounded-xl bg-background border border-primary/10 text-sm font-medium">
                  {session?.user?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Operator ID</Label>
              <div className="flex items-center gap-2">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold text-sm flex-1">
                      {session?.user?.operator_name || "Unassigned"}
                  </div>
                  {myOp && <IdTag id={myOp.OPR_ID} className="h-11" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Team Directory */}
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Team Directory
            </CardTitle>
            <CardDescription>All registered operators in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
                {operators.map((op) => (
                    <div key={op.OPR_ID} className="flex items-center justify-between p-2 rounded-lg bg-background/50 border border-primary/5">
                        <span className="text-xs font-medium">{op.OPR_NAME}</span>
                        <IdTag id={op.OPR_ID} />
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Instagram Actors Section */}
        <Card className="md:col-span-2 border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Instagram className="h-5 w-5 text-primary" />
                Instagram Actors
            </CardTitle>
            <CardDescription>Instagram accounts actively logging outreach data. Hover to see transfer options.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {actors.map((actor) => (
                    <ActorCard key={actor.ACT_ID} actor={actor} operators={operators} />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}