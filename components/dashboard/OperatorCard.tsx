"use client"

import * as React from "react"
import {
    User,
    Instagram,
    Loader2,
    LineChart,
    Mail,
    Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { InstagramUsername } from "@/components/ui/instagram-username"
import { ActorPerformanceSheet } from "@/components/actors/actor-performance-sheet"
import { OperatorPerformanceSheet } from "@/components/operators/operator-performance-sheet"
import { fetchActorPerformance, fetchOperatorPerformance } from "@/app/(dashboard)/actors/actions"
import { toast } from "sonner"
import { CustomTooltip } from "@/components/ui/custom-tooltip"

// ... (ManagedActor and GroupedOperator remain same) ...

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

export interface ManagedActor {
    ACT_ID: string;
    ACT_USERNAME: string;
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

export interface GroupedOperator {
    OPR_ID: string;
    OPR_NAME: string;
    OPR_EMAIL: string;
    OPR_STATUS: string;
    TOTAL_P1_DMS: string;
    TOTAL_P1_TARGETS: string;
    TOTAL_P1_REPLIES: string;
    TOTAL_P1_WARM: string;
    TOTAL_P1_BOOKED: string;
    TOTAL_P1_PAID: string;
    TOTAL_P2_DMS: string;
    TOTAL_P2_TARGETS: string;
    TOTAL_P2_REPLIES: string;
    TOTAL_P2_WARM: string;
    TOTAL_P2_BOOKED: string;
    TOTAL_P2_PAID: string;
    MANAGED_ACTORS: ManagedActor[];
    TOP_ACTOR: {
        USERNAME: string;
        VALUE: string; // The value of the currently selected metric in Range 2
    };
}

interface OperatorCardProps {
  operator: GroupedOperator;
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

export function OperatorCard({
    operator,
    displayPrefs = { metric1: "DMS", range1: "All Time", metric2: "TARGETS", range2: "All Time" }
}: OperatorCardProps) {
  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isOpSheetOpen, setIsOpSheetOpen] = React.useState(false)
  const [selectedActorHandle, setSelectedActorHandle] = React.useState("")
  const [performanceData, setPerformanceData] = React.useState<PerformanceData | null>(null)
  const [opPerformanceData, setOpPerformanceData] = React.useState<OperatorPerformanceData | null>(null)
  const [isLoadingPerformance, setIsLoadingPerformance] = React.useState(false)
  const [isLoadingOpPerformance, setIsLoadingOpPerformance] = React.useState(false)
  const val1 = operator[`TOTAL_P1_${displayPrefs.metric1}` as keyof GroupedOperator] as string;
  const val2 = operator.TOP_ACTOR.VALUE;

  const handleOpenPerformance = async (handle: string) => {
      setSelectedActorHandle(handle);
      setIsLoadingPerformance(true);
      try {
          const data = await fetchActorPerformance(handle);
          setPerformanceData(data);
          setIsSheetOpen(true);
      } catch {
          toast.error("Failed to load performance data");
      } finally {
          setIsLoadingPerformance(false);
      }
  }

  const handleOpenOpPerformance = async () => {
      setIsLoadingOpPerformance(true);
      try {
          const data = await fetchOperatorPerformance(operator.OPR_NAME);
          setOpPerformanceData(data);
          setIsOpSheetOpen(true);
      } catch {
          toast.error("Failed to load operator performance data");
      } finally {
          setIsLoadingOpPerformance(false);
      }
  }

  return (
    <div className="p-5 rounded-2xl bg-card/40 border border-primary/10 hover:border-primary/30 transition-all group relative backdrop-blur-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-xl">
                <User className="h-5 w-5 text-primary" />
            </div>
            <div>
                <h3 className="font-bold text-base tracking-tight">{operator.OPR_NAME}</h3>
                <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={cn(
                        "text-[8px] h-4 uppercase font-bold px-1.5",
                        operator.OPR_STATUS === 'online' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                    )}>
                        {operator.OPR_STATUS}
                    </Badge>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
                        <Mail className="h-2.5 w-2.5" />
                        {operator.OPR_EMAIL}
                    </div>
                </div>
            </div>
        </div>
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
                  Top Actor: {METRIC_LABELS[displayPrefs.metric2]}
              </p>
              <div className="flex items-baseline gap-1.5">
                  <p className="text-xl font-bold leading-none text-primary/80">{val2}</p>
                  <span className="text-[8px] font-bold text-muted-foreground/40 uppercase flex items-center gap-1">
                    {displayPrefs.range2} • 
                    <CustomTooltip content="View Performance" icon={Activity}>
                        <button 
                            onClick={() => handleOpenPerformance(operator.TOP_ACTOR.USERNAME)}
                            disabled={isLoadingPerformance}
                            className="hover:text-primary cursor-pointer transition-colors hover:underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {operator.TOP_ACTOR.USERNAME}
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
        onClick={handleOpenOpPerformance}
        disabled={isLoadingOpPerformance}
      >
        {isLoadingOpPerformance ? <Loader2 className="h-3 w-3 animate-spin" /> : <LineChart className="h-3 w-3 text-primary" />}
        Performance Info
      </Button>

      <div className="mt-auto pt-4 border-t border-primary/5 space-y-3">
        <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider leading-none">Managed Actors</p>
            <Badge variant="outline" className="text-[8px] h-3.5 px-1 font-bold bg-primary/5 border-primary/10">
                {operator.MANAGED_ACTORS.length} ASSETS
            </Badge>
        </div>
        <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-thin">
            {operator.MANAGED_ACTORS.map((actor) => (
                <div key={actor.ACT_ID} className="flex items-center justify-between group/act">
                    <div className="flex items-center gap-2 min-w-0">
                        <Instagram className="h-3 w-3 text-primary/60 shrink-0" />
                        <InstagramUsername username={actor.ACT_USERNAME} className="text-[11px]" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn(
                            "text-[9px] h-4.5 px-2 uppercase font-bold",
                            actor.ACT_STATUS === 'Active' ? "border-green-500/30 text-green-500" : "border-red-500/30 text-red-500"
                        )}>
                            {actor.ACT_STATUS === 'Active' ? 'Live' : 'OFF'}
                        </Badge>
                        <CustomTooltip content="Actor Stats" icon={Activity}>
                            <button 
                                onClick={() => handleOpenPerformance(actor.ACT_USERNAME)}
                                disabled={isLoadingPerformance}
                                className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                            >
                                {isLoadingPerformance && selectedActorHandle === actor.ACT_USERNAME ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Activity className="h-3 w-3" />
                                )}
                            </button>
                        </CustomTooltip>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {selectedActorHandle && (
          <ActorPerformanceSheet 
            actorHandle={selectedActorHandle}
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            data={performanceData}
          />
      )}

      <OperatorPerformanceSheet 
        operatorName={operator.OPR_NAME}
        isOpen={isOpSheetOpen}
        onOpenChange={setIsOpSheetOpen}
        data={opPerformanceData}
      />
    </div>
  )
}