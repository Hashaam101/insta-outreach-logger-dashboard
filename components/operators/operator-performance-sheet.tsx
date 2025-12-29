"use client"

import * as React from "react"
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from "@/components/ui/sheet"
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"
import { 
    User, 
    TrendingUp, 
    Instagram, 
    History,
    Calendar,
    Clock,
    Activity,
    Target,
    Mail,
    Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TimeDisplay } from "@/components/time-display"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { InstagramUsername } from "@/components/ui/instagram-username"
import { IdTag } from "@/components/ui/id-tag"

interface OperatorPerformanceData {
    info: {
        OPR_ID: string;
        OPR_NAME: string;
        OPR_EMAIL: string;
        OPR_STATUS: string;
        CREATED_AT: string;
        LAST_ACTIVITY: string;
    };
    volume: { LOG_DATE: string; TOTAL: string }[];
    actorBreakdown: { ACT_USERNAME: string; TOTAL: string }[];
    statusDistribution: { STATUS: string; TOTAL: string }[];
    recentLogs: {
        TAR_USERNAME: string;
        TAR_STATUS: string;
        MESSAGE_TEXT: string;
        SENT_AT: string;
        OPR_NAME: string;
        ACT_USERNAME: string;
    }[];
    totalDms: number;
}

interface OperatorPerformanceSheetProps {
    operatorName: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    data: OperatorPerformanceData | null
}

export function OperatorPerformanceSheet({ 
    operatorName, 
    isOpen, 
    onOpenChange,
    data 
}: OperatorPerformanceSheetProps) {
    const volumeData = data?.volume?.map((v) => ({
        date: v.LOG_DATE.split('-').slice(1).join('/'),
        total: Number(v.TOTAL)
    })) || [];

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl p-0 border-primary/10 bg-card/95 backdrop-blur-xl flex flex-col h-full overflow-hidden">
                {!data ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Operator Data...</p>
                    </div>
                ) : (
                    <>
                        <SheetHeader className="p-6 border-b border-primary/5 bg-primary/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <User className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <SheetTitle className="text-2xl font-bold truncate">
                                            {operatorName}
                                        </SheetTitle>
                                        <Badge variant="outline" className={cn(
                                            "text-[8px] h-4 uppercase font-bold px-1.5", 
                                            data.info.OPR_STATUS === 'online' 
                                                ? "bg-green-500/10 text-green-500 border-green-500/20" 
                                                : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                                        )}>
                                            {data.info.OPR_STATUS}
                                        </Badge>
                                    </div>
                                    <div className="mt-1">
                                        <InstagramUsername username={operatorName} className="text-xs text-primary/60 font-bold uppercase tracking-widest" />
                                    </div>
                                    <SheetDescription className="text-xs font-medium uppercase tracking-widest text-primary/60 sr-only">
                                        Human Performance Intelligence
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-8 pb-12">
                                {/* Operator Core Metadata */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-primary/60" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Onboarded</span>
                                        </div>
                                        <div>
                                            <TimeDisplay date={data.info.CREATED_AT} showIcon={false} className="text-sm font-bold block" />
                                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Creation Date</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-primary/60" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pulse Check</span>
                                        </div>
                                        <div>
                                            <TimeDisplay date={data.info.LAST_ACTIVITY} showIcon={false} className="text-sm font-bold block" />
                                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Last Active Status</span>
                                        </div>
                                    </div>
                                </div>

                                                        {/* Contact Identity */}
                                                        <div className="px-4 py-3 rounded-xl bg-background border border-primary/10 flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <Mail className="h-4 w-4 text-primary/40" />
                                                                <span className="text-xs font-semibold text-foreground/80">{data.info.OPR_EMAIL}</span>
                                                            </div>
                                                            <IdTag id={data.info.OPR_ID} />
                                                        </div>
                                {/* Aggregated Stats */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3.5 rounded-xl bg-background border border-primary/10 flex flex-col items-center text-center gap-1 shadow-inner">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Team DMs</span>
                                        <span className="text-xl font-bold">{data.totalDms}</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-background border border-primary/10 flex flex-col items-center text-center gap-1 shadow-inner">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Managed</span>
                                        <span className="text-xl font-bold text-primary">{data.actorBreakdown.length}</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-background border border-primary/10 flex flex-col items-center text-center gap-1 shadow-inner">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Leads</span>
                                        <span className="text-xl font-bold">{data.statusDistribution.reduce((acc, curr) => acc + Number(curr.TOTAL), 0)}</span>
                                    </div>
                                </div>

                                <Separator className="bg-primary/5" />

                                {/* Operator Velocity Chart */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Outreach Velocity (14d)</h3>
                                    </div>
                                    <div className="h-[200px] w-full bg-primary/5 rounded-2xl p-4 border border-primary/5">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={volumeData}>
                                                <defs>
                                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="oklch(0.55 0.18 285)" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="oklch(0.55 0.18 285)" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                <XAxis 
                                                    dataKey="date" 
                                                    axisLine={false} 
                                                    tickLine={false} 
                                                    tick={{fontSize: 10, fill: 'currentColor', opacity: 0.5}}
                                                />
                                                <YAxis hide />
                                                <RechartsTooltip 
                                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                    itemStyle={{ color: 'oklch(0.55 0.18 285)', fontWeight: 'bold' }}
                                                />
                                                <Area 
                                                    type="monotone" 
                                                    dataKey="total" 
                                                    stroke="oklch(0.55 0.18 285)" 
                                                    strokeWidth={2}
                                                    fillOpacity={1} 
                                                    fill="url(#colorTotal)" 
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Lead Success Distribution */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Lead Success Distribution</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {data.statusDistribution.map((item) => (
                                            <div key={item.STATUS} className="p-3 rounded-xl bg-card border border-primary/5 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{item.STATUS}</span>
                                                <Badge variant="secondary" className="text-[10px] font-bold">{item.TOTAL}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actor Distribution */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Instagram className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Account Utilization</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {data.actorBreakdown.map((actor) => (
                                            <div key={actor.ACT_USERNAME} className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-primary/5 hover:border-primary/20 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                                                        <Instagram className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <InstagramUsername username={actor.ACT_USERNAME} className="text-sm" />
                                                </div>
                                                <Badge className="bg-primary text-primary-foreground font-bold">
                                                    {actor.TOTAL} DMs
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <History className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Operator Activity Log</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {data.recentLogs.map((log, idx) => (
                                            <div key={idx} className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-all pb-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <InstagramUsername 
                                                            username={log.TAR_USERNAME} 
                                                            className="text-xs uppercase tracking-tight"
                                                        />
                                                        <Badge variant="outline" className="text-[7px] h-3 px-1 font-bold uppercase border-primary/10">
                                                            {log.TAR_STATUS}
                                                        </Badge>
                                                    </div>
                                                    <TimeDisplay 
                                                        date={log.SENT_AT} 
                                                        className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase" 
                                                    />
                                                </div>
                                                <div className="p-3 rounded-2xl bg-primary/5 border border-primary/5 group-hover:border-primary/10 transition-all">
                                                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                                                        &quot;{log.MESSAGE_TEXT}&quot;
                                                    </p>
                                                </div>
                                                <div className="mt-2 px-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <Activity className="h-2.5 w-2.5 text-primary/40" />
                                                        <span className="text-[9px] font-bold text-primary/60 uppercase">via {log.ACT_USERNAME}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
