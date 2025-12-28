"use client"

import * as React from "react"
import { 
    MoreVertical, 
    User, 
    ArrowLeftRight, 
    Instagram, 
    Loader2, 
    Settings,
    ShieldAlert
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IdTag } from "@/components/ui/id-tag"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
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
import { transferActor } from "@/app/actions/governance"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Actor {
    ACT_ID: string;
    ACT_USERNAME: string;
    OPR_ID: string;
    OPR_NAME: string;
    ACT_STATUS: string;
}

interface Operator {
    OPR_ID: string;
    OPR_NAME: string;
}

interface ActorCardProps {
  actor: Actor;
  operators: Operator[];
}

export function ActorCard({ actor, operators }: ActorCardProps) {
  const [isTransferOpen, setIsTransferOpen] = React.useState(false)
  const [isPending, setIsPending] = React.useState(false)
  const [selectedOperator, setSelectedOperator] = React.useState<string>("")

  const handleTransfer = async () => {
    if (!selectedOperator) {
        toast.error("Please select a new operator")
        return
    }
    
    setIsPending(true)
    const res = await transferActor(actor.ACT_USERNAME, selectedOperator)
    if (res.success) {
      toast.success("Ownership Transferred", {
        description: `${actor.ACT_USERNAME} successfully moved to ${selectedOperator}.`
      })
      setIsTransferOpen(false)
    } else {
      toast.error(res.error || "Transfer failed")
    }
    setIsPending(false)
  }

  return (
    <div className="p-5 rounded-2xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all group relative backdrop-blur-sm">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <Instagram className="h-5 w-5 text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-base tracking-tight">{actor.ACT_USERNAME}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn(
                        "text-[8px] h-4 uppercase font-bold px-1.5",
                        actor.ACT_STATUS === 'Active' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                        {actor.ACT_STATUS}
                    </Badge>
                    <IdTag id={actor.ACT_ID} />
                </div>
            </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/10">
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
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

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary/5">
        <div className="flex items-center gap-2 w-full">
            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="h-3 w-3 text-primary" />
            </div>
            <div className="flex flex-col min-w-0 w-full">
                <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none mb-0.5">Current Owner</span>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground/80 truncate">{actor.OPR_NAME}</span>
                    <IdTag id={actor.OPR_ID} />
                </div>
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
              This will reassign **{actor.ACT_USERNAME}** to a different team member. This action is logged for security.
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
                                key={op.OPR_NAME} 
                                value={op.OPR_NAME}
                                disabled={op.OPR_NAME === actor.OPR_NAME}
                            >
                                {op.OPR_NAME} {op.OPR_NAME === actor.OPR_NAME ? "(Current)" : ""}
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