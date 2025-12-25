import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Calendar } from "lucide-react";
import { getCachedRecentLogs } from "@/lib/data";

function formatTimeAgo(date: Date | string) {
    const now = new Date();
    const past = new Date(date);
    const diffInMs = now.getTime() - past.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMins / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMins < 1) return "just now";
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${diffInDays}d`;
}

export async function RecentActivity() {
    const logs = await getCachedRecentLogs();

    return (
        <div className="space-y-6">
            {logs.map((log: any, idx: number) => (
                <div key={idx} className="relative flex gap-4 group">
                    <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-primary/10 shadow-lg group-hover:border-primary/30 transition-colors">
                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                {log.OWNER_OPERATOR ? log.OWNER_OPERATOR[0] : "?"}
                            </AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-background p-1 rounded-full border border-primary/20">
                            <MessageSquare className="h-2 w-2 text-primary" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold leading-none tracking-tight truncate pr-2">
                                {log.OWNER_OPERATOR || "Unknown"}
                            </p>
                            <div className="flex items-center text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                                <Calendar className="h-3 w-3 mr-1 opacity-50" />
                                {formatTimeAgo(log.CREATED_AT)}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Sent DM to <span className="text-primary/80 font-semibold">@{log.TARGET_USERNAME}</span>
                        </p>
                        <div className="bg-primary/5 rounded-lg p-2 mt-2 group-hover:bg-primary/10 transition-colors">
                             <p className="text-[11px] text-muted-foreground line-clamp-2 italic leading-normal">
                                "{log.MESSAGE_TEXT}"
                             </p>
                        </div>
                    </div>
                </div>
            ))}
            {logs.length === 0 && (
                <div className="text-center py-10 text-muted-foreground italic text-sm">
                    No activity recorded yet.
                </div>
            )}
        </div>
    );
}