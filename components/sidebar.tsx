import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  MessageSquare, 
  BarChart3,
  ShieldCheck,
  UserCircle
} from "lucide-react";
import { auth, signOut } from "@/auth";
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

export async function Sidebar() {
  const session = await auth();

  const navItems = [
    { name: "Overview", href: "/", icon: LayoutDashboard },
    { name: "Leads Management", href: "/leads", icon: Users },
    { name: "Outreach Logs", href: "/logs", icon: MessageSquare },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
      <div className="flex h-20 items-center px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 overflow-hidden rounded-xl border border-primary/20 shadow-lg">
            <Image 
              src="/logo.png" 
              alt="InstaCRM Logo" 
              fill
              className="object-cover"
            />
          </div>
          <span className="font-bold text-xl tracking-tight">InstaCRM</span>
        </Link>
      </div>

      <div className="flex-1 px-4 space-y-8 mt-4">
        <div>
          <p className="px-2 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Main Menu
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group"
              >
                <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div>
            <p className="px-2 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                System
            </p>
            <nav className="space-y-1">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground group"
                >
                    <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    Settings
                </Link>
            </nav>
        </div>
      </div>

      <div className="p-4 mt-auto space-y-4">
        <SyncStatus />
        <Separator className="opacity-50" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 px-2 hover:bg-accent/50">
              <Avatar className="h-8 w-8 border border-primary/20">
                <AvatarImage src={session?.user?.image || ""} />
                <AvatarFallback className="bg-primary/10 text-primary">
                    {session?.user?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-semibold truncate max-w-[120px]">
                    {session?.user?.name}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tighter font-bold">
                    {session?.user?.operator_name || 'Unassigned'}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2">
            <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                    <UserCircle className="h-4 w-4" /> Profile
                </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
                <form action={async () => {
                    'use server';
                    await signOut();
                }}>
                    <button className="flex w-full items-center gap-2 text-destructive focus:text-destructive">
                        <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}