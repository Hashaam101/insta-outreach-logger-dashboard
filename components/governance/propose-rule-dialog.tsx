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
import { Plus, Loader2, ShieldAlert, User, Instagram, Users } from "lucide-react"
import { proposeRule } from "@/app/actions/governance"
import { toast } from "sonner"

const formSchema = z.object({
  type: z.enum(["Frequency Cap", "Interval Spacing"]),
  metric: z.string().min(1, "Metric is required"),
  limitValue: z.coerce.number().min(1, "Threshold must be at least 1"),
  window: z.coerce.number().min(60, "Window must be at least 60 seconds"),
  scope: z.enum(["Team", "Operator", "Actor"]),
  assignedToOpr: z.string().optional(),
  assignedToAct: z.string().optional(),
})

const METRIC_OPTIONS = [
    "Total Messages Sent",
    "Unique Profiles Contacted",
    "Replies Received",
    "Warm Leads Generated",
    "Bookings Made",
    "Payments Received"
]

interface ProposeRuleDialogProps {
    operators: { id: string, name: string }[]
    actors: { id: string, handle: string }[]
}

export function ProposeRuleDialog({ operators, actors }: ProposeRuleDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "Frequency Cap",
      metric: "Total Messages Sent",
      limitValue: 50,
      window: 3600,
      scope: "Team",
      assignedToOpr: "",
      assignedToAct: "",
    },
  })

  const watchScope = form.watch("scope")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPending(true)
    const res = await proposeRule({
        ...values,
        assignedToOpr: values.scope === 'Operator' ? values.assignedToOpr : null,
        assignedToAct: values.scope === 'Actor' ? values.assignedToAct : null
    })
    if (res.success) {
      toast.success("Rule Proposal Submitted")
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
            <Plus className="h-3 w-3" /> Propose Rule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
              <ShieldAlert className="h-5 w-5" />
              <DialogTitle>Propose Safety Protocol</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Suggest a new operational limit. Rules can apply to the whole team, specific members, or specific actors.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Logic</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="Frequency Cap">Frequency Cap</SelectItem>
                        <SelectItem value="Interval Spacing">Interval Spacing</SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="scope"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Protocol Scope</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Team"><div className="flex items-center gap-2"><Users className="h-3 w-3"/> Global</div></SelectItem>
                            <SelectItem value="Operator"><div className="flex items-center gap-2"><User className="h-3 w-3"/> Operator</div></SelectItem>
                            <SelectItem value="Actor"><div className="flex items-center gap-2"><Instagram className="h-3 w-3"/> Actor</div></SelectItem>
                        </SelectContent>
                    </Select>
                    </FormItem>
                )}
                />
            </div>

            {watchScope === 'Operator' && (
                <FormField
                control={form.control}
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
                control={form.control}
                name="assignedToAct"
                render={({ field }) => (
                    <FormItem className="animate-in fade-in slide-in-from-top-2">
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Target Actor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger className="bg-background border-primary/10 rounded-xl h-10 text-xs">
                            <SelectValue placeholder="Select actor" />
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

            <FormField
              control={form.control}
              name="metric"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Governed Metric</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="limitValue"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Limit Value</FormLabel>
                    <FormControl>
                        <Input {...field} type="number" className="bg-background border-primary/10 rounded-xl h-10" />
                    </FormControl>
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="window"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Window (Sec)</FormLabel>
                    <FormControl>
                        <Input {...field} type="number" className="bg-background border-primary/10 rounded-xl h-10" />
                    </FormControl>
                    </FormItem>
                )}
                />
            </div>

            <DialogFooter className="pt-4">
              <Button variant="ghost" type="button" onClick={() => setOpen(false)} className="text-xs">Cancel</Button>
              <Button type="submit" disabled={isPending} className="shadow-lg shadow-primary/20 text-xs font-bold px-8">
                {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Submit Proposal
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}