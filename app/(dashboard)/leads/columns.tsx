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
    Copy,
    Check,
    LucideIcon,
    Activity
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
import { TimeDisplay } from "@/components/time-display"
import { toast } from "sonner"
import { ActorPerformanceSheet } from "@/components/actors/actor-performance-sheet"
import { fetchActorPerformance } from "@/app/(dashboard)/actors/actions"
import { InstagramUsername } from "@/components/ui/instagram-username"

export type Lead = {
  target_username: string
  status: string
  last_updated: string
  email?: string
  phone_number?: string
  source_summary?: string
  notes?: string
  actors_list?: string | null
}

interface PerformanceData {
    info: {
        ACT_STATUS: string;
        CREATED_AT: string;
        LAST_ACTIVITY: string;
        TOTAL_SEATS: string;
    };
    volume: { LOG_DATE: string; TOTAL: string }[];
    operatorBreakdown: { OPR_NAME: string; TOTAL: string }[];
    recentLogs: {
        TAR_USERNAME: string;
        TAR_STATUS: string;
        CONT_SOURCE: string;
        MESSAGE_TEXT: string;
        SENT_AT: string;
        OPR_NAME: string;
        ACT_USERNAME: string;
    }[];
    eventDistribution: { EVENT_TYPE: string; TOTAL: string }[];
    totalDms: number;
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

const ContactInfoCell = ({ value, icon: Icon }: { value: string, icon: LucideIcon }) => {
    const [copied, setCopied] = React.useState(false)

    const handleCopy = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard.writeText(value)
        setCopied(true)
        toast.success("Copied to clipboard")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer group/contact"
        >
            <div className="w-3.5 h-3.5 flex items-center justify-center shrink-0">
                {copied ? (
                    <Check className="w-3 h-3 text-primary" />
                ) : (
                    <>
                        <Icon className="w-3 h-3 opacity-70 group-hover/contact:hidden" />
                        <Copy className="w-3 h-3 hidden group-hover/contact:block opacity-100" />
                    </>
                )}
            </div>
            <span className="truncate max-w-[180px]">{value}</span>
        </div>
    )
}

const ActorHandle = ({ handle }: { handle: string }) => {
    const [isSheetOpen, setIsSheetOpen] = React.useState(false)
    const [performanceData, setPerformanceData] = React.useState<PerformanceData | null>(null)

    const handleOpen = async () => {
        try {
            const data = await fetchActorPerformance(handle)
            setPerformanceData(data)
            setIsSheetOpen(true)
        } catch {
            toast.error("Failed to load actor info")
        }
    }

    return (
        <>
            <div className="relative group/perf">
                <InstagramUsername 
                    username={handle} 
                    className="text-[10px] text-primary/80 font-medium"
                />
                <button 
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleOpen()
                    }}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover/perf:opacity-100 transition-opacity p-1 hover:text-primary"
                    title="View Performance"
                >
                    <Activity className="h-2.5 w-2.5" />
                </button>
            </div>
            <ActorPerformanceSheet 
                actorHandle={handle}
                isOpen={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                data={performanceData}
            />
        </>
    )
}

const UsernameCell = ({ username, source, actors }: { username: string, source?: string, actors?: string | null }) => {
    const actorsArray = actors ? actors.split(',').map(s => s.trim()) : []

    return (
        <div className="flex items-center gap-3 group/user">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <UserCircle className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
                <InstagramUsername username={username} className="text-sm" />
                <div className="text-[10px] text-muted-foreground truncate max-w-[180px] mt-0.5">
                    {actorsArray.length > 0 ? (
                        <div className="flex items-center gap-1 flex-wrap">
                            <span>Contacted by:</span>
                            {actorsArray.map((handle, idx) => (
                                <React.Fragment key={handle}>
                                    <ActorHandle handle={handle} />
                                    {idx < actorsArray.length - 1 && <span>,</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    ) : (
                        <span title={source || "Unknown Source"}>{source || "Instagram Lead"}</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export const columns: ColumnDef<Lead>[] = [
  {
    accessorKey: "target_username",
    header: () => <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Prospect</div>,
    cell: ({ row }) => (
        <UsernameCell 
            username={row.getValue("target_username")} 
            source={row.original.source_summary} 
            actors={row.original.actors_list}
        />
    )
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
            <div className="flex flex-col gap-1.5">
                {hasEmail && <ContactInfoCell value={email} icon={Mail} />}
                {hasPhone && <ContactInfoCell value={phone} icon={Phone} />}
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
    cell: ({ row }) => (
        <TimeDisplay 
            date={row.getValue("last_updated")} 
            className="text-xs text-muted-foreground" 
        />
    )
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