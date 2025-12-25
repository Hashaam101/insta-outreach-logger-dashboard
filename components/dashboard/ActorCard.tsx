"use client"

import * as React from "react"
import {
    MoreVertical,
    User,
    ArrowLeftRight,
    Instagram,
    Loader2,
    Settings,
    ShieldAlert,
    Power,
    CirclePause,
    Ban,
    ShieldOff,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { transferActor, updateActorStatus } from "@/app/actions/governance"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface ActorCardProps {
  actor: {
    USERNAME: string
    OWNER_OPERATOR: string
    STATUS: string
    TOTAL_DMS?: number
    TOTAL_BOOKED?: number
  }
  operators: { OPERATOR_NAME: string }[]
}

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-500/10' },
  { value: 'PAUSED', label: 'Paused', icon: CirclePause, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { value: 'SUSPENDED', label: 'Suspended', icon: ShieldOff, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  { value: 'BANNED', label: 'Banned', icon: Ban, color: 'text-red-500', bgColor: 'bg-red-500/10' },
]

export function ActorCard({ actor, operators }: ActorCardProps) {
  const [isTransferOpen, setIsTransferOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [selectedOperator, setSelectedOperator] = React.useState<string>("")
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)

  const handleTransfer = async () => {
    if (!selectedOperator) {
        toast.error("Please select a new operator")
        return
    }

    setIsPending(true)
    const res = await transferActor(actor.USERNAME, selectedOperator)
    if (res.success) {
      toast.success("Ownership Transferred", {
        description: `@${actor.USERNAME} successfully moved to ${selectedOperator}.`
      })
      setIsTransferOpen(false)
    } else {
      toast.error(res.error || "Transfer failed")
    }
    setIsPending(false)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === actor.STATUS) return

    setIsUpdatingStatus(true)
    const res = await updateActorStatus(actor.USERNAME, newStatus)
    if (res.success) {
      toast.success("Status Updated", {
        description: `@${actor.USERNAME} is now ${newStatus.toLowerCase()}.`
      })
    } else {
      toast.error(res.error || "Status update failed")
    }
    setIsUpdatingStatus(false)
  }

  const currentStatusOption = STATUS_OPTIONS.find(s => s.value === actor.STATUS) || STATUS_OPTIONS[0]

  return (
    <div className="p-5 rounded-2xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all group relative backdrop-blur-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <Instagram className="h-5 w-5 text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-base tracking-tight">@{actor.USERNAME}</h3>
                <Badge variant="outline" className={cn(
                    "text-[8px] h-4 uppercase font-bold px-1.5",
                    currentStatusOption.bgColor,
                    currentStatusOption.color,
                    "border-current/20"
                )}>
                    {actor.STATUS}
                </Badge>
            </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
              {isUpdatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {/* Set Status Submenu */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="gap-2 text-xs py-2">
                <Power className="h-3.5 w-3.5" />
                Set Status
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="w-44">
                  {STATUS_OPTIONS.map((status) => {
                    const Icon = status.icon
                    const isCurrentStatus = actor.STATUS === status.value
                    return (
                      <DropdownMenuItem
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        disabled={isCurrentStatus || isUpdatingStatus}
                        className={cn(
                          "gap-2 text-xs py-2",
                          status.color,
                          isCurrentStatus && "opacity-50"
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {status.label}
                        {isCurrentStatus && <span className="ml-auto text-[10px]">(Current)</span>}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuItem className="gap-2 text-xs py-2">
                <Settings className="h-3.5 w-3.5" /> Account Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator className="opacity-50" />

            <DropdownMenuItem
                onClick={() => setIsTransferOpen(true)}
                className="gap-2 text-xs py-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer Ownership
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats row */}
      {(actor.TOTAL_DMS !== undefined || actor.TOTAL_BOOKED !== undefined) && (
        <div className="flex gap-4 mb-4 text-xs">
          {actor.TOTAL_DMS !== undefined && (
            <div className="flex flex-col">
              <span className="text-lg font-bold">{actor.TOTAL_DMS}</span>
              <span className="text-[9px] uppercase text-muted-foreground font-medium">DMs Sent</span>
            </div>
          )}
          {actor.TOTAL_BOOKED !== undefined && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-green-500">{actor.TOTAL_BOOKED}</span>
              <span className="text-[9px] uppercase text-muted-foreground font-medium">Booked</span>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/5">
        <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-3 w-3 text-primary" />
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none">Current Owner</span>
                <span className="text-xs font-semibold text-foreground/80">{actor.OWNER_OPERATOR}</span>
            </div>
        </div>
      </div>

      <Dialog open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <DialogContent className="sm:max-w-[400px] border-primary/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldAlert className="h-5 w-5" />
                <DialogTitle>Transfer Ownership</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              This will reassign **@{actor.USERNAME}** to a different team member. This action is logged for security.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">New Operator</label>
                <Select onValueChange={setSelectedOperator} defaultValue={selectedOperator}>
                    <SelectTrigger className="bg-background border-primary/10">
                        <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                        {operators.map((op) => (
                            <SelectItem
                                key={op.OPERATOR_NAME}
                                value={op.OPERATOR_NAME}
                                disabled={op.OPERATOR_NAME === actor.OWNER_OPERATOR}
                            >
                                {op.OPERATOR_NAME} {op.OPERATOR_NAME === actor.OWNER_OPERATOR ? "(Current)" : ""}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsTransferOpen(false)} className="text-xs">Cancel</Button>
            <Button
                onClick={handleTransfer}
                disabled={isPending || !selectedOperator}
                className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 text-xs gap-2"
            >
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeftRight className="h-3 w-3" />}
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
