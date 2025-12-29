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
    Share2,
    Check,
    LineChart,
    Activity
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
import { transferActor, shareActor, updateActorStatus } from "@/app/actions/governance"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { ActorPerformanceSheet } from "@/components/actors/actor-performance-sheet"
import { OperatorPerformanceSheet } from "@/components/operators/operator-performance-sheet"
import { fetchActorPerformance, fetchOperatorPerformance } from "@/app/(dashboard)/actors/actions"
import { InstagramUsername } from "@/components/ui/instagram-username"
import { CustomTooltip } from "@/components/ui/custom-tooltip"

export interface ActorAssignment {
    ACT_ID: string;
    OPR_ID: string;
    OPR_NAME: string;
    ACT_STATUS: string;
    P1_DMS: string;
    P1_TARGETS: string;
    P1_REPLIES: string;
    P1_WARM: string;
    P1_BOOKED: string;
    P1_PAID: string;
    P2_DMS: string;
    P2_TARGETS: string;
    P2_REPLIES: string;
    P2_WARM: string;
    P2_BOOKED: string;
    P2_PAID: string;
}

export interface GroupedActor {
    ACT_USERNAME: string;
    F1_DMS: string;
    F1_TARGETS: string;
    F1_REPLIES: string;
    F1_WARM: string;
    F1_BOOKED: string;
    F1_PAID: string;
    F2_DMS: string;
    F2_TARGETS: string;
    F2_REPLIES: string;
    F2_WARM: string;
    F2_BOOKED: string;
    F2_PAID: string;
    ASSIGNMENTS: ActorAssignment[];
    TOP_OPERATOR: {
        NAME: string;
        VALUE: string; // The value of the currently selected metric in Range 2
    };
}

interface PerformanceData {
    info: {
        ACT_STATUS: string;
        CREATED_AT: string;
        LAST_ACTIVITY: string;
        TOTAL_SEATS: string;
    };
    volume: { LOG_DATE: string; TOTAL: string }[];
    operatorBreakdown: { OPR_NAME: string; TOTAL: string }[];
    recentLogs: {
        TAR_USERNAME: string;
        TAR_STATUS: string;
        CONT_SOURCE: string;
        MESSAGE_TEXT: string;
        SENT_AT: string;
        OPR_NAME: string;
        ACT_USERNAME: string;
    }[];
    eventDistribution: { EVENT_TYPE: string; TOTAL: string }[];
    totalDms: number;
}

interface OperatorPerformanceData {
    info: {
        OPR_ID: string;
        OPR_NAME: string;
        OPR_EMAIL: string;
        OPR_STATUS: string;
        CREATED_AT: string;
        LAST_ACTIVITY: string;
    };
    volume: { LOG_DATE: string; TOTAL: string }[];
    actorBreakdown: { ACT_USERNAME: string; TOTAL: string }[];
    statusDistribution: { STATUS: string; TOTAL: string }[];
    recentLogs: {
        TAR_USERNAME: string;
        TAR_STATUS: string;
        MESSAGE_TEXT: string;
        SENT_AT: string;
        OPR_NAME: string;
        ACT_USERNAME: string;
    }[];
    totalDms: number;
}

interface Operator {
    OPR_ID: string;
    OPR_NAME: string;
}

interface ActorCardProps {
  actor: GroupedActor;
  operators: Operator[];
  displayPrefs: {
      metric1: string;
      range1: string;
      metric2: string;
      range2: string;
  }
}

const METRIC_LABELS: Record<string, string> = {
    "DMS": "Total Messages",
    "TARGETS": "Profiles Contacted",
    "REPLIES": "Replies Received",
    "WARM": "Warm Leads",
    "BOOKED": "Bookings Made",
    "PAID": "Payments",
};

