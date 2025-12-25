import { Badge } from "@/components/ui/badge";
import { getCachedStatusDistribution } from "@/lib/data";

interface StatusDistributionProps {
    operatorName?: string
}

export async function StatusDistribution({ operatorName }: StatusDistributionProps) {
    const data = await getCachedStatusDistribution(operatorName);
    const maxCount = Math.max(...data.map((d: any) => Number(d.COUNT) || 0), 1);

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('booked') || s.includes('success')) return "bg-green-500/10 text-green-500 border-green-500/20";
        if (s.includes('reply') || s.includes('warm')) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
        if (s.includes('contacted')) return "bg-purple-500/10 text-purple-500 border-purple-500/20";
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    };

    return (
        <div className="space-y-4">
            {data.map((item: any) => (
                <div key={item.STATUS} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                        <span className="text-sm font-medium">{item.STATUS || "Unknown"}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-primary/5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                                className="h-full bg-primary/40 rounded-full" 
                                style={{ width: `${Math.min(100, (item.COUNT / maxCount) * 100)}%` }} 
                            />
                        </div>
                        <Badge variant="outline" className={getStatusColor(item.STATUS || "")}>
                            {item.COUNT}
                        </Badge>
                    </div>
                </div>
            ))}
            {data.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                    No status data available.
                </div>
            )}
        </div>
    );
}