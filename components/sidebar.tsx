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
  ShieldCheck,
  UserCircle,
  Instagram,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
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
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { SyncStatus } from "./sync-status";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarProps {
    session: any;
    showToggle?: boolean;
}

export function Sidebar({ session, showToggle = true }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggle } = useSidebar();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Actors Fleet", href: "/actors", icon: Instagram },
    { name: "Leads Explorer", href: "/leads", icon: Users },
    { name: "Activity Logs", href: "/logs", icon: MessageSquare },
    { name: "Intelligence", href: "/analytics", icon: BarChart3 },
  ];

  const NavLink = ({ item, isSettings = false }: { item: { name: string; href: string; icon: any }; isSettings?: boolean }) => {
    const isActive = pathname === item.href;
    const content = (
      <Link
        href={item.href}
        className={cn(
          "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          isCollapsed && "justify-center px-2"
        )}
      >
        <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
          <item.icon className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>{item.name}</span>}
        </div>
        {isActive && !isCollapsed && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </Link>
    );

    if (isCollapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col bg-card/10 backdrop-blur-xl">
        {/* Branding & Toggle */}
        <div className={cn("flex h-16 items-center justify-between shrink-0 border-b border-primary/5", isCollapsed ? "px-2" : "px-4")}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative h-8 w-8 overflow-hidden rounded-lg border border-primary/20 shadow-lg group-hover:scale-105 transition-transform duration-300 shrink-0">
              <Image
                src="/logo.png"
                alt="InstaCRM Logo"
                fill
                className="object-cover"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight leading-none">InstaCRM</span>
                <span className="text-[8px] font-medium text-primary uppercase tracking-wider">Command Center</span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          {showToggle && (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggle}
                  className="h-8 w-8 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors shrink-0"
                >
                  {isCollapsed ? (
                    <PanelLeft className="h-4 w-4" />
                  ) : (
                    <PanelLeftClose className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {isCollapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        <div className={cn("flex-1 py-4 space-y-6", isCollapsed ? "px-2" : "px-4")}>
          {/* Main Navigation */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                Operations
              </p>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>
          </div>

          {/* System Settings */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 mb-2 text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em]">
                System
              </p>
            )}
            <nav className="space-y-1">
              <NavLink item={{ name: "Global Settings", href: "/settings", icon: Settings }} isSettings />
            </nav>
          </div>
        </div>

        {/* Footer Area */}
        <div className={cn("shrink-0 space-y-3 bg-background/20 backdrop-blur-md border-t border-primary/5", isCollapsed ? "p-2" : "p-4")}>
          {!isCollapsed && <SyncStatus />}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full h-14 hover:bg-primary/5 rounded-2xl border border-transparent hover:border-primary/10 transition-all group",
                  isCollapsed ? "justify-center px-2" : "justify-start gap-3 px-2"
                )}
              >
                <Avatar className={cn("border-2 border-primary/20 group-hover:border-primary/40 transition-colors shrink-0", isCollapsed ? "h-8 w-8" : "h-9 w-9")}>
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary font-black">
                    {session?.user?.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className="text-sm font-black truncate w-full tracking-tight">
                      {session?.user?.name}
                    </span>
                    <span className="text-[9px] text-primary font-bold uppercase tracking-widest leading-none mt-0.5">
                      {session?.user?.operator_name || 'Unassigned'}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isCollapsed ? "center" : "start"} side="top" className="w-64 p-2 rounded-2xl border-primary/10 bg-card/95 backdrop-blur-xl">
              <DropdownMenuLabel className="font-normal px-2 py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-black leading-none">{session?.user?.name}</p>
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