export function ActorCard({ 
    actor, 
    operators, 
    displayPrefs = { metric1: "DMS", range1: "All Time", metric2: "TARGETS", range2: "All Time" } 
}: ActorCardProps) {
  const [activeDialog, setActiveDialog] = React.useState<'transfer' | 'share' | 'settings' | null>(null)
  const [isPending, setIsPending] = React.useState(false)
  const [selectedOperator, setSelectedOperator] = React.useState<string>("")
  const [selectedAssignmentId, setSelectedAssignmentId] = React.useState<string>(actor.ASSIGNMENTS[0]?.ACT_ID || "")
  const [newStatus, setNewStatus] = React.useState<string>("")

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isOpSheetOpen, setIsOpSheetOpen] = React.useState(false)
  const [selectedOperatorName, setSelectedOperatorName] = React.useState("")
  const [performanceData, setPerformanceData] = React.useState<PerformanceData | null>(null)
  const [opPerformanceData, setOpPerformanceData] = React.useState<OperatorPerformanceData | null>(null)
  const [isLoadingPerformance, setIsLoadingPerformance] = React.useState(false)
  const [isLoadingOpPerformance, setIsLoadingOpPerformance] = React.useState(false)

  // Get values based on prefs
  const val1 = actor[`F1_${displayPrefs.metric1}` as keyof GroupedActor] as string;
  const val2 = actor.TOP_OPERATOR.VALUE;


  // Reset local state when dialog opens/closes
  React.useEffect(() => {
    if (activeDialog === 'settings') {
        const assignment = actor.ASSIGNMENTS.find(a => a.ACT_ID === selectedAssignmentId);
        if (assignment) setNewStatus(assignment.ACT_STATUS);
    } else if (activeDialog) {
        setSelectedOperator("");
    }
  }, [activeDialog, selectedAssignmentId, actor.ASSIGNMENTS]);

  const handleOpenPerformance = async () => {
      setIsLoadingPerformance(true);
      try {
          const data = await fetchActorPerformance(actor.ACT_USERNAME);
          setPerformanceData(data);
          setIsSheetOpen(true);
      } catch {
          toast.error("Failed to load performance data");
      } finally {
          setIsLoadingPerformance(false);
      }
  }

  const handleOpenOpPerformance = async (name: string) => {
      setSelectedOperatorName(name);
      setIsLoadingOpPerformance(true);
      try {
          const data = await fetchOperatorPerformance(name);
          setOpPerformanceData(data);
          setIsOpSheetOpen(true);
      } catch {
          toast.error("Failed to load operator performance data");
      } finally {
          setIsLoadingOpPerformance(false);
      }
  }

  const handleTransfer = async () => {
    if (!selectedOperator || !selectedAssignmentId) return
    setIsPending(true)
    const res = await transferActor(selectedAssignmentId, selectedOperator)
    if (res.success) {
      toast.success("Ownership Transferred")
      setActiveDialog(null)
    } else {
      toast.error(res.error || "Transfer failed")
    }
    setIsPending(false)
  }

  const handleShare = async () => {
    if (!selectedOperator) return
    setIsPending(true)
    const res = await shareActor(actor.ACT_USERNAME, selectedOperator)
    if (res.success) {
      toast.success("Actor Shared", {
        description: `${actor.ACT_USERNAME} is now also accessible by ${selectedOperator}.`
      })
      setActiveDialog(null)
    } else {
      toast.error(res.error || "Sharing failed")
    }
    setIsPending(false)
  }

  const handleUpdateStatus = async () => {
    if (!selectedAssignmentId) return;
    setIsPending(true)
    const res = await updateActorStatus(selectedAssignmentId, newStatus)
    if (res.success) {
      toast.success("Status Updated")
      setActiveDialog(null)
    } else {
      toast.error(res.error || "Update failed")
    }
    setIsPending(false)
  }

  return (
    <div className="p-5 rounded-2xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all group relative backdrop-blur-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <Instagram className="h-5 w-5 text-primary" />
            </div>
            <div>
                <InstagramUsername username={actor.ACT_USERNAME} className="text-base" />
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-[8px] h-4 uppercase font-bold px-1.5 bg-primary/5 text-primary border-primary/10">
                        {actor.ASSIGNMENTS.length > 1 ? `${actor.ASSIGNMENTS.length} SEATS` : 'SINGLE SEAT'}
                    </Badge>
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
            <DropdownMenuItem onClick={() => setActiveDialog('settings')} className="gap-2 text-xs py-2">
                <Settings className="h-3.5 w-3.5" /> Account Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setActiveDialog('share')} className="gap-2 text-xs py-2">
                <Share2 className="h-3.5 w-3.5" /> Share Account
            </DropdownMenuItem>
            <DropdownMenuSeparator className="opacity-50" />
            <DropdownMenuItem 
                onClick={() => setActiveDialog('transfer')} 
                className="gap-2 text-xs py-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer Ownership
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl bg-primary/5 border border-primary/5">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  {METRIC_LABELS[displayPrefs.metric1]}
              </p>
              <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold leading-none">{val1}</p>
                  <span className="text-[8px] font-bold text-primary/40 uppercase">{displayPrefs.range1}</span>
              </div>
          </div>
          <div className="p-2.5 rounded-xl bg-background border border-primary/5 shadow-inner">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                  Top: {METRIC_LABELS[displayPrefs.metric2]}
              </p>
              <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold leading-none text-primary/80">{val2}</p>
                  <span className="text-[8px] font-bold text-muted-foreground/40 uppercase flex items-center gap-1">
                    {displayPrefs.range2} • 
                    <CustomTooltip content="View Performance" icon={Activity}>
                        <button 
                            onClick={() => handleOpenOpPerformance(actor.TOP_OPERATOR.NAME)}
                            disabled={isLoadingOpPerformance}
                            className="hover:text-primary cursor-pointer transition-colors hover:underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {actor.TOP_OPERATOR.NAME.split(' ')[0]}
                        </button>
                    </CustomTooltip>
                  </span>
              </div>
          </div>
      </div>

      <Button 
        variant="outline" 
        size="sm" 
        className="w-full h-7 text-[10px] font-bold uppercase tracking-widest gap-2 rounded-lg border-primary/10 hover:bg-primary/5 mb-4"
        onClick={handleOpenPerformance}
        disabled={isLoadingPerformance}
      >
        {isLoadingPerformance ? <Loader2 className="h-3 w-3 animate-spin" /> : <LineChart className="h-3 w-3 text-primary" />}
        Performance Info
      </Button>

      <div className="mt-auto pt-4 border-t border-primary/5 space-y-3">
        <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider leading-none">Active Operators</p>
        <div className="space-y-2">
            {actor.ASSIGNMENTS.map((as) => (
                <div key={as.ACT_ID} className="flex items-center justify-between group/op">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-xs font-semibold text-foreground/80 truncate">{as.OPR_NAME}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn(
                            "text-[9px] h-4.5 px-2 uppercase font-bold",
                            as.ACT_STATUS === 'Active' ? "border-green-500/30 text-green-500" : "border-red-500/30 text-red-500"
                        )}>
                            {as.ACT_STATUS === 'Active' ? 'Live' : 'OFF'}
                        </Badge>
                        <CustomTooltip content="Operator Stats" icon={Activity}>
                            <button 
                                onClick={() => handleOpenOpPerformance(as.OPR_NAME)}
                                disabled={isLoadingOpPerformance}
                                className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                            >
                                {isLoadingOpPerformance && selectedOperatorName === as.OPR_NAME ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Activity className="h-3 w-3" />
                                )}
                            </button>
                        </CustomTooltip>
                        <IdTag id={as.ACT_ID} />
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={activeDialog === 'transfer'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[400px] border-primary/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-500 mb-2">
                <ShieldAlert className="h-5 w-5" />
                <DialogTitle>Transfer Assignment</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Reassign a specific operator seat for **{actor.ACT_USERNAME}** to another team member.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Select Seat to Transfer</label>
                <Select onValueChange={setSelectedAssignmentId} value={selectedAssignmentId}>
                    <SelectTrigger className="bg-background border-primary/10">
                        <SelectValue placeholder="Select assignment" />
                    </SelectTrigger>
                    <SelectContent>
                        {actor.ASSIGNMENTS.map((as) => (
                            <SelectItem key={as.ACT_ID} value={as.ACT_ID}>
                                {as.OPR_NAME} ({as.ACT_ID})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">New Operator</label>
                <Select onValueChange={setSelectedOperator} value={selectedOperator}>
                    <SelectTrigger className="bg-background border-primary/10">
                        <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                        {operators.map((op) => (
                            <SelectItem key={op.OPR_ID} value={op.OPR_NAME} disabled={actor.ASSIGNMENTS.some(as => as.OPR_NAME === op.OPR_NAME)}>
                                {op.OPR_NAME}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveDialog(null)} className="text-xs">Cancel</Button>
            <Button type="button" onClick={handleTransfer} disabled={isPending || !selectedOperator} className="bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 text-xs gap-2">
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowLeftRight className="h-3 w-3" />}
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={activeDialog === 'share'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[400px] border-primary/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
                <Share2 className="h-5 w-5" />
                <DialogTitle>Share Account</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Add another team member as an operator for **{actor.ACT_USERNAME}**.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Add Operator</label>
                <Select onValueChange={setSelectedOperator} value={selectedOperator}>
                    <SelectTrigger className="bg-background border-primary/10">
                        <SelectValue placeholder="Select a team member" />
                    </SelectTrigger>
                    <SelectContent>
                        {operators.map((op) => (
                            <SelectItem key={op.OPR_ID} value={op.OPR_NAME} disabled={actor.ASSIGNMENTS.some(as => as.OPR_NAME === op.OPR_NAME)}>
                                {op.OPR_NAME}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveDialog(null)} className="text-xs">Cancel</Button>
            <Button type="button" onClick={handleShare} disabled={isPending || !selectedOperator} className="shadow-lg shadow-primary/20 text-xs gap-2">
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
              Grant Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={activeDialog === 'settings'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <DialogContent className="sm:max-w-[400px] border-primary/20 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-2">
                <Settings className="h-5 w-5" />
                <DialogTitle>Account Settings</DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              Update operational status for specific operator assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Select Seat to Configure</label>
                <Select onValueChange={setSelectedAssignmentId} value={selectedAssignmentId}>
                    <SelectTrigger className="bg-background border-primary/10">
                        <SelectValue placeholder="Select assignment" />
                    </SelectTrigger>
                    <SelectContent>
                        {actor.ASSIGNMENTS.map((as) => (
                            <SelectItem key={as.ACT_ID} value={as.ACT_ID}>
                                {as.OPR_NAME} ({as.ACT_ID})
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">New Status</label>
                <Select onValueChange={setNewStatus} value={newStatus}>
                    <SelectTrigger className="bg-background border-primary/10">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Suspended By Team">Suspended By Team</SelectItem>
                        <SelectItem value="Suspended By Insta">Suspended By Insta</SelectItem>
                        <SelectItem value="Discarded">Discarded</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setActiveDialog(null)} className="text-xs">Cancel</Button>
            <Button type="button" onClick={handleUpdateStatus} disabled={isPending} className="shadow-lg shadow-primary/20 text-xs gap-2">
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Performance Side Sheet */}
      <ActorPerformanceSheet 
        actorHandle={actor.ACT_USERNAME}
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        data={performanceData}
      />

      <OperatorPerformanceSheet 
        operatorName={selectedOperatorName}
        isOpen={isOpSheetOpen}
        onOpenChange={setIsOpSheetOpen}
        data={opPerformanceData}
      />
    </div>
  )
}