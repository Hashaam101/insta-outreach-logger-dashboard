import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { dbQuery } from "@/lib/db";
import { Instagram, Shield, User, Landmark } from "lucide-react";
import { ActorCard } from "@/components/dashboard/ActorCard";
import { GoalsDashboard } from "@/components/governance/goals-dashboard";
import { getGoalsDashboardData, getRecentGoalChanges } from "@/app/actions/governance";

interface Actor {
    USERNAME: string;
    OWNER_OPERATOR: string;
    STATUS: string;
}

interface Operator {
    OPERATOR_NAME: string;
}

async function getTeamData() {
    try {
        const actors = await dbQuery<Actor>(`SELECT username, owner_operator, status FROM ACTORS`);
        const operators = await dbQuery<Operator>(`SELECT operator_name FROM OPERATORS`);
        return { actors, operators };
    } catch {
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
      <GoalsDashboard initialGoals={goalsData || []} recentLogs={recentLogs || []} />

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
              <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold text-sm">
                  {session?.user?.operator_name || "Unassigned"}
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
            <div className="flex flex-wrap gap-2">
                {operators.map((op) => (
                    <Badge key={op.OPERATOR_NAME} variant="outline" className="bg-background/50 border-primary/10 py-1.5 px-4 text-xs font-medium">
                        {op.OPERATOR_NAME}
                    </Badge>
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
                    <ActorCard key={actor.USERNAME} actor={actor} operators={operators} />
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}