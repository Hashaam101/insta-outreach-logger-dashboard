"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface IdTagProps {
  id: string
  className?: string
}

export function IdTag({ id, className }: IdTagProps) {
  const [copied, setCopied] = React.useState(false)

  if (!id) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopied(true)
    toast.success("ID copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  // Display only first 9 characters as requested
  const displayId = id.slice(0, 9);

  return (
    <div 
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center justify-center w-fit gap-2 rounded-lg border border-border/40 bg-muted/30 px-2.5 py-1.5 text-[10px] font-bold font-mono text-muted-foreground transition-all hover:bg-primary/10 hover:border-primary/20 hover:text-primary cursor-pointer select-none group/id-tag",
        className
      )}
      title={id}
    >
      <span className="leading-none inline-block">{displayId}</span>
      <div className="flex items-center justify-center w-3 h-3 shrink-0">
        {copied ? (
          <Check className="h-2.5 w-2.5 text-primary" />
        ) : (
          <Copy className="h-2 w-2 opacity-40 group-hover/id-tag:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  )
}