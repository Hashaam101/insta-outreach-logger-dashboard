"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { useTimeContext } from "./time-context"
import { cn } from "@/lib/utils"

interface TimeDisplayProps {
  date: Date | string | null
  className?: string
  showIcon?: boolean
}

function formatTimeAgo(date: Date) {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    const diffInSecs = Math.floor(diffInMs / 1000);
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInSecs < 30) return "just now";
    if (diffInSecs < 60) return `${diffInSecs}s ago`;
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${diffInDays}d ago`;
}

export function TimeDisplay({ date, className, showIcon = true }: TimeDisplayProps) {
  const { format } = useTimeContext()
  const [mounted, setMounted] = React.useState(false)
  const [, setTick] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(timer)
  }, [])

  // IMPORTANT: SSR and the very first client render MUST be identical.
  // We render a placeholder during this phase to avoid hydration mismatch.
  if (!mounted || !date) {
      return (
          <span className={cn("inline-flex items-center gap-1.5", className)}>
              {showIcon && <Clock className="h-3 w-3 opacity-50" />}
              {date ? "--" : "--"}
          </span>
      )
  }

  const d = new Date(date)
  let displayString = ""
  
  try {
      switch (format) {
        case "Ago":
          displayString = formatTimeAgo(d)
          break
        case "12h":
          displayString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          break
        case "24h":
          displayString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
          break
        case "Full":
          displayString = `${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          break
      }
  } catch (_e) {
      displayString = "Invalid Date"
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap", className)}>
      {showIcon && <Clock className="h-3 w-3 opacity-50" />}
      {displayString}
    </span>
  )
}