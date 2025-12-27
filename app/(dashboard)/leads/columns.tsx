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
    UserCircle
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

export type Lead = {
  target_username: string
  status: string
  last_updated: string
  email?: string
  phone_number?: string
  source?: string
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
                    <DropdownMenuItem className="gap-2 text-xs py-2">
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

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "target_username",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prospect</div>,
    cell: ({ row }) => {
      const username = row.getValue("target_username") as string
      return (
        <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold leading-none">@{username}</span>
                <span className="text-[10px] text-muted-foreground">Instagram Lead</span>
            </div>
        </div>
      )
    },
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
    id: "actions",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</div>,
    cell: ({ row }) => {
        const username = row.getValue("target_username") as string
        return <ActionsCell username={username} />
    }
  },
]