"use client"

import * as React from "react"
import { 
    Target, 
    User, 
    Users, 
    Edit3, 
    History, 
    Save, 
    AlertCircle,
    Loader2,
    ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { 
        setPersonalGoal, 
        suggestTeamGoal,
        deleteGoal,
        GoalView
    } from "@/app/actions/governance"
    import { toast } from "sonner"
    import { GoalMetric } from "@/types/db"
    import { ProposeGoalDialog } from "./propose-goal-dialog"
    import { Trash2 } from "lucide-react"

interface AuditLogEntry {
    id: string;
    type: string;
    details: string;
    timestamp: string;
}

export function GoalsDashboard({ 
    initialGoals, 
    recentLogs,
    operators,
    actors
}: { 
    initialGoals: GoalView[], 
    recentLogs: AuditLogEntry[],
    operators: { id: string, name: string }[],
    actors: { id: string, handle: string }[]
}) {
    const [goals, setGoals] = React.useState(initialGoals)
    const [editingId, setEditingId] = React.useState<string | null>(null)
    const [editType, setEditType] = React.useState<'team' | 'personal' | null>(null)
    const [editValue, setEditValue] = React.useState<string>("")
    const [isPending, setIsPending] = React.useState(false)

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this goal?")) return;
        const res = await deleteGoal(id);
        if (res.success) {
            toast.success("Goal deleted");
            setGoals(prev => prev.filter(g => g.id !== id));
        } else {
            toast.error("Failed to delete goal");
        }
    }

    const handleSave = async () => {
        if (!editingId || !editType || isNaN(Number(editValue))) return;
        
        const goal = goals.find(g => g.id === editingId);
        if (!goal) return;

        setIsPending(true)
        const val = Number(editValue)
        
        // Note: Actions now expect Metric enum. 
        const res = editType === 'team' 
            ? await suggestTeamGoal(goal.metric as GoalMetric, val)
            : await setPersonalGoal(goal.metric as GoalMetric, val);

        if (res.success) {
            toast.success(`${editType === 'team' ? 'Team' : 'Personal'} goal updated`);
            setGoals(prev => prev.map(g => {
                if (g.id === editingId) {
                    // Update local state optimistically
                    // In a real app, revalidatePath handles this, but for instant feedback:
                    return { ...g, targetValue: val }
                }
                return g
            }));
            setEditingId(null);
        } else {
            toast.error(res.error || "Save failed")
        }
        setIsPending(false)
    }

    return (
        <div className="grid gap-6 md:grid-cols-12">
            {/* Goals List */}
            <Card className="md:col-span-8 border-primary/10 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                            <CardTitle className="text-base">Strategic Performance Targets</CardTitle>
                            <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Democratic Collective Limits</CardDescription>
                        </div>
                    </div>
                    <ProposeGoalDialog operators={operators} actors={actors} />
                </CardHeader>
                <CardContent className="space-y-6">
                    {goals.map((goal) => (
                        <div key={goal.id} className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm tracking-tight">{goal.metric}</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{goal.frequency}</p>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleDelete(goal.id)}
                                            className="h-6 w-6 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Team Box */}
                                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-center min-w-[100px] relative group">
                                        <p className="text-[8px] uppercase font-bold text-muted-foreground mb-1 flex items-center justify-center gap-1">
                                            <Users className="h-2 w-2" /> Team
                                        </p>
                                        <p className="text-xl font-bold">{goal.isTeam ? goal.targetValue : "—"}</p>
                                        <p className="text-[8px] text-muted-foreground mt-1 truncate max-w-[80px]">
                                            {goal.isTeam ? (goal.assignedTo ? `By: ${goal.assignedTo}` : "Default") : "Custom"}
                                        </p>
                                        {goal.isTeam && (
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => {
                                                    setEditingId(goal.id);
                                                    setEditType('team');
                                                    setEditValue(goal.targetValue.toString());
                                                }}
                                                className="h-5 w-5 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-background border border-primary/10"
                                            >
                                                <Edit3 className="h-2 w-2" />
                                            </Button>
                                        )}
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-20" />

                                    {/* Personal Box */}
                                    <div className="bg-background border border-primary/20 rounded-lg p-3 text-center min-w-[100px] relative group border-dashed shadow-inner">
                                        <p className="text-[8px] uppercase font-bold text-primary mb-1 flex items-center justify-center gap-1">
                                            <User className="h-2 w-2" /> My Limit
                                        </p>
                                        <p className="text-xl font-bold text-primary">
                                            {!goal.isTeam ? goal.targetValue : goal.targetValue}
                                        </p>
                                        <p className="text-[8px] text-primary/60 mt-1 uppercase font-bold">
                                            {!goal.isTeam ? "Override" : "Using Default"}
                                        </p>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => {
                                                setEditingId(goal.id);
                                                setEditType('personal');
                                                setEditValue(goal.targetValue.toString());
                                            }}
                                            className="h-5 w-5 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 bg-background border border-primary/10"
                                        >
                                            <Edit3 className="h-2 w-2" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {editingId === goal.id && (
                                <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-bold uppercase tracking-widest text-primary">
                                            Editing {editType === 'team' ? 'Team Suggestion' : 'Personal Override'}
                                        </p>
                                        <Button variant="ghost" size="sm" className="h-6 text-[10px]" onClick={() => setEditingId(null)}>Cancel</Button>
                                    </div>
                                    <div className="flex gap-2">
                                        <Input 
                                            type="number" 
                                            value={editValue} 
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="bg-background h-10"
                                        />
                                        <Button disabled={isPending} onClick={handleSave} className="gap-2 px-6">
                                            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            Save
                                        </Button>
                                    </div>
                                </div>
                            )}
                            <Separator className="opacity-50" />
                        </div>
                    ))}
                    {goals.length === 0 && (
                        <p className="text-center text-xs text-muted-foreground italic">No active goals configured.</p>
                    )}
                </CardContent>
            </Card>

            {/* Recent Changes Feed */}
            <Card className="md:col-span-4 border-primary/10 bg-card/40 backdrop-blur-sm">
                <CardHeader className="pb-3 border-b border-primary/5">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-primary" />
                        <CardTitle className="text-sm">Governance Activity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 px-4">
                    <div className="space-y-6">
                        {recentLogs.map((log, i) => (
                            <div key={i} className="flex gap-3 items-start">
                                <div className="bg-primary/10 p-1.5 rounded-lg shrink-0">
                                    <AlertCircle className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[11px] leading-tight">
                                        {/* Mocking display since audit logs are removed */}
                                        <span className="font-bold text-foreground">System Update</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                        {recentLogs.length === 0 && (
                            <p className="text-center text-xs text-muted-foreground italic py-10">No recent governance changes.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}