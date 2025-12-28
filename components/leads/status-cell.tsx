"use client"

import * as React from "react"
import { 
    CheckCircle2, 
    Clock, 
    MessageSquare, 
    Zap,
    ChevronDown,
    Loader2,
    DollarSign,
    Crown,
    XCircle
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { updateLeadStatus } from "@/app/(dashboard)/leads/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<string, { color: string, icon: any }> = {
  "Cold No Reply": { color: "bg-slate-500/10 text-slate-500 border-slate-500/20", icon: Clock },
  "Replied": { color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: MessageSquare },
  "Warm": { color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: Zap },
  "Booked": { color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle2 },
  "Paid": { color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: DollarSign },
  "Tableturnerr Client": { color: "bg-purple-500/10 text-purple-500 border-purple-500/20", icon: Crown },
  "Excluded": { color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
};

export function StatusCell({ status: initialStatus, username }: { status: string, username: string }) {
  const [status, setStatus] = React.useState(initialStatus)
  const [isPending, setIsPending] = React.useState(false)

  const handleStatusChange = async (newStatus: string) => {
    setIsPending(true)
    const res = await updateLeadStatus(username, newStatus)
    if (res.success) {
      setStatus(newStatus)
      toast.success(`Status updated to ${newStatus}`)
    } else {
      toast.error("Failed to update status")
    }
    setIsPending(false)
  }

  const config = STATUS_CONFIG[status] || STATUS_CONFIG["Cold No Reply"];
  const Icon = config.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
                "h-8 gap-2 px-3 rounded-full border transition-all hover:opacity-80 min-w-[120px] justify-start",
                config.color
            )}
            disabled={isPending}
        >
          {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Icon className="h-3.5 w-3.5 shrink-0" />}
          <span className="text-xs font-bold truncate">{status}</span>
          <ChevronDown className="h-3 w-3 opacity-50 ml-auto" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="rounded-xl border-primary/10 w-[180px]">
        {Object.keys(STATUS_CONFIG).map((s) => {
            const itemConfig = STATUS_CONFIG[s];
            return (
              <DropdownMenuItem 
                key={s} 
                onClick={() => handleStatusChange(s)}
                className="gap-2 text-xs font-bold cursor-pointer py-2"
              >
                <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", itemConfig.color.split(' ')[0].replace('/10', '/50'))} />
                {s}
              </DropdownMenuItem>
            )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
