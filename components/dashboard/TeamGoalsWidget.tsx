"use client"

import * as React from "react"
import { 
  Target, 
  Users, 
  User, 
  Settings2, 
  Save, 
  Loader2, 
  AlertCircle 
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { 
  getGoalsDashboardData, 
  suggestTeamGoal, 
  setPersonalGoal,
  Goal
} from "@/app/actions/governance"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function TeamGoalsWidget() {
  const [goals, setGoals] = React.useState<Goal[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isPending, setIsPending] = React.useState<string | null>(null)
  
  // Dialog state
  const [editingTeamGoal, setEditingTeamGoal] = React.useState<Goal | null>(null)
  const [newTeamValue, setNewTeamValue] = React.useState("")

  const loadData = React.useCallback(async () => {
    setIsLoading(true)
    const data = await getGoalsDashboardData()
    if (data) setGoals(data)
    setIsLoading(false)
  }, [])

  React.useEffect(() => {
    loadData()
  }, [loadData])

  const handlePersonalUpdate = async (key: string, value: string) => {
    const val = parseInt(value)
    if (isNaN(val)) return
    
    setIsPending(key)
    const res = await setPersonalGoal(key, val)
    if (res.success) {
      toast.success("Personal limit updated")
      loadData()
    } else {
      toast.error("Failed to update personal limit")
    }
    setIsPending(null)
  }

  const handleTeamUpdate = async () => {
    if (!editingTeamGoal) return
    const val = parseInt(newTeamValue)
    if (isNaN(val)) return

    setIsPending(editingTeamGoal.key)
    const res = await suggestTeamGoal(editingTeamGoal.key, val, editingTeamGoal.description)
    if (res.success) {
      toast.success("Team suggestion updated")
      setEditingTeamGoal(null)
      loadData()
    } else {
      toast.error("Failed to update team goal")
    }
    setIsPending(null)
  }

  if (isLoading) {
    return (
      <Card className="border-primary/10 bg-card/40 backdrop-blur-sm h-[300px] flex items-center justify-center rounded-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
      </Card>
    )
  }

  return (
    <Card className="border-primary/10 bg-card/40 backdrop-blur-sm overflow-hidden rounded-2xl border-2">
      <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm">Operation Limits</CardTitle>
            </div>
            <Badge variant="outline" className="text-[9px] uppercase font-bold bg-background/50 border-primary/20">
                Democratic Governance
            </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {goals.map((goal) => {
          const isTarget = goal.key.toLowerCase().includes('target');
          return (
            <div key={goal.key} className="space-y-3">
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <div className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          isTarget ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      )} />
                      <div>
                          <h4 className="text-xs font-bold uppercase tracking-tight text-foreground/90">{goal.key.replace(/_/g, ' ')}</h4>
                          <p className="text-[10px] text-muted-foreground">{goal.description}</p>
                      </div>
                  </div>
                  <Dialog open={editingTeamGoal?.key === goal.key} onOpenChange={(open) => {
                    if (open) {
                        setEditingTeamGoal(goal)
                        setNewTeamValue(goal.teamValue.toString())
                    } else {
                        setEditingTeamGoal(null)
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 group rounded-lg">
                            <Settings2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-3xl border-primary/20 bg-card/95 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg">Suggest Team Goal: {goal.key.replace(/_/g, ' ')}</DialogTitle>
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
                            <Button variant="outline" size="sm" onClick={() => setEditingTeamGoal(null)} className="rounded-xl">Cancel</Button>
                            <Button size="sm" onClick={handleTeamUpdate} disabled={!!isPending} className="rounded-xl shadow-lg shadow-primary/20">
                                {isPending === goal.key ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
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
                        <span className="text-xl font-semibold">{goal.teamValue}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">by {goal.suggestedBy}</span>
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
                            defaultValue={goal.personalValue ?? goal.teamValue}
                            className="h-8 py-0 px-2 text-base font-semibold bg-transparent border-none focus-visible:ring-1 focus-visible:ring-primary/30 w-full"
                            onBlur={(e) => handlePersonalUpdate(goal.key, e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handlePersonalUpdate(goal.key, e.currentTarget.value)}
                        />
                        {isPending === goal.key && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                    </div>
                    {!goal.personalValue && (
                        <div className="absolute top-1.5 right-2">
                            <Badge variant="outline" className="text-[9px] h-4 px-1 border-primary/10 opacity-40 bg-background/50">Default</Badge>
                        </div>
                    )}
                </div>
            </div>
          </div>
          )
        })}
        {goals.length === 0 && (
            <div className="flex items-center justify-center p-6 text-xs text-muted-foreground gap-2">
                <AlertCircle className="h-4 w-4 opacity-50" />
                No goals defined in database.
            </div>
        )}
      </CardContent>
    </Card>
  )
}

function Badge({ children, variant, className }: { children: React.ReactNode; variant?: "outline" | "default"; className?: string }) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            variant === "outline" ? "text-foreground" : "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
            className
        )}>
            {children}
        </span>
    )
}
