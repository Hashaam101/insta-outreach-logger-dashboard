import { auth } from "@/auth";
import { dbQuery } from "@/lib/db";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { Clock, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { OutreachLog } from "@/lib/data";

export default async function LogsPage() {
  const session = await auth();

  const logs = await dbQuery<OutreachLog>(
    `SELECT l.target_username, l.message_text, TO_CHAR(l.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at, a.owner_operator, l.actor_username
     FROM outreach_logs l
     LEFT JOIN actors a ON l.actor_username = a.username
     ORDER BY l.created_at DESC
     FETCH FIRST 100 ROWS ONLY`
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3 w-3" />
                Security & Audit
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Activity Logs</h1>
            <p className="text-muted-foreground text-sm max-w-md">
                A granular trail of every message sent across the distributed fleet.
            </p>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1">
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <div>
                    <CardTitle className="text-base">Real-time Stream</CardTitle>
                    <CardDescription className="text-[10px]">
                        Last 100 outreach events logged
                    </CardDescription>
                </div>
            </div>
            {session?.user?.operator_name && (
                <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-bold border border-primary/20">
                    AUDIT ACTIVE: {session.user.operator_name}
                </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <DataTable 
                columns={columns} 
                data={logs} 
                pageSize={20}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}