import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Users, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface OperatorStatsProps {
    data: {
        MY_LOGS_24H: string | number
        TEAM_LOGS_24H: string | number
        ACTIVE_OPERATORS: string | number
    }
}

export function OperatorStats({ data }: OperatorStatsProps) {
    const myLogs = Number(data.MY_LOGS_24H);
    const teamLogs = Number(data.TEAM_LOGS_24H);
    const activeOps = Number(data.ACTIVE_OPERATORS);

    const teamAverage = activeOps > 0 
        ? Math.round(teamLogs / activeOps) 
        : 0;
    
    const performanceDiff = teamAverage > 0 
        ? Math.round(((myLogs - teamAverage) / teamAverage) * 100)
        : 0;

    return (
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden border-2">
            <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        <CardTitle className="text-sm">24h Performance Hub</CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold bg-background/50 border-primary/20">
                        Live Benchmarks
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary opacity-70">
                        <User className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">My Outreach</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-semibold">{myLogs}</span>
                        <span className="text-xs text-muted-foreground font-medium">DMs</span>
                    </div>
                    <div className={cn(
                        "text-[10px] font-bold flex items-center gap-1",
                        performanceDiff >= 0 ? "text-green-500" : "text-red-400"
                    )}>
                        <TrendingUp className={cn("h-3 w-3", performanceDiff < 0 && "rotate-180")} />
                        {performanceDiff >= 0 ? "+" : ""}{performanceDiff}% vs Team Avg
                    </div>
                </div>

                <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-primary/5 pt-6 sm:pt-0 sm:pl-6">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Team Average</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-semibold text-foreground/60">{teamAverage}</span>
                        <span className="text-xs text-muted-foreground font-medium">DMs</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-medium italic">
                        Based on {activeOps} active operators
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
