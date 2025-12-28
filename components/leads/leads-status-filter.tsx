"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LeadsStatusFilterProps {
    currentStatus?: string
}

const statuses = [
    { value: "All", label: "All" },
    { value: "Cold No Reply", label: "Cold" },
    { value: "Replied", label: "Replied" },
    { value: "Warm", label: "Warm" },
    { value: "Booked", label: "Booked" },
    { value: "Paid", label: "Paid" },
    { value: "Tableturnerr Client", label: "Client" },
    { value: "Excluded", label: "Excluded" },
]

export function LeadsStatusFilter({ currentStatus }: LeadsStatusFilterProps) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    
    // If not passed via props, fallback to searchParams
    const activeStatus = currentStatus || searchParams.get("status") || "All";

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (status === "All") {
            params.delete("status")
        } else {
            params.set("status", status)
        }
        replace(`/leads?${params.toString()}`)
    }

    return (
        <div className="flex flex-wrap items-center gap-1 p-1 bg-background/50 rounded-xl border border-primary/10">
            {statuses.map((status) => (
                <Button
                    key={status.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(status.value)}
                    className={cn(
                        "h-7 px-3 text-xs font-medium rounded-lg transition-all",
                        activeStatus === status.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                >
                    {status.label}
                </Button>
            ))}
        </div>
    )
}