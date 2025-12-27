"use client"

import * as React from "react"
import { RefreshCcw, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { refreshData } from "@/app/(dashboard)/leads/actions"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SyncStatus() {
  const [lastSync, setLastSync] = React.useState<string>("Just now")
  const [isRefreshing, setIsPending] = React.useState(false)

  const handleRefresh = async () => {
    setIsPending(true)
    const res = await refreshData()
    if (res.success) {
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      toast.success("Database cache refreshed", {
          description: "All dashboard records are now up to date."
      })
    } else {
      toast.error("Failed to sync with Oracle ATP")
    }
    setIsPending(false)
  }

  return (
    <div className="px-4 py-3 bg-primary/5 border border-primary/10 rounded-xl flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Oracle Cloud</span>
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 hover:bg-primary/10" 
            onClick={handleRefresh}
            disabled={isRefreshing}
        >
            <RefreshCcw className={cn("h-3 w-3 text-primary", isRefreshing && "animate-spin")} />
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
          <Database className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-foreground/80 leading-none">
              Synced: <span className="text-primary font-bold">{lastSync}</span>
          </span>
      </div>
    </div>
  )
}
