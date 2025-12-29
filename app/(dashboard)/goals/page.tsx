import { getGoalsDashboardData, getRulesDashboardData } from "@/app/actions/governance";
import { GoalsDashboard } from "@/components/governance/goals-dashboard";
import { RulesDashboard } from "@/components/governance/rules-dashboard";
import { Target, ShieldCheck, Trophy, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AuditLogEntry {
    id: string;
    type: string;
    details: string;
    timestamp: string;
}

export default async function GoalsPage() {
  // Fetch initial data
  const [goalsData, rulesData, opsList, actsList] = await Promise.all([
    getGoalsDashboardData(),
    getRulesDashboardData(),
    getCachedOperators(),
    getCachedActors()
  ]);

  const operators = opsList.map(o => ({ id: o.OPR_ID, name: o.OPR_NAME }));
  const actors = actsList.map(a => ({ id: a.ACT_ID, handle: a.ACT_USERNAME }));

  // For now, recentLogs can be fetched or left empty if not implemented
  const recentLogs: AuditLogEntry[] = []; 

  return (
    <div className="space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <Target className="h-3 w-3" />
                Performance Governance
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Strategic Goals</h1>
            <p className="text-muted-foreground text-sm max-w-md">
                Set and manage democratic performance targets and operational limits for the entire fleet.
            </p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Governance Status</p>
                    <p className="text-xs font-bold text-primary">Democratic Control Active</p>
                </div>
            </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
          {/* Main Goals Interface */}
          <div className="lg:col-span-8">
            <GoalsDashboard 
                initialGoals={goalsData || []} 
                recentLogs={recentLogs} 
                operators={operators}
                actors={actors}
            />
          </div>

          {/* Safety Rules Sidebar */}
          <div className="lg:col-span-4">
            <RulesDashboard 
                initialRules={rulesData || []} 
                operators={operators}
                actors={actors}
            />
          </div>

          {/* Contextual Information */}
          <div className="lg:col-span-12 grid gap-6 md:grid-cols-2">
              <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                      <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">Incentive Structure</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                          The system uses a <strong>Weighted Performance Score</strong>. Reaching Team Goals grants global multipliers to all active operators, incentivizing collective success.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Team Multiplier</p>
                              <p className="text-lg font-bold text-primary">1.2x</p>
                          </div>
                          <div className="p-3 rounded-xl bg-background border border-primary/5">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Status</p>
                              <p className="text-lg font-bold">Base</p>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                  <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                      <div className="flex items-center gap-2">
                          <Info className="h-4 w-4 text-primary" />
                          <CardTitle className="text-sm">Operational Protocol</CardTitle>
                      </div>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-4">
                      <div className="space-y-3">
                          <div className="flex items-start gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <p className="text-[11px] text-muted-foreground"><strong>Team Goals:</strong> Suggested by any operator. Becomes active upon collective review.</p>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <p className="text-[11px] text-muted-foreground"><strong>Personal Limits:</strong> Can be set individually but cannot exceed the hard Safety Rules.</p>
                          </div>
                          <div className="flex items-start gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                              <p className="text-[11px] text-muted-foreground"><strong>Safety Rules:</strong> Hard-coded protocol to prevent platform suspension.</p>
                          </div>
                      </div>
                  </CardContent>
              </Card>
          </div>
      </div>
    </div>
  );
}