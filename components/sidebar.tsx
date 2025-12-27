"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  MessageSquare, 
  BarChart3,
  UserCircle,
  Instagram,
  ChevronRight,
  LucideIcon
} from "lucide-react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { SyncStatus } from "./sync-status";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Session } from "next-auth";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
    session: Session | null;
}

const NavLink = ({ 
  item, 
  isActive, 
  isCollapsed 
}: { 
  item: NavItem; 
  isActive: boolean; 
  isCollapsed: boolean;
}) => {
  const content = (
    <Link
      href={item.href}
      className={cn(
        "flex items-center rounded-xl px-3 py-2.5 text-sm font-bold transition-all duration-200 group relative overflow-hidden",
        isActive 
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
            : "text-muted-foreground hover:bg-primary/10 hover:text-primary",
        isCollapsed && "justify-center px-0"
      )}
    >
      <div className={cn("flex items-center gap-3 z-10", isCollapsed && "gap-0")}>
        <item.icon className={cn(
            "h-4 w-4 transition-transform duration-200 shrink-0",
            isActive ? "scale-110" : "group-hover:scale-110"
        )} />
        {!isCollapsed && <span className="tracking-tight truncate">{item.name}</span>}
      </div>
      {!isCollapsed && isActive && <ChevronRight className="h-3 w-3 opacity-50 z-10" />}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right" className="font-bold text-xs">
          {item.name}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
};

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  // For now we assume not collapsed as per current design, but keeping logic ready
  const isCollapsed = false; 

  const navItems: NavItem[] = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Actors Fleet", href: "/actors", icon: Instagram },
    { name: "Leads Explorer", href: "/leads", icon: Users },
    { name: "Activity Logs", href: "/logs", icon: MessageSquare },
    { name: "Intelligence", href: "/analytics", icon: BarChart3 },
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
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink 
                  key={item.href} 
                  item={item} 
                  isActive={pathname === item.href} 
                  isCollapsed={isCollapsed} 
                />
              ))}
            </nav>
          </div>

          {/* System Settings */}
          <div className="space-y-1">
              {!isCollapsed && (
                <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-[0.2em]">
                    System
                </p>
              )}
              <nav className="space-y-1">
                  <NavLink 
                    item={{ name: "Global Settings", href: "/settings", icon: Settings }} 
                    isActive={pathname === "/settings"} 
                    isCollapsed={isCollapsed}
                  />
              </nav>
          </div>
        </div>

        {/* Footer Area */}
        <div className="p-4 shrink-0 space-y-4 bg-background/20 backdrop-blur-md border-t border-primary/5">
          {!isCollapsed && <SyncStatus />}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "w-full justify-start gap-3 h-14 px-2 hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/10 transition-all group",
                isCollapsed && "justify-center px-0"
              )}>
                <Avatar className="h-9 w-9 border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {session?.user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className="text-sm font-semibold truncate w-full tracking-normal">
                        {session?.user?.name}
                    </span>
                    <span className="text-[9px] text-primary font-bold uppercase tracking-widest leading-none mt-0.5">
                        {session?.user?.operator_name || 'Unassigned'}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-64 p-2 rounded-2xl border-primary/10 bg-card/95 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal px-2 py-3">
                  <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{session?.user?.name}</p>
                      <p className="text-[10px] leading-none text-muted-foreground font-medium">{session?.user?.email}</p>
                  </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-primary/5" />
              <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 py-2.5 rounded-xl cursor-pointer font-bold text-xs">
                      <UserCircle className="h-4 w-4 text-primary" /> Profile Settings
                  </Link>
              </DropdownMenuItem>
              <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 py-2.5 rounded-xl cursor-pointer font-bold text-xs text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                  <LogOut className="h-4 w-4" /> Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </TooltipProvider>
  );
}