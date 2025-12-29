"use client"

import * as React from "react"
import { Clock, Check } from "lucide-react"
import { useTimeContext, TimeFormat } from "./time-context"
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuLabel, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function TimeFormatSwitcher({ isCollapsed }: { isCollapsed: boolean }) {
    const { format, setFormat } = useTimeContext()

    const options: { label: string, value: TimeFormat }[] = [
        { label: "Standard (Ago)", value: "Ago" },
        { label: "12 Hour Clock", value: "12h" },
        { label: "24 Hour Clock", value: "24h" },
        { label: "Full Date/Time", value: "Full" },
    ]

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    variant="ghost" 
                    className={cn(
                        "w-full justify-start gap-3 h-10 px-3 rounded-xl hover:bg-primary/10 transition-all text-muted-foreground hover:text-primary",
                        isCollapsed && "justify-center px-0"
                    )}
                >
                    <Clock className="h-4 w-4 shrink-0" />
                    {!isCollapsed && <span className="text-xs font-bold tracking-tight">Time: {format}</span>}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-48 p-2 rounded-2xl bg-card/95 backdrop-blur-xl border-primary/10">
                <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest px-2 py-1.5">
                    Time Standard
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/5" />
                {options.map((opt) => (
                    <DropdownMenuItem 
                        key={opt.value} 
                        onClick={() => setFormat(opt.value)}
                        className="flex items-center justify-between gap-2 py-2 rounded-xl cursor-pointer font-bold text-xs"
                    >
                        {opt.label}
                        {format === opt.value && <Check className="h-3.5 w-3.5 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
