import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { dbQueryCached } from "@/lib/db";
import { Instagram, Shield, User, Landmark } from "lucide-react";
import { ActorCard } from "@/components/dashboard/ActorCard";
import { GoalsDashboard } from "@/components/governance/goals-dashboard";
import { getGoalsDashboardData, getRecentGoalChanges } from "@/app/actions/governance";

async function getTeamData() {
    try {
        const [actors, operators] = await Promise.all([
            dbQueryCached(`SELECT username, owner_operator, status FROM ACTORS`, {}, 'settings:actors'),
            dbQueryCached(`SELECT operator_name FROM OPERATORS`, {}, 'settings:operators')
        ]);
        return { actors, operators };
    } catch (e) {
        return { actors: [], operators: [] };
    }
}

export default async function SettingsPage() {
  const session = await auth();
  const { actors, operators } = await getTeamData();
  const goalsData = await getGoalsDashboardData();
  const recentLogs = await getRecentGoalChanges();

  return (
    <div className="flex flex-col gap-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary/80 text-xs font-medium tracking-wide">
                <Landmark className="h-3.5 w-3.5" />
                <span>Team Governance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Global Settings</h1>
            <p className="text-muted-foreground text-sm">
                Manage your identity, transfer assets, and set performance targets.
            </p>
        </div>
      </div>

      {/* 1. Governance & Goals */}
      <GoalsDashboard initialGoals={goalsData as any} recentLogs={recentLogs as any} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* 2. Identity Section */}
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl border-2">
          <CardHeader className="border-b border-primary/5">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
                    <CardDescription className="text-xs">Your authenticated identity</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</Label>
              <div className="p-3 rounded-xl bg-background border border-primary/10 text-sm font-medium">
                  {session?.user?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Operator ID</Label>
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold text-sm">
                  {session?.user?.operator_name || "Unassigned"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Team Directory */}
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl border-2">
          <CardHeader className="border-b border-primary/5">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-sm font-medium">Team Directory</CardTitle>
                    <CardDescription className="text-xs">All registered operators</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-wrap gap-2">
                {operators.map((op: any) => (
                    <Badge key={op.OPERATOR_NAME} variant="outline" className="bg-background/50 border-primary/10 py-1.5 px-4 text-xs font-medium">
                        {op.OPERATOR_NAME}
                    </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Instagram Actors Section */}
        <Card className="md:col-span-2 border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl border-2">
          <CardHeader className="border-b border-primary/5">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Instagram className="h-4 w-4 text-primary" />
                </div>
                <div>
                    <CardTitle className="text-sm font-medium">Instagram Actors</CardTitle>
                    <CardDescription className="text-xs">Accounts logging outreach data. Hover to transfer.</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {actors.map((actor: any) => (
                    <ActorCard key={actor.USERNAME} actor={actor} operators={operators as any} />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
