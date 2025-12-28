"use client"

import * as React from "react"
import { Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface IdTagProps {
  id: string
  className?: string
  fullWidth?: boolean
}

export function IdTag({ id, className, fullWidth = false }: IdTagProps) {
  const [copied, setCopied] = React.useState(false)

  if (!id) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(id)
    setCopied(true)
    toast.success("ID copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  // Truncate logic: Show first 8 chars (e.g., "OPR-A1B2")
  const displayId = fullWidth ? id : (id.length > 10 ? `${id.slice(0, 10)}...` : id);

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border/50 bg-muted/50 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
      title={id}
    >
      <span>{displayId}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-3 w-3 p-0 hover:bg-transparent text-muted-foreground hover:text-primary"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-2 w-2" />
        ) : (
          <Copy className="h-2 w-2" />
        )}
        <span className="sr-only">Copy ID</span>
      </Button>
    </div>
  )
}
