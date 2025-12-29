import { Instagram } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCachedTopActors, TopActorData } from "@/lib/data";
import { InstagramUsername } from "./ui/instagram-username";

export async function TopActors() {
    const data = await getCachedTopActors() as TopActorData[];

    return (
        <div className="space-y-4">
            {data.map((actor, idx) => (
                <div key={actor.ACTOR_USERNAME} className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/5 hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background border border-primary/10 group-hover:border-primary/30 transition-colors shrink-0">
                            <Instagram className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <InstagramUsername username={actor.ACTOR_USERNAME} className="text-sm" />
                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Ranking #{idx + 1}</span>
                        </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 shrink-0">
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
