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
    Instagram, 
    TrendingUp, 
    Users, 
    History,
    Calendar,
    User,
    Activity,
    Clock,
    Globe,
    Loader2
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TimeDisplay } from "@/components/time-display"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { InstagramUsername } from "@/components/ui/instagram-username"

interface PerformanceData {
    info: {
        ACT_STATUS: string;
        CREATED_AT: string;
        LAST_ACTIVITY: string;
        TOTAL_SEATS: string;
    };
    volume: { LOG_DATE: string; TOTAL: string }[];
    operatorBreakdown: { OPR_NAME: string; TOTAL: string }[];
    recentLogs: {
        TAR_USERNAME: string;
        TAR_STATUS: string;
        CONT_SOURCE: string;
        MESSAGE_TEXT: string;
        SENT_AT: string;
        OPR_NAME: string;
        ACT_USERNAME: string;
    }[];
    eventDistribution: { EVENT_TYPE: string; TOTAL: string }[];
    totalDms: number;
}

interface ActorPerformanceSheetProps {
    actorHandle: string
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    data: PerformanceData | null
}

const STATUS_COLORS: Record<string, string> = {
    'Active': 'bg-green-500/10 text-green-500 border-green-500/20',
    'Suspended By Team': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Suspended By Insta': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Discarded': 'bg-slate-500/10 text-slate-500 border-slate-500/20'
}

export function ActorPerformanceSheet({ 
    actorHandle, 
    isOpen, 
    onOpenChange,
    data 
}: ActorPerformanceSheetProps) {
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
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Intelligence...</p>
                    </div>
                ) : (
                    <>
                        <SheetHeader className="p-6 border-b border-primary/5 bg-primary/5 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Instagram className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <SheetTitle className="text-2xl font-bold truncate">
                                            {actorHandle}
                                        </SheetTitle>
                                        {data.info?.ACT_STATUS && (
                                            <Badge variant="outline" className={cn("text-[8px] h-4 uppercase font-bold px-1.5", STATUS_COLORS[data.info.ACT_STATUS] || "bg-primary/10 text-primary border-primary/20")}>
                                                {data.info.ACT_STATUS}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="mt-1">
                                        <InstagramUsername username={actorHandle} className="text-xs text-primary/60 font-bold uppercase tracking-widest" />
                                    </div>
                                    <SheetDescription className="text-xs font-medium uppercase tracking-widest text-primary/60 sr-only">
                                        Account Asset Intelligence
                                    </SheetDescription>
                                </div>
                            </div>
                        </SheetHeader>

                        <ScrollArea className="flex-1 overflow-y-auto">
                            <div className="p-6 space-y-8 pb-12">
                                {/* Account Core Metadata */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3 text-primary/60" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Asset Age</span>
                                        </div>
                                        <div>
                                            {data.info?.CREATED_AT ? (
                                                <TimeDisplay date={data.info.CREATED_AT} showIcon={false} className="text-sm font-bold block" />
                                            ) : (
                                                <span className="text-sm font-bold block text-muted-foreground italic">N/A</span>
                                            )}
                                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Registration Date</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3 w-3 text-primary/60" />
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Pulse Check</span>
                                        </div>
                                        <div>
                                            {data.info?.LAST_ACTIVITY ? (
                                                <TimeDisplay date={data.info.LAST_ACTIVITY} showIcon={false} className="text-sm font-bold block" />
                                            ) : (
                                                <span className="text-sm font-bold block text-muted-foreground italic">N/A</span>
                                            )}
                                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Last Recorded Sync</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Summary */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="p-3.5 rounded-xl bg-background border border-primary/10 flex flex-col items-center text-center gap-1 shadow-inner">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total DMs</span>
                                        <span className="text-xl font-bold">{data.totalDms}</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-background border border-primary/10 flex flex-col items-center text-center gap-1 shadow-inner">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Operators</span>
                                        <span className="text-xl font-bold text-primary">{data.operatorBreakdown.length}</span>
                                    </div>
                                    <div className="p-3.5 rounded-xl bg-background border border-primary/10 flex flex-col items-center text-center gap-1 shadow-inner">
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Seats</span>
                                        <span className="text-xl font-bold">{data.info?.TOTAL_SEATS || '0'}</span>
                                    </div>
                                </div>

                                <Separator className="bg-primary/5" />

                                {/* Weekly Volume Chart */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="h-4 w-4 text-primary" />
                                            <h3 className="text-sm font-bold uppercase tracking-tight">Outreach Velocity (14d)</h3>
                                        </div>
                                        <Badge variant="outline" className="text-[9px] font-bold bg-primary/5">
                                            {volumeData.length} active days
                                        </Badge>
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

                                {/* Event Distribution */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Event Ecosystem</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {data.eventDistribution.map((event) => (
                                            <div key={event.EVENT_TYPE} className="p-3 rounded-xl bg-card border border-primary/5 flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{event.EVENT_TYPE}</span>
                                                <Badge variant="secondary" className="text-[10px] font-bold">{event.TOTAL}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Operator Breakdown */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Operator Distribution</h3>
                                    </div>
                                    <div className="space-y-2">
                                        {data.operatorBreakdown.map((op) => (
                                            <div key={op.OPR_NAME} className="flex items-center justify-between p-3.5 rounded-xl bg-background border border-primary/5 hover:border-primary/20 transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10">
                                                        <User className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="text-sm font-bold">{op.OPR_NAME}</span>
                                                </div>
                                                <Badge className="bg-primary text-primary-foreground font-bold">
                                                    {op.TOTAL} DMs
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <History className="h-4 w-4 text-primary" />
                                        <h3 className="text-sm font-bold uppercase tracking-tight">Granular Activity Stream</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {data.recentLogs.map((log, idx) => (
                                            <div key={idx} className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-all pb-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-3 w-3 text-primary/40" />
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
                                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                                        &quot;{log.MESSAGE_TEXT}&quot;
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between mt-2 px-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                        <span className="text-[9px] font-bold text-primary uppercase opacity-60">Sent By {log.OPR_NAME}</span>
                                                    </div>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase opacity-40">Source: {log.CONT_SOURCE}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {data.recentLogs.length === 0 && (
                                            <div className="text-center py-10 bg-primary/5 rounded-2xl border-dashed border-2 border-primary/10">
                                                <p className="text-xs font-bold text-muted-foreground">No recent outreach activity</p>
                                            </div>
                                        )}
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
