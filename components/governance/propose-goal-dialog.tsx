"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle,
    DialogTrigger 
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Target, User, Instagram, Users } from "lucide-react"
import { proposeGoal } from "@/app/actions/governance"
import { toast } from "sonner"
import { GoalMetric, GoalFrequency } from "@/types/db"

const formSchema = z.object({
  metric: z.string().min(1, "Metric is required"),
  value: z.coerce.number().min(1, "Target must be at least 1"),
  frequency: z.enum(["Daily", "Monthly"]),
  scope: z.enum(["Team", "Operator", "Actor"]),
  assignedToOpr: z.string().optional(),
  assignedToAct: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

const METRIC_OPTIONS = [
    "Total Messages Sent",
    "Unique Profiles Contacted",
    "Replies Received",
    "Warm Leads Generated",
    "Bookings Made",
    "Payments Received"
]

interface ProposeGoalDialogProps {
    operators: { id: string, name: string }[]
    actors: { id: string, handle: string }[]
}

export function ProposeGoalDialog({ operators, actors }: ProposeGoalDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      metric: "Total Messages Sent",
      value: 100,
      frequency: "Daily",
      scope: "Team",
      assignedToOpr: "",
      assignedToAct: "",
    },
  })

  const watchScope = form.watch("scope")

  async function onSubmit(values: FormValues) {
    setIsPending(true)
    const res = await proposeGoal({
        metric: values.metric as GoalMetric,
        value: values.value,
        frequency: values.frequency as GoalFrequency,
        assignedToOpr: values.scope === 'Operator' ? values.assignedToOpr : null,
        assignedToAct: values.scope === 'Actor' ? values.assignedToAct : null
    })
    if (res.success) {
      toast.success("Goal Proposal Submitted")
      setOpen(false)
      form.reset()
    } else {
      toast.error(res.error || "Failed to submit proposal")
    }
    setIsPending(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest gap-1.5 rounded-lg border-primary/10 hover:bg-primary/5">
            <Plus className="h-3 w-3" /> Propose Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
              <Target className="h-5 w-5" />
              <DialogTitle>Propose Performance Goal</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Suggest a new benchmark for the team, a specific operator, or an Instagram actor.
          </DialogDescription>
        </DialogHeader>

        <Form {...(form as any)}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control as any}
                name="metric"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Success Metric</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        {METRIC_OPTIONS.map(m => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />

                <FormField
                control={form.control as any}
                name="scope"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Goal Scope</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Team"><div className="flex items-center gap-2"><Users className="h-3 w-3"/> Team Wide</div></SelectItem>
                            <SelectItem value="Operator"><div className="flex items-center gap-2"><User className="h-3 w-3"/> Specific Op</div></SelectItem>
                            <SelectItem value="Actor"><div className="flex items-center gap-2"><Instagram className="h-3 w-3"/> Specific Actor</div></SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            </div>

            {watchScope === 'Operator' && (
                <FormField
                control={form.control as any}
                name="assignedToOpr"
                render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Target Operator</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {operators.map(o => (
                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            )}

            {watchScope === 'Actor' && (
                <FormField
                control={form.control as any}
                name="assignedToAct"
                render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Target Actor (IG)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue placeholder="Select actor handle" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {actors.map(a => (
                                <SelectItem key={a.id} value={a.id}>{a.handle}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            )}

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control as any}
                name="value"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Target Value</FormLabel>
                    <FormControl>
                        <Input {...field} type="number" className="bg-background border-primary/10 rounded-xl h-10" />
                    </FormControl>
                    </FormItem>
                )}
                />

                <FormField
                control={form.control as any}
                name="frequency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Cadence</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Daily">Daily</SelectItem>
                            <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="text-xs">Cancel</Button>
              <Button type="submit" disabled={isPending} className="shadow-lg shadow-primary/20 text-xs font-bold px-8">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Submit Goal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}