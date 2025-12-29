"use client"

import * as React from "react"
import { 
    ShieldAlert, 
    Zap, 
    Timer, 
    AlertTriangle,
    User,
    Instagram,
    Trash2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RuleView, deleteRule } from "@/app/actions/governance"
import { cn } from "@/lib/utils"
import { ProposeRuleDialog } from "./propose-rule-dialog"
import { toast } from "sonner"

interface RulesDashboardProps {
    initialRules: RuleView[]
    operators: { id: string, name: string }[]
    actors: { id: string, handle: string }[]
}

export function RulesDashboard({ initialRules, operators, actors }: RulesDashboardProps) {
    const [rules, setRules] = React.useState(initialRules)

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this safety rule?")) return;
        const res = await deleteRule(id);
        if (res.success) {
            toast.success("Rule deleted");
            setRules(prev => prev.filter(r => r.id !== id));
        } else {
            toast.error("Failed to delete rule");
        }
    }

    return (
        <Card className="border-primary/10 bg-card/40 backdrop-blur-sm border-2 rounded-2xl overflow-hidden h-full">
            <CardHeader className="pb-3 border-b border-primary/5 bg-primary/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                    <div>
                        <CardTitle className="text-base">Safety Protocols</CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold tracking-wider">Operational Hard-Limits</CardDescription>
                    </div>
                </div>
                <ProposeRuleDialog operators={operators} actors={actors} />
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                {rules.map((rule) => (
                    <div key={rule.id} className="p-4 rounded-xl bg-background border border-primary/5 space-y-3 relative group overflow-hidden">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "p-2 rounded-lg",
                                    rule.type === 'Frequency Cap' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                                )}>
                                    {rule.type === 'Frequency Cap' ? <Zap className="h-4 w-4" /> : <Timer className="h-4 w-4" />}
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-tight">{rule.metric}</h4>
                                    <p className="text-[10px] text-muted-foreground">{rule.type}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[9px] uppercase font-bold border-primary/10 bg-primary/5">
                                    {rule.severity}
                                </Badge>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={() => handleDelete(rule.id)}
                                    className="h-6 w-6 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 relative z-10">
                            <div className="space-y-1">
                                <p className="text-[8px] uppercase font-bold text-muted-foreground">Threshold</p>
                                <p className="text-lg font-bold">{rule.limitValue} {rule.metric.includes('Sent') ? 'Messages' : 'Units'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[8px] uppercase font-bold text-muted-foreground">Window</p>
                                <p className="text-lg font-bold">Per {rule.window / 3600} Hour(s)</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-primary/5 relative z-10">
                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                <User className="h-2.5 w-2.5 text-muted-foreground" />
                                <span className="text-[9px] font-bold text-muted-foreground uppercase">{rule.assignedTo || "Global"}</span>
                            </div>
                            {rule.actorHandle && (
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50">
                                    <Instagram className="h-2.5 w-2.5 text-muted-foreground" />
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{rule.actorHandle}</span>
                                </div>
                            )}
                        </div>

                        {/* Subtle background icon */}
                        {rule.type === 'Frequency Cap' ? (
                            <Zap className="h-16 w-16 absolute -bottom-4 -right-4 text-primary opacity-[0.03] rotate-12" />
                        ) : (
                            <Timer className="h-16 w-16 absolute -bottom-4 -right-4 text-primary opacity-[0.03] -rotate-12" />
                        )}
                    </div>
                ))}

                {rules.length === 0 && (
                    <div className="py-10 text-center space-y-2">
                        <AlertTriangle className="h-8 w-8 text-muted-foreground/20 mx-auto" />
                        <p className="text-xs text-muted-foreground italic">No active safety rules detected.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}