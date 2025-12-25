"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface LeadsStatusFilterProps {
    currentStatus: string
}

const statuses = [
    { value: "all", label: "All" },
    { value: "not contacted", label: "Not Contacted" },
    { value: "contacted", label: "Contacted" },
    { value: "reply received", label: "Replied" },
    { value: "booked", label: "Booked" },
]

export function LeadsStatusFilter({ currentStatus }: LeadsStatusFilterProps) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()

    const handleStatusChange = (status: string) => {
        const params = new URLSearchParams(searchParams)
        if (status === "all") {
            params.delete("status")
        } else {
            params.set("status", status)
        }
        replace(`/leads?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-1 p-1 bg-background/50 rounded-xl border border-primary/10">
            {statuses.map((status) => (
                <Button
                    key={status.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusChange(status.value)}
                    className={cn(
                        "h-7 px-3 text-xs font-medium rounded-lg transition-all",
                        currentStatus === status.value
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
