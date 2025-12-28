"use client"

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { UserCircle, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfileProps {
  session: Session | null;
  isCollapsed: boolean;
}

export function UserProfile({ session, isCollapsed }: UserProfileProps) {
  return (
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
  );
}
