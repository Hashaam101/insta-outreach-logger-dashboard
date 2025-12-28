"use client"

import * as React from "react"
import { 
  Users, 
  User, 
  Settings2, 
  Save, 
  Loader2 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { GoalMetric } from "@/types/db"
import { 
  suggestTeamGoal, 
  setPersonalGoal,
  GoalView
} from "@/app/actions/governance"

interface GoalItemProps {
    goal: GoalView;
}

export function GoalItem({ goal }: GoalItemProps) {
    const [isPending, setIsPending] = React.useState(false)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false)
    const [newTeamValue, setNewTeamValue] = React.useState(goal.targetValue.toString())

    const isTeam = goal.isTeam;

    const handlePersonalUpdate = async (value: string) => {
        const val = parseInt(value)
        if (isNaN(val)) return
        
        setIsPending(true)
        const res = await setPersonalGoal(goal.metric as GoalMetric, val)
        if (res.success) {
          toast.success("Personal limit updated")
        } else {
          toast.error("Failed to update personal limit")
        }
        setIsPending(false)
    }

    const handleTeamUpdate = async () => {
        const val = parseInt(newTeamValue)
        if (isNaN(val)) return
    
        setIsPending(true)
        const res = await suggestTeamGoal(goal.metric as GoalMetric, val)
        if (res.success) {
          toast.success("Team suggestion updated")
          setIsDialogOpen(false)
        } else {
          toast.error("Failed to update team goal")
        }
        setIsPending(false)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    )} />
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-tight text-foreground/90">{goal.metric}</h4>
                        <p className="text-[10px] text-muted-foreground">{goal.frequency}</p>
                    </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 group rounded-lg">
                            <Settings2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-primary/20 bg-card/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg">Suggest Team Goal: {goal.metric}</DialogTitle>
                            <DialogDescription className="text-sm">
                                Updates the recommended limit for all operators.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Input 
                                type="number" 
                                value={newTeamValue} 
                                onChange={(e) => setNewTeamValue(e.target.value)} 
                                className="bg-background text-sm rounded-xl border-primary/10"
                            />
                        </div>
                        <DialogFooter>
                            <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
                            <Button size="sm" onClick={handleTeamUpdate} disabled={isPending} className="rounded-xl shadow-lg shadow-primary/20">
                                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Suggestion
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 space-y-1">
                    <div className="flex items-center gap-1 opacity-60">
                        <Users className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Team</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-semibold">{isTeam ? goal.targetValue : "—"}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">by {goal.assignedTo || "System"}</span>
                    </div>
                </div>

                <div className="bg-background border border-primary/20 rounded-xl p-3 space-y-1 relative group shadow-inner">
                    <div className="flex items-center gap-1 text-primary">
                        <User className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">My Limit</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Input 
                            type="number" 
                            defaultValue={!isTeam ? goal.targetValue : goal.targetValue}
                            className="h-8 py-0 px-2 text-base font-semibold bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/30 w-full"
                            onBlur={(e) => handlePersonalUpdate(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePersonalUpdate(e.currentTarget.value)}
                        />
                        {isPending && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    </div>
                    {isTeam && (
                        <div className="absolute top-1.5 right-2">
                            <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/10 opacity-40 bg-background/50">Default</Badge>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
