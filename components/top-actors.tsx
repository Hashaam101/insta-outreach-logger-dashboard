import { Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCachedTopActors } from "@/lib/data";

export async function TopActors() {
    const data = await getCachedTopActors();

    return (
        <div className="space-y-4">
            {data.map((actor: any, idx: number) => (
                <div key={actor.ACTOR_USERNAME} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/5 hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-primary/10 group-hover:border-primary/30 transition-colors">
                            <Instagram className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold">@{actor.ACTOR_USERNAME}</span>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Ranking #{idx + 1}</span>
                        </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                        {actor.COUNT} msgs
                    </Badge>
                </div>
            ))}
            {data.length === 0 && (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                    No activity logs found.
                </div>
            )}
        </div>
    );
}