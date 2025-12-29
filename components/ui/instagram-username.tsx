"use client"

import * as React from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface InstagramUsernameProps {
  username: string
  className?: string
  showIcon?: boolean
}

export const InstagramUsername = React.forwardRef<HTMLDivElement, InstagramUsernameProps>(
  ({ username, className, showIcon: _showIcon = true }, ref) => {
    const [isCopied, setIsCopied] = React.useState(false)
    const [isHovered, setIsHovered] = React.useState(false)
    const [isIconHovered, setIsIconHovered] = React.useState(false)

    const handleCopy = async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      try {
        await navigator.clipboard.writeText(username)
        setIsCopied(true)
        toast.success(`@${username} copied to clipboard`)
        setTimeout(() => setIsCopied(false), 2000)
      } catch (_err) {
        toast.error("Failed to copy username")
      }
    }

    const handleOpenProfile = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      window.open(`https://instagram.com/${username}`, "_blank", "noopener,noreferrer")
    }

    return (
      <div 
        ref={ref}
        className={cn("inline-flex items-center gap-1.5 group/insta relative", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
            setIsHovered(false)
            setIsIconHovered(false)
        }}
      >
        <div 
          onClick={handleCopy}
          className="relative flex items-center cursor-pointer"
        >
          {/* The Username Text */}
          <span className="relative z-10 font-bold transition-colors group-hover/insta:text-primary/80">
            {username}
          </span>

          {/* Tooltip Indicator */}
          <div 
            className={cn(
              "absolute -top-7 left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-300 pointer-events-none z-[100]",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            )}
          >
            <div className="bg-popover/95 border border-primary/10 rounded-lg px-2 py-1 shadow-2xl flex items-center gap-2 scale-90 origin-bottom backdrop-blur-md">
              {isCopied ? (
                <>
                  <Check className="h-3 w-3 text-green-500/70" />
                  <span className="text-[10px] font-bold text-green-500/70 uppercase tracking-tight">Copied</span>
                </>
              ) : isIconHovered ? (
                <>
                  <ExternalLink className="h-3 w-3 text-primary/60" />
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-tight whitespace-nowrap">Goto Profile</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3 text-primary/60" />
                  <span className="text-[10px] font-bold text-primary/60 uppercase tracking-tight whitespace-nowrap">Click to Copy</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Redirection Icon */}
        <button
          onClick={handleOpenProfile}
          onMouseEnter={() => setIsIconHovered(true)}
          onMouseLeave={() => setIsIconHovered(false)}
          className={cn(
            "p-1 rounded-md hover:bg-primary/5 hover:text-primary/70 transition-all duration-200",
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1 pointer-events-none"
          )}
          title="Open profile"
        >
          <ExternalLink className="h-3 w-3" />
        </button>
      </div>
    )
  }
)

InstagramUsername.displayName = "InstagramUsername"
