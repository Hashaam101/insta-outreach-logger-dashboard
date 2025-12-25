"use client"

import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Circle, MessageCircle, UserCheck, Target, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { updateLeadStatus } from "@/app/(dashboard)/leads/actions"

interface StatusCellProps {
  status: string
  username: string
}

const statusConfig: Record<string, { color: string; bg: string; icon: any }> = {
  "not contacted": {
    color: "text-slate-400",
    bg: "bg-slate-500/10 border-slate-500/20",
    icon: Circle
  },
  "contacted": {
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: MessageCircle
  },
  "reply received": {
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: UserCheck
  },
  "booked": {
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: Target
  }
}

const statusOptions = [
  { value: "Not Contacted", label: "Not Contacted" },
  { value: "Contacted", label: "Contacted" },
  { value: "Reply Received", label: "Reply Received" },
  { value: "Booked", label: "Booked" },
]

export function StatusCell({ status: initialStatus, username }: StatusCellProps) {
  const [status, setStatus] = useState(initialStatus)
  const [isPending, setIsPending] = useState(false)

  const handleStatusChange = async (newStatus: string) => {
    const originalStatus = status;
    setStatus(newStatus);
    setIsPending(true);

    try {
        await updateLeadStatus(username, newStatus);
    } catch (error) {
        console.error("Failed to update status", error);
        setStatus(originalStatus);
    } finally {
        setIsPending(false);
    }
  }

  const config = statusConfig[status?.toLowerCase()] || statusConfig["not contacted"]
  const StatusIcon = config.icon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all",
            "hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary/20",
            config.bg,
            config.color,
            isPending && "opacity-50"
          )}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <StatusIcon className="h-3 w-3" />
          )}
          <span>{status}</span>
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 rounded-xl">
        {statusOptions.map((option) => {
          const optConfig = statusConfig[option.value.toLowerCase()] || statusConfig["not contacted"]
          const OptIcon = optConfig.icon
          const isSelected = status.toLowerCase() === option.value.toLowerCase()

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handleStatusChange(option.value)}
              className={cn(
                "gap-2 text-xs py-2 rounded-lg cursor-pointer",
                isSelected && "bg-primary/5"
              )}
            >
              <OptIcon className={cn("h-3.5 w-3.5", optConfig.color)} />
              <span className={isSelected ? "font-medium" : ""}>{option.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
