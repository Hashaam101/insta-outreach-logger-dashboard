"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { StatusCell } from "@/components/leads/status-cell"
import { NotesSheet } from "@/components/leads/notes-sheet"
import { ExternalLink, Mail, Phone, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export type Lead = {
  target_username: string
  full_name: string
  status: string
  last_updated: string
  email?: string
  phone_number?: string
  source?: string
}

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "status",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</div>,
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const username = row.getValue("target_username") as string
      return <StatusCell status={status} username={username} />
    },
  },
  {
    accessorKey: "target_username",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prospect</div>,
    cell: ({ row }) => {
        const username = row.getValue("target_username") as string
        return (
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 font-bold text-sm">
                    <span className="text-primary">@</span>
                    {username}
                    <a href={`https://instagram.com/${username}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="h-3 w-3" />
                    </a>
                </div>
                <div className="text-[10px] text-muted-foreground/80 font-medium">
                    {row.original.source || "Organic Lead"}
                </div>
            </div>
        )
    },
  },
  {
    accessorKey: "enrichment",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">Data</div>,
    cell: ({ row }) => {
        const hasEmail = !!row.original.email;
        const hasPhone = !!row.original.phone_number;
        return (
            <div className="flex items-center justify-center gap-2">
                <div className={cn("p-1.5 rounded-lg border transition-colors", hasEmail ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-muted text-muted-foreground/30")}>
                    <Mail className="h-3 w-3" />
                </div>
                <div className={cn("p-1.5 rounded-lg border transition-colors", hasPhone ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted/30 border-muted text-muted-foreground/30")}>
                    <Phone className="h-3 w-3" />
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: "last_updated",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Activity</div>,
    cell: ({ row }) => {
        const date = new Date(row.getValue("last_updated"));
        return (
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Calendar className="h-3 w-3 opacity-50" />
                {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
        )
    }
  },
  {
    id: "actions",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</div>,
    cell: ({ row }) => {
        const username = row.getValue("target_username") as string
        return (
            <div className="flex justify-end items-center gap-2">
                <NotesSheet username={username} />
            </div>
        )
    }
  },
]