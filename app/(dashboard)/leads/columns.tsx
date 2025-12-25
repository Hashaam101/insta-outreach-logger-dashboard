"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { StatusCell } from "@/components/leads/status-cell"
import { NotesSheet } from "@/components/leads/notes-sheet"
import {
    ExternalLink,
    Mail,
    Phone,
    Calendar,
    MoreHorizontal,
    ArrowLeftRight,
    MessageSquare,
    UserCircle,
    Instagram,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { TransferLeadDialog } from "@/components/governance/transfer-lead-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type Lead = {
  target_username: string
  full_name: string
  status: string
  last_updated: string
  first_contacted?: string
  email?: string
  phone_number?: string
  source?: string
  owner_actor?: string
}

function formatDate(dateStr: string | undefined) {
    if (!dateStr) return null
    try {
        const date = new Date(dateStr)
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })
    } catch {
        return null
    }
}

function formatRelativeTime(dateStr: string | undefined) {
    if (!dateStr) return null
    try {
        const date = new Date(dateStr)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays}d ago`
        if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
        return `${Math.floor(diffDays / 30)}mo ago`
    } catch {
        return null
    }
}

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "target_username",
    header: () => <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Prospect</div>,
    cell: ({ row }) => {
      const username = row.getValue("target_username") as string
      const actor = row.original.owner_actor
      return (
        <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                <Instagram className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="text-sm font-semibold leading-none">@{username}</span>
                {actor && (
                    <span className="text-[10px] text-muted-foreground">via @{actor}</span>
                )}
            </div>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: () => <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const username = row.getValue("target_username") as string
      return <StatusCell status={status} username={username} />
    },
  },
  {
    id: "contact_info",
    header: () => <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Contact</div>,
    cell: ({ row }) => {
      const email = row.original.email
      const phone = row.original.phone_number
      const hasEmail = email && email.length > 0
      const hasPhone = phone && phone.length > 0

      if (!hasEmail && !hasPhone) {
        return <span className="text-xs text-muted-foreground/50 italic">No data</span>
      }

      return (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            {hasEmail && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center cursor-pointer hover:bg-blue-500/20 transition-colors">
                    <Mail className="h-3.5 w-3.5 text-blue-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {email}
                </TooltipContent>
              </Tooltip>
            )}
            {hasPhone && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center cursor-pointer hover:bg-emerald-500/20 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {phone}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </TooltipProvider>
      )
    },
  },
  {
    id: "timeline",
    header: () => <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Timeline</div>,
    cell: ({ row }) => {
      const lastUpdated = row.original.last_updated
      const firstContacted = row.original.first_contacted
      const relativeTime = formatRelativeTime(lastUpdated)
      const contactedDate = formatDate(firstContacted)

      return (
        <div className="flex flex-col gap-0.5">
          {relativeTime && (
            <div className="flex items-center gap-1.5 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-foreground font-medium">{relativeTime}</span>
            </div>
          )}
          {contactedDate && (
            <span className="text-[10px] text-muted-foreground">First: {contactedDate}</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "source",
    header: () => <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground hidden lg:block">Source</div>,
    cell: ({ row }) => {
      const source = row.getValue("source") as string
      if (!source) return <span className="text-muted-foreground/50 hidden lg:block">-</span>
      return (
        <Badge variant="outline" className="text-[10px] font-medium bg-background/50 hidden lg:inline-flex">
          {source.length > 20 ? source.slice(0, 20) + "..." : source}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    header: () => <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</div>,
    cell: ({ row }) => {
        const username = row.getValue("target_username") as string
        const [isTransferOpen, setIsTransferOpen] = React.useState(false)
        const [isNotesOpen, setIsNotesOpen] = React.useState(false)

        return (
            <div className="flex justify-end items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsNotesOpen(true)}
                    className="h-8 px-2 text-xs gap-1.5 hover:bg-primary/10"
                >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Notes</span>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl">
                        <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider px-2 py-1.5">
                            Lead Operations
                        </DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setIsNotesOpen(true)} className="gap-2 text-xs py-2 rounded-lg">
                            <MessageSquare className="h-3.5 w-3.5 text-primary" /> CRM Notes & History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-xs py-2 rounded-lg">
                            <ExternalLink className="h-3.5 w-3.5 text-primary" /> View Instagram Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem
                            onClick={() => setIsTransferOpen(true)}
                            className="gap-2 text-xs py-2 rounded-lg text-red-500 focus:text-red-500 focus:bg-red-500/10"
                        >
                            <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer to different Actor
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Controlled Components */}
                <div className="hidden">
                    <TransferLeadDialog
                        targetUsername={username}
                        open={isTransferOpen}
                        onOpenChange={setIsTransferOpen}
                    />
                    <NotesSheet
                        username={username}
                        open={isNotesOpen}
                        onOpenChange={setIsNotesOpen}
                    />
                </div>
            </div>
        )
    }
  },
]
