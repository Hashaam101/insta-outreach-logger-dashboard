"use client"

import * as React from "react"
import { RefreshCcw, Database, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { smartSync, checkSyncStatus, forceSync } from "@/app/actions/sync"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SyncStatus() {
  const [mounted, setMounted] = React.useState(false)
  const [lastSync, setLastSync] = React.useState<string>("--")
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(false)

  // Avoid hydration mismatch by only showing time on client
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Check for changes on mount and periodically
  React.useEffect(() => {
    const checkChanges = async () => {
      setIsChecking(true)
      try {
        const status = await checkSyncStatus()
        setHasChanges(status.hasChanges)
        if (status.lastSyncAt) {
          const date = new Date(status.lastSyncAt)
          setLastSync(date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }))
        }
      } catch {
        // Silently fail on check
      }
      setIsChecking(false)
    }

    checkChanges()
    // Check every 2 minutes for new changes
    const interval = setInterval(checkChanges, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSmartSync = async () => {
    setIsRefreshing(true)
    try {
      const res = await smartSync()
      if (res.success) {
        if (res.synced) {
          setLastSync(new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }))
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

  const handleForceSync = async () => {
    setIsRefreshing(true)
    try {
      const res = await forceSync()
      if (res.success) {
        setLastSync(new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }))
        setHasChanges(false)
        toast.success("Force sync completed", {
          description: "All caches cleared and refreshed."
        })
      } else {
        toast.error("Force sync failed")
      }
    } catch {
      toast.error("Failed to force sync")
    }
    setIsRefreshing(false)
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
            Synced: <span className={cn(
              "font-bold",
              hasChanges ? "text-amber-500" : "text-primary"
            )}>{mounted ? lastSync : "--"}</span>
          </span>
        </div>
        {!hasChanges && mounted && lastSync !== "--" && (
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
