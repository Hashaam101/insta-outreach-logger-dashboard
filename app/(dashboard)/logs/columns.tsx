"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { 
    Instagram, 
    User, 
    MessageSquare, 
    Info, 
    Send,
    FileEdit,
    ShieldAlert,
    Cpu,
    LucideIcon
} from "lucide-react"
import { TimeDisplay } from "@/components/time-display"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { InstagramUsername } from "@/components/ui/instagram-username"

export type OutreachLog = {
  TAR_USERNAME: string
  ACT_USERNAME: string
  MESSAGE_TEXT: string | null
  SENT_AT: string
  OPR_NAME?: string
  EVENT_TYPE: string
  DETAILS: string | null
}

const TYPE_CONFIG: Record<string, { label: string, icon: LucideIcon, color: string }> = {
    "Outreach": { label: "Outreach", icon: Send, color: "bg-primary/10 text-primary border-primary/20" },
    "Change in Tar Info": { label: "Info Update", icon: FileEdit, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    "Tar Exception Toggle": { label: "Exception", icon: ShieldAlert, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    "User": { label: "Operator", icon: User, color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
    "System": { label: "Automated", icon: Cpu, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
}

export const columns: ColumnDef<OutreachLog>[] = [
  {
    accessorKey: "SENT_AT",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Timestamp</div>,
    cell: ({ row }) => (
        <TimeDisplay 
            date={row.getValue("SENT_AT")} 
            className="text-xs font-medium text-muted-foreground" 
        />
    )
  },
  {
    accessorKey: "EVENT_TYPE",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Event</div>,
    cell: ({ row }) => {
        const type = row.getValue("EVENT_TYPE") as string;
        const config = TYPE_CONFIG[type] || { label: type, icon: Info, color: "bg-slate-500/10 text-slate-500 border-slate-500/20" };
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={cn("gap-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight", config.color)}>
                <Icon className="h-3 w-3" />
                {config.label}
            </Badge>
        )
    }
  },
  {
    accessorKey: "OPR_NAME",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Operator</div>,
    cell: ({ row }) => (
        <div className="flex items-center gap-2 font-semibold text-sm">
            <User className="h-3 w-3 text-primary" />
            {row.getValue("OPR_NAME") || "System"}
        </div>
    )
  },
  {
    accessorKey: "ACT_USERNAME",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Actor</div>,
    cell: ({ row }) => (
        <div className="flex items-center gap-1">
            <Instagram className="h-3 w-3 text-primary/60 shrink-0" />
            <InstagramUsername 
                username={row.getValue("ACT_USERNAME")} 
                className="text-xs text-primary/80 font-medium"
            />
        </div>
    )
  },
  {
    accessorKey: "TAR_USERNAME",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target</div>,
    cell: ({ row }) => <InstagramUsername username={row.getValue("TAR_USERNAME")} className="text-sm" />
  },
  {
    accessorKey: "MESSAGE_TEXT",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Details</div>,
    cell: ({ row }) => {
        const message = row.original.MESSAGE_TEXT;
        const details = row.original.DETAILS;
        const isOutreach = row.original.EVENT_TYPE === 'Outreach';

        return (
            <div className={cn(
                "flex items-start gap-2 p-2 rounded-lg border max-w-[400px]",
                isOutreach ? "bg-primary/5 border-primary/10" : "bg-muted/30 border-border/50"
            )}>
                <MessageSquare className={cn("h-3 w-3 mt-0.5 shrink-0", isOutreach ? "text-primary/50" : "text-muted-foreground/50")} />
                <p className="text-xs italic text-muted-foreground line-clamp-2 leading-relaxed">
                    {message ? `"${message}"` : details}
                </p>
            </div>
        )
    }
  },
]
