import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dbQuery } from "@/lib/db";
import { Instagram, Shield, User } from "lucide-react";

async function getTeamData() {
    try {
        const actors = await dbQuery(`SELECT username, owner_operator, status FROM ACTORS`);
        const operators = await dbQuery(`SELECT operator_name FROM OPERATORS`);
        return { actors, operators };
    } catch (e) {
        return { actors: [], operators: [] };
    }
}

export default async function SettingsPage() {
  const session = await auth();
  const { actors, operators } = await getTeamData();

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings & Management</h1>
        <p className="text-muted-foreground">Manage your account and view team resources.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Your Profile
            </CardTitle>
            <CardDescription>Your authenticated identity within the ecosystem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Email Address</Label>
              <div className="p-2.5 rounded-lg bg-background border border-primary/10 text-sm font-medium">
                  {session?.user?.email}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground">Operator ID</Label>
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-primary font-bold text-sm">
                  {session?.user?.operator_name || "Unassigned"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Team Directory
            </CardTitle>
            <CardDescription>All registered operators in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
                {operators.map((op: any) => (
                    <Badge key={op.OPERATOR_NAME} variant="outline" className="bg-background/50 border-primary/10 py-1 px-3">
                        {op.OPERATOR_NAME}
                    </Badge>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-primary/10 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Instagram className="h-5 w-5 text-primary" />
                Instagram Actors
            </CardTitle>
            <CardDescription>Instagram accounts actively logging outreach data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
                {actors.map((actor: any) => (
                    <div key={actor.USERNAME} className="p-4 rounded-xl bg-background border border-primary/10 flex flex-col gap-2">
                        <div className="flex justify-between items-start">
                            <span className="font-bold text-sm">@{actor.USERNAME}</span>
                            <Badge variant="outline" className={actor.STATUS === 'ACTIVE' ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                                {actor.STATUS}
                            </Badge>
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Owner: <span className="text-foreground/80 font-medium">{actor.OWNER_OPERATOR}</span>
                        </div>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}