"use client"

import { useSidebar } from "./sidebar-context"
import { Sidebar } from "./sidebar"
import { cn } from "@/lib/utils"

interface SidebarWrapperProps {
    session: any
}

export function SidebarWrapper({ session }: SidebarWrapperProps) {
    const { isCollapsed } = useSidebar()

    return (
        <aside
            className={cn(
                "hidden lg:block shrink-0 border-r bg-card/50 backdrop-blur-xl transition-all duration-300 ease-in-out min-h-screen",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <Sidebar session={session} />
        </aside>
    )
}
