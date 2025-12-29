"use client"

import * as React from "react"
import { RefreshCcw, Database, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { smartSync, checkSyncStatus } from "@/app/actions/sync"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { TimeDisplay } from "./time-display"

export function SyncStatus() {
  const [mounted, setMounted] = React.useState(false)
  const [lastSyncTs, setLastSyncTs] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(false)
  const [lastAutoSync, setLastAutoSync] = React.useState<number>(0)

  // Initialization
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Check for changes periodically
  React.useEffect(() => {
    if (!mounted) return;

    const checkAndAutoSync = async () => {
      setIsChecking(true)
      try {
        const status = await checkSyncStatus()
        setHasChanges(status.hasChanges)
        
        if (status.lastSyncAt) {
          setLastSyncTs(status.lastSyncAt)
        }

        // Auto-sync logic: If changes exist and cooldown (2 mins) passed
        const now = Date.now()
        if (status.hasChanges && (now - lastAutoSync > 2 * 60 * 1000)) {
            const res = await smartSync()
            if (res.success && res.synced) {
                setLastAutoSync(now)
                setHasChanges(false)
                if (res.timestamp) {
                    setLastSyncTs(res.timestamp)
                }
            }
        }
      } catch {
        // Silently fail on check
      }
      setIsChecking(false)
    }

    checkAndAutoSync()
    const interval = setInterval(checkAndAutoSync, 30 * 1000)
    return () => clearInterval(interval)
  }, [mounted, lastAutoSync])

  const handleSmartSync = async () => {
    setIsRefreshing(true)
    try {
      const res = await smartSync()
      if (res.success) {
        if (res.synced) {
          setLastSyncTs(res.timestamp || new Date().toISOString())
          setHasChanges(false)

          if (res.delta) {
            const parts = []
            if (res.delta.newLogs > 0) parts.push(`${res.delta.newLogs} logs`)
            if (res.delta.updatedTargets > 0) parts.push(`${res.delta.updatedTargets} targets`)
            if (res.delta.actorChanges > 0) parts.push(`${res.delta.actorChanges} actors`)

            toast.success("Synced with Oracle ATP", {
              description: parts.length > 0
                ? `Updated: ${parts.join(', ')}`
                : res.message
            })
          } else {
            toast.success("Full sync completed")
          }
        } else {
          toast.info("Already up to date", {
            description: "No new changes since last sync."
          })
        }
      } else {
        toast.error(res.message || "Sync failed")
      }
    } catch {
      toast.error("Failed to sync with Oracle ATP")
    }
    setIsRefreshing(false)
  }

  // SSR Placeholder
  if (!mounted) {
      return (
        <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                        Oracle Cloud
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Database className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[11px] font-semibold text-foreground/80 leading-none">
                        Synced: <span className="font-bold text-primary">--</span>
                    </span>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-1.5 w-1.5 rounded-full",
            hasChanges ? "bg-amber-500 animate-pulse" : "bg-green-500",
            isChecking && "animate-pulse"
          )} />
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
            Oracle Cloud
          </span>
        </div>
        <div className="flex items-center gap-1">
          {hasChanges && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="h-5 w-5 flex items-center justify-center">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[10px]">
                New changes available
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:bg-primary/10"
                onClick={handleSmartSync}
                disabled={isRefreshing}
              >
                <RefreshCcw className={cn(
                  "h-3 w-3 text-primary",
                  isRefreshing && "animate-spin"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-[10px]">
              {hasChanges ? "Sync new changes" : "Check for updates"}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-foreground/80 leading-none">
            Synced: <TimeDisplay date={lastSyncTs} showIcon={false} className="font-bold text-primary" />
          </span>
        </div>
        {!hasChanges && lastSyncTs && (
          <Check className="h-3 w-3 text-green-500" />
        )}
      </div>

      {hasChanges && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[10px] bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-600"
          onClick={handleSmartSync}
          disabled={isRefreshing}
        >
          <RefreshCcw className={cn("h-3 w-3 mr-1.5", isRefreshing && "animate-spin")} />
          Sync Changes
        </Button>
      )}
    </div>
  )
}