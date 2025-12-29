"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface CustomTooltipProps {
  children: React.ReactNode
  content: string
  icon?: LucideIcon
}

export function CustomTooltip({ children, content, icon: Icon }: CustomTooltipProps) {
  const [isHovered, setIsHovered] = React.useState(false)

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}

      {/* Tooltip Indicator */}
      <div 
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-300 pointer-events-none z-[100]",
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        )}
      >
        <div className="bg-popover/95 border border-primary/10 rounded-lg px-2 py-1 shadow-2xl flex items-center gap-2 scale-90 origin-bottom backdrop-blur-md whitespace-nowrap">
          {Icon && <Icon className="h-3 w-3 text-primary/60" />}
          <span className="text-[10px] font-bold text-primary/60 uppercase tracking-tight">
            {content}
          </span>
        </div>
      </div>
    </div>
  )
}
