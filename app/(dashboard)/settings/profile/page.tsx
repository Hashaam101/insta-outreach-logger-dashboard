import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, User, MapPin, Mail, Calendar } from "lucide-react";
import { IdTag } from "@/components/ui/id-tag";
import { getCachedOperators, OperatorBasic } from "@/lib/data";

export default async function ProfileSettingsPage() {
  const session = await auth();
  const operators = await getCachedOperators() as OperatorBasic[];

  // Find my record
  const myOp = operators.find(o => o.OPR_NAME === session?.user?.operator_name);

  return (
    <div className="space-y-10 pb-10">
      <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              <User className="h-3 w-3" />
              Identity Management
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Your Profile</h1>
          <p className="text-muted-foreground text-sm max-w-md">
              Manage your personal identity and authenticated credentials within the fleet.
          </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-7 border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
                <Shield className="h-4 w-4 text-primary" />
                Security Credentials
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Verified Auth Identity</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Full Name</Label>
                    <div className="p-3 rounded-xl bg-background border border-primary/5 text-sm font-semibold">
                        {session?.user?.name}
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Status</Label>
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-background border border-primary/5 text-sm font-semibold">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </div>
                </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Google Email Address</Label>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-background border border-primary/5 text-sm font-medium">
                  <Mail className="h-4 w-4 text-muted-foreground/50" />
                  {session?.user?.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">System Operator ID</Label>
              <div className="flex items-center gap-2">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-primary font-bold font-mono text-sm flex-1 tracking-tight">
                      {session?.user?.operator_name || "Unassigned"}
                  </div>
                  {myOp && <IdTag id={myOp.OPR_ID} className="h-11 px-4" />}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-5 space-y-6">
            <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                    <CardTitle className="text-sm font-bold">Session Context</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" /> Region
                        </span>
                        <span className="font-bold">Global / Multi-Node</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" /> Joined
                        </span>
                        <span className="font-bold">December 2025</span>
                    </div>
                </CardContent>
            </Card>

            <div className="p-6 rounded-2xl border-2 border-dashed border-primary/10 bg-primary/5 flex flex-col items-center justify-center text-center gap-3">
                <div className="h-10 w-10 rounded-full bg-background border border-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary opacity-40" />
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Identity Secured</p>
            </div>
        </div>
      </div>
    </div>
  );
}
