import Link from "next/link";
import { Session } from "next-auth";
import Image from "next/image";
import { SyncStatus } from "./sync-status";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarNav, NavItem } from "@/components/sidebar-nav";
import { UserProfile } from "@/components/user-profile";
import { TimeFormatSwitcher } from "./time-format-switcher";

interface SidebarProps {
    session: Session | null;
}

export function Sidebar({ session }: SidebarProps) {
  // For now we assume not collapsed as per current design, but keeping logic ready
  const isCollapsed = false; 

  const mainNavItems: NavItem[] = [
    { name: "Overview", href: "/", icon: "LayoutDashboard" },
    { name: "Strategic Goals", href: "/goals", icon: "Target" },
    { name: "Actors Fleet", href: "/actors", icon: "Instagram" },
    { name: "Operators Fleet", href: "/operators", icon: "Shield" },
    { name: "Leads Explorer", href: "/leads", icon: "Users" },
    { name: "Activity Logs", href: "/logs", icon: "MessageSquare" },
    { name: "Intelligence", href: "/analytics", icon: "BarChart3" },
  ];

  const systemNavItems: NavItem[] = [
    { name: "Profile Settings", href: "/settings/profile", icon: "User" },
    { name: "Global Settings", href: "/settings/global", icon: "Globe" }
  ];

  return (
    <TooltipProvider>
      <div className="flex h-full w-full flex-col bg-card/10 backdrop-blur-xl">
        {/* Branding */}
        <div className={cn("flex h-20 items-center px-6 shrink-0", isCollapsed && "px-0 justify-center")}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-9 w-9 overflow-hidden rounded-xl border border-primary/20 shadow-lg group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Image 
                src="/logo.png" 
                alt="InstaCRM Logo" 
                fill
                className="object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-lg tracking-tight leading-none">InstaCRM</span>
                <span className="text-[8px] font-bold text-primary uppercase tracking-[0.2em]">Command Center</span>
              </div>
            )}
          </Link>
        </div>

        <div className="flex-1 px-4 py-4 space-y-6 overflow-hidden">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.2em]">
                Operations
              </p>
            )}
            <SidebarNav items={mainNavItems} isCollapsed={isCollapsed} />
          </div>

          {/* System Settings */}
              <nav className="space-y-1">
                  <SidebarNav items={systemNavItems} isCollapsed={isCollapsed} />
                  <TimeFormatSwitcher isCollapsed={isCollapsed} />
              </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 shrink-0 space-y-4 bg-background/20 backdrop-blur-md border-t border-primary/5">
          {!isCollapsed && <SyncStatus />}
          <UserProfile session={session} isCollapsed={isCollapsed} />
        </div>
      </div>
    </TooltipProvider>
  );
}