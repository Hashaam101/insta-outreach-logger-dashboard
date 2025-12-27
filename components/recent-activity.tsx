"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Calendar, User, Instagram } from "lucide-react";
import { getCachedRecentLogs, OutreachLog } from "@/lib/data";

function formatTimeAgo(date: Date | string) {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return "just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
}

export function RecentActivity({ operatorName }: { operatorName?: string }) {
    const [logs, setLogs] = React.useState<OutreachLog[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        getCachedRecentLogs(operatorName).then(data => {
            setLogs(data as OutreachLog[]);
            setIsLoading(false);
        });
    }, [operatorName]);

    if (isLoading) {
        return <div className="p-10 text-center text-xs text-muted-foreground animate-pulse">Synchronizing feed...</div>;
    }

    return (
        <div className="divide-y divide-primary/5">
            {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 hover:bg-primary/5 transition-colors group">
                    <Avatar className="h-10 w-10 border border-primary/10 rounded-xl">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                            {log.TARGET_USERNAME[0]}
                        </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-bold truncate">
                                @{log.TARGET_USERNAME}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-medium shrink-0 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatTimeAgo(log.CREATED_AT)}
                            </span>
                        </div>
                        
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed bg-background/50 p-2 rounded-lg border border-primary/5 group-hover:border-primary/10 transition-colors">
                            &quot;{log.MESSAGE_TEXT}&quot;
                        </p>

                        <div className="flex items-center gap-3 pt-1">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/10">
                                <User className="h-2.5 w-2.5 text-primary" />
                                <span className="text-[9px] font-bold text-primary/80 uppercase tracking-tight">{log.OWNER_OPERATOR}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/5 border border-blue-500/10">
                                <Instagram className="h-2.5 w-2.5 text-blue-500" />
                                <span className="text-[9px] font-bold text-blue-500/80 lowercase tracking-tight">@{log.ACTOR_USERNAME}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
            {logs.length === 0 && (
                <div className="text-center py-12 space-y-3">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                    <p className="text-xs text-muted-foreground italic">No outreach activity detected yet.</p>
                </div>
            )}
        </div>
    );
}
