"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { StatusCell } from "@/components/leads/status-cell"
import { NotesSheet } from "@/components/leads/notes-sheet"
import { 
    ExternalLink, 
    MoreHorizontal,
    ArrowLeftRight,
    MessageSquare,
    UserCircle,
    Mail,
    Phone,
    Calendar
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
import { Badge } from "@/components/ui/badge"

export type Lead = {
  target_username: string
  status: string
  last_updated: string
  email?: string
  phone_number?: string
  source_summary?: string
  notes?: string
}

const ActionsCell = ({ username }: { username: string }) => {
    const [isTransferOpen, setIsTransferOpen] = React.useState(false)
    const [isNotesOpen, setIsNotesOpen] = React.useState(false)

    return (
        <div className="flex justify-end items-center gap-1">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2 py-1.5">
                        Lead Operations
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setIsNotesOpen(true)} className="gap-2 text-xs py-2">
                        <MessageSquare className="h-3.5 w-3.5 text-primary" /> CRM Notes & History
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 text-xs py-2" onClick={() => window.open(`https://instagram.com/${username}`, '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5 text-primary" /> View Instagram Profile
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem 
                        onClick={() => setIsTransferOpen(true)} 
                        className="gap-2 text-xs py-2 text-red-500 focus:text-red-500 focus:bg-red-500/10"
                    >
                        <ArrowLeftRight className="h-3.5 w-3.5" /> Transfer to different Actor
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

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
    )
}

function formatLastUpdated(dateStr: string) {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
        return `${diffDays}d ago`;
    } else {
        return date.toLocaleDateString();
    }
}

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "target_username",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prospect</div>,
    cell: ({ row }) => {
      const username = row.getValue("target_username") as string
      const source = row.original.source_summary
      return (
        <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold leading-none truncate">{username}</span>
                <span className="text-[10px] text-muted-foreground truncate max-w-[150px]" title={source || "Unknown Source"}>
                    {source || "Instagram Lead"}
                </span>
            </div>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Contact Info</div>,
    cell: ({ row }) => {
        const email = row.original.email;
        const phone = row.original.phone_number;
        const hasEmail = email && email !== 'N/S' && email !== 'N/F';
        const hasPhone = phone && phone !== 'N/S' && phone !== 'N/F';

        if (!hasEmail && !hasPhone) {
            return <span className="text-[10px] text-muted-foreground italic">Not enriched</span>;
        }

        return (
            <div className="flex flex-col gap-1">
                {hasEmail && (
                    <div className="flex items-center gap-1.5 text-xs">
                        <Mail className="h-3 w-3 text-primary/70" />
                        <span className="truncate max-w-[180px]" title={email}>{email}</span>
                    </div>
                )}
                {hasPhone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span className="truncate max-w-[180px]">{phone}</span>
                    </div>
                )}
            </div>
        );
    }
  },
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
    accessorKey: "last_updated",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Last Activity</div>,
    cell: ({ row }) => {
        const dateStr = row.getValue("last_updated") as string;
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground" suppressHydrationWarning>
                <Calendar className="h-3.5 w-3.5 opacity-70" />
                {formatLastUpdated(dateStr)}
            </div>
        );
    }
  },
  {
    id: "actions",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</div>,
    cell: ({ row }) => {
        const username = row.getValue("target_username") as string
        return <ActionsCell username={username} />
    }
  },
]
