"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Calendar, Instagram, User, MessageSquare } from "lucide-react"

export type OutreachLog = {
  target_username: string
  actor_username: string
  message_text: string
  created_at: string
  operator_name?: string
}

export const columns: ColumnDef<OutreachLog>[] = [
  {
    accessorKey: "created_at",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</div>,
    cell: ({ row }) => {
        const date = new Date(row.getValue("created_at"));
        return (
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground whitespace-nowrap">
                <Calendar className="h-3 w-3 opacity-50" />
                {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
        )
    }
  },
  {
    accessorKey: "operator_name",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Operator</div>,
    cell: ({ row }) => (
        <div className="flex items-center gap-2 font-semibold text-sm">
            <User className="h-3 w-3 text-primary" />
            {row.getValue("operator_name") || "System"}
        </div>
    )
  },
  {
    accessorKey: "actor_username",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Actor</div>,
    cell: ({ row }) => (
        <div className="flex items-center gap-1 text-xs font-medium text-primary/80">
            <Instagram className="h-3 w-3" />
            {row.getValue("actor_username")}
        </div>
    )
  },
  {
    accessorKey: "target_username",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target</div>,
    cell: ({ row }) => (
        <div className="font-bold text-sm">
            {row.getValue("target_username")}
        </div>
    )
  },
  {
    accessorKey: "message_text",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Message</div>,
    cell: ({ row }) => (
        <div className="flex items-start gap-2 bg-primary/5 p-2 rounded-lg border border-primary/10 max-w-[400px]">
            <MessageSquare className="h-3 w-3 text-primary/50 mt-0.5 shrink-0" />
            <p className="text-xs italic text-muted-foreground line-clamp-2 leading-relaxed">
                &quot;{row.getValue("message_text")}&quot;
            </p>
        </div>
    )
  },
]
